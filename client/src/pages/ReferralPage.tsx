/**
 * PKL-278651-COMM-0007 - Enhanced Referral System
 * Referral Page UI Component
 * 
 * @version 1.0.0
 * @framework Framework5.3
 */

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

// UI Components
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Share } from 'lucide-react';

// Types
type Referral = {
  id: number;
  username: string;
  displayName?: string;
  activityLevel: 'new' | 'casual' | 'active';
  dateReferred: string;
  matchesPlayed: number;
};

type Achievement = {
  id: number;
  name: string;
  description: string;
  xpAwarded: number;
  dateEarned: string;
};

type ReferralStats = {
  totalReferrals: number;
  activeReferrals: number;
  totalXpEarned: number;
  nextAchievement: {
    name: string;
    requiredReferrals: number;
  } | null;
};

export default function ReferralPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [referralLink, setReferralLink] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // Queries for fetching referral data
  const { data: referrals = [] } = useQuery<Referral[]>({
    queryKey: ['/api/referrals'],
    enabled: !!user,
  });

  const { data: achievements = [] } = useQuery<Achievement[]>({
    queryKey: ['/api/referrals/achievements'],
    enabled: !!user,
  });

  const { data: stats } = useQuery<ReferralStats>({
    queryKey: ['/api/referrals/stats'],
    enabled: !!user,
  });

  // Generate and fetch referral link
  useEffect(() => {
    const fetchReferralLink = async () => {
      try {
        const res = await apiRequest('GET', '/api/referrals/generate-link');
        const data = await res.json();
        setReferralLink(data.referralLink);
      } catch (error) {
        console.error('Error fetching referral link:', error);
      }
    };

    if (user) {
      fetchReferralLink();
    }
  }, [user]);

  // Copy referral link to clipboard
  const copyLinkToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      toast({
        title: 'Link copied!',
        description: 'Referral link copied to clipboard',
      });
    } catch (err) {
      console.error('Failed to copy: ', err);
      toast({
        title: 'Copy failed',
        description: 'Could not copy link to clipboard',
        variant: 'destructive',
      });
    }
  };

  // Calculate progress to next achievement
  const calculateProgress = (): number => {
    if (!stats || !stats.nextAchievement) return 100; // Max progress if no next achievement
    
    const { totalReferrals } = stats;
    const { requiredReferrals } = stats.nextAchievement;
    
    // Find previous milestone
    let previousMilestone = 0;
    if (requiredReferrals === 5) previousMilestone = 1;
    else if (requiredReferrals === 15) previousMilestone = 5;
    else if (requiredReferrals === 30) previousMilestone = 15;
    else if (requiredReferrals === 50) previousMilestone = 30;
    
    // Calculate progress between previous milestone and next one
    const progressRatio = (totalReferrals - previousMilestone) / (requiredReferrals - previousMilestone);
    return Math.min(100, Math.max(0, progressRatio * 100));
  };

  return (
    <div className="container max-w-6xl mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Referral Center</h1>
      <p className="text-muted-foreground">
        Share Pickle+ with friends and earn rewards! Track your referrals and achievements.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Referral Overview Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Your Referral Link</CardTitle>
            <CardDescription>
              Share this link with friends to invite them to Pickle+
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="flex-1 overflow-hidden bg-secondary rounded-md p-3">
                <p className="text-sm font-mono truncate">{referralLink}</p>
              </div>
              <Button onClick={copyLinkToClipboard} variant="secondary">
                <Share className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </div>
          </CardContent>
          <CardFooter>
            <div className="text-sm text-muted-foreground">
              When friends sign up with your link, you'll both earn rewards!
            </div>
          </CardFooter>
        </Card>

        {/* Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle>Your Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Referrals</p>
                <p className="text-2xl font-bold">{stats?.totalReferrals || 0}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Active Players</p>
                <p className="text-2xl font-bold">{stats?.activeReferrals || 0}</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total XP Earned</p>
              <p className="text-2xl font-bold">{stats?.totalXpEarned || 0} XP</p>
            </div>

            {stats?.nextAchievement && (
              <div className="space-y-2 pt-4">
                <div className="flex justify-between">
                  <p className="text-sm font-medium">Next Achievement</p>
                  <p className="text-sm">{stats.totalReferrals}/{stats.nextAchievement.requiredReferrals}</p>
                </div>
                <div className="space-y-1">
                  <Progress value={calculateProgress()} />
                  <p className="text-sm text-muted-foreground">{stats.nextAchievement.name}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Referrals and Achievements */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 w-[400px]">
          <TabsTrigger value="overview">Your Referrals</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        {/* Referrals Tab */}
        <TabsContent value="overview" className="space-y-4">
          {referrals.length === 0 ? (
            <Alert>
              <AlertTitle>No referrals yet</AlertTitle>
              <AlertDescription>
                Share your referral link to start earning rewards!
              </AlertDescription>
            </Alert>
          ) : (
            <div className="rounded-md border">
              <div className="grid grid-cols-12 p-4 text-sm font-medium bg-muted">
                <div className="col-span-5">User</div>
                <div className="col-span-3">Joined</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Matches</div>
              </div>
              <div className="divide-y">
                {referrals.map((referral) => (
                  <div key={referral.id} className="grid grid-cols-12 p-4 items-center">
                    <div className="col-span-5 flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {referral.displayName?.charAt(0) || referral.username.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{referral.displayName || referral.username}</p>
                        <p className="text-sm text-muted-foreground">@{referral.username}</p>
                      </div>
                    </div>
                    <div className="col-span-3 text-sm">
                      {new Date(referral.dateReferred).toLocaleDateString()}
                    </div>
                    <div className="col-span-2">
                      <Badge
                        variant={
                          referral.activityLevel === 'active'
                            ? 'default'
                            : referral.activityLevel === 'casual'
                            ? 'secondary'
                            : 'outline'
                        }
                      >
                        {referral.activityLevel}
                      </Badge>
                    </div>
                    <div className="col-span-2 text-sm">{referral.matchesPlayed}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-4">
          {achievements.length === 0 ? (
            <Alert>
              <AlertTitle>No achievements yet</AlertTitle>
              <AlertDescription>
                Refer friends to earn achievements and rewards!
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {achievements.map((achievement) => (
                <Card key={achievement.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">{achievement.name}</CardTitle>
                      <Badge variant="outline">+{achievement.xpAwarded} XP</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Earned on {new Date(achievement.dateEarned).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Next Achievement Section */}
          {stats?.nextAchievement && (
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle className="text-lg">Next Achievement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="font-medium">{stats.nextAchievement.name}</p>
                  <Badge variant="outline">Locked</Badge>
                </div>
                <Progress value={calculateProgress()} className="my-2" />
                <p className="text-sm text-muted-foreground">
                  Refer {stats.nextAchievement.requiredReferrals - stats.totalReferrals} more 
                  {stats.nextAchievement.requiredReferrals - stats.totalReferrals === 1 ? ' friend' : ' friends'} to unlock
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}