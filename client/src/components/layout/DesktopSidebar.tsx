import { useState } from "react";
import { useLocation } from "wouter";
import { 
  Home, 
  Activity, 
  Trophy, 
  Users, 
  BookOpen, 
  Calendar, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PicklePlusWhiteLogo } from "@/components/icons/PicklePlusWhiteLogo";
import { User } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";

interface DesktopSidebarProps {
  user: User;
}

export default function DesktopSidebar({ user }: DesktopSidebarProps) {
  const [location, navigate] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { logoutMutation } = useAuth();
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };
  
  return (
    <div className={`${collapsed ? 'w-20' : 'w-64'} bg-gray-900 text-white h-full flex flex-col transition-width duration-300 ease-in-out relative`}>
      {/* Collapse button */}
      <button 
        className="absolute -right-3 top-20 bg-gray-900 text-white p-1 rounded-full border border-gray-700 z-10"
        onClick={toggleCollapse}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
      
      {/* Logo and Name */}
      <div className={`p-6 flex ${collapsed ? 'justify-center' : 'justify-start'} items-center space-x-3`}>
        <PicklePlusWhiteLogo className="h-8 w-auto" />
        {!collapsed && <span className="text-xl font-bold">Pickle+</span>}
      </div>
      
      {/* User Profile Preview */}
      <div className={`px-6 py-4 border-t border-b border-gray-800 flex ${collapsed ? 'justify-center' : 'justify-start'} items-center space-x-3`}>
        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary to-primary-light flex items-center justify-center text-white font-bold text-sm">
          {user.avatarInitials || user.username.substring(0, 2).toUpperCase()}
        </div>
        
        {!collapsed && (
          <div className="overflow-hidden">
            <div className="font-medium truncate">{user.displayName || user.username}</div>
            <div className="text-xs text-gray-400 truncate">
              {user.isAdmin ? 'Administrator' : 'Player'}
            </div>
          </div>
        )}
      </div>
      
      {/* Navigation Links */}
      <div className="flex-1 py-6 overflow-y-auto">
        <nav className="space-y-1 px-3">
          <NavItem 
            href="/dashboard" 
            icon={<Home size={20} />} 
            label="Dashboard" 
            active={location === "/dashboard"} 
            collapsed={collapsed}
          />
          
          <NavItem 
            href="/matches" 
            icon={<Activity size={20} />} 
            label="Matches" 
            active={location.startsWith("/matches")} 
            collapsed={collapsed}
          />
          
          <NavItem 
            href="/tournaments" 
            icon={<Trophy size={20} />} 
            label="Tournaments" 
            active={location.startsWith("/tournaments")} 
            collapsed={collapsed}
          />
          
          <NavItem 
            href="/training" 
            icon={<BookOpen size={20} />} 
            label="Training" 
            active={location.startsWith("/training")} 
            collapsed={collapsed}
          />
          
          <NavItem 
            href="/community" 
            icon={<Users size={20} />} 
            label="Community" 
            active={location.startsWith("/community")} 
            collapsed={collapsed}
          />
          
          <NavItem 
            href="/passport" 
            icon={<Calendar size={20} />} 
            label="Passport" 
            active={location.startsWith("/passport")} 
            collapsed={collapsed}
          />
          
          {/* Separator */}
          <div className="border-t border-gray-800 my-4"></div>
          
          {/* Admin panel for admins */}
          {user.isAdmin && (
            <NavItem 
              href="/admin" 
              icon={<Settings size={20} />} 
              label="Admin Panel" 
              active={location.startsWith("/admin")} 
              collapsed={collapsed}
              isAdmin
            />
          )}
        </nav>
      </div>
      
      {/* Record Match Button */}
      <div className={`p-4 ${collapsed ? 'flex justify-center' : ''}`}>
        <Button 
          onClick={() => navigate("/record-match")}
          className={`${collapsed ? 'w-12 h-12 rounded-full p-0' : 'w-full'} bg-primary hover:bg-primary/90`}
        >
          {collapsed ? (
            <Activity size={20} />
          ) : (
            <span className="flex items-center justify-center">
              <Activity size={20} className="mr-2" /> 
              Record Match
            </span>
          )}
        </Button>
      </div>
      
      {/* Logout Button */}
      <div className={`p-4 ${collapsed ? 'flex justify-center' : ''}`}>
        <Button 
          variant="ghost" 
          onClick={handleLogout}
          className={`${collapsed ? 'w-12 h-12 rounded-full p-0' : 'w-full'} text-gray-400 hover:text-white hover:bg-gray-800`}
        >
          {collapsed ? (
            <LogOut size={20} />
          ) : (
            <span className="flex items-center justify-center">
              <LogOut size={20} className="mr-2" /> 
              Log Out
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  collapsed: boolean;
  isAdmin?: boolean;
}

function NavItem({ href, icon, label, active, collapsed, isAdmin = false }: NavItemProps) {
  const [, navigate] = useLocation();
  
  return (
    <button
      onClick={() => navigate(href)}
      className={`
        w-full flex items-center px-3 py-2 rounded-md text-sm font-medium
        ${active 
          ? 'bg-gray-800 text-white' 
          : `text-gray-300 hover:bg-gray-800 hover:text-white ${isAdmin ? 'text-indigo-400 hover:text-indigo-300' : ''}`
        }
        transition-colors
        ${collapsed ? 'justify-center' : 'justify-start'}
      `}
    >
      <span className={`${isAdmin ? 'text-indigo-400' : ''}`}>
        {icon}
      </span>
      {!collapsed && <span className="ml-3">{label}</span>}
    </button>
  );
}