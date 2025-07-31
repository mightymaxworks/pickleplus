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
    staleTime: 0 // Always refetch
  });
  
  const certificationStatus = (certificationResponse as any)?.data as CoachCertificationStatus;

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
      <title>Coach Hub | Pickle+</title>
      
      <div className="container max-w-6xl py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">Coach Hub</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Your complete coaching journey starts here</p>
        </div>

        {renderContent()}
      </div>
    </div>
  );
}

// Guest view - show recruitment landing
function GuestCoachView() {
  return (
    <div className="space-y-8">
      <Card className="backdrop-blur-md bg-gradient-to-br from-white/80 to-white/60 dark:from-gray-800/80 dark:to-gray-900/60 border-white/20 shadow-2xl shadow-blue-500/10">
        <CardHeader className="pb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg">
              <GraduationCap className="h-7 w-7" />
            </div>
            <div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Become a Certified PCP Coach
              </CardTitle>
              <CardDescription className="text-lg text-gray-600 dark:text-gray-300 mt-2">
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
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 border-0">
              <Link to="/coach/apply">
                Apply to Become a Coach
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 hover:bg-white/70 dark:hover:bg-gray-700/70 transition-all duration-300">
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

// Prospective coach view - show application process with enhanced PCP marketing
function ProspectiveCoachView() {
  return (
    <div className="space-y-8">
      {/* Enhanced PCP Value Proposition Card */}
      <Card className="backdrop-blur-md bg-gradient-to-br from-emerald-50/90 via-blue-50/90 to-purple-50/90 border-2 border-emerald-200 shadow-2xl shadow-emerald-500/20">
        <CardHeader className="pb-6">
          <div className="text-center">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-blue-600 text-white px-6 py-3 rounded-full mb-4">
              <Crown className="h-6 w-6" />
              <span className="font-bold text-lg">ELITE COACHING OPPORTUNITY</span>
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-2">
              Earn $85-120/Hour as a PCP Certified Coach
            </CardTitle>
            <CardDescription className="text-lg text-gray-700 max-w-2xl mx-auto">
              Join the top 15% of elite pickleball coaches with PCP Certification and unlock premium earning potential plus exclusive FPF facility access.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {/* Income Comparison */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white/80 rounded-xl p-6 border border-gray-200 shadow-md">
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-gray-700 mb-2">Standard Coach</h3>
                <div className="text-3xl font-bold text-gray-600">$50-75</div>
                <div className="text-sm text-gray-500">per hour</div>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span>Basic profile listing</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span>Limited facility access</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span>Self-sourced students</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-emerald-100 to-blue-100 rounded-xl p-6 border-2 border-emerald-300 shadow-lg relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white px-4 py-1">RECOMMENDED</Badge>
              </div>
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-emerald-800 mb-2">PCP Certified Coach</h3>
                <div className="text-3xl font-bold text-emerald-700">$85-120</div>
                <div className="text-sm text-emerald-600">per hour</div>
                <div className="text-xs text-emerald-700 font-medium mt-1">+40-60% premium</div>
              </div>
              <div className="space-y-2 text-sm text-emerald-700">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Verified PCP badge & priority listing</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Exclusive FPF facility coaching rights</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Premium student referrals</span>
                </div>
              </div>
            </div>
          </div>

          {/* FPF Facility Benefits */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-blue-900 mb-3">Exclusive FPF Facility Access</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-blue-800">Coaching rights at 300+ premier facilities</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-blue-800">Premium court access during peak hours</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-blue-800">Marketing support from facilities</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-blue-800">Referrals from facility members</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick ROI Calculation */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-6 mb-8">
            <div className="text-center">
              <h3 className="text-xl font-bold text-orange-900 mb-4">Investment Returns in Just 8 Days</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-orange-700">$699</div>
                  <div className="text-sm text-orange-600">Level 1 Investment</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-700">+$2,800</div>
                  <div className="text-sm text-green-600">Monthly Increase</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-700">8 Days</div>
                  <div className="text-sm text-blue-600">ROI Timeline</div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Button asChild size="lg" className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 border-0 w-full py-4 text-lg">
              <Link to="/coach/apply">
                Start Premium Coach Application
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" asChild size="lg" className="w-full border-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50 py-4 text-lg">
              <Link to="/pcp-certification">
                Learn About PCP Certification
                <BookOpen className="ml-2 h-5 w-5" />
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
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 dark:from-green-950/30 dark:via-emerald-950/30 dark:to-green-900/30 border border-green-200/50 dark:border-green-800/50">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative p-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg">
                <Crown className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Welcome Back, Coach!
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  Manage your students and grow your coaching practice
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Today</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            </div>
          </div>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">8</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Active Students</div>
                </div>
              </div>
            </div>
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/30">
                  <GraduationCap className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">Level {certificationStatus?.currentLevel || 1}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Certification</div>
                </div>
              </div>
            </div>
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/30">
                  <Star className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">4.9</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Coach Rating</div>
                </div>
              </div>
            </div>
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-green-100 dark:bg-green-900/30">
                  <Calendar className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">23</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Sessions This Month</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Coaching Tools</h2>
          <div className="text-sm text-gray-500 dark:text-gray-400">Everything you need to coach effectively</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link to="/coach/students" className="group">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200/50 dark:border-blue-800/50 p-6 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg group-hover:shadow-blue-500/25 transition-shadow">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Manage Students</h3>
                    <p className="text-gray-600 dark:text-gray-400">View profiles & track progress</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                8 active students
              </div>
            </div>
          </Link>

          <Link to="/coach/curriculum" className="group">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200/50 dark:border-green-800/50 p-6 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10 hover:-translate-y-1">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg group-hover:shadow-green-500/25 transition-shadow">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Drill Library</h3>
                    <p className="text-gray-600 dark:text-gray-400">Browse & plan practice drills</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                39 curated drills
              </div>
            </div>
          </Link>

          <Link to="/coach/assessment-tool" className="group">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-950/30 dark:to-violet-950/30 border border-purple-200/50 dark:border-purple-800/50 p-6 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 hover:-translate-y-1">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 text-white shadow-lg group-hover:shadow-purple-500/25 transition-shadow">
                    <ClipboardCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Assessment Tool</h3>
                    <p className="text-gray-600 dark:text-gray-400">PCP 4-dimensional analysis</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400">
                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                Advanced analytics
              </div>
            </div>
          </Link>

          <div className="group cursor-pointer">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-950/30 dark:to-amber-950/30 border border-orange-200/50 dark:border-orange-800/50 p-6 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10 hover:-translate-y-1">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-lg group-hover:shadow-orange-500/25 transition-shadow">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Schedule Sessions</h3>
                    <p className="text-gray-600 dark:text-gray-400">Book coaching appointments</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400">
                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                Coming soon
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity & Certification Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="backdrop-blur-sm bg-gradient-to-br from-green-50/80 to-emerald-100/60 border-green-200/50 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent">
              Recent Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { student: "Sarah Chen", date: "Today, 2:00 PM", status: "Completed" },
                { student: "Mike Rodriguez", date: "Yesterday, 4:30 PM", status: "Completed" },
                { student: "Lisa Park", date: "Tomorrow, 10:00 AM", status: "Upcoming" }
              ].map((session, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-white/60 border border-green-200/30 rounded-lg shadow-sm">
                  <div>
                    <div className="font-medium text-green-900">{session.student}</div>
                    <div className="text-sm text-green-700/70">{session.date}</div>
                  </div>
                  <Badge variant={session.status === "Completed" ? "default" : "secondary"} className={
                    session.status === "Completed" 
                      ? "bg-green-100 text-green-800 border-green-200" 
                      : "bg-emerald-100 text-emerald-800 border-emerald-200"
                  }>
                    {session.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-gradient-to-br from-blue-50/80 to-indigo-100/60 border-blue-200/50 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
              PCP Certification Journey
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Current Level: 
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">
                    Level {certificationStatus?.currentLevel || 1}
                  </span>
                </span>
                <Button variant="outline" size="sm" asChild className="border-blue-300 text-blue-700 hover:bg-blue-50">
                  <Link to="/pcp-certification">View Journey</Link>
                </Button>
              </div>
              
              {certificationStatus?.currentLevel && certificationStatus.currentLevel < 5 && (
                <div className="bg-white/60 p-3 rounded-lg border border-blue-200/50">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-blue-700 font-medium">Next: Level {certificationStatus.currentLevel + 1}</span>
                    <span className="text-blue-600">Sequential Progression</span>
                  </div>
                  <div className="w-full bg-blue-100/50 rounded-full h-3">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full w-3/4 shadow-sm"></div>
                  </div>
                  <p className="text-xs text-blue-600 mt-2">
                    Complete Level {certificationStatus.currentLevel} to unlock Level {certificationStatus.currentLevel + 1}
                  </p>
                </div>
              )}
              
              <div className="text-sm text-blue-700/80 bg-blue-50/50 p-3 rounded-lg border border-blue-200/30">
                {certificationStatus?.currentLevel === 5 
                  ? "🏆 Master Coach Certified! You've achieved the highest level of PCP certification." 
                  : `📚 PCP follows sequential progression: Level ${(certificationStatus?.currentLevel || 0) + 1} becomes available after completing Level ${certificationStatus?.currentLevel || 1}`}
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