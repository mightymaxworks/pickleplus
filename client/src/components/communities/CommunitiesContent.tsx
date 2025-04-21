/**
 * @component CommunitiesContent
 * @layer UI
 * @module Community
 * @sprint PKL-278651-COMM-0006-HUB-UI
 * @version 2.1.0
 * @lastModified 2025-04-21
 * 
 * @description
 * Content component for the Community Hub feature.
 * Extracted from CommunitiesPage to fix double header issue.
 */

import React, { useState } from 'react';
import { useLocation } from "wouter";
import { CommunityProvider } from "../../lib/providers/CommunityProvider";
import { useCommunities } from "../../lib/hooks/useCommunity";
import { 
  Search, Users, PlusCircle, Calendar, Megaphone,
  Sparkles
} from 'lucide-react';

// Import mockup components
import CommunityDiscoveryMockupV2 from '../../core/modules/community/components/mockups/CommunityDiscoveryMockupV2';

// Court Lines Background Component
const CourtLinesBackground = () => (
  <div className="absolute inset-0 z-0 opacity-[0.03]">
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <pattern id="courtLines" width="100" height="100" patternUnits="userSpaceOnUse">
        <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" strokeWidth="1" />
        <line x1="50" y1="0" x2="50" y2="100" stroke="currentColor" strokeWidth="1" />
        <rect x="10" y="10" width="80" height="80" stroke="currentColor" strokeWidth="0.5" fill="none" />
      </pattern>
      <rect width="100%" height="100%" fill="url(#courtLines)" />
    </svg>
  </div>
);

// Confetti Animation Component
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
    </div>
  ) : null;
};

export default function CommunitiesContent() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState('discover');
  const [showConfetti, setShowConfetti] = useState(false);
  
  // For data integration
  const { data: communities, isLoading } = useCommunities({
    enabled: true,
  });
  
  // Navigation items with icons
  const navItems = [
    { id: 'discover', label: 'Discover', icon: <Search className="w-5 h-5" /> },
    { id: 'profile', label: 'Profile', icon: <Users className="w-5 h-5" /> },
    { id: 'create', label: 'Create', icon: <PlusCircle className="w-5 h-5" /> },
    { id: 'events', label: 'Events', icon: <Calendar className="w-5 h-5" /> },
    { id: 'announcements', label: 'News', icon: <Megaphone className="w-5 h-5" /> }
  ];
  
  // Handle navigation click with real navigation
  const handleNavClick = (tab: string) => {
    if (tab === 'create') {
      navigate('/communities/create');
      return;
    }
    
    // PKL-278651-COMM-0022-DISC - Link to Enhanced Community Discovery
    if (tab === 'discover') {
      navigate('/communities/discover');
      return;
    }
    
    setActiveTab(tab);
    // No confetti effect anymore
  };

  return (
    <CommunityProvider>
      <div className="relative overflow-x-hidden">
        {/* Background Elements */}
        <CourtLinesBackground />
        
        {/* Confetti Effect */}
        <ConfettiEffect active={showConfetti} />
        
        {/* Floating Decoration Elements */}
        <div className="hidden lg:block absolute top-40 -left-6 w-12 h-12 rounded-full bg-yellow-300/30 backdrop-blur-xl animate-pulse-slow"></div>
        <div className="hidden lg:block absolute bottom-20 right-10 w-20 h-20 rounded-full bg-green-300/20 backdrop-blur-xl animate-float"></div>
        <div className="hidden lg:block absolute top-1/4 right-16 w-8 h-8 rounded-full bg-blue-300/20 backdrop-blur-md animate-float-delay"></div>
        
        <div className="container mx-auto py-8 px-4 relative z-10">
          
          {/* Community Logo Header */}
          <div 
            className="flex items-center mb-8" 
            id="community-logo-container"
            data-testid="community-header"
            aria-label="Community Hub Header"
          >
            <img 
              src="/src/assets/community-logo-new.png" 
              alt="COMMUNITY" 
              className="h-16" 
              data-component="community-logo" 
            />
          </div>
          
          {/* Content */}
          <div className="pt-4">
            {/* PKL-278651-COMM-0017-SEARCH: Use new advanced search component */}
            <CommunityDiscoveryMockupV2 />
          </div>
        </div>
      </div>
    </CommunityProvider>
  );
}