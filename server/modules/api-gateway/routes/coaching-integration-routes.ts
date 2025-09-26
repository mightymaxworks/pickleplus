/**
 * PKL-278651-API-0002-COACHING
 * Coaching Integration Routes
 * 
 * Comprehensive coaching APIs for external apps to access Pickle+'s coaching ecosystem.
 * External apps can discover coaches, book sessions, manage relationships, and access content.
 */

import { Router, Request, Response } from 'express';
import { apiKeyAuth } from '../middleware/api-key-auth';
import { algorithmProtection } from '../middleware/algorithm-protection';
import { triggerWeChatWebhook, triggerUserWebhook } from '../utils/webhook-delivery';
import { storage } from '../../../storage';
import { db } from '../../../db';
import { eq, and, or, like, desc, asc, gte, lte } from 'drizzle-orm';
import { users } from '../../../../shared/schema';
import { coachMarketplaceProfiles } from '../../../../shared/schema/coach-marketplace';
import { coachProfiles } from '../../../../shared/schema/coach-management';
import { bookingSlots, bookings } from '../../../../shared/schema/session-booking';

const router = Router();

// Apply authentication and protection
router.use(apiKeyAuth());
router.use(algorithmProtection({
  enableSuspiciousPatternDetection: true,
  enableDataObfuscation: false, // Coaching data is public-facing
  enableUsageAuditing: true,
  maxBulkRequestSize: 50 // Reasonable limit for coaching queries
}));

/**
 * Coach Discovery Endpoint
 * External apps can search and filter coaches based on various criteria
 */
