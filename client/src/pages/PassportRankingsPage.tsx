import React from 'react';
import PassportDashboard from '@/components/dashboard/PassportDashboard';
import { useAuth } from '@/contexts/AuthContext';

export default function PassportRankingsPage() {
  const { user } = useAuth();

  // Show loading state if user is not available
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-indigo-900/20 dark:to-purple-900/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading rankings...</p>
        </div>
      </div>
    );
  }

  const handleFieldChange = (field: string, value: any) => {
    // Handle field changes - could update user context or make API calls
    console.log('Field changed:', field, value);
  };

  return (
    <div className="w-full min-h-screen">
      <PassportDashboard 
        user={user} 
        onFieldChange={handleFieldChange}
        initialTab="leaderboard"
      />
    </div>
  );
}