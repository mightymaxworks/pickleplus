/**
 * Passport-Centric Dashboard Component
 * 
 * Player passport dashboard featuring prominent QR code functionality
 * and Pickle Points integration. Removes horizontal scrolling in favor
 * of clean, passport-style layout.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-06-03
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { 
  QrCode, 
  Star, 
  Trophy, 
  TrendingUp, 
  Users,
  Scan,
  Zap,
  Award,
  Target,
  Camera,
  Calendar,
  ClipboardList,
  Medal,
  Activity,
  ArrowRight,
  Sparkles,
  DollarSign,
  MapPin,
  Info,
  Upload,
  X,
  Edit,
  BookOpen,
  Search,
  Eye
} from 'lucide-react';
import PhotoUploadModal from '@/components/PhotoUploadModal';
import { ComingSoonModal } from '@/components/ui/coming-soon-modal';
import { useToast } from '@/hooks/use-toast';
import { useMatchStatistics } from '@/hooks/use-match-statistics';
import { useRecentMatches } from '@/hooks/use-recent-matches';
import { useAllRankingPositions } from '@/hooks/use-all-ranking-positions';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageToggle } from '@/components/LanguageToggle';
import { format, formatDistanceToNow } from 'date-fns';
import { PassportDetailModal } from '@/components/profile/PassportDetailModal';
import { PADDLE_BRAND_OPTIONS } from '@/constants/paddleBrands';
import { OnboardingProgressIndicator } from '@/components/onboarding/OnboardingProgressIndicator';
import ProgressExplanationTooltip from '@/components/progress/ProgressExplanationTooltip';
import NextStepsGuidance from '@/components/progress/NextStepsGuidance';
// Removed for next deployment: PeerComparisonWidget, AchievementTracker

import BadgeShowcase from '@/components/gamification/BadgeShowcase';
import ProgressCelebration from '@/components/gamification/ProgressCelebration';
import SocialSharingWidget from '@/components/gamification/SocialSharingWidget';
import RealTimeNotifications from '@/components/gamification/RealTimeNotifications';
// Removed for next deployment: MobileOptimizedAchievementTracker, CommunityChallengePlatform
import { EnhancedSocialHub } from '@/components/gamification/EnhancedSocialHub';
import PerformanceAnalyticsDashboard from '@/components/gamification/PerformanceAnalyticsDashboard';
import { MobileCoachingEntry } from '@/components/coaching/MobileCoachingEntry';

interface PassportDashboardProps {
  onShowOnboarding?: () => void;
}

export default function PassportDashboard({ onShowOnboarding }: PassportDashboardProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [qrVisible, setQrVisible] = useState(false);
  const [showPassportCode, setShowPassportCode] = useState(false);
  const [isPhotoUploadOpen, setIsPhotoUploadOpen] = useState(false);
  const [isPassportExpanded, setIsPassportExpanded] = useState(false);
  const [comingSoonModal, setComingSoonModal] = useState({ isOpen: false, feature: '', description: '' });
  const [profileFormData, setProfileFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  // Sprint 4 component visibility states
  // Notifications are now unified with the bell notification system
  const [showPerformanceAnalytics, setShowPerformanceAnalytics] = useState(true);
  // Removed state for advanced achievements and community challenges (next deployment)
  const [showEnhancedSocial, setShowEnhancedSocial] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Check if user is already a coach
  const { data: coachProfile, isLoading: isCoachLoading } = useQuery({
    queryKey: ['/api/coaches/my-profile'],
    retry: false
  });
  
  const isCoach = coachProfile && (coachProfile as any).id;
  
  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: any) => {
      // Separate coaching fields from user profile fields
      const coachingFields = ['coachBio', 'experienceYears', 'hourlyRate', 'specialties', 'certifications'];
      const userProfileData: any = {};
      const coachingData: any = {};
      
      // Split fields based on whether they're coaching-related
      Object.keys(profileData).forEach(key => {
        if (coachingFields.includes(key)) {
          // Map field names for coaching profile
          if (key === 'coachBio') {
            coachingData.bio = profileData[key];
          } else {
            coachingData[key] = profileData[key];
          }
        } else {
          userProfileData[key] = profileData[key];
        }
      });

      // First get CSRF token if needed
      let headers: any = {
        'Content-Type': 'application/json',
      };
      
      // Get CSRF token for production environments
      if (process.env.NODE_ENV === 'production') {
        const csrfResponse = await fetch('/api/csrf-token', {
          credentials: 'include'
        });
        if (csrfResponse.ok) {
          const { token } = await csrfResponse.json();
          headers['x-csrf-token'] = token;
        }
      }
      
      // Update user profile if there are non-coaching fields
      if (Object.keys(userProfileData).length > 0) {
        const response = await fetch('/api/profile/update', {
          method: 'PATCH',
          headers,
          credentials: 'include',
          body: JSON.stringify(userProfileData),
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to update profile');
        }
      }

      // Update coaching profile if coaching fields are present and user is a coach
      const hasCoachingChanges = isCoach && Object.keys(coachingData).length > 0;
      
      if (hasCoachingChanges) {
        const coachResponse = await fetch('/api/coaches/my-profile', {
          method: 'PUT',
          headers,
          credentials: 'include',
          body: JSON.stringify(coachingData),
        });

        if (!coachResponse.ok) {
          const errorData = await coachResponse.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to update coaching profile');
        }
        
        return coachResponse.json();
      }
      
      // Return success if only user profile was updated
      return { success: true };
    },
    onSuccess: (data) => {
      // Update cache with fresh data if available
      if (data && data.id) {
        queryClient.setQueryData(['/api/coaches/my-profile'], data);
      }
      
      // Invalidate queries to trigger fresh fetches
      queryClient.invalidateQueries({ queryKey: ['/api/auth/current-user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
      queryClient.invalidateQueries({ queryKey: ['/api/coaches/my-profile'] });
      
      // Clear the form data
      setProfileFormData({});
      
      toast({
        title: "Profile Updated",
        description: "Your profile changes have been saved successfully.",
      });
      setIsPassportExpanded(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle form field changes
  const handleFieldChange = (field: string, value: any) => {
    setProfileFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Save profile changes
  const handleSaveProfile = () => {
    console.log('Profile form data before save:', profileFormData);
    
    if (Object.keys(profileFormData).length === 0) {
      toast({
        title: "No Changes",
        description: "Please make some changes before saving.",
        variant: "destructive",
      });
      return;
    }
    
    updateProfileMutation.mutate(profileFormData);
  };
  
  // Fetch match statistics and recent matches
  const { data: matchStats, isLoading: isMatchStatsLoading } = useMatchStatistics({ 
    userId: user?.id,
    enabled: !!user
  });
  
  const { 
    data: recentMatches, 
    isLoading: isRecentMatchesLoading
  } = useRecentMatches({ 
    userId: user?.id,
    limit: 3,
    enabled: !!user
  });
  
  // Fetch ATP ranking data (new system)
  const { data: atpRankingData } = useQuery({
    queryKey: ['atp-ranking', user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/atp-ranking/${user?.id}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch ATP ranking');
      return response.json();
    },
    enabled: !!user
  });

  // Fetch Pickle Points data (new pure activity-based system)
  const { data: picklePointsData } = useQuery({
    queryKey: ['pickle-points', user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/pickle-points/${user?.id}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch pickle points');
      return response.json();
    },
    enabled: !!user
  });

  // Fetch PCP Global Ranking data using new age-division system
  const currentYear = new Date().getFullYear();
  const userAge = user?.yearOfBirth ? currentYear - user.yearOfBirth : 0;
  const ageDivision = userAge >= 35 ? '35plus' : '19plus';
  
  const { data: pcpRankingData } = useQuery({
    queryKey: ['multi-rankings-position', user?.id, 'singles', ageDivision, 'age-division-v1'],
    queryFn: async () => {
      const params = new URLSearchParams({
        userId: user?.id?.toString() || '',
        format: 'singles',
        ageDivision: ageDivision
      });
      const response = await fetch(`/api/multi-rankings/position?${params.toString()}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch PCP rankings');
      return response.json();
    },
    enabled: !!user?.id
  });

  // Fetch all ranking positions for competitive motivation
  const { data: allRankingPositions, isLoading: isLoadingAllPositions } = useAllRankingPositions();

  // Fetch legacy ranking data for comparison
  const { data: rankingData } = useQuery({
    queryKey: ['rankings', 'passport', user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/rankings/passport/${user?.id}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch rankings');
      return response.json();
    },
    enabled: !!user?.id
  });

  if (!user) return null;

  const winRate = matchStats?.winRate || (user.totalMatches ? Math.round((user.matchesWon || 0) / (user.totalMatches || 1) * 100) : 0);
  const currentStreak = matchStats?.currentStreak || 0;
  const picklePoints = picklePointsData?.picklePoints || user.picklePoints || 0;
  
  // Calculate total ranking points from all categories
  const totalRankingPoints = allRankingPositions?.data?.reduce((total, position) => {
    return total + (position.rankingPoints || 0);
  }, 0) || 0;

  const handleQRReveal = () => {
    setQrVisible(!qrVisible);
    setShowPassportCode(!showPassportCode);
    toast({
      title: qrVisible ? t('dashboard.qr.codeHidden') : t('dashboard.qr.codeRevealed'),
      description: qrVisible ? t('dashboard.qr.codeHiddenDesc') : `${t('dashboard.qr.yourCode')}: ${user.passportCode}`,
    });
  };

  const handleRecordMatch = () => {
    // Navigate to match recording
    window.location.href = '/matches/record';
  };

  const handleJoinTournament = () => {
    setComingSoonModal({
      isOpen: true,
      feature: t('dashboard.tournaments.title'),
      description: t('dashboard.tournaments.comingSoon')
    });
  };

  const handleFindPlayers = () => {
    setComingSoonModal({
      isOpen: true,
      feature: t('dashboard.players.title'),
      description: t('dashboard.players.comingSoon')
    });
  };

  const handleBecomeCoach = () => {
    // Navigate to coach application form
    window.location.href = '/coach/apply';
  }

  const handlePCPCertification = () => {
    // Navigate to PCP certification page
    window.location.href = '/pcp-certification';
  }

  const handleManageCoachProfile = () => {
    // Open the inline profile editing modal instead of navigating to separate page
    setIsPassportExpanded(true);
  }

  const handleFindCoaches = () => {
    // Navigate to find coaches page
    window.location.href = '/find-coaches';
  }

  const handleFindTrainingFacilities = () => {
    setComingSoonModal({
      isOpen: true,
      feature: t('dashboard.training.title'),
      description: t('dashboard.training.comingSoon')
    });
  };

  const handleViewMyClasses = () => {
    // Navigate to My Classes page
    window.location.href = '/my-classes';
  };

  const handlePhotoUploadSuccess = (avatarUrl: string) => {
    setIsPhotoUploadOpen(false);
    toast({
      title: t('dashboard.photo.updated'),
      description: t('dashboard.photo.uploadedSuccess'),
    });
    // Refresh user data to show new avatar
    window.location.reload();
  };



  return (
    <div className="relative min-h-screen">
      {/* Sophisticated Cool-Toned Background */}
      <div className="fixed inset-0 -z-10">
        {/* Elegant Cool Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50"></div>
        
        {/* Subtle Large Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-slate-200/15 to-blue-200/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-gradient-to-r from-blue-200/10 to-indigo-200/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-72 h-72 bg-gradient-to-r from-indigo-200/12 to-slate-200/12 rounded-full blur-3xl animate-pulse delay-4000"></div>
        
        {/* Minimal Floating Elements */}
        <div className="absolute top-24 left-24 w-3 h-3 bg-slate-400/30 rounded-full animate-bounce delay-500"></div>
        <div className="absolute top-48 right-32 w-2 h-2 bg-blue-400/30 rounded-full animate-bounce delay-1500"></div>
        <div className="absolute bottom-32 left-1/3 w-4 h-4 bg-indigo-400/25 rounded-full animate-bounce delay-2500"></div>
        
        {/* Sophisticated Line Elements */}
        <div className="absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-300/25 to-transparent"></div>
        <div className="absolute bottom-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-300/20 to-transparent"></div>
        
        {/* Refined Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `
            linear-gradient(to right, #64748b 1px, transparent 1px),
            linear-gradient(to bottom, #64748b 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}></div>
      </div>
      <div className="relative max-w-6xl mx-auto px-4 space-y-1 z-10 mt-[-63px] mb-[-63px]">
      {/* Onboarding Progress Indicator for new users */}
      <OnboardingProgressIndicator onShowFullOnboarding={onShowOnboarding} />
      
      {/* Enhanced Futuristic Background Animations */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Large floating geometric shapes - much more visible */}
        <motion.div
          className="absolute top-10 left-10 w-32 h-32 border-2 border-orange-400/60 rounded-full bg-orange-100/20"
          animate={{ 
            y: [0, -30, 0],
            rotate: [0, 180, 360],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/3 right-16 w-24 h-24 border-2 border-yellow-400/70 rotate-45 bg-yellow-100/25"
          animate={{ 
            y: [0, 25, 0],
            rotate: [45, 225, 405],
            opacity: [0.4, 0.8, 0.4]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/3 left-1/3 w-20 h-20 bg-gradient-to-r from-orange-300/40 to-yellow-300/40 rounded-full border border-orange-300/50"
          animate={{ 
            x: [0, 40, 0],
            y: [0, -30, 0],
            scale: [1, 1.4, 1]
          }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* More visible scanning line effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-200/30 to-transparent h-3"
          animate={{ y: ["-10vh", "110vh"] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Enhanced particle effect */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-orange-400/60 rounded-full shadow-lg"
            style={{
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut"
            }}
          />
        ))}
        
        {/* Pulsing background orbs */}
        <motion.div
          className="absolute top-1/2 left-1/2 w-40 h-40 bg-orange-200/20 rounded-full blur-xl"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-28 h-28 bg-yellow-200/25 rounded-full blur-lg"
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [0.15, 0.35, 0.15]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </div>
      {/* Player Passport Header with Prominent QR Code */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10"
      >
        <Card 
          className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm"
        >
          <CardContent className="p-2">
            <div className="flex flex-col lg:flex-row items-center gap-4">
              {/* Player Information */}
              <div className="flex-1 text-center lg:text-left">
                {/* Language Toggle - Top Right */}
                <div className="flex justify-end mb-2">
                  <LanguageToggle />
                </div>
                <div className="flex items-center justify-center lg:justify-start gap-4 mb-4">
                  {/* Profile Photo with Upload Functionality */}
                  <motion.div 
                    className="relative cursor-pointer group"
                    whileHover={{ scale: 1.08, rotate: 2 }}
                    whileTap={{ scale: 0.92 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    onClick={() => setIsPhotoUploadOpen(true)}
                  >
                    {user.avatarUrl ? (
                      <img 
                        src={user.avatarUrl} 
                        alt={user.displayName || user.username} 
                        className="w-28 h-32 rounded-lg object-cover shadow-xl border-4 border-orange-400 hover:border-orange-500 transition-all duration-500 passport-photo"
                        style={{ aspectRatio: '3/4' }}
                      />
                    ) : (
                      <div className="w-28 h-32 bg-gradient-to-br from-orange-500 via-red-500 to-orange-600 rounded-lg flex items-center justify-center text-white font-bold text-2xl shadow-xl hover:shadow-2xl transition-all duration-500 passport-photo border-4 border-orange-400">
                        {user.displayName?.split(' ').map(n => n[0]).join('') || user.username.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    
                    {/* Upload overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 rounded-lg transition-all duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center text-white">
                        <Camera className="w-6 h-6 mb-1" />
                        <span className="text-xs font-medium">{t('dashboard.photo.update')}</span>
                      </div>
                    </div>
                    
                    <motion.div 
                      className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-3 border-white shadow-lg"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    ></motion.div>
                  </motion.div>
                  <div>
                    <motion.h1 
                      className="text-3xl lg:text-4xl font-extrabold text-orange-900 tracking-[-0.02em] leading-[1.1] font-mono"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      style={{ fontFamily: '"SF Pro Display", "Inter", "Segoe UI", system-ui, sans-serif' }}
                    >
                      {user.displayName || user.username}
                    </motion.h1>
                    <motion.p 
                      className="text-orange-700 text-lg font-medium tracking-wide uppercase opacity-80"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      style={{ fontFamily: '"JetBrains Mono", "Fira Code", monospace' }}
                    >
                      @{user.username}
                    </motion.p>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6, type: "spring" }}
                    >
                      <Badge className="mt-2 bg-gradient-to-r from-orange-100 to-orange-200 text-orange-900 border-orange-300 px-3 py-1 text-sm font-bold shadow-md">
                        <Medal className="w-4 h-4 mr-2" />
                        {t('dashboard.passport.title')}
                      </Badge>
                    </motion.div>
                  </div>
                </div>

                {/* Edit Profile Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="flex justify-center lg:justify-start mt-4"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-orange-600 border-orange-300 hover:bg-orange-50"
                    onClick={() => setIsPassportExpanded(!isPassportExpanded)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    {t('dashboard.form.editProfile')}
                  </Button>
                </motion.div>

                {/* Key Stats Grid */}
                <motion.div 
                  className="grid grid-cols-2 lg:grid-cols-6 gap-3"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                >
                  <motion.div 
                    className="text-center lg:text-left bg-white/50 rounded-lg p-3 shadow-sm hover:shadow-md transition-all"
                    whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.8)" }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <p className="text-xs text-orange-600 font-bold uppercase tracking-wider">{t('dashboard.cards.duprRating')}</p>
                    <p className="text-3xl font-black text-orange-900">{user.duprRating || '0'}</p>
                  </motion.div>
                  <motion.div 
                    className="text-center lg:text-left bg-white/50 rounded-lg p-3 shadow-sm hover:shadow-md transition-all"
                    whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.8)" }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <p className="text-xs text-purple-600 font-bold uppercase tracking-wider">{t('dashboard.stats.rankingPoints')}</p>
                    <p className="text-3xl font-black text-purple-700">{totalRankingPoints}</p>
                  </motion.div>
                  <motion.div 
                    className="text-center lg:text-left bg-white/50 rounded-lg p-3 shadow-sm hover:shadow-md transition-all"
                    whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.8)" }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <p className="text-xs text-green-600 font-bold uppercase tracking-wider">{t('dashboard.cards.winRate')}</p>
                    <p className="text-3xl font-black text-green-700">{winRate}%</p>
                  </motion.div>
                  <motion.div 
                    className="text-center lg:text-left bg-white/50 rounded-lg p-3 shadow-sm hover:shadow-md transition-all"
                    whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.8)" }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">{t('dashboard.cards.matches')}</p>
                    <p className="text-3xl font-black text-blue-700">{matchStats?.totalMatches || 0}</p>
                  </motion.div>
                  <motion.div 
                    className="text-center lg:text-left bg-white/50 rounded-lg p-3 shadow-sm hover:shadow-md transition-all"
                    whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.8)" }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider">{t('dashboard.stats.streak')}</p>
                    <p className="text-3xl font-black text-indigo-700">{currentStreak}</p>
                  </motion.div>
                  <motion.div 
                    className="text-center lg:text-left bg-gradient-to-r from-orange-100 to-yellow-100 border-2 border-orange-300 rounded-lg p-3 shadow-md hover:shadow-lg transition-all cursor-pointer"
                    whileHover={{ scale: 1.05, backgroundColor: "rgba(255,165,0,0.2)" }}
                    transition={{ type: "spring", stiffness: 300 }}
                    onClick={() => {
                      if (user.passportCode) {
                        navigator.clipboard.writeText(user.passportCode);
                        toast({
                          title: t('dashboard.passport.codeCopied'),
                          description: `${user.passportCode} ${t('dashboard.passport.copiedToClipboard')}`,
                        });
                      }
                    }}
                  >
                    <p className="text-xs text-orange-700 font-bold uppercase tracking-wider">{t('dashboard.stats.passportCode')}</p>
                    <p className="text-2xl font-mono font-black text-orange-800">
                      {user.passportCode || 'LOADING...'}
                    </p>
                    <p className="text-xs text-orange-600 mt-1">{t('dashboard.stats.tapToCopy')}</p>
                  </motion.div>
                </motion.div>

                {/* PCP Global Ranking Display - All Divisions & Formats */}
                <div className="mt-3 pt-3 border-t border-orange-200">
                  <h3 className="text-sm font-semibold text-orange-800 mb-2 flex items-center gap-2">
                    <Trophy className="w-4 h-4" />
                    {t('dashboard.rankings.title')}
                  </h3>
                  
                  {isLoadingAllPositions ? (
                    <div className="grid grid-cols-2 gap-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white/50 rounded-lg p-3 border border-gray-200 animate-pulse">
                          <div className="h-4 bg-gray-200 rounded mb-2"></div>
                          <div className="h-6 bg-gray-200 rounded mb-1"></div>
                          <div className="h-3 bg-gray-200 rounded"></div>
                        </div>
                      ))}
                    </div>
                  ) : allRankingPositions?.data && allRankingPositions.data.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {allRankingPositions.data.map((position, index) => {
                        const formatDisplayName = position.format === 'mixed_doubles' ? 'Mixed Doubles' :
                                                 position.format === 'singles' ? 'Singles' : 'Doubles';
                        const divisionDisplayName = position.division === 'open' ? 'Open' : 
                                                   position.division === '35+' ? '35+' : position.division;
                        const colorScheme = index % 4 === 0 ? 'purple' : 
                                          index % 4 === 1 ? 'blue' : 
                                          index % 4 === 2 ? 'indigo' : 'violet';
                        const isRanked = position.status === 'ranked';
                        

                        return (
                          <motion.div 
                            key={`${position.division}-${position.format}`}
                            className={`bg-white/70 rounded-lg p-3 border border-${colorScheme}-200 hover:border-${colorScheme}-300 transition-all cursor-pointer hover:shadow-md`}
                            whileHover={{ scale: 1.02 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-1">
                                <div className={`w-2 h-2 bg-${colorScheme}-500 rounded-full`}></div>
                                <span className={`text-xs font-bold text-${colorScheme}-700 uppercase leading-tight`}>
                                  {divisionDisplayName} {formatDisplayName.split(' ')[1] || formatDisplayName.split(' ')[0]}
                                </span>
                              </div>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${
                                  isRanked 
                                    ? `text-${colorScheme}-600 bg-${colorScheme}-50 border-${colorScheme}-300`
                                    : 'text-orange-600 bg-orange-50 border-orange-300'
                                }`}
                              >
                                {isRanked ? t('dashboard.rankings.ranked') : t('dashboard.rankings.unranked')}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <div className={`text-lg font-black text-${colorScheme}-700`}>
                                  {position.rankingPoints}
                                </div>
                                <div className={`text-xs text-${colorScheme}-600`}>
                                  {isRanked 
                                    ? `${t('dashboard.rankings.rank')} #${position.rank}`
                                    : `${position.matchCount}/${position.requiredMatches} ${t('dashboard.rankings.matches')}`
                                  }
                                </div>
                              </div>
                              {!isRanked && position.needsMatches > 0 && (
                                <div className="text-right">
                                  <div className="text-xs text-orange-600 font-medium">
                                    {t('dashboard.rankings.need')} {position.needsMatches}
                                  </div>
                                  <div className="text-xs text-orange-500">
                                    {t('dashboard.rankings.more')}
                                  </div>
                                </div>
                              )}
                            </div>
                            {!isRanked && (
                              <div className={`mt-2 rounded-full h-1.5 overflow-hidden bg-gray-200`}>
                                <div 
                                  className="h-full transition-all duration-1000 ease-out"
                                  style={{ 
                                    width: `${position.matchCount === 0 ? 0 : Math.min(100, Math.max(5, (position.matchCount / position.requiredMatches) * 100))}%`,
                                    backgroundColor: colorScheme === 'purple' ? '#a855f7' :
                                                   colorScheme === 'blue' ? '#3b82f6' :
                                                   colorScheme === 'indigo' ? '#6366f1' : '#8b5cf6'
                                  }}
                                />
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-white/70 rounded-lg p-3 border border-gray-200">
                      <div className="text-center text-gray-600">
                        <Trophy className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <div className="text-sm font-medium">{t('dashboard.rankings.noData')}</div>
                        <div className="text-xs">{t('dashboard.rankings.playMatches')}</div>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-2 text-xs text-orange-600 flex items-center justify-between">
                    <span>{t('dashboard.rankings.systemVersion')}</span>
                    {allRankingPositions?.totalCategories && (
                      <span className="text-orange-500 font-medium">
                        {allRankingPositions.totalCategories} {t('dashboard.rankings.eligibleCategories')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Prominent QR Code Section */}
              <div className="flex flex-col items-center">
                <motion.div 
                  className="w-40 h-40 bg-white border-4 border-orange-300 rounded-xl flex items-center justify-center mb-3 shadow-xl cursor-pointer hover:shadow-2xl transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleQRReveal}
                >
                  {showPassportCode ? (
                    <div className="text-center">
                      <QrCode className="w-24 h-24 text-orange-600 mx-auto mb-2" />
                      <div className="font-mono font-bold text-sm text-orange-700 bg-orange-50 px-2 py-1 rounded border">
                        {user.passportCode || 'LOADING...'}
                      </div>
                    </div>
                  ) : (
                    <QrCode className="w-32 h-32 text-orange-600" />
                  )}
                </motion.div>
                <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-300 px-3 py-1">
                  <Scan className="w-3 h-3 mr-1" />
                  {showPassportCode ? t('dashboard.qr.codeVisible') : t('dashboard.qr.tapToReveal')}
                </Badge>
                <p className="text-xs text-orange-600 mt-1 text-center max-w-32">
                  {showPassportCode ? t('dashboard.qr.shareCode') : t('dashboard.qr.scanDescription')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Inline Profile Expansion */}
        <motion.div
          initial={false}
          animate={{ 
            height: isPassportExpanded ? 'auto' : 0,
            opacity: isPassportExpanded ? 1 : 0 
          }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          className="overflow-hidden"
        >
          {isPassportExpanded && (
            <Card className="mt-4 bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-orange-800">
                    {t('dashboard.form.editProfile')}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsPassportExpanded(false)}
                    className="text-orange-600 hover:text-orange-800"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-orange-800 text-sm uppercase tracking-wide">{t('dashboard.form.basicInfo')}</h3>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700">{t('dashboard.form.displayName')}</label>
                        <input
                          type="text"
                          defaultValue={user.displayName || ''}
                          onChange={(e) => handleFieldChange('displayName', e.target.value)}
                          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-sm font-medium text-gray-700">{t('dashboard.form.firstName')}</label>
                          <input
                            type="text"
                            defaultValue={user.firstName || ''}
                            onChange={(e) => handleFieldChange('firstName', e.target.value)}
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">{t('dashboard.form.lastName')}</label>
                          <input
                            type="text"
                            defaultValue={user.lastName || ''}
                            onChange={(e) => handleFieldChange('lastName', e.target.value)}
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-700">{t('dashboard.form.location')}</label>
                        <input
                          type="text"
                          defaultValue={user.location || ''}
                          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-700">{t('dashboard.form.bio')}</label>
                        <textarea
                          defaultValue={user.bio || ''}
                          rows={3}
                          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Playing Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-orange-800 text-sm uppercase tracking-wide">Playing Information</h3>
                    
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Skill Level</label>
                          <input
                            type="text"
                            defaultValue={user.skillLevel || ''}
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Playing Since</label>
                          <input
                            type="text"
                            defaultValue={user.playingSince || ''}
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-700">Preferred Position</label>
                        <select
                          defaultValue={user.preferredPosition || ''}
                          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                          <option value="">Select Position</option>
                          <option value="left">Left Side</option>
                          <option value="right">Right Side</option>
                          <option value="both">Both Sides</option>
                        </select>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Paddle Brand</label>
                          <select
                            defaultValue={user.paddleBrand || ''}
                            onChange={(e) => handleFieldChange('paddleBrand', e.target.value)}
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          >
                            <option value="">{t('dashboard.form.selectPaddleBrand')}</option>
                            {PADDLE_BRAND_OPTIONS.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">{t('dashboard.form.paddleModel')}</label>
                          <input
                            type="text"
                            defaultValue={user.paddleModel || ''}
                            onChange={(e) => handleFieldChange('paddleModel', e.target.value)}
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Coaching Information - Only show for coaches */}
                  {isCoach && (
                    <div className="space-y-4">
                      <h3 className="font-semibold text-emerald-800 text-sm uppercase tracking-wide">{t('coaching.pcpProgramme')}</h3>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-700">{t('dashboard.form.coachBio')}</label>
                          <textarea
                            defaultValue={(coachProfile as any)?.bio || ''}
                            onChange={(e) => handleFieldChange('coachBio', e.target.value)}
                            rows={3}
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            placeholder={t('dashboard.form.coachBioPlaceholder')}
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-sm font-medium text-gray-700">{t('dashboard.form.experienceYears')}</label>
                            <input
                              type="number"
                              defaultValue={(coachProfile as any)?.experienceYears || ''}
                              onChange={(e) => handleFieldChange('experienceYears', e.target.value ? parseInt(e.target.value) : 0)}
                              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700">{t('dashboard.form.hourlyRate')}</label>
                            <input
                              type="number"
                              defaultValue={(coachProfile as any)?.hourlyRate || ''}
                              onChange={(e) => handleFieldChange('hourlyRate', e.target.value ? parseFloat(e.target.value) : 0)}
                              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-gray-700">{t('dashboard.form.specialties')}</label>
                          <textarea
                            defaultValue={(coachProfile as any)?.specialties?.join(', ') || ''}
                            onChange={(e) => handleFieldChange('specialties', e.target.value ? e.target.value.split(', ').filter(s => s.trim()) : [])}
                            rows={2}
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            placeholder={t('dashboard.form.specialtiesPlaceholder')}
                          />
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-gray-700">{t('dashboard.form.certifications')}</label>
                          <textarea
                            defaultValue={(coachProfile as any)?.certifications?.join(', ') || ''}
                            onChange={(e) => handleFieldChange('certifications', e.target.value ? e.target.value.split(', ').filter(s => s.trim()) : [])}
                            rows={2}
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            placeholder={t('dashboard.form.certificationsPlaceholder')}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* External Ratings */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-orange-800 text-sm uppercase tracking-wide">{t('dashboard.form.externalRatings')}</h3>
                    
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-sm font-medium text-gray-700">{t('dashboard.form.duprRating')}</label>
                          <input
                            type="number"
                            step="0.01"
                            defaultValue={user.duprRating || ''}
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">{t('dashboard.form.usaPickleballId')}</label>
                          <input
                            type="text"
                            defaultValue={(user as any).usaPickleballId || ''}
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-sm font-medium text-gray-700">{t('dashboard.form.ifpRating')}</label>
                          <input
                            type="number"
                            step="0.01"
                            defaultValue={user.ifpRating || ''}
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">{t('dashboard.form.iptpaRating')}</label>
                          <input
                            type="number"
                            step="0.01"
                            defaultValue={user.iptpaRating || ''}
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Physical Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-orange-800 text-sm uppercase tracking-wide">{t('dashboard.form.physicalInfo')}</h3>
                    
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="text-sm font-medium text-gray-700">{t('dashboard.form.height')}</label>
                          <input
                            type="number"
                            defaultValue={user.height || ''}
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">{t('dashboard.form.reach')}</label>
                          <input
                            type="number"
                            defaultValue={user.reach || ''}
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">{t('dashboard.form.yearOfBirth')}</label>
                          <input
                            type="number"
                            defaultValue={user.yearOfBirth || ''}
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-700">{t('dashboard.form.gender')}</label>
                        <select
                          defaultValue={user.gender || ''}
                          onChange={(e) => handleFieldChange('gender', e.target.value)}
                          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                          <option value="">{t('dashboard.form.selectGender')}</option>
                          <option value="male">{t('dashboard.form.male')}</option>
                          <option value="female">{t('dashboard.form.female')}</option>
                          <option value="other">{t('dashboard.form.other')}</option>
                          <option value="prefer_not_to_say">{t('dashboard.form.preferNotToSay')}</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Save Button */}
                <div className="mt-6 flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsPassportExpanded(false)}
                    className="text-gray-600 border-gray-300 hover:bg-gray-50"
                  >
                    {t('dashboard.form.cancel')}
                  </Button>
                  <Button
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                    onClick={handleSaveProfile}
                    disabled={updateProfileMutation.isPending}
                  >
                    {updateProfileMutation.isPending ? t('dashboard.form.saving') : t('dashboard.form.saveChanges')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </motion.div>

      {/* Pickle Points Hub - Prominent Feature */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-yellow-800">
                  <Zap className="w-6 h-6 text-yellow-500" />
                  Pickle Points
                </h2>
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="p-1 rounded-full hover:bg-yellow-100 transition-colors">
                      <Info className="w-4 h-4 text-yellow-600" />
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2 text-orange-600">
                        <Zap className="w-5 h-5" />
                        {t('dashboard.picklePoints.dialogTitle', 'What are Pickle Points?')}
                      </DialogTitle>
                      <button 
                        className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                        onClick={(e) => {
                          e.preventDefault();
                          const closeButton = e.currentTarget.closest('[role="dialog"]')?.querySelector('[data-dialog-close]') as HTMLElement;
                          if (closeButton) closeButton.click();
                        }}
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                      </button>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                        <h3 className="font-semibold text-orange-800 mb-2">{t('dashboard.picklePoints.title')}</h3>
                        <p className="text-orange-700 text-sm">
                          {t('dashboard.picklePoints.description')}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <Trophy className="w-6 h-6 text-green-600 mx-auto mb-1" />
                          <p className="text-xs font-medium text-green-800">{t('dashboard.picklePoints.winMatches')}</p>
                          <p className="text-xs text-green-600">{t('dashboard.picklePoints.winMatchesPoints')}</p>
                        </div>
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <Users className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                          <p className="text-xs font-medium text-blue-800">{t('dashboard.picklePoints.profileUpdates')}</p>
                          <p className="text-xs text-blue-600">{t('dashboard.picklePoints.profileUpdatesPoints')}</p>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                          <Calendar className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                          <p className="text-xs font-medium text-purple-800">{t('dashboard.picklePoints.joinTournaments')}</p>
                          <p className="text-xs text-purple-600">{t('dashboard.picklePoints.joinTournamentsPoints')}</p>
                        </div>
                        <div className="text-center p-3 bg-pink-50 rounded-lg">
                          <Star className="w-6 h-6 text-pink-600 mx-auto mb-1" />
                          <p className="text-xs font-medium text-pink-800">{t('dashboard.picklePoints.dailyActivity')}</p>
                          <p className="text-xs text-pink-600">{t('dashboard.picklePoints.dailyActivityPoints')}</p>
                        </div>
                      </div>
                      
                      <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                        <h3 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                          <Sparkles className="w-4 h-4" />
                          {t('dashboard.picklePoints.redeemTitle')}
                        </h3>
                        <p className="text-amber-700 text-sm mb-2">
                          {t('dashboard.picklePoints.redeemDescription')}
                        </p>
                        <ul className="text-xs text-amber-600 space-y-1">
                          <li>• {t('dashboard.picklePoints.redeemCourt')}</li>
                          <li>• {t('dashboard.picklePoints.redeemEquipment')}</li>
                          <li>• {t('dashboard.picklePoints.redeemTournament')}</li>
                          <li>• {t('dashboard.picklePoints.redeemCoaching')}</li>
                          <li>• {t('dashboard.picklePoints.redeemEvents')}</li>
                        </ul>
                      </div>
                      
                      <div className="text-center text-xs text-gray-500">
                        {t('dashboard.picklePoints.disclaimer')}
                      </div>
                      
                      {/* Mobile Close Button */}
                      <div className="flex justify-center pt-4 md:hidden">
                        <button 
                          className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                          onClick={(e) => {
                            e.preventDefault();
                            const closeButton = e.currentTarget.closest('[role="dialog"]')?.querySelector('[data-dialog-close]') as HTMLElement;
                            if (closeButton) closeButton.click();
                          }}
                        >
                          {t('common.close', 'Close')}
                        </button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <p className="text-3xl font-bold text-yellow-600">{picklePoints.toLocaleString()}</p>
                  <ProgressExplanationTooltip
                    rating={picklePoints}
                    ratingType="pickle_points"
                    currentLevel={picklePoints >= 600 ? "Veteran Player" : picklePoints >= 300 ? "Experienced Player" : picklePoints >= 100 ? "Active Player" : "Newcomer"}
                  />
                </div>
                <p className="text-sm text-yellow-700">{t('dashboard.picklePoints.totalPoints')}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <p className="text-sm text-yellow-600">{t('dashboard.picklePoints.matchWins')}</p>
                <p className="text-xl font-bold text-yellow-800">{picklePointsData?.breakdown?.matchWinPoints || 0}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-yellow-600">{t('dashboard.picklePoints.participation')}</p>
                <p className="text-xl font-bold text-yellow-800">{picklePointsData?.breakdown?.matchParticipationPoints || 0}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-yellow-600">{t('dashboard.picklePoints.profileBonus')}</p>
                <p className="text-xl font-bold text-yellow-800">{picklePointsData?.breakdown?.profileBonus || 0}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-yellow-600">{t('dashboard.picklePoints.system')}</p>
                <p className="text-xs font-bold text-yellow-800">{t('dashboard.picklePoints.hybrid')}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                className="bg-yellow-500 hover:bg-yellow-600 text-white"
                onClick={() => setComingSoonModal({
                  isOpen: true,
                  feature: t('dashboard.picklePoints.spendPoints'),
                  description: t('dashboard.picklePoints.spendDescription')
                })}
              >
                <DollarSign className="w-4 h-4 mr-2" />
                {t('dashboard.picklePoints.spendPoints')}
              </Button>
              <Button 
                variant="outline" 
                className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                onClick={() => setComingSoonModal({
                  isOpen: true,
                  feature: t('dashboard.picklePoints.earnMore'),
                  description: t('dashboard.picklePoints.earnDescription')
                })}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {t('dashboard.picklePoints.earnMore')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content Tabs - Replacing Scrolling Sections */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Tabs defaultValue="coaching" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="coaching" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Coaching
            </TabsTrigger>
            <TabsTrigger value="performance">{t('dashboard.tabs.performance')}</TabsTrigger>
            <TabsTrigger value="matches">{t('dashboard.tabs.recentMatches')}</TabsTrigger>
            <TabsTrigger value="achievements">{t('dashboard.tabs.achievements')}</TabsTrigger>
            <TabsTrigger value="social" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Social
            </TabsTrigger>
            <TabsTrigger value="community">{t('dashboard.tabs.community')}</TabsTrigger>
          </TabsList>
          
          {/* Coaching Tab - Primary Entry Point */}
          <TabsContent value="coaching" className="space-y-4 mt-6">
            <MobileCoachingEntry 
              userRole={isCoach ? 'coach' : 'player'}
              urgentCount={isCoach ? 2 : 1}
              nextAction={isCoach ? 'Review 2 new session requests from students' : 'Join your session with Coach Max tomorrow at 3:00 PM'}
              currentStep={isCoach ? 'pending_requests' : 'session_scheduled'}
            />
            
            {/* Coaching Statistics */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {isCoach ? '12' : '3'}
                  </div>
                  <div className="text-sm text-gray-600">
                    {isCoach ? 'Total Sessions' : 'Completed Sessions'}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {isCoach ? '4.8' : '3.3'}
                  </div>
                  <div className="text-sm text-gray-600">
                    {isCoach ? 'Coach Rating' : 'PCP Score'}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Quick Actions Grid */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isCoach ? (
                  <>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => window.location.href = '/coach/students'}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Manage My Students
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => window.location.href = '/coach/assessment-tool'}
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      PCP Assessment Tool
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => window.location.href = '/coach/schedule'}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      My Schedule & Availability
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => window.location.href = '/find-coaches'}
                    >
                      <Search className="h-4 w-4 mr-2" />
                      Browse All Coaches
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => window.location.href = '/sessions/upcoming'}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      My Sessions
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => window.location.href = '/feedback'}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View My Progress
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-4 mt-6">
            {/* PCP Certification Discovery Section - Only for non-coaches */}
            {!isCoach && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50 mb-6">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="bg-emerald-100 p-2 rounded-lg">
                            <Award className="w-6 h-6 text-emerald-600" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-emerald-900">Become a Certified Coach</h3>
                            <p className="text-emerald-700 text-sm">Join the PCP Coaching Certification Programme</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div className="text-center">
                            <div className="bg-emerald-100 p-2 rounded-lg w-fit mx-auto mb-1">
                              <Star className="w-4 h-4 text-emerald-600" />
                            </div>
                            <p className="text-xs font-medium text-emerald-800">5 Certification Levels</p>
                            <p className="text-xs text-emerald-600">Foundation to Master</p>
                          </div>
                          <div className="text-center">
                            <div className="bg-green-100 p-2 rounded-lg w-fit mx-auto mb-1">
                              <DollarSign className="w-4 h-4 text-green-600" />
                            </div>
                            <p className="text-xs font-medium text-emerald-800">Higher Earnings</p>
                            <p className="text-xs text-emerald-600">30-50% increase</p>
                          </div>
                          <div className="text-center">
                            <div className="bg-blue-100 p-2 rounded-lg w-fit mx-auto mb-1">
                              <Users className="w-4 h-4 text-blue-600" />
                            </div>
                            <p className="text-xs font-medium text-emerald-800">Elite Network</p>
                            <p className="text-xs text-emerald-600">Professional coaches</p>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            onClick={handlePCPCertification}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1"
                          >
                            <Award className="w-4 h-4 mr-2" />
                            PCP Certification
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                          <Button 
                            onClick={handleBecomeCoach}
                            variant="outline"
                            className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                          >
                            Apply as Coach
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
            
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                    {t('dashboard.performance.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{t('dashboard.performance.overallRating')}</span>
                      <span className="font-semibold">{user.duprRating || '4.2'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{t('dashboard.performance.passportCode')}</span>
                      <div className="flex items-center gap-2">
                        {showPassportCode ? (
                          <span className="font-mono font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded border">
                            {user.passportCode || t('dashboard.performance.notSet')}
                          </span>
                        ) : (
                          <span className="font-mono text-gray-400">••••••••</span>
                        )}
                        <button 
                          onClick={handleQRReveal}
                          className="text-xs text-orange-600 hover:text-orange-700 underline"
                        >
                          {showPassportCode ? t('dashboard.performance.hide') : t('dashboard.performance.show')}
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{t('dashboard.performance.recentForm')}</span>
                      <Badge className="bg-green-100 text-green-800">{t('dashboard.performance.improving')}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{t('dashboard.performance.pointsThisMonth')}</span>
                      <span className="font-semibold text-yellow-600">+{Math.floor(picklePoints * 0.3)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-green-500" />
                    {t('dashboard.quickActions.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button onClick={handleRecordMatch} className="w-full justify-start bg-blue-500 hover:bg-blue-600">
                    <ClipboardList className="w-4 h-4 mr-2" />
                    {t('dashboard.quickActions.recordMatch')}
                  </Button>
                  
                  {/* Role-based coaching action */}
                  {isCoach ? (
                    <Button onClick={handleManageCoachProfile} className="w-full justify-start bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white">
                      <Award className="w-4 h-4 mr-2" />
                      {t('dashboard.quickActions.manageCoachProfile')}
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <Button onClick={handlePCPCertification} className="w-full justify-start bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white">
                        <Award className="w-4 h-4 mr-2" />
                        PCP Certification Programme
                      </Button>
                      <Button onClick={handleBecomeCoach} variant="outline" className="w-full justify-start border-emerald-300 text-emerald-700 hover:bg-emerald-50">
                        <Users className="w-4 h-4 mr-2" />
                        Apply as Training Center Coach
                      </Button>
                    </div>
                  )}
                  
                  {/* Quick actions for coaches */}
                  {isCoach && (
                    <Button onClick={handleFindTrainingFacilities} variant="outline" className="w-full justify-start">
                      <MapPin className="w-4 h-4 mr-2" />
                      {t('dashboard.quickActions.findTrainingFacilities')}
                    </Button>
                  )}
                  
                  {/* Quick actions for regular players */}
                  {!isCoach && (
                    <>
                      <Button onClick={handleViewMyClasses} variant="outline" className="w-full justify-start">
                        <Calendar className="w-4 h-4 mr-2" />
                        View My Classes
                      </Button>
                      <Button onClick={handleFindCoaches} variant="outline" className="w-full justify-start">
                        <Users className="w-4 h-4 mr-2" />
                        {t('dashboard.quickActions.findCoaches')}
                      </Button>
                      <Button onClick={handleFindTrainingFacilities} variant="outline" className="w-full justify-start">
                        <MapPin className="w-4 h-4 mr-2" />
                        {t('dashboard.quickActions.findTrainingFacilities')}
                      </Button>
                    </>
                  )}
                  
                  <Button onClick={handleJoinTournament} variant="outline" className="w-full justify-start">
                    <Calendar className="w-4 h-4 mr-2" />
                    {t('dashboard.quickActions.joinTournament')}
                  </Button>
                  <Button onClick={handleFindPlayers} variant="outline" className="w-full justify-start">
                    <Users className="w-4 h-4 mr-2" />
                    {t('dashboard.quickActions.findPlayers')}
                  </Button>
                </CardContent>
              </Card>
              
              {/* Progress Visualization Section - Sprint 2 */}
              <div className="mt-6 space-y-6">
                {/* Next Steps Guidance */}
                <NextStepsGuidance
                  currentRating={Number(user.duprRating) || 2.5}
                  ratingType="pcp"
                  userLevel={user.skillLevel || "Intermediate"}
                  completedActions={[]}
                />
                
                {/* Peer comparison and achievement tracking features removed for next deployment */}
              </div>
            </div>
          </TabsContent>

          {/* Recent Matches Tab */}
          <TabsContent value="matches" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-500" />
                  Recent Match History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isRecentMatchesLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse bg-gray-200 h-16 rounded"></div>
                    ))}
                  </div>
                ) : recentMatches && recentMatches.length > 0 ? (
                  <div className="space-y-3">
                    {recentMatches.slice(0, 3).map((match: any) => (
                      <div key={match.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">
                            {match.result === 'win' ? '🏆 Victory' : '📉 Loss'} vs {match.opponentName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {match.matchDate ? format(new Date(match.matchDate), 'MMM dd, yyyy') : 'Recent match'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-yellow-600">+{match.pointsAwarded || 10} points</p>
                          <p className="text-sm text-gray-600">{match.gameScore}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <ClipboardList className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No recent matches</p>
                    <Button onClick={handleRecordMatch} className="mt-3">Record Your First Match</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-4 mt-6">
            <Card>
              <CardContent className="text-center py-12">
                <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Achievement System Coming Soon</h3>
                <p className="text-gray-500 mb-6">Advanced achievement tracking, peer comparison, and progress analytics will be available in a future update.</p>
                <p className="text-sm text-gray-400">Focus on improving your game - we'll track your achievements when this feature launches!</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Social Tab - Sprint 4 Advanced Gamification Features */}
          <TabsContent value="social" className="space-y-6 mt-6">
            {/* Top Row - Performance Analytics (Notifications now unified with bell) */}
            <div className="grid lg:grid-cols-1 gap-4">
              {showPerformanceAnalytics && (
                <div className="w-full">
                  <PerformanceAnalyticsDashboard
                    userId={user?.id}
                    onSetGoal={() => setComingSoonModal({ isOpen: true, feature: 'Goal Setting', description: 'Advanced goal tracking with AI-powered recommendations' })}
                    onViewRecommendations={(skill) => setComingSoonModal({ isOpen: true, feature: `${skill} Training`, description: 'Personalized skill improvement plans' })}
                    onClose={() => setShowPerformanceAnalytics(false)}
                  />
                </div>
              )}
            </div>

            {/* Advanced Achievement Tracking and Community Challenges removed for next deployment */}

            {/* Bottom Row - Enhanced Social Hub and Original Sprint 3 Components */}
            <div className="grid lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <EnhancedSocialHub
                  userId={user?.id}
                  onSendFriendRequest={(userId) => {
                    toast({
                      title: "Friend Request Sent",
                      description: "Your friend request has been sent!",
                    });
                  }}
                  onAcceptMentorship={(requestId) => {
                    toast({
                      title: "Mentorship Accepted",
                      description: "You've accepted the mentorship request!",
                    });
                  }}
                  onShareAchievement={(achievementId) => {
                    toast({
                      title: "Achievement Shared",
                      description: "Your achievement has been shared with friends!",
                    });
                  }}
                />
              </div>
              
              {/* Sprint 3 Components - Badge Showcase & Social Widget */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-amber-500" />
                      Achievement Badges
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <BadgeShowcase
                      userLevel={user.skillLevel || "Intermediate"}
                      currentRating={Number(user.duprRating) || 4.2}
                      ratingType="dupr"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-500" />
                      Social Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SocialSharingWidget
                      userRating={Number(user.duprRating) || 4.2}
                      userBadgeCount={5}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Community Tab */}
          <TabsContent value="community" className="space-y-4 mt-6">
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-500" />
                    Community Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Your Rank</span>
                      <span className="font-semibold">#47 in Points</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Friends Connected</span>
                      <span className="font-semibold">12 players</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Tournaments Joined</span>
                      <span className="font-semibold">3 this month</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    Upcoming Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="font-medium">Weekly Tournament</p>
                      <p className="text-sm text-gray-600">Singles Championship</p>
                      <p className="text-xs text-blue-600">Starts in 2 days</p>
                    </div>
                    <Button variant="outline" className="w-full">
                      <Calendar className="w-4 h-4 mr-2" />
                      View All Events
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
      
      {/* Photo Upload Modal */}
      <PhotoUploadModal
        isOpen={isPhotoUploadOpen}
        onClose={() => setIsPhotoUploadOpen(false)}
        onUploadSuccess={handlePhotoUploadSuccess}
        currentAvatar={user.avatarUrl || undefined}
      />
      

      
        <ComingSoonModal
          isOpen={comingSoonModal.isOpen}
          onClose={() => setComingSoonModal({ isOpen: false, feature: '', description: '' })}
          feature={comingSoonModal.feature}
          description={comingSoonModal.description}
        />
      </div>
    </div>
  );
}