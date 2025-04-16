/**
 * PKL-278651-COMM-0001-UIMOCK
 * Community Events Mockup
 * 
 * This component displays a mockup of the community events interface.
 */
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar, Clock, Users, MapPin, Filter, Search, 
  CalendarDays, CheckCircle, Plus, ChevronRight 
} from 'lucide-react';

// Example events data for the mockup
const EXAMPLE_EVENTS = [
  {
    id: 1,
    title: "Weekly Drop-In Play",
    date: "2025-04-18",
    time: "6:00 PM - 9:00 PM",
    location: "Green Lake Community Center",
    address: "7201 E Green Lake Dr N, Seattle, WA 98115",
    attendees: 24,
    maxAttendees: 32,
    description: "Open play for all levels. Courts will be organized by skill level. Bring your own paddle.",
    type: "Open Play",
    community: "Seattle Pickleball Club",
    image: "https://via.placeholder.com/300x200"
  },
  {
    id: 2,
    title: "Intermediate Skills Clinic",
    date: "2025-04-22",
    time: "10:00 AM - 12:00 PM",
    location: "Yesler Terrace Park",
    address: "917 Yesler Way, Seattle, WA 98122",
    attendees: 18,
    maxAttendees: 20,
    description: "Focus on third shot drops, dinking, and offensive strategies. For players 3.0-3.5.",
    type: "Training",
    community: "Seattle Pickleball Club",
    image: "https://via.placeholder.com/300x200"
  },
  {
    id: 3,
    title: "Spring Mixer Tournament",
    date: "2025-04-29",
    time: "9:00 AM - 4:00 PM",
    location: "Green Lake Community Center",
    address: "7201 E Green Lake Dr N, Seattle, WA 98115",
    attendees: 42,
    maxAttendees: 64,
    description: "Mixed doubles round robin tournament. Players will rotate partners. Prizes for top finishers.",
    type: "Tournament",
    community: "Seattle Pickleball Club",
    image: "https://via.placeholder.com/300x200"
  },
  {
    id: 4,
    title: "Beginners Workshop",
    date: "2025-05-05",
    time: "6:30 PM - 8:00 PM",
    location: "Ravenna Park Courts",
    address: "5520 Ravenna Ave NE, Seattle, WA 98105",
    attendees: 12,
    maxAttendees: 16,
    description: "Introduction to pickleball basics. Paddles available to borrow. Great for first-time players.",
    type: "Training",
    community: "Seattle Pickleball Club",
    image: "https://via.placeholder.com/300x200"
  },
  {
    id: 5,
    title: "Advanced Play Session",
    date: "2025-05-08",
    time: "7:00 PM - 9:00 PM",
    location: "Soundview Playfield",
    address: "1590 NW 90th St, Seattle, WA 98117",
    attendees: 16,
    maxAttendees: 20,
    description: "Competitive play for 4.0+ players. King of the court format with rotating partners.",
    type: "Open Play",
    community: "Seattle Pickleball Club",
    image: "https://via.placeholder.com/300x200"
  },
  {
    id: 6,
    title: "Pickleball Social & BBQ",
    date: "2025-05-14",
    time: "4:00 PM - 8:00 PM",
    location: "Magnuson Park",
    address: "7400 Sand Point Way NE, Seattle, WA 98115",
    attendees: 35,
    maxAttendees: 50,
    description: "Casual play followed by a community BBQ. Bring your favorite dish to share!",
    type: "Social",
    community: "Seattle Pickleball Club",
    image: "https://via.placeholder.com/300x200"
  }
];

