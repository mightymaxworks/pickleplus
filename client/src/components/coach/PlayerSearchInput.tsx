/**
 * Player Search Input Component
 * Allows coaches to search and select players from their established relationships
 * Uses session-based and facility-based relationships only (no direct invitations)
 */

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, User, Users, Calendar, ChevronDown } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Player {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  displayName: string;
  avatarUrl?: string;
  relationshipType: 'session' | 'facility' | 'both';
  relationshipDetails: {
    lastSession?: string;
    totalSessions: number;
    facilities: string[];
    currentClasses: string[];
  };
}

interface PlayerSearchInputProps {
  coachId?: number;
  selectedPlayerId?: number | null;
  onPlayerSelect: (player: Player | null) => void;
  placeholder?: string;
  className?: string;
}

export default function PlayerSearchInput({
  coachId,
  selectedPlayerId,
  onPlayerSelect,
  placeholder = "Search your players...",
  className = ""
}: PlayerSearchInputProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  // Fetch coach's players from established relationships
  const { data: coachPlayers, isLoading } = useQuery({
    queryKey: ['/api/coach/my-players', coachId],
    queryFn: async () => {
      if (!coachId) return { success: false, players: [] };
      const response = await apiRequest('GET', `/api/coach/my-players`);
      return response.json();
    },
    enabled: !!coachId
  });

  const players: Player[] = coachPlayers?.success ? coachPlayers.players : [];

  // Update selected player when selectedPlayerId changes
  useEffect(() => {
    if (selectedPlayerId) {
      const player = players.find(p => p.id === selectedPlayerId);
      setSelectedPlayer(player || null);
    } else {
      setSelectedPlayer(null);
    }
  }, [selectedPlayerId, players]);

  const handlePlayerSelect = (player: Player) => {
    setSelectedPlayer(player);
    onPlayerSelect(player);
    setOpen(false);
  };

  const handleClear = () => {
    setSelectedPlayer(null);
    onPlayerSelect(null);
  };

  const getPlayerDisplayName = (player: Player) => {
    return player.displayName || `${player.firstName} ${player.lastName}`.trim() || player.username;
  };

  const getRelationshipBadge = (player: Player) => {
    switch (player.relationshipType) {
      case 'session':
        return <Badge variant="outline" className="text-xs">Session Player</Badge>;
      case 'facility':
        return <Badge variant="outline" className="text-xs">Class Student</Badge>;
      case 'both':
        return <Badge variant="default" className="text-xs">Regular Player</Badge>;
      default:
        return null;
    }
  };

  const getRelationshipDetails = (player: Player) => {
    const details = [];
    if (player.relationshipDetails.totalSessions > 0) {
      details.push(`${player.relationshipDetails.totalSessions} sessions`);
    }
    if (player.relationshipDetails.currentClasses.length > 0) {
      details.push(`${player.relationshipDetails.currentClasses.length} classes`);
    }
    return details.join(' • ');
  };

  // Filter players based on search
  const filteredPlayers = players.filter(player =>
    getPlayerDisplayName(player).toLowerCase().includes(searchValue.toLowerCase()) ||
    player.username.toLowerCase().includes(searchValue.toLowerCase())
  );

  // Group players by relationship type - show 'both' players in session section only
  const sessionPlayers = filteredPlayers.filter(p => p.relationshipType === 'session' || p.relationshipType === 'both');
  const facilityOnlyPlayers = filteredPlayers.filter(p => p.relationshipType === 'facility');

  return (
    <div className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedPlayer ? (
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={selectedPlayer.avatarUrl} />
                  <AvatarFallback className="text-xs">
                    {getPlayerDisplayName(selectedPlayer).slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate">{getPlayerDisplayName(selectedPlayer)}</span>
                {getRelationshipBadge(selectedPlayer)}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Search className="h-4 w-4" />
                <span>{placeholder}</span>
              </div>
            )}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Search players..."
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandList>
              {isLoading ? (
                <CommandEmpty>Loading your players...</CommandEmpty>
              ) : filteredPlayers.length === 0 ? (
                <CommandEmpty>
                  {searchValue ? "No players found matching your search." : "No players found. Players appear here after booking sessions or enrolling in your classes."}
                </CommandEmpty>
              ) : (
                <>
                  {selectedPlayer && (
                    <CommandGroup heading="Selected">
                      <CommandItem onSelect={handleClear}>
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 border border-dashed rounded" />
                          <span className="text-muted-foreground">Clear selection</span>
                        </div>
                      </CommandItem>
                    </CommandGroup>
                  )}
                  
                  {sessionPlayers.length > 0 && (
                    <CommandGroup heading="Session Players">
                      {sessionPlayers.map((player) => (
                        <CommandItem
                          key={player.id}
                          onSelect={() => handlePlayerSelect(player)}
                        >
                          <div className="flex items-center gap-3 w-full">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={player.avatarUrl} />
                              <AvatarFallback className="text-xs">
                                {getPlayerDisplayName(player).slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium truncate">
                                  {getPlayerDisplayName(player)}
                                </span>
                                {getRelationshipBadge(player)}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {getRelationshipDetails(player)}
                              </div>
                            </div>
                            <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}

                  {facilityOnlyPlayers.length > 0 && (
                    <CommandGroup heading="Class Students">
                      {facilityOnlyPlayers.map((player) => (
                        <CommandItem
                          key={player.id}
                          onSelect={() => handlePlayerSelect(player)}
                        >
                          <div className="flex items-center gap-3 w-full">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={player.avatarUrl} />
                              <AvatarFallback className="text-xs">
                                {getPlayerDisplayName(player).slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium truncate">
                                  {getPlayerDisplayName(player)}
                                </span>
                                {getRelationshipBadge(player)}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {getRelationshipDetails(player)}
                              </div>
                            </div>
                            <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}