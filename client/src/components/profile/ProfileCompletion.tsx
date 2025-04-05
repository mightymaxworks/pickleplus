import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, CheckCircle2 } from "lucide-react";

interface ProfileCompletionProps {
  completionData: {
    completionPercentage: number;
    completedFields: string[];
    incompleteFields: string[];
    xpEarned: number;
    potentialXp: number;
  };
}

// Helper to get the tier level based on completion percentage
function getRewardTier(percentage: number): { label: string; xp: number } {
  if (percentage >= 90) return { label: "Gold", xp: 150 };
  if (percentage >= 70) return { label: "Silver", xp: 100 };
  if (percentage >= 50) return { label: "Bronze", xp: 75 };
  return { label: "Basic", xp: 50 };
}

export function ProfileCompletion({ completionData }: ProfileCompletionProps) {
  const { completionPercentage, completedFields, incompleteFields, xpEarned, potentialXp } = completionData;
  const tier = getRewardTier(completionPercentage);
  
  return (
    <div className="profile-completion">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <span className="text-sm font-medium">{completionPercentage}% Complete</span>
          {completionPercentage >= 50 && (
            <Badge variant="outline" className="ml-2 flex items-center gap-1 bg-gradient-to-r from-amber-50 to-yellow-100 text-amber-700 border-amber-200">
              <Trophy size={12} className="text-amber-500" /> {tier.label} Tier
            </Badge>
          )}
        </div>
        <div className="text-sm text-green-600 font-medium">
          {xpEarned > 0 ? `+${xpEarned} XP earned` : `Earn up to ${potentialXp} XP`}
        </div>
      </div>
      
      <Progress value={completionPercentage} className="h-2 mb-4" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center">
            <CheckCircle2 size={16} className="mr-1 text-green-500" /> 
            Completed ({completedFields.length})
          </h4>
          <div className="space-y-1">
            {completedFields.map((field, index) => (
              <div key={index} className="text-sm text-gray-600 flex items-center">
                <CheckCircle2 size={14} className="mr-2 text-green-500" />
                {field}
              </div>
            ))}
          </div>
        </div>
        
        {incompleteFields.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">
              Suggested Next ({incompleteFields.length})
            </h4>
            <div className="space-y-1">
              {incompleteFields.slice(0, 5).map((field, index) => (
                <div key={index} className="text-sm text-gray-600">
                  {field}
                </div>
              ))}
              {incompleteFields.length > 5 && (
                <div className="text-xs text-gray-500 italic">
                  +{incompleteFields.length - 5} more fields to complete
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-4 pt-3 border-t border-gray-100">
        <TierMarker 
          percentage={completionPercentage} 
          tiers={[
            { level: 50, label: "Bronze", xp: 75 },
            { level: 70, label: "Silver", xp: 100 },
            { level: 90, label: "Gold", xp: 150 }
          ]} 
        />
      </div>
    </div>
  );
}

function TierMarker({ 
  percentage, 
  tiers 
}: { 
  percentage: number, 
  tiers: Array<{ level: number, label: string, xp: number }> 
}) {
  return (
    <div className="relative h-10 mb-4 mt-4">
      {/* Progress line */}
      <div className="absolute w-full h-1 bg-gray-200 top-3"></div>
      
      {/* Tier markers */}
      {tiers.map((tier, index) => (
        <div 
          key={index} 
          className="absolute flex flex-col items-center" 
          style={{ left: `${tier.level}%`, transform: 'translateX(-50%)' }}
        >
          <div className={`w-3 h-3 rounded-full ${percentage >= tier.level ? 'bg-amber-500' : 'bg-gray-300'} relative top-2`}></div>
          <div className="text-xs mt-3 text-center font-medium whitespace-nowrap">
            {tier.label}
          </div>
        </div>
      ))}
      
      {/* Starting point */}
      <div className="absolute left-0 flex flex-col items-center">
        <div className={`w-3 h-3 rounded-full ${percentage > 0 ? 'bg-amber-500' : 'bg-gray-300'} relative top-2`}></div>
        <div className="text-xs mt-3 text-center font-medium">
          0%
        </div>
      </div>
      
      {/* Current position indicator */}
      {percentage > 0 && percentage < 100 && (
        <div 
          className="absolute flex flex-col items-center" 
          style={{ left: `${percentage}%`, transform: 'translateX(-50%)' }}
        >
          <div className="w-4 h-4 rounded-full bg-green-500 relative top-[6px] border-2 border-white shadow-sm"></div>
        </div>
      )}
      
      {/* End point - 100% */}
      <div className="absolute right-0 flex flex-col items-center">
        <div className={`w-3 h-3 rounded-full ${percentage >= 100 ? 'bg-amber-500' : 'bg-gray-300'} relative top-2`}></div>
        <div className="text-xs mt-3 text-center font-medium">
          100%
        </div>
      </div>
    </div>
  );
}