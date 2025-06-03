import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AlertCircle, CheckCircle2, User, Shield, Trophy, Flag, QrCode, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface QRAction {
  type: string;
  label: string;
  endpoint: string;
  description: string;
}

interface QRScanResult {
  type: string;
  data: string;
  playerId?: number;
  tournamentId?: number;
  scannerRole?: string;
  actions?: QRAction[];
  playerData?: any;
  message?: string;
}

interface ScanQRModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ScanQRModal({ isOpen, onClose }: ScanQRModalProps) {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<QRScanResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [manualEntry, setManualEntry] = useState(false);
  const [qrInput, setQrInput] = useState('');
  const { toast } = useToast();

  // Start scanning when modal opens
  useEffect(() => {
    if (isOpen) {
      setScanning(true);
      setResult(null);
      setIsProcessing(false);
      setManualEntry(false);
      setQrInput('');
    } else {
      setScanning(false);
      setResult(null);
      setIsProcessing(false);
      setManualEntry(false);
      setQrInput('');
    }
  }, [isOpen]);

  const handleSimulatedScan = () => {
    // For demonstration purposes, we'll simulate scanning after a delay
    setScanning(true);
    
    setTimeout(() => {
      // Simulate a successful QR code scan
      const demoData = "PicklePlus:Tournament:1";
      processQrData(demoData);
      setScanning(false);
    }, 2000);
  };
  
  const handleManualEntry = () => {
    if (qrInput) {
      // Format passport code input as player connection QR data
      const passportQrData = `PicklePlus:Player:${qrInput}`;
      processQrData(passportQrData);
    }
  };

  const processQrData = async (data: string) => {
    try {
      setIsProcessing(true);
      
      // Send QR data to backend for role-based processing
      const response = await apiRequest('POST', '/api/qr/scan', {
        qrData: data,
        context: 'modal_scan'
      });
      
      const scanResult = await response.json();
      
      if (scanResult.success) {
        setResult({
          type: scanResult.qrType,
          data,
          scannerRole: scanResult.scannerRole,
          actions: scanResult.actions || [],
          playerData: scanResult.playerData,
          message: scanResult.message,
          tournamentId: scanResult.tournamentId
        });
      } else {
        setResult({
          type: "error",
          data,
          message: scanResult.error || "Failed to process QR code"
        });
      }
    } catch (error) {
      console.error("Error processing QR code:", error);
      setResult({
        type: "error",
        data,
        message: "Failed to connect to server"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcessResult = async () => {
    if (!result) return;
    
    setIsProcessing(true);
    
    try {
      if (result.type === "tournament-check-in" && result.tournamentId) {
        await tournamentApi.checkInToTournament(result.tournamentId);
        queryClient.invalidateQueries({ queryKey: ["/api/user/tournaments"] });
        
        toast({
          title: "Check-in successful!",
          description: "You have been checked in to the tournament.",
          variant: "default",
        });
        
        setTimeout(() => {
          onClose();
        }, 1500);
      } else if (result.type === "player-connect" || result.type === "player") {
        toast({
          title: "Player connection successful",
          description: result.playerData ? 
            `Connected with ${result.playerData.displayName}` : 
            "Player connection established",
          variant: "default",
        });
        
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        toast({
          title: "Invalid QR code",
          description: "This QR code is not recognized by Pickle+.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error processing QR code",
        description: "There was an error processing this QR code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>QR Scanner</DialogTitle>
        </DialogHeader>
        
        {scanning ? (
          <div className="h-64 bg-gray-100 rounded-lg mb-4 flex flex-col items-center justify-center">
            <div className="animate-pulse">
              <Camera className="h-16 w-16 text-[#FF5722] mb-2" />
            </div>
            <p className="text-sm text-gray-500 text-center px-4 animate-pulse">
              Scanning for QR codes...
            </p>
          </div>
        ) : result ? (
          <div className="h-64 bg-gray-100 rounded-lg mb-4 flex flex-col items-center justify-center p-4">
            {result.type === "tournament-check-in" ? (
              <>
                <CheckCircle2 className="h-16 w-16 text-[#4CAF50] mb-2" />
                <h3 className="font-bold text-lg mb-1">Tournament QR Code</h3>
                <p className="text-sm text-gray-500 text-center">
                  Ready to check in to tournament #{result.tournamentId}
                </p>
              </>
            ) : result.type === "player-connect" || result.type === "player" ? (
              <>
                <CheckCircle2 className="h-16 w-16 text-[#2196F3] mb-2" />
                <h3 className="font-bold text-lg mb-1">Player Connection</h3>
                <p className="text-sm text-gray-500 text-center">
                  {result.playerData ? 
                    `Found: ${result.playerData.displayName}` : 
                    'Player connection successful'
                  }
                </p>
                {result.message && (
                  <p className="text-sm text-blue-600 text-center mt-2">
                    {result.message}
                  </p>
                )}
                {result.actions && result.actions.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium text-gray-700 text-center">
                      Available Actions ({result.scannerRole}):
                    </p>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {result.actions.map((action: any, index: number) => (
                        <div key={index} className="p-2 bg-gray-50 rounded-lg">
                          <p className="text-sm font-medium text-gray-800">{action.label}</p>
                          <p className="text-xs text-gray-600">{action.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <AlertCircle className="h-16 w-16 text-[#FF5722] mb-2" />
                <h3 className="font-bold text-lg mb-1">Unknown QR Code</h3>
                <p className="text-sm text-gray-500 text-center">
                  This QR code is not recognized by Pickle+
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="h-40 bg-gray-100 rounded-lg mb-4 flex flex-col items-center justify-center">
            <QrCode className="h-16 w-16 text-gray-500 mb-2" />
            <p className="text-sm text-gray-500 text-center px-4">
              Ready to scan QR codes
            </p>
            {manualEntry && (
              <div className="w-full mt-4 px-4">
                <input
                  type="text"
                  placeholder="Enter player's passport code (e.g., MX8K7P2N)"
                  value={qrInput}
                  onChange={(e) => setQrInput(e.target.value.toUpperCase())}
                  className="w-full p-2 border border-gray-300 rounded text-sm font-mono"
                  maxLength={8}
                />
              </div>
            )}
          </div>
        )}
        
        <p className="text-sm text-gray-500 mb-4 text-center">
          {scanning
            ? "Point your camera at a QR code to scan automatically..."
            : result
            ? "QR code detected. Click Process to continue."
            : "Scan player passport QR codes to connect or tournament QR codes to check in."}
        </p>
        
        <DialogFooter>
          {scanning ? (
            <div className="w-full flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setScanning(false)}
              >
                Stop Scanning
              </Button>
              <Button 
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setScanning(false);
                  setManualEntry(true);
                }}
              >
                Enter Passport Code
              </Button>
            </div>
          ) : result ? (
            <Button 
              className="w-full bg-[#4CAF50] hover:bg-[#388E3C]"
              onClick={handleProcessResult}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Process QR Code"}
            </Button>
          ) : manualEntry ? (
            <div className="w-full flex gap-2">
              <Button 
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setManualEntry(false);
                  setScanning(true);
                }}
              >
                <Camera className="mr-2 h-4 w-4" />
                Start Camera
              </Button>
              <Button 
                className="flex-1 bg-[#FF5722] hover:bg-[#E64A19]"
                onClick={handleManualEntry}
                disabled={!qrInput}
              >
                Process Code
              </Button>
            </div>
          ) : (
            <Button 
              className="w-full bg-[#FF5722] hover:bg-[#E64A19]"
              onClick={() => setScanning(true)}
            >
              <Camera className="mr-2 h-4 w-4" />
              Start Scanning
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
