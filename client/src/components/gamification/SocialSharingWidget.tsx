import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  Share2, 
  Trophy, 
  Users, 
  Target, 
  TrendingUp, 
  Medal, 
  Crown,
  Copy,
  Check,
  MessageSquare,
  Heart
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Friend {
  id: string;
  name: string;
  avatar?: string;
  currentRating: number;
  badgeCount: number;
  lastActive: Date;
  isOnline: boolean;
}

interface LeaderboardEntry {
  rank: number;
  user: Friend;
  score: number;
  trend: 'up' | 'down' | 'stable';
  categoryBadges: number;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  timeLimit: string;
  participants: number;
  reward: string;
}

interface SocialSharingWidgetProps {
  userRating: number;
  userBadgeCount: number;
  className?: string;
}

export default function SocialSharingWidget({
  userRating,
  userBadgeCount,
  className = ''
}: SocialSharingWidgetProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('friends');
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  // Mock data for social features
  const friends: Friend[] = [
    {
      id: '1',
      name: 'Sarah Chen',
      currentRating: 3.8,
      badgeCount: 12,
      lastActive: new Date(),
      isOnline: true
    },
    {
      id: '2', 
      name: 'Mike Rodriguez',
      currentRating: 3.2,
      badgeCount: 8,
      lastActive: new Date(Date.now() - 3600000),
      isOnline: false
    },
    {
      id: '3',
      name: 'Jennifer Park',
      currentRating: 4.1,
      badgeCount: 15,
      lastActive: new Date(Date.now() - 1800000),
      isOnline: true
    }
  ];

  const leaderboard: LeaderboardEntry[] = [
    {
      rank: 1,
      user: friends[2],
      score: 2847,
      trend: 'up',
      categoryBadges: 15
    },
    {
      rank: 2,
      user: { ...friends[0], name: 'You' },
      score: 2156,
      trend: 'up',
      categoryBadges: userBadgeCount
    },
    {
      rank: 3,
      user: friends[0],
      score: 1923,
      trend: 'stable',
      categoryBadges: 12
    },
    {
      rank: 4,
      user: friends[1],
      score: 1745,
      trend: 'down',
      categoryBadges: 8
    }
  ];

  const challenges: Challenge[] = [
    {
      id: '1',
      title: 'Week Warrior Challenge',
      description: 'Play matches 7 days in a row',
      targetValue: 7,
      currentValue: 5,
      timeLimit: '2 days left',
      participants: 23,
      reward: '+100 Pickle Points, Week Warrior Badge'
    },
    {
      id: '2',
      title: 'Rating Climb',
      description: 'Improve your rating by 0.5 points',
      targetValue: 0.5,
      currentValue: 0.3,
      timeLimit: '1 week left',
      participants: 156,
      reward: '+200 Pickle Points, Climber Badge'
    }
  ];

  const handleShare = async (platform: 'twitter' | 'facebook' | 'instagram' | 'copy') => {
    const shareText = `Just reached ${userRating} PCP rating and unlocked ${userBadgeCount} badges in Pickle+! 🏆 Join me on my pickleball journey.`;
    const shareUrl = window.location.origin;

    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`);
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`);
        break;
      case 'instagram':
        // Instagram doesn't support direct sharing, copy to clipboard
        await navigator.clipboard.writeText(shareText);
        setCopiedToClipboard(true);
        setTimeout(() => setCopiedToClipboard(false), 2000);
        break;
      case 'copy':
        await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
        setCopiedToClipboard(true);
        setTimeout(() => setCopiedToClipboard(false), 2000);
        break;
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-3 h-3 text-green-500" />;
      case 'down':
        return <TrendingUp className="w-3 h-3 text-red-500 rotate-180" />;
      default:
        return <div className="w-3 h-3 rounded-full bg-gray-300" />;
    }
  };

  return (
    <>
      <Card className={`${className}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-lg">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-green-500" />
              Social Hub
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowShareDialog(true)}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share Progress
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="friends">Friends</TabsTrigger>
              <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
              <TabsTrigger value="challenges">Challenges</TabsTrigger>
            </TabsList>

            <TabsContent value="friends" className="space-y-3 mt-4">
              {friends.map(friend => (
                <div key={friend.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={friend.avatar} />
                        <AvatarFallback>{friend.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                        friend.isOnline ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{friend.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {friend.currentRating} rating • {friend.badgeCount} badges
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Target className="w-4 h-4 mr-2" />
                    Challenge
                  </Button>
                </div>
              ))}
              
              <Button variant="outline" className="w-full mt-3">
                <Users className="w-4 h-4 mr-2" />
                Find More Friends
              </Button>
            </TabsContent>

            <TabsContent value="leaderboard" className="space-y-3 mt-4">
              <div className="space-y-2">
                {leaderboard.map(entry => (
                  <div key={entry.rank} className={`flex items-center gap-3 p-3 rounded-lg ${
                    entry.user.name === 'You' ? 'bg-blue-50 border-blue-200' : 'border'
                  }`}>
                    <div className="flex items-center justify-center w-8 h-8">
                      {entry.rank === 1 && <Crown className="w-5 h-5 text-yellow-500" />}
                      {entry.rank === 2 && <Medal className="w-5 h-5 text-gray-400" />}
                      {entry.rank === 3 && <Medal className="w-5 h-5 text-amber-600" />}
                      {entry.rank > 3 && (
                        <span className="text-sm font-medium text-gray-500">#{entry.rank}</span>
                      )}
                    </div>
                    
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="text-xs">
                        {entry.user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{entry.user.name}</p>
                        {getTrendIcon(entry.trend)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {entry.score} points • {entry.categoryBadges} badges
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="text-center text-xs text-muted-foreground pt-2">
                Weekly leaderboard • Resets in 3 days
              </div>
            </TabsContent>

            <TabsContent value="challenges" className="space-y-3 mt-4">
              {challenges.map(challenge => (
                <div key={challenge.id} className="p-3 rounded-lg border space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-sm">{challenge.title}</h4>
                      <p className="text-xs text-muted-foreground">{challenge.description}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {challenge.timeLimit}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>{challenge.currentValue} / {challenge.targetValue}</span>
                      <span>{Math.round((challenge.currentValue / challenge.targetValue) * 100)}%</span>
                    </div>
                    <Progress value={(challenge.currentValue / challenge.targetValue) * 100} className="h-2" />
                  </div>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {challenge.participants} participants
                    </span>
                    <span className="text-green-600 font-medium">{challenge.reward}</span>
                  </div>
                </div>
              ))}
              
              <Button variant="outline" className="w-full mt-3">
                <Trophy className="w-4 h-4 mr-2" />
                View All Challenges
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Your Progress</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
              <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
              <p className="font-medium">{userRating} PCP Rating</p>
              <p className="text-sm text-muted-foreground">{userBadgeCount} Badges Unlocked</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => handleShare('twitter')}
                className="flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                Twitter
              </Button>
              <Button
                variant="outline"
                onClick={() => handleShare('facebook')}
                className="flex items-center gap-2"
              >
                <Heart className="w-4 h-4" />
                Facebook
              </Button>
              <Button
                variant="outline"
                onClick={() => handleShare('instagram')}
                className="flex items-center gap-2"
              >
                <Trophy className="w-4 h-4" />
                Instagram
              </Button>
              <Button
                variant="outline"
                onClick={() => handleShare('copy')}
                className="flex items-center gap-2"
              >
                {copiedToClipboard ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedToClipboard ? 'Copied!' : 'Copy Link'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}