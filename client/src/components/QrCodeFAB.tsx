import { useState, useEffect } from 'react';
import { QrCode, Scan, X, Copy, Crown, Link as LinkIcon, CheckCheck, CalendarClock, Rocket, Timer } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/hooks/useAuth';
import { QRCodeSVG } from 'qrcode.react';
import { useLocation } from 'wouter';
import { toast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

export function QrCodeFAB() {
  const [open, setOpen] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [showCountdown, setShowCountdown] = useState(false);
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  // Generate a fixed passport ID if one doesn't exist (for demo purposes)
  const passportId = user?.passportId || `PKL-${Math.floor(100000 + Math.random() * 900000)}`;
  
  // Generate a connection token - in a real app, this would be secured with a server-side token
  const connectionToken = btoa(`${passportId}:${Date.now()}`);
  
  // Include connection information in the URL
  const passportUrl = `https://pickleplus.app/connect/${passportId}?token=${connectionToken}`;
  
  // Calculate countdown to April 12th
  useEffect(() => {
    const launchDate = new Date("April 12, 2025 12:00:00").getTime();
    
    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = launchDate - now;
      
      // If launch date has passed, enable features
      if (distance <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      
      // Calculate days, hours, minutes, seconds
      setCountdown({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    };
    
    // Update countdown immediately and then every second
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  const handleScan = () => {
    setFabOpen(false);
    
    // If before launch date, show countdown instead
    const launchDate = new Date("April 12, 2025 12:00:00").getTime();
    const now = new Date().getTime();
    
    if (now < launchDate) {
      setShowCountdown(true);
    } else {
      setLocation('/scan');
    }
  };
  
  const handleShowQR = () => {
    setFabOpen(false);
    
    // If before launch date, show countdown instead
    const launchDate = new Date("April 12, 2025 12:00:00").getTime();
    const now = new Date().getTime();
    
    if (now < launchDate) {
      setShowCountdown(true);
    } else {
      setOpen(true);
    }
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
                onClick={() => {
                  navigator.clipboard.writeText(passportId);
                  toast({
                    title: "ID copied",
                    description: "Passport ID has been copied to clipboard",
                  });
                }}
                className="inline-flex text-muted-foreground hover:text-foreground transition-colors"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
            
            {/* Player Level & Tier */}
            {user?.level && (
              <div className="w-full mb-4 px-3 py-2 bg-gradient-to-r from-indigo-50 to-white dark:from-indigo-950/20 dark:to-transparent rounded-lg border border-indigo-100 dark:border-indigo-900/30 text-center">
                <div className="flex justify-center items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Level {user.level}</span>
                  <div className="h-3 w-3 rounded-full bg-indigo-600 dark:bg-indigo-400"></div>
                  <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 truncate">
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
                  {user.xp?.toLocaleString() || 0} XP total
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
                className={`text-xs flex-col h-auto py-3 ${isFoundingMember ? 'border-amber-200 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300 dark:border-amber-900 dark:hover:bg-amber-950 dark:hover:border-amber-700' : ''}`}
              >
                <LinkIcon className="h-4 w-4 mb-1" /> 
                <span className="truncate">Copy Link</span>
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setLocation('/scan')}
                className="text-xs flex-col h-auto py-3"
              >
                <Scan className="h-4 w-4 mb-1" />
                <span className="truncate">Scan</span>
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setOpen(false)}
                className="text-xs flex-col h-auto py-3"
              >
                <X className="h-4 w-4 mb-1" />
                <span className="truncate">Close</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Countdown Marketing Dialog */}
      <Dialog open={showCountdown} onOpenChange={setShowCountdown}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-auto">
          <DialogHeader className="pb-2 bg-gradient-to-r from-orange-100/50 to-transparent dark:from-orange-950/20 dark:to-transparent rounded-t-lg">
            <DialogTitle className="flex items-center gap-2 text-orange-600">
              <CalendarClock className="h-5 w-5" /> 
              Coming April 12th, 2025
            </DialogTitle>
          </DialogHeader>
          
          <div className="relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute -right-12 -top-12 opacity-5 w-48 h-48 bg-orange-500 rounded-full"></div>
            <div className="absolute -left-12 -bottom-12 opacity-5 w-40 h-40 bg-orange-500 rounded-full"></div>
            
            <div className="relative z-10 py-6">
              <div className="mb-4 text-center">
                <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">QR Code Connect Feature</h2>
                <p className="text-muted-foreground text-sm px-4">
                  Our new QR code connection system is launching soon! Experience seamless player connections, tournament check-ins, and achievement tracking.
                </p>
              </div>
              
              {/* Countdown timer */}
              <div className="grid grid-cols-4 gap-2 mb-6 px-2 py-4 rounded-lg">
                <div className="flex flex-col items-center">
                  <div className="bg-gradient-to-b from-orange-50 to-white dark:from-orange-950/20 dark:to-black/20 w-full aspect-square rounded-lg border border-orange-200 dark:border-orange-900/30 flex items-center justify-center">
                    <span className="text-2xl font-bold text-orange-600">{countdown.days}</span>
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">Days</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-gradient-to-b from-orange-50 to-white dark:from-orange-950/20 dark:to-black/20 w-full aspect-square rounded-lg border border-orange-200 dark:border-orange-900/30 flex items-center justify-center">
                    <span className="text-2xl font-bold text-orange-600">{countdown.hours}</span>
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">Hours</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-gradient-to-b from-orange-50 to-white dark:from-orange-950/20 dark:to-black/20 w-full aspect-square rounded-lg border border-orange-200 dark:border-orange-900/30 flex items-center justify-center">
                    <span className="text-2xl font-bold text-orange-600">{countdown.minutes}</span>
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">Minutes</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-gradient-to-b from-orange-50 to-white dark:from-orange-950/20 dark:to-black/20 w-full aspect-square rounded-lg border border-orange-200 dark:border-orange-900/30 flex items-center justify-center">
                    <span className="text-2xl font-bold text-orange-600">{countdown.seconds}</span>
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">Seconds</span>
                </div>
              </div>
              
              <div className="space-y-4 px-2">
                <div className="flex items-start gap-3">
                  <div className="bg-orange-100 dark:bg-orange-950/20 p-2 mt-0.5 rounded-lg">
                    <QrCode className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">Instant Player Connections</h3>
                    <p className="text-xs text-muted-foreground">Scan QR codes to instantly connect with other players and track your matches together</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-orange-100 dark:bg-orange-950/20 p-2 mt-0.5 rounded-lg">
                    <Timer className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">Quick Tournament Check-ins</h3>
                    <p className="text-xs text-muted-foreground">Skip the lines with rapid QR code tournament check-ins</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-orange-100 dark:bg-orange-950/20 p-2 mt-0.5 rounded-lg">
                    <Rocket className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">Exclusive Launch Bonuses</h3>
                    <p className="text-xs text-muted-foreground">Early adopters will receive special XP rewards and achievement badges</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 px-2">
                <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-orange-600 to-orange-400 h-full" style={{ width: `${(1 - (countdown.days / 7))*100}%` }}></div>
                </div>
                <div className="flex justify-between text-xs mt-1 text-muted-foreground">
                  <span>Development in progress</span>
                  <span>Launch day</span>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="sm:justify-center gap-2 mt-2">
            <Button
              variant="outline"
              onClick={() => setShowCountdown(false)}
              className="flex-1"
            >
              I'll Check Back Later
            </Button>
            <Button
              className="flex-1 bg-orange-600 hover:bg-orange-700"
              onClick={() => {
                toast({
                  title: "Reminder Set",
                  description: "We'll notify you when QR code features launch!",
                });
                setShowCountdown(false);
              }}
            >
              Remind Me at Launch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}