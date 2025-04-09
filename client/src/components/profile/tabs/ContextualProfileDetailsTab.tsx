/**
 * PKL-278651-CPEM-0001: Contextual Profile Editing Mode
 * 
 * Updated profile details tab that uses contextual editing components
 * for a seamless editing experience.
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { z } from 'zod';
import { EnhancedUser } from '@/types/enhanced-user';
import { 
  ContextualEditField, 
  ContextualEditSelect, 
  ContextualEditToggle 
} from '../contextual-edit';
import { useProfileEdit } from '@/contexts/ProfileEditContext';

// Validators
const heightValidator = z.number().int().min(100).max(250).optional()
  .refine(val => val === undefined || val === null || val >= 100, {
    message: "Height must be at least 100cm"
  });

const reachValidator = z.number().int().min(50).max(300).optional()
  .refine(val => val === undefined || val === null || val >= 50, {
    message: "Reach must be at least 50cm"
  });

const yearOfBirthValidator = z.number().int().min(1900).max(new Date().getFullYear() - 10).optional()
  .refine(val => val === undefined || val === null || val >= 1900, {
    message: "Year must be at least 1900"
  });

const bioValidator = z.string().max(500).optional();
const playerGoalsValidator = z.string().max(500).optional();

interface ContextualProfileDetailsTabProps {
  user: EnhancedUser;
}

export function ContextualProfileDetailsTab({ user }: ContextualProfileDetailsTabProps) {
  const { isEditMode } = useProfileEdit();

  // Define skill level options for the dropdown
  const skillLevelOptions = [
    { value: '2.0', label: '2.0' },
    { value: '2.5', label: '2.5' },
    { value: '3.0', label: '3.0' },
    { value: '3.5', label: '3.5' },
    { value: '4.0', label: '4.0' },
    { value: '4.5', label: '4.5' },
    { value: '5.0', label: '5.0' },
    { value: '5.5', label: '5.5' },
    { value: '6.0', label: '6.0' },
  ];

  // Define position options for the dropdown
  const positionOptions = [
    { value: 'forehand', label: 'Forehand Side' },
    { value: 'backhand', label: 'Backhand Side' },
    { value: 'either', label: 'Either Side' },
  ];

  // Define playing style options
  const playingStyleOptions = [
    { value: 'aggressive', label: 'Aggressive' },
    { value: 'defensive', label: 'Defensive' },
    { value: 'strategic', label: 'Strategic' },
    { value: 'all-court', label: 'All-Court' },
  ];

  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ContextualEditField
              fieldName="displayName"
              fieldLabel="Display Name"
              initialValue={user.displayName || null}
              placeholder="Enter your display name"
            />
            
            <ContextualEditField
              fieldName="location"
              fieldLabel="Location"
              initialValue={user.location || null}
              placeholder="Enter your location"
            />
            
            <ContextualEditSelect
              fieldName="skillLevel"
              fieldLabel="Skill Level"
              initialValue={user.skillLevel || null}
              options={skillLevelOptions}
              placeholder="Select your skill level"
            />
            
            <ContextualEditField
              fieldName="playingSince"
              fieldLabel="Playing Since"
              initialValue={user.playingSince || null}
              placeholder="Enter year started playing"
            />
          </div>
        </div>
        
        <Separator />
        
        {/* Physical Attributes */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Physical Attributes</h3>
          <div className="space-y-4">
            <ContextualEditField
              fieldName="height"
              fieldLabel="Height (cm)"
              initialValue={user.height || null}
              type="number"
              placeholder="Enter your height in cm"
              validator={heightValidator}
            />
            
            <ContextualEditField
              fieldName="reach"
              fieldLabel="Reach (cm)"
              initialValue={user.reach || null}
              type="number"
              placeholder="Enter your reach in cm"
              validator={reachValidator}
            />
            
            <ContextualEditField
              fieldName="yearOfBirth"
              fieldLabel="Year of Birth"
              initialValue={user.yearOfBirth || null}
              type="number"
              placeholder="Enter your birth year"
              validator={yearOfBirthValidator}
            />
          </div>
        </div>
        
        <Separator />
        
        {/* Playing Preferences */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Playing Preferences</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ContextualEditSelect
              fieldName="preferredPosition"
              fieldLabel="Preferred Position"
              initialValue={user.preferredPosition || null}
              options={positionOptions}
            />
            
            <ContextualEditSelect
              fieldName="playingStyle"
              fieldLabel="Playing Style"
              initialValue={user.playingStyle || null}
              options={playingStyleOptions}
            />
          </div>
        </div>
        
        <Separator />
        
        {/* Equipment */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Equipment</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ContextualEditField
              fieldName="paddleBrand"
              fieldLabel="Paddle Brand"
              initialValue={user.paddleBrand || null}
              placeholder="Enter your paddle brand"
            />
            
            <ContextualEditField
              fieldName="paddleModel"
              fieldLabel="Paddle Model"
              initialValue={user.paddleModel || null}
              placeholder="Enter your paddle model"
            />
          </div>
        </div>
        
        <Separator />
        
        {/* Additional Information */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Additional Information</h3>
          <div className="space-y-4">
            <ContextualEditField
              fieldName="bio"
              fieldLabel="Bio"
              initialValue={user.bio || null}
              placeholder="Tell others about yourself"
              validator={bioValidator}
              className="mb-4"
            />
            
            <ContextualEditField
              fieldName="playerGoals"
              fieldLabel="Player Goals"
              initialValue={user.playerGoals || null}
              placeholder="Share your pickleball goals"
              validator={playerGoalsValidator}
              className="mb-4"
            />
            
            <div className="space-y-3">
              <ContextualEditToggle
                fieldName="lookingForPartners"
                fieldLabel="Looking for Partners"
                description="Show others that you're open to finding new playing partners"
                initialValue={!!user.lookingForPartners}
              />
              
              <ContextualEditToggle
                fieldName="mentorshipInterest"
                fieldLabel="Interested in Mentorship"
                description="Indicate if you're interested in mentoring others or being mentored"
                initialValue={!!user.mentorshipInterest}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}