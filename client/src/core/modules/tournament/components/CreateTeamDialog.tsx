/**
 * PKL-278651-TOURN-0001-BRCKT
 * Create Team Dialog Component
 * 
 * Dialog for creating a new team for a tournament
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Users, Search, X, Loader2, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useDebounce } from '@/hooks/useDebounce';

// Define team form schema
const teamFormSchema = z.object({
  teamName: z.string().min(3, { message: 'Team name must be at least 3 characters' }),
  playerOneId: z.number({ required_error: 'Player One is required' }),
  playerTwoId: z.number({ required_error: 'Player Two is required' }),
  seedNumber: z.number().optional(),
  notes: z.string().optional(),
  status: z.enum(['active', 'pending', 'withdrawn']).default('active'),
});

type TeamFormValues = z.infer<typeof teamFormSchema>;

type User = {
  id: number;
  displayName: string;
  username: string;
  avatarUrl?: string;
  avatarInitials?: string;
  rating?: number;
};

type CreateTeamDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tournamentId: number;
};

export function CreateTeamDialog({ open, onOpenChange, tournamentId }: CreateTeamDialogProps) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [searchingFor, setSearchingFor] = useState<'player1' | 'player2'>('player1');
  const [selectedPlayers, setSelectedPlayers] = useState<{
    player1?: User;
    player2?: User;
  }>({});
  
  // Default form values
  const defaultValues: Partial<TeamFormValues> = {
    teamName: '',
    status: 'active',
  };
  
  const form = useForm<TeamFormValues>({
    resolver: zodResolver(teamFormSchema),
    defaultValues,
  });
  
  // Framework 5.0: Enhanced player search with proper error handling
  const playerSearchFetcher = async ({ queryKey }: { queryKey: string[] }) => {
    const searchTerm = queryKey[1];
    
    if (!searchTerm || searchTerm.length < 2) {
      console.log('[TeamDialog][Debug] Search term too short:', searchTerm);
      return [];
    }
    
    console.log(`[TeamDialog][Debug] Searching for players with query: "${searchTerm}"`);
    
    try {
      // Framework 5.0: Use fetch directly with credentials for better debugging
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchTerm)}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
        }
      });
      
      console.log(`[TeamDialog][Debug] Search response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[TeamDialog][Debug] Search API error:`, errorText);
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log(`[TeamDialog][Debug] Found ${data.length || 0} players matching "${searchTerm}"`);
      
      return data.map((user: any) => ({
        id: user.id,
        displayName: user.displayName || user.username,
        username: user.username,
        avatarUrl: user.avatarUrl,
        avatarInitials: user.avatarInitials || user.displayName?.charAt(0) || user.username?.charAt(0) || '?',
        rating: user.rating
      }));
    } catch (error) {
      console.error('[TeamDialog][Debug] Player search error:', error);
      throw error;
    }
  };
  
  // Search for players
  const { 
    data: searchResults = [], 
    isLoading: isSearching,
    isError: isSearchError,
    error: searchError
  } = useQuery<User[]>({
    queryKey: ['/api/users/search', debouncedSearch],
    queryFn: playerSearchFetcher,
    enabled: debouncedSearch.length >= 2 && open,
    retry: 1,
    gcTime: 60 * 1000, // 1 minute
    staleTime: 30 * 1000 // 30 seconds
  });
  
  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: async (values: TeamFormValues) => {
      return apiRequest("POST", `/api/tournaments/${tournamentId}/teams`, values);
    },
    onSuccess: () => {
      // Reset form and close dialog
      form.reset();
      onOpenChange(false);
      setStep(1);
      setSelectedPlayers({});
      setSearchQuery('');
      
      // Invalidate teams query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: [`/api/tournaments/${tournamentId}/teams`] });
      
      // Show success toast
      toast({
        title: 'Team created',
        description: 'The team has been added to the tournament.',
      });
    },
    onError: (error: any) => {
      console.error('Error creating team:', error);
      toast({
        title: 'Failed to create team',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    },
  });
  
  function onSubmit(values: TeamFormValues) {
    // Use the selected player IDs from our state
    if (!selectedPlayers.player1 || !selectedPlayers.player2) {
      toast({
        title: 'Missing players',
        description: 'Both players must be selected.',
        variant: 'destructive',
      });
      return;
    }
    
    // Update the form values with the selected players
    values.playerOneId = selectedPlayers.player1.id;
    values.playerTwoId = selectedPlayers.player2.id;
    
    // If no team name is provided, generate one from player names
    if (!values.teamName || values.teamName.trim() === '') {
      values.teamName = `${selectedPlayers.player1.displayName} / ${selectedPlayers.player2.displayName}`;
      form.setValue('teamName', values.teamName);
    }
    
    mutate(values);
  }
  
  function handleSelectPlayer(player: User) {
    if (searchingFor === 'player1') {
      setSelectedPlayers(prev => ({ ...prev, player1: player }));
      form.setValue('playerOneId', player.id);
    } else {
      setSelectedPlayers(prev => ({ ...prev, player2: player }));
      form.setValue('playerTwoId', player.id);
    }
    
    // Clear search
    setSearchQuery('');
    
    // Move to next step if both players are selected
    if (searchingFor === 'player1') {
      setSearchingFor('player2');
    } else if (!selectedPlayers.player1) {
      setSearchingFor('player1');
    } else {
      setStep(3); // Move to team details step
    }
  }
  
  function handleRemovePlayer(playerType: 'player1' | 'player2') {
    setSelectedPlayers(prev => {
      const updated = { ...prev };
      if (playerType === 'player1') {
        delete updated.player1;
        form.setValue('playerOneId', undefined as any);
      } else {
        delete updated.player2;
        form.setValue('playerTwoId', undefined as any);
      }
      return updated;
    });
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <span>Add Team</span>
          </DialogTitle>
          <DialogDescription>
            Register a new team for the tournament
          </DialogDescription>
        </DialogHeader>
        
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <Label>Team Players</Label>
              <p className="text-sm text-muted-foreground mb-4">
                Select two players to form a team
              </p>
              
              {/* Selected players summary */}
              <div className="space-y-3 mb-4">
                {/* Player 1 slot */}
                <div 
                  className={`border rounded-md p-3 ${
                    selectedPlayers.player1 ? 'bg-muted/50' : 'border-dashed cursor-pointer hover:border-primary'
                  }`}
                  onClick={() => {
                    if (!selectedPlayers.player1) {
                      setSearchingFor('player1');
                      setStep(2);
                    }
                  }}
                >
                  {selectedPlayers.player1 ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={selectedPlayers.player1.avatarUrl} />
                          <AvatarFallback>{selectedPlayers.player1.avatarInitials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{selectedPlayers.player1.displayName}</p>
                          <p className="text-xs text-muted-foreground">@{selectedPlayers.player1.username}</p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemovePlayer('player1');
                        }}
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-2">
                      <div className="flex flex-col items-center">
                        <Users className="h-6 w-6 text-muted-foreground mb-1" />
                        <p>Select Player 1</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Player 2 slot */}
                <div 
                  className={`border rounded-md p-3 ${
                    selectedPlayers.player2 ? 'bg-muted/50' : 'border-dashed cursor-pointer hover:border-primary'
                  }`}
                  onClick={() => {
                    if (!selectedPlayers.player2) {
                      setSearchingFor('player2');
                      setStep(2);
                    }
                  }}
                >
                  {selectedPlayers.player2 ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={selectedPlayers.player2.avatarUrl} />
                          <AvatarFallback>{selectedPlayers.player2.avatarInitials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{selectedPlayers.player2.displayName}</p>
                          <p className="text-xs text-muted-foreground">@{selectedPlayers.player2.username}</p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemovePlayer('player2');
                        }}
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-2">
                      <div className="flex flex-col items-center">
                        <Users className="h-6 w-6 text-muted-foreground mb-1" />
                        <p>Select Player 2</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  if (selectedPlayers.player1 && selectedPlayers.player2) {
                    setStep(3);
                  } else if (!selectedPlayers.player1) {
                    setSearchingFor('player1');
                    setStep(2);
                  } else {
                    setSearchingFor('player2');
                    setStep(2);
                  }
                }}
              >
                {selectedPlayers.player1 && selectedPlayers.player2 
                  ? 'Next: Team Details' 
                  : 'Select Players'}
              </Button>
            </div>
          </div>
        )}
        
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <Label>Select {searchingFor === 'player1' ? 'Player 1' : 'Player 2'}</Label>
              <p className="text-sm text-muted-foreground mb-4">
                Search for a player to add to the team
              </p>
              
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by name or username..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              {debouncedSearch.length > 0 && (
                <div className="mt-4">
                  {isSearching ? (
                    <div className="space-y-2">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ) : isSearchError ? (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>
                        Failed to search for players. Please try again.
                      </AlertDescription>
                    </Alert>
                  ) : searchResults?.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No players found</p>
                    </div>
                  ) : (
                    <ScrollArea className="h-[200px] mt-2">
                      <div className="space-y-2">
                        {searchResults?.map((player) => (
                          <Card 
                            key={player.id} 
                            className="p-3 cursor-pointer hover:bg-muted"
                            onClick={() => handleSelectPlayer(player)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={player.avatarUrl} />
                                  <AvatarFallback>{player.avatarInitials}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{player.displayName}</p>
                                  <p className="text-xs text-muted-foreground">@{player.username}</p>
                                </div>
                              </div>
                              {player.rating && (
                                <div className="text-sm font-semibold">
                                  {player.rating.toFixed(1)}
                                </div>
                              )}
                            </div>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setStep(1)}
              >
                Back
              </Button>
            </div>
          </div>
        )}
        
        {step === 3 && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-2">Selected Players</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedPlayers.player1 && (
                      <div className="border rounded-md p-3 bg-muted/50">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={selectedPlayers.player1.avatarUrl} />
                            <AvatarFallback>{selectedPlayers.player1.avatarInitials}</AvatarFallback>
                          </Avatar>
                          <p className="text-sm font-medium truncate">{selectedPlayers.player1.displayName}</p>
                        </div>
                      </div>
                    )}
                    
                    {selectedPlayers.player2 && (
                      <div className="border rounded-md p-3 bg-muted/50">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={selectedPlayers.player2.avatarUrl} />
                            <AvatarFallback>{selectedPlayers.player2.avatarInitials}</AvatarFallback>
                          </Avatar>
                          <p className="text-sm font-medium truncate">{selectedPlayers.player2.displayName}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <FormField
                  control={form.control}
                  name="teamName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Team Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={selectedPlayers.player1 && selectedPlayers.player2 
                            ? `${selectedPlayers.player1.displayName} / ${selectedPlayers.player2.displayName}`
                            : "Enter team name"
                          } 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Leave blank to use player names
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Team Status</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex space-x-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="active" id="active" />
                            <Label htmlFor="active">Active</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="pending" id="pending" />
                            <Label htmlFor="pending">Pending</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="withdrawn" id="withdrawn" />
                            <Label htmlFor="withdrawn">Withdrawn</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Input placeholder="Optional notes about this team" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {isError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                      {error instanceof Error ? error.message : 'An unexpected error occurred'}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
              
              <div className="flex justify-between">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Team'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}