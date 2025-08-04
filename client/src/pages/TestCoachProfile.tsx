import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { InlineEditableProfile } from '@/components/coach/InlineEditableProfile';
import { apiRequest } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';

interface CoachProfile {
  id: number;
  coach_id: number;
  user_id: number;
  display_name: string;
  tagline: string;
  specialties: string[] | null;
  location: string;
  hourly_rate: number;
  average_rating: number;
  total_reviews: number;
  total_sessions: number;
  teaching_style: any;
  player_preferences: any;
  response_time: number;
}

export default function TestCoachProfile() {
  const { toast } = useToast();

  // Get current user to check ownership
  const { data: currentUser } = useQuery<any>({
    queryKey: ['/api/auth/current-user'],
    retry: false,
  });

  // Get the test coach profile directly from the database
  const { data: profile, isLoading, error } = useQuery<CoachProfile>({
    queryKey: ['/api/coach-public-profiles', 'test-coach'],
    queryFn: async () => {
      // Get the profile by user ID since we know it's user ID 220
      const response = await apiRequest('GET', '/api/coach-marketplace-profiles/220');
      if (!response.ok) {
        throw new Error('Profile not found');
      }
      return response.json();
    },
    retry: false,
  });

  const isOwner = Boolean(currentUser && profile && currentUser.id === profile.user_id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 p-4 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Profile not found</p>
            <p className="text-center text-sm mt-4">
              Make sure you're logged in as the test coach
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              Inline Editing Demo - Coach Profile
            </CardTitle>
            <p className="text-muted-foreground">
              {isOwner ? (
                "✅ You own this profile - click edit icons to modify fields inline"
              ) : (
                "❌ Login as testcoach to enable inline editing"
              )}
            </p>
          </CardHeader>
        </Card>

        {/* Profile with Inline Editing */}
        <InlineEditableProfile 
          profile={profile}
          isOwner={isOwner}
          onUpdate={(updatedProfile: any) => {
            toast({
              title: "Profile Updated",
              description: "Changes saved successfully"
            });
          }}
        />

        {/* Demo Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Demo Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-green-700">✅ What Works:</h4>
                <ul className="text-sm space-y-1 text-green-600">
                  <li>• Click edit icons to edit fields inline</li>
                  <li>• Changes save automatically</li>
                  <li>• Proper ownership validation</li>
                  <li>• Real-time updates without page refresh</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-blue-700">📋 Test Features:</h4>
                <ul className="text-sm space-y-1 text-blue-600">
                  <li>• Display name editing</li>
                  <li>• Tagline editing</li>
                  <li>• Location updates</li>
                  <li>• Hourly rate changes</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}