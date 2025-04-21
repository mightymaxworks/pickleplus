/**
 * PKL-278651-CONN-0006-ROUTE-MOD - PicklePass™ URL Structure Refinement Modernization
 * PKL-278651-CONN-0008-UX-MOD - PicklePass™ UI/UX Enhancement Sprint v2.0
 * 
 * Event Discovery Wrapper Component
 * 
 * Wrapper for the EventDiscoveryPage that provides UI modernization while
 * maintaining backward compatibility with existing systems.
 * 
 * @implementation Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AppHeader } from '@/components/layout/AppHeader';
import { StandardLayout } from '@/components/layout/StandardLayout';
import { 
  TicketIcon, 
  UserCircle2Icon, 
  LockIcon, 
  CalendarIcon, 
  CheckIcon,
  MapPinIcon,
  UsersIcon,
  X as XIcon
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

// Components
import EventCheckInScanner from '@/components/events/EventCheckInScanner';
import EventList from '@/components/events/EventList';
import { MyEventsTab } from '@/components/events/MyEventsTab';
import ModernUniversalPassport from '@/components/events/ModernUniversalPassport';

// Data and types
import { getEvent } from '@/lib/sdk/eventSDK';
import { formatDateTime } from '@/lib/utils';
import type { Event } from '@shared/schema/events';

// Helper function to safely format date and time
const safeFormatDateTime = (dateString: any) => {
  try {
    if (!dateString) return 'Date and Time TBD';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Date and Time TBD';
    return formatDateTime(date);
  } catch (error) {
    console.error('Error formatting date and time:', error);
    return 'Date and Time TBD';
  }
};

export default function EventDiscoveryWrapper() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [activeTab, setActiveTab] = useState<string>('upcoming');
  const [showPassportDialog, setShowPassportDialog] = useState<boolean>(false);
  
  // Handle tab change with authentication check
  const handleTabChange = (value: string) => {
    // If trying to access protected tabs without being logged in
    if ((value === 'registered' || value === 'attended') && !user) {
      console.log('[Auth] Unauthorized user attempting to access protected tab:', value);
      toast({
        title: "Authentication Required",
        description: "Please log in to view your events",
        variant: "default"
      });
      navigate('/login');
      return;
    }
    
    setActiveTab(value);
  };
  
  // Fetch the selected event details when an event is selected
  const { data: eventDetails } = useQuery({
    queryKey: ['/api/events', selectedEvent?.id],
    queryFn: () => selectedEvent ? getEvent(selectedEvent.id) : null,
    enabled: !!selectedEvent?.id
  });
  
  // Handle event selection
  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
  };

  // Handle "View My Passport" click from the My Events tab
  const handleViewPassportClick = () => {
    if (!user) {
      console.log('[Auth] Unauthorized user attempting to view passport, showing login prompt');
      toast({
        title: "Authentication Required",
        description: "Please log in to view your universal passport",
        variant: "default"
      });
      navigate('/login');
      return;
    }
    
    setShowPassportDialog(true);
  };
  
  // The modernized content section of the page
  const content = (
    <div className="py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            <TicketIcon className="h-7 w-7 mr-2 text-primary/80" />
            PicklePass™ Events
          </h1>
          <p className="text-muted-foreground">
            Discover and register for events, view your universal passport
          </p>
        </div>
        
        <Button 
          variant="default"
          className="bg-primary hover:bg-primary/90 transition-all duration-300"
          onClick={handleViewPassportClick}
        >
          {!user ? (
            <>
              <LockIcon className="mr-2 h-4 w-4" />
              Login to View Passport
            </>
          ) : (
            <>
              <TicketIcon className="mr-2 h-4 w-4" />
              Show My Universal Passport
            </>
          )}
        </Button>
      </div>
    
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left column - Events list */}
        <div className="md:col-span-1">
          <Tabs defaultValue="upcoming" value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4 bg-muted/60 p-1 rounded-xl">
              <TabsTrigger 
                value="upcoming" 
                className="rounded-lg transition-all duration-300 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
              >
                Upcoming
              </TabsTrigger>
              <TabsTrigger 
                value="registered" 
                className="flex items-center rounded-lg transition-all duration-300 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
              >
                {!user && <LockIcon className="h-3 w-3 mr-1 text-muted-foreground" />}
                My Events
              </TabsTrigger>
              <TabsTrigger 
                value="attended" 
                className="flex items-center rounded-lg transition-all duration-300 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
              >
                {!user && <LockIcon className="h-3 w-3 mr-1 text-muted-foreground" />}
                Attended
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="upcoming" className="mt-0">
              <h2 className="text-xl font-semibold mb-3 flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2 text-primary/70" />
                Upcoming Events
              </h2>
              <EventList 
                showViewButton={true}
                onEventClick={handleEventClick}
                showEnhancedStatus={false}
              />
            </TabsContent>
            
            <TabsContent value="registered" className="mt-0">
              <MyEventsTab 
                onEventClick={handleEventClick}
                onPassportClick={handleViewPassportClick}
              />
            </TabsContent>
            
            <TabsContent value="attended" className="mt-0">
              <div className="mb-3">
                <h2 className="text-xl font-semibold flex items-center">
                  <CheckIcon className="h-5 w-5 mr-2 text-primary/70" />
                  Attended Events
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Track your event participation history
                </p>
              </div>
              
              <Card className="bg-gradient-to-b from-muted/20 to-muted/5 border-primary/10">
                <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="rounded-full bg-primary/5 w-20 h-20 flex items-center justify-center mb-5 border border-primary/10">
                    <CheckIcon className="h-10 w-10 text-primary/40" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No Events Yet</h3>
                  <p className="text-muted-foreground max-w-xs">
                    Events you've attended will appear here after you check in with your PicklePass™.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Right column - Event details and actions */}
        <div className="md:col-span-2">
          {selectedEvent ? (
            <Card className="overflow-hidden border-primary/10 shadow-lg">
              <CardHeader className="pb-3 border-b border-muted/40">
                <div className="flex justify-between items-start gap-4 mb-1">
                  <CardTitle>{selectedEvent.name}</CardTitle>
                  <Badge className="bg-primary/80">
                    PicklePass™ Enabled
                  </Badge>
                </div>
                <CardDescription className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-1.5" />
                  {safeFormatDateTime(selectedEvent.startDateTime)}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-5">
                <div className="space-y-5">
                  {selectedEvent.description && (
                    <div className="bg-muted/10 p-4 rounded-lg border border-muted/20">
                      <h3 className="text-sm font-medium mb-2 flex items-center">
                        <UserCircle2Icon className="h-4 w-4 mr-1.5 text-primary/70" />
                        Event Description
                      </h3>
                      <p className="text-sm text-muted-foreground">{selectedEvent.description}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedEvent.location && (
                      <div className="p-4 rounded-lg border border-muted/20">
                        <h3 className="text-sm font-medium mb-2 flex items-center">
                          <MapPinIcon className="h-4 w-4 mr-1.5 text-primary/70" />
                          Location
                        </h3>
                        <p className="text-sm text-muted-foreground">{selectedEvent.location}</p>
                      </div>
                    )}
                    
                    <div className="p-4 rounded-lg border border-muted/20">
                      <h3 className="text-sm font-medium mb-2 flex items-center">
                        <UsersIcon className="h-4 w-4 mr-1.5 text-primary/70" />
                        Attendance
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedEvent.currentAttendees || 0} / {selectedEvent.maxAttendees || 'Unlimited'} registered
                      </p>
                      
                      {selectedEvent.maxAttendees && (
                        <div className="h-1.5 rounded-full bg-muted/30 w-full mt-2 overflow-hidden">
                          <div 
                            className="h-full rounded-full bg-primary/70"
                            style={{ 
                              width: `${Math.min(100, (selectedEvent.currentAttendees || 0) / selectedEvent.maxAttendees * 100)}%` 
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-primary/5 to-transparent p-4 rounded-lg border border-primary/10">
                    <h3 className="text-sm font-medium mb-3 flex items-center">
                      <TicketIcon className="h-4 w-4 mr-1.5 text-primary/80" />
                      PicklePass™ Status
                    </h3>
                    <div className="flex items-center mb-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                      <span className="text-sm">Not checked in</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Show your Universal Passport at the venue to check in and access the event.
                    </p>
                  </div>
                  
                  <Separator className="my-2" />
                  
                  <div className="flex flex-wrap gap-3">
                    <Button 
                      variant="default"
                      className="bg-primary hover:bg-primary/90 transition-all duration-300"
                      onClick={handleViewPassportClick}
                    >
                      {!user ? (
                        <>
                          <LockIcon className="mr-2 h-4 w-4" />
                          Login to View Passport
                        </>
                      ) : (
                        <>
                          <TicketIcon className="mr-2 h-4 w-4" />
                          Show My Universal Passport
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="h-full flex items-center justify-center">
              <Card className="overflow-hidden border-primary/10 shadow-sm w-full">
                <CardContent className="p-0">
                  <div className="bg-gradient-to-b from-primary/5 to-transparent p-8 text-center">
                    <div className="rounded-full bg-primary/10 w-24 h-24 mx-auto mb-6 flex items-center justify-center border border-primary/20">
                      <TicketIcon className="h-12 w-12 text-primary/60" />
                    </div>
                    <h2 className="text-xl font-semibold mb-3">Welcome to PicklePass™</h2>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Select an event from the list to view details and options. With PicklePass™, 
                      you can register and check in to events seamlessly.
                    </p>
                    <Button 
                      variant="default"
                      onClick={handleViewPassportClick}
                      className="bg-primary/90 hover:bg-primary transition-all duration-300 px-6 py-5 rounded-lg"
                    >
                      {!user ? (
                        <>
                          <LockIcon className="mr-2 h-5 w-5" />
                          Login to View Passport
                        </>
                      ) : (
                        <>
                          <TicketIcon className="mr-2 h-5 w-5" />
                          View My Universal Passport
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
      
      {/* Universal Passport Dialog - Using the modernized component */}
      <Dialog open={showPassportDialog} onOpenChange={setShowPassportDialog}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-xl border-primary/10 shadow-xl">
          <DialogHeader className="sr-only">
            <DialogTitle>PicklePass™ Universal Passport</DialogTitle>
            <DialogDescription>
              Your universal passport works for all PicklePass™ events
            </DialogDescription>
          </DialogHeader>
          <ModernUniversalPassport 
            onViewRegisteredEvents={() => {
              setShowPassportDialog(false);
              setActiveTab('registered');
            }}
            upcomingEvent={selectedEvent}
            onRegistrationComplete={() => {
              // Refresh the event list to show updated registration status
              setActiveTab('registered');
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );

  // Use StandardLayout to maintain consistent header with other pages
  return (
    <StandardLayout>
      {content}
    </StandardLayout>
  );
}