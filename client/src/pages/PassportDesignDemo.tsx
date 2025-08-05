import { useState } from "react";
import {
  Activity,
  Trophy,
  Star,
  MapPin,
  Calendar,
  Award,
  Target,
  Users,
  BookOpen,
  MessageSquare,
  Settings,
  Edit2,
  Check,
  X,
  ChevronLeft,
  Zap,
  TrendingUp,
  Clock,
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
  UserCheck,
  UserX,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Edit
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
import EnhancedLeaderboard from "@/components/match/EnhancedLeaderboard";

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
    description: "Mobile-optimized condensed view",
    preview: "📱 Mobile-first design"
  }
];

// Mock data for demonstrations
const mockPlayerData = {
  id: "player-123",
  username: "alexrodriguez",
  firstName: "Alex",
  lastName: "Rodriguez",
  email: "alex@example.com",
  profilePicture: null,
  location: "San Francisco, CA",
  yearOfBirth: 1985,
  playingSince: "2020",
  currentRating: 4.2,
  peakRating: 4.5,
  totalMatches: 127,
  winRate: 67,
  picklePoints: 2850,
  favoriteShots: ["Cross-court dink", "Third shot drop", "Lob"],
  playingStyle: "Aggressive baseline play with strong net presence",
  achievements: [
    { name: "Regional Tournament Winner", date: "2024", icon: "🏆" },
    { name: "Perfect Score Achievement", date: "2024", icon: "⭐" },
    { name: "100 Matches Milestone", date: "2023", icon: "🎯" }
  ],
  recentMatches: [
    { opponent: "Maria Santos", score: "11-8, 11-6", result: "W", date: "Jan 15" },
    { opponent: "David Chen", score: "11-9, 8-11, 11-7", result: "W", date: "Jan 12" },
    { opponent: "Sarah Wilson", score: "9-11, 11-6, 8-11", result: "L", date: "Jan 10" }
  ],
  availability: "Weekdays 6-8 PM, Weekends 9 AM - 5 PM",
  // Coach data when they're also a coach
  isCoach: true,
  coachingSince: "2022",
  pcpLevel: 3,
  specialties: ["Beginner Development", "Serve Technique", "Court Strategy"],
  sessionRate: "$75/hour",
  totalStudents: 24,
  sessionsCompleted: 156,
  averageRating: 4.8,
  hourlyRate: 75,
  coachingBio: "Passionate about helping players discover their potential through personalized coaching approaches.",
  teachingPhilosophy: "Focus on fundamentals while building confidence and strategic thinking.",
  certifications: [
    { name: "PCP Level 3", issuer: "Pickle+ Academy", date: "2023" },
    { name: "First Aid Certified", issuer: "Red Cross", date: "2024" }
  ],
  recentSessions: [
    { student: "Mike Johnson", focus: "Serve improvement", date: "Jan 14", rating: 5 },
    { student: "Lisa Chen", focus: "Court positioning", date: "Jan 13", rating: 5 },
    { student: "Tom Wilson", focus: "Dinking strategy", date: "Jan 12", rating: 4 }
  ],
  coachingStats: {
    totalSessions: 156,
    averageRating: 4.8,
    studentsImproved: 22,
    specialtySuccess: 89
  }
};

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

