import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { EnhancedUser } from '@/types/enhanced-user';

interface ProfileDetailsTabProps {
  user: EnhancedUser;
}

export function ProfileDetailsTab({ user }: ProfileDetailsTabProps) {
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
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-1">
                <div className="text-muted-foreground">Player ID</div>
                <div className="col-span-2">{user.passportId || 'Not assigned'}</div>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <div className="text-muted-foreground">Username</div>
                <div className="col-span-2">{user.username}</div>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <div className="text-muted-foreground">Display Name</div>
                <div className="col-span-2">{user.displayName || 'Not set'}</div>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <div className="text-muted-foreground">Location</div>
                <div className="col-span-2">{user.location || 'Not set'}</div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-3">Physical Attributes</h3>
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-1">
                <div className="text-muted-foreground">Height</div>
                <div className="col-span-2">{user.height ? `${user.height} cm` : 'Not set'}</div>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <div className="text-muted-foreground">Reach</div>
                <div className="col-span-2">{user.reach ? `${user.reach} cm` : 'Not set'}</div>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <div className="text-muted-foreground">Year of Birth</div>
                <div className="col-span-2">{user.yearOfBirth || 'Not set'}</div>
              </div>
            </div>
          </div>
        </div>
        
        <Separator />
        
        {/* Additional Information */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Additional Information</h3>
          <div className="space-y-4">
            <div>
              <div className="text-muted-foreground mb-1">Bio</div>
              <div className="text-sm">{user.bio || 'No bio provided'}</div>
            </div>
            
            <div>
              <div className="text-muted-foreground mb-1">Player Goals</div>
              <div className="text-sm">{user.playerGoals || 'No goals set'}</div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {user.lookingForPartners && (
                <Badge variant="outline" className="bg-primary/10">
                  Looking for Partners
                </Badge>
              )}
              {user.mentorshipInterest && (
                <Badge variant="outline" className="bg-primary/10">
                  Interested in Mentorship
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}