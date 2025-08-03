import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { setupAuth, isAuthenticated, handleMightymaxLogin } from "./auth";
import passport from "passport";
import { storage } from "./storage";

// Import existing modular route systems
import { registerSageDrillsRoutes } from "./routes/sage-drills-routes";
import sageApiRoutes from "./routes/sage-api-routes";
import pcpCertificationRoutes from "./routes/pcp-certification-routes";
import { registerCurriculumManagementRoutes } from "./routes/curriculum-management-routes";
import analyticsRoutes from "./routes/analytics-routes";
import { registerAdminRoutes } from "./routes/admin-routes";
import { registerCoachHubRoutes } from "./routes/coach-hub-routes";
import sessionBookingRoutes from "./routes/session-booking-routes";
import wiseBusinessRoutes from "./routes/wise-business-routes";
import wiseDiagnosticRoutes from "./routes/wise-diagnostic-routes";
import { trainingCenterRoutes } from "./routes/training-center-routes";
import { registerJournalRoutes } from "./routes/journal-routes";
import pcpRoutes from "./routes/pcp-routes";
import pcpEnforcementRoutes from "./routes/pcp-enforcement-routes";

export async function registerRoutes(app: Express): Promise<Server> {
  console.log("[ROUTES] Setting up modular route architecture...");
  
  // Set up authentication first
  setupAuth(app);
  console.log("[AUTH] Authentication setup complete");

  // === AUTHENTICATION ROUTES ===
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

  // Logout route
  app.post('/api/logout', (req: Request, res: Response) => {
    req.logout((err) => {
      if (err) {
        console.error('[API][Logout] Error:', err);
        return res.status(500).json({ error: 'Logout failed' });
      }
      
      console.log('[API][Logout] User logged out successfully');
      res.json({ success: true, message: 'Logged out successfully' });
    });
  });

  // Current user endpoint
  app.get('/api/auth/current-user', isAuthenticated, (req: Request, res: Response) => {
    res.json(req.user);
  });

  console.log("[AUTH] Authentication routes registered");

  // === MODULAR ROUTE REGISTRATION ===
  console.log("[ROUTES] Registering modular route systems...");
  
  try {
    // SAGE System Routes (Critical for drill recommendations)
    console.log("[ROUTES] Registering SAGE Drills routes...");
    registerSageDrillsRoutes(app);
    
    console.log("[ROUTES] Registering SAGE API routes...");
    app.use('/api/sage', sageApiRoutes);
    
    // PCP Certification System
    console.log("[ROUTES] Registering PCP Certification routes...");
    app.use('/api/pcp-certification', pcpCertificationRoutes);
    
    // PCP Coaching System
    console.log("[ROUTES] Registering PCP Coaching routes...");
    app.use('/api/pcp', pcpRoutes);
    
    // Curriculum Management
    console.log("[ROUTES] Registering Curriculum Management routes...");
    registerCurriculumManagementRoutes(app);
    
    // Analytics System
    console.log("[ROUTES] Registering Analytics routes...");
    app.use('/api/analytics', analyticsRoutes);
    
    // Coach Hub System
    console.log("[ROUTES] Registering Coach Hub routes...");
    registerCoachHubRoutes(app);
    
    // Session Booking System
    console.log("[ROUTES] Registering Session Booking routes...");
    app.use('/api/session-booking', sessionBookingRoutes);
    
    // Journal System
    console.log("[ROUTES] Registering Journal routes...");
    registerJournalRoutes(app);
    
    // Training Centers
    console.log("[ROUTES] Registering Training Center routes...");
    app.use('/api/training-centers', trainingCenterRoutes);
    
    // WISE Payment System
    console.log("[ROUTES] Registering WISE Business routes...");
    app.use('/api/wise/business', wiseBusinessRoutes);
    
    console.log("[ROUTES] Registering WISE Diagnostic routes...");
    app.use('/api/wise-diagnostic', wiseDiagnosticRoutes);
    
    // Admin System
    console.log("[ROUTES] Registering Admin routes...");
    registerAdminRoutes(app);
    
    // Phase 3: Advanced Coach Analytics
    console.log("[ROUTES] Registering Advanced Coach Analytics routes...");
    const advancedCoachAnalyticsRoutes = await import('./routes/advanced-coach-analytics-routes');
    app.use('/api/coach/advanced', advancedCoachAnalyticsRoutes.default);
    console.log("[ROUTES] Advanced Coach Analytics routes registered successfully");
    
    // Phase 4: PCP Sequential Enforcement System
    console.log("[ROUTES] Registering PCP Sequential Enforcement routes...");
    app.use('/api/pcp', pcpEnforcementRoutes);
    console.log("[ROUTES] PCP Sequential Enforcement routes registered successfully");
    
    console.log("[ROUTES] All modular route systems registered successfully");
    
  } catch (error) {
    console.error("[ROUTES] Error registering modular routes:", error);
    console.error("[ROUTES] Continuing with basic functionality...");
  }

  // === FALLBACK API STATUS ENDPOINTS ===
  // These provide basic status for any unregistered endpoints
  const basicEndpoints = [
    { path: '/api/qr', message: 'QR Code Scanning API' },
    { path: '/api/wise', message: 'WISE Payment Integration API' },
    { path: '/api/wise/status', message: 'WISE Status API' }
  ];

  basicEndpoints.forEach(endpoint => {
    app.get(endpoint.path, (req: Request, res: Response) => {
      res.json({
        message: endpoint.message,
        version: "1.0.0",
        status: "operational", 
        architecture: "modular",
        timestamp: new Date().toISOString()
      });
    });
  });

  console.log("[ROUTES] Fallback endpoints registered");

  const httpServer = createServer(app);
  console.log("[ROUTES] Modular route architecture setup complete");
  
  return httpServer;
}