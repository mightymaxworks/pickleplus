/**
 * PKL-278651-CONN-0003-EVENT - Event Check-in QR Code System
 * Test page for the Event Check-in System
 */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import EventQRCode from '@/components/events/EventQRCode';
import EventCheckInScanner from '@/components/events/EventCheckInScanner';
import EventList from '@/components/events/EventList';
import { getEvent } from '@/lib/sdk/eventSDK';
import { formatDateTime } from '@/lib/utils';
import type { Event } from '@shared/schema/events';

export default function EventTestPage() {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [activeTab, setActiveTab] = useState<string>('upcoming');
  const [showQRDialog, setShowQRDialog] = useState<boolean>(false);
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
  
  return (
    <div className="container py-10 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Event Check-in System</h1>
      <p className="text-muted-foreground mb-6">
        PKL-278651-CONN-0003-EVENT - Test page for the Event Check-in QR Code System
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left column - Events list */}
        <div className="md:col-span-1">
          <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
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
            
            <TabsContent value="attended" className="mt-0">
              <h2 className="text-xl font-semibold mb-3">Attended Events</h2>
              <div className="text-sm text-muted-foreground p-4 bg-muted/50 rounded-md">
                My attended events will be shown here based on check-ins.
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
                  {formatDateTime(new Date(selectedEvent.startDateTime))}
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
                    <h3 className="text-sm font-medium mb-2">Check-in Status</h3>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <span className="text-sm">Not checked in</span>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex flex-wrap gap-3">
                    <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
                      <DialogTrigger asChild>
                        <Button variant="default">View Event QR Code</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Event QR Code</DialogTitle>
                          <DialogDescription>
                            Scan this QR code to check in to the event.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex justify-center p-4">
                          <EventQRCode event={selectedEvent} size={250} />
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <Dialog open={showScannerDialog} onOpenChange={setShowScannerDialog}>
                      <DialogTrigger asChild>
                        <Button variant="secondary">Scan QR Code</Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Scan to Check In</DialogTitle>
                          <DialogDescription>
                            Scan a user's QR code to check them into the event.
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
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center p-8">
                <h2 className="text-xl font-semibold mb-2">No Event Selected</h2>
                <p className="text-muted-foreground mb-4">
                  Select an event from the list to view details and check-in options.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}