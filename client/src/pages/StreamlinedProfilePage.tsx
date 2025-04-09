/**
 * PKL-278651-SPUI-0001: Streamlined Profile User Interface
 * A sleek, modern profile interface with persistent top navigation and mobile-optimized experience
 */
import { FC, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { 
  UserCircle, Settings, Award, Clock, Info, Dumbbell, BookOpen,
  Trophy, MapPin, BadgeCheck, Medal, Edit2, Check, X, Calendar, Clipboard,
  Home, Activity, User, Shield, LogOut, Bell, Menu
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { queryClient } from '@/lib/queryClient';
import { EnhancedUser } from '@/types/enhanced-user';
import { AppHeader } from '@/components/layout/AppHeader';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Streamlined Profile Page
 * A comprehensive profile page with mobile-first design and persistent navigation
 */
const StreamlinedProfilePage: FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingFields, setEditingFields] = useState<Record<string, boolean>>({});
  const [, navigate] = useLocation();
  
  // Overview tab fields
  const [bioField, setBioField] = useState('');
  const [playingStyleField, setPlayingStyleField] = useState('');
  const [playingSinceField, setPlayingSinceField] = useState('');
  const [heightField, setHeightField] = useState('');
  const [reachField, setReachField] = useState('');
  const [preferredPositionField, setPreferredPositionField] = useState('');
  
  // Equipment tab fields
  const [paddleBrandField, setPaddleBrandField] = useState('');
  const [paddleModelField, setPaddleModelField] = useState('');
  const [backupPaddleBrandField, setBackupPaddleBrandField] = useState('');
  const [backupPaddleModelField, setBackupPaddleModelField] = useState('');
  const [apparelBrandField, setApparelBrandField] = useState('');
  const [shoesBrandField, setShoesBrandField] = useState('');
  const [otherEquipmentField, setOtherEquipmentField] = useState('');
  
  // Preferences tab fields
  const [preferredFormatField, setPreferredFormatField] = useState('');
  const [dominantHandField, setDominantHandField] = useState('');
  const [lookingForPartnersField, setLookingForPartnersField] = useState(false);
  const [mentorshipInterestField, setMentorshipInterestField] = useState(false);
  
  // Stats & Ratings tab fields
  const [skillLevelField, setSkillLevelField] = useState('');
  const [forehandStrengthField, setForehandStrengthField] = useState<number>(0);
  const [backhandStrengthField, setBackhandStrengthField] = useState<number>(0);
  const [servePowerField, setServePowerField] = useState<number>(0);
  const [dinkAccuracyField, setDinkAccuracyField] = useState<number>(0); 
  const [thirdShotConsistencyField, setThirdShotConsistencyField] = useState<number>(0);
  const [courtCoverageField, setCourtCoverageField] = useState<number>(0);

  // Define dropdown options
  const playingStyleOptions = [
    { value: 'aggressive', label: 'Aggressive' },
    { value: 'defensive', label: 'Defensive' },
    { value: 'strategic', label: 'Strategic' },
    { value: 'all-court', label: 'All-Court' },
  ];
  
  const paddleBrandOptions = [
    { value: 'SHOT3', label: 'SHOT3' },
    { value: 'Selkirk', label: 'Selkirk' },
    { value: 'Joola', label: 'Joola' },
    { value: 'Engage', label: 'Engage' },
    { value: 'Franklin', label: 'Franklin' },
    { value: 'Head', label: 'Head' },
    { value: 'Paddletek', label: 'Paddletek' },
    { value: 'ProKennex', label: 'ProKennex' },
    { value: 'Gamma', label: 'Gamma' },
    { value: 'Other', label: 'Other' },
  ];
  
  const apparelBrandOptions = [
    { value: 'Nike', label: 'Nike' },
    { value: 'Adidas', label: 'Adidas' },
    { value: 'Under Armour', label: 'Under Armour' },
    { value: 'New Balance', label: 'New Balance' },
    { value: 'Fila', label: 'Fila' },
    { value: 'Lululemon', label: 'Lululemon' },
    { value: 'Wilson', label: 'Wilson' },
    { value: 'SHOT3', label: 'SHOT3' },
    { value: 'Joola', label: 'Joola' },
    { value: 'Other', label: 'Other' },
  ];
  
  const shoesBrandOptions = [
    { value: 'Asics', label: 'Asics' },
    { value: 'Nike', label: 'Nike' },
    { value: 'Adidas', label: 'Adidas' },
    { value: 'New Balance', label: 'New Balance' },
    { value: 'K-Swiss', label: 'K-Swiss' },
    { value: 'Under Armour', label: 'Under Armour' },
    { value: 'Wilson', label: 'Wilson' },
    { value: 'Babolat', label: 'Babolat' },
    { value: 'Fila', label: 'Fila' },
    { value: 'Other', label: 'Other' },
  ];
  
  const formatOptions = [
    { value: 'singles', label: 'Singles' },
    { value: 'doubles', label: 'Doubles' },
    { value: 'mixed', label: 'Mixed Doubles' },
    { value: 'all', label: 'All Formats' },
  ];
  
  const handOptions = [
    { value: 'right', label: 'Right-Handed' },
    { value: 'left', label: 'Left-Handed' },
    { value: 'ambidextrous', label: 'Ambidextrous' },
  ];
  
  const positionOptions = [
    { value: 'forehand', label: 'Forehand' },
    { value: 'backhand', label: 'Backhand' },
    { value: 'both', label: 'Both Sides' },
  ];
  
  const skillLevelOptions = [
    { value: '2.0', label: '2.0' },
    { value: '2.5', label: '2.5' },
    { value: '3.0', label: '3.0' },
    { value: '3.5', label: '3.5' },
    { value: '4.0', label: '4.0' },
    { value: '4.5', label: '4.5' },
    { value: '5.0', label: '5.0' },
    { value: '5.5', label: '5.5' },
    { value: '6.0', label: '6.0+ (Pro)' },
  ];
  
  // Function to handle saving profile updates
  const saveProfileField = async (fieldName: string, value: string | boolean) => {
    try {
      await fetch('/api/profile/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          [fieldName]: value,
        }),
      });
      
      // Invalidate the user query to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/auth/current-user'] });
      
      // Exit edit mode for this field
      setEditingFields(prev => ({ ...prev, [fieldName]: false }));
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
      
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error updating profile',
        description: 'There was an error updating your profile. Please try again.',
        variant: 'destructive',
      });
      
      return false;
    }
  };

  // Fetch current user data
  const { data: user, isLoading, error } = useQuery<EnhancedUser>({
    queryKey: ['/api/auth/current-user'],
  });
  
  // Initialize form fields when user data is loaded
  useEffect(() => {
    if (user) {
      // Overview tab fields
      setBioField(user.bio || '');
      setPlayingStyleField(user.playingStyle || '');
      setPlayingSinceField(user.playingSince || '');
      setHeightField(user.height?.toString() || '');
      setReachField(user.reach?.toString() || '');
      setPreferredPositionField(user.preferredPosition || '');
      
      // Equipment tab fields
      setPaddleBrandField(user.paddleBrand || '');
      setPaddleModelField(user.paddleModel || '');
      setBackupPaddleBrandField(user.backupPaddleBrand || '');
      setBackupPaddleModelField(user.backupPaddleModel || '');
      setApparelBrandField(user.apparelBrand || '');
      setShoesBrandField(user.shoesBrand || '');
      setOtherEquipmentField(user.otherEquipment || '');
      
      // Preferences tab fields
      setPreferredFormatField(user.preferredFormat || '');
      setDominantHandField(user.dominantHand || '');
      setLookingForPartnersField(user.lookingForPartners || false);
      setMentorshipInterestField(user.mentorshipInterest || false);
      
      // Stats & Ratings tab fields
      setSkillLevelField(user.skillLevel || '');
      setForehandStrengthField(user.forehandStrength || 0);
      setBackhandStrengthField(user.backhandStrength || 0);
      setServePowerField(user.servePower || 0);
      setDinkAccuracyField(user.dinkAccuracy || 0);
      setThirdShotConsistencyField(user.thirdShotConsistency || 0);
      setCourtCoverageField(user.courtCoverage || 0);
    }
  }, [user]);

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (error || !user) {
    toast({
      title: 'Error',
      description: 'Failed to load profile data',
      variant: 'destructive',
    });
    return <div className="p-4">Failed to load profile data</div>;
  }

  return (
    <div className="container px-4 pb-16 max-w-screen-xl mx-auto">
      {/* Standardized Header using AppHeader component */}
      <AppHeader />
      
      {/* Edit Profile Button (Only visible on profile page) - Floating button */}
      <div className="fixed bottom-6 right-6 z-20 md:static md:mt-4 md:mb-2 md:float-right">
        <Button 
          variant={isEditMode ? "destructive" : "default"}
          size="sm" 
          className="shadow-lg md:shadow-none"
          onClick={() => setIsEditMode(!isEditMode)}
        >
          {isEditMode ? (
            <>
              <X className="h-4 w-4 mr-2" />
              Exit Edit
            </>
          ) : (
            <>
              <Edit2 className="h-4 w-4 mr-2" />
              Edit Profile
            </>
          )}
        </Button>
      </div>
      
      {/* Hero Section with Profile Header */}
      <Card className="w-full overflow-hidden relative mt-4">
        {/* Banner/Background */}
        <div className="h-40 bg-gradient-to-r from-primary/80 via-primary/60 to-primary/40 flex items-end justify-end p-4">
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
                  {user.avatarInitials || user.username.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
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
                {user.skillLevel && (
                  <Badge variant="outline" className="bg-primary/10">
                    {user.skillLevel} Skill Level
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Quick Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-4">
        {/* XP Level Card */}
        <Card className="overflow-hidden">
          <div className="p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="font-medium text-sm">XP Level</div>
              <Badge variant="outline" className="text-xs">
                Level {user.level || 1}
              </Badge>
            </div>
            <div className="mb-2">
              <Progress value={75} className="h-2" />
            </div>
            <div className="text-xs text-muted-foreground">
              {user.xp || 0} XP total
            </div>
          </div>
        </Card>
        
        {/* Skill Level Card */}
        <Card className="overflow-hidden">
          <div className="p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="font-medium text-sm">Skill Level</div>
              <BadgeCheck className="h-4 w-4 text-yellow-500" />
            </div>
            <div className="mb-2">
              <Progress value={user.skillLevel ? (parseFloat(user.skillLevel) / 7) * 100 : 0} className="h-2" />
            </div>
            <div className="text-sm font-semibold">
              {user.skillLevel || 'Not set'}
            </div>
          </div>
        </Card>
        
        {/* Rating Card */}
        <Card className="overflow-hidden">
          <div className="p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="font-medium text-sm">CourtIQ™</div>
              <Trophy className="h-4 w-4 text-blue-500" />
            </div>
            <div className="text-sm font-semibold mb-1">
              {user.rankingPoints || 0} pts
            </div>
            <Badge 
              variant="outline" 
              className="bg-blue-100 text-blue-800 hover:bg-blue-100"
            >
              Beginner
            </Badge>
          </div>
        </Card>
        
        {/* Match Stats Card */}
        <Card className="overflow-hidden">
          <div className="p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="font-medium text-sm">Match Stats</div>
              <Award className="h-4 w-4 text-amber-500" />
            </div>
            <div className="flex flex-col">
              <div className="text-sm mb-1">
                {user.totalMatches || 0} matches played
              </div>
              <div className="text-sm font-semibold">
                {user.totalMatches && user.matchesWon ? Math.round((user.matchesWon / user.totalMatches) * 100) : 0}% win rate
              </div>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Tabbed Content */}
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="mt-6"
      >
        <div className="sticky top-16 z-10 bg-background pt-2 pb-2 border-b">
          <TabsList className="w-full h-auto justify-start gap-1 overflow-x-auto flex-nowrap scrollbar-hide p-1 mb-2">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <UserCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <Dumbbell className="h-4 w-4" />
              <span className="hidden sm:inline">Stats & Ratings</span>
            </TabsTrigger>
            <TabsTrigger value="equipment" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Equipment</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Play Preferences</span>
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              <span className="hidden sm:inline">Achievements</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Match History</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="mt-4">
          <TabsContent value="overview" className="mt-0">
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Player Information</h3>
                  {isEditMode && (
                    <p className="text-xs text-muted-foreground">Click on any field to edit</p>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Bio</h4>
                    {isEditMode && editingFields.bio ? (
                      <div className="space-y-2">
                        <Textarea 
                          value={bioField}
                          onChange={(e) => setBioField(e.target.value)}
                          className="min-h-[100px] resize-none"
                          placeholder="Write a short bio about yourself"
                        />
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              setBioField(user.bio || '');
                              setEditingFields(prev => ({ ...prev, bio: false }));
                            }}
                          >
                            <X className="h-4 w-4 mr-1" /> Cancel
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={() => saveProfileField('bio', bioField)}
                          >
                            <Check className="h-4 w-4 mr-1" /> Save
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div 
                        className={`relative ${isEditMode ? 'cursor-pointer hover:bg-muted/50 rounded p-2 -ml-2' : ''}`}
                        onClick={() => {
                          if (isEditMode) {
                            setEditingFields(prev => ({ ...prev, bio: true }));
                          }
                        }}
                      >
                        <p>{user.bio || 'No bio specified'}</p>
                        {isEditMode && (
                          <Edit2 className="h-4 w-4 absolute top-2 right-2 text-muted-foreground" />
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Playing Style</h4>
                    {isEditMode && editingFields.playingStyle ? (
                      <div className="space-y-2">
                        <Select 
                          value={playingStyleField} 
                          onValueChange={(value) => setPlayingStyleField(value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select your playing style" />
                          </SelectTrigger>
                          <SelectContent>
                            {playingStyleOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              setPlayingStyleField(user.playingStyle || '');
                              setEditingFields(prev => ({ ...prev, playingStyle: false }));
                            }}
                          >
                            <X className="h-4 w-4 mr-1" /> Cancel
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={() => saveProfileField('playingStyle', playingStyleField)}
                          >
                            <Check className="h-4 w-4 mr-1" /> Save
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div 
                        className={`relative ${isEditMode ? 'cursor-pointer hover:bg-muted/50 rounded p-2 -ml-2' : ''}`}
                        onClick={() => {
                          if (isEditMode) {
                            setEditingFields(prev => ({ ...prev, playingStyle: true }));
                          }
                        }}
                      >
                        <p className="capitalize">{user.playingStyle || 'Not specified'}</p>
                        {isEditMode && (
                          <Edit2 className="h-4 w-4 absolute top-2 right-2 text-muted-foreground" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Playing Since</h4>
                  {isEditMode && editingFields.playingSince ? (
                    <div className="space-y-2">
                      <Input 
                        type="text"
                        value={playingSinceField}
                        onChange={(e) => setPlayingSinceField(e.target.value)}
                        placeholder="When did you start playing? (e.g., 2023)"
                      />
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            setPlayingSinceField(user.playingSince || '');
                            setEditingFields(prev => ({ ...prev, playingSince: false }));
                          }}
                        >
                          <X className="h-4 w-4 mr-1" /> Cancel
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => saveProfileField('playingSince', playingSinceField)}
                        >
                          <Check className="h-4 w-4 mr-1" /> Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      className={`relative ${isEditMode ? 'cursor-pointer hover:bg-muted/50 rounded p-2 -ml-2' : ''}`}
                      onClick={() => {
                        if (isEditMode) {
                          setEditingFields(prev => ({ ...prev, playingSince: true }));
                        }
                      }}
                    >
                      <p>{user.playingSince || 'Not specified'}</p>
                      {isEditMode && (
                        <Edit2 className="h-4 w-4 absolute top-2 right-2 text-muted-foreground" />
                      )}
                    </div>
                  )}
                </div>
                
                {/* Physical Attributes Section */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">Physical Attributes</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Height Field */}
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Height (cm)</h4>
                      {isEditMode && editingFields.height ? (
                        <div className="space-y-2">
                          <Input 
                            type="number"
                            value={heightField}
                            onChange={(e) => setHeightField(e.target.value)}
                            placeholder="Your height in cm"
                          />
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setHeightField(user.height?.toString() || '');
                                setEditingFields(prev => ({ ...prev, height: false }));
                              }}
                            >
                              <X className="h-4 w-4 mr-1" /> Cancel
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => saveProfileField('height', heightField ? parseInt(heightField) : null)}
                            >
                              <Check className="h-4 w-4 mr-1" /> Save
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div 
                          className={`relative ${isEditMode ? 'cursor-pointer hover:bg-muted/50 rounded p-2 -ml-2' : ''}`}
                          onClick={() => {
                            if (isEditMode) {
                              setEditingFields(prev => ({ ...prev, height: true }));
                            }
                          }}
                        >
                          <p>{user.height || 'Not specified'}</p>
                          {isEditMode && (
                            <Edit2 className="h-4 w-4 absolute top-2 right-2 text-muted-foreground" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="stats" className="mt-0">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Stats & Ratings</h3>
              <p className="text-muted-foreground">View and update your skill level and player ratings.</p>
              
              {/* Skill Level */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Skill Level</h4>
                  {user.skillLevel && (
                    <Badge variant="outline" className="bg-primary/10">
                      {user.skillLevel}
                    </Badge>
                  )}
                </div>
                
                {isEditMode && editingFields.skillLevel ? (
                  <div className="space-y-2">
                    <Select
                      value={skillLevelField}
                      onValueChange={(value) => setSkillLevelField(value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your skill level" />
                      </SelectTrigger>
                      <SelectContent>
                        {skillLevelOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSkillLevelField(user.skillLevel || '');
                          setEditingFields(prev => ({ ...prev, skillLevel: false }));
                        }}
                      >
                        <X className="h-4 w-4 mr-1" /> Cancel
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => saveProfileField('skillLevel', skillLevelField)}
                      >
                        <Check className="h-4 w-4 mr-1" /> Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div 
                    className={`relative ${isEditMode ? 'cursor-pointer hover:bg-muted/50 rounded p-2 -ml-2' : ''}`}
                    onClick={() => {
                      if (isEditMode) {
                        setEditingFields(prev => ({ ...prev, skillLevel: true }));
                      }
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <p>{user.skillLevel ? `${user.skillLevel} Skill Level` : 'Not specified'}</p>
                      {isEditMode && (
                        <Edit2 className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="equipment" className="mt-0">
            <Card className="p-6">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Equipment</h3>
                  {isEditMode && (
                    <p className="text-xs text-muted-foreground">Click on any field to edit</p>
                  )}
                </div>

                {/* Primary Paddle */}
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Primary Paddle</h4>
                  {isEditMode && (editingFields.paddleBrand || editingFields.paddleModel) ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="paddleBrand">Brand</Label>
                        <Select
                          value={paddleBrandField}
                          onValueChange={(value) => setPaddleBrandField(value)}
                        >
                          <SelectTrigger id="paddleBrand">
                            <SelectValue placeholder="Select paddle brand" />
                          </SelectTrigger>
                          <SelectContent>
                            {paddleBrandOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="paddleModel">Model</Label>
                        <Input
                          id="paddleModel"
                          value={paddleModelField}
                          onChange={(e) => setPaddleModelField(e.target.value)}
                          placeholder="e.g., Pro X, Carbon Elite, etc."
                        />
                      </div>
                      
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setPaddleBrandField(user.paddleBrand || '');
                            setPaddleModelField(user.paddleModel || '');
                            setEditingFields(prev => ({ 
                              ...prev, 
                              paddleBrand: false,
                              paddleModel: false 
                            }));
                          }}
                        >
                          <X className="h-4 w-4 mr-1" /> Cancel
                        </Button>
                        <Button 
                          size="sm"
                          onClick={async () => {
                            const brandSaved = await saveProfileField('paddleBrand', paddleBrandField);
                            if (brandSaved) {
                              await saveProfileField('paddleModel', paddleModelField);
                            }
                          }}
                        >
                          <Check className="h-4 w-4 mr-1" /> Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      className={`relative ${isEditMode ? 'cursor-pointer hover:bg-muted/50 rounded p-2 -ml-2' : ''}`}
                      onClick={() => {
                        if (isEditMode) {
                          setEditingFields(prev => ({ 
                            ...prev, 
                            paddleBrand: true,
                            paddleModel: true 
                          }));
                        }
                      }}
                    >
                      {user.paddleBrand || user.paddleModel ? (
                        <div>
                          <div className="text-sm font-medium">{user.paddleBrand || 'Unknown Brand'}</div>
                          <div className="text-muted-foreground">{user.paddleModel || 'Unknown Model'}</div>
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No paddle information</p>
                      )}
                      {isEditMode && (
                        <Edit2 className="h-4 w-4 absolute top-2 right-2 text-muted-foreground" />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>
      
          <TabsContent value="preferences" className="mt-0">
            <Card className="p-6">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Play Preferences</h3>
                  {isEditMode && (
                    <p className="text-xs text-muted-foreground">Click on any field to edit</p>
                  )}
                </div>
                
                {/* Preferred Format */}
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Preferred Format</h4>
                  {isEditMode && editingFields.preferredFormat ? (
                    <div className="space-y-2">
                      <Select 
                        value={preferredFormatField} 
                        onValueChange={(value) => setPreferredFormatField(value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select your preferred format" />
                        </SelectTrigger>
                        <SelectContent>
                          {formatOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            setPreferredFormatField(user.preferredFormat || '');
                            setEditingFields(prev => ({ ...prev, preferredFormat: false }));
                          }}
                        >
                          <X className="h-4 w-4 mr-1" /> Cancel
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => saveProfileField('preferredFormat', preferredFormatField)}
                        >
                          <Check className="h-4 w-4 mr-1" /> Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      className={`relative ${isEditMode ? 'cursor-pointer hover:bg-muted/50 rounded p-2 -ml-2' : ''}`}
                      onClick={() => {
                        if (isEditMode) {
                          setEditingFields(prev => ({ ...prev, preferredFormat: true }));
                        }
                      }}
                    >
                      <p className="capitalize">
                        {user.preferredFormat === 'all' ? 'All Formats' : 
                         user.preferredFormat === 'singles' ? 'Singles' :
                         user.preferredFormat === 'doubles' ? 'Doubles' :
                         user.preferredFormat === 'mixed' ? 'Mixed Doubles' :
                         'Not specified'}
                      </p>
                      {isEditMode && (
                        <Edit2 className="h-4 w-4 absolute top-2 right-2 text-muted-foreground" />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="achievements" className="mt-0">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Achievements</h3>
              <p className="text-muted-foreground">View your earned achievements and badges.</p>
              
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {user.isFoundingMember && (
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4 flex flex-col items-center text-center">
                    <Medal className="h-10 w-10 text-amber-500 mb-2" />
                    <h4 className="font-semibold text-amber-800 dark:text-amber-300">Founding Member</h4>
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Early supporter of the Pickle+ platform</p>
                  </div>
                )}
                
                <div className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex flex-col items-center text-center opacity-50">
                  <Trophy className="h-10 w-10 text-gray-400 mb-2" />
                  <h4 className="font-semibold text-gray-500">Tournament Winner</h4>
                  <p className="text-xs text-gray-500 mt-1">Win your first tournament</p>
                </div>
                
                <div className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex flex-col items-center text-center opacity-50">
                  <Award className="h-10 w-10 text-gray-400 mb-2" />
                  <h4 className="font-semibold text-gray-500">Perfect Match</h4>
                  <p className="text-xs text-gray-500 mt-1">Win a match without losing a point</p>
                </div>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="history" className="mt-0">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Match History</h3>
              <p className="text-muted-foreground mb-6">View your recent match history and results.</p>
              
              {user.totalMatches === 0 ? (
                <div className="py-8 text-center bg-muted/20 rounded-lg border border-dashed border-muted">
                  <Calendar className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                  <h4 className="text-lg font-medium mb-2">No Matches Recorded</h4>
                  <p className="text-muted-foreground text-sm max-w-md mx-auto">
                    You haven't recorded any matches yet. Start tracking your games to see your history and stats here.
                  </p>
                  <Button 
                    variant="default" 
                    className="mt-4"
                    onClick={() => navigate('/record-match')}
                  >
                    <Clipboard className="h-4 w-4 mr-2" />
                    Record a Match
                  </Button>
                </div>
              ) : (
                <div>
                  <div className="rounded-md border">
                    <div className="grid grid-cols-5 py-3 px-4 text-xs font-medium text-muted-foreground bg-muted/50">
                      <div>Date</div>
                      <div className="col-span-2">Opponent</div>
                      <div>Score</div>
                      <div>Result</div>
                    </div>
                    
                    {/* Placeholder matches if needed */}
                    <div className="grid grid-cols-5 py-3 px-4 text-sm border-t">
                      <div>04/08/2025</div>
                      <div className="col-span-2">Sarah Johnson</div>
                      <div>11-7, 11-9</div>
                      <div>
                        <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                          Win
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-5 py-3 px-4 text-sm border-t">
                      <div>04/05/2025</div>
                      <div className="col-span-2">John Smith</div>
                      <div>7-11, 9-11</div>
                      <div>
                        <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
                          Loss
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

/**
 * Skeleton loading state for the profile page
 */
const ProfileSkeleton: FC = () => {
  return (
    <div className="container px-4 pb-16 max-w-screen-xl mx-auto">
      {/* Hero Section Skeleton */}
      <Card className="w-full overflow-hidden relative">
        <div className="h-40 bg-muted"></div>
        <div className="px-6 pb-6 pt-14 relative">
          <div className="absolute -top-12 left-6">
            <Skeleton className="h-24 w-24 rounded-full" />
          </div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-32 mb-4" />
        </div>
      </Card>
      
      {/* Quick Stats Bar Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <div className="p-4">
              <div className="flex justify-between items-center mb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="h-2 w-full mb-2" />
              <Skeleton className="h-4 w-16" />
            </div>
          </Card>
        ))}
      </div>
      
      {/* Tabbed Content Skeleton */}
      <div className="mt-6">
        <div className="border-b pb-2 mb-4">
          <Skeleton className="h-10 w-full" />
        </div>
        <Card className="p-6">
          <Skeleton className="h-6 w-48 mb-4" />
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default StreamlinedProfilePage;