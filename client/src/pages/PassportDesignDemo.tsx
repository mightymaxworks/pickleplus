/**
 * Passport Design Demo - Standardized Profile Structure
 * 
 * This demo showcases different variations of a unified profile design
 * that works for both players and coaches, creating consistency across
 * all profile-related pages in Pickle+.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-08-05
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Calendar, 
  Award, 
  Clock, 
  MapPin, 
  Users, 
  ChevronLeft, 
  Video, 
  MessageSquare,
  Star,
  BookOpen,
  Target,
  Flame,
  Trophy,
  Activity,
  TrendingUp,
  Zap,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";

interface DemoVariant {
  id: string;
  name: string;
  description: string;
  preview: string;
}

const demoVariants: DemoVariant[] = [
  {
    id: "modern",
    name: "Modern Passport",
    description: "Clean, modern design with emphasis on achievements and stats",
    preview: "🎯 Stats-focused, competitive layout"
  },
  {
    id: "coach-styled",
    name: "Coach-Styled Passport", 
    description: "Based on current coaching profile structure",
    preview: "👨‍🏫 Professional coaching aesthetic"
  },
  {
    id: "unified",
    name: "Unified Passport",
    description: "Standardized design that works for both players and coaches",
    preview: "🔄 Universal design language"
  },
  {
    id: "compact",
    name: "Compact Passport",
    description: "Mobile-first, space-efficient design",
    preview: "📱 Mobile-optimized layout"
  }
];

// Mock player data for demo purposes
const mockPlayerData = {
  id: "218",
  username: "admin",
  firstName: "Alex",
  lastName: "Rodriguez",
  email: "alex@pickle.com",
  profilePicture: null,
  location: "San Francisco, CA",
  yearOfBirth: 1985,
  playingSince: "2019",
  skillLevel: "4.2",
  totalMatches: 127,
  wins: 89,
  losses: 38,
  winRate: 70.1,
  currentRanking: 12,
  peakRanking: 8,
  picklePoints: 2547,
  achievements: [
    { name: "Tournament Winner", icon: "🏆", date: "2024-07-15" },
    { name: "100 Matches", icon: "💯", date: "2024-06-20" },
    { name: "Rising Star", icon: "⭐", date: "2024-05-10" }
  ],
  recentMatches: [
    { opponent: "Sarah Chen", result: "W", score: "11-7, 11-9", date: "2024-08-01" },
    { opponent: "Mike Johnson", result: "L", score: "9-11, 11-6, 8-11", date: "2024-07-28" },
    { opponent: "Lisa Park", result: "W", score: "11-4, 11-8", date: "2024-07-25" }
  ]
};

function ModernPassportDemo() {
  return (
    <div className="space-y-6">
      {/* Hero Section - Modern Stats Focus */}
      <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-white rounded-xl p-6">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="flex flex-col items-center text-center md:items-start md:text-left">
            <Avatar className="h-20 w-20 mb-4 ring-4 ring-white/20">
              <AvatarFallback className="bg-white/20 text-white text-xl font-bold">AR</AvatarFallback>
            </Avatar>
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              <Badge variant="secondary" className="bg-white/20 text-white border-0">
                <Trophy className="h-3 w-3 mr-1" />
                Rank #12
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-0">
                <Zap className="h-3 w-3 mr-1" />
                4.2 Rating
              </Badge>
            </div>
          </div>
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">Alex Rodriguez</h1>
            <p className="text-white/90 mb-4 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              San Francisco, CA
            </p>
            
            {/* Key Stats Grid */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{mockPlayerData.totalMatches}</div>
                <div className="text-sm text-white/80">Total Matches</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{mockPlayerData.winRate}%</div>
                <div className="text-sm text-white/80">Win Rate</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{mockPlayerData.picklePoints}</div>
                <div className="text-sm text-white/80">Pickle Points</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button variant="outline" className="flex flex-col h-20 gap-2">
          <Target className="h-5 w-5" />
          Record Match
        </Button>
        <Button variant="outline" className="flex flex-col h-20 gap-2">
          <Trophy className="h-5 w-5" />
          View Rankings
        </Button>
        <Button variant="outline" className="flex flex-col h-20 gap-2">
          <Users className="h-5 w-5" />
          Find Players
        </Button>
        <Button variant="outline" className="flex flex-col h-20 gap-2">
          <Activity className="h-5 w-5" />
          Performance
        </Button>
      </div>
    </div>
  );
}

