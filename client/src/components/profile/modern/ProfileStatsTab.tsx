/**
 * PKL-278651-PROF-0012-COMP - Profile Stats Tab
 * 
 * Statistics tab for the modern profile page, showing performance metrics and visualizations.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastUpdated 2025-04-26
 */

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EnhancedUser } from "@/types/enhanced-user";
import { useDerivedData } from "@/contexts/DerivedDataContext";
import CourtIQRadarChart from "./CourtIQRadarChart";
import PerformanceMetricsCard from "./PerformanceMetricsCard";
import RankingCard from "./RankingCard";
import SkillDistributionChart from "./SkillDistributionChart";
import XPProgressDisplay from "./XPProgressDisplay";

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
      {/* Court IQ Overview */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>CourtIQ™ Rating Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Rating Card */}
              <div className="bg-muted/50 p-6 rounded-lg flex flex-col items-center justify-center">
                <div className="text-sm text-muted-foreground">Overall Rating</div>
                <div className="text-5xl font-bold my-2">
                  {calculationService.calculateOverallRating(user).toFixed(1)}
                </div>
                <div className="text-sm font-medium bg-primary/10 px-3 py-1 rounded-full">
                  {getRatingTierFromScore(calculationService.calculateOverallRating(user))}
                </div>
              </div>
              
              {/* Radar Chart */}
              <div className="md:col-span-2">
                <CourtIQRadarChart dimensions={dimensionRatings} />
              </div>
            </div>
            
            <div className="mt-8 text-sm text-muted-foreground">
              <p>
                The CourtIQ™ rating system evaluates your pickleball performance across five key dimensions, 
                providing a comprehensive multi-faceted assessment of your skill level.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Performance Metrics and Rankings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <PerformanceMetricsCard user={user} />
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <RankingCard 
            user={user} 
            calculationService={calculationService}
          />
        </motion.div>
      </div>
      
      {/* Skill Distribution and XP Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <SkillDistributionChart user={user} />
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <XPProgressDisplay user={user} />
        </motion.div>
      </div>
      
      {/* External Ratings */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>External Rating Systems</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* DUPR Rating */}
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <div className="text-sm text-muted-foreground mb-1">DUPR</div>
                <div className="text-2xl font-bold">
                  {user.duprRating ? 
                    user.duprRating.toFixed(2) : 
                    <span className="text-sm text-muted-foreground">Not set</span>
                  }
                </div>
              </div>
              
              {/* UTPR Rating */}
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <div className="text-sm text-muted-foreground mb-1">UTPR</div>
                <div className="text-2xl font-bold">
                  {user.utprRating ? 
                    user.utprRating.toFixed(1) : 
                    <span className="text-sm text-muted-foreground">Not set</span>
                  }
                </div>
              </div>
              
              {/* WPR Rating */}
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <div className="text-sm text-muted-foreground mb-1">WPR</div>
                <div className="text-2xl font-bold">
                  {user.wprRating ? 
                    user.wprRating.toFixed(1) : 
                    <span className="text-sm text-muted-foreground">Not set</span>
                  }
                </div>
              </div>
            </div>
            
            {user.externalRatingsVerified ? (
              <div className="mt-4 text-center text-xs text-muted-foreground bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 p-2 rounded-md">
                External ratings verified ✓
              </div>
            ) : (
              <div className="mt-4 text-center text-xs text-muted-foreground">
                External ratings are self-reported and not verified
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}