import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Trophy, 
  Activity, 
  Award, 
  Gift, 
  TrendingUp, 
  UserPlus, 
  Puzzle, 
  Medal,
  BadgeCheck
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { RankingTransaction } from '@/lib/sdk/rankingSDK';
import { cn } from '@/lib/utils';

export interface RankingHistoryListProps {
  transactions: RankingTransaction[];
}

const getTransactionIcon = (source: string) => {
  switch (source) {
    case 'match':
      return <Trophy className="h-4 w-4 text-yellow-500" />;
    case 'tournament':
      return <Award className="h-4 w-4 text-blue-500" />;
    case 'skill_progression':
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    case 'consistency':
      return <BadgeCheck className="h-4 w-4 text-purple-500" />;
    case 'bonus':
      return <Gift className="h-4 w-4 text-red-500" />;
    case 'win_streak':
      return <Medal className="h-4 w-4 text-orange-500" />;
    case 'event':
      return <Puzzle className="h-4 w-4 text-indigo-500" />;
    case 'registration':
      return <UserPlus className="h-4 w-4 text-green-500" />;
    default:
      return <Activity className="h-4 w-4 text-primary" />;
  }
};

export default function RankingHistoryList({ transactions }: RankingHistoryListProps) {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-6 text-sm text-muted-foreground">
        No ranking transactions found.
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium">Recent Ranking Activity</h3>
      <div className="space-y-2">
        {transactions.map((transaction) => (
          <Card key={transaction.id} className="overflow-hidden">
            <CardContent className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  {getTransactionIcon(transaction.source)}
                </div>
                <div>
                  <div className="font-medium text-sm">{transaction.reason}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(transaction.timestamp), { addSuffix: true })}
                  </div>
                </div>
              </div>
              <div className={cn(
                "px-2 py-1 rounded-full text-xs font-medium",
                transaction.amount > 0 ? "bg-blue-100 text-blue-800" : "bg-red-100 text-red-800"
              )}>
                {transaction.amount > 0 ? '+' : ''}{transaction.amount} pts
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}