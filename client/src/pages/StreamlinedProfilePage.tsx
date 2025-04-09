/**
 * PKL-278651-SPUI-0001: Streamlined Profile User Interface
 * A sleek, modern profile interface with persistent top navigation and mobile-optimized experience
 */
import { FC, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { 
  UserCircle, Settings, Award, Clock, Info, Dumbbell, BookOpen,
  Trophy, MapPin, BadgeCheck, Medal, Edit2, Check, X, Calendar, Clipboard
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { queryClient } from '@/lib/queryClient';
import { EnhancedUser } from '@/types/enhanced-user';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * Streamlined Profile Page
 * A comprehensive profile page with mobile-first design and persistent navigation
 */
const StreamlinedProfilePage: FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingFields, setEditingFields] = useState<Record<string, boolean>>({});
  
  // Overview tab fields
  const [bioField, setBioField] = useState('');
  const [playingStyleField, setPlayingStyleField] = useState('');
  const [playingSinceField, setPlayingSinceField] = useState('');
  
  // Equipment tab fields
  const [paddleBrandField, setPaddleBrandField] = useState('');
  const [paddleModelField, setPaddleModelField] = useState('');
  const [backupPaddleBrandField, setBackupPaddleBrandField] = useState('');
  const [backupPaddleModelField, setBackupPaddleModelField] = useState('');
  const [otherEquipmentField, setOtherEquipmentField] = useState('');
  
  // Preferences tab fields
  const [preferredFormatField, setPreferredFormatField] = useState('');
  const [dominantHandField, setDominantHandField] = useState('');
  const [lookingForPartnersField, setLookingForPartnersField] = useState(false);
  const [mentorshipInterestField, setMentorshipInterestField] = useState(false);

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
      
      // Equipment tab fields
      setPaddleBrandField(user.paddleBrand || '');
      setPaddleModelField(user.paddleModel || '');
      setBackupPaddleBrandField(user.backupPaddleBrand || '');
      setBackupPaddleModelField(user.backupPaddleModel || '');
      setOtherEquipmentField(user.otherEquipment || '');
      
      // Preferences tab fields
      setPreferredFormatField(user.preferredFormat || '');
      setDominantHandField(user.dominantHand || '');
      setLookingForPartnersField(user.lookingForPartners || false);
      setMentorshipInterestField(user.mentorshipInterest || false);
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
      {/* Hero Section with Profile Header */}
      <Card className="w-full overflow-hidden relative">
        {/* Banner/Background */}
        <div className="h-40 bg-gradient-to-r from-primary/80 via-primary/60 to-primary/40 flex items-end justify-end p-4">
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-background/80 backdrop-blur-sm"
            onClick={() => setIsEditMode(!isEditMode)}
          >
            {isEditMode ? (
              <>
                <X className="h-4 w-4 mr-2" />
                Exit Edit Mode
              </>
            ) : (
              <>
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Profile
              </>
            )}
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
                        <p>{user.playingStyle || 'Not specified'}</p>
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
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="stats" className="mt-0">
            <Card className="p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Player Statistics</h3>
                <p className="text-muted-foreground">
                  Detailed statistics about your performance will appear here.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">CourtIQ™ Rating</h4>
                    <div className="text-3xl font-bold">{user.rankingPoints || 0}</div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Win Rate</h4>
                    <div className="text-3xl font-bold">{user.totalMatches && user.matchesWon ? Math.round((user.matchesWon / user.totalMatches) * 100) : 0}%</div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="equipment" className="mt-0">
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Equipment Details</h3>
                  {isEditMode && (
                    <p className="text-xs text-muted-foreground">Click on any field to edit</p>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Primary Paddle</h4>
                    {isEditMode && editingFields.paddleBrand ? (
                      <div className="space-y-2">
                        <div className="grid grid-cols-1 gap-2">
                          <Select 
                            value={paddleBrandField} 
                            onValueChange={(value) => setPaddleBrandField(value)}
                          >
                            <SelectTrigger className="w-full">
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
                          
                          <Input 
                            type="text"
                            value={paddleModelField}
                            onChange={(e) => setPaddleModelField(e.target.value)}
                            placeholder="Paddle model (e.g., Genesis Pro Ai)"
                          />
                        </div>
                        
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              setPaddleBrandField(user.paddleBrand || '');
                              setPaddleModelField(user.paddleModel || '');
                              setEditingFields(prev => ({ ...prev, paddleBrand: false }));
                            }}
                          >
                            <X className="h-4 w-4 mr-1" /> Cancel
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={async () => {
                              await saveProfileField('paddleBrand', paddleBrandField);
                              await saveProfileField('paddleModel', paddleModelField);
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
                            setEditingFields(prev => ({ ...prev, paddleBrand: true }));
                          }
                        }}
                      >
                        <p>{user.paddleBrand ? `${user.paddleBrand} ${user.paddleModel || ''}` : 'Not specified'}</p>
                        {isEditMode && (
                          <Edit2 className="h-4 w-4 absolute top-2 right-2 text-muted-foreground" />
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Backup Paddle</h4>
                    {isEditMode && editingFields.backupPaddleBrand ? (
                      <div className="space-y-2">
                        <div className="grid grid-cols-1 gap-2">
                          <Select 
                            value={backupPaddleBrandField} 
                            onValueChange={(value) => setBackupPaddleBrandField(value)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select backup paddle brand" />
                            </SelectTrigger>
                            <SelectContent>
                              {paddleBrandOptions.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          
                          <Input 
                            type="text"
                            value={backupPaddleModelField}
                            onChange={(e) => setBackupPaddleModelField(e.target.value)}
                            placeholder="Backup paddle model"
                          />
                        </div>
                        
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              setBackupPaddleBrandField(user.backupPaddleBrand || '');
                              setBackupPaddleModelField(user.backupPaddleModel || '');
                              setEditingFields(prev => ({ ...prev, backupPaddleBrand: false }));
                            }}
                          >
                            <X className="h-4 w-4 mr-1" /> Cancel
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={async () => {
                              await saveProfileField('backupPaddleBrand', backupPaddleBrandField);
                              await saveProfileField('backupPaddleModel', backupPaddleModelField);
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
                            setEditingFields(prev => ({ ...prev, backupPaddleBrand: true }));
                          }
                        }}
                      >
                        <p>{user.backupPaddleBrand ? `${user.backupPaddleBrand} ${user.backupPaddleModel || ''}` : 'Not specified'}</p>
                        {isEditMode && (
                          <Edit2 className="h-4 w-4 absolute top-2 right-2 text-muted-foreground" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Other Equipment</h4>
                  {isEditMode && editingFields.otherEquipment ? (
                    <div className="space-y-2">
                      <Textarea 
                        value={otherEquipmentField}
                        onChange={(e) => setOtherEquipmentField(e.target.value)}
                        placeholder="List any other equipment you use (bags, shoes, accessories, etc.)"
                        className="min-h-[80px]"
                      />
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            setOtherEquipmentField(user.otherEquipment || '');
                            setEditingFields(prev => ({ ...prev, otherEquipment: false }));
                          }}
                        >
                          <X className="h-4 w-4 mr-1" /> Cancel
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => saveProfileField('otherEquipment', otherEquipmentField)}
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
                          setEditingFields(prev => ({ ...prev, otherEquipment: true }));
                        }
                      }}
                    >
                      <p>{user.otherEquipment || 'Not specified'}</p>
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
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Play Preferences</h3>
                  {isEditMode && (
                    <p className="text-xs text-muted-foreground">Click on any field to edit</p>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Format Preference</h4>
                    {isEditMode && editingFields.preferredFormat ? (
                      <div className="space-y-2">
                        <Select 
                          value={preferredFormatField} 
                          onValueChange={(value) => setPreferredFormatField(value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select preferred format" />
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
                        <p>{user.preferredFormat || 'Not specified'}</p>
                        {isEditMode && (
                          <Edit2 className="h-4 w-4 absolute top-2 right-2 text-muted-foreground" />
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Dominant Hand</h4>
                    {isEditMode && editingFields.dominantHand ? (
                      <div className="space-y-2">
                        <Select 
                          value={dominantHandField} 
                          onValueChange={(value) => setDominantHandField(value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select dominant hand" />
                          </SelectTrigger>
                          <SelectContent>
                            {handOptions.map(option => (
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
                              setDominantHandField(user.dominantHand || '');
                              setEditingFields(prev => ({ ...prev, dominantHand: false }));
                            }}
                          >
                            <X className="h-4 w-4 mr-1" /> Cancel
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={() => saveProfileField('dominantHand', dominantHandField)}
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
                            setEditingFields(prev => ({ ...prev, dominantHand: true }));
                          }
                        }}
                      >
                        <p>{user.dominantHand || 'Not specified'}</p>
                        {isEditMode && (
                          <Edit2 className="h-4 w-4 absolute top-2 right-2 text-muted-foreground" />
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Looking for Partners</h4>
                    {isEditMode && editingFields.lookingForPartners ? (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="looking-for-partners"
                            checked={lookingForPartnersField}
                            onCheckedChange={setLookingForPartnersField}
                          />
                          <Label htmlFor="looking-for-partners">
                            {lookingForPartnersField ? 'Yes, I\'m looking for partners' : 'No, not looking for partners'}
                          </Label>
                        </div>
                        
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              setLookingForPartnersField(user.lookingForPartners || false);
                              setEditingFields(prev => ({ ...prev, lookingForPartners: false }));
                            }}
                          >
                            <X className="h-4 w-4 mr-1" /> Cancel
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={() => saveProfileField('lookingForPartners', lookingForPartnersField)}
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
                            setEditingFields(prev => ({ ...prev, lookingForPartners: true }));
                          }
                        }}
                      >
                        <p>{user.lookingForPartners ? 'Yes' : 'No'}</p>
                        {isEditMode && (
                          <Edit2 className="h-4 w-4 absolute top-2 right-2 text-muted-foreground" />
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Mentorship Interest</h4>
                    {isEditMode && editingFields.mentorshipInterest ? (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="mentorship-interest"
                            checked={mentorshipInterestField}
                            onCheckedChange={setMentorshipInterestField}
                          />
                          <Label htmlFor="mentorship-interest">
                            {mentorshipInterestField ? 'Yes, interested in mentorship' : 'No, not interested in mentorship'}
                          </Label>
                        </div>
                        
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              setMentorshipInterestField(user.mentorshipInterest || false);
                              setEditingFields(prev => ({ ...prev, mentorshipInterest: false }));
                            }}
                          >
                            <X className="h-4 w-4 mr-1" /> Cancel
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={() => saveProfileField('mentorshipInterest', mentorshipInterestField)}
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
                            setEditingFields(prev => ({ ...prev, mentorshipInterest: true }));
                          }
                        }}
                      >
                        <p>{user.mentorshipInterest ? 'Yes' : 'No'}</p>
                        {isEditMode && (
                          <Edit2 className="h-4 w-4 absolute top-2 right-2 text-muted-foreground" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="achievements" className="mt-0">
            <Card className="p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Player Achievements</h3>
                <p className="text-muted-foreground">
                  Your achievements will be displayed here as you earn them.
                </p>
                <div className="flex items-center gap-2 mt-4 p-4 border rounded-md bg-green-50">
                  <Award className="h-6 w-6 text-green-600" />
                  <div>
                    <h4 className="font-medium">Profile Progress</h4>
                    <p className="text-sm">Complete your profile to earn XP and unlock achievements.</p>
                  </div>
                  <Badge className="ml-auto">{user.profileCompletionPct || 0}%</Badge>
                </div>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="history" className="mt-0">
            <Card className="p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Match History</h3>
                <p className="text-muted-foreground">
                  {user.totalMatches ? 'Your recent matches will appear here.' : 'You have not played any matches yet.'}
                </p>
                <div className="mt-4">
                  {user.totalMatches ? (
                    <div className="border rounded-md p-4">
                      <div className="grid grid-cols-3 font-medium mb-2">
                        <div>Date</div>
                        <div>Opponent</div>
                        <div>Result</div>
                      </div>
                      {/* Sample match history row */}
                      <div className="grid grid-cols-3 border-t py-2">
                        <div>2025-04-02</div>
                        <div>John Smith</div>
                        <div><Badge variant="success">Win</Badge></div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                      <h4 className="text-lg font-medium mb-2">No Matches Yet</h4>
                      <p className="text-sm text-muted-foreground max-w-md">
                        Start recording your matches to build your history and track your progress.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

/**
 * Profile Skeleton Loading State
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
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      </Card>
      
      {/* Quick Stats Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-8 w-full" />
          </Card>
        ))}
      </div>
      
      {/* Tab Navigation Skeleton */}
      <div className="my-6">
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-28 rounded-md shrink-0" />
          ))}
        </div>
        
        {/* Content Skeleton */}
        <Card className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-6 w-32 mb-4" />
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-12 w-full" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default StreamlinedProfilePage;