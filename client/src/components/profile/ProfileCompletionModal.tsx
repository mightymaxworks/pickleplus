import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
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
  const { t } = useLanguage();

  useEffect(() => {
    setFirstName(currentProfile.firstName || '');
    setLastName(currentProfile.lastName || '');
  }, [currentProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName.trim() || !lastName.trim()) {
      toast({
        title: t('profile.completion.missingInfo'),
        description: t('profile.completion.provideBothNames'),
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
        title: t('profile.completion.profileUpdated'),
        description: t('profile.completion.nameAddedSuccess')
      });

      onComplete();
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: t('profile.completion.updateFailed'),
        description: t('profile.completion.updateError'),
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
            {t('profile.completion.title')}
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
            {t('profile.completion.description', `Help other players recognize you by adding your first and last name. Currently showing as "${currentProfile.username}" in match history.`)}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {missingFields.includes('firstName') && (
              <div className="space-y-2">
                <Label htmlFor="firstName">{t('profile.completion.firstName')}</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder={t('profile.completion.firstNamePlaceholder')}
                  required
                />
              </div>
            )}

            {missingFields.includes('lastName') && (
              <div className="space-y-2">
                <Label htmlFor="lastName">{t('profile.completion.lastName')}</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder={t('profile.completion.lastNamePlaceholder')}
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
{t('profile.completion.skipForNow')}
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitting}
              >
{isSubmitting ? t('profile.completion.updating') : t('profile.completion.updateProfile')}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}