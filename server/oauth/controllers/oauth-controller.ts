/**
 * PKL-278651-OAUTH-001 - OAuth Controller
 * 
 * Handles the HTTP requests for OAuth endpoints.
 * This controller implements the OAuth 2.0 flows.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-30
 */

import { Request, Response } from 'express';
import { 
  oauthClientService, 
  authorizationCodeService, 
  tokenService, 
  authorizationService 
} from '../services/oauth-service';
import { AVAILABLE_SCOPES } from '../../../shared/schema/oauth';
import { URL } from 'url';

/**
 * Handles the authorization request (authorization code flow first step)
 * GET /oauth/authorize
 */
export async function authorizeHandler(req: Request, res: Response) {
  const { 
    client_id, 
    redirect_uri, 
    response_type, 
    scope, 
    state, 
    code_challenge,
    code_challenge_method,
    nonce
  } = req.query;
  
  try {
    // Verify required parameters
    if (!client_id || !redirect_uri || !response_type) {
      return res.render('oauth/error', { 
        error: 'invalid_request',
        error_description: 'Missing required parameters'
      });
    }
    
    // Check if client exists
    const client = await oauthClientService.getClientById(client_id as string);
    if (!client) {
      return res.render('oauth/error', { 
        error: 'invalid_client',
        error_description: 'Client not found'
      });
    }
    
    // Verify client status
    if (client.status !== 'approved') {
      return res.render('oauth/error', { 
        error: 'unauthorized_client',
        error_description: 'Client is not authorized'
      });
    }
    
    // Verify redirect URI
    if (!client.redirectUris.includes(redirect_uri as string)) {
      return res.render('oauth/error', { 
        error: 'invalid_request',
        error_description: 'Invalid redirect URI'
      });
    }
    
    // Verify response type (only 'code' supported for now)
    if (response_type !== 'code') {
      const redirectUrl = new URL(redirect_uri as string);
      redirectUrl.searchParams.append('error', 'unsupported_response_type');
      redirectUrl.searchParams.append('error_description', 'Only authorization code flow is supported');
      if (state) redirectUrl.searchParams.append('state', state as string);
      return res.redirect(redirectUrl.toString());
    }
    
    // Parse and validate scopes
    const requestedScopes = scope ? (scope as string).split(' ') : ['profile'];
    const validScopes = requestedScopes.filter(s => AVAILABLE_SCOPES[s]);
    
    // Verify PKCE parameters if provided
    if (code_challenge && (!code_challenge_method || !['plain', 'S256'].includes(code_challenge_method as string))) {
      const redirectUrl = new URL(redirect_uri as string);
      redirectUrl.searchParams.append('error', 'invalid_request');
      redirectUrl.searchParams.append('error_description', 'Invalid code challenge method');
      if (state) redirectUrl.searchParams.append('state', state as string);
      return res.redirect(redirectUrl.toString());
    }
    
    // Check user authentication
    if (!req.isAuthenticated()) {
      // Store authorization request in session for after login
      req.session.authRequest = {
        client_id,
        redirect_uri,
        response_type,
        scope: validScopes.join(' '),
        state,
        code_challenge,
        code_challenge_method,
        nonce
      };
      
      // Redirect to login
      return res.redirect(`/login?returnTo=${encodeURIComponent('/oauth/authorize')}`);
    }
    
    // At this point, user is authenticated
    const userId = req.user.id;
    
    // Check if user has already authorized this application with these scopes
    const authCheck = await authorizationService.checkAuthorization(
      userId,
      client_id as string,
      validScopes
    );
    
    if (authCheck.authorized) {
      // User has already authorized, proceed directly
      const authCode = await authorizationCodeService.createAuthorizationCode(
        userId,
        client_id as string,
        redirect_uri as string,
        validScopes,
        code_challenge as string,
        code_challenge_method as string,
        nonce as string
      );
      
      // Redirect back to client with authorization code
      const redirectUrl = new URL(redirect_uri as string);
      redirectUrl.searchParams.append('code', authCode.code);
      if (state) redirectUrl.searchParams.append('state', state as string);
      
      return res.redirect(redirectUrl.toString());
    }
    
    // User hasn't authorized yet, show consent screen
    res.render('oauth/consent', {
      client,
      scopes: validScopes.map(scope => ({
        id: scope,
        description: AVAILABLE_SCOPES[scope]
      })),
      redirectUri: redirect_uri,
      userId,
      // Pass along all parameters for the authorization
      authParams: {
        client_id,
        redirect_uri,
        response_type,
        scope: validScopes.join(' '),
        state,
        code_challenge,
        code_challenge_method,
        nonce
      }
    });
  } catch (error) {
    console.error('[OAUTH] Authorization error:', error);
    res.render('oauth/error', { 
      error: 'server_error',
      error_description: 'An error occurred processing the request'
    });
  }
}

