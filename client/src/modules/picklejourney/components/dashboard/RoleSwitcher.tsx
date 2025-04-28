/**
 * PKL-278651-JOUR-002.1: Role Switcher Component
 * 
 * Component for switching between user roles in the PickleJourney™ dashboard.
 * Provides an intuitive UI for changing the primary role perspective.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-28
 */

import { useJourneyRoles } from '../../hooks/useJourneyRoles';
import { UserRole } from '@/lib/roles';
import { User, Users, Flag, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion, AnimatePresence } from 'framer-motion';

// Role badge component
interface RoleBadgeProps {
  role: UserRole;
  active?: boolean;
  onClick?: () => void;
}

export function RoleBadge({ 
  role, 
  active = false, 
  onClick 
}: RoleBadgeProps) {
  const { getRoleLabel } = useJourneyRoles();
  const label = getRoleLabel(role);
  
  // Determine icon based on role
  const RoleIcon = () => {
    switch (role) {
      case UserRole.PLAYER:
        return <User className="h-4 w-4" />;
      case UserRole.COACH:
        return <Users className="h-4 w-4" />;
      case UserRole.REFEREE:
        return <Flag className="h-4 w-4" />;
      case UserRole.ADMIN:
        return <Award className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };
  
  return (
    <Badge
      variant={active ? "default" : "outline"}
      className={`px-3 py-1 transition-all duration-200 ${onClick ? 'cursor-pointer hover:bg-primary/20' : ''}`}
      onClick={onClick}
    >
      <RoleIcon />
      <span className="ml-1.5">{label}</span>
    </Badge>
  );
}

// Role switcher variants based on count of roles
interface RoleSwitcherBaseProps {
  variant?: 'compact' | 'default' | 'full';
  showLabel?: boolean;
}

// Single role component (no switching needed)
const SingleRole = () => {
  const { primaryRole } = useJourneyRoles();
  
  return (
    <RoleBadge role={primaryRole} active />
  );
};

// Two roles component (toggle between them)
const DualRoles = () => {
  const { roles, primaryRole, setPrimaryRole } = useJourneyRoles();
  
  // Get the other role
  const otherRole = roles.find(r => r !== primaryRole) || primaryRole;
  
  // Toggle between the two roles
  const toggleRole = () => {
    setPrimaryRole(otherRole);
  };
  
  return (
    <div className="flex space-x-2">
      <RoleBadge role={primaryRole} active />
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant="outline"
              className="px-2 cursor-pointer hover:bg-primary/20"
              onClick={toggleRole}
            >
              <Users className="h-3.5 w-3.5" />
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Switch to {useJourneyRoles().getRoleLabel(otherRole)}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

// Multiple roles component (dropdown selector)
const MultiRoles = () => {
  const { roles, primaryRole, setPrimaryRole } = useJourneyRoles();
  
  return (
    <Select 
      value={primaryRole} 
      onValueChange={(value) => setPrimaryRole(value as UserRole)}
    >
      <SelectTrigger className="w-[180px] h-9">
        <SelectValue placeholder="Select role" />
      </SelectTrigger>
      <SelectContent>
        {roles.map(role => (
          <SelectItem key={role} value={role}>
            <RoleBadge role={role} active={role === primaryRole} />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

/**
 * Main Role Switcher component
 */
export function RoleSwitcher({ 
  variant = 'default',
  showLabel = true
}: RoleSwitcherBaseProps) {
  const { roles } = useJourneyRoles();
  
  // If there's only one role, show it but don't make it switchable
  if (roles.length <= 1) {
    return (
      <div className="role-switcher flex items-center space-x-2">
        {showLabel && (
          <span className="text-sm text-muted-foreground">Role:</span>
        )}
        <SingleRole />
      </div>
    );
  }
  
  // If there are exactly two roles, show a simple toggle
  if (roles.length === 2) {
    return (
      <div className="role-switcher flex items-center space-x-2">
        {showLabel && (
          <span className="text-sm text-muted-foreground">Perspective:</span>
        )}
        <DualRoles />
      </div>
    );
  }
  
  // If there are more than two roles, show a dropdown
  return (
    <div className="role-switcher flex items-center space-x-2">
      {showLabel && (
        <span className="text-sm text-muted-foreground">Current Role:</span>
      )}
      <MultiRoles />
    </div>
  );
}