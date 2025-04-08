import React, { ReactNode, useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { MobileNavigation } from './MobileNavigation';
import { User } from '@shared/schema';
import { motion } from 'framer-motion';
import { Bell, User as UserIcon, Menu, X, Search, Settings } from 'lucide-react';
import { OfficialPicklePlusLogo } from '@/components/icons/OfficialPicklePlusLogo';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
}

export function DashboardLayout({ children, title = 'Dashboard' }: DashboardLayoutProps) {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);
  
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
        >
          <OfficialPicklePlusLogo className="h-12 w-auto mb-6" />
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
          {/* Logo and Title Section */}
          <div className="flex items-center">
            <div className="flex items-center mr-3 sm:mr-6">
              <OfficialPicklePlusLogo className="h-8 w-auto hidden sm:block" />
              <div 
                className={`h-8 w-0.5 bg-gradient-to-b from-[#FF5722]/20 to-transparent mx-3 hidden sm:block ${
                  scrolled ? 'opacity-0' : 'opacity-100'
                } transition-opacity duration-300`}
              ></div>
            </div>
            
            <motion.h1 
              className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              {title}
            </motion.h1>
          </div>
          
          {/* Right side actions */}
          <div className="flex items-center gap-1 sm:gap-3">
            {/* Search Bar - Hidden on mobile */}
            <div className="hidden md:flex items-center bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden px-3 py-1.5 border border-gray-200 dark:border-gray-700">
              <Search size={16} className="text-gray-500 dark:text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent border-none outline-none text-sm text-gray-600 dark:text-gray-300 w-32 lg:w-48"
              />
            </div>
            
            {/* Notification Bell */}
            <motion.button 
              className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Bell size={18} className="text-gray-600 dark:text-gray-300" />
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
            
            {/* User Profile */}
            <motion.div 
              className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-full pl-1 pr-2 py-1 border border-gray-200 dark:border-gray-700"
              whileHover={{ scale: 1.02 }}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#2196F3] to-[#03A9F4] flex items-center justify-center text-sm font-medium text-white shadow-sm">
                {user.username.substring(0, 2).toUpperCase()}
              </div>
              <span className="text-sm font-medium hidden sm:inline-block text-gray-700 dark:text-gray-300">
                {user.displayName || user.username}
              </span>
            </motion.div>
            
            {/* Mobile Menu Toggle */}
            <motion.button 
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 block sm:hidden transition-colors duration-200"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {mobileMenuOpen ? (
                <X size={20} className="text-gray-600 dark:text-gray-300" />
              ) : (
                <Menu size={20} className="text-gray-600 dark:text-gray-300" />
              )}
            </motion.button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        <motion.div 
          className="sm:hidden overflow-hidden"
          initial={{ height: 0 }}
          animate={{ height: mobileMenuOpen ? 'auto' : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <div className="px-4 py-3 space-y-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg overflow-hidden px-3 py-2 border border-gray-200 dark:border-gray-700 shadow-sm">
              <Search size={16} className="text-gray-500 dark:text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent border-none outline-none text-sm text-gray-600 dark:text-gray-300 w-full"
              />
            </div>
            
            {[
              { label: 'Profile', icon: <UserIcon size={16} /> },
              { label: 'Settings', icon: <Settings size={16} /> }
            ].map((item, i) => (
              <motion.a 
                key={item.label}
                href="#" 
                className="flex items-center py-2 px-3 rounded-lg bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i }}
                whileHover={{ x: 5 }}
              >
                <span className="mr-3 text-gray-500 dark:text-gray-400">{item.icon}</span>
                <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
              </motion.a>
            ))}
          </div>
        </motion.div>
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