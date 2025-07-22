import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Award, 
  BookOpen, 
  Users, 
  Clock, 
  CheckCircle,
  Star,
  Trophy,
  GraduationCap,
  UserCheck,
  Briefcase,
  Heart,
  Zap,
  TrendingUp,
  Shield,
  Crown,
  ArrowRight,
  PlayCircle,
  FileText,
  Calendar,
  Target,
  ClipboardCheck
} from 'lucide-react';
import { Link } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';

interface CoachApplicationStatus {
  id?: number;
  status: 'none' | 'submitted' | 'approved' | 'rejected';
  submittedAt?: string;
  reviewedAt?: string;
  feedback?: string;
}

interface CoachCertificationStatus {
  currentLevel?: number;
  completedLevels: string[];
  inProgress?: {
    levelId: number;
    progress: number;
    status: string;
  };
  availableLevels: number[];
}

interface CoachProfile {
  id?: number;
  bio?: string;
  specialties?: string[];
  certifications?: string[];
  profileComplete: boolean;
  isActiveCoach: boolean;
}

export default function CoachHubPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch coach application status
  const { data: applicationStatus } = useQuery<CoachApplicationStatus>({
    queryKey: ['/api/coach/application-status'],
    enabled: !!user
  });

  // Fetch coach certification status
  const { data: certificationResponse } = useQuery({
    queryKey: ['/api/pcp-certification/my-status'],
    enabled: !!user,
    staleTime: 0, // Always refetch
    cacheTime: 0 // Don't cache
  });
  
  const certificationStatus = certificationResponse?.data as CoachCertificationStatus;

  // Fetch coach profile if they're an active coach
  const { data: coachProfile } = useQuery<CoachProfile>({
    queryKey: ['/api/coaches/my-profile'],
    enabled: !!user && !!(applicationStatus?.status === 'approved' || user?.isCoach)
  });

  // Determine user status for smart routing
  const getUserStatus = () => {
    if (!user) return 'guest';
    
    // Check if user is already a coach from database (is_coach = true)
    if (user.isCoach) return 'active_coach';
    
    // Check certifications for Level 5 certified coaches
    if (coachProfile?.certifications?.some(cert => cert.includes('Level 5'))) return 'active_coach';
    
    // Check if they have any PCP certifications
    if (certificationStatus?.currentLevel && certificationStatus.currentLevel >= 1) return 'active_coach';
    
    // Check application status for non-certified users
    if (applicationStatus?.status === 'approved') return 'approved_coach';
    if (applicationStatus?.status === 'submitted') return 'pending_coach';
    if (applicationStatus?.status === 'rejected') return 'rejected_coach';
    
    return 'prospective_coach';
  };

  const userStatus = getUserStatus();

  // Render content based on user status
  const renderContent = () => {
    switch (userStatus) {
      case 'guest':
        return <GuestCoachView />;
      case 'prospective_coach':
        return <ProspectiveCoachView />;
      case 'pending_coach':
        return <PendingCoachView applicationStatus={applicationStatus!} />;
      case 'rejected_coach':
        return <RejectedCoachView applicationStatus={applicationStatus!} />;
      case 'approved_coach':
        return <ApprovedCoachView certificationStatus={certificationStatus} />;
      case 'active_coach':
        return <ActiveCoachView coachProfile={coachProfile || { profileComplete: false, isActiveCoach: false }} certificationStatus={certificationStatus} />;
      default:
        return <ProspectiveCoachView />;
    }
  };

  return (
    <div className="container max-w-6xl py-6">
      <title>Coach Hub | Pickle+</title>
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Coach Hub</h1>
        <p className="text-muted-foreground">Your complete coaching journey starts here</p>
      </div>

      {renderContent()}
    </div>
  );
}

