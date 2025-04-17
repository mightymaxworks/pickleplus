/**
 * PKL-278651-COMM-0006-HUB-UI
 * Community Menu Component
 * 
 * An enhanced horizontal menu for navigating community-related pages.
 * Features icon-based navigation with modern design elements.
 */

import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Search, Users, PlusCircle, Calendar, Megaphone,
  LayoutGrid
} from 'lucide-react';

export type MenuTab = "discover" | "profile" | "create" | "events" | "news" | "my";

export interface CommunityMenuProps {
  activeTab?: MenuTab;
  className?: string;
  onChange?: (tabId: string) => void;
  showConfettiEffect?: boolean;
}

// Confetti Effect Component
const ConfettiEffect = ({ active }: { active: boolean }) => {
  return active ? (
    <div className="confetti-container absolute inset-0 overflow-hidden pointer-events-none z-50">
      {Array.from({ length: 50 }).map((_, i) => {
        const size = Math.random() * 12 + 5;
        const left = Math.random() * 100;
        const animationDuration = Math.random() * 3 + 2;
        const delay = Math.random() * 0.5;
        const type = Math.floor(Math.random() * 3); // 0: square, 1: circle, 2: triangle
        const colors = ['#F2D362', '#83C167', '#EC4C56', '#45C4E5', '#9683EC'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        let shape;
        if (type === 0) {
          shape = <div style={{ width: `${size}px`, height: `${size}px`, backgroundColor: color }} className="rounded-sm" />;
        } else if (type === 1) {
          shape = <div style={{ width: `${size}px`, height: `${size}px`, backgroundColor: color }} className="rounded-full" />;
        } else {
          shape = (
            <div 
              style={{ 
                width: `${size}px`, 
                height: `${size}px`, 
                backgroundColor: 'transparent',
                borderLeft: `${size/2}px solid transparent`,
                borderRight: `${size/2}px solid transparent`,
                borderBottom: `${size}px solid ${color}`,
              }}
            />
          );
        }
        
        return (
          <div 
            key={i}
            className="confetti absolute top-0"
            style={{
              left: `${left}%`,
              animation: `confetti-fall ${animationDuration}s ease-in ${delay}s forwards`,
              opacity: active ? 1 : 0,
            }}
          >
            {shape}
          </div>
        );
      })}
    </div>
  ) : null;
};

// Navigation Icon Button Component
interface NavIconProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

const NavIcon: React.FC<NavIconProps> = ({ icon, label, active, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className={`
        relative group flex flex-col items-center justify-center p-3
        transition-all duration-300 ease-spring
        ${active 
          ? 'bg-primary text-primary-foreground scale-110 shadow-lg rounded-xl' 
          : 'hover:bg-primary/10 text-muted-foreground hover:text-foreground rounded-lg'
        }
      `}
    >
      <div className={`
        mb-1 p-2 rounded-full 
        ${active ? 'bg-primary-foreground/20' : 'bg-transparent group-hover:bg-background/10'}
      `}>
        {icon}
      </div>
      <span className="text-xs font-medium">{label}</span>
      
      {active && (
        <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-primary-foreground rounded-full" />
      )}
    </button>
  );
};

function CommunityMenu({ 
  activeTab = "discover", 
  className,
  onChange,
  showConfettiEffect = false
}: CommunityMenuProps) {
  const [, navigate] = useLocation();
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Initialize confetti effect
  useEffect(() => {
    if (showConfettiEffect) {
      setShowConfetti(true);
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [showConfettiEffect]);
  
  // Animation trigger for tab changes
  const handleClick = (tabId: string) => {
    if (onChange) {
      onChange(tabId);
    }
    
    // Show confetti animation on tab change
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2000);
  };
  
  const tabs = [
    { id: 'discover', label: 'Discover', icon: <Search className="w-5 h-5" /> },
    { id: 'profile', label: 'Profile', icon: <Users className="w-5 h-5" /> },
    { id: 'create', label: 'Create', icon: <PlusCircle className="w-5 h-5" /> },
    { id: 'events', label: 'Events', icon: <Calendar className="w-5 h-5" /> },
    { id: 'news', label: 'News', icon: <Megaphone className="w-5 h-5" /> }
  ];

  return (
    <div className={cn("relative w-full overflow-x-auto pb-4", className)}>
      {/* Confetti Effect */}
      <ConfettiEffect active={showConfetti} />
      
      {/* Modern Menu UI */}
      <div className="flex items-center max-w-screen-lg mx-auto overflow-x-auto no-scrollbar">
        <div className="flex flex-nowrap space-x-2 md:space-x-6 px-4">
          {tabs.map((tab) => (
            <NavIcon 
              key={tab.id}
              icon={tab.icon}
              label={tab.label}
              active={activeTab === tab.id}
              onClick={() => handleClick(tab.id)}
            />
          ))}
        </div>
      </div>
      
      {/* Shadow indicators for scroll */}
      <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-background to-transparent pointer-events-none md:hidden" />
      <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-background to-transparent pointer-events-none md:hidden" />
    </div>
  );
}

export { CommunityMenu };
export default CommunityMenu;