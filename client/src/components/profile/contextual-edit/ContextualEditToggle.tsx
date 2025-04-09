/**
 * PKL-278651-CPEM-0001: Contextual Profile Editing Mode
 * PKL-278651-XPPS-0001: Profile Completion XP Reward System Integration
 * 
 * This component provides contextual inline editing capabilities for boolean/toggle profile fields.
 * It builds upon our existing ProfileInlineToggle component but integrates with the
 * ProfileEditContext to support the contextual editing approach.
 * 
 * Additionally, it now tracks field completion for XP rewards based on the profile
 * completion specification.
 */

import React, { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { useProfileEdit } from '@/contexts/ProfileEditContext';
import { Trophy } from 'lucide-react';

interface ContextualEditToggleProps {
  fieldName: string;
  fieldLabel: string;
  description?: string;
  initialValue: boolean;
  onSave?: (value: boolean) => void;
  className?: string;
  apiEndpoint?: string;
  fieldType?: 'basic' | 'equipment' | 'playing-attribute' | 'skill-assessment' | 'profile-media';
}

export function ContextualEditToggle({
  fieldName,
  fieldLabel,
  description,
  initialValue,
  onSave,
  className = '',
  apiEndpoint = '/api/profile/update',
  fieldType = 'basic'
}: ContextualEditToggleProps) {
  const { isEditMode, setHasUnsavedChanges } = useProfileEdit();
  const [value, setValue] = useState(initialValue);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showXpAward, setShowXpAward] = useState(false);
  const [xpAwarded, setXpAwarded] = useState<number | null>(null);
  const { toast } = useToast();

  // Reset the value when initialValue changes
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  // UseEffect to hide XP award after a delay
  useEffect(() => {
    if (showXpAward) {
      const timer = setTimeout(() => {
        setShowXpAward(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [showXpAward]);

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
      
      // Send direct fetch request to avoid any type issues
      await fetch(apiEndpoint, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload)
      });
      
      // Invalidate profile query to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/auth/current-user"] });
      
      // If this is setting to true and it's the first time setting the toggle, track field completion for XP
      if (checked && !initialValue) {
        try {
          // Call the field completion API to track and reward XP
          const response = await fetch('/api/profile/field-completion', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              fieldName,
              fieldType
            })
          });
          
          if (response.ok) {
            const result = await response.json();
            
            // Only show XP toast if XP was awarded (not already awarded before)
            if (result.success && !result.alreadyAwarded && result.xpAwarded > 0) {
              setXpAwarded(result.xpAwarded);
              setShowXpAward(true);
              
              // Show XP award toast
              toast({
                title: `+${result.xpAwarded} XP Earned!`,
                description: `You earned XP for setting your ${fieldLabel.toLowerCase()}.`,
                variant: "default",
                className: "xp-toast bg-yellow-50 border-yellow-200"
              });
            }
          }
        } catch (error) {
          console.error('Error tracking field completion:', error);
        }
      }
      
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
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex items-center space-x-2">
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
      
      {showXpAward && xpAwarded && (
        <div className="flex items-center mr-2 animate-bounce">
          <Trophy className="h-4 w-4 text-yellow-500 mr-1" />
          <span className="text-xs font-semibold text-yellow-500">+{xpAwarded} XP</span>
        </div>
      )}
    </div>
  );
}