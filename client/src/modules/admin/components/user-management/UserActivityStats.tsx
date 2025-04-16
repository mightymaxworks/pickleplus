/**
 * PKL-278651-ADMIN-0015-USER
 * User Activity Stats Component
 * 
 * This component displays user activity statistics and metrics
 */

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Activity,
  Calendar,
  Clock,
  Medal,
  MessageSquare,
  BarChart2,
  Users,
  TrendingUp
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { User } from '@shared/types';

interface UserActivityStatsProps {
  user: User;
}

export function UserActivityStats({ user }: UserActivityStatsProps) {
  // Get the current date
  const currentDate = new Date();
  
  // Calculate days since registration
  const registrationDate = user.createdAt ? new Date(user.createdAt) : new Date();
  const daysSinceRegistration = Math.floor(
    (currentDate.getTime() - registrationDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  // Calculate last active (or use current date if not available)
  const lastActive = user.lastLoginAt 
    ? new Date(user.lastLoginAt) 
    : new Date();
  
  // Calculate days since last active
  const daysSinceLastActive = Math.floor(
    (currentDate.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Activity metrics (replace with actual values from user object when available)
  const activityMetrics = [
    {
      label: 'Registration Date',
      value: formatDate(user.createdAt),
      icon: Calendar,
      color: 'text-blue-500'
    },
    {
      label: 'Days as Member',
      value: daysSinceRegistration.toString(),
      icon: Clock,
      color: 'text-green-500'
    },
    {
      label: 'Last Active',
      value: daysSinceLastActive === 0 
        ? 'Today' 
        : daysSinceLastActive === 1 
          ? 'Yesterday' 
          : `${daysSinceLastActive} days ago`,
      icon: Activity,
      color: 'text-amber-500'
    },
    {
      label: 'XP Level',
      value: user.level?.toString() || '0',
      icon: Medal,
      color: 'text-purple-500'
    },
    {
      label: 'Total Matches',
      value: user.totalMatches?.toString() || '0',
      icon: BarChart2,
      color: 'text-red-500'
    },
    {
      label: 'Win Rate',
      value: user.winRate ? `${Math.round(user.winRate * 100)}%` : '0%',
      icon: TrendingUp,
      color: 'text-emerald-500'
    },
    {
      label: 'Social Connections',
      value: user.connectionCount?.toString() || '0',
      icon: Users,
      color: 'text-indigo-500'
    },
    {
      label: 'Comments Made',
      value: user.commentCount?.toString() || '0',
      icon: MessageSquare,
      color: 'text-cyan-500'
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Statistics</CardTitle>
        <CardDescription>
          User activity metrics and engagement statistics
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {activityMetrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <div 
                key={index} 
                className="flex flex-col items-center text-center p-3 rounded-lg border"
              >
                <Icon className={`h-8 w-8 mb-2 ${metric.color}`} />
                <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
                <p className="text-xl font-bold">{metric.value}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}