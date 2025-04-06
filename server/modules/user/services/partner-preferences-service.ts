import { db } from "../../../db";
import { EventBus } from "../../../core/events/event-bus";
import {
  partnerCriteria,
  partnerAvailability,
  specialAvailability,
  partnerSuggestions,
  PartnerCriteria,
  PartnerAvailability,
  SpecialAvailability,
  PartnerSuggestion,
  insertPartnerCriteriaSchema,
  insertPartnerAvailabilitySchema,
  insertSpecialAvailabilitySchema,
  insertPartnerSuggestionSchema,
  users
} from "../../../../shared/schema";
import { eq, and, desc, asc, gte, lte, between, or, inArray, sql } from "drizzle-orm";
import { z } from "zod";

/**
 * Service for managing user partner preferences, availability,
 * and matchmaking functionality
 */
export class PartnerPreferencesService {
  private eventBus: EventBus;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    this.registerEventHandlers();
  }

  /**
   * Register event handlers for relevant events
   */
  private registerEventHandlers() {
    this.eventBus.subscribe("user.registered", async (data) => {
      await this.initializeDefaultPartnerPreferences(data.userId);
    });

    this.eventBus.subscribe("match.added", async (data) => {
      await this.recordPartnerMatch(data.playerOneId, data.playerTwoId);
      if (data.playerOnePartnerId && data.playerTwoPartnerId) {
        await this.recordPartnerMatch(data.playerOnePartnerId, data.playerTwoPartnerId);
      }
    });

    // Schedule daily partner suggestion generation
    this.eventBus.on("system.daily.maintenance", async () => {
      await this.generatePartnerSuggestions();
    });
  }

  /**
   * Initialize default partner preferences for a new user
   */
  async initializeDefaultPartnerPreferences(userId: number): Promise<void> {
    // Create a default partner criteria
    await db.insert(partnerCriteria).values({
      userId,
      name: "Default",
      isPrimary: true,
      preferredFormat: "doubles",
      matchPurpose: "casual",
      preferredFrequency: "weekly",
      timeCommitment: "medium",
      isActive: true
    });

    // Publish an event that default preferences have been set
    this.eventBus.publish("user.partner.preferences.initialized", { userId });
  }

  /**
   * Record a successful partner match between users
   */
  async recordPartnerMatch(userOneId: number, userTwoId: number): Promise<void> {
    // Check existing suggestions between these users
    const existingSuggestions = await db
      .select()
      .from(partnerSuggestions)
      .where(
        or(
          and(
            eq(partnerSuggestions.userId, userOneId),
            eq(partnerSuggestions.suggestedPartnerId, userTwoId)
          ),
          and(
            eq(partnerSuggestions.userId, userTwoId),
            eq(partnerSuggestions.suggestedPartnerId, userOneId)
          )
        )
      );

    // Update existing suggestions to 'played' status
    for (const suggestion of existingSuggestions) {
      await db
        .update(partnerSuggestions)
        .set({
          status: "played",
          userAction: "played",
          partnerAction: "played"
        })
        .where(eq(partnerSuggestions.id, suggestion.id));
    }

    // Publish event for partner match
    this.eventBus.publish("user.partner.match.played", {
      userOneId,
      userTwoId
    });
  }

  /**
   * Get all partner criteria for a user
   */
  async getUserPartnerCriteria(userId: number): Promise<PartnerCriteria[]> {
    return await db
      .select()
      .from(partnerCriteria)
      .where(eq(partnerCriteria.userId, userId))
      .orderBy(desc(partnerCriteria.isPrimary), desc(partnerCriteria.updatedAt));
  }

  /**
   * Get primary partner criteria for a user
   */
  async getUserPrimaryPartnerCriteria(userId: number): Promise<PartnerCriteria | undefined> {
    const criteria = await db
      .select()
      .from(partnerCriteria)
      .where(
        and(
          eq(partnerCriteria.userId, userId),
          eq(partnerCriteria.isPrimary, true),
          eq(partnerCriteria.isActive, true)
        )
      );
    
    return criteria[0];
  }

  /**
   * Create new partner criteria
   */
  async createPartnerCriteria(
    data: z.infer<typeof insertPartnerCriteriaSchema>
  ): Promise<PartnerCriteria> {
    // If this is set as primary, update existing criteria to not be primary
    if (data.isPrimary) {
      await db
        .update(partnerCriteria)
        .set({ isPrimary: false })
        .where(eq(partnerCriteria.userId, data.userId));
    }

    const [newCriteria] = await db.insert(partnerCriteria).values(data).returning();
    
    this.eventBus.publish("user.partner.criteria.created", {
      userId: newCriteria.userId,
      criteriaId: newCriteria.id
    });
    
    return newCriteria;
  }

  /**
   * Update partner criteria
   */
  async updatePartnerCriteria(
    criteriaId: number,
    data: Partial<z.infer<typeof insertPartnerCriteriaSchema>>
  ): Promise<PartnerCriteria | undefined> {
    // Get the current criteria to check user ID
    const currentCriteria = await db
      .select()
      .from(partnerCriteria)
      .where(eq(partnerCriteria.id, criteriaId));
    
    if (!currentCriteria.length) {
      return undefined;
    }

    // If setting this as primary, update all other criteria for this user
    if (data.isPrimary) {
      await db
        .update(partnerCriteria)
        .set({ isPrimary: false })
        .where(
          and(
            eq(partnerCriteria.userId, currentCriteria[0].userId),
            eq(partnerCriteria.id, criteriaId).not()
          )
        );
    }

    const [updated] = await db
      .update(partnerCriteria)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(partnerCriteria.id, criteriaId))
      .returning();

    if (updated) {
      this.eventBus.publish("user.partner.criteria.updated", {
        userId: updated.userId,
        criteriaId
      });
    }

    return updated;
  }

  /**
   * Delete partner criteria
   */
  async deletePartnerCriteria(criteriaId: number): Promise<boolean> {
    const [deleted] = await db
      .delete(partnerCriteria)
      .where(eq(partnerCriteria.id, criteriaId))
      .returning();
    
    if (deleted) {
      this.eventBus.publish("user.partner.criteria.deleted", {
        userId: deleted.userId,
        criteriaId
      });
    }
    
    return !!deleted;
  }

  /**
   * Get all recurring availability slots for a user
   */
  async getUserAvailability(userId: number): Promise<PartnerAvailability[]> {
    return await db
      .select()
      .from(partnerAvailability)
      .where(eq(partnerAvailability.userId, userId))
      .orderBy(asc(partnerAvailability.dayOfWeek), asc(partnerAvailability.startTime));
  }

  /**
   * Create a new availability slot
   */
  async createAvailabilitySlot(
    data: z.infer<typeof insertPartnerAvailabilitySchema>
  ): Promise<PartnerAvailability> {
    const [newSlot] = await db.insert(partnerAvailability).values(data).returning();
    
    this.eventBus.publish("user.partner.availability.created", {
      userId: newSlot.userId,
      availabilityId: newSlot.id
    });
    
    return newSlot;
  }

  /**
   * Update an availability slot
   */
  async updateAvailabilitySlot(
    slotId: number,
    data: Partial<z.infer<typeof insertPartnerAvailabilitySchema>>
  ): Promise<PartnerAvailability | undefined> {
    const [updated] = await db
      .update(partnerAvailability)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(partnerAvailability.id, slotId))
      .returning();

    if (updated) {
      this.eventBus.publish("user.partner.availability.updated", {
        userId: updated.userId,
        availabilityId: slotId
      });
    }

    return updated;
  }

  /**
   * Delete an availability slot
   */
  async deleteAvailabilitySlot(slotId: number): Promise<boolean> {
    const [deleted] = await db
      .delete(partnerAvailability)
      .where(eq(partnerAvailability.id, slotId))
      .returning();
    
    if (deleted) {
      this.eventBus.publish("user.partner.availability.deleted", {
        userId: deleted.userId,
        availabilityId: slotId
      });
    }
    
    return !!deleted;
  }

  /**
   * Get all special availability slots for a user
   */
  async getUserSpecialAvailability(
    userId: number,
    startDate?: Date,
    endDate?: Date
  ): Promise<SpecialAvailability[]> {
    let query = eq(specialAvailability.userId, userId);

    if (startDate && endDate) {
      query = and(
        query,
        between(specialAvailability.date, startDate, endDate)
      );
    } else if (startDate) {
      query = and(
        query,
        gte(specialAvailability.date, startDate)
      );
    } else if (endDate) {
      query = and(
        query,
        lte(specialAvailability.date, endDate)
      );
    }

    return await db
      .select()
      .from(specialAvailability)
      .where(query)
      .orderBy(asc(specialAvailability.date), asc(specialAvailability.startTime));
  }

  /**
   * Create a new special availability slot
   */
  async createSpecialAvailability(
    data: z.infer<typeof insertSpecialAvailabilitySchema>
  ): Promise<SpecialAvailability> {
    const [newSlot] = await db.insert(specialAvailability).values(data).returning();
    
    this.eventBus.publish("user.partner.special-availability.created", {
      userId: newSlot.userId,
      availabilityId: newSlot.id
    });
    
    return newSlot;
  }

  /**
   * Delete a special availability slot
   */
  async deleteSpecialAvailability(slotId: number): Promise<boolean> {
    const [deleted] = await db
      .delete(specialAvailability)
      .where(eq(specialAvailability.id, slotId))
      .returning();
    
    if (deleted) {
      this.eventBus.publish("user.partner.special-availability.deleted", {
        userId: deleted.userId,
        availabilityId: slotId
      });
    }
    
    return !!deleted;
  }

  /**
   * Get all partner suggestions for a user
   */
  async getUserPartnerSuggestions(
    userId: number,
    status: string = 'pending'
  ): Promise<PartnerSuggestion[]> {
    return await db
      .select()
      .from(partnerSuggestions)
      .where(
        and(
          eq(partnerSuggestions.userId, userId),
          eq(partnerSuggestions.status, status)
        )
      )
      .orderBy(desc(partnerSuggestions.matchScore), desc(partnerSuggestions.createdAt));
  }

  /**
   * Generate partner suggestions for all eligible users
   */
  async generatePartnerSuggestions(): Promise<number> {
    // Get all users who are looking for partners
    const eligibleUsers = await db
      .select()
      .from(users)
      .where(eq(users.lookingForPartners, true));

    let suggestionCount = 0;

    for (const user of eligibleUsers) {
      // Get this user's primary criteria
      const userCriteria = await this.getUserPrimaryPartnerCriteria(user.id);
      if (!userCriteria) continue;

      // Get this user's availability
      const userAvailability = await this.getUserAvailability(user.id);
      if (userAvailability.length === 0) continue;

      // Find potential matches using criteria
      const matches = await this.findPotentialPartners(user.id, userCriteria);
      
      for (const match of matches) {
        // Check if we already have a suggestion for this user pair
        const existingSuggestion = await db
          .select()
          .from(partnerSuggestions)
          .where(
            and(
              eq(partnerSuggestions.userId, user.id),
              eq(partnerSuggestions.suggestedPartnerId, match.userId),
              or(
                eq(partnerSuggestions.status, "pending"),
                eq(partnerSuggestions.status, "accepted")
              )
            )
          );

        if (existingSuggestion.length > 0) continue;

        // Calculate match score and reasons
        const { score, reasons } = await this.calculateMatchScore(user.id, match.userId, userCriteria);
        
        // Find overlapping availability
        const suggestedTimes = await this.findOverlappingAvailability(user.id, match.userId);
        
        if (suggestedTimes.length === 0) continue;

        // Create suggestion with best time
        const bestTime = suggestedTimes[0];
        await db.insert(partnerSuggestions).values({
          userId: user.id,
          suggestedPartnerId: match.userId,
          criteriaId: userCriteria.id,
          matchScore: score,
          reasonCodes: reasons,
          suggestedDate: bestTime.date,
          suggestedTime: bestTime.time,
          suggestedLocation: bestTime.location || null,
          status: "pending",
          userAction: "new",
          partnerAction: null,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          metadata: {
            additionalTimes: suggestedTimes.slice(1, 3)
          }
        });

        suggestionCount++;

        // Create reverse suggestion for the other user
        const partnerCriteria = await this.getUserPrimaryPartnerCriteria(match.userId);
        if (partnerCriteria) {
          const { score: reverseScore, reasons: reverseReasons } = await this.calculateMatchScore(match.userId, user.id, partnerCriteria);
          
          await db.insert(partnerSuggestions).values({
            userId: match.userId,
            suggestedPartnerId: user.id,
            criteriaId: partnerCriteria.id,
            matchScore: reverseScore,
            reasonCodes: reverseReasons,
            suggestedDate: bestTime.date,
            suggestedTime: bestTime.time,
            suggestedLocation: bestTime.location || null,
            status: "pending",
            userAction: "new",
            partnerAction: null,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            metadata: {
              additionalTimes: suggestedTimes.slice(1, 3)
            }
          });

          suggestionCount++;
        }
      }
    }

    this.eventBus.publish("user.partner.suggestions.generated", {
      count: suggestionCount
    });

    return suggestionCount;
  }

  /**
   * Find potential partners for a user based on criteria
   */
  private async findPotentialPartners(
    userId: number,
    criteria: PartnerCriteria
  ): Promise<{ userId: number; matchData: any }[]> {
    // Build a query based on criteria
    let query = and(
      eq(users.lookingForPartners, true),
      eq(users.id, userId).not() // Exclude the user themselves
    );

    // Add skill level criteria if specified
    if (criteria.skillLevelMin) {
      query = and(query, gte(users.skillLevel, criteria.skillLevelMin));
    }
    if (criteria.skillLevelMax) {
      query = and(query, lte(users.skillLevel, criteria.skillLevelMax));
    }

    // Add age criteria if specified
    const currentYear = new Date().getFullYear();
    if (criteria.ageMin) {
      const maxBirthYear = currentYear - criteria.ageMin;
      query = and(query, lte(users.yearOfBirth, maxBirthYear));
    }
    if (criteria.ageMax) {
      const minBirthYear = currentYear - criteria.ageMax;
      query = and(query, gte(users.yearOfBirth, minBirthYear));
    }

    // Add format preference if specified
    if (criteria.preferredFormat) {
      query = and(
        query,
        or(
          eq(users.preferredFormat, criteria.preferredFormat),
          sql`${users.preferredFormat} IS NULL`
        )
      );
    }

    // TODO: Add more matching criteria based on other fields

    const potentialMatches = await db
      .select()
      .from(users)
      .where(query);

    return potentialMatches.map(user => ({
      userId: user.id,
      matchData: {
        skillLevel: user.skillLevel,
        yearOfBirth: user.yearOfBirth,
        preferredFormat: user.preferredFormat,
        playingStyle: user.playingStyle
      }
    }));
  }

  /**
   * Calculate match score between two users
   */
  private async calculateMatchScore(
    userId: number,
    partnerId: number,
    criteria: PartnerCriteria
  ): Promise<{ score: number; reasons: string[] }> {
    const user = await db.select().from(users).where(eq(users.id, userId));
    const partner = await db.select().from(users).where(eq(users.id, partnerId));
    
    if (!user.length || !partner.length) {
      return { score: 0, reasons: ["user_not_found"] };
    }

    const userData = user[0];
    const partnerData = partner[0];
    
    let score = 60; // Base score
    const reasons: string[] = [];

    // 1. Skill Level match (up to 20 points)
    if (userData.skillLevel && partnerData.skillLevel) {
      const skillMatch = this.calculateSkillLevelMatch(userData.skillLevel, partnerData.skillLevel);
      score += skillMatch.points;
      if (skillMatch.points > 10) {
        reasons.push("skill_level_excellent_match");
      } else if (skillMatch.points > 5) {
        reasons.push("skill_level_good_match");
      }
    }

    // 2. Playing style compatibility (up to 15 points)
    if (userData.playingStyle && partnerData.playingStyle) {
      const styleMatch = this.calculatePlayingStyleMatch(userData.playingStyle, partnerData.playingStyle);
      score += styleMatch.points;
      if (styleMatch.isComplement) {
        reasons.push("complementary_playing_styles");
      }
    }

    // 3. Format preference (up to 10 points)
    if (criteria.preferredFormat && 
        partnerData.preferredFormat && 
        criteria.preferredFormat === partnerData.preferredFormat) {
      score += 10;
      reasons.push("format_preference_match");
    }

    // 4. Age range match (up to 10 points)
    if (userData.yearOfBirth && partnerData.yearOfBirth) {
      const ageDiff = Math.abs(userData.yearOfBirth - partnerData.yearOfBirth);
      if (ageDiff <= 2) {
        score += 10;
        reasons.push("age_close_match");
      } else if (ageDiff <= 5) {
        score += 7;
        reasons.push("age_good_match");
      } else if (ageDiff <= 10) {
        score += 3;
        reasons.push("age_acceptable_match");
      }
    }

    // TODO: Add more scoring factors

    // Cap score at 100
    score = Math.min(score, 100);
    
    return { score, reasons };
  }

  /**
   * Calculate skill level compatibility
   */
  private calculateSkillLevelMatch(
    userSkill: string,
    partnerSkill: string
  ): { points: number; isDifference: boolean } {
    // Map skill levels to numeric values
    const skillMap: Record<string, number> = {
      "1.0": 1, "1.5": 1.5, "2.0": 2, "2.5": 2.5,
      "3.0": 3, "3.5": 3.5, "4.0": 4, "4.5": 4.5, "5.0": 5,
      "beginner": 1.5, "novice": 2.5, "intermediate": 3.5,
      "advanced": 4.5, "professional": 5
    };

    const userValue = skillMap[userSkill] || 3;
    const partnerValue = skillMap[partnerSkill] || 3;
    
    const difference = Math.abs(userValue - partnerValue);
    
    if (difference === 0) {
      return { points: 20, isDifference: false };
    } else if (difference <= 0.5) {
      return { points: 15, isDifference: false };
    } else if (difference <= 1.0) {
      return { points: 10, isDifference: true };
    } else if (difference <= 1.5) {
      return { points: 5, isDifference: true };
    } else {
      return { points: 0, isDifference: true };
    }
  }

  /**
   * Calculate playing style compatibility
   */
  private calculatePlayingStyleMatch(
    userStyle: string,
    partnerStyle: string
  ): { points: number; isComplement: boolean } {
    // Complementary styles
    const complementaryPairs: [string, string][] = [
      ["aggressive", "defensive"],
      ["baseline", "net"],
      ["power", "finesse"],
      ["driver", "lob"]
    ];
    
    // Check if styles are complementary
    const isComplement = complementaryPairs.some(
      ([style1, style2]) => 
        (userStyle.toLowerCase().includes(style1) && partnerStyle.toLowerCase().includes(style2)) ||
        (userStyle.toLowerCase().includes(style2) && partnerStyle.toLowerCase().includes(style1))
    );
    
    // Exact match is good for some styles
    const exactMatch = userStyle.toLowerCase() === partnerStyle.toLowerCase();
    
    if (isComplement) {
      return { points: 15, isComplement: true };
    } else if (exactMatch) {
      // Some styles work well together (like all-court players)
      if (["all-court", "balanced", "versatile"].some(style => 
          userStyle.toLowerCase().includes(style))) {
        return { points: 12, isComplement: false };
      }
      return { points: 8, isComplement: false };
    } else {
      return { points: 3, isComplement: false };
    }
  }

  /**
   * Find overlapping availability between two users
   */
  private async findOverlappingAvailability(
    userId: number,
    partnerId: number
  ): Promise<{ date: Date; time: number; location: string | null }[]> {
    // Get both users' recurring availability
    const userAvailability = await this.getUserAvailability(userId);
    const partnerAvailability = await this.getUserAvailability(partnerId);
    
    // Get both users' special availability for the next two weeks
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 14);
    
    const userSpecial = await this.getUserSpecialAvailability(userId, startDate, endDate);
    const partnerSpecial = await this.getUserSpecialAvailability(partnerId, startDate, endDate);
    
    const overlappingTimes: { date: Date; time: number; location: string | null; duration: number }[] = [];
    
    // First check special availability overlaps
    for (const userSlot of userSpecial) {
      // Skip unavailable slots
      if (userSlot.status === "unavailable") continue;
      
      for (const partnerSlot of partnerSpecial) {
        // Skip unavailable slots
        if (partnerSlot.status === "unavailable") continue;
        
        // Check if dates match
        if (userSlot.date.getTime() !== partnerSlot.date.getTime()) continue;
        
        // Check if times overlap
        const overlapStart = Math.max(userSlot.startTime, partnerSlot.startTime);
        const overlapEnd = Math.min(userSlot.endTime, partnerSlot.endTime);
        
        if (overlapStart < overlapEnd) {
          // We have an overlap
          const duration = overlapEnd - overlapStart;
          // Only consider slots with at least 60 minutes overlap
          if (duration >= 60) {
            overlappingTimes.push({
              date: userSlot.date,
              time: overlapStart,
              location: userSlot.location || partnerSlot.location,
              duration
            });
          }
        }
      }
    }
    
    // Then check recurring availability overlaps for the next two weeks
    const days = [];
    for (let i = 0; i < 14; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      days.push({
        date,
        dayOfWeek: date.getDay() // 0 = Sunday, 6 = Saturday
      });
    }
    
    for (const day of days) {
      // Find all the user's recurring slots for this day of week
      const userDaySlots = userAvailability.filter(slot => slot.dayOfWeek === day.dayOfWeek);
      const partnerDaySlots = partnerAvailability.filter(slot => slot.dayOfWeek === day.dayOfWeek);
      
      // For each slot, check if there's an overlap
      for (const userSlot of userDaySlots) {
        for (const partnerSlot of partnerDaySlots) {
          const overlapStart = Math.max(userSlot.startTime, partnerSlot.startTime);
          const overlapEnd = Math.min(userSlot.endTime, partnerSlot.endTime);
          
          if (overlapStart < overlapEnd) {
            // We have an overlap
            const duration = overlapEnd - overlapStart;
            // Only consider slots with at least 60 minutes overlap
            if (duration >= 60) {
              // Check if this day is blocked by a special unavailability
              const isUserUnavailable = userSpecial.some(
                special => 
                  special.date.getTime() === day.date.getTime() && 
                  special.status === "unavailable"
              );
              
              const isPartnerUnavailable = partnerSpecial.some(
                special => 
                  special.date.getTime() === day.date.getTime() && 
                  special.status === "unavailable"
              );
              
              if (!isUserUnavailable && !isPartnerUnavailable) {
                overlappingTimes.push({
                  date: day.date,
                  time: overlapStart,
                  location: userSlot.location || partnerSlot.location,
                  duration
                });
              }
            }
          }
        }
      }
    }
    
    // Sort by date and time
    overlappingTimes.sort((a, b) => {
      // First by date
      const dateComparison = a.date.getTime() - b.date.getTime();
      if (dateComparison !== 0) return dateComparison;
      
      // Then by duration (longer first)
      const durationComparison = b.duration - a.duration;
      if (durationComparison !== 0) return durationComparison;
      
      // Then by time of day
      return a.time - b.time;
    });
    
    // Return up to 5 best options
    return overlappingTimes.slice(0, 5).map(({ date, time, location }) => ({ 
      date, time, location 
    }));
  }

  /**
   * Update a partner suggestion
   */
  async updatePartnerSuggestion(
    suggestionId: number,
    data: Partial<{ status: string; userAction: string; partnerAction: string }>
  ): Promise<PartnerSuggestion | undefined> {
    const [updated] = await db
      .update(partnerSuggestions)
      .set(data)
      .where(eq(partnerSuggestions.id, suggestionId))
      .returning();

    if (updated) {
      // If status is 'accepted', update the related suggestion
      if (data.status === "accepted") {
        // Find the reciprocal suggestion
        const reciprocal = await db
          .select()
          .from(partnerSuggestions)
          .where(
            and(
              eq(partnerSuggestions.userId, updated.suggestedPartnerId),
              eq(partnerSuggestions.suggestedPartnerId, updated.userId)
            )
          );
        
        if (reciprocal.length > 0) {
          // Update it to also be accepted
          await db
            .update(partnerSuggestions)
            .set({
              status: "accepted",
              partnerAction: "accepted"
            })
            .where(eq(partnerSuggestions.id, reciprocal[0].id));
        }
      }

      this.eventBus.publish("user.partner.suggestion.updated", {
        suggestionId,
        userId: updated.userId,
        partnerId: updated.suggestedPartnerId,
        status: data.status
      });
    }

    return updated;
  }
}

// Singleton instance
let partnerPreferencesService: PartnerPreferencesService;

export function getPartnerPreferencesService(eventBus: EventBus): PartnerPreferencesService {
  if (!partnerPreferencesService) {
    partnerPreferencesService = new PartnerPreferencesService(eventBus);
  }
  return partnerPreferencesService;
}