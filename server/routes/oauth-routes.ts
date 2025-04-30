/**
 * PKL-278651-OAUTH-0003: OAuth Routes
 * 
 * API routes for the OAuth 2.0 authentication system.
 * Implements the authorization code flow for external applications.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-30
 */

import express, { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { 
  createAuthorizationCode, 
  useAuthorizationCode,
  validateClientCredentials,
  refreshAccessToken,
  createUserAuthorization,
  hasUserAuthorizedClient,
  getOAuthClient,
  getUserInfoByScopes,
  validateAccessToken,
  revokeAccessToken,
  getUserAuthorizations,
  revokeUserAuthorization,
  getIpFromRequest,
  createAuditLog
} from '../services/oauth-service';
import { OAUTH_SCOPES } from '@shared/schema/oauth';
import { urlSearchParamsToObject } from '../utils/requestUtils';

const router = express.Router();

// Middleware to ensure user is authenticated
function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  
  // Store the original URL to redirect back after login
  req.session.returnTo = req.originalUrl;
  res.redirect('/auth?redirect=' + encodeURIComponent(req.originalUrl));
}

// Middleware to validate OAuth 2.0 Bearer token
async function validateOAuthToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'invalid_token',
      error_description: 'Missing or invalid authorization header'
    });
  }
  
  const token = authHeader.substring(7);
  const validation = await validateAccessToken(token);
  
  if (!validation.valid) {
    return res.status(401).json({
      error: 'invalid_token',
      error_description: 'Token is invalid or expired'
    });
  }
  
  // Attach token info to request for later use
  req.oauthToken = {
    userId: validation.userId,
    clientId: validation.clientId,
    scopes: validation.scopes
  };
  
  next();
}

/**
 * OAuth Authorization Endpoint
 * 
 * This endpoint initiates the OAuth flow by displaying a consent page or 
 * redirecting to the application with an authorization code.
 * 
 * GET /oauth/authorize
 */
