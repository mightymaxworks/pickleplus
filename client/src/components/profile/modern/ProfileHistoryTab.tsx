/**
 * PKL-278651-PROF-0013-COMP - Profile History Tab
 * 
 * History tab for the modern profile page, showing match history and achievements.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastUpdated 2025-04-26
 */

import { motion } from "framer-motion";
import { EnhancedUser } from "@/types/enhanced-user";
import { useDerivedData } from "@/contexts/DerivedDataContext";
import MatchHistoryTimeline from "./MatchHistoryTimeline";
import TournamentShowcase from "./TournamentShowcase";
import AchievementsGallery from "./AchievementsGallery";
import PerformanceTrends from "./PerformanceTrends";

interface ProfileHistoryTabProps {
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

export default function ProfileHistoryTab({
  user
}: ProfileHistoryTabProps) {
  const { calculationService } = useDerivedData();
  
  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Match History Timeline */}
      <motion.div variants={itemVariants}>
        <MatchHistoryTimeline user={user} />
      </motion.div>
      
      {/* Performance Trends */}
      <motion.div variants={itemVariants}>
        <PerformanceTrends user={user} />
      </motion.div>
      
      {/* Tournament Showcase */}
      <motion.div variants={itemVariants}>
        <TournamentShowcase user={user} />
      </motion.div>
      
      {/* Achievements Gallery */}
      <motion.div variants={itemVariants}>
        <AchievementsGallery user={user} />
      </motion.div>
    </motion.div>
  );
}