router.get('/coaching/discover', async (req: Request, res: Response) => {
  try {
    const apiKey = (req as any).apiKey;
    if (!apiKey?.scopes.includes('coaching:read')) {
      return res.status(403).json({
        error: 'insufficient_scope',
        error_description: 'Coach discovery requires coaching:read scope'
      });
    }

    console.log('[COACHING API] Coach discovery request received');

    // Parse query parameters
    const {
      location,
      radius = 25,
      specialties,
      price_min,
      price_max,
      rating_min = 0,
      skill_levels,
      availability_days,
      session_types,
      pcp_level,
      limit = 20,
      offset = 0,
      sort_by = 'rating'
    } = req.query;

    // Build query conditions
    let queryConditions = [
      eq(coachMarketplaceProfiles.isDiscoverable, true)
    ];

    // Location filtering
    if (location) {
      queryConditions.push(
        like(coachMarketplaceProfiles.location, `%${location}%`)
      );
    }

    // Price filtering
    if (price_min || price_max) {
      if (price_min && price_max) {
        queryConditions.push(
          and(
            gte(coachMarketplaceProfiles.hourlyRate, Number(price_min)),
            lte(coachMarketplaceProfiles.hourlyRate, Number(price_max))
          )
        );
      } else if (price_min) {
        queryConditions.push(
          gte(coachMarketplaceProfiles.hourlyRate, Number(price_min))
        );
      } else if (price_max) {
        queryConditions.push(
          lte(coachMarketplaceProfiles.hourlyRate, Number(price_max))
        );
      }
    }

    // Rating filtering
    if (rating_min) {
      queryConditions.push(
        gte(coachMarketplaceProfiles.averageRating, Number(rating_min))
      );
    }

    // Perform coach search
    let sortOrder;
    switch (sort_by) {
      case 'price_low':
        sortOrder = asc(coachMarketplaceProfiles.hourlyRate);
        break;
      case 'price_high':
        sortOrder = desc(coachMarketplaceProfiles.hourlyRate);
        break;
      case 'rating':
        sortOrder = desc(coachMarketplaceProfiles.averageRating);
        break;
      case 'sessions':
        sortOrder = desc(coachMarketplaceProfiles.totalSessions);
        break;
      default:
        sortOrder = desc(coachMarketplaceProfiles.searchRank);
    }

    const coaches = await db
      .select({
        coach_id: coachMarketplaceProfiles.coachId,
        user_id: coachMarketplaceProfiles.userId,
        display_name: coachMarketplaceProfiles.displayName,
        tagline: coachMarketplaceProfiles.tagline,
        specialties: coachMarketplaceProfiles.specialties,
        location: coachMarketplaceProfiles.location,
        hourly_rate: coachMarketplaceProfiles.hourlyRate,
        package_rates: coachMarketplaceProfiles.packageRates,
        average_rating: coachMarketplaceProfiles.averageRating,
        total_reviews: coachMarketplaceProfiles.totalReviews,
        total_sessions: coachMarketplaceProfiles.totalSessions,
        teaching_style: coachMarketplaceProfiles.teachingStyle,
        response_time: coachMarketplaceProfiles.responseTime,
        is_premium_listed: coachMarketplaceProfiles.isPremiumListed
      })
      .from(coachMarketplaceProfiles)
      .where(and(...queryConditions))
      .orderBy(sortOrder)
      .limit(Number(limit))
      .offset(Number(offset));

    // Get coach profiles for PCP level information
    const coachIds = coaches.map(c => c.coach_id);
    const coachProfilesData = await db
      .select({
        coach_id: coachProfiles.id,
        pcp_level: coachProfiles.pcpLevel,
        verification_level: coachProfiles.verificationLevel,
        pcp_certification_number: coachProfiles.pcpCertificationNumber
      })
      .from(coachProfiles)
      .where(coachProfiles.id.in(coachIds));

    // Combine data
    const enrichedCoaches = coaches.map(coach => {
      const profile = coachProfilesData.find(p => p.coach_id === coach.coach_id);
      
      return {
        coach_id: coach.coach_id,
        display_name: coach.display_name,
        tagline: coach.tagline,
        specialties: coach.specialties || [],
        location: coach.location,
        pricing: {
          hourly_rate: Number(coach.hourly_rate),
          package_rates: coach.package_rates || []
        },
        ratings: {
          average_rating: Number(coach.average_rating),
          total_reviews: coach.total_reviews,
          total_sessions: coach.total_sessions
        },
        credentials: {
          pcp_level: profile?.pcp_level || null,
          verification_level: profile?.verification_level,
          certification_number: profile?.pcp_certification_number
        },
        teaching_profile: {
          teaching_style: coach.teaching_style,
          response_time_hours: coach.response_time
        },
        features: {
          is_premium_listed: coach.is_premium_listed,
          instant_booking: coach.response_time <= 2
        }
      };
    });

    const discoveryResponse = {
      api_version: 'v1',
      data: {
        coaches: enrichedCoaches,
        search_metadata: {
          total_results: enrichedCoaches.length,
          search_parameters: {
            location,
            radius: Number(radius),
            price_range: { min: price_min, max: price_max },
            rating_min: Number(rating_min),
            sort_by
          },
          pagination: {
            limit: Number(limit),
            offset: Number(offset),
            has_more: enrichedCoaches.length === Number(limit)
          }
        },
        discovery_features: {
          ai_matching: true,
          instant_booking: true,
          verified_credentials: true,
          session_packages: true
        }
      }
    };

    // Log search for analytics
    console.log(`[COACHING API] Coach discovery: ${enrichedCoaches.length} coaches found`);

    res.json(discoveryResponse);

  } catch (error) {
    console.error('[COACHING API] Error in coach discovery:', error);
    res.status(500).json({
      error: 'discovery_error',
      error_description: 'Error discovering coaches'
    });
  }
});

/**
 * Coach Profile Details Endpoint
 * Get detailed information about a specific coach
 */
