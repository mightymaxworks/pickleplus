/**
 * Partner Preferences Service
 * Handles user partner matching criteria and availability
 */

import { db } from "../../../db";
import { storage } from "../../../storage";
import { EventBus } from "../../../core/events/event-bus";
import {
  partnerCriteria,
  partnerAvailability,
  specialAvailability,
  partnerSuggestions,
  type PartnerCriteria,
  type InsertPartnerCriteria,
  type PartnerAvailability,
  type InsertPartnerAvailability,
  type SpecialAvailability,
  type InsertSpecialAvailability,
  type PartnerSuggestion,
  type InsertPartnerSuggestion
} from "../../../../shared/schema";
import { eq, and, between, gte } from "drizzle-orm";

export class PartnerPreferencesService {
  constructor(private eventBus: EventBus) {}

  /**
   * Get all partner criteria for a user
   */
  async getUserPartnerCriteria(userId: number): Promise<PartnerCriteria[]> {
    return await db.select().from(partnerCriteria).where(eq(partnerCriteria.userId, userId));
  }

  /**
   * Get a specific partner criteria
   */
  async getPartnerCriteria(id: number): Promise<PartnerCriteria | undefined> {
    const [criteria] = await db.select().from(partnerCriteria).where(eq(partnerCriteria.id, id));
    return criteria;
  }

  /**
   * Create a new partner criteria
   */
  async createPartnerCriteria(data: InsertPartnerCriteria): Promise<PartnerCriteria> {
    const [criteria] = await db.insert(partnerCriteria).values(data).returning();
    
    this.eventBus.emit('partner.criteria.created', criteria);
    
    return criteria;
  }

  /**
   * Update an existing partner criteria
   */
  async updatePartnerCriteria(id: number, data: Partial<InsertPartnerCriteria>): Promise<PartnerCriteria> {
    const [updatedCriteria] = await db.update(partnerCriteria)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(partnerCriteria.id, id))
      .returning();
    
    this.eventBus.emit('partner.criteria.updated', updatedCriteria);
    
