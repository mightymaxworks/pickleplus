/**
 * Mastery Paths Page
 * Full page for exploring the CourtIQ™ Mastery Paths system
 * 
 * Sprint: PKL-278651-RATE-0004-MADV-UI
 */

/**
 * PKL-278651-ROUTE-0001-FIX - Mastery Paths Page
 * 
 * Fixed to use direct rendering instead of DashboardLayout to prevent
 * double header issues. The ProtectedRouteWithLayout will handle
 * authentication and layout.
 */

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import MasteryPathsDisplay from '@/components/mastery/MasteryPathsDisplay';
import TierProgressionHistory from '@/components/mastery/TierProgressionHistory';
import TierBenefitsCard from '@/components/mastery/TierBenefitsCard';
import PathsVisualization from '@/components/mastery/PathsVisualization';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { Award, Shield, Crown, TrendingUp, Zap, Medal } from 'lucide-react';

export default function MasteryPathsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  
  if (!user) return null;
  
  return (
    <>
      {/* Page Header */}
      <div className="mb-8">
        <motion.h1 
          className="text-3xl font-bold mb-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          CourtIQ™ Mastery Paths
        </motion.h1>
        <motion.p 
          className="text-muted-foreground max-w-3xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Our adaptive skill progression system helps you chart your pickleball journey, 
          providing personalized tier recommendations based on your playing style and performance.
        </motion.p>
      </div>
      
      {/* Overview Cards */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 flex items-center gap-4">
          <div className="bg-blue-500 p-3 rounded-lg text-white">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-medium">Foundation Path</h3>
            <p className="text-sm text-muted-foreground">Ratings 0.0 - 2.5</p>
          </div>
        </div>
        
        <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10 flex items-center gap-4">
          <div className="bg-purple-500 p-3 rounded-lg text-white">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-medium">Evolution Path</h3>
            <p className="text-sm text-muted-foreground">Ratings 2.6 - 5.0</p>
          </div>
        </div>
        
        <div className="p-4 rounded-lg bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-900/10 flex items-center gap-4">
          <div className="bg-amber-500 p-3 rounded-lg text-white">
            <Crown className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-medium">Pinnacle Path</h3>
            <p className="text-sm text-muted-foreground">Ratings 5.1 - 9.0</p>
          </div>
        </div>
      </motion.div>
      
      {/* Tabs for different sections */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 md:grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="status">Your Status</TabsTrigger>
          <TabsTrigger value="history">Progression History</TabsTrigger>
          <TabsTrigger value="benefits">Tier Benefits</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <h2 className="text-2xl font-semibold mb-4">CourtIQ™ Mastery System Overview</h2>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <span>Tier-Adaptive Governance</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                <h4 className="font-medium text-blue-500 mb-2">Lower Tiers</h4>
                <ul className="space-y-2 text-sm list-disc pl-4">
                  <li>More forgiving with accelerated promotion</li>
                  <li>Strong demotion protection</li>
                  <li>Longer grace periods</li>
                  <li>Focus on encouragement and growth</li>
                </ul>
              </div>
              
              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                <h4 className="font-medium text-purple-500 mb-2">Middle Tiers</h4>
                <ul className="space-y-2 text-sm list-disc pl-4">
                  <li>Balanced approach to progression</li>
                  <li>Standard promotion requirements</li>
                  <li>Moderate demotion protection</li>
                  <li>Focus on consistency and skill development</li>
                </ul>
              </div>
              
              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                <h4 className="font-medium text-amber-500 mb-2">Higher Tiers</h4>
                <ul className="space-y-2 text-sm list-disc pl-4">
                  <li>Stricter standards for progression</li>
                  <li>Rigorous validation requirements</li>
                  <li>Limited demotion protection</li>
                  <li>Focus on excellence and mastery</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" />
              <span>Dynamic Progression System</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                <h4 className="font-medium text-indigo-500 mb-2">Tier Health</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Tier Health represents your standing within your current tier. It affects:
                </p>
                <ul className="space-y-2 text-sm list-disc pl-4">
                  <li>Demotion risk assessment</li>
                  <li>Match rewards and bonuses</li>
                  <li>Feature unlocks within your tier</li>
                  <li>Visibility in leaderboards and rankings</li>
                </ul>
              </div>
              
              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                <h4 className="font-medium text-green-500 mb-2">Promotion Progress</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Promotion Progress tracks your journey to the next tier. It includes:
                </p>
                <ul className="space-y-2 text-sm list-disc pl-4">
                  <li>Matches above threshold requirement</li>
                  <li>Rating consistency indicators</li>
                  <li>Performance against higher-rated players</li>
                  <li>Secondary metrics like error rates and scoring patterns</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Medal className="h-5 w-5 text-blue-500" />
              <span>All Mastery Paths</span>
            </h3>
            <PathsVisualization />
          </div>
        </TabsContent>
        
        <TabsContent value="status" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <MasteryPathsDisplay />
            </div>
            <div className="md:col-span-2">
              <PathsVisualization compact={true} />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="history" className="space-y-6">
          <TierProgressionHistory />
        </TabsContent>
        
        <TabsContent value="benefits" className="space-y-6">
          <TierBenefitsCard />
        </TabsContent>
      </Tabs>
    </>
  );
}