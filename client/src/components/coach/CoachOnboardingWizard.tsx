/**
 * Coach Onboarding Wizard Component
 * PKL-278651-COACH-POST-ACCEPTANCE-001
 * 
 * Multi-step onboarding process for approved coaches
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Clock, AlertCircle, Upload, User, Calendar } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface OnboardingStatus {
  onboardingStage: 'pending' | 'profile_setup' | 'discovery_integration' | 'first_client' | 'active';
  profileCompletionPct: number;
  discoveryActive: boolean;
  firstSessionDate?: string;
  nextSteps: string[];
  requiredActions: string[];
}

interface CoachProfile {
  bio: string;
  specialties: string[];
  individualRate: number;
  groupRate: number;
  availabilitySchedule: string;
}

export default function CoachOnboardingWizard() {
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus | null>(null);
  const [profile, setProfile] = useState<CoachProfile>({
    bio: '',
    specialties: [],
    individualRate: 75,
    groupRate: 45,
    availabilitySchedule: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const specialtyOptions = [
    'Beginner Instruction',
    'Advanced Strategy',
    'Tournament Preparation',
    'Youth Development',
    'Senior Programs',
    'Doubles Strategy',
    'Singles Play',
    'Mental Game',
    'Fitness Training',
    'Injury Prevention'
  ];

  useEffect(() => {
    fetchOnboardingStatus();
  }, []);

  const fetchOnboardingStatus = async () => {
    try {
      const response = await apiRequest('GET', '/api/coach/onboarding-status');
      const data = await response.json();
      
      if (data.success) {
        setOnboardingStatus(data);
      }
    } catch (error) {
      console.error('Error fetching onboarding status:', error);
      toast({
        title: "Error",
        description: "Failed to load onboarding status",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    setSaving(true);
    try {
      const response = await apiRequest('PUT', '/api/coach/complete-profile-setup', profile);
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Profile Updated",
          description: "Your coaching profile has been updated successfully"
        });
        fetchOnboardingStatus(); // Refresh status
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleActivateDiscovery = async () => {
    try {
      const response = await apiRequest('POST', '/api/coach/activate-discovery');
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Discovery Activated",
          description: "Your coach profile is now discoverable by players"
        });
        fetchOnboardingStatus(); // Refresh status
      }
    } catch (error) {
      console.error('Error activating discovery:', error);
      toast({
        title: "Error",
        description: "Failed to activate discovery",
        variant: "destructive"
      });
    }
  };

  const getStageIcon = (stage: string, currentStage: string) => {
    const stages = ['profile_setup', 'discovery_integration', 'first_client', 'active'];
    const currentIndex = stages.indexOf(currentStage);
    const stageIndex = stages.indexOf(stage);
    
    if (stageIndex < currentIndex) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else if (stageIndex === currentIndex) {
      return <Clock className="h-5 w-5 text-blue-500" />;
    } else {
      return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStageStatus = (stage: string, currentStage: string) => {
    const stages = ['profile_setup', 'discovery_integration', 'first_client', 'active'];
    const currentIndex = stages.indexOf(currentStage);
    const stageIndex = stages.indexOf(stage);
    
    if (stageIndex < currentIndex) return 'completed';
    if (stageIndex === currentIndex) return 'current';
    return 'pending';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!onboardingStatus) {
    return (
      <div className="text-center py-8">
        <p>No onboarding information found. Please contact support.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Welcome to Pickle+ Coaching</h1>
        <p className="text-muted-foreground">Complete your onboarding to start coaching players</p>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Onboarding Progress
          </CardTitle>
          <CardDescription>
            Complete all steps to become an active coach
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Completion</span>
              <span>{onboardingStatus.profileCompletionPct}%</span>
            </div>
            <Progress value={onboardingStatus.profileCompletionPct} className="h-2" />
          </div>

          {/* Stage Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { key: 'profile_setup', title: 'Profile Setup', desc: 'Complete your coaching profile' },
              { key: 'discovery_integration', title: 'Discovery', desc: 'Activate coach discovery' },
              { key: 'first_client', title: 'First Client', desc: 'Receive first session request' },
              { key: 'active', title: 'Active Coach', desc: 'Full coaching status' }
            ].map((stage) => (
              <div key={stage.key} className="flex items-center gap-3 p-3 rounded-lg border">
                {getStageIcon(stage.key, onboardingStatus.onboardingStage)}
                <div>
                  <div className="font-medium text-sm">{stage.title}</div>
                  <div className="text-xs text-muted-foreground">{stage.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Stage Content */}
      {onboardingStatus.onboardingStage === 'profile_setup' && (
        <Card>
          <CardHeader>
            <CardTitle>Complete Your Coaching Profile</CardTitle>
            <CardDescription>
              Fill out your professional coaching information to proceed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Professional Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">Professional Bio *</Label>
              <Textarea
                id="bio"
                placeholder="Describe your coaching philosophy, experience, and approach (minimum 150 words)..."
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                className="min-h-32"
              />
              <div className="text-sm text-muted-foreground">
                {profile.bio.length}/150 words minimum
              </div>
            </div>

            {/* Specialties */}
            <div className="space-y-2">
              <Label>Coaching Specialties *</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {specialtyOptions.map((specialty) => (
                  <div key={specialty} className="flex items-center space-x-2">
                    <Checkbox
                      id={specialty}
                      checked={profile.specialties.includes(specialty)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setProfile({
                            ...profile,
                            specialties: [...profile.specialties, specialty]
                          });
                        } else {
                          setProfile({
                            ...profile,
                            specialties: profile.specialties.filter(s => s !== specialty)
                          });
                        }
                      }}
                    />
                    <Label htmlFor={specialty} className="text-sm">
                      {specialty}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Rates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="individualRate">Individual Lesson Rate ($/hour) *</Label>
                <Input
                  id="individualRate"
                  type="number"
                  value={profile.individualRate}
                  onChange={(e) => setProfile({ ...profile, individualRate: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="groupRate">Group Lesson Rate ($/hour) *</Label>
                <Input
                  id="groupRate"
                  type="number"
                  value={profile.groupRate}
                  onChange={(e) => setProfile({ ...profile, groupRate: Number(e.target.value) })}
                />
              </div>
            </div>

            {/* Availability */}
            <div className="space-y-2">
              <Label htmlFor="availability">Weekly Availability</Label>
              <Textarea
                id="availability"
                placeholder="Describe your typical weekly availability for coaching sessions..."
                value={profile.availabilitySchedule}
                onChange={(e) => setProfile({ ...profile, availabilitySchedule: e.target.value })}
              />
            </div>

            <Button 
              onClick={handleProfileUpdate} 
              disabled={saving || profile.bio.length < 150 || profile.specialties.length === 0}
              className="w-full"
            >
              {saving ? 'Saving...' : 'Complete Profile Setup'}
            </Button>
          </CardContent>
        </Card>
      )}

      {onboardingStatus.onboardingStage === 'discovery_integration' && (
        <Card>
          <CardHeader>
            <CardTitle>Activate Coach Discovery</CardTitle>
            <CardDescription>
              Make your profile discoverable to players looking for coaches
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Profile Setup Complete</span>
              </div>
              <p className="text-green-600 mt-1">
                Your coaching profile is ready for discovery activation
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">What happens when you activate discovery?</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Your profile appears in the "Find Coaches" directory</li>
                <li>Players can search for you by specialty and location</li>
                <li>You'll receive session booking requests</li>
                <li>Your coaching calendar becomes active</li>
              </ul>
            </div>

            <Button onClick={handleActivateDiscovery} className="w-full">
              Activate Coach Discovery
            </Button>
          </CardContent>
        </Card>
      )}

      {onboardingStatus.onboardingStage === 'first_client' && (
        <Card>
          <CardHeader>
            <CardTitle>Ready for Your First Client</CardTitle>
            <CardDescription>
              Your profile is active and discoverable by players
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-blue-700">
                <Calendar className="h-5 w-5" />
                <span className="font-medium">Discovery Active</span>
              </div>
              <p className="text-blue-600 mt-1">
                Players can now find and book sessions with you
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Next Steps:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Monitor your dashboard for session requests</li>
                <li>Respond promptly to player inquiries</li>
                <li>Prepare your coaching materials</li>
                <li>Set up your preferred communication methods</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {onboardingStatus.onboardingStage === 'active' && (
        <Card>
          <CardHeader>
            <CardTitle>Welcome to Active Coaching</CardTitle>
            <CardDescription>
              You're now a fully active coach in the Pickle+ community
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Onboarding Complete</span>
              </div>
              <p className="text-green-600 mt-1">
                You've successfully completed the coach onboarding process
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Continue Your Coaching Journey:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Maintain high coaching standards</li>
                <li>Consider PCP certification advancement</li>
                <li>Participate in coach community events</li>
                <li>Mentor new coaches joining the platform</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Required Actions */}
      {onboardingStatus.requiredActions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Required Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {onboardingStatus.requiredActions.map((action, index) => (
                <li key={index} className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-amber-500 rounded-full"></div>
                  <span className="text-sm">{action}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}