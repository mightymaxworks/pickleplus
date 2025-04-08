/**
 * Ranking History List Component
 * 
 * This component displays a user's ranking transaction history with visualizations
 */
import { useQuery } from "@tanstack/react-query";
import { 
  useUserRankingTransactions, 
  getTierColors 
} from "@/lib/sdk/rankingSDK";
import { format } from "date-fns";
import { ArrowUp, ArrowDown, ChevronsUp, BadgeInfo } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface RankingHistoryListProps {
  userId: number;
  limit?: number;
  maxHeight?: string;
  className?: string;
}

export default function RankingHistoryList({ 
  userId,
  limit = 10,
  maxHeight = '400px',
  className = ""
}: RankingHistoryListProps) {
  const transactionsQueryConfig = useUserRankingTransactions(userId, limit);
  const { data, isLoading, error } = useQuery(transactionsQueryConfig);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg">Ranking History</CardTitle>
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
          <CardTitle className="text-lg">Ranking History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            {error ? "Error loading ranking history" : "No ranking history found"}
          </p>
        </CardContent>
      </Card>
    );
  }

  const { transactions } = data;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          Ranking History
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <BadgeInfo className="h-4 w-4 ml-1.5 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>CourtIQ™ Ranking points are earned from match victories and tournament performance</p>
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
              metadata?: {
                matchType?: string;
                [key: string]: any;
              };
            }) => {
              const isPositive = transaction.amount > 0;
              const absAmount = Math.abs(transaction.amount);
              
              return (
                <div key={transaction.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div>
                    <h4 className="font-medium text-sm truncate max-w-[200px]">
                      {transaction.source}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(transaction.timestamp), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Badge variant={isPositive ? "default" : "destructive"} className="rounded-sm">
                      <span className="mr-1">
                        {isPositive 
                          ? (absAmount >= 10 ? <ChevronsUp className="h-3 w-3" /> : <ArrowUp className="h-3 w-3" />) 
                          : <ArrowDown className="h-3 w-3" />}
                      </span>
                      {absAmount} pts
                    </Badge>
                    
                    {transaction.metadata?.matchType && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge variant="outline" className="rounded-sm text-xs">
                              {transaction.metadata.matchType}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Match type: {transaction.metadata.matchType}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}