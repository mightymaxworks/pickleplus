/**
 * PKL-278651-BOUNCE-0004-GAME - Bounce XP Integration Component
 * 
 * Displays the connection between Bounce testing activities and XP rewards,
 * showing users how their testing efforts contribute to their overall XP.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Award, Zap, CheckCircle, Clock, Activity } from 'lucide-react';
import { format } from 'date-fns';

interface XpSummary {
  totalBounceXp: number;
  totalUserXp: number;
  xpFromFindings: number;
  xpFromVerifications: number;
  xpFromAchievements: number;
  bounceXpPercentage: number;
  recentTransactions: Array<{
    id: number;
    userId: number;
    amount: number;
    source: string;
    sourceType: string;
    description: string;
    createdAt: string;
  }>;
}

/**
 * BounceXpIntegration component
 * Displays how Bounce testing activities contribute to the user's XP
 */
export const BounceXpIntegration: React.FC = () => {
  const [activeTab, setActiveTab] = useState('summary');
  
  // Fetch the user's XP summary from Bounce activities
  const { data, isLoading, error } = useQuery<XpSummary>({
    queryKey: ['/api/bounce/gamification/xp-summary'],
    retry: 1
  });
  
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-8 w-1/3" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-2/3" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-500">
            <AlertCircle className="h-5 w-5" />
            Error Loading XP Integration
          </CardTitle>
          <CardDescription>
            Could not load Bounce XP integration data. Please try again later.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Error details: {(error as Error).message}
          </p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  if (!data) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>No XP Data Available</CardTitle>
          <CardDescription>
            You haven't earned any XP from Bounce testing activities yet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Start participating in testing activities to earn XP.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-6 w-6 text-yellow-500" />
          Bounce XP Integration
        </CardTitle>
        <CardDescription>
          See how your Bounce testing activities contribute to your overall XP
        </CardDescription>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="px-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="breakdown">XP Breakdown</TabsTrigger>
            <TabsTrigger value="history">Recent Activity</TabsTrigger>
          </TabsList>
        </div>
        
        <CardContent className="pt-6">
          <TabsContent value="summary" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-semibold">Total XP from Bounce</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{data.totalBounceXp}</span>
                  <span className="text-sm text-muted-foreground">XP points</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {data.bounceXpPercentage}% of your total {data.totalUserXp} XP
                </p>
                <Progress 
                  className="mt-3" 
                  value={data.bounceXpPercentage} 
                  max={100}
                />
              </div>
              
              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-semibold">XP Distribution</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <AlertCircle className="h-4 w-4 text-red-500" /> Findings
                    </span>
                    <span className="font-medium">{data.xpFromFindings} XP</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 text-green-500" /> Verifications
                    </span>
                    <span className="font-medium">{data.xpFromVerifications} XP</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <Award className="h-4 w-4 text-yellow-500" /> Achievements
                    </span>
                    <span className="font-medium">{data.xpFromAchievements} XP</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-blue-500" /> Participation
                    </span>
                    <span className="font-medium">
                      {data.totalBounceXp - data.xpFromFindings - data.xpFromVerifications - data.xpFromAchievements} XP
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="rounded-lg border p-4">
              <h3 className="mb-3 font-semibold">XP Benefits</h3>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                <div className="rounded-md bg-primary/10 p-3">
                  <div className="mb-1 font-medium">Faster Level Progression</div>
                  <p className="text-sm text-muted-foreground">Testing activities provide a consistent source of XP</p>
                </div>
                <div className="rounded-md bg-primary/10 p-3">
                  <div className="mb-1 font-medium">Exclusive Rewards</div>
                  <p className="text-sm text-muted-foreground">Unlock special items by finding critical issues</p>
                </div>
                <div className="rounded-md bg-primary/10 p-3">
                  <div className="mb-1 font-medium">Community Recognition</div>
                  <p className="text-sm text-muted-foreground">Appear on the Bounce leaderboard for your contributions</p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="breakdown" className="space-y-4">
            <div className="rounded-lg border p-4">
              <h3 className="mb-3 font-semibold">XP By Activity Type</h3>
              <div className="space-y-4">
                <div>
                  <div className="mb-1 flex justify-between">
                    <span className="text-sm font-medium">Findings ({Math.round(data.xpFromFindings / data.totalBounceXp * 100)}%)</span>
                    <span className="text-sm text-muted-foreground">{data.xpFromFindings} XP</span>
                  </div>
                  <Progress value={data.xpFromFindings} max={data.totalBounceXp} className="h-2" />
                </div>
                <div>
                  <div className="mb-1 flex justify-between">
                    <span className="text-sm font-medium">Verifications ({Math.round(data.xpFromVerifications / data.totalBounceXp * 100)}%)</span>
                    <span className="text-sm text-muted-foreground">{data.xpFromVerifications} XP</span>
                  </div>
                  <Progress value={data.xpFromVerifications} max={data.totalBounceXp} className="h-2" />
                </div>
                <div>
                  <div className="mb-1 flex justify-between">
                    <span className="text-sm font-medium">Achievements ({Math.round(data.xpFromAchievements / data.totalBounceXp * 100)}%)</span>
                    <span className="text-sm text-muted-foreground">{data.xpFromAchievements} XP</span>
                  </div>
                  <Progress value={data.xpFromAchievements} max={data.totalBounceXp} className="h-2" />
                </div>
                <div>
                  <div className="mb-1 flex justify-between">
                    <span className="text-sm font-medium">
                      Participation ({Math.round((data.totalBounceXp - data.xpFromFindings - data.xpFromVerifications - data.xpFromAchievements) / data.totalBounceXp * 100)}%)
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {data.totalBounceXp - data.xpFromFindings - data.xpFromVerifications - data.xpFromAchievements} XP
                    </span>
                  </div>
                  <Progress 
                    value={data.totalBounceXp - data.xpFromFindings - data.xpFromVerifications - data.xpFromAchievements} 
                    max={data.totalBounceXp} 
                    className="h-2" 
                  />
                </div>
              </div>
            </div>
            
            <div className="rounded-lg border p-4">
              <h3 className="mb-3 font-semibold">XP Rewards by Activity</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex justify-between rounded-md border p-2">
                    <span className="text-sm">Finding (Critical)</span>
                    <Badge variant="outline">25 XP</Badge>
                  </div>
                  <div className="flex justify-between rounded-md border p-2">
                    <span className="text-sm">Finding (High)</span>
                    <Badge variant="outline">15 XP</Badge>
                  </div>
                  <div className="flex justify-between rounded-md border p-2">
                    <span className="text-sm">Finding (Medium)</span>
                    <Badge variant="outline">10 XP</Badge>
                  </div>
                  <div className="flex justify-between rounded-md border p-2">
                    <span className="text-sm">Finding (Low)</span>
                    <Badge variant="outline">5 XP</Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between rounded-md border p-2">
                    <span className="text-sm">Verification (Critical/High)</span>
                    <Badge variant="outline">5 XP</Badge>
                  </div>
                  <div className="flex justify-between rounded-md border p-2">
                    <span className="text-sm">Verification (Other)</span>
                    <Badge variant="outline">3 XP</Badge>
                  </div>
                  <div className="flex justify-between rounded-md border p-2">
                    <span className="text-sm">Achievements</span>
                    <Badge variant="outline">5-25 XP</Badge>
                  </div>
                  <div className="flex justify-between rounded-md border p-2">
                    <span className="text-sm">Participation</span>
                    <Badge variant="outline">1 XP / 5 min</Badge>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="history">
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Activity</TableHead>
                    <TableHead>XP</TableHead>
                    <TableHead className="hidden md:table-cell">Type</TableHead>
                    <TableHead className="hidden md:table-cell">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recentTransactions.length > 0 ? (
                    data.recentTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span>{transaction.description}</span>
                            <span className="md:hidden text-xs text-muted-foreground">
                              {format(new Date(transaction.createdAt), 'MMM d, yyyy')}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-primary/10">
                            +{transaction.amount} XP
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge variant="secondary">
                            {transaction.sourceType}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">
                          {format(new Date(transaction.createdAt), 'MMM d, yyyy h:mm a')}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                        No recent XP transactions from Bounce activities
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </CardContent>
      </Tabs>
      
      <CardFooter className="border-t px-6 py-4">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {data.totalBounceXp > 0 
                ? `Last activity: ${data.recentTransactions[0] 
                    ? format(new Date(data.recentTransactions[0].createdAt), 'MMM d, yyyy') 
                    : 'Unknown'}`
                : 'No activity yet'}
            </span>
          </div>
          <Button variant="outline" size="sm">
            View All Activities
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default BounceXpIntegration;