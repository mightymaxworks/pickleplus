/**
 * PKL-278651-COMM-0007 - Enhanced Referral System
 * 
 * A simple page for managing user referrals
 * 
 * @version 1.0.0
 * @framework Framework5.3
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Users, Share2, Copy, Trophy, CheckCircle } from 'lucide-react';

// Simple interface for referral data
interface Referral {
  id: number;
  username: string;
  displayName?: string;
  activityLevel: 'new' | 'casual' | 'active';
  dateReferred: string;
  matchesPlayed: number;
}

// Simple interface for achievement data
interface Achievement {
  id: number;
  name: string;
  description: string;
  xpAwarded: number;
  dateEarned: string;
}

export default function ReferralPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState({
    totalReferrals: 0,
    activeReferrals: 0,
    totalXpEarned: 0,
    nextAchievement: '',
    nextAchievementCount: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  // Generate referral link
  const referralLink = user 
    ? `${window.location.origin}/register?ref=${user.id}` 
    : '';

  // Copy link to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Link copied",
      description: "Referral link copied to clipboard",
    });
  };

  // Load referral data
  useEffect(() => {
    if (!user) return;

    // Function to fetch data
    const fetchReferralData = async () => {
      setIsLoading(true);
      try {
        // Fetch user's referrals
        const referralsRes = await fetch('/api/referrals/my');
        if (referralsRes.ok) {
          const data = await referralsRes.json();
          setReferrals(data.referrals);
        }

        // Fetch achievements
        const achievementsRes = await fetch('/api/referrals/achievements');
        if (achievementsRes.ok) {
          const data = await achievementsRes.json();
          setAchievements(data.achievements);
        }

        // Fetch statistics
        const statsRes = await fetch('/api/referrals/stats');
        if (statsRes.ok) {
          const data = await statsRes.json();
          setStats({
            totalReferrals: data.totalReferrals || 0,
            activeReferrals: data.activeReferrals || 0,
            totalXpEarned: data.totalXpEarned || 0,
            nextAchievement: data.nextAchievement?.name || 'No achievement yet',
            nextAchievementCount: data.nextAchievement?.requiredReferrals || 0
          });
        }
      } catch (error) {
        console.error('Error fetching referral data:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load referral data. Please try again later.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchReferralData();
  }, [user, toast]);

  // Simple function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (!user) {
    return (
      <div className="container max-w-4xl mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Referral Program</CardTitle>
            <CardDescription>
              Please sign in to access the referral program.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Referral Program</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Invite friends and earn XP rewards
        </p>
      </div>

      {/* Referral Link Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Share2 className="mr-2 h-5 w-5" />
            Share Your Referral Link
          </CardTitle>
          <CardDescription>
            Share this link with friends to earn 20-40 XP for each person who signs up
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              value={referralLink}
              readOnly
              className="flex-1"
            />
            <Button onClick={copyToClipboard}>
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats and Next Achievement */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Your Referral Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Total Referrals:</span>
                <span className="font-semibold">{isLoading ? '...' : stats.totalReferrals}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Active Players:</span>
                <span className="font-semibold">{isLoading ? '...' : stats.activeReferrals}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Total XP Earned:</span>
                <span className="font-semibold">{isLoading ? '...' : stats.totalXpEarned} XP</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="mr-2 h-5 w-5" />
              Next Achievement
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Loading...</p>
            ) : (
              <div className="text-center p-2">
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  {stats.nextAchievement}
                </p>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-2">
                  <div 
                    className="bg-green-600 h-2.5 rounded-full" 
                    style={{ width: `${Math.min(100, (stats.totalReferrals / stats.nextAchievementCount) * 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {stats.totalReferrals} / {stats.nextAchievementCount} referrals
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Referral List */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5" />
            People You've Referred
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading your referrals...</p>
          ) : referrals.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <Users className="mx-auto h-10 w-10 mb-2 opacity-30" />
              <p>You haven't referred anyone yet.</p>
              <p className="text-sm mt-1">Share your link to start earning XP!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {referrals.map((referral) => (
                <div 
                  key={referral.id} 
                  className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3"
                >
                  <div>
                    <p className="font-medium">{referral.displayName || referral.username}</p>
                    <p className="text-sm text-gray-500">Joined {formatDate(referral.dateReferred)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {referral.activityLevel === 'active' && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Active
                      </span>
                    )}
                    {referral.activityLevel === 'casual' && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-300">
                        Casual
                      </span>
                    )}
                    {referral.activityLevel === 'new' && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                        New
                      </span>
                    )}
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {referral.matchesPlayed} matches
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="mr-2 h-5 w-5" />
            Your Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading your achievements...</p>
          ) : achievements.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <Trophy className="mx-auto h-10 w-10 mb-2 opacity-30" />
              <p>You haven't earned any achievements yet.</p>
              <p className="text-sm mt-1">Start referring friends to earn achievements!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {achievements.map((achievement) => (
                <div 
                  key={achievement.id} 
                  className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3 last:border-0"
                >
                  <div>
                    <p className="font-medium">{achievement.name}</p>
                    <p className="text-sm text-gray-500">{achievement.description}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      +{achievement.xpAwarded} XP
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(achievement.dateEarned)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}