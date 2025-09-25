/**
 * Realistic Sports Card Aesthetic Prototype
 * 
 * Traditional sports card design with rich detail and subtle effects
 * Features: Premium borders, foil treatments, professional typography
 */

import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Trophy, TrendingUp, Award, MapPin, Calendar } from "lucide-react";

interface RealisticSportsCardProps {
  user: any;
  variant?: 'front' | 'back';
}

// Calculate card rarity based on user stats
const getCardRarity = (user: any) => {
  const points = user?.singlesRankingPoints || user?.rankingPoints || 0;
  const coachLevel = user?.coachLevel || 0;
  
  if (coachLevel >= 4) return 'mythic'; // L4+ coaches are mythic
  if (points >= 1800) return 'mythic';
  if (points >= 1000) return 'legendary';
  if (points >= 500) return 'epic';
  if (points >= 200) return 'rare';
  return 'common';
};

const getRarityColors = (rarity: string) => {
  switch (rarity) {
    case 'mythic':
      return {
        border: 'border-gradient-mythic',
        glow: 'shadow-purple-500/30',
        background: 'bg-gradient-to-br from-purple-600/10 via-amber-500/10 to-purple-600/10',
        text: 'text-purple-600'
      };
    case 'legendary':
      return {
        border: 'border-orange-400',
        glow: 'shadow-orange-400/20',
        background: 'bg-gradient-to-br from-orange-100/50 to-yellow-100/50',
        text: 'text-orange-600'
      };
    case 'epic':
      return {
        border: 'border-purple-400',
        glow: 'shadow-purple-400/20',
        background: 'bg-gradient-to-br from-purple-100/50 to-blue-100/50',
        text: 'text-purple-600'
      };
    case 'rare':
      return {
        border: 'border-blue-400',
        glow: 'shadow-blue-400/20',
        background: 'bg-gradient-to-br from-blue-100/50 to-cyan-100/50',
        text: 'text-blue-600'
      };
    default:
      return {
        border: 'border-slate-300',
        glow: 'shadow-slate-200/20',
        background: 'bg-gradient-to-br from-slate-50 to-white',
        text: 'text-slate-600'
      };
  }
};

