/**
 * PKL-278651-SRCH-0001-UNIFD
 * Enhanced Unified Player Search Component
 */
import React, { useState, useEffect } from 'react';
import { 
  Command, 
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem, 
  CommandList 
} from "@/components/ui/command";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Loader2, User } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { searchPlayers } from '../../api/playerSearchApi';

// Define the PlayerSearchResult type directly here until the shared types are properly set up
export interface PlayerSearchResult {
  id: number;
  username: string;
  displayName: string;
  fullName?: string | null;
  avatarUrl?: string;
  avatarInitials?: string;
  isFoundingMember?: boolean;
  passportId?: string | null;
  rating?: number | null;
}

/**
 * PlayerSearchInput Component
 * 
 * A reusable player search component that allows users to find and select other players.
 * 
 * UI Integration Points:
 * - Match Recording: Used to find opponents (Navigation: Match Center → Record Match)
 * - Match Filtering: Used to filter by opponent (Navigation: Match Center → History tab → Filter button)
 * - Social Connections: Used to find players to connect with (Navigation: Social → Find Players)
 * - Tournament Management: Used to add players to teams (Navigation: Tournaments → Create Team)
 * 
 * Mobile Considerations:
 * - Search results display in a compact dropdown
 * - Avatar size reduced on smaller screens
 * - Touch-friendly hit areas for selection
 */

interface PlayerSearchInputProps {
  onPlayerSelected: (player: PlayerSearchResult | null) => void;
  placeholder?: string;
  excludeUserIds?: number[];
  limit?: number;
}

export function PlayerSearchInput({ 
  onPlayerSelected, 
  placeholder = "Search players...",
  excludeUserIds = [],
  limit = 15
}: PlayerSearchInputProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<PlayerSearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  
  // Search for players when the query changes
  useEffect(() => {
    // Reset results and errors if query is empty
    if (!debouncedSearchQuery || debouncedSearchQuery.length < 2) {
      setResults([]);
      setError(null);
      return;
    }
    
    // Set loading state
    setIsLoading(true);
    setError(null);
    
    // Flag to handle component unmounting
    let isMounted = true;
    
    // Execute search using the API client
    const performSearch = async () => {
      try {
        // Use the searchPlayers function from our SDK layer
        const searchResponse = await searchPlayers({
          query: debouncedSearchQuery,
          limit,
          excludeUserIds
        });
        
        // Stop if component unmounted during async operation
        if (!isMounted) return;
        
        // Handle potential error from the API
        if (searchResponse.error) {
          setError(searchResponse.error);
          setResults([]);
        } else {
          setResults(searchResponse.results);
        }
      } catch (err) {
        console.error("[PlayerSearch] Error in search component:", err);
        if (isMounted) {
          setError("An unexpected error occurred while searching");
          setResults([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    // Execute the search
    performSearch();
    
    // Cleanup function to prevent state updates if component unmounts
    return () => {
      isMounted = false;
    };
  }, [debouncedSearchQuery, excludeUserIds, limit]);
  
  return (
    <Command className="rounded-lg border shadow-md">
      <CommandInput 
        placeholder={placeholder} 
        value={searchQuery}
        onValueChange={setSearchQuery}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
      />
      {open && (
        <CommandList>
          {isLoading && (
            <div className="p-2">
              <Skeleton className="h-8 w-full rounded-md mb-2" />
              <Skeleton className="h-8 w-full rounded-md mb-2" />
              <Skeleton className="h-8 w-full rounded-md" />
            </div>
          )}
          
          {!isLoading && results.length === 0 && (
            <CommandEmpty>
              {searchQuery.length < 2 ? (
                "Type at least 2 characters to search"
              ) : error ? (
                <div className="text-red-500">
                  <span className="text-sm font-semibold">Error: </span>
                  <span className="text-sm">{error}</span>
                </div>
              ) : (
                "No players found"
              )}
            </CommandEmpty>
          )}
          
          {!isLoading && results.length > 0 && (
            <CommandGroup heading="Players">
              {results.map((player) => (
                <CommandItem
                  key={player.id}
                  value={`${player.id}-${player.username}`}
                  onSelect={() => {
                    onPlayerSelected(player);
                    setOpen(false);
                  }}
                >
                  <Avatar className="h-6 w-6 mr-2">
                    {player.avatarUrl ? (
                      <AvatarImage src={player.avatarUrl} alt={player.displayName} />
                    ) : (
                      <AvatarFallback>
                        {player.avatarInitials || player.displayName.charAt(0)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <span className="font-medium">{player.displayName}</span>
                  {player.fullName && player.fullName !== player.displayName && (
                    <span className="text-muted-foreground ml-1 text-xs">
                      ({player.fullName})
                    </span>
                  )}
                  <span className="text-muted-foreground ml-2 text-xs">
                    @{player.username}
                  </span>
                  
                  {player.passportId && (
                    <span className="text-muted-foreground ml-2 text-xs font-mono">
                      ID: {player.passportId}
                    </span>
                  )}
                  
                  {player.isFoundingMember && (
                    <Badge variant="outline" className="ml-2 border-amber-500 text-amber-500">
                      Founder
                    </Badge>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      )}
    </Command>
  );
}

export default PlayerSearchInput;