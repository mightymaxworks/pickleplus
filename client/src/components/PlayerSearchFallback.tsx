/**
 * Player Search Fallback Component
 * Provides database search when QR scanning fails
 */
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, User, Users, Clock } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface Player {
  id: number;
  username: string;
  firstName?: string;
  lastName?: string;
  passportCode: string;
  duprRating?: number;
  email?: string;
}

interface PlayerSearchFallbackProps {
  onPlayerSelect: (passportCode: string) => void;
  title?: string;
  description?: string;
}

export function PlayerSearchFallback({
  onPlayerSelect,
  title = "Search Players",
  description = "Can't scan QR code? Search for players manually"
}: PlayerSearchFallbackProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  // Search players query
  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['/api/players/search', searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 2) return [];
      const response = await apiRequest('GET', `/api/players/search?q=${encodeURIComponent(searchTerm)}`);
      return await response.json();
    },
    enabled: searchTerm.length >= 2
  });

  const handlePlayerSelect = (player: Player) => {
    setSelectedPlayer(player);
    onPlayerSelect(player.passportCode);
  };

  const getPlayerDisplayName = (player: Player) => {
    if (player.firstName && player.lastName) {
      return `${player.firstName} ${player.lastName}`;
    }
    return player.username;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, username, or passport code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Search Results */}
        {searchTerm.length >= 2 && (
          <div className="space-y-2">
            {isSearching ? (
              <div className="flex items-center justify-center py-4">
                <Clock className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm text-muted-foreground">Searching...</span>
              </div>
            ) : searchResults && searchResults.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                <div className="text-sm text-muted-foreground mb-2">
                  Found {searchResults.length} player{searchResults.length !== 1 ? 's' : ''}
                </div>
                {searchResults.map((player: Player) => (
                  <div
                    key={player.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-muted ${
                      selectedPlayer?.id === player.id ? 'bg-primary/10 border-primary' : ''
                    }`}
                    onClick={() => handlePlayerSelect(player)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">
                            {getPlayerDisplayName(player)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            @{player.username}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {player.duprRating && (
                          <Badge variant="outline">
                            {player.duprRating} DUPR
                          </Badge>
                        )}
                        <Badge variant="secondary">
                          {player.passportCode}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : searchTerm.length >= 2 && !isSearching ? (
              <div className="text-center py-4 text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <div className="text-sm">No players found</div>
                <div className="text-xs">Try a different search term</div>
              </div>
            ) : null}
          </div>
        )}

        {/* Selected Player Confirmation */}
        {selectedPlayer && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-green-800">
              <User className="h-4 w-4" />
              <span className="font-medium">Selected:</span>
              <span>{getPlayerDisplayName(selectedPlayer)}</span>
              <Badge variant="outline" className="border-green-300 text-green-700">
                {selectedPlayer.passportCode}
              </Badge>
            </div>
          </div>
        )}

        {/* Search Tips */}
        {searchTerm.length < 2 && (
          <div className="text-xs text-muted-foreground space-y-1">
            <div>• Type at least 2 characters to search</div>
            <div>• Search by first name, last name, username, or passport code</div>
            <div>• Results are updated as you type</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}