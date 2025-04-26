/**
 * PKL-278651-PROF-0027-TYPE - Tournament Types
 * 
 * Type definitions for tournament data used in the profile page.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastUpdated 2025-04-26
 */

export interface Tournament {
  id: number;
  name: string;
  date: string;
  location?: string;
  participants?: number;
  division?: string;
  placement: number;
  prize?: string;
  userId: number;
  tournamentType?: 'singles' | 'doubles' | 'mixed';
  partner?: string;
  opponents?: string[];
  round?: number;
  totalRounds?: number;
  isCompleted: boolean;
}