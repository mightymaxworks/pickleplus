/**
 * PKL-278651-ADMIN-0009-MOBILE
 * Admin Dashboard Mobile View
 * 
 * This component provides a mobile-optimized version of the admin dashboard.
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Users, 
  Calendar, 
  Award, 
  Settings, 
  ArrowUpRight
} from 'lucide-react';

/**
 * Mobile-optimized admin dashboard component
 */
export default function AdminDashboardMobile() {
  return (
    <div className="container mx-auto px-3 py-4">
      <div className="flex flex-col gap-2 mb-6">
        <h1 className="text-xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Mobile-optimized view for administration
        </p>
      </div>
      
      {/* Quick Action Cards - Single column layout for mobile */}
      <div className="grid grid-cols-1 gap-3 mb-4">
        <Card className="bg-primary/5 hover:bg-primary/10 transition-colors">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <span className="font-medium">Users</span>
              </div>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-primary/5 hover:bg-primary/10 transition-colors">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                <span className="font-medium">Metrics</span>
              </div>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-primary/5 hover:bg-primary/10 transition-colors">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <span className="font-medium">Events</span>
              </div>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-primary/5 hover:bg-primary/10 transition-colors">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                <span className="font-medium">Achievements</span>
              </div>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-primary/5 hover:bg-primary/10 transition-colors">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                <span className="font-medium">Settings</span>
              </div>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Activity - Simplified for mobile */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Recent Activity</CardTitle>
          <CardDescription>Latest system events</CardDescription>
        </CardHeader>
        <CardContent className="p-3">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2 pb-2 border-b last:border-0">
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <Activity className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">User profile updated</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
          
          <Button className="w-full mt-3" variant="outline" size="sm">
            View All Activity
          </Button>
        </CardContent>
      </Card>
      
      {/* System Status - Simplified for mobile */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">System Status</CardTitle>
          <CardDescription>Current system health</CardDescription>
        </CardHeader>
        <CardContent className="p-3">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Server Status</span>
              <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">Healthy</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Database</span>
              <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">Connected</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">API Services</span>
              <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">Operational</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Cache</span>
              <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">Partial</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}