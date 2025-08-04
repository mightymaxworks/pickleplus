// Coach Marketplace Discovery API Routes
// UDF Development: Coach Marketplace Discovery System
// Dependencies: Coach profiles, PCP certification system, Session booking

import { Router } from 'express';
import { db } from '../db';
import { 
  coachMarketplaceProfiles, 
  coachSearchHistory, 
  coachMarketplaceReviews,
  coachDiscoveryAnalytics,
  coachFavoriteLists,
  coachSearchSchema,
  type CoachSearchParams,
  type CoachWithMarketplaceData
} from '../../shared/schema/coach-marketplace';
import { coachProfiles } from '../../shared/schema/coach-management';
import { users } from '../../shared/schema';
import { eq, and, like, gte, lte, inArray, sql, desc, asc } from 'drizzle-orm';
import { z } from 'zod';

const router = Router();

// AI-powered coach search and discovery
router.post('/search', async (req, res) => {
  try {
    const searchParams = coachSearchSchema.parse(req.body);
    const { 
      query, 
      location, 
      radius, 
      specialties, 
      priceRange, 
      availability, 
      rating,
      sortBy,
      limit,
      offset 
    } = searchParams;

    // Build dynamic search query
    let searchQuery = db
      .select({
        id: coachMarketplaceProfiles.id,
        coachId: coachMarketplaceProfiles.coachId,
        userId: coachMarketplaceProfiles.userId,
        displayName: coachMarketplaceProfiles.displayName,
        tagline: coachMarketplaceProfiles.tagline,
        specialties: coachMarketplaceProfiles.specialties,
        location: coachMarketplaceProfiles.location,
        hourlyRate: coachMarketplaceProfiles.hourlyRate,
        averageRating: coachMarketplaceProfiles.averageRating,
        totalReviews: coachMarketplaceProfiles.totalReviews,
        totalSessions: coachMarketplaceProfiles.totalSessions,
        responseTime: coachMarketplaceProfiles.responseTime,
        teachingStyle: coachMarketplaceProfiles.teachingStyle,
        isPremiumListed: coachMarketplaceProfiles.isPremiumListed
      })
      .from(coachMarketplaceProfiles)
      .where(eq(coachMarketplaceProfiles.isDiscoverable, true));

    // Apply filters
    const conditions = [eq(coachMarketplaceProfiles.isDiscoverable, true)];

    if (query) {
      conditions.push(
        sql`(${coachMarketplaceProfiles.displayName} ILIKE ${`%${query}%`} OR 
            ${coachMarketplaceProfiles.tagline} ILIKE ${`%${query}%`} OR
            ${coachMarketplaceProfiles.seoKeywords} ILIKE ${`%${query}%`})`
      );
    }

    if (location) {
      conditions.push(like(coachMarketplaceProfiles.location, `%${location}%`));
    }

    if (specialties.length > 0) {
      conditions.push(
        sql`${coachMarketplaceProfiles.specialties} && ${JSON.stringify(specialties)}`
      );
    }

    if (priceRange) {
      if (priceRange.min) {
        conditions.push(gte(coachMarketplaceProfiles.hourlyRate, priceRange.min.toString()));
      }
      if (priceRange.max) {
        conditions.push(lte(coachMarketplaceProfiles.hourlyRate, priceRange.max.toString()));
      }
    }

    if (rating) {
      conditions.push(gte(coachMarketplaceProfiles.averageRating, rating.toString()));
    }

    // Apply all conditions
    if (conditions.length > 1) {
      searchQuery = searchQuery.where(and(...conditions));
    }

    // Apply sorting
    switch (sortBy) {
      case 'rating':
        searchQuery = searchQuery.orderBy(desc(coachMarketplaceProfiles.averageRating));
        break;
      case 'price':
        searchQuery = searchQuery.orderBy(asc(coachMarketplaceProfiles.hourlyRate));
        break;
      case 'popularity':
        searchQuery = searchQuery.orderBy(desc(coachMarketplaceProfiles.totalSessions));
        break;
      case 'distance':
        // For now, order by location alphabetically - would need lat/lng for real distance
        searchQuery = searchQuery.orderBy(asc(coachMarketplaceProfiles.location));
        break;
      default: // relevance
        searchQuery = searchQuery.orderBy(
          desc(coachMarketplaceProfiles.isPremiumListed),
          desc(coachMarketplaceProfiles.searchRank),
          desc(coachMarketplaceProfiles.averageRating)
        );
    }

    // Apply pagination
    searchQuery = searchQuery.limit(limit).offset(offset);

    const results = await searchQuery;

    // Log search for analytics and AI improvement
    if (req.user) {
      await db.insert(coachSearchHistory).values({
        searcherId: req.user.id,
        searchQuery: query,
        location,
        radius,
        specialties,
        priceRange,
        availability,
        resultsCount: results.length,
        topResults: results.slice(0, 10).map(r => r.coachId)
      });
    }

    // Update discovery analytics for returned coaches
    const coachIds = results.map(r => r.coachId);
    if (coachIds.length > 0) {
      // Increment search appearances for each coach
      await db.execute(sql`
        INSERT INTO coach_discovery_analytics (coach_id, date, search_appearances, created_at)
        VALUES ${sql.join(
          coachIds.map(id => sql`(${id}, CURRENT_DATE, 1, NOW())`),
          sql`, `
        )}
        ON CONFLICT (coach_id, date) 
        DO UPDATE SET search_appearances = coach_discovery_analytics.search_appearances + 1
      `);
    }

    res.json({
      results,
      total: results.length,
      searchParams,
      hasMore: results.length === limit
    });

  } catch (error) {
    console.error('Coach search error:', error);
    res.status(400).json({ 
      error: error instanceof z.ZodError ? error.errors : 'Invalid search parameters' 
    });
  }
});

