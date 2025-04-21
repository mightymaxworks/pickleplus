/**
 * PKL-278651-CONN-0008-UX-MOD2 - PicklePass™ UI/UX Enhancement Sprint v2.1
 * 
 * PassportFAB Component
 * 
 * A Floating Action Button for quick access to the Universal Passport
 * that provides a more intuitive and accessible way for users to access
 * their passport without disrupting the normal event flow.
 * 
 * @implementation Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { TicketIcon, X as XIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import ModernUniversalPassport from './ModernUniversalPassport';

export const PassportFAB = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showPassport, setShowPassport] = useState(false);
  
  // Handle button click
  const handleClick = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to view your universal passport",
        variant: "default"
      });
      return;
    }
    
    setShowPassport(true);
  };
  
  return (
    <>
      {/* Floating Action Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          type: "spring",
          stiffness: 260,
          damping: 20
        }}
      >
        <motion.button
          className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          onClick={handleClick}
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
        >
          <TicketIcon className="h-6 w-6" />
          <span className="sr-only">View Universal Passport</span>
        </motion.button>
      </motion.div>
      
      {/* Passport Dialog */}
      <Dialog open={showPassport} onOpenChange={setShowPassport}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-xl border-primary/10 shadow-xl relative">
          <DialogHeader className="sr-only">
            <DialogTitle>PicklePass™ Universal Passport</DialogTitle>
            <DialogDescription>
              Your universal passport works for all PicklePass™ events
            </DialogDescription>
          </DialogHeader>
          
          {/* Custom close button for better visibility */}
          <button 
            className="absolute top-2 right-2 z-50 bg-muted/80 hover:bg-muted p-1.5 rounded-full backdrop-blur-sm text-muted-foreground" 
            onClick={() => setShowPassport(false)}
            aria-label="Close"
          >
            <XIcon className="h-4 w-4" />
          </button>
          
          <ModernUniversalPassport 
            onViewRegisteredEvents={() => {
              setShowPassport(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PassportFAB;