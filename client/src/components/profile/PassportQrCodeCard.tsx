import { QrCode, Printer, Link as LinkIcon } from "lucide-react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface PassportQrCodeCardProps {
  user: any;
}

export function PassportQrCodeCard({ user }: PassportQrCodeCardProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  
  const passportUrl = user.passportId 
    ? `https://pickleplus.app/passport/${user.passportId}`
    : '';
    
  const handleCopyLink = () => {
    if (passportUrl) {
      navigator.clipboard.writeText(passportUrl);
      setCopiedLink(true);
      toast({
        title: "Link copied",
        description: "Passport link has been copied to clipboard",
      });
      
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };
  
  const handlePrintPassport = () => {
    toast({
      title: "Printing passport",
      description: "Your passport is being prepared for printing",
    });
    // In a real app, this would open a print-friendly view
  };
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <QrCode className="h-5 w-5 text-[#673AB7]" /> 
          Pickleball Passport
        </CardTitle>
        <CardDescription>
          Use this QR code to check into tournaments and track your achievements
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div className="bg-white p-3 rounded-xl mb-3 border">
          {user.passportId ? (
            <QRCodeSVG value={passportUrl} size={180} />
          ) : (
            <div className="flex items-center justify-center h-[180px] w-[180px] border border-dashed border-border rounded">
              <div className="text-center text-muted-foreground text-sm">
                <QrCode className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p>No passport generated</p>
              </div>
            </div>
          )}
        </div>
        
        {user.passportId && (
          <div className="font-mono text-xs text-center text-muted-foreground mb-4">
            ID: {user.passportId}
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-2 w-full">
          <Button variant="outline" onClick={handlePrintPassport} disabled={!user.passportId}>
            <Printer className="h-4 w-4 mr-2" /> Print
          </Button>
          <Button variant="outline" onClick={handleCopyLink} disabled={!user.passportId}>
            <LinkIcon className="h-4 w-4 mr-2" /> 
            {copiedLink ? 'Copied' : 'Copy Link'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}