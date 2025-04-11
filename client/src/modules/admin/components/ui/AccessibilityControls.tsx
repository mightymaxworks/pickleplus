/**
 * PKL-278651-ADMIN-0014-UX
 * Accessibility Controls Component
 * 
 * This component provides quick access to accessibility features
 * such as font size adjustments and high contrast mode.
 */

import React, { useState } from 'react';
import { Maximize, ZoomIn, ZoomOut, Moon, Sun, Type } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { EnhancedTooltip } from './EnhancedTooltip';

export function AccessibilityControls() {
  const { toast } = useToast();
  const [fontSizeScale, setFontSizeScale] = useState(1);
  const [highContrast, setHighContrast] = useState(false);
  
  // Function to increase font size
  const increaseFontSize = () => {
    if (fontSizeScale < 1.5) {
      const newScale = Math.min(fontSizeScale + 0.1, 1.5);
      setFontSizeScale(newScale);
      document.documentElement.style.fontSize = `${newScale * 100}%`;
      toast({
        title: "Font Size Increased",
        description: "Page text is now larger",
      });
    }
  };
  
  // Function to decrease font size
  const decreaseFontSize = () => {
    if (fontSizeScale > 0.8) {
      const newScale = Math.max(fontSizeScale - 0.1, 0.8);
      setFontSizeScale(newScale);
      document.documentElement.style.fontSize = `${newScale * 100}%`;
      toast({
        title: "Font Size Decreased",
        description: "Page text is now smaller",
      });
    }
  };
  
  // Function to reset font size
  const resetFontSize = () => {
    setFontSizeScale(1);
    document.documentElement.style.fontSize = '100%';
    toast({
      title: "Font Size Reset",
      description: "Page text size has been reset to default",
    });
  };
  
  // Function to toggle high contrast mode
  const toggleHighContrast = () => {
    const newValue = !highContrast;
    setHighContrast(newValue);
    
    if (newValue) {
      document.documentElement.classList.add('high-contrast');
      toast({
        title: "High Contrast Mode Enabled",
        description: "Increased contrast for better visibility",
      });
    } else {
      document.documentElement.classList.remove('high-contrast');
      toast({
        title: "High Contrast Mode Disabled",
        description: "Contrast settings returned to normal",
      });
    }
  };
  
  return (
    <EnhancedTooltip content="Accessibility Options" side="bottom">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="h-9 w-9">
            <Type className="h-4 w-4" />
            <span className="sr-only">Accessibility options</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Accessibility</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={increaseFontSize}>
              <ZoomIn className="mr-2 h-4 w-4" />
              <span>Increase font size</span>
              <span className="ml-auto text-xs text-muted-foreground">⌘+</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={decreaseFontSize}>
              <ZoomOut className="mr-2 h-4 w-4" />
              <span>Decrease font size</span>
              <span className="ml-auto text-xs text-muted-foreground">⌘-</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={resetFontSize}>
              <Maximize className="mr-2 h-4 w-4" />
              <span>Reset font size</span>
              <span className="ml-auto text-xs text-muted-foreground">⌘0</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={toggleHighContrast}>
              {highContrast ? (
                <>
                  <Sun className="mr-2 h-4 w-4" />
                  <span>Disable high contrast</span>
                </>
              ) : (
                <>
                  <Moon className="mr-2 h-4 w-4" />
                  <span>Enable high contrast</span>
                </>
              )}
              <span className="ml-auto text-xs text-muted-foreground">⌘H</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </EnhancedTooltip>
  );
}