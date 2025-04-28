/**
 * PKL-278651-JOUR-002.1: Why Exploration Component
 * 
 * Component for capturing a user's motivation ("why") for each role.
 * Provides role-specific prompts to help users articulate their journey purpose.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-28
 */

import { useState, useMemo } from 'react';
import { UserRole } from '@/lib/roles';
import { useJourneyRoles } from '../../hooks/useJourneyRoles';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle
} from '@/components/ui/card';
import { User, Users, Flag, Award, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';
import { ExperienceLevel } from '../../types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Role-specific prompts to inspire "why" reflection
const ROLE_PROMPTS: Record<UserRole, string[]> = {
  [UserRole.PLAYER]: [
    'What first attracted you to pickleball?',
    'What do you hope to achieve in your pickleball journey?',
    'How does playing pickleball make you feel?',
    'What aspects of the game do you most want to improve?'
  ],
  [UserRole.COACH]: [
    'What motivated you to become a pickleball coach?',
    'What is your coaching philosophy or approach?',
    'What brings you the most satisfaction in coaching?',
    'How do you hope to impact your students?'
  ],
  [UserRole.REFEREE]: [
    'What inspired you to become a pickleball referee?',
    'What do you find most rewarding about officiating?',
    'What aspects of refereeing do you want to master?',
    'How does being a referee enhance your connection to the sport?'
  ],
  [UserRole.ADMIN]: [
    'What led you to take on an administrative role?',
    'What improvements do you hope to bring to the pickleball community?',
    'What vision do you have for growing the sport?'
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
      return <Flag className="h-5 w-5" />;
    case UserRole.ADMIN:
      return <Award className="h-5 w-5" />;
    default:
      return <User className="h-5 w-5" />;
  }
};

interface WhyExplorationProps {
  role: UserRole;
}

/**
 * Why Exploration component for capturing role motivation
 */
export function WhyExploration({ role }: WhyExplorationProps) {
  const { getRoleLabel, getRoleMetadata, updateRoleMetadata } = useJourneyRoles();
  const metadata = getRoleMetadata(role);
  
  // Local state for the component
  const [why, setWhy] = useState(metadata.why || '');
  const [experience, setExperience] = useState<ExperienceLevel>(metadata.experience);
  
  // Get role-specific prompts
  const prompts = useMemo(() => {
    return ROLE_PROMPTS[role] || [];
  }, [role]);
  
  // Handle why text change
  const handleWhyChange = (value: string) => {
    setWhy(value);
    updateRoleMetadata(role, { why: value });
  };
  
  // Handle experience level change
  const handleExperienceChange = (value: string) => {
    const expLevel = value as ExperienceLevel;
    setExperience(expLevel);
    updateRoleMetadata(role, { experience: expLevel });
  };
  
  return (
    <div className="why-exploration space-y-6">
      <div className="text-center">
        <Badge className="mb-2" variant="outline">
          <RoleIcon role={role} />
          <span className="ml-1.5">{getRoleLabel(role)}</span>
        </Badge>
        <h3 className="text-2xl font-bold tracking-tight">Your {getRoleLabel(role)} Journey</h3>
        <p className="text-muted-foreground mt-2">
          Tell us why this role is important to you and your experience level
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lightbulb className="mr-2 h-5 w-5 text-amber-500" />
                Reflection Prompts
              </CardTitle>
              <CardDescription>
                Consider these questions to help articulate your journey
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {prompts.map((prompt, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="p-3 bg-muted rounded-md text-sm"
                >
                  {prompt}
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </div>
        
        <div className="col-span-1 md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Your Experience & Motivation</CardTitle>
              <CardDescription>
                This helps personalize your PickleJourney™ experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Your {getRoleLabel(role)} Experience Level
                </label>
                <Select
                  value={experience}
                  onValueChange={handleExperienceChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`Select your experience level`} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ExperienceLevel.BEGINNER}>Beginner</SelectItem>
                    <SelectItem value={ExperienceLevel.INTERMEDIATE}>Intermediate</SelectItem>
                    <SelectItem value={ExperienceLevel.ADVANCED}>Advanced</SelectItem>
                    <SelectItem value={ExperienceLevel.EXPERT}>Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Your "Why" for this Role
                </label>
                <Textarea
                  value={why}
                  onChange={(e) => handleWhyChange(e.target.value)}
                  placeholder={`Share why being a ${getRoleLabel(role).toLowerCase()} is meaningful to you...`}
                  className="min-h-[200px] resize-y"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {why.length === 0 
                    ? "Please share your thoughts to continue" 
                    : `${why.length} characters`}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}