router.get('/authorize', ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    // Validate required parameters
    const schema = z.object({
      response_type: z.literal('code'),
      client_id: z.string(),
      redirect_uri: z.string().url(),
      scope: z.string(),
      state: z.string().optional()
    });
    
    const result = schema.safeParse(req.query);
    
    if (!result.success) {
      return res.status(400).render('oauth/error', {
        error: 'invalid_request',
        error_description: 'Missing or invalid parameters'
      });
    }
    
    const { client_id, redirect_uri, scope, state, response_type } = result.data;
    
    // Verify client exists and redirect URI is valid
    const client = await getOAuthClient(client_id);
    
    if (!client) {
      return res.status(400).render('oauth/error', {
        error: 'invalid_client',
        error_description: 'Client not found'
      });
    }
    
    // Verify redirect URI is allowed
    if (!client.redirectUris.includes(redirect_uri)) {
      return res.status(400).render('oauth/error', {
        error: 'invalid_request',
        error_description: 'Redirect URI not allowed for this client'
      });
    }
    
    // Parse and validate scopes
    const requestedScopes = scope.split(' ');
    const invalidScopes = requestedScopes.filter(s => !Object.values(OAUTH_SCOPES).includes(s));
    
    if (invalidScopes.length > 0) {
      const redirectUrl = new URL(redirect_uri);
      redirectUrl.searchParams.append('error', 'invalid_scope');
      redirectUrl.searchParams.append('error_description', `Invalid scopes: ${invalidScopes.join(', ')}`);
      if (state) redirectUrl.searchParams.append('state', state);
      
      return res.redirect(redirectUrl.toString());
    }
    
    // Check if client is allowed to request these scopes
    const unauthorizedScopes = requestedScopes.filter(s => !client.allowedScopes.includes(s));
    
    if (unauthorizedScopes.length > 0) {
      const redirectUrl = new URL(redirect_uri);
      redirectUrl.searchParams.append('error', 'invalid_scope');
      redirectUrl.searchParams.append('error_description', `Client not authorized for scopes: ${unauthorizedScopes.join(', ')}`);
      if (state) redirectUrl.searchParams.append('state', state);
      
      return res.redirect(redirectUrl.toString());
    }
    
    // Check if user has already authorized this client with these scopes
    const userId = req.user?.id;
    const hasAuthorized = await hasUserAuthorizedClient(userId, client_id, requestedScopes);
    
    if (hasAuthorized) {
      // User already authorized this client, skip consent screen
      const code = await createAuthorizationCode({
        userId,
        clientId: client_id,
        redirectUri: redirect_uri,
        scopes: requestedScopes
      });
      
      const redirectUrl = new URL(redirect_uri);
      redirectUrl.searchParams.append('code', code);
      if (state) redirectUrl.searchParams.append('state', state);
      
      return res.redirect(redirectUrl.toString());
    }
    
    // Render consent page
    res.render('oauth/consent', {
      client,
      scopes: requestedScopes,
      scopeDescriptions: {
        [OAUTH_SCOPES.USER_BASIC]: 'Access to your basic profile information (name, email, profile picture)',
        [OAUTH_SCOPES.USER_ROLES]: 'Access to your roles in Pickle+ (player, coach, etc.)',
        [OAUTH_SCOPES.USER_RATINGS]: 'Access to your CourtIQ ratings and skill levels',
        [OAUTH_SCOPES.USER_MATCHES]: 'Access to your match history',
        [OAUTH_SCOPES.USER_STATS]: 'Access to your performance statistics',
        [OAUTH_SCOPES.USER_VERIFIED_ROLES]: 'Access to your verified role information',
        [OAUTH_SCOPES.OFFLINE_ACCESS]: 'Access to your data when you are not using the application'
      },
      formAction: '/api/oauth/consent',
      requestParams: {
        client_id,
        redirect_uri,
        scope,
        state,
        response_type
      }
    });
  } catch (error) {
    console.error('Error in authorization endpoint:', error);
    res.status(500).render('oauth/error', {
      error: 'server_error',
      error_description: 'An error occurred while processing your request'
    });
  }
});

/**
 * OAuth Consent Endpoint
 * 
 * This endpoint processes the user's consent decision and redirects 
 * to the application with an authorization code or error.
 * 
 * POST /oauth/consent
 */
router.post('/consent', ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    // Validate parameters
    const schema = z.object({
      client_id: z.string(),
      redirect_uri: z.string().url(),
      scope: z.string(),
      state: z.string().optional(),
      response_type: z.literal('code'),
      consent: z.enum(['allow', 'deny'])
    });
    
    const result = schema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).render('oauth/error', {
        error: 'invalid_request',
        error_description: 'Missing or invalid parameters'
      });
    }
    
    const { client_id, redirect_uri, scope, state, consent } = result.data;
    const redirectUrl = new URL(redirect_uri);
    
    // Handle denied consent
    if (consent === 'deny') {
      redirectUrl.searchParams.append('error', 'access_denied');
      redirectUrl.searchParams.append('error_description', 'User denied access');
      if (state) redirectUrl.searchParams.append('state', state);
      
      return res.redirect(redirectUrl.toString());
    }
    
    // Handle allowed consent
    const userId = req.user?.id;
    const requestedScopes = scope.split(' ');
    
    // Record user authorization
    await createUserAuthorization({
      userId,
      clientId: client_id,
      scopes: requestedScopes
    });
    
    // Create authorization code
    const code = await createAuthorizationCode({
      userId,
      clientId: client_id,
      redirectUri: redirect_uri,
      scopes: requestedScopes
    });
    
    // Create audit log
    await createAuditLog({
      action: 'consent_granted',
      clientId: client_id,
      userId,
      ipAddress: getIpFromRequest(req),
      details: `User granted consent for scopes: ${requestedScopes.join(', ')}`
    });
    
    // Redirect with code
    redirectUrl.searchParams.append('code', code);
    if (state) redirectUrl.searchParams.append('state', state);
    
    res.redirect(redirectUrl.toString());
  } catch (error) {
    console.error('Error in consent endpoint:', error);
    res.status(500).render('oauth/error', {
      error: 'server_error',
      error_description: 'An error occurred while processing your request'
    });
  }
});

