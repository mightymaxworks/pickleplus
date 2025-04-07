import { useState, useEffect, useRef } from "react";
import { Check, ChevronsUpDown, User, X, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { UseFormReturn } from "react-hook-form";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Make sure our interface matches the one from playerSDK
interface UserSearchResult {
  id: number;
  displayName: string | null;
  username: string;
  passportId?: string | null;
  avatarUrl?: string | null;
  avatarInitials?: string;
}

interface DialogPlayerSelectProps {
  form: UseFormReturn<any>;
  fieldName: string;
  label: string;
  placeholder?: string;
  selectedPlayer?: { id: number; displayName: string; avatarInitials?: string; avatarUrl?: string } | null;
  excludePlayerIds?: number[];
  onClear?: () => void;
  required?: boolean;
  hideRemoveButton?: boolean;
}

export function DialogPlayerSelect({
  form,
  fieldName,
  label,
  placeholder = "Search for a player...",
  selectedPlayer,
  excludePlayerIds = [],
  onClear,
  required = false,
  hideRemoveButton = false,
}: DialogPlayerSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const debouncerRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce the search query
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

  // Fetch search results based on the debounced query
  const {
    data: searchResults = [],
    isLoading,
    isFetching,
    error,
  } = useQuery<UserSearchResult[]>({
    queryKey: ["/api/player/search", debouncedQuery, excludePlayerIds],
    queryFn: async () => {
      console.log("Dialog search query triggered with:", debouncedQuery);
      if (!debouncedQuery || debouncedQuery.length < 2) return [];
      
      try {
        // Import and use the playerSDK
        const { searchPlayers } = await import("@/lib/sdk/playerSDK");
        
        // Call the SDK function
        console.log("Dialog using playerSDK.searchPlayers with query:", debouncedQuery);
        const results = await searchPlayers(debouncedQuery);
        console.log("Dialog search results received:", results.length);
        
        // Filter out excluded player IDs
        const filteredResults = results.filter((user: UserSearchResult) => 
          !excludePlayerIds.includes(user.id)
        );
        console.log("Dialog filtered results:", filteredResults.length);
        
        return filteredResults;
      } catch (error) {
        console.error("Dialog search error:", error);
        return [];
      }
    },
    enabled: debouncedQuery.length >= 2 && open,
    retry: 1,
  });
  
  // Log any errors from the query
  useEffect(() => {
    if (error) {
      console.error("Player search query error:", error);
    }
  }, [error]);

  // Handle selection of a player
  const selectPlayer = (playerData: UserSearchResult) => {
    console.log("Selecting player:", playerData);
    form.setValue(fieldName, playerData.id);
    
    // Construct player data with avatar initials as fallback, using username as backup for displayName
    const displayName = playerData.displayName || playerData.username;
    const selectedPlayerData = {
      id: playerData.id,
      displayName: displayName,
      avatarUrl: playerData.avatarUrl,
      avatarInitials: playerData.avatarInitials || displayName.charAt(0)
    };
    
    // Update the formState with the complete player data
    if (fieldName === "playerOneId") {
      window.dispatchEvent(new CustomEvent('player-selected', { 
        detail: { field: 'playerOneData', player: selectedPlayerData }
      }));
    } else if (fieldName === "playerTwoId") {
      window.dispatchEvent(new CustomEvent('player-selected', { 
        detail: { field: 'playerTwoData', player: selectedPlayerData }
      }));
    } else if (fieldName === "playerOnePartnerId") {
      window.dispatchEvent(new CustomEvent('player-selected', { 
        detail: { field: 'playerOnePartnerData', player: selectedPlayerData }
      }));
    } else if (fieldName === "playerTwoPartnerId") {
      window.dispatchEvent(new CustomEvent('player-selected', { 
        detail: { field: 'playerTwoPartnerData', player: selectedPlayerData }
      }));
    }
    
    setOpen(false);
  };

  // Handle clearing the selection
  const clearSelection = () => {
    form.setValue(fieldName, undefined);
    if (onClear) {
      onClear();
    }
  };

  return (
    <FormField
      control={form.control}
      name={fieldName}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </FormLabel>
          <div className="flex gap-2">
            <div className="w-full">
              <FormControl>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "w-full justify-between",
                    !field.value && "text-muted-foreground"
                  )}
                  onClick={() => setOpen(true)}
                >
                  {selectedPlayer ? (
                    <div className="flex items-center">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-2 text-xs">
                        {selectedPlayer.avatarUrl ? (
                          <img
                            src={selectedPlayer.avatarUrl}
                            alt={selectedPlayer.displayName}
                            className="h-6 w-6 rounded-full"
                          />
                        ) : (
                          selectedPlayer.avatarInitials || (selectedPlayer.displayName ? selectedPlayer.displayName.charAt(0) : "?")
                        )}
                      </div>
                      {selectedPlayer.displayName}
                    </div>
                  ) : (
                    placeholder
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </div>
            
            {selectedPlayer && !hideRemoveButton && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={clearSelection}
                className="h-10 w-10 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Select Player</DialogTitle>
              </DialogHeader>
              
              <div className="flex items-center space-x-2 py-4">
                <div className="grid flex-1 gap-2">
                  <Input
                    placeholder="Search by name or username..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                    aria-label="Search players"
                  />
                </div>
              </div>
              
              <div className="max-h-[300px] overflow-y-auto">
                {isLoading || isFetching ? (
                  <div className="py-6 text-center text-sm">
                    <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                    <span>Searching...</span>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    {debouncedQuery.length < 2
                      ? "Type at least 2 characters to search"
                      : "No players found"}
                  </div>
                ) : (
                  <div className="space-y-1">
                    {searchResults.map((player) => (
                      <button
                        key={player.id}
                        type="button"
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-accent focus:bg-accent focus:outline-none",
                          field.value === player.id && "bg-accent"
                        )}
                        onClick={() => selectPlayer(player)}
                      >
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3 text-xs">
                            {player.avatarUrl ? (
                              <img
                                src={player.avatarUrl}
                                alt={player.displayName || player.username}
                                className="h-8 w-8 rounded-full"
                              />
                            ) : (
                              player.avatarInitials || (player.displayName ? player.displayName.charAt(0) : player.username.charAt(0))
                            )}
                          </div>
                          <div className="flex flex-col text-left">
                            <span className="font-medium">{player.displayName || player.username}</span>
                            <span className="text-xs text-muted-foreground">@{player.username}</span>
                          </div>
                        </div>
                        
                        {field.value === player.id && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
          
          <FormMessage />
        </FormItem>
      )}
    />
  );
}