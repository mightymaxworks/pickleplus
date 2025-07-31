import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy,
  TrendingUp,
  Calendar,
  MapPin,
  Star,
  Award,
  Target,
  Activity,
  Users,
  Clock,
  BarChart3,
  ChevronRight,
  ChevronDown,
  Share2,
  Download,
  Edit3,
  Eye,
  Zap,
  Shield,
  Sparkles
} from "lucide-react";

interface PassportData {
  user: {
    name: string;
    profileImage: string;
    joinDate: string;
    location: string;
  };
  ratings: {
    dupr: number;
    pcp: number;
    courtiq: {
      technical: number;
      tactical: number;
      physical: number;
      mental: number;
    };
  };
  stats: {
    matchesPlayed: number;
    matchesWon: number;
    winRate: number;
    currentStreak: number;
    totalPoints: number;
    rank: number;
    tier: string;
  };
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    earnedDate: string;
  }>;
  recentActivity: Array<{
    type: 'match' | 'achievement' | 'training' | 'tournament';
    description: string;
    date: string;
    points?: number;
  }>;
}

// Demo data
const demoPassportData: PassportData = {
  user: {
    name: "Alex Chen",
    profileImage: "/api/placeholder/80/80",
    joinDate: "2024-01-15",
    location: "San Francisco, CA"
  },
  ratings: {
    dupr: 4.2,
    pcp: 6.8,
    courtiq: {
      technical: 7.2,
      tactical: 6.5,
      physical: 8.1,
      mental: 6.9
    }
  },
  stats: {
    matchesPlayed: 156,
    matchesWon: 98,
    winRate: 62.8,
    currentStreak: 5,
    totalPoints: 2847,
    rank: 42,
    tier: "Gold"
  },
  achievements: [
    {
      id: "1",
      title: "Win Streak Master",
      description: "Won 10 consecutive matches",
      icon: "🔥",
      rarity: "epic",
      earnedDate: "2024-07-20"
    },
    {
      id: "2", 
      title: "Training Warrior",
      description: "Completed 50 training sessions",
      icon: "💪",
      rarity: "rare",
      earnedDate: "2024-07-15"
    },
    {
      id: "3",
      title: "Community Champion", 
      description: "Helped 5 new players get started",
      icon: "👥",
      rarity: "legendary",
      earnedDate: "2024-07-10"
    }
  ],
  recentActivity: [
    {
      type: "match",
      description: "Won match vs Sarah Johnson",
      date: "2 hours ago",
      points: 25
    },
    {
      type: "achievement", 
      description: "Earned 'Win Streak Master' achievement",
      date: "1 day ago",
      points: 100
    },
    {
      type: "training",
      description: "Completed advanced serve training",
      date: "2 days ago",
      points: 15
    }
  ]
};

interface ModernPassportDisplayProps {
  data?: PassportData;
  view?: 'compact' | 'full' | 'facility';
  interactive?: boolean;
}

