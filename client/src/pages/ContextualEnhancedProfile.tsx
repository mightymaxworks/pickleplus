/**
 * PKL-278651-CPEM-0001: Contextual Profile Editing Mode
 * 
 * This page implements the enhanced profile using the new contextual editing approach.
 * It wraps all components in the ProfileEditProvider and includes the edit mode toggle.
 */

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EnhancedUser } from '@/types/enhanced-user';
import { ProfileEditProvider } from '@/contexts/ProfileEditContext';
import { ProfileEditModeToggle } from '@/components/profile/ProfileEditModeToggle';
import { ContextualProfileDetailsTab } from '@/components/profile/tabs/ContextualProfileDetailsTab';
import { EditableProfileHeader } from '@/components/profile/EditableProfileHeader';
import MainLayout from '@/components/MainLayout';

export default function ContextualEnhancedProfile() {
  // Fetch the current user
  const { data: user, isLoading, error } = useQuery<EnhancedUser>({
    queryKey: ['/api/auth/current-user'],
  });

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto py-6">
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse text-lg">Loading your profile...</div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !user) {
    return (
      <MainLayout>
        <div className="container mx-auto py-6">
          <div className="p-4 border border-red-300 bg-red-50 rounded-md text-red-500">
            Error loading profile. Please try again later.
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <ProfileEditProvider>
        <div className="container mx-auto py-6 px-4 md:px-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Enhanced Profile</h1>
            <div className="text-sm text-muted-foreground">
              Click any field to edit directly
            </div>
          </div>
          
          <EditableProfileHeader 
            user={user} 
            tierInfo={{
              name: 'Founding Member',
              description: 'Original member of the Pickle+ platform'
            }} 
          />
          
          <Tabs defaultValue="details" className="mt-6">
            <TabsList className="mb-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="stats">Stats & Ratings</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="privacy">Privacy</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details">
              <ContextualProfileDetailsTab user={user} />
            </TabsContent>
            
            <TabsContent value="stats">
              <div className="bg-muted p-4 rounded-md text-center">
                Stats & Ratings tab content will go here
              </div>
            </TabsContent>
            
            <TabsContent value="achievements">
              <div className="bg-muted p-4 rounded-md text-center">
                Achievements tab content will go here
              </div>
            </TabsContent>
            
            <TabsContent value="activity">
              <div className="bg-muted p-4 rounded-md text-center">
                Activity tab content will go here
              </div>
            </TabsContent>
            
            <TabsContent value="privacy">
              <div className="bg-muted p-4 rounded-md text-center">
                Privacy settings tab content will go here
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </ProfileEditProvider>
    </MainLayout>
  );
}