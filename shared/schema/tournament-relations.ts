/**
 * PKL-278651-TOURN-0015-MULTI
 * Tournament Relations Schema
 * 
 * This file contains the enhanced tournament relations schema to support
 * multi-event tournaments with parent-child relationships
 */

import { relations } from "drizzle-orm";
import { tournaments } from "../schema";

/**
 * Enhanced tournament relations to support parent-child relationships
 * for multi-event tournaments
 */
export const tournamentRelations = relations(tournaments, ({ one, many }) => ({
  // Self-relation for parent-child relationship
  parentTournament: one(tournaments, {
    fields: [tournaments.parentTournamentId],
    references: [tournaments.id],
    relationName: "parent_tournament"
  }),
  childTournaments: many(tournaments, {
    relationName: "parent_tournament"
  }),
  
  // Relations for registrations and brackets defined in other files
  // but can be included here for completeness
}));