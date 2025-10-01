import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Trophy, Crown, Medal, Swords, Target, MapPin, TrendingUp, TrendingDown, Minus, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

type RegionFilter = 'local' | 'regional' | 'national' | 'global';

interface LeaderboardPlayer {
  id: string;
  rank: number;
  name: string;
  rankingPoints: number;
  tier: 'recreational' | 'competitive' | 'elite' | 'professional';
  location: string;
  distance?: number; // km away, only for local/regional
  winRate: number;
  recentChange: number; // +/- points from last period
  isChallengeable?: boolean;
  avatar?: string;
}

interface InteractiveLeaderboardProps {
  players: LeaderboardPlayer[];
  currentPlayerId: string;
  onChallenge?: (player: LeaderboardPlayer) => void;
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
  onChallenge
}: { 
  player: LeaderboardPlayer; 
  isCurrentPlayer: boolean;
  onChallenge?: (player: LeaderboardPlayer) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const tierStyle = tierConfig[player.tier];
  const rankIcon = getRankIcon(player.rank);
  const primaryGradient = 'linear-gradient(135deg, #f97316 0%, #ec4899 50%, #a855f7 100%)';

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: player.rank * 0.05 }}
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
        <div className="relative z-10 flex items-center gap-4 p-4">
          {/* Rank Badge */}
          <div className="flex-shrink-0 w-12 flex items-center justify-center">
            {rankIcon ? (
              <div className="relative">
                <div 
                  className="absolute inset-0 blur-md"
                  style={{ background: rankIcon.color }}
                />
                <rankIcon.Icon 
                  className="relative w-8 h-8"
                  style={{ color: rankIcon.color }}
                />
              </div>
            ) : (
              <div 
                className="text-2xl font-bold tabular-nums"
                style={{
                  background: primaryGradient,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                #{player.rank}
              </div>
            )}
          </div>

          {/* Avatar Placeholder */}
          <div 
            className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors duration-300"
            style={{
              borderColor: isHovered ? tierStyle.color : 'rgba(255,255,255,0.2)',
              background: `linear-gradient(135deg, ${tierStyle.color}33, ${tierStyle.color}11)`
            }}
          >
            <div 
              className="text-xl font-bold"
              style={{ color: tierStyle.color }}
            >
              {player.name.charAt(0)}
            </div>
          </div>

          {/* Player Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div className="font-bold text-white truncate">
                {player.name}
                {isCurrentPlayer && (
                  <span className="ml-2 text-xs text-[#f97316]">(You)</span>
                )}
              </div>
              <div 
                className="px-2 py-0.5 text-[10px] rounded-full font-medium uppercase tracking-wider"
                style={{
                  background: `${tierStyle.color}22`,
                  color: tierStyle.color
                }}
              >
                {tierStyle.name}
              </div>
            </div>
            
            <div className="flex items-center gap-3 text-xs text-white/60">
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {player.location}
                {player.distance !== undefined && (
                  <span className="ml-1">
                    ({player.distance < 1 
                      ? `${Math.round(player.distance * 1000)}m` 
                      : `${player.distance}km`})
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3" />
                {player.winRate}% WR
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex-shrink-0 text-right">
            <div 
              className="text-xl font-bold tabular-nums mb-1"
              style={{
                background: primaryGradient,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              {player.rankingPoints.toLocaleString()}
            </div>
            <div className="flex items-center justify-end gap-1 text-xs">
              {player.recentChange > 0 && (
                <>
                  <TrendingUp className="w-3 h-3 text-green-400" />
                  <span className="text-green-400">+{player.recentChange}</span>
                </>
              )}
              {player.recentChange < 0 && (
                <>
                  <TrendingDown className="w-3 h-3 text-red-400" />
                  <span className="text-red-400">{player.recentChange}</span>
                </>
              )}
              {player.recentChange === 0 && (
                <>
                  <Minus className="w-3 h-3 text-white/40" />
                  <span className="text-white/40">--</span>
                </>
              )}
            </div>
          </div>

          {/* Challenge Button */}
          {!isCurrentPlayer && player.isChallengeable && (
            <div className="flex-shrink-0">
              <Button
                size="sm"
                onClick={() => onChallenge?.(player)}
                className="relative overflow-hidden bg-gradient-to-r from-[#f97316] via-[#ec4899] to-[#a855f7] hover:opacity-90 text-white border-0"
                data-testid={`challenge-button-${player.id}`}
              >
                <Swords className="w-4 h-4 mr-1" />
                Challenge
              </Button>
            </div>
          )}
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
  onChallenge,
  className = '' 
}: InteractiveLeaderboardProps) {
  const [activeFilter, setActiveFilter] = useState<RegionFilter>('local');
  const primaryGradient = 'linear-gradient(135deg, #f97316 0%, #ec4899 50%, #a855f7 100%)';

  return (
    <div className={`space-y-4 ${className}`} data-testid="interactive-leaderboard">
      {/* Header with Region Filters */}
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

        {/* Region Filter Tabs */}
        <div className="flex gap-2">
          {regionFilters.map((filter) => {
            const Icon = filter.icon;
            const isActive = activeFilter === filter.value;
            
            return (
              <button
                key={filter.value}
                onClick={() => setActiveFilter(filter.value)}
                className={`relative flex-1 px-3 py-2 text-sm font-medium transition-all duration-300 ${
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
                      clipPath: 'polygon(5% 0%, 95% 0%, 100% 50%, 95% 100%, 5% 100%, 0% 50%)',
                      padding: '1px'
                    }}
                  />
                )}

                {/* Content */}
                <div className="relative z-10 flex items-center justify-center gap-1.5">
                  <Icon className="w-4 h-4" />
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
            key={activeFilter}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-2"
          >
            {players.slice(0, 8).map((player) => (
              <LeaderboardRow
                key={player.id}
                player={player}
                isCurrentPlayer={player.id === currentPlayerId}
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
