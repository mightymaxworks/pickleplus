import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlayerSearchInput, UserSearchResult } from '@/components/match/PlayerSearchInput';
import { Button } from '@/components/ui/button';

export function SearchTestPage() {
  const [selectedPlayer, setSelectedPlayer] = useState<UserSearchResult | null>(null);
  const [searchHistory, setSearchHistory] = useState<Array<{ query: string, timestamp: Date }>>([]);
  
  const handlePlayerSelected = (player: UserSearchResult | null) => {
    setSelectedPlayer(player);
    console.log('Player selected:', player);
  };
  
  const clearSelection = () => {
    setSelectedPlayer(null);
  };
  
  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 max-w-4xl">
        <h1 className="text-2xl font-bold mb-6">Player Search Test</h1>
        
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Search Players</CardTitle>
              <CardDescription>
                Test the player search functionality
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <PlayerSearchInput 
                  onPlayerSelected={handlePlayerSelected}
                  placeholder="Search for a player..."
                />
              </div>
              
              {selectedPlayer && (
                <div className="mt-4 p-4 border rounded-md bg-muted/20">
                  <h3 className="font-semibold mb-2">Selected Player:</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="font-medium">ID:</div>
                    <div>{selectedPlayer.id}</div>
                    
                    <div className="font-medium">Username:</div>
                    <div>{selectedPlayer.username}</div>
                    
                    <div className="font-medium">Display Name:</div>
                    <div>{selectedPlayer.displayName}</div>
                    
                    {selectedPlayer.fullName && (
                      <>
                        <div className="font-medium">Full Name:</div>
                        <div>{selectedPlayer.fullName}</div>
                      </>
                    )}
                    
                    <div className="font-medium">Avatar Initials:</div>
                    <div>{selectedPlayer.avatarInitials || 'None'}</div>
                    
                    <div className="font-medium">Founding Member:</div>
                    <div>{selectedPlayer.isFoundingMember ? 'Yes' : 'No'}</div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={clearSelection}
                    className="mt-4"
                  >
                    Clear Selection
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Search Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2">
                <li>Type 2 or more characters to search</li>
                <li>Search by username, display name, first name or last name</li>
                <li>Try searching for "Yoke Kheng" by name</li>
                <li>Try different search terms like "yoke", "kheng", or the full name</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default SearchTestPage;