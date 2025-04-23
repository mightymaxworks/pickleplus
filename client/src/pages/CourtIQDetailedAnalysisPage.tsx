import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, HelpCircle, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCourtIQDetailedAnalysis } from "@/hooks/use-courtiq-detailed-analysis";
import { CourtIQDimensionBreakdown } from "@/components/courtiq/CourtIQDimensionBreakdown";
import { CourtIQHistoricalPerformance } from "@/components/courtiq/CourtIQHistoricalPerformance";
import { CourtIQSourceComparison } from "@/components/courtiq/CourtIQSourceComparison";
import { CourtIQSkillRecommendations } from "@/components/courtiq/CourtIQSkillRecommendations";
import { Skeleton } from "@/components/ui/skeleton";

export default function CourtIQDetailedAnalysisPage() {
  const { userId = "" } = useParams();
  const [, navigate] = useLocation();
  const [tab, setTab] = useState("dimensions");
  
  // Parse userId to number, if it's not a valid number, use the current user (undefined)
  const parsedUserId = userId ? parseInt(userId, 10) : undefined;
  const { data, isLoading, error } = useCourtIQDetailedAnalysis(
    isNaN(parsedUserId) ? undefined : parsedUserId
  );

  // Handle back navigation
  const handleBack = () => {
    navigate("/dashboard");
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-4 max-w-6xl">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" onClick={handleBack} className="mr-2">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <Skeleton className="h-8 w-56" />
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-full max-w-md" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-[300px] w-full rounded-md" />
              <Skeleton className="h-[300px] w-full rounded-md" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error state
  if (error || !data) {
    return (
      <div className="container mx-auto p-4 max-w-6xl">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" onClick={handleBack} className="mr-2">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">CourtIQ Analysis</h1>
        </div>
        
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/10">
          <CardHeader>
            <CardTitle>Unable to load CourtIQ data</CardTitle>
            <CardDescription>
              {error?.message || "There was an error loading your performance data. Please try again later."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Make sure you have completed at least 5 matches to view detailed CourtIQ analytics.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={handleBack}>
              Return to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" onClick={handleBack} className="mr-2">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">CourtIQ Detailed Analysis</h1>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="ml-2">
                <HelpCircle className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="max-w-sm">
              <p>CourtIQ provides detailed analytics on your pickleball performance across multiple dimensions. 
              This view shows a deep analysis of your skills and progress.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center">
            <h2 className="text-xl font-semibold">Overall Rating: {data.overallRating}</h2>
            <div className="ml-2 px-3 py-1 rounded-full text-sm font-medium" 
              style={{ backgroundColor: `${data.tierColorCode}30`, color: data.tierColorCode }}>
              {data.tierName}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">Based on {data.recentTrends.matches} matches</p>
        </div>
        
        {data.nextTier && (
          <div className="bg-muted p-2 rounded-md text-sm">
            <div className="flex items-center">
              <Info className="h-4 w-4 mr-1" />
              <span>{data.nextTier.pointsNeeded.toFixed(1)} points to reach <span 
                style={{ color: data.nextTier.colorCode }}>{data.nextTier.name}</span> tier</span>
            </div>
          </div>
        )}
      </div>
      
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="w-full justify-start mb-4 overflow-x-auto">
          <TabsTrigger value="dimensions">Skill Dimensions</TabsTrigger>
          <TabsTrigger value="history">Performance History</TabsTrigger>
          <TabsTrigger value="sources">Source Comparison</TabsTrigger>
          <TabsTrigger value="recommendations">Skill Recommendations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dimensions" className="mt-0">
          <CourtIQDimensionBreakdown data={data} />
        </TabsContent>
        
        <TabsContent value="history" className="mt-0">
          <CourtIQHistoricalPerformance userId={parsedUserId} />
        </TabsContent>
        
        <TabsContent value="sources" className="mt-0">
          <CourtIQSourceComparison data={data} />
        </TabsContent>
        
        <TabsContent value="recommendations" className="mt-0">
          <CourtIQSkillRecommendations data={data} />
        </TabsContent>
      </Tabs>
    </div>
  );
}