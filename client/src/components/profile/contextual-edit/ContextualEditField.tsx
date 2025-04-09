/**
 * PKL-278651-CPEM-0001: Contextual Profile Editing Mode
 * PKL-278651-XPPS-0001: Profile Completion XP Reward System Integration
 * 
 * This component provides contextual inline editing capabilities for profile fields.
 * It builds upon our existing ProfileInlineEdit component and integrates with the
 * ProfileEditContext to support the contextual editing approach.
 * 
 * Additionally, it now tracks field completion for XP rewards based on the profile
 * completion specification.
 */

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Pencil, Check, X, Trophy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { z } from 'zod';
import { useProfileEdit } from '@/contexts/ProfileEditContext';

interface ContextualEditFieldProps {
  fieldName: string;
  fieldLabel: string;
  initialValue: string | number | null;
  onSave?: (value: string) => void;
  type?: "text" | "number" | "email";
  placeholder?: string;
  validator?: z.ZodType<any, any>;
  className?: string;
  apiEndpoint?: string;
  fieldType?: 'basic' | 'equipment' | 'playing-attribute' | 'skill-assessment' | 'profile-media';
}

export function ContextualEditField({
  fieldName,
  fieldLabel,
  initialValue,
  onSave,
  type = "text",
  placeholder,
  validator,
  className = '',
  apiEndpoint = '/api/profile/update',
  fieldType = 'basic'
}: ContextualEditFieldProps) {
  const { isEditMode, setHasUnsavedChanges } = useProfileEdit();
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue !== null ? String(initialValue) : '');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showXpAward, setShowXpAward] = useState(false);
  const [xpAwarded, setXpAwarded] = useState<number | null>(null);
  const { toast } = useToast();

  // Reset the value when initialValue changes (e.g. after a successful save)
  useEffect(() => {
    setValue(initialValue !== null ? String(initialValue) : '');
  }, [initialValue]);

  // No longer need to reset editing state based on global mode
  // This allows for truly contextual editing

  const handleEdit = () => {
    // Always allow editing without requiring edit mode
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setValue(initialValue !== null ? String(initialValue) : '');
    setError(null);
  };

  const handleSave = async () => {
    // Validate the value if a validator is provided
    if (validator) {
      try {
        validator.parse(type === "number" ? parseFloat(value) : value);
        setError(null);
      } catch (err) {
        if (err instanceof z.ZodError) {
          setError(err.errors[0].message);
          return;
        }
      }
    }

    setIsSubmitting(true);
    try {
      const payload = {
        [fieldName]: type === "number" ? parseFloat(value) : value
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
      
      // Check if a value was provided and track field completion for XP
      if (value && initialValue === null) {
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
                description: `You earned XP for completing your ${fieldLabel.toLowerCase()}.`,
                variant: "default",
                className: "xp-toast bg-yellow-50 border-yellow-200"
              });
            }
          }
        } catch (error) {
          console.error('Error tracking field completion:', error);
        }
      }
      
      // Invalidate profile query to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/auth/current-user"] });
      
      // Call onSave callback if provided
      if (onSave) {
        onSave(value);
      }
      
      toast({
        title: "Profile updated",
        description: `Your ${fieldLabel.toLowerCase()} has been updated.`,
      });
      
      setIsEditing(false);
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      toast({
        title: "Failed to update profile",
        description: "An error occurred while updating your profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // When the value changes, update the unsaved changes flag
  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    setHasUnsavedChanges(true);
  };

  // UseEffect to hide XP award after a delay
  useEffect(() => {
    if (showXpAward) {
      const timer = setTimeout(() => {
        setShowXpAward(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [showXpAward]);

  return (
    <div className={`group relative ${className}`}>
      {isEditing ? (
        <div className="space-y-2">
          <Label htmlFor={fieldName}>{fieldLabel}</Label>
          <div className="flex items-center gap-2">
            <Input
              id={fieldName}
              type={type}
              value={value}
              onChange={handleValueChange}
              placeholder={placeholder}
              className={error ? "border-red-500" : ""}
              autoFocus
            />
            <Button
              size="icon"
              variant="ghost"
              onClick={handleSave}
              disabled={isSubmitting}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
      ) : (
        <div 
          className="flex items-center justify-between cursor-pointer hover:bg-muted/40 p-2 rounded-md -mx-2"
          onClick={handleEdit}
        >
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-1">
              {fieldLabel}
            </div>
            <div className="font-medium">
              {initialValue || <span className="text-muted-foreground">Not specified</span>}
            </div>
          </div>
          <div className="flex items-center">
            {showXpAward && xpAwarded && (
              <div className="flex items-center mr-2 animate-bounce">
                <Trophy className="h-4 w-4 text-yellow-500 mr-1" />
                <span className="text-xs font-semibold text-yellow-500">+{xpAwarded} XP</span>
              </div>
            )}
            <Button
              size="icon"
              variant="ghost"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                handleEdit();
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}