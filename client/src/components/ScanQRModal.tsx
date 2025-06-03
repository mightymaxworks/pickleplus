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
  const [qrInput, setQrInput] = useState('');
  const { toast } = useToast();

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setScanning(false);
      setResult(null);
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
      processQrData(qrInput);
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
      } else if (result.type === "player-connect") {
        toast({
          title: "Player connection",
          description: "Connected with player!",
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
          <DialogTitle>Scan QR Code</DialogTitle>
        </DialogHeader>
        
        {scanning ? (
          <div className="h-64 bg-gray-100 rounded-lg mb-4 flex flex-col items-center justify-center">
            <div className="animate-pulse">
              <span className="material-icons text-6xl text-[#FF5722] mb-2">qr_code_scanner</span>
            </div>
            <p className="text-sm text-gray-500 text-center px-4 animate-pulse">
              Scanning...
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
            ) : result.type === "player-connect" ? (
              <>
                <CheckCircle2 className="h-16 w-16 text-[#2196F3] mb-2" />
                <h3 className="font-bold text-lg mb-1">Player QR Code</h3>
                <p className="text-sm text-gray-500 text-center">
                  Connect with player #{result.playerId}
                </p>
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
          <>
            <div className="h-40 bg-gray-100 rounded-lg mb-4 flex flex-col items-center justify-center">
              <span className="material-icons text-6xl text-gray-500 mb-2">qr_code_scanner</span>
              <p className="text-sm text-gray-500 text-center px-4">
                Enter a QR code value or use the demo scanner
              </p>
            </div>
            
            <div className="mb-4">
              <input
                type="text"
                placeholder="Enter QR code (e.g., PicklePlus:Tournament:1)"
                value={qrInput}
                onChange={(e) => setQrInput(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
          </>
        )}
        
        <p className="text-sm text-gray-500 mb-4 text-center">
          {scanning
            ? "Scanning for QR codes..."
            : result
            ? "QR code detected. Process to continue."
            : "Use this scanner for tournament check-ins and connecting with other players."}
        </p>
        
        <DialogFooter>
          {!scanning && !result ? (
            <div className="w-full flex gap-2">
              <Button 
                className="flex-1 bg-[#FF5722] hover:bg-[#E64A19]"
                onClick={handleSimulatedScan}
              >
                Demo Scan
              </Button>
              <Button 
                className="flex-1"
                onClick={handleManualEntry}
                disabled={!qrInput}
              >
                Process Input
              </Button>
            </div>
          ) : scanning ? (
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setScanning(false)}
            >
              Cancel Scan
            </Button>
          ) : (
            <Button 
              className="w-full bg-[#4CAF50] hover:bg-[#388E3C]"
              onClick={handleProcessResult}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Process QR Code"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
