import { useMutation } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";
import { LoaderCircle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { UnifiedQRScanner } from '@/components/UnifiedQRScanner';

interface QRScannerProps {
  tournamentId: number;
  onSuccess?: () => void;
}

export default function QRScanner({ tournamentId, onSuccess }: QRScannerProps) {
  const { toast } = useToast();
  
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

  const handleScanSuccess = (data: string) => {
    // Extract passport ID from scanned data
    let passportId = data;
    
    // Handle different QR code formats
    if (data.includes('PICKLE+ID:')) {
      const match = data.match(/PICKLE\+ID:([A-Z0-9-]+)/);
      if (match && match[1]) {
        passportId = match[1];
      }
    } else if (data.includes('/passport/')) {
      const match = data.match(/\/passport\/([A-Z0-9-]+)/);
      if (match && match[1]) {
        passportId = match[1];
      }
    }
    
    // Perform check-in
    checkInMutation.mutate(passportId);
  };
  return (
    <div className="w-full">
      <UnifiedQRScanner
        onScanSuccess={handleScanSuccess}
        title="Tournament Check-in Scanner"
        description="Scan a player's Pickle+ Passport QR code to check them in"
        scanTypes={['player']}
      />
      
      {checkInMutation.isPending && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 text-blue-800">
            <LoaderCircle className="h-4 w-4 animate-spin" />
            <span>Processing check-in...</span>
          </div>
        </div>
      )}
    </div>
  );
}