/**
 * PKL-278651-PROF-0008-COMP - Editable Profile Field
 * 
 * Component for inline editing of profile fields with customizable rendering.
 * Enhanced for mobile with touch support and improved UI.
 * 
 * @framework Framework5.3
 * @version 1.1.0
 * @lastUpdated 2025-04-26
 */

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Edit2, Check, X, PenLine } from "lucide-react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { Button } from "@/components/ui/button";

interface EditableProfileFieldProps {
  value: string;
  field: string;
  onUpdate: (field: string, value: any) => void;
  editable?: boolean;
  placeholder?: string;
  className?: string;
  render?: (value: string, editing: boolean, onChange: (value: string) => void) => React.ReactNode;
}

export default function EditableProfileField({
  value,
  field,
  onUpdate,
  editable = true,
  placeholder = '',
  className = '',
  render
}: EditableProfileFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);
  const [prevValue, setPrevValue] = useState(value);
  const [isTouched, setIsTouched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Detect if on mobile
  const isMobile = useMediaQuery("(max-width: 768px)");
  
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
    setIsTouched(false);
    if (currentValue !== prevValue) {
      onUpdate(field, currentValue);
    }
  };
  
  const handleCancel = () => {
    setIsEditing(false);
    setIsTouched(false);
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
      
      // For mobile, ensure input is in view
      if (isMobile) {
        setTimeout(() => {
          inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    }
  }, [isEditing, isMobile]);
  
  // Handle clicks outside to save
  useEffect(() => {
    if (!isEditing) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      // Only auto-save if clicking outside the editing container
      if (
        containerRef.current && 
        !containerRef.current.contains(e.target as Node)
      ) {
        handleSave();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEditing, currentValue, prevValue]);
  
  // Handle touch interactions for mobile
  useEffect(() => {
    if (!isMobile || !editable || isEditing) return;
    
    const handleTouchStart = () => {
      setIsTouched(true);
    };
    
    const handleTouchEnd = () => {
      // Keep the touched state for a moment so users can see the edit button
      setTimeout(() => {
        setIsTouched(false);
      }, 2000);
    };
    
    const element = containerRef.current;
    if (element) {
      element.addEventListener('touchstart', handleTouchStart);
      element.addEventListener('touchend', handleTouchEnd);
      
      return () => {
        element.removeEventListener('touchstart', handleTouchStart);
        element.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isMobile, editable, isEditing]);
  
  // If a custom render function is provided, use it
  if (render) {
    return (
      <div ref={containerRef} className={`group relative ${className}`}>
        {render(currentValue, isEditing, setCurrentValue)}
        
        {/* Desktop edit button (hover) */}
        {editable && !isEditing && !isMobile && (
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
        
        {/* Mobile edit button (touch) */}
        {editable && !isEditing && isMobile && (
          <motion.button
            className={`absolute -right-8 top-0 p-1 rounded-full bg-background shadow-sm border border-border 
                       ${isTouched ? 'opacity-100' : 'opacity-0'}`}
            onClick={handleEditClick}
            whileTap={{ scale: 0.95 }}
            aria-label="Edit field"
          >
            <PenLine className="h-3 w-3 text-primary" />
          </motion.button>
        )}
        
        {/* Control buttons while editing */}
        {isEditing && (
          <div 
            className={`flex gap-1 ${
              isMobile 
                ? 'mt-2 w-full justify-end' 
                : 'absolute -right-14 top-0'
            }`}
          >
            {isMobile ? (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleCancel}
                  className="text-destructive border-destructive/20 hover:bg-destructive/10"
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSave}
                  className="text-primary border-primary/20 hover:bg-primary/10"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Save
                </Button>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        )}
      </div>
    );
  }
  
  // Default rendering
  return (
    <div ref={containerRef} className={`group relative ${className}`}>
      <div className={isMobile && isEditing ? 'flex flex-col gap-2' : ''}>
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            className={`w-full ${isMobile ? 'px-3 py-2' : 'max-w-xs px-2 py-1'} bg-muted rounded border border-input`}
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoFocus
          />
        ) : (
          <div 
            className={`min-h-[1.5rem] py-0.5 ${editable && 'cursor-pointer'}`}
            onClick={editable ? handleEditClick : undefined}
          >
            {currentValue || (editable ? (
              <span className="text-muted-foreground italic">{placeholder}</span>
            ) : (
              <span className="text-muted-foreground">Not set</span>
            ))}
          </div>
        )}
        
        {/* Control buttons while editing (mobile optimized) */}
        {isEditing && isMobile && (
          <div className="flex justify-end gap-2 mt-1">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCancel}
              className="text-destructive border-destructive/20 hover:bg-destructive/10"
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSave}
              className="text-primary border-primary/20 hover:bg-primary/10"
            >
              <Check className="h-4 w-4 mr-1" />
              Save
            </Button>
          </div>
        )}
      </div>
      
      {/* Desktop edit button (hover) */}
      {editable && !isEditing && !isMobile && (
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
      
      {/* Mobile edit button (touch) - appears when field is touched */}
      {editable && !isEditing && isMobile && (
        <motion.button
          className={`absolute -right-8 top-0 p-1 rounded-full bg-background shadow-sm border border-border 
                    ${isTouched ? 'opacity-100' : 'opacity-0'}`}
          onClick={handleEditClick}
          whileTap={{ scale: 0.95 }}
          aria-label="Edit field"
        >
          <PenLine className="h-3 w-3 text-primary" />
        </motion.button>
      )}
      
      {/* Desktop save/cancel buttons */}
      {isEditing && !isMobile && (
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