/**
 * OAuth Token Endpoint
 * 
 * This endpoint issues access tokens and refresh tokens.
 * 
 * POST /oauth/token
 */
router.post('/token', async (req: Request, res: Response) => {
  try {
    // Extract client credentials from Authorization header
    const authHeader = req.headers.authorization;
    let clientId: string | null = null;
    let clientSecret: string | null = null;
    
    if (authHeader && authHeader.startsWith('Basic ')) {
      const base64Credentials = authHeader.substring(6);
      const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
      [clientId, clientSecret] = credentials.split(':');
    } else {
      // Alternative: Client credentials in request body
      clientId = req.body.client_id || null;
      clientSecret = req.body.client_secret || null;
    }
    
    if (!clientId || !clientSecret) {
      return res.status(401).json({
        error: 'invalid_client',
        error_description: 'Missing client credentials'
      });
    }
    
    // Validate client credentials
    const validCredentials = await validateClientCredentials(clientId, clientSecret);
    
    if (!validCredentials) {
      return res.status(401).json({
        error: 'invalid_client',
        error_description: 'Invalid client credentials'
      });
    }
    
    // Handle different grant types
    const grantType = req.body.grant_type;
    
    switch (grantType) {
      case 'authorization_code': {
        // Validate parameters
        const schema = z.object({
          code: z.string(),
          redirect_uri: z.string().url()
        });
        
        const result = schema.safeParse(req.body);
        
        if (!result.success) {
          return res.status(400).json({
            error: 'invalid_request',
            error_description: 'Missing or invalid parameters'
          });
        }
        
        const { code, redirect_uri } = result.data;
        
        // Exchange authorization code for tokens
        const tokenResponse = await useAuthorizationCode(code, clientId, redirect_uri);
        
        if (!tokenResponse) {
          return res.status(400).json({
            error: 'invalid_grant',
            error_description: 'Invalid authorization code'
          });
        }
        
        return res.json({
          access_token: tokenResponse.accessToken,
          token_type: 'Bearer',
          expires_in: tokenResponse.expiresIn,
          refresh_token: tokenResponse.refreshToken
        });
      }
      
      case 'refresh_token': {
        // Validate parameters
        const schema = z.object({
          refresh_token: z.string()
        });
        
        const result = schema.safeParse(req.body);
        
        if (!result.success) {
          return res.status(400).json({
            error: 'invalid_request',
            error_description: 'Missing or invalid refresh token'
          });
        }
        
        const { refresh_token } = result.data;
        
        // Refresh access token
        const tokenResponse = await refreshAccessToken(refresh_token);
        
        if (!tokenResponse) {
          return res.status(400).json({
            error: 'invalid_grant',
            error_description: 'Invalid refresh token'
          });
        }
        
        return res.json({
          access_token: tokenResponse.accessToken,
          token_type: 'Bearer',
          expires_in: tokenResponse.expiresIn,
          refresh_token: tokenResponse.refreshToken
        });
      }
      
      default:
        return res.status(400).json({
          error: 'unsupported_grant_type',
          error_description: `Grant type '${grantType}' is not supported`
        });
    }
  } catch (error) {
    console.error('Error in token endpoint:', error);
    res.status(500).json({
      error: 'server_error',
      error_description: 'An error occurred while processing your request'
    });
  }
});

/**
 * OAuth Revoke Token Endpoint
 * 
 * This endpoint revokes an access token or refresh token.
 * 
 * POST /oauth/revoke
 */
