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
    name: "Professional",
    minPoints: 1800,
    maxPoints: 9999,
    color: "text-purple-700",
    bgColor: "bg-gradient-to-r from-purple-100 to-indigo-100",
    icon: "👑",
    description: "Professional players - Maximum competitive expectation (7% weekly decay, Enhanced tournament weighting)"
  },
  {
    name: "Elite",
    minPoints: 1000,
    maxPoints: 1799,
    color: "text-red-700",
    bgColor: "bg-gradient-to-r from-red-100 to-pink-100",
    icon: "🔥",
    description: "Elite players - High activity required (5% weekly decay, High competitive value)"
  },
  {
    name: "Competitive",
    minPoints: 300,
    maxPoints: 999,
    color: "text-orange-700",
    bgColor: "bg-gradient-to-r from-orange-100 to-yellow-100",
    icon: "⭐",
    description: "Competitive players - Moderate activity expected (2% weekly decay, Standard tournament weighting)"
  },
  {
    name: "Recreational",
    minPoints: 0,
    maxPoints: 299,
    color: "text-blue-700",
    bgColor: "bg-gradient-to-r from-blue-100 to-cyan-100",
    icon: "🎯",
    description: "Recreational players - Low barrier to entry (1% weekly decay, Holiday decay protection)"
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
              tier.name === "Professional" ? "border-purple-500" :
              tier.name === "Elite" ? "border-red-500" :
              tier.name === "Competitive" ? "border-orange-500" :
              "border-blue-500"
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
          <h4 className="font-semibold text-orange-800 mb-2">Official PicklePlus 4-Tier System</h4>
          <ul className="text-sm text-orange-700 space-y-1">
            <li>• Based on the official PicklePlus algorithm document</li>
            <li>• Each tier has different decay rates and activity requirements</li>
            <li>• Professional tier gets enhanced tournament weighting (3x vs 2x)</li>
            <li>• Points from age multipliers, gender balance, and tournament levels</li>
            <li>• Decay protection varies: Recreational (1%), Competitive (2%), Elite (5%), Professional (7%)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}