/**
 * PKL-278651-CONN-0003-EVENT - Event Check-in QR Code System
 * Component for scanning QR codes for event check-in
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckIcon, QrCodeIcon, RotateCcwIcon, XIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { cn } from '@/lib/utils';

// Using dynamic import for HTML5QrcodeScanner to prevent SSR issues
let QrScanner: any = null;

interface EventCheckInScannerProps {
  eventId: number;
  className?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface QRCodePayload {
  type: string;
  eventId: number;
  userId?: number;
  username?: string;
  timestamp: string;
}

export function EventCheckInScanner({ 
  eventId, 
  className = '', 
  onSuccess, 
  onCancel 
}: EventCheckInScannerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isScanning, setIsScanning] = useState(false);
  const [scannerReady, setScannerReady] = useState(false);
  const [latestScan, setLatestScan] = useState<QRCodePayload | null>(null);
  const [scannerId] = useState(`scanner-${Math.random().toString(36).substring(2, 9)}`);
  
  // Get event details to display during scanning
  const { data: event } = useQuery({ 
    queryKey: ['/api/events', eventId],
    enabled: !!eventId 
  });

  // Get current check-in count
  const { data: checkInCount, refetch: refetchCheckInCount } = useQuery({
    queryKey: ['/api/events', eventId, 'check-in-count'],
    enabled: !!eventId
  });

  // Mutation for checking in users from QR code
  const checkInMutation = useMutation({
    mutationFn: async (payload: { eventId: number, userId: number, checkInMethod?: string }) => {
      return apiRequest('POST', `/api/events/${payload.eventId}/check-in`, payload);
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['/api/events', eventId, 'check-in-count'] });
      queryClient.invalidateQueries({ queryKey: ['/api/events', eventId, 'attendees'] });
      
      // Show success toast
      toast({
        title: "Check-in successful!",
        description: latestScan?.username 
          ? `${latestScan.username} has been checked in to the event.`
          : "User has been checked into the event.",
        variant: "success"
      });
      
      // Update check-in count
      refetchCheckInCount();
      
      // Clear the latest scan to prepare for next scan
      setLatestScan(null);
      
      // Call the success callback if provided
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      // Show error toast
      toast({
        title: "Check-in failed",
        description: error.message || "Unable to check in user. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Import the QR scanner when the component mounts
  useEffect(() => {
    const loadScanner = async () => {
      try {
        // Dynamic import to avoid SSR issues
        const { Html5QrcodeScanner } = await import('html5-qrcode');
        QrScanner = Html5QrcodeScanner;
        setScannerReady(true);
      } catch (error) {
        console.error('Failed to load QR scanner:', error);
        toast({
          title: "Scanner Error",
          description: "Failed to load QR scanner. Please check your device permissions.",
          variant: "destructive"
        });
      }
    };
    
    loadScanner();
    
    // Clean up function
    return () => {
      stopScanner();
    };
  }, []);

  // Handler for QR code scan results
  const handleScanSuccess = useCallback((decodedText: string) => {
    try {
      // Parse the QR code payload
      const payload: QRCodePayload = JSON.parse(decodedText);
      
      // Validate that this is an event check-in QR code
      if (payload.type !== 'event-check-in' && payload.type !== 'user-profile') {
        throw new Error("Invalid QR code type");
      }
      
      // Set the latest scan
      setLatestScan(payload);
      
      // For event-specific QR codes, verify the event ID
      if (payload.type === 'event-check-in' && payload.eventId !== eventId) {
        toast({
          title: "Wrong Event",
          description: "This QR code is for a different event.",
          variant: "destructive"
        });
        return;
      }
      
      // For user profile QR codes, we need to extract the user ID
      if (payload.type === 'user-profile' && payload.userId) {
        // Automatically check in the user
        checkInMutation.mutate({
          eventId,
          userId: payload.userId,
          checkInMethod: 'qr'
        });
      }
      
      // Stop the scanner after successful scan
      stopScanner();
      setIsScanning(false);
      
    } catch (error) {
      console.error('Failed to process QR code:', error);
      toast({
        title: "Invalid QR Code",
        description: "The scanned QR code is not valid for event check-in.",
        variant: "destructive"
      });
    }
  }, [eventId, checkInMutation, toast]);

  // Start the QR scanner
  const startScanner = useCallback(() => {
    if (!scannerReady || !QrScanner) return;
    
    // Clear any previous scanner instances
    stopScanner();
    
    // Create a new scanner instance
    const scanner = new QrScanner(
      scannerId,
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );
    
    // Register the success callback
    scanner.render(handleScanSuccess, (error: any) => {
      console.error('QR Scanner error:', error);
    });
    
    setIsScanning(true);
  }, [scannerReady, scannerId, handleScanSuccess]);

  // Stop the QR scanner
  const stopScanner = useCallback(() => {
    // Find the scanner instance by ID
    const scannerElement = document.getElementById(scannerId);
    if (scannerElement) {
      // Clear all child elements (HTML5QrcodeScanner creates a lot of DOM elements)
      while (scannerElement.firstChild) {
        scannerElement.removeChild(scannerElement.firstChild);
      }
    }
    
    setIsScanning(false);
  }, [scannerId]);

  // Handle manual check-in confirmation
  const handleConfirmCheckIn = () => {
    if (!latestScan || !latestScan.userId) {
      toast({
        title: "Check-in Error",
        description: "No valid user data found from QR scan.",
        variant: "destructive"
      });
      return;
    }
    
    // Call the check-in API
    checkInMutation.mutate({
      eventId,
      userId: latestScan.userId,
      checkInMethod: 'qr'
    });
  };

  // Handle cancel check-in
  const handleCancelCheckIn = () => {
    setLatestScan(null);
    if (onCancel) onCancel();
  };

  return (
    <Card className={cn("w-full max-w-md mx-auto", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">Event Check-in Scanner</CardTitle>
        {event && (
          <CardDescription>
            {event.name} - {checkInCount ? `${checkInCount} checked in` : 'No check-ins yet'}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {latestScan ? (
          <div className="space-y-4">
            <Alert variant="default" className="bg-muted">
              <CheckIcon className="h-4 w-4 text-green-500" />
              <AlertTitle>QR Code Scanned</AlertTitle>
              <AlertDescription>
                {latestScan.type === 'user-profile' && latestScan.username ? (
                  <p>Ready to check in user: <strong>{latestScan.username}</strong></p>
                ) : (
                  <p>Ready to process event check-in</p>
                )}
              </AlertDescription>
            </Alert>
            
            <div className="flex gap-3 justify-center mt-4">
              <Button
                variant="default"
                onClick={handleConfirmCheckIn}
                disabled={checkInMutation.isPending}
                className="flex-1"
              >
                {checkInMutation.isPending ? 'Processing...' : 'Confirm Check-in'}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancelCheckIn}
                disabled={checkInMutation.isPending}
              >
                <XIcon className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div id={scannerId} className="qr-scanner-container w-full h-[300px]"></div>
            
            {!isScanning && scannerReady && (
              <div className="flex justify-center mt-4">
                <Button onClick={startScanner} variant="default">
                  <QrCodeIcon className="h-4 w-4 mr-2" />
                  Start Scanning
                </Button>
              </div>
            )}
            
            {isScanning && (
              <div className="flex justify-center mt-4">
                <Button onClick={stopScanner} variant="outline">
                  <RotateCcwIcon className="h-4 w-4 mr-2" />
                  Reset Scanner
                </Button>
              </div>
            )}
            
            {!scannerReady && (
              <div className="flex justify-center mt-4">
                <p className="text-muted-foreground text-sm">Loading scanner...</p>
              </div>
            )}
          </>
        )}
      </CardContent>
      <CardFooter className="bg-muted/50 flex flex-col items-start text-xs text-muted-foreground px-6 py-3">
        <p>Point your camera at a user's Profile QR code to check them in.</p>
        <p className="mt-1">Make sure the entire QR code is visible in the scanner.</p>
      </CardFooter>
    </Card>
  );
}

export default EventCheckInScanner;