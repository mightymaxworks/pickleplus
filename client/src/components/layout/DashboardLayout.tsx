/**
 * PKL-278651-UIFIX-0002-NAV
 * Updated DashboardLayout Component
 * Implementation timestamp: 2025-04-21 04:01 ET
 * 
 * DashboardLayout updated to use standardized AppHeader component
 * 
 * Framework 5.2 compliant implementation
 */

import React, { ReactNode, useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { MobileNavigation } from './MobileNavigation';
import { motion } from 'framer-motion';
import { PicklePlusNewLogo } from '../icons/PicklePlusNewLogo';
import { AppHeader } from './AppHeader';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, isLoading } = useAuth();
  const [notificationCount, setNotificationCount] = useState(0);
  
  // Query server for notification count
  const { data: serverNotificationCount } = useQuery({
    queryKey: ['/api/notifications/unread-count'],
    queryFn: async () => {
      console.log('[DashboardLayout] Fetching notification count from server');
      const response = await apiRequest('GET', '/api/notifications/unread-count');
      const data = await response.json();
      console.log('[DashboardLayout] Server notification count:', data);
      return data.count || 0;
    },
    enabled: !!user,
    refetchInterval: 5000 // Refetch every 5 seconds
  });
  
  // Update notification count when data changes
  useEffect(() => {
    if (serverNotificationCount !== undefined) {
      setNotificationCount(serverNotificationCount);
    }
  }, [serverNotificationCount]);
  
  const [, navigate] = useLocation();
  
  // Handle loading state with animated loader
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="cursor-pointer"
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
      
      {/* Standardized AppHeader Component */}
      <AppHeader />
      
      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 py-6 relative z-10">
        {children}
      </main>
      
      {/* Mobile Navigation */}
      <MobileNavigation user={user} />
    </div>
  );
}