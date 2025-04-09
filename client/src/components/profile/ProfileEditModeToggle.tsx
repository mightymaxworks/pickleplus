/**
 * PKL-278651-CPEM-0001: Contextual Profile Editing Mode
 * 
 * This component provides a toggle button for switching between view and edit modes
 * in the profile. It should be prominently displayed in the profile header.
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Pencil, Check, X } from 'lucide-react';
import { useProfileEdit } from '@/contexts/ProfileEditContext';
import { useToast } from '@/hooks/use-toast';

interface ProfileEditModeToggleProps {
  className?: string;
}

export function ProfileEditModeToggle({ className = '' }: ProfileEditModeToggleProps) {
  const { isEditMode, toggleEditMode, disableEditMode, hasUnsavedChanges } = useProfileEdit();
  const { toast } = useToast();

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      // If there are unsaved changes, show a confirmation dialog
      if (window.confirm('You have unsaved changes. Are you sure you want to exit edit mode?')) {
        disableEditMode();
        toast({
          title: 'Edit mode disabled',
          description: 'Changes were discarded.',
        });
      }
    } else {
      disableEditMode();
    }
  };

  if (isEditMode) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Button 
          variant="ghost"
          size="sm"
          onClick={handleCancel}
          className="flex items-center gap-1 text-red-500 hover:text-red-700 hover:bg-red-100"
        >
          <X className="h-4 w-4" />
          Cancel
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={toggleEditMode}
          className="flex items-center gap-1 text-primary hover:text-primary"
        >
          <Check className="h-4 w-4" />
          Done Editing
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleEditMode}
      className={`flex items-center gap-1 hover:bg-primary hover:text-white transition-colors ${className}`}
    >
      <Pencil className="h-4 w-4" />
      Edit Profile
    </Button>
  );
}