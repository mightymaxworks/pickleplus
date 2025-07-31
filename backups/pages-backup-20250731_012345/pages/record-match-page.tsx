import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useLocation } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { QuickMatchRecorder } from '@/components/match/QuickMatchRecorder';
import { PostMatchAssessment } from '@/components/match/PostMatchAssessment';
import { CoachMatchRecording } from '@/components/coach-match-integration/CoachMatchRecording';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  ArrowRight, 
  ListChecks,
  Users,
  Zap, 
  Calendar,
  Award,
  CheckCircle,
  BarChart3,
  GraduationCap,
  Activity
} from 'lucide-react';
import { 
  motion, 
  AnimatePresence 
} from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { matchSDK } from '@/lib/sdk/matchSDK';
import { eventBus } from '@/core/events/eventBus';

/**
 * Enhanced Record Match Page using the wizard interface 
 * Reference: PKL-278651-UI-UX-Framework
 * Module: match@0.8.0
 * 
 * PKL-278651-COURTIQ-0002-ASSESS
 * Updated to include post-match assessment for CourtIQ™
 */
export default function RecordMatchPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  
  // Wizard state
  const [step, setStep] = useState(1);
  const totalSteps = 3;
  
  // Match data state
  const [matchData, setMatchData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Post-match assessment state
  const [showAssessment, setShowAssessment] = useState(false);
  const [assessmentComplete, setAssessmentComplete] = useState(false);
  
  // Pre-filled player data from QR scan
  const [prefilledPlayer, setPrefilledPlayer] = useState<any>(null);
  
  // Coach-match integration state
  const [coachMode, setCoachMode] = useState(false);
  const [isCoach, setIsCoach] = useState(false);
  const [activeMatchId, setActiveMatchId] = useState<number | null>(null);
  
  // Initialize with user's data and check for QR scan data
  useEffect(() => {
    // Check for pre-filled player data from QR scan
    const storedPlayerData = sessionStorage.getItem('matchRecordingPlayer');
    if (storedPlayerData) {
      try {
        const playerData = JSON.parse(storedPlayerData);
        setPrefilledPlayer(playerData);
        // Clear the data after using it
        sessionStorage.removeItem('matchRecordingPlayer');
        
        toast({
          title: "Player Pre-filled",
          description: `Match recording started with ${playerData.displayName}`,
          variant: "default",
        });
      } catch (error) {
        console.error('Failed to parse stored player data:', error);
      }
    }
    
    // Check if user is a coach
    if (user?.coachProfile) {
      setIsCoach(true);
    }
    
    // Check for coach mode parameter
    const urlParams = new URLSearchParams(window.location.search);
    const coachModeParam = urlParams.get('coach');
    if (coachModeParam === 'true') {
      setCoachMode(true);
    }
    
    // Publish event that match recording has started
    eventBus.publish('match:record:started', { userId: user?.id });
    
    // Clean up when component unmounts
    return () => {
      // If the match wasn't completed, publish cancellation event
      if (!showSuccess) {
        eventBus.publish('match:record:cancelled', { userId: user?.id });
      }
    };
  }, [user, showSuccess, toast]);
  
  // Calculate progress
  const progressPercentage = ((step - 1) / (totalSteps - 1)) * 100;
  
  // Handle a completed match from the QuickMatchRecorder
  const handleMatchComplete = (data: any) => {
    setMatchData(data);
    
    // Show assessment instead of success immediately
    setShowAssessment(true);
    
    // Publish event that match recording was completed
    eventBus.publish('match:record:completed', { 
      userId: user?.id,
      matchId: data?.id,
      matchType: data?.matchType || 'casual'
    });
  };
  
  // Handle assessment completion
  const handleAssessmentComplete = () => {
    setAssessmentComplete(true);
    setShowAssessment(false);
    setShowSuccess(true);
    
    // Invalidate CourtIQ queries to ensure fresh data
    queryClient.invalidateQueries({ queryKey: ['/api/courtiq'] });
    
    // Redirect to matches page after a short delay (1.5 seconds)
    // This gives time for the success message to be seen
    setTimeout(() => {
      navigate('/matches');
    }, 1500);
  };
  
  // Handle assessment skip
  const handleAssessmentCancel = () => {
    setShowAssessment(false);
    setShowSuccess(true);
    
    // Redirect to matches page after a short delay (1 second)
    setTimeout(() => {
      navigate('/matches');
    }, 1000);
  };
  
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-6">
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
            <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <ListChecks className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              <span>Record Match</span>
            </h1>
            
            <Button 
              variant="ghost" 
              onClick={() => navigate('/matches')}
              className="text-muted-foreground self-start sm:self-auto"
              size="sm"
            >
              <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="text-sm">Back to Matches</span>
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground mt-1">
            Record your pickleball match results in a few simple steps
          </p>
        </div>
        
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm mb-2">
            <div className="font-medium">Match Recording Wizard</div>
            <div className="text-muted-foreground">Step {step} of {totalSteps}</div>
          </div>
          
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-primary"
              initial={{ width: '0%' }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
        
        {/* Success Message */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-900">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="h-12 w-12 bg-green-100 dark:bg-green-800/30 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-xl font-bold text-green-700 dark:text-green-400 mb-2">
                      Match Recorded Successfully!
                    </h3>
                    <p className="text-green-700 dark:text-green-400 max-w-md">
                      Your match has been recorded and is now visible in your match history.
                      Redirecting to your matches page...
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Coach Mode Toggle */}
        {isCoach && (
          <div className="mb-6">
            <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-900">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-blue-100 dark:bg-blue-800/30 rounded-full flex items-center justify-center">
                      <GraduationCap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-700 dark:text-blue-400">
                        Coach Mode Available
                      </h3>
                      <p className="text-sm text-blue-600 dark:text-blue-300">
                        Enable advanced coaching features and real-time assessment
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={coachMode ? "default" : "outline"}>
                      <Activity className="w-3 h-3 mr-1" />
                      {coachMode ? "Coach Mode On" : "Standard Mode"}
                    </Badge>
                    <Button
                      variant={coachMode ? "secondary" : "default"}
                      onClick={() => setCoachMode(!coachMode)}
                      size="sm"
                    >
                      {coachMode ? "Disable" : "Enable"} Coach Mode
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content - Only show match recorder if not in success or assessment state */}
        {!showSuccess && !showAssessment && (
          <Card className="border-0 shadow-lg overflow-hidden">
            <CardContent className="p-0">
              {coachMode ? (
                <CoachMatchRecording
                  coachMode={true}
                  onMatchRecorded={handleMatchComplete}
                  playerId={prefilledPlayer?.id}
                />
              ) : (
                <QuickMatchRecorder onSuccess={handleMatchComplete} prefilledPlayer={prefilledPlayer} />
              )}
            </CardContent>
          </Card>
        )}
        
        {/* Post-Match Assessment - Only show if assessment state is active */}
        <AnimatePresence>
          {showAssessment && matchData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-primary" />
                    CourtIQ™ Post-Match Assessment
                  </CardTitle>
                  <CardDescription>
                    Help improve your CourtIQ™ rating by providing details about your match performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PostMatchAssessment 
                    matchId={matchData.id} 
                    matchData={matchData}
                    onComplete={handleAssessmentComplete}
                    onCancel={handleAssessmentCancel}
                  />
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}