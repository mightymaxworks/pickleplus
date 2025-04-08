import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { QuickMatchRecorder } from '@/components/match/QuickMatchRecorder';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft,
  ArrowRight, 
  ListChecks,
  Users,
  Zap, 
  Calendar,
  Award,
  CheckCircle
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
  
  // Initialize with user's data
  useEffect(() => {
    // Publish event that match recording has started
    eventBus.publish('match:record:started', { userId: user?.id });
    
    // Clean up when component unmounts
    return () => {
      // If the match wasn't completed, publish cancellation event
      if (!showSuccess) {
        eventBus.publish('match:record:cancelled', { userId: user?.id });
      }
    };
  }, [user, showSuccess]);
  
  // Calculate progress
  const progressPercentage = ((step - 1) / (totalSteps - 1)) * 100;
  
  // Handle a completed match from the QuickMatchRecorder
  const handleMatchComplete = (data: any) => {
    setMatchData(data);
    setShowSuccess(true);
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      navigate('/matches');
    }, 3000);
    
    // Publish event that match recording was completed
    eventBus.publish('match:record:completed', { 
      userId: user?.id,
      matchId: data?.id,
      matchType: 'casual'
    });
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
        
        {/* Main Content - Only show if not in success state */}
        {!showSuccess && (
          <Card className="border-0 shadow-lg overflow-hidden">
            <CardContent className="p-0">
              {/* The actual match recording form */}
              <QuickMatchRecorder onSuccess={handleMatchComplete} />
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}