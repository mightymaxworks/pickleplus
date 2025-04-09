/**
 * PKL-278651-CPEM-0001: Contextual Profile Editing Mode
 * 
 * This component provides contextual inline editing capabilities for boolean/toggle profile fields.
 * It builds upon our existing ProfileInlineToggle component but integrates with the
 * ProfileEditContext to support the contextual editing approach.
 */

import React, { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { useProfileEdit } from '@/contexts/ProfileEditContext';

interface ContextualEditToggleProps {
  fieldName: string;
  fieldLabel: string;
  description?: string;
  initialValue: boolean;
  onSave?: (value: boolean) => void;
  className?: string;
  apiEndpoint?: string;
}

export function ContextualEditToggle({
  fieldName,
  fieldLabel,
  description,
  initialValue,
  onSave,
  className = '',
  apiEndpoint = '/api/profile/update'
}: ContextualEditToggleProps) {
  const { isEditMode, setHasUnsavedChanges } = useProfileEdit();
  const [value, setValue] = useState(initialValue);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Reset the value when initialValue changes
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  // When the toggle changes, automatically save the value
  const handleToggle = async (checked: boolean) => {
    // Remove edit mode check to allow direct editing
    
    setValue(checked);
    setHasUnsavedChanges(true);
    
    setIsSubmitting(true);
    try {
      const payload = {
        [fieldName]: checked
      };
      
      // Send PATCH request to update profile
      await apiRequest(
        "PATCH", // Ensure this is a string, not an object
        apiEndpoint,
        payload
      );
      
      // Invalidate profile query to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/auth/current-user"] });
      
      // Call onSave callback if provided
      if (onSave) {
        onSave(checked);
      }
      
      toast({
        title: "Profile updated",
        description: `Your ${fieldLabel.toLowerCase()} has been updated.`,
      });
    } catch (err) {
      console.error("Error updating profile:", err);
      // Revert the UI state since the API call failed
      setValue(!checked);
      
      toast({
        title: "Failed to update profile",
        description: "An error occurred while updating your profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
      setHasUnsavedChanges(false);
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Switch 
        id={fieldName} 
        checked={value}
        onCheckedChange={handleToggle}
        disabled={isSubmitting}
      />
      <div className="grid gap-1.5">
        <Label htmlFor={fieldName} className="font-medium">{fieldLabel}</Label>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}