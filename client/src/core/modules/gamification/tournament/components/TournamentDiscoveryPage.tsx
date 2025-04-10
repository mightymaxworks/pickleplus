/**
 * PKL-278651-GAME-0003-DISC
 * Tournament Discovery Page
 * 
 * This component serves as the tournament feature preview page
 * with an interactive discovery experience.
 */

import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Gift, 
  Trophy, 
  Star, 
  Crown, 
  Info, 
  Medal, 
  Award, 
  AlertTriangle,
  Loader2,
  Clock,
  CheckCircle2,
  Users,
  Zap,
  Rocket,
  CalendarRange
} from 'lucide-react';
import TournamentBracket from './TournamentBracket';
import { BracketPosition, TournamentReward } from '../types';
import { DiscoveryAlert, ProgressTracker, RewardDisplay } from '../../components';
import { useTournamentDiscovery } from '../context/TournamentDiscoveryContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DiscoveryPoint } from '../api/tournamentDiscoveryApi';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cva } from 'class-variance-authority';
import { getTournamentFeatureDetail } from '../data/tournamentFeatureDetails';
import TournamentFeatureDialog from './TournamentFeatureDialog';
import TournamentRoadmap from './TournamentRoadmap';

// CSS styles for tier badges
const tierBadgeStyles = cva("rounded-full px-2 py-0.5 text-xs font-medium", {
  variants: {
    tier: {
      scout: "bg-blue-100 text-blue-800",
      strategist: "bg-purple-100 text-purple-800",
      pioneer: "bg-amber-100 text-amber-800",
    }
  },
  defaultVariants: {
    tier: "scout",
  },
});

/**
 * Tournament Discovery Page
 * 
 * Interactive page that showcases upcoming tournament features
 * and allows users to discover details through exploration.
 */
