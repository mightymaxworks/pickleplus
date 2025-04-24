/**
 * PKL-278651-AUTH-0008-ROLES - Role-Protected Demo Page
 * 
 * This is a demonstration page showing the role-based access controls in action
 * with differentiated views based on user roles.
 */

import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole, getRoleLabel } from "@/lib/roles";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ShieldCheck, UserRound, Users, Trophy, ChevronRight } from "lucide-react";

export default function RoleProtectedDemoPage() {
  const { user, getUserRole } = useAuth();
  const userRole = getUserRole();
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-2">Role-Based Access Control</h1>
      <p className="text-gray-500 mb-8">
        This page demonstrates differentiated content based on your user role
      </p>
      
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserRound className="h-5 w-5" />
              Current User Profile
            </CardTitle>
            <CardDescription>Your current authentication status and role</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium">Username</div>
                <div className="text-lg">{user?.username || 'Not logged in'}</div>
              </div>
              
              <div>
                <div className="text-sm font-medium">Display Name</div>
                <div className="text-lg">{user?.displayName || user?.username || 'Not available'}</div>
              </div>
              
              <div>
                <div className="text-sm font-medium">Role</div>
                <div className="text-lg flex items-center gap-2">
                  {userRole === UserRole.ADMIN && <ShieldCheck className="h-5 w-5 text-red-500" />}
                  {userRole === UserRole.COACH && <Users className="h-5 w-5 text-blue-500" />}
                  {userRole === UserRole.PLAYER && <Trophy className="h-5 w-5 text-green-500" />}
                  {userRole ? getRoleLabel(userRole) : 'No role assigned'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <h2 className="text-2xl font-semibold mb-4">Role-Specific Content</h2>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Player Content - Visible to all roles */}
        <Card>
          <CardHeader className="bg-green-50 dark:bg-green-900/20">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-green-500" />
              Player Features
            </CardTitle>
            <CardDescription>Available to all users</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <ChevronRight className="h-4 w-4 text-green-500" />
                <span>Match recording</span>
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="h-4 w-4 text-green-500" />
                <span>View leaderboards</span>
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="h-4 w-4 text-green-500" />
                <span>Join tournaments</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">View Player Dashboard</Button>
          </CardFooter>
        </Card>
        
        {/* Coach Content - Only visible to Coach and Admin roles */}
        {userRole && (userRole === UserRole.COACH || userRole === UserRole.ADMIN) ? (
          <Card>
            <CardHeader className="bg-blue-50 dark:bg-blue-900/20">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                Coaching Features
              </CardTitle>
              <CardDescription>Available to coaches and administrators</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-blue-500" />
                  <span>Player skill assessment</span>
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-blue-500" />
                  <span>Create training plans</span>
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-blue-500" />
                  <span>Review match recordings</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">Access Coaching Tools</Button>
            </CardFooter>
          </Card>
        ) : null}
        
        {/* Admin Content - Only visible to Admin role */}
        {userRole === UserRole.ADMIN ? (
          <Card>
            <CardHeader className="bg-red-50 dark:bg-red-900/20">
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-red-500" />
                Administrative Features
              </CardTitle>
              <CardDescription>Available only to administrators</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-red-500" />
                  <span>User management</span>
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-red-500" />
                  <span>System configuration</span>
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-red-500" />
                  <span>Analytics dashboard</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">Open Admin Panel</Button>
            </CardFooter>
          </Card>
        ) : null}
      </div>
      
      {!userRole || userRole === UserRole.PLAYER ? (
        <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-500">
            Some content is only visible to users with Coach or Admin roles.
            Contact your system administrator if you need access to additional features.
          </p>
        </div>
      ) : null}
    </div>
  );
}