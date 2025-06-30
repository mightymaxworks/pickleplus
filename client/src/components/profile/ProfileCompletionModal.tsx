import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { X, User } from 'lucide-react';

interface ProfileCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  currentProfile: {
    firstName?: string | null;
    lastName?: string | null;
    username: string;
    email?: string | null;
  };
  missingFields: string[];
}

export function ProfileCompletionModal({ 
  isOpen, 
  onClose, 
  onComplete, 
  currentProfile, 
  missingFields 
}: ProfileCompletionModalProps) {
  const [firstName, setFirstName] = useState(currentProfile.firstName || '');
  const [lastName, setLastName] = useState(currentProfile.lastName || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setFirstName(currentProfile.firstName || '');
    setLastName(currentProfile.lastName || '');
  }, [currentProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName.trim() || !lastName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both first and last name",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/profile/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      toast({
        title: "Profile Updated",
        description: "Your name has been added to your profile successfully!"
      });

      onComplete();
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update Failed",
        description: "There was an error updating your profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Complete Your Profile
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Help other players recognize you by adding your first and last name. 
            Currently showing as "{currentProfile.username}" in match history.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {missingFields.includes('firstName') && (
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter your first name"
                  required
                />
              </div>
            )}

            {missingFields.includes('lastName') && (
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter your last name"
                  required
                />
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Skip for Now
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Updating...' : 'Update Profile'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}