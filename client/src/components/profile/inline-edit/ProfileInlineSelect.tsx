/**
 * PKL-278651-EPEF-0001: Enhanced Profile Inline Editing Feature
 * 
 * This component provides inline editing capabilities for select/dropdown enhanced profile fields.
 */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Pencil, Check, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface SelectOption {
  value: string;
  label: string;
}

interface InlineSelectProps {
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

export function ProfileInlineSelect({
  fieldName,
  fieldLabel,
  initialValue,
  options,
  onSave,
  placeholder = "Select an option",
  validator,
  className = "",
  apiEndpoint = "/api/profile/update",
}: InlineSelectProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState<string>(initialValue || "");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const queryClient = useQueryClient();
  
  const handleEdit = () => {
    setIsEditing(true);
  };
  
  const handleCancel = () => {
    setValue(initialValue || "");
    setError(null);
    setIsEditing(false);
  };
  
  const handleSave = async () => {
    // Validate the field value if a validator is provided
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
      // Create payload with just the field being updated
      const payload = {
        [fieldName]: value
      };
      
      // Send PATCH request to update profile
      await apiRequest({
        url: apiEndpoint,
        method: "PATCH",
        data: payload,
        headers: { 'Content-Type': 'application/json' }
      });
      
      // Invalidate profile query to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/auth/current-user"], exact: false });
      
      // Call onSave callback if provided
      if (onSave) {
        onSave(value);
      }
      
      toast({
        title: "Profile updated",
        description: `Your ${fieldLabel.toLowerCase()} has been updated.`,
      });
      
      setIsEditing(false);
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
  
  // Find the label for the current value
  const selectedOptionLabel = options.find(option => option.value === initialValue)?.label || 'Not specified';
  
  return (
    <div className={`group relative ${className}`}>
      {isEditing ? (
        <div className="space-y-2">
          <Label htmlFor={fieldName}>{fieldLabel}</Label>
          <div className="flex items-center gap-2">
            <Select
              defaultValue={value}
              onValueChange={setValue}
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
        <div className="flex items-center justify-between">
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
            onClick={handleEdit}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}