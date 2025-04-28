/**
 * PKL-278651-JOUR-002.1: Role Prioritization Component
 * 
 * Component for prioritizing user roles in the PickleJourney™ onboarding flow.
 * Allows users to drag and reorder their selected roles to set priority.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-28
 */

import { useJourneyRoles } from '../../hooks/useJourneyRoles';
import { UserRole } from '@/lib/roles';
import { GripVertical, Crown, User, Flag, Users, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { motion, Reorder } from 'framer-motion';

// Component for a draggable role card in the priority list
interface RolePriorityCardProps {
  role: UserRole;
  index: number;
  isPrimary: boolean;
}

const RolePriorityCard = ({ role, index, isPrimary }: RolePriorityCardProps) => {
  const { getRoleLabel } = useJourneyRoles();
  const label = getRoleLabel(role);
  
  // Determine icon based on role
  const RoleIcon = () => {
    switch (role) {
      case UserRole.PLAYER:
        return <User className="h-5 w-5" />;
      case UserRole.COACH:
        return <Users className="h-5 w-5" />;
      case UserRole.REFEREE:
        return <Flag className="h-5 w-5" />;
      case UserRole.ADMIN:
        return <Award className="h-5 w-5" />;
      default:
        return <User className="h-5 w-5" />;
    }
  };
  
  return (
    <Card 
      className={cn(
        "mb-2 border-2",
        isPrimary ? "border-primary bg-primary/5" : "border-border"
      )}
    >
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
            
            <Badge variant={isPrimary ? "default" : "outline"}>
              <RoleIcon />
              <span className="ml-1.5">{label}</span>
            </Badge>
            
            {index === 0 && (
              <div className="flex items-center text-amber-500 font-medium">
                <Crown className="h-4 w-4 mr-1" />
                <span className="text-xs">Primary Role</span>
              </div>
            )}
          </div>
          
          <div className="text-sm text-muted-foreground">
            Priority: {index + 1}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Role prioritization component
 * Allows users to drag and reorder their roles to set priority
 */
export function RolePrioritization() {
  const { roles, primaryRole, setRolePriority, setPrimaryRole } = useJourneyRoles();
  const [orderedRoles, setOrderedRoles] = useState<UserRole[]>([...roles]);
  
  // Handle reordering roles
  const handleReorder = (reorderedRoles: UserRole[]) => {
    setOrderedRoles(reorderedRoles);
    setRolePriority(reorderedRoles);
    
    // Set the first role as primary
    if (reorderedRoles.length > 0 && reorderedRoles[0] !== primaryRole) {
      setPrimaryRole(reorderedRoles[0]);
    }
  };
  
  // If there are no roles, show a message
  if (roles.length === 0) {
    return (
      <div className="text-center p-6">
        <p className="text-muted-foreground">
          Please select at least one role in the previous step.
        </p>
      </div>
    );
  }
  
  // If there's only one role, show a message (no prioritization needed)
  if (roles.length === 1) {
    return (
      <div className="role-prioritization space-y-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold tracking-tight">Your Role Priority</h3>
          <p className="text-muted-foreground mt-2">
            You've selected only one role, so it's automatically your primary role.
          </p>
        </div>
        
        <div className="mt-6 max-w-md mx-auto">
          <RolePriorityCard 
            role={roles[0]} 
            index={0} 
            isPrimary={true} 
          />
        </div>
      </div>
    );
  }
  
  return (
    <div className="role-prioritization space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold tracking-tight">Prioritize Your Roles</h3>
        <p className="text-muted-foreground mt-2">
          Drag to arrange your roles in order of importance to you.
          The top role will be your primary perspective in PickleJourney™.
        </p>
      </div>
      
      <motion.div 
        className="mt-6 max-w-md mx-auto"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Reorder.Group 
          axis="y" 
          values={orderedRoles} 
          onReorder={handleReorder}
          className="space-y-2"
        >
          {orderedRoles.map((role, index) => (
            <Reorder.Item 
              key={role} 
              value={role}
              className="cursor-move"
            >
              <RolePriorityCard 
                role={role} 
                index={index} 
                isPrimary={role === primaryRole} 
              />
            </Reorder.Item>
          ))}
        </Reorder.Group>
      </motion.div>
    </div>
  );
}