/**
 * PKL-278651-SRCH-0001-UNIFD
 * Enhanced Unified Player Search Component - Test Page
 */
import React, { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Check, Info, Search } from 'lucide-react';
import PlayerSearchInput, { PlayerSearchResult } from '../components/match/PlayerSearchInput';

/**
 * PlayerSearchTestPage component
 * 
 * Used to test the unified player search component in isolation
 */
export function PlayerSearchTestPage() {
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerSearchResult | null>(null);
  const [searchHistory, setSearchHistory] = useState<Array<{ player: PlayerSearchResult, timestamp: Date }>>([]);
  
  // Handle player selection
  const handlePlayerSelected = (player: PlayerSearchResult | null) => {
    if (player) {
      setSelectedPlayer(player);
      
      // Add to search history
      setSearchHistory(prev => [
        { player, timestamp: new Date() },
        ...prev.slice(0, 4) // Keep only the last 5 items
      ]);
    }
  };
  
  // Clear current selection
  const clearSelection = () => {
    setSelectedPlayer(null);
  };
  
  // Clear search history
  const clearHistory = () => {
    setSearchHistory([]);
  };
  
  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 max-w-4xl">
        <h1 className="text-2xl font-bold mb-6">Player Search Component</h1>
        
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertTitle>Unified Search Component</AlertTitle>
          <AlertDescription>
            This page demonstrates the enhanced player search component (PKL-278651-SRCH-0001-UNIFD) with
            improved error handling and standardized interfaces.
          </AlertDescription>
        </Alert>
        
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Search Players</CardTitle>
              <CardDescription>
                Search for players using name, username, or passport ID
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
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">Selected Player</h3>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={clearSelection}
                    >
                      Clear
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="font-medium">ID:</div>
                    <div>{selectedPlayer.id}</div>
                    
                    <div className="font-medium">Username:</div>
                    <div>@{selectedPlayer.username}</div>
                    
                    <div className="font-medium">Display Name:</div>
                    <div>{selectedPlayer.displayName}</div>
                    
                    {selectedPlayer.fullName && (
                      <>
                        <div className="font-medium">Full Name:</div>
                        <div>{selectedPlayer.fullName}</div>
                      </>
                    )}
                    
                    {selectedPlayer.passportId && (
                      <>
                        <div className="font-medium">Passport ID:</div>
                        <div className="font-mono">{selectedPlayer.passportId}</div>
                      </>
                    )}
                    
                    {selectedPlayer.isFoundingMember && (
                      <>
                        <div className="font-medium">Member Status:</div>
                        <div>
                          <Badge variant="outline" className="border-amber-500 text-amber-500">
                            Founding Member
                          </Badge>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {searchHistory.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Recent Searches</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={clearHistory}
                  >
                    Clear History
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {searchHistory.map((item, index) => (
                    <li 
                      key={`${item.player.id}-${index}`}
                      className="flex items-center justify-between p-2 rounded-md border"
                    >
                      <div className="flex items-center gap-2">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {item.player.displayName}
                        </span>
                        <span className="text-muted-foreground text-sm">
                          @{item.player.username}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {item.timestamp.toLocaleTimeString()}
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default PlayerSearchTestPage;