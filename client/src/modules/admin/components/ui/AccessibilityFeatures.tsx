/**
 * PKL-278651-ADMIN-0014-UX
 * Accessibility Features Component
 * 
 * This component provides enhanced accessibility features for the admin interface,
 * including keyboard shortcuts, focus management, and screen reader optimizations.
 */

import React, { ReactNode, useEffect, useState, useRef, KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { 
  Keyboard, 
  Eye, 
  EyeOff, 
  Maximize2, 
  Minimize2,
  Type,
  ZoomIn,
  ZoomOut,
  Sun,
  Moon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

// Keyboard shortcut type
interface KeyboardShortcut {
  key: string;
  description: string;
  action: () => void;
}

// Interface for the accessibility provider props
interface AccessibilityProviderProps {
  children: ReactNode;
}

// Creating a context to manage accessibility features application-wide
const AccessibilityContext = React.createContext<{
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  resetFontSize: () => void;
  toggleHighContrast: () => void;
  toggleFullscreen: () => void;
  currentFontSize: number;
  isHighContrast: boolean;
  isFullscreen: boolean;
  registerKeyboardShortcut: (shortcut: KeyboardShortcut) => void;
  unregisterKeyboardShortcut: (key: string) => void;
}>({
  increaseFontSize: () => {},
  decreaseFontSize: () => {},
  resetFontSize: () => {},
  toggleHighContrast: () => {},
  toggleFullscreen: () => {},
  currentFontSize: 16,
  isHighContrast: false,
  isFullscreen: false,
  registerKeyboardShortcut: () => {},
  unregisterKeyboardShortcut: () => {},
});

// Hook to use accessibility features
export const useAccessibility = () => React.useContext(AccessibilityContext);

// Provider component for accessibility features
export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  const [fontSize, setFontSize] = useState(16);
  const [highContrast, setHighContrast] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [shortcuts, setShortcuts] = useState<KeyboardShortcut[]>([]);
  const { toast } = useToast();
  
  // Font size management
  const increaseFontSize = () => {
    if (fontSize < 24) {
      setFontSize(prevSize => prevSize + 1);
      toast({
        title: 'Font Size Increased',
        description: `Font size is now ${fontSize + 1}px`,
      });
    }
  };
  
  const decreaseFontSize = () => {
    if (fontSize > 12) {
      setFontSize(prevSize => prevSize - 1);
      toast({
        title: 'Font Size Decreased',
        description: `Font size is now ${fontSize - 1}px`,
      });
    }
  };
  
  const resetFontSize = () => {
    setFontSize(16);
    toast({
      title: 'Font Size Reset',
      description: 'Font size has been reset to default (16px)',
    });
  };
  
  // High contrast mode toggle
  const toggleHighContrast = () => {
    setHighContrast(prev => !prev);
    toast({
      title: `High Contrast ${!highContrast ? 'Enabled' : 'Disabled'}`,
      description: `High contrast mode has been ${!highContrast ? 'enabled' : 'disabled'} for better visibility`,
    });
  };
  
  // Fullscreen mode toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
        toast({
          title: 'Fullscreen Enabled',
          description: 'Press Esc to exit fullscreen mode',
        });
      }).catch(err => {
        toast({
          variant: 'destructive',
          title: 'Fullscreen Failed',
          description: `Error attempting to enable fullscreen mode: ${err.message}`,
        });
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => {
          setIsFullscreen(false);
          toast({
            title: 'Fullscreen Disabled',
            description: 'Exited fullscreen mode',
          });
        });
      }
    }
  };
  
  // Keyboard shortcuts registration
  const registerKeyboardShortcut = (shortcut: KeyboardShortcut) => {
    setShortcuts(prev => {
      // Remove any existing shortcut with the same key
      const filtered = prev.filter(s => s.key !== shortcut.key);
      return [...filtered, shortcut];
    });
  };
  
  const unregisterKeyboardShortcut = (key: string) => {
    setShortcuts(prev => prev.filter(s => s.key !== key));
  };
  
  // Global keyboard handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only process if not in an input field
      if (!(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        shortcuts.forEach(shortcut => {
          // Compare the pressed key combination with registered shortcuts
          const keys = shortcut.key.toLowerCase().split('+');
          const modifierKeys = {
            ctrl: e.ctrlKey,
            alt: e.altKey,
            shift: e.shiftKey,
            meta: e.metaKey,
          };
          
          const mainKey = keys.filter(k => !['ctrl', 'alt', 'shift', 'meta'].includes(k)).join('+');
          const modifiers = keys.filter(k => ['ctrl', 'alt', 'shift', 'meta'].includes(k));
          
          const modifiersMatch = modifiers.every(mod => modifierKeys[mod as keyof typeof modifierKeys]);
          const mainKeyMatches = e.key.toLowerCase() === mainKey.toLowerCase();
          
          if (modifiersMatch && mainKeyMatches) {
            e.preventDefault();
            shortcut.action();
          }
        });
      }
    };
    
    // Attach the keyboard event listener
    window.addEventListener('keydown', handleKeyDown as any);
    
    // Fullscreen change detection
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown as any);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [shortcuts]);
  
  // Apply font size to document
  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
    
    return () => {
      document.documentElement.style.fontSize = '';
    };
  }, [fontSize]);
  
  // Apply high contrast mode
  useEffect(() => {
    if (highContrast) {
      document.body.classList.add('high-contrast-mode');
    } else {
      document.body.classList.remove('high-contrast-mode');
    }
    
    return () => {
      document.body.classList.remove('high-contrast-mode');
    };
  }, [highContrast]);
  
  // Default keyboard shortcuts
  useEffect(() => {
    // Register default shortcuts
    registerKeyboardShortcut({
      key: 'ctrl+plus',
      description: 'Increase font size',
      action: increaseFontSize,
    });
    
    registerKeyboardShortcut({
      key: 'ctrl+minus',
      description: 'Decrease font size',
      action: decreaseFontSize,
    });
    
    registerKeyboardShortcut({
      key: 'ctrl+0',
      description: 'Reset font size',
      action: resetFontSize,
    });
    
    registerKeyboardShortcut({
      key: 'alt+c',
      description: 'Toggle high contrast mode',
      action: toggleHighContrast,
    });
    
    return () => {
      // Clean up default shortcuts
      unregisterKeyboardShortcut('ctrl+plus');
      unregisterKeyboardShortcut('ctrl+minus');
      unregisterKeyboardShortcut('ctrl+0');
      unregisterKeyboardShortcut('alt+c');
    };
  }, []);
  
  return (
    <AccessibilityContext.Provider
      value={{
        increaseFontSize,
        decreaseFontSize,
        resetFontSize,
        toggleHighContrast,
        toggleFullscreen,
        currentFontSize: fontSize,
        isHighContrast: highContrast,
        isFullscreen,
        registerKeyboardShortcut,
        unregisterKeyboardShortcut,
      }}
    >
      <style dangerouslySetInnerHTML={{
        __html: `
        /* High contrast mode styles */
        .high-contrast-mode {
          --background: black;
          --foreground: white;
          --muted: #333;
          --muted-foreground: #eee;
          --primary: #ffff00;
          --primary-foreground: black;
          --secondary: #00ffff;
          --secondary-foreground: black;
          --accent: #ff00ff;
          --accent-foreground: black;
          --destructive: #ff0000;
          --destructive-foreground: white;
          --border: white;
          --input: #333;
          --ring: white;
          --radius: 0;
          
          /* Additional high contrast enhancements */
          --card: black;
          --card-foreground: white;
          --popover: black;
          --popover-foreground: white;
          
          /* Ensure good focus visibility */
          *:focus {
            outline: 2px solid white !important;
            outline-offset: 2px !important;
          }
          
          /* Enhanced link visibility */
          a {
            text-decoration: underline !important;
            color: #ffff00 !important;
          }
          
          /* Button contrast */
          button, [role="button"] {
            border: 1px solid white !important;
            border-radius: 0 !important;
          }
        }
        `
      }} />
      {children}
    </AccessibilityContext.Provider>
  );
}

