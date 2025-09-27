import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  Target, 
  Trophy, 
  Heart, 
  Star,
  Users,
  Sparkles,
  Crown,
  Medal,
  Award,
  Shield,
  Sword,
  Timer,
  TrendingUp,
  Eye,
  HandHeart,
  Flame,
  CheckCircle,
  ArrowUp,
  Gift,
  Map,
  Camera,
  MessageCircle,
  Gamepad2,
  Activity
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

// Mock data for demonstrations
type DifficultyType = 'common' | 'rare' | 'legendary';

interface MockPlayer {
  id: number;
  name: string;
  points: number;
  tier: string;
  avatar: string;
  difficulty: DifficultyType;
  winStreak: number;
}

const mockPlayers: MockPlayer[] = [
  { id: 1, name: 'Alex Chen', points: 1247, tier: 'elite', avatar: 'AC', difficulty: 'legendary', winStreak: 5 },
  { id: 2, name: 'Maria Santos', points: 892, tier: 'competitive', avatar: 'MS', difficulty: 'rare', winStreak: 2 },
  { id: 3, name: 'Jordan Kim', points: 1455, tier: 'elite', avatar: 'JK', difficulty: 'legendary', winStreak: 8 },
  { id: 4, name: 'Sam Wilson', points: 634, tier: 'recreational', avatar: 'SW', difficulty: 'common', winStreak: 0 }
];

const difficultyConfig: Record<DifficultyType, { color: string; textColor: string; label: string }> = {
  common: { color: 'bg-slate-500', textColor: 'text-slate-300', label: 'Common Opponent' },
  rare: { color: 'bg-blue-500', textColor: 'text-blue-300', label: 'Rare Challenger' },
  legendary: { color: 'bg-purple-500', textColor: 'text-purple-300', label: 'Legendary Rival' }
};

// Micro-feedback kit components
interface ReactionFloatProps {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
  color?: string;
  show: boolean;
  onComplete?: () => void;
}

