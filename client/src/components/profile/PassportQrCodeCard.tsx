import { QrCode, Printer, Link as LinkIcon, Copy, Crown, CheckCircle2 } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";

interface PassportQrCodeCardProps {
  user: any;
}

export function PassportQrCodeCard({ user }: PassportQrCodeCardProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  
  // Generate a fixed passport ID if one doesn't exist (for demo purposes)
  const passportId = user.passportId || `PKL-${Math.floor(100000 + Math.random() * 900000)}`;
  
  // Generate a connection token - in a real app, this would be secured with a server-side token
  const connectionToken = btoa(`${passportId}:${Date.now()}`);
  
  // Include connection information in the URL
  const passportUrl = `https://pickleplus.app/connect/${passportId}?token=${connectionToken}`;
    
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
  
  const handleCopyId = () => {
    if (passportId) {
      navigator.clipboard.writeText(passportId);
      setCopiedId(true);
      toast({
        title: "ID copied",
        description: "Passport ID has been copied to clipboard",
      });
      
      setTimeout(() => setCopiedId(false), 2000);
    }
  };
  
  const handlePrintPassport = () => {
    toast({
      title: "Printing passport",
      description: "Your passport is being prepared for printing",
    });
    // In a real app, this would open a print-friendly view
  };
  
  const isFoundingMember = user.isFoundingMember;
  
  return (
    <Card className={isFoundingMember ? 'border border-amber-400/50 bg-gradient-to-b from-amber-50 to-white dark:from-amber-950/10 dark:to-background' : ''}>
      <CardHeader className={`pb-3 ${isFoundingMember ? 'bg-gradient-to-r from-amber-100/50 to-amber-50/30 dark:from-amber-900/20 dark:to-transparent' : ''}`}>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center gap-2">
            <QrCode className={`h-5 w-5 ${isFoundingMember ? 'text-amber-500' : 'text-[#673AB7]'}`} /> 
            Pickleball Passport
          </CardTitle>
          
          {isFoundingMember && (
            <Badge variant="outline" className="border-amber-500 text-amber-500 bg-amber-50 dark:bg-amber-950/20">
              <Crown className="h-3 w-3 mr-1 text-amber-500" /> Founding
            </Badge>
          )}
        </div>
        <CardDescription>
          Use this QR code to check into tournaments, connect with other players, and track your achievements
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div className={`p-3 rounded-xl mb-3 ${isFoundingMember ? 'bg-gradient-to-b from-amber-50 to-white border border-amber-300/50 shadow-sm dark:from-amber-950/10 dark:to-black/20 dark:border-amber-500/20' : 'bg-white border'}`}>
          <QRCodeSVG 
            value={passportUrl} 
            size={180} 
            bgColor={"#FFFFFF"}
            fgColor={isFoundingMember ? "#D97706" : "#000000"}
            level={"H"}
            includeMargin={false}
          />
        </div>
        
        <div className="flex items-center gap-1 font-mono text-xs text-center text-muted-foreground mb-4">
          <span>ID: {passportId}</span>
          <button 
            onClick={handleCopyId}
            className="inline-flex text-muted-foreground hover:text-foreground transition-colors"
          >
            {copiedId ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
        
        <div className="grid grid-cols-3 gap-2 w-full">
          <Button 
            variant="outline" 
            onClick={handlePrintPassport} 
            className={isFoundingMember ? 'border-amber-200 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300 dark:border-amber-900 dark:hover:bg-amber-950 dark:hover:border-amber-700' : ''}
          >
            <Printer className="h-4 w-4 mr-2" /> Print
          </Button>
          <Button 
            variant="outline" 
            onClick={handleCopyLink}
            className={isFoundingMember ? 'border-amber-200 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300 dark:border-amber-900 dark:hover:bg-amber-950 dark:hover:border-amber-700' : ''}
          >
            <LinkIcon className="h-4 w-4 mr-2" /> 
            {copiedLink ? 'Copied' : 'Copy Link'}
          </Button>
          {/* Import for scan button component - this will be below */}
          <Button
            variant="default"
            onClick={() => window.location.href = "/scan"}
            className={`bg-indigo-600 hover:bg-indigo-700 text-white ${isFoundingMember ? 'bg-amber-500 hover:bg-amber-600' : ''}`}
          >
            <QrCode className="h-4 w-4 mr-2" /> Scan
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}