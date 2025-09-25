/**
 * Fantasy Gaming Card Aesthetic Prototype
 * 
 * Modern gaming-inspired design with bold effects and vibrant colors
 * Features: Neon glows, animated elements, fantasy-style UI
 */

import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Zap, Sword, Shield, Crown, Flame, Star, Sparkles } from "lucide-react";

interface FantasyGamingCardProps {
  user: any;
  variant?: 'front' | 'back';
}

// Calculate card rarity based on user stats
const getCardRarity = (user: any) => {
  const points = user?.singlesRankingPoints || user?.rankingPoints || 0;
  const coachLevel = user?.coachLevel || 0;
  
  if (coachLevel >= 4) return 'mythic';
  if (points >= 1800) return 'mythic';
  if (points >= 1000) return 'legendary';
  if (points >= 500) return 'epic';
  if (points >= 200) return 'rare';
  return 'common';
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
        icon: Flame,
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
        icon: Shield,
        particle: 'animate-pulse'
      };
    default:
      return {
        border: 'border-slate-600',
        glow: 'shadow-lg shadow-slate-500/30',
        background: 'bg-gradient-to-br from-slate-800/20 to-slate-900/20',
        accent: 'from-slate-400 to-slate-500',
        text: 'text-slate-300',
        icon: Sword,
        particle: ''
      };
  }
};

export default function FantasyGamingCard({ user, variant = 'front' }: FantasyGamingCardProps) {
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

  // Gaming-style stats calculation
  const power = Math.min(Math.floor(points / 10), 999);
  const agility = Math.min(winRate, 100);
  const wisdom = coachLevel * 20;
  const level = Math.floor(points / 100) + 1;

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

              {/* Gaming Stats */}
              <div className="flex-1 space-y-4">
                <div className="text-center">
                  <div className={`text-3xl font-black bg-gradient-to-r ${theme.accent} bg-clip-text text-transparent`}>
                    LVL {level}
                  </div>
                </div>

                {/* Power Stats */}
                <div className="space-y-3">
                  <div className="bg-black/40 rounded-lg p-3 border border-slate-600">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-semibold text-slate-300">POWER</span>
                      <span className="text-lg font-bold text-red-400">{power}</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-red-500 to-red-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((power / 999) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-black/40 rounded-lg p-3 border border-slate-600">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-semibold text-slate-300">AGILITY</span>
                      <span className="text-lg font-bold text-blue-400">{agility}</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${agility}%` }}
                      />
                    </div>
                  </div>

                  {wisdom > 0 && (
                    <div className="bg-black/40 rounded-lg p-3 border border-slate-600">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-semibold text-slate-300">WISDOM</span>
                        <span className="text-lg font-bold text-purple-400">{wisdom}</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-purple-400 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(wisdom, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Battle Record */}
                <div className="bg-black/40 rounded-lg p-3 border border-slate-600">
                  <div className="text-sm font-semibold text-slate-300 mb-2">BATTLE RECORD</div>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div>
                      <div className="text-lg font-bold text-green-400">{matchesWon}</div>
                      <div className="text-xs text-slate-400">VICTORIES</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-red-400">{totalMatches - matchesWon}</div>
                      <div className="text-xs text-slate-400">DEFEATS</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center text-xs text-slate-500 border-t border-slate-600 pt-3">
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="w-3 h-3" />
                  <span>PICKLE+ BATTLE CARD</span>
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
            {/* Header with level and rarity */}
            <div className="text-center mb-4">
              <div className={`text-sm font-bold ${theme.text} mb-1`}>LEVEL {level}</div>
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
                    MENTOR L{coachLevel}
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

            {/* Combat Stats */}
            <div className="bg-black/60 rounded-lg p-3 border border-slate-600 mb-4 backdrop-blur-sm">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className={`text-xl font-black bg-gradient-to-r ${theme.accent} bg-clip-text text-transparent`}>
                    {power}
                  </div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider">Power</div>
                </div>
                <div>
                  <div className={`text-xl font-black bg-gradient-to-r ${theme.accent} bg-clip-text text-transparent`}>
                    {agility}
                  </div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider">Agility</div>
                </div>
                <div>
                  <div className={`text-xl font-black bg-gradient-to-r ${theme.accent} bg-clip-text text-transparent`}>
                    {wisdom || 0}
                  </div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider">Wisdom</div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center">
              <div className="text-xs text-slate-500 mb-1 flex items-center justify-center gap-2">
                <Zap className="w-3 h-3" />
                <span className="tracking-wider">PICKLE+ ARENA</span>
                <Zap className="w-3 h-3" />
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