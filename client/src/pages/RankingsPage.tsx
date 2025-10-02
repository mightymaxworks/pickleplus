import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Crown, Star, TrendingUp, Users, Filter, Search, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import EnhancedLeaderboard from '@/components/match/EnhancedLeaderboard';
import TierLegend from '@/components/match/TierLegend';
import UnifiedRankingsView from '@/components/rankings/UnifiedRankingsView';
import { usePullToRefresh } from '@/hooks/use-pull-to-refresh';
import { queryClient } from '@/lib/queryClient';
import { cn } from '@/lib/utils';

export default function RankingsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAge, setFilterAge] = useState('all');
  const [filterSkill, setFilterSkill] = useState('all');

  const { isPulling, pullDistance, isRefreshing } = usePullToRefresh({
    onRefresh: async () => {
      await queryClient.invalidateQueries({ queryKey: ['/api/rankings'] });
    },
    threshold: 80
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 p-4 relative">
      {isPulling && (
        <div 
          className={cn(
            "ptr-indicator bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg flex items-center gap-2",
            pullDistance > 80 ? "pulling" : ""
          )}
        >
          <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          <span className="text-sm font-medium">
            {isRefreshing ? "Refreshing..." : "Pull to refresh"}
          </span>
        </div>
      )}
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Global Rankings
              </h1>
              <p className="text-gray-600">
                PicklePlus ranking system with skill-based competition
              </p>
            </div>
          </div>


        </motion.div>

        {/* Streamlined Rankings Interface */}
        <UnifiedRankingsView />
      </div>
    </div>
  );
}