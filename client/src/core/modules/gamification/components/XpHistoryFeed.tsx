/**
 * PKL-278651-XP-0002-UI
 * XP History Feed Component
 * 
 * Displays a chronological feed of XP transactions with source indicators and animations.
 * 
 * @framework Framework5.1
 * @version 1.0.0
 */

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { 
  Award, 
  Zap, 
  Timer, 
  Users, 
  User, 
  Trophy, 
  Gift,
  Shield,
  Calendar
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

// XP Transaction type from schema
interface XpTransaction {
  id: number;
  userId: number;
  amount: number;
  source: string;
  sourceType?: string;
  sourceId?: number;
  description?: string;
  runningTotal: number;
  isHidden?: boolean;
  createdById?: number;
  matchId?: number;
  communityId?: number;
  achievementId?: number;
  tournamentId?: number;
  createdAt: string;
}

// XP history response with pagination
interface XpHistoryResponse {
  transactions: XpTransaction[];
  total: number;
  hasMore: boolean;
}

interface XpHistoryFeedProps {
  userId?: number; // If not provided, uses current user
  limit?: number;
  compact?: boolean; // Show a more compact version
}

/**
 * XpHistoryFeed Component
 * 
 * Displays a chronological feed of XP transactions
 */
const XpHistoryFeed: React.FC<XpHistoryFeedProps> = ({
  userId,
  limit = 5,
  compact = false
}) => {
  // Fetch XP history from API
  const { data, isLoading, error } = useQuery<XpHistoryResponse>({
    queryKey: ['/api/xp/history', userId, limit],
    enabled: true,
  });
  
  // Animation variants for the list
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 }
    }
  };
  
  // Get icon based on source type
  const getSourceIcon = (source: string, sourceType?: string) => {
    switch (source) {
      case 'match':
        return <Trophy className="h-5 w-5 text-amber-500" />;
      case 'community':
        return <Users className="h-5 w-5 text-blue-500" />;
      case 'profile':
        return <User className="h-5 w-5 text-green-500" />;
      case 'achievement':
        return <Award className="h-5 w-5 text-purple-500" />;
      case 'tournament':
        return <Calendar className="h-5 w-5 text-indigo-500" />;
      case 'redemption':
        return <Gift className="h-5 w-5 text-pink-500" />;
      case 'admin':
        return <Shield className="h-5 w-5 text-red-500" />;
      default:
        return <Zap className="h-5 w-5 text-amber-500" />;
    }
  };
  
  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">XP History</CardTitle>
          <CardDescription>Loading your XP transactions...</CardDescription>
        </CardHeader>
        <CardContent>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-start space-x-4 mb-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }
  
  // Error state
  if (error || !data) {
    return (
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="text-base">XP History</CardTitle>
          <CardDescription>Unable to load XP history</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            There was a problem loading your XP transactions. Please try again later.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  // Empty state
  if (data.transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">XP History</CardTitle>
          <CardDescription>No XP transactions yet</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            Get started by playing matches, participating in communities, or completing your profile!
          </p>
        </CardContent>
      </Card>
    );
  }
  
  // Render compact version
  if (compact) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Recent XP Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <motion.ul 
            className="space-y-2"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            {data.transactions.slice(0, limit).map(transaction => (
              <motion.li 
                key={transaction.id}
                variants={itemVariants}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center">
                  <div className="mr-3">
                    {getSourceIcon(transaction.source, transaction.sourceType)}
                  </div>
                  <span className="text-gray-700 truncate max-w-[180px]">
                    {transaction.description || `Earned from ${transaction.source}`}
                  </span>
                </div>
                <Badge variant="outline" className="bg-amber-50 text-amber-700">
                  +{transaction.amount} XP
                </Badge>
              </motion.li>
            ))}
          </motion.ul>
        </CardContent>
      </Card>
    );
  }
  
  // Render full version
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">XP History</CardTitle>
        <CardDescription>Your XP earning activity</CardDescription>
      </CardHeader>
      <CardContent>
        <motion.ul 
          className="space-y-4"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {data.transactions.slice(0, limit).map(transaction => (
            <motion.li 
              key={transaction.id}
              variants={itemVariants}
              className="flex items-start"
            >
              <div className="mr-4 mt-1">
                {getSourceIcon(transaction.source, transaction.sourceType)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-900">
                    {transaction.description || `Earned from ${transaction.source}`}
                  </p>
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 ml-2">
                    +{transaction.amount} XP
                  </Badge>
                </div>
                <div className="flex items-center mt-1 text-xs text-gray-500">
                  <Timer className="h-3 w-3 mr-1" />
                  {format(new Date(transaction.createdAt), 'MMM d, h:mm a')}
                  
                  {transaction.sourceType && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {transaction.sourceType.replace('_', ' ')}
                    </Badge>
                  )}
                </div>
              </div>
            </motion.li>
          ))}
        </motion.ul>
        
        {data.hasMore && (
          <div className="mt-4 text-center">
            <a 
              href="#" 
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
            >
              View more activity
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default XpHistoryFeed;