// Accessibility controls component for UI
export function AccessibilityControls({ className }: { className?: string }) {
  const { 
    increaseFontSize,
    decreaseFontSize,
    resetFontSize,
    toggleHighContrast,
    toggleFullscreen,
    currentFontSize,
    isHighContrast,
    isFullscreen
  } = useAccessibility();
  
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="icon"
              onClick={toggleHighContrast}
              aria-label={isHighContrast ? "Disable high contrast mode" : "Enable high contrast mode"}
            >
              {isHighContrast ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>{isHighContrast ? "Disable" : "Enable"} high contrast mode</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="icon"
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? "Exit fullscreen mode" : "Enter fullscreen mode"}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>{isFullscreen ? "Exit" : "Enter"} fullscreen mode</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <div className="flex items-center">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon"
                onClick={decreaseFontSize}
                aria-label="Decrease font size"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Decrease font size</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <span className="mx-1 text-sm font-medium">{currentFontSize}px</span>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon"
                onClick={increaseFontSize}
                aria-label="Increase font size"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Increase font size</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon" aria-label="Keyboard shortcuts">
            <Keyboard className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-2">
            <h3 className="font-medium">Keyboard Shortcuts</h3>
            <div className="text-sm space-y-1.5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Increase font size</span>
                <kbd className="px-2 py-0.5 bg-muted text-muted-foreground rounded text-xs">Ctrl +</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Decrease font size</span>
                <kbd className="px-2 py-0.5 bg-muted text-muted-foreground rounded text-xs">Ctrl -</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reset font size</span>
                <kbd className="px-2 py-0.5 bg-muted text-muted-foreground rounded text-xs">Ctrl 0</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Toggle high contrast</span>
                <kbd className="px-2 py-0.5 bg-muted text-muted-foreground rounded text-xs">Alt C</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Toggle fullscreen</span>
                <kbd className="px-2 py-0.5 bg-muted text-muted-foreground rounded text-xs">F11</kbd>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}