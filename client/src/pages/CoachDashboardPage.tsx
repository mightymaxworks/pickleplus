/**
 * Enhanced Coach Dashboard Page
 * PKL-278651-PCP-BASIC-TIER - Comprehensive Basic Tier Implementation
 * 
 * Full-featured dashboard for all PCP-certified coaches with tier-specific features
 */

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  DollarSign, 
  Calendar, 
  TrendingUp, 
  Star, 
  MessageCircle,
  Award,
  Clock,
  Target,
  Sparkles,
  Crown,
  ArrowUpRight,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Settings,
  BookOpen,
  Video
} from 'lucide-react';

// PCP Level Configuration
const PCP_LEVEL_CONFIG = {
  1: { name: 'Entry Coach', badge: '🥉', commission: 15, color: 'bg-amber-100 text-amber-800' },
  2: { name: 'Certified Coach', badge: '🥈', commission: 13, color: 'bg-gray-100 text-gray-800' },
  3: { name: 'Advanced Coach', badge: '🥇', commission: 12, color: 'bg-yellow-100 text-yellow-800' },
  4: { name: 'Master Coach', badge: '💎', commission: 10, color: 'bg-blue-100 text-blue-800' },
  5: { name: 'Grand Master', badge: '👑', commission: 8, color: 'bg-purple-100 text-purple-800' }
};

interface DashboardStats {
  totalSessions: number;
  totalEarnings: number;
  averageRating: number;
  activeStudents: number;
  thisMonthSessions: number;
  thisMonthEarnings: number;
}

interface CoachProfile {
  pcpLevel: number;
  pcpBadge: string;
  pcpName: string;
  subscriptionTier: 'basic' | 'premium';
}

