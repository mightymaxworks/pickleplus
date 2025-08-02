import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { setupAuth, isAuthenticated, handleMightymaxLogin } from "./auth";
import passport from "passport";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication first
  setupAuth(app);

  // Authentication routes
  app.post('/api/register', async (req: Request, res: Response) => {
    try {
      const { username, password, email, firstName, lastName } = req.body;
      
      console.log(`[API][Registration] Attempting to register user: ${username}`);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(409).json({ error: 'Username already exists' });
      }
      
      // Generate passport code
      const passportCode = `PKL-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      
      // Create new user
      const newUser = await storage.createUser({
        username,
        email: email || `${username}@pickle.com`,
        password, // This will be hashed by storage layer
        firstName,
        lastName,
        passportCode,
        duprRating: "3.0",
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log(`[API][Registration] User ${username} registered successfully with passport code ${passportCode}`);
      
      res.status(201).json({
        success: true,
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          passportCode: newUser.passportCode
        }
      });
    } catch (error) {
      console.error('[API][Registration] Error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  });

  // Login route with proper authentication
  app.post('/api/login', handleMightymaxLogin, passport.authenticate('local'), (req: Request, res: Response) => {
    console.log(`[API][Login] User ${req.user?.username} logged in successfully via passport`);
    
    res.json({
      success: true,
      user: {
        id: req.user?.id,
        username: req.user?.username,
        email: req.user?.email,
        firstName: req.user?.firstName,
        lastName: req.user?.lastName,
        passportCode: req.user?.passportCode,
        isAdmin: req.user?.isAdmin
      }
    });
  });

  // Current user endpoint
  app.get('/api/auth/current-user', isAuthenticated, (req: Request, res: Response) => {
    res.json({
      id: req.user?.id,
      username: req.user?.username,
      email: req.user?.email,
      firstName: req.user?.firstName,
      lastName: req.user?.lastName,
      passportCode: req.user?.passportCode,
      isAdmin: req.user?.isAdmin
    });
  });

  // Logout route
  app.post('/api/logout', (req: Request, res: Response) => {
    req.logout((err) => {
      if (err) {
        console.error('[API][Logout] Error:', err);
        return res.status(500).json({ error: 'Logout failed' });
      }
      res.json({ success: true, message: 'Logged out successfully' });
    });
  });

  // Protected admin routes
  app.get('/api/admin/users', isAuthenticated, async (req: Request, res: Response) => {
    try {
      if (!req.user?.isAdmin) {
        return res.status(403).json({ message: 'Admin access required' });
      }
      
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      console.error('[API][Admin] Error fetching users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  // Test endpoint for authentication verification
  app.get('/api/test/auth', isAuthenticated, (req: Request, res: Response) => {
    res.json({ 
      message: 'Authentication working!', 
      user: req.user,
      timestamp: new Date().toISOString()
    });
  });

  // Basic curriculum endpoint for testing  
  app.get('/api/curriculum', isAuthenticated, async (req: Request, res: Response) => {
    try {
      res.json({
        message: 'Curriculum endpoint working',
        user: req.user?.username,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('[API][Curriculum] Error:', error);
      res.status(500).json({ error: 'Failed to fetch curriculum' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}