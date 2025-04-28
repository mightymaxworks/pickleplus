/**
 * PKL-278651-JOUR-002.1: Journey Dashboard Component
 * 
 * Main dashboard component for the PickleJourney™ experience.
 * Provides a role-aware interface for tracking pickleball journey progress.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-28
 */

import { useState, useEffect } from 'react';
import { useJourneyRoles } from '../../hooks/useJourneyRoles';
import { RoleSwitcher } from './RoleSwitcher';
import { RoleDiscoveryWizard } from '../onboarding/RoleDiscoveryWizard';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { 
  LineChart, 
  Flag, 
  Award, 
  BookOpen, 
  Settings, 
  Calendar, 
  Loader2 
} from 'lucide-react';
import { JourneyGoal, ExperienceLevel } from '../../types';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

// Check if the user needs to go through onboarding
function useJourneyOnboarding() {
  const { roles } = useJourneyRoles();
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // If user has no roles, they need onboarding
    const needsOnboarding = roles.length === 0;
    
    // Check if they've completed onboarding before
    const hasCompletedOnboarding = localStorage.getItem('picklejourney:onboarding:completed');
    
    setIsFirstVisit(needsOnboarding || !hasCompletedOnboarding);
    setIsLoading(false);
  }, [roles]);
  
  const completeOnboarding = () => {
    localStorage.setItem('picklejourney:onboarding:completed', 'true');
    setIsFirstVisit(false);
  };
  
  return {
    isFirstVisit,
    isLoading,
    completeOnboarding
  };
}

// Dashboard summary component
const JourneySummary = () => {
  const { 
    primaryRole, 
    getRoleLabel, 
    getRoleMetadata,
    getRoleExperienceLabel,
    getRoleProgress
  } = useJourneyRoles();
  
  const metadata = getRoleMetadata(primaryRole);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <LineChart className="h-5 w-5 mr-2 text-primary" />
            <span>{getRoleLabel(primaryRole)} Journey</span>
          </div>
          <Badge variant="outline">{getRoleExperienceLabel(primaryRole)}</Badge>
        </CardTitle>
        <CardDescription>
          Your progress as a {getRoleLabel(primaryRole).toLowerCase()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-muted rounded-md">
          <h4 className="font-medium flex items-center mb-2">
            <Flag className="h-4 w-4 mr-2 text-primary" />
            Your Why
          </h4>
          <p className="text-sm text-muted-foreground">
            {metadata.why || "You haven't set your 'why' for this role yet."}
          </p>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Goal Progress</h4>
            <span className="text-sm text-muted-foreground">
              {metadata.goals.filter(g => g.completed).length} of {metadata.goals.length} completed
            </span>
          </div>
          <div className="h-2 bg-muted rounded overflow-hidden">
            <div 
              className="h-full bg-primary" 
              style={{ width: `${getRoleProgress(primaryRole)}%` }}
            />
          </div>
        </div>
        
        <div className="border rounded-md">
          <div className="p-3 border-b flex items-center justify-between text-sm">
            <span className="font-medium">Recent Achievements</span>
            <Badge variant="outline" className="text-xs">
              {metadata.achievements.length}
            </Badge>
          </div>
          {metadata.achievements.length > 0 ? (
            metadata.achievements.slice(0, 3).map(achievement => (
              <div key={achievement.id} className="p-3 border-b last:border-b-0">
                <div className="font-medium">{achievement.title}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {format(achievement.date, 'PP')}
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No achievements yet
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Role goals list component
const RoleGoalsList = () => {
  const { primaryRole, getRoleMetadata, updateGoal } = useJourneyRoles();
  const metadata = getRoleMetadata(primaryRole);
  
  const handleToggleGoal = (goal: JourneyGoal) => {
    updateGoal(goal.id, { completed: !goal.completed });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Flag className="h-5 w-5 mr-2 text-primary" />
          Current Goals
        </CardTitle>
        <CardDescription>
          What you're working on now
        </CardDescription>
      </CardHeader>
      <CardContent>
        {metadata.goals.length > 0 ? (
          <div className="space-y-2">
            {metadata.goals.map(goal => (
              <div 
                key={goal.id} 
                className={`
                  p-3 rounded-md flex items-start space-x-3 cursor-pointer
                  ${goal.completed ? 'bg-green-500/10' : 'bg-muted'}
                `}
                onClick={() => handleToggleGoal(goal)}
              >
                <div className={`rounded-full h-5 w-5 flex items-center justify-center border border-primary ${goal.completed ? 'bg-green-500' : 'bg-transparent'}`}>
                  {goal.completed && <Award className="h-3 w-3 text-white" />}
                </div>
                
                <div>
                  <div className={`font-medium ${goal.completed ? 'line-through text-muted-foreground' : ''}`}>
                    {goal.description}
                  </div>
                  
                  {goal.targetDate && (
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>Target: {format(goal.targetDate, 'PP')}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-6 text-muted-foreground">
            <p>No goals set for this role yet.</p>
            <Button variant="outline" size="sm" className="mt-2">
              Add a Goal
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Daily prompt component
const DailyPrompt = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BookOpen className="h-5 w-5 mr-2 text-primary" />
          Daily Reflection
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-muted p-4 rounded-md">
          <p className="italic">
            "What specific technique or strategy did you focus on in your recent sessions, and what progress have you observed?"
          </p>
        </div>
        
        <div className="mt-4">
          <Button className="w-full">Respond in Journal</Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Journey map component
const JourneyMap = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <LineChart className="h-5 w-5 mr-2 text-primary" />
          Your Journey Map
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] flex items-center justify-center">
          <Skeleton className="h-full w-full" />
        </div>
      </CardContent>
      <CardFooter className="text-sm text-center">
        Journey visualization coming in the next sprint
      </CardFooter>
    </Card>
  );
};

// Recent activity component
const RecentActivity = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-primary" />
            <span>Recent Activity</span>
          </div>
          <Button variant="outline" size="sm">
            View All
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Main Journey Dashboard Component
 */
export default function JourneyDashboard() {
  const { isFirstVisit, isLoading, completeOnboarding } = useJourneyOnboarding();
  
  // Show onboarding wizard for first-time users
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (isFirstVisit) {
    return (
      <div className="space-y-8 max-w-5xl mx-auto p-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Welcome to PickleJourney™</h1>
          <p className="text-muted-foreground mt-2">
            Let's customize your journey based on your pickleball roles
          </p>
        </div>
        
        <RoleDiscoveryWizard />
        
        <div className="text-center">
          <Button onClick={completeOnboarding}>
            Continue to Dashboard
          </Button>
        </div>
      </div>
    );
  }
  
  // Show main dashboard for returning users
  return (
    <div className="space-y-8 max-w-6xl mx-auto p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Pickleball Journey</h1>
          <p className="text-muted-foreground">
            Track your progress and growth
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <RoleSwitcher />
          
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <JourneySummary />
          <RoleGoalsList />
        </div>
        
        <div className="md:col-span-2 space-y-6">
          <DailyPrompt />
          <JourneyMap />
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}