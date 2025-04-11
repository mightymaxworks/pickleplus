/**
 * PKL-278651-ADMIN-0014-UX
 * Enhanced Admin Layout Component
 * 
 * This component provides the layout structure for the admin dashboard
 * and renders the registered navigation items.
 * Optimized for both mobile and desktop viewports with consistent navigation patterns.
 * Now enhanced with better UX features, help system, and accessibility improvements.
 */

import React, { ReactNode, useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { Separator } from '@/components/ui/separator';
import { Shield, Settings, LogOut, Home, ArrowLeft, Menu, X, HelpCircle } from 'lucide-react';
import { useAdminNavItems, useCategorizedNavItems, NavCategory } from '../hooks/useAdminComponents';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useToast } from '@/hooks/use-toast';
import { 
  HelpProvider, 
  HelpButton, 
  AccessibilityProvider, 
  AccessibilityControls 
} from './ui';

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
}

export function AdminLayout({ children, title = 'Admin Dashboard' }: AdminLayoutProps) {
  const { user, logoutMutation } = useAuth();
  const [location, navigate] = useLocation();
  const adminNavItems = useAdminNavItems();
  const categorizedNavItems = useCategorizedNavItems();
  const isSmallScreen = useMediaQuery('(max-width: 768px)');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast } = useToast();
  
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

  // Track current location for help context
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Update document title with current section
      document.title = `Admin | ${title}`;
    }
  }, [title]);

  // Create a navigation item component to avoid duplication
  const NavItem = ({ item, isMobile = false }: { item: any, isMobile?: boolean }) => {
    const isActive = location === item.path;
    
    return (
      <Button
        key={item.path}
        variant="ghost"
        className={`
          justify-start w-full px-4 py-3 rounded-md transition-colors
          ${isActive 
            ? 'bg-[#FF5722]/10 text-[#FF5722] font-medium' 
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}
          ${isMobile ? 'text-sm py-2 px-3' : ''}
        `}
        onClick={() => {
          navigate(item.path);
          if (isMobile) setSidebarOpen(false);
        }}
      >
        <span className={`${isMobile ? 'mr-1' : 'mr-3'}`}>{item.icon}</span>
        <span>{item.label}</span>
        
        {isActive && !isMobile && (
          <motion.div 
            className="ml-auto w-1 h-6 bg-[#FF5722] rounded-full"
            layoutId="adminNavIndicator"
          />
        )}
      </Button>
    );
  };

  return (
    <AccessibilityProvider>
      <HelpProvider>
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen flex flex-col">
          {/* Admin Header */}
          <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {isSmallScreen && (
                  <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="icon" className="mr-2">
                        <Menu size={20} />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[260px] sm:w-[300px] p-0">
                      <div className="px-4 py-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
                        <div 
                          className="flex items-center cursor-pointer" 
                          onClick={() => {
                            navigate('/admin');
                            setSidebarOpen(false);
                          }}
                        >
                          <Shield size={20} className="text-[#FF5722] mr-2" />
                          <h2 className="font-semibold">Admin Panel</h2>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                          <X size={18} />
                        </Button>
                      </div>
                      <div className="px-2 py-4">
                        <nav className="space-y-4">
                          {/* Categorized Mobile Navigation */}
                          {categorizedNavItems[NavCategory.DASHBOARD].length > 0 && (
                            <div>
                              <h3 className="font-medium text-xs uppercase text-gray-500 dark:text-gray-400 mb-1 px-2">
                                Dashboard
                              </h3>
                              <div className="space-y-1">
                                {categorizedNavItems[NavCategory.DASHBOARD].map((item) => (
                                  <NavItem key={item.path} item={item} isMobile={true} />
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {categorizedNavItems[NavCategory.USER_MANAGEMENT].length > 0 && (
                            <div>
                              <h3 className="font-medium text-xs uppercase text-gray-500 dark:text-gray-400 mb-1 px-2">
                                User Management
                              </h3>
                              <div className="space-y-1">
                                {categorizedNavItems[NavCategory.USER_MANAGEMENT].map((item) => (
                                  <NavItem key={item.path} item={item} isMobile={true} />
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {categorizedNavItems[NavCategory.EVENTS].length > 0 && (
                            <div>
                              <h3 className="font-medium text-xs uppercase text-gray-500 dark:text-gray-400 mb-1 px-2">
                                Events
                              </h3>
                              <div className="space-y-1">
                                {categorizedNavItems[NavCategory.EVENTS].map((item) => (
                                  <NavItem key={item.path} item={item} isMobile={true} />
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {categorizedNavItems[NavCategory.GAME].length > 0 && (
                            <div>
                              <h3 className="font-medium text-xs uppercase text-gray-500 dark:text-gray-400 mb-1 px-2">
                                Game Management
                              </h3>
                              <div className="space-y-1">
                                {categorizedNavItems[NavCategory.GAME].map((item) => (
                                  <NavItem key={item.path} item={item} isMobile={true} />
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {categorizedNavItems[NavCategory.CONTENT].length > 0 && (
                            <div>
                              <h3 className="font-medium text-xs uppercase text-gray-500 dark:text-gray-400 mb-1 px-2">
                                Content
                              </h3>
                              <div className="space-y-1">
                                {categorizedNavItems[NavCategory.CONTENT].map((item) => (
                                  <NavItem key={item.path} item={item} isMobile={true} />
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {categorizedNavItems[NavCategory.OTHER].length > 0 && (
                            <div>
                              <h3 className="font-medium text-xs uppercase text-gray-500 dark:text-gray-400 mb-1 px-2">
                                Other
                              </h3>
                              <div className="space-y-1">
                                {categorizedNavItems[NavCategory.OTHER].map((item) => (
                                  <NavItem key={item.path} item={item} isMobile={true} />
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {categorizedNavItems[NavCategory.SYSTEM].length > 0 && (
                            <div>
                              <h3 className="font-medium text-xs uppercase text-gray-500 dark:text-gray-400 mb-1 px-2">
                                System
                              </h3>
                              <div className="space-y-1">
                                {categorizedNavItems[NavCategory.SYSTEM].map((item) => (
                                  <NavItem key={item.path} item={item} isMobile={true} />
                                ))}
                              </div>
                            </div>
                          )}
                          
                          <div>
                            <Separator className="mb-2" />
                            <Button
                              variant="ghost"
                              className="justify-start w-full text-sm py-2 px-3 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                              onClick={() => {
                                navigate('/admin/settings');
                                setSidebarOpen(false);
                              }}
                            >
                              <Settings size={16} className="mr-1" />
                              <span>Settings</span>
                            </Button>
                          </div>
                        </nav>
                      </div>
                    </SheetContent>
                  </Sheet>
                )}
                
                <Button
                  variant="ghost"
                  className="flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors p-1.5"
                  onClick={() => navigate('/dashboard')}
                >
                  <ArrowLeft size={16} className="mr-1" />
                  <span className="text-sm">Back to App</span>
                </Button>
                
                {!isSmallScreen && (
                  <>
                    <Separator orientation="vertical" className="h-6" />
                    
                    <div 
                      className="flex items-center cursor-pointer" 
                      onClick={() => navigate('/admin')}
                    >
                      <Shield size={20} className="text-[#FF5722] mr-2" />
                      <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        {title}
                      </h1>
                    </div>
                  </>
                )}
              </div>
              
              <div className="flex items-center space-x-4">
                {!isSmallScreen && (
                  <div className="mr-2">
                    <AccessibilityControls />
                  </div>
                )}
                
                <div className="mr-2">
                  <HelpButton />
                </div>
                
                <div className={`text-sm text-gray-600 dark:text-gray-300 ${isSmallScreen ? 'hidden sm:block' : ''}`}>
                  <span className="font-medium">{user?.username}</span>
                  <span className="mx-2">•</span>
                  <span className="text-[#FF5722]">Admin</span>
                </div>
                
                <Button 
                  variant="ghost"
                  size="icon"
                  onClick={() => logoutMutation.mutate()}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                >
                  <LogOut size={18} />
                </Button>
              </div>
            </div>
            
            {/* Mobile Title Bar - Only on small screens */}
            {isSmallScreen && (
              <div className="container mx-auto px-4 py-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <div 
                    className="flex items-center cursor-pointer" 
                    onClick={() => navigate('/admin')}
                  >
                    <Shield size={18} className="text-[#FF5722] mr-2" />
                    <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {title}
                    </h1>
                  </div>
                  
                  <div className="flex items-center">
                    <AccessibilityControls />
                  </div>
                </div>
              </div>
            )}
          </header>
          
          {/* Main Content with Sidebar */}
          <div className="flex flex-1 container mx-auto px-2 sm:px-4 py-3 sm:py-4">
            {/* Admin Sidebar - Hidden on mobile */}
            {!isSmallScreen && (
              <div className="w-64 shrink-0 mr-6">
                <nav className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 sticky top-24 admin-sidebar">
                  {/* Categorized Navigation */}
                  {categorizedNavItems[NavCategory.DASHBOARD].length > 0 && (
                    <div className="mb-4">
                      <h3 className="font-medium text-xs uppercase text-gray-500 dark:text-gray-400 mb-2 px-2">
                        Dashboard
                      </h3>
                      <div className="space-y-1">
                        {categorizedNavItems[NavCategory.DASHBOARD].map((item) => (
                          <NavItem key={item.path} item={item} />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {categorizedNavItems[NavCategory.USER_MANAGEMENT].length > 0 && (
                    <div className="mb-4">
                      <h3 className="font-medium text-xs uppercase text-gray-500 dark:text-gray-400 mb-2 px-2">
                        User Management
                      </h3>
                      <div className="space-y-1">
                        {categorizedNavItems[NavCategory.USER_MANAGEMENT].map((item) => (
                          <NavItem key={item.path} item={item} />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {categorizedNavItems[NavCategory.EVENTS].length > 0 && (
                    <div className="mb-4">
                      <h3 className="font-medium text-xs uppercase text-gray-500 dark:text-gray-400 mb-2 px-2">
                        Events
                      </h3>
                      <div className="space-y-1">
                        {categorizedNavItems[NavCategory.EVENTS].map((item) => (
                          <NavItem key={item.path} item={item} />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {categorizedNavItems[NavCategory.GAME].length > 0 && (
                    <div className="mb-4">
                      <h3 className="font-medium text-xs uppercase text-gray-500 dark:text-gray-400 mb-2 px-2">
                        Game Management
                      </h3>
                      <div className="space-y-1">
                        {categorizedNavItems[NavCategory.GAME].map((item) => (
                          <NavItem key={item.path} item={item} />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {categorizedNavItems[NavCategory.CONTENT].length > 0 && (
                    <div className="mb-4">
                      <h3 className="font-medium text-xs uppercase text-gray-500 dark:text-gray-400 mb-2 px-2">
                        Content
                      </h3>
                      <div className="space-y-1">
                        {categorizedNavItems[NavCategory.CONTENT].map((item) => (
                          <NavItem key={item.path} item={item} />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {categorizedNavItems[NavCategory.OTHER].length > 0 && (
                    <div className="mb-4">
                      <h3 className="font-medium text-xs uppercase text-gray-500 dark:text-gray-400 mb-2 px-2">
                        Other
                      </h3>
                      <div className="space-y-1">
                        {categorizedNavItems[NavCategory.OTHER].map((item) => (
                          <NavItem key={item.path} item={item} />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {categorizedNavItems[NavCategory.SYSTEM].length > 0 && (
                    <div className="mb-4">
                      <h3 className="font-medium text-xs uppercase text-gray-500 dark:text-gray-400 mb-2 px-2">
                        System
                      </h3>
                      <div className="space-y-1">
                        {categorizedNavItems[NavCategory.SYSTEM].map((item) => (
                          <NavItem key={item.path} item={item} />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <Separator className="my-4" />
                  
                  <Button
                    variant="ghost"
                    className="justify-start w-full px-4 py-3 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => navigate('/admin/settings')}
                  >
                    <Settings size={18} className="mr-3" />
                    <span>Admin Settings</span>
                  </Button>
                </nav>
              </div>
            )}
            
            {/* Main content area */}
            <div className={`${isSmallScreen ? 'w-full' : 'flex-1'}`}>
              <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={location}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="w-full overflow-x-auto"
                  >
                    {children}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </HelpProvider>
    </AccessibilityProvider>
  );
}