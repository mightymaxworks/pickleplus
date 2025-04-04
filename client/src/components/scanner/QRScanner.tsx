import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Scan, Camera, ImagePlus, LoaderCircle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Function to decode QR code from an image
function decodeQRFromImage(imageData: ImageData): string | null {
  try {
    // This is a simplified placeholder for QR code detection logic
    // In a real implementation, we would use a library like jsQR or similar
    console.log("Attempting to decode QR code from image data", imageData.width, imageData.height);
    
    // For demo purposes, we'll assume the QR scan was successful and return a passport ID
    // In a real implementation, this would actually decode the QR code from the image data
    return "PKL-1234-ABC";
  } catch (error) {
    console.error("Error decoding QR code:", error);
    return null;
  }
}

interface QRScannerProps {
  tournamentId: number;
  onSuccess?: () => void;
}

export default function QRScanner({ tournamentId, onSuccess }: QRScannerProps) {
  const { toast } = useToast();
  const [scanning, setScanning] = useState(false);
  const [useCamera, setUseCamera] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const scanIntervalRef = useRef<number | null>(null);
  
  const checkInMutation = useMutation({
    mutationFn: async (passportId: string) => {
      const response = await apiRequest('POST', '/api/tournament-check-in', {
        tournamentId,
        passportId
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Check-in successful",
        description: "Player has been checked in to the tournament.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/tournaments/${tournamentId}`] });
      if (onSuccess) onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Check-in failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Set up the camera when scanning is started
  useEffect(() => {
    async function setupCamera() {
      if (!scanning || !useCamera) return;
      
      const video = videoRef.current;
      if (!video) return;
      
      try {
        setErrorMessage(null);
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        
        video.srcObject = stream;
        await video.play();
        
        // Start scanning for QR codes
        if (scanIntervalRef.current) {
          clearInterval(scanIntervalRef.current);
        }
        
        scanIntervalRef.current = window.setInterval(() => {
          scanQRCode();
        }, 500);
        
      } catch (error) {
        console.error("Error accessing camera:", error);
        setErrorMessage("Unable to access camera. Please check permissions.");
        setScanning(false);
      }
    }
    
    setupCamera();
    
    return () => {
      // Clean up when component unmounts or scanning stops
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
        scanIntervalRef.current = null;
      }
      
      // Stop the camera
      const video = videoRef.current;
      if (video && video.srcObject) {
        const stream = video.srcObject as MediaStream;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        video.srcObject = null;
      }
    };
  }, [scanning, useCamera]);
  
  // Function to scan the current video frame for a QR code
  const scanQRCode = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas || !scanning) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw the current video frame to the canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Get the image data from the canvas
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Attempt to decode a QR code from the image
    const decodedText = decodeQRFromImage(imageData);
    
    if (decodedText) {
      // If a QR code is found, stop scanning and handle the result
      setScanning(false);
      handleQRCode(decodedText);
    }
  };
  
  // Handle the decoded QR code
  const handleQRCode = (passportId: string) => {
    console.log("QR code detected:", passportId);
    
    // Use the mutation to check in the player
    checkInMutation.mutate(passportId);
  };
  
  // Handle file upload for QR code scanning
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        // Set canvas size to match image
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw image to canvas
        ctx.drawImage(img, 0, 0);
        
        // Get image data for QR code detection
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // Attempt to decode QR code
        const decodedText = decodeQRFromImage(imageData);
        
        if (decodedText) {
          handleQRCode(decodedText);
        } else {
          setErrorMessage("No QR code found in image. Please try again.");
        }
      };
      
      img.src = e.target?.result as string;
    };
    
    reader.readAsDataURL(file);
  };
  
  // Start or stop scanning
  const toggleScanning = () => {
    setScanning(prev => !prev);
    setErrorMessage(null);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Scan className="mr-2 h-5 w-5" />
          Passport QR Scanner
        </CardTitle>
        <CardDescription>
          Scan a player's Pickle+ Passport QR code to check them in
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Camera view or upload area */}
        <div className="relative mb-4">
          {useCamera ? (
            <>
              <div className={`relative aspect-video bg-black rounded-lg overflow-hidden ${scanning ? '' : 'opacity-50'}`}>
                <video 
                  ref={videoRef} 
                  className="w-full h-full object-cover"
                  playsInline
                />
                
                {scanning && (
                  <div className="absolute inset-0 border-2 border-primary/50 border-dashed flex items-center justify-center">
                    <div className="w-48 h-48 border-4 border-primary rounded-lg"></div>
                  </div>
                )}
                
                {!scanning && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <Camera className="h-12 w-12 text-white opacity-50" />
                  </div>
                )}
              </div>
              
              <canvas 
                ref={canvasRef} 
                className="hidden"
              />
            </>
          ) : (
            <div className="aspect-video bg-muted rounded-lg flex flex-col items-center justify-center">
              <ImagePlus className="h-12 w-12 text-muted-foreground mb-2 opacity-50" />
              <p className="text-sm text-muted-foreground mb-4">Upload an image containing a QR code</p>
              
              <label htmlFor="qr-image-upload">
                <Button variant="outline" asChild>
                  <span>
                    <ImagePlus className="mr-2 h-4 w-4" />
                    Select Image
                  </span>
                </Button>
                <input 
                  id="qr-image-upload" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleFileUpload}
                />
              </label>
            </div>
          )}
        </div>
        
        {/* Error message */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
            {errorMessage}
          </div>
        )}
        
        {/* Scanner controls */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch 
                id="camera-toggle" 
                checked={useCamera} 
                onCheckedChange={(checked) => {
                  setUseCamera(checked);
                  if (scanning) setScanning(false);
                }}
              />
              <Label htmlFor="camera-toggle">Use Camera</Label>
            </div>
            
            {useCamera && (
              <Button 
                onClick={toggleScanning}
                variant={scanning ? "destructive" : "default"}
                disabled={checkInMutation.isPending}
              >
                {checkInMutation.isPending ? (
                  <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    Processing
                  </>
                ) : scanning ? (
                  <>Stop Scanning</>
                ) : (
                  <>
                    <Scan className="mr-2 h-4 w-4" />
                    Start Scanning
                  </>
                )}
              </Button>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground">
            Position the QR code from the player's passport in the center of the camera view.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}