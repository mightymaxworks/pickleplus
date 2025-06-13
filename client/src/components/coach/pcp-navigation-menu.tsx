/**
 * PCP Coaching Navigation Menu
 * Quick access navigation for PCP Coaching Certification Programme features
 */

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  ClipboardCheck, 
  BookOpen, 
  BarChart3,
  Target,
  Calendar,
  Settings,
  Award
} from 'lucide-react';
import { Link } from 'wouter';

interface NavigationItem {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  primary?: boolean;
}

export default function PCPNavigationMenu() {
  const navigationItems: NavigationItem[] = [
    {
      title: 'Coach Dashboard',
      description: 'View all players, stats, and recent activity',
      href: '/coach/pcp',
      icon: Users,
      primary: true
    },
    {
      title: 'Player Assessment',
      description: '4-dimensional skill evaluation system',
      href: '/coach/pcp-assessment',
      icon: ClipboardCheck,
      badge: 'Core',
      primary: true
    },
    {
      title: 'Drill Library',
      description: 'Browse categorized training drills',
      href: '/coach/pcp#drills',
      icon: BookOpen
    },
    {
      title: 'Analytics',
      description: 'Player progress and coaching metrics',
      href: '/coach/pcp#analytics',
      icon: BarChart3,
      badge: 'Soon'
    },
    {
      title: 'Goal Setting',
      description: 'Create and track player development goals',
      href: '/coach/pcp-goals',
      icon: Target,
      badge: 'Soon'
    },
    {
      title: 'Session Scheduling',
      description: 'Manage coaching appointments',
      href: '/coach/pcp-schedule',
      icon: Calendar,
      badge: 'Soon'
    },
    {
      title: 'Certification',
      description: 'PCP coaching credentials and progress',
      href: '/coach/pcp-certification',
      icon: Award,
      badge: 'Soon'
    },
    {
      title: 'Settings',
      description: 'Configure coaching preferences',
      href: '/coach/pcp-settings',
      icon: Settings
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          PCP Coaching Certification Programme
        </h2>
        <p className="text-gray-600">
          Professional pickleball coaching tools and assessment systems
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {navigationItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className={`hover:shadow-lg transition-all cursor-pointer ${
              item.primary ? 'ring-2 ring-blue-200 bg-blue-50' : ''
            }`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <item.icon className={`h-8 w-8 ${
                    item.primary ? 'text-blue-600' : 'text-gray-600'
                  }`} />
                  {item.badge && (
                    <Badge variant={item.badge === 'Core' ? 'default' : 'secondary'} className="text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.description}</p>
                {item.primary && (
                  <Button 
                    size="sm" 
                    className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                  >
                    Access Now
                  </Button>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
        <h3 className="font-semibold text-gray-900 mb-2">Quick Start Guide</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p>1. <strong>Dashboard:</strong> Overview of all your players and recent activity</p>
          <p>2. <strong>Assessment:</strong> Conduct comprehensive 4-dimensional player evaluations</p>
          <p>3. <strong>Drill Library:</strong> Access categorized training exercises for all skill levels</p>
          <p>4. <strong>Progress Tracking:</strong> Monitor player development over time</p>
        </div>
      </div>
    </div>
  );
}