function ModernPassportDemo() {
  const [currentData, setCurrentData] = useState(mockPlayerData);
  const isOwner = true; // Demo purposes
  const userRoles = { isCoach: currentData.isCoach, isPlayer: true };

  return (
    <div className="space-y-6">
      {/* Hero Section with Background Image */}
      <Card className="overflow-hidden relative">
        {/* Background Image Section - Larger and Mobile Optimized */}
        <div className="h-48 md:h-56 lg:h-64 bg-gradient-to-br from-orange-100 via-amber-50 to-orange-200 relative">
          <div className="absolute inset-0 bg-black/10"></div>
          {isOwner && (
            <Button
              size="sm"
              variant="secondary"
              className="absolute top-3 right-3 h-8 text-xs opacity-80 hover:opacity-100"
            >
              <Camera className="h-3 w-3 mr-1" />
              <span className="hidden sm:inline">Change Cover</span>
              <span className="sm:hidden">Cover</span>
            </Button>
          )}
        </div>
        
        <CardContent className="p-4 md:p-6 -mt-8 md:-mt-12 relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 md:gap-6">
            {/* Profile Photo with Edit Option */}
            <div className="relative">
              <Avatar className="h-20 w-20 md:h-24 md:w-24 border-4 border-white shadow-lg">
                {currentData.profilePicture ? (
                  <AvatarImage src={currentData.profilePicture} />
                ) : (
                  <AvatarFallback className="bg-gradient-to-br from-orange-500 to-amber-500 text-white text-lg md:text-xl font-bold">
                    {currentData.firstName[0]}{currentData.lastName[0]}
                  </AvatarFallback>
                )}
              </Avatar>
              {isOwner && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 h-7 w-7 md:h-8 md:w-8 rounded-full p-0"
                >
                  <Camera className="h-3 w-3" />
                </Button>
              )}
            </div>
            
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                {isOwner ? (
                  <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                    <EditableField
                      value={currentData.firstName}
                      onSave={(value) => setCurrentData({...currentData, firstName: value})}
                      placeholder="First Name"
                      className="text-2xl md:text-3xl font-bold text-gray-900"
                    />
                    <EditableField
                      value={currentData.lastName}
                      onSave={(value) => setCurrentData({...currentData, lastName: value})}
                      placeholder="Last Name"
                      className="text-2xl md:text-3xl font-bold text-gray-900"
                    />
                  </div>
                ) : (
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                    {currentData.firstName} {currentData.lastName}
                  </h1>
                )}
                <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs md:text-sm w-fit mx-auto sm:mx-0">
                  Rank #{Math.floor(Math.random() * 50) + 1}
                </Badge>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-muted-foreground mb-4 text-sm">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 md:h-4 md:w-4" />
                  {isOwner ? (
                    <EditableField
                      value={currentData.location}
                      onSave={(value) => setCurrentData({...currentData, location: value})}
                      placeholder="Add your location"
                    />
                  ) : (
                    <span>{currentData.location}</span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 md:h-4 md:w-4" />
                  {isOwner ? (
                    <EditableField
                      value={currentData.playingSince}
                      onSave={(value) => setCurrentData({...currentData, playingSince: value})}
                      placeholder="Playing since year"
                      type="number"
                    />
                  ) : (
                    <span>Playing since {currentData.playingSince}</span>
                  )}
                </div>
              </div>

              {/* Profile Completion Indicator (only for owners) */}
              {isOwner && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-900">Profile Completion</span>
                    <span className="text-sm text-blue-600">85%</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{width: '85%'}}></div>
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    Add profile photo and background image to reach 100%
                  </div>
                </div>
              )}

              {/* Quick Stats - Mobile Optimized */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-lg md:text-2xl font-bold text-orange-600">{currentData.currentRating}</div>
                  <div className="text-xs text-muted-foreground">Rating</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-lg md:text-2xl font-bold text-blue-600">{currentData.totalMatches}</div>
                  <div className="text-xs text-muted-foreground">Matches</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-lg md:text-2xl font-bold text-green-600">{currentData.winRate}%</div>
                  <div className="text-xs text-muted-foreground">Win Rate</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-lg md:text-2xl font-bold text-purple-600">{currentData.picklePoints}</div>
                  <div className="text-xs text-muted-foreground">Points</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabbed Content - Mobile Optimized */}
      <Tabs defaultValue="about" className="w-full">
        <TabsList className={`grid w-full h-auto p-1 ${userRoles.isCoach ? 'grid-cols-5' : 'grid-cols-4'}`}>
          <TabsTrigger value="about" className="text-xs md:text-sm px-2 py-2">About</TabsTrigger>
          <TabsTrigger value="stats" className="text-xs md:text-sm px-2 py-2">Stats</TabsTrigger>
          <TabsTrigger value="rankings" className="text-xs md:text-sm px-2 py-2">Rankings</TabsTrigger>
          {userRoles.isCoach && <TabsTrigger value="coaching" className="text-xs md:text-sm px-2 py-2">Coaching</TabsTrigger>}
          <TabsTrigger value="connect" className="text-xs md:text-sm px-2 py-2">Connect</TabsTrigger>
        </TabsList>

        <TabsContent value="about" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Player Information */}
            <Card>
              <CardHeader>
                <CardTitle>Player Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Playing Style</h4>
                  {isOwner ? (
                    <EditableField
                      value={currentData.playingStyle}
                      onSave={(value) => setCurrentData({...currentData, playingStyle: value})}
                      placeholder="Describe your playing style"
                      multiline={true}
                      className="text-sm"
                    />
                  ) : (
                    <p className="text-sm">{currentData.playingStyle}</p>
                  )}
                </div>
                
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Favorite Shots</h4>
                  <div className="flex flex-wrap gap-2">
                    {currentData.favoriteShots.map((shot, index) => (
                      <Badge key={index} variant="outline" className="relative group">
                        {shot}
                        {isOwner && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="ml-1 h-4 w-4 p-0 opacity-0 group-hover:opacity-100"
                            onClick={() => {
                              const newShots = currentData.favoriteShots.filter((_, i) => i !== index);
                              setCurrentData({...currentData, favoriteShots: newShots});
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </Badge>
                    ))}
                    {isOwner && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 text-xs"
                        onClick={() => {
                          const newShot = prompt("Add new favorite shot:");
                          if (newShot) {
                            setCurrentData({...currentData, favoriteShots: [...currentData.favoriteShots, newShot]});
                          }
                        }}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Shot
                      </Button>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Availability</h4>
                  {isOwner ? (
                    <EditableField
                      value={currentData.availability}
                      onSave={(value) => setCurrentData({...currentData, availability: value})}
                      placeholder="When are you available to play?"
                      multiline={true}
                      className="text-sm"
                    />
                  ) : (
                    <p className="text-sm">{currentData.availability}</p>
                  )}
                </div>

                {/* Coach Information (if coach) */}
                {userRoles.isCoach && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">Coaching Bio</h4>
                    {isOwner ? (
                      <EditableField
                        value={currentData.coachingBio}
                        onSave={(value) => setCurrentData({...currentData, coachingBio: value})}
                        placeholder="Tell potential students about your coaching approach"
                        multiline={true}
                        className="text-sm"
                      />
                    ) : (
                      <p className="text-sm">{currentData.coachingBio}</p>
                    )}
                    
                    <div className="mt-3">
                      <h4 className="font-medium text-sm text-muted-foreground mb-2">Coaching Since</h4>
                      {isOwner ? (
                        <EditableField
                          value={currentData.coachingSince}
                          onSave={(value) => setCurrentData({...currentData, coachingSince: value})}
                          placeholder="Year you started coaching"
                          type="number"
                          className="text-sm"
                        />
                      ) : (
                        <p className="text-sm">{currentData.coachingSince}</p>
                      )}
                    </div>

                    <div className="mt-3">
                      <h4 className="font-medium text-sm text-muted-foreground mb-2">Teaching Philosophy</h4>
                      {isOwner ? (
                        <EditableField
                          value={currentData.teachingPhilosophy}
                          onSave={(value) => setCurrentData({...currentData, teachingPhilosophy: value})}
                          placeholder="Your approach to teaching pickleball"
                          multiline={true}
                          className="text-sm"
                        />
                      ) : (
                        <p className="text-sm">{currentData.teachingPhilosophy}</p>
                      )}
                    </div>

                    <div className="mt-3">
                      <h4 className="font-medium text-sm text-muted-foreground mb-2">Hourly Rate</h4>
                      {isOwner ? (
                        <EditableField
                          value={currentData.hourlyRate}
                          onSave={(value) => setCurrentData({...currentData, hourlyRate: parseInt(value)})}
                          placeholder="Your coaching rate per hour"
                          type="number"
                          className="text-sm"
                        />
                      ) : (
                        <p className="text-sm">${currentData.hourlyRate}/hour</p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentData.achievements.map((achievement, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <div className="font-medium">{achievement.name}</div>
                        <div className="text-sm text-muted-foreground">{achievement.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Rankings Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                  Current Rankings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Overall Rank */}
                  <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg border-2 border-orange-200">
                    <div className="text-3xl font-bold text-orange-600">#{Math.floor(Math.random() * 50) + 1}</div>
                    <div className="text-sm font-medium text-muted-foreground">Overall Rank</div>
                    <div className="text-xs text-muted-foreground mt-1">Regional Leaderboard</div>
                  </div>
                  
                  {/* Age Group & Gender Rankings */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-xl font-bold text-blue-600">#{Math.floor(Math.random() * 20) + 1}</div>
                      <div className="text-xs text-muted-foreground">Age Group</div>
                      <div className="text-xs text-blue-600 font-medium">35-44 M</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-xl font-bold text-green-600">#{Math.floor(Math.random() * 15) + 1}</div>
                      <div className="text-xs text-muted-foreground">Gender</div>
                      <div className="text-xs text-green-600 font-medium">Male</div>
                    </div>
                  </div>

                  {/* Rating Progress */}
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Rating Progress</span>
                      <span className="text-sm text-purple-600">+0.1 this month</span>
                    </div>
                    <div className="w-full bg-purple-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{width: `${(currentData.currentRating / 5) * 100}%`}}></div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>3.0</span>
                      <span className="font-medium">{currentData.currentRating}</span>
                      <span>5.0</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Matches */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-orange-600" />
                  Recent Matches
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentData.recentMatches.map((match, index) => (
                    <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{match.opponent}</div>
                        <div className="text-sm text-muted-foreground">{match.score}</div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold ${
                          match.result === 'W' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {match.result}
                        </div>
                        <div className="text-xs text-muted-foreground">{match.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-xl font-bold text-green-600">{currentData.peakRating}</div>
                    <div className="text-xs text-muted-foreground">Peak Rating</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-xl font-bold text-blue-600">{currentData.currentRating}</div>
                    <div className="text-xs text-muted-foreground">Current Rating</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-xl font-bold text-orange-600">{currentData.winRate}%</div>
                    <div className="text-xs text-muted-foreground">Win Rate</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-xl font-bold text-purple-600">{currentData.totalMatches}</div>
                    <div className="text-xs text-muted-foreground">Total Matches</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Condensed Rankings Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-indigo-600" />
                Local Leaderboard
              </CardTitle>
              <CardDescription>
                Top players in your area and age group
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-2 text-xs font-medium text-muted-foreground">Rank</th>
                      <th className="pb-2 text-xs font-medium text-muted-foreground">Player</th>
                      <th className="pb-2 text-xs font-medium text-muted-foreground">Rating</th>
                      <th className="pb-2 text-xs font-medium text-muted-foreground">Matches</th>
                      <th className="pb-2 text-xs font-medium text-muted-foreground">Win Rate</th>
                      <th className="pb-2 text-xs font-medium text-muted-foreground">Age Group</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {/* Current user highlighted */}
                    <tr className="bg-orange-50 border border-orange-200 rounded">
                      <td className="py-2 px-2 font-bold text-orange-600">#{Math.floor(Math.random() * 10) + 8}</td>
                      <td className="py-2 px-2 font-bold">{currentData.firstName} {currentData.lastName} (You)</td>
                      <td className="py-2 px-2 font-bold text-orange-600">{currentData.currentRating}</td>
                      <td className="py-2 px-2">{currentData.totalMatches}</td>
                      <td className="py-2 px-2">{currentData.winRate}%</td>
                      <td className="py-2 px-2">35-44 M</td>
                    </tr>
                    
                    {/* Other players */}
                    {[
                      { rank: 1, name: "Sarah Wilson", rating: 4.8, matches: 203, winRate: 78, ageGroup: "35-44 F" },
                      { rank: 2, name: "Mike Chen", rating: 4.7, matches: 189, winRate: 74, ageGroup: "35-44 M" },
                      { rank: 3, name: "Lisa Rodriguez", rating: 4.6, matches: 156, winRate: 71, ageGroup: "35-44 F" },
                      { rank: 4, name: "David Kim", rating: 4.5, matches: 167, winRate: 69, ageGroup: "35-44 M" },
                      { rank: 5, name: "Emma Thompson", rating: 4.4, matches: 134, winRate: 68, ageGroup: "35-44 F" }
                    ].map((player) => (
                      <tr key={player.rank} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-2 font-medium">#{player.rank}</td>
                        <td className="py-2 px-2">{player.name}</td>
                        <td className="py-2 px-2 font-medium">{player.rating}</td>
                        <td className="py-2 px-2">{player.matches}</td>
                        <td className="py-2 px-2">{player.winRate}%</td>
                        <td className="py-2 px-2">{player.ageGroup}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-4 text-center">
                <Button variant="outline" size="sm">
                  View Full Rankings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rankings" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Personal Rankings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                  Your Rankings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Overall Rank - Large Display */}
                  <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg border-2 border-orange-200">
                    <div className="text-4xl font-bold text-orange-600 mb-2">#{Math.floor(Math.random() * 50) + 1}</div>
                    <div className="text-lg font-medium text-gray-900">Overall Rank</div>
                    <div className="text-sm text-muted-foreground">Regional Leaderboard</div>
                    <div className="text-xs text-orange-600 font-medium mt-2">San Francisco Bay Area</div>
                  </div>
                  
                  {/* Category Rankings */}
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <div>
                        <div className="font-medium text-blue-900">Age Group (35-44 M)</div>
                        <div className="text-sm text-blue-600">Most competitive category</div>
                      </div>
                      <div className="text-xl font-bold text-blue-600">#{Math.floor(Math.random() * 20) + 1}</div>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <div>
                        <div className="font-medium text-green-900">Gender (Male)</div>
                        <div className="text-sm text-green-600">All ages combined</div>
                      </div>
                      <div className="text-xl font-bold text-green-600">#{Math.floor(Math.random() * 15) + 1}</div>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <div>
                        <div className="font-medium text-purple-900">Facility (Local Courts)</div>
                        <div className="text-sm text-purple-600">Home court advantage</div>
                      </div>
                      <div className="text-xl font-bold text-purple-600">#{Math.floor(Math.random() * 10) + 1}</div>
                    </div>
                  </div>

                  {/* Rating Progress Indicator */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-medium">Rating Progress</span>
                      <span className="text-sm text-green-600 font-medium">+0.1 this month</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-gradient-to-r from-orange-500 to-amber-500 h-3 rounded-full transition-all duration-300" style={{width: `${(currentData.currentRating / 5) * 100}%`}}></div>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground mt-2">
                      <span>3.0 Beginner</span>
                      <span className="font-medium text-gray-900">{currentData.currentRating}</span>
                      <span>5.0 Pro</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ranking History & Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Ranking Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Monthly Progress */}
                  <div>
                    <h4 className="font-medium mb-3">6-Month Progress</h4>
                    <div className="space-y-2">
                      {[
                        { month: "January", rank: Math.floor(Math.random() * 50) + 1, change: "+2" },
                        { month: "December", rank: Math.floor(Math.random() * 50) + 3, change: "+1" },
                        { month: "November", rank: Math.floor(Math.random() * 50) + 5, change: "-1" },
                        { month: "October", rank: Math.floor(Math.random() * 50) + 7, change: "+3" },
                        { month: "September", rank: Math.floor(Math.random() * 50) + 10, change: "+2" }
                      ].map((entry, index) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                          <span className="text-sm">{entry.month}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">#{entry.rank}</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              entry.change.startsWith('+') 
                                ? 'bg-green-100 text-green-600' 
                                : 'bg-red-100 text-red-600'
                            }`}>
                              {entry.change}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Achievement Milestones */}
                  <div>
                    <h4 className="font-medium mb-3">Recent Milestones</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 p-2 bg-yellow-50 rounded-lg">
                        <Trophy className="h-4 w-4 text-yellow-600" />
                        <div className="text-sm">
                          <div className="font-medium">Top 50 Regional</div>
                          <div className="text-muted-foreground">Achieved Dec 2024</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
                        <Target className="h-4 w-4 text-blue-600" />
                        <div className="text-sm">
                          <div className="font-medium">4.0+ Rating</div>
                          <div className="text-muted-foreground">Achieved Nov 2024</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Leaderboard with Format Filters */}
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="font-semibold text-lg mb-2">Complete Leaderboards</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Filter by age group, gender, and event type - rankings update in real-time
              </p>
            </div>
            
            {/* Event Type Tabs */}
            <Tabs defaultValue="singles" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="singles">Singles</TabsTrigger>
                <TabsTrigger value="doubles">Doubles</TabsTrigger>
                <TabsTrigger value="mixed">Mixed Doubles</TabsTrigger>
              </TabsList>
              
              <TabsContent value="singles" className="space-y-0">
                <EnhancedLeaderboard formatType="singles" />
              </TabsContent>
              
              <TabsContent value="doubles" className="space-y-0">
                <EnhancedLeaderboard formatType="doubles" />
              </TabsContent>
              
              <TabsContent value="mixed" className="space-y-0">
                <EnhancedLeaderboard formatType="mixed" />
              </TabsContent>
            </Tabs>
          </div>
        </TabsContent>

        {userRoles.isCoach && (
          <TabsContent value="coaching" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Coaching Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-blue-600" />
                    Coaching Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-xl font-bold text-blue-600">{currentData.totalStudents}</div>
                      <div className="text-xs text-muted-foreground">Total Students</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-xl font-bold text-green-600">{currentData.sessionsCompleted}</div>
                      <div className="text-xs text-muted-foreground">Sessions</div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <div className="text-xl font-bold text-yellow-600">{currentData.averageRating}</div>
                      <div className="text-xs text-muted-foreground">Avg Rating</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-xl font-bold text-purple-600">${currentData.hourlyRate}</div>
                      <div className="text-xs text-muted-foreground">Hourly Rate</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Sessions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-green-600" />
                    Recent Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {currentData.recentSessions.map((session, index) => (
                      <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{session.student}</div>
                          <div className="text-sm text-muted-foreground">{session.focus}</div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < session.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <div className="text-xs text-muted-foreground">{session.date}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}

        <TabsContent value="connect" className="space-y-4">
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
                    <Users className="h-4 w-4 mr-2" />
                    Request Match
                  </Button>
                  {userRoles.isCoach && (
                    <Button variant="outline" className="w-full">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Book Coaching Session
                    </Button>
                  )}
                </div>
              )}
              
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Availability</h4>
                <p className="text-sm text-muted-foreground">{currentData.availability}</p>
                {userRoles.isCoach && (
                  <div className="mt-3">
                    <h4 className="font-medium mb-2">Coaching Hours</h4>
                    <p className="text-sm text-muted-foreground">
                      Available for coaching sessions weekdays 6-8 PM, weekends 9 AM - 5 PM
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CoachStyledPassportDemo() {
  return <ModernPassportDemo />;
}

function UnifiedPassportDemo() {
  return <ModernPassportDemo />;
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
    <div className="container max-w-6xl px-2 md:px-4 py-3 md:py-6">
      <div className="mb-4 md:mb-6">
        <Button variant="ghost" asChild className="mb-3 md:mb-4">
          <Link to="/dashboard">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
        </Button>
        
        <div className="text-center mb-4 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-2 md:mb-4">
            Passport Design Variations
          </h1>
          <p className="text-sm md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Exploring standardized profile designs for consistent user experience across players and coaches
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-3 md:gap-6">
        {/* Variant Selector */}
        <div className="lg:col-span-1 order-2 lg:order-1">
          <Card>
            <CardHeader className="pb-3 md:pb-6">
              <CardTitle className="text-lg md:text-xl">Design Variations</CardTitle>
              <CardDescription className="text-sm">
                Choose a variant to see how the standardized passport design would look
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 md:space-y-3">
              {demoVariants.map((variant) => (
                <Button
                  key={variant.id}
                  variant={selectedVariant === variant.id ? "default" : "outline"}
                  className="w-full text-left justify-start h-auto p-3 md:p-4"
                  onClick={() => setSelectedVariant(variant.id)}
                >
                  <div>
                    <div className="font-semibold text-sm md:text-base">{variant.name}</div>
                    <div className="text-xs md:text-sm text-muted-foreground mt-1">
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

          <Card className="mt-3 md:mt-6">
            <CardHeader className="pb-3 md:pb-6">
              <CardTitle className="text-base md:text-lg">Design Goals</CardTitle>
            </CardHeader>
            <CardContent className="text-xs md:text-sm space-y-2">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-1 md:mt-2 flex-shrink-0"></div>
                <div>Consistent visual language across all profile types</div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-1 md:mt-2 flex-shrink-0"></div>
                <div>Mobile-first responsive design</div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-1 md:mt-2 flex-shrink-0"></div>
                <div>Focus on key information and achievements</div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-1 md:mt-2 flex-shrink-0"></div>
                <div>Easy navigation and interaction patterns</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Preview */}
        <div className="lg:col-span-2 order-1 lg:order-2">
          <Card>
            <CardHeader className="pb-3 md:pb-6">
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <Activity className="h-4 w-4 md:h-5 md:w-5" />
                <span className="hidden sm:inline">Live Preview: </span>
                {demoVariants.find(v => v.id === selectedVariant)?.name}
              </CardTitle>
              <CardDescription className="text-sm">
                Interactive preview of the selected passport design variation
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 md:p-6">
              {renderVariant()}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}