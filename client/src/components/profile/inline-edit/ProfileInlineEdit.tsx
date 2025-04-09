/**
 * PKL-278651-EPEF-0001: Enhanced Profile Inline Editing Feature
 * 
 * This component provides inline editing capabilities for the enhanced profile fields.
 * It allows users to edit their profile information directly within each tab of the enhanced profile.
 */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Check, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

interface InlineEditProps {
  fieldName: string;
  fieldLabel: string;
  initialValue: string | number | null;
  onSave?: (value: string) => void;
  type?: "text" | "number" | "email";
  placeholder?: string;
  validator?: z.ZodType<any, any>;
  className?: string;
  apiEndpoint?: string;
}

export function ProfileInlineEdit({
  fieldName,
  fieldLabel,
  initialValue,
  onSave,
  type = "text",
  placeholder = "Enter a value",
  validator,
  className = "",
  apiEndpoint = "/api/profile/update",
}: InlineEditProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState<string>(initialValue?.toString() || "");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const queryClient = useQueryClient();
  
  const handleEdit = () => {
    setIsEditing(true);
  };
  
  const handleCancel = () => {
    setValue(initialValue?.toString() || "");
    setError(null);
    setIsEditing(false);
  };
  
  const handleSave = async () => {
    // Validate the field value if a validator is provided
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
      // Create payload with just the field being updated
      const payload = {
        [fieldName]: type === "number" ? parseFloat(value) : value
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
              onChange={(e) => setValue(e.target.value)}
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
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-1">
              {fieldLabel}
            </div>
            <div className="font-medium">
              {initialValue || <span className="text-muted-foreground">Not specified</span>}
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