/**
 * Handles the consent form submission
 * POST /oauth/consent
 */
export async function consentHandler(req: Request, res: Response) {
  const { 
    client_id, 
    redirect_uri, 
    scope,
    state,
    code_challenge,
    code_challenge_method,
    nonce,
    consent
  } = req.body;
  
  // Handle user denying access
  if (consent !== 'allow') {
    const redirectUrl = new URL(redirect_uri);
    redirectUrl.searchParams.append('error', 'access_denied');
    redirectUrl.searchParams.append('error_description', 'User denied the request');
    if (state) redirectUrl.searchParams.append('state', state);
    return res.redirect(redirectUrl.toString());
  }
  
  try {
    if (!req.isAuthenticated()) {
      return res.redirect('/login');
    }
    
    const userId = req.user.id;
    const scopes = scope.split(' ');
    
    // Record the user's authorization
    await authorizationService.recordAuthorization(
      userId,
      client_id,
      scopes,
      req.ip,
      req.get('user-agent')
    );
    
    // Generate an authorization code
    const authCode = await authorizationCodeService.createAuthorizationCode(
      userId,
      client_id,
      redirect_uri,
      scopes,
      code_challenge,
      code_challenge_method,
      nonce
    );
    
    // Redirect back to client with authorization code
    const redirectUrl = new URL(redirect_uri);
    redirectUrl.searchParams.append('code', authCode.code);
    if (state) redirectUrl.searchParams.append('state', state);
    
    return res.redirect(redirectUrl.toString());
  } catch (error) {
    console.error('[OAUTH] Consent error:', error);
    res.render('oauth/error', { 
      error: 'server_error',
      error_description: 'An error occurred processing the consent'
    });
  }
}

/**
 * Handles token requests (authorization code exchange, refresh token)
 * POST /oauth/token
 */
export async function tokenHandler(req: Request, res: Response) {
  const { grant_type, code, redirect_uri, client_id, client_secret, refresh_token, code_verifier } = req.body;
  
  try {
    // Validate client credentials
    const client = await oauthClientService.getClientById(client_id);
    if (!client) {
      return res.status(401).json({
        error: 'invalid_client',
        error_description: 'Invalid client credentials'
      });
    }
    
    // Public clients don't need to provide a client secret
    if (!client.isPublicClient) {
      // Verify client secret
      const validSecret = await oauthClientService.verifyClientSecret(client_id, client_secret);
      if (!validSecret) {
        return res.status(401).json({
          error: 'invalid_client',
          error_description: 'Invalid client credentials'
        });
      }
    }
    
    // Handle different grant types
    if (grant_type === 'authorization_code') {
      // Authorization code flow
      if (!code || !redirect_uri) {
        return res.status(400).json({
          error: 'invalid_request',
          error_description: 'Missing required parameters'
        });
      }
      
      // Validate the authorization code
      const authCode = await authorizationCodeService.validateAuthorizationCode(
        code,
        client_id,
        redirect_uri,
        code_verifier
      );
      
      if (!authCode) {
        return res.status(400).json({
          error: 'invalid_grant',
          error_description: 'Invalid authorization code'
        });
      }
      
      // Generate tokens
      const tokens = await tokenService.createTokens(
        authCode.userId,
        client_id,
        authCode.scopes,
        req.ip,
        req.get('user-agent')
      );
      
      // Return the tokens
      return res.json({
        access_token: tokens.accessToken.token,
        token_type: 'Bearer',
        expires_in: ACCESS_TOKEN_EXPIRATION,
        refresh_token: tokens.refreshToken.token,
        scope: authCode.scopes.join(' ')
      });
      
    } else if (grant_type === 'refresh_token') {
      // Refresh token flow
      if (!refresh_token) {
        return res.status(400).json({
          error: 'invalid_request',
          error_description: 'Missing refresh token'
        });
      }
      
      // Refresh the token
      const tokens = await tokenService.refreshAccessToken(
        refresh_token,
        client_id,
        req.ip,
        req.get('user-agent')
      );
      
      if (!tokens) {
        return res.status(400).json({
          error: 'invalid_grant',
          error_description: 'Invalid refresh token'
        });
      }
      
      // Return the new tokens
      return res.json({
        access_token: tokens.accessToken.token,
        token_type: 'Bearer',
        expires_in: ACCESS_TOKEN_EXPIRATION,
        refresh_token: tokens.refreshToken.token,
        scope: tokens.accessToken.scopes.join(' ')
      });
      
    } else {
      return res.status(400).json({
        error: 'unsupported_grant_type',
        error_description: 'Unsupported grant type'
      });
    }
  } catch (error) {
    console.error('[OAUTH] Token error:', error);
    res.status(500).json({
      error: 'server_error',
      error_description: 'An error occurred processing the token request'
    });
  }
}

