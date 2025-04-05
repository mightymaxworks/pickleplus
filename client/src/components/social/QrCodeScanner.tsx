import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, QrCode } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface QrCodeScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (result: string) => void;
}

export function QrCodeScanner({ open, onOpenChange, onSuccess }: QrCodeScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [scannedUser, setScannedUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Initialize scanner when component mounts
  useEffect(() => {
    if (open && !scannerRef.current && containerRef.current) {
      const scannerId = "qr-reader";
      
      // Make sure the element doesn't already exist
      let scannerElement = document.getElementById(scannerId);
      if (!scannerElement) {
        scannerElement = document.createElement("div");
        scannerElement.id = scannerId;
        containerRef.current.appendChild(scannerElement);
      }
      
      const scanner = new Html5Qrcode(scannerId);
      scannerRef.current = scanner;
      
      startScanner();
    }
    
    return () => {
      stopScanner();
    };
  }, [open]);

  const startScanner = async () => {
    if (!scannerRef.current) return;
    
    try {
      setScanning(true);
      setError(null);
      
      await scannerRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        onScanSuccess,
        onScanFailure
      );
    } catch (err: any) {
      setError(`Camera error: ${err.message || "Unknown error"}`);
      setScanning(false);
    }
  };

  const stopScanner = () => {
    if (scannerRef.current && scanning) {
      scannerRef.current.stop().catch(console.error);
      setScanning(false);
    }
  };

  const onScanSuccess = async (decodedText: string) => {
    stopScanner();
    
    try {
      // Parse the scanned URL
      const url = new URL(decodedText);
      
      // Check if this is a connect URL
      if (!url.pathname.startsWith('/connect/')) {
        setError("Invalid QR code. Not a connection QR code.");
        return;
      }
      
      // Extract the passport ID from the URL
      const passportId = url.pathname.split('/').pop();
      const token = url.searchParams.get('token');
      
      if (!passportId || !token) {
        setError("Invalid QR code. Missing required information.");
        return;
      }
      
      // Get user information before confirming connection
      setConnecting(true);
      try {
        // In a real app, we would have an API endpoint for this
        const response = await fetch(`/api/passport/${passportId}`);
        const userData = await response.json();
        
        if (!userData || !userData.id) {
          throw new Error("User not found");
        }
        
        setScannedUser(userData);
      } catch (err) {
        // For demo purposes we'll create a mock user
        // In a real app, we would use the actual API
        setScannedUser({
          id: Math.floor(Math.random() * 1000),
          username: "player" + Math.floor(Math.random() * 100),
          displayName: "Demo Player",
          skillLevel: "Intermediate",
        });
      }
      
      setConnecting(false);
    } catch (err) {
      setError("Invalid QR code format.");
      console.error(err);
    }
  };

  const onScanFailure = (error: string) => {
    // We don't need to do anything on scan failure
    // The scanner will continue scanning
    console.log("QR code scan error:", error);
  };

  const handleConnect = async () => {
    if (!scannedUser) return;
    
    try {
      setConnecting(true);
      
      // In a real app, we would send a connection request to the API
      // For now, we'll just simulate it
      // const response = await apiRequest("POST", "/api/connections", {
      //   type: "player_connection",
      //   recipientId: scannedUser.id
      // });
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Connection requested",
        description: `You've sent a connection request to ${scannedUser.displayName || scannedUser.username}`,
      });
      
      // Call the onSuccess callback if provided
      if (onSuccess) {
        onSuccess(scannedUser.id);
      }
      
      // Close the dialog
      onOpenChange(false);
    } catch (err) {
      toast({
        title: "Connection failed",
        description: "There was an error sending the connection request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setConnecting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Scan Player QR Code
          </DialogTitle>
          <DialogDescription>
            Scan another player's QR code to connect with them. Position the QR code within the camera frame.
          </DialogDescription>
        </DialogHeader>

        {error ? (
          <div className="p-4 border rounded-md bg-destructive/10 border-destructive/30 text-destructive text-center">
            {error}
            <Button 
              variant="outline" 
              onClick={() => {
                setError(null);
                startScanner();
              }}
              className="mt-2 w-full"
            >
              Try Again
            </Button>
          </div>
        ) : scannedUser ? (
          <div className="flex flex-col items-center gap-3 py-2">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-xl font-semibold">
                {(scannedUser.displayName || scannedUser.username || "?").charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="text-center">
              <h3 className="font-medium text-lg">{scannedUser.displayName || scannedUser.username}</h3>
              {scannedUser.skillLevel && (
                <p className="text-sm text-muted-foreground">Skill Level: {scannedUser.skillLevel}</p>
              )}
            </div>
          </div>
        ) : (
          <div 
            ref={containerRef} 
            className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-md border-border"
          >
            {!scanning && (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <QrCode className="h-8 w-8" />
                <p>Initializing camera...</p>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="flex-col sm:flex-col gap-2">
          {scannedUser && (
            <Button 
              onClick={handleConnect} 
              className="w-full" 
              disabled={connecting}
            >
              {connecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {connecting ? "Connecting..." : "Connect with Player"}
            </Button>
          )}
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}