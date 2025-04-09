/**
 * Match Validation Service
 * 
 * PKL-278651-VALMAT-0001-FIX
 * 
 * This service handles match validation functionality, including:
 * - Auto-validation for match submitters
 * - Participant validation/dispute handling
 * - Match validation status management
 */

import { db } from "../../../db";
import { 
  matches, 
  matchValidations
} from "@shared/schema";
import { eq, and, or } from "drizzle-orm";

/**
 * Update a match's validation status based on current participant validations
 * @param matchId The ID of the match to update
 */
export async function updateMatchValidationStatus(matchId: number): Promise<void> {
  // Get all participants for the match
  const match = await db.select().from(matches).where(eq(matches.id, matchId)).limit(1);
  if (!match || match.length === 0) return;
  
  const currentMatch = match[0];
  
  // Determine all participants
  const participants = [
    currentMatch.playerOneId,
    currentMatch.playerTwoId
  ];
  
  // Add partners if it's a doubles match
  if (currentMatch.formatType === 'doubles') {
    if (currentMatch.playerOnePartnerId) participants.push(currentMatch.playerOnePartnerId);
    if (currentMatch.playerTwoPartnerId) participants.push(currentMatch.playerTwoPartnerId);
  }
  
  // Get all validations for this match
  const validations = await db.select()
    .from(matchValidations)
    .where(eq(matchValidations.matchId, matchId));
  
  // Check if we have validations from all participants
  if (validations.length === participants.length) {
    // Check if any participant has disputed the match
    const hasDispute = validations.some(v => v.status === 'disputed');
    
    // Update match validation status
    if (hasDispute) {
      await db.update(matches)
        .set({
          validationStatus: 'disputed',
          validationCompletedAt: new Date()
        })
        .where(eq(matches.id, matchId));
    } else {
      await db.update(matches)
        .set({
          validationStatus: 'validated',
          validationCompletedAt: new Date(),
          isVerified: true // Legacy field support
        })
        .where(eq(matches.id, matchId));
    }
  }
}

/**
 * Auto-validate a match for the submitter
 * @param matchId The ID of the match
 * @param submitterId The ID of the user who submitted the match
 */
export async function autoValidateMatchForSubmitter(matchId: number, submitterId: number): Promise<void> {
  try {
    console.log(`[VALMAT] Auto-validating match ${matchId} for submitter ${submitterId}`);
    
    // Check if validation already exists
    const existingValidation = await db.select()
      .from(matchValidations)
      .where(and(
        eq(matchValidations.matchId, matchId),
        eq(matchValidations.userId, submitterId)
      ))
      .limit(1);
    
    if (existingValidation && existingValidation.length > 0) {
      console.log(`[VALMAT] Submitter ${submitterId} already has a validation record for match ${matchId}`);
      return;
    }
    
    // Create auto-validation record
    await db.insert(matchValidations)
      .values({
        matchId: matchId,
        userId: submitterId,
        status: 'confirmed',
        validatedAt: new Date(),
        notes: 'Auto-validated (submitter)'
      });
    
    console.log(`[VALMAT] Successfully auto-validated match ${matchId} for submitter ${submitterId}`);
    
    // Update overall match validation status
    await updateMatchValidationStatus(matchId);
    
  } catch (error) {
    console.error(`[VALMAT] Error auto-validating match for submitter:`, error);
    // Don't rethrow - we want to allow the match to be created even if auto-validation fails
  }
}

/**
 * Validate a match with a specific status
 * @param matchId The ID of the match to validate
 * @param userId The ID of the user validating the match
 * @param status The validation status ('confirmed' or 'disputed')
 * @param notes Optional notes, especially important for disputes
 */
export async function validateMatch(
  matchId: number, 
  userId: number, 
  status: 'confirmed' | 'disputed', 
  notes?: string
) {
  // First, check if the match exists
  const match = await db.select().from(matches).where(eq(matches.id, matchId)).limit(1);
  if (!match || match.length === 0) {
    throw new Error("Match not found");
  }
  
  // Check if the user was actually part of this match
  const currentMatch = match[0];
  const isUserInMatch = [
    currentMatch.playerOneId,
    currentMatch.playerTwoId,
    currentMatch.playerOnePartnerId,
    currentMatch.playerTwoPartnerId
  ].filter(Boolean).includes(userId);
  
  if (!isUserInMatch) {
    throw new Error("You can only validate matches you participated in");
  }
  
  // Check if the user has already validated this match
  const existingValidation = await db.select()
    .from(matchValidations)
    .where(and(
      eq(matchValidations.matchId, matchId),
      eq(matchValidations.userId, userId)
    ))
    .limit(1);
  
  if (existingValidation && existingValidation.length > 0) {
    // Update existing validation
    await db.update(matchValidations)
      .set({
        status: status,
        notes: notes || existingValidation[0].notes,
        validatedAt: new Date()
      })
      .where(eq(matchValidations.id, existingValidation[0].id));
      
    // Return the updated validation
    const updatedValidation = await db.select()
      .from(matchValidations)
      .where(eq(matchValidations.id, existingValidation[0].id))
      .limit(1);
      
    // Update overall match validation status
    await updateMatchValidationStatus(matchId);
    
    return updatedValidation[0];
  } else {
    // Create new validation record
    const newValidation = await db.insert(matchValidations)
      .values({
        matchId: matchId,
        userId: userId,
        status: status,
        notes: notes || null,
        validatedAt: new Date()
      })
      .returning();
      
    // Update overall match validation status
    await updateMatchValidationStatus(matchId);
    
    return newValidation[0];
  }
}

/**
 * Get validation details for a match
 * @param matchId The ID of the match
 */
export async function getMatchValidationDetails(matchId: number) {
  // Get the match
  const match = await db.select().from(matches).where(eq(matches.id, matchId)).limit(1);
  if (!match || match.length === 0) {
    throw new Error("Match not found");
  }
  
  // Get all validations for this match
  const validations = await db.select()
    .from(matchValidations)
    .where(eq(matchValidations.matchId, matchId));
  
  return {
    matchId,
    validationStatus: match[0].validationStatus,
    validationRequiredBy: match[0].validationRequiredBy,
    validationCompletedAt: match[0].validationCompletedAt,
    participantValidations: validations
  };
}