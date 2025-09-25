/**
 * Fantasy Gaming Card with Real PCP Data
 * 
 * Modern gaming-inspired design using actual pickleball stats
 * Features: Real ranking points, PCP ratings, skill assessments, match data
 */

import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Zap, Crown, Trophy, Target, TrendingUp, Star, Sparkles, Award } from "lucide-react";

interface FantasyGamingCardPCPProps {
  user: any;
  variant?: 'front' | 'back';
}

// Calculate card rarity based on real PCP data
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

// Get player tier based on PCP classification
const getPlayerTier = (points: number) => {
  if (points >= 1800) return { name: 'PROFESSIONAL', color: 'from-purple-400 to-pink-400' };
  if (points >= 1000) return { name: 'ELITE', color: 'from-orange-400 to-yellow-400' };
  if (points >= 300) return { name: 'COMPETITIVE', color: 'from-blue-400 to-cyan-400' };
  return { name: 'RECREATIONAL', color: 'from-green-400 to-emerald-400' };
};

const getRarityTheme = (rarity: string) => {
  switch (rarity) {
    case 'mythic':
      return {
        border: 'border-transparent bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500',
        glow: 'shadow-2xl shadow-purple-500/50 drop-shadow-2xl',
        background: 'bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-purple-900/20',
        accent: 'from-purple-400 to-pink-400',
        text: 'text-purple-300',
        icon: Crown,
        particle: 'animate-pulse'
      };
    case 'legendary':
      return {
        border: 'border-transparent bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-500',
        glow: 'shadow-2xl shadow-orange-500/50',
        background: 'bg-gradient-to-br from-orange-900/20 via-yellow-900/20 to-orange-900/20',
        accent: 'from-orange-400 to-yellow-400',
        text: 'text-orange-300',
        icon: Trophy,
        particle: 'animate-bounce'
      };
    case 'epic':
      return {
        border: 'border-transparent bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500',
        glow: 'shadow-2xl shadow-blue-500/50',
        background: 'bg-gradient-to-br from-blue-900/20 via-cyan-900/20 to-blue-900/20',
        accent: 'from-blue-400 to-cyan-400',
        text: 'text-blue-300',
        icon: Zap,
        particle: 'animate-ping'
      };
    case 'rare':
      return {
        border: 'border-transparent bg-gradient-to-r from-green-500 via-emerald-500 to-green-500',
        glow: 'shadow-xl shadow-green-500/40',
        background: 'bg-gradient-to-br from-green-900/20 via-emerald-900/20 to-green-900/20',
        accent: 'from-green-400 to-emerald-400',
        text: 'text-green-300',
        icon: Target,
        particle: 'animate-pulse'
      };
    default:
      return {
        border: 'border-slate-600',
        glow: 'shadow-lg shadow-slate-500/30',
        background: 'bg-gradient-to-br from-slate-800/20 to-slate-900/20',
        accent: 'from-slate-400 to-slate-500',
        text: 'text-slate-300',
        icon: Star,
        particle: ''
      };
  }
};

