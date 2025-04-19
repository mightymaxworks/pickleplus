/**
 * PKL-278651-COMM-0028-NOTIF - Updated AppHeader Component
 * Implementation timestamp: 2025-04-19 15:05 ET
 * 
 * AppHeader updated to include new NotificationBell component
 * 
 * Framework 5.2 compliant implementation
 */

import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { Menu, X, User, Home, LogOut, Settings, Calendar, Shield, Activity, Trophy, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PicklePlusNewLogo } from '../icons/PicklePlusNewLogo';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AppHeader() {
  const { user, logoutMutation } = useAuth();
  const [location, navigate] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isExtraSmallScreen = useMediaQuery('(max-width: 480px)');
  
  // Handle scroll detection for header styling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    navigate("/login");
  };
  
  if (!user) {
    return null;
  }
  
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
            onClick={() => navigate("/dashboard")}
          >
            <PicklePlusNewLogo 
              height={isExtraSmallScreen ? "24px" : "32px"}
              width="auto"
              preserveAspectRatio={true}
            />
          </div>
        </motion.div>
        
        {/* Right side actions */}
        <div className="flex items-center justify-end gap-1 sm:gap-3">
          {/* Notification Bell */}
          <NotificationBell />
          
          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <motion.div 
                className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-full pl-1 pr-2 py-1 border border-gray-200 dark:border-gray-700 cursor-pointer"
                whileHover={{ scale: 1.02 }}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#2196F3] to-[#03A9F4] flex items-center justify-center text-sm font-medium text-white shadow-sm">
                  {user.avatarInitials || user.username.substring(0, 2).toUpperCase()}
                </div>
                <Menu size={16} className="text-gray-600 dark:text-gray-300 ml-1" />
              </motion.div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                <Home className="mr-2 h-4 w-4" />
                Dashboard
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/matches")}>
                <Activity className="mr-2 h-4 w-4" />
                Matches
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/leaderboard")}>
                <Trophy className="mr-2 h-4 w-4" />
                Leaderboard
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/mastery-paths")}>
                <Award className="mr-2 h-4 w-4" />
                Mastery Paths
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/events")}>
                <Calendar className="mr-2 h-4 w-4" />
                Event Check-in
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              {user.isAdmin && (
                <DropdownMenuItem onClick={() => navigate("/admin")}>
                  <Shield className="mr-2 h-4 w-4" />
                  Admin Panel
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* No mobile menu in AppHeader - using profile dropdown instead */}
    </motion.header>
  );
}