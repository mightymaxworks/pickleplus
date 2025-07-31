import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Trophy,
  Zap,
  TrendingUp,
  Users,
  Calendar,
  MapPin,
  Info,
  Plus,
  Award,
  GitCommit,
  Flame,
  ListChecks,
  BarChart3
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import MatchRewardNotification from '@/components/match/MatchRewardNotification';
import { 
  getMatchStats, 
  recordMatch,
  estimateMatchRewards,
  type MatchStats
} from '@/lib/sdk/matchRewardSDK';
import { getCurrentUser, getUserById } from '@/lib/sdk/userSDK';
import { getUserXPSummary } from '@/lib/sdk/xpSDK';
import { getUserRankingSummary } from '@/lib/sdk/rankingSDK';
import { useToast } from '@/hooks/use-toast';

// Form schema for match recording
const matchFormSchema = z.object({
  formatType: z.enum(['singles', 'doubles']),
  scoringSystem: z.enum(['traditional', 'rally']),
  pointsToWin: z.coerce.number().min(1).max(21),
  matchType: z.enum(['casual', 'league', 'tournament']),
  eventTier: z.string().optional(),
  location: z.string().min(1, { message: 'Please enter a location' }),
  playerIds: z.array(z.string()),
  playerScores: z.array(z.coerce.number().min(0)),
  winnerIndex: z.number(),
});

type MatchFormValues = z.infer<typeof matchFormSchema>;

