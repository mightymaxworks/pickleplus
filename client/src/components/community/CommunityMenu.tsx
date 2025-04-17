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

  // Navigation items with icons
  const navItems = [
    { id: 'discover', label: 'Discover', icon: <Search className="w-5 h-5" />, href: "/communities" },
    { id: 'my', label: 'My Communities', icon: <LayoutGrid className="w-5 h-5" />, href: "/communities/my" },
    { id: 'profile', label: 'Profile', icon: <Users className="w-5 h-5" />, href: "/communities/profile" },
    { id: 'create', label: 'Create', icon: <PlusCircle className="w-5 h-5" />, href: "/communities/create" },
    { id: 'events', label: 'Events', icon: <Calendar className="w-5 h-5" />, href: "/communities/events" },
    { id: 'news', label: 'News', icon: <Megaphone className="w-5 h-5" />, href: "/communities/news" }
  ];

  const handleTabClick = (item: { id: string; href: string }) => {
    if (onChange) {
      onChange(item.id);
    } else {
      navigate(item.href);
    }
    
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2000);
  };
  
  return (
    <div className={cn(
      "relative", 
      className
    )}>
      {/* Confetti Effect */}
      <ConfettiEffect active={showConfetti} />
      
      <div className="mb-8 p-2 bg-muted/30 rounded-xl border border-muted/80 overflow-hidden shadow-inner">
        <div className="w-full flex items-center justify-center gap-1 sm:gap-3 lg:gap-6 overflow-x-auto snap-x snap-mandatory md:snap-none pb-2 md:pb-0">
          {navItems.map((item) => (
            <NavIcon 
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={activeTab === item.id}
              onClick={() => handleTabClick(item)}
            />
          ))}
        </div>
      </div>
      
      {/* Shadow indicators for scroll */}
      <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-background to-transparent pointer-events-none md:hidden" />
      <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-background to-transparent pointer-events-none md:hidden" />
      
      {/* Add CSS animations */}
      <style jsx global>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(-10vh) rotate(0deg);
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
          }
        }
        
        @keyframes ping-slow {
          0% {
            transform: scale(1);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.8);
            opacity: 0.3;
          }
          100% {
            transform: scale(1);
            opacity: 0.8;
          }
        }
        
        .animate-ping-slow {
          animation: ping-slow 3s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delay {
          animation: float 6s ease-in-out 2s infinite;
        }
        
        @keyframes float {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
          100% {
            transform: translateY(0px);
          }
        }
        
        @keyframes wiggle {
          0%, 100% {
            transform: rotate(-5deg);
          }
          50% {
            transform: rotate(5deg);
          }
        }
        
        .animate-wiggle {
          animation: wiggle 1s ease-in-out infinite;
        }
        
        .ease-spring {
          transition-timing-function: cubic-bezier(0.5, 1.5, 0.5, 1);
        }
      `}</style>
    </div>
  );
}

export { CommunityMenu };
export default CommunityMenu;