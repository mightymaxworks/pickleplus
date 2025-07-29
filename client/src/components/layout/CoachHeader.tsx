/**
 * Coach-Specific Header Component with Branding and Navigation
 * Addresses user concerns about coach accessibility, UX friendliness, and branding
 */

import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  Bell,
  Menu,
  X,
  Users,
  Target,
  BarChart3,
  Settings,
  BookOpen,
  Calendar,
  User,
  LogOut,
  Home,
  ChevronDown,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { motion, AnimatePresence } from 'framer-motion';

// Import Pickle+ logo from attached assets
import pickleLogoPath from "@assets/Pickle (950 x 500 px)_1750986917966.png";

interface CoachHeaderProps {
  currentPage?: string;
  showBranding?: boolean;
}

export function CoachHeader({ currentPage = 'Dashboard', showBranding = true }: CoachHeaderProps) {
  const [, navigate] = useLocation();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationCount] = useState(3);

  // Coach navigation items
  const coachNavItems = [
    {
      label: 'Coach Dashboard',
      icon: <Home className="h-4 w-4" />,
      path: '/coach',
      description: 'Overview and quick actions'
    },
    {
      label: 'Assessment Analysis',
      icon: <BarChart3 className="h-4 w-4" />,
      path: '/coach/assessment-analysis-dashboard',
      description: '4-dimensional PCP analysis'
    },
    {
      label: 'Smart Goal Creation',
      icon: <Target className="h-4 w-4" />,
      path: '/coach/intelligent-goal-creation-form',
      description: 'AI-powered goal generation'
    },
    {
      label: 'Progress Tracking',
      icon: <BarChart3 className="h-4 w-4" />,
      path: '/coach/progress-tracking-integration',
      description: 'Real-time student progress'
    },
    {
      label: 'Advanced Analytics',
      icon: <BarChart3 className="h-4 w-4" />,
      path: '/coach/advanced-analytics-dashboard',
      description: 'Performance insights & AI recommendations'
    },
    {
      label: 'Automated Workflows',
      icon: <Zap className="h-4 w-4" />,
      path: '/coach/automated-workflows',
      description: 'Smart milestone management'
    },
    {
      label: 'Guided Journey',
      icon: <BookOpen className="h-4 w-4" />,
      path: '/coach/comprehensive-guided-journey',
      description: 'Complete workflow integration'
    }
  ];

  // Quick actions for coaches
  const quickActions = [
    {
      label: 'New Assessment',
      icon: <BarChart3 className="h-3 w-3" />,
      path: '/coach/assessment-analysis-dashboard',
      color: 'bg-blue-500'
    },
    {
      label: 'Create Goals',
      icon: <Target className="h-3 w-3" />,
      path: '/coach/intelligent-goal-creation-form',
      color: 'bg-green-500'
    },
    {
      label: 'View Analytics',
      icon: <BarChart3 className="h-3 w-3" />,
      path: '/coach/advanced-analytics-dashboard',
      color: 'bg-purple-500'
    }
  ];

  const getCurrentPageTitle = () => {
    const item = coachNavItems.find(item => item.path === location);
    return item?.label || currentPage;
  };

  return (
    <>
      {/* Main Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          
          {/* Left Section - Branding and Navigation */}
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Pickle+ Branding */}
            {showBranding && (
              <Link href="/">
                <div className="flex items-center gap-3 cursor-pointer">
                  <img 
                    src={pickleLogoPath} 
                    alt="Pickle+ Logo" 
                    className="h-8 w-8 rounded-lg"
                  />
                  <div className="hidden sm:block">
                    <div className="text-xl font-bold">
                      <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                        Pickle+
                      </span>
                      <span className="text-purple-600 ml-1 text-sm font-medium">
                        Coach
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* Current Page Title */}
            <div className="hidden md:block">
              <div className="text-lg font-semibold text-gray-900">
                {getCurrentPageTitle()}
              </div>
              <div className="text-xs text-gray-500">
                Professional Coaching Platform
              </div>
            </div>
          </div>

          {/* Center Section - Coach Navigation (Desktop) */}
          <div className="hidden lg:flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <BookOpen className="h-4 w-4" />
                  Coach Tools
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-80">
                <DropdownMenuLabel>Coaching Features</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {coachNavItems.map((item) => (
                  <DropdownMenuItem key={item.path} asChild>
                    <Link href={item.path}>
                      <div className="flex items-center gap-3 w-full p-2">
                        <div className="p-1 rounded bg-blue-50">
                          {item.icon}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{item.label}</div>
                          <div className="text-xs text-gray-500">{item.description}</div>
                        </div>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Right Section - Quick Actions and User */}
          <div className="flex items-center gap-3">
            {/* Quick Actions */}
            <div className="hidden md:flex items-center gap-2">
              {quickActions.map((action) => (
                <Link key={action.path} href={action.path}>
                  <Button size="sm" variant="outline" className="gap-2">
                    <div className={`p-1 rounded ${action.color}`}>
                      <div className="text-white">{action.icon}</div>
                    </div>
                    {action.label}
                  </Button>
                </Link>
              ))}
            </div>

            {/* Notifications */}
            <div className="relative">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
                {notificationCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500">
                    {notificationCount}
                  </Badge>
                )}
              </Button>
            </div>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="hidden sm:block font-medium text-sm">Coach</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Coach Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* Mobile Quick Actions Bar */}
        <div className="md:hidden border-t bg-gray-50 px-4 py-2">
          <div className="flex gap-2 overflow-x-auto">
            {quickActions.map((action) => (
              <Link key={action.path} href={action.path}>
                <Button size="sm" variant="outline" className="gap-2 whitespace-nowrap">
                  <div className={`p-1 rounded ${action.color}`}>
                    <div className="text-white">{action.icon}</div>
                  </div>
                  {action.label}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 md:hidden"
          >
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/50"
              onClick={() => setMobileMenuOpen(false)}
            />
            
            {/* Menu Panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="absolute left-0 top-0 h-full w-80 bg-white shadow-xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-3">
                  <img 
                    src={pickleLogoPath} 
                    alt="Pickle+ Logo" 
                    className="h-8 w-8 rounded-lg"
                  />
                  <div className="text-lg font-bold">
                    <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                      Pickle+
                    </span>
                    <span className="text-purple-600 ml-1 text-sm">Coach</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Navigation Items */}
              <div className="p-4 space-y-2">
                {coachNavItems.map((item) => (
                  <Link key={item.path} href={item.path}>
                    <div 
                      className={`flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer ${
                        location === item.path 
                          ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className={`p-2 rounded ${
                        location === item.path ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        {item.icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{item.label}</div>
                        <div className="text-xs text-gray-500">{item.description}</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}