export default function MatchRewardDemo() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showReward, setShowReward] = useState(false);
  const [matchReward, setMatchReward] = useState<any>(null);
  
  // Fetch data
  const { data: currentUser, isLoading: loadingUser } = useQuery({
    queryKey: ['/api/auth/current-user'],
    queryFn: getCurrentUser,
  });
  
  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['/api/match/stats'],
    queryFn: getMatchStats,
  });
  
  const { data: xpSummary, isLoading: loadingXP } = useQuery({
    queryKey: ['/api/xp/total'],
    queryFn: () => getUserXPSummary(1), // Demo user ID
  });
  
  const { data: rankingSummary, isLoading: loadingRanking } = useQuery({
    queryKey: ['/api/ranking/1'],
    queryFn: () => getUserRankingSummary(1), // Demo user ID
  });

  // Form for recording a match
  const form = useForm<MatchFormValues>({
    resolver: zodResolver(matchFormSchema),
    defaultValues: {
      formatType: 'singles',
      scoringSystem: 'traditional',
      pointsToWin: 11,
      matchType: 'casual',
      eventTier: 'club',
      location: 'Pickleball Courts',
      playerIds: ['PickleballPro', 'Opponent'],
      playerScores: [11, 8],
      winnerIndex: 0,
    },
  });

  const isLoading = loadingUser || loadingStats || loadingXP || loadingRanking;

  // Function to handle match recording
  const handleRecordMatch = async (values: MatchFormValues) => {
    try {
      // Convert form values to match data structure
      const matchData = {
        formatType: values.formatType,
        scoringSystem: values.scoringSystem,
        pointsToWin: values.pointsToWin,
        matchType: values.matchType as 'casual' | 'league' | 'tournament', 
        eventTier: values.eventTier,
        location: values.location,
        players: [
          {
            userId: 1, // Current user
            username: values.playerIds[0],
            score: values.playerScores[0],
            isWinner: values.winnerIndex === 0
          },
          {
            userId: 2, // Opponent
            username: values.playerIds[1],
            score: values.playerScores[1],
            isWinner: values.winnerIndex === 1
          }
        ]
      };
      
      // Get reward estimation
      const result = await estimateMatchRewards(matchData);
      
      // Store match reward for display
      setMatchReward(result);
      setShowReward(true);
      
      // Success toast
      toast({
        title: 'Match Recorded',
        description: 'Your match has been recorded successfully!',
      });
      
      // Change to dashboard tab to show match reward
      setActiveTab('reward');
    } catch (error) {
      console.error('Error recording match:', error);
      toast({
        title: 'Error',
        description: 'Failed to record match. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Display user stats
  const userStats = currentUser && stats ? {
    name: currentUser.username,
    isFoundingMember: currentUser.isFoundingMember,
    matches: stats.totalMatches || 0,
    xp: xpSummary?.totalXP || 0,
    level: xpSummary?.level || 1,
    tier: rankingSummary?.tier || 'Bronze',
    points: rankingSummary?.points || 0,
  } : {
    name: 'PickleballPro',
    isFoundingMember: true,
    matches: 12,
    xp: 1250,
    level: 5,
    tier: 'Gold',
    points: 520,
  };

  const handleSimulateMatch = () => {
    const closeMatch = Math.random() > 0.5;
    const tournamentMatch = Math.random() > 0.7;
    
    form.setValue('matchType', tournamentMatch ? 'tournament' : 'casual');
    form.setValue('playerScores', closeMatch ? [11, 9] : [11, 5]);
    form.setValue('eventTier', tournamentMatch ? 'regional' : 'club');
    
    // Trigger form submission
    form.handleSubmit(handleRecordMatch)();
  };

  // Calculate total recent XP
  const totalRecentXP = stats?.recentXP?.reduce((sum, tx) => sum + tx.amount, 0) || 0;
  
  return (
    <div className="container mx-auto p-4 bg-background min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 text-primary flex items-center gap-2">
          <Award className="h-8 w-8" />
          Pickle<span className="text-primary">+</span>
        </h1>
        <p className="text-muted-foreground">Match Reward System Demo</p>
      </div>
      
      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="record" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Record Match
          </TabsTrigger>
          <TabsTrigger value="reward" className="flex items-center gap-2" disabled={!showReward}>
            <Trophy className="h-4 w-4" />
            Rewards
          </TabsTrigger>
        </TabsList>
        
        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* User Profile Card */}
            <Card className="col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Player Profile
                  </span>
                  {userStats.isFoundingMember && (
                    <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 font-medium">
                      Founding Member
                    </span>
                  )}
                </CardTitle>
                <CardDescription>Your pickleball passport</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{userStats.name}</span>
                    <span className="text-sm text-muted-foreground">{userStats.matches} matches</span>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-1">
                        <Zap className="h-4 w-4 text-yellow-500" />
                        <span>Level {userStats.level}</span>
                      </div>
                      <span className="font-medium">{userStats.xp} XP</span>
                    </div>
                    <Progress value={85} className="h-2 bg-yellow-100 dark:bg-yellow-900/20" />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                        <span>{userStats.tier} Tier</span>
                      </div>
                      <span className="font-medium">{userStats.points} points</span>
                    </div>
                    <Progress value={65} className="h-2 bg-blue-100 dark:bg-blue-900/20" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Match Stats Card */}
            <Card className="col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <GitCommit className="h-4 w-4" />
                  Match Statistics
                </CardTitle>
                <CardDescription>Your recent performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="space-y-1">
                      <span className="text-2xl font-bold">{stats?.totalMatches || 0}</span>
                      <p className="text-xs text-muted-foreground">Total Matches</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-2xl font-bold">{stats?.wins || 0}</span>
                      <p className="text-xs text-muted-foreground">Wins</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-2xl font-bold">{stats?.winRate || 0}%</span>
                      <p className="text-xs text-muted-foreground">Win Rate</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Recent Matches</h4>
                    <ul className="space-y-2">
                      {(stats?.recentMatches || []).map((match, i) => (
                        <li key={i} className="text-xs flex justify-between">
                          <span className="text-muted-foreground">{match.opponent}</span>
                          <span className={`font-medium ${match.result === 'W' ? 'text-green-600' : 'text-red-600'}`}>
                            {match.result} · {match.score}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* XP & Ranking Card */}
            <Card className="col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Flame className="h-4 w-4" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Your progression</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="text-sm font-medium flex items-center gap-1">
                        <Zap className="h-4 w-4 text-yellow-500" />
                        Recent XP
                      </h4>
                      <span className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">
                        +{totalRecentXP}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {(stats?.recentXP || []).map((xp, i) => (
                        <div key={i} className="text-xs flex justify-between">
                          <span className="text-muted-foreground">
                            {new Date(xp.timestamp).toLocaleDateString()}
                          </span>
                          <span className="font-medium text-green-600">+{xp.amount}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="text-sm font-medium flex items-center gap-1">
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                        Recent Points
                      </h4>
                      <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                        +{(stats?.recentRanking || []).reduce((sum, tx) => sum + tx.amount, 0)}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {(stats?.recentRanking || []).map((ranking, i) => (
                        <div key={i} className="text-xs flex justify-between">
                          <span className="text-muted-foreground">
                            {new Date(ranking.timestamp).toLocaleDateString()}
                          </span>
                          <span className="font-medium text-blue-600">+{ranking.amount}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={handleSimulateMatch}
                >
                  Simulate Match
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        {/* Record Match Tab */}
        <TabsContent value="record" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ListChecks className="h-5 w-5" />
                Record a Match
              </CardTitle>
              <CardDescription>
                Enter your match details to calculate rewards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleRecordMatch)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      {/* Match Format */}
                      <FormField
                        control={form.control}
                        name="formatType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Match Format</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select match format" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="singles">Singles</SelectItem>
                                <SelectItem value="doubles">Doubles</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Scoring System */}
                      <FormField
                        control={form.control}
                        name="scoringSystem"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Scoring System</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select scoring system" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="traditional">Traditional</SelectItem>
                                <SelectItem value="rally">Rally</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Points to Win */}
                      <FormField
                        control={form.control}
                        name="pointsToWin"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Points to Win</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="space-y-4">
                      {/* Match Type */}
                      <FormField
                        control={form.control}
                        name="matchType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Match Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select match type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="casual">Casual</SelectItem>
                                <SelectItem value="league">League</SelectItem>
                                <SelectItem value="tournament">Tournament</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Tournament Tier */}
                      {form.watch('matchType') === 'tournament' && (
                        <FormField
                          control={form.control}
                          name="eventTier"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tournament Tier</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select tournament tier" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="club">Club</SelectItem>
                                  <SelectItem value="regional">Regional</SelectItem>
                                  <SelectItem value="national">National</SelectItem>
                                  <SelectItem value="international">International</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                      
                      {/* Location */}
                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  {/* Players Section */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Players & Scores</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Player 1 */}
                      <div className="space-y-2 border p-3 rounded-md relative">
                        <div className="absolute -top-2 -right-2">
                          <div className="rounded-full bg-primary text-primary-foreground w-5 h-5 flex items-center justify-center text-xs">
                            1
                          </div>
                        </div>
                        <FormField
                          control={form.control}
                          name="playerIds.0"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Player Name</FormLabel>
                              <FormControl>
                                <Input {...field} disabled />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="playerScores.0"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Score</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="pt-2">
                          <Button
                            type="button"
                            variant={form.watch('winnerIndex') === 0 ? "default" : "outline"}
                            size="sm"
                            className="w-full"
                            onClick={() => form.setValue('winnerIndex', 0)}
                          >
                            {form.watch('winnerIndex') === 0 ? "Winner ✓" : "Set as Winner"}
                          </Button>
                        </div>
                      </div>
                      
                      {/* Player 2 */}
                      <div className="space-y-2 border p-3 rounded-md relative">
                        <div className="absolute -top-2 -right-2">
                          <div className="rounded-full bg-muted text-muted-foreground w-5 h-5 flex items-center justify-center text-xs">
                            2
                          </div>
                        </div>
                        <FormField
                          control={form.control}
                          name="playerIds.1"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Player Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="playerScores.1"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Score</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="pt-2">
                          <Button
                            type="button"
                            variant={form.watch('winnerIndex') === 1 ? "default" : "outline"}
                            size="sm"
                            className="w-full"
                            onClick={() => form.setValue('winnerIndex', 1)}
                          >
                            {form.watch('winnerIndex') === 1 ? "Winner ✓" : "Set as Winner"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full">Record Match & Calculate Rewards</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Rewards Tab */}
        <TabsContent value="reward" className="space-y-6">
          {matchReward && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground mb-2">Winner</div>
                <MatchRewardNotification
                  username={matchReward.rewards.playerOne.userId === currentUser?.id ? currentUser.username : matchReward.rewards.playerOne.userId}
                  isWinner={matchReward.rewards.playerOne.userId === currentUser?.id}
                  xp={matchReward.rewards.playerOne.xp}
                  ranking={matchReward.rewards.playerOne.ranking}
                />
              </div>
              
              <div>
                <div className="text-sm text-muted-foreground mb-2">Opponent</div>
                <MatchRewardNotification
                  username={matchReward.rewards.playerTwo.userId === currentUser?.id ? currentUser.username : matchReward.rewards.playerTwo.userId}
                  isWinner={matchReward.rewards.playerTwo.userId === currentUser?.id}
                  xp={matchReward.rewards.playerTwo.xp}
                  ranking={matchReward.rewards.playerTwo.ranking}
                />
              </div>
            </div>
          )}
          
          <div className="flex justify-center">
            <Button onClick={() => setActiveTab('dashboard')}>
              Return to Dashboard
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}