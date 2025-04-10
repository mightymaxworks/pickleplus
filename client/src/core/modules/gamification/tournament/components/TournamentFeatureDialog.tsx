/**
 * PKL-278651-GAME-0003-DISC
 * Tournament Feature Dialog
 * 
 * This component provides a dialog for displaying detailed tournament feature information.
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
}

/**
 * Dialog component for displaying tournament feature details
 */
const TournamentFeatureDialog: React.FC<TournamentFeatureDialogProps> = ({ 
  feature, 
  isOpen, 
  onOpenChange 
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        {feature && (
          <TournamentFeatureDetail 
            feature={feature} 
            onClose={() => onOpenChange(false)} 
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TournamentFeatureDialog;