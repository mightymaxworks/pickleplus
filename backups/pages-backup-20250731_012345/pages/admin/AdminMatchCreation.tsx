/**
 * Administrative Match Creation Interface
 * 
 * Allows league officials, tournament directors, and referees to create
 * matches between players with advanced administrative controls.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-06-03
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  Calendar,
  Clock,
  Users,
  MapPin,
  Trophy,
  AlertTriangle,
  CheckCircle,
  Plus,
  Search
} from 'lucide-react';

// Form validation schema
const AdminMatchSchema = z.object({
  // Players
  playerOneId: z.number().positive("Player 1 is required"),
  playerTwoId: z.number().positive("Player 2 is required"),
  playerOnePartnerId: z.number().optional(),
  playerTwoPartnerId: z.number().optional(),
  
  // Match details
  formatType: z.enum(['singles', 'doubles']),
  matchType: z.enum(['casual', 'league', 'tournament', 'exhibition']),
  eventTier: z.enum(['local', 'regional', 'national', 'international']),
  
  // Scheduling
  scheduledDate: z.string().min(1, "Scheduled date is required"),
  scheduledTime: z.string().optional(),
  estimatedDuration: z.number().min(15).max(480).optional(),
  courtAssignment: z.string().optional(),
  venue: z.string().optional(),
  
  // Tournament context
  tournamentId: z.number().optional(),
  bracketPosition: z.string().optional(),
  roundNumber: z.number().optional(),
  
  // Administrative settings
  isOfficial: z.boolean().default(true),
  requiresValidation: z.boolean().default(false),
  allowSelfReporting: z.boolean().default(true),
  pointsMultiplier: z.number().min(0.1).max(5.0).optional(),
  
  // Additional details
  notes: z.string().max(500).optional(),
  specialRules: z.string().max(1000).optional(),
  prizeInfo: z.string().max(500).optional()
}).refine(data => {
  // For doubles, both partners must be specified
  if (data.formatType === 'doubles') {
    return data.playerOnePartnerId && data.playerTwoPartnerId;
  }
  return true;
}, {
  message: "Partners are required for doubles matches",
  path: ["playerOnePartnerId"]
});

type AdminMatchFormData = z.infer<typeof AdminMatchSchema>;

interface Player {
  id: number;
  displayName: string;
  username: string;
  duprRating: number;
  isActive: boolean;
  lastMatch: string;
  availability: string;
}

export default function AdminMatchCreation() {
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [playerSearch, setPlayerSearch] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<AdminMatchFormData>({
    resolver: zodResolver(AdminMatchSchema),
    defaultValues: {
      formatType: 'singles',
      matchType: 'casual',
      eventTier: 'local',
      isOfficial: true,
      requiresValidation: false,
      allowSelfReporting: true,
      scheduledDate: new Date().toISOString().split('T')[0],
      estimatedDuration: 90
    }
  });

  // Fetch available players
  const { data: availablePlayers = [], isLoading: playersLoading } = useQuery<Player[]>({
    queryKey: ['/api/admin/matches/available-players', playerSearch],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (playerSearch) params.append('search', playerSearch);
      params.append('activeOnly', 'true');
      
      const response = await apiRequest('GET', `/api/admin/matches/available-players?${params}`);
      const data = await response.json();
      return data.players || [];
    }
  });

  // Create match mutation
  const createMatchMutation = useMutation({
    mutationFn: async (data: AdminMatchFormData) => {
      const response = await apiRequest('POST', '/api/admin/matches', data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Match Created Successfully",
        description: `Administrative match ${data.match.matchId} has been scheduled.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/matches'] });
      form.reset();
      setSelectedPlayers([]);
    },
    onError: (error: any) => {
      toast({
        title: "Match Creation Failed",
        description: error.message || "Failed to create administrative match",
        variant: "destructive",
      });
    }
  });

  const handlePlayerSelect = (player: Player, position: 'playerOne' | 'playerTwo' | 'playerOnePartner' | 'playerTwoPartner') => {
    const fieldMap = {
      'playerOne': 'playerOneId',
      'playerTwo': 'playerTwoId',
      'playerOnePartner': 'playerOnePartnerId',
      'playerTwoPartner': 'playerTwoPartnerId'
    };
    
    form.setValue(fieldMap[position] as any, player.id);
    
    // Update selected players for display
    setSelectedPlayers(prev => {
      const filtered = prev.filter(p => p.id !== player.id);
      return [...filtered, { ...player, position }];
    });
  };

  const onSubmit = (data: AdminMatchFormData) => {
    createMatchMutation.mutate(data);
  };

  const formatType = form.watch('formatType');
  const matchType = form.watch('matchType');

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Administrative Match Creation</h1>
          <p className="text-muted-foreground">
            Create and schedule matches between players with administrative controls
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          Administrative Function
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Match Configuration
              </CardTitle>
              <CardDescription>
                Configure match participants, format, and scheduling details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Match Format */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="formatType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Format</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="singles">Singles</SelectItem>
                              <SelectItem value="doubles">Doubles</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="matchType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Match Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="casual">Casual</SelectItem>
                              <SelectItem value="league">League</SelectItem>
                              <SelectItem value="tournament">Tournament</SelectItem>
                              <SelectItem value="exhibition">Exhibition</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Player Selection */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Player Selection</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Player 1 */}
                      <FormField
                        control={form.control}
                        name="playerOneId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Player 1</FormLabel>
                            <div className="space-y-2">
                              <div className="flex gap-2">
                                <Input
                                  placeholder="Search players..."
                                  value={playerSearch}
                                  onChange={(e) => setPlayerSearch(e.target.value)}
                                />
                                <Search className="h-4 w-4 mt-3 text-muted-foreground" />
                              </div>
                              {playersLoading ? (
                                <div className="text-sm text-muted-foreground">Loading players...</div>
                              ) : (
                                <div className="max-h-32 overflow-y-auto space-y-1">
                                  {availablePlayers.map((player) => (
                                    <div
                                      key={player.id}
                                      className="flex items-center justify-between p-2 hover:bg-muted rounded cursor-pointer"
                                      onClick={() => handlePlayerSelect(player, 'playerOne')}
                                    >
                                      <div>
                                        <div className="font-medium">{player.displayName}</div>
                                        <div className="text-sm text-muted-foreground">
                                          Rating: {player.duprRating}
                                        </div>
                                      </div>
                                      <Badge variant={field.value === player.id ? "default" : "outline"}>
                                        {field.value === player.id ? "Selected" : "Select"}
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Player 2 */}
                      <FormField
                        control={form.control}
                        name="playerTwoId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Player 2</FormLabel>
                            <div className="space-y-2">
                              <div className="max-h-32 overflow-y-auto space-y-1">
                                {availablePlayers.map((player) => (
                                  <div
                                    key={player.id}
                                    className="flex items-center justify-between p-2 hover:bg-muted rounded cursor-pointer"
                                    onClick={() => handlePlayerSelect(player, 'playerTwo')}
                                  >
                                    <div>
                                      <div className="font-medium">{player.displayName}</div>
                                      <div className="text-sm text-muted-foreground">
                                        Rating: {player.duprRating}
                                      </div>
                                    </div>
                                    <Badge variant={field.value === player.id ? "default" : "outline"}>
                                      {field.value === player.id ? "Selected" : "Select"}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Partners for doubles */}
                    {formatType === 'doubles' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="playerOnePartnerId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Player 1 Partner</FormLabel>
                              <div className="max-h-32 overflow-y-auto space-y-1">
                                {availablePlayers.map((player) => (
                                  <div
                                    key={player.id}
                                    className="flex items-center justify-between p-2 hover:bg-muted rounded cursor-pointer"
                                    onClick={() => handlePlayerSelect(player, 'playerOnePartner')}
                                  >
                                    <div>
                                      <div className="font-medium">{player.displayName}</div>
                                      <div className="text-sm text-muted-foreground">
                                        Rating: {player.duprRating}
                                      </div>
                                    </div>
                                    <Badge variant={field.value === player.id ? "default" : "outline"}>
                                      {field.value === player.id ? "Selected" : "Select"}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="playerTwoPartnerId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Player 2 Partner</FormLabel>
                              <div className="max-h-32 overflow-y-auto space-y-1">
                                {availablePlayers.map((player) => (
                                  <div
                                    key={player.id}
                                    className="flex items-center justify-between p-2 hover:bg-muted rounded cursor-pointer"
                                    onClick={() => handlePlayerSelect(player, 'playerTwoPartner')}
                                  >
                                    <div>
                                      <div className="font-medium">{player.displayName}</div>
                                      <div className="text-sm text-muted-foreground">
                                        Rating: {player.duprRating}
                                      </div>
                                    </div>
                                    <Badge variant={field.value === player.id ? "default" : "outline"}>
                                      {field.value === player.id ? "Selected" : "Select"}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Scheduling */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Scheduling
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="scheduledDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="scheduledTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Time (Optional)</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="venue"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Venue (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Main Courts" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="courtAssignment"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Court Assignment (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Court 1" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Advanced Settings */}
                  <div className="space-y-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAdvanced(!showAdvanced)}
                    >
                      {showAdvanced ? 'Hide' : 'Show'} Advanced Settings
                    </Button>

                    {showAdvanced && (
                      <div className="space-y-4 p-4 border rounded-lg">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="isOfficial"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>Official Match</FormLabel>
                                  <div className="text-sm text-muted-foreground">
                                    Results affect player rankings
                                  </div>
                                </div>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="requiresValidation"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>Requires Validation</FormLabel>
                                  <div className="text-sm text-muted-foreground">
                                    Match results need official approval
                                  </div>
                                </div>
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="notes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Administrative Notes</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Add any special notes or instructions..."
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Submit */}
                  <div className="flex justify-end space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        form.reset();
                        setSelectedPlayers([]);
                      }}
                    >
                      Reset Form
                    </Button>
                    <Button
                      type="submit"
                      disabled={createMatchMutation.isPending}
                    >
                      {createMatchMutation.isPending ? 'Creating Match...' : 'Create Administrative Match'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Match Preview */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Match Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedPlayers.length > 0 ? (
                <div className="space-y-2">
                  {selectedPlayers.map((player, index) => (
                    <div key={player.id} className="flex items-center justify-between p-2 bg-muted rounded">
                      <div>
                        <div className="font-medium">{player.displayName}</div>
                        <div className="text-sm text-muted-foreground">
                          Rating: {player.duprRating}
                        </div>
                      </div>
                      <Badge variant="secondary">
                        {(player as any).position || `Player ${index + 1}`}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-4">
                  Select players to see match preview
                </div>
              )}

              {form.watch('scheduledDate') && (
                <div className="pt-2 border-t">
                  <div className="text-sm font-medium">Scheduled Date</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(form.watch('scheduledDate')).toLocaleDateString()}
                  </div>
                </div>
              )}

              {form.watch('venue') && (
                <div>
                  <div className="text-sm font-medium">Venue</div>
                  <div className="text-sm text-muted-foreground">
                    {form.watch('venue')}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Important Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>• Players will be automatically notified of the scheduled match</div>
              <div>• Official matches affect player rankings and statistics</div>
              <div>• Anti-gaming validation will be applied to all matches</div>
              <div>• Administrative logs are maintained for all created matches</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}