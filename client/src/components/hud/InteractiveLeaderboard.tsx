import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Trophy, Crown, Medal, Swords, Target, MapPin, TrendingUp, TrendingDown, Minus, Zap, User, Users, Shuffle } from 'lucide-react';
import { Button } from '@/components/ui/button';

type RegionFilter = 'local' | 'regional' | 'national' | 'global';
type RankingType = 'singles' | 'doubles' | 'mixed';

interface PlayerRankings {
  singlesRank: number;
  singlesPoints: number;
  singlesWins: number;
  singlesLosses: number;
  
  doublesRank: number;
  doublesPoints: number;
  doublesWins: number;
  doublesLosses: number;
  
  mixedRank: number;
  mixedPoints: number;
  mixedWins: number;
  mixedLosses: number;
}

interface LeaderboardPlayer {
  id: string;
  name: string;
  tier: 'recreational' | 'competitive' | 'elite' | 'professional';
  location: string;
  distance?: number;
  isChallengeable?: boolean;
  avatar?: string;
  gender: 'male' | 'female';
  
  // Multi-ranking data
  rankings: PlayerRankings;
  
  // Legacy fields for backward compatibility
  rank?: number;
  rankingPoints?: number;
  winRate?: number;
  recentChange?: number;
}

interface InteractiveLeaderboardProps {
  players: LeaderboardPlayer[];
  currentPlayerId: string;
  currentPlayerGender?: 'male' | 'female';
  onChallenge?: (player: LeaderboardPlayer, suggestedMatchType: RankingType) => void;
  className?: string;
}

const tierConfig = {
  recreational: {
    name: 'Recreational',
    gradient: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
    color: '#64748b'
  },
  competitive: {
    name: 'Competitive',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    color: '#3b82f6'
  },
  elite: {
    name: 'Elite',
    gradient: 'linear-gradient(135deg, #f97316 0%, #ec4899 50%, #a855f7 100%)',
    color: '#f97316'
  },
  professional: {
    name: 'Professional',
    gradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
    color: '#fbbf24'
  }
};

const rankingTabs: Array<{ 
  value: RankingType; 
  label: string; 
  icon: typeof User;
  description: string;
}> = [
  { value: 'singles', label: 'Singles', icon: User, description: '1v1 Head-to-Head' },
  { value: 'doubles', label: 'Doubles', icon: Users, description: 'Same-Gender Teams' },
  { value: 'mixed', label: 'Mixed', icon: Shuffle, description: 'Mixed-Gender Teams' }
];

const regionFilters: Array<{ value: RegionFilter; label: string; icon: typeof MapPin }> = [
  { value: 'local', label: 'Local', icon: MapPin },
  { value: 'regional', label: 'Regional', icon: Target },
  { value: 'national', label: 'National', icon: Trophy },
  { value: 'global', label: 'Global', icon: Crown }
];

function getRankIcon(rank: number) {
  if (rank === 1) return { Icon: Crown, color: '#fbbf24', label: '1st' };
  if (rank === 2) return { Icon: Trophy, color: '#c0c0c0', label: '2nd' };
  if (rank === 3) return { Icon: Medal, color: '#cd7f32', label: '3rd' };
  return null;
}

