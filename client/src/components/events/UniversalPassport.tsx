/**
 * PKL-278651-CONN-0004-PASS-REG-UI-PHASE2
 * Universal Passport Component
 * 
 * Displays the user's universal passport QR code that works across all events
 */

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { TicketIcon, ScanIcon, InfoIcon, CalendarDaysIcon, Copy } from 'lucide-react';

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
import { useToast } from '@/hooks/use-toast';

import { getUserPassportCode, getMyRegisteredEvents } from '@/lib/sdk/eventSDK';
import { cn } from '@/lib/utils';

interface UniversalPassportProps {
  className?: string;
  onViewRegisteredEvents?: () => void;
}

export function UniversalPassport({ className, onViewRegisteredEvents }: UniversalPassportProps) {
  const { toast } = useToast();
  const [highlightCode, setHighlightCode] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

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
      <Card className={cn("overflow-hidden", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center">
            <TicketIcon className="h-5 w-5 mr-2 text-primary" />
            <Skeleton className="h-6 w-36" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-56" />
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Skeleton className="h-64 w-64 rounded-lg" />
          <Skeleton className="h-6 w-36 mt-6" />
        </CardContent>
      </Card>
    );
  }

  // Render passport card
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center">
          <TicketIcon className="h-5 w-5 mr-2 text-primary" />
          My PicklePass™ Passport
        </CardTitle>
        <CardDescription>
          Your universal passport for all PicklePass™ events
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center pt-4 pb-8">
        {/* QR Code Display - Simplified version without QRCode library */}
        <motion.div
          className={cn(
            "p-4 rounded-xl border-2 border-dashed bg-muted flex flex-col items-center justify-center",
            highlightCode && "border-primary bg-primary/5"
          )}
          animate={{
            boxShadow: highlightCode 
              ? '0 0 0 4px rgba(255, 87, 34, 0.4)' 
              : '0 0 0 0px rgba(255, 87, 34, 0)'
          }}
          transition={{ duration: 1 }}
          whileHover={{ scale: 1.02 }}
          style={{ width: '220px', height: '220px' }}
        >
          <div className="bg-white p-3 rounded-lg mb-4">
            <TicketIcon className="h-12 w-12 text-primary" />
          </div>
          <p className="text-center text-sm mb-2">Passport Code:</p>
          <p className="text-center text-xl font-bold">{passportCode}</p>
          <p className="text-center text-xs text-muted-foreground mt-4">
            Show this code at check-in
          </p>
        </motion.div>
        
        {/* Passport code display */}
        <div className="mt-6 flex flex-col items-center">
          <div className="text-lg font-medium flex items-center">
            Passport Code: 
            <span 
              className={cn(
                "ml-2 font-bold text-primary",
                highlightCode && "bg-primary/10 px-1 rounded"
              )}
            >
              {passportCode}
            </span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 ml-1"
                    onClick={copyPassportCode}
                  >
                    <Copy className={cn(
                      "h-3.5 w-3.5", 
                      copiedCode ? "text-green-500" : "text-muted-foreground"
                    )} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Copy passport code</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <div className="text-sm text-muted-foreground mt-1 flex items-center">
            <InfoIcon className="h-3.5 w-3.5 mr-1" />
            Present this code when checking in to events
          </div>
        </div>
        
        {/* Registered events badge */}
        {registeredEvents && registeredEvents.length > 0 && (
          <motion.div 
            className="mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Badge 
              variant="outline" 
              className="py-1.5 px-3 text-sm bg-green-50 border-green-100 text-green-700"
            >
              <CalendarDaysIcon className="h-3.5 w-3.5 mr-2" />
              {registeredEvents.length} Registered Event{registeredEvents.length !== 1 ? 's' : ''}
            </Badge>
          </motion.div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center gap-4 pt-0">
        {/* View Registered Events button */}
        {registeredEvents && registeredEvents.length > 0 && (
          <Button 
            variant="outline" 
            className="w-full"
            onClick={onViewRegisteredEvents}
            disabled={!onViewRegisteredEvents}
          >
            <CalendarDaysIcon className="h-4 w-4 mr-2" />
            View My Events
          </Button>
        )}
        
        {/* Scan Instructions button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-9 w-9 rounded-full"
              >
                <ScanIcon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs text-center">
              <p>
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