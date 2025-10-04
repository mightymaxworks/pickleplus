// Extend the express session interface at file scope
declare module 'express-session' {
  interface SessionData {
    csrfToken?: string;
  }
}

import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { Strategy as KakaoStrategy } from "passport-kakao";
import { Strategy as LineStrategy } from "passport-line";
import express, { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import bcryptjs from "bcryptjs";
import axios from "axios";
import { storage } from "./storage";
import { User, InsertUser, insertUserSchema } from "@shared/schema";
import { z } from "zod";
import { generateUniquePassportCode } from "./utils/passport-code";
import { AuditAction, AuditResource } from "../shared/schema/audit";
import { isAdminWithRecentLogin } from "./security";

declare global {
  namespace Express {
    // Use the User type from shared schema as the Express.User type
    interface User extends Omit<import('@shared/schema').User, 'id'> {
      id: number;
    }
  }
}

// Login schema for validating login requests
export const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// Register schema inherits from the insertUserSchema defined in shared/schema.ts
export const registerSchema = insertUserSchema
  .extend({
    // Override the password field to add validation
    password: z.string().min(8, "Password must be at least 8 characters"),
    // Make firstName and lastName required for new registrations
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    // Username validation
    username: z.string()
      .min(3, "Username must be at least 3 characters")
      .max(50, "Username cannot exceed 50 characters"),
  });

// Also export registerUserSchema for backward compatibility
export const registerUserSchema = registerSchema;

// Hash a password using bcryptjs
export async function hashPassword(password: string): Promise<string> {
  try {
    if (!password || typeof password !== 'string') {
      console.error('[Auth] hashPassword called with invalid password:', { 
        hasPassword: !!password,
        typeOfPassword: typeof password
      });
      throw new Error('Invalid password provided for hashing');
    }
    
    const salt = await bcryptjs.genSalt(10);
    return await bcryptjs.hash(password, salt);
  } catch (error) {
    console.error('[Auth] Error in hashPassword:', error);
    throw error; // Re-throw to handle properly in calling function
  }
}

// Compare a plaintext password with a stored hash
async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  try {
    if (!supplied || !stored) {
      console.error('[Auth] comparePasswords called with invalid parameters:', {
        hasSupplied: !!supplied,
        hasStored: !!stored
      });
      return false;
    }
    
    return await bcryptjs.compare(supplied, stored);
  } catch (error) {
    console.error('[Auth] Error in comparePasswords:', error);
    return false;
  }
}

// Middleware to check if a user is authenticated
export function isAuthenticated(req: Request, res: Response, next: any) {
  // For all protected routes, enforce authentication
  if (req.isAuthenticated()) {
    return next();
  }
  
  // PRODUCTION SECURITY FIX: Remove DEV MODE bypass for production readiness
  // Authentication is now required for all environments
  console.log(`[SECURITY] Authentication required for ${req.path} - no bypass allowed`);
    
  // Return standard 401 Unauthorized response
  res.status(401).json({ message: "Not authenticated" });
}

// Middleware to check if a user is an admin (basic version)
export function isAdmin(req: Request, res: Response, next: NextFunction) {
  // PKL-278651-AUTH-0016-PROLES - Enhanced role checking
  if (req.isAuthenticated()) {
    const user = req.user as any;
    
    // Check if user has admin privileges from database roles
    if (user.isAdmin) {
      console.log(`[Auth] Admin access granted to ${user.username} for ${req.path}`);
      return next();
    }
    
    // Check for ADMIN role in the user's roles array
    if (user.roles && Array.isArray(user.roles) && user.roles.some((role: any) => role.name === 'ADMIN')) {
      console.log(`[Auth] Admin access granted to ${user.username} based on ADMIN role for ${req.path}`);
      return next();
    }
    
    // Log access denied attempt
    const userId = user.id;
    const username = user.username;
    console.log(`[Auth] Admin access denied for user ${username} (${userId}) to ${req.path}`);
    
    // Record audit log for access denied
    storage.createAuditLog({
      timestamp: new Date(),
      userId,
      action: AuditAction.ACCESS_DENIED,
      resource: AuditResource.ADMIN,
      resourceId: null,
      ipAddress: req.ip || 'unknown',
      userAgent: req.headers['user-agent'] || null,
      statusCode: 403,
      additionalData: {
        path: req.path,
        method: req.method,
        username,
        roles: user.roles ? user.roles.map((r: any) => r.name).join(',') : 'none'
      }
    }).catch(err => console.error('Failed to log access denied:', err));
  }
  
  res.status(403).json({ message: "Forbidden" });
}

// Enhanced secure version requiring recent login for critical admin operations
export function isSecureAdmin(req: Request, res: Response, next: NextFunction) {
  // Use the enhanced admin check with recent login requirement for all admins
  return isAdminWithRecentLogin(4)(req, res, next);
}

// Admin middleware that requires authentication and admin privileges
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  // Check authentication first
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }

  // Check admin privileges
  const user = req.user as any;
  
  // Check if user has admin privileges from database roles
  if (user.isAdmin) {
    console.log(`[Auth] Admin access granted to ${user.username} for ${req.path}`);
    return next();
  }
  
  // Check for ADMIN role in the user's roles array
  if (user.roles && Array.isArray(user.roles) && user.roles.some((role: any) => role.name === 'ADMIN')) {
    console.log(`[Auth] Admin access granted to ${user.username} based on ADMIN role for ${req.path}`);
    return next();
  }
  
  // Log access denied attempt
  console.log(`[Auth] Admin access denied for user ${user.username} (${user.id}) to ${req.path}`);
  
  res.status(403).json({ message: "Admin privileges required" });
}

