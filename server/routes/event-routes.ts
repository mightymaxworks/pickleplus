/**
 * Event routes for the application
 */
import express from 'express';
import { isAuthenticated } from '../middleware/auth';

/**
 * PicklePass upcoming event model
 */
interface UpcomingEvent {
  id: number;
  title: string;
  description: string;
  location: string;
  start_time: Date;
  end_time: Date;
  capacity: number;
  registered_count: number;
  image_url?: string;
  is_featured: boolean;
  registration_status: 'open' | 'closed' | 'waitlist';
}

// Sample upcoming events data
const upcomingEvents: UpcomingEvent[] = [
  {
    id: 1,
    title: "Spring Pickle Tournament",
    description: "Join us for our seasonal tournament with prizes and refreshments!",
    location: "Main Community Courts",
    start_time: new Date(Date.now() + 86400000 * 3), // 3 days from now
    end_time: new Date(Date.now() + 86400000 * 3 + 18000000), // 5 hours after start
    capacity: 32,
    registered_count: 24,
    image_url: "/assets/events/tournament1.jpg",
    is_featured: true,
    registration_status: 'open'
  },
  {
    id: 2,
    title: "Beginners Workshop",
    description: "Learn the basics of pickleball with our certified coaches",
    location: "Training Center",
    start_time: new Date(Date.now() + 86400000 * 7), // 7 days from now
    end_time: new Date(Date.now() + 86400000 * 7 + 7200000), // 2 hours after start
    capacity: 20,
    registered_count: 18,
    image_url: "/assets/events/workshop.jpg",
    is_featured: false,
    registration_status: 'waitlist'
  },
  {
    id: 3,
    title: "Mixed Doubles Night",
    description: "Fun doubles play with rotating partners",
    location: "Community Center Courts",
    start_time: new Date(Date.now() + 86400000 * 5), // 5 days from now
    end_time: new Date(Date.now() + 86400000 * 5 + 10800000), // 3 hours after start
    capacity: 24,
    registered_count: 16,
    image_url: "/assets/events/doubles.jpg",
    is_featured: false,
    registration_status: 'open'
  },
  {
    id: 4,
    title: "Pro Exhibition Match",
    description: "Watch top-ranked players showcase their skills",
    location: "Stadium Court",
    start_time: new Date(Date.now() + 86400000 * 14), // 14 days from now
    end_time: new Date(Date.now() + 86400000 * 14 + 7200000), // 2 hours after start
    capacity: 200,
    registered_count: 87,
    image_url: "/assets/events/exhibition.jpg",
    is_featured: true,
    registration_status: 'open'
  },
  {
    id: 5,
    title: "Community League Kickoff",
    description: "Season opener for our community league play",
    location: "Multiple Courts",
    start_time: new Date(Date.now() + 86400000 * 10), // 10 days from now
    end_time: new Date(Date.now() + 86400000 * 10 + 14400000), // 4 hours after start
    capacity: 48,
    registered_count: 32,
    image_url: "/assets/events/league.jpg",
    is_featured: false,
    registration_status: 'open'
  }
];

/**
 * Register event routes with the Express application
 * @param app Express application
 */
export function registerEventRoutes(app: express.Express): void {
  console.log("[API] Registering Event API routes");
  
  // Basic events route
  app.get('/api/events', isAuthenticated, (req, res) => {
    res.status(200).json({ message: 'Event data' });
  });

  /**
   * PKL-278651-PASS-0010-LOAD - Add missing API endpoint for upcoming events
   * GET /api/events/upcoming - Fetch upcoming events for PicklePass page
   */
  app.get('/api/events/upcoming', (req, res) => {
    try {
      // Get limit from query params or default to 5
      const limit = parseInt(req.query.limit as string) || 5;
      
      // Sort events by start time and limit results
      const events = [...upcomingEvents]
        .sort((a, b) => a.start_time.getTime() - b.start_time.getTime())
        .slice(0, limit);
      
      res.status(200).json({
        success: true,
        events
      });
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch upcoming events' 
      });
    }
  });
}