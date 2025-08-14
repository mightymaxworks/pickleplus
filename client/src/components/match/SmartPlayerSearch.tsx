import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Search, CheckCircle2, User, Hash } from 'lucide-react';

interface Player {
  id: number;
  username: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  passportCode: string;
  gender?: string;
  profileImageUrl?: string;
  isVerified?: boolean;
}

interface SmartPlayerSearchProps {
  label: string;
  placeholder?: string;
  selectedPlayer: Player | null;
  onPlayerSelect: (player: Player | null) => void;
  disabled?: boolean;
  excludePlayerIds?: number[];
}

export const SmartPlayerSearch: React.FC<SmartPlayerSearchProps> = ({
  label,
  placeholder = "Enter name or passport code...",
  selectedPlayer,
  onPlayerSelect,
  disabled = false,
  excludePlayerIds = []
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Search players with debounced query
  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['/api/players/search', searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 2) return [];
      const response = await apiRequest('GET', `/api/players/search?q=${encodeURIComponent(searchTerm)}&limit=10`);
      const data = await response.json();
      return data.filter((player: Player) => !excludePlayerIds.includes(player.id));
    },
    enabled: searchTerm.length >= 2,
    staleTime: 30000, // Cache for 30 seconds
  });

  // Update search term when a player is selected externally
  useEffect(() => {
    if (selectedPlayer) {
      const displayText = `${selectedPlayer.displayName || selectedPlayer.username} (${selectedPlayer.passportCode})`;
      setSearchTerm(displayText);
      setIsOpen(false);
    } else {
      setSearchTerm('');
    }
  }, [selectedPlayer]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || !searchResults?.length) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex(prev => 
            prev < searchResults.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex(prev => 
            prev > 0 ? prev - 1 : searchResults.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (searchResults[highlightedIndex]) {
            handlePlayerSelect(searchResults[highlightedIndex]);
          }
          break;
        case 'Escape':
          setIsOpen(false);
          inputRef.current?.blur();
          break;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, searchResults, highlightedIndex]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsOpen(value.length >= 2);
    setHighlightedIndex(0);
    
    // Clear selection if input is cleared
    if (!value && selectedPlayer) {
      onPlayerSelect(null);
    }
  };

  const handlePlayerSelect = (player: Player) => {
    onPlayerSelect(player);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleInputFocus = () => {
    if (searchTerm.length >= 2 && searchResults?.length > 0) {
      setIsOpen(true);
    }
  };

  const getPlayerDisplayName = (player: Player) => {
    return player.displayName || `${player.firstName || ''} ${player.lastName || ''}`.trim() || player.username;
  };

  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} className="bg-yellow-200 font-medium">{part}</span>
      ) : (
        part
      )
    );
  };

  return (
    <div className="space-y-2 relative">
      <Label htmlFor={`search-${label.replace(/\s+/g, '-').toLowerCase()}`}>
        {label}
        {selectedPlayer && (
          <Badge variant="default" className="ml-2">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Selected
          </Badge>
        )}
      </Label>
      
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            id={`search-${label.replace(/\s+/g, '-').toLowerCase()}`}
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            placeholder={placeholder}
            disabled={disabled}
            className={`pl-10 ${selectedPlayer ? 'border-green-500 bg-green-50' : ''}`}
          />
        </div>

        {/* Search Results Dropdown */}
        {isOpen && searchTerm.length >= 2 && (
          <div 
            ref={dropdownRef}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
          >
            {isLoading && (
              <div className="p-3 text-center text-muted-foreground">
                <Search className="h-4 w-4 animate-pulse mx-auto mb-1" />
                Searching players...
              </div>
            )}
            
            {!isLoading && (!searchResults || searchResults.length === 0) && (
              <div className="p-3 text-center text-muted-foreground">
                <User className="h-4 w-4 mx-auto mb-1" />
                No players found matching "{searchTerm}"
              </div>
            )}
            
            {!isLoading && searchResults && searchResults.length > 0 && (
              <div className="py-1">
                {searchResults.map((player, index) => (
                  <div
                    key={player.id}
                    onClick={() => handlePlayerSelect(player)}
                    className={`px-3 py-2 cursor-pointer transition-colors ${
                      index === highlightedIndex 
                        ? 'bg-blue-50 border-l-4 border-blue-500' 
                        : 'hover:bg-gray-50'
                    }`}
                    onMouseEnter={() => setHighlightedIndex(index)}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={player.profileImageUrl} />
                        <AvatarFallback className="text-xs">
                          {getPlayerDisplayName(player).charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium truncate">
                            {highlightSearchTerm(getPlayerDisplayName(player), searchTerm)}
                          </span>
                          {player.isVerified && (
                            <CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0" />
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Hash className="h-3 w-3" />
                          <span className="font-mono">
                            {highlightSearchTerm(player.passportCode, searchTerm)}
                          </span>
                          {player.gender && (
                            <Badge variant="secondary" className="text-xs">
                              {player.gender}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="text-xs text-muted-foreground">
                          @{highlightSearchTerm(player.username, searchTerm)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected Player Display */}
      {selectedPlayer && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-3">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={selectedPlayer.profileImageUrl} />
                <AvatarFallback>
                  {getPlayerDisplayName(selectedPlayer).charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-green-800">
                    {getPlayerDisplayName(selectedPlayer)}
                  </span>
                  {selectedPlayer.isVerified && (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  )}
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-green-700">
                  <Hash className="h-3 w-3" />
                  <span className="font-mono font-medium">{selectedPlayer.passportCode}</span>
                  {selectedPlayer.gender && (
                    <Badge variant="secondary" className="text-xs">
                      {selectedPlayer.gender}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};