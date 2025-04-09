import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { EnhancedUser } from '@/types/enhanced-user';
import { LifeBuoy, MapPin } from 'lucide-react';

interface EquipmentPreferencesTabProps {
  user: EnhancedUser;
}

export function EquipmentPreferencesTab({ user }: EquipmentPreferencesTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Equipment & Preferences</CardTitle>
        <CardDescription>
          Your gear setup and playing preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Equipment Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center mb-3">
              <LifeBuoy className="h-5 w-5 mr-2 text-primary" />
              <h3 className="text-lg font-semibold">Equipment</h3>
            </div>
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-1">
                <div className="text-muted-foreground">Primary Paddle</div>
                <div className="col-span-2">
                  {user.paddleBrand && user.paddleModel 
                    ? `${user.paddleBrand} ${user.paddleModel}` 
                    : 'Not set'}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <div className="text-muted-foreground">Backup Paddle</div>
                <div className="col-span-2">
                  {user.backupPaddleBrand && user.backupPaddleModel 
                    ? `${user.backupPaddleBrand} ${user.backupPaddleModel}` 
                    : 'Not set'}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <div className="text-muted-foreground">Other Gear</div>
                <div className="col-span-2">{user.otherEquipment || 'Not set'}</div>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <div className="text-muted-foreground">Playing Style</div>
                <div className="col-span-2">{user.playingStyle || 'Not set'}</div>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <div className="text-muted-foreground">Shot Strengths</div>
                <div className="col-span-2">{user.shotStrengths || 'Not set'}</div>
              </div>
            </div>
          </div>
          
          <div>
            <div className="flex items-center mb-3">
              <MapPin className="h-5 w-5 mr-2 text-primary" />
              <h3 className="text-lg font-semibold">Court Preferences</h3>
            </div>
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-1">
                <div className="text-muted-foreground">Surface</div>
                <div className="col-span-2">{user.preferredSurface || 'Not set'}</div>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <div className="text-muted-foreground">Environment</div>
                <div className="col-span-2">{user.indoorOutdoorPreference || 'Not set'}</div>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <div className="text-muted-foreground">Position</div>
                <div className="col-span-2">{user.preferredPosition || 'Not set'}</div>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <div className="text-muted-foreground">Format</div>
                <div className="col-span-2">{user.preferredFormat || 'Not set'}</div>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <div className="text-muted-foreground">Dominant Hand</div>
                <div className="col-span-2">{user.dominantHand || 'Not set'}</div>
              </div>
            </div>
          </div>
        </div>
        
        <Separator />
        
        {/* Location Section */}
        <div>
          <div className="flex items-center mb-3">
            <MapPin className="h-5 w-5 mr-2 text-primary" />
            <h3 className="text-lg font-semibold">Location Preferences</h3>
          </div>
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-1">
              <div className="text-muted-foreground">Home Courts</div>
              <div className="col-span-2">{user.homeCourtLocations || 'Not set'}</div>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <div className="text-muted-foreground">Travel Radius</div>
              <div className="col-span-2">{user.travelRadiusKm ? `${user.travelRadiusKm} km` : 'Not set'}</div>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <div className="text-muted-foreground">Regular Schedule</div>
              <div className="col-span-2">{user.regularSchedule 
                ? user.regularSchedule.split(',').map(day => day.trim()).join(', ') 
                : 'Not set'}
              </div>
            </div>
          </div>
        </div>

        {/* Skill Level Section */}
        <Separator />
        
        <div>
          <h3 className="text-lg font-semibold mb-3">Player Level</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid grid-cols-3 gap-1">
              <div className="text-muted-foreground">Skill Level</div>
              <div className="col-span-2">{user.skillLevel || 'Not set'}</div>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <div className="text-muted-foreground">Playing Since</div>
              <div className="col-span-2">{user.playingSince || 'Not set'}</div>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <div className="text-muted-foreground">Competitive Level</div>
              <div className="col-span-2">{user.competitiveIntensity 
                ? `${user.competitiveIntensity}/10` 
                : 'Not set'}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}