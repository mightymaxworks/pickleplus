/**
 * PKL-278651-COMM-0006-HUB-UI-MENU
 * Community Menu Component
 * 
 * A specialized horizontal menu for the Community section of the application.
 * Implements the enhanced HorizontalMenu component with community-specific options.
 * Styled to match the modern design from test/community page.
 */

import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { HorizontalMenu, MenuItem } from '@/components/ui/horizontal-menu';
import { Search, Users, PlusCircle, Calendar, Megaphone, Sparkles } from 'lucide-react';

export interface CommunityMenuProps {
  activeTab?: 'discover' | 'profile' | 'create' | 'events' | 'news';
  onChange?: (tab: string) => void;
  className?: string;
  showConfettiEffect?: boolean;
}

// Confetti Animation Component (simplified version from TestCommunityPage)
const ConfettiEffect = ({ active }: { active: boolean }) => {
  if (!active) return null;
  
  return (
    <div className="confetti-container absolute inset-0 overflow-hidden pointer-events-none z-50">
      {Array.from({ length: 40 }).map((_, i) => {
        const size = Math.random() * 10 + 5;
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
                borderBottom: `${size}px solid ${color}`
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
      
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes confetti-fall {
            0% {
              transform: translateY(-10px) rotate(0deg);
            }
            100% {
              transform: translateY(100vh) rotate(360deg);
            }
          }
        `
      }} />
    </div>
  );
};

export function CommunityMenu({ 
  activeTab = 'discover', 
  onChange,
  className,
  showConfettiEffect = true
}: CommunityMenuProps) {
  const [, navigate] = useLocation();
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Define the menu items for the community section
  const menuItems: MenuItem[] = [
    {
      id: 'discover',
      icon: <Search className="h-full w-full" />,
      label: 'Discover',
      onClick: () => navigate('/communities')
    },
    {
      id: 'profile',
      icon: <Users className="h-full w-full" />,
      label: 'Profile',
      onClick: () => navigate('/communities/my')
    },
    {
      id: 'create',
      icon: <PlusCircle className="h-full w-full" />,
      label: 'Create',
      onClick: () => navigate('/communities/create')
    },
    {
      id: 'events',
      icon: <Calendar className="h-full w-full" />,
      label: 'Events',
      onClick: () => navigate('/communities/events')
    },
    {
      id: 'news',
      icon: <Megaphone className="h-full w-full" />,
      label: 'News',
      onClick: () => navigate('/communities/news')
    }
  ];

  const handleTabChange = (tabId: string) => {
    // Show confetti effect when changing tabs (if enabled)
    if (showConfettiEffect) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    }
    
    if (onChange) {
      onChange(tabId);
    }
  };

  return (
    <div className="relative">
      {/* Confetti Effect */}
      {showConfettiEffect && <ConfettiEffect active={showConfetti} />}
      
      {/* Visual Hint Box (matching TestCommunityPage style) */}
      <div className="absolute -top-5 right-4 flex items-center gap-2 text-xs bg-background/70 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-muted/30 z-10">
        <Sparkles className="h-3.5 w-3.5 text-amber-500" />
        <span className="text-muted-foreground">Interactive community navigation</span>
      </div>
      
      <HorizontalMenu
        items={menuItems}
        activeItemId={activeTab}
        onChange={handleTabChange}
        colorScheme="primary"
        size="md"
        className={className}
        showIndicator={true}
        enableActiveScale={true}
      />
    </div>
  );
}

export default CommunityMenu;