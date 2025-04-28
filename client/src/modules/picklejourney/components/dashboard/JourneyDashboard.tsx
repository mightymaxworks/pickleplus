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

import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useJourneyRoles } from '../../hooks/useJourneyRoles';
import { RoleSwitcher } from './RoleSwitcher';
import { RoleDiscoveryWizard } from '../onboarding/RoleDiscoveryWizard';
import { UserRole } from '@/lib/roles';
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
  Loader2,
  User,
  Users,
  Clipboard,
  GraduationCap,
  CalendarDays,
  CheckSquare,
  CalendarPlus,
  BarChart,
  MapPin,
  CheckCircle,
  MessageSquare
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

/**
 * PKL-278651-JOUR-002.2: Enhanced Role-Adaptive Journey Summary Component
 * This component displays a summary of the user's journey for their primary role
 * with adaptive content based on the role type.
 */
const JourneySummary = () => {
  const { 
    primaryRole, 
    getRoleLabel, 
    getRoleMetadata,
    getRoleExperienceLabel,
    getRoleProgress
  } = useJourneyRoles();
  
  const metadata = getRoleMetadata(primaryRole);
  
  // Role-specific insights based on role type
  const getRoleInsights = () => {
    switch (primaryRole) {
      case UserRole.PLAYER:
        return {
          title: "Player Insights",
          content: "Focus on improving your technical skills and match strategy. Track your progress through practice and matches.",
          icon: <User className="h-4 w-4 mr-2 text-primary" />
        };
      case UserRole.COACH:
        return {
          title: "Coach Insights",
          content: "Track your student progress and coaching methodologies. Focus on developing teaching techniques.",
          icon: <Users className="h-4 w-4 mr-2 text-primary" />
        };
      case UserRole.REFEREE:
        return {
          title: "Referee Insights",
          content: "Focus on rule knowledge and fair officiating. Track your tournament and match experiences.",
          icon: <Flag className="h-4 w-4 mr-2 text-primary" />
        };
      case UserRole.ADMIN:
        return {
          title: "Admin Insights",
          content: "Track community growth and engagement. Focus on administrative tasks and community building.",
          icon: <Award className="h-4 w-4 mr-2 text-primary" />
        };
      default:
        return {
          title: "Journey Insights",
          content: "Track your progress and growth in pickleball.",
          icon: <LineChart className="h-4 w-4 mr-2 text-primary" />
        };
    }
  };
  
  const roleInsights = getRoleInsights();
  
  // Role-specific badge color
  const getBadgeVariant = () => {
    switch (primaryRole) {
      case UserRole.PLAYER:
        return "default";
      case UserRole.COACH:
        return "secondary";
      case UserRole.REFEREE:
        return "outline";
      case UserRole.ADMIN:
        return "destructive";
      default:
        return "outline";
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <LineChart className="h-5 w-5 mr-2 text-primary" />
            <span>{getRoleLabel(primaryRole)} Journey</span>
          </div>
          <Badge variant={getBadgeVariant()}>{getRoleExperienceLabel(primaryRole)}</Badge>
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
        
        <div className="p-4 bg-muted/50 rounded-md border border-muted-foreground/10">
          <h4 className="font-medium flex items-center mb-2">
            {roleInsights.icon}
            {roleInsights.title}
          </h4>
          <p className="text-sm text-muted-foreground">
            {roleInsights.content}
          </p>
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

/**
 * PKL-278651-JOUR-002.2: Role-Adaptive Daily Prompt Component
 * This component provides personalized reflection prompts based on the user's selected role
 * to encourage journaling that is relevant to their specific pickleball journey.
 */
/**
 * PKL-278651-JOUR-002.3: Emotionally Intelligent Daily Prompt
 * 
 * Enhanced with emotion detection and adaptive content based on the
 * user's emotional state and current role.
 */
const DailyPrompt = () => {
  const { primaryRole, getRoleLabel } = useJourneyRoles();
  const [showEmotionReporter, setShowEmotionReporter] = useState(false);
  const EmotionallyAdaptivePrompt = lazy(() => import('../EmotionallyAdaptivePrompt'));
  const EmotionReporter = lazy(() => import('../EmotionReporter'));
  
  return (
    <div className="space-y-4">
      {/* Emotion Reporter Section - Initially hidden, can be toggled */}
      {showEmotionReporter && (
        <Suspense fallback={<Card className="h-40 animate-pulse" />}>
          <EmotionReporter />
        </Suspense>
      )}
      
      {/* Emotionally Adaptive Prompt */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-primary" />
              <span>{getRoleLabel(primaryRole)} Reflection</span>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setShowEmotionReporter(!showEmotionReporter)}
              title={showEmotionReporter ? "Hide emotion reporter" : "Report your emotional state"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-smile">
                <circle cx="12" cy="12" r="10" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                <line x1="9" x2="9.01" y1="9" y2="9" />
                <line x1="15" x2="15.01" y1="9" y2="9" />
              </svg>
            </Button>
          </CardTitle>
          <CardDescription>
            Today's emotionally intelligent prompt
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="h-32 animate-pulse bg-muted rounded-md" />}>
            <EmotionallyAdaptivePrompt />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * PKL-278651-JOUR-002.2: Role-Adaptive Journey Map Component
 * This component visualizes the user's journey progress in their current role
 * with milestones and timeline adapted to their specific role type.
 */
const JourneyMap = () => {
  const { primaryRole, getRoleLabel, getRoleMetadata } = useJourneyRoles();
  const metadata = getRoleMetadata(primaryRole);
  
  // Role-specific journey descriptions
  const getRoleJourneyDescription = () => {
    switch (primaryRole) {
      case UserRole.PLAYER:
        return {
          title: "Player Progression Path",
          description: "From beginner to competitive player",
          milestones: [
            "First match played",
            "Consistent serve mastered",
            "Tournament participation",
            "Competition placement",
            "Advanced skills development"
          ]
        };
      case UserRole.COACH:
        return {
          title: "Coaching Development Path",
          description: "Building your coaching expertise",
          milestones: [
            "First student coached",
            "Teaching methodology established",
            "Group lessons conducted",
            "Certification advancement",
            "Coaching philosophy development"
          ]
        };
      case UserRole.REFEREE:
        return {
          title: "Officiating Progression",
          description: "Becoming a respected official",
          milestones: [
            "Rules mastery",
            "First match officiated",
            "Tournament officiating",
            "Advanced certification",
            "Mentoring other officials"
          ]
        };
      case UserRole.ADMIN:
        return {
          title: "Leadership Development",
          description: "Building the pickleball community",
          milestones: [
            "Community involvement",
            "Event organization",
            "Program development",
            "Membership growth",
            "Sustainable community building"
          ]
        };
      default:
        return {
          title: "Pickleball Journey",
          description: "Your progression in the sport",
          milestones: [
            "Getting started",
            "Building skills",
            "Gaining experience",
            "Advancing abilities",
            "Mastering the game"
          ]
        };
    }
  };
  
  const journeyInfo = getRoleJourneyDescription();
  
  // Placeholder for milestone progress calculation
  // In a real implementation, this would be derived from user achievements and data
  const calculateMilestoneProgress = (index: number) => {
    // For now, we'll make earlier milestones more likely to be completed
    // This simulates a journey progression
    const completed = metadata.achievements.length > index * 2;
    const progress = completed ? 100 : Math.max(0, Math.min(90, (5 - index) * 20));
    
    return {
      completed,
      progress
    };
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <LineChart className="h-5 w-5 mr-2 text-primary" />
            <span>{journeyInfo.title}</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {metadata.experience}
          </Badge>
        </CardTitle>
        <CardDescription>
          {journeyInfo.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="relative h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="absolute h-full bg-primary rounded-full" 
              style={{ 
                width: `${metadata.achievements.length > 0 
                  ? Math.min(100, metadata.achievements.length * 20) 
                  : 5}%` 
              }}
            />
          </div>
          
          <div className="grid grid-cols-5 gap-1">
            {journeyInfo.milestones.map((milestone, index) => {
              const { completed, progress } = calculateMilestoneProgress(index);
              return (
                <div key={index} className="flex flex-col items-center text-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                    completed 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {completed ? (
                      <Award className="h-4 w-4" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <div className="text-xs font-medium">{milestone}</div>
                  <div className="mt-1 w-full h-1 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary" 
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
      <CardFooter className="text-xs text-center text-muted-foreground">
        Complete goals and record achievements to progress on your journey
      </CardFooter>
    </Card>
  );
};

/**
 * PKL-278651-JOUR-002.2: Role-Adaptive Recent Activity Component
 * This component shows recent activity relevant to the user's selected role,
 * highlighting different types of activities based on role context.
 */
const RecentActivity = () => {
  const { primaryRole, getRoleLabel } = useJourneyRoles();
  
  // Generate role-specific activity items
  const getRoleActivities = () => {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const twoDaysAgo = new Date(now);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    
    switch (primaryRole) {
      case UserRole.PLAYER:
        return [
          {
            id: 'p1',
            title: 'Match Recorded',
            description: 'You recorded a match with a score of 11-8, 9-11, 11-7',
            date: yesterday,
            icon: <Award className="h-4 w-4 text-primary" />,
            actionLabel: 'View Match'
          },
          {
            id: 'p2',
            title: 'Skill Drill Completed',
            description: 'You completed the "Third Shot Drop Mastery" drill',
            date: twoDaysAgo,
            icon: <Flag className="h-4 w-4 text-primary" />,
            actionLabel: 'View Drill'
          },
          {
            id: 'p3',
            title: 'CourtIQ™ Updated',
            description: 'Your technical skill rating increased to 3.8',
            date: twoDaysAgo,
            icon: <LineChart className="h-4 w-4 text-primary" />,
            actionLabel: 'View Profile'
          }
        ];
      case UserRole.COACH:
        return [
          {
            id: 'c1',
            title: 'Student Session',
            description: 'You completed a coaching session with Maria Rodriguez',
            date: yesterday,
            icon: <Users className="h-4 w-4 text-primary" />,
            actionLabel: 'View Student'
          },
          {
            id: 'c2',
            title: 'Drill Created',
            description: 'You created a new "Dink Consistency" drill',
            date: twoDaysAgo,
            icon: <Clipboard className="h-4 w-4 text-primary" />,
            actionLabel: 'View Drill'
          },
          {
            id: 'c3',
            title: 'Teaching Certification',
            description: "You're 70% through your advanced certification",
            date: twoDaysAgo,
            icon: <GraduationCap className="h-4 w-4 text-primary" />,
            actionLabel: 'Continue'
          }
        ];
      case UserRole.REFEREE:
        return [
          {
            id: 'r1',
            title: 'Tournament Assigned',
            description: 'You were assigned to the Spring Championship on May 15',
            date: yesterday,
            icon: <CalendarDays className="h-4 w-4 text-primary" />,
            actionLabel: 'View Details'
          },
          {
            id: 'r2',
            title: 'Rules Quiz Completed',
            description: 'You scored 95% on the advanced rules quiz',
            date: twoDaysAgo,
            icon: <CheckSquare className="h-4 w-4 text-primary" />,
            actionLabel: 'View Results'
          },
          {
            id: 'r3',
            title: 'Match Officiated',
            description: 'You officiated the Masters Division finals',
            date: twoDaysAgo,
            icon: <Flag className="h-4 w-4 text-primary" />,
            actionLabel: 'View Match'
          }
        ];
      case UserRole.ADMIN:
        return [
          {
            id: 'a1',
            title: 'Event Created',
            description: 'You created the Summer Tournament Series event',
            date: yesterday,
            icon: <CalendarPlus className="h-4 w-4 text-primary" />,
            actionLabel: 'View Event'
          },
          {
            id: 'a2',
            title: 'Member Report',
            description: 'Monthly membership report is ready for review',
            date: twoDaysAgo,
            icon: <BarChart className="h-4 w-4 text-primary" />,
            actionLabel: 'View Report'
          },
          {
            id: 'a3',
            title: 'Facility Booking',
            description: 'You confirmed court reservations for next week',
            date: twoDaysAgo,
            icon: <MapPin className="h-4 w-4 text-primary" />,
            actionLabel: 'View Schedule'
          }
        ];
      default:
        return [
          {
            id: 'd1',
            title: 'Profile Updated',
            description: 'You updated your player profile information',
            date: yesterday,
            icon: <User className="h-4 w-4 text-primary" />,
            actionLabel: 'View Profile'
          },
          {
            id: 'd2',
            title: 'Goal Completed',
            description: 'You completed your goal: "Improve serve consistency"',
            date: twoDaysAgo,
            icon: <CheckCircle className="h-4 w-4 text-primary" />,
            actionLabel: 'View Goals'
          },
          {
            id: 'd3',
            title: 'Community Post',
            description: 'You posted in the Pickle+ community forum',
            date: twoDaysAgo,
            icon: <MessageSquare className="h-4 w-4 text-primary" />,
            actionLabel: 'View Post'
          }
        ];
    }
  };
  
  const activities = getRoleActivities();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-primary" />
            <span>{getRoleLabel(primaryRole)} Activity</span>
          </div>
          <Button variant="outline" size="sm">
            View All
          </Button>
        </CardTitle>
        <CardDescription>
          Your recent {getRoleLabel(primaryRole).toLowerCase()} activities and updates
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map(activity => (
            <div key={activity.id} className="flex items-start p-3 bg-muted/30 rounded-md hover:bg-muted/50 transition-colors">
              <div className="flex-shrink-0 h-10 w-10 bg-muted rounded-full flex items-center justify-center mr-3">
                {activity.icon}
              </div>
              
              <div className="flex-grow">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-sm">{activity.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {activity.description}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                    {format(activity.date, 'MMM d')}
                  </span>
                </div>
                
                <div className="mt-2 flex items-center">
                  <Button variant="ghost" size="sm" className="h-7 text-xs px-2">
                    {activity.actionLabel}
                  </Button>
                </div>
              </div>
            </div>
          ))}
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