const CommunityEventsMockup: React.FC = () => {
  const [viewType, setViewType] = useState('upcoming');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter events based on search term
  const filteredEvents = EXAMPLE_EVENTS.filter(event => 
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Filter for upcoming events (could use real date logic in a real implementation)
  const upcomingEvents = filteredEvents.slice(0, 4);
  const pastEvents = filteredEvents.slice(4, 6);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold">Community Events</h2>
          <p className="text-muted-foreground">
            Discover upcoming events or create your own.
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Event
        </Button>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Event Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="open">Open Play</SelectItem>
            <SelectItem value="training">Training</SelectItem>
            <SelectItem value="tournament">Tournaments</SelectItem>
            <SelectItem value="social">Social</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" className="sm:w-auto w-full">
          <Filter className="h-4 w-4 mr-2" />
          More Filters
        </Button>
      </div>

      {/* Event Tabs */}
      <Tabs value={viewType} onValueChange={setViewType} className="w-full">
        <TabsList className="w-full max-w-md grid grid-cols-3 mb-6">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="past">Past Events</TabsTrigger>
        </TabsList>

        {/* Upcoming Events */}
        <TabsContent value="upcoming" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {upcomingEvents.map(event => (
              <Card key={event.id} className="overflow-hidden">
                <div className="h-40 bg-muted relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <Badge className="mb-1">{event.type}</Badge>
                    <h3 className="text-xl font-semibold text-white">{event.title}</h3>
                    <div className="flex items-center text-white/90 text-sm mt-1">
                      <CalendarDays className="h-3.5 w-3.5 mr-1" />
                      {new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                </div>

                <CardContent className="pt-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{event.time}</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {event.attendees} / {event.maxAttendees}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 mr-1 text-muted-foreground shrink-0 mt-0.5" />
                      <div className="text-sm text-muted-foreground">
                        <div>{event.location}</div>
                        <div className="text-xs">{event.address}</div>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm mt-3 line-clamp-2">{event.description}</p>

                  <div className="flex items-center mt-3">
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarFallback>SC</AvatarFallback>
                    </Avatar>
                    <span className="text-xs">Hosted by {event.community}</span>
                  </div>
                </CardContent>

                <CardFooter className="flex justify-between pt-0">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                  <Button size="sm">
                    RSVP
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="mt-8">
            <Button variant="outline" className="w-full">
              Load More Events
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </TabsContent>

        {/* Calendar View */}
        <TabsContent value="calendar" className="mt-0">
          <div className="bg-muted rounded-lg h-[500px] flex items-center justify-center">
            <div className="text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Calendar View</h3>
              <p className="text-muted-foreground max-w-md">
                This would display a calendar with community events.
                Users could browse events by date and see availability.
              </p>
            </div>
          </div>
        </TabsContent>

        {/* Past Events */}
        <TabsContent value="past" className="mt-0">
          <div className="space-y-4">
            {pastEvents.map(event => (
              <Card key={event.id} className="overflow-hidden">
                <div className="flex flex-col sm:flex-row">
                  <div className="h-48 sm:h-auto sm:w-1/3 md:w-1/4 bg-muted relative">
                    <div className="absolute top-2 left-2">
                      <Badge variant="secondary" className="bg-background/80">Past Event</Badge>
                    </div>
                  </div>
                  <div className="flex-1 p-4">
                    <div className="mb-2">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="text-lg font-semibold">{event.title}</h3>
                        <Badge>{event.type}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm">
                        <div className="flex items-center">
                          <CalendarDays className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {new Date(event.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                          <span className="text-muted-foreground">{event.time}</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {event.attendees} attended
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm mb-3 line-clamp-2">{event.description}</p>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Avatar className="h-6 w-6 mr-2">
                          <AvatarFallback>SC</AvatarFallback>
                        </Avatar>
                        <span className="text-xs">{event.community}</span>
                      </div>
                      <Button variant="outline" size="sm">
                        View Recap
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            
            <Button variant="outline" className="w-full mt-4">
              View More Past Events
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Event Creation Teaser */}
      <Card className="mt-8 bg-muted/30">
        <CardHeader>
          <CardTitle>Create Your Own Event</CardTitle>
          <CardDescription>
            Organize games, clinics, tournaments, or social gatherings for your community.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3 space-y-2">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-primary mr-2" />
              <span>Easily manage RSVPs</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-primary mr-2" />
              <span>Set capacity and waitlists</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-primary mr-2" />
              <span>Share event details</span>
            </div>
          </div>
          <div className="md:w-1/3 space-y-2">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-primary mr-2" />
              <span>Collect fees (optional)</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-primary mr-2" />
              <span>Send automated reminders</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-primary mr-2" />
              <span>Create recurring events</span>
            </div>
          </div>
          <div className="md:w-1/3 flex justify-center items-center">
            <Button className="w-full md:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Create New Event
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CommunityEventsMockup;