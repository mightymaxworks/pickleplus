/**
 * PKL-278651-EPEF-0001: Enhanced Profile Inline Editing Feature
 * 
 * This component provides inline editing capabilities for boolean/toggle enhanced profile fields.
 */
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";

interface InlineToggleProps {
  fieldName: string;
  fieldLabel: string;
  description?: string;
  initialValue: boolean;
  onSave?: (value: boolean) => void;
  className?: string;
  apiEndpoint?: string;
}

export function ProfileInlineToggle({
  fieldName,
  fieldLabel,
  description,
  initialValue,
  onSave,
  className = "",
  apiEndpoint = "/api/profile/update",
}: InlineToggleProps) {
  const [value, setValue] = useState<boolean>(initialValue || false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const queryClient = useQueryClient();
  
  const handleToggle = async (checked: boolean) => {
    setValue(checked);
    
    setIsSubmitting(true);
    
    try {
      // Create payload with just the field being updated
      const payload = {
        [fieldName]: checked
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