router.get('/coaching/coach/:coachId', async (req: Request, res: Response) => {
  try {
    const apiKey = (req as any).apiKey;
    if (!apiKey?.scopes.includes('coaching:read')) {
      return res.status(403).json({
        error: 'insufficient_scope',
        error_description: 'Coach profile access requires coaching:read scope'
      });
    }

    const { coachId } = req.params;
    console.log(`[COACHING API] Coach profile request for coach: ${coachId}`);

    // Get comprehensive coach data
    const coachMarketplace = await db
      .select()
      .from(coachMarketplaceProfiles)
      .where(eq(coachMarketplaceProfiles.coachId, Number(coachId)))
      .limit(1);

    if (coachMarketplace.length === 0) {
      return res.status(404).json({
        error: 'coach_not_found',
        error_description: 'Coach not found in marketplace'
      });
    }

    const coach = coachMarketplace[0];

    // Get coach profile data
    const coachProfile = await db
      .select()
      .from(coachProfiles)
      .where(eq(coachProfiles.id, Number(coachId)))
      .limit(1);

    // Get user data
    const userData = await db
      .select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        profileImageUrl: users.profileImageUrl
      })
      .from(users)
      .where(eq(users.id, coach.userId))
      .limit(1);

    const profile = coachProfile[0];
    const user = userData[0];

    const detailedProfile = {
      api_version: 'v1',
      data: {
        coach_id: coach.coachId,
        user_id: coach.userId,
        basic_info: {
          display_name: coach.displayName,
          username: user?.username,
          tagline: coach.tagline,
          profile_image: user?.profileImageUrl,
          location: coach.location,
          service_radius: coach.radius
        },
        credentials: {
          pcp_level: profile?.pcpLevel || null,
          pcp_certification_number: profile?.pcpCertificationNumber,
          verification_level: profile?.verificationLevel,
          certified_since: profile?.pcpCertifiedAt,
          specializations: profile?.specializations || []
        },
        teaching: {
          teaching_style: coach.teachingStyle,
          coaching_philosophy: profile?.coachingPhilosophy,
          player_preferences: coach.playerPreferences,
          specialties: coach.specialties || [],
          languages_spoken: profile?.languagesSpoken || ['English']
        },
        pricing: {
          hourly_rate: Number(coach.hourlyRate),
          package_rates: coach.packageRates || [],
          session_types: profile?.sessionTypes || []
        },
        availability: {
          time_slots: coach.availableTimeSlots || [],
          response_time_hours: coach.responseTime,
          booking_rate: Number(coach.bookingRate)
        },
        performance: {
          average_rating: Number(coach.averageRating),
          total_reviews: coach.totalReviews,
          total_sessions: coach.totalSessions,
          retention_rate: Number(coach.retentionRate),
          profile_views: coach.profileViews
        },
        features: {
          is_discoverable: coach.isDiscoverable,
          is_premium_listed: coach.isPremiumListed,
          instant_booking: coach.responseTime <= 2,
          verified_coach: profile?.verificationLevel === 'verified'
        }
      }
    };

    // Increment profile views
    await db
      .update(coachMarketplaceProfiles)
      .set({ 
        profileViews: coach.profileViews + 1,
        updatedAt: new Date()
      })
      .where(eq(coachMarketplaceProfiles.coachId, Number(coachId)));

    res.json(detailedProfile);

  } catch (error) {
    console.error('[COACHING API] Error getting coach profile:', error);
    res.status(500).json({
      error: 'profile_error',
      error_description: 'Error retrieving coach profile'
    });
  }
});

/**
 * Coach Availability Endpoint
 * Get real-time availability for booking sessions
 */
