/**
 * PKL-278651-COMM-0001-UIMOCK
 * Community Module UI/UX Test Page
 * 
 * This page contains UI mockups for the Community Module features
 * to validate design patterns before full implementation.
 */
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, Users, PlusCircle, Calendar, Megaphone,
  Sparkles, TestTube, FlaskConical, Beaker, Zap
} from 'lucide-react';

import CommunityDiscoveryMockup from '../core/modules/community/components/mockups/CommunityDiscoveryMockup';
import CommunityProfileMockup from '../core/modules/community/components/mockups/CommunityProfileMockup';
import CommunityCreationMockup from '../core/modules/community/components/mockups/CommunityCreationMockup';
import CommunityEventsMockup from '../core/modules/community/components/mockups/CommunityEventsMockup';
import CommunityAnnouncementsMockup from '../core/modules/community/components/mockups/CommunityAnnouncementsMockup';

// Pickleball SVG Icon
const PickleballIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
    <path d="M12 2C13.3 2 14.6 2.3 15.8 2.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M19.4 5.2C21.5 7.8 22.5 11.4 21.5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M17.7 19.8C15.1 21.9 11.5 22.5 8.2 21.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M3.3 16.5C2 13.3 2.3 9.6 4.3 6.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M8 3.3C8.4 3.1 8.8 3 9.2 2.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// Court Lines Background Component
const CourtLinesBackground = () => (
  <div className="absolute inset-0 z-0 opacity-[0.03]">
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <pattern id="courtLines" width="100" height="100" patternUnits="userSpaceOnUse">
        <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" strokeWidth="1" />
        <line x1="50" y1="0" x2="50" y2="100" stroke="currentColor" strokeWidth="1" />
      </pattern>
      <rect width="100%" height="100%" fill="url(#courtLines)" />
    </svg>
  </div>
);

// Confetti Animation Component
const ConfettiEffect = ({ active }: { active: boolean }) => {
  return active ? (
    <div className="confetti-container absolute inset-0 overflow-hidden pointer-events-none z-50">
      {Array.from({ length: 40 }).map((_, i) => {
        const size = Math.random() * 10 + 5;
        const left = Math.random() * 100;
        const animationDuration = Math.random() * 3 + 2;
        const delay = Math.random() * 0.5;
        
        return (
          <div 
            key={i}
            className="confetti absolute top-0 rounded-sm"
            style={{
              left: `${left}%`,
              width: `${size}px`,
              height: `${size}px`,
              backgroundColor: ['#F2D362', '#83C167', '#EC4C56', '#45C4E5'][Math.floor(Math.random() * 4)],
              animation: `confetti-fall ${animationDuration}s ease-in ${delay}s forwards`,
              opacity: active ? 1 : 0,
            }}
          />
        );
      })}
    </div>
  ) : null;
};

const TestCommunityPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('discover');
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Show confetti on initial load
  useEffect(() => {
    setShowConfetti(true);
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#f5f8ff] to-[#edfff1] dark:from-[#121826] dark:to-[#0f1c11] -z-10"></div>
      <CourtLinesBackground />
      
      {/* Confetti Effect */}
      <ConfettiEffect active={showConfetti} />
      
      {/* Floating Decoration Elements */}
      <div className="hidden lg:block absolute top-40 -left-6 w-12 h-12 rounded-full bg-yellow-300/30 backdrop-blur-xl"></div>
      <div className="hidden lg:block absolute bottom-20 right-10 w-20 h-20 rounded-full bg-green-300/20 backdrop-blur-xl"></div>
      
      <div className="container mx-auto py-8 px-4 relative z-10">
        {/* Header Banner */}
        <div className="relative overflow-hidden bg-primary/5 p-5 mb-8 rounded-2xl border border-primary/20 shadow-sm backdrop-blur-sm">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/10 rounded-full blur-2xl"></div>
          <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-yellow-300/20 rounded-full blur-2xl"></div>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15">
              <FlaskConical className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-sm font-semibold text-primary">PKL-278651-COMM-0001-UIMOCK</h2>
          </div>
          
          <div className="flex items-start gap-2 pl-12">
            <Beaker className="h-4 w-4 text-muted-foreground mt-0.5" />
            <p className="text-sm text-muted-foreground">
              This is a UI mockup test page for the Community Module. Use the tabs below to explore different UI components.
            </p>
          </div>
        </div>
        
        {/* Title Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center">
            <div className="mr-4 h-10 w-10 rotate-12 flex items-center justify-center text-green-600 bg-green-100 dark:bg-green-900/40 dark:text-green-400 rounded-lg">
              <PickleballIcon />
            </div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-primary">
              Community Features
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center px-3 py-1 rounded-full bg-yellow-400/10 text-yellow-600 dark:text-yellow-400 gap-1.5 border border-yellow-400/30 shadow-sm">
              <Zap className="h-4 w-4" />
              <span className="text-sm font-medium">Interactive Demo</span>
            </div>
            
            <div className="flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary gap-1.5 border border-primary/30 shadow-sm">
              <TestTube className="h-4 w-4" />
              <span className="text-sm font-medium">UI Prototype</span>
            </div>
          </div>
        </div>
        
        {/* Main Content Card */}
        <div className="relative bg-card/70 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-muted">
          {/* Card Corner Decoration */}
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-br-xl rounded-tl-xl transform rotate-45"></div>
          
          <Tabs value={activeTab} onValueChange={(value) => {
            setActiveTab(value);
            // Show mini confetti on tab change
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 2000);
          }} className="w-full">
            <div className="flex justify-center mb-8">
              <TabsList className="w-full max-w-4xl flex flex-wrap gap-3 p-2 bg-muted/70 rounded-xl border border-muted/50">
                <TabsTrigger 
                  value="discover" 
                  className="flex-1 gap-2 py-4 rounded-lg transition-all duration-300 data-[state=active]:shadow-md data-[state=active]:scale-105"
                >
                  <Search className="h-4 w-4" />
                  <span>Discovery</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="profile" 
                  className="flex-1 gap-2 py-4 rounded-lg transition-all duration-300 data-[state=active]:shadow-md data-[state=active]:scale-105"
                >
                  <Users className="h-4 w-4" />
                  <span>Profile</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="create" 
                  className="flex-1 gap-2 py-4 rounded-lg transition-all duration-300 data-[state=active]:shadow-md data-[state=active]:scale-105"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Create</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="events" 
                  className="flex-1 gap-2 py-4 rounded-lg transition-all duration-300 data-[state=active]:shadow-md data-[state=active]:scale-105"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Events</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="announcements" 
                  className="flex-1 gap-2 py-4 rounded-lg transition-all duration-300 data-[state=active]:shadow-md data-[state=active]:scale-105"
                >
                  <Megaphone className="h-4 w-4" />
                  <span>News</span>
                </TabsTrigger>
              </TabsList>
            </div>
            
            <div className="relative">
              <div className="absolute -top-14 right-0 flex items-center gap-2 text-xs bg-background/70 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-muted-foreground">Interactive mockups with example data</span>
              </div>
            </div>
            
            <style jsx global>{`
              @keyframes confetti-fall {
                0% {
                  transform: translateY(-10px) rotate(0deg);
                }
                100% {
                  transform: translateY(100vh) rotate(360deg);
                }
              }
              
              /* Hover effects for cards */
              .card-hover {
                transition: transform 0.3s ease, box-shadow 0.3s ease;
              }
              
              .card-hover:hover {
                transform: translateY(-5px);
                box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
              }
              
              /* Add card hover class to all cards */
              .bg-card, .bg-background {
                @apply card-hover;
              }
            `}</style>
            
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
    </div>
  );
};

export default TestCommunityPage;
