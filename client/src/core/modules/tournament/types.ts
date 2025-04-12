/**
 * PKL-278651-TOURN-0001-TYPES
 * Tournament Type Definitions
 * 
 * Shared type definitions for the tournament module components
 * Following Framework 5.0 principles for reliability
 */

// Compatible interface that handles both null and undefined for optional fields
export interface Tournament {
  id: number;
  name: string;
  description?: string | null;
  location?: string | null;
  startDate: Date | string;
  endDate: Date | string;
  registrationStartDate?: Date | string | null;
  registrationEndDate?: Date | string | null;
  format?: string;
  division?: string;
  level?: string;
  status?: string;
  // Additional fields that might be used in the component
  participantsCount?: number;
  bracketCount?: number;
}