router.post('/revoke', async (req: Request, res: Response) => {
  try {
    // Extract client credentials
    const authHeader = req.headers.authorization;
    let clientId: string | null = null;
    let clientSecret: string | null = null;
    
    if (authHeader && authHeader.startsWith('Basic ')) {
      const base64Credentials = authHeader.substring(6);
      const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
      [clientId, clientSecret] = credentials.split(':');
    } else {
      clientId = req.body.client_id || null;
      clientSecret = req.body.client_secret || null;
    }
    
    if (!clientId || !clientSecret) {
      return res.status(401).json({
        error: 'invalid_client',
        error_description: 'Missing client credentials'
      });
    }
    
    // Validate client credentials
    const validCredentials = await validateClientCredentials(clientId, clientSecret);
    
    if (!validCredentials) {
      return res.status(401).json({
        error: 'invalid_client',
        error_description: 'Invalid client credentials'
      });
    }
    
    // Validate parameters
    const schema = z.object({
      token: z.string(),
      token_type_hint: z.enum(['access_token', 'refresh_token']).optional()
    });
    
    const result = schema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({
        error: 'invalid_request',
        error_description: 'Missing or invalid parameters'
      });
    }
    
    const { token, token_type_hint } = result.data;
    
    // Revoke token
    // Regardless of token type, we'll try to revoke it as an access token
    // This simplifies the implementation while still meeting the OAuth spec
    await revokeAccessToken(token);
    
    // According to OAuth 2.0 spec, this endpoint should always return 200 OK,
    // even if the token was invalid or already revoked
    res.status(200).json({});
  } catch (error) {
    console.error('Error in revoke endpoint:', error);
    res.status(500).json({
      error: 'server_error',
      error_description: 'An error occurred while processing your request'
    });
  }
});

/**
 * User Info Endpoint
 * 
 * This endpoint returns information about the authenticated user
 * based on the scopes granted to the client.
 * 
 * GET /oauth/userinfo
 */
router.get('/userinfo', validateOAuthToken, async (req: Request, res: Response) => {
  try {
    const { userId, clientId, scopes } = req.oauthToken;
    
    if (!userId || !clientId || !scopes) {
      return res.status(401).json({
        error: 'invalid_token',
        error_description: 'Invalid token'
      });
    }
    
    // Get user information based on scopes
    const userInfo = await getUserInfoByScopes(userId, scopes);
    
    if (!userInfo) {
      return res.status(404).json({
        error: 'not_found',
        error_description: 'User not found'
      });
    }
    
    res.json(userInfo);
  } catch (error) {
    console.error('Error in userinfo endpoint:', error);
    res.status(500).json({
      error: 'server_error',
      error_description: 'An error occurred while processing your request'
    });
  }
});

/**
 * Get Authorized Applications Endpoint
 * 
 * Returns the list of applications authorized by the user.
 * 
 * GET /oauth/authorized-apps
 */
router.get('/authorized-apps', ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        error: 'unauthorized',
        error_description: 'User not authenticated'
      });
    }
    
    const authorizations = await getUserAuthorizations(userId);
    
    res.json({ authorizations });
  } catch (error) {
    console.error('Error getting authorized apps:', error);
    res.status(500).json({
      error: 'server_error',
      error_description: 'An error occurred while processing your request'
    });
  }
});

/**
 * Revoke Application Authorization Endpoint
 * 
 * Revokes the authorization granted to an application.
 * 
 * POST /oauth/revoke-app
 */
router.post('/revoke-app', ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        error: 'unauthorized',
        error_description: 'User not authenticated'
      });
    }
    
    const schema = z.object({
      client_id: z.string()
    });
    
    const result = schema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({
        error: 'invalid_request',
        error_description: 'Missing or invalid client_id'
      });
    }
    
    const { client_id } = result.data;
    
    // Revoke authorization
    await revokeUserAuthorization(userId, client_id);
    
    // Create audit log
    await createAuditLog({
      action: 'app_authorization_revoked',
      clientId: client_id,
      userId,
      ipAddress: getIpFromRequest(req),
      details: 'User revoked application authorization'
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error revoking application:', error);
    res.status(500).json({
      error: 'server_error',
      error_description: 'An error occurred while processing your request'
    });
  }
});

export default router;