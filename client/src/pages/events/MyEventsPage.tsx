/**
 * PKL-278651-CONN-0006-ROUTE - PicklePass™ URL Structure Refinement
 * PKL-278651-CONN-0004-PASS-REG - Enhanced PicklePass™ with Registration
 * 
 * My Events Page for the PicklePass™ Event Management System
 */

import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeftIcon, TicketIcon, CalendarIcon } from 'lucide-react';
import { useAuth } from '@/lib/auth';

// Components
import { MyEventsTab } from '@/components/events/MyEventsTab';
import UniversalPassport from '@/components/events/UniversalPassport';

// Data and types
import { getEvent } from '@/lib/sdk/eventSDK';
import { formatDateTime } from '@/lib/utils';
import type { Event } from '@shared/schema/events';

export default function MyEventsPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showPassportDialog, setShowPassportDialog] = useState<boolean>(false);
  
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

  // Handle "View My Passport" click
  const handleViewPassportClick = () => {
    setShowPassportDialog(true);
  };
  
  // Navigate back to events page
  const navigateToEventsPage = () => {
    navigate('/events');
  };
  
  return (
    <div className="container py-10 max-w-6xl mx-auto">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mr-4" 
          onClick={navigateToEventsPage}
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Events
        </Button>
        <div>
          <h1 className="text-3xl font-bold">My PicklePass™ Events</h1>
          <p className="text-muted-foreground">
            View and manage your registered events
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left column - My events list */}
        <div className="md:col-span-1">
          <Card className="mb-4">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-2 text-primary" />
                  My Events
                </CardTitle>
                <Button 
                  variant="default" 
                  size="sm" 
                  className="text-xs bg-primary/90 hover:bg-primary transition-all duration-300"
                  onClick={handleViewPassportClick}
                >
                  <TicketIcon className="mr-1.5 h-3.5 w-3.5" />
                  View Passport
                </Button>
              </div>
              <CardDescription>
                Your upcoming registered events
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <MyEventsTab 
                onEventClick={handleEventClick}
                onPassportClick={handleViewPassportClick}
              />
            </CardContent>
          </Card>
        </div>
        
        {/* Right column - Event details and passport */}
        <div className="md:col-span-2">
          {selectedEvent ? (
            <Card>
              <CardHeader>
                <CardTitle>{selectedEvent.name}</CardTitle>
                <CardDescription>
                  {selectedEvent.startDateTime ? formatDateTime(new Date(selectedEvent.startDateTime)) : 'Date and Time TBD'}
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
                    <h3 className="text-sm font-medium mb-2">Registration Status</h3>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-sm">Registered</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center p-8">
                <h2 className="text-xl font-semibold mb-2">No Event Selected</h2>
                <p className="text-muted-foreground mb-4">
                  Select an event from your registered events to view details.
                </p>
                <Button 
                  variant="default"
                  onClick={handleViewPassportClick}
                  className="bg-primary/90 hover:bg-primary transition-all duration-300 px-6 py-5 rounded-lg"
                >
                  <TicketIcon className="mr-2 h-5 w-5" />
                  View My Universal Passport
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Universal Passport Dialog */}
      <Dialog open={showPassportDialog} onOpenChange={setShowPassportDialog}>
        <DialogContent className="sm:max-w-md p-6 rounded-xl border-primary/10 shadow-lg">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-xl flex items-center">
              <TicketIcon className="h-5 w-5 mr-2 text-primary" />
              PicklePass™ Universal Passport
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Your universal passport works for all PicklePass™ events you're registered for.
            </DialogDescription>
          </DialogHeader>
          <div className="pt-4 pb-2">
            <UniversalPassport />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}