// Get AI-powered coach recommendations based on user preferences
router.get('/recommendations', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get user's search history to understand preferences
    const recentSearches = await db
      .select()
      .from(coachSearchHistory)
      .where(eq(coachSearchHistory.searcherId, req.user.id))
      .orderBy(desc(coachSearchHistory.searchedAt))
      .limit(10);

    // Extract preferences from search history
    const preferredSpecialties = [...new Set(
      recentSearches.flatMap(s => s.specialties || [])
    )];
    
    const averagePriceRange = recentSearches.length > 0 ? {
      min: Math.min(...recentSearches.map(s => s.priceRange?.min || 0)),
      max: Math.max(...recentSearches.map(s => s.priceRange?.max || 999))
    } : null;

    // Build recommendation query
    let recommendationQuery = db
      .select({
        id: coachMarketplaceProfiles.id,
        coachId: coachMarketplaceProfiles.coachId,
        displayName: coachMarketplaceProfiles.displayName,
        tagline: coachMarketplaceProfiles.tagline,
        specialties: coachMarketplaceProfiles.specialties,
        location: coachMarketplaceProfiles.location,
        hourlyRate: coachMarketplaceProfiles.hourlyRate,
        averageRating: coachMarketplaceProfiles.averageRating,
        totalReviews: coachMarketplaceProfiles.totalReviews,
        totalSessions: coachMarketplaceProfiles.totalSessions,
        teachingStyle: coachMarketplaceProfiles.teachingStyle,
        responseTime: coachMarketplaceProfiles.responseTime
      })
      .from(coachMarketplaceProfiles)
      .where(eq(coachMarketplaceProfiles.isDiscoverable, true));

    // Apply preference-based filtering
    const conditions = [eq(coachMarketplaceProfiles.isDiscoverable, true)];

    if (preferredSpecialties.length > 0) {
      conditions.push(
        sql`${coachMarketplaceProfiles.specialties} && ${JSON.stringify(preferredSpecialties)}`
      );
    }

    if (averagePriceRange && averagePriceRange.max < 999) {
      conditions.push(
        lte(coachMarketplaceProfiles.hourlyRate, averagePriceRange.max.toString())
      );
    }

    if (conditions.length > 1) {
      recommendationQuery = recommendationQuery.where(and(...conditions));
    }

    // Order by AI matching score (simplified algorithm)
    recommendationQuery = recommendationQuery
      .orderBy(
        desc(coachMarketplaceProfiles.averageRating),
        desc(coachMarketplaceProfiles.totalSessions),
        asc(coachMarketplaceProfiles.responseTime)
      )
      .limit(12);

    const recommendations = await recommendationQuery;

    res.json({
      recommendations,
      basedOn: {
        recentSearchCount: recentSearches.length,
        preferredSpecialties,
        averagePriceRange
      }
    });

  } catch (error) {
    console.error('Coach recommendations error:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

// Get detailed coach profile for marketplace
router.get('/:coachId', async (req, res) => {
  try {
    const coachId = parseInt(req.params.coachId);
    
    // Get coach profile with marketplace data
    const coach = await db
      .select()
      .from(coachMarketplaceProfiles)
      .where(eq(coachMarketplaceProfiles.coachId, coachId))
      .limit(1);

    if (coach.length === 0) {
      return res.status(404).json({ error: 'Coach not found' });
    }

    // Get recent reviews
    const reviews = await db
      .select()
      .from(coachMarketplaceReviews)
      .where(and(
        eq(coachMarketplaceReviews.coachId, coachId),
        eq(coachMarketplaceReviews.isApproved, true)
      ))
      .orderBy(desc(coachMarketplaceReviews.createdAt))
      .limit(10);

    // Check if user has favorited this coach
    let isFavorited = false;
    if (req.user) {
      const favorite = await db
        .select()
        .from(coachFavoriteLists)
        .where(and(
          eq(coachFavoriteLists.playerId, req.user.id),
          eq(coachFavoriteLists.coachId, coachId)
        ))
        .limit(1);
      
      isFavorited = favorite.length > 0;
    }

    // Track profile view
    if (req.user) {
      await db.execute(sql`
        INSERT INTO coach_discovery_analytics (coach_id, date, profile_views, created_at)
        VALUES (${coachId}, CURRENT_DATE, 1, NOW())
        ON CONFLICT (coach_id, date) 
        DO UPDATE SET profile_views = coach_discovery_analytics.profile_views + 1
      `);

      // Update total profile views
      await db
        .update(coachMarketplaceProfiles)
        .set({
          profileViews: sql`${coachMarketplaceProfiles.profileViews} + 1`
        })
        .where(eq(coachMarketplaceProfiles.coachId, coachId));
    }

    const result: CoachWithMarketplaceData = {
      ...coach[0],
      reviews,
      recentAnalytics: [],
      isFavorited
    };

    res.json(result);

  } catch (error) {
    console.error('Get coach profile error:', error);
    res.status(500).json({ error: 'Failed to get coach profile' });
  }
});

// Add coach to favorites
router.post('/:coachId/favorite', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const coachId = parseInt(req.params.coachId);
    const { listName = 'Favorites', notes } = req.body;

    // Check if already favorited
    const existing = await db
      .select()
      .from(coachFavoriteLists)
      .where(and(
        eq(coachFavoriteLists.playerId, req.user.id),
        eq(coachFavoriteLists.coachId, coachId)
      ))
      .limit(1);

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Coach already in favorites' });
    }

    await db.insert(coachFavoriteLists).values({
      playerId: req.user.id,
      coachId,
      listName,
      notes
    });

    res.json({ success: true, message: 'Coach added to favorites' });

  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({ error: 'Failed to add to favorites' });
  }
});

