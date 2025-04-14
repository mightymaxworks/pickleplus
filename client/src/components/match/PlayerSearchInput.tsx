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

/**
 * PlayerSearchInput Component
 * 
 * A reusable player search component that allows users to find and select other players.
 * 
 * UI Integration Points:
 * - Match Recording: Used to find opponents (Navigation: Match Center → Record Match)
 * - Match Filtering: Used to filter by opponent (Navigation: Match Center → History tab → Filter button)
 * - Social Connections: Used to find players to connect with (Navigation: Social → Find Players)
 * 
 * Mobile Considerations:
 * - Search results display in a compact dropdown
 * - Avatar size reduced on smaller screens
 * - Touch-friendly hit areas for selection
 */

export interface UserSearchResult {
  id: number;
  username: string;
  displayName: string;
  fullName?: string | null;
  avatarUrl?: string;
  avatarInitials?: string;
  isFoundingMember?: boolean;
  passportId?: string | null;
}

interface PlayerSearchInputProps {
  onPlayerSelected: (player: UserSearchResult | null) => void;
  placeholder?: string;
  excludeUserIds?: number[];
}

export function PlayerSearchInput({ 
  onPlayerSelected, 
  placeholder = "Search players...",
  excludeUserIds = []
}: PlayerSearchInputProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<UserSearchResult[]>([]);
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  
  // Search for players when the query changes
  useEffect(() => {
    if (!debouncedSearchQuery || debouncedSearchQuery.length < 2) {
      setResults([]);
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call - this would be replaced with a real API call
    fetch(`/api/player/search?q=${encodeURIComponent(debouncedSearchQuery)}`)
      .then(res => res.json())
      .then(data => {
        // Filter out excluded users
        const filteredResults = data.filter((user: UserSearchResult) => 
          !excludeUserIds.includes(user.id)
        );
        setResults(filteredResults);
      })
      .catch(err => {
        console.error("Error searching players:", err);
        setResults([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [debouncedSearchQuery, excludeUserIds]);
  
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