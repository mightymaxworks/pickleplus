import { useState } from 'react';
import { QrCode, Scan, X, Copy, Crown, Link as LinkIcon, CheckCheck } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/hooks/useAuth';
import { QRCodeSVG } from 'qrcode.react';
import { useLocation } from 'wouter';
import { toast } from "@/hooks/use-toast";

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
        <DialogContent className={`max-w-xs mx-auto ${isFoundingMember ? 'border border-amber-400/50 bg-gradient-to-b from-amber-50 to-white dark:from-amber-950/10 dark:to-background' : ''}`}>
          <DialogHeader className={`pb-3 ${isFoundingMember ? 'bg-gradient-to-r from-amber-100/50 to-amber-50/30 dark:from-amber-900/20 dark:to-transparent' : ''}`}>
            <div className="flex justify-between items-center">
              <DialogTitle className="flex items-center gap-2">
                <QrCode className={`h-5 w-5 ${isFoundingMember ? 'text-amber-500' : 'text-[#673AB7]'}`} /> 
                Pickleball Passport
              </DialogTitle>
              
              {isFoundingMember && (
                <Badge variant="outline" className="border-amber-500 text-amber-500 bg-amber-50 dark:bg-amber-950/20">
                  <Crown className="h-3 w-3 mr-1 text-amber-500" /> Founding
                </Badge>
              )}
            </div>
            <DialogDescription>
              Use this QR code to check into tournaments, connect with other players, and track your achievements
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center p-4">
            <div className={`p-3 rounded-xl mb-3 ${isFoundingMember ? 'bg-gradient-to-b from-amber-50 to-white border border-amber-300/50 shadow-sm dark:from-amber-950/10 dark:to-black/20 dark:border-amber-500/20' : 'bg-white border'}`}>
              {user?.passportId ? (
                <QRCodeSVG 
                  value={passportUrl} 
                  size={180} 
                  bgColor={"#FFFFFF"}
                  fgColor={isFoundingMember ? "#D97706" : "#000000"}
                  level={"H"}
                  includeMargin={false}
                />
              ) : (
                <div className="flex items-center justify-center h-[180px] w-[180px] border border-dashed border-border rounded">
                  <div className="text-center text-muted-foreground text-sm">
                    <QrCode className="h-10 w-10 mx-auto mb-2 opacity-30" />
                    <p>No passport generated</p>
                  </div>
                </div>
              )}
            </div>
            
            {user?.passportId && (
              <div className="flex items-center gap-1 font-mono text-xs text-center text-muted-foreground mb-4">
                <span>ID: {user.passportId}</span>
                <button 
                  onClick={() => {
                    if (user.passportId) {
                      navigator.clipboard.writeText(user.passportId);
                      toast({
                        title: "ID copied",
                        description: "Passport ID has been copied to clipboard",
                      });
                    }
                  }}
                  className="inline-flex text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            
            {/* Player Level & Tier */}
            {user?.level && (
              <div className="w-full mb-4 px-3 py-2 bg-gradient-to-r from-indigo-50 to-white dark:from-indigo-950/20 dark:to-transparent rounded-lg border border-indigo-100 dark:border-indigo-900/30 text-center">
                <div className="flex justify-center items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Level {user.level}</span>
                  <div className="h-3 w-3 rounded-full bg-indigo-600 dark:bg-indigo-400"></div>
                  <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                    {user.level >= 1 && user.level <= 15 && "Dink Dabbler"}
                    {user.level >= 16 && user.level <= 30 && "Rally Rookie"}
                    {user.level >= 31 && user.level <= 45 && "Serve Specialist"}
                    {user.level >= 46 && user.level <= 60 && "Volley Virtuoso"}
                    {user.level >= 61 && user.level <= 75 && "Third Shot Tactician"}
                    {user.level >= 76 && user.level <= 90 && "Kitchen Commander"}
                    {user.level >= 91 && user.level <= 100 && "Pickleball Pro"}
                  </span>
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {user.xp?.toLocaleString()} XP total
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-3 gap-2 w-full">
              <Button 
                variant="outline" 
                onClick={() => {
                  if (passportUrl) {
                    navigator.clipboard.writeText(passportUrl);
                    toast({
                      title: "Link copied",
                      description: "Passport link has been copied to clipboard",
                    });
                  }
                }}
                className={isFoundingMember ? 'border-amber-200 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300 dark:border-amber-900 dark:hover:bg-amber-950 dark:hover:border-amber-700' : ''}
              >
                <LinkIcon className="h-4 w-4 mr-2" /> 
                Copy Link
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setLocation('/scan')}
              >
                <Scan className="h-4 w-4 mr-2" />
                Scan
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}