function LeaderboardRow({ 
  player, 
  isCurrentPlayer,
  activeRankingType,
  onChallenge
}: { 
  player: LeaderboardPlayer; 
  isCurrentPlayer: boolean;
  activeRankingType: RankingType;
  onChallenge?: (player: LeaderboardPlayer, suggestedMatchType: RankingType) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const tierStyle = tierConfig[player.tier] || tierConfig.recreational;
  const primaryGradient = 'linear-gradient(135deg, #f97316 0%, #ec4899 50%, #a855f7 100%)';
  
  // Get current ranking data based on active tab
  const getCurrentRankData = () => {
    // Safety check for rankings object
    if (!player.rankings) {
      return {
        rank: 999,
        points: 0,
        wins: 0,
        losses: 0
      };
    }
    
    switch (activeRankingType) {
      case 'singles':
        return {
          rank: player.rankings.singlesRank || 999,
          points: player.rankings.singlesPoints || 0,
          wins: player.rankings.singlesWins || 0,
          losses: player.rankings.singlesLosses || 0
        };
      case 'doubles':
        return {
          rank: player.rankings.doublesRank || 999,
          points: player.rankings.doublesPoints || 0,
          wins: player.rankings.doublesWins || 0,
          losses: player.rankings.doublesLosses || 0
        };
      case 'mixed':
        return {
          rank: player.rankings.mixedRank || 999,
          points: player.rankings.mixedPoints || 0,
          wins: player.rankings.mixedWins || 0,
          losses: player.rankings.mixedLosses || 0
        };
    }
  };

  const currentRank = getCurrentRankData();
  const rankIcon = getRankIcon(currentRank.rank);
  const totalMatches = currentRank.wins + currentRank.losses;
  const winRate = totalMatches > 0 ? Math.round((currentRank.wins / totalMatches) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: currentRank.rank * 0.05 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`relative group ${isCurrentPlayer ? 'ring-2 ring-[#f97316]' : ''}`}
      data-testid={`leaderboard-row-${player.id}`}
    >
      {/* Hexagonal Background */}
      <div 
        className={`relative bg-black/40 backdrop-blur-sm transition-all duration-300 ${
          isCurrentPlayer ? 'bg-black/60' : ''
        }`}
        style={{
          clipPath: 'polygon(2% 0%, 98% 0%, 100% 50%, 98% 100%, 2% 100%, 0% 50%)'
        }}
      >
        {/* Animated Border Glow */}
        <div 
          className={`absolute inset-0 transition-opacity duration-300 ${
            isHovered ? 'opacity-30' : 'opacity-0'
          }`}
          style={{
            background: primaryGradient,
            clipPath: 'polygon(2% 0%, 98% 0%, 100% 50%, 98% 100%, 2% 100%, 0% 50%)'
          }}
        />

        {/* Current Player Highlight */}
        {isCurrentPlayer && (
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              background: primaryGradient,
              clipPath: 'polygon(2% 0%, 98% 0%, 100% 50%, 98% 100%, 2% 100%, 0% 50%)'
            }}
          />
        )}

        {/* Content */}
        <div className="relative z-10 p-4">
          {/* Mobile & Desktop Layout */}
          <div className="flex items-start gap-3">
            {/* Left Side: Rank + Avatar */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Rank Badge */}
              <div className="w-10 md:w-12 flex items-center justify-center">
                {rankIcon ? (
                  <div className="relative">
                    <div 
                      className="absolute inset-0 blur-md"
                      style={{ background: rankIcon.color }}
                    />
                    <rankIcon.Icon 
                      className="relative w-6 h-6 md:w-8 md:h-8"
                      style={{ color: rankIcon.color }}
                    />
                  </div>
                ) : (
                  <div 
                    className="text-lg md:text-2xl font-bold tabular-nums"
                    style={{
                      background: primaryGradient,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}
                  >
                    #{currentRank.rank}
                  </div>
                )}
              </div>

              {/* Avatar Placeholder */}
              <div 
                className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center border-2 transition-colors duration-300 flex-shrink-0"
                style={{
                  borderColor: isHovered ? tierStyle.color : 'rgba(255,255,255,0.2)',
                  background: `linear-gradient(135deg, ${tierStyle.color}33, ${tierStyle.color}11)`
                }}
              >
                <div 
                  className="text-lg md:text-xl font-bold"
                  style={{ color: tierStyle.color }}
                >
                  {player.name ? player.name.charAt(0) : '?'}
                </div>
              </div>
            </div>

            {/* Middle: Player Info (Flex-1) */}
            <div className="flex-1 min-w-0 space-y-1.5">
              {/* Name & Tier */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="font-bold text-white text-sm md:text-base truncate">
                  {player.name || 'Unknown Player'}
                  {isCurrentPlayer && (
                    <span className="ml-2 text-xs text-[#f97316]">(You)</span>
                  )}
                </div>
                <div 
                  className="px-2 py-0.5 text-[9px] md:text-[10px] rounded-full font-medium uppercase tracking-wider flex-shrink-0"
                  style={{
                    background: `${tierStyle.color}22`,
                    color: tierStyle.color
                  }}
                >
                  {tierStyle.name}
                </div>
              </div>
              
              {/* Multi-Ranking Badges */}
              <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
                <div 
                  className={`px-1.5 md:px-2 py-0.5 text-[9px] md:text-[10px] rounded-full font-medium transition-all ${
                    activeRankingType === 'singles' 
                      ? 'bg-white/20 text-white border border-white/30' 
                      : 'bg-white/5 text-white/50'
                  }`}
                  data-testid={`singles-rank-${player.id}`}
                >
                  S: #{player.rankings?.singlesRank || 999}
                </div>
                <div 
                  className={`px-1.5 md:px-2 py-0.5 text-[9px] md:text-[10px] rounded-full font-medium transition-all ${
                    activeRankingType === 'doubles' 
                      ? 'bg-white/20 text-white border border-white/30' 
                      : 'bg-white/5 text-white/50'
                  }`}
                  data-testid={`doubles-rank-${player.id}`}
                >
                  D: #{player.rankings?.doublesRank || 999}
                </div>
                <div 
                  className={`px-1.5 md:px-2 py-0.5 text-[9px] md:text-[10px] rounded-full font-medium transition-all ${
                    activeRankingType === 'mixed' 
                      ? 'bg-white/20 text-white border border-white/30' 
                      : 'bg-white/5 text-white/50'
                  }`}
                  data-testid={`mixed-rank-${player.id}`}
                >
                  M: #{player.rankings?.mixedRank || 999}
                </div>
              </div>

              {/* Location & Win Rate - Hidden on smallest screens */}
              <div className="hidden sm:flex items-center gap-2 md:gap-3 text-xs text-white/60 flex-wrap">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{player.location}</span>
                  {player.distance !== undefined && (
                    <span>
                      ({player.distance < 1 
                        ? `${Math.round(player.distance * 1000)}m` 
                        : `${player.distance}km`})
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="w-3 h-3 flex-shrink-0" />
                  {winRate}% WR
                </div>
              </div>
            </div>

            {/* Right Side: Stats & Challenge Button */}
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              {/* Stats */}
              <div className="text-right">
                <div 
                  className="text-base md:text-xl font-bold tabular-nums"
                  style={{
                    background: primaryGradient,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  {currentRank.points.toLocaleString()}
                </div>
                <div className="text-[10px] md:text-xs text-white/40">
                  {currentRank.wins}-{currentRank.losses}
                </div>
              </div>

              {/* Challenge Button */}
              {!isCurrentPlayer && player.isChallengeable && (
                <Button
                  size="sm"
                  onClick={() => onChallenge?.(player, activeRankingType)}
                  className="relative overflow-hidden bg-gradient-to-r from-[#f97316] via-[#ec4899] to-[#a855f7] hover:opacity-90 text-white border-0 text-xs md:text-sm px-2 md:px-3 py-1 md:py-2"
                  data-testid={`challenge-button-${player.id}`}
                >
                  <Swords className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                  <span className="hidden sm:inline">Challenge</span>
                  <span className="sm:hidden">Go</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Scan Line Effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
          animate={{ x: ['-100%', '200%'] }}
          transition={{ 
            duration: 3, 
            repeat: Infinity, 
            repeatDelay: 5,
            ease: "linear" 
          }}
          style={{ 
            pointerEvents: 'none',
            clipPath: 'polygon(2% 0%, 98% 0%, 100% 50%, 98% 100%, 2% 100%, 0% 50%)'
          }}
        />
      </div>
    </motion.div>
  );
}

export default function InteractiveLeaderboard({ 
  players, 
  currentPlayerId,
  currentPlayerGender = 'male',
  onChallenge,
  className = '' 
}: InteractiveLeaderboardProps) {
  const [activeRankingType, setActiveRankingType] = useState<RankingType>('singles');
  const [activeRegionFilter, setActiveRegionFilter] = useState<RegionFilter>('local');
  const primaryGradient = 'linear-gradient(135deg, #f97316 0%, #ec4899 50%, #a855f7 100%)';

  // Sort players based on active ranking type
  const sortedPlayers = [...players].sort((a, b) => {
    // Safety check for rankings object
    if (!a.rankings || !b.rankings) return 0;
    
    switch (activeRankingType) {
      case 'singles':
        return (a.rankings.singlesRank || 999) - (b.rankings.singlesRank || 999);
      case 'doubles':
        return (a.rankings.doublesRank || 999) - (b.rankings.doublesRank || 999);
      case 'mixed':
        return (a.rankings.mixedRank || 999) - (b.rankings.mixedRank || 999);
      default:
        return 0;
    }
  });

  // Filter by gender for doubles (same gender)
  const filteredPlayers = activeRankingType === 'doubles'
    ? sortedPlayers.filter(p => p.gender === currentPlayerGender)
    : sortedPlayers;

  return (
    <div className={`space-y-4 ${className}`} data-testid="interactive-leaderboard">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-3"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <div className="w-1 h-6 bg-gradient-to-b from-[#f97316] via-[#ec4899] to-[#a855f7] rounded-full" />
            Leaderboard
          </h3>
          <div className="flex items-center gap-1 text-xs text-white/40">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>LIVE</span>
          </div>
        </div>

        {/* Ranking Type Tabs */}
        <div className="flex gap-2">
          {rankingTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeRankingType === tab.value;
            
            return (
              <button
                key={tab.value}
                onClick={() => setActiveRankingType(tab.value)}
                className={`relative flex-1 px-3 py-2 text-sm font-medium transition-all duration-300 ${
                  isActive ? 'text-white' : 'text-white/60 hover:text-white/80'
                }`}
                style={{
                  clipPath: 'polygon(5% 0%, 95% 0%, 100% 50%, 95% 100%, 5% 100%, 0% 50%)'
                }}
                data-testid={`ranking-tab-${tab.value}`}
              >
                {/* Background */}
                <div 
                  className={`absolute inset-0 transition-opacity duration-300 ${
                    isActive ? 'opacity-30' : 'opacity-0 hover:opacity-10'
                  }`}
                  style={{
                    background: primaryGradient,
                    clipPath: 'polygon(5% 0%, 95% 0%, 100% 50%, 95% 100%, 5% 100%, 0% 50%)'
                  }}
                />
                
                {/* Border for active */}
                {isActive && (
                  <div 
                    className="absolute inset-0 opacity-60"
                    style={{
                      background: primaryGradient,
                      clipPath: 'polygon(5% 0%, 95% 0%, 100% 50%, 95% 100%, 5% 100%, 0% 50%)'
                    }}
                  />
                )}

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center justify-center gap-1">
                  <Icon className="w-4 h-4" />
                  <span className="text-xs">{tab.label}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Region Filter Tabs */}
        <div className="flex gap-2">
          {regionFilters.map((filter) => {
            const Icon = filter.icon;
            const isActive = activeRegionFilter === filter.value;
            
            return (
              <button
                key={filter.value}
                onClick={() => setActiveRegionFilter(filter.value)}
                className={`relative flex-1 px-2 py-1.5 text-xs font-medium transition-all duration-300 ${
                  isActive ? 'text-white' : 'text-white/60 hover:text-white/80'
                }`}
                style={{
                  clipPath: 'polygon(5% 0%, 95% 0%, 100% 50%, 95% 100%, 5% 100%, 0% 50%)'
                }}
                data-testid={`filter-${filter.value}`}
              >
                {/* Background */}
                <div 
                  className={`absolute inset-0 transition-opacity duration-300 ${
                    isActive ? 'opacity-20' : 'opacity-0 hover:opacity-10'
                  }`}
                  style={{
                    background: primaryGradient,
                    clipPath: 'polygon(5% 0%, 95% 0%, 100% 50%, 95% 100%, 5% 100%, 0% 50%)'
                  }}
                />

                {/* Content */}
                <div className="relative z-10 flex items-center justify-center gap-1">
                  <Icon className="w-3 h-3" />
                  <span>{filter.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Leaderboard List */}
      <div className="space-y-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeRankingType}-${activeRegionFilter}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-2"
          >
            {filteredPlayers.slice(0, 8).map((player) => (
              <LeaderboardRow
                key={player.id}
                player={player}
                isCurrentPlayer={player.id === currentPlayerId}
                activeRankingType={activeRankingType}
                onChallenge={onChallenge}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Accent */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1, delay: 0.4 }}
        className="h-[1px] bg-gradient-to-r from-transparent via-[#f97316] to-transparent origin-left"
      />
    </div>
  );
}
