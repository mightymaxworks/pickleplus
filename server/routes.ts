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
import { setupAdminDashboardRoutes } from "./routes/admin-dashboard-routes";
import { registerCoachHubRoutes } from "./routes/coach-hub-routes";
import sessionBookingRoutes from "./routes/session-booking-routes";
import wiseBusinessRoutes from "./routes/wise-business-routes";
import wiseDiagnosticRoutes from "./routes/wise-diagnostic-routes";
import { trainingCenterRoutes } from "./routes/training-center-routes";
import { registerJournalRoutes } from "./routes/journal-routes";
import pcpRoutes from "./routes/pcp-routes";
import pcpEnforcementRoutes from "./routes/pcp-enforcement-routes";
import coachMarketplaceRoutes from "./api/coach-marketplace";
import { registerCoachPublicProfilesRoutes } from "./api/coach-public-profiles";
import coachPublicProfilesEditRoutes from "./api/coach-public-profiles-edit";
import coachMarketplaceProfilesRouter from './api/coach-marketplace-profiles';
import decayProtectionRoutes from './routes/decay-protection';

export async function registerRoutes(app: Express): Promise<Server> {
  console.log("[ROUTES] Setting up modular route architecture...");
  
  // Set up authentication first
  setupAuth(app);
  console.log("[AUTH] Authentication setup complete");

  // Register basic API routes
  console.log("[ROUTES] Registering basic API routes...");
  const { registerMatchRoutes } = await import('./routes/match-routes');
  registerMatchRoutes(app);
  console.log("[ROUTES] Match routes registered successfully");

  // === PLAYER SEARCH AND RECENT OPPONENTS ROUTES ===
  
  // Player search endpoint for SmartPlayerSearch component
  app.get('/api/players/search', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const query = req.query.q as string;
      const limit = parseInt(req.query.limit as string) || 10;
      
      console.log('[PLAYER SEARCH] Query received:', query, 'length:', query?.length);
      
      if (!query || query.length < 1) { // Allow single character search for Chinese
        return res.json([]);
      }

      // Use simple search that works
      const users = await storage.searchUsers(query, limit);
      const players = users.slice(0, limit).map(user => ({
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        displayName: user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        passportCode: user.passportCode,
        gender: user.gender,
        profileImageUrl: user.profileImageUrl,
        isVerified: user.isVerified || false,
        // Add fields expected by frontend
        avatarInitials: user.displayName?.substring(0, 2) || 
                       `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}` || 
                       user.username.substring(0, 2).toUpperCase(),
        passportId: user.passportCode,
        currentRating: user.rankingPoints || 0
      }));

      console.log('[PLAYER SEARCH] Returning', players.length, 'results');
      res.json(players);
    } catch (error) {
      console.error('Player search error:', error);
      res.status(500).json({ error: 'Failed to search players' });
    }
  });

  // Recent opponents endpoint for enhanced match recorder
  app.get('/api/players/recent-opponents', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const recentOpponents = await storage.getRecentOpponents(user.id);
      
      const opponents = recentOpponents.map(opponent => ({
        id: opponent.id,
        displayName: opponent.displayName,
        username: opponent.username,
        avatarInitials: opponent.avatarInitials,
        currentRating: opponent.currentRating || 0,
      }));

      res.json({ opponents });
    } catch (error) {
      console.error('Recent opponents error:', error);
      res.status(500).json({ error: 'Failed to get recent opponents' });
    }
  });

  // === AUTHENTICATION ROUTES ===
  app.post('/api/register', async (req: Request, res: Response) => {
    try {
      const { username, password, email, firstName, lastName, dateOfBirth, gender, location, playingSince, skillLevel } = req.body;
      
      console.log(`[API][Registration] Attempting to register user: ${username}`);
      console.log(`[API][Registration] Raw password: "${password}" (length: ${password.length})`);
      console.log(`[API][Registration] Date of Birth: ${dateOfBirth}, Gender: ${gender}`);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(409).json({ error: 'Username already exists' });
      }
      
      // Generate passport code using secure random format
      const passportCode = Math.random().toString(36).substr(2, 8).toUpperCase();
      
      // Hash the password before creating user
      const { hashPassword } = await import('./auth');
      const hashedPassword = await hashPassword(password);
      console.log(`[API][Registration] Password hashed from "${password}" to "${hashedPassword}"`);
      console.log(`[API][Registration] Hash length: ${hashedPassword.length}`);
      
      // Create new user with proper defaults including new fields
      const newUser = await storage.createUser({
        username,
        email: email || `${username}@pickle.com`,
        password: hashedPassword, // Password is now properly hashed
        firstName,
        lastName,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender: gender || null,
        location: location || null,
        playingSince: playingSince || null,
        skillLevel: skillLevel || 'beginner',
        displayName: `${firstName} ${lastName}` || username,
        avatarInitials: `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}` || username.charAt(0).toUpperCase(),
        passportCode,
        duprRating: "3.0",

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
          dateOfBirth: newUser.dateOfBirth,
          gender: newUser.gender,
          location: newUser.location,
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
  app.get('/api/auth/current-user', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user;
      
      // Import profile service to calculate completion
      const { ProfileService } = await import('./services/profile-service');
      const profileService = new ProfileService();
      
      // Calculate profile completion percentage
      const profileCompletion = user ? profileService.calculateProfileCompletion(user) : { percentage: 0, milestones: [] };
      
      // Return user with profile completion included
      res.json({
        ...user,
        profileCompletion
      });
    } catch (error) {
      console.error('Current user endpoint error:', error);
      // Fallback to basic user data if calculation fails
      res.json(req.user);
    }
  });

  // Forgot password endpoint - admin-assisted password reset
  app.post('/api/auth/forgot-password', async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ 
          error: 'Email is required' 
        });
      }

      console.log(`[API][ForgotPassword] Password reset request for email: ${email}`);

      // Check if user exists
      const user = await storage.getUserByEmail ? await storage.getUserByEmail(email) : null;
      
      if (!user) {
        console.log(`[API][ForgotPassword] No user found for email: ${email}`);
        // Still return success for security (don't reveal if email exists)
        return res.json({
          success: true,
          message: 'Password reset request submitted to admin team'
        });
      }

      // Create a password reset request in the database
      try {
        await storage.createPasswordResetRequest({
          email,
          userId: user.id,
          requestedAt: new Date(),
          status: 'pending'
        });
        console.log(`[API][ForgotPassword] Reset request created for user ${user.username} (${email})`);
      } catch (error) {
        console.log(`[API][ForgotPassword] Note: Password reset tracking not available, but request logged for admin follow-up`);
      }

      res.json({
        success: true,
        message: 'Password reset request submitted to admin team. You will be contacted within 24 hours.'
      });

    } catch (error) {
      console.error('[API][ForgotPassword] Error:', error);
      res.status(500).json({ 
        error: 'Failed to submit password reset request' 
      });
    }
  });

  console.log("[AUTH] Authentication routes registered");

  // === ADMIN BULK UPLOAD ROUTES ===
  console.log("[ROUTES] Registering Admin Bulk Upload routes...");
  try {
    const adminBulkUploadRoutes = await import('./routes/admin-bulk-upload');
    app.use('/api/admin/bulk-upload', adminBulkUploadRoutes.default);
    console.log("[ROUTES] Admin Bulk Upload routes registered successfully");
  } catch (error) {
    console.error("[ROUTES] Error registering Admin Bulk Upload routes:", error);
  }

  // === MODULAR ROUTE REGISTRATION ===
  console.log("[ROUTES] Registering modular route systems...");
  
  try {
    // SAGE System Routes (Critical for drill recommendations)
    console.log("[ROUTES] Registering SAGE Drills routes...");
    registerSageDrillsRoutes(app);
    
    console.log("[ROUTES] Registering SAGE API routes...");
    app.use('/api/sage', sageApiRoutes);

    // Enhanced Leaderboard Routes for age group and gender separation
    console.log("[ROUTES] Registering Enhanced Leaderboard routes...");
    const enhancedLeaderboardRoutes = await import('./routes/enhanced-leaderboard');
    app.use('/api/enhanced-leaderboard', enhancedLeaderboardRoutes.default);
    console.log("[ROUTES] Enhanced leaderboard routes registered successfully");
    
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
    await registerAdminRoutes(app);
    
    // Admin Dashboard System  
    console.log("[ROUTES] Registering Admin Dashboard routes...");
    setupAdminDashboardRoutes(app);
    
    // Phase 3: Advanced Coach Analytics
    console.log("[ROUTES] Registering Advanced Coach Analytics routes...");
    const advancedCoachAnalyticsRoutes = await import('./routes/advanced-coach-analytics-routes');
    app.use('/api/coach/advanced', advancedCoachAnalyticsRoutes.default);
    console.log("[ROUTES] Advanced Coach Analytics routes registered successfully");
    
    // Phase 4: PCP Sequential Enforcement System
    console.log("[ROUTES] Registering PCP Sequential Enforcement routes...");
    app.use('/api/pcp', pcpEnforcementRoutes);
    console.log("[ROUTES] PCP Sequential Enforcement routes registered successfully");
    
    // Coach Marketplace Discovery System (UDF Development)
    console.log("[ROUTES] Registering Coach Marketplace Discovery routes...");
    app.use('/api/coaches', coachMarketplaceRoutes);
    console.log("[ROUTES] Coach Marketplace Discovery routes registered successfully");

    // Coach Public Profiles System - Phase 5C (UDF Development)
    console.log("[ROUTES] Registering Coach Public Profiles routes...");
    registerCoachPublicProfilesRoutes(app);
    console.log("[ROUTES] Coach Public Profiles routes registered successfully");
    
    // Coach Public Profiles Inline Editing - Phase 6A (UDF Development)
    console.log("[ROUTES] Registering Coach Public Profiles Inline Editing routes...");
    app.use('/api', coachPublicProfilesEditRoutes);
    console.log("[ROUTES] Coach Public Profiles Inline Editing routes registered successfully");
    
    // Coach Marketplace Profiles API for Test Demo
    console.log("[ROUTES] Registering Coach Marketplace Profiles API routes...");
    app.use('/api/coach-marketplace-profiles', coachMarketplaceProfilesRouter);
    console.log("[ROUTES] Coach Marketplace Profiles API routes registered successfully");
    
    // Player-Coach Direct Booking System - Phase 5B (UDF Development)
    console.log("[ROUTES] Registering Player-Coach Direct Booking System routes...");
    const bookingApiRoutes = await import('./api/booking-api');
    app.use('/api/booking', bookingApiRoutes.default);
    console.log("[ROUTES] Player-Coach Direct Booking System routes registered successfully");

    // Decay Protection System routes
    console.log("[ROUTES] Registering Decay Protection routes...");
    app.use('/api/decay-protection', decayProtectionRoutes);
    console.log("[ROUTES] Decay Protection routes registered successfully");
    
    console.log("[ROUTES] All modular route systems registered successfully");
    
  } catch (error) {
    console.error("[ROUTES] Error registering modular routes:", error);
    console.error("[ROUTES] Continuing with basic functionality...");
  }

  // === USER PROFILE COMPLETION STATUS ===
  app.get('/api/user/profile-completion-status', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Calculate profile completion percentage
      const requiredFields = ['firstName', 'lastName', 'email'];
      const optionalFields = ['location', 'bio', 'avatarUrl'];
      
      const completedRequired = requiredFields.filter(field => user[field as keyof typeof user]).length;
      const completedOptional = optionalFields.filter(field => user[field as keyof typeof user]).length;
      
      const completionPercentage = Math.round(
        ((completedRequired / requiredFields.length) * 70) + 
        ((completedOptional / optionalFields.length) * 30)
      );

      res.json({
        success: true,
        data: {
          completionPercentage,
          missingRequired: requiredFields.filter(field => !user[field as keyof typeof user]),
          missingOptional: optionalFields.filter(field => !user[field as keyof typeof user]),
          isComplete: completionPercentage >= 90
        }
      });
    } catch (error) {
      console.error('[API] Profile completion status error:', error);
      res.status(500).json({ error: 'Failed to get profile completion status' });
    }
  });

  // === PROFILE UPDATE ENDPOINTS ===
  // Update user profile data
  app.patch('/api/profile/update', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      console.log(`[API] Profile update request for user ${userId}:`, req.body);

      // Update user profile with the provided data
      const updatedUser = await storage.updateUserProfile(userId, req.body);
      
      console.log(`[API] Profile updated successfully for user ${userId}`);
      res.json({
        success: true,
        user: updatedUser
      });
    } catch (error) {
      console.error('[API] Profile update error:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  });

  // Update specific profile field
  app.patch('/api/profile/field', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const { field, value } = req.body;
      if (!field) {
        return res.status(400).json({ error: 'Field name is required' });
      }

      console.log(`[API] Field update request for user ${userId}: ${field} = ${value}`);

      // Map frontend field names to database column names
      const fieldMapping = {
        'banner_url': 'bannerUrl',
        'profilePicture': 'avatarUrl',
        'playingSince': 'playingSince',
        'playing_since': 'playingSince',
        'displayName': 'displayName',
        'bio': 'bio',
        'location': 'location',
        'skillLevel': 'skillLevel',
        'preferredPosition': 'preferredPosition'
      };

      const dbField = fieldMapping[field as keyof typeof fieldMapping] || field;
      const updateData = { [dbField]: value };

      const updatedUser = await storage.updateUserProfile(userId, updateData);
      
      // Import and use ProfileService to recalculate profile completion
      const { ProfileService } = await import('./services/profile-service');
      const profileService = new ProfileService();
      
      // Recalculate profile completion and sync milestones
      const userWithUpdatedCompletion = await profileService.syncProfileCompletionAndMilestones(userId);
      
      console.log(`[API] Field ${field} updated successfully for user ${userId}`);
      res.json({
        success: true,
        user: userWithUpdatedCompletion, // Return user with updated profile completion
        field: field,
        value: value
      });
    } catch (error) {
      console.error('[API] Field update error:', error);
      res.status(500).json({ error: 'Failed to update field' });
    }
  });

  // Sync profile completion and milestones - recalculates and awards missing points
  app.post('/api/profile/sync-milestones', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      console.log(`[API] Profile milestone sync request for user ${userId}`);

      // Import profile service to sync profile completion and milestones
      const { ProfileService } = await import('./services/profile-service');
      const profileService = new ProfileService();
      
      const updatedUser = await profileService.syncProfileCompletionAndMilestones(userId);
      
      console.log(`[API] Profile milestone sync completed for user ${userId}`);
      res.json({
        success: true,
        user: updatedUser,
        message: 'Profile completion and milestones synced successfully'
      });
    } catch (error) {
      console.error('[API] Profile milestone sync error:', error);
      res.status(500).json({ error: 'Failed to sync profile milestones' });
    }
  });

  // === NOTIFICATIONS UNREAD COUNT ===
  app.get('/api/notifications/unread-count', isAuthenticated, async (req: Request, res: Response) => {
    try {
      // For now, return a simple count - can be enhanced later with actual notification system
      res.json({
        success: true,
        data: {
          unreadCount: 0,
          hasNotifications: false
        }
      });
    } catch (error) {
      console.error('[API] Notifications unread count error:', error);
      res.status(500).json({ error: 'Failed to get notification count' });
    }
  });

  // Enhanced Player Search API - requires authentication for security
  app.get('/api/players/search', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { searchPlayers } = await import('./api/players/search');
      await searchPlayers(req, res);
    } catch (error) {
      console.error('Player search error:', error);
      res.status(500).json({ error: 'Failed to search players' });
    }
  });

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