/**
 * Handles token revocation
 * POST /oauth/revoke
 */
export async function revokeHandler(req: Request, res: Response) {
  const { token, token_type_hint, client_id, client_secret } = req.body;
  
  try {
    // Validate client credentials
    const client = await oauthClientService.getClientById(client_id);
    if (!client) {
      return res.status(401).json({
        error: 'invalid_client',
        error_description: 'Invalid client credentials'
      });
    }
    
    // Public clients don't need to provide a client secret
    if (!client.isPublicClient) {
      // Verify client secret
      const validSecret = await oauthClientService.verifyClientSecret(client_id, client_secret);
      if (!validSecret) {
        return res.status(401).json({
          error: 'invalid_client',
          error_description: 'Invalid client credentials'
        });
      }
    }
    
    // Revoke the token
    await tokenService.revokeToken(token);
    
    // According to spec, revoke token should always return 200 even if token is invalid
    res.status(200).json({});
    
  } catch (error) {
    console.error('[OAUTH] Revoke error:', error);
    res.status(500).json({
      error: 'server_error',
      error_description: 'An error occurred processing the revocation request'
    });
  }
}

/**
 * Provides basic user info based on the access token
 * GET /oauth/userinfo
 */
export async function userInfoHandler(req: Request, res: Response) {
  try {
    // Extract Bearer token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'invalid_token',
        error_description: 'Missing or invalid token'
      });
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Validate the token
    const validation = await tokenService.validateToken(token);
    if (!validation.valid) {
      return res.status(401).json({
        error: 'invalid_token',
        error_description: 'Invalid or expired token'
      });
    }
    
    // Get user data
    const { userId, scopes } = validation;
    const [user] = await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      avatarUrl: users.avatarUrl,
      createdAt: users.createdAt
    })
    .from(users)
    .where(eq(users.id, userId));
    
    if (!user) {
      return res.status(404).json({
        error: 'not_found',
        error_description: 'User not found'
      });
    }
    
    // Return user data based on authorized scopes
    const response: any = {
      sub: user.id.toString(), // Per OpenID Connect spec
    };
    
    // Basic profile scope
    if (scopes.includes('profile')) {
      response.username = user.username;
      response.name = [user.firstName, user.lastName].filter(Boolean).join(' ');
    }
    
    // Email scope
    if (scopes.includes('email')) {
      response.email = user.email;
    }
    
    // Profile picture
    if (scopes.includes('profile.avatar') && user.avatarUrl) {
      response.picture = user.avatarUrl;
    }
    
    // Add other user data based on scopes
    // ...
    
    return res.json(response);
    
  } catch (error) {
    console.error('[OAUTH] UserInfo error:', error);
    res.status(500).json({
      error: 'server_error',
      error_description: 'An error occurred fetching user data'
    });
  }
}

// Other controller methods as needed