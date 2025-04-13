/**
 * PKL-278651-CONN-0006-ROUTE - PicklePass™ URL Structure Refinement
 * Legacy Test Page with Redirection to New Events Routes
 */

import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRightIcon } from 'lucide-react';

export default function EventTestPage() {
  const [, navigate] = useLocation();
  
  // Automatically redirect to the new event page after a short delay
  useEffect(() => {
    const redirectTimer = setTimeout(() => {
      navigate('/events');
    }, 3000); // Redirect after 3 seconds
    
    return () => clearTimeout(redirectTimer);
  }, [navigate]);
  
  // Immediate navigation handler
  const handleNavigateToEvents = () => {
    navigate('/events');
  };
  
  return (
    <div className="container py-20 max-w-xl mx-auto">
      <Card className="shadow-lg border-primary/10">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl">PicklePass™ URL Update</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="space-y-6">
            <div className="p-4 bg-amber-50 rounded-md border border-amber-200 text-amber-800">
              <p className="text-sm font-medium">
                The PicklePass™ event system has moved to a new location.
              </p>
            </div>
            
            <p className="text-muted-foreground">
              You're being redirected to the new events page...
            </p>
            
            <div className="bg-muted/30 p-4 rounded-md">
              <p className="text-sm mb-2">
                <strong>Old URL:</strong> <code className="bg-muted py-0.5 px-1 rounded">/events/test</code>
              </p>
              <p className="text-sm">
                <strong>New URL:</strong> <code className="bg-primary/10 text-primary py-0.5 px-1 rounded">/events</code>
              </p>
            </div>
            
            <Button 
              variant="default"
              className="w-full py-6 bg-primary hover:bg-primary/90 transition-all duration-300"
              onClick={handleNavigateToEvents}
            >
              Go to Events Page Now
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Button>
            
            <p className="text-xs text-muted-foreground">
              PKL-278651-CONN-0006-ROUTE - PicklePass™ URL Structure Refinement
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}