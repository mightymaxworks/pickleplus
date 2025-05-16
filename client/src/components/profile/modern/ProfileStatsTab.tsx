/**
 * PKL-278651-PROF-0012-COMP - Profile Stats Tab
 * 
 * Statistics tab for the modern profile page, showing performance metrics and visualizations.
 * 
 * @framework Framework5.3
 * @version 1.1.0
 * @lastUpdated 2025-04-27
 */

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { EnhancedUser } from "@/types/enhanced-user";
import { useDerivedData } from "@/contexts/DerivedDataContext";
import { Award, Check, Edit2, Star, ArrowRight } from 'lucide-react';
import CourtIQRadarChart from "./CourtIQRadarChart";
import PerformanceMetricsCard from "./PerformanceMetricsCard";
import RankingCard from "./RankingCard";
import SkillDistributionChart from "./SkillDistributionChart";
import XPProgressDisplay from "./XPProgressDisplay";
import { RatingConverter } from "../RatingConverter";
import { ExternalRatingsSection } from "../ExternalRatingsSection";

/**
 * Helper function to calculate rating tier from score
 */
function getRatingTierFromScore(overallRating: number): string {
  if (overallRating >= 4.5) {
    return "Elite";
  } else if (overallRating >= 4.0) {
    return "Expert";
  } else if (overallRating >= 3.5) {
    return "Advanced";
  } else if (overallRating >= 3.0) {
    return "Intermediate";
  } else if (overallRating >= 2.0) {
    return "Developing";
  } else {
    return "Beginner";
  }
}

interface ProfileStatsTabProps {
  user: EnhancedUser;
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  }
};

export default function ProfileStatsTab({
  user
}: ProfileStatsTabProps) {
  const { calculationService } = useDerivedData();
  
  // Calculate dimension ratings
  const dimensionRatings = useMemo(() => 
    calculationService.calculateDimensionRatings(user), 
    [calculationService, user]
  );

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ENHANCED: Large Ranking Points Card - The centerpiece of the profile */}
      <motion.div 
        variants={itemVariants} 
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="p-1 bg-gradient-to-r from-primary/30 to-primary/10 rounded-xl shadow-md">
          <RankingCard 
            user={user} 
            calculationService={calculationService}
            className="border-0"
          />
        </div>
      </motion.div>
      
      {/* XP Progress (kept as it's closely related to ranking) */}
      <motion.div variants={itemVariants}>
        <XPProgressDisplay user={user} />
      </motion.div>
      
      {/* Simple DUPR Rating Section - Compact version */}
      <motion.div variants={itemVariants}>
        <Card className="border border-amber-100 dark:border-amber-900/30">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-500" />
                <CardTitle>DUPR Rating</CardTitle>
              </div>
              
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/30 px-4 py-2 rounded-lg flex items-center justify-center">
                <span className="text-3xl font-bold text-amber-700 dark:text-amber-400">
                  {typeof user.duprRating === 'number' ? 
                    user.duprRating.toFixed(2) : 
                    <span className="text-base text-amber-600/70 italic">Not set</span>
                  }
                </span>
              </div>
            </div>
            <CardDescription>
              Dynamic Universal Pickleball Rating - Industry standard (2.0-7.0)
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs h-8 border-amber-300 text-amber-700 hover:bg-amber-50"
                onClick={() => {
                  // Open DUPR rating update panel in a simpler way
                  const tabs = document.querySelector('[value="manage"]') as HTMLButtonElement;
                  if (tabs) tabs.click();
                }}
              >
                <Edit2 className="h-3.5 w-3.5 mr-1.5" />
                Update Your DUPR
              </Button>
            </div>
            
            {/* Simplified Tabbed Interface */}
            <Tabs defaultValue="manage" className="w-full mt-4">
              <TabsList className="grid w-full grid-cols-1 mb-4">
                <TabsTrigger value="manage">Manage Your DUPR Rating</TabsTrigger>
              </TabsList>
              
              {/* Simplified Rating Management */}
              <TabsContent value="manage">
                <ExternalRatingsSection 
                  user={user} 
                  isEditable={true} 
                  isCurrentUser={true} 
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Performance Stats in a collapsible section */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="cursor-pointer" onClick={() => document.getElementById('performance-metrics')?.classList.toggle('hidden')}>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Performance Metrics</CardTitle>
              <ArrowRight className="h-5 w-5 transition-transform" />
            </div>
            <CardDescription>View your match statistics and performance data</CardDescription>
          </CardHeader>
          <CardContent id="performance-metrics" className="hidden">
            <PerformanceMetricsCard user={user} />
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}