export default function RealisticSportsCard({ user, variant = 'front' }: RealisticSportsCardProps) {
  const [flipped, setFlipped] = useState(false);
  const rarity = getCardRarity(user);
  const colors = getRarityColors(rarity);
  
  const handleFlip = () => {
    setFlipped(!flipped);
  };

  const displayName = user?.displayName || user?.username || 'Player';
  const location = user?.location || 'Location Unknown';
  const totalMatches = user?.totalMatches || 0;
  const matchesWon = user?.matchesWon || 0;
  const winRate = totalMatches > 0 ? Math.round((matchesWon / totalMatches) * 100) : 0;
  const points = user?.singlesRankingPoints || user?.rankingPoints || 0;
  const coachLevel = user?.coachLevel || 0;

  if (flipped || variant === 'back') {
    return (
      <div className="relative w-64 h-96 cursor-pointer" onClick={handleFlip}>
        <Card className={`
          w-full h-full border-2 ${colors.border} ${colors.glow} shadow-xl
          ${colors.background} backdrop-blur-sm
          transition-all duration-300 hover:scale-105
          relative overflow-hidden
        `}>
          {/* Mythic shimmer effect */}
          {rarity === 'mythic' && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400/20 to-transparent 
                          transform -skew-x-12 translate-x-[-200%] animate-[shimmer_3s_infinite]" />
          )}
          
          <CardContent className="p-4 h-full flex flex-col">
            {/* Header */}
            <div className="text-center border-b border-slate-200 pb-3 mb-4">
              <h3 className="text-lg font-bold text-slate-800">{displayName}</h3>
              <Badge variant="outline" className={`${colors.text} text-xs font-semibold`}>
                {rarity.toUpperCase()}
              </Badge>
            </div>

            {/* Stats Grid */}
            <div className="flex-1 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-white/70 rounded-lg p-2 border border-slate-200">
                  <div className="text-slate-500 text-xs uppercase tracking-wide">Points</div>
                  <div className="text-lg font-bold text-slate-800">{points.toLocaleString()}</div>
                </div>
                <div className="bg-white/70 rounded-lg p-2 border border-slate-200">
                  <div className="text-slate-500 text-xs uppercase tracking-wide">Win Rate</div>
                  <div className="text-lg font-bold text-slate-800">{winRate}%</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-white/70 rounded-lg p-2 border border-slate-200">
                  <div className="text-slate-500 text-xs uppercase tracking-wide">Matches</div>
                  <div className="text-lg font-bold text-slate-800">{totalMatches}</div>
                </div>
                {coachLevel > 0 && (
                  <div className="bg-white/70 rounded-lg p-2 border border-slate-200">
                    <div className="text-slate-500 text-xs uppercase tracking-wide">Coach</div>
                    <div className="text-lg font-bold text-slate-800">L{coachLevel}</div>
                  </div>
                )}
              </div>

              {/* Performance Indicators */}
              <div className="bg-white/70 rounded-lg p-3 border border-slate-200">
                <div className="text-slate-500 text-xs uppercase tracking-wide mb-2">Performance</div>
                <div className="flex items-center gap-2">
                  {winRate >= 70 && <TrendingUp className="w-4 h-4 text-green-600" />}
                  {totalMatches >= 50 && <Trophy className="w-4 h-4 text-yellow-600" />}
                  {user?.isFoundingMember && <Star className="w-4 h-4 text-purple-600" />}
                  {coachLevel > 0 && <Award className="w-4 h-4 text-blue-600" />}
                </div>
              </div>

              {/* Location & Date */}
              <div className="text-xs text-slate-500 space-y-1">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>{location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>Playing since {user?.playingSince || '2024'}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-xs text-slate-400 border-t border-slate-200 pt-2">
              PICKLE+ TRADING CARD • #{user?.passportCode || 'DEMO'}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Front of card
  return (
    <div className="relative w-64 h-96 cursor-pointer" onClick={handleFlip}>
      <Card className={`
        w-full h-full border-2 ${colors.border} ${colors.glow} shadow-xl
        ${colors.background} backdrop-blur-sm
        transition-all duration-300 hover:scale-105
        relative overflow-hidden
      `}>
        {/* Mythic shimmer effect */}
        {rarity === 'mythic' && (
          <>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400/20 to-transparent 
                          transform -skew-x-12 translate-x-[-200%] animate-[shimmer_3s_infinite]" />
            {/* Purple-gold border treatment */}
            <div className="absolute inset-0 border-2 border-transparent bg-gradient-to-r from-purple-600 via-amber-500 to-purple-600 p-[2px] rounded-lg">
              <div className="w-full h-full bg-white rounded-md" />
            </div>
          </>
        )}
        
        <CardContent className="p-4 h-full flex flex-col relative z-10">
          {/* Header with rarity */}
          <div className="text-center mb-4">
            <h2 className="text-xl font-bold text-slate-800 tracking-wide">{displayName}</h2>
            <Badge variant="outline" className={`${colors.text} text-xs font-semibold mt-1`}>
              {rarity.toUpperCase()}
            </Badge>
            {coachLevel > 0 && (
              <Badge variant="outline" className="ml-1 text-xs border-amber-400 text-amber-700">
                COACH L{coachLevel}
              </Badge>
            )}
          </div>

          {/* Player Image */}
          <div className="flex-1 flex items-center justify-center mb-4">
            <div className={`relative ${rarity === 'mythic' ? 'ring-4 ring-purple-400/30' : ''} rounded-full`}>
              <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                <AvatarImage src={user?.avatarUrl} alt={displayName} />
                <AvatarFallback className="text-2xl font-bold bg-slate-100">
                  {user?.avatarInitials || displayName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          {/* Key Stats */}
          <div className="bg-white/80 rounded-lg p-3 border border-slate-200 mb-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-lg font-bold text-slate-800">{points}</div>
                <div className="text-xs text-slate-500 uppercase tracking-wide">Points</div>
              </div>
              <div>
                <div className="text-lg font-bold text-slate-800">{totalMatches}</div>
                <div className="text-xs text-slate-500 uppercase tracking-wide">Matches</div>
              </div>
              <div>
                <div className="text-lg font-bold text-slate-800">{winRate}%</div>
                <div className="text-xs text-slate-500 uppercase tracking-wide">Win Rate</div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center">
            <div className="text-xs text-slate-400 mb-1">
              PICKLE+ • {location}
            </div>
            <div className="text-xs text-slate-300 font-mono">
              #{user?.passportCode || 'DEMO'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Click hint */}
      <div className="absolute bottom-2 right-2 text-xs text-slate-400 opacity-60">
        Click to flip
      </div>
    </div>
  );
}

// Add shimmer animation to global CSS
const style = document.createElement('style');
style.textContent = `
  @keyframes shimmer {
    0% { transform: translateX(-200%) skewX(-12deg); }
    100% { transform: translateX(200%) skewX(-12deg); }
  }
`;
document.head.appendChild(style);