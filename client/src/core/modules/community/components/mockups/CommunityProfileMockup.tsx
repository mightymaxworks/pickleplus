/**
 * PKL-278651-COMM-0001-UIMOCK
 * Community Profile Mockup
 * 
 * This component displays a mockup of a community profile page.
 */
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, Calendar, Trophy, MapPin, Share, Bell, Flag,
  Mail, ExternalLink, BarChart, UserPlus, Star, Hash
} from 'lucide-react';

const CommunityProfileMockup: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative">
        <div className="h-48 bg-gradient-to-r from-primary/40 to-primary rounded-t-lg"></div>
        <div className="absolute -bottom-12 left-8 ring-4 ring-background p-1 rounded-2xl bg-background">
          <Avatar className="h-24 w-24">
            <AvatarImage src="https://via.placeholder.com/100" />
            <AvatarFallback>SPC</AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Community Info Section */}
      <div className="pt-14 px-4 flex flex-col lg:flex-row justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Seattle Pickleball Club</h1>
          <div className="flex items-center text-muted-foreground mt-1">
            <MapPin className="h-4 w-4 mr-1" />
            <span>Seattle, WA</span>
            <span className="mx-2">•</span>
            <Users className="h-4 w-4 mr-1" />
            <span>342 members</span>
            <span className="mx-2">•</span>
            <Calendar className="h-4 w-4 mr-1" />
            <span>Founded Jan 2024</span>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge variant="secondary">Competitive</Badge>
            <Badge variant="secondary">All Levels</Badge>
            <Badge variant="secondary">Weekly Matches</Badge>
            <Badge variant="secondary">Training</Badge>
          </div>
        </div>
        <div className="flex gap-2 mt-4 lg:mt-0">
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Join
          </Button>
          <Button variant="outline">
            <Bell className="h-4 w-4 mr-2" />
            Follow
          </Button>
          <Button variant="ghost" size="icon">
            <Share className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Flag className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="about" className="mt-6">
        <TabsList className="grid grid-cols-5 max-w-2xl">
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="photos">Photos</TabsTrigger>
          <TabsTrigger value="discussions">Discussions</TabsTrigger>
        </TabsList>

        <TabsContent value="about" className="pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>About Seattle Pickleball Club</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    The largest pickleball community in Seattle with regular events and training sessions for all skill levels. 
                    We organize tournaments, social play, clinics, and workshops throughout the year.
                  </p>
                  <p className="text-muted-foreground mb-4">
                    Our mission is to promote the sport of pickleball, foster a supportive community, and help players
                    of all skill levels improve their game and have fun.
                  </p>
                  <h3 className="font-medium text-lg mt-6 mb-2">Locations</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <MapPin className="h-5 w-5 mr-2 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Green Lake Community Center</p>
                        <p className="text-sm text-muted-foreground">7201 E Green Lake Dr N, Seattle, WA 98115</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <MapPin className="h-5 w-5 mr-2 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Yesler Terrace Park</p>
                        <p className="text-sm text-muted-foreground">917 Yesler Way, Seattle, WA 98122</p>
                      </div>
                    </li>
                  </ul>
                  <h3 className="font-medium text-lg mt-6 mb-2">Contact</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 mr-2 text-muted-foreground" />
                      <span>seattlepickleballclub@example.com</span>
                    </div>
                    <div className="flex items-center">
                      <ExternalLink className="h-5 w-5 mr-2 text-muted-foreground" />
                      <a href="#" className="text-primary hover:underline">seattlepickleballclub.org</a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-4 pb-4 border-b">
                      <div className="bg-muted rounded-md p-3 text-center h-16 w-16 shrink-0">
                        <p className="text-sm font-medium">APR</p>
                        <p className="text-xl font-bold">18</p>
                      </div>
                      <div>
                        <h4 className="font-medium">Weekly Drop-In Play</h4>
                        <p className="text-sm text-muted-foreground mb-1">Green Lake Community Center • 6:00 PM - 9:00 PM</p>
                        <div className="flex items-center text-sm">
                          <Users className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                          <span className="text-muted-foreground">24 going</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-4 pb-4 border-b">
                      <div className="bg-muted rounded-md p-3 text-center h-16 w-16 shrink-0">
                        <p className="text-sm font-medium">APR</p>
                        <p className="text-xl font-bold">22</p>
                      </div>
                      <div>
                        <h4 className="font-medium">Intermediate Skills Clinic</h4>
                        <p className="text-sm text-muted-foreground mb-1">Yesler Terrace Park • 10:00 AM - 12:00 PM</p>
                        <div className="flex items-center text-sm">
                          <Users className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                          <span className="text-muted-foreground">18 going</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="bg-muted rounded-md p-3 text-center h-16 w-16 shrink-0">
                        <p className="text-sm font-medium">APR</p>
                        <p className="text-xl font-bold">29</p>
                      </div>
                      <div>
                        <h4 className="font-medium">Spring Mixer Tournament</h4>
                        <p className="text-sm text-muted-foreground mb-1">Green Lake Community Center • 9:00 AM - 4:00 PM</p>
                        <div className="flex items-center text-sm">
                          <Users className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                          <span className="text-muted-foreground">42 going</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    View All Events
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Admins & Organizers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarImage src="https://via.placeholder.com/40" />
                        <AvatarFallback>JD</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">John Doe</p>
                        <p className="text-xs text-muted-foreground">Founder & President</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarImage src="https://via.placeholder.com/40" />
                        <AvatarFallback>JS</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">Jane Smith</p>
                        <p className="text-xs text-muted-foreground">Event Coordinator</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarImage src="https://via.placeholder.com/40" />
                        <AvatarFallback>RJ</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">Robert Johnson</p>
                        <p className="text-xs text-muted-foreground">Membership Manager</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Users className="h-5 w-5 mr-2 text-muted-foreground" />
                        <span>Members</span>
                      </div>
                      <span className="font-medium">342</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Star className="h-5 w-5 mr-2 text-muted-foreground" />
                        <span>Average Rating</span>
                      </div>
                      <span className="font-medium">4.8 / 5</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
                        <span>Events This Month</span>
                      </div>
                      <span className="font-medium">12</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <BarChart className="h-5 w-5 mr-2 text-muted-foreground" />
                        <span>Activity Level</span>
                      </div>
                      <span className="font-medium">Very Active</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Trophy className="h-5 w-5 mr-2 text-muted-foreground" />
                        <span>Tournaments Hosted</span>
                      </div>
                      <span className="font-medium">27</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Popular Hashtags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="flex items-center">
                      <Hash className="h-3 w-3 mr-1" />
                      SeattlePickleball
                    </Badge>
                    <Badge variant="secondary" className="flex items-center">
                      <Hash className="h-3 w-3 mr-1" />
                      PickleLife
                    </Badge>
                    <Badge variant="secondary" className="flex items-center">
                      <Hash className="h-3 w-3 mr-1" />
                      GreenLakePlay
                    </Badge>
                    <Badge variant="secondary" className="flex items-center">
                      <Hash className="h-3 w-3 mr-1" />
                      PNWPickleball
                    </Badge>
                    <Badge variant="secondary" className="flex items-center">
                      <Hash className="h-3 w-3 mr-1" />
                      WeekendWarriors
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="events" className="pt-6">
          <div className="flex items-center justify-center h-96 bg-muted/30 rounded-lg">
            <div className="text-center max-w-md">
              <Calendar className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">Events Calendar</h3>
              <p className="text-muted-foreground">
                This tab would display a calendar of upcoming events, registration options,
                past events history, and event photo galleries.
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="members" className="pt-6">
          <div className="flex items-center justify-center h-96 bg-muted/30 rounded-lg">
            <div className="text-center max-w-md">
              <Users className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">Members Directory</h3>
              <p className="text-muted-foreground">
                This tab would display the member directory, leadership team,
                skill level distribution, and options to connect with other members.
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="photos" className="pt-6">
          <div className="flex items-center justify-center h-96 bg-muted/30 rounded-lg">
            <div className="text-center max-w-md">
              <ExternalLink className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">Photo Galleries</h3>
              <p className="text-muted-foreground">
                This tab would display photo galleries from events, tournaments,
                practice sessions, and social gatherings.
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="discussions" className="pt-6">
          <div className="flex items-center justify-center h-96 bg-muted/30 rounded-lg">
            <div className="text-center max-w-md">
              <MessageSquare className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">Community Discussions</h3>
              <p className="text-muted-foreground">
                This tab would feature discussion forums, announcements,
                training tips, and equipment recommendations from the community.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Import MessageSquare icon since it's used in the component
import { MessageSquare } from 'lucide-react';

export default CommunityProfileMockup;