/**
 * Modern Admin Layout Component
 * 
 * PKL-278651-ADMIN-UI-001
 * Unified, modern admin interface with enhanced UX
 * UDF Rule 21 Compliance - Admin UI/UX Standards
 */
import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { 
  Settings, 
  Users, 
  Activity, 
  Shield, 
  BarChart3, 
  Menu, 
  Search,
  Bell,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Home,
  Gauge,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  actions?: React.ReactNode;
}

interface AdminNavItem {
  id: string;
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  children?: AdminNavItem[];
  role?: string; // Minimum role required
}

// Modern admin navigation structure
const adminNavItems: AdminNavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/admin',
    icon: Gauge,
  },
  {
    id: 'users',
    label: 'User Management',
    path: '/admin/users',
    icon: Users,
    children: [
      { id: 'users-list', label: 'All Users', path: '/admin/users', icon: Users },
      { id: 'users-roles', label: 'Roles & Permissions', path: '/admin/users/roles', icon: Shield },
      { id: 'users-activity', label: 'User Activity', path: '/admin/users/activity', icon: Activity },
    ]
  },
  {
    id: 'matches',
    label: 'Match Management',
    path: '/admin/matches',
    icon: Activity,
    children: [
      { id: 'matches-list', label: 'All Matches', path: '/admin/matches', icon: Activity },
      { id: 'matches-verify', label: 'Match Verification', path: '/admin/matches/verify', icon: Shield },
      { id: 'matches-disputes', label: 'Disputes', path: '/admin/matches/disputes', icon: AlertTriangle, badge: 3 },
    ]
  },
  {
    id: 'analytics',
    label: 'Analytics & Reports',
    path: '/admin/analytics',
    icon: BarChart3,
    children: [
      { id: 'analytics-overview', label: 'Overview', path: '/admin/analytics', icon: BarChart3 },
      { id: 'analytics-users', label: 'User Analytics', path: '/admin/analytics/users', icon: Users },
      { id: 'analytics-performance', label: 'Platform Performance', path: '/admin/analytics/performance', icon: Gauge },
    ]
  },
  {
    id: 'system',
    label: 'System Settings',
    path: '/admin/system',
    icon: Settings,
    role: 'super_admin',
    children: [
      { id: 'system-general', label: 'General Settings', path: '/admin/system', icon: Settings },
      { id: 'system-security', label: 'Security', path: '/admin/system/security', icon: Shield },
      { id: 'system-audit', label: 'Audit Logs', path: '/admin/system/audit', icon: Activity },
    ]
  },
];

export const AdminLayout: React.FC<AdminLayoutProps> = ({ 
  children, 
  title = 'Admin Dashboard',
  actions 
}) => {
  const [location] = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState(5); // Mock notification count

  // Breadcrumb generation
  const generateBreadcrumbs = () => {
    const parts = location.split('/').filter(Boolean);
    if (parts[0] !== 'admin') return [{ label: 'Dashboard', path: '/admin' }];
    
    const breadcrumbs = [{ label: 'Dashboard', path: '/admin' }];
    let currentPath = '/admin';
    
    for (let i = 1; i < parts.length; i++) {
      currentPath += `/${parts[i]}`;
      const label = parts[i].charAt(0).toUpperCase() + parts[i].slice(1).replace('-', ' ');
      breadcrumbs.push({ label, path: currentPath });
    }
    
    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-50">
        <div className="flex items-center justify-between h-full px-4">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            {/* Logo & Brand */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">P+</span>
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">Admin</span>
            </div>

            {/* Breadcrumbs */}
            <nav className="hidden md:flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={crumb.path}>
                  {index > 0 && <ChevronRight className="h-4 w-4" />}
                  <span className={index === breadcrumbs.length - 1 ? 'text-gray-900 dark:text-white font-medium' : 'hover:text-gray-900 dark:hover:text-white cursor-pointer'}>
                    {crumb.label}
                  </span>
                </React.Fragment>
              ))}
            </nav>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Global Search */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search users, matches, settings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64 bg-gray-50 dark:bg-gray-700 border-0"
              />
            </div>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              {notifications > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center bg-red-500">
                  {notifications}
                </Badge>
              )}
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/api/placeholder/32/32" alt="Admin" />
                    <AvatarFallback>AD</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Admin User</p>
                    <p className="text-xs leading-none text-muted-foreground">admin@pickle.plus</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <aside className={cn(
        "fixed left-0 top-16 bottom-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-40 transition-all duration-300",
        sidebarCollapsed ? "w-16" : "w-64"
      )}>
        <nav className="p-4 space-y-2">
          {adminNavItems.map((item) => (
            <AdminNavItem 
              key={item.id} 
              item={item} 
              collapsed={sidebarCollapsed}
              currentPath={location}
            />
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className={cn(
        "pt-16 transition-all duration-300",
        sidebarCollapsed ? "ml-16" : "ml-64"
      )}>
        {/* Content Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{title}</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Manage your platform with precision and control
              </p>
            </div>
            {actions && (
              <div className="flex items-center space-x-2">
                {actions}
              </div>
            )}
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

// Navigation Item Component
const AdminNavItem: React.FC<{
  item: AdminNavItem;
  collapsed: boolean;
  currentPath: string;
  level?: number;
}> = ({ item, collapsed, currentPath, level = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isActive = currentPath === item.path || currentPath.startsWith(item.path + '/');
  const hasChildren = item.children && item.children.length > 0;

  useEffect(() => {
    if (isActive && hasChildren) {
      setIsExpanded(true);
    }
  }, [isActive, hasChildren]);

  const IconComponent = item.icon;

  return (
    <div>
      <Button
        variant={isActive ? "secondary" : "ghost"}
        className={cn(
          "w-full justify-start text-left font-normal",
          level > 0 && "ml-4 w-[calc(100%-1rem)]",
          collapsed && level === 0 && "justify-center px-2"
        )}
        onClick={() => {
          if (hasChildren && !collapsed) {
            setIsExpanded(!isExpanded);
          } else {
            // Navigate to the item path
            window.location.href = item.path;
          }
        }}
      >
        <IconComponent className={cn("h-4 w-4", !collapsed && "mr-2")} />
        {!collapsed && (
          <>
            <span className="flex-1">{item.label}</span>
            {item.badge && (
              <Badge variant="secondary" className="ml-auto">
                {item.badge}
              </Badge>
            )}
            {hasChildren && (
              <ChevronRight className={cn("h-4 w-4 transition-transform", isExpanded && "transform rotate-90")} />
            )}
          </>
        )}
      </Button>

      {/* Child Items */}
      {hasChildren && isExpanded && !collapsed && (
        <div className="mt-1 space-y-1">
          {item.children!.map((child) => (
            <AdminNavItem
              key={child.id}
              item={child}
              collapsed={collapsed}
              currentPath={currentPath}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};