/**
 * PKL-278651-PROF-0005-COMP - Optimized Profile Tabs
 * 
 * This component provides tab-based, lazily-loaded sections for the profile page
 * with on-demand data loading and optimized rendering.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastUpdated 2025-04-26
 */

import { useState, useMemo, useCallback, Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EnhancedUser } from "@/types/enhanced-user";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { Loader2, User, Settings, Info, Award, History, Dumbbell } from "lucide-react";
import { motion } from 'framer-motion';

// Import section components
import { ProfileDetailsSection } from "@/components/profile/sections/ProfileDetailsSection";
import { ProfileEquipmentSection } from "@/components/profile/sections/ProfileEquipmentSection";
import { ProfileStatisticsSection } from "@/components/profile/sections/ProfileStatisticsSection";
import { ProfileAchievementsSection } from "@/components/profile/sections/ProfileAchievementsSection";
import { ProfileHistorySection } from "@/components/profile/sections/ProfileHistorySection";
import { ProfileSettingsSection } from "@/components/profile/sections/ProfileSettingsSection";
// EMERGENCY FIX: Removing DerivedDataContext dependency
import { DataCalculationService, CalculatedUserMetrics } from "@/services/DataCalculationService";

export type ProfileTabId = 
  | "details" 
  | "statistics" 
  | "equipment" 
  | "achievements" 
  | "history" 
  | "settings";

interface OptimizedProfileTabsProps {
  user: EnhancedUser;
  initialTab?: ProfileTabId;
  allowedTabs?: ProfileTabId[];
  onTabChange?: (tab: ProfileTabId) => void;
}

export function OptimizedProfileTabs({
  user,
  initialTab = "details",
  allowedTabs,
  onTabChange
}: OptimizedProfileTabsProps) {
  // EMERGENCY FIX: Create calculation service directly instead of using the context
  const calculationService = useMemo(() => new DataCalculationService(), []);
  const calculatedMetrics = useMemo(() => {
    console.log("EMERGENCY FIX: Performing direct calculations in ProfileTabs");
    return calculationService.calculateUserMetrics(user);
  }, [calculationService, user]);

  const [activeTab, setActiveTab] = useState<ProfileTabId>(initialTab);
  const [loadedTabs, setLoadedTabs] = useState<ProfileTabId[]>([initialTab]);
  const isMobile = useMediaQuery("(max-width: 767px)");
  
  // Handle tab change
  const handleTabChange = useCallback((tab: ProfileTabId) => {
    setActiveTab(tab);
    
    // Track which tabs have been loaded
    if (!loadedTabs.includes(tab)) {
      setLoadedTabs(prev => [...prev, tab]);
    }
    
    // Call external change handler if provided
    if (onTabChange) {
      onTabChange(tab);
    }
  }, [loadedTabs, onTabChange]);
  
  // Filter tabs if allowedTabs is provided
  const tabs = useMemo(() => {
    const allTabs: Array<{
      id: ProfileTabId;
      label: string;
      icon: React.ReactNode;
    }> = [
      { id: "details", label: "Details", icon: <Info className="h-4 w-4" /> },
      { id: "statistics", label: "Stats", icon: <Dumbbell className="h-4 w-4" /> },
      { id: "equipment", label: "Equipment", icon: <Dumbbell className="h-4 w-4" /> },
      { id: "achievements", label: "Achievements", icon: <Award className="h-4 w-4" /> },
      { id: "history", label: "History", icon: <History className="h-4 w-4" /> },
      { id: "settings", label: "Settings", icon: <Settings className="h-4 w-4" /> }
    ];
    
    return allowedTabs 
      ? allTabs.filter(tab => allowedTabs.includes(tab.id))
      : allTabs;
  }, [allowedTabs]);
  
  // Lazy load components based on active tab to improve initial load time
  const renderSection = useCallback((tabId: ProfileTabId) => {
    // Only render if this tab has been activated at least once
    if (!loadedTabs.includes(tabId)) {
      return null;
    }
    
    switch (tabId) {
      case "details":
        return <ProfileDetailsSection user={user} />;
        
      case "statistics":
        // Ensure calculatedMetrics is available and initialized
        if (!calculatedMetrics) {
          return <LoadingSection />;
        }
        
        try {
          return (
            <ProfileStatisticsSection 
              user={user} 
              calculatedMetrics={calculatedMetrics} 
            />
          );
        } catch (error) {
          console.error("Error rendering statistics section:", error);
          return (
            <div className="col-span-12 p-6 text-center">
              <p className="text-muted-foreground">
                There was an error loading your statistics. Please try again.
              </p>
            </div>
          );
        }
        
      case "equipment":
        return <ProfileEquipmentSection user={user} />;
        
      case "achievements":
        return <ProfileAchievementsSection user={user} />;
        
      case "history":
        return <ProfileHistorySection user={user} />;
        
      case "settings":
        return <ProfileSettingsSection user={user} />;
        
      default:
        return null;
    }
  }, [user, loadedTabs, calculatedMetrics]);
  
  const gridLayout = isMobile 
    ? "space-y-6" 
    : "grid grid-cols-12 gap-6";
    
  const tabsVariant = isMobile ? "fullWidth" : "default";
  
  return (
    <Tabs
      defaultValue={initialTab}
      value={activeTab}
      onValueChange={(value) => handleTabChange(value as ProfileTabId)}
      className="w-full"
    >
      <TabsList className={`mb-6 ${isMobile ? 'w-full grid' : ''}`} style={isMobile ? { gridTemplateColumns: `repeat(${Math.min(tabs.length, 3)}, 1fr)` } : undefined}>
        {tabs.map(tab => (
          <TabsTrigger 
            key={tab.id} 
            value={tab.id}
            className={isMobile ? "flex justify-center items-center" : ""}
          >
            {tab.icon}
            <span className={isMobile ? "ml-2" : "ml-2"}>
              {tab.label}
            </span>
          </TabsTrigger>
        ))}
      </TabsList>
      
      {tabs.map(tab => (
        <TabsContent key={tab.id} value={tab.id} className={gridLayout}>
          <Suspense fallback={<LoadingSection />}>
            {renderSection(tab.id)}
          </Suspense>
        </TabsContent>
      ))}
    </Tabs>
  );
}

// Loading component for sections
function LoadingSection() {
  return (
    <div className="w-full h-64 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative w-16 h-16">
          <motion.div
            className="absolute inset-0"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <polygon
                points="50,5 90,27.5 90,72.5 50,95 10,72.5 10,27.5"
                fill="none"
                stroke="#f97316"
                strokeWidth="3"
                opacity="0.8"
              />
            </svg>
          </motion.div>
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="w-4 h-4 rounded-full bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 blur-sm" />
          </motion.div>
        </div>
        <motion.p 
          className="text-white text-sm"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Loading your profile...
        </motion.p>
      </div>
    </div>
  );
}