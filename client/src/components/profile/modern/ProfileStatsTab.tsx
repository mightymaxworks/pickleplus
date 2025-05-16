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
      {/* Ranking Points - Moved to the top as the primary focus */}
      <motion.div variants={itemVariants} className="mb-8">
        <RankingCard 
          user={user} 
          calculationService={calculationService}
          className="border-primary/30"
        />
      </motion.div>
      
      {/* Performance Stats & XP Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <PerformanceMetricsCard user={user} />
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <XPProgressDisplay user={user} />
        </motion.div>
      </div>
      
      {/* Simplified Rating System Section */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500" />
              DUPR Rating
            </CardTitle>
            <CardDescription>
              Dynamic Universal Pickleball Rating - Industry standard rating system (2.0-7.0)
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              {/* DUPR Rating Display */}
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/30 p-5 rounded-lg flex flex-col items-center justify-center min-w-[150px]">
                <div className="text-xs font-medium text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-1">Your DUPR</div>
                <div className="text-4xl font-bold text-amber-700 dark:text-amber-400 my-1">
                  {typeof user.duprRating === 'number' ? 
                    user.duprRating.toFixed(2) : 
                    <span className="text-base text-amber-600/70 dark:text-amber-500/70 italic">Not set</span>
                  }
                </div>
                {user.duprRating && (
                  <div className="text-xs mt-1">
                    {user.externalRatingsVerified ? (
                      <span className="flex items-center text-green-600 dark:text-green-400 gap-0.5">
                        <Check className="h-3 w-3" /> Verified
                      </span>
                    ) : (
                      <span className="text-amber-600/80 dark:text-amber-500/80">Self-reported</span>
                    )}
                  </div>
                )}
              </div>
              
              {/* DUPR Information */}
              <div className="flex-1 space-y-3">
                <p className="text-sm">
                  DUPR is the most widely accepted rating system in pickleball, providing a global standard for player skill assessment. 
                  Your DUPR rating is calculated based on match outcomes against players of known ratings.
                </p>
                
                <div className="flex justify-start gap-3 mt-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs h-8 border-amber-300 text-amber-700 hover:bg-amber-50"
                    onClick={() => {
                      const manageTab = document.querySelector('[value="manage"]') as HTMLButtonElement;
                      if (manageTab) manageTab.click();
                    }}
                  >
                    <Edit2 className="h-3.5 w-3.5 mr-1.5" />
                    Update Your DUPR
                  </Button>
                  
                  <Button
                    variant="link"
                    size="sm"
                    className="text-xs h-8 text-amber-700"
                    onClick={() => {
                      const converterTab = document.querySelector('[value="converter"]') as HTMLButtonElement;
                      if (converterTab) converterTab.click();
                    }}
                  >
                    Rating Converter Tool
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Tabbed Interface for Additional Rating Features */}
            <Tabs defaultValue="manage" className="w-full mt-6">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="manage">Update Your Rating</TabsTrigger>
                <TabsTrigger value="converter">Rating Converter</TabsTrigger>
              </TabsList>
              
              {/* Tab 1: Manage Ratings - Simplified to focus only on DUPR */}
              <TabsContent value="manage">
                <ExternalRatingsSection 
                  user={user} 
                  isEditable={true} 
                  isCurrentUser={true} 
                />
              </TabsContent>
              
              {/* Tab 2: Rating Converter Tool */}
              <TabsContent value="converter">
                <RatingConverter />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* CourtIQ Overview - Moved down and made less prominent */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Skill Breakdown</CardTitle>
            <CardDescription>Detailed breakdown of your skills across different dimensions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Rating Card */}
              <div className="bg-muted/50 p-4 rounded-lg flex flex-col items-center justify-center">
                <div className="text-sm text-muted-foreground">Overall Rating</div>
                <div className="text-4xl font-bold my-2">
                  {calculationService.calculateOverallRating(user).toFixed(1)}
                </div>
                <div className="text-xs font-medium bg-primary/10 px-3 py-1 rounded-full">
                  {getRatingTierFromScore(calculationService.calculateOverallRating(user))}
                </div>
              </div>
              
              {/* Radar Chart */}
              <div className="md:col-span-2">
                <CourtIQRadarChart dimensions={dimensionRatings} />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}