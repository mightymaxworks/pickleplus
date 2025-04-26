/**
 * PKL-278651-PROF-0008-COMP - Editable Profile Field
 * 
 * Component for inline editing of profile fields with customizable rendering.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastUpdated 2025-04-26
 */

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Edit2, Check, X } from "lucide-react";

interface EditableProfileFieldProps {
  value: string;
  field: string;
  onUpdate: (field: string, value: any) => void;
  editable?: boolean;
  placeholder?: string;
  render?: (value: string, editing: boolean, onChange: (value: string) => void) => React.ReactNode;
}

export default function EditableProfileField({
  value,
  field,
  onUpdate,
  editable = true,
  placeholder = '',
  render
}: EditableProfileFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);
  const [prevValue, setPrevValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // If value prop changes, update the current value state
  useEffect(() => {
    if (value !== prevValue) {
      setCurrentValue(value);
      setPrevValue(value);
    }
  }, [value, prevValue]);
  
  const handleEditClick = () => {
    if (!editable) return;
    
    setPrevValue(currentValue);
    setIsEditing(true);
  };
  
  const handleSave = () => {
    setIsEditing(false);
    if (currentValue !== prevValue) {
      onUpdate(field, currentValue);
    }
  };
  
  const handleCancel = () => {
    setIsEditing(false);
    setCurrentValue(prevValue);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };
  
  // Focus the input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);
  
  // Handle clicks outside to save
  useEffect(() => {
    if (!isEditing) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        handleSave();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEditing, currentValue, prevValue]);
  
  // If a custom render function is provided, use it
  if (render) {
    return (
      <div className="group relative">
        {render(currentValue, isEditing, setCurrentValue)}
        
        {editable && !isEditing && (
          <motion.button
            className="absolute -right-6 top-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-primary transition-opacity"
            onClick={handleEditClick}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Edit field"
          >
            <Edit2 className="h-4 w-4" />
          </motion.button>
        )}
        
        {isEditing && (
          <div className="absolute -right-14 top-0 flex gap-1">
            <motion.button
              className="text-destructive hover:text-destructive/80"
              onClick={handleCancel}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Cancel"
            >
              <X className="h-4 w-4" />
            </motion.button>
            <motion.button
              className="text-primary hover:text-primary/80"
              onClick={handleSave}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Save"
            >
              <Check className="h-4 w-4" />
            </motion.button>
          </div>
        )}
      </div>
    );
  }
  
  // Default rendering
  return (
    <div className="group relative">
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          className="w-full max-w-xs px-2 py-1 bg-muted rounded border border-input"
          value={currentValue}
          onChange={(e) => setCurrentValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus
        />
      ) : (
        <div className="min-h-[1.5rem] py-0.5">
          {currentValue || (editable ? placeholder : 'Not set')}
        </div>
      )}
      
      {/* Edit button only shown on hover when not editing */}
      {editable && !isEditing && (
        <motion.button
          className="absolute -right-6 top-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-primary transition-opacity"
          onClick={handleEditClick}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Edit field"
        >
          <Edit2 className="h-4 w-4" />
        </motion.button>
      )}
      
      {/* Save/Cancel buttons shown when editing */}
      {isEditing && (
        <div className="absolute -right-14 top-0 flex gap-1">
          <motion.button
            className="text-destructive hover:text-destructive/80"
            onClick={handleCancel}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Cancel"
          >
            <X className="h-4 w-4" />
          </motion.button>
          <motion.button
            className="text-primary hover:text-primary/80"
            onClick={handleSave}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Save"
          >
            <Check className="h-4 w-4" />
          </motion.button>
        </div>
      )}
    </div>
  );
}