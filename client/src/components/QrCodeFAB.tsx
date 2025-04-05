import { useState } from 'react';
import { QrCode, Scan, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { QRCodeSVG } from 'qrcode.react';
import { useLocation } from 'wouter';

export function QrCodeFAB() {
  const [open, setOpen] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  // Generate a connection token - in a real app, this would be secured with a server-side token
  const connectionToken = user?.passportId 
    ? btoa(`${user.passportId}:${Date.now()}`)
    : '';
  
  // Include connection information in the URL
  const passportUrl = user?.passportId 
    ? `https://pickleplus.app/connect/${user.passportId}?token=${connectionToken}`
    : '';
  
  const handleScan = () => {
    setFabOpen(false);
    setLocation('/scan');
  };
  
  const handleShowQR = () => {
    setFabOpen(false);
    setOpen(true);
  };
  
  const isFoundingMember = user?.isFoundingMember;
  
  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-24 right-4 z-50 flex flex-col items-end gap-2">
        {fabOpen && (
          <div className="flex flex-col items-end gap-2 animate-fade-in">
            <div className="flex items-center gap-2">
              <div className="bg-background border py-2 px-3 rounded-full shadow-md">
                <span className="text-sm font-medium">Scan QR</span>
              </div>
              <Button
                size="icon"
                className="h-10 w-10 rounded-full bg-white text-primary hover:bg-gray-100 border shadow-md"
                onClick={handleScan}
              >
                <Scan className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="bg-background border py-2 px-3 rounded-full shadow-md">
                <span className="text-sm font-medium">My QR Code</span>
              </div>
              <Button
                size="icon"
                className="h-10 w-10 rounded-full bg-white text-primary hover:bg-gray-100 border shadow-md"
                onClick={handleShowQR}
              >
                <QrCode className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}
        
        <Button
          size="icon"
          className={`h-14 w-14 rounded-full shadow-lg ${
            fabOpen 
              ? 'bg-red-500 hover:bg-red-600 rotate-45 transition-transform' 
              : `${isFoundingMember 
                  ? 'bg-amber-500 hover:bg-amber-600' 
                  : 'bg-indigo-600 hover:bg-indigo-700'}`
          }`}
          onClick={() => setFabOpen(!fabOpen)}
        >
          {fabOpen ? (
            <X className="h-6 w-6 text-white" />
          ) : (
            <QrCode className="h-6 w-6 text-white" />
          )}
        </Button>
      </div>
      
      {/* QR Code Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xs mx-auto">
          <DialogHeader>
            <DialogTitle className="text-center flex justify-center items-center gap-2">
              <QrCode className={`h-5 w-5 ${isFoundingMember ? 'text-amber-500' : 'text-[#673AB7]'}`} /> 
              Your Passport
            </DialogTitle>
            <DialogDescription className="text-center">
              Show this QR code to connect with other players
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center p-4">
            <div className={`p-3 rounded-xl mb-3 ${isFoundingMember ? 'bg-gradient-to-b from-amber-50 to-white border border-amber-300/50 shadow-sm dark:from-amber-950/10 dark:to-black/20 dark:border-amber-500/20' : 'bg-white border'}`}>
              {user?.passportId ? (
                <QRCodeSVG 
                  value={passportUrl} 
                  size={200} 
                  bgColor={"#FFFFFF"}
                  fgColor={isFoundingMember ? "#D97706" : "#000000"}
                  level={"H"}
                  includeMargin={false}
                />
              ) : (
                <div className="flex items-center justify-center h-[200px] w-[200px] border border-dashed border-border rounded">
                  <div className="text-center text-muted-foreground text-sm">
                    <QrCode className="h-10 w-10 mx-auto mb-2 opacity-30" />
                    <p>No passport generated</p>
                  </div>
                </div>
              )}
            </div>
            
            {user?.passportId && (
              <div className="font-mono text-xs text-center text-muted-foreground mb-2">
                ID: {user.passportId}
              </div>
            )}
            
            <Button 
              variant="outline" 
              className="mt-2"
              onClick={() => setOpen(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}