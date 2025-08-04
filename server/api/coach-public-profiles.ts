// Coach Public Profiles API - Enhanced public profile functionality
import type { Express, Request, Response } from "express";
import { storage } from "../storage";
import { isAuthenticated } from "../auth";

export function registerCoachPublicProfilesRoutes(app: Express) {
  console.log("[API] Registering Coach Public Profiles routes");

  // Get public profile by slug
  app.get('/api/coach-profiles/:slug', async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      
      const profile = await storage.getCoachPublicProfileBySlug(slug);
      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      // Don't show private profiles unless user is authenticated and is the owner
      if (!profile.isPublic) {
        if (!req.isAuthenticated()) {
          return res.status(404).json({ error: 'Profile not found' });
        }
        
        const currentUser = req.user as any;
        if (currentUser.id !== profile.userId) {
          return res.status(404).json({ error: 'Profile not found' });
        }
      }

      res.json(profile);
    } catch (error) {
      console.error('[API] Error fetching coach profile:', error);
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  });

  // Track profile analytics
  app.post('/api/coach-profiles/:slug/analytics', async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      const { eventType } = req.body;
      
      const profile = await storage.getCoachPublicProfileBySlug(slug);
      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      // Track the analytics event
      await storage.trackProfileAnalytics({
        profileId: profile.id,
        eventType,
        visitorId: req.session.id || 'anonymous',
        referrerUrl: req.get('Referrer') || null,
        userAgent: req.get('User-Agent') || null,
        ipAddress: req.ip || null
      });

      // Increment view count if it's a view event
      if (eventType === 'view') {
        await storage.incrementProfileViewCount(profile.id);
      }

      res.json({ success: true });
    } catch (error) {
      console.error('[API] Error tracking analytics:', error);
      res.status(500).json({ error: 'Failed to track analytics' });
    }
  });

  // Send contact message to coach
  app.post('/api/coach-profiles/:slug/contact', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      const { message } = req.body;
      const currentUser = req.user as any;
      
      const profile = await storage.getCoachPublicProfileBySlug(slug);
      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      // Send the contact message (implement email notification or internal messaging)
      await storage.sendCoachContactMessage({
        profileId: profile.id,
        fromUserId: currentUser.id,
        message,
        senderEmail: currentUser.email,
        senderName: `${currentUser.firstName} ${currentUser.lastName}`
      });

      // Track contact analytics
      await storage.trackProfileAnalytics({
        profileId: profile.id,
        eventType: 'contact_click',
        visitorId: req.session.id || currentUser.id.toString(),
        userAgent: req.get('User-Agent') || null,
        ipAddress: req.ip || null
      });

      res.json({ success: true });
    } catch (error) {
      console.error('[API] Error sending contact message:', error);
      res.status(500).json({ error: 'Failed to send message' });
    }
  });

  // Get coach's own profile for editing
  app.get('/api/my-coach-profile', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const currentUser = req.user as any;
      
      let profile = await storage.getCoachPublicProfileByUserId(currentUser.id);
      
      // Create default profile if none exists
      if (!profile) {
        const slug = `${currentUser.firstName}-${currentUser.lastName}`.toLowerCase()
          .replace(/[^a-z0-9-]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');

        profile = await storage.createCoachPublicProfile({
          userId: currentUser.id,
          slug: slug + '-' + Math.random().toString(36).substr(2, 6),
          displayName: `${currentUser.firstName} ${currentUser.lastName}`,
          isPublic: false // Private by default until they complete setup
        });
      }

      res.json(profile);
    } catch (error) {
      console.error('[API] Error fetching coach profile:', error);
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  });

  // Update coach profile
  app.put('/api/my-coach-profile', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const currentUser = req.user as any;
      const profileData = req.body;
      
      let profile = await storage.getCoachPublicProfileByUserId(currentUser.id);
      
      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      const updatedProfile = await storage.updateCoachPublicProfile(profile.id, profileData);
      res.json(updatedProfile);
    } catch (error) {
      console.error('[API] Error updating coach profile:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  });

  // Manage profile services
  app.get('/api/my-coach-profile/services', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const currentUser = req.user as any;
      const profile = await storage.getCoachPublicProfileByUserId(currentUser.id);
      
      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      const services = await storage.getCoachServices(profile.id);
      res.json(services);
    } catch (error) {
      console.error('[API] Error fetching services:', error);
      res.status(500).json({ error: 'Failed to fetch services' });
    }
  });

  app.post('/api/my-coach-profile/services', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const currentUser = req.user as any;
      const serviceData = req.body;
      
      const profile = await storage.getCoachPublicProfileByUserId(currentUser.id);
      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      const service = await storage.createCoachService({
        ...serviceData,
        profileId: profile.id
      });

      res.json(service);
    } catch (error) {
      console.error('[API] Error creating service:', error);
      res.status(500).json({ error: 'Failed to create service' });
    }
  });

  app.put('/api/my-coach-profile/services/:serviceId', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const currentUser = req.user as any;
      const { serviceId } = req.params;
      const serviceData = req.body;
      
      const profile = await storage.getCoachPublicProfileByUserId(currentUser.id);
      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      const service = await storage.updateCoachService(parseInt(serviceId), serviceData);
      res.json(service);
    } catch (error) {
      console.error('[API] Error updating service:', error);
      res.status(500).json({ error: 'Failed to update service' });
    }
  });

  app.delete('/api/my-coach-profile/services/:serviceId', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const currentUser = req.user as any;
      const { serviceId } = req.params;
      
      const profile = await storage.getCoachPublicProfileByUserId(currentUser.id);
      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      await storage.deleteCoachService(parseInt(serviceId));
      res.json({ success: true });
    } catch (error) {
      console.error('[API] Error deleting service:', error);
      res.status(500).json({ error: 'Failed to delete service' });
    }
  });

  // Profile analytics dashboard
  app.get('/api/my-coach-profile/analytics', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const currentUser = req.user as any;
      const profile = await storage.getCoachPublicProfileByUserId(currentUser.id);
      
      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      const analytics = await storage.getProfileAnalytics(profile.id);
      res.json(analytics);
    } catch (error) {
      console.error('[API] Error fetching analytics:', error);
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  });

  console.log("[API] Coach Public Profiles routes registered successfully");
}