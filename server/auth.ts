import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import bcryptjs from "bcryptjs";
import { storage } from "./storage";
import { User, insertUserSchema } from "@shared/schema";
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
  });

// Also export registerUserSchema for backward compatibility
export const registerUserSchema = registerSchema;

// Hash a password using bcryptjs
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcryptjs.genSalt(10);
  return await bcryptjs.hash(password, salt);
}

// Compare a plaintext password with a stored hash
async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  return await bcryptjs.compare(supplied, stored);
}

// Middleware to check if a user is authenticated
export function isAuthenticated(req: Request, res: Response, next: any) {
  console.log(`isAuthenticated check for ${req.path} - Session ID: ${req.sessionID}`);
  console.log(`Authentication status: ${req.isAuthenticated()}`);
  
  // For all protected routes, enforce authentication
  if (req.isAuthenticated()) {
    return next();
  }
  
  console.log(`Access denied to ${req.path} - Not authenticated`);
  res.status(401).json({ message: "Unauthorized" });
}

// Middleware to check if a user is an admin (basic version)
export function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated() && (req.user as any).isAdmin) {
    return next();
  }
  
  // Log access denied attempt
  if (req.isAuthenticated()) {
    const userId = (req.user as any).id;
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
        method: req.method
      }
    }).catch(err => console.error('Failed to log access denied:', err));
  }
  
  res.status(403).json({ message: "Forbidden" });
}

// Enhanced secure version requiring recent login for critical admin operations
export function isSecureAdmin(req: Request, res: Response, next: NextFunction) {
  // Use the enhanced admin check with recent login requirement
  return isAdminWithRecentLogin(4)(req, res, next);
}

// Setup authentication for the application
export function setupAuth(app: Express) {
  // Create session configuration
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "pickle-plus-secret-key",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true,
      secure: false, // Set to false for development to work in Replit
      sameSite: "lax"
    },
    name: "connect.sid" // Use default cookie name
  };

  // Configure session middleware
  // Trust the first proxy to work with Replit
  app.set('trust proxy', 1);
  
  app.use(session(sessionSettings));
  
  // Initialize Passport and restore authentication state from session
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure local strategy for username/password authentication
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (error) {
        return done(error);
      }
    }),
  );

  // Configure Passport serialization and deserialization
  passport.serializeUser((user: Express.User, done) => {
    done(null, (user as any).id);
  });
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Authentication routes
  
  // Register route
  app.post("/api/auth/register", async (req, res, next) => {
    try {
      // Validate the registration data
      const validatedData = registerSchema.parse(req.body);
      
      // Check if the username is already taken
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Hash the password
      const hashedPassword = await hashPassword(validatedData.password);
      
      // Generate a unique passport code
      const passportCode = await generateUniquePassportCode();
      if (!passportCode) {
        return res.status(500).json({ message: "Failed to generate unique passport code" });
      }

      // Set avatar initials from name
      const firstName = validatedData.firstName || '';
      const lastName = validatedData.lastName || '';
      const avatarInitials = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
      
      // If displayName is not provided, use firstName + lastName
      const displayName = validatedData.displayName || `${firstName} ${lastName}`;

      // Create user with hashed password and passport code
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
        passportId: passportCode,
        avatarInitials,
        displayName,
      });

      // Log the user in automatically after registration
      req.login(user, (err) => {
        if (err) return next(err);
        
        // Ensure proper headers for CORS with credentials
        res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
        res.header('Access-Control-Allow-Credentials', 'true');
        
        console.log('Registration successful for user:', user.username);
        console.log('Session ID:', req.sessionID);
        
        // Return the user data without the password
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
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
      // Validate login data
      loginSchema.parse(req.body);
      
      passport.authenticate("local", (err: any, user: any, info: any) => {
        if (err) return next(err);
        if (!user) {
          return res.status(401).json({ message: "Invalid username or password" });
        }
        
        req.login(user, (err) => {
          if (err) return next(err);
          
          // Extra logging for debug
          console.log('Login successful for user:', user.username);
          console.log('Session ID:', req.sessionID);
          
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

  // Current user route
  app.get("/api/auth/current-user", async (req, res) => {
    console.log("Current user check - Is authenticated:", req.isAuthenticated());
    console.log("Current user check - Session ID:", req.sessionID);
    console.log("Current user check - Cookie:", req.headers.cookie);
    console.log("Current user check - Sessions:", req.session);
    
    // Ensure CORS headers for credentials
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      // Instead of using the cached session user, fetch the fresh user data from database
      const userId = (req.user as User).id;
      const freshUserData = await storage.getUser(userId);
      
      if (!freshUserData) {
        console.log("User authenticated but not found in database:", userId);
        return res.status(404).json({ message: "User not found" });
      }
      
      console.log("User is authenticated, returning fresh user data for ID:", userId);
      
      // Return the user data without the password
      const { password, ...userWithoutPassword } = freshUserData;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching current user:", error);
      res.status(500).json({ message: "Server error fetching user data" });
    }
  });
}