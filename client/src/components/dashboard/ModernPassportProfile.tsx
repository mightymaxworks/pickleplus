/**
 * Modern Passport Profile Component
 * 
 * A clean, modern passport design extracted from PassportDesignDemo
 * to replace the existing passport section in PassportDashboard.
 * Features QR code integration, image uploads, and inline editing.
 */

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, MapPin, Calendar, QrCode, GraduationCap, BookOpen, Star, Copy, Check } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { EditableField } from "@/components/profile/EditableField";
import EnhancedLeaderboard from "@/components/match/EnhancedLeaderboard";
import UnifiedRankingsView from "@/components/rankings/UnifiedRankingsView";
import { RecentMatchesWidget } from "@/components/dashboard/RecentMatchesWidget";
import { StudentCoachingWidget } from "@/components/dashboard/StudentCoachingWidget";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";

interface ModernPassportProfileProps {
  user: any;
  isOwner?: boolean;
  onProfileUpdate?: (field: string, value: any) => void;
}

export default function ModernPassportProfile({ 
  user, 
  isOwner = false, 
  onProfileUpdate 
}: ModernPassportProfileProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [profileImage, setProfileImage] = useState<string | undefined>(undefined);
  const [coverImage, setCoverImage] = useState<string | undefined>(undefined);
  const [copiedPassportId, setCopiedPassportId] = useState(false);

  // Handle file upload for images
  const handleImageUpload = (type: 'profile' | 'cover') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          if (type === 'profile') {
            setProfileImage(result);
            onProfileUpdate?.('profilePicture', result || null);
          } else {
            setCoverImage(result);
            onProfileUpdate?.('banner_url', result);
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  // Generate QR code data and passport ID using the secure random passport code
  const passportId = user?.passportCode || 'UNKNOWN';
  const qrCodeData = `${window.location.origin}/profile/${user?.id || 'demo'}`;
  const userRoles = { 
    isCoach: user?.isAdmin || user?.isCoach || false, // Admin can see coaching features
    isPlayer: true 
  };

  // Handle passport ID copy
  const handleCopyPassportId = async () => {
    try {
      await navigator.clipboard.writeText(passportId);
      setCopiedPassportId(true);
      toast({
        title: "Copied!",
        description: "Passport ID copied to clipboard",
        duration: 2000,
      });
      setTimeout(() => setCopiedPassportId(false), 2000);
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Could not copy passport ID",
        variant: "destructive",
      });
    }
  };

  // Debug banner image and user data
  console.log('Banner image debug:', {
    hasBannerUrl: !!user?.banner_url,
    hasBannerUrlCamel: !!user?.bannerUrl,
    bannerUrlLength: user?.banner_url?.length,
    bannerUrlStart: user?.banner_url?.substring(0, 50),
    hasCoverImage: !!coverImage
  });
  
  console.log('User data debug:', {
    playingSince: user?.playingSince,
    userId: user?.id,
    displayName: user?.displayName,
    profileCompletionPct: user?.profileCompletionPct,
    picklePoints: user?.picklePoints,
    rankingPoints: user?.rankingPoints,
    avatarUrl: user?.avatarUrl,
    avatar_url: user?.avatar_url,
    bannerUrl: user?.bannerUrl,
    banner_url: user?.banner_url,
    hasAvatarUrl: !!user?.avatar_url,
    hasAvatarUrlCamel: !!user?.avatarUrl,
    userKeys: user ? Object.keys(user) : 'no user'
  });

  return (
    <div className="w-full min-h-screen">
      <div className="w-full">
        {/* Background Image Section - Larger and Mobile Optimized */}
        <div 
          className="h-48 md:h-56 lg:h-64 relative"
          style={{
            backgroundImage: coverImage 
              ? `url("${coverImage}")` 
              : user?.bannerUrl 
                ? `url("${user.bannerUrl}")`
                : user?.banner_url 
                  ? `url("${user.banner_url}")`
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundColor: '#059669'
          }}
        >
        <div className="absolute inset-0 bg-black/10"></div>
        {isOwner && (
          <Button
            size="sm"
            variant="secondary"
            className="absolute top-3 right-3 h-8 text-xs opacity-80 hover:opacity-100"
            onClick={() => handleImageUpload('cover')}
          >
            <Camera className="h-3 w-3 mr-1" />
            <span className="hidden sm:inline">Change Cover</span>
            <span className="sm:hidden">Cover</span>
          </Button>
        )}
      </div>
      
        <div className="w-full p-4 md:p-6 -mt-8 md:-mt-12 relative bg-white">
          <div className="flex items-start justify-between gap-2 sm:gap-4">
          {/* Left Section: Profile Photo */}
          <div className="relative">
            <Avatar className="h-20 w-20 md:h-24 md:w-24 border-4 border-white shadow-lg">
              {profileImage || user?.avatarUrl || user?.avatar_url ? (
                <AvatarImage src={profileImage || user?.avatarUrl || user?.avatar_url || undefined} />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-orange-500 to-amber-500 text-white text-lg md:text-xl font-bold">
                  {user?.firstName?.[0] || user?.username?.[0] || 'U'}{user?.lastName?.[0] || ''}
                </AvatarFallback>
              )}
            </Avatar>
            {isOwner && (
              <Button
                size="sm"
                variant="secondary"
                className="absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 h-7 w-7 md:h-8 md:w-8 rounded-full p-0"
                onClick={() => handleImageUpload('profile')}
              >
                <Camera className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Center Section: Name and Info */}
          <div className="flex-1 mx-4 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
              {isOwner ? (
                <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                  <EditableField
                    label=""
                    fieldName="firstName"
                    value={user?.firstName || ''}
                    onSave={async (fieldName: string, value: string) => {
                      onProfileUpdate?.('firstName', value);
                    }}
                    placeholder="First Name"
                    className="text-2xl md:text-3xl font-bold text-gray-900"
                  />
                  <EditableField
                    label=""
                    fieldName="lastName"
                    value={user?.lastName || ''}
                    onSave={async (fieldName: string, value: string) => {
                      onProfileUpdate?.('lastName', value);
                    }}
                    placeholder="Last Name"
                    className="text-2xl md:text-3xl font-bold text-gray-900"
                  />
                </div>
              ) : (
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {user?.firstName || user?.username || 'Player'} {user?.lastName || ''}
                </h1>
              )}
              <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs md:text-sm w-fit mx-auto sm:mx-0">
                Rank #{user?.rankingPoints ? Math.max(1, Math.floor(user.rankingPoints / 100)) : 'Unranked'}
              </Badge>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-muted-foreground mb-4 text-sm">
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3 md:h-4 md:w-4" />
                {isOwner ? (
                  <EditableField
                    label="Location"
                    fieldName="location"
                    value={user?.location || ''}
                    onSave={async (fieldName: string, value: string) => {
                      onProfileUpdate?.('location', value);
                    }}
                    placeholder="Add your location"
                  />
                ) : (
                  <span>{user?.location || 'Location not set'}</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 md:h-4 md:w-4" />
                {isOwner ? (
                  <EditableField
                    label="Playing Since"
                    fieldName="playingSince"
                    value={user?.playingSince || ''}
                    onSave={async (fieldName: string, value: string) => {
                      onProfileUpdate?.('playingSince', value);
                    }}
                    placeholder="Playing since year"
                  />
                ) : (
                  <span>Playing since {user?.playingSince || 'Unknown'}</span>
                )}
              </div>
            </div>

            {/* Profile Completion Indicator (only for owners) */}
            {isOwner && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-900">{t('passport.completionPercentage')}</span>
                  <span className="text-sm text-blue-600">{user?.profileCompletionPct || user?.profile_completion_pct || '0'}%</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{width: `${user?.profileCompletionPct || user?.profile_completion_pct || 0}%`}}></div>
                </div>
                <div className="text-xs text-blue-600 mt-1">
                  {(user?.profileCompletionPct || user?.profile_completion_pct || 0) < 100 
                    ? `Complete ${Math.ceil((100 - (user?.profileCompletionPct || user?.profile_completion_pct || 0)) / 5)} more fields to reach 100%`
                    : "Profile complete! You're maximizing your visibility."
                  }
                </div>
              </div>
            )}

            {/* Quick Stats - Mobile Optimized */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-lg md:text-2xl font-bold text-orange-600">{user?.rankingPoints || user?.ranking_points || '0'}</div>
                <div className="text-xs text-muted-foreground">{t('leaderboard.rankingPoints')}</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-lg md:text-2xl font-bold text-blue-600">{user?.totalMatches || '0'}</div>
                <div className="text-xs text-muted-foreground">{t('passport.matches')}</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-lg md:text-2xl font-bold text-green-600">{user?.winRate || '0'}%</div>
                <div className="text-xs text-muted-foreground">{t('passport.winRate')}</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-lg md:text-2xl font-bold text-purple-600">{user?.picklePoints || user?.pickle_points || '0'}</div>
                <div className="text-xs text-muted-foreground">{t('passport.picklePoints')}</div>
              </div>
            </div>
          </div>

            {/* Right Section: QR Code */}
            <div className="flex-shrink-0">
              <div className="flex flex-col items-center gap-2">
                <div className="bg-white p-2 rounded-lg shadow-md">
                  <QRCodeSVG
                    value={qrCodeData}
                    size={64}
                    level="M"
                    className="block"
                  />
                </div>
                <div className="text-xs text-center text-muted-foreground max-w-[80px]">
                  <QrCode className="h-3 w-3 mx-auto mb-1" />
                  <span className="block">Connect</span>
                </div>
                {/* Passport Code - Quick Access */}
                <div className="bg-gray-50 rounded px-2 py-1 max-w-[80px]">
                  <div className="text-center">
                    <div className="text-[10px] text-muted-foreground mb-1">ID</div>
                    <div 
                      className="font-mono text-[10px] font-semibold text-gray-900 cursor-pointer hover:text-orange-600 transition-colors"
                      onClick={handleCopyPassportId}
                      title="Click to copy passport ID"
                    >
                      {passportId}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      
      {/* Tabbed Content - Full Screen */}
      <div className="w-full p-0">
        <Tabs defaultValue="about" className="w-full">
          <TabsList className={`grid w-full h-auto p-1 ${userRoles.isCoach ? 'grid-cols-6' : 'grid-cols-5'}`}>
            <TabsTrigger value="about" className="text-xs md:text-sm px-2 py-2">{t('tabs.overview')}</TabsTrigger>
            <TabsTrigger value="stats" className="text-xs md:text-sm px-2 py-2">{t('tabs.stats')}</TabsTrigger>
            <TabsTrigger value="rankings" className="text-xs md:text-sm px-2 py-2">{t('nav.rankings')}</TabsTrigger>
            <TabsTrigger value="points" className="text-xs md:text-sm px-2 py-2">{t('tabs.points')}</TabsTrigger>
            {userRoles.isCoach && <TabsTrigger value="coaching" className="text-xs md:text-sm px-2 py-2">{t('nav.coaching')}</TabsTrigger>}
            <TabsTrigger value="connect" className="text-xs md:text-sm px-2 py-2">{t('passport.qrCode')}</TabsTrigger>
          </TabsList>
            
          
          <TabsContent value="about" className="space-y-4 p-4">
            {/* Bio Section */}
            <Card>
              <CardHeader>
                <CardTitle>{t('passport.bio')}</CardTitle>
              </CardHeader>
              <CardContent>
                <EditableField
                  label=""
                  value={user?.bio || "I'm passionate about pickleball and always looking to improve my game. I enjoy playing both recreationally and competitively, and love meeting new players on the court!"}
                  fieldName="bio"
                  fieldType="textarea"
                  onSave={async (fieldName, value) => onProfileUpdate?.('bio', value)}
                  placeholder="Tell others about your pickleball journey..."
                />
              </CardContent>
            </Card>

            {/* Coaching Widget - Only show for students (isOwner and not coach) */}
            {isOwner && (!userRoles?.isCoach) && (
              <StudentCoachingWidget />
            )}

            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle>{t('passport.personalInfo')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <EditableField
                      label="Location"
                      value={user?.location || "San Francisco, CA"}
                      fieldName="location"
                      onSave={async (fieldName, value) => onProfileUpdate?.('location', value)}
                      placeholder="Your city, state"
                    />
                    
                    <EditableField
                      label="Playing Since"
                      value={user?.playingSince || ''}
                      fieldName="playingSince"
                      onSave={async (fieldName, value) => onProfileUpdate?.('playingSince', value)}
                      placeholder="Year you started playing"
                    />

                    <EditableField
                      label="Skill Level"
                      value={user?.skillLevel || ''}
                      fieldName="skillLevel"
                      fieldType="select"
                      selectOptions={[
                        { value: "Beginner", label: "Beginner" },
                        { value: "Intermediate", label: "Intermediate" },
                        { value: "Advanced", label: "Advanced" },
                        { value: "Expert", label: "Expert" }
                      ]}
                      onSave={async (fieldName, value) => onProfileUpdate?.('skillLevel', value)}
                      placeholder="Select your skill level"
                    />

                    <EditableField
                      label="Playing Style"
                      value={user?.playingStyle || ''}
                      fieldName="playingStyle"
                      fieldType="select"
                      selectOptions={[
                        { value: "Aggressive Baseline", label: "Aggressive Baseline" },
                        { value: "Finesse Player", label: "Finesse Player" },
                        { value: "Power Player", label: "Power Player" },
                        { value: "All Court", label: "All Court" },
                        { value: "Defensive Counter-Puncher", label: "Defensive Counter-Puncher" },
                        { value: "Net Rusher", label: "Net Rusher" }
                      ]}
                      onSave={async (fieldName, value) => onProfileUpdate?.('playingStyle', value)}
                      placeholder="Select your playing style"
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <EditableField
                      label="Dominant Hand"
                      value={user?.dominantHand || ''}
                      fieldName="dominantHand"
                      fieldType="select"
                      selectOptions={[
                        { value: "Right", label: "Right" },
                        { value: "Left", label: "Left" },
                        { value: "Ambidextrous", label: "Ambidextrous" }
                      ]}
                      onSave={async (fieldName, value) => onProfileUpdate?.('dominantHand', value)}
                      placeholder="Select dominant hand"
                    />

                    <EditableField
                      label="Gender"
                      value={user?.gender || ''}
                      fieldName="gender"
                      fieldType="select"
                      selectOptions={[
                        { value: "Male", label: "Male" },
                        { value: "Female", label: "Female" }
                      ]}
                      onSave={async (fieldName, value) => onProfileUpdate?.('gender', value)}
                      placeholder="Select gender"
                    />

                    <EditableField
                      label="Home Courts"
                      value={user?.homeCourtLocations || ''}
                      fieldName="homeCourtLocations"
                      onSave={async (fieldName, value) => onProfileUpdate?.('homeCourtLocations', value)}
                      placeholder="Your regular playing venues"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Playing Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>{t('passport.playingPreferences', 'Playing Preferences')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-sm font-medium text-orange-800 mb-2">Preferred Format</div>
                    <EditableField
                      label=""
                      value={user?.preferredFormat || ''}
                      fieldName="preferredFormat"
                      fieldType="select"
                      selectOptions={[
                        { value: "Singles", label: "Singles" },
                        { value: "Doubles", label: "Doubles" },
                        { value: "Mixed Doubles", label: "Mixed Doubles" }
                      ]}
                      onSave={async (fieldName, value) => onProfileUpdate?.('preferredFormat', value)}
                      placeholder="Select format"
                      className="text-center"
                    />
                  </div>
                  
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-sm font-medium text-blue-800 mb-2">Preferred Surface</div>
                    <EditableField
                      label=""
                      value={user?.preferredSurface || ''}
                      fieldName="preferredSurface"
                      fieldType="select"
                      selectOptions={[
                        { value: "Hard Court", label: "Hard Court" },
                        { value: "Indoor", label: "Indoor" },
                        { value: "Outdoor", label: "Outdoor" },
                        { value: "No Preference", label: "No Preference" }
                      ]}
                      onSave={async (fieldName, value) => onProfileUpdate?.('preferredSurface', value)}
                      placeholder="Select surface"
                      className="text-center"
                    />
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-sm font-medium text-green-800 mb-2">Looking for Partners</div>
                    <EditableField
                      label=""
                      value={user?.lookingForPartners ? "Yes" : "No"}
                      fieldName="lookingForPartners"
                      onSave={async (fieldName, value) => onProfileUpdate?.('lookingForPartners', value === "Yes")}
                      placeholder="Yes/No"
                      className="text-center"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <EditableField
                    label="Player Goals"
                    value={user?.playerGoals || ''}
                    fieldName="playerGoals"
                    fieldType="textarea"
                    onSave={async (fieldName, value) => onProfileUpdate?.('playerGoals', value)}
                    placeholder="What are your pickleball goals this year?"
                  />
                  <EditableField
                    label="Travel Radius (km)"
                    value={user?.travelRadiusKm?.toString() || ''}
                    fieldName="travelRadiusKm"
                    onSave={async (fieldName, value) => onProfileUpdate?.('travelRadiusKm', parseInt(value) || null)}
                    placeholder="How far will you travel to play?"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Equipment Section */}
            <Card>
              <CardHeader>
                <CardTitle>{t('passport.equipmentGear', 'Equipment & Gear')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <EditableField
                      label="Paddle Brand"
                      value={user?.paddleBrand || ''}
                      fieldName="paddleBrand"
                      fieldType="select"
                      selectOptions={[
                        { value: "Selkirk", label: "Selkirk" },
                        { value: "JOOLA", label: "JOOLA" },
                        { value: "Paddletek", label: "Paddletek" },
                        { value: "Engage", label: "Engage" },
                        { value: "Head", label: "Head" },
                        { value: "Babolat", label: "Babolat" },
                        { value: "Wilson", label: "Wilson" },
                        { value: "Yonex", label: "Yonex" },
                        { value: "SHOT3", label: "SHOT3" },
                        { value: "Other", label: "Other" }
                      ]}
                      onSave={async (fieldName, value) => onProfileUpdate?.('paddleBrand', value)}
                      placeholder="Select paddle brand"
                    />
                    <EditableField
                      label="Paddle Model"
                      value={user?.paddleModel || ''}
                      fieldName="paddleModel"
                      onSave={async (fieldName, value) => onProfileUpdate?.('paddleModel', value)}
                      placeholder="e.g., Amped Invikta, Ben Johns Hyperion"
                    />
                    <EditableField
                      label="Shoes Brand"
                      value={user?.shoesBrand || ''}
                      fieldName="shoesBrand"
                      fieldType="select"
                      selectOptions={[
                        { value: "K-Swiss", label: "K-Swiss" },
                        { value: "Asics", label: "Asics" },
                        { value: "New Balance", label: "New Balance" },
                        { value: "Nike", label: "Nike" },
                        { value: "Adidas", label: "Adidas" },
                        { value: "Fila", label: "Fila" },
                        { value: "Wilson", label: "Wilson" },
                        { value: "Head", label: "Head" },
                        { value: "Other", label: "Other" }
                      ]}
                      onSave={async (fieldName, value) => onProfileUpdate?.('shoesBrand', value)}
                      placeholder="Select shoes brand"
                    />
                  </div>
                  <div className="space-y-4">
                    <EditableField
                      label="Backup Paddle Brand"
                      value={user?.backupPaddleBrand || ''}
                      fieldName="backupPaddleBrand"
                      onSave={async (fieldName, value) => onProfileUpdate?.('backupPaddleBrand', value)}
                      placeholder="Your backup paddle brand"
                    />
                    <EditableField
                      label="Apparel Brand"
                      value={user?.apparelBrand || ''}
                      fieldName="apparelBrand"
                      fieldType="select"
                      selectOptions={[
                        { value: "Nike", label: "Nike" },
                        { value: "Adidas", label: "Adidas" },
                        { value: "Under Armour", label: "Under Armour" },
                        { value: "SHOT3", label: "SHOT3" },
                        { value: "Lululemon", label: "Lululemon" },
                        { value: "Wilson", label: "Wilson" },
                        { value: "Head", label: "Head" },
                        { value: "Fila", label: "Fila" },
                        { value: "Other", label: "Other" }
                      ]}
                      onSave={async (fieldName, value) => onProfileUpdate?.('apparelBrand', value)}
                      placeholder="Select apparel brand"
                    />
                    <EditableField
                      label="Other Equipment"
                      value={user?.otherEquipment || ''}
                      fieldName="otherEquipment"
                      fieldType="textarea"
                      onSave={async (fieldName, value) => onProfileUpdate?.('otherEquipment', value)}
                      placeholder="Bags, grips, accessories, etc."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* External Ratings */}
            <Card>
              <CardHeader>
                <CardTitle>{t('passport.externalRatings', 'External Ratings & Profiles')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <EditableField
                      label="DUPR Rating"
                      value={user?.duprRating || ''}
                      fieldName="duprRating"
                      onSave={async (fieldName, value) => onProfileUpdate?.('duprRating', value)}
                      placeholder="e.g., 4.25"
                    />
                    <EditableField
                      label="UTPR Rating"
                      value={user?.utprRating || ''}
                      fieldName="utprRating"
                      onSave={async (fieldName, value) => onProfileUpdate?.('utprRating', value)}
                      placeholder="e.g., 4.0"
                    />
                    <EditableField
                      label="WPR Rating"
                      value={user?.wprRating || ''}
                      fieldName="wprRating"
                      onSave={async (fieldName, value) => onProfileUpdate?.('wprRating', value)}
                      placeholder="e.g., 4.5"
                    />
                  </div>
                  <div className="space-y-4">
                    <EditableField
                      label="IFP Rating"
                      value={user?.ifpRating || ''}
                      fieldName="ifpRating"
                      onSave={async (fieldName, value) => onProfileUpdate?.('ifpRating', value)}
                      placeholder="e.g., 4.25"
                    />
                    <EditableField
                      label="IPTPA Rating"
                      value={user?.iptpaRating || ''}
                      fieldName="iptpaRating"
                      onSave={async (fieldName, value) => onProfileUpdate?.('iptpaRating', value)}
                      placeholder="e.g., 4.0"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Self-Assessment */}
            <Card>
              <CardHeader>
                <CardTitle>{t('passport.performanceAssessment', 'Performance Self-Assessment (1-10 Scale)')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <EditableField
                      label="Forehand Strength"
                      value={user?.forehandStrength?.toString() || '5'}
                      fieldName="forehandStrength"
                      fieldType="slider"
                      min={1}
                      max={10}
                      step={1}
                      sliderLabels={{
                        1: "Beginner",
                        3: "Developing",
                        5: "Average", 
                        7: "Strong",
                        10: "Elite"
                      }}
                      onSave={async (fieldName, value) => onProfileUpdate?.('forehandStrength', parseInt(value) || null)}
                      placeholder="Rate your forehand"
                    />
                    <EditableField
                      label="Backhand Strength"
                      value={user?.backhandStrength?.toString() || '5'}
                      fieldName="backhandStrength"
                      fieldType="slider"
                      min={1}
                      max={10}
                      step={1}
                      sliderLabels={{
                        1: "Beginner",
                        3: "Developing",
                        5: "Average", 
                        7: "Strong",
                        10: "Elite"
                      }}
                      onSave={async (fieldName, value) => onProfileUpdate?.('backhandStrength', parseInt(value) || null)}
                      placeholder="Rate your backhand"
                    />
                  </div>
                  <div className="space-y-4">
                    <EditableField
                      label="Serve Power"
                      value={user?.servePower?.toString() || '5'}
                      fieldName="servePower"
                      fieldType="slider"
                      min={1}
                      max={10}
                      step={1}
                      sliderLabels={{
                        1: "Soft",
                        3: "Light",
                        5: "Moderate", 
                        7: "Strong",
                        10: "Power"
                      }}
                      onSave={async (fieldName, value) => onProfileUpdate?.('servePower', parseInt(value) || null)}
                      placeholder="Rate your serve power"
                    />
                    <EditableField
                      label="Dink Accuracy"
                      value={user?.dinkAccuracy?.toString() || '5'}
                      fieldName="dinkAccuracy"
                      fieldType="slider"
                      min={1}
                      max={10}
                      step={1}
                      sliderLabels={{
                        1: "Learning",
                        3: "Basic",
                        5: "Good", 
                        7: "Precise",
                        10: "Perfect"
                      }}
                      onSave={async (fieldName, value) => onProfileUpdate?.('dinkAccuracy', parseInt(value) || null)}
                      placeholder="Rate your dink accuracy"
                    />
                  </div>
                  <div className="space-y-4">
                    <EditableField
                      label="Third Shot Consistency"
                      value={user?.thirdShotConsistency?.toString() || '5'}
                      fieldName="thirdShotConsistency"
                      fieldType="slider"
                      min={1}
                      max={10}
                      step={1}
                      sliderLabels={{
                        1: "Struggling",
                        3: "Learning",
                        5: "Reliable", 
                        7: "Consistent",
                        10: "Automatic"
                      }}
                      onSave={async (fieldName, value) => onProfileUpdate?.('thirdShotConsistency', parseInt(value) || null)}
                      placeholder="Rate your third shot consistency"
                    />
                    <EditableField
                      label="Court Coverage"
                      value={user?.courtCoverage?.toString() || '5'}
                      fieldName="courtCoverage"
                      fieldType="slider"
                      min={1}
                      max={10}
                      step={1}
                      sliderLabels={{
                        1: "Limited",
                        3: "Basic",
                        5: "Good", 
                        7: "Mobile",
                        10: "Lightning"
                      }}
                      onSave={async (fieldName, value) => onProfileUpdate?.('courtCoverage', parseInt(value) || null)}
                      placeholder="Rate your court coverage"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Physical & Fitness */}
            <Card>
              <CardHeader>
                <CardTitle>{t('passport.physicalAttributesFitness', 'Physical Attributes & Fitness')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <EditableField
                      label="Height (cm)"
                      value={user?.height?.toString() || ''}
                      fieldName="height"
                      onSave={async (fieldName, value) => onProfileUpdate?.('height', parseInt(value) || null)}
                      placeholder="e.g., 175"
                    />
                    <EditableField
                      label="Reach (cm)"
                      value={user?.reach?.toString() || ''}
                      fieldName="reach"
                      onSave={async (fieldName, value) => onProfileUpdate?.('reach', parseInt(value) || null)}
                      placeholder="e.g., 185"
                    />
                    <EditableField
                      label="Fitness Level"
                      value={user?.fitnessLevel || ''}
                      fieldName="fitnessLevel"
                      fieldType="select"
                      selectOptions={[
                        { value: "Excellent", label: "Excellent" },
                        { value: "Very Good", label: "Very Good" },
                        { value: "Good", label: "Good" },
                        { value: "Fair", label: "Fair" },
                        { value: "Needs Improvement", label: "Needs Improvement" }
                      ]}
                      onSave={async (fieldName, value) => onProfileUpdate?.('fitnessLevel', value)}
                      placeholder="Select fitness level"
                    />
                  </div>
                  <div className="space-y-4">
                    <EditableField
                      label="Competitive Intensity (1-10)"
                      value={user?.competitiveIntensity?.toString() || '5'}
                      fieldName="competitiveIntensity"
                      fieldType="slider"
                      min={1}
                      max={10}
                      step={1}
                      sliderLabels={{
                        1: "Casual",
                        3: "Recreational", 
                        5: "Moderate",
                        7: "Competitive",
                        10: "Elite"
                      }}
                      onSave={async (fieldName, value) => onProfileUpdate?.('competitiveIntensity', parseInt(value) || null)}
                      placeholder="How competitive are you?"
                    />
                    <EditableField
                      label="Mobility Limitations"
                      value={user?.mobilityLimitations || ''}
                      fieldName="mobilityLimitations"
                      fieldType="textarea"
                      onSave={async (fieldName, value) => onProfileUpdate?.('mobilityLimitations', value)}
                      placeholder="Any physical limitations to note"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="stats" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              {/* PCP Verified Scores Widget */}
              <RecentMatchesWidget className="md:col-span-2" limit={5} />
              
              {/* Performance Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">
                    Performance chart would go here
                  </div>
                </CardContent>
              </Card>

              {/* Match Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle>Match Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span>Total Matches</span>
                    <span className="font-bold text-blue-600">{user?.totalMatches || 0}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span>Win Rate</span>
                    <span className="font-bold text-emerald-600">{user?.winRate || 0}%</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span>Current Streak</span>
                    <span className="font-bold text-purple-600">{user?.currentStreak || 0}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span>Pickle Points</span>
                    <span className="font-bold text-orange-600">{user?.picklePoints || user?.pickle_points || 0}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="rankings" className="space-y-4">
            {/* Achievements Section */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl mb-2">🏆</div>
                    <h4 className="font-semibold text-sm">First Win</h4>
                    <p className="text-xs text-muted-foreground">Won your first match</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl mb-2">🎯</div>
                    <h4 className="font-semibold text-sm">Accuracy Pro</h4>
                    <p className="text-xs text-muted-foreground">90% shot accuracy</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl mb-2">🔥</div>
                    <h4 className="font-semibold text-sm">Win Streak</h4>
                    <p className="text-xs text-muted-foreground">5 wins in a row</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Leaderboard with Format Filters */}
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="font-semibold text-lg mb-2">Complete Leaderboards</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Filter by age group, gender, and event type - rankings update in real-time
                </p>
              </div>
              
              {/* Unified Rankings Interface */}
              <UnifiedRankingsView />
            </div>
          </TabsContent>
          
          <TabsContent value="points" className="space-y-4 p-4">
            {/* Pickle Points Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">🎯</span>
                  Pickle Points Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{user?.picklePoints || '0'}</div>
                    <div className="text-sm text-muted-foreground">Total Points</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">#{user?.pointsRank || 'Unranked'}</div>
                    <div className="text-sm text-muted-foreground">Points Rank</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{user?.recentStreak || '0'}</div>
                    <div className="text-sm text-muted-foreground">Win Streak</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{user?.weeklyBonus || '0'}</div>
                    <div className="text-sm text-muted-foreground">Weekly Bonus</div>
                  </div>
                </div>

                {/* Recent Points Activity */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Recent Points Activity</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-green-600 text-lg">+45</span>
                        <span className="text-sm">Tournament Win vs Elite Player</span>
                      </div>
                      <span className="text-xs text-muted-foreground">2 days ago</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-blue-600 text-lg">+15</span>
                        <span className="text-sm">League Match Victory</span>
                      </div>
                      <span className="text-xs text-muted-foreground">5 days ago</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-orange-600 text-lg">+10</span>
                        <span className="text-sm">Streak Bonus (3 wins)</span>
                      </div>
                      <span className="text-xs text-muted-foreground">1 week ago</span>
                    </div>
                  </div>
                </div>

                {/* Algorithm Summary */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-sm mb-2">How Points Are Calculated</h4>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>• Tournament: 15 points (+50% win bonus)</p>
                    <p>• League: 10 points (+50% win bonus)</p>
                    <p>• Casual: 6 points (+50% win bonus)</p>
                    <p>• Tier bonuses: Professional +30%, Elite +20%, Competitive +10%</p>
                    <p>• Streak bonuses: 3+ wins (+10%), 5+ wins (+20%), 10+ wins (+30%)</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Point Earning Opportunities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                    <span className="text-lg">🏆</span>
                    <span className="font-medium">Join Tournament</span>
                    <span className="text-xs text-muted-foreground">Earn 15-22 points</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                    <span className="text-lg">🎯</span>
                    <span className="font-medium">League Match</span>
                    <span className="text-xs text-muted-foreground">Earn 10-15 points</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                    <span className="text-lg">⭐</span>
                    <span className="font-medium">Daily Bonus</span>
                    <span className="text-xs text-muted-foreground">+2 points daily</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {userRoles.isCoach && (
            <TabsContent value="coaching" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Coaching Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-blue-600" />
                      Coaching Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-xl font-bold text-blue-600">32</div>
                        <div className="text-xs text-muted-foreground">Total Students</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-xl font-bold text-green-600">147</div>
                        <div className="text-xs text-muted-foreground">Sessions</div>
                      </div>
                      <div className="text-center p-3 bg-yellow-50 rounded-lg">
                        <div className="text-xl font-bold text-yellow-600">4.8</div>
                        <div className="text-xs text-muted-foreground">Avg Rating</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-xl font-bold text-purple-600">$75</div>
                        <div className="text-xs text-muted-foreground">Hourly Rate</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Sessions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-green-600" />
                      Recent Sessions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { student: "Sarah Chen", focus: "Third Shot Drop", rating: 5, date: "Dec 15" },
                        { student: "Mike Rodriguez", focus: "Dinking Strategy", rating: 4, date: "Dec 12" },
                        { student: "Lisa Thompson", focus: "Serve & Return", rating: 5, date: "Dec 10" }
                      ].map((session, index) => (
                        <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                          <div>
                            <div className="font-medium">{session.student}</div>
                            <div className="text-sm text-muted-foreground">{session.focus}</div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${
                                    i < session.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <div className="text-xs text-muted-foreground">{session.date}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Coaching Certifications */}
              <Card>
                <CardHeader>
                  <CardTitle>PCP Certifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { level: "Level 1", status: "Certified", color: "bg-green-50 text-green-700" },
                      { level: "Level 2", status: "In Progress", color: "bg-yellow-50 text-yellow-700" },
                      { level: "Level 3", status: "Available", color: "bg-gray-50 text-gray-700" },
                      { level: "Level 4", status: "Locked", color: "bg-gray-100 text-gray-500" }
                    ].map((cert, index) => (
                      <div key={index} className={`p-4 rounded-lg text-center ${cert.color}`}>
                        <div className="font-semibold">{cert.level}</div>
                        <div className="text-sm mt-1">{cert.status}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
          
          <TabsContent value="connect" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Connect & Network</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="bg-white p-4 rounded-lg shadow-md inline-block mb-4">
                    <QRCodeSVG
                      value={qrCodeData}
                      size={128}
                      level="M"
                      className="block"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mb-6">
                    Scan to connect and view full profile
                  </p>
                  
                  {/* Passport ID Section */}
                  <div className="bg-gray-50 rounded-lg p-4 max-w-sm mx-auto">
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <p className="text-xs text-muted-foreground mb-1">Passport ID</p>
                        <p className="font-mono text-lg font-semibold text-gray-900">{passportId}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyPassportId}
                        className="ml-3"
                      >
                        {copiedPassportId ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Your unique player identifier
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      </div>
    </div>
  );
}