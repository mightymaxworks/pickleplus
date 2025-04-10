/**
 * PKL-278651-GAME-0003-ENGGT
 * Tournament Feature Dialog
 * 
 * This component provides a dialog for displaying detailed tournament feature information
 * with engagement-based XP rewards.
 */

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import TournamentFeatureDetail from './TournamentFeatureDetail';
import { TournamentFeatureDetail as TournamentFeatureDetailType } from '../data/tournamentFeatureDetails';

interface TournamentFeatureDialogProps {
  feature: TournamentFeatureDetailType | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isDiscovered?: boolean;
  onClaimReward?: (featureId: string) => void;
  xpAmount?: number;
}

/**
 * Dialog component for displaying tournament feature details
 * with engagement-based XP rewards
 */
const TournamentFeatureDialog: React.FC<TournamentFeatureDialogProps> = ({ 
  feature, 
  isOpen, 
  onOpenChange,
  isDiscovered = false,
  onClaimReward,
  xpAmount
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        {feature && (
          <TournamentFeatureDetail 
            feature={feature} 
            onClose={() => onOpenChange(false)}
            isDiscovered={isDiscovered}
            onClaimReward={onClaimReward}
            xpAmount={xpAmount}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TournamentFeatureDialog;