router.get('/coaching/coach/:coachId/availability', async (req: Request, res: Response) => {
  try {
    const apiKey = (req as any).apiKey;
    if (!apiKey?.scopes.includes('coaching:read')) {
      return res.status(403).json({
        error: 'insufficient_scope',
        error_description: 'Coach availability requires coaching:read scope'
      });
    }

    const { coachId } = req.params;
    const { 
      start_date,
      end_date,
      session_type = 'individual'
    } = req.query;

    console.log(`[COACHING API] Availability request for coach: ${coachId}`);

    // Get available booking slots
    const availableSlots = await db
      .select({
        slot_id: bookingSlots.id,
        session_date: bookingSlots.sessionDate,
        start_time: bookingSlots.startTime,
        end_time: bookingSlots.endTime,
        session_type: bookingSlots.sessionType,
        max_students: bookingSlots.maxStudents,
        current_bookings: bookingSlots.currentBookings,
        price_per_student: bookingSlots.pricePerStudent,
        location: bookingSlots.location,
        court_number: bookingSlots.courtNumber,
        skill_level: bookingSlots.skillLevel,
        focus: bookingSlots.focus,
        status: bookingSlots.status
      })
      .from(bookingSlots)
      .where(
        and(
          eq(bookingSlots.coachId, Number(coachId)),
          eq(bookingSlots.isAvailable, true),
          eq(bookingSlots.status, 'available'),
          session_type ? eq(bookingSlots.sessionType, session_type as string) : undefined,
          start_date ? gte(bookingSlots.sessionDate, new Date(start_date as string)) : undefined,
          end_date ? lte(bookingSlots.sessionDate, new Date(end_date as string)) : undefined
        )
      )
      .orderBy(asc(bookingSlots.startTime));

    // Format availability data
    const formattedSlots = availableSlots.map(slot => ({
      slot_id: slot.slot_id,
      session_details: {
        date: slot.session_date.toISOString().split('T')[0],
        start_time: slot.start_time.toISOString(),
        end_time: slot.end_time.toISOString(),
        duration_minutes: Math.round((slot.end_time.getTime() - slot.start_time.getTime()) / (1000 * 60))
      },
      session_info: {
        type: slot.session_type,
        skill_level: slot.skill_level,
        focus: slot.focus,
        location: slot.location,
        court_number: slot.court_number
      },
      capacity: {
        max_students: slot.max_students,
        current_bookings: slot.current_bookings,
        spots_available: slot.max_students - slot.current_bookings
      },
      pricing: {
        price_per_student: Number(slot.price_per_student),
        total_session_cost: Number(slot.price_per_student) * (slot.max_students - slot.current_bookings)
      },
      booking_status: {
        is_available: slot.current_bookings < slot.max_students,
        urgency: slot.current_bookings === slot.max_students - 1 ? 'last_spot' : 'available'
      }
    }));

    const availabilityResponse = {
      api_version: 'v1',
      data: {
        coach_id: Number(coachId),
        availability_period: {
          start_date: start_date || new Date().toISOString().split('T')[0],
          end_date: end_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        },
        available_slots: formattedSlots,
        summary: {
          total_slots: formattedSlots.length,
          session_types: [...new Set(formattedSlots.map(s => s.session_info.type))],
          price_range: {
            min: Math.min(...formattedSlots.map(s => s.pricing.price_per_student)),
            max: Math.max(...formattedSlots.map(s => s.pricing.price_per_student))
          },
          earliest_available: formattedSlots[0]?.session_details.start_time,
          booking_options: {
            instant_booking: true,
            advance_booking_days: 30,
            cancellation_policy: '24_hours'
          }
        }
      }
    };

    res.json(availabilityResponse);

  } catch (error) {
    console.error('[COACHING API] Error getting coach availability:', error);
    res.status(500).json({
      error: 'availability_error',
      error_description: 'Error retrieving coach availability'
    });
  }
});

/**
 * Session Booking Endpoint
 * Book a coaching session with a specific coach
 */
router.post('/coaching/book-session', async (req: Request, res: Response) => {
  try {
    const apiKey = (req as any).apiKey;
    if (!apiKey?.scopes.includes('coaching:write')) {
      return res.status(403).json({
        error: 'insufficient_scope',
        error_description: 'Session booking requires coaching:write scope'
      });
    }

    const {
      slot_id,
      student_info,
      wechat_user_id,
      payment_method,
      special_requests
    } = req.body;

    if (!slot_id || !student_info || !wechat_user_id) {
      return res.status(400).json({
        error: 'invalid_request',
        error_description: 'Required fields: slot_id, student_info, wechat_user_id'
      });
    }

    console.log(`[COACHING API] Session booking request for slot: ${slot_id}`);

    // Get slot details
    const slot = await db
      .select()
      .from(bookingSlots)
      .where(eq(bookingSlots.id, Number(slot_id)))
      .limit(1);

    if (slot.length === 0) {
      return res.status(404).json({
        error: 'slot_not_found',
        error_description: 'Booking slot not found'
      });
    }

    const bookingSlot = slot[0];

    // Check availability
    if (!bookingSlot.isAvailable || bookingSlot.currentBookings >= bookingSlot.maxStudents) {
      return res.status(409).json({
        error: 'slot_unavailable',
        error_description: 'Booking slot is no longer available'
      });
    }

    // Find or create student user
    let studentUser;
    try {
      // Try to find existing WeChat user
      const wechatEmail = `wechat_${wechat_user_id}@pickle.app`;
      studentUser = await storage.getUserByEmail(wechatEmail);
      
      if (!studentUser) {
        return res.status(404).json({
          error: 'student_not_found',
          error_description: 'Student not found. Please register first via /wechat/register'
        });
      }
    } catch (error) {
      return res.status(500).json({
        error: 'student_lookup_error',
        error_description: 'Error finding student account'
      });
    }

    // Create booking record
    const newBooking = await db.insert(bookings).values({
      slotId: Number(slot_id),
      studentId: studentUser.id,
      coachId: bookingSlot.coachId,
      sessionDate: bookingSlot.sessionDate,
      amountPaid: bookingSlot.pricePerStudent,
      paymentStatus: 'pending',
      paymentMethod: payment_method || 'wechat_pay',
      status: 'confirmed',
      skillLevel: student_info.skill_level,
      goals: student_info.goals,
      medicalNotes: student_info.medical_notes,
      emergencyContact: student_info.emergency_contact
    }).returning();

    // Update slot capacity
    await db
      .update(bookingSlots)
      .set({
        currentBookings: bookingSlot.currentBookings + 1,
        isAvailable: (bookingSlot.currentBookings + 1) < bookingSlot.maxStudents,
        updatedAt: new Date()
      })
      .where(eq(bookingSlots.id, Number(slot_id)));

    // Trigger webhooks for session booking
    await triggerWeChatWebhook('session_booked', {
      booking_id: newBooking[0].id,
      student_user_id: studentUser.id,
      coach_id: bookingSlot.coachId,
      session_date: bookingSlot.sessionDate.toISOString(),
      amount_paid: Number(bookingSlot.pricePerStudent),
      booking_status: 'confirmed'
    });

    const bookingResponse = {
      api_version: 'v1',
      data: {
        booking_id: newBooking[0].id,
        status: 'confirmed',
        session_details: {
          date: bookingSlot.sessionDate.toISOString().split('T')[0],
          start_time: bookingSlot.startTime.toISOString(),
          end_time: bookingSlot.endTime.toISOString(),
          location: bookingSlot.location,
          court_number: bookingSlot.courtNumber
        },
        coach_info: {
          coach_id: bookingSlot.coachId,
          session_type: bookingSlot.sessionType,
          focus: bookingSlot.focus
        },
        payment_info: {
          amount_paid: Number(bookingSlot.pricePerStudent),
          payment_status: 'pending',
          payment_method: payment_method || 'wechat_pay'
        },
        booking_confirmation: {
          confirmation_code: `PKL-${newBooking[0].id.toString().padStart(6, '0')}`,
          booking_time: new Date().toISOString(),
          cancellation_deadline: new Date(bookingSlot.sessionDate.getTime() - 24 * 60 * 60 * 1000).toISOString()
        }
      }
    };

    res.json(bookingResponse);

  } catch (error) {
    console.error('[COACHING API] Error booking session:', error);
    res.status(500).json({
      error: 'booking_error',
      error_description: 'Error booking coaching session'
    });
  }
});

