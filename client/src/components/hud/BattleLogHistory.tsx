import { motion } from 'framer-motion';
import { Trophy, Target, Calendar, TrendingUp, TrendingDown, Swords, Award, Clock, MapPin } from 'lucide-react';

type MatchResult = 'victory' | 'defeat';

interface MatchRecord {
  id: string;
  result: MatchResult;
  opponent: {
    name: string;
    rankingPoints: number;
    tier: 'recreational' | 'competitive' | 'elite' | 'professional';
  };
  score: {
    player: number;
    opponent: number;
  };
  pointsChange: number;
  date: string;
  location: string;
  matchType: 'singles' | 'doubles';
  duration?: string;
}

interface BattleLogHistoryProps {
  matches: MatchRecord[];
  className?: string;
}

const tierConfig = {
  recreational: { color: '#64748b', name: 'Recreational' },
  competitive: { color: '#3b82f6', name: 'Competitive' },
  elite: { color: '#f97316', name: 'Elite' },
  professional: { color: '#fbbf24', name: 'Professional' }
};

function MatchLogEntry({ match, index }: { match: MatchRecord; index: number }) {
  const isVictory = match.result === 'victory';
  const primaryGradient = 'linear-gradient(135deg, #f97316 0%, #ec4899 50%, #a855f7 100%)';
  const victoryGradient = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
  const defeatGradient = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
  const resultGradient = isVictory ? victoryGradient : defeatGradient;
  const tierStyle = tierConfig[match.opponent.tier];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group relative"
      data-testid={`match-log-${match.id}`}
    >
      {/* Battle Log Card with Hexagonal Shape */}
      <div 
        className="relative bg-black/40 backdrop-blur-sm transition-all duration-300"
        style={{
          clipPath: 'polygon(1% 0%, 99% 0%, 100% 50%, 99% 100%, 1% 100%, 0% 50%)'
        }}
      >
        {/* Result Indicator Glow */}
        <div 
          className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity"
          style={{
            background: resultGradient,
            clipPath: 'polygon(1% 0%, 99% 0%, 100% 50%, 99% 100%, 1% 100%, 0% 50%)'
          }}
        />

        {/* Content */}
        <div className="relative z-10 p-4">
          <div className="flex items-center gap-4">
            {/* Result Badge */}
            <div className="flex-shrink-0">
              <div 
                className="relative w-14 h-14 rounded-lg flex flex-col items-center justify-center"
                style={{
                  background: `${isVictory ? '#10b981' : '#ef4444'}22`,
                  border: `2px solid ${isVictory ? '#10b981' : '#ef4444'}44`
                }}
              >
                {isVictory ? (
                  <Trophy className="w-6 h-6 text-green-400 mb-1" />
                ) : (
                  <Target className="w-6 h-6 text-red-400 mb-1" />
                )}
                <span 
                  className="text-[10px] font-bold uppercase"
                  style={{ color: isVictory ? '#10b981' : '#ef4444' }}
                >
                  {match.result}
                </span>
              </div>
            </div>

            {/* Match Info */}
            <div className="flex-1 min-w-0">
              {/* Score Display */}
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-1">
                  <span 
                    className="text-2xl font-bold tabular-nums"
                    style={{
                      background: primaryGradient,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}
                  >
                    {match.score.player}
                  </span>
                  <span className="text-white/40 text-sm">-</span>
                  <span className="text-xl font-bold text-white/60 tabular-nums">
                    {match.score.opponent}
                  </span>
                </div>
                <Swords className="w-4 h-4 text-white/40" />
              </div>

              {/* Opponent Info */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-white font-medium truncate">
                  vs {match.opponent.name}
                </span>
                <div 
                  className="px-2 py-0.5 text-[10px] rounded-full font-medium uppercase tracking-wider"
                  style={{
                    background: `${tierStyle.color}22`,
                    color: tierStyle.color
                  }}
                >
                  {tierStyle.name}
                </div>
                <span className="text-xs text-white/40">
                  ({match.opponent.rankingPoints.toLocaleString()})
                </span>
              </div>

              {/* Meta Info */}
              <div className="flex items-center gap-3 text-xs text-white/60">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {match.date}
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {match.location}
                </div>
                {match.duration && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {match.duration}
                  </div>
                )}
                <div 
                  className="px-2 py-0.5 rounded-full uppercase font-medium"
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.6)'
                  }}
                >
                  {match.matchType}
                </div>
              </div>
            </div>

            {/* Points Change */}
            <div className="flex-shrink-0 text-right">
              <div className="flex items-center justify-end gap-1 mb-1">
                {match.pointsChange > 0 ? (
                  <>
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="text-lg font-bold text-green-400 tabular-nums">
                      +{match.pointsChange}
                    </span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-4 h-4 text-red-400" />
                    <span className="text-lg font-bold text-red-400 tabular-nums">
                      {match.pointsChange}
                    </span>
                  </>
                )}
              </div>
              <div className="text-xs text-white/40 uppercase tracking-wider">
                Points
              </div>
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
            clipPath: 'polygon(1% 0%, 99% 0%, 100% 50%, 99% 100%, 1% 100%, 0% 50%)'
          }}
        />
      </div>
    </motion.div>
  );
}

export default function BattleLogHistory({ matches, className = '' }: BattleLogHistoryProps) {
  const primaryGradient = 'linear-gradient(135deg, #f97316 0%, #ec4899 50%, #a855f7 100%)';
  
  // Calculate stats
  const victories = matches.filter(m => m.result === 'victory').length;
  const totalMatches = matches.length;
  const recentStreak = calculateStreak(matches);

  return (
    <div className={`space-y-4 ${className}`} data-testid="battle-log-history">
      {/* Header with Stats Summary */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-3"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <div className="w-1 h-6 bg-gradient-to-b from-[#f97316] via-[#ec4899] to-[#a855f7] rounded-full" />
            Battle Log
          </h3>
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1 text-white/60">
              <Trophy className="w-3 h-3 text-green-400" />
              <span className="text-green-400 font-bold">{victories}</span>
              <span className="text-white/40">/</span>
              <span className="text-white/60">{totalMatches}</span>
            </div>
            {recentStreak !== 0 && (
              <div 
                className="flex items-center gap-1 px-2 py-1 rounded-full"
                style={{
                  background: recentStreak > 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'
                }}
              >
                <Award className={`w-3 h-3 ${recentStreak > 0 ? 'text-green-400' : 'text-red-400'}`} />
                <span className={`font-bold ${recentStreak > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {Math.abs(recentStreak)} {recentStreak > 0 ? 'W' : 'L'}
                </span>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Match History List */}
      <div className="space-y-2">
        {matches.length > 0 ? (
          matches.map((match, index) => (
            <MatchLogEntry key={match.id} match={match} index={index} />
          ))
        ) : (
          <div className="text-center py-12 text-white/40">
            <Swords className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>No match history available</p>
            <p className="text-xs mt-1">Your battle log will appear here</p>
          </div>
        )}
      </div>

      {/* Bottom Accent */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="h-[1px] bg-gradient-to-r from-transparent via-[#f97316] to-transparent origin-left"
      />
    </div>
  );
}

// Helper function to calculate current streak
function calculateStreak(matches: MatchRecord[]): number {
  if (matches.length === 0) return 0;
  
  let streak = 0;
  const firstResult = matches[0].result;
  
  for (const match of matches) {
    if (match.result === firstResult) {
      streak += match.result === 'victory' ? 1 : -1;
    } else {
      break;
    }
  }
  
  return streak;
}
