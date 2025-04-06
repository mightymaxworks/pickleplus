/**
 * CourtIQ™ Dashboard Component
 * 
 * A comprehensive dashboard displaying all three CourtIQ™ measurement systems:
 * - Ratings (skill level)
 * - Rankings (competitive achievement)
 * - XP (progression and engagement)
 */
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Gauge, Award, Activity, Info } from "lucide-react";
import { RatingCard } from "../rating/RatingCard";
import { RankingCard } from "./RankingCard";
import { XPCard } from "./XPCard";

interface CourtIQDashboardProps {
  userId?: number;
  className?: string;
}

export function CourtIQDashboard({ userId, className = '' }: CourtIQDashboardProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="inline-block px-2 py-1 bg-primary text-white text-xs rounded-md font-bold">CourtIQ™</span>
            Player Intelligence System
          </CardTitle>
          <CardDescription>
            Track your progress across all three measurement systems
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="rating" className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="rating" className="flex items-center gap-1">
                <Gauge className="h-4 w-4" /> Rating
              </TabsTrigger>
              <TabsTrigger value="ranking" className="flex items-center gap-1">
                <Award className="h-4 w-4" /> Ranking
              </TabsTrigger>
              <TabsTrigger value="xp" className="flex items-center gap-1">
                <Activity className="h-4 w-4" /> XP
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="rating" className="space-y-4 mt-0">
              <div className="text-sm text-muted-foreground flex items-start gap-2 mb-2 p-2 bg-muted/50 rounded-md">
                <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p>Your <strong>Rating</strong> measures your skill level based on your match performances against other players.</p>
              </div>
              <RatingCard userId={userId} />
            </TabsContent>
            
            <TabsContent value="ranking" className="space-y-4 mt-0">
              <div className="text-sm text-muted-foreground flex items-start gap-2 mb-2 p-2 bg-muted/50 rounded-md">
                <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p><strong>Ranking Points</strong> measure your competitive achievements through matches and tournaments.</p>
              </div>
              <RankingCard userId={userId} />
            </TabsContent>
            
            <TabsContent value="xp" className="space-y-4 mt-0">
              <div className="text-sm text-muted-foreground flex items-start gap-2 mb-2 p-2 bg-muted/50 rounded-md">
                <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p>Your <strong>XP</strong> (experience points) track your overall platform progression and engagement.</p>
              </div>
              <XPCard userId={userId} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-1">
          <div className="text-xs uppercase font-semibold text-muted-foreground mb-2 tracking-wider">Skill</div>
          <RatingCard userId={userId} />
        </div>
        <div className="col-span-1">
          <div className="text-xs uppercase font-semibold text-muted-foreground mb-2 tracking-wider">Competition</div>
          <RankingCard userId={userId} />
        </div>
        <div className="col-span-1">
          <div className="text-xs uppercase font-semibold text-muted-foreground mb-2 tracking-wider">Progression</div>
          <XPCard userId={userId} />
        </div>
      </div>
    </div>
  );
}