/**
 * PKL-278651-UI-0001-MOBNAV
 * Mobile Navigation Component
 * 
 * A bottom navigation bar for mobile devices that provides quick access
 * to the most important parts of the application.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

import React from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Home, Calendar, Users, Award, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

// No props needed as we get the user from useAuth hook

export function MobileNavigation() {
  const [location, navigate] = useLocation();
  const { user } = useAuth();

  const navItems = [
    { icon: <Home size={20} />, label: 'Home', path: '/dashboard' },
    { icon: <Calendar size={20} />, label: 'Matches', path: '/matches' },
    { icon: <Users size={20} />, label: 'Communities', path: '/communities' },
    { icon: <Award size={20} />, label: 'Mastery', path: '/mastery-paths' },
    { icon: <User size={20} />, label: 'Profile', path: '/profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 md:hidden">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = location === item.path;
          
          return (
            <motion.button
              key={item.path}
              className="flex flex-col items-center justify-center w-full h-full"
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate(item.path)}
            >
              <div 
                className={`flex flex-col items-center justify-center ${
                  isActive ? 'text-[#FF5722]' : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {item.icon}
                <span className="text-xs mt-1">{item.label}</span>
                
                {isActive && (
                  <motion.div 
                    className="absolute bottom-0 w-6 h-1 bg-[#FF5722] rounded-t-full"
                    layoutId="mobileNavIndicator"
                  />
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}