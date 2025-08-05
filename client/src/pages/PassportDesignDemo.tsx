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
  Shield,
  Edit2,
  Check,
  X,
  Phone,
  Mail,
  Globe,
  Instagram,
  Camera,
  Plus,
  Heart,
  ThumbsUp,
  Coffee,
  BookMarked,
  GraduationCap,
  Building,
  UserCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

// Mock data for demo purposes
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
  bio: "Passionate pickleball player focused on continuous improvement and competitive excellence. Love playing doubles and helping newcomers learn the game.",
  phone: "+1 (555) 123-4567",
  socialMedia: {
    instagram: "@alex_pickleball",
    website: "www.alexpickleball.com"
  },
  achievements: [
    { name: "Tournament Winner", icon: "🏆", date: "2024-07-15" },
    { name: "100 Matches", icon: "💯", date: "2024-06-20" },
    { name: "Rising Star", icon: "⭐", date: "2024-05-10" },
    { name: "Community Champion", icon: "🤝", date: "2024-04-12" }
  ],
  recentMatches: [
    { opponent: "Sarah Chen", result: "W", score: "11-7, 11-9", date: "2024-08-01" },
    { opponent: "Mike Johnson", result: "L", score: "9-11, 11-6, 8-11", date: "2024-07-28" },
    { opponent: "Lisa Park", result: "W", score: "11-4, 11-8", date: "2024-07-25" }
  ],
  favoriteShots: ["Third Shot Drop", "Dink Cross-Court", "Overhead Smash"],
  playingStyle: "Aggressive baseline with strong net game",
  availability: "Weekday evenings, Weekend mornings"
};

