import React from 'react';
import { useLocation } from 'wouter';
import { Home, Calendar, Award, Users, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { User } from '@shared/schema';

interface MobileNavigationProps {
  user: User;
}

export function MobileNavigation({ user }: MobileNavigationProps) {
  const [location, navigate] = useLocation();

  const isActive = (path: string) => location === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      {/* Top row with navigation items */}
      <div className="flex items-center justify-around px-2 h-16">
        <NavItem 
          icon={<Home size={20} />} 
          label="Home" 
          active={isActive('/dashboard')} 
          onClick={() => navigate('/dashboard')} 
        />
        <NavItem 
          icon={<Calendar size={20} />} 
          label="Matches" 
          active={isActive('/matches')} 
          onClick={() => navigate('/matches')} 
        />
        <div className="w-24" /> {/* Spacer for the Record button */}
        <NavItem 
          icon={<Award size={20} />} 
          label="Tournaments" 
          active={isActive('/tournaments')} 
          onClick={() => navigate('/tournaments')} 
        />
        <NavItem 
          icon={<Users size={20} />} 
          label="Community" 
          active={isActive('/community')} 
          onClick={() => navigate('/community')} 
        />
      </div>

      {/* Record Match button that spans the full width below */}
      <Button
        onClick={() => navigate('/record-match')}
        size="lg"
        className="bg-[#FF5722] hover:bg-[#E64A19] text-white w-full h-12 rounded-none flex items-center justify-center text-base font-medium"
      >
        Record Match
      </Button>
    </div>
  );
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

function NavItem({ icon, label, active, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-1 rounded-md ${
        active ? 'text-[#FF5722]' : 'text-gray-500'
      }`}
    >
      <div className="mb-1">{icon}</div>
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}