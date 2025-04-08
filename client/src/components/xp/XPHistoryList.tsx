/**
 * XP History List Component
 * 
 * This component displays a user's XP transaction history with visualizations
 */
import { useQuery } from "@tanstack/react-query";
import { useUserXPTransactions } from "@/lib/sdk/xpSDK";
import { format } from "date-fns";
import { Plus, Trophy, Medal, Star, Activity, BadgeInfo } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface XPHistoryListProps {
  userId: number;
  limit?: number;
  maxHeight?: string;
  className?: string;
}

export default function XPHistoryList({ 
  userId,
  limit = 10,
  maxHeight = '400px',
  className = ""
}: XPHistoryListProps) {
  const transactionsQueryConfig = useUserXPTransactions(userId, limit);
  const { data, isLoading, error } = useQuery(transactionsQueryConfig);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg">XP History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data || !data.transactions || data.transactions.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg">XP History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            {error ? "Error loading XP history" : "No XP history found"}
          </p>
        </CardContent>
      </Card>
    );
  }

  const { transactions } = data;

  // Get appropriate icon for XP source
  const getSourceIcon = (source: string) => {
    const sourceLower = source.toLowerCase();
    if (sourceLower.includes('match') || sourceLower.includes('game') || sourceLower.includes('played')) {
      return <Activity className="h-3.5 w-3.5" />;
    } else if (sourceLower.includes('tournament')) {
      return <Trophy className="h-3.5 w-3.5" />;
    } else if (sourceLower.includes('achievement') || sourceLower.includes('unlocked')) {
      return <Medal className="h-3.5 w-3.5" />;
    } else if (sourceLower.includes('bonus') || sourceLower.includes('special')) {
      return <Star className="h-3.5 w-3.5" />;
    }
    return <Plus className="h-3.5 w-3.5" />;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          XP History
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <BadgeInfo className="h-4 w-4 ml-1.5 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Experience Points (XP) are earned from playing matches, participating in tournaments, and earning achievements</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className={`pr-4 ${maxHeight ? `max-h-[${maxHeight}]` : ''}`}>
          <div className="space-y-3">
            {transactions.map((transaction: {
              id: number;
              userId: number;
              amount: number;
              source: string;
              timestamp: string;
              metadata?: any;
            }) => (
              <div key={transaction.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                <div>
                  <h4 className="font-medium text-sm truncate max-w-[200px]">
                    {transaction.source}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(transaction.timestamp), 'MMM d, yyyy')}
                  </p>
                </div>
                <div className="flex items-center">
                  <Badge className="rounded-sm bg-green-600 hover:bg-green-700">
                    <span className="mr-1">
                      {getSourceIcon(transaction.source)}
                    </span>
                    +{transaction.amount} XP
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}