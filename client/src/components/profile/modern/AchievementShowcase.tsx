/**
 * PKL-278651-PROF-0024-ACHIEVE - Achievement Showcase
 * 
 * This component displays the user's achievements in an interactive showcase.
 * It's part of the gamification and discovery mechanics for Sprint 4.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastUpdated 2025-04-27
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Trophy, 
  Award, 
  Star, 
  Flag, 
  Shield, 
  Clock, 
  Zap,
  ChevronLeft,
  ChevronRight,
  Lock,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";

// Achievement categories and their icons
type AchievementCategory = 
  | 'tournaments' 
  | 'community' 
  | 'skills' 
  | 'milestones' 
  | 'special';

const CATEGORY_INFO: Record<AchievementCategory, { icon: React.ReactNode; label: string }> = {
  'tournaments': { icon: <Trophy className="h-4 w-4" />, label: 'Tournaments' },
  'community': { icon: <Flag className="h-4 w-4" />, label: 'Community' },
  'skills': { icon: <Zap className="h-4 w-4" />, label: 'Skills' },
  'milestones': { icon: <Clock className="h-4 w-4" />, label: 'Milestones' },
  'special': { icon: <Star className="h-4 w-4" />, label: 'Special' }
};

// Rarity levels for achievements
type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

const RARITY_COLORS: Record<Rarity, string> = {
  'common': 'bg-slate-200 text-slate-700',
  'uncommon': 'bg-green-100 text-green-700',
  'rare': 'bg-blue-100 text-blue-700',
  'epic': 'bg-purple-100 text-purple-700',
  'legendary': 'bg-amber-100 text-amber-700'
};

// Interface for achievement data
export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  rarity: Rarity;
  icon: 'trophy' | 'award' | 'star' | 'flag' | 'shield' | 'clock' | 'zap';
  dateEarned?: string; // ISO date string, if earned
  progress?: number; // 0-100 percentage for in-progress achievements
  hidden?: boolean; // If true, show as locked mystery achievement until earned
  points: number; // XP points awarded
}

// Props for the component
interface AchievementShowcaseProps {
  achievements: Achievement[];
  className?: string;
}

export default function AchievementShowcase({
  achievements,
  className = ""
}: AchievementShowcaseProps) {
  const [activeTab, setActiveTab] = useState<AchievementCategory>('tournaments');
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  
  // Filter achievements by category
  const filteredAchievements = achievements.filter(
    achievement => achievement.category === activeTab
  );
  
  // Count earned achievements by category
  const earnedByCategory = achievements.reduce((acc, achievement) => {
    if (achievement.dateEarned) {
      acc[achievement.category] = (acc[achievement.category] || 0) + 1;
    }
    return acc;
  }, {} as Record<AchievementCategory, number>);
  
  // Count total achievements by category
  const totalByCategory = achievements.reduce((acc, achievement) => {
    acc[achievement.category] = (acc[achievement.category] || 0) + 1;
    return acc;
  }, {} as Record<AchievementCategory, number>);
  
  // Get the icon component for an achievement
  const getAchievementIcon = (iconName: Achievement['icon']) => {
    const IconMap = {
      'trophy': Trophy,
      'award': Award,
      'star': Star,
      'flag': Flag,
      'shield': Shield,
      'clock': Clock,
      'zap': Zap
    };
    
    const IconComponent = IconMap[iconName];
    return <IconComponent className="h-6 w-6" />;
  };
  
  // Format date to a readable string
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Not earned';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">Achievements</CardTitle>
        <CardDescription>Showcase your pickleball journey</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs 
          defaultValue="tournaments" 
          value={activeTab}
          onValueChange={(value) => {
            setActiveTab(value as AchievementCategory);
            setSelectedAchievement(null);
          }}
        >
          <TabsList className="grid grid-cols-5 mb-4">
            {Object.entries(CATEGORY_INFO).map(([category, info]) => (
              <TabsTrigger 
                key={category} 
                value={category}
                className="relative"
              >
                <div className="flex flex-col items-center">
                  {info.icon}
                  <span className="text-xs mt-1">{info.label}</span>
                </div>
                {earnedByCategory[category as AchievementCategory] > 0 && (
                  <Badge 
                    variant="secondary"
                    className="absolute -top-1 -right-1 px-1 min-w-[1.25rem] h-5 flex items-center justify-center text-xs"
                  >
                    {earnedByCategory[category as AchievementCategory]}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {Object.keys(CATEGORY_INFO).map((category) => (
            <TabsContent 
              key={category} 
              value={category}
              className="mt-0 relative min-h-[300px]"
            >
              <AnimatePresence mode="wait">
                {!selectedAchievement ? (
                  <motion.div
                    key="achievement-grid"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ScrollArea className="h-[300px] pr-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {filteredAchievements.length > 0 ? (
                          filteredAchievements.map((achievement) => (
                            <motion.div 
                              key={achievement.id}
                              whileHover={{ scale: 1.03 }}
                              className={cn(
                                "relative p-3 rounded-md border cursor-pointer flex flex-col items-center text-center",
                                achievement.dateEarned 
                                  ? `bg-opacity-10 bg-${achievement.rarity === 'common' ? 'slate' : achievement.rarity}-100 border-${achievement.rarity === 'common' ? 'slate' : achievement.rarity}-200`
                                  : "bg-muted/50 border-muted-foreground/20"
                              )}
                              onClick={() => setSelectedAchievement(achievement)}
                            >
                              {achievement.hidden && !achievement.dateEarned ? (
                                // Mystery achievement
                                <div className="flex flex-col items-center justify-center h-full opacity-70">
                                  <Lock className="h-8 w-8 mb-2 text-muted-foreground" />
                                  <p className="text-sm font-medium">Mystery Achievement</p>
                                  <p className="text-xs text-muted-foreground">Unlock to discover</p>
                                </div>
                              ) : (
                                <>
                                  <div className={cn(
                                    "p-2 rounded-full mb-2",
                                    achievement.dateEarned
                                      ? RARITY_COLORS[achievement.rarity]
                                      : "bg-muted text-muted-foreground"
                                  )}>
                                    {getAchievementIcon(achievement.icon)}
                                  </div>
                                  <h4 className="text-sm font-medium line-clamp-1">{achievement.title}</h4>
                                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                    {achievement.description}
                                  </p>
                                  
                                  {achievement.dateEarned ? (
                                    <Badge variant="outline" className="mt-2 text-xs">
                                      Earned {formatDate(achievement.dateEarned)}
                                    </Badge>
                                  ) : achievement.progress !== undefined ? (
                                    <div className="w-full mt-2">
                                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                        <div
                                          className="h-full bg-primary opacity-70"
                                          style={{ width: `${achievement.progress}%` }}
                                        />
                                      </div>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {achievement.progress}% Complete
                                      </p>
                                    </div>
                                  ) : (
                                    <Badge variant="outline" className="mt-2 text-xs opacity-70">
                                      Not earned
                                    </Badge>
                                  )}
                                </>
                              )}
                            </motion.div>
                          ))
                        ) : (
                          <div className="col-span-full flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                            <Info className="h-12 w-12 mb-2 opacity-20" />
                            <p>No achievements in this category yet</p>
                            <p className="text-sm">Keep playing to earn more!</p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </motion.div>
                ) : (
                  <motion.div
                    key="achievement-detail"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="h-[300px] relative"
                  >
                    <button 
                      className="absolute top-0 left-0 p-1 rounded-full bg-muted/80 z-10"
                      onClick={() => setSelectedAchievement(null)}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    
                    <div className="flex flex-col items-center justify-center h-full px-4">
                      <div className={cn(
                        "p-4 rounded-full mb-4",
                        selectedAchievement.dateEarned
                          ? RARITY_COLORS[selectedAchievement.rarity]
                          : "bg-muted text-muted-foreground"
                      )}>
                        {getAchievementIcon(selectedAchievement.icon)}
                      </div>
                      
                      <h3 className="text-lg font-semibold text-center mb-1">
                        {selectedAchievement.title}
                      </h3>
                      
                      <Badge variant="secondary" className="mb-3">
                        {selectedAchievement.rarity.charAt(0).toUpperCase() + selectedAchievement.rarity.slice(1)}
                      </Badge>
                      
                      <p className="text-sm text-center mb-4">
                        {selectedAchievement.description}
                      </p>
                      
                      {selectedAchievement.dateEarned ? (
                        <div className="flex flex-col items-center">
                          <Badge variant="outline" className="mb-2">
                            Earned on {formatDate(selectedAchievement.dateEarned)}
                          </Badge>
                          <p className="text-sm text-primary">
                            +{selectedAchievement.points} XP
                          </p>
                        </div>
                      ) : selectedAchievement.progress !== undefined ? (
                        <div className="w-full max-w-xs">
                          <div className="flex justify-between text-xs mb-1">
                            <span>{selectedAchievement.progress}% Complete</span>
                            <span>{selectedAchievement.points} XP</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary"
                              style={{ width: `${selectedAchievement.progress}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <Badge variant="outline">Not yet earned</Badge>
                      )}
                    </div>
                    
                    {/* Navigation buttons for achievements */}
                    <div className="absolute bottom-0 w-full flex justify-between px-4 pb-2">
                      <button
                        className="p-1 rounded-full bg-muted/80 disabled:opacity-30"
                        onClick={() => {
                          const currentIndex = filteredAchievements.findIndex(a => a.id === selectedAchievement?.id);
                          if (currentIndex > 0) {
                            setSelectedAchievement(filteredAchievements[currentIndex - 1]);
                          }
                        }}
                        disabled={filteredAchievements.findIndex(a => a.id === selectedAchievement?.id) <= 0}
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      
                      <button
                        className="p-1 rounded-full bg-muted/80 disabled:opacity-30"
                        onClick={() => {
                          const currentIndex = filteredAchievements.findIndex(a => a.id === selectedAchievement?.id);
                          if (currentIndex < filteredAchievements.length - 1) {
                            setSelectedAchievement(filteredAchievements[currentIndex + 1]);
                          }
                        }}
                        disabled={
                          filteredAchievements.findIndex(a => a.id === selectedAchievement?.id) >= 
                          filteredAchievements.length - 1
                        }
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Progress information */}
              <div className="text-xs text-muted-foreground text-center mt-3">
                Earned {earnedByCategory[activeTab] || 0} of {totalByCategory[activeTab] || 0} achievements in this category
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}