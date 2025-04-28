/**
 * PKL-278651-JOUR-002.1: Role Selection Panel
 * 
 * Component for selecting user roles in the PickleJourney™ onboarding flow.
 * Displays available roles with visual indicators and allows toggling selection.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-28
 */

import { UserRole } from '@/lib/roles';
import { useJourneyRoles } from '../../hooks/useJourneyRoles';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, User, Whistle, Award, Users } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// Role descriptions for the selection panel
const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  [UserRole.PLAYER]: 'Track your progress as a pickleball player. Focus on skill development, match performance, and personal growth.',
  [UserRole.COACH]: 'Manage your coaching journey. Help others improve while developing your teaching and mentoring abilities.',
  [UserRole.REFEREE]: 'Build your skills as a pickleball referee. Track officiating experience and rule knowledge.',
  [UserRole.ADMIN]: 'System administrator role with full platform access.'
};

// Icons for each role
const RoleIcon = ({ role }: { role: UserRole }) => {
  switch (role) {
    case UserRole.PLAYER:
      return <User className="h-6 w-6" />;
    case UserRole.COACH:
      return <Users className="h-6 w-6" />;
    case UserRole.REFEREE:
      return <Whistle className="h-6 w-6" />;
    case UserRole.ADMIN:
      return <Award className="h-6 w-6" />;
    default:
      return <User className="h-6 w-6" />;
  }
};

// Individual role card component
interface RoleCardProps {
  role: UserRole;
  selected: boolean;
  onToggle: () => void;
}

const RoleCard = ({ role, selected, onToggle }: RoleCardProps) => {
  const { getRoleLabel } = useJourneyRoles();
  const label = getRoleLabel(role);
  const description = ROLE_DESCRIPTIONS[role] || '';
  
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        className={cn(
          "cursor-pointer border-2 transition-all duration-200",
          selected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
        )}
        onClick={onToggle}
      >
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <Badge 
              variant={selected ? "default" : "outline"}
              className="px-3 py-1"
            >
              <RoleIcon role={role} />
              <span className="ml-1">{label}</span>
            </Badge>
            {selected && (
              <CheckCircle2 className="h-5 w-5 text-primary" />
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

/**
 * Panel for selecting user roles
 */
export function RoleSelectionPanel() {
  const { roles, addRole, removeRole } = useJourneyRoles();
  
  // Available roles (excluding ADMIN as it's not selectable in the wizard)
  const availableRoles = [
    UserRole.PLAYER,
    UserRole.COACH,
    UserRole.REFEREE
  ];
  
  const toggleRole = (role: UserRole) => {
    if (roles.includes(role)) {
      removeRole(role);
    } else {
      addRole(role);
    }
  };
  
  return (
    <div className="role-selection-panel space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold tracking-tight">What are your roles in pickleball?</h3>
        <p className="text-muted-foreground mt-2">
          Select all that apply to you. This helps personalize your PickleJourney™ experience.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {availableRoles.map(role => (
          <RoleCard
            key={role}
            role={role}
            selected={roles.includes(role)}
            onToggle={() => toggleRole(role)}
          />
        ))}
      </div>
      
      {roles.length === 0 && (
        <p className="text-center text-amber-500 dark:text-amber-400 text-sm mt-4">
          Please select at least one role to continue
        </p>
      )}
    </div>
  );
}