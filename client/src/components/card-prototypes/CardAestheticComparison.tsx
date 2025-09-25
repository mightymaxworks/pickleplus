/**
 * Card Aesthetic Comparison Component
 * 
 * Side-by-side comparison of realistic sports card vs fantasy gaming aesthetics
 * Allows user to evaluate both approaches with the same data
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import RealisticSportsCard from './RealisticSportsCard';
import FantasyGamingCard from './FantasyGamingCard';
import { Palette, Gamepad2, Users, Trophy } from 'lucide-react';

interface CardAestheticComparisonProps {
  user?: any;
}

// Sample user data for testing different rarity levels
const sampleUsers = {
  mythic: {
    id: 1,
    displayName: "Elite Pro",
    username: "elitepro",
    avatarInitials: "EP",
    passportCode: "MYTH001",
    location: "California, USA",
    playingSince: "2020",
    singlesRankingPoints: 1850,
    totalMatches: 150,
    matchesWon: 125,
    coachLevel: 5,
    isFoundingMember: true,
    avatarUrl: null
  },
  legendary: {
    id: 2,
    displayName: "Tournament Star",
    username: "tourneystar",
    avatarInitials: "TS",
    passportCode: "LGND002",
    location: "Texas, USA",
    playingSince: "2021",
    singlesRankingPoints: 1200,
    totalMatches: 80,
    matchesWon: 60,
    coachLevel: 0,
    isFoundingMember: false,
    avatarUrl: null
  },
  epic: {
    id: 3,
    displayName: "Rising Player",
    username: "risingplayer",
    avatarInitials: "RP",
    passportCode: "EPIC003",
    location: "Florida, USA",
    playingSince: "2022",
    singlesRankingPoints: 650,
    totalMatches: 45,
    matchesWon: 30,
    coachLevel: 2,
    isFoundingMember: false,
    avatarUrl: null
  },
  common: {
    id: 4,
    displayName: "New Player",
    username: "newplayer",
    avatarInitials: "NP",
    passportCode: "COMM004",
    location: "New York, USA",
    playingSince: "2024",
    singlesRankingPoints: 120,
    totalMatches: 12,
    matchesWon: 6,
    coachLevel: 0,
    isFoundingMember: false,
    avatarUrl: null
  }
};

export default function CardAestheticComparison({ user }: CardAestheticComparisonProps) {
  const [selectedRarity, setSelectedRarity] = useState<string>('mythic');
  const [cardSide, setCardSide] = useState<'front' | 'back'>('front');

  const currentUser = user || sampleUsers[selectedRarity as keyof typeof sampleUsers];

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-slate-800">Card Aesthetic Comparison</h1>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Compare realistic sports card aesthetic with fantasy gaming style. 
          Test different rarity levels and card sides to see how each approach handles the design.
        </p>
      </div>

      {/* Controls */}
      <div className="bg-slate-50 rounded-lg p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Rarity Selector */}
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">Test Rarity Level</label>
            <ToggleGroup 
              type="single" 
              value={selectedRarity} 
              onValueChange={(value) => value && setSelectedRarity(value)}
              className="grid grid-cols-2 gap-2"
            >
              <ToggleGroupItem value="mythic" className="data-[state=on]:bg-purple-100 data-[state=on]:text-purple-700">
                <Trophy className="w-4 h-4 mr-2" />
                Mythic
              </ToggleGroupItem>
              <ToggleGroupItem value="legendary" className="data-[state=on]:bg-orange-100 data-[state=on]:text-orange-700">
                <Trophy className="w-4 h-4 mr-2" />
                Legendary
              </ToggleGroupItem>
              <ToggleGroupItem value="epic" className="data-[state=on]:bg-blue-100 data-[state=on]:text-blue-700">
                <Users className="w-4 h-4 mr-2" />
                Epic
              </ToggleGroupItem>
              <ToggleGroupItem value="common" className="data-[state=on]:bg-slate-100 data-[state=on]:text-slate-700">
                <Users className="w-4 h-4 mr-2" />
                Common
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Card Side Selector */}
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">Card Side</label>
            <ToggleGroup 
              type="single" 
              value={cardSide} 
              onValueChange={(value) => value && setCardSide(value as 'front' | 'back')}
              className="grid grid-cols-2 gap-2"
            >
              <ToggleGroupItem value="front" className="data-[state=on]:bg-blue-100 data-[state=on]:text-blue-700">
                Front
              </ToggleGroupItem>
              <ToggleGroupItem value="back" className="data-[state=on]:bg-green-100 data-[state=on]:text-green-700">
                Back
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        {/* Current Test Data */}
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Current Test Data</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-slate-500">Points:</span>
              <span className="ml-1 font-semibold">{currentUser.singlesRankingPoints}</span>
            </div>
            <div>
              <span className="text-slate-500">Matches:</span>
              <span className="ml-1 font-semibold">{currentUser.totalMatches}</span>
            </div>
            <div>
              <span className="text-slate-500">Win Rate:</span>
              <span className="ml-1 font-semibold">
                {Math.round((currentUser.matchesWon / currentUser.totalMatches) * 100)}%
              </span>
            </div>
            <div>
              <span className="text-slate-500">Coach Level:</span>
              <span className="ml-1 font-semibold">L{currentUser.coachLevel}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Realistic Sports Card */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Palette className="w-5 h-5 text-slate-600" />
                Realistic Sports Card
              </CardTitle>
              <Badge variant="outline" className="mx-auto">Preferred Choice</Badge>
            </CardHeader>
            <CardContent className="flex justify-center">
              <RealisticSportsCard user={currentUser} variant={cardSide} />
            </CardContent>
          </Card>

          {/* Features List */}
          <div className="bg-slate-50 rounded-lg p-4">
            <h4 className="font-semibold text-slate-700 mb-2">Design Features:</h4>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• Traditional sports card proportions</li>
              <li>• Premium borders with subtle foil effects</li>
              <li>• Professional typography and layout</li>
              <li>• Rich detail without overwhelming complexity</li>
              <li>• Mythic: Shimmering purple-gold treatment</li>
              <li>• Coach cards: Special badge treatment</li>
              <li>• Collectible authenticity feel</li>
            </ul>
          </div>
        </div>

        {/* Fantasy Gaming Card */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Gamepad2 className="w-5 h-5 text-slate-600" />
                Fantasy Gaming Style
              </CardTitle>
              <Badge variant="outline" className="mx-auto">Alternative Style</Badge>
            </CardHeader>
            <CardContent className="flex justify-center">
              <FantasyGamingCard user={currentUser} variant={cardSide} />
            </CardContent>
          </Card>

          {/* Features List */}
          <div className="bg-slate-50 rounded-lg p-4">
            <h4 className="font-semibold text-slate-700 mb-2">Design Features:</h4>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• Modern gaming-inspired design</li>
              <li>• Bold neon glows and gradients</li>
              <li>• RPG-style stats (Power, Agility, Wisdom)</li>
              <li>• Animated particles and effects</li>
              <li>• Level-based progression display</li>
              <li>• High contrast dark theme</li>
              <li>• Battle arena aesthetic</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Recommendation Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">Recommendation: Realistic Sports Card</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
          <div>
            <h4 className="font-semibold mb-2">Why Realistic Works Better:</h4>
            <ul className="space-y-1">
              <li>• Authentic collectible card experience</li>
              <li>• Appeals to traditional sports card collectors</li>
              <li>• Professional, premium presentation</li>
              <li>• Timeless design that won't feel dated</li>
              <li>• Focuses on real achievement and skill</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Implementation Notes:</h4>
            <ul className="space-y-1">
              <li>• Subtle effects enhance without overwhelming</li>
              <li>• Rich detail creates collectible value</li>
              <li>• Easy toggle to classic passport view</li>
              <li>• Purple-gold mythic treatment is distinctive</li>
              <li>• Coach special treatment maintains hierarchy</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}