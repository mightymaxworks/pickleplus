import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { 
  Check, 
  X, 
  Pencil,
  Loader2
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type FieldType = "text" | "textarea" | "select" | "slider" | "number-stepper";

interface SelectOption {
  value: string;
  label: string;
}

interface EditableFieldProps {
  label: string;
  value: string;
  fieldName: string; 
  fieldType?: FieldType;
  selectOptions?: SelectOption[];
  onSave?: (fieldName: string, value: string) => Promise<void>;
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
  tooltip?: string;
  placeholder?: string;
  // For slider and number stepper
  min?: number;
  max?: number;
  step?: number;
  sliderLabels?: { [key: number]: string }; // For custom labels like "1 = Beginner"
}

export function EditableField({
  label,
  value,
  fieldName,
  fieldType = "text",
  selectOptions = [],
  onSave,
  className,
  inputClassName,
  disabled = false,
  tooltip,
  placeholder = "Not provided",
  min = 1,
  max = 10,
  step = 1,
  sliderLabels = {}
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || "");
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const { toast } = useToast();

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = async () => {
    if (editValue === value) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      if (onSave) {
        await onSave(fieldName, editValue);
      } else {
        // Default save behavior using profile update endpoint
        await apiRequest("PATCH", "/api/profile/update", { [fieldName]: editValue });
        queryClient.invalidateQueries({ queryKey: ["/api/auth/current-user"] });
        queryClient.invalidateQueries({ queryKey: ["/api/profile/completion"] });
      }
      
      toast({
        title: "Updated",
        description: `${label} has been updated.`,
      });
      
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update field. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value || "");
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && fieldType !== "textarea") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  // Render value display when not editing
  const renderValue = () => {
    if (!value) return <span className="text-muted-foreground">{placeholder}</span>;
    
    if (fieldType === "select" && selectOptions?.length) {
      const option = selectOptions.find(opt => opt.value === value);
      return option?.label || value;
    }
    
    if ((fieldType === "slider" || fieldType === "number-stepper") && sliderLabels[parseInt(value)]) {
      return (
        <div className="flex items-center gap-2">
          <span className="font-medium">{value}</span>
          <span className="text-sm text-muted-foreground">({sliderLabels[parseInt(value)]})</span>
        </div>
      );
    }
    
    return value;
  };

  return (
    <div className={cn("group relative", className)}>
      <div className="flex justify-between items-start">
        <div className="text-xs text-muted-foreground mb-1">{label}</div>
        
        {!isEditing && !disabled && (
          <Button
            variant="ghost"
            size="sm"
            className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => setIsEditing(true)}
          >
            <Pencil className="h-3 w-3 text-muted-foreground" />
          </Button>
        )}
      </div>
      
      {isEditing ? (
        <div className="space-y-2">
          {fieldType === "textarea" ? (
            <Textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className={cn("min-h-[80px]", inputClassName)}
              disabled={isSaving}
            />
          ) : fieldType === "select" ? (
            <Select
              value={editValue}
              onValueChange={setEditValue}
              disabled={isSaving}
            >
              <SelectTrigger className={inputClassName}>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {selectOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : fieldType === "slider" ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {sliderLabels[min] || min}
                </span>
                <span className="font-medium text-primary">
                  {editValue} {sliderLabels[parseInt(editValue)] && `- ${sliderLabels[parseInt(editValue)]}`}
                </span>
                <span className="text-muted-foreground">
                  {sliderLabels[max] || max}
                </span>
              </div>
              <Slider
                value={[parseInt(editValue) || min]}
                onValueChange={(value) => setEditValue(value[0].toString())}
                min={min}
                max={max}
                step={step}
                className="w-full"
                disabled={isSaving}
              />
            </div>
          ) : fieldType === "number-stepper" ? (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const current = parseInt(editValue) || min;
                  if (current > min) setEditValue((current - step).toString());
                }}
                disabled={isSaving || (parseInt(editValue) || min) <= min}
                className="h-8 w-8 p-0"
              >
                -
              </Button>
              <div className="flex-1 text-center">
                <div className="text-lg font-medium">{editValue}</div>
                {sliderLabels[parseInt(editValue)] && (
                  <div className="text-xs text-muted-foreground">
                    {sliderLabels[parseInt(editValue)]}
                  </div>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const current = parseInt(editValue) || min;
                  if (current < max) setEditValue((current + step).toString());
                }}
                disabled={isSaving || (parseInt(editValue) || min) >= max}
                className="h-8 w-8 p-0"
              >
                +
              </Button>
            </div>
          ) : (
            <Input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className={inputClassName}
              disabled={isSaving}
            />
          )}
          
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              disabled={isSaving}
              className="h-7 px-2"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="h-7 px-2 bg-[#4CAF50] hover:bg-[#3d8b40]"
            >
              {isSaving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Check className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div 
          className={cn(
            "text-sm relative min-h-[1.5rem]",
            !disabled && "hover:cursor-pointer hover:bg-muted/40 rounded px-1 -ml-1", 
            !value && "italic"
          )}
          onClick={() => !disabled && setIsEditing(true)}
        >
          {renderValue()}
        </div>
      )}
    </div>
  );
}