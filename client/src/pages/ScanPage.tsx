import { useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useEffect, useRef } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, QrCode, Loader2, UserPlus, X } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link } from 'wouter';

export default function ScanPage() {
  const [scanning, setScanning] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [scannedUser, setScannedUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!scannerRef.current && containerRef.current) {
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
  }, []);

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
        // In a real implementation, we would call the connect API endpoint
        const response = await fetch(`/api/connect/${passportId}?token=${token}`);
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${await response.text()}`);
        }
        
        const userData = await response.json();
        setScannedUser(userData);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to get user information. Please try again.");
      } finally {
        setConnecting(false);
      }
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
      
      const response = await apiRequest("POST", "/api/connections", {
        type: "player_connection",
        recipientId: scannedUser.id
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create connection");
      }
      
      // Invalidate connections query to refresh the data
      queryClient.invalidateQueries({
        queryKey: ["/api/connections/sent"],
      });
      
      toast({
        title: "Connection requested",
        description: `You've sent a connection request to ${scannedUser.displayName || scannedUser.username}`,
      });
      
      // Return to profile
      window.location.href = "/profile";
    } catch (err: any) {
      toast({
        title: "Connection failed",
        description: err.message || "There was an error sending the connection request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setConnecting(false);
    }
  };

  const handleReset = () => {
    setScannedUser(null);
    setError(null);
    startScanner();
  };

  return (
    <div className="container max-w-md py-8">
      <div className="mb-4">
        <Link href="/profile">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" /> Back to Profile
          </Button>
        </Link>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Scan Player QR Code
          </CardTitle>
          <CardDescription>
            Scan another player's QR code to connect with them. Position the QR code within the camera frame.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {error ? (
            <div className="p-4 border rounded-md bg-destructive/10 border-destructive/30 text-destructive text-center">
              {error}
              <Button 
                variant="outline" 
                onClick={handleReset}
                className="mt-2 w-full"
              >
                Try Again
              </Button>
            </div>
          ) : scannedUser ? (
            <div className="flex flex-col items-center gap-3 py-2">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-2xl font-semibold">
                  {(scannedUser.avatarInitials || (scannedUser.displayName || scannedUser.username || "?").charAt(0).toUpperCase())}
                </span>
              </div>
              <div className="text-center">
                <h3 className="font-medium text-lg">{scannedUser.displayName || scannedUser.username}</h3>
                {scannedUser.skillLevel && (
                  <p className="text-sm text-muted-foreground">Skill Level: {scannedUser.skillLevel}</p>
                )}
                <div className="mt-2 flex gap-2 justify-center">
                  <div className="px-2 py-1 bg-primary/10 rounded-full text-xs text-primary">
                    Level {scannedUser.level || 1}
                  </div>
                  <div className="px-2 py-1 bg-orange-500/10 rounded-full text-xs text-orange-600">
                    ID: {scannedUser.passportId?.substring(0, 8)}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div 
              ref={containerRef} 
              className="flex flex-col items-center justify-center h-[300px] border-2 border-dashed rounded-md border-border"
            >
              {!scanning && (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <QrCode className="h-8 w-8" />
                  <p>Initializing camera...</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex flex-col gap-2">
          {scannedUser ? (
            <>
              <Button 
                onClick={handleConnect}
                className="w-full"
                disabled={connecting}
              >
                {connecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <UserPlus className="mr-2 h-4 w-4" />
                {connecting ? "Connecting..." : "Connect with Player"}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleReset}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </>
          ) : (
            <Button 
              variant="outline" 
              onClick={() => window.location.href = "/profile"}
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Profile
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}