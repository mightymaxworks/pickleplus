/**
 * PKL-278651-CONN-0006-ROUTE-MOD - PicklePass™ URL Structure Refinement Modernization
 * PKL-278651-CONN-0004-PASS-REG-MOD - Enhanced PicklePass™ with Registration Modernization
 * 
 * My Events Page Wrapper Component
 * 
 * Wrapper for the MyEventsPage that provides UI modernization while
 * maintaining backward compatibility with existing systems.
 * 
 * @implementation Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ArrowLeftIcon, TicketIcon, CalendarIcon } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { StandardLayout } from '@/components/layout/StandardLayout';

// Components
import { MyEventsTab } from '@/components/events/MyEventsTab';
import ModernUniversalPassport from '@/components/events/ModernUniversalPassport';

// Data and types
import { getEvent } from '@/lib/sdk/eventSDK';
import { formatDateTime } from '@/lib/utils';
import type { Event } from '@shared/schema/events';

export default function MyEventsWrapper() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showPassportDialog, setShowPassportDialog] = useState<boolean>(false);
  
  // PKL-278651-CONN-0007-AUTH: Authentication guard for protected route
  useEffect(() => {
    // Only redirect after auth check completes and user is confirmed not logged in
    if (!isAuthLoading && !user) {
      console.log('[Auth] Unauthorized access attempt to MyEventsPage, redirecting to login');
      toast({
        title: "Authentication Required",
        description: "Please log in to view your registered events",
        variant: "default"
      });
      navigate('/login');
    }
  }, [user, isAuthLoading, navigate, toast]);
  
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
  
  // The modernized content section of the page
  const content = (
    <div className="py-6">
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
          <Card className="mb-4 border-primary/10 shadow-md overflow-hidden">
            <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-transparent">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-2 text-primary" />
                  My Events
                </CardTitle>
                <Button 
                  variant="default" 
                  size="sm" 
                  className="text-xs bg-primary hover:bg-primary/90 transition-all duration-300"
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
            <Card className="border-primary/10 shadow-md overflow-hidden">
              <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-transparent border-b border-muted/30">
                <CardTitle>{selectedEvent.name}</CardTitle>
                <CardDescription>
                  {selectedEvent.startDateTime ? formatDateTime(new Date(selectedEvent.startDateTime)) : 'Date and Time TBD'}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-5">
                <div className="space-y-4">
                  {selectedEvent.description && (
                    <div className="bg-muted/10 p-4 rounded-lg border border-muted/20">
                      <h3 className="text-sm font-medium mb-1">Description</h3>
                      <p className="text-sm text-muted-foreground">{selectedEvent.description}</p>
                    </div>
                  )}
                  
                  {selectedEvent.location && (
                    <div className="bg-muted/10 p-4 rounded-lg border border-muted/20">
                      <h3 className="text-sm font-medium mb-1">Location</h3>
                      <p className="text-sm text-muted-foreground">{selectedEvent.location}</p>
                    </div>
                  )}
                  
                  <div className="p-4 rounded-lg border border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
                    <h3 className="text-sm font-medium mb-2 text-green-700 dark:text-green-300">Registration Status</h3>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-sm text-green-700 dark:text-green-300">Registered</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-center mt-4">
                    <Button
                      variant="default"
                      className="bg-primary hover:bg-primary/90"
                      onClick={handleViewPassportClick}
                    >
                      <TicketIcon className="mr-2 h-4 w-4" />
                      Show My Universal Passport
                    </Button>
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
                  className="bg-primary hover:bg-primary/90 transition-all duration-300 px-6 py-5 rounded-lg"
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
        <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-xl border-primary/10 shadow-xl">
          <ModernUniversalPassport />
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