const mockCoachData = {
  id: "219",
  username: "coachsarah",
  firstName: "Sarah",
  lastName: "Wilson",
  email: "sarah@coachpickle.com",
  profilePicture: null,
  location: "Austin, TX",
  yearOfBirth: 1978,
  coachingSince: "2018",
  pcpLevel: 3,
  specialties: ["Beginner Development", "Strategy & Tactics", "Mental Game"],
  totalStudents: 84,
  sessionsCompleted: 247,
  averageRating: 4.8,
  hourlyRate: 85,
  bio: "Certified PCP Level 3 coach specializing in player development and strategic gameplay. Former competitive player with 12+ years coaching experience.",
  phone: "+1 (555) 987-6543",
  socialMedia: {
    instagram: "@coach_sarah_pb",
    website: "www.sarahpickleballcoaching.com"
  },
  certifications: [
    { name: "PCP Level 3", issuer: "Pickleball Coaching Program", date: "2023-08-15" },
    { name: "Sport Psychology", issuer: "AASP", date: "2022-03-20" },
    { name: "First Aid/CPR", issuer: "Red Cross", date: "2024-01-10" }
  ],
  achievements: [
    { name: "Coach of the Year", icon: "🏆", date: "2023-12-01" },
    { name: "100 Students Milestone", icon: "💯", date: "2023-09-15" },
    { name: "Perfect Rating Month", icon: "⭐", date: "2023-07-20" }
  ],
  recentSessions: [
    { student: "Mike Chen", type: "Strategy Session", date: "2024-08-03", rating: 5 },
    { student: "Emma Davis", type: "Beginner Basics", date: "2024-08-02", rating: 5 },
    { student: "John Smith", type: "Advanced Drills", date: "2024-08-01", rating: 4 }
  ],
  teachingPhilosophy: "Every player has unique potential. My job is to unlock it through personalized instruction and positive reinforcement.",
  availability: "Monday-Friday 9 AM - 6 PM, Saturday mornings"
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

// Inline editing component
function EditableField({ 
  value, 
  onSave, 
  type = "text", 
  placeholder = "", 
  multiline = false,
  options = [],
  className = ""
}: {
  value: any;
  onSave: (value: any) => void;
  type?: string;
  placeholder?: string;
  multiline?: boolean;
  options?: string[];
  className?: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleSave = () => {
    onSave(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {multiline ? (
          <Textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            placeholder={placeholder}
            className="flex-1"
            rows={3}
          />
        ) : type === "select" ? (
          <Select value={editValue} onValueChange={setEditValue}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            placeholder={placeholder}
            type={type}
            className="flex-1"
          />
        )}
        <Button size="sm" onClick={handleSave} className="h-8 w-8 p-0">
          <Check className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={handleCancel} className="h-8 w-8 p-0">
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className={`group flex items-center gap-2 ${className}`}>
      <span className="flex-1">{value || placeholder}</span>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setIsEditing(true)}
        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Edit2 className="h-3 w-3" />
      </Button>
    </div>
  );
}

function UnifiedPassportDemo() {
  const [viewMode, setViewMode] = useState("player"); // "player" or "coach"
  const [isOwner, setIsOwner] = useState(true); // Toggle between owner view and visitor view
  
  const currentData = viewMode === "player" ? mockPlayerData : mockCoachData;
  
  const handleFieldSave = (field: string, value: any) => {
    console.log(`Saving ${field}:`, value);
    // In real implementation, this would make an API call
  };

  return (
    <div className="space-y-6">
      {/* View Mode Toggles */}
      <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex gap-2">
          <Button 
            variant={viewMode === "player" ? "default" : "outline"}
            onClick={() => setViewMode("player")}
            size="sm"
          >
            <Users className="h-4 w-4 mr-2" />
            Player View
          </Button>
          <Button 
            variant={viewMode === "coach" ? "default" : "outline"}
            onClick={() => setViewMode("coach")}
            size="sm"
          >
            <GraduationCap className="h-4 w-4 mr-2" />
            Coach View
          </Button>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={isOwner ? "default" : "outline"}
            onClick={() => setIsOwner(true)}
            size="sm"
          >
            <UserCheck className="h-4 w-4 mr-2" />
            Owner View
          </Button>
          <Button 
            variant={!isOwner ? "default" : "outline"}
            onClick={() => setIsOwner(false)}
            size="sm"
          >
            <Users className="h-4 w-4 mr-2" />
            Visitor View
          </Button>
        </div>
      </div>

      {/* Universal Hero Section */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-yellow-50 p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center md:items-start">
              <div className="relative">
                <Avatar className="h-24 w-24 mb-4 border-2 border-orange-200">
                  <AvatarFallback className="bg-orange-100 text-orange-800 text-lg font-bold">
                    {currentData.firstName?.[0]}{currentData.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                {isOwner && (
                  <Button 
                    size="sm" 
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                    onClick={() => console.log("Upload photo")}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-3">
                <Badge className={viewMode === "player" ? "bg-blue-600" : "bg-green-600"}>
                  {viewMode === "player" ? "Player Profile" : "Coach Profile"}
                </Badge>
                <Badge variant="outline">
                  <Shield className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
                {viewMode === "coach" && (
                  <Badge variant="outline" className="bg-orange-50">
                    <Award className="h-3 w-3 mr-1" />
                    PCP Level {currentData.pcpLevel}
                  </Badge>
                )}
              </div>

              {/* Contact Info */}
              <div className="text-sm space-y-1 text-center md:text-left">
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <Phone className="h-3 w-3" />
                  {isOwner ? (
                    <EditableField
                      value={currentData.phone}
                      onSave={(value) => handleFieldSave('phone', value)}
                      placeholder="Add phone number"
                    />
                  ) : (
                    <span>{currentData.phone}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <Mail className="h-3 w-3" />
                  <span>{currentData.email}</span>
                </div>
              </div>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  {isOwner ? (
                    <EditableField
                      value={`${currentData.firstName} ${currentData.lastName}`}
                      onSave={(value) => {
                        const [first, ...last] = value.split(' ');
                        handleFieldSave('firstName', first);
                        handleFieldSave('lastName', last.join(' '));
                      }}
                      placeholder="Enter full name"
                      className="text-3xl font-bold"
                    />
                  ) : (
                    `${currentData.firstName} ${currentData.lastName}`
                  )}
                </h1>
              </div>
              
              <p className="text-muted-foreground mb-4 flex items-center justify-center md:justify-start gap-2">
                <MapPin className="h-4 w-4" />
                {isOwner ? (
                  <EditableField
                    value={currentData.location}
                    onSave={(value) => handleFieldSave('location', value)}
                    placeholder="Add location"
                  />
                ) : (
                  currentData.location
                )}
              </p>

              {/* Bio Section */}
              <div className="mb-4">
                {isOwner ? (
                  <div className="text-sm text-muted-foreground">
                    <EditableField
                      value={currentData.bio}
                      onSave={(value) => handleFieldSave('bio', value)}
                      placeholder="Tell others about yourself..."
                      multiline={true}
                    />
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">{currentData.bio}</p>
                )}
              </div>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                {viewMode === "player" ? (
                  <>
                    <div className="bg-white rounded-lg p-3 border shadow-sm">
                      <div className="text-lg md:text-xl font-bold text-orange-600">#{currentData.currentRanking}</div>
                      <div className="text-xs text-muted-foreground">Current Rank</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border shadow-sm">
                      <div className="text-lg md:text-xl font-bold text-blue-600">{currentData.skillLevel}</div>
                      <div className="text-xs text-muted-foreground">Skill Rating</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border shadow-sm">
                      <div className="text-lg md:text-xl font-bold text-green-600">{currentData.winRate}%</div>
                      <div className="text-xs text-muted-foreground">Win Rate</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border shadow-sm">
                      <div className="text-lg md:text-xl font-bold text-purple-600">{currentData.picklePoints}</div>
                      <div className="text-xs text-muted-foreground">Pickle Points</div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-white rounded-lg p-3 border shadow-sm">
                      <div className="text-lg md:text-xl font-bold text-green-600">{currentData.totalStudents}</div>
                      <div className="text-xs text-muted-foreground">Total Students</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border shadow-sm">
                      <div className="text-lg md:text-xl font-bold text-blue-600">{currentData.sessionsCompleted}</div>
                      <div className="text-xs text-muted-foreground">Sessions</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border shadow-sm">
                      <div className="text-lg md:text-xl font-bold text-yellow-600">{currentData.averageRating}⭐</div>
                      <div className="text-xs text-muted-foreground">Average Rating</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border shadow-sm">
                      <div className="text-lg md:text-xl font-bold text-purple-600">${currentData.hourlyRate}</div>
                      <div className="text-xs text-muted-foreground">Per Hour</div>
                    </div>
                  </>
                )}
              </div>

              {/* Rankings Display for Players */}
              {viewMode === "player" && (
                <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border">
                  <h3 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
                    <Trophy className="h-4 w-4" />
                    Rankings Across Divisions
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                    <div className="bg-white p-3 rounded-md border">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Singles 19+</span>
                        <Badge variant="outline" className="text-orange-600 border-orange-200">#12</Badge>
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-md border">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Doubles 19+</span>
                        <Badge variant="outline" className="text-blue-600 border-blue-200">#8</Badge>
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-md border">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Mixed 19+</span>
                        <Badge variant="outline" className="text-green-600 border-green-200">#15</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Access to Full Rankings - Player Mode */}
      {viewMode === "player" && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
              <div>
                <h3 className="font-semibold text-lg">Complete Rankings Profile</h3>
                <p className="text-sm text-muted-foreground">View full rankings, leaderboards, and performance analytics</p>
              </div>
              <Button className="bg-orange-600 hover:bg-orange-700 w-full sm:w-auto">
                <TrendingUp className="h-4 w-4 mr-2" />
                View Rankings
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabbed Content - Mobile Optimized */}
      <Tabs defaultValue="about" className="w-full">
        <TabsList className="grid w-full grid-cols-4 h-auto p-1">
          <TabsTrigger value="about" className="text-xs sm:text-sm px-2 py-2">
            <div className="flex flex-col items-center gap-1">
              <Users className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">About</span>
              <span className="sm:hidden">Info</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="stats" className="text-xs sm:text-sm px-2 py-2">
            <div className="flex flex-col items-center gap-1">
              <Activity className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">{viewMode === "player" ? "Stats" : "Teaching"}</span>
              <span className="sm:hidden">{viewMode === "player" ? "Stats" : "Coach"}</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="achievements" className="text-xs sm:text-sm px-2 py-2">
            <div className="flex flex-col items-center gap-1">
              <Trophy className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Achievements</span>
              <span className="sm:hidden">Awards</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="contact" className="text-xs sm:text-sm px-2 py-2">
            <div className="flex flex-col items-center gap-1">
              <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Connect</span>
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="about" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {viewMode === "player" ? "Playing Information" : "Coaching Information"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {viewMode === "player" ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Playing Since:</span>
                        <span>{currentData.playingSince}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Playing Style:</span>
                        {isOwner ? (
                          <EditableField
                            value={currentData.playingStyle}
                            onSave={(value) => handleFieldSave('playingStyle', value)}
                            placeholder="Describe your style"
                          />
                        ) : (
                          <span>{currentData.playingStyle}</span>
                        )}
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Availability:</span>
                        {isOwner ? (
                          <EditableField
                            value={currentData.availability}
                            onSave={(value) => handleFieldSave('availability', value)}
                            placeholder="When do you play?"
                          />
                        ) : (
                          <span>{currentData.availability}</span>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Coaching Since:</span>
                        <span>{currentData.coachingSince}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">PCP Level:</span>
                        <Badge variant="outline">Level {currentData.pcpLevel}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Hourly Rate:</span>
                        {isOwner ? (
                          <EditableField
                            value={`$${currentData.hourlyRate}`}
                            onSave={(value) => handleFieldSave('hourlyRate', value.replace('$', ''))}
                            placeholder="$0"
                          />
                        ) : (
                          <span>${currentData.hourlyRate}</span>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Social Media */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Social Media</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Instagram className="h-4 w-4" />
                    {isOwner ? (
                      <EditableField
                        value={currentData.socialMedia?.instagram}
                        onSave={(value) => handleFieldSave('instagram', value)}
                        placeholder="@username"
                      />
                    ) : (
                      <span>{currentData.socialMedia?.instagram}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    {isOwner ? (
                      <EditableField
                        value={currentData.socialMedia?.website}
                        onSave={(value) => handleFieldSave('website', value)}
                        placeholder="www.example.com"
                      />
                    ) : (
                      <span>{currentData.socialMedia?.website}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {viewMode === "player" ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Favorite Shots</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {currentData.favoriteShots?.map((shot, index) => (
                        <Badge key={index} variant="outline">{shot}</Badge>
                      ))}
                      {isOwner && (
                        <Button variant="outline" size="sm" className="h-6">
                          <Plus className="h-3 w-3 mr-1" />
                          Add Shot
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Specialties</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {currentData.specialties?.map((specialty, index) => (
                          <Badge key={index} variant="secondary">{specialty}</Badge>
                        ))}
                        {isOwner && (
                          <Button variant="outline" size="sm" className="h-6">
                            <Plus className="h-3 w-3 mr-1" />
                            Add Specialty
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Teaching Philosophy</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isOwner ? (
                        <EditableField
                          value={currentData.teachingPhilosophy}
                          onSave={(value) => handleFieldSave('teachingPhilosophy', value)}
                          placeholder="Share your teaching philosophy..."
                          multiline={true}
                        />
                      ) : (
                        <p className="text-sm">{currentData.teachingPhilosophy}</p>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  {viewMode === "player" ? "Recent Matches" : "Recent Sessions"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(viewMode === "player" ? currentData.recentMatches : currentData.recentSessions)?.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">
                          {viewMode === "player" ? item.opponent : item.student}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {viewMode === "player" ? item.score : item.type}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold ${
                          viewMode === "player" 
                            ? (item.result === 'W' ? 'text-green-600' : 'text-red-600')
                            : 'text-yellow-600'
                        }`}>
                          {viewMode === "player" ? item.result : `${item.rating}⭐`}
                        </div>
                        <div className="text-xs text-muted-foreground">{item.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {viewMode === "player" ? (
                    <>
                      <div className="flex justify-between">
                        <span>Total Matches</span>
                        <span className="font-bold">{currentData.totalMatches}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Wins</span>
                        <span className="font-bold text-green-600">{currentData.wins}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Losses</span>
                        <span className="font-bold text-red-600">{currentData.losses}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Peak Ranking</span>
                        <span className="font-bold">#{currentData.peakRanking}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span>Total Students</span>
                        <span className="font-bold">{currentData.totalStudents}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sessions Completed</span>
                        <span className="font-bold">{currentData.sessionsCompleted}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Average Rating</span>
                        <span className="font-bold text-yellow-600">{currentData.averageRating}⭐</span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentData.achievements?.map((achievement, index) => (
              <Card key={index}>
                <CardContent className="p-4 text-center">
                  <div className="text-3xl mb-2">{achievement.icon}</div>
                  <h3 className="font-semibold">{achievement.name}</h3>
                  <p className="text-sm text-muted-foreground">{achievement.date}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="contact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Connect with {currentData.firstName}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isOwner && (
                <div className="grid md:grid-cols-2 gap-4">
                  <Button className="w-full">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                  <Button variant="outline" className="w-full">
                    {viewMode === "player" ? (
                      <>
                        <Users className="h-4 w-4 mr-2" />
                        Request Match
                      </>
                    ) : (
                      <>
                        <BookOpen className="h-4 w-4 mr-2" />
                        Book Session
                      </>
                    )}
                  </Button>
                </div>
              )}
              
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Availability</h4>
                <p className="text-sm text-muted-foreground">{currentData.availability}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
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