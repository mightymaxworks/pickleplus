/**
 * PKL-278651-BOUNCE-0004-GAME - Bounce XP Integration Component
 * 
 * This component shows the integration between Bounce testing activities and the 
 * XP system, displaying XP earned from Bounce testing and achievements.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter 
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Award, Star, TrendingUp, Zap, AlertCircle, Trophy } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

// Types
interface XpSummary {
  totalBounceXp: number;
  totalUserXp: number;
  xpFromFindings: number;
  xpFromVerifications: number;
  xpFromAchievements: number;
  bounceXpPercentage: number;
  recentTransactions: Array<{
    id: number;
    amount: number;
    source: string;
    sourceType: string;
    description: string;
    createdAt: string;
  }>;
}

interface XpSummaryResponse {
  success: boolean;
  data: XpSummary;
  error?: string;
}

/**
 * BounceXpIntegration Component
 */
const BounceXpIntegration: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState('summary');
  
  // Query XP summary data
  const {
    data: xpSummaryData,
    isLoading: isLoadingXpSummary,
    error: xpSummaryError
  } = useQuery<XpSummaryResponse>({
    queryKey: ['/api/bounce/gamification/xp-summary'],
    refetchOnWindowFocus: false
  });

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format XP source for display
  const formatSource = (source: string, sourceType: string) => {
    switch (sourceType) {
      case 'finding':
        return 'Finding Discovery';
      case 'verification':
        return 'Finding Verification';
      case 'achievement':
        return 'Bounce Achievement';
      case 'participation':
        return 'Testing Participation';
      default:
        return source.split('_').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }
  };

  // Get color based on XP source
  const getSourceColor = (sourceType: string) => {
    switch (sourceType) {
      case 'finding':
        return 'bg-red-100 text-red-800';
      case 'verification':
        return 'bg-green-100 text-green-800';
      case 'achievement':
        return 'bg-blue-100 text-blue-800';
      case 'participation':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get icon based on XP source
  const getSourceIcon = (sourceType: string) => {
    switch (sourceType) {
      case 'finding':
        return <AlertCircle className="h-4 w-4" />;
      case 'verification':
        return <Zap className="h-4 w-4" />;
      case 'achievement':
        return <Award className="h-4 w-4" />;
      case 'participation':
        return <Star className="h-4 w-4" />;
      default:
        return <TrendingUp className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6" />
            Bounce XP Integration
          </CardTitle>
          <CardDescription>
            Track the XP you've earned from Bounce testing activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="summary">XP Summary</TabsTrigger>
              <TabsTrigger value="history">XP History</TabsTrigger>
            </TabsList>
            
            {/* Summary Tab */}
            <TabsContent value="summary" className="pt-4">
              {isLoadingXpSummary ? (
                <div className="space-y-4">
                  <Skeleton className="h-20 w-full" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Skeleton className="h-28 w-full" />
                    <Skeleton className="h-28 w-full" />
                    <Skeleton className="h-28 w-full" />
                  </div>
                </div>
              ) : xpSummaryError ? (
                <div className="p-4 text-red-500 bg-red-50 rounded-md">
                  Error loading XP summary. Please try again later.
                </div>
              ) : xpSummaryData?.success ? (
                <>
                  {/* Main XP Progress */}
                  <div className="bg-slate-50 p-4 rounded-lg mb-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                      <div>
                        <h3 className="text-lg font-semibold">Bounce Contribution to Total XP</h3>
                        <p className="text-sm text-slate-600">
                          {xpSummaryData.data.totalBounceXp} of {xpSummaryData.data.totalUserXp} total XP ({xpSummaryData.data.bounceXpPercentage}%)
                        </p>
                      </div>
                      <div className="w-full md:w-1/2 space-y-2">
                        <Progress value={xpSummaryData.data.bounceXpPercentage} className="h-2" />
                      </div>
                    </div>
                  </div>
                  
                  {/* XP Breakdown Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {/* Findings XP */}
                    <Card className="border-red-100">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-red-500" />
                          Findings XP
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="flex items-end justify-between">
                          <span className="text-2xl font-bold">{xpSummaryData.data.xpFromFindings}</span>
                          <Badge variant="outline" className="bg-red-50 text-red-700">
                            {Math.round((xpSummaryData.data.xpFromFindings / xpSummaryData.data.totalBounceXp) * 100)}% of Bounce XP
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-500 mt-1">Earned by discovering issues</p>
                      </CardContent>
                    </Card>
                    
                    {/* Verification XP */}
                    <Card className="border-green-100">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Zap className="h-4 w-4 text-green-500" />
                          Verification XP
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="flex items-end justify-between">
                          <span className="text-2xl font-bold">{xpSummaryData.data.xpFromVerifications}</span>
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            {Math.round((xpSummaryData.data.xpFromVerifications / xpSummaryData.data.totalBounceXp) * 100)}% of Bounce XP
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-500 mt-1">Earned by verifying findings</p>
                      </CardContent>
                    </Card>
                    
                    {/* Achievements XP */}
                    <Card className="border-blue-100">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-blue-500" />
                          Achievement XP
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="flex items-end justify-between">
                          <span className="text-2xl font-bold">{xpSummaryData.data.xpFromAchievements}</span>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            {Math.round((xpSummaryData.data.xpFromAchievements / xpSummaryData.data.totalBounceXp) * 100)}% of Bounce XP
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-500 mt-1">Earned through achievements</p>
                      </CardContent>
                    </Card>
                  </div>
                </>
              ) : (
                <div className="p-4 text-amber-500 bg-amber-50 rounded-md">
                  No XP data available. Start testing with Bounce to earn XP!
                </div>
              )}
            </TabsContent>
            
            {/* History Tab */}
            <TabsContent value="history" className="pt-4">
              {isLoadingXpSummary ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : xpSummaryError ? (
                <div className="p-4 text-red-500 bg-red-50 rounded-md">
                  Error loading XP history. Please try again later.
                </div>
              ) : xpSummaryData?.success && xpSummaryData.data.recentTransactions.length > 0 ? (
                <div className="space-y-3">
                  {xpSummaryData.data.recentTransactions.map((transaction) => (
                    <Card key={transaction.id} className="border-slate-100">
                      <CardContent className="py-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${getSourceColor(transaction.sourceType).replace('bg-', 'bg-').replace('text-', '')}`}>
                              {getSourceIcon(transaction.sourceType)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{formatSource(transaction.source, transaction.sourceType)}</span>
                                <Badge className={`${getSourceColor(transaction.sourceType)}`}>
                                  +{transaction.amount} XP
                                </Badge>
                              </div>
                              <p className="text-sm text-slate-500">{transaction.description}</p>
                            </div>
                          </div>
                          <div className="text-xs text-slate-400">
                            {formatDate(transaction.createdAt)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  <div className="text-center pt-2">
                    <a href="/xp-dashboard" className="text-sm text-primary hover:underline">
                      View all XP history
                    </a>
                  </div>
                </div>
              ) : (
                <div className="p-4 text-amber-500 bg-amber-50 rounded-md">
                  No XP history available. Start testing with Bounce to earn XP!
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="text-sm text-slate-500 border-t pt-4">
          <div className="flex flex-col space-y-1">
            <p>Earning Bounce XP contributes to your overall XP level and unlocks platform-wide rewards.</p>
            <a href="/xp-dashboard" className="text-primary hover:underline">
              View your complete XP dashboard
            </a>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default BounceXpIntegration;