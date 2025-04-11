import React, { ReactNode, useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { MobileNavigation } from './MobileNavigation';
import { User } from '@shared/schema';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, User as UserIcon, Menu, X, Search, Settings, Home, Calendar, Award, Users, LogOut, Shield, Ticket } from 'lucide-react';
import { PicklePlusNewLogo } from '../icons/PicklePlusNewLogo';
import { useMediaQuery } from '../../hooks/useMediaQuery';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, isLoading, logoutMutation } = useAuth();
  const [location, navigate] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);
  const isExtraSmallScreen = useMediaQuery('(max-width: 480px)');
  const isSmallScreen = useMediaQuery('(max-width: 640px)');
  
  // Handle logout
  const handleLogout = () => {
    logoutMutation.mutate();
    setMobileMenuOpen(false);
  };
  
  // Handle scroll detection for header styling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Handle loading state with animated loader
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="cursor-pointer"
          onClick={() => navigate("/dashboard")}
        >
          <PicklePlusNewLogo height="56px" className="mb-6" preserveAspectRatio={true} />
        </motion.div>
        
        <div className="relative w-12 h-12">
          <motion.div 
            className="absolute inset-0 rounded-full border-4 border-[#FF5722]/20"
            animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <motion.div 
            className="absolute inset-0 rounded-full border-4 border-t-[#FF5722] border-r-transparent border-b-transparent border-l-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
        
        <motion.p 
          className="mt-4 text-gray-500 dark:text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 0.5 }}
        >
          Loading your dashboard...
        </motion.p>
      </div>
    );
  }
  
  // If no user, we shouldn't get here due to ProtectedRoute
  if (!user) {
    return null;
  }
  
  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen pb-32 relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 -right-40 w-80 h-80 bg-[#FF5722]/5 rounded-full blur-3xl"></div>
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-[#2196F3]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-[#673AB7]/5 rounded-full blur-3xl"></div>
      </div>
      
      {/* Top Navigation */}
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
            
            {/* User Profile - Now toggles the menu */}
            <motion.div 
              className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-full pl-1 pr-2 py-1 border border-gray-200 dark:border-gray-700 cursor-pointer"
              whileHover={{ scale: 1.02 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#2196F3] to-[#03A9F4] flex items-center justify-center text-sm font-medium text-white shadow-sm">
                {user.username.substring(0, 2).toUpperCase()}
              </div>
              {mobileMenuOpen ? (
                <X size={16} className="text-gray-600 dark:text-gray-300 ml-1" />
              ) : (
                <Menu size={16} className="text-gray-600 dark:text-gray-300 ml-1" />
              )}
            </motion.div>
          </div>
        </div>
        
        {/* Mobile Menu with Navigation Items */}
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
                  { label: 'Tournaments', icon: <Award size={18} />, path: '/tournaments' },
                  { label: 'Community', icon: <Users size={18} />, path: '/community' },
                  { label: 'Mastery Paths', icon: <Award size={18} />, path: '/mastery-paths' },
                  { label: 'PicklePass™', icon: <Ticket size={18} />, path: '/events/test' },
                  { label: 'Profile', icon: <UserIcon size={18} />, path: '/profile' },
                  { label: 'Settings', icon: <Settings size={18} />, path: '/settings' },
                  ...(user.isAdmin ? [{ label: 'Admin Panel', icon: <Shield size={18} />, path: '/admin/golden-ticket' }] : [])
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
                
                {/* Logout Button */}
                <motion.button 
                  className="flex items-center w-full py-3 px-4 mt-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 shadow-sm"
                  onClick={handleLogout}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  whileHover={{ x: 5 }}
                >
                  <span className="mr-3 text-red-500 dark:text-red-400">
                    <LogOut size={18} />
                  </span>
                  <span className="font-medium text-red-600 dark:text-red-400">
                    Logout
                  </span>
                </motion.button>
                
                {/* Search Box */}
                <div className="mt-4 flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden px-4 py-3 border border-gray-200 dark:border-gray-700 shadow-sm">
                  <Search size={18} className="text-gray-500 dark:text-gray-400 mr-2" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="bg-transparent border-none outline-none text-gray-600 dark:text-gray-300 w-full"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
      
      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 py-6 relative z-10">
        {children}
      </main>
      
      {/* Mobile Navigation */}
      <MobileNavigation user={user} />
    </div>
  );
}