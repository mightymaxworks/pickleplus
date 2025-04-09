/**
 * PKL-278651-SPUI-0001: Streamlined Profile Hero Component
 * Striking visual header with user's primary information
 */
import { FC, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MapPin, Medal, Edit2, Camera } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';

interface StreamlinedProfileHeroProps {
  user: any;
  className?: string;
}

const StreamlinedProfileHero: FC<StreamlinedProfileHeroProps> = ({ user, className = '' }) => {
  const [isEditingPhoto, setIsEditingPhoto] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [displayName, setDisplayName] = useState(user.displayName || '');
  const [location, setLocation] = useState(user.location || '');

  const userInitials = user.displayName
    ? user.displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase()
    : user.username.substring(0, 2).toUpperCase();

  const handleSaveDisplayName = async () => {
    try {
      await fetch('/api/profile/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          displayName,
          location
        })
      });

      queryClient.invalidateQueries({ queryKey: ['/api/auth/current-user'] });
      setIsEditingName(false);
      
      toast({
        title: 'Profile updated',
        description: 'Your profile information has been updated.',
      });
    } catch (err) {
      console.error('Error updating profile:', err);
      toast({
        title: 'Update failed',
        description: 'Failed to update your profile information.',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <Card className={`w-full overflow-hidden relative ${className}`}>
        {/* Banner/Background */}
        <div 
          className="h-40 bg-gradient-to-r from-primary/80 via-primary/60 to-primary/40 flex items-end justify-end p-4"
        >
          <Button 
            variant="secondary" 
            size="sm" 
            className="text-xs"
            onClick={() => setIsEditingName(true)}
          >
            <Edit2 className="h-3 w-3 mr-1" />
            Edit Profile
          </Button>
        </div>

        {/* Profile Content */}
        <div className="px-6 pb-6 pt-14 relative">
          {/* Profile Picture */}
          <div className="absolute -top-12 left-6">
            <div className="relative group">
              <Avatar className="h-24 w-24 border-4 border-background">
                {user.avatarUrl ? (
                  <AvatarImage src={user.avatarUrl} alt={user.displayName || user.username} />
                ) : null}
                <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              
              <div 
                className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                onClick={() => setIsEditingPhoto(true)}
              >
                <Camera className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="ml-28 sm:ml-0 sm:mt-0">
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold truncate">
                  {user.displayName || user.username}
                </h1>
                <div className="flex items-center text-muted-foreground text-sm mt-1">
                  <MapPin className="h-3 w-3 mr-1" />
                  {user.location || 'No location set'}
                </div>
              </div>
              
              <div className="flex mt-2 sm:mt-0 gap-2">
                {user.isFoundingMember && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Medal className="h-3 w-3" />
                    Founding Member
                  </Badge>
                )}

              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditingName} onOpenChange={setIsEditingName}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile Information</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="displayName" className="text-sm font-medium">
                Display Name
              </label>
              <input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="location" className="text-sm font-medium">
                Location
              </label>
              <input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditingName(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveDisplayName}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Photo Upload Dialog (placeholder) */}
      <Dialog open={isEditingPhoto} onOpenChange={setIsEditingPhoto}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Profile Photo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex justify-center">
              <Avatar className="h-32 w-32">
                {user.avatarUrl ? (
                  <AvatarImage src={user.avatarUrl} alt={user.displayName || user.username} />
                ) : null}
                <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="text-center">
              <Button variant="outline" className="mr-2">
                Upload Photo
              </Button>
              <Button variant="destructive">
                Remove Photo
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StreamlinedProfileHero;