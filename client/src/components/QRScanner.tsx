import { UnifiedQRScanner } from '@/components/UnifiedQRScanner';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QRScannerProps {
  onSuccess: (data: string) => void;
  onClose: () => void;
}

const QRScanner = ({ onSuccess, onClose }: QRScannerProps) => {
  const handleScanSuccess = (data: string) => {
    // Process the QR code data and extract the player ID
    const match = data.match(/PICKLE\+ID:([A-Z0-9-]+)/);
    if (match && match[1]) {
      onSuccess(match[1]);
    } else {
      // Try to pass through the raw data for other processors
      onSuccess(data);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full relative">
        <div className="absolute top-4 right-4 z-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="p-6">
          <UnifiedQRScanner
            onScanSuccess={handleScanSuccess}
            title="Scan QR Code"
            description="Position the QR code within the frame to scan"
            scanTypes={['player']}
          />
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
