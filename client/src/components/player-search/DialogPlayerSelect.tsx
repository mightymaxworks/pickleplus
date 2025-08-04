import { useState, useEffect, useRef } from "react";
import { Check, ChevronsUpDown, User, X, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { UserSearchResult } from "@/lib/sdk/playerSDK";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { searchPlayers } from "@/api/playerSearchApi";
import { PlayerSearchResult } from "@shared/types/player-search.types";

interface DialogPlayerSelectProps {
  onSelect?: (player: UserSearchResult) => void;
  buttonLabel?: string;
  buttonVariant?: "default" | "outline" | "secondary" | "ghost";
  selectedUserId?: number;
  excludeUserIds?: number[];
  placeholder?: string;
  disabled?: boolean;
}

export function DialogPlayerSelect({
  onSelect,
  buttonLabel = "Select Player",
  buttonVariant = "default",
  selectedUserId,
  excludeUserIds = [],
  placeholder = "Search for a player...",
  disabled = false,
}: DialogPlayerSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const debouncerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Debounce search input
  useEffect(() => {
    if (debouncerRef.current) {
      clearTimeout(debouncerRef.current);
    }

    debouncerRef.current = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => {
      if (debouncerRef.current) {
        clearTimeout(debouncerRef.current);
      }
    };
  }, [searchQuery]);
  
  // Fetch search results using the unified search component
  const { data: searchResults = [], isLoading, isFetching } = useQuery({
    queryKey: ["player-search", debouncedQuery, excludeUserIds],
    queryFn: async () => {
      if (!debouncedQuery || debouncedQuery.length < 2) return [];
      
      try {
        // Use the unified player search component
        const searchResponse = await searchPlayers({
          query: debouncedQuery,
          excludeUserIds: excludeUserIds
        });
        
        return searchResponse.results;
      } catch (error) {
        // Log error in production-friendly way
        if (process.env.NODE_ENV !== 'production') {
          console.error("Error searching players:", error);
        }
        return [];
      }
    },
    enabled: debouncedQuery.length >= 2,
  });
  
  // Handle player selection
  const handleSelectPlayer = (player: PlayerSearchResult) => {
    if (onSelect) {
      onSelect(player as UserSearchResult);
    }
    
    // Dispatch a custom event for components that listen for player selection
    const selectEvent = new CustomEvent('player-selected', {
      detail: { player }
    });
    window.dispatchEvent(selectEvent);
    
    setOpen(false);
    setSearchQuery("");
  };
  
  return (
    <div className="w-full">
      <Button
        variant={buttonVariant}
        onClick={() => setOpen(true)}
        className="w-full justify-between"
        disabled={disabled}
      >
        {buttonLabel}
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Player</DialogTitle>
          </DialogHeader>
          
          <div className="flex items-center space-x-2 py-4">
            <div className="grid flex-1 gap-2">
              <Input
                placeholder="Search by name, username, or passport ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
                aria-label="Search players by name, username, or passport ID"
              />
            </div>
          </div>
          
          <div className="max-h-[300px] overflow-y-auto">
            {isLoading || isFetching ? (
              <div className="py-6 text-center text-sm">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                <p>Searching players...</p>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                {debouncedQuery.length < 2 ? (
                  "Enter at least 2 characters to search"
                ) : (
                  "No players found. Try a different search."
                )}
              </div>
            ) : (
              <div className="space-y-1">
                {searchResults.map((player) => (
                  <button
                    key={player.id}
                    type="button"
                    className={cn(
                      "flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm",
                      selectedUserId === player.id 
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-accent"
                    )}
                    onClick={() => handleSelectPlayer(player)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        {'avatarUrl' in player && player.avatarUrl ? (
                          <AvatarImage src={player.avatarUrl} alt={player.displayName || player.username} />
                        ) : null}
                        <AvatarFallback>
                          {player.avatarInitials || (player.displayName ? player.displayName.charAt(0) : player.username.charAt(0))}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col text-left">
                        <span className="font-medium">{player.displayName || player.username}</span>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>@{player.username}</span>
                          {('passportId' in player && player.passportId) && (
                            <span>• ID: {player.passportId}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {selectedUserId === player.id && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}