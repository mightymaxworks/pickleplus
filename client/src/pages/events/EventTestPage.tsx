/**
 * PKL-278651-CONN-0003-EVENT - PicklePass™ System
 * PKL-278651-CONN-0004-PASS-REG-UI-PHASE2 - Enhanced PicklePass™ with Universal Passport
 * Test page for the PicklePass™ Event Management System
 */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { TicketIcon, ScanIcon, UserCircle2Icon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

// Components
import EventCheckInScanner from '@/components/events/EventCheckInScanner';
import EventList from '@/components/events/EventList';
import MyEventsTab from '@/components/events/MyEventsTab';
import UniversalPassport from '@/components/events/UniversalPassport';

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

export default function EventTestPage() {
  const { user } = useAuth();
  const isAdmin = user?.isAdmin || false;

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [activeTab, setActiveTab] = useState<string>('upcoming');
  const [showPassportDialog, setShowPassportDialog] = useState<boolean>(false);
  const [showScannerDialog, setShowScannerDialog] = useState<boolean>(false);
  
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
    setShowPassportDialog(true);
  };
  
  return (
    <div className="container py-10 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">PicklePass™ System</h1>
      <p className="text-muted-foreground mb-6">
        PKL-278651-CONN-0004-PASS-REG-UI-PHASE2 - Enhanced event management with universal passport
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left column - Events list */}
        <div className="md:col-span-1">
          <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="registered">My Events</TabsTrigger>
              <TabsTrigger value="attended">Attended</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upcoming" className="mt-0">
              <h2 className="text-xl font-semibold mb-3">Upcoming Events</h2>
              <EventList 
                limit={5} 
                showViewButton={true}
                onEventClick={handleEventClick}
              />
            </TabsContent>
            
            <TabsContent value="registered" className="mt-0">
              <MyEventsTab 
                onEventClick={handleEventClick}
                onPassportClick={handleViewPassportClick}
              />
            </TabsContent>
            
            <TabsContent value="attended" className="mt-0">
              <h2 className="text-xl font-semibold mb-3">Attended Events</h2>
              <div className="text-sm text-muted-foreground p-4 bg-muted/50 rounded-md">
                Events you've attended with PicklePass™ will appear here.
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Right column - Event details and actions */}
        <div className="md:col-span-2">
          {selectedEvent ? (
            <Card>
              <CardHeader>
                <CardTitle>{selectedEvent.name}</CardTitle>
                <CardDescription>
                  {safeFormatDateTime(selectedEvent.startDateTime)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedEvent.description && (
                    <div>
                      <h3 className="text-sm font-medium mb-1">Description</h3>
                      <p className="text-sm text-muted-foreground">{selectedEvent.description}</p>
                    </div>
                  )}
                  
                  {selectedEvent.location && (
                    <div>
                      <h3 className="text-sm font-medium mb-1">Location</h3>
                      <p className="text-sm text-muted-foreground">{selectedEvent.location}</p>
                    </div>
                  )}
                  
                  <div className="bg-muted/50 p-4 rounded-md">
                    <h3 className="text-sm font-medium mb-2">PicklePass™ Status</h3>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <span className="text-sm">Not checked in</span>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex flex-wrap gap-3">
                    {/* Universal Passport Dialog */}
                    <Dialog open={showPassportDialog} onOpenChange={setShowPassportDialog}>
                      <DialogTrigger asChild>
                        <Button variant="default">
                          <TicketIcon className="mr-2 h-4 w-4" />
                          Show My Passport
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>PicklePass™ Universal Passport</DialogTitle>
                          <DialogDescription>
                            Your universal passport works for all PicklePass™ events you're registered for.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                          <UniversalPassport 
                            onViewRegisteredEvents={() => {
                              setShowPassportDialog(false);
                              setActiveTab('registered');
                            }} 
                          />
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    {/* Admin Scanner Dialog - Only visible to admins */}
                    {isAdmin && (
                      <Dialog open={showScannerDialog} onOpenChange={setShowScannerDialog}>
                        <DialogTrigger asChild>
                          <Button variant="secondary">
                            <ScanIcon className="mr-2 h-4 w-4" />
                            Scan Passport
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>PicklePass™ Scanner</DialogTitle>
                            <DialogDescription>
                              Scan a user's passport QR code to verify registration and check them in.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="mt-4">
                            <EventCheckInScanner 
                              eventId={selectedEvent.id} 
                              onSuccess={() => setShowScannerDialog(false)} 
                            />
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center p-8">
                <h2 className="text-xl font-semibold mb-2">No Event Selected</h2>
                <p className="text-muted-foreground mb-4">
                  Select an event from the list to view details and PicklePass™ options.
                </p>
                <Button 
                  variant="outline"
                  onClick={handleViewPassportClick}
                >
                  <UserCircle2Icon className="mr-2 h-4 w-4" />
                  View My Universal Passport
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}