function ReactionFloat({ icon: IconComponent, text, color = 'text-green-400', show, onComplete }: ReactionFloatProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1, y: 0, scale: 0.8 }}
          animate={{ opacity: 1, y: -40, scale: 1 }}
          exit={{ opacity: 0, y: -60, scale: 1.2 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          onAnimationComplete={onComplete}
          className="absolute z-10 flex items-center gap-2 bg-slate-800/90 border border-slate-600 rounded-lg px-3 py-1 pointer-events-none"
        >
          <IconComponent className={`h-4 w-4 ${color}`} />
          <span className={`text-sm font-medium ${color}`}>{text}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface PressRippleProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

function PressRipple({ children, onClick, className = "" }: PressRippleProps) {
  const [isPressed, setIsPressed] = useState(false);

  const handleClick = () => {
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 150);
    onClick?.();
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      animate={{ scale: isPressed ? [1, 1.05, 1] : 1 }}
      transition={{ duration: 0.15 }}
      onClick={handleClick}
      className={`cursor-pointer ${className}`}
    >
      {children}
    </motion.div>
  );
}

interface ShimmerStatProps {
  children: React.ReactNode;
  shimmer: boolean;
  color?: string;
}

function ShimmerStat({ children, shimmer, color = 'border-orange-400' }: ShimmerStatProps) {
  return (
    <motion.div
      animate={shimmer ? {
        borderColor: ['transparent', color.replace('border-', ''), 'transparent'],
        boxShadow: shimmer ? [
          '0 0 0 0 transparent',
          `0 0 0 2px ${color.replace('border-', '').replace('-400', '').replace('-', '')}40`,
          '0 0 0 0 transparent'
        ] : 'none'
      } : {}}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className={`border-2 border-transparent rounded transition-all ${shimmer ? color : ''}`}
    >
      {children}
    </motion.div>
  );
}

export default function GamificationPrototype() {
  const [activeDemo, setActiveDemo] = useState<string>('immediate-feedback');
  const [points, setPoints] = useState(1247);
  const [showPointsAnimation, setShowPointsAnimation] = useState(false);
  const [applauseCount, setApplauseCount] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [challengeTarget, setChallengeTarget] = useState<any>(null);
  const [showRivalModal, setShowRivalModal] = useState(false);
  
  // Micro-feedback states
  const [showChallengeReaction, setShowChallengeReaction] = useState(false);
  const [showScoutingReaction, setShowScoutingReaction] = useState(false);
  const [showBadgeReaction, setShowBadgeReaction] = useState(false);
  const [shimmerPoints, setShimmerPoints] = useState(false);

  // Immediate Feedback Demo
  const triggerPointsGain = (amount: number) => {
    setPoints(prev => prev + amount);
    setShowPointsAnimation(true);
    setShimmerPoints(true);
    setTimeout(() => {
      setShowPointsAnimation(false);
      setShimmerPoints(false);
    }, 1500);
  };
  
  // Challenge reaction
  const triggerChallenge = () => {
    setShowChallengeReaction(true);
    setTimeout(() => setShowChallengeReaction(false), 1500);
  };
  
  // Scouting reaction
  const triggerScouting = () => {
    setShowScoutingReaction(true);
    setTimeout(() => setShowScoutingReaction(false), 1500);
  };
  
  // Badge unlock reaction
  const triggerBadgeUnlock = () => {
    setShowBadgeReaction(true);
    setTimeout(() => setShowBadgeReaction(false), 1500);
  };

  // Social Recognition Demo
  const triggerApplause = () => {
    setApplauseCount(prev => prev + 1);
    // Reset after animation
    setTimeout(() => setApplauseCount(prev => Math.max(0, prev - 1)), 2000);
  };

  // Progression Demo
  const triggerBreakthrough = () => {
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 3000);
  };

  const demos = [
    { id: 'immediate-feedback', label: 'Immediate Feedback', icon: Zap },
    { id: 'social-competition', label: 'Social Competition', icon: Sword },
    { id: 'discovery-collection', label: 'Discovery & Collection', icon: Sparkles },
    { id: 'social-recognition', label: 'Social Recognition', icon: Heart },
    { id: 'progression-story', label: 'Progression Story', icon: Crown }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <Gamepad2 className="h-10 w-10 text-orange-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-purple-600 bg-clip-text text-transparent">
              Pickle+ Gamification Prototype
            </h1>
          </div>
          <p className="text-slate-400 text-lg">
            Experience how every player interaction becomes a game
          </p>
        </motion.div>

        {/* Demo Navigation */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {demos.map((demo) => {
            const IconComponent = demo.icon;
            return (
              <Button
                key={demo.id}
                onClick={() => setActiveDemo(demo.id)}
                variant={activeDemo === demo.id ? "default" : "outline"}
                className={`flex items-center gap-2 ${
                  activeDemo === demo.id 
                    ? 'bg-gradient-to-r from-orange-500 to-purple-600 text-white' 
                    : 'border-slate-600 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <IconComponent className="h-4 w-4" />
                {demo.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Demo Content */}
      <div className="max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {activeDemo === 'immediate-feedback' && (
            <ImmediateFeedbackDemo 
              points={points}
              showPointsAnimation={showPointsAnimation}
              triggerPointsGain={triggerPointsGain}
              shimmerPoints={shimmerPoints}
              showChallengeReaction={showChallengeReaction}
              triggerChallenge={triggerChallenge}
              showScoutingReaction={showScoutingReaction}
              triggerScouting={triggerScouting}
            />
          )}
          {activeDemo === 'social-competition' && (
            <SocialCompetitionDemo 
              players={mockPlayers}
              challengeTarget={challengeTarget}
              setChallengeTarget={setChallengeTarget}
            />
          )}
          {activeDemo === 'discovery-collection' && (
            <DiscoveryCollectionDemo 
              players={mockPlayers} 
              showBadgeReaction={showBadgeReaction}
              triggerBadgeUnlock={triggerBadgeUnlock}
            />
          )}
          {activeDemo === 'social-recognition' && (
            <SocialRecognitionDemo 
              applauseCount={applauseCount}
              triggerApplause={triggerApplause}
            />
          )}
          {activeDemo === 'progression-story' && (
            <ProgressionStoryDemo 
              showCelebration={showCelebration}
              triggerBreakthrough={triggerBreakthrough}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Immediate Feedback Demo Component
function ImmediateFeedbackDemo({ 
  points, 
  showPointsAnimation, 
  triggerPointsGain, 
  shimmerPoints,
  showChallengeReaction,
  triggerChallenge,
  showScoutingReaction,
  triggerScouting
}: any) {
  return (
    <motion.div
      key="immediate-feedback"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Zap className="h-6 w-6 text-yellow-400" />
          <h2 className="text-2xl font-bold">Immediate Feedback Loops</h2>
        </div>
        <p className="text-slate-400">Every action triggers instant, satisfying responses</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Points Animation Demo */}
        <Card className="p-6 bg-slate-800 border-slate-700 relative overflow-hidden">
          <div className="text-center">
            <div className="relative mb-4">
              <ShimmerStat shimmer={shimmerPoints} color="border-orange-400">
                <div className="text-3xl font-bold text-orange-400 p-2">{points}</div>
              </ShimmerStat>
              <div className="text-sm text-slate-400">Ranking Points</div>
              
              <ReactionFloat
                icon={Trophy}
                text="+15 Points"
                color="text-green-400"
                show={showPointsAnimation}
                onComplete={() => setShowPointsAnimation(false)}
              />
            </div>
            
            <PressRipple onClick={() => triggerPointsGain(15)}>
              <Button className="bg-green-600 hover:bg-green-700 w-full">
                <Trophy className="h-4 w-4 mr-2" />
                Win Match
              </Button>
            </PressRipple>
          </div>
        </Card>

        {/* Challenge Feedback */}
        <Card className="p-6 bg-slate-800 border-slate-700 relative">
          <div className="text-center">
            <div className="mb-4">
              <Sword className="h-12 w-12 text-purple-400 mx-auto mb-2" />
              <div className="text-lg font-semibold">Challenge Sent!</div>
              <div className="text-sm text-slate-400">Maria Santos notified</div>
            </div>
            
            <PressRipple onClick={triggerChallenge}>
              <Button 
                variant="outline" 
                className="border-purple-500 text-purple-300 hover:bg-purple-500/20 w-full"
              >
                <Target className="h-4 w-4 mr-2" />
                Send Challenge
              </Button>
            </PressRipple>
            
            <ReactionFloat
              icon={Sword}
              text="Challenge Sent!"
              color="text-purple-400"
              show={showChallengeReaction}
              onComplete={() => setShowChallengeReaction(false)}
            />
          </div>
        </Card>

        {/* Profile Scouting */}
        <Card className="p-6 bg-slate-800 border-slate-700 relative">
          <div className="text-center">
            <div className="mb-4">
              <Eye className="h-12 w-12 text-blue-400 mx-auto mb-2" />
              <div className="text-lg font-semibold">Scouting Bonus</div>
              <div className="text-sm text-slate-400">+2 XP for intel gathering</div>
            </div>
            
            <PressRipple onClick={triggerScouting}>
              <Button 
                variant="outline" 
                className="border-blue-500 text-blue-300 hover:bg-blue-500/20 w-full"
              >
                <Users className="h-4 w-4 mr-2" />
                View Profile
              </Button>
            </PressRipple>
            
            <ReactionFloat
              icon={Eye}
              text="+2 XP"
              color="text-blue-400"
              show={showScoutingReaction}
              onComplete={() => setShowScoutingReaction(false)}
            />
          </div>
        </Card>
      </div>

      <Card className="p-6 bg-gradient-to-r from-slate-800 to-slate-700 border-slate-600">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <Gamepad2 className="h-5 w-5 mr-2 text-orange-400" />
          Try These Interactions
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-sm font-medium text-slate-300">Match Actions</div>
            <div className="text-xs text-slate-400">• Win Match → Animated points flow</div>
            <div className="text-xs text-slate-400">• Perfect Game → Bonus sparkles</div>
            <div className="text-xs text-slate-400">• Comeback Victory → Epic celebration</div>
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium text-slate-300">Social Actions</div>
            <div className="text-xs text-slate-400">• Challenge Sent → Satisfying whoosh</div>
            <div className="text-xs text-slate-400">• Profile View → XP gain notification</div>
            <div className="text-xs text-slate-400">• Friend Added → Connection pulse</div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

// Social Competition Demo Component
function SocialCompetitionDemo({ players, challengeTarget, setChallengeTarget }: { players: MockPlayer[]; challengeTarget: any; setChallengeTarget: any }) {
  const [selectedPlayer, setSelectedPlayer] = useState(players[0]);
  const [showComparison, setShowComparison] = useState(false);

  return (
    <motion.div
      key="social-competition"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sword className="h-6 w-6 text-red-400" />
          <h2 className="text-2xl font-bold">Social Competition Mechanics</h2>
        </div>
        <p className="text-slate-400">Turn every interaction into friendly competition</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Player Selection */}
        <Card className="p-6 bg-slate-800 border-slate-700">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Target className="h-5 w-5 mr-2 text-orange-400" />
            Select Your Target
          </h3>
          
          <div className="space-y-3">
            {players.map((player: MockPlayer) => {
              const config = difficultyConfig[player.difficulty];
              return (
                <motion.div
                  key={player.id}
                  onClick={() => setSelectedPlayer(player)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedPlayer.id === player.id 
                      ? 'border-orange-500 bg-orange-500/10' 
                      : 'border-slate-600 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-400 to-purple-600 flex items-center justify-center font-bold">
                        {player.avatar}
                      </div>
                      <div>
                        <div className="font-semibold">{player.name}</div>
                        <div className="text-sm text-slate-400">{player.points} pts</div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <Badge className={`${config.color} ${config.textColor} mb-1`}>
                        {config.label}
                      </Badge>
                      {player.winStreak > 0 && (
                        <div className="text-xs text-orange-400 flex items-center">
                          <Flame className="h-3 w-3 mr-1" />
                          {player.winStreak} streak
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Card>

        {/* Head-to-Head Comparison */}
        <Card className="p-6 bg-slate-800 border-slate-700">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Activity className="h-5 w-5 mr-2 text-purple-400" />
            Head-to-Head Analysis
          </h3>
          
          {selectedPlayer && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {/* Risk/Reward Preview */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 rounded-lg bg-green-500/20 border border-green-500/30">
                  <div className="text-lg font-bold text-green-400">+25</div>
                  <div className="text-xs text-green-300">Points if you win</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-red-500/20 border border-red-500/30">
                  <div className="text-lg font-bold text-red-400">-8</div>
                  <div className="text-xs text-red-300">Points if you lose</div>
                </div>
              </div>

              {/* Win Probability */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Win Probability</span>
                  <span className="text-orange-400">67%</span>
                </div>
                <Progress value={67} className="h-2" />
              </div>

              {/* Previous Matches */}
              <div className="space-y-2">
                <div className="text-sm font-medium">Recent History</div>
                <div className="flex gap-1">
                  {['W', 'L', 'W', 'W'].map((result, i) => (
                    <div
                      key={i}
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        result === 'W' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                      }`}
                    >
                      {result}
                    </div>
                  ))}
                </div>
              </div>

              <Button 
                onClick={() => setChallengeTarget(selectedPlayer)}
                className="w-full bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700"
              >
                <Sword className="h-4 w-4 mr-2" />
                Challenge {selectedPlayer.name}
              </Button>
            </motion.div>
          )}
        </Card>
      </div>
    </motion.div>
  );
}

