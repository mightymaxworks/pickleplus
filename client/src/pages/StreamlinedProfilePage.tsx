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
  Trophy, MapPin, BadgeCheck, Medal, Edit2, Check, X, Calendar
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
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import ProfileStatsTab from '@/components/profile/streamlined/tabs/ProfileStatsTab';

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
  
  // Avatar and banner states
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [bannerPatternField, setBannerPatternField] = useState('none');
  
  // Banner pattern options
  const bannerPatternOptions = [
    { value: 'none', label: 'No Pattern' },
    { value: 'pickleball', label: 'Pickleball Pattern' },
    { value: 'court', label: 'Court Lines' },
    { value: 'geometric', label: 'Geometric' },
    { value: 'gradient', label: 'Gradient' },
  ];
  
  // Function to handle avatar file selection
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Function to handle banner file selection
  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBannerFile(file);
      setBannerPatternField('none'); // Clear pattern when file is selected
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Function to handle saving avatar
  const saveAvatar = async () => {
    if (!avatarFile) {
      setEditingFields(prev => ({ ...prev, avatar: false }));
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append('avatar', avatarFile);
      
      const response = await fetch('/api/profile/upload-avatar', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload avatar');
      }
      
      // Invalidate the user query to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/auth/current-user'] });
      
      // Exit edit mode for this field
      setEditingFields(prev => ({ ...prev, avatar: false }));
      setAvatarFile(null);
      
      toast({
        title: 'Avatar updated',
        description: 'Your profile picture has been updated successfully.',
      });
      
      return true;
    } catch (error) {
      console.error('Error updating avatar:', error);
      toast({
        title: 'Error updating avatar',
        description: 'There was an error updating your profile picture. Please try again.',
        variant: 'destructive',
      });
      
      return false;
    }
  };
  
  // Function to handle saving banner
  const saveBanner = async () => {
    try {
      if (bannerFile) {
        const formData = new FormData();
        formData.append('banner', bannerFile);
        
        const response = await fetch('/api/profile/upload-banner', {
          method: 'POST',
          credentials: 'include',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error('Failed to upload banner');
        }
      } else if (bannerPatternField) {
        await saveProfileField('bannerPattern', bannerPatternField);
        await saveProfileField('bannerUrl', '');
      }
      
      // Invalidate the user query to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/auth/current-user'] });
      
      // Exit edit mode for this field
      setEditingFields(prev => ({ ...prev, banner: false }));
      setBannerFile(null);
      
      toast({
        title: 'Banner updated',
        description: 'Your profile banner has been updated successfully.',
      });
      
      return true;
    } catch (error) {
      console.error('Error updating banner:', error);
      toast({
        title: 'Error updating banner',
        description: 'There was an error updating your profile banner. Please try again.',
        variant: 'destructive',
      });
      
      return false;
    }
  };
  
  // Function to handle saving profile updates
  const saveProfileField = async (fieldName: string, value: string | boolean | number | null) => {
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

  // Initialize banner pattern field when user data is loaded
  useEffect(() => {
    if (user) {
      setBannerPatternField(user.bannerPattern || 'none');
    }
  }, [user?.bannerPattern]);
  
  // Skeleton loading state component
  const ProfileSkeleton = () => (
    <div className="container px-4 pb-16 max-w-screen-xl mx-auto">
      <div className="mt-4">
        <Skeleton className="h-40 w-full" />
        <div className="mt-4 flex items-center gap-4">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
      
      <div className="mt-6">
        <Skeleton className="h-12 w-full mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
  
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
  
  // Avatar edit modal
  const renderAvatarEditModal = () => {
    if (!editingFields.avatar) return null;
    
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md overflow-hidden">
          <CardHeader>
            <CardTitle>Update Profile Picture</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center space-y-4">
              <div className="w-32 h-32 relative mx-auto">
                {avatarPreview ? (
                  <img 
                    src={avatarPreview} 
                    alt="Avatar preview" 
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : user.avatarUrl ? (
                  <img 
                    src={user.avatarUrl} 
                    alt={user.displayName || user.username} 
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-primary flex items-center justify-center text-2xl text-primary-foreground">
                    {user.avatarInitials || user.username.substring(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              
              <div className="w-full">
                <Label htmlFor="avatar-upload">Choose an image</Label>
                <Input 
                  id="avatar-upload" 
                  type="file" 
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Recommended: 300x300px or larger square image.
                </p>
              </div>
            </div>
          </CardContent>
          <div className="flex justify-end gap-2 p-4 pt-0">
            <Button 
              variant="outline" 
              onClick={() => {
                setAvatarFile(null);
                setAvatarPreview(null);
                setEditingFields(prev => ({ ...prev, avatar: false }));
              }}
            >
              Cancel
            </Button>
            <Button onClick={saveAvatar}>
              Save
            </Button>
          </div>
        </Card>
      </div>
    );
  };
  
  // Banner edit modal
  const renderBannerEditModal = () => {
    if (!editingFields.banner) return null;
    
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg overflow-hidden">
          <CardHeader>
            <CardTitle>Update Profile Banner</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Banner preview */}
              <div className="aspect-[3/1] relative rounded-md overflow-hidden border">
                {bannerPreview ? (
                  <img 
                    src={bannerPreview} 
                    alt="Banner preview" 
                    className="w-full h-full object-cover"
                  />
                ) : user.bannerUrl ? (
                  <img 
                    src={user.bannerUrl} 
                    alt="Current banner" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className={`w-full h-full ${
                    bannerPatternField && bannerPatternField !== 'none'
                      ? `banner-pattern-${bannerPatternField}` 
                      : "bg-gradient-to-r from-primary/80 via-primary/60 to-primary/40"
                  }`}></div>
                )}
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="banner-upload">Upload custom banner image</Label>
                  <Input 
                    id="banner-upload" 
                    type="file" 
                    accept="image/*"
                    onChange={handleBannerChange}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Recommended: 1200x400px or larger image.
                  </p>
                </div>
                
                <div className="pt-2">
                  <Label>Or choose a pattern</Label>
                  <Select 
                    value={bannerPatternField} 
                    onValueChange={(value) => {
                      setBannerPatternField(value);
                      setBannerFile(null);
                      setBannerPreview(null);
                    }}
                  >
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder="Select a pattern" />
                    </SelectTrigger>
                    <SelectContent>
                      {bannerPatternOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
          <div className="flex justify-end gap-2 p-4 pt-0">
            <Button 
              variant="outline" 
              onClick={() => {
                setBannerFile(null);
                setBannerPreview(null);
                setBannerPatternField(user?.bannerPattern || 'none');
                setEditingFields(prev => ({ ...prev, banner: false }));
              }}
            >
              Cancel
            </Button>
            <Button onClick={saveBanner}>
              Save
            </Button>
          </div>
        </Card>
      </div>
    );
  };

  return (
    <div className="container px-4 pb-16 max-w-screen-xl mx-auto">
      {/* Avatar and Banner Edit Modals */}
      {renderAvatarEditModal()}
      {renderBannerEditModal()}
      
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
        <div className={`h-40 relative ${!user.bannerUrl ? "bg-gradient-to-r from-primary/80 via-primary/60 to-primary/40" : ""} flex items-end justify-end`}>
          {user.bannerUrl ? (
            <img 
              src={user.bannerUrl} 
              alt="Profile banner" 
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            user.bannerPattern && user.bannerPattern !== 'none' ? (
              <div className={`absolute inset-0 w-full h-full banner-pattern-${user.bannerPattern}`}></div>
            ) : null
          )}
          
          {/* Edit Banner Button (Only visible in edit mode) */}
          {isEditMode && (
            <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="bg-background/80 backdrop-blur-sm p-2 rounded-md shadow-lg">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-xs flex items-center gap-1"
                  onClick={() => setEditingFields(prev => ({ ...prev, banner: true }))}
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  Change Banner
                </Button>
              </div>
            </div>
          )}
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
              
              {/* Profile Completion Indicator */}
              {user.profileCompletionPct !== undefined && user.profileCompletionPct < 100 && (
                <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5">
                  <div className="relative w-6 h-6 bg-muted rounded-full flex items-center justify-center text-xs font-medium">
                    <svg viewBox="0 0 100 100" className="absolute inset-0">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="10"
                        strokeDasharray={`${user.profileCompletionPct * 2.51} 251`}
                        strokeLinecap="round"
                        className="text-primary transform -rotate-90 origin-center"
                      />
                    </svg>
                    <span>{user.profileCompletionPct}%</span>
                  </div>
                </div>
              )}
              
              {/* Edit Avatar Button (Only visible in edit mode) */}
              {isEditMode && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-white/90 text-xs"
                    onClick={() => setEditingFields(prev => ({ ...prev, avatar: true }))}
                  >
                    <Edit2 className="h-5 w-5" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* User Info */}
          <div className="ml-28 sm:flex sm:items-center sm:justify-between">
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
        <TooltipProvider>
          <div className="sticky top-16 z-10 bg-background pt-2 pb-2 border-b">
            <TabsList className="w-full h-auto justify-between sm:justify-start gap-1 overflow-x-auto flex-nowrap p-2 mb-2 rounded-lg bg-muted/30">
              {/* Overview Tab */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger 
                    value="overview" 
                    className="flex-1 sm:flex-initial flex flex-col items-center data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-sm rounded-md px-3 py-2 transition-all"
                  >
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mb-1">
                      <UserCircle className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-[11px] font-medium">Overview</span>
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-xs">Player information and bio</p>
                </TooltipContent>
              </Tooltip>
              
              {/* Stats & Ratings Tab */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger 
                    value="stats" 
                    className="flex-1 sm:flex-initial flex flex-col items-center data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-sm rounded-md px-3 py-2 transition-all"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-1">
                      <Dumbbell className="h-6 w-6 text-blue-600" />
                    </div>
                    <span className="text-[11px] font-medium">Stats</span>
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-xs">Performance stats and ratings</p>
                </TooltipContent>
              </Tooltip>
              
              {/* Equipment Tab */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger 
                    value="equipment" 
                    className="flex-1 sm:flex-initial flex flex-col items-center data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-sm rounded-md px-3 py-2 transition-all"
                  >
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mb-1">
                      <Settings className="h-6 w-6 text-purple-600" />
                    </div>
                    <span className="text-[11px] font-medium">Gear</span>
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-xs">Paddles, apparel and gear</p>
                </TooltipContent>
              </Tooltip>
              
              {/* Preferences Tab */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger 
                    value="preferences" 
                    className="flex-1 sm:flex-initial flex flex-col items-center data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-sm rounded-md px-3 py-2 transition-all"
                  >
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mb-1">
                      <BookOpen className="h-6 w-6 text-green-600" />
                    </div>
                    <span className="text-[11px] font-medium">Style</span>
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-xs">Play style and preferences</p>
                </TooltipContent>
              </Tooltip>
              
              {/* Achievements Tab */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger 
                    value="achievements" 
                    className="flex-1 sm:flex-initial flex flex-col items-center data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-sm rounded-md px-3 py-2 transition-all"
                  >
                    <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center mb-1">
                      <Award className="h-6 w-6 text-yellow-600" />
                    </div>
                    <span className="text-[11px] font-medium">Badges</span>
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-xs">Badges and accomplishments</p>
                </TooltipContent>
              </Tooltip>
              
              {/* Match History Tab */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger 
                    value="history" 
                    className="flex-1 sm:flex-initial flex flex-col items-center data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-sm rounded-md px-3 py-2 transition-all"
                  >
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mb-1">
                      <Clock className="h-6 w-6 text-red-600" />
                    </div>
                    <span className="text-[11px] font-medium">History</span>
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-xs">Recent matches and records</p>
                </TooltipContent>
              </Tooltip>
            </TabsList>
          </div>
        </TooltipProvider>

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
                        <p className="whitespace-pre-line">{user.bio || 'No bio specified'}</p>
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
                          <p>{user.height ? `${user.height} cm` : 'Not specified'}</p>
                          {isEditMode && (
                            <Edit2 className="h-4 w-4 absolute top-2 right-2 text-muted-foreground" />
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Reach Field */}
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Reach (cm)</h4>
                      {isEditMode && editingFields.reach ? (
                        <div className="space-y-2">
                          <Input 
                            type="number"
                            value={reachField}
                            onChange={(e) => setReachField(e.target.value)}
                            placeholder="Your reach in cm"
                          />
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setReachField(user.reach?.toString() || '');
                                setEditingFields(prev => ({ ...prev, reach: false }));
                              }}
                            >
                              <X className="h-4 w-4 mr-1" /> Cancel
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => saveProfileField('reach', reachField ? parseInt(reachField) : null)}
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
                              setEditingFields(prev => ({ ...prev, reach: true }));
                            }
                          }}
                        >
                          <p>{user.reach ? `${user.reach} cm` : 'Not specified'}</p>
                          {isEditMode && (
                            <Edit2 className="h-4 w-4 absolute top-2 right-2 text-muted-foreground" />
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Preferred Position Field */}
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Preferred Position</h4>
                      {isEditMode && editingFields.preferredPosition ? (
                        <div className="space-y-2">
                          <Select 
                            value={preferredPositionField} 
                            onValueChange={(value) => setPreferredPositionField(value)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select preferred position" />
                            </SelectTrigger>
                            <SelectContent>
                              {positionOptions.map(option => (
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
                                setPreferredPositionField(user.preferredPosition || '');
                                setEditingFields(prev => ({ ...prev, preferredPosition: false }));
                              }}
                            >
                              <X className="h-4 w-4 mr-1" /> Cancel
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => saveProfileField('preferredPosition', preferredPositionField)}
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
                              setEditingFields(prev => ({ ...prev, preferredPosition: true }));
                            }
                          }}
                        >
                          <p className="capitalize">{user.preferredPosition || 'Not specified'}</p>
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
          
          <TabsContent value="equipment" className="mt-0">
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Equipment</h3>
                  {isEditMode && (
                    <p className="text-xs text-muted-foreground">Click on any field to edit</p>
                  )}
                </div>
                
                {/* Primary Paddle */}
                <div className="border-b pb-4">
                  <h4 className="text-md font-medium mb-4">Primary Paddle</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-sm font-medium text-muted-foreground mb-2">Brand</h5>
                      {isEditMode && editingFields.paddleBrand ? (
                        <div className="space-y-2">
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
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setPaddleBrandField(user.paddleBrand || '');
                                setEditingFields(prev => ({ ...prev, paddleBrand: false }));
                              }}
                            >
                              <X className="h-4 w-4 mr-1" /> Cancel
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => saveProfileField('paddleBrand', paddleBrandField)}
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
                          <p>{user.paddleBrand || 'Not specified'}</p>
                          {isEditMode && (
                            <Edit2 className="h-4 w-4 absolute top-2 right-2 text-muted-foreground" />
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <h5 className="text-sm font-medium text-muted-foreground mb-2">Model</h5>
                      {isEditMode && editingFields.paddleModel ? (
                        <div className="space-y-2">
                          <Input 
                            type="text"
                            value={paddleModelField}
                            onChange={(e) => setPaddleModelField(e.target.value)}
                            placeholder="Enter paddle model"
                          />
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setPaddleModelField(user.paddleModel || '');
                                setEditingFields(prev => ({ ...prev, paddleModel: false }));
                              }}
                            >
                              <X className="h-4 w-4 mr-1" /> Cancel
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => saveProfileField('paddleModel', paddleModelField)}
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
                              setEditingFields(prev => ({ ...prev, paddleModel: true }));
                            }
                          }}
                        >
                          <p>{user.paddleModel || 'Not specified'}</p>
                          {isEditMode && (
                            <Edit2 className="h-4 w-4 absolute top-2 right-2 text-muted-foreground" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Backup Paddle */}
                <div className="border-b pb-4">
                  <h4 className="text-md font-medium mb-4">Backup Paddle</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-sm font-medium text-muted-foreground mb-2">Brand</h5>
                      {isEditMode && editingFields.backupPaddleBrand ? (
                        <div className="space-y-2">
                          <Select 
                            value={backupPaddleBrandField} 
                            onValueChange={(value) => setBackupPaddleBrandField(value)}
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
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setBackupPaddleBrandField(user.backupPaddleBrand || '');
                                setEditingFields(prev => ({ ...prev, backupPaddleBrand: false }));
                              }}
                            >
                              <X className="h-4 w-4 mr-1" /> Cancel
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => saveProfileField('backupPaddleBrand', backupPaddleBrandField)}
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
                          <p>{user.backupPaddleBrand || 'Not specified'}</p>
                          {isEditMode && (
                            <Edit2 className="h-4 w-4 absolute top-2 right-2 text-muted-foreground" />
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <h5 className="text-sm font-medium text-muted-foreground mb-2">Model</h5>
                      {isEditMode && editingFields.backupPaddleModel ? (
                        <div className="space-y-2">
                          <Input 
                            type="text"
                            value={backupPaddleModelField}
                            onChange={(e) => setBackupPaddleModelField(e.target.value)}
                            placeholder="Enter paddle model"
                          />
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setBackupPaddleModelField(user.backupPaddleModel || '');
                                setEditingFields(prev => ({ ...prev, backupPaddleModel: false }));
                              }}
                            >
                              <X className="h-4 w-4 mr-1" /> Cancel
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => saveProfileField('backupPaddleModel', backupPaddleModelField)}
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
                              setEditingFields(prev => ({ ...prev, backupPaddleModel: true }));
                            }
                          }}
                        >
                          <p>{user.backupPaddleModel || 'Not specified'}</p>
                          {isEditMode && (
                            <Edit2 className="h-4 w-4 absolute top-2 right-2 text-muted-foreground" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Apparel & Shoes */}
                <div className="border-b pb-4">
                  <h4 className="text-md font-medium mb-4">Apparel & Shoes</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-sm font-medium text-muted-foreground mb-2">Apparel Brand</h5>
                      {isEditMode && editingFields.apparelBrand ? (
                        <div className="space-y-2">
                          <Select 
                            value={apparelBrandField} 
                            onValueChange={(value) => setApparelBrandField(value)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select apparel brand" />
                            </SelectTrigger>
                            <SelectContent>
                              {apparelBrandOptions.map(option => (
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
                                setApparelBrandField(user.apparelBrand || '');
                                setEditingFields(prev => ({ ...prev, apparelBrand: false }));
                              }}
                            >
                              <X className="h-4 w-4 mr-1" /> Cancel
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => saveProfileField('apparelBrand', apparelBrandField)}
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
                              setEditingFields(prev => ({ ...prev, apparelBrand: true }));
                            }
                          }}
                        >
                          <p>{user.apparelBrand || 'Not specified'}</p>
                          {isEditMode && (
                            <Edit2 className="h-4 w-4 absolute top-2 right-2 text-muted-foreground" />
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <h5 className="text-sm font-medium text-muted-foreground mb-2">Shoes Brand</h5>
                      {isEditMode && editingFields.shoesBrand ? (
                        <div className="space-y-2">
                          <Select 
                            value={shoesBrandField} 
                            onValueChange={(value) => setShoesBrandField(value)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select shoes brand" />
                            </SelectTrigger>
                            <SelectContent>
                              {shoesBrandOptions.map(option => (
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
                                setShoesBrandField(user.shoesBrand || '');
                                setEditingFields(prev => ({ ...prev, shoesBrand: false }));
                              }}
                            >
                              <X className="h-4 w-4 mr-1" /> Cancel
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => saveProfileField('shoesBrand', shoesBrandField)}
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
                              setEditingFields(prev => ({ ...prev, shoesBrand: true }));
                            }
                          }}
                        >
                          <p>{user.shoesBrand || 'Not specified'}</p>
                          {isEditMode && (
                            <Edit2 className="h-4 w-4 absolute top-2 right-2 text-muted-foreground" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Other Equipment */}
                <div>
                  <h4 className="text-md font-medium mb-4">Other Equipment</h4>
                  {isEditMode && editingFields.otherEquipment ? (
                    <div className="space-y-2">
                      <Textarea 
                        value={otherEquipmentField}
                        onChange={(e) => setOtherEquipmentField(e.target.value)}
                        className="min-h-[80px] resize-none"
                        placeholder="List any other equipment you use (bags, accessories, etc.)"
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
          
          <TabsContent value="stats" className="mt-0">
            <ProfileStatsTab user={user} isEditMode={isEditMode} />
          </TabsContent>
          
          <TabsContent value="preferences" className="mt-0">
            <Card className="p-6">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Play Style & Preferences</h3>
                  {isEditMode && (
                    <p className="text-xs text-muted-foreground">Click on any field to edit</p>
                  )}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                        <p className="capitalize">{user.preferredFormat || 'Not specified'}</p>
                        {isEditMode && (
                          <Edit2 className="h-4 w-4 absolute top-2 right-2 text-muted-foreground" />
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Dominant Hand */}
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
                        <p className="capitalize">{user.dominantHand || 'Not specified'}</p>
                        {isEditMode && (
                          <Edit2 className="h-4 w-4 absolute top-2 right-2 text-muted-foreground" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <h4 className="text-md font-medium mb-4">Partner & Mentorship Settings</h4>
                  
                  <div className="space-y-4">
                    {/* Looking for Partners */}
                    <div className="flex justify-between items-center">
                      <div>
                        <h5 className="text-sm font-medium">Looking for Partners</h5>
                        <p className="text-xs text-muted-foreground">Let other players know you're looking for partners</p>
                      </div>
                      {isEditMode ? (
                        <Switch 
                          checked={lookingForPartnersField}
                          onCheckedChange={(value) => {
                            setLookingForPartnersField(value);
                            saveProfileField('lookingForPartners', value);
                          }}
                        />
                      ) : (
                        <Badge variant={user.lookingForPartners ? "default" : "outline"}>
                          {user.lookingForPartners ? 'Enabled' : 'Disabled'}
                        </Badge>
                      )}
                    </div>
                    
                    {/* Mentorship Interest */}
                    <div className="flex justify-between items-center">
                      <div>
                        <h5 className="text-sm font-medium">Interested in Mentorship</h5>
                        <p className="text-xs text-muted-foreground">You're open to being mentored or mentoring others</p>
                      </div>
                      {isEditMode ? (
                        <Switch 
                          checked={mentorshipInterestField}
                          onCheckedChange={(value) => {
                            setMentorshipInterestField(value);
                            saveProfileField('mentorshipInterest', value);
                          }}
                        />
                      ) : (
                        <Badge variant={user.mentorshipInterest ? "default" : "outline"}>
                          {user.mentorshipInterest ? 'Enabled' : 'Disabled'}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="achievements" className="mt-0">
            <Card className="p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Achievements & Badges</h3>
                <p className="text-sm text-muted-foreground">Complete challenges and earn recognition for your accomplishments</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                  {/* Placeholder for achievements */}
                  <div className="border rounded-lg p-4 text-center bg-muted/10 flex flex-col items-center">
                    <div className="h-16 w-16 bg-primary/20 rounded-full flex items-center justify-center mb-3">
                      <Trophy className="h-8 w-8 text-primary/60" />
                    </div>
                    <h4 className="font-medium">Level 5 Achieved</h4>
                    <p className="text-xs text-muted-foreground mt-1">Reached player level 5</p>
                  </div>
                  
                  <div className="border rounded-lg p-4 text-center bg-muted/10 flex flex-col items-center">
                    <div className="h-16 w-16 bg-amber-100 rounded-full flex items-center justify-center mb-3">
                      <Award className="h-8 w-8 text-amber-400" />
                    </div>
                    <h4 className="font-medium">10 Match Milestone</h4>
                    <p className="text-xs text-muted-foreground mt-1">Completed 10 matches</p>
                  </div>
                  
                  <div className="border rounded-lg p-4 text-center bg-muted/10 flex flex-col items-center">
                    <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                      <Medal className="h-8 w-8 text-blue-400" />
                    </div>
                    <h4 className="font-medium">Founding Member</h4>
                    <p className="text-xs text-muted-foreground mt-1">Early adopter of Pickle+</p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="history" className="mt-0">
            <Card className="p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Match History</h3>
                <p className="text-sm text-muted-foreground">View your recent matches and performance</p>
                
                {/* Recent Matches */}
                <div className="mt-4">
                  {/* Placeholder for match history */}
                  <div className="rounded-lg border overflow-hidden">
                    <div className="bg-muted/20 p-3 border-b">
                      <div className="text-sm font-medium">Recent Matches</div>
                    </div>
                    
                    <div className="divide-y">
                      <div className="p-4 flex justify-between items-center">
                        <div>
                          <div className="font-medium flex items-center">
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded mr-2">Win</span>
                            vs. John D. & Sarah K.
                          </div>
                          <div className="text-sm text-muted-foreground">Doubles, Apr 2, 2025</div>
                        </div>
                        <div className="text-sm font-semibold">11-5, 11-7</div>
                      </div>
                      
                      <div className="p-4 flex justify-between items-center">
                        <div>
                          <div className="font-medium flex items-center">
                            <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded mr-2">Loss</span>
                            vs. Mark T.
                          </div>
                          <div className="text-sm text-muted-foreground">Singles, Mar 28, 2025</div>
                        </div>
                        <div className="text-sm font-semibold">9-11, 11-9, 9-11</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default StreamlinedProfilePage;