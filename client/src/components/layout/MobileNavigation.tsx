/**
 * PKL-278651-UI-0001-MOBNAV
 * Mobile Navigation Component
 * 
 * A bottom navigation bar for mobile devices that provides quick access
 * to the most important parts of the application.
 * 
 * @framework Framework5.3
 * @version 2.0.0
 * @lastModified 2025-06-27
 */

import React from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Home, Calendar, Users, Award, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useMediaQuery } from '@/hooks/use-media-query';

export function MobileNavigation() {
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Don't render on desktop
  if (!isMobile) return null;

  const navItems = [
    { 
      icon: <Home size={20} />, 
      label: 'Home', 
      path: '/dashboard',
      id: 'home'
    },
    { 
      icon: <Calendar size={20} />, 
      label: 'Matches', 
      path: '/matches',
      id: 'matches'
    },
    { 
      icon: <Users size={20} />, 
      label: 'Community', 
      path: '/communities',
      id: 'community'
    },
    { 
      icon: <Award size={20} />, 
      label: 'Coaching', 
      path: '/pcp-certification',
      id: 'coaching'
    },
    { 
      icon: <User size={20} />, 
      label: 'Profile', 
      path: '/profile',
      id: 'profile'
    }
  ];

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location === '/' || location === '/dashboard';
    }
    return location.startsWith(path);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <motion.div 
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 px-2 py-1 safe-area-pb"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <nav className="flex justify-around items-center">
        {navItems.map((item) => {
          const active = isActive(item.path);
          
          return (
            <motion.button
              key={item.id}
              onClick={() => handleNavigation(item.path)}
              className={`flex flex-col items-center justify-center p-2 min-w-[60px] relative ${
                active ? 'text-[#FF5722]' : 'text-gray-500'
              }`}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.1 }}
            >
              {/* Active indicator */}
              {active && (
                <motion.div
                  className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-[#FF5722] rounded-full"
                  layoutId="activeIndicator"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              
              {/* Icon */}
              <motion.div
                className="mb-1"
                animate={{ 
                  scale: active ? 1.1 : 1,
                  color: active ? '#FF5722' : '#6B7280'
                }}
                transition={{ duration: 0.2 }}
              >
                {item.icon}
              </motion.div>
              
              {/* Label */}
              <span 
                className={`text-xs font-medium leading-none ${
                  active ? 'text-[#FF5722]' : 'text-gray-500'
                }`}
              >
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </nav>
    </motion.div>
  );
}