function CoachStyledPassportDemo() {
  return (
    <div className="space-y-6">
      {/* Hero Section - Coach Profile Style */}
      <div className="bg-gradient-to-r from-orange-100 to-blue-100 dark:from-orange-900/20 dark:to-blue-900/20 rounded-lg p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex flex-col items-center text-center md:text-left md:items-start">
            <Avatar className="h-24 w-24 mb-3 border-2 border-orange-200">
              <AvatarFallback className="bg-orange-100 text-orange-800">AR</AvatarFallback>
            </Avatar>
            <div className="flex flex-wrap gap-2 mb-3 justify-center md:justify-start">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Award className="h-3 w-3" />
                Verified Player
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                Top Performer
              </Badge>
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-3 justify-center md:justify-start">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Playing since {mockPlayerData.playingSince}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{mockPlayerData.location}</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col flex-1">
            <h1 className="text-2xl font-bold mb-2">Alex Rodriguez</h1>
            <p className="text-muted-foreground mb-4">
              Competitive player focused on continuous improvement and community engagement.
              Passionate about advancing pickleball skills through strategic play and teamwork.
            </p>
            
            <div className="flex flex-wrap gap-3 mb-4">
              <div className="flex items-center text-sm">
                <Trophy className="h-4 w-4 mr-1 text-orange-600" />
                <span>Current Rank: #{mockPlayerData.currentRanking}</span>
              </div>
              <div className="flex items-center text-sm">
                <TrendingUp className="h-4 w-4 mr-1 text-green-600" />
                <span>Win Rate: {mockPlayerData.winRate}%</span>
              </div>
              <div className="flex items-center text-sm">
                <Zap className="h-4 w-4 mr-1 text-blue-600" />
                <span>Rating: {mockPlayerData.skillLevel}</span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button className="flex-1">View Full Stats</Button>
              <Button variant="outline">Connect</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function UnifiedPassportDemo() {
  return (
    <div className="space-y-6">
      {/* Universal Hero Section */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-yellow-50 p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center md:items-start">
              <Avatar className="h-20 w-20 mb-4 border-2 border-orange-200">
                <AvatarFallback className="bg-orange-100 text-orange-800 text-lg font-bold">AR</AvatarFallback>
              </Avatar>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <Badge className="bg-orange-600">Player Profile</Badge>
                <Badge variant="outline">
                  <Shield className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              </div>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                Alex Rodriguez
              </h1>
              <p className="text-muted-foreground mb-4 flex items-center justify-center md:justify-start gap-2">
                <MapPin className="h-4 w-4" />
                {mockPlayerData.location}
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-white rounded-lg p-3 border">
                  <div className="text-xl font-bold text-orange-600">{mockPlayerData.currentRanking}</div>
                  <div className="text-xs text-muted-foreground">Current Rank</div>
                </div>
                <div className="bg-white rounded-lg p-3 border">
                  <div className="text-xl font-bold text-blue-600">{mockPlayerData.skillLevel}</div>
                  <div className="text-xs text-muted-foreground">Skill Rating</div>
                </div>
                <div className="bg-white rounded-lg p-3 border">
                  <div className="text-xl font-bold text-green-600">{mockPlayerData.winRate}%</div>
                  <div className="text-xs text-muted-foreground">Win Rate</div>
                </div>
                <div className="bg-white rounded-lg p-3 border">
                  <div className="text-xl font-bold text-purple-600">{mockPlayerData.picklePoints}</div>
                  <div className="text-xs text-muted-foreground">Points</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function CompactPassportDemo() {
  return (
    <div className="space-y-4">
      {/* Compact Mobile-First Design */}
      <Card className="p-4">
        <div className="flex items-center gap-4 mb-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-orange-100 text-orange-800 font-bold">AR</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-xl font-bold">Alex Rodriguez</h2>
            <p className="text-sm text-muted-foreground">San Francisco, CA</p>
            <div className="flex gap-2 mt-2">
              <Badge variant="secondary" className="text-xs">Rank #12</Badge>
              <Badge variant="outline" className="text-xs">4.2 Rating</Badge>
            </div>
          </div>
        </div>
        
        {/* Compact Stats */}
        <div className="grid grid-cols-3 gap-2 text-center text-sm">
          <div className="bg-gray-50 rounded p-2">
            <div className="font-bold">{mockPlayerData.totalMatches}</div>
            <div className="text-xs text-muted-foreground">Matches</div>
          </div>
          <div className="bg-gray-50 rounded p-2">
            <div className="font-bold">{mockPlayerData.winRate}%</div>
            <div className="text-xs text-muted-foreground">Win Rate</div>
          </div>
          <div className="bg-gray-50 rounded p-2">
            <div className="font-bold">{mockPlayerData.picklePoints}</div>
            <div className="text-xs text-muted-foreground">Points</div>
          </div>
        </div>
      </Card>
      
      {/* Quick Action Grid */}
      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" size="sm" className="h-12">
          <Target className="h-4 w-4 mr-2" />
          Record Match
        </Button>
        <Button variant="outline" size="sm" className="h-12">
          <Trophy className="h-4 w-4 mr-2" />
          Rankings
        </Button>
      </div>
    </div>
  );
}

export default function PassportDesignDemo() {
  const [selectedVariant, setSelectedVariant] = useState("modern");

  const renderVariant = () => {
    switch (selectedVariant) {
      case "modern":
        return <ModernPassportDemo />;
      case "coach-styled":
        return <CoachStyledPassportDemo />;
      case "unified":
        return <UnifiedPassportDemo />;
      case "compact":
        return <CompactPassportDemo />;
      default:
        return <ModernPassportDemo />;
    }
  };

  return (
    <div className="container max-w-6xl py-6">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link to="/dashboard">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
        </Button>
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-4">
            Passport Design Variations
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Exploring standardized profile designs for consistent user experience across players and coaches
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Variant Selector */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Design Variations</CardTitle>
              <CardDescription>
                Choose a variant to see how the standardized passport design would look
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {demoVariants.map((variant) => (
                <Button
                  key={variant.id}
                  variant={selectedVariant === variant.id ? "default" : "outline"}
                  className="w-full text-left justify-start h-auto p-4"
                  onClick={() => setSelectedVariant(variant.id)}
                >
                  <div>
                    <div className="font-semibold">{variant.name}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {variant.description}
                    </div>
                    <div className="text-xs text-orange-600 mt-1">
                      {variant.preview}
                    </div>
                  </div>
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Design Goals</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>Consistent visual language across all profile types</div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>Mobile-first responsive design</div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>Focus on key information and achievements</div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>Easy navigation and interaction patterns</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Preview */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Live Preview: {demoVariants.find(v => v.id === selectedVariant)?.name}
              </CardTitle>
              <CardDescription>
                Interactive preview of the selected passport design variation
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderVariant()}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}