import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { Bell, Menu, X, User, Home, LogOut, Settings, Calendar, Shield, Activity, Trophy, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PicklePlusNewLogo } from '../icons/PicklePlusNewLogo';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

export function AppHeader() {
  const { user, logoutMutation } = useAuth();
  const [location, navigate] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationCount] = useState(3);
  const isExtraSmallScreen = useMediaQuery('(max-width: 480px)');
  const { toast } = useToast();
  
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
  
  const handleNotificationClick = () => {
    toast({
      title: "Coming April 15th!",
      description: "Stay tuned! Our personalized notification system is launching soon with match alerts, tournament invites, and achievement updates.",
      variant: "default",
      duration: 5000,
    });
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
          <motion.button 
            className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNotificationClick}
          >
            <Bell size={22} className="text-gray-600 dark:text-gray-300" />
            {notificationCount > 0 && (
              <motion.div 
                className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#FF5722] flex items-center justify-center text-white text-[10px] font-medium"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 10 }}
              >
                {notificationCount}
              </motion.div>
            )}
          </motion.button>
          
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
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              {user.isAdmin && (
                <DropdownMenuItem onClick={() => navigate("/admin/dashboard")}>
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
      
      {/* Mobile Menu with Navigation Items - Toggle menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            className="overflow-hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="p-4 space-y-3">
              {/* Navigation Items */}
              {[
                { label: 'Dashboard', icon: <Home size={18} />, path: '/dashboard' },
                { label: 'Matches', icon: <Calendar size={18} />, path: '/matches' },
                { label: 'Mastery Paths', icon: <Award size={18} />, path: '/mastery-paths' },
                { label: 'Profile', icon: <User size={18} />, path: '/profile' },
                { label: 'Settings', icon: <Settings size={18} />, path: '/settings' }
              ].map((item, i) => {
                const isActive = location === item.path;
                
                return (
                  <motion.button 
                    key={item.label}
                    className={`flex items-center w-full py-3 px-4 rounded-xl ${
                      isActive 
                        ? 'bg-gradient-to-r from-[#FF5722]/10 to-[#FF9800]/10 border border-[#FF5722]/20' 
                        : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                    } shadow-sm`}
                    onClick={() => {
                      navigate(item.path);
                      setMobileMenuOpen(false);
                    }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i }}
                    whileHover={{ x: 5 }}
                  >
                    <span className={`mr-3 ${isActive ? 'text-[#FF5722]' : 'text-gray-500 dark:text-gray-400'}`}>
                      {item.icon}
                    </span>
                    <span className={`font-medium ${isActive ? 'text-[#FF5722]' : 'text-gray-700 dark:text-gray-300'}`}>
                      {item.label}
                    </span>
                    
                    {isActive && (
                      <motion.div 
                        className="ml-auto w-1.5 h-6 bg-[#FF5722] rounded-full"
                        layoutId="navActiveIndicator"
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}