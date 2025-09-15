/**
 * PKL-278651-FACILITY-MGMT-001 - Advanced Facility Management System
 * API routes for facility discovery and public booking
 */

import { Router } from "express";
import { z } from "zod";
import { storage } from "../storage";

const router = Router();

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Get all facilities with search and filtering
router.get("/", async (req, res) => {
  try {
    const querySchema = z.object({
      search: z.string().optional(),
      city: z.string().optional(),
      surface: z.string().optional(),
      lat: z.coerce.number().optional(),
      lng: z.coerce.number().optional(),
      limit: z.coerce.number().default(50)
    });

    const { search, city, surface, lat, lng, limit } = querySchema.parse(req.query);

    // Get all active training centers
    const facilities = await storage.getActiveTrainingCenters();
    
    let filteredFacilities = facilities.filter(facility => facility.isActive);

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredFacilities = filteredFacilities.filter(facility => 
        facility.name.toLowerCase().includes(searchLower) ||
        facility.address.toLowerCase().includes(searchLower) ||
        facility.city.toLowerCase().includes(searchLower)
      );
    }

    // Apply city filter
    if (city && city !== 'all') {
      filteredFacilities = filteredFacilities.filter(facility => 
        facility.city.toLowerCase() === city.toLowerCase()
      );
    }

    // Apply surface filter
    if (surface && surface !== 'all') {
      filteredFacilities = filteredFacilities.filter(facility => 
        facility.courtSurface?.toLowerCase() === surface.toLowerCase()
      );
    }

    // Calculate distances if user location provided
    if (lat && lng) {
      filteredFacilities = filteredFacilities.map(facility => ({
        ...facility,
        distance: facility.latitude && facility.longitude 
          ? calculateDistance(lat, lng, parseFloat(facility.latitude), parseFloat(facility.longitude))
          : undefined
      }));
    }

    // Get additional facility stats
    const facilitiesWithStats = await Promise.all(
      filteredFacilities.map(async facility => {
        // Get facility stats (bookings, ratings, etc.)
        const stats = await storage.getFacilityStats(facility.id);
        const nextSlot = await storage.getNextAvailableSlot(facility.id);
        
        return {
          ...facility,
          rating: stats?.rating || undefined,
          reviewsCount: stats?.reviewsCount || 0,
          totalBookings: stats?.totalBookings || 0,
          nextAvailableSlot: nextSlot
        };
      })
    );

    res.json(facilitiesWithStats.slice(0, limit));

  } catch (error) {
    console.error("Facility discovery error:", error);
    res.status(500).json({ error: "Failed to fetch facilities" });
  }
});

// Get facility details by ID
router.get("/:id", async (req, res) => {
  try {
    const facilityId = parseInt(req.params.id);
    
    const facility = await storage.getTrainingCenterById(facilityId);
    if (!facility) {
      return res.status(404).json({ error: "Facility not found" });
    }

    // Get facility stats and additional details
    const stats = await storage.getFacilityStats(facilityId);
    const coaches = await storage.getAvailableCoachesAtCenter(facilityId);
    const upcomingClasses = await storage.getUpcomingClassesAtCenter(facilityId);
    
    res.json({
      ...facility,
      rating: stats?.rating || undefined,
      reviewsCount: stats?.reviewsCount || 0,
      totalBookings: stats?.totalBookings || 0,
      coaches: coaches.map(coach => ({
        id: coach.id,
        name: coach.displayName || coach.username,
        specializations: coach.specializations || [],
        rating: coach.rating || undefined,
        reviewsCount: coach.reviewsCount || 0
      })),
      upcomingClasses: upcomingClasses || []
    });

  } catch (error) {
    console.error("Facility details error:", error);
    res.status(500).json({ error: "Failed to fetch facility details" });
  }
});

// Get available time slots for a facility
router.get("/:id/availability", async (req, res) => {
  try {
    const facilityId = parseInt(req.params.id);
    const { date = new Date().toISOString().split('T')[0] } = req.query;
    
    const facility = await storage.getTrainingCenterById(facilityId);
    if (!facility) {
      return res.status(404).json({ error: "Facility not found" });
    }

    // Get available time slots for the specified date
    const availability = await storage.getFacilityAvailability(facilityId, date as string);
    
    res.json({
      facilityId,
      date,
      operatingHours: facility.operatingHours,
      availability: availability || []
    });

  } catch (error) {
    console.error("Facility availability error:", error);
    res.status(500).json({ error: "Failed to fetch availability" });
  }
});

export default router;