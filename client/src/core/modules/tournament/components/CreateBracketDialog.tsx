/**
 * PKL-278651-TOURN-0001-BRCKT
 * Create Bracket Dialog Component
 * 
 * Dialog for creating a new tournament bracket
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
import { Trophy, AlertCircle } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow,
} from '@/components/ui/table';

// Define bracket form schema
const bracketFormSchema = z.object({
  name: z.string().min(3, { message: 'Bracket name must be at least 3 characters' }),
  bracketType: z.enum(['single_elimination', 'double_elimination', 'round_robin']),
  teamIds: z.array(z.number()).min(2, { message: 'Select at least 2 teams' }),
  seedingMethod: z.enum(['manual', 'rating_based', 'random']),
});

type BracketFormValues = z.infer<typeof bracketFormSchema>;

type Team = {
  id: number;
  teamName: string;
  playerOne: {
    id: number;
    displayName: string;
  };
  playerTwo: {
    id: number;
    displayName: string;
  };
  seedNumber?: number;
};

type CreateBracketDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tournamentId: number;
  teams: Team[];
};

export function CreateBracketDialog({ 
  open, 
  onOpenChange, 
  tournamentId,
  teams = []
}: CreateBracketDialogProps) {
  // PKL-278651-TOURN-0010-BRCKT-DEBUG: Enhanced bracket creation diagnostic
  console.log('[BracketDialog][Debug] Rendering dialog with props:', { open, tournamentId, teamCount: teams.length });
  
  const queryClient = useQueryClient();
  const [selectedTeams, setSelectedTeams] = useState<Record<number, boolean>>({});
  const [step, setStep] = useState(1);
  
  // Default form values
  const defaultValues: Partial<BracketFormValues> = {
    name: '',
    bracketType: 'single_elimination',
    teamIds: [],
    seedingMethod: 'rating_based',
  };
  
  const form = useForm<BracketFormValues>({
    resolver: zodResolver(bracketFormSchema),
    defaultValues,
  });
  
  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: async (values: BracketFormValues) => {
      console.log('[BracketDialog][API] Calling API with values:', values);
      return apiRequest("POST", `/api/tournaments/${tournamentId}/brackets`, values);
    },
    onSuccess: () => {
      // Reset form and close dialog
      form.reset();
      onOpenChange(false);
      setStep(1);
      setSelectedTeams({});
      
      // Invalidate brackets query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: [`/api/tournaments/${tournamentId}/brackets`] });
      
      // Show success toast
      toast({
        title: 'Bracket created',
        description: 'Your bracket has been created successfully.',
      });
    },
    onError: (error: any) => {
      console.error('Error creating bracket:', error);
      toast({
        title: 'Failed to create bracket',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    },
  });
  
  function onSubmit(values: BracketFormValues) {
    // PKL-278651-TOURN-0010-BRCKT-DEBUG: Enhanced bracket creation debugging
    console.log('[BracketDialog][Submit] Starting form submission process');
    
    // Set the selected team IDs from our checkbox state
    const teamIds = Object.entries(selectedTeams)
      .filter(([_, isSelected]) => isSelected)
      .map(([id]) => parseInt(id, 10));
    
    console.log('[BracketDialog][Submit] Selected team IDs:', teamIds);
    console.log('[BracketDialog][Submit] Selected teams count:', teamIds.length);
    
    // Update form values with selected team IDs
    values.teamIds = teamIds;
    
    // Validate minimum teams
    if (teamIds.length < 2) {
      console.log('[BracketDialog][Submit] Error: Not enough teams selected');
      form.setError('teamIds', {
        type: 'manual',
        message: 'Select at least 2 teams',
      });
      return;
    }
    
    console.log('[BracketDialog][Submit] Form values to be submitted:', values);
    console.log('[BracketDialog][Submit] Sending to endpoint:', `/api/tournaments/${tournamentId}/brackets`);
    
    try {
      mutate(values);
      console.log('[BracketDialog][Submit] Mutation triggered successfully');
    } catch (error) {
      console.error('[BracketDialog][Submit] Error triggering mutation:', error);
    }
  }
  
  function handleTeamToggle(teamId: number, checked: boolean) {
    setSelectedTeams(prev => ({
      ...prev,
      [teamId]: checked
    }));
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            <span>Create Tournament Bracket</span>
          </DialogTitle>
          <DialogDescription>
            Set up a new bracket for your tournament
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {step === 1 && (
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bracket Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Men's Doubles A" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="bracketType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bracket Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a bracket type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="single_elimination">Single Elimination</SelectItem>
                          <SelectItem value="double_elimination" disabled>Double Elimination (Coming Soon)</SelectItem>
                          <SelectItem value="round_robin" disabled>Round Robin (Coming Soon)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Currently, only single elimination brackets are supported
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="seedingMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Seeding Method</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a seeding method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="rating_based">Based on Player Ratings</SelectItem>
                          <SelectItem value="random">Random Seeding</SelectItem>
                          <SelectItem value="manual">Manual Seeding</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        How teams will be positioned in the bracket
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="pt-4">
                  <Button 
                    type="button" 
                    onClick={() => setStep(2)}
                    disabled={!form.watch('name') || !form.watch('bracketType')}
                  >
                    Next: Select Teams
                  </Button>
                </div>
              </div>
            )}
            
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <Label>Select Teams</Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    Choose teams to include in this bracket (minimum 2)
                  </p>
                  
                  {teams.length === 0 ? (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>No teams available</AlertTitle>
                      <AlertDescription>
                        You need to add teams to the tournament first.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="border rounded-md max-h-[300px] overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[50px]">Select</TableHead>
                            <TableHead>Team Name</TableHead>
                            <TableHead>Players</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {teams.map((team) => (
                            <TableRow key={team.id}>
                              <TableCell>
                                <Checkbox 
                                  id={`team-${team.id}`}
                                  checked={selectedTeams[team.id] || false}
                                  onCheckedChange={(checked) => 
                                    handleTeamToggle(team.id, checked as boolean)
                                  }
                                />
                              </TableCell>
                              <TableCell>{team.teamName}</TableCell>
                              <TableCell>
                                {team.playerOne.displayName} / {team.playerTwo.displayName}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                  
                  {Object.values(selectedTeams).filter(Boolean).length < 2 && (
                    <p className="text-sm text-destructive mt-2">
                      Please select at least 2 teams
                    </p>
                  )}
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
                
                <div className="flex gap-3 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setStep(1)}
                  >
                    Back
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={
                      isPending || 
                      Object.values(selectedTeams).filter(Boolean).length < 2 ||
                      teams.length === 0
                    }
                  >
                    {isPending ? 'Creating...' : 'Create Bracket'}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}