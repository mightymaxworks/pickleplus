import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Trophy, 
  Activity, 
  Award, 
  Gift, 
  Hexagon, 
  Star, 
  UserPlus, 
  Zap 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { XPTransaction } from '@/lib/sdk/xpSDK';
import { cn } from '@/lib/utils';

export interface XPHistoryListProps {
  transactions: XPTransaction[];
}

const getTransactionIcon = (source: string) => {
  switch (source) {
    case 'match':
      return <Trophy className="h-4 w-4 text-yellow-500" />;
    case 'tournament':
      return <Award className="h-4 w-4 text-blue-500" />;
    case 'achievement':
      return <Star className="h-4 w-4 text-purple-500" />;
    case 'redemption':
      return <Gift className="h-4 w-4 text-red-500" />;
    case 'bonus':
      return <Zap className="h-4 w-4 text-yellow-500" />;
    case 'founder':
      return <Hexagon className="h-4 w-4 text-green-500" />;
    case 'registration':
      return <UserPlus className="h-4 w-4 text-green-500" />;
    default:
      return <Activity className="h-4 w-4 text-primary" />;
  }
};

export default function XPHistoryList({ transactions }: XPHistoryListProps) {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-6 text-sm text-muted-foreground">
        No XP transactions found.
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium">Recent XP Activity</h3>
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
                transaction.amount > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              )}>
                {transaction.amount > 0 ? '+' : ''}{transaction.amount} XP
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}