const TournamentDiscoveryPage: React.FC = () => {
  // Get tournament discovery context
  const {
    discoveryPoints,
    userProgress,
    isLoading,
    isRecording,
    discoverPoint,
    isDiscovered,
    getCurrentTier,
    getCompletionPercentage,
    hasCompletedTier
  } = useTournamentDiscovery();
  
  // State for discovery alerts, countdown, and feature detail dialog
  const [showAlert, setShowAlert] = useState(false);
  const [currentReward, setCurrentReward] = useState<TournamentReward | null>(null);
  const [currentDiscovery, setCurrentDiscovery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>("bracket");
  const [countdown, setCountdown] = useState<{days: number, hours: number, minutes: number, seconds: number}>({
    days: 0, hours: 0, minutes: 0, seconds: 0
  });
  const [showFeatureDetail, setShowFeatureDetail] = useState(false);
  const [selectedFeatureId, setSelectedFeatureId] = useState<string>('');
  
  // Countdown timer to tournament launch
  useEffect(() => {
    const launchDate = new Date('April 30, 2025 00:00:00').getTime();
    
    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = launchDate - now;
      
      setCountdown({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    };
    
    // Update countdown immediately
    updateCountdown();
    
    // Set interval to update countdown
    const interval = setInterval(updateCountdown, 1000);
    
    // Clean up on unmount
    return () => clearInterval(interval);
  }, []);
  
  // Map API discovery points to bracket positions
  const tournamentPositions = React.useMemo<BracketPosition[]>(() => {
    // Using fixed positions with coordinates for the bracket view
    const positionMap: Record<string, { type: BracketPositionType, coordinates: { x: number, y: number }, difficulty: 'easy' | 'medium' | 'hard' }> = {
      'tournament-bracket': { 
        type: 'single-elimination', 
        coordinates: { x: 0.1, y: 0.3 }, 
        difficulty: 'easy' 
      },
      'tournament-scoring': { 
        type: 'round-robin', 
        coordinates: { x: 0.3, y: 0.7 }, 
        difficulty: 'easy' 
      },
      'tournament-registration': { 
        type: 'consolation', 
        coordinates: { x: 0.5, y: 0.2 }, 
        difficulty: 'medium' 
      },
      'seeding-algorithm': { 
        type: 'seeding', 
        coordinates: { x: 0.7, y: 0.6 }, 
        difficulty: 'medium' 
      },
      'tournament-rewards': { 
        type: 'live-scoring', 
        coordinates: { x: 0.8, y: 0.4 }, 
        difficulty: 'hard' 
      }
    };
    
    return discoveryPoints.map((point, index) => {
      const positionInfo = positionMap[point.id] || {
        type: 'leaderboard',
        coordinates: { x: 0.5, y: 0.8 },
        difficulty: 'hard'
      };
      
      return {
        id: index + 1,
        code: point.id,
        type: positionInfo.type,
        name: point.name,
        description: point.description,
        coordinates: positionInfo.coordinates,
        difficulty: positionInfo.difficulty,
        isDiscovered: isDiscovered(point.id),
        reward: {
          id: index + 101,
          name: `${point.tier.charAt(0).toUpperCase() + point.tier.slice(1)} Discovery`,
          description: `You've discovered ${point.name}!`,
          type: 'xp',
          rarity: point.tier === 'pioneer' ? 'legendary' : (point.tier === 'strategist' ? 'rare' : 'common'),
          value: { xpAmount: point.points, tokenType: undefined }
        }
      };
    });
  }, [discoveryPoints, isDiscovered]);
  
  // Handle bracket position click
  const handlePositionClick = useCallback((position: BracketPosition) => {
    if (position.isDiscovered) {
      // If already discovered, show detailed feature information
      setSelectedFeatureId(position.code);
      setShowFeatureDetail(true);
      return;
    }
    
    // Only mark as discovered without showing alert or awarding XP yet
    // XP will be awarded after reading through the feature dialog
    
    // Record discovery position opened in API, but don't award XP yet
    setSelectedFeatureId(position.code);
    
    // Safely set current reward if it exists
    if (position.reward) {
      setCurrentReward(position.reward);
    }
    
    setCurrentDiscovery(position.description);
    
    // Show feature dialog immediately - XP will be awarded after reading
    setShowFeatureDetail(true);
  }, []);
  
  // Calculate progress percentages for each tier
  const tierProgress = React.useMemo(() => {
    if (!userProgress) {
      return {
        scout: 0,
        strategist: 0,
        pioneer: 0
      };
    }
    
    const tierPoints = {
      scout: discoveryPoints.filter(p => p.tier === 'scout'),
      strategist: discoveryPoints.filter(p => p.tier === 'strategist'),
      pioneer: discoveryPoints.filter(p => p.tier === 'pioneer')
    };
    
    const discoveredByTier = {
      scout: userProgress.discoveredDetails.filter(p => p.tier === 'scout'),
      strategist: userProgress.discoveredDetails.filter(p => p.tier === 'strategist'),
      pioneer: userProgress.discoveredDetails.filter(p => p.tier === 'pioneer')
    };
    
    return {
      scout: tierPoints.scout.length === 0 ? 0 : Math.round((discoveredByTier.scout.length / tierPoints.scout.length) * 100),
      strategist: tierPoints.strategist.length === 0 ? 0 : Math.round((discoveredByTier.strategist.length / tierPoints.strategist.length) * 100),
      pioneer: tierPoints.pioneer.length === 0 ? 0 : Math.round((discoveredByTier.pioneer.length / tierPoints.pioneer.length) * 100)
    };
  }, [userProgress, discoveryPoints]);
  
  // Get grouped points by tier
  const pointsByTier = React.useMemo(() => {
    return {
      scout: discoveryPoints.filter(p => p.tier === 'scout'),
      strategist: discoveryPoints.filter(p => p.tier === 'strategist'), 
      pioneer: discoveryPoints.filter(p => p.tier === 'pioneer')
    };
  }, [discoveryPoints]);
  
  // Render discovery card for list view
  const renderDiscoveryCard = (point: DiscoveryPoint) => {
    const discovered = isDiscovered(point.id);
    
    return (
      <motion.div
        key={point.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`p-4 rounded-lg border ${discovered ? 'bg-white' : 'bg-gray-50'} 
          ${discovered ? 'border-green-200' : 'border-gray-200'}
          transition-all duration-200 hover:shadow-md`}
      >
        <div className="flex justify-between items-start mb-2">
          <h3 className={`font-medium ${discovered ? 'text-gray-900' : 'text-gray-500'}`}>
            {point.name}
          </h3>
          <Badge className={tierBadgeStyles({ tier: point.tier as any })}>
            {point.tier}
          </Badge>
        </div>
        
        <p className={`text-sm mb-3 ${discovered ? 'text-gray-600' : 'text-gray-400'}`}>
          {discovered ? point.description : "Discover this feature to reveal details"}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm">
            <Trophy size={14} className={`mr-1 ${discovered ? 'text-amber-500' : 'text-gray-400'}`} />
            <span className={discovered ? 'text-amber-700' : 'text-gray-400'}>
              {point.points} XP
            </span>
          </div>
          
          <Button 
            size="sm" 
            variant={discovered ? "outline" : "default"}
            disabled={isRecording}
            onClick={() => {
              // Always show the feature details first, regardless of discovery status
              setSelectedFeatureId(point.id);
              
              if (!discovered) {
                // Prepare reward data but don't show it yet - ensure proper typing
                const pointIdNumber = typeof point.id === 'string' ? parseInt(point.id, 10) : point.id;
                setCurrentReward({
                  id: pointIdNumber,
                  name: `${point.tier.charAt(0).toUpperCase() + point.tier.slice(1)} Discovery`,
                  description: `You've discovered ${point.name}!`,
                  type: 'xp',
                  rarity: point.tier === 'pioneer' ? 'legendary' : (point.tier === 'strategist' ? 'rare' : 'common'),
                  value: { xpAmount: point.points }
                });
              }
              
              setShowFeatureDetail(true);
            }}
          >
            {isRecording ? (
              <>
                <Loader2 size={14} className="mr-1 animate-spin" />
                Processing
              </>
            ) : discovered ? (
              "View details"
            ) : (
              "Discover"
            )}
          </Button>
        </div>
      </motion.div>
    );
  };
  
  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      {/* Page header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Tournament System Preview
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-4">
            Explore our upcoming tournament system! Discover all features to qualify for 
            exclusive early access through our prize drawing.
          </p>
          
          {/* Countdown to launch */}
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-4 border border-orange-100 max-w-lg mx-auto">
            <div className="flex items-center justify-center mb-2">
              <Clock className="text-orange-500 mr-2" size={20} />
              <h3 className="font-medium text-orange-800">Tournament Launch Countdown</h3>
            </div>
            <div className="grid grid-cols-4 gap-2 mb-2">
              <div className="bg-white rounded p-2 text-center shadow-sm">
                <div className="text-2xl font-bold text-orange-600">{countdown.days}</div>
                <div className="text-xs text-gray-500">Days</div>
              </div>
              <div className="bg-white rounded p-2 text-center shadow-sm">
                <div className="text-2xl font-bold text-orange-600">{countdown.hours}</div>
                <div className="text-xs text-gray-500">Hours</div>
              </div>
              <div className="bg-white rounded p-2 text-center shadow-sm">
                <div className="text-2xl font-bold text-orange-600">{countdown.minutes}</div>
                <div className="text-xs text-gray-500">Minutes</div>
              </div>
              <div className="bg-white rounded p-2 text-center shadow-sm">
                <div className="text-2xl font-bold text-orange-600">{countdown.seconds}</div>
                <div className="text-xs text-gray-500">Seconds</div>
              </div>
            </div>
            <p className="text-sm text-center text-gray-600">
              Complete all discoveries to gain <span className="font-medium text-orange-700">Priority Access</span>
            </p>
          </div>
        </motion.div>
      </div>
      
      {/* Main content area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left sidebar - Progress and stats */}
        <div className="lg:col-span-1 space-y-6">
          {isLoading ? (
            <div className="py-8 flex justify-center items-center">
              <Loader2 className="animate-spin text-primary h-8 w-8" />
            </div>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <h2 className="text-xl font-semibold mb-3 flex items-center">
                  <Trophy className="mr-2 text-yellow-500" size={20} />
                  Discovery Progress
                </h2>
                
                <ProgressTracker
                  campaign={{
                    id: 1001,
                    name: "Tournament Explorer",
                    description: "Discover all the upcoming tournament features",
                    isActive: true,
                    totalDiscoveries: discoveryPoints.length,
                    discoveredCount: userProgress?.discoveries.length || 0,
                    completionPercentage: getCompletionPercentage(),
                    isComplete: userProgress?.isComplete || false
                  }}
                />
              </motion.div>
              
              {/* Tier progression */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="bg-white rounded-lg p-4 border border-gray-200"
              >
                <h3 className="font-semibold text-lg mb-3 flex items-center">
                  <Medal className="mr-2 text-blue-500" size={18} />
                  Discovery Tiers
                </h3>
                
                <div className="space-y-4">
                  {/* Scout tier */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center">
                        <Badge variant="outline" className={tierBadgeStyles({ tier: "scout" })}>
                          Scout
                        </Badge>
                      </div>
                      <span className="text-xs text-gray-500">{tierProgress.scout}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${tierProgress.scout}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Discover basic tournament features
                    </p>
                  </div>
                  
                  {/* Strategist tier */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center">
                        <Badge variant="outline" className={tierBadgeStyles({ tier: "strategist" })}>
                          Strategist
                        </Badge>
                      </div>
                      <span className="text-xs text-gray-500">{tierProgress.strategist}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${tierProgress.strategist}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Explore intermediate tournament concepts
                    </p>
                  </div>
                  
                  {/* Pioneer tier */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center">
                        <Badge variant="outline" className={tierBadgeStyles({ tier: "pioneer" })}>
                          Pioneer
                        </Badge>
                      </div>
                      <span className="text-xs text-gray-500">{tierProgress.pioneer}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-amber-500 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${tierProgress.pioneer}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Master advanced tournament features
                    </p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="bg-white rounded-lg p-4 border border-gray-200"
              >
                <h3 className="font-semibold text-lg mb-2 flex items-center">
                  <Calendar className="mr-2 text-blue-500" size={18} />
                  Tournament Preview
                </h3>
                <div className="text-sm text-gray-600 space-y-3">
                  <p>
                    <span className="font-medium">Launch Date:</span>{" "}
                    <span className="text-orange-600">April 15, 2025</span>
                  </p>
                  <p>
                    <span className="font-medium">Current Tier:</span>{" "}
                    <Badge className={tierBadgeStyles({ tier: getCurrentTier() as any })}>
                      {getCurrentTier() === 'none' ? 'Not Started' : getCurrentTier()}
                    </Badge>
                  </p>
                  <p>
                    <span className="font-medium">Prize Drawing:</span>{" "}
                    {userProgress?.isComplete 
                      ? <span className="text-green-600">Entered</span> 
                      : "Complete all discoveries to enter"}
                  </p>
                </div>
              </motion.div>
              
              {userProgress?.isComplete && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-200"
                >
                  <div className="flex items-center">
                    <Crown className="text-yellow-500 mr-2" size={20} />
                    <h3 className="font-semibold text-lg">All Features Discovered!</h3>
                  </div>
                  <p className="text-sm text-gray-700 mt-2">
                    Congratulations! You've been entered into our exclusive Early Access Prize Drawing!
                  </p>
                  <div className="mt-3 p-2 bg-white bg-opacity-60 rounded text-sm text-gray-600 border border-purple-100">
                    <div className="flex items-center">
                      <Star className="text-purple-500 mr-1 flex-shrink-0" size={16} />
                      <span>Your entry has been recorded</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </div>
        
        {/* Main area - Tournament bracket and discovery list */}
        <div className="lg:col-span-2">
          {isLoading ? (
            <div className="py-20 flex justify-center items-center">
              <Loader2 className="animate-spin text-primary h-12 w-12" />
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Tournament Features</h2>
                <TabsList>
                  <TabsTrigger value="bracket">Bracket View</TabsTrigger>
                  <TabsTrigger value="list">List View</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="bracket" className="mt-0">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white rounded-lg p-4 border border-gray-200"
                >
                  <div className="flex items-center mb-4">
                    <p className="text-sm text-gray-500 flex items-center">
                      <Info size={14} className="mr-1" /> 
                      Click on highlighted areas to discover features
                    </p>
                  </div>
                  
                  <TournamentBracket
                    discoveredPositions={tournamentPositions}
                    onPositionClick={handlePositionClick}
                    animateUndiscovered={true}
                    className="mb-4"
                  />
                  
                  {currentDiscovery && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md"
                    >
                      <h3 className="font-medium text-gray-900">Feature Details</h3>
                      <p className="text-sm text-gray-600 mt-1">{currentDiscovery}</p>
                    </motion.div>
                  )}
                </motion.div>
              </TabsContent>
              
              <TabsContent value="list" className="mt-0">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white rounded-lg p-4 border border-gray-200"
                >
                  <h3 className="font-medium text-gray-900 mb-4">Discover By Tier</h3>
                  
                  {/* Scout Tier */}
                  <div className="mb-6">
                    <div className="flex items-center mb-3">
                      <Badge className={tierBadgeStyles({ tier: "scout" })}>Scout</Badge>
                      <div className="h-px flex-1 bg-blue-100 mx-3"></div>
                      <span className="text-xs text-gray-500">{tierProgress.scout}% complete</span>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                      {pointsByTier.scout.map(renderDiscoveryCard)}
                      
                      {pointsByTier.scout.length === 0 && (
                        <div className="text-center py-4 text-gray-500">
                          <AlertTriangle size={24} className="mx-auto mb-2" />
                          <p>No scout-tier features available</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Strategist Tier */}
                  <div className="mb-6">
                    <div className="flex items-center mb-3">
                      <Badge className={tierBadgeStyles({ tier: "strategist" })}>Strategist</Badge>
                      <div className="h-px flex-1 bg-purple-100 mx-3"></div>
                      <span className="text-xs text-gray-500">{tierProgress.strategist}% complete</span>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                      {pointsByTier.strategist.map(renderDiscoveryCard)}
                      
                      {pointsByTier.strategist.length === 0 && (
                        <div className="text-center py-4 text-gray-500">
                          <AlertTriangle size={24} className="mx-auto mb-2" />
                          <p>No strategist-tier features available</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Pioneer Tier */}
                  <div>
                    <div className="flex items-center mb-3">
                      <Badge className={tierBadgeStyles({ tier: "pioneer" })}>Pioneer</Badge>
                      <div className="h-px flex-1 bg-amber-100 mx-3"></div>
                      <span className="text-xs text-gray-500">{tierProgress.pioneer}% complete</span>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                      {pointsByTier.pioneer.map(renderDiscoveryCard)}
                      
                      {pointsByTier.pioneer.length === 0 && (
                        <div className="text-center py-4 text-gray-500">
                          <AlertTriangle size={24} className="mx-auto mb-2" />
                          <p>No pioneer-tier features available</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
      
      {/* Discovery alerts */}
      {showAlert && currentReward && (
        <DiscoveryAlert
          title={`Tournament Feature Discovered!`}
          message={currentDiscovery}
          level="success"
          open={showAlert}
          autoHide={true}
          hideDelay={5000}
          reward={{
            id: currentReward.id,
            name: currentReward.name,
            description: currentReward.description,
            type: currentReward.type === 'token' ? 'badge' : currentReward.type, // Convert 'token' to 'badge'
            rarity: currentReward.rarity,
            value: {
              xpAmount: currentReward.value.xpAmount,
              badgeId: currentReward.value.badgeId || currentReward.value.tokenType,
              itemId: undefined,
              currencyAmount: undefined
            }
          }}
          onClose={() => setShowAlert(false)}
        />
      )}
      
      {/* Tournament Roadmap section */}
      <div className="mt-12 py-8 border-t border-gray-200">
        <h2 className="text-2xl font-bold text-center mb-6">Tournament Feature Roadmap</h2>
        <TournamentRoadmap className="max-w-3xl mx-auto" />
      </div>
      
      {/* Feature detail dialog with engagement-based XP rewards */}
      <TournamentFeatureDialog
        feature={selectedFeatureId ? getTournamentFeatureDetail(selectedFeatureId) : null}
        isOpen={showFeatureDetail}
        onOpenChange={(open) => {
          setShowFeatureDetail(open);
          if (!open) {
            setSelectedFeatureId('');
          }
        }}
        isDiscovered={selectedFeatureId ? isDiscovered(selectedFeatureId) : false}
        onClaimReward={(featureId) => {
          // Only record discovery after user has engaged with content
          discoverPoint(featureId);
          
          // Show reward alert
          if (currentReward) {
            setShowAlert(true);
          }
        }}
        xpAmount={currentReward?.value?.xpAmount || 50}
      />
    </div>
  );
};

// Define BracketPositionType here to avoid TypeScript errors
type BracketPositionType = 
  | 'single-elimination'
  | 'round-robin'
  | 'consolation'
  | 'seeding'
  | 'live-scoring'
  | 'leaderboard';

export default TournamentDiscoveryPage;