import { useState } from "react";
import { useLocation } from "wouter";
import { 
  User as UserIcon, 
  LogOut, 
  Settings, 
  ChevronDown, 
  Bell, 
  UserCircle,
  Users,
  Shield,
  HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { User } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";

interface UserDropdownMenuProps {
  user: User;
}

export default function UserDropdownMenu({ user }: UserDropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [, navigate] = useLocation();
  const { logoutMutation } = useAuth();

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Close dropdown when clicking outside
  const closeDropdown = () => {
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Notification icon */}
      <Button variant="ghost" size="sm" className="text-gray-600 mr-2 relative">
        <Bell size={20} />
        <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
      </Button>

      {/* User Dropdown Toggle */}
      <button
        onClick={toggleDropdown}
        className="flex items-center space-x-2 focus:outline-none"
      >
        {/* User Avatar with initial */}
        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm overflow-hidden">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.username} className="h-full w-full object-cover" />
          ) : (
            <span>{user.displayName?.charAt(0) || user.username.charAt(0).toUpperCase()}</span>
          )}
        </div>

        <div className="hidden md:block text-left">
          <div className="text-sm font-medium text-gray-800">{user.displayName || user.username}</div>
          <div className="text-xs text-gray-500">
            {user.isAdmin ? 'Administrator' : 'Player'}
          </div>
        </div>

        <ChevronDown 
          size={16} 
          className={`text-gray-600 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Overlay to capture outside clicks */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={closeDropdown}
          ></div>

          <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
            <div className="py-1">
              {/* User info */}
              <div className="px-4 py-2 border-b border-gray-100">
                <div className="font-medium text-sm">{user.displayName || user.username}</div>
                <div className="text-xs text-gray-500 truncate">{user.email}</div>
              </div>

              {/* Menu items */}
              <DropdownItem 
                icon={<UserCircle size={16} />} 
                label="My Profile" 
                onClick={() => {
                  navigate("/profile");
                  closeDropdown();
                }}
              />

              <DropdownItem 
                icon={<UserCircle size={16} />} 
                label="Contextual Profile (New)" 
                onClick={() => {
                  navigate("/profile/contextual");
                  closeDropdown();
                }}
              />

              <DropdownItem 
                icon={<Settings size={16} />} 
                label="Settings" 
                onClick={() => {
                  navigate("/settings");
                  closeDropdown();
                }}
              />

              <DropdownItem 
                icon={<HelpCircle size={16} />} 
                label="Help Center" 
                onClick={() => {
                  navigate("/help");
                  closeDropdown();
                }}
              />

              {/* Admin Panel - only for admins */}
              {user.isAdmin && (
                <>
                  <div className="border-t border-gray-100 my-1"></div>
                  <DropdownItem 
                    icon={<Shield size={16} className="text-indigo-600" />} 
                    label="Admin Panel" 
                    onClick={() => {
                      navigate("/admin");
                      closeDropdown();
                    }}
                    isAdmin
                  />
                </>
              )}

              {/* Logout option */}
              <div className="border-t border-gray-100 my-1"></div>
              <DropdownItem 
                icon={<LogOut size={16} />} 
                label="Log Out" 
                onClick={handleLogout}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

interface DropdownItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  isAdmin?: boolean;
}

function DropdownItem({ icon, label, onClick, isAdmin = false }: DropdownItemProps) {
  return (
    <button
      className={`w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${isAdmin ? 'text-indigo-600 hover:text-indigo-800' : ''}`}
      onClick={onClick}
    >
      <span className="mr-2">{icon}</span>
      {label}
    </button>
  );
}