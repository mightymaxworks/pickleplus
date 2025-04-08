import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { CheckCircle, Zap } from "lucide-react";

interface ProfileCompletenessCardProps {
  user: any;
  profileCompletion: number;
}

export function ProfileCompletenessCard({ user, profileCompletion }: ProfileCompletenessCardProps) {
  // XP targets for profile completion
  const completionTiers = [
    { threshold: 25, reward: 25 },
    { threshold: 50, reward: 50 },
    { threshold: 75, reward: 75 }, 
    { threshold: 100, reward: 100 }
  ];
  
  // Find next tier
  const getCurrentTier = () => {
    if (profileCompletion >= 100) return null;
    
    for (const tier of completionTiers) {
      if (profileCompletion < tier.threshold) {
        return tier;
      }
    }
    
    return null;
  };
  
  // Current tier
  const currentTier = getCurrentTier();
  
  // If profile is complete, show special completed card
  if (profileCompletion >= 100) {
    return (
      <Card className="bg-gradient-to-br from-[#4CAF50]/10 to-transparent">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 text-[#4CAF50]" />
            Profile Complete!
          </CardTitle>
          <CardDescription>
            Your profile is 100% complete
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-[#FF5722]" />
            <div className="text-sm">
              <span className="font-semibold">+100 XP</span> earned for completing your profile!
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <CheckCircle className="h-5 w-5 mr-2 text-[#4CAF50]" />
          Profile Completeness
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>{profileCompletion}% Complete</span>
            {currentTier && (
              <span className="text-[#FF5722]">+{currentTier.reward} XP at {currentTier.threshold}%</span>
            )}
          </div>
          
          <Progress value={profileCompletion} className="h-2 mb-2" />
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <div className="space-x-2">
              {completionTiers.map((tier, index) => (
                <span 
                  key={index}
                  className={profileCompletion >= tier.threshold ? "text-[#4CAF50]" : ""}
                >
                  {tier.threshold}%{index < completionTiers.length - 1 ? " →" : ""}
                </span>
              ))}
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            asChild
            className="w-full mt-3"
          >
            <Link href="/profile/edit">
              Complete Your Profile
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}