/**
 * PKL-278651-CONN-0005-PASS-UI-MOD - Modernized Universal Passport Component
 * PKL-278651-CONN-0008-UX - PicklePass™ UI/UX Enhancement Sprint
 * PKL-278651-CONN-0009-SCAN - Quick Passport Scan Feature
 * PKL-278651-CONN-0010-INTG - Universal Passport Integration Enhancement
 * 
 * Modernized Universal Passport Component
 * 
 * A completely redesigned PicklePass™ passport with a modern aesthetic, 
 * enhanced animations, improved accessibility, and better mobile experience.
 * 
 * @implementation Framework5.2
 * @version 2.0.0
 * @lastModified 2025-04-21
 */

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { 
  TicketIcon, 
  ScanIcon, 
  InfoIcon, 
  CalendarDaysIcon, 
  Copy, 
  ShieldCheckIcon,
  CheckCircle2Icon,
  ZapIcon,
  ShareIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowDownIcon,
  SparklesIcon
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';

import { getUserPassportCode, getMyRegisteredEvents, registerForEvent } from '@/lib/sdk/eventSDK';
import { cn, formatDate } from '@/lib/utils';
import type { Event } from '@shared/schema/events';

interface ModernUniversalPassportProps {
  className?: string;
  onViewRegisteredEvents?: () => void;
  /** Optional upcoming event to enable direct registration */
  upcomingEvent?: Event | null;
  /** Optional callback after successful registration */
  onRegistrationComplete?: (eventId: number) => void;
}

export function ModernUniversalPassport({ 
  className, 
  onViewRegisteredEvents,
  upcomingEvent = null,
  onRegistrationComplete
}: ModernUniversalPassportProps) {
  const { toast } = useToast();
  const [highlightCode, setHighlightCode] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showScanDialog, setShowScanDialog] = useState(false);
  const [showQuickRegDialog, setShowQuickRegDialog] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showHowToUse, setShowHowToUse] = useState(false);

  // Fetch passport code and founding member status
  const { data: passportData, isLoading: isLoadingCode } = useQuery({
    queryKey: ['/api/user/passport/code'],
    queryFn: getUserPassportCode,
  });
  
  // Extract passport code and founding member status
  const passportCode = passportData?.code || '';
  const isFoundingMember = passportData?.isFoundingMember || false;

  // Fetch registered events count
  const { data: registeredEvents, isError: isRegisteredEventsError } = useQuery({
    queryKey: ['/api/events/my/registered'],
    queryFn: () => getMyRegisteredEvents(),
    // Use retry: false to avoid repeated attempts when the error is expected
    retry: false
  });

  // Highlight animation
  useEffect(() => {
    // Highlight code periodically to make it more noticeable
    const interval = setInterval(() => {
      setHighlightCode(true);
      setTimeout(() => setHighlightCode(false), 1500);
    }, 7000);
    
    return () => clearInterval(interval);
  }, []);

  // Handle quick registration
  const handleQuickRegistration = async () => {
    if (!upcomingEvent?.id) return;
    
    setIsRegistering(true);
    try {
      await registerForEvent(upcomingEvent.id, '');
      
      toast({
        title: "Success!",
        description: `You're registered for ${upcomingEvent.name}`,
        variant: "success"
      });
      
      setShowQuickRegDialog(false);
      
      // Notify parent component about successful registration
      if (onRegistrationComplete) {
        onRegistrationComplete(upcomingEvent.id);
      }
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Failed to register for event. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsRegistering(false);
    }
  };

  // Handle sharing passport
  const sharePassport = async () => {
    if (!passportCode) return;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'My PicklePass™ Code',
          text: `My PicklePass™ Code: ${passportCode}`,
        });
        
        toast({
          title: "Passport Shared",
          description: "Your passport has been shared successfully.",
          variant: "success"
        });
      } else {
        // Fallback to copy
        copyPassportCode();
      }
    } catch (error) {
      console.error('Error sharing passport:', error);
    }
  };

  // Copy passport code
  const copyPassportCode = () => {
    if (passportCode) {
      navigator.clipboard.writeText(passportCode)
        .then(() => {
          setCopiedCode(true);
          toast({
            title: 'Passport Code Copied',
            description: 'Your passport code has been copied to clipboard.',
            variant: 'success',
          });
          
          setTimeout(() => setCopiedCode(false), 2000);
        })
        .catch(() => {
          toast({
            title: 'Copy Failed',
            description: 'Failed to copy passport code. Please try again.',
            variant: 'destructive',
          });
        });
    }
  };

  // Render loading state
  if (isLoadingCode) {
    return (
      <Card className={cn("overflow-hidden shadow-lg border-primary/10", className)}>
        <CardHeader className="pb-2 bg-gradient-to-r from-primary/10 to-transparent">
          <CardTitle className="flex items-center">
            <TicketIcon className="h-5 w-5 mr-2 text-primary" />
            <Skeleton className="h-6 w-36" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-56" />
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center pt-6 pb-8">
          {/* Skeleton for verification badge */}
          <div className="absolute top-2 right-2">
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          
          {/* Skeleton for QR code */}
          <div className="relative">
            <Skeleton className="h-[250px] w-[250px] rounded-xl" />
          </div>
          
          {/* Skeleton for passport code */}
          <div className="mt-8 flex flex-col items-center w-full">
            <Skeleton className="h-10 w-3/4 rounded-full" />
            <Skeleton className="h-7 w-2/3 rounded-full mt-3" />
          </div>
          
          {/* Skeleton for events badge */}
          <div className="mt-8 w-full flex justify-center">
            <Skeleton className="h-8 w-40 rounded-full" />
          </div>
        </CardContent>
        <CardFooter className="flex justify-center gap-4 pt-0 pb-5 bg-gradient-to-b from-muted/0 to-muted/20">
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </CardFooter>
      </Card>
    );
  }

  // Render passport card
  return (
    <>
      {/* QR Code Scan Dialog */}
      <Dialog open={showScanDialog} onOpenChange={setShowScanDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-xl">
              <ScanIcon className="mr-2 h-5 w-5 text-primary" />
              Scan PicklePass™ Passport
            </DialogTitle>
            <DialogDescription>
              Scan a participant's passport QR code to verify event registration.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-muted/30 rounded-lg p-6 flex flex-col items-center">
            <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-8 w-full aspect-square flex flex-col items-center justify-center bg-black/5">
              <motion.div 
                className="relative"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <ScanIcon className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <motion.div 
                  className="absolute top-0 left-0 w-full h-1 bg-primary/50"
                  initial={{ y: 0 }}
                  animate={{ y: 64 }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut"
                  }}
                />
              </motion.div>
              <p className="text-sm text-center text-muted-foreground">
                Position camera to scan QR code
              </p>
              {/* Would integrate with HTML5QrCode library here in a real implementation */}
            </div>
            <p className="text-xs text-muted-foreground mt-4 text-center max-w-[250px]">
              Camera access required. Make sure the QR code is well-lit and clearly visible.
            </p>
          </div>
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setShowScanDialog(false)}>
              Cancel
            </Button>
            <Button className="flex items-center">
              <ScanIcon className="mr-2 h-4 w-4" />
              Manual Code Entry
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quick Registration Dialog */}
      {upcomingEvent && (
        <Dialog open={showQuickRegDialog} onOpenChange={setShowQuickRegDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center text-xl">
                <ZapIcon className="mr-2 h-5 w-5 text-primary" />
                Quick Registration
              </DialogTitle>
              <DialogDescription>
                Register for this upcoming event with just one click.
              </DialogDescription>
            </DialogHeader>
            <div className="bg-muted/30 rounded-lg p-4">
              <h3 className="font-medium text-lg mb-1">{upcomingEvent.name}</h3>
              <div className="flex items-center text-sm text-muted-foreground mb-1">
                <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                <span>{formatDate(new Date(upcomingEvent.startDateTime))}</span>
              </div>
              <p className="text-sm">{upcomingEvent.description}</p>
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setShowQuickRegDialog(false)}>
                Cancel
              </Button>
              <Button 
                className="flex items-center" 
                disabled={isRegistering}
                onClick={handleQuickRegistration}
              >
                {isRegistering ? (
                  <>
                    <span className="animate-spin mr-2">◌</span>
                    Registering...
                  </>
                ) : (
                  <>
                    <CheckCircle2Icon className="mr-2 h-4 w-4" />
                    Register Now
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* How To Use Dialog */}
      <Dialog open={showHowToUse} onOpenChange={setShowHowToUse}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-xl">
              <InfoIcon className="mr-2 h-5 w-5 text-primary" />
              How To Use Your PicklePass™
            </DialogTitle>
            <DialogDescription>
              Your universal passport works for all PicklePass™ events
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 my-2">
            <div className="flex gap-3 items-start p-3 bg-muted/20 rounded-lg">
              <div className="bg-primary/10 rounded-full p-2 mt-0.5">
                <CalendarDaysIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Register for Events</h3>
                <p className="text-sm text-muted-foreground">
                  Browse upcoming events and register for them with a single click.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 items-start p-3 bg-muted/20 rounded-lg">
              <div className="bg-primary/10 rounded-full p-2 mt-0.5">
                <TicketIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Show at Check-In</h3>
                <p className="text-sm text-muted-foreground">
                  Present your QR code to the event organizer when you arrive for quick check-in.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 items-start p-3 bg-muted/20 rounded-lg">
              <div className="bg-primary/10 rounded-full p-2 mt-0.5">
                <ShareIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Share Your Passport</h3>
                <p className="text-sm text-muted-foreground">
                  Share your PicklePass™ code to quickly register with others or event organizers.
                </p>
              </div>
            </div>
          </div>
          <Button 
            onClick={() => setShowHowToUse(false)}
            className="w-full"
          >
            Got It
          </Button>
        </DialogContent>
      </Dialog>

      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        <Card className={cn(
          "overflow-hidden shadow-xl border-primary/10 relative z-10 bg-white dark:bg-gray-900",
          className
        )}>
          {/* Top gradient accent */}
          <div className={cn(
            "absolute top-0 left-0 right-0 h-2", 
            isFoundingMember 
              ? "bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300/40" 
              : "bg-gradient-to-r from-primary via-primary/70 to-primary/40"
            )} 
          />
          
          <CardHeader className="pb-2 pt-6 px-6">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex justify-between items-start"
            >
              <div>
                <CardTitle className="flex items-center text-lg sm:text-xl">
                  <TicketIcon className={cn(
                    "h-5 w-5 mr-2", 
                    isFoundingMember ? "text-amber-500" : "text-primary"
                  )} />
                  {isFoundingMember ? (
                    <span className="flex items-center">
                      PicklePass™ Passport
                      <SparklesIcon className="h-4 w-4 ml-1.5 text-amber-500" />
                    </span>
                  ) : (
                    "PicklePass™ Passport"
                  )}
                </CardTitle>
                <CardDescription>
                  {isFoundingMember 
                    ? "Founding Member Premium Access" 
                    : "Your universal event passport"
                  }
                </CardDescription>
              </div>
              
              {/* Verification badge with enhanced animation */}
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
              >
                <Badge 
                  variant="outline" 
                  className={cn(
                    "py-1 px-3 flex items-center gap-1.5 shadow-sm",
                    isFoundingMember
                    ? "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                    : "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800"
                  )}
                >
                  {isFoundingMember ? (
                    <>
                      <SparklesIcon className="h-3 w-3" />
                      <span className="text-xs font-medium">Founding Member</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheckIcon className="h-3 w-3" />
                      <span className="text-xs font-medium">Verified</span>
                    </>
                  )}
                </Badge>
              </motion.div>
            </motion.div>
          </CardHeader>
          
          <CardContent className="flex flex-col items-center justify-center pt-4 pb-6 relative px-6">
            {/* Background decoration elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <motion.div 
                className="absolute -right-20 -top-20 w-40 h-40 rounded-full bg-primary/5 blur-3xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                transition={{ duration: 0.8 }}
              />
              <motion.div 
                className="absolute -left-20 -bottom-20 w-40 h-40 rounded-full bg-primary/5 blur-3xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              />
            </div>
            
            {/* Enhanced QR Code Display with premium styling */}
            <motion.div
              className={cn(
                "p-5 rounded-3xl border shadow-xl relative z-10 overflow-hidden",
                highlightCode 
                  ? isFoundingMember
                    ? "border-amber-300 shadow-amber-200/30"
                    : "border-primary/30 shadow-primary/20" 
                  : isFoundingMember
                    ? "border-amber-200/50 shadow-amber-100/20"
                    : "border-primary/10 shadow-primary/10",
                "backdrop-blur-sm"
              )}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ 
                scale: 1, 
                opacity: 1,
                boxShadow: highlightCode 
                  ? isFoundingMember
                    ? '0 10px 40px 5px rgba(212, 160, 23, 0.2)' 
                    : '0 10px 40px 5px rgba(255, 87, 34, 0.15)' 
                  : isFoundingMember
                    ? '0 10px 30px rgba(212, 160, 23, 0.1)'
                    : '0 10px 30px rgba(0, 0, 0, 0.06)'
              }}
              transition={{ 
                duration: 0.6, 
                ease: "easeOut" 
              }}
              whileHover={{ 
                scale: 1.02,
                boxShadow: isFoundingMember
                  ? '0 15px 45px rgba(212, 160, 23, 0.2)'
                  : '0 15px 45px rgba(255, 87, 34, 0.15)'
              }}
              style={{
                background: isFoundingMember
                  ? 'linear-gradient(135deg, rgba(253, 230, 138, 0.2) 0%, rgba(252, 240, 195, 0.3) 50%, rgba(255, 236, 168, 0.2) 100%)'
                  : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.98) 50%, rgba(248, 250, 252, 0.9) 100%)'
              }}
            >
              {/* Enhanced corner elements with more elegant design */}
              <div className="absolute top-0 left-0 w-16 h-16">
                <motion.svg 
                  viewBox="0 0 64 64" 
                  className="w-full h-full" 
                  initial={{ opacity: 0, rotate: -10 }} 
                  animate={{ opacity: 1, rotate: 0 }} 
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <path 
                    d="M4 4 C4 20 4 24 20 24 C4 24 4 20 4 4" 
                    fill="none" 
                    stroke={isFoundingMember ? "#D4A017" : "#FF5722"} 
                    strokeWidth={isFoundingMember ? 3 : 2.5} 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </motion.svg>
              </div>
              
              <div className="absolute top-0 right-0 w-16 h-16">
                <motion.svg 
                  viewBox="0 0 64 64" 
                  className="w-full h-full" 
                  initial={{ opacity: 0, rotate: 10 }} 
                  animate={{ opacity: 1, rotate: 0 }} 
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  <path 
                    d="M60 4 C60 20 60 24 44 24 C60 24 60 20 60 4" 
                    fill="none" 
                    stroke={isFoundingMember ? "#D4A017" : "#FF5722"} 
                    strokeWidth={isFoundingMember ? 3 : 2.5} 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </motion.svg>
              </div>
              
              <div className="absolute bottom-0 left-0 w-16 h-16">
                <motion.svg 
                  viewBox="0 0 64 64" 
                  className="w-full h-full" 
                  initial={{ opacity: 0, rotate: 10 }} 
                  animate={{ opacity: 1, rotate: 0 }} 
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  <path 
                    d="M4 60 C4 44 4 40 20 40 C4 40 4 44 4 60" 
                    fill="none" 
                    stroke={isFoundingMember ? "#D4A017" : "#FF5722"} 
                    strokeWidth={isFoundingMember ? 3 : 2.5} 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </motion.svg>
              </div>
              
              <div className="absolute bottom-0 right-0 w-16 h-16">
                <motion.svg 
                  viewBox="0 0 64 64" 
                  className="w-full h-full" 
                  initial={{ opacity: 0, rotate: -10 }} 
                  animate={{ opacity: 1, rotate: 0 }} 
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  <path 
                    d="M60 60 C60 44 60 40 44 40 C60 40 60 44 60 60" 
                    fill="none" 
                    stroke={isFoundingMember ? "#D4A017" : "#FF5722"} 
                    strokeWidth={isFoundingMember ? 3 : 2.5} 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </motion.svg>
              </div>
              
              {/* Enhanced background pattern */}
              <div className="absolute inset-0 opacity-5 pointer-events-none overflow-hidden">
                {isFoundingMember ? (
                  <svg width="100%" height="100%" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <pattern id="goldPattern" width="10" height="10" patternUnits="userSpaceOnUse">
                      <circle cx="5" cy="5" r="1" fill="#D4A017" />
                    </pattern>
                    <rect width="100%" height="100%" fill="url(#goldPattern)" />
                  </svg>
                ) : (
                  <svg width="100%" height="100%" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <pattern id="primaryPattern" width="10" height="10" patternUnits="userSpaceOnUse">
                      <circle cx="5" cy="5" r="1" fill="#FF5722" />
                    </pattern>
                    <rect width="100%" height="100%" fill="url(#primaryPattern)" />
                  </svg>
                )}
              </div>
              
              {/* Gold sparkle effect for founding members */}
              {isFoundingMember && (
                <motion.div 
                  className="absolute inset-0 pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.7 }}
                >
                  <div className="absolute top-4 right-4">
                    <SparklesIcon className="h-5 w-5 text-amber-400" />
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <SparklesIcon className="h-5 w-5 text-amber-400" />
                  </div>
                </motion.div>
              )}
              
              {/* Premium QR code with custom styling */}
              <div className="relative">
                {/* Subtle glow effect behind QR */}
                <div 
                  className={cn(
                    "absolute inset-0 blur-lg rounded-full opacity-20",
                    isFoundingMember ? "bg-amber-300" : "bg-primary/70"
                  )}
                  style={{ transform: 'scale(0.7)' }}
                />
                
                {passportCode && (
                  <div className="relative">
                    <QRCodeSVG
                      value={`PICKLEPLUSKP-${passportCode}`}
                      size={240}
                      level="H"
                      includeMargin={true}
                      fgColor={isFoundingMember ? "#D4A017" : "#2583E4"} // Gold for founding members, blue for regular members
                      bgColor="transparent"
                      imageSettings={{
                        src: "/src/assets/pickle-plus-emblem.png", // Updated to use new emblem
                        height: 60,
                        width: 60,
                        excavate: true,
                      }}
                    />
                    
                    {/* Additional gold accent elements for founding members */}
                    {isFoundingMember && (
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-amber-400 rounded-tl-lg opacity-30"></div>
                        <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-amber-400 rounded-tr-lg opacity-30"></div>
                        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-amber-400 rounded-bl-lg opacity-30"></div>
                        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-amber-400 rounded-br-lg opacity-30"></div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
            
            {/* Passport code display with improved design */}
            <motion.div 
              className="mt-6 flex flex-col items-center w-full"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              <div 
                className={cn(
                  "flex items-center justify-center px-5 py-3 rounded-full border shadow-sm w-fit transition-all",
                  isFoundingMember 
                    ? highlightCode
                      ? "bg-amber-100/50 border-amber-300 dark:bg-amber-900/20 dark:border-amber-700/50"
                      : "bg-amber-50/50 border-amber-200/70 dark:bg-amber-900/10 dark:border-amber-800/30"
                    : highlightCode
                      ? "bg-primary/10 border-primary/20"
                      : "bg-primary/5 border-primary/10",
                  "group cursor-pointer",
                  isFoundingMember
                    ? "hover:bg-amber-100/70 dark:hover:bg-amber-900/30"
                    : "hover:bg-primary/10"
                )}
                onClick={copyPassportCode}
              >
                <motion.span 
                  className={cn(
                    "font-mono font-medium text-lg tracking-wide",
                    isFoundingMember 
                      ? "text-amber-700 dark:text-amber-400"
                      : "text-primary"
                  )}
                  animate={{ scale: highlightCode ? 1.05 : 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {passportCode ?? 'Loading...'}
                </motion.span>
                {isFoundingMember && (
                  <SparklesIcon className="h-4 w-4 mx-1.5 text-amber-500" />
                )}
                <motion.div 
                  className="ml-2 opacity-70 group-hover:opacity-100"
                  whileHover={{ scale: 1.1, opacity: 1 }}
                >
                  {copiedCode ? (
                    <CheckCircleIcon className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className={cn(
                      "h-4 w-4",
                      isFoundingMember ? "text-amber-500/80" : "text-primary/80"
                    )} />
                  )}
                </motion.div>
              </div>
              
              <div className="mt-2.5 text-xs text-muted-foreground">
                {registeredEvents?.length ? (
                  <motion.div 
                    className="flex items-center gap-1.5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <Badge 
                      variant="outline" 
                      className="bg-primary/5 hover:bg-primary/10 text-primary/90 border-primary/20"
                    >
                      {registeredEvents.length} {registeredEvents.length === 1 ? 'Event' : 'Events'} Registered
                    </Badge>
                    {onViewRegisteredEvents && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 px-2 text-xs text-primary/80 hover:text-primary hover:bg-primary/5"
                        onClick={onViewRegisteredEvents}
                      >
                        View
                      </Button>
                    )}
                  </motion.div>
                ) : (
                  <span>Tap code to copy</span>
                )}
              </div>
            </motion.div>
            
            {/* How to use section - collapsible */}
            <motion.div 
              layout
              className="mt-6 w-full"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ delay: 0.6, duration: 0.3 }}
            >
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground flex items-center gap-1 hover:text-foreground w-full justify-center"
                onClick={() => setShowHowToUse(true)}
              >
                <InfoIcon className="h-3 w-3" />
                <span>How to use your passport</span>
                <ArrowDownIcon className="h-3 w-3 ml-1" />
              </Button>
            </motion.div>
          </CardContent>
          
          <CardFooter className="flex justify-between items-center gap-4 pt-0 pb-5 border-t border-muted/20 px-6 bg-muted/5">
            <motion.div 
              className="flex gap-2 w-full"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.4 }}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={sharePassport}
                      className={cn(
                        "flex-shrink-0 bg-white dark:bg-gray-800",
                        isFoundingMember 
                          ? "hover:bg-amber-50 dark:hover:bg-amber-900/20 border-amber-200/50 dark:border-amber-800/30" 
                          : "hover:bg-primary/5 border-primary/10"
                      )}
                    >
                      <ShareIcon className={cn(
                        "h-4 w-4",
                        isFoundingMember ? "text-amber-500" : "text-primary"
                      )} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Share passport</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowScanDialog(true)}
                      className={cn(
                        "flex-shrink-0 bg-white dark:bg-gray-800",
                        isFoundingMember 
                          ? "hover:bg-amber-50 dark:hover:bg-amber-900/20 border-amber-200/50 dark:border-amber-800/30" 
                          : "hover:bg-primary/5 border-primary/10"
                      )}
                    >
                      <ScanIcon className={cn(
                        "h-4 w-4",
                        isFoundingMember ? "text-amber-500" : "text-primary"
                      )} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Scan another passport</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              {upcomingEvent && (
                <Button
                  className={cn(
                    "w-full text-white",
                    isFoundingMember 
                      ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 border-amber-400" 
                      : "bg-primary hover:bg-primary/90"
                  )}
                  onClick={() => setShowQuickRegDialog(true)}
                >
                  {isFoundingMember && (
                    <SparklesIcon className="h-4 w-4 mr-1.5" />
                  )}
                  <ZapIcon className="mr-2 h-4 w-4" />
                  Quick Register for Event
                </Button>
              )}
              
              {!upcomingEvent && onViewRegisteredEvents && (
                <Button
                  className={cn(
                    "w-full text-white",
                    isFoundingMember 
                      ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 border-amber-400" 
                      : "bg-primary hover:bg-primary/90"
                  )}
                  onClick={onViewRegisteredEvents}
                >
                  {isFoundingMember && (
                    <SparklesIcon className="h-4 w-4 mr-1.5" />
                  )}
                  <CalendarDaysIcon className="mr-2 h-4 w-4" />
                  View My Registered Events
                </Button>
              )}
            </motion.div>
          </CardFooter>
        </Card>
      </motion.div>
    </>
  );
}

export default ModernUniversalPassport;