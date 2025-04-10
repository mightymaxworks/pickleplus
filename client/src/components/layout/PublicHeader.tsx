import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { PicklePlusNewLogo } from '@/components/icons/PicklePlusNewLogo';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { Button } from '@/components/ui/button';

export function PublicHeader() {
  const [location, navigate] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const isExtraSmallScreen = useMediaQuery('(max-width: 480px)');
  
  // Handle scroll detection for header styling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <motion.header 
      className={`sticky top-0 z-30 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/80 dark:bg-gray-900/80 shadow-md backdrop-blur-lg' 
          : 'bg-white dark:bg-gray-900'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', damping: 20, stiffness: 100 }}
    >
      <div className="px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Logo aligned to the left */}
        <motion.div
          className="flex items-center justify-start flex-1"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div 
            className="cursor-pointer"
            onClick={() => navigate("/")}
          >
            <PicklePlusNewLogo 
              height={isExtraSmallScreen ? "24px" : "32px"}
              width="auto"
              preserveAspectRatio={true}
            />
          </div>
        </motion.div>
        
        {/* Right side actions - Login/Register buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            className="text-gray-700 hover:text-[#FF5722] hover:bg-transparent"
            onClick={() => navigate("/auth")}
          >
            Log in
          </Button>
          <Button
            className="bg-[#FF5722] hover:bg-[#E64A19] text-white rounded-full px-4 py-2"
            onClick={() => navigate("/auth?tab=register")}
          >
            Sign up
          </Button>
        </div>
      </div>
    </motion.header>
  );
}