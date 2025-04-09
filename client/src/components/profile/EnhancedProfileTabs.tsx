import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  User, 
  Settings, 
  BarChart3, 
  History, 
  Award, 
  Sword, 
  LifeBuoy,
  Dumbbell,
  MapPin,
  Calendar,
  Target
} from 'lucide-react';

import { EnhancedUser } from '@/types/enhanced-user';
import { ProfilePrivacySelector } from './ProfilePrivacySelector';
import { FieldVisibilitySettings } from './FieldVisibilitySettings';

interface EnhancedProfileTabsProps {
  user: EnhancedUser;
}

export function EnhancedProfileTabs({ user }: EnhancedProfileTabsProps) {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="grid grid-cols-4 md:w-[600px]">
        <TabsTrigger value="overview">
          <User className="h-4 w-4 mr-2 md:mr-3" />
          <span className="hidden md:inline">Overview</span>
          <span className="md:hidden">Overview</span>
        </TabsTrigger>
        <TabsTrigger value="statistics">
          <BarChart3 className="h-4 w-4 mr-2 md:mr-3" />
          <span className="hidden md:inline">Statistics</span>
          <span className="md:hidden">Stats</span>
        </TabsTrigger>
        <TabsTrigger value="history">
          <History className="h-4 w-4 mr-2 md:mr-3" />
          <span className="hidden md:inline">History</span>
          <span className="md:hidden">History</span>
        </TabsTrigger>
        <TabsTrigger value="settings">
          <Settings className="h-4 w-4 mr-2 md:mr-3" />
          <span className="hidden md:inline">Settings</span>
          <span className="md:hidden">Settings</span>
        </TabsTrigger>
      </TabsList>

      {/* Overview Tab Content */}
      <TabsContent value="overview" className="space-y-6">
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
            
            {/* Equipment & Court Preferences */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Equipment</h3>
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
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3">Court Preferences</h3>
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
      </TabsContent>

      {/* Statistics Tab Content */}
      <TabsContent value="statistics" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Statistics</CardTitle>
            <CardDescription>
              Your detailed performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Match Statistics */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Match Statistics</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-muted/40 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold">{user.totalMatches || 0}</div>
                    <div className="text-sm text-muted-foreground">Total Matches</div>
                  </div>
                  <div className="bg-muted/40 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold">{user.matchesWon || 0}</div>
                    <div className="text-sm text-muted-foreground">Wins</div>
                  </div>
                  <div className="bg-muted/40 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold">
                      {user.totalMatches ? user.totalMatches - (user.matchesWon || 0) : 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Losses</div>
                  </div>
                  <div className="bg-muted/40 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold">
                      {user.totalMatches && user.matchesWon 
                        ? Math.round((user.matchesWon / user.totalMatches) * 100) 
                        : 0}%
                    </div>
                    <div className="text-sm text-muted-foreground">Win Rate</div>
                  </div>
                </div>
              </div>
              
              {/* Skill Ratings - using a radar chart in a real implementation */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Skill Ratings</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center">
                        <Target className="h-4 w-4 mr-2 text-primary" />
                        Forehand
                      </div>
                      <span>{user.forehandStrength || 'N/A'}</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded">
                      <div 
                        className="h-full bg-primary rounded" 
                        style={{ width: `${(user.forehandStrength || 0) * 10}%` }} 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center">
                        <Target className="h-4 w-4 mr-2 text-primary" />
                        Backhand
                      </div>
                      <span>{user.backhandStrength || 'N/A'}</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded">
                      <div 
                        className="h-full bg-primary rounded" 
                        style={{ width: `${(user.backhandStrength || 0) * 10}%` }} 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center">
                        <Sword className="h-4 w-4 mr-2 text-primary" />
                        Serve Power
                      </div>
                      <span>{user.servePower || 'N/A'}</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded">
                      <div 
                        className="h-full bg-primary rounded" 
                        style={{ width: `${(user.servePower || 0) * 10}%` }} 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center">
                        <Sword className="h-4 w-4 mr-2 text-primary" />
                        Dink Accuracy
                      </div>
                      <span>{user.dinkAccuracy || 'N/A'}</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded">
                      <div 
                        className="h-full bg-primary rounded" 
                        style={{ width: `${(user.dinkAccuracy || 0) * 10}%` }} 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center">
                        <Target className="h-4 w-4 mr-2 text-primary" />
                        Third Shot
                      </div>
                      <span>{user.thirdShotConsistency || 'N/A'}</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded">
                      <div 
                        className="h-full bg-primary rounded" 
                        style={{ width: `${(user.thirdShotConsistency || 0) * 10}%` }} 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center">
                        <Dumbbell className="h-4 w-4 mr-2 text-primary" />
                        Court Coverage
                      </div>
                      <span>{user.courtCoverage || 'N/A'}</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded">
                      <div 
                        className="h-full bg-primary rounded" 
                        style={{ width: `${(user.courtCoverage || 0) * 10}%` }} 
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Tournament Stats */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Tournament Statistics</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="bg-muted/40 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold">{user.tournamentCount || 0}</div>
                    <div className="text-sm text-muted-foreground">Tournaments</div>
                  </div>
                  <div className="bg-muted/40 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold">0</div>
                    <div className="text-sm text-muted-foreground">Medals</div>
                  </div>
                  <div className="bg-muted/40 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold">0</div>
                    <div className="text-sm text-muted-foreground">Championships</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Match History Tab Content */}
      <TabsContent value="history" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Match History</CardTitle>
            <CardDescription>
              Your recent match outcomes and performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* In a real implementation, this would fetch and display actual match history data */}
            <div className="py-8 text-center">
              <History className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-30" />
              <h3 className="text-lg font-medium mb-1">Match history coming soon</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                This feature is being developed and will show your detailed match history with performance analytics.
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Achievements</CardTitle>
            <CardDescription>
              Milestones and badges you've earned
            </CardDescription>
          </CardHeader>
          <CardContent>
            {user.achievements && user.achievements.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {user.achievements.map((achievement: any, index: number) => (
                  <div key={index} className="bg-muted/30 rounded-lg p-4 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Award className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{achievement.name}</div>
                      <div className="text-xs text-muted-foreground">{achievement.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <Award className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-30" />
                <h3 className="text-lg font-medium mb-1">No achievements yet</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Continue playing matches and participating in tournaments to earn achievements.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Privacy Settings Tab Content */}
      <TabsContent value="settings" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Privacy Settings</CardTitle>
            <CardDescription>
              Control who can see your profile information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Profile Visibility</h3>
              <div>
                <ProfilePrivacySelector 
                  defaultProfile={user.privacyProfile || 'public'} 
                  onSave={(value) => console.log('Privacy profile updated:', value)} 
                />
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Field Visibility Settings</h3>
              <div>
                <FieldVisibilitySettings 
                  onSave={(settings) => console.log('Field settings updated:', settings)} 
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}