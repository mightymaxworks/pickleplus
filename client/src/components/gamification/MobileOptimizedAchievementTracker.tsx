import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Trophy, 
  Target, 
  Star, 
  Users,
  Camera,
  UserCheck,
  Clock,
  Award,
  Plus,
  CheckCircle,
  Circle,
  Zap
} from 'lucide-react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  category: 'skill' | 'social' | 'consistency' | 'milestone' | 'community';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  currentProgress: number;
  targetProgress: number;
  isCompleted: boolean;
  rewardPicklePoints: number;
  trackingMethod: 'self_report' | 'peer_verification' | 'video_upload' | 'automatic';
  peerVerificationRequired?: number; // number of peers needed
  peerVerifications?: PeerVerification[];
  estimatedTimeToComplete: number;
}

interface PeerVerification {
  id: string;
  verifierId: number;
  verifierName: string;
  verifierAvatar?: string;
  verifiedAt: Date;
  note?: string;
}

interface MobileOptimizedAchievementTrackerProps {
  userId: number;
  onAchievementUnlocked?: (achievement: Achievement) => void;
}

export default function MobileOptimizedAchievementTracker({
  userId,
  onAchievementUnlocked
}: MobileOptimizedAchievementTrackerProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showPeerRequestDialog, setShowPeerRequestDialog] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAchievements();
  }, [userId]);

  const loadAchievements = async () => {
    try {
      // Load real achievement data
      const response = await fetch(`/api/achievements/${userId}`);
      const data = await response.json();
      
      setAchievements(data.achievements || []);
    } catch (error) {
      console.error('Error loading achievements:', error);
      // Show empty state on error
      setAchievements([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelfReport = async (achievementId: string) => {
    try {
      const response = await fetch(`/api/achievements/${achievementId}/self-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      
      if (response.ok) {
        loadAchievements(); // Refresh data
      }
    } catch (error) {
      console.error('Error reporting achievement:', error);
    }
  };

  const handleRequestPeerVerification = async (achievementId: string) => {
    try {
      const response = await fetch(`/api/achievements/${achievementId}/request-peer-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      
      if (response.ok) {
        setShowPeerRequestDialog(false);
        loadAchievements();
      }
    } catch (error) {
      console.error('Error requesting peer verification:', error);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'text-amber-600 bg-amber-50';
      case 'silver': return 'text-gray-600 bg-gray-50';
      case 'gold': return 'text-yellow-600 bg-yellow-50';
      case 'platinum': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'skill': return <Target className="h-4 w-4" />;
      case 'social': return <Users className="h-4 w-4" />;
      case 'consistency': return <Clock className="h-4 w-4" />;
      case 'milestone': return <Star className="h-4 w-4" />;
      case 'community': return <Award className="h-4 w-4" />;
      default: return <Trophy className="h-4 w-4" />;
    }
  };

  const getTrackingMethodButton = (achievement: Achievement) => {
    if (achievement.isCompleted) {
      return (
        <Badge variant="secondary" className="text-green-600 bg-green-50 text-xs flex-shrink-0">
          <CheckCircle className="h-3 w-3 mr-1" />
          Done
        </Badge>
      );
    }

    switch (achievement.trackingMethod) {
      case 'self_report':
        return (
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => handleSelfReport(achievement.id)}
            className="text-xs px-2 py-1 h-7 flex-shrink-0"
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            <span className="hidden xs:inline">Mark </span>Complete
          </Button>
        );
      
      case 'peer_verification':
        const verificationCount = achievement.peerVerifications?.length || 0;
        const requiredCount = achievement.peerVerificationRequired || 2;
        
        return (
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => {
              setSelectedAchievement(achievement);
              setShowPeerRequestDialog(true);
            }}
            className="text-xs px-2 py-1 h-7 flex-shrink-0"
          >
            <UserCheck className="h-3 w-3 mr-1" />
            <span className="hidden xs:inline">Peer </span>({verificationCount}/{requiredCount})
          </Button>
        );
      
      case 'video_upload':
        return (
          <Button 
            size="sm" 
            variant="outline"
            className="text-xs px-2 py-1 h-7 flex-shrink-0"
          >
            <Camera className="h-3 w-3 mr-1" />
            <span className="hidden xs:inline">Upload </span>Video
          </Button>
        );
      
      default:
        return (
          <Badge variant="outline" className="text-xs flex-shrink-0">
            Auto
          </Badge>
        );
    }
  };

  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory);

  const categories = [
    { id: 'all', name: 'All', icon: <Trophy className="h-4 w-4" /> },
    { id: 'skill', name: 'Skills', icon: <Target className="h-4 w-4" /> },
    { id: 'social', name: 'Social', icon: <Users className="h-4 w-4" /> },
    { id: 'consistency', name: 'Streaks', icon: <Clock className="h-4 w-4" /> },
    { id: 'milestone', name: 'Milestones', icon: <Star className="h-4 w-4" /> }
  ];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="h-5 w-5" />
            Achievement Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse text-center py-8">
            Loading achievements...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="w-full max-w-full overflow-hidden achievement-mobile-container">
        <CardHeader className="pb-3 px-2 sm:px-4">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Trophy className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            <span className="truncate">Achievement Tracker</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 px-2 sm:px-4 w-full max-w-full overflow-hidden">
          {/* Mobile-optimized category tabs */}
          <div className="w-full overflow-hidden">
            <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide -mx-1">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex items-center gap-0.5 whitespace-nowrap text-xs px-1.5 py-1 h-7 flex-shrink-0 min-w-0"
                >
                  {category.icon}
                  <span className="hidden sm:inline text-xs">{category.name}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Achievement list - mobile optimized */}
          <div className="space-y-3">
            {filteredAchievements.length > 0 ? (
              filteredAchievements.map((achievement) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg p-2 sm:p-3 space-y-2 sm:space-y-3 w-full max-w-full overflow-hidden"
                >
                  {/* Header section */}
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0 mt-0.5">
                        {getCategoryIcon(achievement.category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm truncate flex-1">
                            {achievement.name}
                          </h4>
                          <Badge className={`text-xs flex-shrink-0 ${getTierColor(achievement.tier)}`}>
                            {achievement.tier}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {achievement.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Progress section */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs gap-2">
                      <span className="text-gray-500 flex-shrink-0">
                        {achievement.currentProgress}/{achievement.targetProgress}
                      </span>
                      <span className="text-amber-600 font-medium flex-shrink-0">
                        +{achievement.rewardPicklePoints} Points
                      </span>
                    </div>
                    <Progress 
                      value={(achievement.currentProgress / achievement.targetProgress) * 100} 
                      className="h-2 w-full"
                    />
                  </div>

                  {/* Action section */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-gray-500">
                      Est. {achievement.estimatedTimeToComplete} days
                    </span>
                    {getTrackingMethodButton(achievement)}
                  </div>

                  {/* Peer verifications display */}
                  {achievement.peerVerifications && achievement.peerVerifications.length > 0 && (
                    <div className="flex items-center gap-1 pt-1">
                      <span className="text-xs text-gray-500">Verified by:</span>
                      {achievement.peerVerifications.map((verification) => (
                        <div key={verification.id} className="text-xs text-green-600">
                          {verification.verifierName}
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Trophy className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No achievements available</p>
                <p className="text-sm">Start playing to unlock achievements!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Peer Verification Request Dialog */}
      <Dialog open={showPeerRequestDialog} onOpenChange={setShowPeerRequestDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg">Request Peer Verification</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedAchievement && (
              <>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-sm">{selectedAchievement.name}</h4>
                  <p className="text-xs text-gray-600 mt-1">
                    {selectedAchievement.description}
                  </p>
                </div>
                
                <div className="text-sm space-y-2">
                  <p>This achievement requires verification from {selectedAchievement.peerVerificationRequired || 2} peers who witnessed your accomplishment.</p>
                  <p className="text-gray-600">A notification will be sent to nearby players and your connections.</p>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowPeerRequestDialog(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => selectedAchievement && handleRequestPeerVerification(selectedAchievement.id)}
                    className="flex-1"
                  >
                    Send Request
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}