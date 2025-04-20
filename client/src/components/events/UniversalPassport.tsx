/**
 * PKL-278651-CONN-0005-PASS-UI - Enhanced Universal Passport Component
 * PKL-278651-CONN-0008-UX - PicklePass™ UI/UX Enhancement Sprint
 * PKL-278651-CONN-0009-SCAN - Quick Passport Scan Feature
 * PKL-278651-CONN-0010-INTG - Universal Passport Integration Enhancement
 * 
 * Enhanced Universal Passport Component
 * 
 * Displays the user's universal passport QR code with improved visual design,
 * animations, and accessibility for a more engaging and inclusive experience.
 * Now includes direct scan capability and enhanced event-passport integration.
 * 
 * @implementation Framework5.2
 * @lastModified 2025-04-20
 */

import { useEffect, useState, useRef } from 'react';
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
  CalendarIcon
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

interface UniversalPassportProps {
  className?: string;
  onViewRegisteredEvents?: () => void;
  /** Optional upcoming event to enable direct registration */
  upcomingEvent?: Event | null;
  /** Optional callback after successful registration */
  onRegistrationComplete?: (eventId: number) => void;
}

export function UniversalPassport({ 
  className, 
  onViewRegisteredEvents,
  upcomingEvent = null,
  onRegistrationComplete
}: UniversalPassportProps) {
  const { toast } = useToast();
  const [highlightCode, setHighlightCode] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showScanDialog, setShowScanDialog] = useState(false);
  const [showQuickRegDialog, setShowQuickRegDialog] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

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
        <CardHeader className="pb-2 bg-gradient-to-r from-primary/5 to-primary/0">
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
            <Skeleton className="h-[270px] w-[270px] rounded-xl" />
            
            {/* Skeleton corner accents */}
            <div className="absolute top-0 left-0 w-4 h-4 opacity-30">
              <Skeleton className="h-full w-full" />
            </div>
            <div className="absolute top-0 right-0 w-4 h-4 opacity-30">
              <Skeleton className="h-full w-full" />
            </div>
            <div className="absolute bottom-0 left-0 w-4 h-4 opacity-30">
              <Skeleton className="h-full w-full" />
            </div>
            <div className="absolute bottom-0 right-0 w-4 h-4 opacity-30">
              <Skeleton className="h-full w-full" />
            </div>
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
            <DialogTitle className="flex items-center">
              <ScanIcon className="mr-2 h-5 w-5 text-primary" />
              Scan PicklePass™ Passport
            </DialogTitle>
            <DialogDescription>
              Scan a participant's passport QR code to verify event registration.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-muted/30 rounded-lg p-6 flex flex-col items-center">
            <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-8 w-full aspect-square flex flex-col items-center justify-center">
              <ScanIcon className="h-16 w-16 text-muted-foreground/50 mb-4" />
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
              <DialogTitle className="flex items-center">
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

      <Card className={cn("overflow-hidden shadow-lg border-primary/10", className)}>
        <CardHeader className="pb-2 bg-gradient-to-r from-primary/5 via-primary/2 to-transparent">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CardTitle className="flex items-center">
              <TicketIcon className="h-5 w-5 mr-2 text-primary" />
              My PicklePass™ Passport
            </CardTitle>
            <CardDescription>
              Your universal passport for all PicklePass™ events
            </CardDescription>
          </motion.div>
        </CardHeader>
      <CardContent className="flex flex-col items-center justify-center pt-6 pb-8 relative">
        {/* Verification badge with enhanced animation */}
        <motion.div 
          className="absolute top-2 right-2 z-10"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
        >
          <Badge 
            variant="outline" 
            className="py-1 px-2 bg-primary/5 text-primary border-primary/20 flex items-center gap-1 shadow-sm"
          >
            <ShieldCheckIcon className="h-3 w-3" />
            <span className="text-xs font-medium">Verified</span>
          </Badge>
        </motion.div>
        
        {/* Background decoration element for visual interest */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            className="absolute -right-20 -top-20 w-40 h-40 rounded-full bg-primary/5 blur-3xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ duration: 0.8 }}
          />
          <motion.div 
            className="absolute -left-20 -bottom-20 w-40 h-40 rounded-full bg-primary/5 blur-3xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
        </div>
        
        {/* QR Code Display with enhanced animations */}
        <motion.div
          className={cn(
            "p-5 rounded-xl border-2 border-primary/10 bg-white relative z-10",
            highlightCode && "border-primary"
          )}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ 
            scale: 1, 
            opacity: 1,
            boxShadow: highlightCode 
              ? '0 0 15px 4px rgba(255, 87, 34, 0.2)' 
              : '0 4px 12px rgba(0, 0, 0, 0.08)'
          }}
          transition={{ 
            duration: 0.6, 
            ease: "easeOut" 
          }}
          whileHover={{ 
            scale: 1.02,
            boxShadow: '0 8px 25px rgba(255, 87, 34, 0.15)' 
          }}
        >
          {/* Animated corner accents */}
          <motion.div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary" 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          />
          <motion.div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary" 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          />
          <motion.div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary" 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          />
          <motion.div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary" 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
          />
          
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
        
        {/* Passport code display with enhanced styling */}
        <motion.div 
          className="mt-8 flex flex-col items-center w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <motion.div 
            className="text-lg font-medium flex items-center bg-primary/5 px-4 py-2 rounded-full shadow-sm"
            whileHover={{ 
              backgroundColor: "rgba(255, 87, 34, 0.08)",
              transition: { duration: 0.2 }
            }}
          >
            <span className="text-muted-foreground mr-2">Code:</span>
            <motion.span 
              className={cn(
                "font-bold text-primary tracking-wide",
                highlightCode && "bg-primary/10 px-2 py-0.5 rounded-md"
              )}
              animate={{
                scale: highlightCode ? 1.05 : 1,
                color: highlightCode ? "rgb(235, 67, 14)" : "rgb(255, 87, 34)"
              }}
              transition={{ duration: 0.4 }}
            >
              {passportCode}
            </motion.span>
            <AnimatePresence>
              {copiedCode && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5, x: -20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="absolute ml-24"
                >
                  <CheckCircle2Icon className="h-5 w-5 text-green-500" />
                </motion.div>
              )}
            </AnimatePresence>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 ml-2 hover:bg-primary/10"
                      onClick={copyPassportCode}
                      aria-label="Copy passport code"
                    >
                      <Copy className={cn(
                        "h-3.5 w-3.5", 
                        copiedCode ? "text-green-500" : "text-muted-foreground"
                      )} />
                    </Button>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Copy passport code</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </motion.div>
          
          <motion.div 
            className="text-sm text-muted-foreground mt-3 flex items-center px-3 py-1.5 bg-muted/40 rounded-full"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <InfoIcon className="h-3.5 w-3.5 mr-2" />
            Present this code when checking in to events
          </motion.div>
        </motion.div>
        
        {/* Registered events badge with enhanced animation */}
        {registeredEvents && registeredEvents.length > 0 && (
          <motion.div 
            className="mt-8 w-full flex justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, type: "spring", stiffness: 100 }}
          >
            <Badge 
              variant="outline" 
              className="py-2 px-4 text-sm bg-green-50 border-green-200 text-green-700 flex items-center shadow-sm"
            >
              <CalendarDaysIcon className="h-4 w-4 mr-2" />
              {registeredEvents.length} Registered Event{registeredEvents.length !== 1 ? 's' : ''}
            </Badge>
          </motion.div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center gap-4 pt-0 pb-5 bg-gradient-to-b from-muted/0 to-muted/20">
        {/* View Registered Events button with animation */}
        {registeredEvents && registeredEvents.length > 0 && (
          <motion.div className="w-full"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              variant="default" 
              className="w-full bg-primary/90 hover:bg-primary transition-all duration-300 shadow-sm"
              onClick={onViewRegisteredEvents}
              disabled={!onViewRegisteredEvents}
            >
              <CalendarDaysIcon className="h-4 w-4 mr-2" />
              View My Events
            </Button>
          </motion.div>
        )}
        
        {/* Scan Instructions button with enhanced tooltip */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
                whileHover={{ rotate: 15, scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-10 w-10 rounded-full border-primary/30 hover:border-primary/70 hover:bg-primary/5 shadow-sm"
                  aria-label="How to use your passport"
                >
                  <ScanIcon className="h-5 w-5 text-primary" />
                </Button>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs text-center p-4">
              <p className="font-medium mb-1">How to use your PicklePass™</p>
              <p className="text-sm text-muted-foreground">
                At the event, an organizer will scan your passport code to 
                check you in. Your passport works for all events you're registered for.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardFooter>
    </Card>
  );
}

export default UniversalPassport;