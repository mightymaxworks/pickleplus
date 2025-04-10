/**
 * PKL-278651-UI-0001-NAV
 * Header Navigation Component
 * 
 * Consistent header navigation menu component used across the platform
 */

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  Trophy, 
  Users, 
  TrendingUp, 
  BarChart3, 
  User, 
  Settings, 
  LogOut,
  Ticket,
  ShieldCheck,
  Bell
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useAuth } from '../../hooks/use-auth';
import { PicklePlusNewLogo } from '../icons/PicklePlusNewLogo';

/**
 * Main header navigation component
 */
const HeaderNav: React.FC = () => {
  const [location, navigate] = useLocation();
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [notificationCount] = useState(3); // Mocked notification count to match dashboard
  
  // Handle scroll detection for header styling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Nav items configuration
  const navItems = [
    { path: '/', label: 'Dashboard', icon: <BarChart3 size={18} /> },
    { path: '/tournaments', label: 'Tournaments', icon: <Trophy size={18} /> },
    { path: '/mastery-paths', label: 'Mastery Paths', icon: <TrendingUp size={18} /> },
    { path: '/social', label: 'Community', icon: <Users size={18} /> },
  ];
  
  // Admin menu items
  const adminItems = user?.role === 'admin' ? [
    { path: '/admin/golden-ticket', label: 'Golden Tickets', icon: <Ticket size={18} /> },
    { path: '/admin/prize-drawing', label: 'Prize Drawings', icon: <Trophy size={18} /> },
  ] : [];
  
  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/80 dark:bg-gray-900/80 shadow-md backdrop-blur-lg' 
        : 'bg-white dark:bg-gray-900 border-b'
    }`}>
      <div className="px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Logo aligned to the left */}
        <div className="flex items-center justify-start flex-1">
          <div 
            className="cursor-pointer"
            onClick={() => navigate("/")}
          >
            <PicklePlusNewLogo 
              height="32px"
              width="auto"
              preserveAspectRatio={true}
            />
          </div>
          
          <nav className="hidden md:flex ml-8">
            <ul className="flex gap-4">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link href={item.path}>
                    <div className={`flex items-center gap-1.5 px-2 py-1 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                      location === item.path 
                      ? 'bg-orange-100 text-orange-900' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}>
                      {item.icon}
                      {item.label}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        
        {/* Right side actions */}
        <div className="flex items-center justify-end gap-1 sm:gap-3">
          {/* Notification Bell */}
          <Button
            variant="ghost"
            size="icon"
            className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
          >
            <Bell size={22} className="text-gray-600 dark:text-gray-300" />
            {notificationCount > 0 && (
              <div 
                className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#FF5722] flex items-center justify-center text-white text-[10px] font-medium"
              >
                {notificationCount}
              </div>
            )}
          </Button>
          
          {/* Admin dropdown if user is admin */}
          {user?.role === 'admin' && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex gap-1">
                  <ShieldCheck size={16} />
                  <span className="hidden sm:inline-block">Admin</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Admin Controls</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  {adminItems.map((item) => (
                    <Link key={item.path} href={item.path}>
                      <DropdownMenuItem className="cursor-pointer">
                        {item.icon}
                        <span className="ml-2">{item.label}</span>
                      </DropdownMenuItem>
                    </Link>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          {/* User dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative rounded-full">
                <Avatar>
                  <AvatarImage src={user?.avatarUrl} alt={user?.username || 'User'} />
                  <AvatarFallback className="bg-orange-100 text-orange-800">
                    {user?.username?.substring(0, 2).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="px-3 py-2">
                <div className="font-medium">{user?.fullName || user?.username}</div>
                <div className="text-xs text-gray-500">{user?.email}</div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <Link href="/profile">
                  <DropdownMenuItem className="cursor-pointer">
                    <User size={16} className="mr-2" />
                    Profile
                  </DropdownMenuItem>
                </Link>
                <Link href="/matches">
                  <DropdownMenuItem className="cursor-pointer">
                    <Trophy size={16} className="mr-2" />
                    Matches
                  </DropdownMenuItem>
                </Link>
                <Link href="/leaderboard">
                  <DropdownMenuItem className="cursor-pointer">
                    <BarChart3 size={16} className="mr-2" />
                    Leaderboard
                  </DropdownMenuItem>
                </Link>
                <Link href="/settings">
                  <DropdownMenuItem className="cursor-pointer">
                    <Settings size={16} className="mr-2" />
                    Settings
                  </DropdownMenuItem>
                </Link>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-red-600" onClick={logout}>
                <LogOut size={16} className="mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default HeaderNav;