// Guest view - show recruitment landing
function GuestCoachView() {
  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-600 text-white">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-2xl text-blue-600 dark:text-blue-400">
                Become a Certified PCP Coach
              </CardTitle>
              <CardDescription className="text-lg">
                Transform passionate players into world-class coaches through our structured 5-level certification pathway
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <div className="flex gap-3">
              <Shield className="h-5 w-5 text-blue-600 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Structured Pathway</h3>
                <p className="text-sm text-muted-foreground">Every coach starts at Level 1 and progresses through our proven 5-level system</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Trophy className="h-5 w-5 text-blue-600 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Professional Recognition</h3>
                <p className="text-sm text-muted-foreground">Join a network of certified coaches with verified credentials</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Users className="h-5 w-5 text-blue-600 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Student Community</h3>
                <p className="text-sm text-muted-foreground">Connect with players seeking professional coaching guidance</p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link to="/coach/apply">
                Apply to Become a Coach
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/pcp-certification">
                Learn About PCP Certification
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <RecruitmentFeatures />
    </div>
  );
}

// Prospective coach view - show application process
function ProspectiveCoachView() {
  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-600 text-white">
              <Briefcase className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-2xl text-green-600 dark:text-green-400">
                Start Your Coaching Journey
              </CardTitle>
              <CardDescription className="text-lg">
                Begin with our structured coach application and Level 1 certification pathway
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Your Next Steps:</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border">
                <FileText className="h-5 w-5 text-green-600" />
                <div>
                  <div className="font-medium">1. Submit Coach Application</div>
                  <div className="text-sm text-muted-foreground">Complete our 5-step application process</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border">
                <Clock className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="font-medium text-gray-600 dark:text-gray-300">2. Application Review</div>
                  <div className="text-sm text-muted-foreground">Administrator reviews your application</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border">
                <GraduationCap className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="font-medium text-gray-600 dark:text-gray-300">3. Begin Level 1 Certification</div>
                  <div className="text-sm text-muted-foreground">Start your coaching education journey</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <Button asChild className="bg-green-600 hover:bg-green-700 w-full">
              <Link to="/coach/apply">
                Start Application Process
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link to="/pcp-certification">
                View PCP Certification Levels
                <BookOpen className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <ApplicationPreview />
    </div>
  );
}

// Pending coach view - show application status
function PendingCoachView({ applicationStatus }: { applicationStatus: CoachApplicationStatus }) {
  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border-amber-200 dark:border-amber-800">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-600 text-white">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-2xl text-amber-600 dark:text-amber-400">
                Application Under Review
              </CardTitle>
              <CardDescription className="text-lg">
                Your coach application is being reviewed by our team
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                Submitted {applicationStatus.submittedAt ? new Date(applicationStatus.submittedAt).toLocaleDateString() : 'Recently'}
              </Badge>
            </div>
            <p className="text-muted-foreground mb-4">
              Thank you for your interest in becoming a coach! Our team is reviewing your application and will get back to you soon.
            </p>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
              <h3 className="font-semibold mb-2">What's Next?</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• We'll review your application within 3-5 business days</li>
                <li>• If approved, you'll receive Level 1 certification access</li>
                <li>• You'll get an email notification with next steps</li>
                <li>• Prepare for your coaching journey with our study materials</li>
              </ul>
            </div>
          </div>
          
          <Button variant="outline" asChild>
            <Link to="/pcp-certification">
              Review Level 1 Preparation Materials
            </Link>
          </Button>
        </CardContent>
      </Card>

      <PreparationResources />
    </div>
  );
}

