/**
 * PKL-278651-GAME-0002-TOURN
 * Prize Drawing Admin Page
 * 
 * This page allows administrators to manage prize drawing pools and select winners
 */

import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { formatDate, formatDateOnly } from '../../lib/utils';
import { apiRequest } from '../../lib/queryClient';
import { motion, AnimatePresence } from 'framer-motion';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Check, Gift, Trophy, User, Users, Award, Calendar, Settings, Star, Trash, Bell, AlertTriangle, Tag } from 'lucide-react';

interface PrizeDrawingPool {
  id: number;
  name: string;
  description: string | null;
  campaignId: string;
  prizeDescription: string | null;
  maxWinners: number;
  startDate: string;
  endDate: string | null;
  drawingDate: string | null;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  requiresVerification: boolean;
  createdAt: string;
  updatedAt: string;
  entryCount?: number;
  winnerCount?: number;
}

interface PrizeDrawingEntry {
  id: number;
  poolId: number;
  userId: number;
  entryMethod: 'quest_completion' | 'admin_addition' | 'invitation' | 'referral';
  entryDate: string;
  isWinner: boolean;
  drawingDate: string | null;
  hasBeenNotified: boolean;
  notificationDate: string | null;
  tokenClaimed: boolean;
  claimDate: string | null;
  user: {
    id: number;
    username: string;
    email: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
}

interface DrawWinnersResponse {
  message: string;
  winners: {
    id: number;
    user: {
      id: number;
      username: string;
      email: string;
    };
    entryDate: string;
    drawingDate: string;
    hasBeenNotified: boolean;
  }[];
}

// Create form schema using Zod
const poolFormSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  description: z.string().nullable().optional(),
  campaignId: z.string().min(1, { message: "Campaign ID is required" }),
  prizeDescription: z.string().nullable().optional(),
  maxWinners: z.coerce.number().positive({ message: "Must be at least 1" }).default(1),
  startDate: z.string().optional(),
  endDate: z.string().nullable().optional(),
  drawingDate: z.string().nullable().optional(),
  status: z.enum(['draft', 'active', 'completed', 'cancelled']).default('draft'),
  requiresVerification: z.boolean().default(false)
});

type PoolFormValues = z.infer<typeof poolFormSchema>;

/**
 * Pool Management component to display and edit prize drawing pools
 */
