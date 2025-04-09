/**
 * PKL-278651-UXPS-0003-MF: Priority Missing Fields Highlighter
 * Highlights the top 3 most important incomplete fields to guide users in profile completion
 */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, Star, Zap, InfoIcon, Target } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from '@/lib/utils';

// Field importance ratings for prioritization (1-10 scale, higher is more important)
const FIELD_IMPORTANCE: Record<string, number> = {
  // Personal fields (critical for basic experience)
  bio: 8,
  location: 7, 
  yearOfBirth: 6,
  privateMessagePreference: 5,
  
  // Equipment fields (important for match simulation)
  paddleBrand: 6,
  paddleModel: 6,
  
  // Playing style fields (critical for matchmaking)
  skillLevel: 10,
  playingSince: 7,
  preferredPosition: 8,
  playingStyle: 9,
  shotStrengths: 9,
  playerGoals: 8,

  // Preferences (critical for experience quality)
  preferredSurface: 8,
  indoorOutdoorPreference: 7,
  competitiveIntensity: 9,
  homeCourtLocations: 8,
  
  // Health & Preferences
  preferredMatchDuration: 7,
  fitnessLevel: 7,
  mobilityLimitations: 6
};

// Field benefit descriptions
const FIELD_BENEFITS: Record<string, string> = {
  bio: "Helps potential partners get to know you and increases match request acceptance rate by 65%",
  location: "Essential for finding nearby players and local events",
  skillLevel: "Critical for fair matchmaking and tournament eligibility",
  playerGoals: "Connects you with players sharing similar pickleball ambitions",
  preferredSurface: "Improves match quality by filtering for your preferred playing conditions",
  competitiveIntensity: "Ensures you're matched with players who share your competitive spirit",
  homeCourtLocations: "Increases chances of finding regular partners at your favorite courts",
  indoorOutdoorPreference: "Helps find partners who play in the same environments you prefer"
};

// Category XP bonuses
const CATEGORY_XP_BONUSES: Record<string, number> = {
  personal: 25,
  equipment: 20,
  playing: 30,
  preferences: 25,
  skills: 30,
  health: 20
};

interface MissingFieldsProps {
  incompleteFields: string[];
  completedFields: string[];
  categoryCompletion: Record<string, number>;
  onEditRequest?: (field?: string) => void;
  fieldDisplayNames: Record<string, string>;
}

export function ProfileCompletionGuidance({
  incompleteFields,
  completedFields,
  categoryCompletion,
  onEditRequest,
  fieldDisplayNames
}: MissingFieldsProps) {
  const [topMissingFields, setTopMissingFields] = useState<string[]>([]);

  // Determine the most important missing fields
  useEffect(() => {
    // Score each incomplete field based on importance and category completion
    const scoredFields = incompleteFields
      .map(field => {
        // Get base importance score (default to 5 if not defined)
        const baseImportance = FIELD_IMPORTANCE[field.toLowerCase()] || 5;
        
        // Find which category this field belongs to
        let category = 'other';
        const fieldKey = field.toLowerCase();
        Object.entries(categoryCompletion).forEach(([cat, completion]) => {
          // If category is below 50% complete, give these fields higher priority
          if (completion < 50) {
            // Add bonus if the field is from a low-completion category
            if (fieldKey.includes(cat) || 
                (field in fieldDisplayNames && fieldDisplayNames[field].toLowerCase().includes(cat))) {
              category = cat;
            }
          }
        });
        
        // Calculate final score (importance + category bonus)
        const categoryBonus = category !== 'other' ? Math.max(0, (100 - (categoryCompletion[category] || 0)) / 10) : 0;
        const finalScore = baseImportance + categoryBonus;
        
        return { field, score: finalScore, category };
      })
      .sort((a, b) => b.score - a.score) // Sort by score descending
      .slice(0, 3) // Take top 3
      .map(item => item.field); // Just keep the field names
      
    setTopMissingFields(scoredFields);
  }, [incompleteFields, categoryCompletion, fieldDisplayNames]);

  // Find which categories are nearly complete (helpful for guiding users to quick wins)
  const nearlyCompleteCategories = Object.entries(categoryCompletion)
    .filter(([_, completion]) => completion >= 70 && completion < 100)
    .sort((a, b) => b[1] - a[1]); // Sort by completion percentage descending

  // Return placeholder if no incomplete fields
  if (incompleteFields.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-green-50 to-transparent border-green-100">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center">
            <Zap className="h-5 w-5 text-green-500 mr-2" />
            <p className="text-sm text-green-700">Profile is 100% complete! Well done!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-[#ff572210] to-transparent">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <div className="flex items-center">
            <Target className="h-4 w-4 mr-2 text-[#FF5722]" />
            <span className="text-[#111]">Priority Fields</span>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <InfoIcon className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent side="left">
                <p className="text-xs max-w-xs">
                  These fields have the biggest impact on your Pickle+ experience.
                  Complete them first for maximum benefit.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
        <CardDescription>
          Complete these priority fields first
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topMissingFields.map((field, index) => {
            // Get display name based on fieldDisplayNames mapping
            const displayName = fieldDisplayNames[field] || field;
            const lowerField = field.toLowerCase();
            // Get field benefit description if available
            const benefit = FIELD_BENEFITS[lowerField] || 
                           `Helps improve your profile completion and matchmaking`;
            
            return (
              <motion.div
                key={field}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "px-3 py-2 rounded-md border",
                  index === 0 ? "bg-amber-50 border-amber-200" : 
                  index === 1 ? "bg-blue-50 border-blue-200" : 
                  "bg-slate-50 border-slate-200"
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center">
                      {index === 0 && <Star className="h-3.5 w-3.5 text-amber-500 mr-1.5" />}
                      <span className={cn(
                        "font-medium text-sm",
                        index === 0 ? "text-amber-700" : 
                        index === 1 ? "text-blue-700" : 
                        "text-slate-700"
                      )}>
                        {displayName}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{benefit}</p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-7 px-2"
                    onClick={() => onEditRequest && onEditRequest(field)}
                  >
                    <span className="text-xs mr-1">Add</span>
                    <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              </motion.div>
            );
          })}

          {/* Quick wins section - showing nearly complete categories */}
          {nearlyCompleteCategories.length > 0 && (
            <div className="pt-2 mt-3 border-t">
              <div className="flex items-center mb-2">
                <Zap className="h-3.5 w-3.5 text-[#FF5722] mr-1.5" />
                <span className="text-xs font-medium">Quick Wins Available</span>
              </div>
              {nearlyCompleteCategories.slice(0, 1).map(([category, completion]) => (
                <div key={category} className="text-xs text-muted-foreground flex items-center justify-between">
                  <span>
                    Your <span className="font-medium text-[#111]">{category}</span> section is {completion}% complete
                  </span>
                  <span className="text-[#FF5722]">+{CATEGORY_XP_BONUSES[category]} XP for 100%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}