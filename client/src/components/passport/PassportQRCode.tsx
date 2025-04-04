import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Share2, Download, Crown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { QRCodeSVG } from 'qrcode.react';
import { User } from '@/types';
import { cn } from '@/lib/utils';
import { FoundingMemberBadge } from '@/components/ui/founding-member-badge';

interface PassportQRCodeProps {
  user: User;
  showShareButton?: boolean;
}

export default function PassportQRCode({ user, showShareButton = true }: PassportQRCodeProps) {
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Generate QR code data
  const qrData = JSON.stringify({
    passportId: user.passportId || `PKL-${user.id.toString().padStart(4, '0')}-${user.username.substring(0, 3).toUpperCase()}`,
    username: user.username,
    userId: user.id
  });
  
  // Handle sharing passport
  const handleSharePassport = async () => {
    try {
      if (navigator.share) {
        // Use Web Share API if available
        await navigator.share({
          title: 'My Pickle+ Passport',
          text: `Check out my Pickle+ Passport! Username: ${user.username}`,
          url: window.location.origin + '/profile'
        });
      } else {
        // Fallback to copying link to clipboard
        await navigator.clipboard.writeText(window.location.origin + '/profile');
        toast({
          title: 'Link copied!',
          description: 'Passport link has been copied to clipboard',
        });
      }
    } catch (error) {
      console.error('Error sharing passport:', error);
      toast({
        title: 'Sharing failed',
        description: 'Unable to share passport at this time',
        variant: 'destructive'
      });
    }
  };
  
  // Handle downloading QR code
  const handleDownloadQR = () => {
    try {
      setIsDownloading(true);
      
      // Get the SVG element
      const svgElement = document.getElementById('passport-qr-code');
      if (!svgElement) return;
      
      // Create a canvas element
      const canvas = document.createElement('canvas');
      canvas.width = 250;  // Add some margin to the 200px QR code
      canvas.height = 250;
      
      // Get canvas context
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Create an image from the SVG
      const img = new Image();
      
      // Convert SVG to data URL
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);
      
      img.onload = () => {
        // Draw the image to the canvas
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 25, 25, 200, 200);
        
        // Convert to PNG and trigger download
        const pngUrl = canvas.toDataURL('image/png');
        
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = `Pickle+_Passport_${user.username}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        URL.revokeObjectURL(svgUrl);
        
        toast({
          title: 'Download successful',
          description: 'Your Passport QR code has been downloaded'
        });
        
        setIsDownloading(false);
      };
      
      img.onerror = (error) => {
        console.error('Error loading QR code image:', error);
        toast({
          title: 'Download failed',
          description: 'Unable to process QR code image',
          variant: 'destructive'
        });
        setIsDownloading(false);
      };
      
      img.src = svgUrl;
      
    } catch (error) {
      console.error('Error downloading QR code:', error);
      toast({
        title: 'Download failed',
        description: 'Unable to download QR code at this time',
        variant: 'destructive'
      });
      setIsDownloading(false);
    }
  };
  
  // Format the passport ID
  const passportId = user.passportId || `PKL-${user.id.toString().padStart(4, '0')}-${user.username.substring(0, 3).toUpperCase()}`;
  
  // Check if the user is a founding member
  const isFoundingMember = user.isFoundingMember === true;
  
  return (
    <Card className={cn(
      "overflow-hidden", 
      isFoundingMember 
        ? "border-2 border-amber-300 bg-gradient-to-b from-amber-50 to-white" 
        : "border-2 border-[#FF5722]/10"
    )}>
      <CardContent className="p-5">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold">Pickle+ Passport</h3>
            {isFoundingMember && (
              <FoundingMemberBadge size="sm" />
            )}
          </div>
          
          <p className="text-sm text-muted-foreground mb-4">
            ID: {passportId}
          </p>
          
          <div className={cn(
            "p-3 bg-white rounded-xl mb-4 shadow-sm",
            isFoundingMember && "border-2 border-amber-200"
          )}>
            <div className={cn(
              "relative",
              isFoundingMember && "qr-gold-gradient"
            )}>
              <QRCodeSVG
                id="passport-qr-code"
                value={qrData}
                size={200}
                level="H"
                includeMargin={true}
                bgColor={isFoundingMember ? "#FFFBEB" : "#FFFFFF"}
                fgColor={isFoundingMember ? "#B45309" : "#000000"}
              />
              {isFoundingMember && (
                <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                  <Crown className="w-32 h-32 text-amber-300" />
                </div>
              )}
            </div>
          </div>
          
          <div className="text-sm text-center text-muted-foreground mb-4">
            Show this QR code at tournament check-ins to verify your identity
          </div>
          
          <div className="flex gap-3 w-full">
            <Button 
              variant="outline" 
              className={cn(
                "flex-1",
                isFoundingMember && "border-amber-300 text-amber-700 hover:bg-amber-50"
              )}
              onClick={handleDownloadQR}
              disabled={isDownloading}
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            
            {showShareButton && (
              <Button 
                variant="default" 
                className={cn(
                  "flex-1",
                  isFoundingMember
                    ? "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600"
                    : "bg-[#FF5722]"
                )}
                onClick={handleSharePassport}
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}