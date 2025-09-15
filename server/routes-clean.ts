import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { setupAuth, isAuthenticated } from "./auth";
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
  app.post('/api/login', passport.authenticate('local'), (req: Request, res: Response) => {
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

  // SAGE API Routes - Essential for drill recommendations and user profiles
  app.get('/api/sage/user-profile', async (req: Request, res: Response) => {
    try {
      res.json({
        message: "SAGE User Profile API",
        success: true,
        data: {
          userId: req.user?.id || 'anonymous',
          profileData: {
            skillLevel: req.user?.skillLevel || '3.5',
            playingStyle: req.user?.playingStyle || 'all-court',
            experience: req.user?.playingSince || '2+ years'
          }
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('[API][SAGE] User profile error:', error);
      res.status(500).json({ error: 'Failed to fetch user profile' });
    }
  });

  app.get('/api/sage/drill-recommendations', async (req: Request, res: Response) => {
    try {
      res.json({
        message: "SAGE Drill Recommendations API",
        success: true,
        data: {
          recommendations: [
            {
              id: 1,
              title: "Dink and Drop Precision",
              difficulty: "intermediate",
              category: "dinking",
              description: "Master soft game control"
            },
            {
              id: 2,
              title: "Third Shot Strategy",
              difficulty: "advanced",
              category: "strategy",
              description: "Perfect your court positioning"
            }
          ]
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('[API][SAGE] Drill recommendations error:', error);
      res.status(500).json({ error: 'Failed to fetch drill recommendations' });
    }
  });

  app.get('/api/sage/courtiq-details', async (req: Request, res: Response) => {
    try {
      res.json({
        message: "SAGE CourtIQ Details API",
        success: true,
        data: {
          iqScore: 85,
          strengths: ["Court positioning", "Shot selection"],
          improvements: ["Net play", "Power shots"],
          analysisDate: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('[API][SAGE] CourtIQ error:', error);
      res.status(500).json({ error: 'Failed to fetch CourtIQ details' });
    }
  });

  app.get('/api/sage/subscription-status', async (req: Request, res: Response) => {
    try {
      res.json({
        message: "SAGE Subscription Status API",
        success: true,
        data: {
          isActive: true,
          plan: "Premium",
          expiryDate: "2025-12-31",
          features: ["Advanced Analytics", "AI Coaching", "Video Analysis"]
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('[API][SAGE] Subscription status error:', error);
      res.status(500).json({ error: 'Failed to fetch subscription status' });
    }
  });

  app.get('/api/sage/match-history', async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit || 5;
      res.json({
        message: "SAGE Match History API",
        success: true,
        data: {
          matches: [
            {
              id: 1,
              date: "2025-08-01",
              opponent: "Alex Chen",
              result: "W",
              score: "11-7, 11-9",
              duration: "45 mins"
            },
            {
              id: 2,
              date: "2025-07-28",
              opponent: "Maria Rodriguez",
              result: "L",
              score: "9-11, 8-11",  
              duration: "38 mins"
            }
          ].slice(0, Number(limit))
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('[API][SAGE] Match history error:', error);
      res.status(500).json({ error: 'Failed to fetch match history' });
    }
  });

  // PCP Certification Routes
  app.get('/api/pcp-certification/levels', async (req: Request, res: Response) => {
    try {
      const levels = [
        { id: 'PCP-L1', name: 'Level 1 - Foundation', description: 'Basic coaching fundamentals' },
        { id: 'PCP-L2', name: 'Level 2 - Development', description: 'Player development techniques' },
        { id: 'PCP-L3', name: 'Level 3 - Advanced', description: 'Advanced coaching strategies' },
        { id: 'PCP-L4', name: 'Level 4 - Expert', description: 'Expert-level coaching' },
        { id: 'PCP-L5', name: 'Level 5 - Master', description: 'Master coach certification' }
      ];
      
      console.log('[PCP-CERT] Fetching certification levels');
      console.log(`[PCP-CERT] Returning ${levels.length} certification levels`);
      
      res.json({
        success: true,
        data: levels,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('[API][PCP-CERT] Error fetching levels:', error);
      res.status(500).json({ error: 'Failed to fetch certification levels' });
    }
  });

  app.get('/api/pcp-certification/my-status', isAuthenticated, async (req: Request, res: Response) => {
    try {
      console.log('[PCP-CERT] Getting user certification status');
      
      // Mock status for testing - in real app this would query the database
      const status = {
        currentLevel: 5,
        completedLevels: ['PCP-L5'],
        inProgress: null,
        availableLevels: []
      };
      
      console.log(`[PCP-CERT] Returning status for user ${req.user?.id} :`, status);
      
      res.json({
        success: true,
        data: status,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('[API][PCP-CERT] Error fetching user status:', error);
      res.status(500).json({ error: 'Failed to fetch certification status' });
    }
  });

  // Basic API info endpoints that return simple status messages
  const apiEndpoints = [
    { path: '/api/pcp', message: 'PCP Coaching Ecosystem API' },
    { path: '/api/coach-hub', message: 'Coach Hub API' },
    { path: '/api/session-booking', message: 'Session Booking API' },
    { path: '/api/training-centers', message: 'Training Centers API' },
    { path: '/api/qr', message: 'QR Code Scanning API' },
    { path: '/api/wise', message: 'WISE Payment Integration API' },
    { path: '/api/wise-diagnostic', message: 'WISE Diagnostic API' },
    { path: '/api/wise/business', message: 'WISE Business API' },
    { path: '/api/wise/status', message: 'WISE Status API' }
  ];

  apiEndpoints.forEach(endpoint => {
    app.get(endpoint.path, (req: Request, res: Response) => {
      res.json({
        message: endpoint.message,
        version: "1.0.0",
        status: "operational",
        timestamp: new Date().toISOString()
      });
    });
  });

  // Curriculum endpoint
  app.get('/api/curriculum', isAuthenticated, async (req: Request, res: Response) => {
    try {
      res.json({
        message: 'Curriculum Management API',
        success: true,
        data: {
          courses: [
            { id: 1, title: 'Beginner Fundamentals', lessons: 12 },
            { id: 2, title: 'Intermediate Strategy', lessons: 8 },
            { id: 3, title: 'Advanced Techniques', lessons: 15 }
          ]
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('[API][Curriculum] Error:', error);
      res.status(500).json({ error: 'Failed to fetch curriculum' });
    }
  });

  // Analytics endpoints
  app.get('/api/analytics/student-progress', isAuthenticated, async (req: Request, res: Response) => {
    try {
      res.json({
        message: 'Student Progress Analytics API',
        success: true,
        data: {
          totalStudents: 45,
          activeStudents: 32,
          avgProgress: 78,
          completionRate: 85
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('[API][Analytics] Error:', error);
      res.status(500).json({ error: 'Failed to fetch student progress' });
    }
  });

  app.get('/api/coach/business-metrics', isAuthenticated, async (req: Request, res: Response) => {
    try {
      res.json({
        message: 'Coach Business Metrics API',
        success: true,
        data: {
          totalSessions: 156,
          monthlyRevenue: 4680,
          avgRating: 4.8,
          studentRetention: 92
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('[API][Coach] Error:', error);
      res.status(500).json({ error: 'Failed to fetch business metrics' });
    }
  });

  app.get('/api/communication/status', isAuthenticated, async (req: Request, res: Response) => {
    try {
      res.json({
        message: 'Communication Status API',
        success: true,
        data: {
          emailEnabled: true,
          smsEnabled: true,
          pushEnabled: true,
          unreadMessages: 3
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('[API][Communication] Error:', error);
      res.status(500).json({ error: 'Failed to fetch communication status' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}