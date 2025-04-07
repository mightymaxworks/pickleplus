import { useState, useEffect, useRef } from "react";
import { Check, ChevronsUpDown, User, X } from "lucide-react";
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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface UserSearchResult {
  id: number;
  displayName: string;
  username: string;
  passportId?: string | null;
  avatarUrl?: string | null;
  avatarInitials?: string;
}

interface SearchablePlayerSelectProps {
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

export function SearchablePlayerSelect({
  form,
  fieldName,
  label,
  placeholder = "Search for a player...",
  selectedPlayer,
  excludePlayerIds = [],
  onClear,
  required = false,
  hideRemoveButton = false,
}: SearchablePlayerSelectProps) {
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
    queryKey: ["/api/users/search", debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery || debouncedQuery.length < 2) return [];

      const params = new URLSearchParams({
        q: debouncedQuery,
      });

      try {
        console.log("Making player search request:", `/api/users/search?${params.toString()}`);
        const response = await apiRequest("GET", `/api/users/search?${params.toString()}`);
        console.log("Player search response status:", response.status);
        
        if (!response.ok) {
          throw new Error(`Player search API error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Player search results:", data.length);

        // Filter out excluded player IDs
        return data.filter((user: UserSearchResult) => 
          !excludePlayerIds.includes(user.id)
        );
      } catch (err) {
        console.error("Player search error:", err);
        throw err;
      }
    },
    enabled: debouncedQuery.length >= 2,
    retry: 1,
  });
  
  // Log any errors for debugging
  useEffect(() => {
    if (error) {
      console.error("Player search query error:", error);
    }
  }, [error]);

  // Handle selection of a player
  const selectPlayer = (playerData: UserSearchResult) => {
    form.setValue(fieldName, playerData.id);
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
          <Popover open={open} onOpenChange={setOpen}>
            <div className="flex gap-2">
              <div className="w-full">
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className={cn(
                        "w-full justify-between",
                        !field.value && "text-muted-foreground"
                      )}
                      onClick={() => setOpen(!open)}
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
                              selectedPlayer.avatarInitials || selectedPlayer.displayName.charAt(0)
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
                </PopoverTrigger>
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
            
            <PopoverContent className="p-0" align="start">
              <Command>
                <CommandInput
                  placeholder="Search by name or username..."
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                />
                <CommandList>
                  {isLoading || isFetching ? (
                    <div className="py-6 text-center text-sm">
                      <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      Searching...
                    </div>
                  ) : searchResults.length === 0 ? (
                    <CommandEmpty>
                      {debouncedQuery.length < 2
                        ? "Type at least 2 characters to search"
                        : "No players found"}
                    </CommandEmpty>
                  ) : (
                    <CommandGroup>
                      {searchResults.map((player: UserSearchResult) => (
                        <CommandItem
                          key={player.id}
                          value={player.id.toString()}
                          onSelect={() => selectPlayer(player)}
                        >
                          <div className="flex items-center">
                            <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-2 text-xs">
                              {player.avatarUrl ? (
                                <img
                                  src={player.avatarUrl}
                                  alt={player.displayName}
                                  className="h-7 w-7 rounded-full"
                                />
                              ) : (
                                player.avatarInitials || player.displayName.charAt(0)
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium">{player.displayName}</span>
                              <span className="text-xs text-muted-foreground">@{player.username}</span>
                            </div>
                          </div>
                          
                          {field.value === player.id && (
                            <Check className="ml-auto h-4 w-4 text-primary" />
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}