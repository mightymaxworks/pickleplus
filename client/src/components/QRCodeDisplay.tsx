import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2, Download } from "lucide-react";

interface QRCodeDisplayProps {
  userId: number;
  username: string;
}

export function QRCodeDisplay({ userId, username }: QRCodeDisplayProps) {
  const qrValue = `PicklePlus:${userId}:${username}`;
  
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Pickle+ QR Code',
          text: 'Scan my Pickle+ QR code to connect or check me in to tournaments!',
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      alert('Web Share API not supported in your browser');
    }
  };
  
  const handleDownload = () => {
    // In a real app, we'd generate and download an actual QR code
    alert('Download feature available in the full version');
  };
  
  return (
    <div className="border-t border-gray-300 pt-4">
      <h3 className="font-bold mb-3 font-product-sans">My Pickleball Passport</h3>
      <p className="text-sm text-gray-500 mb-4">Use this QR code to check in at tournaments and track your achievements</p>
      
      <div className="qr-code mb-4">
        <div className="qr-code-container relative mx-auto w-[200px] h-[200px] bg-white border-2 border-[#FF5722] rounded-lg flex items-center justify-center">
          {/* Simplified QR code representation */}
          <div className="grid grid-cols-5 grid-rows-5 gap-1 w-3/4 h-3/4">
            {Array.from({ length: 25 }).map((_, i) => (
              <div 
                key={i} 
                className={`${Math.random() > 0.6 ? 'bg-black' : 'bg-transparent'} 
                  ${i === 0 || i === 4 || i === 20 || i === 24 ? 'bg-black' : ''}`}
              />
            ))}
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white p-2 rounded-full">
              <span className="material-icons text-[#FF5722]">sports_tennis</span>
            </div>
          </div>
        </div>
        <p className="text-xs text-center mt-2 text-gray-500">{qrValue}</p>
      </div>
      
      <div className="text-center">
        <Button 
          variant="default" 
          className="bg-[#2196F3] hover:bg-[#1976D2] mr-2"
          onClick={handleShare}
        >
          <Share2 className="h-4 w-4 mr-1" />
          Share
        </Button>
        <Button 
          variant="outline"
          onClick={handleDownload}
        >
          <Download className="h-4 w-4 mr-1" />
          Download
        </Button>
      </div>
    </div>
  );
}
