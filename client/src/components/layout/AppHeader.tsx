/**
 * PKL-278651-UI-0001-STDHEAD
 * Standardized Application Header Component
 * 
 * A reusable header component that provides consistent navigation, notifications,
 * and user profile access across the application.
 * 
 * Important updates:
 * - 2025-04-21: Fixed mobile menu scroll issue by adding max-height and overflow-y-auto
 *   to allow scrolling when there are many menu items.
 * 
 * Menu behavior:
 * - Menu opens when clicking on the user avatar button
 * - Menu has a max height of 60% of viewport and becomes scrollable if content exceeds this
 * - Menu animates open/closed with framer-motion
 * - Selected items are highlighted with an orange indicator
 * 
 * @framework Framework5.2
 * @version 1.0.1
 * @lastModified 2025-04-21
 */

import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Menu,
  X,
  Search,
  Home,
  Calendar,
  Award,
  Users,
  Ticket,
  User as UserIcon,
  Settings,
  LogOut,
  Shield,
  Palette,
  Share,
  LifeBuoy,
  Building2,
  Compass
} from 'lucide-react';
import { LanguageAwareLogo } from '@/components/icons/LanguageAwareLogo';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';

// Import default avatar image
import defaultAvatarPath from "@assets/Untitled design (51).png";

interface AppHeaderProps {
  onLogout?: () => void;
  hideSearch?: boolean;
  hideNotifications?: boolean;
  customNavItems?: Array<{
    label: string;
    icon: React.ReactNode;
    path: string;
  }>;
}

export function AppHeader({
  onLogout,
  hideSearch = false,
  hideNotifications = false,
  customNavItems
}: AppHeaderProps) {
  const [, navigate] = useLocation();
  const location = useLocation()[0]; // Current path
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const isExtraSmallScreen = useMediaQuery('(max-width: 380px)');
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [localAvatarUrl, setLocalAvatarUrl] = useState<string | null>(null);

  // Get notification count
  const { data: notificationData } = useQuery({
    queryKey: ['/api/notifications/unread-count'],
    refetchInterval: 60000, // Refetch every minute
  });

  useEffect(() => {
    if (notificationData && typeof notificationData === 'object' && 'count' in notificationData) {
      const count = notificationData.count;
      if (typeof count === 'number') {
        setNotificationCount(count);
      }
    }
  }, [notificationData]);

  // Handle scroll event for header styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load avatar URL from localStorage
  useEffect(() => {
    if (user?.id) {
      const cachedAvatarUrl = localStorage.getItem(`user_avatar_${user.id}`);
      if (cachedAvatarUrl) {
        setLocalAvatarUrl(cachedAvatarUrl);
      } else if (user.avatarUrl) {
        // If no cached avatar but user has an avatarUrl, cache it for future use
        localStorage.setItem(`user_avatar_${user.id}`, user.avatarUrl);
        setLocalAvatarUrl(user.avatarUrl);
      } else {
        setLocalAvatarUrl(null);
      }
    }
  }, [user?.id, user?.avatarUrl]);

  // Handle logout
  const handleLogout = async () => {
    try {
      if (onLogout) {
        onLogout();
      } else {
        await logout();
        navigate('/auth');
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Default navigation items - reorganized for better UX
  const defaultNavItems = [
    { label: t('nav.dashboard'), icon: <Home size={18} />, path: '/dashboard' },
    { label: 'Features', icon: <Compass size={18} />, path: '/features' },
    { label: t('nav.matches'), icon: <Calendar size={18} />, path: '/matches' },
    { label: t('nav.communities'), icon: <Users size={18} />, path: '/communities' },
    { label: 'PCP Certification', icon: <Award size={18} />, path: '/pcp-certification' },
    { label: 'Development Hub', icon: <Building2 size={18} />, path: '/player-development-hub' },
    { label: t('nav.referrals'), icon: <Share size={18} />, path: '/referrals' },
    { label: t('settings.general'), icon: <Settings size={18} />, path: '/settings' },
    ...(user?.isAdmin ? [{ label: 'Admin Panel', icon: <Shield size={18} />, path: '/admin' }] : [])
  ];

  // Use custom nav items if provided, otherwise use default
  const navigationItems = customNavItems || defaultNavItems;

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 shadow-sm transition-all ${
        isScrolled ? 'shadow-md' : 'shadow-sm'
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
          <LanguageAwareLogo 
            height={isExtraSmallScreen ? "24px" : "32px"}
            width="auto"
            preserveAspectRatio={true}
            onClick={() => navigate("/dashboard")}
          />
        </motion.div>
        
        {/* Right side actions */}
        <div className="flex items-center justify-end gap-1 sm:gap-3">
          {/* Notification Bell */}
          {!hideNotifications && (
            <motion.button 
              className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                // Handle notification click - toggle notifications dropdown or navigate to notifications page
                navigate('/notifications');
              }}
              aria-label="View notifications"
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
          )}
          
          {/* User Profile - Now toggles the menu */}
          <motion.div 
            className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-full pl-1 pr-2 py-1 border border-gray-200 dark:border-gray-700 cursor-pointer"
            whileHover={{ scale: 1.02 }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {localAvatarUrl || user?.avatarUrl ? (
              <div className="w-8 h-8 rounded-full overflow-hidden shadow-sm">
                <img 
                  src={(localAvatarUrl || user?.avatarUrl) as string} 
                  alt={user?.username || ''} 
                  className="w-full h-full object-cover"
                  key={(localAvatarUrl || user?.avatarUrl) || 'avatar-key'} // Force re-render when URL changes
                />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full overflow-hidden shadow-sm bg-yellow-100">
                <img 
                  src={defaultAvatarPath} 
                  alt={user?.username || "User"} 
                  className="w-full h-full object-contain"
                  key="default-avatar"
                />
              </div>
            )}
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
            <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
              {/* Navigation Items */}
              {navigationItems.map((item, i) => {
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
                      // Close menu first before navigation to ensure UI is updated properly
                      setMobileMenuOpen(false);
                      // Use setTimeout to ensure the menu close animation completes
                      // before navigating, preventing UI conflicts
                      setTimeout(() => navigate(item.path), 300);
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
                  {t('nav.logout')}
                </span>
              </motion.button>
              
              {/* Search Box */}
              {!hideSearch && (
                <div className="mt-4 flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden px-4 py-3 border border-gray-200 dark:border-gray-700 shadow-sm">
                  <Search size={18} className="text-gray-500 dark:text-gray-400 mr-2" />
                  <input
                    type="text"
                    placeholder={t('action.search')}
                    className="bg-transparent border-none outline-none text-gray-600 dark:text-gray-300 w-full"
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}