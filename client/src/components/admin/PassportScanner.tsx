/**
 * PKL-278651-CONN-0004-PASS-ADMIN - Passport Scanner Component
 * A mobile-optimized QR code scanner for passport verification
 */

import React, { useState, useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, XCircle, User, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PassportScannerProps {
  eventId?: number;
  onSuccessfulScan?: (data: any) => void;
}

const PassportScanner: React.FC<PassportScannerProps> = ({ eventId, onSuccessfulScan }) => {
  const { toast } = useToast();
  const [scannerStarted, setScannerStarted] = useState(false);
  interface VerificationResult {
    valid: boolean;
    userId?: number;
    username?: string;
    message?: string;
    events?: Array<{id: number; name: string}>;
  }

  const [lastResult, setLastResult] = useState<VerificationResult | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const scannerContainerId = 'passport-qr-scanner';
  
  // Verify passport mutation
  const verifyPassportMutation = useMutation({
    mutationFn: async (passportCode: string) => {
      const response = await apiRequest('/api/passport/verify', {
        method: 'POST',
        body: JSON.stringify({
          passportCode,
          eventId
        })
      });
      return response as VerificationResult;
    },
    onSuccess: (data) => {
      setLastResult(data);
      
      if (data.valid) {
        toast({
          title: "Valid Passport",
          description: `User: ${data.username || 'Unknown'}`,
          variant: "default"
        });
        
        if (onSuccessfulScan) {
          onSuccessfulScan(data);
        }
      } else {
        toast({
          title: "Invalid Passport",
          description: data.message || "Verification failed",
          variant: "destructive"
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Scan Error",
        description: "Failed to verify the passport",
        variant: "destructive"
      });
    }
  });

  useEffect(() => {
    if (scannerStarted && !scannerRef.current) {
      scannerRef.current = new Html5QrcodeScanner(
        scannerContainerId,
        {
          fps: 10,
          qrbox: {
            width: 250,
            height: 250,
          },
          rememberLastUsedCamera: true,
          supportedScanTypes: [
            { format: 'qr_code', formatsToSupport: ['QR_CODE'] }
          ],
        },
        /* verbose= */ false
      );

      scannerRef.current.render(
        // Success callback
        (decodedText: string) => {
          console.log(`QR Code detected: ${decodedText}`);
          
          // Extract passport code from QR code
          let passportCode = decodedText;
          try {
            // Handle if the QR code contains a URL or JSON data
            if (decodedText.includes('http')) {
              const url = new URL(decodedText);
              passportCode = url.searchParams.get('code') || decodedText;
            } else if (decodedText.startsWith('{')) {
              const data = JSON.parse(decodedText);
              passportCode = data.code || data.passportCode || decodedText;
            }
          } catch (e) {
            // If parsing fails, use the raw text
            console.error('Error parsing QR code data:', e);
          }
          
          // Verify the passport code
          verifyPassportMutation.mutate(passportCode);
        },
        // Error callback
        (errorMessage: string) => {
          // Ignoring errors during scanning
        }
      );
    }
    
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
        scannerRef.current = null;
      }
    };
  }, [scannerStarted, eventId, verifyPassportMutation]);

  const toggleScanner = () => {
    if (scannerStarted && scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }
    setScannerStarted(!scannerStarted);
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Passport Scanner</CardTitle>
          <CardDescription>
            Scan passport QR codes to verify attendees
            {eventId ? ' for this event' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button 
              onClick={toggleScanner} 
              className="w-full"
              variant={scannerStarted ? "destructive" : "default"}
            >
              {scannerStarted ? "Stop Scanner" : "Start Scanner"}
            </Button>
            
            <div id={scannerContainerId} className={`${scannerStarted ? 'block' : 'hidden'}`}>
              {/* Scanner will be rendered here */}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {lastResult && (
        <Card className={lastResult.valid ? "border-green-500" : "border-red-500"}>
          <CardHeader className={lastResult.valid ? "bg-green-100 text-green-900" : "bg-red-100 text-red-900"}>
            <CardTitle className="flex items-center">
              {lastResult.valid ? (
                <><CheckCircle className="mr-2" /> Valid Passport</>
              ) : (
                <><XCircle className="mr-2" /> Invalid Passport</>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {lastResult.valid ? (
              <>
                <div className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  <span className="font-medium">User:</span>
                  <span className="ml-2">{lastResult.username || 'Unknown'}</span>
                </div>
                
                {lastResult.events && lastResult.events.length > 0 && (
                  <div>
                    <div className="flex items-center mb-2">
                      <Calendar className="w-5 h-5 mr-2" />
                      <span className="font-medium">Registered Events:</span>
                    </div>
                    <ul className="list-disc pl-10">
                      {lastResult.events.map((event: any) => (
                        <li key={event.id}>{event.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-red-500" />
                <span>{lastResult.message || 'Unknown error occurred'}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PassportScanner;