// Setup authentication for the application
export function setupAuth(app: Express) {
  // Add JSON parsing middleware for auth routes only
  app.use('/api/auth/*', express.json());
  
  // Production-optimized session configuration
  const isProduction = process.env.NODE_ENV === 'production';
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "pickle-plus-secret-key",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      httpOnly: true,
      secure: false, // Keep false for Replit deployment compatibility
      sameSite: "lax",
      path: '/'
    },
    name: "pickle_session_id"
  };

  // Configure for deployment environment
  app.set('trust proxy', 1);
  
  // Add production CORS headers
  if (isProduction) {
    app.use((req, res, next) => {
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Allow-Origin', req.headers.origin);
      res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      
      if (req.method === 'OPTIONS') {
        return res.status(200).end();
      }
      next();
    });
  }
  
  app.use(session(sessionSettings));
  
  // Initialize Passport and restore authentication state from session
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure local strategy for username/password authentication
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        console.log(`[Auth] LocalStrategy login attempt for username: ${username}`);
        
        if (!username || !password) {
          console.error('[Auth] Invalid login attempt with missing credentials:', {
            hasUsername: !!username,
            hasPassword: !!password
          });
          return done(null, false);
        }
        
        // Check for test users in case they've been temporarily removed
        // PRODUCTION SECURITY FIX: Remove test user bypass
        if (false) { // Disabled for production security
          console.log('[Auth] Special handling for test user: testuser1');
        }
        
        // Try to find user by username first, then by email
        let user = await storage.getUserByUsername(username);
        
        if (!user) {
          console.log(`[Auth] User not found by username: ${username}, trying email...`);
          user = await storage.getUserByEmail(username);
        }
        
        if (!user) {
          console.log(`[Auth] User not found by username or email: ${username}`);
          return done(null, false);
        }
        
        console.log(`[Auth] User found: ${user.username} (Email: ${user.email}, ID: ${user.id}) for login attempt: ${username}`);
        
        console.log(`[Auth] User found: ${username} (ID: ${user.id}), validating password...`);
        console.log(`[Auth] Supplied password: "${password}" (length: ${password.length})`);
        console.log(`[Auth] Stored hash: "${user.password}" (length: ${user.password.length})`);
        
        const passwordValid = await comparePasswords(password, user.password);
        console.log(`[Auth] Password validation result: ${passwordValid}`);
        
        if (!passwordValid) {
          console.log(`[Auth] Password validation failed for user: ${username}`);
          return done(null, false);
        }
        
        console.log(`[Auth] Password validation successful for user: ${username}`);
        return done(null, user);
      } catch (error) {
        console.error('[Auth] Error in LocalStrategy:', error);
        return done(error);
      }
    }),
  );

  // Configure Facebook OAuth strategy
  if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
    passport.use(
      new FacebookStrategy(
        {
          clientID: process.env.FACEBOOK_APP_ID,
          clientSecret: process.env.FACEBOOK_APP_SECRET,
          callbackURL: "/auth/facebook/callback",
          profileFields: ['id', 'displayName', 'name', 'email', 'photos']
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            console.log(`[Facebook OAuth] Login attempt for profile: ${profile.id}`);
            
            // Check if user already exists with Facebook ID
            let user = await storage.getUser(profile.id);
            
            if (user) {
              // Update existing user's Facebook data
              const updatedUser = await storage.upsertUser({
                id: user.id.toString(),
                facebookId: profile.id,
                profileImageUrl: profile.photos?.[0]?.value || user.profileImageUrl,
                lastSocialLogin: new Date(),
                socialLoginCount: (user.socialLoginCount || 0) + 1,
                primaryOauthProvider: user.primaryOauthProvider || 'facebook'
              });
              console.log(`[Facebook OAuth] Updated existing user: ${updatedUser.id}`);
              return done(null, updatedUser);
            } else {
              // Check if email already exists
              if (profile.emails?.[0]?.value) {
                const existingEmailUser = await storage.getUserByEmail(profile.emails[0].value);
                if (existingEmailUser) {
                  // Link Facebook to existing account
                  const linkedUser = await storage.upsertUser({
                    id: existingEmailUser.id.toString(),
                    facebookId: profile.id,
                    profileImageUrl: profile.photos?.[0]?.value || existingEmailUser.profileImageUrl,
                    lastSocialLogin: new Date(),
                    socialLoginCount: (existingEmailUser.socialLoginCount || 0) + 1,
                    primaryOauthProvider: existingEmailUser.primaryOauthProvider || 'facebook'
                  });
                  console.log(`[Facebook OAuth] Linked Facebook to existing account: ${linkedUser.id}`);
                  return done(null, linkedUser);
                }
              }
              
              // Create new user from Facebook profile
              const newUser = await storage.upsertUser({
                email: profile.emails?.[0]?.value || `facebook_${profile.id}@pickle.app`,
                firstName: profile.name?.givenName || profile.displayName?.split(' ')[0] || 'Facebook',
                lastName: profile.name?.familyName || profile.displayName?.split(' ').slice(1).join(' ') || 'User',
                profileImageUrl: profile.photos?.[0]?.value,
                facebookId: profile.id,
                primaryOauthProvider: 'facebook',
                socialLoginCount: 1,
                lastSocialLogin: new Date(),
                socialDataConsentLevel: 'basic'
              });
              console.log(`[Facebook OAuth] Created new user: ${newUser.id}`);
              return done(null, newUser);
            }
          } catch (error) {
            console.error('[Facebook OAuth] Error in FacebookStrategy:', error);
            return done(error);
          }
        }
      )
    );
    console.log('[Facebook OAuth] Facebook strategy configured');
  } else {
    console.log('[Facebook OAuth] Facebook OAuth disabled - missing environment variables');
  }

  // Configure Kakao OAuth strategy
  if (process.env.KAKAO_CLIENT_ID && process.env.KAKAO_CLIENT_SECRET) {
    passport.use(
      new KakaoStrategy(
        {
          clientID: process.env.KAKAO_CLIENT_ID,
          clientSecret: process.env.KAKAO_CLIENT_SECRET,
          callbackURL: "/auth/kakao/callback"
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            console.log(`[Kakao OAuth] Login attempt for profile: ${profile.id}`);
            
            // Check if user already exists with Kakao ID
            let user = await storage.getUser(profile.id);
            
            if (user) {
              // Update existing user's Kakao data
              const updatedUser = await storage.upsertUser({
                id: user.id.toString(),
                kakaoId: profile.id,
                profileImageUrl: profile._json?.properties?.profile_image || user.profileImageUrl,
                lastSocialLogin: new Date(),
                socialLoginCount: (user.socialLoginCount || 0) + 1,
                primaryOauthProvider: user.primaryOauthProvider || 'kakao'
              });
              console.log(`[Kakao OAuth] Updated existing user: ${updatedUser.id}`);
              return done(null, updatedUser);
            } else {
              // Check if email already exists
              const email = profile._json?.kakao_account?.email;
              if (email) {
                const existingEmailUser = await storage.getUserByEmail(email);
                if (existingEmailUser) {
                  // Link Kakao to existing account
                  const linkedUser = await storage.upsertUser({
                    id: existingEmailUser.id.toString(),
                    kakaoId: profile.id,
                    profileImageUrl: profile._json?.properties?.profile_image || existingEmailUser.profileImageUrl,
                    lastSocialLogin: new Date(),
                    socialLoginCount: (existingEmailUser.socialLoginCount || 0) + 1,
                    primaryOauthProvider: existingEmailUser.primaryOauthProvider || 'kakao'
                  });
                  console.log(`[Kakao OAuth] Linked Kakao to existing account: ${linkedUser.id}`);
                  return done(null, linkedUser);
                }
              }
              
              // Create new user from Kakao profile
              const newUser = await storage.upsertUser({
                email: email || `kakao_${profile.id}@pickle.app`,
                firstName: profile._json?.properties?.nickname || 'Kakao',
                lastName: 'User',
                profileImageUrl: profile._json?.properties?.profile_image,
                kakaoId: profile.id,
                primaryOauthProvider: 'kakao',
                socialLoginCount: 1,
                lastSocialLogin: new Date(),
                socialDataConsentLevel: 'basic'
              });
              console.log(`[Kakao OAuth] Created new user: ${newUser.id}`);
              return done(null, newUser);
            }
          } catch (error) {
            console.error('[Kakao OAuth] Error in KakaoStrategy:', error);
            return done(error);
          }
        }
      )
    );
    console.log('[Kakao OAuth] Kakao strategy configured');
  } else {
    console.log('[Kakao OAuth] Kakao OAuth disabled - missing environment variables');
  }

  // Configure Line OAuth strategy
  if (process.env.LINE_CHANNEL_ID && process.env.LINE_CHANNEL_SECRET) {
    passport.use(
      new LineStrategy(
        {
          channelID: process.env.LINE_CHANNEL_ID,
          channelSecret: process.env.LINE_CHANNEL_SECRET,
          callbackURL: "/auth/line/callback"
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            console.log(`[Line OAuth] Login attempt for profile: ${profile.id}`);
            
            // Check if user already exists with Line ID
            let user = await storage.getUser(profile.id);
            
            if (user) {
              // Update existing user's Line data
              const updatedUser = await storage.upsertUser({
                id: user.id.toString(),
                lineId: profile.id,
                profileImageUrl: profile.pictureUrl || user.profileImageUrl,
                lastSocialLogin: new Date(),
                socialLoginCount: (user.socialLoginCount || 0) + 1,
                primaryOauthProvider: user.primaryOauthProvider || 'line'
              });
              console.log(`[Line OAuth] Updated existing user: ${updatedUser.id}`);
              return done(null, updatedUser);
            } else {
              // Create new user from Line profile
              const newUser = await storage.upsertUser({
                email: `line_${profile.id}@pickle.app`, // Line doesn't provide email by default
                firstName: profile.displayName || 'Line',
                lastName: 'User',
                profileImageUrl: profile.pictureUrl,
                lineId: profile.id,
                primaryOauthProvider: 'line',
                socialLoginCount: 1,
                lastSocialLogin: new Date(),
                socialDataConsentLevel: 'basic'
              });
              console.log(`[Line OAuth] Created new user: ${newUser.id}`);
              return done(null, newUser);
            }
          } catch (error) {
            console.error('[Line OAuth] Error in LineStrategy:', error);
            return done(error);
          }
        }
      )
    );
    console.log('[Line OAuth] Line strategy configured');
  } else {
    console.log('[Line OAuth] Line OAuth disabled - missing environment variables');
  }

  // Configure WeChat OAuth (Custom Implementation)
  if (process.env.WECHAT_APP_ID && process.env.WECHAT_APP_SECRET) {
    console.log('[WeChat OAuth] WeChat OAuth configured');
  } else {
    console.log('[WeChat OAuth] WeChat OAuth disabled - missing environment variables');
  }

  // Configure Passport serialization and deserialization
  passport.serializeUser((user: Express.User, done) => {
    done(null, (user as any).id);
  });
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      // Add more robust error handling
      if (!id || typeof id !== 'number') {
        console.error('[Auth] Invalid user ID in deserializeUser:', { id, type: typeof id });
        return done(null, false);
      }
      
      console.log(`[Auth] Attempting to deserialize user with ID: ${id} (type: ${typeof id})`);
      
      // Add explicit check for storage object
      if (!storage) {
        console.error('[Auth] Storage object is undefined in deserializeUser');
        return done(null, false);
      }
      
      console.log('[Auth] Storage object exists, calling getUser...');
      const user = await storage.getUser(id);
      console.log(`[Auth] getUser returned:`, { user: !!user, userType: typeof user });
      
      // Ensure we found a valid user
      if (!user) {
        console.log(`[Auth] User with ID ${id} not found during deserialization`);
        // Let's try to debug why by checking if the user exists in raw SQL
        console.log(`[Auth] Debugging: Will check database directly for user ID ${id}`);
        return done(null, false);
      }
      
      console.log(`[Auth] User found successfully: ${user.username} (ID: ${user.id}, isAdmin: ${user.isAdmin})`);
      
      // Return the user directly without extra complexity
      const enhancedUser = {
        ...user,
        roles: [] // Simplified for debugging
      };
      
      console.log(`[Auth] User ${user.username} (ID: ${user.id}) successfully deserialized`);
      
      // Successfully found user
      return done(null, enhancedUser);
    } catch (error) {
      // Log the error for debugging with more detail
      console.error('[Auth] Error in deserializeUser:', {
        error: error.message,
        stack: error.stack,
        id,
        idType: typeof id
      });
      // Return false instead of the error to prevent crash
      return done(null, false);
    }
  });

  // Authentication routes
  
  // Password reset request endpoint - Email automated
  app.post("/api/auth/forgot-password", async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      // Find user by email
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        // Don't reveal whether email exists for security
        return res.status(200).json({ 
          message: "If an account with that email exists, you will receive a password reset email shortly." 
        });
      }
      
      // Generate secure reset token
      const crypto = await import('crypto');
      const resetToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
      
      // Store the reset token
      try {
        await storage.createPasswordResetToken(user.id, resetToken, expiresAt);
        
        // Send password reset email
        const { sendPasswordResetEmail } = await import('./services/emailService');
        const emailSent = await sendPasswordResetEmail(
          user.email!, 
          resetToken, 
          user.displayName || user.username
        );
        
        if (!emailSent) {
          console.error('[Auth] Failed to send password reset email');
          return res.status(500).json({ message: "Failed to send password reset email" });
        }
        
        console.log(`[Auth] Password reset email sent to ${email} (User ID: ${user.id})`);
        
      } catch (error) {
        console.error('[Auth] Error creating password reset token or sending email:', error);
        return res.status(500).json({ message: "Failed to process password reset request" });
      }
      
      res.status(200).json({ 
        message: "If an account with that email exists, you will receive a password reset email shortly."
      });
    } catch (error) {
      console.error('[Auth] Error in forgot-password:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin endpoint to generate temporary password
  app.post("/api/admin/generate-temp-password", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      if (!user.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { userId, tempPassword } = req.body;
      
      if (!userId || !tempPassword) {
        return res.status(400).json({ message: "User ID and temporary password are required" });
      }

      if (tempPassword.length < 8) {
        return res.status(400).json({ message: "Temporary password must be at least 8 characters" });
      }

      // Hash temporary password
      const hashedPassword = await hashPassword(tempPassword);

      // Update user's password
      await storage.updateUserPassword(userId, hashedPassword);

      console.log(`[Auth] Admin ${user.username} set temporary password for user ID: ${userId}`);

      res.status(200).json({ 
        message: "Temporary password set successfully",
        tempPassword 
      });
    } catch (error) {
      console.error('[Auth] Error in generate-temp-password:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin endpoint to search users
  app.get("/api/admin/users/search", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      if (!user.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const query = req.query.q as string;
      
      if (!query || query.length < 2) {
        return res.status(400).json({ message: "Search query must be at least 2 characters" });
      }

      const users = await storage.searchUsers(query);
      
      // Only return essential user info for admin search
      const safeUsers = users.map(u => ({
        id: u.id,
        username: u.username,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        createdAt: u.createdAt
      }));

      res.status(200).json(safeUsers);
    } catch (error) {
      console.error('[Auth] Error in user search:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin endpoint to get password reset requests
  app.get("/api/admin/password-reset-requests", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      if (!user.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      // For now, return empty array since we're not storing these in the database yet
      // In production, you'd query a password_reset_requests table
      res.status(200).json([]);
    } catch (error) {
      console.error('[Auth] Error in password-reset-requests:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Password reset endpoint
  app.post("/api/auth/reset-password", async (req: Request, res: Response) => {
    try {
      const { token, newPassword } = req.body;
      
      if (!token || !newPassword) {
        return res.status(400).json({ message: "Token and new password are required" });
      }
      
      if (newPassword.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters" });
      }
      
      // Verify reset token
      const resetData = await storage.getPasswordResetToken(token);
      
      if (!resetData || new Date() > resetData.expiresAt) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }
      
      // Hash new password
      const hashedPassword = await hashPassword(newPassword);
      
      // Update user password
      await storage.updateUserPassword(resetData.userId, hashedPassword);
      
      // Delete used reset token
      await storage.deletePasswordResetToken(token);
      
      console.log(`[Auth] Password reset successful for user ID: ${resetData.userId}`);
      
      res.status(200).json({ message: "Password reset successful" });
    } catch (error) {
      console.error('[Auth] Error in reset-password:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Register route
  app.post("/api/auth/register", async (req, res, next) => {
    try {
      console.log("[DEBUG AUTH] Registration attempt with data:", { 
        ...req.body, 
        password: req.body.password ? '[REDACTED]' : undefined 
      });

      try {
        // Validate the registration data
        const validatedData = registerSchema.parse(req.body);
        console.log("[DEBUG AUTH] Data validation passed:", {
          username: validatedData.username,
          email: validatedData.email,
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          displayName: validatedData.displayName
        });
        
        // Check for referral code in the request
        const referrerId = parseInt(req.query.ref as string, 10) || null;
        console.log(`[DEBUG AUTH] Referral ID from query: ${referrerId}`);
        
        // Check if the username is already taken
        const existingUser = await storage.getUserByUsername(validatedData.username);
        if (existingUser) {
          console.log("[DEBUG AUTH] Registration failed: Username already exists:", validatedData.username);
          return res.status(400).json({ message: "Username already exists" });
        }
        console.log("[DEBUG AUTH] Username check passed, username is available");
        
        // Check if the email is already in use
        if (validatedData.email) {
          const existingEmail = await storage.getUserByEmail(validatedData.email);
          if (existingEmail) {
            console.log("[DEBUG AUTH] Registration failed: Email already in use:", validatedData.email);
            return res.status(400).json({ message: "Email address already in use" });
          }
          console.log("[DEBUG AUTH] Email check passed, email is available");
        }

        // Hash the password
        const hashedPassword = await hashPassword(validatedData.password);
        console.log("[DEBUG AUTH] Password hashed successfully");
        
        // Generate a unique passport code
        let passportCode = await generateUniquePassportCode();
        
        // Fallback for test environments: generate a simple unique code if generation fails
        if (!passportCode) {
          console.log("[DEBUG AUTH] Failed to generate unique passport code, using test fallback");
          if (process.env.NODE_ENV === 'test') {
            passportCode = `TEST${Date.now().toString().slice(-6)}`;
            console.log("[DEBUG AUTH] Using test passport code:", passportCode);
          } else {
            return res.status(500).json({ message: "Failed to generate unique passport code" });
          }
        } else {
          console.log("[DEBUG AUTH] Generated passport code successfully");
        }

        // Set avatar initials from name
        const firstName = validatedData.firstName || '';
        const lastName = validatedData.lastName || '';
        const avatarInitials = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
        console.log("[DEBUG AUTH] Generated avatar initials:", avatarInitials);
        
        // If displayName is not provided, use firstName + lastName
        const displayName = validatedData.displayName || `${firstName} ${lastName}`;
        console.log("[DEBUG AUTH] Using displayName:", displayName);

        // Create user with hashed password and passport code
        console.log("[DEBUG AUTH] Attempting to create user in storage with data:", {
          username: validatedData.username,
          email: validatedData.email,
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          displayName,
          avatarInitials
        });
        
        // Create a user data object with all fields
        const userData: any = {
          ...validatedData,
          password: hashedPassword,
          avatarInitials,
          displayName,
        };
        
        // Manually add the passportCode field (which is normally omitted in the InsertUser type)
        userData.passportCode = passportCode;
        
        // If referrerId is provided, save it to track the referral
        if (referrerId) {
          userData.referredBy = referrerId;
        }
        
        // Create the user with the augmented data object
        let user;
        try {
          user = await storage.createUser(userData as InsertUser);
          
          if (!user) {
            console.error("[DEBUG AUTH] User creation failed, storage.createUser returned null/undefined");
            return res.status(500).json({ message: "User creation failed" });
          }
        } catch (createError) {
          console.error("[DEBUG AUTH] User creation error:", createError);
          
          // Check for specific error types
          if (createError.message && createError.message.includes('duplicate key')) {
            if (createError.message.includes('username')) {
              return res.status(400).json({ message: "Username already exists" });
            } else if (createError.message.includes('email')) {
              return res.status(400).json({ message: "Email already in use" });
            } else if (createError.message.includes('passport')) {
              return res.status(500).json({ message: "System error with passport generation. Please try again." });
            }
          }
          
          return res.status(500).json({ message: "Error creating user account" });
        }
        
        console.log("[DEBUG AUTH] User created successfully with ID:", user.id);
        
        // PKL-278651-COMM-0020-DEFGRP - Auto-join default communities
        Promise.all([
          import('./db'),
          import('@shared/schema/community'),
          import('drizzle-orm')
        ]).then(async ([dbModule, communityModule, drizzleModule]) => {
          const { db } = dbModule;
          const { communities, communityMembers } = communityModule;
          const { eq } = drizzleModule;
          
          // Find all default communities
          const defaultCommunities = await db.select().from(communities).where(eq(communities.isDefault, true));
          
          if (defaultCommunities.length > 0) {
            console.log(`[PKL-278651-COMM-0020-DEFGRP] Adding user ${user.id} to ${defaultCommunities.length} default communities`);
            
            // Create membership records for each default community
            for (const community of defaultCommunities) {
              await db.insert(communityMembers).values({
                userId: user.id,
                communityId: community.id,
                role: 'member',
                joinedAt: new Date(),
              });
              
              // Update member count for the community
              await db.update(communities)
                .set({ memberCount: community.memberCount + 1 })
                .where(eq(communities.id, community.id));
                
              console.log(`[PKL-278651-COMM-0020-DEFGRP] User ${user.id} added to default community: ${community.name} (ID: ${community.id})`);
            }
          } else {
            console.log(`[PKL-278651-COMM-0020-DEFGRP] No default communities found for auto-join`);
          }
        }).catch((error) => {
          // Don't block registration if adding to default communities fails
          console.error("[PKL-278651-COMM-0020-DEFGRP] Error adding user to default communities:", error);
        });

        // Award XP to referrer if valid
        (async () => {
          try {
            if (referrerId) {
              // Check if referrer exists
              const referrer = await storage.getUser(referrerId);
              if (referrer) {
                // Import XP service
                const { xpService } = await import('./modules/xp/xp-service');
                
                // Define XP constants at the top of the function or file
                const XP_SOURCE_REFERRAL = 'REFERRAL';
                
                // Generate a random XP reward between 20-40
                const minXP = 20;
                const maxXP = 40;
                const randomXpReward = Math.floor(Math.random() * (maxXP - minXP + 1)) + minXP;
                
                // Award XP to the referrer
                await xpService.awardXp({
                  userId: referrerId,
                  amount: randomXpReward,
                  source: XP_SOURCE_REFERRAL,
                  sourceType: 'USER_REGISTRATION',
                  sourceId: user.id.toString(),
                  description: `Invited user ${user.username} who registered`
                });
                
                console.log(`[REFERRAL] Awarded ${randomXpReward} XP to user ${referrerId} for referring ${user.username}`);
              } else {
                console.log(`[REFERRAL] Referrer with ID ${referrerId} not found, no XP awarded`);
              }
            }
          } catch (error) {
            // Don't block registration if XP award fails
            console.error("[REFERRAL] Error awarding XP to referrer:", error);
          }
        })();

        // Log the user in automatically after registration
        req.login(user, (err) => {
          if (err) {
            console.error("[DEBUG AUTH] Login after registration failed:", err);
            return next(err);
          }
          
          // Ensure proper headers for CORS with credentials
          res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
          res.header('Access-Control-Allow-Credentials', 'true');
          
          console.log('[DEBUG AUTH] Registration successful for user:', user.username);
          console.log('[DEBUG AUTH] Session ID:', req.sessionID);
          console.log('[DEBUG AUTH] Session data:', req.session);
          
          // Start the onboarding process for the new user
          import('./modules/onboarding/onboardingService')
            .then(({ onboardingService }) => {
              return onboardingService.startOrResumeOnboarding(user.id);
            })
            .then(() => {
              console.log('[DEBUG AUTH] Onboarding process started for user:', user.id);
            })
            .catch((err) => {
              console.error('[DEBUG AUTH] Failed to start onboarding service:', err);
            });
          
          // Return the user data without the password
          const { password, ...userWithoutPassword } = user;
          res.status(201).json(userWithoutPassword);
        });
      } catch (validationError) {
        console.error("[DEBUG AUTH] Schema validation error:", validationError);
        if (validationError instanceof z.ZodError) {
          // Format Zod validation errors for better readability
          const formattedErrors = validationError.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message
          }));
          console.log("[DEBUG AUTH] Formatted validation errors:", formattedErrors);
          return res.status(400).json({ 
            message: "Validation failed", 
            errors: formattedErrors 
          });
        }
        throw validationError; // Re-throw if it's not a Zod error
      }
    } catch (error) {
      console.error("[DEBUG AUTH] Unexpected error during registration:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        next(error);
      }
    }
  });

  // Login route
  app.post("/api/auth/login", (req, res, next) => {
    try {
      console.log('[Login] Login attempt:', { 
        username: req.body.username,
        sessionID: req.sessionID,
        hasSession: !!req.session,
        sessionCookie: req.headers.cookie || 'no-cookie',
        bodyData: req.body
      });
      
      // Validate login data with better error handling
      try {
        loginSchema.parse(req.body);
      } catch (validationError: any) {
        console.error('[Login] Validation error:', validationError.errors || validationError);
        return res.status(400).json({ 
          message: "Validation error", 
          errors: validationError.errors || [{ message: "Invalid login data" }]
        });
      }
      
      passport.authenticate("local", (err: any, user: any, info: any) => {
        if (err) {
          console.error('[Login] Authentication error:', err);
          return next(err);
        }
        if (!user) {
          console.log('[Login] Authentication failed - Invalid credentials for user:', req.body.username);
          return res.status(401).json({ message: "Invalid username or password" });
        }
        
        // User authenticated successfully - admin privileges are determined by database roles
        
        req.login(user, (err) => {
          if (err) {
            console.error('[Login] Login session error:', err);
            
            // Extra session diagnostics for debugging
            console.error('[Login] Session diagnostics during error:', {
              hasSession: !!req.session,
              sessionID: req.sessionID || 'none',
              cookies: req.headers.cookie || 'none',
              sessionStore: !!storage.sessionStore,
              userID: user?.id,
              username: user?.username
            });
            
            // Attempt session recovery
            try {
              if (req.session) {
                console.log('[Login] Attempting session recovery...');
                req.session.regenerate((regenerateErr) => {
                  if (regenerateErr) {
                    console.error('[Login] Session regeneration failed:', regenerateErr);
                    return next(err); // Return original error if regeneration fails
                  }
                  
                  console.log('[Login] Session regenerated successfully, retrying login...');
                  req.login(user, (retryErr) => {
                    if (retryErr) {
                      console.error('[Login] Retry login failed:', retryErr);
                      return next(retryErr);
                    }
                    
                    // Continue with login flow if retry succeeds...
                    continueSuccessfulLogin();
                  });
                });
                return; // Exit early, we're handling via the regenerate callback
              }
            } catch (recoveryErr) {
              console.error('[Login] Session recovery attempt failed:', recoveryErr);
            }
            
            return next(err);
          }
          
          // Normal successful flow
          function continueSuccessfulLogin() {
            // Extra logging for debug
            console.log('[Login] Login successful for user:', user.username);
            console.log('[Login] Session ID:', req.sessionID);
            console.log('[Login] Session data:', req.session);
            console.log('[Login] User admin status:', user.isAdmin);
            console.log('[Login] User founding member status:', user.isFoundingMember);
          }
          
          continueSuccessfulLogin();
          
          // Create audit log for successful login
          const auditAction = user.isAdmin ? AuditAction.ADMIN_LOGIN : AuditAction.USER_LOGIN;
          storage.createAuditLog({
            timestamp: new Date(),
            userId: user.id,
            action: auditAction,
            resource: AuditResource.USER,
            resourceId: user.id.toString(),
            ipAddress: req.ip || 'unknown',
            userAgent: req.headers['user-agent'] || null,
            statusCode: 200,
            additionalData: {
              username: user.username,
              sessionId: req.sessionID
            }
          }).catch(err => console.error('Failed to log login:', err));
          
          // Update last login timestamp for secure admin access
          if (user.isAdmin) {
            (user as any).lastLoginAt = new Date();
          }
          
          // Ensure proper headers for CORS with credentials
          res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
          res.header('Access-Control-Allow-Credentials', 'true');
          
          // Return the user data without the password
          const { password, ...userWithoutPassword } = user;
          return res.json(userWithoutPassword);
        });
      })(req, res, next);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        next(error);
      }
    }
  });

  // Logout route
  app.post("/api/auth/logout", (req, res, next) => {
    // Ensure CORS headers for credentials
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    // Get user info before logging out to use in audit log
    const userId = req.isAuthenticated() ? (req.user as any).id : null;
    const isAdmin = req.isAuthenticated() ? (req.user as any).isAdmin : false;
    const username = req.isAuthenticated() ? (req.user as any).username : null;
    
    // Create audit log for logout if user is authenticated
    if (req.isAuthenticated()) {
      const auditAction = isAdmin ? AuditAction.ADMIN_LOGOUT : AuditAction.USER_LOGOUT;
      storage.createAuditLog({
        timestamp: new Date(),
        userId,
        action: auditAction,
        resource: AuditResource.USER,
        resourceId: userId.toString(),
        ipAddress: req.ip || 'unknown',
        userAgent: req.headers['user-agent'] || null,
        statusCode: 200,
        additionalData: {
          username,
          sessionId: req.sessionID
        }
      }).catch(err => console.error('Failed to log logout:', err));
    }
    
    req.logout((err) => {
      if (err) return next(err);
      
      // Explicitly destroy the session
      req.session.destroy((err) => {
        if (err) {
          console.error("Error destroying session:", err);
          return next(err);
        }
        
        res.status(200).json({ message: "Logged out successfully" });
      });
    });
  });

  // Forgot password route
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      // Check if user exists
      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Don't reveal if email exists or not for security
        return res.status(200).json({ message: "If this email is registered, you will receive a password reset link" });
      }
      
      // Generate secure reset token
      const crypto = await import('crypto');
      const resetToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
      
      // Store reset token
      await storage.createPasswordResetToken(user.id, resetToken, expiresAt);
      
      console.log(`[Auth] Password reset token generated for user ID: ${user.id}`);
      
      // In production, you would send an email here
      // For now, we'll log the reset link
      const resetLink = `${req.protocol}://${req.get('host')}/reset-password?token=${resetToken}`;
      console.log(`[Auth] Password reset link: ${resetLink}`);
      
      res.status(200).json({ 
        message: "If this email is registered, you will receive a password reset link",
        // For development only - remove in production
        resetToken,
        resetLink
      });
      
    } catch (error) {
      console.error('[Auth] Forgot password error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Reset password route
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      
      if (!token || !newPassword) {
        return res.status(400).json({ message: "Token and new password are required" });
      }
      
      // Validate token
      const tokenData = await storage.getPasswordResetToken(token);
      if (!tokenData) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }
      
      // Find user by email
      const user = await storage.getUserByEmail(tokenData.email);
      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }
      
      // Hash new password
      const hashedPassword = await hashPassword(newPassword);
      
      // Update password
      await storage.updateUserPassword(user.id, hashedPassword);
      
      // Delete reset token
      await storage.deletePasswordResetToken(token);
      
      console.log(`[Auth] Password reset successful for user ${user.username} (${user.email})`);
      
      res.status(200).json({ message: "Password reset successful" });
      
    } catch (error) {
      console.error('[Auth] Reset password error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // CSRF token route - Provides a CSRF token for authenticated users
  app.get("/api/auth/csrf-token", isAuthenticated, (req, res) => {
    console.log("[API][Auth] Generating CSRF token for user:", (req.user as any).id);
    
    // Session interface is already extended at the top of the file
    
    // Generate a CSRF token and store it in the session
    if (!req.session.csrfToken) {
      // Framework 5.0: Use reliable, cross-module compatible approach
      // Generate a simple but secure random token without external dependencies
      const timestamp = Date.now().toString();
      const randomPart = Math.random().toString(36).substring(2, 15);
      const userId = ((req.user as any)?.id || '0').toString();
      
      // Combine parts with a separator that's easy to validate
      const token = `${timestamp}-${userId}-${randomPart}`;
      req.session.csrfToken = token;
      console.log("[API][Auth] Created new CSRF token:", token.substring(0, 8) + '...');
    } else {
      console.log("[API][Auth] Using existing CSRF token:", req.session.csrfToken.substring(0, 8) + '...');
    }
    
    // Return the token to the client
    res.json({ csrfToken: req.session.csrfToken });
  });


  // Current user route
  app.get("/api/auth/current-user", async (req, res) => {
    console.log("Current user check - Is authenticated:", req.isAuthenticated());
    console.log("Current user check - Session ID:", req.sessionID);
    console.log("Current user check - Cookie:", req.headers.cookie);
    console.log("Current user check - Sessions:", req.session);
    
    // Ensure CORS headers for credentials
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    // PRODUCTION SECURITY FIX: Authentication required for all environments
    if (!req.isAuthenticated()) {
      console.log('[SECURITY] Authentication required for /api/auth/current-user endpoint');
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      // Get user data using standard method for all users
      const userId = (req.user as User).id;
      const username = (req.user as User).username;
      
      // Get fresh user data from database for all users
      const freshUserData = await storage.getUser(userId);
      
      console.log(`[Auth] Retrieved user data for ${username} with admin status: ${freshUserData?.isAdmin}`);
      
      if (!freshUserData) {
        console.log("User authenticated but not found in database:", userId);
        return res.status(404).json({ message: "User not found" });
      }
      
      console.log(`User is authenticated, returning fresh user data for ID: ${userId} with isAdmin=${freshUserData.isAdmin}`);
      
      // Return the user data without the password
      const { password, ...userWithoutPassword } = freshUserData;
      
      // Transform snake_case fields to camelCase for frontend consumption
      // Create a type that allows both camelCase and snake_case property access
      const transformedUserData: Record<string, any> = { ...userWithoutPassword };
      
      // Process and transform firstName
      if ('firstName' in transformedUserData) {
        // Field is already in camelCase format, no transformation needed
        console.log("[API] firstName already in camelCase:", transformedUserData.firstName);
      } else if (transformedUserData.first_name !== undefined) {
        // Transform from snake_case to camelCase
        transformedUserData.firstName = String(transformedUserData.first_name || "");
        delete transformedUserData.first_name;
        console.log("[API] Mapped first_name to firstName:", transformedUserData.firstName);
      }
      
      // Process and transform lastName
      if ('lastName' in transformedUserData) {
        // Field is already in camelCase format, no transformation needed
        console.log("[API] lastName already in camelCase:", transformedUserData.lastName);
      } else if (transformedUserData.last_name !== undefined) {
        // Transform from snake_case to camelCase
        transformedUserData.lastName = String(transformedUserData.last_name || "");
        delete transformedUserData.last_name;
        console.log("[API] Mapped last_name to lastName:", transformedUserData.lastName);
      }
      
      // Process and transform avatar_url to avatarUrl (for profile images)
      if (transformedUserData.avatar_url !== undefined) {
        transformedUserData.avatarUrl = transformedUserData.avatar_url;
        // Keep both for compatibility
        console.log("[API] Mapped avatar_url to avatarUrl:", !!transformedUserData.avatarUrl);
      }
      
      // Process and transform banner_url to bannerUrl (for cover images)
      if (transformedUserData.banner_url !== undefined) {
        transformedUserData.bannerUrl = transformedUserData.banner_url;
        // Keep both for compatibility
        console.log("[API] Mapped banner_url to bannerUrl:", !!transformedUserData.bannerUrl);
      }
      
      res.json(transformedUserData);
    } catch (error) {
      console.error("Error fetching current user:", error);
      res.status(500).json({ message: "Server error fetching user data" });
    }
  });
}