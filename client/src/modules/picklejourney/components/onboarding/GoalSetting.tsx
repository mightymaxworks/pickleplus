/**
 * PKL-278651-JOUR-002.1: Goal Setting Component
 * 
 * Component for setting initial goals for each role.
 * Allows users to create, edit, and prioritize goals for their journey.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-28
 */

import { useState } from 'react';
import { UserRole } from '@/lib/roles';
import { useJourneyRoles } from '../../hooks/useJourneyRoles';
import { JourneyGoal } from '../../types';
import { CheckCircle2, Plus, Trash2, Calendar, User, Users, Whistle, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { format } from 'date-fns';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

// Role suggestions as starting points
const ROLE_GOAL_SUGGESTIONS: Record<UserRole, string[]> = {
  [UserRole.PLAYER]: [
    'Improve my third shot drop consistency',
    'Compete in my first tournament',
    'Increase my CourtIQ rating by 100 points',
    'Master the stack formation with my doubles partner',
    'Develop a more reliable serve'
  ],
  [UserRole.COACH]: [
    'Get certified as a pickleball instructor',
    'Develop a curriculum for beginners',
    'Coach my first group clinic',
    'Create video analysis for my students',
    'Specialize in a specific teaching methodology'
  ],
  [UserRole.REFEREE]: [
    'Complete referee certification',
    'Officiate my first tournament',
    'Master the rules for line calls',
    'Develop confident non-volley zone violation spotting',
    'Learn effective conflict resolution techniques'
  ],
  [UserRole.ADMIN]: [
    'Organize a local tournament',
    'Implement a community outreach program',
    'Establish a new league structure',
    'Create a player development pathway'
  ]
};

// Icon component for the role
const RoleIcon = ({ role }: { role: UserRole }) => {
  switch (role) {
    case UserRole.PLAYER:
      return <User className="h-5 w-5" />;
    case UserRole.COACH:
      return <Users className="h-5 w-5" />;
    case UserRole.REFEREE:
      return <Whistle className="h-5 w-5" />;
    case UserRole.ADMIN:
      return <Award className="h-5 w-5" />;
    default:
      return <User className="h-5 w-5" />;
  }
};

// Goal item component
interface GoalItemProps {
  goal: JourneyGoal;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string, completed: boolean) => void;
  onUpdateTargetDate: (id: string, date: Date | undefined) => void;
}

const GoalItem = ({ goal, onDelete, onToggleComplete, onUpdateTargetDate }: GoalItemProps) => {
  const { getRoleLabel } = useJourneyRoles();
  
  return (
    <div className="py-3 border-b last:border-b-0 flex items-center justify-between">
      <div className="flex items-start space-x-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 rounded-full mt-1"
          onClick={() => onToggleComplete(goal.id, !goal.completed)}
        >
          <CheckCircle2 
            className={`h-5 w-5 ${goal.completed ? 'text-green-500 fill-green-500' : 'text-muted-foreground'}`} 
          />
        </Button>
        
        <div>
          <div className="font-medium">{goal.description}</div>
          <div className="flex items-center text-xs text-muted-foreground space-x-2 mt-1">
            <Badge variant="outline" className="text-xs py-0 h-5">
              <RoleIcon role={goal.role} />
              <span className="ml-1">{getRoleLabel(goal.role)}</span>
            </Badge>
            
            {goal.targetDate && (
              <div className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                <span>{format(goal.targetDate, 'PP')}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-1">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <CalendarComponent
              mode="single"
              selected={goal.targetDate}
              onSelect={(date) => onUpdateTargetDate(goal.id, date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDelete(goal.id)}>
          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
        </Button>
      </div>
    </div>
  );
};

/**
 * Goal Setting component for the onboarding flow
 */
export function GoalSetting() {
  const { roles, getRoleLabel, addGoal, removeGoal, updateGoal, getRoleMetadata } = useJourneyRoles();
  const [activeTab, setActiveTab] = useState<UserRole>(roles[0] || UserRole.PLAYER);
  const [newGoalText, setNewGoalText] = useState('');
  
  // Handle adding a new goal
  const handleAddGoal = () => {
    if (!newGoalText.trim()) return;
    
    addGoal({
      description: newGoalText.trim(),
      role: activeTab,
      completed: false
    });
    
    setNewGoalText('');
  };
  
  // Handle removing a goal
  const handleRemoveGoal = (goalId: string) => {
    removeGoal(goalId);
  };
  
  // Handle toggling a goal's completion status
  const handleToggleComplete = (goalId: string, completed: boolean) => {
    updateGoal(goalId, { completed });
  };
  
  // Handle updating a goal's target date
  const handleUpdateTargetDate = (goalId: string, date: Date | undefined) => {
    updateGoal(goalId, { targetDate: date });
  };
  
  // Handle adding a suggestion as a goal
  const handleAddSuggestion = (suggestion: string) => {
    addGoal({
      description: suggestion,
      role: activeTab,
      completed: false
    });
  };
  
  // Get goals for the active tab
  const activeRoleGoals = getRoleMetadata(activeTab).goals;
  const activeRoleSuggestions = ROLE_GOAL_SUGGESTIONS[activeTab] || [];
  
  // If no roles are selected, show a message
  if (roles.length === 0) {
    return (
      <div className="text-center p-6">
        <p className="text-muted-foreground">
          Please select at least one role in the first step.
        </p>
      </div>
    );
  }
  
  return (
    <div className="goal-setting space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold tracking-tight">Set Your Goals</h3>
        <p className="text-muted-foreground mt-2">
          Define what you want to achieve in each of your pickleball roles
        </p>
      </div>
      
      <div className="mt-6 max-w-3xl mx-auto">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as UserRole)}>
          <TabsList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {roles.map(role => (
              <TabsTrigger key={role} value={role} className="flex items-center space-x-1">
                <RoleIcon role={role} />
                <span>{getRoleLabel(role)}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          
          {roles.map(role => (
            <TabsContent key={role} value={role} className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {getRoleLabel(role)} Goals
                  </CardTitle>
                  <CardDescription>
                    Set goals to track your progress in this role
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Add a new goal..."
                      value={newGoalText}
                      onChange={(e) => setNewGoalText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAddGoal();
                        }
                      }}
                    />
                    <Button onClick={handleAddGoal}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                  
                  <div className="bg-muted p-3 rounded-md">
                    <h4 className="text-sm font-medium mb-2">Suggestions</h4>
                    <div className="flex flex-wrap gap-2">
                      {activeRoleSuggestions.map((suggestion, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="cursor-pointer hover:bg-primary/10"
                          onClick={() => handleAddSuggestion(suggestion)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          {suggestion}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {activeRoleGoals.length > 0 ? (
                    <div className="bg-card border rounded-md">
                      {activeRoleGoals.map(goal => (
                        <GoalItem
                          key={goal.id}
                          goal={goal}
                          onDelete={handleRemoveGoal}
                          onToggleComplete={handleToggleComplete}
                          onUpdateTargetDate={handleUpdateTargetDate}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      <p>No goals yet. Add some to get started!</p>
                    </div>
                  )}
                </CardContent>
                
                <CardFooter className="flex justify-between border-t pt-4">
                  <div className="text-sm text-muted-foreground">
                    {activeRoleGoals.length} goal{activeRoleGoals.length !== 1 ? 's' : ''}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {activeRoleGoals.filter(g => g.completed).length} completed
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}