    return updatedCriteria;
  }

  /**
   * Delete a partner criteria
   */
  async deletePartnerCriteria(id: number): Promise<boolean> {
    const result = await db.delete(partnerCriteria).where(eq(partnerCriteria.id, id)).returning();
    
    if (result.length > 0) {
      this.eventBus.emit('partner.criteria.deleted', result[0]);
      return true;
    }
    
    return false;
  }

  /**
   * Get all availability slots for a user
   */
  async getUserAvailability(userId: number): Promise<PartnerAvailability[]> {
    return await db.select().from(partnerAvailability).where(eq(partnerAvailability.userId, userId));
  }

  /**
   * Get a specific availability slot
   */
  async getAvailabilitySlot(id: number): Promise<PartnerAvailability | undefined> {
    const [slot] = await db.select().from(partnerAvailability).where(eq(partnerAvailability.id, id));
    return slot;
  }

  /**
   * Create a new availability slot
   */
  async createAvailabilitySlot(data: InsertPartnerAvailability): Promise<PartnerAvailability> {
    const [slot] = await db.insert(partnerAvailability).values(data).returning();
    
    this.eventBus.emit('partner.availability.created', slot);
    
    return slot;
  }

  /**
   * Update an existing availability slot
   */
  async updateAvailabilitySlot(id: number, data: Partial<InsertPartnerAvailability>): Promise<PartnerAvailability> {
    const [updatedSlot] = await db.update(partnerAvailability)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(partnerAvailability.id, id))
      .returning();
    
    this.eventBus.emit('partner.availability.updated', updatedSlot);
    
    return updatedSlot;
  }

  /**
   * Delete an availability slot
   */
  async deleteAvailabilitySlot(id: number): Promise<boolean> {
    const result = await db.delete(partnerAvailability).where(eq(partnerAvailability.id, id)).returning();
    
    if (result.length > 0) {
      this.eventBus.emit('partner.availability.deleted', result[0]);
      return true;
    }
    
    return false;
  }

  /**
   * Get all special availability slots for a user
   * Optionally filter by date range
   */
  async getUserSpecialAvailability(
    userId: number,
    startDate?: Date,
    endDate?: Date
  ): Promise<SpecialAvailability[]> {
    let query = db.select().from(specialAvailability).where(eq(specialAvailability.userId, userId));
    
    if (startDate && endDate) {
      query = query.where(
        and(
          gte(specialAvailability.date, startDate.toISOString().split('T')[0]),
          between(specialAvailability.date, startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0])
        )
      );
    } else if (startDate) {
      query = query.where(gte(specialAvailability.date, startDate.toISOString().split('T')[0]));
    }
    
    return await query;
  }

  /**
   * Get a specific special availability slot
   */
  async getSpecialAvailability(id: number): Promise<SpecialAvailability | undefined> {
    const [slot] = await db.select().from(specialAvailability).where(eq(specialAvailability.id, id));
    return slot;
  }

  /**
   * Create a new special availability slot
   */
  async createSpecialAvailability(data: InsertSpecialAvailability): Promise<SpecialAvailability> {
    const [slot] = await db.insert(specialAvailability).values(data).returning();
    
    this.eventBus.emit('partner.special_availability.created', slot);
    
    return slot;
  }

  /**
   * Delete a special availability slot
   */
  async deleteSpecialAvailability(id: number): Promise<boolean> {
    const result = await db.delete(specialAvailability).where(eq(specialAvailability.id, id)).returning();
    
    if (result.length > 0) {
      this.eventBus.emit('partner.special_availability.deleted', result[0]);
      return true;
    }
    
    return false;
  }

  /**
   * Get partner suggestions for a user
   * Optionally filter by status
   */
  async getUserPartnerSuggestions(
    userId: number,
    status: string = 'pending'
  ): Promise<PartnerSuggestion[]> {
    return await db.select()
      .from(partnerSuggestions)
      .where(eq(partnerSuggestions.userId, userId))
      .where(eq(partnerSuggestions.status, status));
  }

  /**
   * Get a specific partner suggestion
   */
  async getPartnerSuggestion(id: number): Promise<PartnerSuggestion | undefined> {
    const [suggestion] = await db.select().from(partnerSuggestions).where(eq(partnerSuggestions.id, id));
    return suggestion;
  }

  /**
   * Update a partner suggestion
   */
  async updatePartnerSuggestion(
    id: number,
    { status, userAction }: { status: string; userAction?: string }
  ): Promise<PartnerSuggestion> {
    const [updatedSuggestion] = await db.update(partnerSuggestions)
      .set({ 
        status, 
        ...(userAction && { userAction }),
        updatedAt: new Date() 
      })
      .where(eq(partnerSuggestions.id, id))
      .returning();
    
    this.eventBus.emit('partner.suggestion.updated', updatedSuggestion);
    
    return updatedSuggestion;
  }

  /**
   * Generate partner suggestions based on criteria and availability
   * This is a complex algorithm that would match users based on their preferences
   */
  async generatePartnerSuggestions(): Promise<number> {
    // This would be a complex algorithm that is beyond the scope of this implementation
    // The actual implementation would:
    // 1. Get all active users with partner criteria
    // 2. For each user, find potential matches based on criteria
    // 3. Score the matches
    // 4. Create suggestions for the highest scoring matches
    
    // For now, emit an event that this operation was performed
    this.eventBus.emit('partner.suggestions.generated', { timestamp: new Date() });
    
    return 0; // Return the count of suggestions created
  }
}

// Factory function to create the service
let service: PartnerPreferencesService | null = null;

export function getPartnerPreferencesService(eventBus: EventBus): PartnerPreferencesService {
  if (!service) {
    service = new PartnerPreferencesService(eventBus);
  }
  return service;
}