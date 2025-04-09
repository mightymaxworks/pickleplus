import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { EnhancedUser } from '@/types/enhanced-user';
import { Settings, Shield, Eye, EyeOff, Users } from 'lucide-react';
import { ProfilePrivacySelector } from '../ProfilePrivacySelector';
import { FieldVisibilitySettings } from '../FieldVisibilitySettings';

interface PrivacyControlPanelProps {
  user: EnhancedUser;
}

export function PrivacyControlPanel({ user }: PrivacyControlPanelProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center">
          <Shield className="h-5 w-5 mr-2 text-primary" />
          <CardTitle>Privacy Settings</CardTitle>
        </div>
        <CardDescription>
          Control who can see your profile information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Profile Visibility</h3>
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-1">Current Profile Mode:</h4>
              <div className="flex items-center gap-2">
                {user.privacyProfile === 'public' && (
                  <>
                    <Eye className="h-4 w-4 text-green-500" />
                    <span className="text-green-500 font-medium">Public</span>
                    <span className="text-sm text-muted-foreground">- Your profile is visible to everyone</span>
                  </>
                )}
                {user.privacyProfile === 'connections' && (
                  <>
                    <Users className="h-4 w-4 text-blue-500" />
                    <span className="text-blue-500 font-medium">Connections Only</span>
                    <span className="text-sm text-muted-foreground">- Only your connections can view your profile</span>
                  </>
                )}
                {(user.privacyProfile === 'private' || !user.privacyProfile) && (
                  <>
                    <EyeOff className="h-4 w-4 text-amber-500" />
                    <span className="text-amber-500 font-medium">Private</span>
                    <span className="text-sm text-muted-foreground">- Your profile is only visible to you</span>
                  </>
                )}
              </div>
            </div>
            <ProfilePrivacySelector 
              defaultProfile={user.privacyProfile || 'public'} 
              onSave={(value) => console.log('Privacy profile updated:', value)} 
            />
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-4">
          <div className="flex items-center">
            <Settings className="h-5 w-5 mr-2 text-primary" />
            <h3 className="text-lg font-semibold">Field Visibility Settings</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Customize privacy settings for individual fields in your profile
          </p>
          <div className="bg-muted/30 rounded-lg p-4">
            <FieldVisibilitySettings 
              onSave={(settings) => console.log('Field settings updated:', settings)} 
            />
          </div>
        </div>

        <Separator />
        
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Privacy FAQ</h3>
          <div className="space-y-3">
            <div>
              <h4 className="font-medium mb-1">What does "Public" mean?</h4>
              <p className="text-sm text-muted-foreground">
                Your profile information will be visible to anyone using the platform, including non-registered users.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-1">What does "Connections Only" mean?</h4>
              <p className="text-sm text-muted-foreground">
                Only users you've connected with will be able to see your complete profile information.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-1">What does "Private" mean?</h4>
              <p className="text-sm text-muted-foreground">
                Your profile information will only be visible to you. A limited set of information may still be visible in search results.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}