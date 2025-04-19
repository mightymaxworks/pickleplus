/**
 * PKL-278651-XP-0002-UI
 * XP History Feed Component
 * 
 * This component displays a feed of recent XP transactions.
 * 
 * @framework Framework5.1
 * @version 1.0.0
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { 
  Trophy, Users, Target, Calendar, MapPin, 
  MessageSquare, ThumbsUp, Zap, Award
} from 'lucide-react';

// Define XP transaction type
interface XpTransaction {
  id: number;
  amount: number;
  source: string;
  timestamp: string;
  details?: string;
  multiplier?: number;
}

// Demo data - In a real implementation, this would come from the useXpProgress hook
const demoTransactions: XpTransaction[] = [
  {
    id: 1,
    amount: 5,
    source: 'match_played',
    timestamp: '2025-04-18T14:35:00Z',
    details: 'Match against David Johnson',
    multiplier: 1
  },
  {
    id: 2,
    amount: 3,
    source: 'first_daily_match',
    timestamp: '2025-04-18T14:35:10Z',
    details: 'First match of the day bonus'
  },
  {
    id: 3,
    amount: 2,
    source: 'match_win',
    timestamp: '2025-04-18T14:35:20Z',
    details: 'Victory bonus'
  },
  {
    id: 4,
    amount: 1,
    source: 'community_post',
    timestamp: '2025-04-17T10:22:00Z',
    details: 'Posted in Chicago Picklers'
  },
  {
    id: 5,
    amount: 10,
    source: 'tournament_completion',
    timestamp: '2025-04-15T16:45:00Z',
    details: 'Completed Spring Tournament',
    multiplier: 1.5
  },
  {
    id: 6,
    amount: 3,
    source: 'event_created',
    timestamp: '2025-04-14T09:12:00Z',
    details: 'Created Weekly Meet-up event'
  },
  {
    id: 7,
    amount: 2,
    source: 'event_attendance',
    timestamp: '2025-04-10T18:30:00Z',
    details: 'Attended Training Session'
  },
  {
    id: 8,
    amount: 5,
    source: 'discovery',
    timestamp: '2025-04-08T11:20:00Z',
    details: 'Discovered Tournament Builder'
  }
];

interface XpHistoryFeedProps {
  limit?: number;
}

const XpHistoryFeed: React.FC<XpHistoryFeedProps> = ({ limit = 5 }) => {
  // Get source icon based on transaction source
  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'match_played':
      case 'match_win':
        return <Trophy className="h-4 w-4" />;
      case 'tournament_completion':
        return <Award className="h-4 w-4" />;
      case 'community_post':
        return <MessageSquare className="h-4 w-4" />;
      case 'first_daily_match':
        return <Zap className="h-4 w-4" />;
      case 'event_created':
        return <Calendar className="h-4 w-4" />;
      case 'event_attendance':
        return <MapPin className="h-4 w-4" />;
      case 'discovery':
        return <Target className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  // Get color based on transaction source
  const getSourceColor = (source: string) => {
    switch (source) {
      case 'match_played':
      case 'match_win':
        return 'bg-green-100 text-green-600';
      case 'tournament_completion':
        return 'bg-purple-100 text-purple-600';
      case 'community_post':
        return 'bg-blue-100 text-blue-600';
      case 'first_daily_match':
        return 'bg-amber-100 text-amber-600';
      case 'event_created':
      case 'event_attendance':
        return 'bg-indigo-100 text-indigo-600';
      case 'discovery':
        return 'bg-emerald-100 text-emerald-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  // Format source name for display
  const formatSourceName = (source: string) => {
    return source
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Format time to relative format
  const formatTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return 'recently';
    }
  };

  // Get display transactions respecting the limit
  const displayTransactions = limit 
    ? demoTransactions.slice(0, limit) 
    : demoTransactions;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">XP History</CardTitle>
        <CardDescription>Recent XP earning activity</CardDescription>
      </CardHeader>
      <CardContent>
        {displayTransactions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No XP activity yet. Play matches and engage to earn XP!
          </p>
        ) : (
          <div className="space-y-4">
            {displayTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-start space-x-3">
                {/* Icon */}
                <div className={`flex-shrink-0 rounded-full p-1.5 ${getSourceColor(transaction.source)}`}>
                  {getSourceIcon(transaction.source)}
                </div>
                
                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between">
                    <h4 className="text-sm font-medium text-gray-900">
                      {formatSourceName(transaction.source)}
                    </h4>
                    <p className="text-sm font-medium text-green-600">
                      +{transaction.amount} XP
                      {transaction.multiplier && transaction.multiplier > 1 && (
                        <span className="text-xs ml-1">(×{transaction.multiplier})</span>
                      )}
                    </p>
                  </div>
                  
                  {transaction.details && (
                    <p className="mt-0.5 text-xs text-muted-foreground truncate">{transaction.details}</p>
                  )}
                  
                  <time className="mt-0.5 text-xs text-muted-foreground">
                    {formatTime(transaction.timestamp)}
                  </time>
                </div>
              </div>
            ))}
            
            {/* View More Link */}
            {limit && demoTransactions.length > limit && (
              <button className="text-xs text-primary font-medium hover:underline w-full text-center mt-2">
                View all XP history
              </button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default XpHistoryFeed;