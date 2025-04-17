/**
 * PKL-278651-COMM-0006-HUB-UI
 * Communities Discovery Page
 * 
 * Ported directly from TestCommunityPage to provide the modern UI experience
 * featuring improved visual elements and interactions.
 */

import React, { useState, useEffect } from 'react';
import { useLocation } from "wouter";
import { CommunityProvider } from "../../lib/providers/CommunityProvider";
import { useCommunities } from "../../lib/hooks/useCommunity";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { 
  Search, Users, PlusCircle, Calendar, Megaphone,
  Sparkles, TestTube, FlaskConical, Beaker, Zap,
  Trophy, Activity, LayoutGrid, PartyPopper, ScrollText,
  Bell, Target, Star, Repeat2
} from 'lucide-react';

// Import mockup components
import CommunityDiscoveryMockup from '../../core/modules/community/components/mockups/CommunityDiscoveryMockup';
import CommunityProfileMockup from '../../core/modules/community/components/mockups/CommunityProfileMockup';
import CommunityCreationMockup from '../../core/modules/community/components/mockups/CommunityCreationMockup';
import CommunityEventsMockup from '../../core/modules/community/components/mockups/CommunityEventsMockup';
import CommunityAnnouncementsMockup from '../../core/modules/community/components/mockups/CommunityAnnouncementsMockup';

// Pickleball SVG Icon
const PickleballIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
    <path d="M12 2C13.3 2 14.6 2.3 15.8 2.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M19.4 5.2C21.5 7.8 22.5 11.4 21.5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M17.7 19.8C15.1 21.9 11.5 22.5 8.2 21.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M3.3 16.5C2 13.3 2.3 9.6 4.3 6.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M8 3.3C8.4 3.1 8.8 3 9.2 2.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// Custom Paddle SVG Icon
const PaddleIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 4C19 7 20 13 17 17C15 19.5 12 20 9 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M8.5 18.5L5 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M4 20.6L5.1 19.5L3.9 18.3L3 19.2C2.8 19.4 2.8 19.8 3 20L4 21C4.2 21.2 4.6 21.2 4.8 21L5.7 20.1L4.5 18.9L3.4 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 6L16 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

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
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-primary-foreground/50 rounded-t-full" />
      )}
    </button>
  );
};

export default function CommunitiesPage() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState('discover');
  const [showConfetti, setShowConfetti] = useState(false);
  const { toast } = useToast();
  
  // For data integration
  const { data: communities, isLoading } = useCommunities({
    enabled: true,
  });
  
  // Show confetti on initial load
  useEffect(() => {
    setShowConfetti(true);
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

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
    
    setActiveTab(tab);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2000);
  };

  return (
    <DashboardLayout>
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
            
            {/* Simple Title */}
            <div className="flex items-center mb-8">
              <img src="/src/assets/community-logo-new.png" alt="COMMUNITY" className="h-16" />
            </div>
            
            <Tabs value={activeTab} onValueChange={(value) => {
              setActiveTab(value);
              setShowConfetti(true);
              setTimeout(() => setShowConfetti(false), 2000);
            }}>
              {/* Icon-based Navigation */}
              <div className="relative">
                
                <div className="mb-8 p-2 bg-muted/30 rounded-xl border border-muted/80 overflow-hidden shadow-inner">
                  <div className="w-full flex items-center justify-center gap-1 sm:gap-3 lg:gap-6">
                    {navItems.map((item) => (
                      <NavIcon 
                        key={item.id}
                        icon={item.icon}
                        label={item.label}
                        active={activeTab === item.id}
                        onClick={() => handleNavClick(item.id)}
                      />
                    ))}
                  </div>
                </div>


              </div>
              
              {/* Tab Content */}
              <TabsContent value="discover" className="pt-4">
                <CommunityDiscoveryMockup />
              </TabsContent>
              
              <TabsContent value="profile" className="pt-4">
                <CommunityProfileMockup />
              </TabsContent>
              
              <TabsContent value="create" className="pt-4">
                <CommunityCreationMockup />
              </TabsContent>
              
              <TabsContent value="events" className="pt-4">
                <CommunityEventsMockup />
              </TabsContent>
              
              <TabsContent value="announcements" className="pt-4">
                <CommunityAnnouncementsMockup />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </CommunityProvider>
    </DashboardLayout>
  );
}