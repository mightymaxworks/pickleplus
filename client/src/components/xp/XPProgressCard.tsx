import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Trophy, TrendingUp, Star } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { getXPData } from '@/lib/sdk/xpSDK';

interface XPProgressCardProps {
  userId: number;
}

interface XPLevel {
  level: number;
  currentXP: number;
  requiredXP: number;
  nextReward: string;
}

export default function XPProgressCard({ userId }: XPProgressCardProps) {
  const { data: xpData, isLoading, error } = useQuery({
    queryKey: ['/api/xp/total', userId],
    queryFn: () => getXPData(userId),
    refetchInterval: false,
    refetchOnWindowFocus: false,
  });
  
  // This would come from the API, using placeholders for UI development
  const levelInfo: XPLevel = xpData ? {
    level: Math.floor(xpData.total / 1000) + 1,
    currentXP: xpData.total % 1000,
    requiredXP: 1000,
    nextReward: 'Golden Paddle Badge'
  } : {
    level: 0,
    currentXP: 0,
    requiredXP: 1000,
    nextReward: ''
  };
  
  const progressPercentage = Math.round((levelInfo.currentXP / levelInfo.requiredXP) * 100);
  
  // Check if the user has a founding member badge
  const isFoundingMember = xpData?.badges?.includes('founding_member');
  
  // Handle loading and error states
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center">
            <TrendingUp className="h-4 w-4 mr-2" />
            XP Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center">
            <TrendingUp className="h-4 w-4 mr-2" />
            XP Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-red-500">
            Error loading XP data. Please try again.
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex items-center">
          <TrendingUp className="h-4 w-4 mr-2" />
          XP Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center">
            <div className={`h-8 w-8 rounded-full ${isFoundingMember ? 'bg-[#FFD700]' : 'bg-primary'} flex items-center justify-center text-white font-bold text-sm mr-2`}>
              {levelInfo.level}
            </div>
            <div className="font-semibold">Level {levelInfo.level}</div>
            {isFoundingMember && (
              <div className="ml-2 flex items-center text-xs text-[#FFD700] font-medium">
                <Star className="h-3 w-3 mr-0.5 text-[#FFD700]" />
                +10% XP
              </div>
            )}
          </div>
          <div className="text-sm font-medium">
            {levelInfo.currentXP}/{levelInfo.requiredXP} XP
          </div>
        </div>
        
        <Progress 
          value={progressPercentage} 
          className={`h-2 ${isFoundingMember ? 'bg-gray-200' : ''}`}
          indicatorClassName={isFoundingMember 
            ? 'bg-gradient-to-r from-[#FF5722] via-[#FF9800] to-[#FFD700]' 
            : 'bg-gradient-to-r from-[#FF5722] to-[#FF9800]'
          }
        />
        
        <div className="mt-4 flex items-center gap-2 bg-primary/5 p-3 rounded-lg border border-primary/10">
          <div className="bg-primary/20 rounded-full p-1">
            <Trophy className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="text-xs text-gray-500">Next Reward</div>
            <div className="text-sm font-medium">{levelInfo.nextReward}</div>
          </div>
          <div className="ml-auto bg-primary/10 px-2 py-0.5 rounded text-xs font-medium text-primary">
            {1000 - levelInfo.currentXP} XP away
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="bg-gray-50 border border-gray-100 rounded-lg p-2 text-center">
            <div className="text-xs text-gray-500 mb-0.5">Daily XP</div>
            <div className="font-bold text-lg text-primary">42</div>
          </div>
          <div className="bg-gray-50 border border-gray-100 rounded-lg p-2 text-center">
            <div className="text-xs text-gray-500 mb-0.5">Weekly XP</div>
            <div className="font-bold text-lg text-primary">185</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}