/**
 * Coach Verification Endpoint
 * Verify coach credentials and PCP certification
 */
router.get('/coaching/verify/:coachId', async (req: Request, res: Response) => {
  try {
    const apiKey = (req as any).apiKey;
    if (!apiKey?.scopes.includes('coaching:read')) {
      return res.status(403).json({
        error: 'insufficient_scope',
        error_description: 'Coach verification requires coaching:read scope'
      });
    }

    const { coachId } = req.params;
    console.log(`[COACHING API] Coach verification request for: ${coachId}`);

    // Get coach profile with credentials
    const coachProfile = await db
      .select({
        id: coachProfiles.id,
        userId: coachProfiles.userId,
        coachType: coachProfiles.coachType,
        verificationLevel: coachProfiles.verificationLevel,
        isActive: coachProfiles.isActive,
        pcpLevel: coachProfiles.pcpLevel,
        completedLevels: coachProfiles.completedLevels,
        pcpCertificationNumber: coachProfiles.pcpCertificationNumber,
        pcpCertifiedAt: coachProfiles.pcpCertifiedAt,
        pcpExpiresAt: coachProfiles.pcpExpiresAt,
        totalSessions: coachProfiles.totalSessions,
        averageRating: coachProfiles.averageRating,
        totalReviews: coachProfiles.totalReviews,
        subscriptionTier: coachProfiles.subscriptionTier,
        subscriptionExpiresAt: coachProfiles.subscriptionExpiresAt
      })
      .from(coachProfiles)
      .where(eq(coachProfiles.id, Number(coachId)))
      .limit(1);

    if (coachProfile.length === 0) {
      return res.status(404).json({
        error: 'coach_not_found',
        error_description: 'Coach profile not found'
      });
    }

    const coach = coachProfile[0];

    // Determine verification status
    const now = new Date();
    const isPCPExpired = coach.pcpExpiresAt && coach.pcpExpiresAt < now;
    const isSubscriptionActive = coach.subscriptionExpiresAt && coach.subscriptionExpiresAt > now;

    const verificationResponse = {
      api_version: 'v1',
      data: {
        coach_id: coach.id,
        verification_status: {
          is_verified: coach.verificationLevel === 'verified' && coach.isActive,
          verification_level: coach.verificationLevel,
          is_active: coach.isActive,
          coach_type: coach.coachType
        },
        pcp_certification: {
          is_pcp_certified: !!coach.pcpLevel && !isPCPExpired,
          pcp_level: coach.pcpLevel,
          certification_number: coach.pcpCertificationNumber,
          certified_since: coach.pcpCertifiedAt?.toISOString(),
          expires_at: coach.pcpExpiresAt?.toISOString(),
          is_expired: isPCPExpired,
          completed_levels: coach.completedLevels || []
        },
        subscription_status: {
          tier: coach.subscriptionTier,
          is_active: isSubscriptionActive,
          expires_at: coach.subscriptionExpiresAt?.toISOString()
        },
        performance_metrics: {
          total_sessions: coach.totalSessions,
          average_rating: Number(coach.averageRating) / 10, // Convert to 0-10 scale
          total_reviews: coach.totalReviews,
          experience_level: coach.totalSessions > 100 ? 'experienced' : 
                           coach.totalSessions > 25 ? 'established' : 'new'
        },
        trust_indicators: {
          background_checked: coach.verificationLevel === 'verified',
          certification_verified: !!coach.pcpCertificationNumber,
          performance_rating: Number(coach.averageRating) > 80 ? 'excellent' :
                             Number(coach.averageRating) > 60 ? 'good' : 'developing',
          platform_experience: coach.totalSessions > 50
        }
      }
    };

    res.json(verificationResponse);

  } catch (error) {
    console.error('[COACHING API] Error verifying coach:', error);
    res.status(500).json({
      error: 'verification_error',
      error_description: 'Error verifying coach credentials'
    });
  }
});

