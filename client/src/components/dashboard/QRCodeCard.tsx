import { User } from "@/lib/types";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface QRCodeCardProps {
  user: User;
}

const QRCodeCard = ({ user }: QRCodeCardProps) => {
  const [showQR, setShowQR] = useState(true);
  const { toast } = useToast();
  
  // Generate QR code value
  const qrValue = `PICKLE+ID:${user.playerId}`;
  
  const handleShareQR = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My Pickle+ QR Code',
        text: `Scan my Pickle+ QR code for tournament check-ins and challenge matches. Player ID: ${user.playerId}`,
        url: window.location.href,
      })
      .catch(() => {
        toast({
          title: "Sharing failed",
          description: "Could not share your QR code.",
          variant: "destructive",
        });
      });
    } else {
      toast({
        title: "Sharing not supported",
        description: "Your browser doesn't support sharing.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-white rounded-md shadow-sm p-4 lg:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900">Player Passport</h3>
        <button 
          className="text-secondary text-sm"
          onClick={handleShareQR}
        >
          <i className="fas fa-share-alt mr-1"></i> Share
        </button>
      </div>
      
      <div className="flex flex-col items-center">
        <div className="h-24 w-24 rounded-full bg-secondary flex items-center justify-center text-white text-3xl mb-4">
          <span>{user.displayName.split(' ').map(n => n[0]).join('').toUpperCase()}</span>
        </div>
        
        <div className="text-xl font-bold text-gray-900 mb-1">{user.displayName}</div>
        <div className="text-gray-500 mb-4">Player ID: {user.playerId}</div>
        
        <div className="border-2 border-gray-200 rounded-md p-2 mb-4">
          <QRCodeSVG 
            value={qrValue}
            size={160}
            level="H"
            includeMargin={true}
          />
        </div>
        
        <div className="text-sm text-gray-500 text-center">
          Scan this code for tournament check-ins<br/>and challenge matches
        </div>
      </div>
    </div>
  );
};

export default QRCodeCard;
