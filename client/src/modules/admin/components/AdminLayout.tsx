/**
 * PKL-278651-ADMIN-0001-CORE
 * Admin Layout Component
 * 
 * This component provides the layout structure for the admin dashboard
 * and renders the registered navigation items.
 */

import React, { ReactNode } from 'react';
import { useLocation, Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { Separator } from '@/components/ui/separator';
import { Shield, Settings, LogOut, Home, ArrowLeft } from 'lucide-react';
import { useAdminNavItems } from '../hooks/useAdminComponents';
import { PicklePlusNewLogo } from '@/components/icons/PicklePlusNewLogo';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
}

export function AdminLayout({ children, title = 'Admin Dashboard' }: AdminLayoutProps) {
  const { user, logoutMutation } = useAuth();
  const [location, navigate] = useLocation();
  const adminNavItems = useAdminNavItems();
  const isSmallScreen = useMediaQuery('(max-width: 768px)');
  
  // If not authorized, redirect to main page
  if (!user?.isAdmin) {
    navigate('/');
    return null;
  }
  
  // Default admin nav items if none registered yet
  const defaultNavItems = [
    { 
      label: 'Dashboard', 
      path: '/admin', 
      icon: <Home size={18} />, 
      order: 0 
    }
  ];
  
  // Combine default items with registered items
  const navItems = [
    ...defaultNavItems,
    ...adminNavItems
  ].sort((a, b) => a.order - b.order);

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen flex flex-col">
      {/* Admin Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <a className="flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors">
                <ArrowLeft size={16} className="mr-1" />
                <span className="text-sm">Back to App</span>
              </a>
            </Link>
            
            <Separator orientation="vertical" className="h-6" />
            
            <div className="flex items-center">
              <Shield size={20} className="text-[#FF5722] mr-2" />
              <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {title}
              </h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              <span className="font-medium">{user?.username}</span>
              <span className="mx-2">•</span>
              <span className="text-[#FF5722]">Admin</span>
            </div>
            
            <button 
              onClick={() => logoutMutation.mutate()}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>
      
      {/* Main Content with Sidebar */}
      <div className="flex flex-1 container mx-auto px-4 py-6">
        {/* Admin Sidebar - Hidden on mobile */}
        {!isSmallScreen && (
          <div className="w-64 shrink-0 mr-8">
            <nav className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 sticky top-24">
              <div className="space-y-1">
                {navItems.map((item) => {
                  const isActive = location === item.path;
                  
                  return (
                    <Link key={item.path} href={item.path}>
                      <a className={`
                        flex items-center px-4 py-3 rounded-md transition-colors
                        ${isActive 
                          ? 'bg-[#FF5722]/10 text-[#FF5722] font-medium' 
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}
                      `}>
                        <span className="mr-3">{item.icon}</span>
                        <span>{item.label}</span>
                        
                        {isActive && (
                          <motion.div 
                            className="ml-auto w-1 h-6 bg-[#FF5722] rounded-full"
                            layoutId="adminNavIndicator"
                          />
                        )}
                      </a>
                    </Link>
                  );
                })}
              </div>
              
              <Separator className="my-4" />
              
              <Link href="/admin/settings">
                <a className="flex items-center px-4 py-3 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <Settings size={18} className="mr-3" />
                  <span>Admin Settings</span>
                </a>
              </Link>
            </nav>
          </div>
        )}
        
        {/* Mobile Navigation - Only visible on small screens */}
        {isSmallScreen && (
          <div className="w-full mb-4">
            <nav className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-auto">
              <div className="flex space-x-1">
                {navItems.map((item) => {
                  const isActive = location === item.path;
                  
                  return (
                    <Link key={item.path} href={item.path}>
                      <a className={`
                        flex items-center whitespace-nowrap px-3 py-2 rounded-md transition-colors text-sm
                        ${isActive 
                          ? 'bg-[#FF5722]/10 text-[#FF5722] font-medium' 
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}
                      `}>
                        <span className="mr-1">{item.icon}</span>
                        <span>{item.label}</span>
                      </a>
                    </Link>
                  );
                })}
                
                <Link href="/admin/settings">
                  <a className="flex items-center whitespace-nowrap px-3 py-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm">
                    <Settings size={16} className="mr-1" />
                    <span>Settings</span>
                  </a>
                </Link>
              </div>
            </nav>
          </div>
        )}
        
        {/* Main Content Area */}
        <div className={`${isSmallScreen ? 'w-full' : 'flex-1'}`}>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <AnimatePresence mode="wait">
              <motion.div
                key={location}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}