/**
 * Student-Coach Relationship Endpoint
 * Manage connections between students and coaches
 */
router.post('/coaching/connect', async (req: Request, res: Response) => {
  try {
    const apiKey = (req as any).apiKey;
    if (!apiKey?.scopes.includes('coaching:write')) {
      return res.status(403).json({
        error: 'insufficient_scope',
        error_description: 'Coach connections require coaching:write scope'
      });
    }

    const {
      student_wechat_id,
      coach_id,
      connection_type = 'session_based',
      message
    } = req.body;

    if (!student_wechat_id || !coach_id) {
      return res.status(400).json({
        error: 'invalid_request',
        error_description: 'Required fields: student_wechat_id, coach_id'
      });
    }

    console.log(`[COACHING API] Connection request: student ${student_wechat_id} -> coach ${coach_id}`);

    // Find student user
    const wechatEmail = `wechat_${student_wechat_id}@pickle.app`;
    const studentUser = await storage.getUserByEmail(wechatEmail);
    
    if (!studentUser) {
      return res.status(404).json({
        error: 'student_not_found',
        error_description: 'Student not found. Please register first'
      });
    }

    // Check if coach exists
    const coachProfile = await db
      .select()
      .from(coachProfiles)
      .where(eq(coachProfiles.id, Number(coach_id)))
      .limit(1);

    if (coachProfile.length === 0) {
      return res.status(404).json({
        error: 'coach_not_found',
        error_description: 'Coach not found'
      });
    }

    // For now, we'll create a simple connection record
    // This would integrate with the existing student-coach connections schema
    const connectionResponse = {
      api_version: 'v1',
      data: {
        connection_id: `conn_${Date.now()}`,
        student_id: studentUser.id,
        coach_id: Number(coach_id),
        connection_type,
        status: 'pending',
        created_at: new Date().toISOString(),
        connection_features: {
          progress_tracking: true,
          goal_setting: true,
          session_history: true,
          direct_messaging: connection_type === 'ongoing'
        },
        next_steps: {
          student_action: 'Wait for coach approval',
          coach_notification: 'sent',
          estimated_response_time: '24 hours'
        }
      }
    };

    // Trigger webhook for connection request
    await triggerWeChatWebhook('coach_connection_requested', {
      student_user_id: studentUser.id,
      coach_id: Number(coach_id),
      connection_type,
      request_message: message
    });

    res.json(connectionResponse);

  } catch (error) {
    console.error('[COACHING API] Error creating coach connection:', error);
    res.status(500).json({
      error: 'connection_error',
      error_description: 'Error creating coach connection'
    });
  }
});

export { router as coachingIntegrationRoutes };