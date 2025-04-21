/**
 * PKL-278651-CONN-0008-UX-MOD2 - PicklePass™ UI/UX Enhancement Sprint v2.1
 * 
 * SimplePassportFAB Component
 * 
 * A simplified Floating Action Button for quick access to the Universal Passport
 * without using the complex Dialog implementation that was causing issues.
 * 
 * @implementation Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TicketIcon } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

export const SimplePassportFAB = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  // Handle button click - navigate to passport page
  const handleClick = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to view your universal passport",
        variant: "default"
      });
      return;
    }
    
    // Instead of opening a dialog, navigate to the passport page
    navigate('/passport');
  };
  
  return (
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
  );
};

export default SimplePassportFAB;