/**
 * XP and Ranking Demo Page
 * 
 * This page demonstrates the XP and Ranking system components together
 */
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useUserXP } from "@/lib/sdk/xpSDK";
import { useUserRanking } from "@/lib/sdk/rankingSDK";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import XPProgressBar from "@/components/xp/XPProgressBar";
import XPHistoryList from "@/components/xp/XPHistoryList";
import RankingBadge from "@/components/ranking/RankingBadge";
import RankingHistoryList from "@/components/ranking/RankingHistoryList";
import { InfoIcon } from 'lucide-react';

export default function XPRankingDemoPage() {
  const [userId, setUserId] = useState<number>(1); // Default to user ID 1
  const [inputUserId, setInputUserId] = useState<string>("1");
  
  // Get both XP and Ranking data for selected user
  const xpQueryConfig = useUserXP(userId);
  const { data: xpData, isLoading: xpLoading } = useQuery(xpQueryConfig);
  const rankingQueryConfig = useUserRanking(userId);
  const { data: rankingData, isLoading: rankingLoading } = useQuery(rankingQueryConfig);
  
  const handleUserIdChange = () => {
    const newId = parseInt(inputUserId);
    if (!isNaN(newId) && newId > 0) {
      setUserId(newId);
    }
  };
  
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">XP & Ranking System Demo</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl">User Selection</CardTitle>
          <CardDescription>
            Enter a user ID to view their XP and ranking information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Input
              value={inputUserId}
              onChange={(e) => setInputUserId(e.target.value)}
              placeholder="User ID"
              type="number"
              min="1"
              className="max-w-[100px]"
            />
            <Button onClick={handleUserIdChange}>
              View User
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Experience Points</CardTitle>
            <CardDescription>
              User progress in the XP system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <XPProgressBar userId={userId} />
            
            <div className="mt-4 border rounded-md p-4 bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <InfoIcon className="h-4 w-4 text-blue-500" />
                <h3 className="font-medium">About XP</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Experience Points (XP) are earned through playing matches, participating in tournaments, 
                and earning achievements. They represent a player's overall activity and progression.
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Ranking System</CardTitle>
            <CardDescription>
              User progress in the CourtIQ™ Ranking system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RankingBadge userId={userId} showProgress={true} size="lg" />
            
            <div className="mt-4 border rounded-md p-4 bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <InfoIcon className="h-4 w-4 text-blue-500" />
                <h3 className="font-medium">About Ranking</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                The CourtIQ™ Ranking system tracks your competitive performance based on match 
                outcomes and tournament placements. Climb through the tiers from Bronze to Grandmaster.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="xp" className="mb-6">
        <TabsList className="mb-2">
          <TabsTrigger value="xp">XP History</TabsTrigger>
          <TabsTrigger value="ranking">Ranking History</TabsTrigger>
        </TabsList>
        <TabsContent value="xp">
          <XPHistoryList userId={userId} limit={15} />
        </TabsContent>
        <TabsContent value="ranking">
          <RankingHistoryList userId={userId} limit={15} />
        </TabsContent>
      </Tabs>
      
      <Separator className="my-6" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Raw XP Data</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-md text-xs overflow-auto max-h-[300px]">
              {xpLoading 
                ? "Loading XP data..." 
                : JSON.stringify(xpData, null, 2) || "No XP data found"}
            </pre>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Raw Ranking Data</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-md text-xs overflow-auto max-h-[300px]">
              {rankingLoading 
                ? "Loading ranking data..." 
                : JSON.stringify(rankingData, null, 2) || "No ranking data found"}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}