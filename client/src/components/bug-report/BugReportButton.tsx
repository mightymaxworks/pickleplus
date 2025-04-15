/**
 * PKL-278651-FEED-0001-BUG - In-App Bug Reporting System
 * Standalone Bug Report Button Component
 * 
 * A simplified version of the bug report button that doesn't rely on the module system.
 */

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useLocation } from 'wouter';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface BugReportButtonProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

/**
 * Standalone bug report button and form
 */
export function SimpleBugReportButton({ position = 'bottom-right' }: BugReportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [location] = useLocation();
  const { toast } = useToast();
  
  // Standardize position to always be in one location - top right corner
  // This avoids conflicts with various UI elements across different pages
  const buttonPosition = 'top-24 right-4';
  
  // Only show the button on specific inner pages, not on landing, login, or register
  const shouldShowButton = location.startsWith('/dashboard') || 
    location.startsWith('/profile') || 
    location.startsWith('/tournaments') || 
    location.startsWith('/matches') ||
    location.startsWith('/admin') ||
    location.startsWith('/leaderboard') ||
    location.startsWith('/mastery-paths');
    
  // Explicitly exclude these paths
  if (location === '/' || location === '/login' || location === '/register' || location === '/auth') {
    return null;
  }
  
  if (!shouldShowButton) {
    return null;
  }
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate submission
    setTimeout(() => {
      toast({
        title: "Bug report submitted",
        description: "Thank you for your feedback!",
      });
      setIsSubmitting(false);
      setIsOpen(false);
    }, 1000);
  };
  
  return (
    <>
      <Button
        variant="secondary"
        size="icon"
        className={`fixed ${buttonPosition} z-40 rounded-full h-12 w-12 shadow-lg flex items-center justify-center bg-amber-100 hover:bg-amber-200 border-amber-300 text-amber-700`}
        aria-label="Report a bug"
        onClick={() => setIsOpen(true)}
      >
        <AlertTriangle className="h-5 w-5" />
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Report a Bug</DialogTitle>
            <DialogDescription>
              Help us improve by reporting any issues you encounter.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" placeholder="Brief description of the issue" required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                placeholder="Detailed description of what happened" 
                className="h-28"
                required
              />
            </div>
            
            <input type="hidden" id="currentUrl" value={location} />
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Report"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}