// Discovery & Collection Demo Component
function DiscoveryCollectionDemo({ players, showBadgeReaction, triggerBadgeUnlock }: { players: MockPlayer[]; showBadgeReaction: boolean; triggerBadgeUnlock: () => void }) {
  return (
    <motion.div
      key="discovery-collection"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="h-6 w-6 text-purple-400" />
          <h2 className="text-2xl font-bold">Discovery & Collection</h2>
        </div>
        <p className="text-slate-400">Make finding opponents feel like collecting rare items</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {players.map((player: MockPlayer) => {
          const config = difficultyConfig[player.difficulty];
          return (
            <motion.div
              key={player.id}
              whileHover={{ y: -5, rotateY: 5 }}
              className="relative"
            >
              <Card className={`p-6 bg-gradient-to-br from-slate-800 to-slate-700 border-2 ${
                player.difficulty === 'legendary' ? 'border-purple-500' :
                player.difficulty === 'rare' ? 'border-blue-500' : 'border-slate-600'
              } relative overflow-hidden`}>
                
                {/* Rarity Glow Effect */}
                <div className={`absolute inset-0 opacity-20 ${
                  player.difficulty === 'legendary' ? 'bg-purple-500' :
                  player.difficulty === 'rare' ? 'bg-blue-500' : 'bg-slate-500'
                }`} />

                <div className="relative z-10">
                  {/* Player Card */}
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-orange-400 to-purple-600 flex items-center justify-center font-bold text-xl mx-auto mb-3">
                      {player.avatar}
                    </div>
                    <div className="font-bold text-lg">{player.name}</div>
                    <div className="text-sm text-slate-400">{player.points} points</div>
                  </div>

                  {/* Rarity Badge */}
                  <div className="flex justify-center mb-4">
                    <Badge className={`${config.color} ${config.textColor} text-xs px-3 py-1`}>
                      {config.label}
                    </Badge>
                  </div>

                  {/* Collection Status */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Matches Played</span>
                      <span className="text-orange-400">3/10</span>
                    </div>
                    <Progress value={30} className="h-1" />
                    
                    <div className="text-center relative">
                      <PressRipple onClick={triggerBadgeUnlock}>
                        <Button
                          size="sm"
                          variant="outline"
                          className={`border-orange-500 text-orange-300 hover:bg-orange-500/20 text-xs`}
                        >
                          <Gift className="h-3 w-3 mr-1" />
                          Unlock Badge
                        </Button>
                      </PressRipple>
                      
                      <ReactionFloat
                        icon={Award}
                        text="Badge Unlocked!"
                        color="text-yellow-400"
                        show={showBadgeReaction}
                        onComplete={() => setShowBadgeReaction(false)}
                      />
                    </div>
                  </div>
                </div>

                {/* Sparkle Effects for Legendary */}
                {player.difficulty === 'legendary' && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute top-2 right-2"
                  >
                    <Sparkles className="h-4 w-4 text-purple-400" />
                  </motion.div>
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Regional Conquest Map */}
      <Card className="p-6 bg-slate-800 border-slate-700">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Map className="h-5 w-5 mr-2 text-green-400" />
          Regional Conquest Progress
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['Downtown', 'Westside', 'Northshore', 'Suburbs'].map((area, i) => (
            <motion.div 
              key={area} 
              className="text-center cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                // Add conquest animation here
              }}
            >
              <div className={`w-16 h-16 rounded-lg mx-auto mb-2 flex items-center justify-center transition-all ${
                i <= 1 ? 'bg-green-500/20 border-2 border-green-500' : 'bg-slate-700 border-2 border-slate-600 hover:border-slate-500'
              }`}>
                {i <= 1 ? (
                  <CheckCircle className="h-8 w-8 text-green-400" />
                ) : (
                  <div className="text-slate-500 text-xs">0/5</div>
                )}
              </div>
              <div className="text-sm font-medium">{area}</div>
              <div className="text-xs text-slate-400">
                {i <= 1 ? 'Conquered' : 'Locked'}
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}

// Social Recognition Demo Component
function SocialRecognitionDemo({ applauseCount, triggerApplause }: any) {
  return (
    <motion.div
      key="social-recognition"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Heart className="h-6 w-6 text-pink-400" />
          <h2 className="text-2xl font-bold">Real-Time Social Recognition</h2>
        </div>
        <p className="text-slate-400">Instant gratification for social interactions</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Applause Meter Demo */}
        <Card className="p-6 bg-slate-800 border-slate-700 relative overflow-hidden">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <HandHeart className="h-5 w-5 mr-2 text-pink-400" />
            Applause Meter
          </h3>
          
          <div className="text-center space-y-4">
            <motion.div
              animate={{ scale: applauseCount > 0 ? [1, 1.2, 1] : 1 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-center w-24 h-24 rounded-full bg-pink-500/20 border-2 border-pink-500"
            >
              <HandHeart className="h-12 w-12 text-pink-400" />
            </motion.div>
            
            <div className="text-2xl font-bold text-pink-400">
              {applauseCount} Cheers
            </div>
            
            <Button
              onClick={triggerApplause}
              className="bg-pink-600 hover:bg-pink-700"
            >
              <Heart className="h-4 w-4 mr-2" />
              Give Applause
            </Button>
          </div>

          {/* Floating Hearts Animation */}
          <AnimatePresence>
            {Array.from({ length: applauseCount }).map((_, i) => (
              <motion.div
                key={`heart-${i}-${Date.now()}`}
                initial={{ opacity: 1, y: 0, x: Math.random() * 200 - 100 }}
                animate={{ opacity: 0, y: -100, x: Math.random() * 200 - 100 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2, delay: i * 0.1 }}
                className="absolute bottom-20 left-1/2 pointer-events-none"
              >
                <Heart className="h-6 w-6 text-pink-400 fill-current" />
              </motion.div>
            ))}
          </AnimatePresence>
        </Card>

        {/* Live Reactions */}
        <Card className="p-6 bg-slate-800 border-slate-700">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <MessageCircle className="h-5 w-5 mr-2 text-blue-400" />
            Live Match Reactions
          </h3>
          
          <div className="space-y-3">
            {[
              { icon: Flame, message: 'Amazing shot!', color: 'text-orange-400' },
              { icon: Shield, message: 'What a comeback!', color: 'text-blue-400' },
              { icon: Zap, message: 'Lightning fast!', color: 'text-yellow-400' }
            ].map((reaction, i) => {
              const IconComponent = reaction.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.5 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/50 border border-slate-600"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-400 to-purple-600 flex items-center justify-center text-xs font-bold">
                    {['AC', 'MS', 'JK'][i]}
                  </div>
                  <div className="flex items-center gap-2">
                    <IconComponent className={`h-4 w-4 ${reaction.color}`} />
                    <div className="text-sm">{reaction.message}</div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-4 text-center">
            <PressRipple onClick={() => setApplauseCount(prev => prev + 1)}>
              <Button variant="outline" className="border-blue-500 text-blue-300 hover:bg-blue-500/20">
                <Camera className="h-4 w-4 mr-2" />
                Add Reaction
              </Button>
            </PressRipple>
          </div>
        </Card>
      </div>

      {/* Respect Points System */}
      <Card className="p-6 bg-gradient-to-r from-slate-800 to-slate-700 border-slate-600">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Star className="h-5 w-5 mr-2 text-yellow-400" />
          Respect Points System
        </h3>
        
        <div className="grid md:grid-cols-3 gap-4">
          <div className="text-center p-4 rounded-lg bg-slate-700/50">
            <div className="text-2xl font-bold text-green-400">847</div>
            <div className="text-sm text-slate-400">Sportsmanship</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-slate-700/50">
            <div className="text-2xl font-bold text-blue-400">1,234</div>
            <div className="text-sm text-slate-400">Skill Recognition</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-slate-700/50">
            <div className="text-2xl font-bold text-purple-400">567</div>
            <div className="text-sm text-slate-400">Leadership</div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

// Progression Story Demo Component
function ProgressionStoryDemo({ showCelebration, triggerBreakthrough }: any) {
  const [selectedRival, setSelectedRival] = useState('alex-chen');
  
  const rivals = {
    'alex-chen': {
      name: 'Alex Chen',
      relationship: 'Friendly Rival',
      record: '3-2',
      story: 'Your biggest challenge in the Elite tier',
      nextMilestone: 'Win 3 in a row for rivalry breakthrough'
    }
  };

  return (
    <motion.div
      key="progression-story"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Crown className="h-6 w-6 text-yellow-400" />
          <h2 className="text-2xl font-bold">Progression Storytelling</h2>
        </div>
        <p className="text-slate-400">Make advancement feel like an epic journey</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Rival Relationship */}
        <Card className="p-6 bg-slate-800 border-slate-700">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Sword className="h-5 w-5 mr-2 text-red-400" />
            Rival Tracker
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-red-400 to-orange-600 flex items-center justify-center font-bold text-lg">
                AC
              </div>
              <div>
                <div className="font-bold text-lg">Alex Chen</div>
                <div className="text-sm text-red-400">Friendly Rival</div>
                <div className="text-xs text-slate-400">Head-to-head: 3-2 (You lead)</div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
              <div className="text-sm font-medium text-red-300 mb-2">Current Storyline</div>
              <div className="text-xs text-slate-300">
                Your biggest challenge in the Elite tier. Every match is a battle of strategies.
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Next Milestone</div>
              <div className="text-xs text-slate-400 mb-2">Win 3 in a row for rivalry breakthrough</div>
              <Progress value={66} className="h-2" />
              <div className="text-xs text-slate-400">2/3 wins</div>
            </div>
          </div>
        </Card>

        {/* Breakthrough Celebration */}
        <Card className="p-6 bg-slate-800 border-slate-700 relative overflow-hidden">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Crown className="h-5 w-5 mr-2 text-yellow-400" />
            Breakthrough Moments
          </h3>
          
          <div className="text-center space-y-4">
            {!showCelebration ? (
              <>
                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-600/20 border-2 border-yellow-500 mx-auto mb-4">
                  <Target className="h-10 w-10 text-yellow-400" />
                </div>
                <div className="text-lg font-semibold">Ready for Glory?</div>
                <div className="text-sm text-slate-400 mb-4">
                  Trigger a major ranking breakthrough and experience the celebration
                </div>
                <Button
                  onClick={triggerBreakthrough}
                  className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Breakthrough!
                </Button>
              </>
            ) : (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="space-y-4"
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, repeat: 3 }}
                  className="text-6xl"
                >
                  🏆
                </motion.div>
                <div className="text-xl font-bold text-yellow-400">
                  ELITE TIER REACHED!
                </div>
                <div className="text-sm text-slate-300">
                  You've climbed to #47 in the regional rankings!
                </div>
                <Badge className="bg-yellow-500 text-yellow-900">
                  +50 Bonus Points
                </Badge>
              </motion.div>
            )}
          </div>

          {/* Celebration Particles */}
          <AnimatePresence>
            {showCelebration && (
              <>
                {Array.from({ length: 20 }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ 
                      opacity: 1, 
                      y: Math.random() * 400,
                      x: Math.random() * 400,
                      scale: 0.5 
                    }}
                    animate={{ 
                      opacity: 0, 
                      y: Math.random() * 400 - 200,
                      x: Math.random() * 400 - 200,
                      scale: 1 
                    }}
                    transition={{ duration: 2, delay: Math.random() * 1 }}
                    className="absolute pointer-events-none"
                  >
                    <Sparkles className="h-4 w-4 text-yellow-400" />
                  </motion.div>
                ))}
              </>
            )}
          </AnimatePresence>
        </Card>
      </div>

      {/* Legacy Building */}
      <Card className="p-6 bg-gradient-to-r from-slate-800 to-slate-700 border-slate-600">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Medal className="h-5 w-5 mr-2 text-purple-400" />
          Your Pickleball Legacy
        </h3>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl mb-2">⚡</div>
            <div className="font-semibold">The Comeback Kid</div>
            <div className="text-sm text-slate-400">Won 5 matches from behind</div>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">🎯</div>
            <div className="font-semibold">Precision Master</div>
            <div className="text-sm text-slate-400">15 perfect placement shots</div>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">🤝</div>
            <div className="font-semibold">Team Player</div>
            <div className="text-sm text-slate-400">Highest doubles win rate</div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}