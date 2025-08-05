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
      {/* Hero Section */}
      <Card className="overflow-hidden bg-gradient-to-br from-orange-50 to-amber-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
              <AvatarFallback className="bg-gradient-to-br from-orange-500 to-amber-500 text-white text-xl font-bold">
                {currentData.firstName[0]}{currentData.lastName[0]}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {currentData.firstName} {currentData.lastName}
                </h1>
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                  Rank #{Math.floor(Math.random() * 50) + 1}
                </Badge>
              </div>
              
              <div className="flex items-center gap-4 text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{currentData.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Playing since {currentData.playingSince}</span>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{currentData.currentRating}</div>
                  <div className="text-xs text-muted-foreground">Current Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{currentData.totalMatches}</div>
                  <div className="text-xs text-muted-foreground">Total Matches</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{currentData.winRate}%</div>
                  <div className="text-xs text-muted-foreground">Win Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{currentData.picklePoints}</div>
                  <div className="text-xs text-muted-foreground">Pickle Points</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabbed Content */}
      <Tabs defaultValue="about" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
          {userRoles.isCoach && <TabsTrigger value="coaching">Coaching</TabsTrigger>}
          <TabsTrigger value="connect">Connect</TabsTrigger>
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
                  <p className="text-sm">{currentData.playingStyle}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Favorite Shots</h4>
                  <div className="flex flex-wrap gap-2">
                    {currentData.favoriteShots.map((shot, index) => (
                      <Badge key={index} variant="outline">{shot}</Badge>
                    ))}
                  </div>
                </div>

                {/* Coach Information (if coach) */}
                {userRoles.isCoach && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">Coaching Bio</h4>
                    <p className="text-sm">{currentData.coachingBio}</p>
                    
                    <div className="mt-3">
                      <h4 className="font-medium text-sm text-muted-foreground mb-2">Coaching Since</h4>
                      <p className="text-sm">{currentData.coachingSince}</p>
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
          <div className="grid md:grid-cols-2 gap-6">
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