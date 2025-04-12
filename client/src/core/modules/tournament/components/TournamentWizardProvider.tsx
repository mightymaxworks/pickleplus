/**
 * PKL-278651-TOURN-0001-FORM
 * Tournament Wizard Provider
 * 
 * This file provides a proper migration path from the old dialog to the new wizard
 * It ensures backward compatibility while we transition to the new multi-step form
 */

import { CreateTournamentWizard } from './CreateTournamentWizard';

// Export a constant for tournament query key to ensure consistency across components
export const TOURNAMENT_QUERY_KEY = 'api/tournaments';

// This component has the same interface as CreateTournamentDialog so it can be
// used as a drop-in replacement while we transition
interface TournamentWizardProviderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  queryKey?: string; // Optional custom query key
}

export function CreateTournamentDialog({ 
  open, 
  onOpenChange, 
  queryKey = TOURNAMENT_QUERY_KEY 
}: TournamentWizardProviderProps) {
  return (
    <CreateTournamentWizard
      queryKey={queryKey}
      open={open}
      onOpenChange={onOpenChange}
    />
  );
}