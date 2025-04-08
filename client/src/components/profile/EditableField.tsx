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
import { 
  Check, 
  X, 
  Pencil,
  Loader2
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type FieldType = "text" | "textarea" | "select";

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
  placeholder = "Not provided"
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