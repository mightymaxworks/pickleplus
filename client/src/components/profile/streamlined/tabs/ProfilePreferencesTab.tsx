/**
 * PKL-278651-SPUI-0001: Profile Play Preferences Tab
 * Shows player's preferences with contextual editing
 */
import { FC, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';
import { 
  Clock, Map, Hand, Users, Calendar, Edit2, Plus,
  Compass, Ruler, Medal, ThumbsUp
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

interface ProfilePreferencesTabProps {
  user: any;
}

// Define days and times for schedule options
const scheduleDays = [
  { value: 'weekday-mornings', label: 'Weekday Mornings' },
  { value: 'weekday-afternoons', label: 'Weekday Afternoons' },
  { value: 'weekday-evenings', label: 'Weekday Evenings' },
  { value: 'weekend-mornings', label: 'Weekend Mornings' },
  { value: 'weekend-afternoons', label: 'Weekend Afternoons' },
  { value: 'weekend-evenings', label: 'Weekend Evenings' },
];

// Define playing surface options
const playingSurfaces = [
  { value: 'concrete', label: 'Concrete' },
  { value: 'asphalt', label: 'Asphalt' },
  { value: 'acrylic', label: 'Acrylic' },
  { value: 'wooden', label: 'Wooden' },
  { value: 'composite', label: 'Composite' },
  { value: 'clay', label: 'Clay' },
  { value: 'grass', label: 'Grass' },
  { value: 'carpet', label: 'Carpet' },
  { value: 'rubber', label: 'Rubber' },
];

// Define environment preferences
const environmentPreferences = [
  { value: 'indoor', label: 'Indoor' },
  { value: 'outdoor', label: 'Outdoor' },
  { value: 'no-preference', label: 'No Preference' },
];

// Define competition intensity levels
const competitionLevels = [
  { value: 'recreational', label: 'Recreational (friendly games)' },
  { value: 'intermediate', label: 'Intermediate (semi-competitive)' },
  { value: 'competitive', label: 'Competitive (focused on improvement)' },
  { value: 'highly-competitive', label: 'Highly Competitive (tournament level)' },
];

// Define format preferences
const formatPreferences = [
  { value: 'singles', label: 'Singles' },
  { value: 'doubles', label: 'Doubles' },
  { value: 'mixed-doubles', label: 'Mixed Doubles' },
  { value: 'all', label: 'All Formats' },
];

// Define hand preferences
const handPreferences = [
  { value: 'right', label: 'Right-handed' },
  { value: 'left', label: 'Left-handed' },
  { value: 'ambidextrous', label: 'Ambidextrous' },
];

const ProfilePreferencesTab: FC<ProfilePreferencesTabProps> = ({ user }) => {
  // Preference editing states
  const [isScheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [isLocationDialogOpen, setLocationDialogOpen] = useState(false);
  const [isPlayPrefsDialogOpen, setPlayPrefsDialogOpen] = useState(false);
  
  // Toggle states
  const [lookingForPartners, setLookingForPartners] = useState(!!user.lookingForPartners);
  const [mentorshipInterest, setMentorshipInterest] = useState(!!user.mentorshipInterest);
  
  // Form values
  const [schedule, setSchedule] = useState<string[]>(
    user.regularSchedule ? user.regularSchedule.split(',') : []
  );
  
  const [locationPrefs, setLocationPrefs] = useState({
    homeCourtLocations: user.homeCourtLocations || '',
    travelRadiusKm: user.travelRadiusKm || '',
  });
  
  const [playPrefs, setPlayPrefs] = useState({
    preferredFormat: user.preferredFormat || 'all',
    dominantHand: user.dominantHand || '',
    preferredSurface: user.preferredSurface || '',
    indoorOutdoorPreference: user.indoorOutdoorPreference || '',
    competitiveIntensity: user.competitiveIntensity || '',
  });

  // Handle saving schedule
  const handleSaveSchedule = async () => {
    try {
      await fetch('/api/profile/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          regularSchedule: schedule.join(',')
        })
      });

      queryClient.invalidateQueries({ queryKey: ['/api/auth/current-user'] });
      setScheduleDialogOpen(false);
      
      toast({
        title: 'Schedule updated',
        description: 'Your regular play schedule has been updated.',
      });
    } catch (err) {
      console.error('Error updating schedule:', err);
      toast({
        title: 'Update failed',
        description: 'Failed to update your schedule.',
        variant: 'destructive',
      });
    }
  };

  // Handle saving location preferences
  const handleSaveLocationPrefs = async () => {
    try {
      await fetch('/api/profile/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          homeCourtLocations: locationPrefs.homeCourtLocations,
          travelRadiusKm: locationPrefs.travelRadiusKm ? parseInt(locationPrefs.travelRadiusKm as string) : null
        })
      });

      queryClient.invalidateQueries({ queryKey: ['/api/auth/current-user'] });
      setLocationDialogOpen(false);
      
      toast({
        title: 'Location preferences updated',
        description: 'Your location preferences have been updated.',
      });
    } catch (err) {
      console.error('Error updating location preferences:', err);
      toast({
        title: 'Update failed',
        description: 'Failed to update your location preferences.',
        variant: 'destructive',
      });
    }
  };

  // Handle saving play preferences
  const handleSavePlayPrefs = async () => {
    try {
      await fetch('/api/profile/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          preferredFormat: playPrefs.preferredFormat,
          dominantHand: playPrefs.dominantHand,
          preferredSurface: playPrefs.preferredSurface,
          indoorOutdoorPreference: playPrefs.indoorOutdoorPreference,
          competitiveIntensity: playPrefs.competitiveIntensity
        })
      });

      queryClient.invalidateQueries({ queryKey: ['/api/auth/current-user'] });
      setPlayPrefsDialogOpen(false);
      
      toast({
        title: 'Play preferences updated',
        description: 'Your play preferences have been updated.',
      });
    } catch (err) {
      console.error('Error updating play preferences:', err);
      toast({
        title: 'Update failed',
        description: 'Failed to update your play preferences.',
        variant: 'destructive',
      });
    }
  };

  // Handle toggling looking for partners
  const handleToggleLookingForPartners = async () => {
    const newValue = !lookingForPartners;
    setLookingForPartners(newValue);
    
    try {
      await fetch('/api/profile/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          lookingForPartners: newValue
        })
      });

      queryClient.invalidateQueries({ queryKey: ['/api/auth/current-user'] });
      
      toast({
        title: 'Preference updated',
        description: newValue 
          ? 'You are now listed as looking for partners' 
          : 'You are no longer listed as looking for partners',
      });
    } catch (err) {
      console.error('Error updating preference:', err);
      setLookingForPartners(!newValue); // Revert UI
      toast({
        title: 'Update failed',
        description: 'Failed to update your preference.',
        variant: 'destructive',
      });
    }
  };

  // Handle toggling mentorship interest
  const handleToggleMentorshipInterest = async () => {
    const newValue = !mentorshipInterest;
    setMentorshipInterest(newValue);
    
    try {
      await fetch('/api/profile/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          mentorshipInterest: newValue
        })
      });

      queryClient.invalidateQueries({ queryKey: ['/api/auth/current-user'] });
      
      toast({
        title: 'Preference updated',
        description: newValue 
          ? 'You are now listed as interested in mentorship' 
          : 'You are no longer listed as interested in mentorship',
      });
    } catch (err) {
      console.error('Error updating preference:', err);
      setMentorshipInterest(!newValue); // Revert UI
      toast({
        title: 'Update failed',
        description: 'Failed to update your preference.',
        variant: 'destructive',
      });
    }
  };

  // Helper to format schedule for display
  const formatScheduleDisplay = () => {
    if (!user.regularSchedule) return 'Not specified';
    
    const days = user.regularSchedule.split(',');
    // Map to friendlier names and deduplicate
    const uniqueDays = Array.from(new Set(days)).map(day => {
      const match = scheduleDays.find(d => d.value === day);
      return match ? match.label : day;
    });
    
    return uniqueDays.join(', ');
  };

  // Format friendly names for other preferences
  const formatPreferredFormat = (format: string | null) => {
    if (!format) return 'Not specified';
    const match = formatPreferences.find(f => f.value === format);
    return match ? match.label : format;
  };

  const formatDominantHand = (hand: string | null) => {
    if (!hand) return 'Not specified';
    const match = handPreferences.find(h => h.value === hand);
    return match ? match.label : hand;
  };

  return (
    <div className="space-y-6">
      {/* Availability and Scheduling Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Availability
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative group">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Regular Play Schedule</h4>
                <p className="font-medium">
                  {user.regularSchedule ? formatScheduleDisplay() : (
                    <span className="text-muted-foreground italic">
                      Not specified <span className="text-xs text-primary ml-1">+10 XP</span>
                    </span>
                  )}
                </p>
              </div>
            </div>
            
            <Button 
              size="sm" 
              variant="ghost" 
              className="absolute top-0 right-0 opacity-0 group-hover:opacity-100"
              onClick={() => setScheduleDialogOpen(true)}
            >
              <Edit2 className="h-4 w-4 mr-1" />
              {user.regularSchedule ? 'Edit' : 'Add'}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Location Preferences Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Map className="h-5 w-5 text-primary" />
            Location Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          {user.homeCourtLocations || user.travelRadiusKm ? (
            <div className="relative group">
              <div className="space-y-4">
                {user.homeCourtLocations && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Home Court Locations</h4>
                    <p className="font-medium">{user.homeCourtLocations}</p>
                  </div>
                )}
                
                {user.travelRadiusKm && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Travel Radius</h4>
                    <p className="font-medium">{user.travelRadiusKm} km</p>
                  </div>
                )}
              </div>
              
              <Button 
                size="sm" 
                variant="ghost" 
                className="absolute top-0 right-0 opacity-0 group-hover:opacity-100"
                onClick={() => setLocationDialogOpen(true)}
              >
                <Edit2 className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <Map className="h-10 w-10 text-muted-foreground mb-2" />
              <h3 className="text-lg font-medium mb-1">No Location Preferences Added</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add your preferred playing locations and travel radius to find more suitable matches.
              </p>
              <Badge variant="outline" className="mb-2">+15 XP</Badge>
              <Button 
                variant="outline"
                onClick={() => setLocationDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Location Preferences
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Play Preferences Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <ThumbsUp className="h-5 w-5 text-primary" />
            Play Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Preferred Format</h4>
                <p className="font-medium">
                  {formatPreferredFormat(user.preferredFormat)}
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Dominant Hand</h4>
                <p className="font-medium">
                  {formatDominantHand(user.dominantHand)}
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Surface Preference</h4>
                <p className="font-medium">
                  {user.preferredSurface || (
                    <span className="text-muted-foreground italic">
                      Not specified <span className="text-xs text-primary ml-1">+5 XP</span>
                    </span>
                  )}
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Indoor/Outdoor</h4>
                <p className="font-medium">
                  {user.indoorOutdoorPreference || (
                    <span className="text-muted-foreground italic">
                      Not specified <span className="text-xs text-primary ml-1">+5 XP</span>
                    </span>
                  )}
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Competition Intensity</h4>
                <p className="font-medium">
                  {user.competitiveIntensity || (
                    <span className="text-muted-foreground italic">
                      Not specified <span className="text-xs text-primary ml-1">+5 XP</span>
                    </span>
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setPlayPrefsDialogOpen(true)}
              >
                <Edit2 className="h-4 w-4 mr-1" />
                Edit Preferences
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Partner Preferences Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Partner Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Looking for Partners</Label>
                <p className="text-sm text-muted-foreground">
                  Show other players that you're open to finding new playing partners
                </p>
              </div>
              <Switch
                checked={lookingForPartners}
                onCheckedChange={handleToggleLookingForPartners}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Mentorship Interest</Label>
                <p className="text-sm text-muted-foreground">
                  Indicate if you're interested in mentoring others or being mentored
                </p>
              </div>
              <Switch
                checked={mentorshipInterest}
                onCheckedChange={handleToggleMentorshipInterest}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Schedule Dialog */}
      <Dialog open={isScheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Regular Play Schedule</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <Label className="text-sm font-medium">When do you typically play?</Label>
              <div className="grid grid-cols-1 gap-2">
                {scheduleDays.map((day) => (
                  <div key={day.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={day.value}
                      checked={schedule.includes(day.value)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSchedule([...schedule, day.value]);
                        } else {
                          setSchedule(schedule.filter(s => s !== day.value));
                        }
                      }}
                    />
                    <Label htmlFor={day.value}>{day.label}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSchedule}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Location Preferences Dialog */}
      <Dialog open={isLocationDialogOpen} onOpenChange={setLocationDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Location Preferences</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="homeCourtLocations">Home Court Locations</Label>
              <Input
                id="homeCourtLocations"
                value={locationPrefs.homeCourtLocations}
                onChange={(e) => setLocationPrefs({...locationPrefs, homeCourtLocations: e.target.value})}
                placeholder="e.g. Central Park, Downtown Rec Center"
              />
              <p className="text-xs text-muted-foreground">
                List the names of courts or areas where you typically play
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="travelRadius">Travel Radius (km)</Label>
              <Input
                id="travelRadius"
                type="number"
                value={locationPrefs.travelRadiusKm}
                onChange={(e) => setLocationPrefs({...locationPrefs, travelRadiusKm: e.target.value})}
                placeholder="e.g. 15"
              />
              <p className="text-xs text-muted-foreground">
                How far are you willing to travel for matches?
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLocationDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveLocationPrefs}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Play Preferences Dialog */}
      <Dialog open={isPlayPrefsDialogOpen} onOpenChange={setPlayPrefsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Play Preferences</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="preferredFormat">Preferred Format</Label>
              <select
                id="preferredFormat"
                value={playPrefs.preferredFormat}
                onChange={(e) => setPlayPrefs({...playPrefs, preferredFormat: e.target.value})}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Select a format</option>
                {formatPreferences.map(format => (
                  <option key={format.value} value={format.value}>{format.label}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dominantHand">Dominant Hand</Label>
              <select
                id="dominantHand"
                value={playPrefs.dominantHand}
                onChange={(e) => setPlayPrefs({...playPrefs, dominantHand: e.target.value})}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Select hand</option>
                {handPreferences.map(hand => (
                  <option key={hand.value} value={hand.value}>{hand.label}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="preferredSurface">Preferred Surface</Label>
              <select
                id="preferredSurface"
                value={playPrefs.preferredSurface}
                onChange={(e) => setPlayPrefs({...playPrefs, preferredSurface: e.target.value})}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Select surface</option>
                {playingSurfaces.map(surface => (
                  <option key={surface.value} value={surface.value}>{surface.label}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="indoorOutdoor">Indoor/Outdoor Preference</Label>
              <select
                id="indoorOutdoor"
                value={playPrefs.indoorOutdoorPreference}
                onChange={(e) => setPlayPrefs({...playPrefs, indoorOutdoorPreference: e.target.value})}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Select preference</option>
                {environmentPreferences.map(env => (
                  <option key={env.value} value={env.value}>{env.label}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="competitiveIntensity">Competition Intensity</Label>
              <select
                id="competitiveIntensity"
                value={playPrefs.competitiveIntensity}
                onChange={(e) => setPlayPrefs({...playPrefs, competitiveIntensity: e.target.value})}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Select intensity level</option>
                {competitionLevels.map(level => (
                  <option key={level.value} value={level.value}>{level.label}</option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPlayPrefsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePlayPrefs}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfilePreferencesTab;