import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User, insertUserSchema } from "@shared/schema";
import { z } from "zod";

declare global {
  namespace Express {
    // Use the User type from shared schema as the Express.User type
    interface User extends Omit<import('@shared/schema').User, 'id'> {
      id: number;
    }
  }
}

const scryptAsync = promisify(scrypt);

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
  });

// Also export registerUserSchema for backward compatibility
export const registerUserSchema = registerSchema;

// Hash a password using scrypt and a random salt
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// Compare a plaintext password with a stored hash
async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Middleware to check if a user is authenticated
export function isAuthenticated(req: Request, res: Response, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}

// Middleware to check if a user is an admin
export function isAdmin(req: Request, res: Response, next: any) {
  if (req.isAuthenticated() && (req.user as any).isAdmin) {
    return next();
  }
  res.status(403).json({ message: "Forbidden" });
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
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      sameSite: "lax"
    },
    name: "pickle.sid" // Set a unique session cookie name
  };

  // Configure session middleware
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

      // Create user with hashed password
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
      });

      // Log the user in automatically after registration
      req.login(user, (err) => {
        if (err) return next(err);
        
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
    req.logout((err) => {
      if (err) return next(err);
      res.status(200).json({ message: "Logged out successfully" });
    });
  });

  // Current user route
  app.get("/api/auth/current-user", (req, res) => {
    console.log("Current user check - Is authenticated:", req.isAuthenticated());
    console.log("Current user check - Session ID:", req.sessionID);
    console.log("Current user check - Cookie:", req.headers.cookie);
    
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    console.log("User is authenticated, returning user:", req.user);
    
    // Return the user data without the password
    const { password, ...userWithoutPassword } = req.user as User;
    res.json(userWithoutPassword);
  });
}