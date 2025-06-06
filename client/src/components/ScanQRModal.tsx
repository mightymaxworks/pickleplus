import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { UnifiedQRScanner } from "./UnifiedQRScanner";

interface ScanQRModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ScanQRModal({ isOpen, onClose }: ScanQRModalProps) {
  const { toast } = useToast();

  // Handle QR scan success
  const handleQRScanSuccess = async (qrData: string) => {
    try {
      const response = await apiRequest('POST', '/api/qr/scan', {
        qrData,
        timestamp: new Date().toISOString()
      });
      
      const scanResult = await response.json();
      
      if (scanResult.success) {
        // Show success toast
        toast({
          title: "QR Code Scanned",
          description: scanResult.message || "QR code processed successfully",
          variant: "default",
        });
        
        // Auto-close after successful scan
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
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>QR Scanner & Player Search</DialogTitle>
        </DialogHeader>
        
        <UnifiedQRScanner
          title="Scan QR Code or Search Players"
          description="Use camera to scan QR codes or search the database for players"
          onScanSuccess={handleQRScanSuccess}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}