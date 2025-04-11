/**
 * PKL-278651-TOURN-0001-BRCKT
 * Record Match Result Dialog Component
 * 
 * Dialog for recording the result of a tournament match
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
import { 
  Trophy, 
  Loader2, 
  AlertCircle,
  Award
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

// Match result form schema
const matchResultSchema = z.object({
  winnerId: z.number({ required_error: 'Winner is required' }),
  loserId: z.number({ required_error: 'Loser is required' }),
  score: z.string().min(1, { message: 'Score is required' }),
  gameScores: z.array(z.string()).optional(),
});

type MatchResultFormValues = z.infer<typeof matchResultSchema>;

type RecordMatchResultDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matchId: number;
  bracketId: number;
};

type Match = {
  id: number;
  roundId: number;
  matchNumber: number;
  team1Id?: number | null;
  team2Id?: number | null;
  team1?: {
    id: number;
    teamName: string;
    playerOne: {
      id: number;
      displayName: string;
      avatarUrl?: string;
      avatarInitials?: string;
    };
    playerTwo: {
      id: number;
      displayName: string;
      avatarUrl?: string;
      avatarInitials?: string;
    };
  } | null;
  team2?: {
    id: number;
    teamName: string;
    playerOne: {
      id: number;
      displayName: string;
      avatarUrl?: string;
      avatarInitials?: string;
    };
    playerTwo: {
      id: number;
      displayName: string;
      avatarUrl?: string;
      avatarInitials?: string;
    };
  } | null;
  score?: string;
  winnerId?: number | null;
  loserId?: number | null;
  status: string;
  round?: {
    name: string;
    roundNumber: number;
  };
};

export function RecordMatchResultDialog({ 
  open, 
  onOpenChange, 
  matchId,
  bracketId
}: RecordMatchResultDialogProps) {
  const queryClient = useQueryClient();
  const [gameCount, setGameCount] = useState(1);
  const [scores, setScores] = useState<{ team1: number, team2: number }[]>([{ team1: 0, team2: 0 }]);
  
  // Get match details
  const { 
    data: match,
    isLoading: isLoadingMatch,
    isError: isMatchError
  } = useQuery<Match>({
    queryKey: ['/api/brackets/matches', matchId],
    enabled: !!matchId && open,
    // Mock data for now - in a real implementation, we would fetch this from the API
    queryFn: async () => {
      // This is a temporary placeholder to show the UI
      // In a real implementation, this would use apiRequest
      return {
        id: matchId,
        roundId: 1,
        matchNumber: 1,
        team1Id: 1,
        team2Id: 2,
        team1: {
          id: 1,
          teamName: 'Team Alpha',
          playerOne: {
            id: 1,
            displayName: 'John Smith',
            avatarInitials: 'JS',
          },
          playerTwo: {
            id: 2,
            displayName: 'Sarah Johnson',
            avatarInitials: 'SJ',
          },
        },
        team2: {
          id: 2,
          teamName: 'Team Beta',
          playerOne: {
            id: 3,
            displayName: 'Mike Williams',
            avatarInitials: 'MW',
          },
          playerTwo: {
            id: 4,
            displayName: 'Emily Davis',
            avatarInitials: 'ED',
          },
        },
        status: 'ready',
        round: {
          name: 'Quarterfinals',
          roundNumber: 1,
        },
      };
    },
  });
  
  // Default form values
  const defaultValues: Partial<MatchResultFormValues> = {
    score: '',
    gameScores: [''],
  };
  
  const form = useForm<MatchResultFormValues>({
    resolver: zodResolver(matchResultSchema),
    defaultValues,
  });
  
  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: async (values: MatchResultFormValues) => {
      return apiRequest(`/api/brackets/matches/${matchId}/result`, {
        method: 'POST',
        data: values,
      });
    },
    onSuccess: () => {
      // Reset form and close dialog
      form.reset();
      onOpenChange(false);
      
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: [`/api/brackets/${bracketId}`] });
      
      // Show success toast
      toast({
        title: 'Match result recorded',
        description: 'The bracket has been updated with the match result.',
      });
    },
    onError: (error: any) => {
      console.error('Error recording match result:', error);
      toast({
        title: 'Failed to record match result',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    },
  });
  
  function updateScoreSummary() {
    // Calculate total score across all games
    const team1Total = scores.reduce((sum, game) => sum + game.team1, 0);
    const team2Total = scores.reduce((sum, game) => sum + game.team2, 0);
    
    // Format the score string
    const scoreString = `${team1Total}-${team2Total}`;
    form.setValue('score', scoreString);
    
    // Set the winner and loser based on the score
    if (match && match.team1 && match.team2) {
      if (team1Total > team2Total) {
        form.setValue('winnerId', match.team1.id);
        form.setValue('loserId', match.team2.id);
      } else if (team2Total > team1Total) {
        form.setValue('winnerId', match.team2.id);
        form.setValue('loserId', match.team1.id);
      }
    }
  }
  
  function handleGameScoreChange(index: number, team: 'team1' | 'team2', value: string) {
    const numValue = parseInt(value, 10) || 0;
    const newScores = [...scores];
    newScores[index] = { ...newScores[index], [team]: numValue };
    setScores(newScores);
    updateScoreSummary();
  }
  
  function handleAddGame() {
    setGameCount(gameCount + 1);
    setScores([...scores, { team1: 0, team2: 0 }]);
  }
  
  function handleRemoveGame() {
    if (gameCount > 1) {
      setGameCount(gameCount - 1);
      const newScores = scores.slice(0, -1);
      setScores(newScores);
      updateScoreSummary();
    }
  }
  
  function onSubmit(values: MatchResultFormValues) {
    mutate(values);
  }
  
  // Loading state
  if (isLoadingMatch) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="flex items-center justify-center p-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  
  // Error state
  if (isMatchError || !match) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load match details. Please try again.
            </AlertDescription>
          </Alert>
          <DialogFooter>
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            <span>Record Match Result</span>
          </DialogTitle>
          <DialogDescription>
            Enter the results for match #{match.matchNumber} in {match.round?.name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex justify-between mb-6">
          {/* Team 1 */}
          <div className="text-center">
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex flex-col items-center">
                  <Avatar className="h-12 w-12 mb-2">
                    <AvatarImage src={match.team1?.playerOne.avatarUrl} />
                    <AvatarFallback>{match.team1?.playerOne.avatarInitials}</AvatarFallback>
                  </Avatar>
                  <p className="font-semibold">{match.team1?.teamName}</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="flex items-center">
            <span className="text-2xl font-bold text-muted-foreground">vs</span>
          </div>
          
          {/* Team 2 */}
          <div className="text-center">
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex flex-col items-center">
                  <Avatar className="h-12 w-12 mb-2">
                    <AvatarImage src={match.team2?.playerOne.avatarUrl} />
                    <AvatarFallback>{match.team2?.playerOne.avatarInitials}</AvatarFallback>
                  </Avatar>
                  <p className="font-semibold">{match.team2?.teamName}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label className="text-base">Game Scores</Label>
              <p className="text-sm text-muted-foreground mb-4">
                Enter the score for each game played
              </p>
              
              <div className="space-y-4">
                {Array.from({ length: gameCount }).map((_, index) => (
                  <div key={index} className="grid grid-cols-5 gap-4 items-center">
                    <div className="col-span-2">
                      <Label htmlFor={`team1-game-${index + 1}`} className="text-sm mb-1 block">{match.team1?.teamName}</Label>
                      <Input
                        id={`team1-game-${index + 1}`}
                        type="number"
                        min="0"
                        placeholder="0"
                        value={scores[index]?.team1 || 0}
                        onChange={(e) => handleGameScoreChange(index, 'team1', e.target.value)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-center">
                      <span className="text-muted-foreground">vs</span>
                    </div>
                    
                    <div className="col-span-2">
                      <Label htmlFor={`team2-game-${index + 1}`} className="text-sm mb-1 block">{match.team2?.teamName}</Label>
                      <Input
                        id={`team2-game-${index + 1}`}
                        type="number"
                        min="0"
                        placeholder="0"
                        value={scores[index]?.team2 || 0}
                        onChange={(e) => handleGameScoreChange(index, 'team2', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={handleAddGame}
                >
                  + Add Game
                </Button>
                
                {gameCount > 1 && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={handleRemoveGame}
                  >
                    - Remove Game
                  </Button>
                )}
              </div>
            </div>
            
            <Separator />
            
            <div>
              <div className="flex items-center justify-center gap-4">
                <div className="text-center">
                  <Label className="block mb-1">Final Score</Label>
                  <div className="flex items-center gap-2 text-xl font-semibold">
                    <span>{scores.reduce((sum, game) => sum + game.team1, 0)}</span>
                    <span className="text-muted-foreground">-</span>
                    <span>{scores.reduce((sum, game) => sum + game.team2, 0)}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <Label className="block mb-2">Match Winner</Label>
                <div className="flex items-center justify-center gap-4">
                  {match.team1 && match.team2 && (
                    <RadioGroup
                      className="flex gap-4"
                      value={form.getValues('winnerId')?.toString()}
                      onValueChange={(value) => {
                        const winnerId = parseInt(value, 10);
                        form.setValue('winnerId', winnerId);
                        form.setValue('loserId', winnerId === match.team1?.id ? match.team2?.id : match.team1?.id);
                      }}
                    >
                      <div className={`border rounded-md p-3 hover:bg-muted ${form.getValues('winnerId') === match.team1.id ? 'border-primary bg-primary/5' : ''}`}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value={match.team1.id.toString()} id={`winner-${match.team1.id}`} />
                          <Label htmlFor={`winner-${match.team1.id}`}>{match.team1.teamName}</Label>
                        </div>
                      </div>
                      
                      <div className={`border rounded-md p-3 hover:bg-muted ${form.getValues('winnerId') === match.team2.id ? 'border-primary bg-primary/5' : ''}`}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value={match.team2.id.toString()} id={`winner-${match.team2.id}`} />
                          <Label htmlFor={`winner-${match.team2.id}`}>{match.team2.teamName}</Label>
                        </div>
                      </div>
                    </RadioGroup>
                  )}
                </div>
              </div>
            </div>
            
            {isError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {error instanceof Error ? error.message : 'An unexpected error occurred'}
                </AlertDescription>
              </Alert>
            )}
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Result'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}