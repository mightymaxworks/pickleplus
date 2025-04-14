/**
 * PKL-278651-SRCH-0001-UNIFD
 * Enhanced Unified Player Search Component
 */
import React, { useState, useEffect, useRef } from 'react';
import { 
  CommandInput, 
  CommandList, 
  CommandEmpty, 
  CommandGroup, 
  CommandItem,
  Command
} from '@/components/ui/command';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, Search, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { searchPlayers } from '@/api/playerSearchApi';
import { PlayerSearchOptions, PlayerSearchResult } from '@shared/types/player-search.types';

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
  placeholder = 'Search for a player...', 
  excludeUserIds = [],
  limit = 15
}: PlayerSearchInputProps) {
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<PlayerSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Check whether there's anything to search
  const hasQueryToSearch = query && query.length >= 2;
  
  // Debounced search function
  const searchWithDebounce = (searchQuery: string) => {
    // Clear any existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Only proceed if we have a valid query
    if (searchQuery && searchQuery.length >= 2) {
      setIsLoading(true);
      setError(null);
      
      // Set a new timer
      debounceTimerRef.current = setTimeout(async () => {
        try {
          // Configure search options
          const searchOptions: PlayerSearchOptions = {
            query: searchQuery,
            limit,
            excludeUserIds
          };
          
          // Perform search
          const searchResponse = await searchPlayers(searchOptions);
          
          if (searchResponse.error) {
            setError(searchResponse.error);
            setResults([]);
          } else {
            setResults(searchResponse.results);
            setError(null);
          }
        } catch (err) {
          // Log error in production-friendly way
          if (process.env.NODE_ENV !== 'production') {
            console.error('Player search error:', err);
          }
          setError('Failed to search players. Please try again.');
          setResults([]);
        } finally {
          setIsLoading(false);
        }
      }, 300); // 300ms debounce
    } else {
      setResults([]);
    }
  };
  
  // Handle query changes
  useEffect(() => {
    searchWithDebounce(query);
    
    // Show dropdown if there's a query
    if (hasQueryToSearch) {
      setIsOpen(true);
    }
    
    return () => {
      // Clean up timer on unmount
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query]);
  
  // Handle player selection
  const handleSelectPlayer = (player: PlayerSearchResult) => {
    onPlayerSelected(player);
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };
  
  // Handle input focus
  const handleFocus = () => {
    if (hasQueryToSearch) {
      setIsOpen(true);
    }
  };
  
  return (
    <div className="relative w-full">
      <Command className="border rounded-lg overflow-visible">
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <CommandInput
            placeholder={placeholder}
            value={query}
            onValueChange={setQuery}
            onFocus={handleFocus}
            className="flex-1 min-h-10 outline-none"
          />
          {isLoading && (
            <Loader2 className="animate-spin h-4 w-4 opacity-70" />
          )}
        </div>
        
        {isOpen && (query || isLoading || error) && (
          <div className="relative">
            <CommandList className="absolute top-0 left-0 right-0 z-50 max-h-64 overflow-auto rounded-b-md border border-t-0 bg-popover shadow-md">
              {error && (
                <div className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2 text-red-500 mb-2">
                    <AlertCircle className="h-4 w-4" />
                    <span className="font-medium">Search Error</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{error}</p>
                </div>
              )}
              
              {!error && isLoading && (
                <div className="py-6 text-center">
                  <Loader2 className="h-8 w-8 animate-spin opacity-50 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Searching players...</p>
                </div>
              )}
              
              {!error && !isLoading && results.length === 0 && query.length >= 2 && (
                <CommandEmpty className="py-6 text-center">
                  <p className="text-sm mb-2">No players found</p>
                  <p className="text-xs text-muted-foreground">
                    Try a different search term or check spelling
                  </p>
                </CommandEmpty>
              )}
              
              {!error && !isLoading && results.length > 0 && (
                <CommandGroup>
                  {results.map((player) => (
                    <CommandItem
                      key={player.id}
                      value={player.username}
                      onSelect={() => handleSelectPlayer(player)}
                      className="flex items-center gap-2 py-2 cursor-pointer hover:bg-accent"
                    >
                      <Avatar className="h-8 w-8">
                        {player.avatarUrl ? (
                          <AvatarImage src={player.avatarUrl} alt={player.displayName} />
                        ) : (
                          <AvatarFallback className="bg-primary/10 text-primary-foreground">
                            {player.avatarInitials || player.displayName?.charAt(0) || player.username?.charAt(0) || '?'}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      
                      <div className="flex flex-col flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">
                            {player.displayName}
                          </span>
                          {player.isFoundingMember && (
                            <Badge variant="outline" className="h-5 border-amber-500 text-amber-500 text-xs">
                              Founding
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground truncate">
                          @{player.username}
                          {player.passportId && (
                            <span className="ml-2 text-xs text-muted-foreground font-mono">
                              ID: {player.passportId}
                            </span>
                          )}
                        </span>
                      </div>
                      
                      {player.rating !== undefined && player.rating !== null && (
                        <span className="text-sm font-medium ml-auto">
                          {player.rating}
                        </span>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </div>
        )}
      </Command>
    </div>
  );
}

export default PlayerSearchInput;