import { useState, useEffect } from 'react';
import { QrScanner } from '@yudiel/react-qr-scanner';
import { useToast } from '@/hooks/use-toast';

interface QRScannerProps {
  onSuccess: (data: string) => void;
  onClose: () => void;
}

const QRScanner = ({ onSuccess, onClose }: QRScannerProps) => {
  const [isCameraAvailable, setIsCameraAvailable] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check if camera is available
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(() => setIsCameraAvailable(true))
      .catch(() => {
        setIsCameraAvailable(false);
        toast({
          title: "Camera Access Denied",
          description: "Please allow camera access to scan QR codes.",
          variant: "destructive",
        });
      });

    return () => {
      // Cleanup function to stop camera when component unmounts
    };
  }, [toast]);

  const handleScan = (data: string) => {
    if (data) {
      // Process the QR code data and extract the player ID
      const match = data.match(/PICKLE\+ID:([A-Z0-9-]+)/);
      if (match && match[1]) {
        onSuccess(match[1]);
      } else {
        toast({
          title: "Invalid QR Code",
          description: "This is not a valid Pickle+ QR code.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-md max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Scan QR Code</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <i className="fas fa-times"></i>
          </button>
        </div>

        {isCameraAvailable ? (
          <div className="aspect-square w-full mb-4">
            <QrScanner
              onDecode={handleScan}
              onError={(error) => {
                console.error(error);
                toast({
                  title: "Scanner Error",
                  description: "An error occurred while scanning. Please try again.",
                  variant: "destructive",
                });
              }}
            />
          </div>
        ) : (
          <div className="bg-gray-100 aspect-square w-full flex items-center justify-center mb-4">
            <div className="text-center p-4">
              <i className="fas fa-camera-slash text-4xl mb-2 text-gray-400"></i>
              <p className="text-gray-600">Camera access denied or unavailable</p>
            </div>
          </div>
        )}

        <p className="text-sm text-gray-500 text-center mb-4">
          Position the QR code within the frame to scan
        </p>

        <button
          onClick={onClose}
          className="w-full py-2 bg-primary text-white rounded-md"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default QRScanner;
