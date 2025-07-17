/**
 * Enhanced Mobile Coaching Interface - PKL-278651 Coach Discovery & Session Management
 * Video preview cards, instant booking, and real-time session management
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  Heart, 
  Star, 
  MapPin, 
  Clock, 
  Users,
  Award,
  Video,
  MessageCircle,
  Calendar,
  CheckCircle,
  Camera,
  Mic,
  MicOff,
  Send,
  Phone,
  PhoneOff,
  User,
  Target,
  TrendingUp,
  BookOpen,
  Settings,
  Filter,
  Search,
  ArrowLeft,
  Plus,
  Bookmark,
  BookmarkCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { cn } from '@/lib/utils';

interface Coach {
  id: string;
  name: string;
  bio: string;
  specialties: string[];
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  videoPreviewUrl?: string;
  profileImage?: string;
  experience: number;
  certifications: string[];
  location: string;
  nextAvailable: string;
  students: number;
  isBookmarked?: boolean;
}

interface Session {
  id: string;
  coachId: string;
  coachName: string;
  date: string;
  duration: number;
  status: 'scheduled' | 'in-progress' | 'completed';
  notes?: string;
  progressPhotos?: string[];
  recordings?: string[];
  assessments?: {
    technical: number;
    tactical: number;
    physical: number;
    mental: number;
  };
}

interface EnhancedMobileCoachingInterfaceProps {
  mode: 'discovery' | 'session-management' | 'active-session';
  initialCoachId?: string;
  onBookSession?: (coachId: string) => void;
  onBackToDiscovery?: () => void;
}

export default function EnhancedMobileCoachingInterface({
  mode,
  initialCoachId,
  onBookSession,
  onBackToDiscovery
}: EnhancedMobileCoachingInterfaceProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State management
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('');
  const [isVideoPlaying, setIsVideoPlaying] = useState<Record<string, boolean>>({});
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [sessionNotes, setSessionNotes] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [currentAssessment, setCurrentAssessment] = useState({
    technical: 0,
    tactical: 0,
    physical: 0,
    mental: 0
  });

  // Fetch coaches data
  const { data: coaches, isLoading: coachesLoading } = useQuery({
    queryKey: ['/api/coaches/enhanced-list'],
    queryFn: async (): Promise<Coach[]> => ([
      {
        id: '1',
        name: 'Sarah Johnson',
        bio: 'Professional pickleball coach with 8+ years experience. Specialized in mental game and tournament preparation.',
        specialties: ['Mental Game', 'Tournament Prep', 'Strategy'],
        rating: 4.9,
        reviewCount: 127,
        hourlyRate: 85,
        videoPreviewUrl: '/videos/coach-sarah-preview.mp4',
        profileImage: '/avatars/coach-sarah.jpg',
        experience: 8,
        certifications: ['PCP Level 4', 'Mental Performance', 'IPTPA Certified'],
        location: 'San Francisco, CA',
        nextAvailable: '2025-07-18T10:00:00Z',
        students: 34,
        isBookmarked: false
      },
      {
        id: '2',
        name: 'Mike Chen',
        bio: 'Former professional player turned coach. Expert in technical fundamentals and shot development.',
        specialties: ['Technical Skills', 'Shot Development', 'Footwork'],
        rating: 4.8,
        reviewCount: 89,
        hourlyRate: 75,
        videoPreviewUrl: '/videos/coach-mike-preview.mp4',
        profileImage: '/avatars/coach-mike.jpg',
        experience: 6,
        certifications: ['PCP Level 5', 'Technical Specialist'],
        location: 'San Francisco, CA',
        nextAvailable: '2025-07-18T14:00:00Z',
        students: 28,
        isBookmarked: true
      }
    ])
  });

  // Fetch user sessions
  const { data: sessions } = useQuery({
    queryKey: ['/api/coaching/my-sessions'],
    queryFn: async (): Promise<Session[]> => ([
      {
        id: '1',
        coachId: '1',
        coachName: 'Sarah Johnson',
        date: '2025-07-18T10:00:00Z',
        duration: 60,
        status: 'scheduled',
        notes: 'Focus on mental toughness during pressure points'
      },
      {
        id: '2',
        coachId: '2',
        coachName: 'Mike Chen',
        date: '2025-07-17T14:00:00Z',
        duration: 90,
        status: 'completed',
        notes: 'Worked on backhand consistency',
        assessments: {
          technical: 7,
          tactical: 6,
          physical: 8,
          mental: 7
        }
      }
    ])
  });

  // Bookmark coach mutation
  const bookmarkCoach = useMutation({
    mutationFn: async ({ coachId, bookmark }: { coachId: string, bookmark: boolean }) => {
      const response = await apiRequest('POST', `/api/coaches/${coachId}/bookmark`, { bookmark });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/coaches/enhanced-list'] });
    }
  });

  // Session booking mutation
  const bookSession = useMutation({
    mutationFn: async (sessionData: any) => {
      const response = await apiRequest('POST', '/api/coaching/book-session', sessionData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Session Booked!",
        description: "Your coaching session has been scheduled successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/coaching/my-sessions'] });
    }
  });

  // Toggle video playback
  const toggleVideo = (coachId: string) => {
    setIsVideoPlaying(prev => ({
      ...prev,
      [coachId]: !prev[coachId]
    }));
  };

  // Handle coach bookmark
  const handleBookmark = (coach: Coach) => {
    bookmarkCoach.mutate({ 
      coachId: coach.id, 
      bookmark: !coach.isBookmarked 
    });
  };

  // Render coach discovery
  const renderCoachDiscovery = () => (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search coaches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        {/* Specialty Pills */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {['All', 'Technical Skills', 'Mental Game', 'Strategy', 'Tournament Prep'].map((specialty) => (
            <motion.button
              key={specialty}
              onClick={() => setSelectedSpecialty(specialty === 'All' ? '' : specialty)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                (selectedSpecialty === specialty || (specialty === 'All' && !selectedSpecialty))
                  ? "bg-orange-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
              whileTap={{ scale: 0.95 }}
            >
              {specialty}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Coach Cards */}
      <div className="space-y-4">
        {coaches?.map((coach, index) => (
          <motion.div
            key={coach.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="overflow-hidden border-2 hover:border-orange-200 transition-all">
              <CardContent className="p-0">
                {/* Video Preview Section */}
                <div className="relative h-48 bg-gray-100">
                  {coach.videoPreviewUrl ? (
                    <div className="relative w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                      <motion.button
                        onClick={() => toggleVideo(coach.id)}
                        className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30"
                        whileTap={{ scale: 0.9 }}
                      >
                        {isVideoPlaying[coach.id] ? (
                          <Pause className="w-8 h-8 text-white" />
                        ) : (
                          <Play className="w-8 h-8 text-white ml-1" />
                        )}
                      </motion.button>
                      
                      {/* Video indicator */}
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-white/90 text-gray-900">
                          <Video className="w-3 h-3 mr-1" />
                          Preview
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <User className="w-12 h-12 text-gray-400" />
                    </div>
                  )}

                  {/* Bookmark Button */}
                  <motion.button
                    onClick={() => handleBookmark(coach)}
                    className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center"
                    whileTap={{ scale: 0.9 }}
                  >
                    {coach.isBookmarked ? (
                      <BookmarkCheck className="w-5 h-5 text-orange-500" />
                    ) : (
                      <Bookmark className="w-5 h-5 text-gray-600" />
                    )}
                  </motion.button>
                </div>

                {/* Coach Info Section */}
                <div className="p-4 space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">{coach.name}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex items-center">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i}
                              className={cn(
                                "w-4 h-4",
                                i < Math.floor(coach.rating) ? "text-yellow-400 fill-current" : "text-gray-300"
                              )}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">
                          {coach.rating} ({coach.reviewCount} reviews)
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-orange-600">${coach.hourlyRate}</div>
                      <div className="text-xs text-gray-500">per hour</div>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-sm text-gray-600 line-clamp-2">{coach.bio}</p>

                  {/* Specialties */}
                  <div className="flex flex-wrap gap-1">
                    {coach.specialties.slice(0, 3).map((specialty) => (
                      <Badge key={specialty} variant="secondary" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                    {coach.specialties.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{coach.specialties.length - 3} more
                      </Badge>
                    )}
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-3 pt-2 border-t border-gray-100">
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-900">{coach.experience}y</div>
                      <div className="text-xs text-gray-500">Experience</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-900">{coach.students}</div>
                      <div className="text-xs text-gray-500">Students</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-900 flex items-center justify-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        Local
                      </div>
                      <div className="text-xs text-gray-500">Available</div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-3 pt-3">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedCoach(coach)}
                      className="w-full"
                    >
                      <User className="w-4 h-4 mr-2" />
                      View Profile
                    </Button>
                    <Button
                      onClick={() => onBookSession?.(coach.id)}
                      className="w-full bg-orange-500 hover:bg-orange-600"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Book Session
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );

  // Render session management
  const renderSessionManagement = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">My Sessions</h2>
        <Button 
          onClick={onBackToDiscovery}
          className="bg-orange-500 hover:bg-orange-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Book New
        </Button>
      </div>

      {/* Session Tabs */}
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {sessions?.filter(s => s.status === 'scheduled').map((session) => (
            <Card key={session.id} className="border-l-4 border-l-orange-500">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{session.coachName}</h4>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(session.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {session.duration} min
                      </div>
                    </div>
                    {session.notes && (
                      <p className="text-sm text-gray-600 mt-2">{session.notes}</p>
                    )}
                  </div>
                  <Badge className="bg-orange-100 text-orange-800">
                    {session.status}
                  </Badge>
                </div>

                <div className="flex space-x-2 mt-4">
                  <Button size="sm" variant="outline" className="flex-1">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1 bg-orange-500 hover:bg-orange-600"
                    onClick={() => setActiveSession(session)}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Join
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {sessions?.filter(s => s.status === 'completed').map((session) => (
            <Card key={session.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{session.coachName}</h4>
                    <div className="text-sm text-gray-600 mt-1">
                      {new Date(session.date).toLocaleDateString()} • {session.duration} min
                    </div>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>

                {session.assessments && (
                  <div className="mt-4 space-y-2">
                    <h5 className="text-sm font-medium text-gray-700">Performance Assessment</h5>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex justify-between">
                        <span>Technical:</span>
                        <span className="font-medium">{session.assessments.technical}/10</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tactical:</span>
                        <span className="font-medium">{session.assessments.tactical}/10</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Physical:</span>
                        <span className="font-medium">{session.assessments.physical}/10</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Mental:</span>
                        <span className="font-medium">{session.assessments.mental}/10</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="progress">
          <Card>
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto" />
                <div>
                  <h3 className="font-medium text-gray-900">Progress Tracking</h3>
                  <p className="text-sm text-gray-600">
                    Detailed progress analytics coming soon
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );

  // Render active session
  const renderActiveSession = () => (
    <div className="space-y-6">
      {/* Session Header */}
      <div className="flex items-center justify-between">
        <Button 
          variant="outline"
          onClick={() => setActiveSession(null)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Badge className="bg-green-100 text-green-800 animate-pulse">
          Live Session
        </Badge>
        <Button 
          variant="destructive"
          onClick={() => {
            setActiveSession(null);
            toast({
              title: "Session Ended",
              description: "Your coaching session has been ended.",
            });
          }}
        >
          <PhoneOff className="w-4 h-4 mr-2" />
          End
        </Button>
      </div>

      {/* Session Info */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src="/avatars/coach-sarah.jpg" />
              <AvatarFallback>SJ</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">{activeSession?.coachName}</h3>
              <p className="text-sm text-gray-600">
                {activeSession?.duration} minute session
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Real-Time Assessment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(currentAssessment).map(([skill, value]) => (
            <div key={skill} className="space-y-2">
              <div className="flex justify-between">
                <Label className="capitalize">{skill}</Label>
                <span className="text-sm font-medium">{value}/10</span>
              </div>
              <Slider
                value={[value]}
                onValueChange={(newValue) => 
                  setCurrentAssessment(prev => ({ ...prev, [skill]: newValue[0] }))
                }
                max={10}
                step={1}
                className="w-full"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Session Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Session Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Add notes about this session..."
            value={sessionNotes}
            onChange={(e) => setSessionNotes(e.target.value)}
            rows={4}
          />
          
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => {
                // Camera functionality
                toast({
                  title: "Photo Capture",
                  description: "Camera feature coming soon!",
                });
              }}
            >
              <Camera className="w-4 h-4 mr-2" />
              Photo
            </Button>
            
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => setIsRecording(!isRecording)}
            >
              {isRecording ? (
                <MicOff className="w-4 h-4 mr-2" />
              ) : (
                <Mic className="w-4 h-4 mr-2" />
              )}
              {isRecording ? 'Stop' : 'Record'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (coachesLoading) {
    return (
      <div className="space-y-4">
        {Array(3).fill(0).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-48 bg-gray-200 rounded mb-4" />
              <div className="h-6 bg-gray-200 rounded mb-2" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {mode === 'discovery' && renderCoachDiscovery()}
      {mode === 'session-management' && renderSessionManagement()}
      {mode === 'active-session' && activeSession && renderActiveSession()}
    </div>
  );
}