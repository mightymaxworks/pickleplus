/**
 * PKL-278651-PROF-0026-TYPE - Match Types
 * 
 * Type definitions for match data used in the profile page.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastUpdated 2025-04-26
 */

export interface Match {
  id: number;
  userId: number;
  date: string;
  location?: string;
  score?: string;
  winner: number;
  opponents?: string[];
  duration?: number;
  tournamentId?: number;
  tournamentName?: string;
  notes?: string;
  skillsGained?: {
    technical?: number;
    tactical?: number;
    physical?: number;
    mental?: number;
    consistency?: number;
  };
}