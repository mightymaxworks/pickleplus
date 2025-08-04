import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InlineEditableProfile } from '@/components/coach/InlineEditableProfile';
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

export default function AdminCoachTest() {
  // Get current user to check ownership
  const { data: currentUser } = useQuery<any>({
    queryKey: ['/api/auth/current-user'],
    retry: false,
  });

  // Get the admin coach profile directly from the database
  const { data: profile, isLoading, error } = useQuery<CoachProfile>({
    queryKey: ['/api/coach-marketplace-profiles', '218'],
    queryFn: async () => {
      const response = await fetch('/api/coach-marketplace-profiles/218', {
        credentials: 'include',
      });
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
              Make sure you're logged in as admin to see the inline editing functionality
            </p>
            <Button 
              onClick={() => window.location.href = '/auth'} 
              className="w-full mt-4"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Demo Instructions */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900">Inline Editing Demo - Admin Coach Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-blue-800">
              <p><strong>Current User:</strong> {currentUser ? `${currentUser.username} (ID: ${currentUser.id})` : 'Not logged in'}</p>
              <p><strong>Profile Owner:</strong> User ID {profile.user_id}</p>
              <p><strong>Can Edit:</strong> {isOwner ? '✅ Yes - You own this profile' : '❌ No - You can only view'}</p>
              <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                <p className="font-semibold">How to test:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>If you can edit, click the pencil icons next to fields</li>
                  <li>Make changes and press Enter or click outside to save</li>
                  <li>Press Escape to cancel changes</li>
                  <li>Changes are saved automatically to the database</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inline Editable Profile Component */}
        <Card>
          <CardHeader>
            <CardTitle>Coach Profile - Inline Editing</CardTitle>
          </CardHeader>
          <CardContent>
            <InlineEditableProfile 
              profile={profile} 
              isOwner={isOwner}
            />
          </CardContent>
        </Card>

        {/* Profile Data Debug */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-700">Profile Data (Debug)</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-gray-100 p-4 rounded-lg overflow-auto">
              {JSON.stringify(profile, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}