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
  ArrowDownIcon
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

  // Fetch passport code
  const { data: passportCode, isLoading: isLoadingCode } = useQuery({
    queryKey: ['/api/user/passport/code'],
    queryFn: getUserPassportCode,
  });

  // Fetch registered events count
  const { data: registeredEvents } = useQuery({
    queryKey: ['/api/events/my/registered'],
    queryFn: () => getMyRegisteredEvents(),
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
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary via-primary/70 to-primary/40" />
          
          <CardHeader className="pb-2 pt-6 px-6">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex justify-between items-start"
            >
              <div>
                <CardTitle className="flex items-center text-lg sm:text-xl">
                  <TicketIcon className="h-5 w-5 mr-2 text-primary" />
                  PicklePass™ Passport
                </CardTitle>
                <CardDescription>
                  Your universal event passport
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
                  className="py-1 px-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800 flex items-center gap-1.5 shadow-sm"
                >
                  <ShieldCheckIcon className="h-3 w-3" />
                  <span className="text-xs font-medium">Verified</span>
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
            
            {/* QR Code Display with enhanced animations */}
            <motion.div
              className={cn(
                "p-4 rounded-2xl border-2 shadow-lg bg-white relative z-10",
                highlightCode 
                  ? "border-primary shadow-lg shadow-primary/10" 
                  : "border-primary/5 shadow-lg shadow-black/5"
              )}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ 
                scale: 1, 
                opacity: 1,
                boxShadow: highlightCode 
                  ? '0 0 20px 5px rgba(255, 87, 34, 0.15)' 
                  : '0 10px 30px rgba(0, 0, 0, 0.05)'
              }}
              transition={{ 
                duration: 0.6, 
                ease: "easeOut" 
              }}
              whileHover={{ 
                scale: 1.02,
                boxShadow: '0 15px 35px rgba(255, 87, 34, 0.12)'
              }}
            >
              {/* QR Code corners - more subtle and modern */}
              <div className="absolute top-0 left-0 w-12 h-12">
                <motion.svg viewBox="0 0 48 48" className="w-full h-full" initial={{ opacity: 0 }} animate={{ opacity: 0.9 }} transition={{ delay: 0.3 }}>
                  <path d="M2 2 L12 2 L2 12 Z" fill="none" stroke="#FF5722" strokeWidth="2" />
                </motion.svg>
              </div>
              <div className="absolute top-0 right-0 w-12 h-12">
                <motion.svg viewBox="0 0 48 48" className="w-full h-full" initial={{ opacity: 0 }} animate={{ opacity: 0.9 }} transition={{ delay: 0.4 }}>
                  <path d="M46 2 L36 2 L46 12 Z" fill="none" stroke="#FF5722" strokeWidth="2" />
                </motion.svg>
              </div>
              <div className="absolute bottom-0 left-0 w-12 h-12">
                <motion.svg viewBox="0 0 48 48" className="w-full h-full" initial={{ opacity: 0 }} animate={{ opacity: 0.9 }} transition={{ delay: 0.5 }}>
                  <path d="M2 46 L12 46 L2 36 Z" fill="none" stroke="#FF5722" strokeWidth="2" />
                </motion.svg>
              </div>
              <div className="absolute bottom-0 right-0 w-12 h-12">
                <motion.svg viewBox="0 0 48 48" className="w-full h-full" initial={{ opacity: 0 }} animate={{ opacity: 0.9 }} transition={{ delay: 0.6 }}>
                  <path d="M46 46 L36 46 L46 36 Z" fill="none" stroke="#FF5722" strokeWidth="2" />
                </motion.svg>
              </div>
              
              {passportCode && (
                <QRCodeSVG
                  value={`PICKLEPLUSKP-${passportCode}`}
                  size={240}
                  level="H"
                  includeMargin={true}
                  imageSettings={{
                    src: "/src/assets/pickle-plus-logo.png",
                    height: 44,
                    width: 44,
                    excavate: true,
                  }}
                />
              )}
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
                  "flex items-center justify-center px-5 py-3 rounded-full bg-primary/5 border border-primary/10 shadow-sm w-fit transition-all",
                  highlightCode && "bg-primary/10 border-primary/20",
                  "group cursor-pointer hover:bg-primary/10"
                )}
                onClick={copyPassportCode}
              >
                <motion.span 
                  className="font-mono font-medium text-lg text-primary tracking-wide"
                  animate={{ scale: highlightCode ? 1.05 : 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {passportCode ?? 'Loading...'}
                </motion.span>
                <motion.div 
                  className="ml-2 opacity-70 group-hover:opacity-100"
                  whileHover={{ scale: 1.1, opacity: 1 }}
                >
                  {copiedCode ? (
                    <CheckCircleIcon className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4 text-primary/80" />
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
                      className="flex-shrink-0 bg-white dark:bg-gray-800 hover:bg-primary/5"
                    >
                      <ShareIcon className="h-4 w-4 text-primary" />
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
                      className="flex-shrink-0 bg-white dark:bg-gray-800 hover:bg-primary/5"
                    >
                      <ScanIcon className="h-4 w-4 text-primary" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Scan another passport</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              {upcomingEvent && (
                <Button
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={() => setShowQuickRegDialog(true)}
                >
                  <ZapIcon className="mr-2 h-4 w-4" />
                  Quick Register for Event
                </Button>
              )}
              
              {!upcomingEvent && onViewRegisteredEvents && (
                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-white"
                  onClick={onViewRegisteredEvents}
                >
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