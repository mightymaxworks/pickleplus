/**
 * PKL-278651-CPEM-0001: Contextual Profile Editing Mode
 * 
 * This component provides contextual inline editing capabilities for select/dropdown profile fields.
 * It builds upon our existing ProfileInlineSelect component but integrates with the
 * ProfileEditContext to support the contextual editing approach.
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Pencil, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { z } from 'zod';
import { useProfileEdit } from '@/contexts/ProfileEditContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SelectOption {
  value: string;
  label: string;
}

interface ContextualEditSelectProps {
  fieldName: string;
  fieldLabel: string;
  initialValue: string | null;
  options: SelectOption[];
  onSave?: (value: string) => void;
  placeholder?: string;
  validator?: z.ZodType<any, any>;
  className?: string;
  apiEndpoint?: string;
}

export function ContextualEditSelect({
  fieldName,
  fieldLabel,
  initialValue,
  options,
  onSave,
  placeholder = "Select...",
  validator,
  className = '',
  apiEndpoint = '/api/profile/update'
}: ContextualEditSelectProps) {
  const { isEditMode, setHasUnsavedChanges } = useProfileEdit();
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue || '');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Reset the value when initialValue changes
  useEffect(() => {
    setValue(initialValue || '');
  }, [initialValue]);

  // When global edit mode changes, reset editing state
  useEffect(() => {
    if (!isEditMode) {
      setIsEditing(false);
    }
  }, [isEditMode]);

  const handleEdit = () => {
    // Always allow editing without requiring edit mode
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setValue(initialValue || '');
    setError(null);
  };

  const handleSave = async () => {
    // Validate if needed
    if (validator) {
      try {
        validator.parse(value);
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
        [fieldName]: value
      };
      
      // Send PATCH request to update profile
      await apiRequest(
        "PATCH",
        apiEndpoint,
        payload
      );
      
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
  const handleValueChange = (newValue: string) => {
    setValue(newValue);
    setHasUnsavedChanges(true);
  };

  // Find the label for the current value
  const selectedOptionLabel = options.find(option => option.value === initialValue)?.label || 'Not specified';

  return (
    <div className={`group relative ${className}`}>
      {isEditing ? (
        <div className="space-y-2">
          <Label htmlFor={fieldName}>{fieldLabel}</Label>
          <div className="flex items-center gap-2">
            <Select
              value={value}
              onValueChange={handleValueChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {options.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              {selectedOptionLabel}
            </div>
          </div>
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
      )}
    </div>
  );
}