// Rejected coach view - show reapplication options
function RejectedCoachView({ applicationStatus }: { applicationStatus: CoachApplicationStatus }) {
  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 border-red-200 dark:border-red-800">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-600 text-white">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-2xl text-red-600 dark:text-red-400">
                Application Not Approved
              </CardTitle>
              <CardDescription className="text-lg">
                We appreciate your interest in becoming a coach
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {applicationStatus.feedback && (
            <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg border">
              <h3 className="font-semibold mb-2">Feedback from Our Team:</h3>
              <p className="text-muted-foreground">{applicationStatus.feedback}</p>
            </div>
          )}
          
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Ways to Strengthen Your Application:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Gain more playing experience and improve your skill level</li>
              <li>• Consider taking pickleball lessons to enhance your understanding</li>
              <li>• Participate in local tournaments to build competitive experience</li>
              <li>• Review our coaching requirements and preparation materials</li>
            </ul>
          </div>
          
          <div className="flex gap-3">
            <Button asChild>
              <Link to="/coach/apply">
                Reapply for Coaching
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/pcp-certification">
                View Preparation Materials
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Approved coach view - show Level 1 certification start
function ApprovedCoachView({ certificationStatus }: { certificationStatus?: CoachCertificationStatus }) {
  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-600 text-white">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-2xl text-blue-600 dark:text-blue-400">
                Congratulations! Application Approved
              </CardTitle>
              <CardDescription className="text-lg">
                You're ready to begin your Level 1 PCP Certification
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border mb-4">
              <h3 className="font-semibold mb-2">Ready to Start Level 1:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium">Certification Focus:</div>
                  <div className="text-muted-foreground">Coaching Fundamentals</div>
                </div>
                <div>
                  <div className="font-medium">Time Commitment:</div>
                  <div className="text-muted-foreground">2-3 weeks</div>
                </div>
                <div>
                  <div className="font-medium">Cost:</div>
                  <div className="text-muted-foreground">$699</div>
                </div>
                <div>
                  <div className="font-medium">Format:</div>
                  <div className="text-muted-foreground">Online study + exam</div>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-semibold">Your Certification Journey:</h3>
              <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200">
                <PlayCircle className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-medium text-blue-700 dark:text-blue-300">Level 1: Coaching Fundamentals</div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">Ready to begin</div>
                </div>
              </div>
              {[2, 3, 4, 5].map(level => (
                <div key={level} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border">
                  <GraduationCap className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-600 dark:text-gray-300">Level {level}: {getLevelName(level)}</div>
                    <div className="text-sm text-muted-foreground">Unlocks after Level {level - 1}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <Button asChild className="bg-blue-600 hover:bg-blue-700 w-full">
            <Link to="/pcp-certification">
              Begin Level 1 Certification
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Active coach view - show coaching tools and management
function ActiveCoachView({ coachProfile, certificationStatus }: { coachProfile: CoachProfile; certificationStatus?: CoachCertificationStatus }) {
  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-600 text-white">
              <Crown className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-2xl text-green-600 dark:text-green-400">
                Welcome Back, Coach!
              </CardTitle>
              <CardDescription className="text-lg">
                Manage your students and grow your coaching practice
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">8</div>
              <div className="text-sm text-muted-foreground">Active Students</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">Level {certificationStatus?.currentLevel || 1}</div>
              <div className="text-sm text-muted-foreground">Certification</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">4.9</div>
              <div className="text-sm text-muted-foreground">Coach Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">23</div>
              <div className="text-sm text-muted-foreground">Sessions This Month</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="font-semibold">Manage Students</div>
                <div className="text-sm text-muted-foreground">View profiles & progress</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
                <ClipboardCheck className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="font-semibold">Assessment Tool</div>
                <div className="text-sm text-muted-foreground">PCP 4-dimensional analysis</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900">
                <Calendar className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <div className="font-semibold">Schedule Sessions</div>
                <div className="text-sm text-muted-foreground">Book coaching time</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Certification Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { student: "Sarah Chen", date: "Today, 2:00 PM", status: "Completed" },
                { student: "Mike Rodriguez", date: "Yesterday, 4:30 PM", status: "Completed" },
                { student: "Lisa Park", date: "Tomorrow, 10:00 AM", status: "Upcoming" }
              ].map((session, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <div className="font-medium">{session.student}</div>
                    <div className="text-sm text-muted-foreground">{session.date}</div>
                  </div>
                  <Badge variant={session.status === "Completed" ? "default" : "secondary"}>
                    {session.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Certification Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Current Level: {certificationStatus?.currentLevel || 1}</span>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/pcp-certification">View Details</Link>
                </Button>
              </div>
              
              {certificationStatus?.currentLevel && certificationStatus.currentLevel < 5 && (
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progress to Level {certificationStatus.currentLevel + 1}</span>
                    <span>75%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full w-3/4"></div>
                  </div>
                </div>
              )}
              
              <div className="text-sm text-muted-foreground">
                {certificationStatus?.currentLevel === 5 
                  ? "🎉 Master Coach Certified!" 
                  : "Continue your certification journey to unlock advanced coaching techniques"}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Helper components
function RecruitmentFeatures() {
  const features = [
    {
      icon: Shield,
      title: "Credible Certification",
      description: "All coaches complete the same rigorous 5-level training program starting with Level 1 fundamentals."
    },
    {
      icon: Users,
      title: "Student Community",
      description: "Connect with players actively seeking professional coaching guidance and skill development."
    },
    {
      icon: TrendingUp,
      title: "Professional Growth",
      description: "Advance through our structured certification levels with clear progression milestones."
    },
    {
      icon: Heart,
      title: "Meaningful Impact",
      description: "Help players of all skill levels improve their game and discover their love for pickleball."
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {features.map((feature, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                <feature.icon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ApplicationPreview() {
  const steps = [
    { title: "Personal Information", description: "Basic details and playing experience" },
    { title: "Coaching Motivation", description: "Why you want to become a coach" },
    { title: "Availability & Commitment", description: "Time you can dedicate to coaching" },
    { title: "References & Background", description: "Professional and personal references" },
    { title: "Level 1 Commitment", description: "Confirm your commitment to the certification path" }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Application Process Overview</CardTitle>
        <CardDescription>5 simple steps to begin your coaching journey</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div key={index} className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                {index + 1}
              </div>
              <div>
                <div className="font-medium">{step.title}</div>
                <div className="text-sm text-muted-foreground">{step.description}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function PreparationResources() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Prepare for Level 1 Certification</CardTitle>
        <CardDescription>Get ready for your coaching certification with these resources</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200">
            <BookOpen className="h-5 w-5 text-blue-600 mb-2" />
            <h3 className="font-semibold mb-1">Study Guide</h3>
            <p className="text-sm text-muted-foreground">Comprehensive materials covering coaching fundamentals</p>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200">
            <PlayCircle className="h-5 w-5 text-green-600 mb-2" />
            <h3 className="font-semibold mb-1">Practice Tests</h3>
            <p className="text-sm text-muted-foreground">Sample questions to test your knowledge</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CoachingDashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-600" />
            <div>
              <div className="text-2xl font-bold">12</div>
              <div className="text-sm text-muted-foreground">Active Students</div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <Calendar className="h-8 w-8 text-green-600" />
            <div>
              <div className="text-2xl font-bold">8</div>
              <div className="text-sm text-muted-foreground">Sessions This Week</div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <Star className="h-8 w-8 text-yellow-600" />
            <div>
              <div className="text-2xl font-bold">4.9</div>
              <div className="text-sm text-muted-foreground">Average Rating</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StudentsManagement() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Management</CardTitle>
        <CardDescription>Manage your coaching relationships and track student progress</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-3">
          <Button asChild>
            <Link to="/coach/students">
              View All Students
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/coach/assessment-tool">
              Assessment Tool
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function CertificationProgress({ certificationStatus }: { certificationStatus?: CoachCertificationStatus }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Certification Progress</CardTitle>
        <CardDescription>Continue advancing through the PCP certification levels</CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild>
          <Link to="/pcp-certification">
            View Certification Dashboard
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function CoachResources() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Coach Resources</CardTitle>
        <CardDescription>Tools and materials to support your coaching practice</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button variant="outline" className="justify-start">
            <FileText className="mr-2 h-4 w-4" />
            Training Materials
          </Button>
          <Button variant="outline" className="justify-start">
            <Target className="mr-2 h-4 w-4" />
            Assessment Templates
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function getLevelName(level: number): string {
  const names = {
    2: "Skill Development",
    3: "Advanced Techniques", 
    4: "Leadership & Strategy",
    5: "Master Coach"
  };
  return names[level as keyof typeof names] || `Level ${level}`;
}