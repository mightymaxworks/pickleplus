import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy } from 'lucide-react';

interface PlayerTier {
  name: string;
  minPoints: number;
  maxPoints: number;
  color: string;
  bgColor: string;
  icon: string;
  description: string;
}

const playerTiers: PlayerTier[] = [
  {
    name: "Elite",
    minPoints: 2000,
    maxPoints: 9999,
    color: "text-purple-700",
    bgColor: "bg-gradient-to-r from-purple-100 to-indigo-100",
    icon: "👑",
    description: "Elite competitors - Top 1% of all players"
  },
  {
    name: "Expert",
    minPoints: 1500,
    maxPoints: 1999,
    color: "text-red-700",
    bgColor: "bg-gradient-to-r from-red-100 to-pink-100",
    icon: "🔥",
    description: "Expert level - Highly skilled competitive players"
  },
  {
    name: "Advanced",
    minPoints: 1000,
    maxPoints: 1499,
    color: "text-orange-700",
    bgColor: "bg-gradient-to-r from-orange-100 to-yellow-100",
    icon: "⭐",
    description: "Advanced players - Strong fundamentals and strategy"
  },
  {
    name: "Intermediate",
    minPoints: 500,
    maxPoints: 999,
    color: "text-blue-700",
    bgColor: "bg-gradient-to-r from-blue-100 to-cyan-100",
    icon: "🎯",
    description: "Intermediate skill - Solid understanding of the game"
  },
  {
    name: "Developing",
    minPoints: 200,
    maxPoints: 499,
    color: "text-green-700",
    bgColor: "bg-gradient-to-r from-green-100 to-emerald-100",
    icon: "📈",
    description: "Developing skills - Learning advanced techniques"
  },
  {
    name: "Beginner",
    minPoints: 50,
    maxPoints: 199,
    color: "text-gray-700",
    bgColor: "bg-gradient-to-r from-gray-100 to-slate-100",
    icon: "🌱",
    description: "New to the game - Building basic skills"
  },
  {
    name: "Rookie",
    minPoints: 0,
    maxPoints: 49,
    color: "text-amber-700",
    bgColor: "bg-gradient-to-r from-amber-50 to-yellow-50",
    icon: "🎾",
    description: "Just starting out - First matches and learning rules"
  }
];

export default function TierLegend() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          PicklePlus Tier System
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {playerTiers.map((tier) => (
            <div key={tier.name} className={`p-3 rounded-lg ${tier.bgColor} border-l-4 ${
              tier.name === "Elite" ? "border-purple-500" :
              tier.name === "Expert" ? "border-red-500" :
              tier.name === "Advanced" ? "border-orange-500" :
              tier.name === "Intermediate" ? "border-blue-500" :
              tier.name === "Developing" ? "border-green-500" :
              tier.name === "Beginner" ? "border-gray-500" : "border-amber-500"
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{tier.icon}</span>
                  <Badge 
                    variant="secondary" 
                    className={`${tier.color} ${tier.bgColor} border-0 font-semibold`}
                  >
                    {tier.name}
                  </Badge>
                </div>
                <div className={`text-sm font-semibold ${tier.color}`}>
                  {tier.minPoints === 0 ? `< ${tier.maxPoints + 1}` : 
                   tier.maxPoints === 9999 ? `${tier.minPoints}+` :
                   `${tier.minPoints}-${tier.maxPoints}`} pts
                </div>
              </div>
              <p className="text-sm text-gray-600">
                {tier.description}
              </p>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-orange-50 rounded-lg">
          <h4 className="font-semibold text-orange-800 mb-2">How Tiers Work</h4>
          <ul className="text-sm text-orange-700 space-y-1">
            <li>• Tiers are based on your total PicklePlus points</li>
            <li>• Points come from wins in tournaments, leagues, and casual matches</li>
            <li>• Age and skill multipliers help create fair competition</li>
            <li>• Your tier updates automatically as you earn more points</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}