// Remove coach from favorites
router.delete('/:coachId/favorite', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const coachId = parseInt(req.params.coachId);

    await db
      .delete(coachFavoriteLists)
      .where(and(
        eq(coachFavoriteLists.playerId, req.user.id),
        eq(coachFavoriteLists.coachId, coachId)
      ));

    res.json({ success: true, message: 'Coach removed from favorites' });

  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({ error: 'Failed to remove from favorites' });
  }
});

// Get user's favorite coaches
router.get('/favorites/list', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const favorites = await db
      .select({
        favoriteId: coachFavoriteLists.id,
        listName: coachFavoriteLists.listName,
        notes: coachFavoriteLists.notes,
        createdAt: coachFavoriteLists.createdAt,
        coach: {
          id: coachMarketplaceProfiles.id,
          coachId: coachMarketplaceProfiles.coachId,
          displayName: coachMarketplaceProfiles.displayName,
          tagline: coachMarketplaceProfiles.tagline,
          location: coachMarketplaceProfiles.location,
          hourlyRate: coachMarketplaceProfiles.hourlyRate,
          averageRating: coachMarketplaceProfiles.averageRating,
          totalReviews: coachMarketplaceProfiles.totalReviews
        }
      })
      .from(coachFavoriteLists)
      .innerJoin(
        coachMarketplaceProfiles,
        eq(coachFavoriteLists.coachId, coachMarketplaceProfiles.coachId)
      )
      .where(eq(coachFavoriteLists.playerId, req.user.id))
      .orderBy(desc(coachFavoriteLists.createdAt));

    res.json({ favorites });

  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ error: 'Failed to get favorites' });
  }
});

// Submit coach review
router.post('/:coachId/reviews', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const coachId = parseInt(req.params.coachId);
    const {
      rating,
      title,
      content,
      technicalSkills,
      communication,
      reliability,
      valueForMoney,
      tags = [],
      sessionDate
    } = req.body;

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Check if user already reviewed this coach
    const existingReview = await db
      .select()
      .from(coachMarketplaceReviews)
      .where(and(
        eq(coachMarketplaceReviews.coachId, coachId),
        eq(coachMarketplaceReviews.reviewerId, req.user.id)
      ))
      .limit(1);

    if (existingReview.length > 0) {
      return res.status(400).json({ error: 'You have already reviewed this coach' });
    }

    // Insert review
    const review = await db.insert(coachMarketplaceReviews).values({
      coachId,
      reviewerId: req.user.id,
      rating,
      title,
      content,
      technicalSkills,
      communication,
      reliability,
      valueForMoney,
      tags,
      sessionDate: sessionDate ? new Date(sessionDate) : null,
      isVerifiedBooking: false // Would need to check actual booking records
    }).returning();

    // Update coach's average rating and review count
    await db.execute(sql`
      UPDATE coach_marketplace_profiles 
      SET 
        average_rating = (
          SELECT AVG(rating)::decimal(3,2) 
          FROM coach_marketplace_reviews 
          WHERE coach_id = ${coachId} AND is_approved = true
        ),
        total_reviews = (
          SELECT COUNT(*) 
          FROM coach_marketplace_reviews 
          WHERE coach_id = ${coachId} AND is_approved = true
        )
      WHERE coach_id = ${coachId}
    `);

    res.json({ success: true, review: review[0] });

  } catch (error) {
    console.error('Submit review error:', error);
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

export default router;