/**
 * PKL-278651-EPEF-0001: Enhanced Profile Inline Editing Feature
 */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { EnhancedUser } from '@/types/enhanced-user';
import { ProfileInlineEdit, ProfileInlineToggle } from '../inline-edit';
import { z } from 'zod';

interface ProfileDetailsTabProps {
  user: EnhancedUser;
  editable?: boolean;
}

export function ProfileDetailsTab({ user, editable = true }: ProfileDetailsTabProps) {
  // Validators for various fields
  const displayNameValidator = z.string().min(2, "Display name must be at least 2 characters");
  const locationValidator = z.string().min(2, "Location must be at least 2 characters");
  const yearOfBirthValidator = z.number().min(1900, "Must be a valid year").max(new Date().getFullYear(), "Cannot be in the future");
  const heightValidator = z.number().min(100, "Height must be at least 100 cm").max(250, "Height must be less than 250 cm");
  const reachValidator = z.number().min(50, "Reach must be at least 50 cm").max(300, "Reach must be less than 300 cm");
  const bioValidator = z.string().max(500, "Bio must be less than 500 characters");
  const playerGoalsValidator = z.string().max(500, "Goals must be less than 500 characters");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Player Overview</CardTitle>
        <CardDescription>
          Your comprehensive player profile
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="text-muted-foreground text-sm">Player ID</div>
                <div>{user.passportId || 'Not assigned'}</div>
              </div>
              
              <div className="space-y-1">
                <div className="text-muted-foreground text-sm">Username</div>
                <div>{user.username}</div>
              </div>
              
              {editable ? (
                <ProfileInlineEdit
                  fieldName="displayName"
                  fieldLabel="Display Name"
                  initialValue={user.displayName}
                  placeholder="Enter your display name"
                  validator={displayNameValidator}
                />
              ) : (
                <div className="space-y-1">
                  <div className="text-muted-foreground text-sm">Display Name</div>
                  <div>{user.displayName || 'Not set'}</div>
                </div>
              )}
              
              {editable ? (
                <ProfileInlineEdit
                  fieldName="location"
                  fieldLabel="Location"
                  initialValue={user.location}
                  placeholder="Enter your location"
                  validator={locationValidator}
                />
              ) : (
                <div className="space-y-1">
                  <div className="text-muted-foreground text-sm">Location</div>
                  <div>{user.location || 'Not set'}</div>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-3">Physical Attributes</h3>
            <div className="space-y-4">
              {editable ? (
                <ProfileInlineEdit
                  fieldName="height"
                  fieldLabel="Height (cm)"
                  initialValue={user.height || null}
                  type="number"
                  placeholder="Enter your height in cm"
                  validator={heightValidator}
                />
              ) : (
                <div className="space-y-1">
                  <div className="text-muted-foreground text-sm">Height</div>
                  <div>{user.height ? `${user.height} cm` : 'Not set'}</div>
                </div>
              )}
              
              {editable ? (
                <ProfileInlineEdit
                  fieldName="reach"
                  fieldLabel="Reach (cm)"
                  initialValue={user.reach || null}
                  type="number"
                  placeholder="Enter your reach in cm"
                  validator={reachValidator}
                />
              ) : (
                <div className="space-y-1">
                  <div className="text-muted-foreground text-sm">Reach</div>
                  <div>{user.reach ? `${user.reach} cm` : 'Not set'}</div>
                </div>
              )}
              
              {editable ? (
                <ProfileInlineEdit
                  fieldName="yearOfBirth"
                  fieldLabel="Year of Birth"
                  initialValue={user.yearOfBirth || null}
                  type="number"
                  placeholder="Enter your birth year"
                  validator={yearOfBirthValidator}
                />
              ) : (
                <div className="space-y-1">
                  <div className="text-muted-foreground text-sm">Year of Birth</div>
                  <div>{user.yearOfBirth || 'Not set'}</div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <Separator />
        
        {/* Additional Information */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Additional Information</h3>
          <div className="space-y-4">
            {editable ? (
              <ProfileInlineEdit
                fieldName="bio"
                fieldLabel="Bio"
                initialValue={user.bio || null}
                placeholder="Tell others about yourself"
                validator={bioValidator}
                className="mb-4"
              />
            ) : (
              <div className="space-y-1 mb-4">
                <div className="text-muted-foreground text-sm">Bio</div>
                <div className="text-sm whitespace-pre-line">{user.bio || 'No bio provided'}</div>
              </div>
            )}
            
            {editable ? (
              <ProfileInlineEdit
                fieldName="playerGoals"
                fieldLabel="Player Goals"
                initialValue={user.playerGoals || null}
                placeholder="Share your pickleball goals"
                validator={playerGoalsValidator}
                className="mb-4"
              />
            ) : (
              <div className="space-y-1 mb-4">
                <div className="text-muted-foreground text-sm">Player Goals</div>
                <div className="text-sm">{user.playerGoals || 'No goals set'}</div>
              </div>
            )}
            
            <div className="space-y-3">
              {editable ? (
                <ProfileInlineToggle
                  fieldName="lookingForPartners"
                  fieldLabel="Looking for Partners"
                  description="Show others that you're open to finding new playing partners"
                  initialValue={!!user.lookingForPartners}
                />
              ) : user.lookingForPartners ? (
                <Badge variant="outline" className="bg-primary/10">
                  Looking for Partners
                </Badge>
              ) : null}
              
              {editable ? (
                <ProfileInlineToggle
                  fieldName="mentorshipInterest"
                  fieldLabel="Interested in Mentorship"
                  description="Indicate if you're interested in mentoring others or being mentored"
                  initialValue={!!user.mentorshipInterest}
                />
              ) : user.mentorshipInterest ? (
                <Badge variant="outline" className="bg-primary/10">
                  Interested in Mentorship
                </Badge>
              ) : null}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}