function PoolManagement() {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentPool, setCurrentPool] = useState<PrizeDrawingPool | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query to fetch all pools
  const { data: pools, isLoading: isLoadingPools, error: poolsError } = useQuery({
    queryKey: ['/api/prize-drawings/pools-summary'],
    retry: 1
  });

  // Form setup for pool creation/editing
  const form = useForm<PoolFormValues>({
    resolver: zodResolver(poolFormSchema),
    defaultValues: {
      name: '',
      description: '',
      campaignId: '',
      prizeDescription: '',
      maxWinners: 1,
      startDate: new Date().toISOString().split('T')[0],
      endDate: null,
      drawingDate: null,
      status: 'draft',
      requiresVerification: false
    }
  });

  // Create pool mutation
  const createPoolMutation = useMutation({
    mutationFn: (data: PoolFormValues) => apiRequest('/api/prize-drawings/pools', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/prize-drawings/pools-summary'] });
      form.reset();
      toast({
        title: "Success",
        description: "Prize drawing pool created successfully",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to create pool: ${error}`,
      });
    }
  });

  // Update pool mutation
  const updatePoolMutation = useMutation({
    mutationFn: (data: PoolFormValues & { id: number }) => apiRequest(`/api/prize-drawings/pools/${data.id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/prize-drawings/pools-summary'] });
      setIsEditDialogOpen(false);
      toast({
        title: "Success",
        description: "Prize drawing pool updated successfully",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to update pool: ${error}`,
      });
    }
  });

  // Reset form for new pool creation
  const resetForm = () => {
    form.reset({
      name: '',
      description: '',
      campaignId: '',
      prizeDescription: '',
      maxWinners: 1,
      startDate: new Date().toISOString().split('T')[0],
      endDate: null,
      drawingDate: null,
      status: 'draft',
      requiresVerification: false
    });
  };

  // Handle form submission
  const onSubmit = (data: PoolFormValues) => {
    if (currentPool) {
      updatePoolMutation.mutate({ ...data, id: currentPool.id });
    } else {
      createPoolMutation.mutate(data);
    }
  };

  // Open edit dialog for a pool
  const handleEditPool = (pool: PrizeDrawingPool) => {
    setCurrentPool(pool);
    form.reset({
      name: pool.name,
      description: pool.description || '',
      campaignId: pool.campaignId,
      prizeDescription: pool.prizeDescription || '',
      maxWinners: pool.maxWinners,
      startDate: pool.startDate ? new Date(pool.startDate).toISOString().split('T')[0] : undefined,
      endDate: pool.endDate ? new Date(pool.endDate).toISOString().split('T')[0] : null,
      drawingDate: pool.drawingDate ? new Date(pool.drawingDate).toISOString().split('T')[0] : null,
      status: pool.status,
      requiresVerification: pool.requiresVerification
    });
    setIsEditDialogOpen(true);
  };

  // Get status badge based on pool status
  const getStatusBadge = (status: PrizeDrawingPool['status']) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'active':
        return <Badge variant="default">Active</Badge>;
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Prize Drawing Pools</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="flex gap-2 items-center">
              <Gift className="w-4 h-4" />
              Create New Pool
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Prize Drawing Pool</DialogTitle>
              <DialogDescription>
                Add a new prize drawing pool for tournament discoveries.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pool Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Tournament Discovery Special Prize" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Special prize pool for users who complete all tournament discoveries" 
                          {...field} 
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="campaignId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Campaign ID</FormLabel>
                        <FormControl>
                          <Input placeholder="TOURN-DISC-001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="maxWinners"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Winners</FormLabel>
                        <FormControl>
                          <Input type="number" min={1} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="prizeDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prize Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Early Access Token to tournament features and special profile badge" 
                          {...field} 
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            {...field} 
                            value={field.value || ''} 
                            onChange={(e) => field.onChange(e.target.value || null)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="drawingDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Drawing Date</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            {...field} 
                            value={field.value || ''} 
                            onChange={(e) => field.onChange(e.target.value || null)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="requiresVerification"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-end space-x-3 space-y-0 py-4">
                        <FormControl>
                          <Input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="w-4 h-4"
                          />
                        </FormControl>
                        <FormLabel>Requires Verification</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
                <DialogFooter>
                  <Button type="submit">
                    {createPoolMutation.isPending || updatePoolMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Pool'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Edit Pool Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Prize Drawing Pool</DialogTitle>
              <DialogDescription>
                Modify the details of this prize drawing pool.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Same form fields as above */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pool Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Tournament Discovery Special Prize" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Special prize pool for users who complete all tournament discoveries" 
                          {...field} 
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="campaignId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Campaign ID</FormLabel>
                        <FormControl>
                          <Input placeholder="TOURN-DISC-001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="maxWinners"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Winners</FormLabel>
                        <FormControl>
                          <Input type="number" min={1} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="prizeDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prize Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Early Access Token to tournament features and special profile badge" 
                          {...field} 
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            {...field} 
                            value={field.value || ''} 
                            onChange={(e) => field.onChange(e.target.value || null)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="drawingDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Drawing Date</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            {...field} 
                            value={field.value || ''} 
                            onChange={(e) => field.onChange(e.target.value || null)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="requiresVerification"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-end space-x-3 space-y-0 py-4">
                        <FormControl>
                          <Input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="w-4 h-4"
                          />
                        </FormControl>
                        <FormLabel>Requires Verification</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
                <DialogFooter>
                  <Button type="submit">
                    {createPoolMutation.isPending || updatePoolMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Update Pool'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoadingPools ? (
        <div className="flex justify-center my-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : poolsError ? (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Failed to load prize drawing pools.</AlertDescription>
        </Alert>
      ) : pools && pools.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pools && pools.map((pool: PrizeDrawingPool) => (
            <Card key={pool.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <div>
                    <CardTitle>{pool.name}</CardTitle>
                    <CardDescription>Campaign: {pool.campaignId}</CardDescription>
                  </div>
                  <div>
                    {getStatusBadge(pool.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-sm mb-2">{pool.description || 'No description'}</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 opacity-70" />
                    <span>Start: {formatDateOnly(new Date(pool.startDate))}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 opacity-70" />
                    <span>End: {pool.endDate ? formatDateOnly(new Date(pool.endDate)) : 'Open'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Trophy className="h-4 w-4 opacity-70" />
                    <span>Max Winners: {pool.maxWinners}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 opacity-70" />
                    <span>Entries: {pool.entryCount || 0}</span>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-sm font-medium">Prize: {pool.prizeDescription || 'Not specified'}</p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <Button variant="outline" size="sm" onClick={() => handleEditPool(pool)}>
                  <Settings className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button variant="default" size="sm" asChild>
                  <a href={`/admin/prize-drawing?pool=${pool.id}`}>
                    <Users className="h-4 w-4 mr-1" />
                    Manage Entries
                  </a>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Alert>
          <AlertTitle>No prize drawing pools found</AlertTitle>
          <AlertDescription>
            Create your first prize drawing pool to get started.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

/**
 * Entries Management component to display and manage entries for a prize drawing pool
 */
function EntriesManagement({ poolId }: { poolId: number }) {
  const [isDrawWinnersOpen, setIsDrawWinnersOpen] = useState(false);
  const [numWinners, setNumWinners] = useState(1);
  const [drawingInProgress, setDrawingInProgress] = useState(false);
  const [selectedWinners, setSelectedWinners] = useState<DrawWinnersResponse['winners']>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch pool details
  const { data: pools, isLoading: isLoadingPools } = useQuery({
    queryKey: ['/api/prize-drawings/pools-summary'],
    retry: 1
  });
  
  // Fetch entries for this pool
  const { data: entries, isLoading: isLoadingEntries } = useQuery({
    queryKey: [`/api/prize-drawings/pools/${poolId}/entries`],
    retry: 1,
    enabled: !!poolId
  });
  
  // Get the current pool
  const currentPool = pools?.find((p: PrizeDrawingPool) => p.id === poolId);
  
  // Mutation to draw winners
  const drawWinnersMutation = useMutation({
    mutationFn: ({ poolId, numWinners }: { poolId: number; numWinners: number }) => {
      return apiRequest(`/api/prize-drawings/pools/${poolId}/draw`, {
        method: 'POST',
        body: JSON.stringify({ numWinners })
      });
    },
    onSuccess: (data: DrawWinnersResponse) => {
      queryClient.invalidateQueries({ queryKey: [`/api/prize-drawings/pools/${poolId}/entries`] });
      queryClient.invalidateQueries({ queryKey: ['/api/prize-drawings/pools-summary'] });
      setSelectedWinners(data.winners);
      setDrawingInProgress(false);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to draw winners: ${error}`,
      });
      setDrawingInProgress(false);
    }
  });
  
  // Mutation to mark an entry as notified
  const notifyWinnerMutation = useMutation({
    mutationFn: (entryId: number) => apiRequest(`/api/prize-drawings/entries/${entryId}/notify`, {
      method: 'POST'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/prize-drawings/pools/${poolId}/entries`] });
      toast({
        title: "Success",
        description: "Winner has been marked as notified",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to mark as notified: ${error}`,
      });
    }
  });
  
  // Mutation to mark an entry's token as claimed
  const claimTokenMutation = useMutation({
    mutationFn: (entryId: number) => apiRequest(`/api/prize-drawings/entries/${entryId}/claim`, {
      method: 'POST'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/prize-drawings/pools/${poolId}/entries`] });
      toast({
        title: "Success",
        description: "Token has been marked as claimed",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to mark token as claimed: ${error}`,
      });
    }
  });
  
  // Handle drawing winners
  const handleDrawWinners = () => {
    setDrawingInProgress(true);
    drawWinnersMutation.mutate({ poolId, numWinners });
  };
  
  // Get entry method badge
  const getEntryMethodBadge = (method: PrizeDrawingEntry['entryMethod']) => {
    switch (method) {
      case 'quest_completion':
        return <Badge variant="secondary">Quest Completion</Badge>;
      case 'admin_addition':
        return <Badge variant="default">Admin Added</Badge>;
      case 'invitation':
        return <Badge variant="outline">Invitation</Badge>;
      case 'referral':
        return <Badge>Referral</Badge>;
      default:
        return <Badge variant="outline">{method}</Badge>;
    }
  };
  
  // Calculate stats for current entries
  const winnerCount = entries ? entries.filter((e: PrizeDrawingEntry) => e.isWinner).length : 0;
  const availableForDrawing = entries ? entries.filter((e: PrizeDrawingEntry) => !e.isWinner).length : 0;
  
  return (
    <div>
      {isLoadingPools || !currentPool ? (
        <div className="flex justify-center my-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <>
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold">{currentPool.name}</h2>
              <p className="text-muted-foreground">{currentPool.description}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" asChild>
                <a href="/admin/prize-drawing">
                  Back to Pools
                </a>
              </Button>
              <Dialog open={isDrawWinnersOpen} onOpenChange={setIsDrawWinnersOpen}>
                <DialogTrigger asChild>
                  <Button 
                    disabled={currentPool.status === 'completed' || currentPool.status === 'cancelled' || availableForDrawing === 0}
                    className="flex gap-2"
                  >
                    <Trophy className="h-4 w-4" />
                    Draw Winners
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Draw Winners</DialogTitle>
                    <DialogDescription>
                      Randomly select winners from the eligible entries.
                    </DialogDescription>
                  </DialogHeader>
                  {drawingInProgress ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <Trophy className="h-16 w-16 text-primary" />
                      </motion.div>
                      <p className="mt-4 text-center">Selecting winners...</p>
                    </div>
                  ) : selectedWinners.length > 0 ? (
                    <div className="py-4">
                      <h3 className="font-bold text-lg mb-4">🎉 Selected Winners 🎉</h3>
                      <ul className="space-y-3">
                        <AnimatePresence>
                          {selectedWinners.map((winner, index) => (
                            <motion.li
                              key={winner.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.2 }}
                              className="flex items-center gap-2 p-3 border rounded-md"
                            >
                              <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mr-2">
                                {index + 1}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium">{winner.user.username}</p>
                                <p className="text-sm text-muted-foreground">{winner.user.email}</p>
                              </div>
                              <Check className="h-5 w-5 text-green-500" />
                            </motion.li>
                          ))}
                        </AnimatePresence>
                      </ul>
                      <div className="mt-6 text-center">
                        <p>Winners have been recorded! You can now notify them.</p>
                        <Button 
                          onClick={() => {
                            setSelectedWinners([]);
                            setIsDrawWinnersOpen(false);
                          }} 
                          className="mt-4"
                        >
                          Close
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="py-4">
                        <div className="mb-4">
                          <p className="mb-2"><strong>Pool Status:</strong> {currentPool.status}</p>
                          <p className="mb-2"><strong>Max Winners:</strong> {currentPool.maxWinners}</p>
                          <p className="mb-2"><strong>Current Winners:</strong> {winnerCount}</p>
                          <p><strong>Available Entries:</strong> {availableForDrawing}</p>
                        </div>
                        <div className="mb-4">
                          <label className="block text-sm font-medium mb-1">Number of Winners to Draw</label>
                          <Input
                            type="number"
                            min={1}
                            max={Math.min(currentPool.maxWinners - winnerCount, availableForDrawing)}
                            value={numWinners}
                            onChange={(e) => setNumWinners(parseInt(e.target.value))}
                          />
                          <p className="text-sm text-muted-foreground mt-1">
                            Maximum: {Math.min(currentPool.maxWinners - winnerCount, availableForDrawing)}
                          </p>
                        </div>
                        {availableForDrawing === 0 ? (
                          <Alert>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>No eligible entries</AlertTitle>
                            <AlertDescription>
                              There are no eligible entries available for drawing.
                            </AlertDescription>
                          </Alert>
                        ) : numWinners > Math.min(currentPool.maxWinners - winnerCount, availableForDrawing) ? (
                          <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Invalid selection</AlertTitle>
                            <AlertDescription>
                              You cannot select more winners than available entries or max winners allowed.
                            </AlertDescription>
                          </Alert>
                        ) : null}
                      </div>
                      <DialogFooter>
                        <Button 
                          onClick={handleDrawWinners}
                          disabled={
                            numWinners < 1 || 
                            numWinners > Math.min(currentPool.maxWinners - winnerCount, availableForDrawing) ||
                            availableForDrawing === 0
                          }
                        >
                          Draw Winners
                        </Button>
                      </DialogFooter>
                    </>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold flex items-center">
                  <Users className="mr-2 h-5 w-5 text-muted-foreground" />
                  {entries ? entries.length : 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Winners Selected</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold flex items-center">
                  <Trophy className="mr-2 h-5 w-5 text-yellow-500" />
                  {winnerCount} / {currentPool.maxWinners}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Tokens Claimed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold flex items-center">
                  <Tag className="mr-2 h-5 w-5 text-green-500" />
                  {entries ? entries.filter((e: PrizeDrawingEntry) => e.tokenClaimed).length : 0}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All Entries</TabsTrigger>
              <TabsTrigger value="winners">Winners</TabsTrigger>
              <TabsTrigger value="notified">Notified</TabsTrigger>
              <TabsTrigger value="claimed">Claimed</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-4">
              {isLoadingEntries ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : entries && entries.length > 0 ? (
                <Table>
                  <TableCaption>List of all entries in this prize drawing pool</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Entry Method</TableHead>
                      <TableHead>Entry Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entries && entries.slice(0, 50).map((entry: PrizeDrawingEntry) => (
                      <TableRow key={entry.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{entry.user.username}</p>
                              <p className="text-xs text-muted-foreground">{entry.user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getEntryMethodBadge(entry.entryMethod)}
                        </TableCell>
                        <TableCell>
                          {formatDate(new Date(entry.entryDate))}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {entry.isWinner && <Badge variant="success">Winner</Badge>}
                            {entry.hasBeenNotified && <Badge variant="outline">Notified</Badge>}
                            {entry.tokenClaimed && <Badge variant="secondary">Claimed</Badge>}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {entry.isWinner && !entry.hasBeenNotified && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => notifyWinnerMutation.mutate(entry.id)}
                                disabled={notifyWinnerMutation.isPending}
                              >
                                <Bell className="h-4 w-4 mr-1" />
                                Notify
                              </Button>
                            )}
                            {entry.isWinner && entry.hasBeenNotified && !entry.tokenClaimed && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => claimTokenMutation.mutate(entry.id)}
                                disabled={claimTokenMutation.isPending}
                              >
                                <Tag className="h-4 w-4 mr-1" />
                                Mark Claimed
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Alert>
                  <AlertTitle>No entries found</AlertTitle>
                  <AlertDescription>
                    This prize drawing pool has no entries yet.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
            
            <TabsContent value="winners" className="mt-4">
              {isLoadingEntries ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : entries && entries.some((e: PrizeDrawingEntry) => e.isWinner) ? (
                <Table>
                  <TableCaption>List of winners in this prize drawing pool</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Entry Method</TableHead>
                      <TableHead>Drawing Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entries.filter((e: PrizeDrawingEntry) => e.isWinner).map((entry: PrizeDrawingEntry) => (
                      <TableRow key={entry.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{entry.user.username}</p>
                              <p className="text-xs text-muted-foreground">{entry.user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getEntryMethodBadge(entry.entryMethod)}
                        </TableCell>
                        <TableCell>
                          {entry.drawingDate ? formatDate(new Date(entry.drawingDate)) : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {entry.hasBeenNotified && <Badge variant="outline">Notified</Badge>}
                            {entry.tokenClaimed && <Badge variant="secondary">Claimed</Badge>}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {!entry.hasBeenNotified && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => notifyWinnerMutation.mutate(entry.id)}
                                disabled={notifyWinnerMutation.isPending}
                              >
                                <Bell className="h-4 w-4 mr-1" />
                                Notify
                              </Button>
                            )}
                            {entry.hasBeenNotified && !entry.tokenClaimed && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => claimTokenMutation.mutate(entry.id)}
                                disabled={claimTokenMutation.isPending}
                              >
                                <Tag className="h-4 w-4 mr-1" />
                                Mark Claimed
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Alert>
                  <AlertTitle>No winners selected</AlertTitle>
                  <AlertDescription>
                    No winners have been selected for this prize drawing pool yet.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
            
            <TabsContent value="notified" className="mt-4">
              {isLoadingEntries ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : entries && entries.some((e: PrizeDrawingEntry) => e.hasBeenNotified) ? (
                <Table>
                  <TableCaption>List of notified winners in this prize drawing pool</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Entry Method</TableHead>
                      <TableHead>Notification Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entries.filter((e: PrizeDrawingEntry) => e.hasBeenNotified).map((entry: PrizeDrawingEntry) => (
                      <TableRow key={entry.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{entry.user.username}</p>
                              <p className="text-xs text-muted-foreground">{entry.user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getEntryMethodBadge(entry.entryMethod)}
                        </TableCell>
                        <TableCell>
                          {entry.notificationDate ? formatDate(new Date(entry.notificationDate)) : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {entry.tokenClaimed && <Badge variant="secondary">Claimed</Badge>}
                            {!entry.tokenClaimed && <Badge variant="outline">Not Claimed</Badge>}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {!entry.tokenClaimed && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => claimTokenMutation.mutate(entry.id)}
                                disabled={claimTokenMutation.isPending}
                              >
                                <Tag className="h-4 w-4 mr-1" />
                                Mark Claimed
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Alert>
                  <AlertTitle>No notified winners</AlertTitle>
                  <AlertDescription>
                    No winners have been notified for this prize drawing pool yet.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
            
            <TabsContent value="claimed" className="mt-4">
              {isLoadingEntries ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : entries && entries.some((e: PrizeDrawingEntry) => e.tokenClaimed) ? (
                <Table>
                  <TableCaption>List of claimed tokens in this prize drawing pool</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Entry Method</TableHead>
                      <TableHead>Claim Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entries.filter((e: PrizeDrawingEntry) => e.tokenClaimed).map((entry: PrizeDrawingEntry) => (
                      <TableRow key={entry.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{entry.user.username}</p>
                              <p className="text-xs text-muted-foreground">{entry.user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getEntryMethodBadge(entry.entryMethod)}
                        </TableCell>
                        <TableCell>
                          {entry.claimDate ? formatDate(new Date(entry.claimDate)) : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="success">Claimed</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Alert>
                  <AlertTitle>No claimed tokens</AlertTitle>
                  <AlertDescription>
                    No winners have claimed their tokens for this prize drawing pool yet.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}

/**
 * Main Prize Drawing Admin Page
 */
export default function PrizeDrawingPage() {
  // Get the pool ID from URL if provided
  const searchParams = new URLSearchParams(window.location.search);
  const poolId = searchParams.get('pool') ? parseInt(searchParams.get('pool') as string) : null;
  
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Prize Drawing Management</h1>
        <p className="text-muted-foreground">
          Manage prize drawing pools and select winners for tournament discoveries
        </p>
      </div>
      
      {poolId ? (
        <EntriesManagement poolId={poolId} />
      ) : (
        <PoolManagement />
      )}
    </div>
  );
}