export default function FantasyGamingCardPCP({ user, variant = 'front' }: FantasyGamingCardPCPProps) {
  const [flipped, setFlipped] = useState(false);
  const rarity = getCardRarity(user);
  const theme = getRarityTheme(rarity);
  const IconComponent = theme.icon;
  
  const handleFlip = () => {
    setFlipped(!flipped);
  };

  const displayName = user?.displayName || user?.username || 'Player';
  const totalMatches = user?.totalMatches || 0;
  const matchesWon = user?.matchesWon || 0;
  const winRate = totalMatches > 0 ? Math.round((matchesWon / totalMatches) * 100) : 0;
  const points = user?.singlesRankingPoints || user?.rankingPoints || 0;
  const coachLevel = user?.coachLevel || 0;
  const picklePoints = user?.picklePoints || 0;
  const tier = getPlayerTier(points);

  // Real PCP skill assessments (using actual skill data if available)
  const forehandStrength = user?.forehandStrength || Math.min(Math.floor(points / 25), 10);
  const backhandStrength = user?.backhandStrength || Math.min(Math.floor(points / 30), 10);
  const servePower = user?.servePower || Math.min(Math.floor(points / 35), 10);
  const dinkAccuracy = user?.dinkAccuracy || Math.min(Math.floor(points / 20), 10);
  const courtCoverage = user?.courtCoverage || Math.min(Math.floor(points / 40), 10);

  if (flipped || variant === 'back') {
    return (
      <div className="relative w-64 h-96 cursor-pointer" onClick={handleFlip}>
        <div className={`relative p-1 rounded-xl ${theme.border} ${theme.glow}`}>
          <Card className={`
            w-full h-full border-0 ${theme.background} backdrop-blur-sm
            transition-all duration-500 hover:scale-105
            relative overflow-hidden bg-slate-900/90
          `}>
            {/* Animated background particles */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(12)].map((_, i) => (
                <Star 
                  key={i}
                  className={`absolute w-2 h-2 ${theme.text} opacity-30 ${theme.particle}`}
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`
                  }}
                />
              ))}
            </div>
            
            <CardContent className="p-4 h-full flex flex-col text-white relative z-10">
              {/* Header */}
              <div className="text-center border-b border-slate-600 pb-3 mb-4">
                <h3 className={`text-xl font-bold bg-gradient-to-r ${theme.accent} bg-clip-text text-transparent`}>
                  {displayName}
                </h3>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <IconComponent className={`w-4 h-4 ${theme.text}`} />
                  <Badge variant="outline" className={`${theme.text} border-current text-xs font-bold tracking-wider`}>
                    {rarity.toUpperCase()}
                  </Badge>
                  <IconComponent className={`w-4 h-4 ${theme.text}`} />
                </div>
              </div>

              {/* PCP Skills Assessment */}
              <div className="flex-1 space-y-4">
                <div className="text-center">
                  <div className={`text-2xl font-black bg-gradient-to-r ${tier.color} bg-clip-text text-transparent`}>
                    {tier.name}
                  </div>
                  <div className={`text-lg font-bold bg-gradient-to-r ${theme.accent} bg-clip-text text-transparent`}>
                    {points.toLocaleString()} PCP
                  </div>
                </div>

                {/* PCP Skill Bars */}
                <div className="space-y-3">
                  <div className="bg-black/40 rounded-lg p-3 border border-slate-600">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-semibold text-slate-300">FOREHAND</span>
                      <span className="text-sm font-bold text-orange-400">{forehandStrength}/10</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-orange-500 to-orange-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(forehandStrength / 10) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-black/40 rounded-lg p-3 border border-slate-600">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-semibold text-slate-300">BACKHAND</span>
                      <span className="text-sm font-bold text-blue-400">{backhandStrength}/10</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(backhandStrength / 10) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-black/40 rounded-lg p-3 border border-slate-600">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-semibold text-slate-300">SERVE</span>
                      <span className="text-sm font-bold text-purple-400">{servePower}/10</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-purple-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(servePower / 10) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-black/40 rounded-lg p-3 border border-slate-600">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-semibold text-slate-300">DINK ACCURACY</span>
                      <span className="text-sm font-bold text-green-400">{dinkAccuracy}/10</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(dinkAccuracy / 10) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-black/40 rounded-lg p-3 border border-slate-600">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-semibold text-slate-300">COURT COVERAGE</span>
                      <span className="text-sm font-bold text-cyan-400">{courtCoverage}/10</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-cyan-500 to-cyan-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(courtCoverage / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Match Performance */}
                <div className="bg-black/40 rounded-lg p-3 border border-slate-600">
                  <div className="text-sm font-semibold text-slate-300 mb-2">MATCH RECORD</div>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div>
                      <div className="text-lg font-bold text-green-400">{matchesWon}</div>
                      <div className="text-xs text-slate-400">WINS</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-slate-400">{totalMatches - matchesWon}</div>
                      <div className="text-xs text-slate-400">LOSSES</div>
                    </div>
                  </div>
                  <div className="mt-2 text-center">
                    <div className={`text-sm font-bold bg-gradient-to-r ${theme.accent} bg-clip-text text-transparent`}>
                      {winRate}% WIN RATE
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center text-xs text-slate-500 border-t border-slate-600 pt-3">
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="w-3 h-3" />
                  <span>PICKLE+ CHAMPIONSHIP</span>
                  <Sparkles className="w-3 h-3" />
                </div>
                <div className="mt-1 font-mono">#{user?.passportCode || 'DEMO'}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Front of card
  return (
    <div className="relative w-64 h-96 cursor-pointer" onClick={handleFlip}>
      <div className={`relative p-1 rounded-xl ${theme.border} ${theme.glow} transform-gpu transition-all duration-500 hover:scale-105`}>
        <Card className={`
          w-full h-full border-0 ${theme.background} backdrop-blur-sm
          relative overflow-hidden bg-slate-900/90
        `}>
          {/* Dynamic background effects */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Animated gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${theme.accent} opacity-10 animate-pulse`} />
            
            {/* Floating particles */}
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className={`absolute w-1 h-1 bg-gradient-to-r ${theme.accent} rounded-full ${theme.particle}`}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`
                }}
              />
            ))}
          </div>
          
          <CardContent className="p-4 h-full flex flex-col text-white relative z-10">
            {/* Header with tier and rarity */}
            <div className="text-center mb-4">
              <div className={`text-sm font-bold ${theme.text} mb-1`}>{tier.name}</div>
              <h2 className={`text-2xl font-black bg-gradient-to-r ${theme.accent} bg-clip-text text-transparent tracking-wide`}>
                {displayName.toUpperCase()}
              </h2>
              <div className="flex items-center justify-center gap-2 mt-2">
                <IconComponent className={`w-4 h-4 ${theme.text} ${theme.particle}`} />
                <Badge variant="outline" className={`${theme.text} border-current text-xs font-bold tracking-wider`}>
                  {rarity.toUpperCase()}
                </Badge>
                {coachLevel > 0 && (
                  <Badge variant="outline" className="border-amber-400 text-amber-300 text-xs font-bold">
                    COACH L{coachLevel}
                  </Badge>
                )}
              </div>
            </div>

            {/* Player Image with special effects */}
            <div className="flex-1 flex items-center justify-center mb-4">
              <div className={`relative ${rarity === 'mythic' ? 'animate-pulse' : ''}`}>
                {/* Glow ring for high rarity */}
                {(rarity === 'mythic' || rarity === 'legendary') && (
                  <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${theme.accent} opacity-50 blur-md scale-110`} />
                )}
                
                <Avatar className={`w-32 h-32 border-4 border-gradient-to-r ${theme.accent} shadow-2xl relative z-10`}>
                  <AvatarImage src={user?.avatarUrl} alt={displayName} />
                  <AvatarFallback className={`text-2xl font-bold bg-gradient-to-br ${theme.accent} text-white`}>
                    {user?.avatarInitials || displayName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>

            {/* PCP Stats */}
            <div className="bg-black/60 rounded-lg p-3 border border-slate-600 mb-4 backdrop-blur-sm">
              <div className="grid grid-cols-2 gap-3 text-center">
                <div>
                  <div className={`text-xl font-black bg-gradient-to-r ${theme.accent} bg-clip-text text-transparent`}>
                    {points.toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider">PCP Points</div>
                </div>
                <div>
                  <div className={`text-xl font-black bg-gradient-to-r ${theme.accent} bg-clip-text text-transparent`}>
                    {winRate}%
                  </div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider">Win Rate</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-center mt-3 pt-3 border-t border-slate-600">
                <div>
                  <div className={`text-lg font-black bg-gradient-to-r ${theme.accent} bg-clip-text text-transparent`}>
                    {totalMatches}
                  </div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider">Matches</div>
                </div>
                <div>
                  <div className={`text-lg font-black bg-gradient-to-r ${theme.accent} bg-clip-text text-transparent`}>
                    {picklePoints}
                  </div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider">Pickle Pts</div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center">
              <div className="text-xs text-slate-500 mb-1 flex items-center justify-center gap-2">
                <Trophy className="w-3 h-3" />
                <span className="tracking-wider">PICKLE+ CHAMPIONSHIP</span>
                <Trophy className="w-3 h-3" />
              </div>
              <div className="text-xs text-slate-400 font-mono">
                #{user?.passportCode || 'DEMO'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Click hint with glow */}
      <div className={`absolute bottom-2 right-2 text-xs ${theme.text} opacity-60 animate-pulse`}>
        ⚡ Click to flip
      </div>
    </div>
  );
}