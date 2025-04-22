/**
 * PKL-278651-FEED-0001-BUG - In-App Bug Reporting System
 * Standalone Bug Report Button Component - Fixed Version
 * 
 * A simplified version of the bug report button that doesn't rely on the module system.
 * Corrected to prevent re-rendering issues.
 */

import { useState, useCallback } from 'react';
import { AlertTriangle } from 'lucide-react';
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
import { useAuth } from '@/hooks/useAuth';

interface BugReportButtonProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

/**
 * Simple bug report button - fixed to prevent infinite re-renders
 */
export function SimpleBugReportButton({ position = 'bottom-right' }: BugReportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Use useCallback to prevent recreating the function on each render
  const toggleDialog = useCallback(() => {
    setIsOpen(prevState => !prevState);
  }, []);
  
  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
  }, []);
  
  const handleSubmit = useCallback((e: React.FormEvent) => {
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
  }, [toast]);
  
  // Don't show the button if user is not logged in
  if (!user) {
    return null;
  }
  
  // Position below the ticker (top-36 positions it below the ticker and header)
  const buttonPosition = 'top-36 right-4';
  
  return (
    <>
      <Button
        variant="secondary"
        size="icon"
        className={`fixed ${buttonPosition} z-40 rounded-full h-12 w-12 shadow-lg flex items-center justify-center bg-amber-100 hover:bg-amber-200 border-amber-300 text-amber-700`}
        aria-label="Report a bug"
        onClick={toggleDialog}
      >
        <AlertTriangle className="h-5 w-5" />
      </Button>
      
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
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