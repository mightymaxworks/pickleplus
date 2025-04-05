import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { QrCode, UserPlus } from "lucide-react";
import { QrCodeScanner } from "@/components/social/QrCodeScanner";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface ScanQrButtonProps {
  variant?: "default" | "outline" | "ghost" | "link" | "destructive" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
}

export function ScanQrButton({ variant = "default", size = "default" }: ScanQrButtonProps) {
  const [showScanner, setShowScanner] = useState(false);
  const { toast } = useToast();

  const handleScanSuccess = async (userId: string) => {
    try {
      // The scanner component handles connection creation directly,
      // but we'll refetch data to update the UI
      queryClient.invalidateQueries({
        queryKey: ["/api/connections/sent"],
      });

      toast({
        title: "Connection requested",
        description: "Connection request has been sent successfully",
      });
    } catch (error) {
      console.error("Error processing connection:", error);
      toast({
        title: "Connection failed",
        description: "There was an error processing the connection",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setShowScanner(true)}
        className="flex gap-2 items-center"
      >
        <QrCode className="h-4 w-4" />
        <span>Scan Player</span>
      </Button>

      <QrCodeScanner 
        open={showScanner} 
        onOpenChange={setShowScanner} 
        onSuccess={handleScanSuccess}
      />
    </>
  );
}