/**
 * PKL-278651-PROF-0008-COMP - Editable Profile Field
 * 
 * Component for inline editing of profile fields with customizable rendering.
 * Enhanced for mobile with touch support and improved UI.
 * Added more prominent edit icons and better visual feedback.
 * 
 * @framework Framework5.3
 * @version 1.2.0
 * @lastUpdated 2025-04-27
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
  
  // More reliable mobile detection that doesn't depend on initial state
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  // Update mobile status on resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    // Force check on mount to ensure we have the right value
    handleResize();
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Debug logging on initialization
  useEffect(() => {
    console.log(`[DEBUG] EditableProfileField ${field} initialized:`, { 
      value, 
      editable, 
      isEditing,
      isMobile: window.innerWidth <= 768, // Get real-time value
      currentValue,
      prevValue
    });
  }, []);
  
  // If value prop changes, update the current value state
  useEffect(() => {
    if (value !== prevValue) {
      console.log(`[DEBUG] EditableProfileField ${field} value changed:`, { 
        value, 
        prevValue, 
        currentValue 
      });
      setCurrentValue(value);
      setPrevValue(value);
    }
  }, [value, prevValue]);
  
  const handleEditClick = () => {
    console.log(`[DEBUG] EditableProfileField ${field} clicked:`, { 
      editable, 
      currentValue,
      isEditing 
    });
    
    if (!editable) {
      console.log(`[DEBUG] EditableProfileField ${field} not editable, ignoring click`);
      return;
    }
    
    setPrevValue(currentValue);
    console.log(`[DEBUG] EditableProfileField ${field} entering edit mode`);
    setIsEditing(true);
  };
  
  const handleSave = () => {
    console.log(`[DEBUG] EditableProfileField ${field} saving:`, {
      currentValue,
      prevValue,
      hasChanged: currentValue !== prevValue
    });
    
    setIsEditing(false);
    setIsTouched(false);
    if (currentValue !== prevValue) {
      console.log(`[DEBUG] EditableProfileField ${field} calling onUpdate with:`, currentValue);
      onUpdate(field, currentValue);
    } else {
      console.log(`[DEBUG] EditableProfileField ${field} no changes to save`);
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
        
        {/* Mobile edit button (touch) - ENHANCED for better visibility */}
        {editable && !isEditing && isMobile && (
          <motion.button
            className={`absolute -right-11 top-0 p-2.5 rounded-full bg-primary/30 shadow-md border border-primary/30 
                       ${isTouched ? 'opacity-100' : 'opacity-70'}`}
            onClick={handleEditClick}
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            animate={isTouched ? { y: [0, -3, 0], scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.5, repeat: isTouched ? 1 : 0 }}
            aria-label="Edit field"
            title="Click to edit"
          >
            <PenLine className="h-6 w-6 text-primary" />
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
            className={`min-h-[1.5rem] py-0.5 ${editable ? 'cursor-pointer hover:bg-muted/40 rounded px-1 transition-colors' : ''}`}
            onClick={editable ? handleEditClick : undefined}
          >
            {currentValue || (editable ? (
              <span className="text-muted-foreground italic">{placeholder}</span>
            ) : (
              <span className="text-muted-foreground">Not set</span>
            ))}
          </div>
        )}
        
        {/* Control buttons while editing (mobile optimized) - ENHANCED for better visibility */}
        {isEditing && isMobile && (
          <div className="flex justify-end gap-2 mt-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCancel}
              className="h-10 text-sm border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive shadow-md"
            >
              <X className="h-5 w-5 mr-1.5" />
              Cancel
            </Button>
            <Button 
              size="sm" 
              onClick={handleSave}
              className="h-10 text-sm bg-primary hover:bg-primary/90 shadow-md"
            >
              <Check className="h-5 w-5 mr-1.5" />
              Save
            </Button>
          </div>
        )}
      </div>
      
      {/* Desktop edit button (hover) - ENHANCED for better visibility */}
      {editable && !isEditing && !isMobile && (
        <motion.button
          className="absolute -right-9 top-0 opacity-70 group-hover:opacity-100 text-primary bg-primary/15 p-1.5 rounded-md hover:bg-primary/30 hover:text-primary transition-all duration-200 border border-primary/20 shadow-sm"
          onClick={handleEditClick}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Edit field"
        >
          <Edit2 className="h-5 w-5" />
        </motion.button>
      )}
      
      {/* Mobile edit button (touch) - ENHANCED for better visibility */}
      {editable && !isEditing && isMobile && (
        <motion.button
          className={`absolute -right-11 top-0 p-2.5 rounded-full bg-primary/30 shadow-md border border-primary/30
                    ${isTouched ? 'opacity-100' : 'opacity-70'}`}
          onClick={handleEditClick}
          initial={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          animate={isTouched ? { y: [0, -3, 0], scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.5, repeat: isTouched ? 1 : 0 }}
          aria-label="Edit field"
          title="Click to edit"
        >
          <PenLine className="h-6 w-6 text-primary" />
        </motion.button>
      )}
      
      {/* Desktop save/cancel buttons - ENHANCED for better visibility */}
      {isEditing && !isMobile && (
        <div className="absolute -right-24 top-0 flex gap-2">
          <motion.button
            className="bg-destructive/20 text-destructive p-2 rounded-md hover:bg-destructive/30 border border-destructive/30 shadow-md"
            onClick={handleCancel}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Cancel"
          >
            <X className="h-5 w-5" />
          </motion.button>
          <motion.button
            className="bg-primary/20 text-primary p-2 rounded-md hover:bg-primary/30 border border-primary/30 shadow-md"
            onClick={handleSave}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Save"
          >
            <Check className="h-5 w-5" />
          </motion.button>
        </div>
      )}
    </div>
  );
}