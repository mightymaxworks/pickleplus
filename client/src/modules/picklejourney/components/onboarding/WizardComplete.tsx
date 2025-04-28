/**
 * PKL-278651-JOUR-002.1: Wizard Completion Component
 * 
 * The final step in the Role Discovery Wizard that summarizes the user's selections
 * and provides an overview of their PickleJourney™ configuration.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-28
 */

import { UserRole } from '@/lib/roles';
import { useJourneyRoles } from '../../hooks/useJourneyRoles';
import { Badge } from '@/components/ui/badge';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  User, 
  Users, 
  Whistle, 
  Award, 
  CheckCircle2, 
  Crown, 
  Flag, 
  LineChart 
} from 'lucide-react';
import { format } from 'date-fns';

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

/**
 * Component for the final wizard step showing a summary
 */
export function WizardComplete() {
  const { 
    roles, 
    primaryRole, 
    getRoleLabel, 
    getRoleMetadata,
    getRoleExperienceLabel,
    getTotalGoalsCount,
    getCompletedGoalsCount
  } = useJourneyRoles();
  
  return (
    <div className="wizard-complete space-y-6">
      <div className="text-center">
        <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold tracking-tight">Your Journey is Ready!</h3>
        <p className="text-muted-foreground mt-2">
          We've configured your PickleJourney™ based on your inputs.
          You can always update these settings later.
        </p>
      </div>
      
      <div className="mt-6 max-w-3xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Your Role Profile
              </CardTitle>
              <CardDescription>
                The roles you've selected for your pickleball journey
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {roles.map((role, index) => {
                  const isFirst = index === 0;
                  const metadata = getRoleMetadata(role);
                  
                  return (
                    <div 
                      key={role} 
                      className={`p-3 rounded-md flex items-center justify-between ${
                        isFirst ? 'bg-primary/10 border border-primary/20' : 'bg-muted'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex flex-col items-center justify-center w-8">
                          <span className="text-xs text-muted-foreground mb-1">
                            {index + 1}
                          </span>
                          <RoleIcon role={role} />
                        </div>
                        
                        <div>
                          <div className="font-medium flex items-center">
                            {getRoleLabel(role)}
                            {isFirst && (
                              <Crown className="h-4 w-4 text-amber-500 ml-2" />
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {getRoleExperienceLabel(role)} • Started {format(metadata.startDate, 'PP')}
                          </div>
                        </div>
                      </div>
                      
                      <Badge variant={isFirst ? "default" : "outline"}>
                        {isFirst ? "Primary" : "Secondary"}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <LineChart className="mr-2 h-5 w-5" />
                Journey Progress
              </CardTitle>
              <CardDescription>
                Your goals and achievements so far
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted p-4 rounded-md text-center">
                  <div className="text-2xl font-bold">{roles.length}</div>
                  <div className="text-sm text-muted-foreground">Active Roles</div>
                </div>
                
                <div className="bg-muted p-4 rounded-md text-center">
                  <div className="text-2xl font-bold">
                    {getTotalGoalsCount()}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Goals</div>
                </div>
                
                <div className="bg-muted p-4 rounded-md text-center">
                  <div className="text-2xl font-bold">
                    {getCompletedGoalsCount()}
                  </div>
                  <div className="text-sm text-muted-foreground">Completed Goals</div>
                </div>
                
                <div className="bg-muted p-4 rounded-md text-center">
                  <div className="text-2xl font-bold">0</div>
                  <div className="text-sm text-muted-foreground">Journey Days</div>
                </div>
              </div>
              
              <div className="bg-muted p-4 rounded-md">
                <h4 className="font-medium flex items-center mb-2">
                  <Flag className="h-4 w-4 mr-2" />
                  Primary Focus: {getRoleLabel(primaryRole)}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {getRoleMetadata(primaryRole).why || 
                    `Your journey as a ${getRoleLabel(primaryRole).toLowerCase()} is just beginning!`}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-6 text-center p-4 bg-muted rounded-md">
          <p className="text-sm">
            Click "Complete" below to finish the setup and start your personalized PickleJourney™ dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}