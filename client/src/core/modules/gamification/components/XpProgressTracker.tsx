/**
 * PKL-278651-XP-0002-UI
 * XP Progress Tracker Component
 * 
 * This component displays a user's XP progress and level information.
 * 
 * @framework Framework5.1
 * @version 1.0.0
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ChevronUp, Award, Star } from 'lucide-react';

// Demo data - In a real implementation, this would come from the useXpProgress hook
const demoData = {
  currentXp: 520,
  currentLevel: 5,
  nextLevelXp: 750,
  totalXpForCurrentLevel: 400,
  levelName: "Skilled Enthusiast",
  levelBenefits: [
    "Access to tournament creation",
    "Custom profile badge"
  ],
  isKeyLevel: false
};

const XpProgressTracker: React.FC = () => {
  // Demo data calculation - this would normally come from the useXpProgress hook
  const { 
    currentXp, 
    currentLevel, 
    nextLevelXp, 
    totalXpForCurrentLevel,
    levelName,
    levelBenefits,
    isKeyLevel
  } = demoData;
  
  // Calculate progress within current level
  const levelProgress = currentXp - totalXpForCurrentLevel;
  const nextLevelThreshold = nextLevelXp - totalXpForCurrentLevel;
  const progressPercentage = Math.round((levelProgress / nextLevelThreshold) * 100);
  const xpToNextLevel = nextLevelXp - currentXp;

  return (
    <Card className={isKeyLevel ? 'border-amber-300' : ''}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">XP Progress</CardTitle>
            <CardDescription>Level up by playing matches and earning XP</CardDescription>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mb-1">
              <Award className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xl font-bold text-primary">{currentLevel}</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Level Name */}
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-sm">{levelName}</h3>
          {isKeyLevel && (
            <Badge variant="outline" className="bg-amber-100 text-amber-800 text-xs border-amber-200">
              <Star className="h-3 w-3 mr-1 fill-amber-500 text-amber-500" />
              Key Level
            </Badge>
          )}
        </div>
        
        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={progressPercentage} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{levelProgress} / {nextLevelThreshold} XP</span>
            <span>{xpToNextLevel} XP to level {currentLevel + 1}</span>
          </div>
        </div>
        
        {/* Level Benefits */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground">Current Level Benefits:</h4>
          <ul className="text-xs space-y-1 text-muted-foreground">
            {levelBenefits.map((benefit, index) => (
              <li key={index} className="flex items-center">
                <ChevronUp className="h-3 w-3 mr-1 text-primary" /> 
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default XpProgressTracker;