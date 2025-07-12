/**
 * PKL-278651-MOBILE-COACHING-ENTRY
 * Mobile-Optimized Coaching Entry Component
 * 
 * Primary entry point for coaching workflow on mobile devices.
 * Features large touch targets, clear status indicators, and prominent CTAs.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastUpdated 2025-07-12
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Calendar, 
  Eye, 
  MessageSquare, 
  ArrowRight,
  Bell,
  Zap,
  Users,
  Clock
} from 'lucide-react';
import { useNavigate } from 'wouter';

interface MobileCoachingEntryProps {
  userRole: 'player' | 'coach' | 'both';
  urgentCount?: number;
  nextAction?: string;
  currentStep?: string;
}

export function MobileCoachingEntry({ 
  userRole, 
  urgentCount = 0, 
  nextAction,
  currentStep = 'none'
}: MobileCoachingEntryProps) {
  const navigate = useNavigate();

  // Determine primary action based on user role and current step
  const getPrimaryAction = () => {
    if (userRole === 'coach') {
      switch (currentStep) {
        case 'pending_requests':
          return {
            text: 'Review Student Requests',
            icon: MessageSquare,
            color: 'bg-green-600 hover:bg-green-700',
            path: '/coach/requests'
          };
        case 'session_today':
          return {
            text: 'Start Assessment Tool',
            icon: Zap,
            color: 'bg-blue-600 hover:bg-blue-700',
            path: '/coach/assessment-tool'
          };
        default:
          return {
            text: 'Coach Dashboard',
            icon: Users,
            color: 'bg-green-600 hover:bg-green-700',
            path: '/coach/dashboard'
          };
      }
    } else {
      switch (currentStep) {
        case 'none':
          return {
            text: 'Find Your Coach',
            icon: Search,
            color: 'bg-blue-600 hover:bg-blue-700',
            path: '/coaches'
          };
        case 'session_scheduled':
          return {
            text: 'Join Upcoming Session',
            icon: Calendar,
            color: 'bg-green-600 hover:bg-green-700',
            path: '/sessions/upcoming'
          };
        case 'feedback_available':
          return {
            text: 'View Assessment Results',
            icon: Eye,
            color: 'bg-purple-600 hover:bg-purple-700',
            path: '/feedback/latest'
          };
        default:
          return {
            text: 'Find Your Coach',
            icon: Search,
            color: 'bg-blue-600 hover:bg-blue-700',
            path: '/coaches'
          };
      }
    }
  };

  const primaryAction = getPrimaryAction();
  const IconComponent = primaryAction.icon;

  return (
    <Card className="border-2 border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg">
      <CardContent className="p-4">
        {/* Header with notification badge */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-full">
              <IconComponent className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {userRole === 'coach' ? 'Coaching Tools' : 'Your Coaching'}
              </h3>
              <p className="text-xs text-gray-600">
                {userRole === 'coach' ? 'Manage your students' : 'Find coaches & track progress'}
              </p>
            </div>
          </div>
          {urgentCount > 0 && (
            <Badge className="bg-red-500 text-white flex items-center gap-1 text-xs px-2 py-1">
              <Bell className="h-3 w-3" />
              {urgentCount}
            </Badge>
          )}
        </div>

        {/* Next Action Display */}
        {nextAction && (
          <div className="bg-white p-3 rounded-lg border border-blue-200 mb-4">
            <p className="text-xs text-blue-700 mb-1">Next Action:</p>
            <p className="text-sm font-medium text-blue-900">{nextAction}</p>
          </div>
        )}

        {/* Primary CTA Button */}
        <Button 
          size="lg" 
          className={`w-full ${primaryAction.color} text-white font-medium py-3`}
          onClick={() => navigate(primaryAction.path)}
        >
          <IconComponent className="h-5 w-5 mr-2" />
          {primaryAction.text}
          <ArrowRight className="h-4 w-4 ml-auto" />
        </Button>

        {/* Quick Status Indicators */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">
              {userRole === 'coach' ? '5' : '2'}
            </div>
            <div className="text-xs text-gray-600">
              {userRole === 'coach' ? 'Students' : 'Sessions'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">
              {userRole === 'coach' ? '12' : '1'}
            </div>
            <div className="text-xs text-gray-600">
              {userRole === 'coach' ? 'Sessions' : 'Active'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600">
              {userRole === 'coach' ? '4.8' : '3.3'}
            </div>
            <div className="text-xs text-gray-600">
              {userRole === 'coach' ? 'Rating' : 'PCP Score'}
            </div>
          </div>
        </div>

        {/* Secondary Action */}
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full mt-3 text-sm"
          onClick={() => navigate('/complete-flow-demo')}
        >
          View Complete Workflow Demo
        </Button>
      </CardContent>
    </Card>
  );
}

export default MobileCoachingEntry;