export default function CoachDashboardPage() {
  // Fetch coach dashboard data
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['/api/pcp-coach/dashboard'],
    retry: false
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
        <div className="container max-w-7xl py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-lg font-medium">Loading your dashboard...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const profile: CoachProfile = (dashboardData as any)?.profile || { pcpLevel: 1, pcpBadge: '🥉', pcpName: 'Entry Coach', subscriptionTier: 'basic' };
  const stats: DashboardStats = (dashboardData as any)?.stats || { 
    totalSessions: 0, 
    totalEarnings: 0, 
    averageRating: 0, 
    activeStudents: 0, 
    thisMonthSessions: 0, 
    thisMonthEarnings: 0 
  };

  const pcpConfig = PCP_LEVEL_CONFIG[profile.pcpLevel as keyof typeof PCP_LEVEL_CONFIG];
  const isPremium = profile.subscriptionTier === 'premium';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
      <div className="container max-w-7xl py-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Coach Dashboard
            </h1>
            <p className="text-lg text-muted-foreground mt-1">
              Welcome back! Here's your coaching overview
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge className={`${pcpConfig.color} text-lg px-4 py-2`}>
              {pcpConfig.badge} {pcpConfig.name}
            </Badge>
            {isPremium ? (
              <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2">
                <Crown className="h-4 w-4 mr-1" />
                Premium
              </Badge>
            ) : (
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                <Sparkles className="h-4 w-4 mr-2" />
                Upgrade to Premium
              </Button>
            )}
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Total Sessions</p>
                  <p className="text-3xl font-bold text-blue-700">{stats.totalSessions}</p>
                  <p className="text-blue-500 text-sm">+{stats.thisMonthSessions} this month</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-600 text-sm font-medium">Total Earnings</p>
                  <p className="text-3xl font-bold text-emerald-700">${(stats.totalEarnings / 100).toFixed(0)}</p>
                  <p className="text-emerald-500 text-sm">+${(stats.thisMonthEarnings / 100).toFixed(0)} this month</p>
                </div>
                <DollarSign className="h-8 w-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-600 text-sm font-medium">Average Rating</p>
                  <p className="text-3xl font-bold text-yellow-700">{(stats.averageRating / 20).toFixed(1)}</p>
                  <p className="text-yellow-500 text-sm">out of 5.0 stars</p>
                </div>
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">Active Students</p>
                  <p className="text-3xl font-bold text-purple-700">{stats.activeStudents}</p>
                  <p className="text-purple-500 text-sm">this month</p>
                </div>
                <Target className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="tools">Tools</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Comprehensive Basic Tier Features */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                    Your Platform Access
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                      <h4 className="font-semibold text-emerald-800 mb-2">Comprehensive Basic Tier</h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-emerald-600" />
                          <span>Unlimited Sessions</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-emerald-600" />
                          <span>Full Coach Profile</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-emerald-600" />
                          <span>Basic Analytics</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-emerald-600" />
                          <span>Student Messaging</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-emerald-600" />
                          <span>Standard Payments</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-emerald-600" />
                          <span>Mobile App Access</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                      <h4 className="font-semibold text-purple-800 mb-2">Commission Rate</h4>
                      <div className="flex items-center justify-between">
                        <span className="text-purple-600">Platform Commission</span>
                        <Badge className="bg-purple-100 text-purple-800">{pcpConfig.commission}%</Badge>
                      </div>
                      <p className="text-sm text-purple-600 mt-1">
                        You earn ${(95 * (100 - pcpConfig.commission) / 100).toFixed(0)} per $95 session
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Premium Upgrade Card */}
              {!isPremium && (
                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-purple-600" />
                      Premium Business Tools
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-purple-700">
                        Scale your coaching business with advanced automation and analytics
                      </p>
                      
                      <div className="space-y-2">
                        {[
                          'Automated Wise payouts',
                          'Advanced analytics dashboard',
                          'Marketing & growth tools',
                          'Video session capabilities',
                          'Custom package creation',
                          'Priority customer support'
                        ].map((feature, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <Crown className="h-4 w-4 text-purple-600" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="pt-4 border-t border-purple-200">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-lg font-bold text-purple-800">$19.99/month</span>
                          <Badge className="bg-purple-600 text-white">30-day trial</Badge>
                        </div>
                        <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                          Start Premium Trial
                          <ArrowUpRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recent Activity */}
              <Card className={!isPremium ? "lg:col-span-2" : ""}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(dashboardData as any)?.notifications?.map((notification: any, index: number) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                        <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">{notification.message}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(notification.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    )) || (
                      <div className="text-center py-8 text-muted-foreground">
                        <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No recent activity</p>
                        <p className="text-sm">Your coaching activities will appear here</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

            </div>
          </TabsContent>

          {/* Sessions Tab */}
          <TabsContent value="sessions">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Session Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Sessions Scheduled</h3>
                  <p className="text-muted-foreground mb-4">
                    Start accepting session requests from students
                  </p>
                  <Button>
                    <Calendar className="h-4 w-4 mr-2" />
                    Set Availability
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Student Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Students Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Students who book sessions with you will appear here
                  </p>
                  <Button>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Find Students
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Performance Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Session Completion Rate</span>
                        <span>0%</span>
                      </div>
                      <Progress value={0} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Student Retention</span>
                        <span>0%</span>
                      </div>
                      <Progress value={0} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Rating Average</span>
                        <span>N/A</span>
                      </div>
                      <Progress value={0} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Earnings Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
                      <span className="font-medium">Gross Earnings</span>
                      <span className="font-bold text-emerald-700">${(stats.totalEarnings / 100).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="font-medium">Platform Commission ({pcpConfig.commission}%)</span>
                      <span className="font-bold text-blue-700">$0.00</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <span className="font-medium">Net Earnings</span>
                      <span className="font-bold text-purple-700">${(stats.totalEarnings / 100).toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tools Tab */}
          <TabsContent value="tools">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Profile Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Update your coaching profile and preferences
                  </p>
                  <Button variant="outline" className="w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Profile
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Curriculum Builder
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Create custom training programs for your students
                  </p>
                  <Button variant="outline" className="w-full">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Build Curriculum
                  </Button>
                </CardContent>
              </Card>

              <Card className={!isPremium ? "opacity-60" : ""}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="h-5 w-5" />
                    Video Sessions
                    {!isPremium && <Badge variant="outline" className="ml-2">Premium</Badge>}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Conduct remote coaching sessions with video calls
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    disabled={!isPremium}
                  >
                    <Video className="h-4 w-4 mr-2" />
                    {isPremium ? 'Start Video Session' : 'Upgrade Required'}
                  </Button>
                </CardContent>
              </Card>

            </div>
          </TabsContent>

        </Tabs>

      </div>
    </div>
  );
}