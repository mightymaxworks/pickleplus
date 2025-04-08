import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PlayerPassport } from '@/components/dashboard/PlayerPassport';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Dashboard() {
  const { user } = useAuth();
  
  if (!user) return null;
  
  return (
    <DashboardLayout title="Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <h2 className="text-2xl font-bold mb-4">Welcome, {user.displayName || user.username}!</h2>
        </div>
        
        {/* Player Passport Section */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Your Passport</h3>
          <Card className="shadow-md mb-6">
            <CardContent className="p-0">
              <PlayerPassport user={user} />
            </CardContent>
          </Card>
        </div>
        
        {/* Stats Section */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Your Stats</h3>
          <div className="space-y-4">
            {/* XP Card */}
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-md font-medium flex items-center">
                  <span className="bg-[#FF5722]/20 text-[#FF5722] p-1 rounded mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </span>
                  Experience Points
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Current Level</span>
                    <span className="font-medium">{user.level || 5}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total XP</span>
                    <span className="font-medium">{user.xp || 520}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Next Level</span>
                    <span className="font-medium">1000 XP needed</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full mt-1">
                    <div
                      className="h-2 bg-gradient-to-r from-[#FF5722] to-[#FF9800] rounded-full"
                      style={{ width: `${Math.min((user.xp || 520) / 10, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Match Stats Card */}
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-md font-medium flex items-center">
                  <span className="bg-[#2196F3]/20 text-[#2196F3] p-1 rounded mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </span>
                  Match Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="text-sm text-gray-600">Total Matches</div>
                    <div className="font-semibold text-lg">{user.totalMatches || 24}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-gray-600">Matches Won</div>
                    <div className="font-semibold text-lg">{user.matchesWon || 16}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-gray-600">Win Rate</div>
                    <div className="font-semibold text-lg">
                      {user.totalMatches ? Math.round((user.matchesWon || 16) / (user.totalMatches || 24) * 100) : 67}%
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-gray-600">Tournaments</div>
                    <div className="font-semibold text-lg">{user.totalTournaments || 3}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* CourtIQ Rating Card */}
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-md font-medium flex items-center">
                  <span className="bg-[#673AB7]/20 text-[#673AB7] p-1 rounded mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </span>
                  CourtIQ™ Rating
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Current Rating</span>
                    <span className="font-semibold text-lg">1,248</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Skill Rating</span>
                    <span className="font-semibold">{user.skillLevel || '3.5 Intermediate+'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Ranking</span>
                    <span className="font-semibold">7th</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}