export default function ModernPassportDisplay({ 
  data = demoPassportData, 
  view = 'full',
  interactive = true 
}: ModernPassportDisplayProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'stats' | 'achievements' | 'activity'>('overview');

  const rarityColors = {
    common: 'border-gray-300 bg-gray-50',
    rare: 'border-blue-300 bg-blue-50',
    epic: 'border-purple-300 bg-purple-50',
    legendary: 'border-orange-300 bg-orange-50'
  };

  const tierColors = {
    'Bronze': 'text-orange-700 bg-orange-100',
    'Silver': 'text-gray-700 bg-gray-100', 
    'Gold': 'text-yellow-700 bg-yellow-100',
    'Platinum': 'text-purple-700 bg-purple-100',
    'Diamond': 'text-blue-700 bg-blue-100'
  };

  // Quick actions based on view mode
  const getQuickActions = () => {
    if (view === 'facility') {
      return [
        { icon: Calendar, label: 'Book Court', action: 'book-court' },
        { icon: Users, label: 'Find Partner', action: 'find-partner' },
        { icon: Activity, label: 'Check In', action: 'check-in' }
      ];
    }
    return [
      { icon: Trophy, label: 'Record Match', action: 'record-match' },
      { icon: Calendar, label: 'Book Session', action: 'book-session' },
      { icon: Share2, label: 'Share', action: 'share' },
      { icon: Edit3, label: 'Edit', action: 'edit' }
    ];
  };

  if (view === 'compact') {
    return (
      <Card className="w-full max-w-sm bg-gradient-to-br from-white to-gray-50 border-2 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold">
              {data.user.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h3 className="font-bold text-lg">{data.user.name}</h3>
              <p className="text-sm text-gray-600">#{data.stats.rank} • {data.stats.tier}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="p-2 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">DUPR</p>
              <p className="text-xl font-bold text-blue-600">{data.ratings.dupr}</p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Points</p>
              <p className="text-xl font-bold text-green-600">{data.stats.totalPoints}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header Card */}
      <Card className="overflow-hidden bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 text-white">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
            {/* Profile Section */}
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-bold">
                {data.user.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold">{data.user.name}</h1>
                <div className="flex items-center gap-4 text-orange-100 text-sm">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {data.user.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Since {new Date(data.user.joinDate).getFullYear()}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-4 lg:ml-auto">
              <div className="text-center bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <p className="text-3xl font-bold">{data.ratings.dupr}</p>
                <p className="text-sm text-orange-100">DUPR Rating</p>
              </div>
              <div className="text-center bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <p className="text-3xl font-bold">#{data.stats.rank}</p>
                <p className="text-sm text-orange-100">Global Rank</p>
              </div>
              <div className="text-center bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <p className="text-3xl font-bold">{data.stats.winRate}%</p>
                <p className="text-sm text-orange-100">Win Rate</p>
              </div>
              <div className="text-center bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <Badge className={`text-sm px-3 py-1 ${tierColors[data.stats.tier as keyof typeof tierColors]}`}>
                  {data.stats.tier} Tier
                </Badge>
                <p className="text-sm text-orange-100 mt-1">{data.stats.totalPoints} pts</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          {interactive && (
            <div className="flex flex-wrap gap-2 mt-6">
              {getQuickActions().map((action, index) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {action.label}
                  </Button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Tabs */}
      {view === 'full' && (
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: 'overview', label: 'Overview', icon: Eye },
            { key: 'stats', label: 'Statistics', icon: BarChart3 },
            { key: 'achievements', label: 'Achievements', icon: Award },
            { key: 'activity', label: 'Activity', icon: Activity }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.key}
                variant={selectedTab === tab.key ? "default" : "outline"}
                onClick={() => setSelectedTab(tab.key as any)}
                className="flex items-center gap-2"
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </Button>
            );
          })}
        </div>
      )}

      {/* Content Sections */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Overview Tab */}
        {selectedTab === 'overview' && (
          <>
            {/* CourtIQ Ratings */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-500" />
                    CourtIQ Analysis
                  </h3>
                  <Badge variant="outline">PCP {data.ratings.pcp}</Badge>
                </div>
                <div className="space-y-4">
                  {Object.entries(data.ratings.courtiq).map(([skill, rating]) => (
                    <div key={skill}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="capitalize font-medium">{skill}</span>
                        <span className="text-sm font-bold">{rating}/10</span>
                      </div>
                      <Progress value={rating * 10} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Achievements */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  Recent Achievements
                </h3>
                <div className="space-y-3">
                  {data.achievements.slice(0, 3).map((achievement) => (
                    <div
                      key={achievement.id}
                      className={`p-3 rounded-lg border-2 ${rarityColors[achievement.rarity]}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{achievement.icon}</span>
                        <div className="flex-1">
                          <p className="font-semibold">{achievement.title}</p>
                          <p className="text-sm text-gray-600">{achievement.description}</p>
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {achievement.rarity}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Stats Tab */}
        {selectedTab === 'stats' && (
          <>
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-green-500" />
                  Performance Metrics
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{data.stats.matchesPlayed}</p>
                    <p className="text-sm text-gray-600">Matches Played</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{data.stats.matchesWon}</p>
                    <p className="text-sm text-gray-600">Matches Won</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">{data.stats.currentStreak}</p>
                    <p className="text-sm text-gray-600">Current Streak</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">{data.stats.winRate}%</p>
                    <p className="text-sm text-gray-600">Win Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-orange-500" />
                  Progress Tracking
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Next Tier Progress</span>
                      <span className="text-sm font-bold">2847/3000 pts</span>
                    </div>
                    <Progress value={94.9} className="h-3" />
                    <p className="text-xs text-gray-600 mt-1">153 points to Platinum tier</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Other tabs content would go here */}
      </div>

      {/* Facility Mode Footer */}
      {view === 'facility' && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-green-600" />
                <span className="font-medium">Facility Access Verified</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>Court time remaining: 45 min</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}