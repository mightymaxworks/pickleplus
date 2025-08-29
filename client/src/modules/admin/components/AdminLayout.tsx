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
import { Shield, Settings, LogOut, Home, ArrowLeft, Menu, X, HelpCircle, ChevronRight } from 'lucide-react';
import { useAdminNavItems, useCategorizedNavItems, NavCategory } from '../hooks/useAdminComponents';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useToast } from '@/hooks/use-toast';
import { 
  HelpProvider, 
  HelpButton, 
  AccessibilityProvider, 
  AccessibilityControls 
} from './ui';

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
  breadcrumbs?: BreadcrumbItem[];
}

export function AdminLayout({ children, title = 'Admin Dashboard', breadcrumbs = [] }: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const [location, navigate] = useLocation();
  const adminNavItems = useAdminNavItems();
  const categorizedNavItems = useCategorizedNavItems();
  const isSmallScreen = useMediaQuery('(max-width: 768px)');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
    // Handle header items differently (PKL-278651-ADMIN-0016-SYS-TOOLS)
    if (item.isHeader) {
      return (
        <div className="px-3 py-1 mt-4 mb-1 first:mt-0">
          <div className="flex items-center font-medium text-sm text-gray-500 dark:text-gray-400">
            <span className="mr-2">{item.icon}</span>
            <span>{item.label}</span>
          </div>
        </div>
      );
    }
    
    // Guard against incomplete or malformed nav items
    if (!item) {
      console.warn('Navigation item is undefined or null');
      return null;
    }
    
    if (!item.path && !item.label) {
      console.warn('Incomplete navigation item detected (missing both path and label):', item);
      return null;
    }
    
    const isActive = location === item.path;
    
    return (
      <Button
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
        <span className={`${isMobile ? 'mr-1' : 'mr-3'}`}>{item.icon || <Shield size={18} />}</span>
        <span>{item.label || 'Menu Item'}</span>
        
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
                {/* Hamburger menu - always visible for admin navigation */}
                <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="mr-2">
                      <Menu size={20} />
                    </Button>
                  </SheetTrigger>
                    <SheetContent side="left" className="w-[260px] sm:w-[300px] p-0">
                      <div className="px-4 py-4 flex items-center border-b border-gray-200 dark:border-gray-700">
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
                                  <NavItem key={item.path || `dashboard-mobile-${item.label || Math.random().toString(36).substring(2, 9)}`} item={item} isMobile={true} />
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
                                  <NavItem key={item.path || `user-mgmt-mobile-${item.label || Math.random().toString(36).substring(2, 9)}`} item={item} isMobile={true} />
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
                                  <NavItem key={item.path || `events-mobile-${item.label || Math.random().toString(36).substring(2, 9)}`} item={item} isMobile={true} />
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
                                  <NavItem key={item.path || `game-mobile-${item.label || Math.random().toString(36).substring(2, 9)}`} item={item} isMobile={true} />
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
                                  <NavItem key={item.path || `content-mobile-${item.label || Math.random().toString(36).substring(2, 9)}`} item={item} isMobile={true} />
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
                                  <NavItem key={item.path || `other-mobile-${item.label || Math.random().toString(36).substring(2, 9)}`} item={item} isMobile={true} />
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
                                  <NavItem key={item.path || `system-mobile-${item.label || Math.random().toString(36).substring(2, 9)}`} item={item} isMobile={true} />
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
                  onClick={() => logout()}
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
          
          {/* Breadcrumbs - Show when available */}
          {breadcrumbs.length > 0 && (
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <div className="container mx-auto px-4 py-2">
                <div className="flex items-center text-sm">
                  {breadcrumbs.map((item, index) => (
                    <div key={item.href} className="flex items-center">
                      {index > 0 && (
                        <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
                      )}
                      <Button
                        variant="link"
                        className="p-0 h-auto text-sm font-medium"
                        onClick={() => navigate(item.href)}
                      >
                        {item.label}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Full Width Main Content */}
          <div className="flex-1 container mx-auto px-2 sm:px-4 py-3 sm:py-4">
            {/* Main content area - Full width */}
            <div className="w-full">
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

          {/* Hamburger Menu Overlay */}
          <Dialog open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Admin Navigation</span>
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {/* Dashboard Section */}
                {categorizedNavItems[NavCategory.DASHBOARD].length > 0 && (
                  <div>
                    <h3 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">
                      Dashboard
                    </h3>
                    <div className="space-y-1">
                      {categorizedNavItems[NavCategory.DASHBOARD]
                        .filter(item => !item.metadata?.desktopVisible === false)
                        .map((item) => (
                          <Button
                            key={item.path || `dashboard-mobile-${item.label || Math.random().toString(36).substring(2, 9)}`}
                            variant="ghost"
                            className="w-full justify-start text-left"
                            onClick={() => {
                              if (item.path) {
                                navigate(item.path);
                                setIsMobileMenuOpen(false);
                              }
                            }}
                          >
                            {item.icon && <span className="mr-2 h-4 w-4 flex items-center justify-center">{item.icon}</span>}
                            {item.label}
                          </Button>
                        ))
                      }
                    </div>
                  </div>
                )}

                {/* Events Section */}
                {categorizedNavItems[NavCategory.EVENTS].length > 0 && (
                  <div>
                    <h3 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">
                      Events
                    </h3>
                    <div className="space-y-1">
                      {categorizedNavItems[NavCategory.EVENTS]
                        .filter(item => !item.metadata?.desktopVisible === false)
                        .map((item) => (
                          <Button
                            key={item.path || `events-mobile-${item.label || Math.random().toString(36).substring(2, 9)}`}
                            variant="ghost"
                            className="w-full justify-start text-left"
                            onClick={() => {
                              if (item.path) {
                                navigate(item.path);
                                setIsMobileMenuOpen(false);
                              }
                            }}
                          >
                            {item.icon && <span className="mr-2 h-4 w-4 flex items-center justify-center">{item.icon}</span>}
                            {item.label}
                          </Button>
                        ))
                      }
                    </div>
                  </div>
                )}

                {/* Users Section */}
                {categorizedNavItems[NavCategory.USER_MANAGEMENT].length > 0 && (
                  <div>
                    <h3 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">
                      User Management
                    </h3>
                    <div className="space-y-1">
                      {categorizedNavItems[NavCategory.USER_MANAGEMENT].map((item) => (
                        <Button
                          key={item.path || `users-mobile-${item.label || Math.random().toString(36).substring(2, 9)}`}
                          variant="ghost"
                          className="w-full justify-start text-left"
                          onClick={() => {
                            if (item.path) {
                              navigate(item.path);
                              setIsMobileMenuOpen(false);
                            }
                          }}
                        >
                          {item.icon && <span className="mr-2 h-4 w-4 flex items-center justify-center">{item.icon}</span>}
                          {item.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tools Section */}
                {(categorizedNavItems[NavCategory.GAME].length > 0 || categorizedNavItems[NavCategory.CONTENT].length > 0 || categorizedNavItems[NavCategory.OTHER].length > 0) && (
                  <div>
                    <h3 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">
                      Tools & Content
                    </h3>
                    <div className="space-y-1">
                      {[...categorizedNavItems[NavCategory.GAME], ...categorizedNavItems[NavCategory.CONTENT], ...categorizedNavItems[NavCategory.OTHER]].map((item) => (
                        <Button
                          key={item.path || `tools-mobile-${item.label || Math.random().toString(36).substring(2, 9)}`}
                          variant="ghost"
                          className="w-full justify-start text-left"
                          onClick={() => {
                            if (item.path) {
                              navigate(item.path);
                              setIsMobileMenuOpen(false);
                            }
                          }}
                        >
                          {item.icon && <span className="mr-2 h-4 w-4 flex items-center justify-center">{item.icon}</span>}
                          {item.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* System Section */}
                {categorizedNavItems[NavCategory.SYSTEM].length > 0 && (
                  <div>
                    <h3 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">
                      System
                    </h3>
                    <div className="space-y-1">
                      {categorizedNavItems[NavCategory.SYSTEM].map((item) => (
                        <Button
                          key={item.path || `system-mobile-${item.label || Math.random().toString(36).substring(2, 9)}`}
                          variant="ghost"
                          className="w-full justify-start text-left"
                          onClick={() => {
                            if (item.path) {
                              navigate(item.path);
                              setIsMobileMenuOpen(false);
                            }
                          }}
                        >
                          {item.icon && <span className="mr-2 h-4 w-4 flex items-center justify-center">{item.icon}</span>}
                          {item.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      navigate('/admin/settings');
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Admin Settings
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </HelpProvider>
    </AccessibilityProvider>
  );
}