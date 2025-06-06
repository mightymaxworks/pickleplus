/**
 * Unified QR Scanner Component
 * A single, working QR scanner implementation using html5-qrcode
 * Replaces multiple broken QR scanner components
 */
import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Upload, X, CheckCircle, AlertCircle, Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { PlayerSearchFallback } from "./PlayerSearchFallback";

interface UnifiedQRScannerProps {
  onScanSuccess: (data: string) => void;
  onClose?: () => void;
  title?: string;
  description?: string;
  scanTypes?: ('player' | 'match' | 'tournament' | 'event')[];
}

export function UnifiedQRScanner({
  onScanSuccess,
  onClose,
  title = "QR Code Scanner",
  description = "Scan a QR code or upload an image",
  scanTypes = ['player']
}: UnifiedQRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [lastScan, setLastScan] = useState<string | null>(null);
  const [scannerReady, setScannerReady] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const elementId = "qr-scanner-unified";

  // Initialize scanner when component mounts
  useEffect(() => {
    if (!scannerReady) {
      try {
        const scanner = new Html5QrcodeScanner(
          elementId,
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            rememberLastUsedCamera: true,
            supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA, Html5QrcodeScanType.SCAN_TYPE_FILE]
          },
          false
        );
        
        scannerRef.current = scanner;
        setScannerReady(true);
      } catch (error) {
        console.error("Failed to initialize QR scanner:", error);
        toast({
          title: "Scanner Error",
          description: "Failed to initialize QR scanner. Please check camera permissions.",
          variant: "destructive",
        });
      }
    }

    // Cleanup on unmount
    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.clear();
        } catch (error) {
          console.error("Error cleaning up scanner:", error);
        }
      }
    };
  }, []);

  // Handle successful scan
  const handleScanSuccess = (decodedText: string, decodedResult: any) => {
    console.log("QR Code scanned:", decodedText);
    
    setLastScan(decodedText);
    
    // Stop scanning temporarily to prevent multiple scans
    if (scannerRef.current && isScanning) {
      try {
        scannerRef.current.pause();
        setIsScanning(false);
      } catch (error) {
        console.error("Error pausing scanner:", error);
      }
    }

    // Process the scanned data
    onScanSuccess(decodedText);

    toast({
      title: "QR Code Scanned",
      description: "Successfully scanned QR code",
    });
  };

  // Handle scan errors
  const handleScanError = (error: string) => {
    // Only log errors that aren't routine scanning messages
    if (!error.includes("No QR code found") && !error.includes("NotFoundException")) {
      console.error("QR Scanner error:", error);
    }
  };

  // Start scanning
  const startScanning = () => {
    if (!scannerRef.current || !scannerReady) {
      toast({
        title: "Scanner Not Ready",
        description: "Please wait for the scanner to initialize.",
        variant: "destructive",
      });
      return;
    }

    // Check if we're in a restricted environment (like Replit browser)
    if (window.location.hostname.includes('replit') || 
        window.location.hostname.includes('localhost') ||
        !navigator.mediaDevices || 
        !navigator.mediaDevices.getUserMedia) {
      toast({
        title: "Camera Restricted",
        description: "Camera access is not available in this environment. Use file upload or test with real QR codes in a deployed environment.",
        variant: "destructive",
      });
      return;
    }

    try {
      scannerRef.current.render(handleScanSuccess, handleScanError);
      setIsScanning(true);
    } catch (error) {
      console.error("Error starting scanner:", error);
      toast({
        title: "Scanner Error",
        description: "Failed to start scanning. Please check camera permissions or use file upload.",
        variant: "destructive",
      });
    }
  };

  // Stop scanning
  const stopScanning = () => {
    if (scannerRef.current && isScanning) {
      try {
        scannerRef.current.pause();
        setIsScanning(false);
      } catch (error) {
        console.error("Error stopping scanner:", error);
      }
    }
  };

  // Resume scanning after a successful scan
  const resumeScanning = () => {
    if (scannerRef.current && !isScanning) {
      try {
        scannerRef.current.resume();
        setIsScanning(true);
        setLastScan(null);
      } catch (error) {
        console.error("Error resuming scanner:", error);
        // If resume fails, try to restart
        startScanning();
      }
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              {title}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {/* Scan type badges */}
        <div className="flex flex-wrap gap-1">
          {scanTypes.map((type) => (
            <Badge key={type} variant="secondary" className="text-xs">
              {type}
            </Badge>
          ))}
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="scan" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="scan" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              QR Scanner
            </TabsTrigger>
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Search Players
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="scan" className="mt-4 space-y-4">
            {/* Scanner container */}
            <div 
              id={elementId}
              className={`${!isScanning ? 'hidden' : ''} w-full`}
            />
            
            {/* Last scan result */}
            {lastScan && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-medium">Last Scan:</span>
                </div>
                <p className="text-sm text-green-700 mt-1 break-all">{lastScan}</p>
              </div>
            )}
            
            {/* Controls */}
            <div className="flex gap-2">
              {!isScanning ? (
                <Button
                  onClick={startScanning}
                  disabled={!scannerReady}
                  className="flex-1"
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Start Scanning
                </Button>
              ) : (
                <Button
                  onClick={stopScanning}
                  variant="destructive"
                  className="flex-1"
                >
                  Stop Scanning
                </Button>
              )}
              
              {lastScan && !isScanning && (
                <Button
                  onClick={resumeScanning}
                  variant="outline"
                >
                  Scan Again
                </Button>
              )}
            </div>
            
            {/* Status indicators */}
            <div className="text-sm text-center">
              {!scannerReady && (
                <div className="flex items-center justify-center gap-2 text-orange-600">
                  <AlertCircle className="h-4 w-4" />
                  Initializing scanner...
                </div>
              )}
              {scannerReady && !isScanning && !lastScan && (
                <p className="text-muted-foreground">Click "Start Scanning" to begin</p>
              )}
              {isScanning && (
                <div className="flex items-center justify-center gap-2 text-blue-600">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                  Point camera at QR code or upload image
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="search" className="mt-4">
            <PlayerSearchFallback
              onPlayerSelect={(passportCode) => {
                // Format the passport code as a QR scan result
                const qrData = `PICKLE+ID:${passportCode}`;
                onScanSuccess(qrData);
              }}
              title="Player Database Search"
              description="Search for players when QR scanning isn't available"
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}