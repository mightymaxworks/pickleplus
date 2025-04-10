/**
 * PKL-278651-GAME-0002-TOURN
 * Prize Drawing Admin Page
 * 
 * This page allows administrators to manage prize drawing pools and select winners
 */

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { formatDate, formatDateOnly } from '@/lib/utils';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';

// Icons
import { Loader2, AlertCircle, Trophy, Check, Gift, Users, Calendar, Hash, Plus, Trash, Zap, Award } from 'lucide-react';

// Types for the prize drawing data
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

/**
 * Pool Management component to display and edit prize drawing pools
 */
const PoolManagement: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activePool, setActivePool] = useState<number | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    campaignId: 'tournament-discovery',
    prizeDescription: '',
    maxWinners: 1,
    status: 'draft' as const,
    requiresVerification: false
  });

  // Fetch pools data
  const { data: pools, isLoading: isLoadingPools, error: poolsError } = useQuery({
    queryKey: ['/api/prize-drawings/pools-summary'],
    retry: 1
  });

  // Create a new pool
  const createPoolMutation = useMutation({
    mutationFn: (data: typeof formData) => 
      apiRequest('/api/prize-drawings/pools', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/prize-drawings/pools-summary'] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast({
        title: 'Success',
        description: 'Prize drawing pool created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to create pool: ${error.message || 'Unknown error'}`,
        variant: 'destructive',
      });
    }
  });

  // Update an existing pool
  const updatePoolMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: typeof formData }) => 
      apiRequest(`/api/prize-drawings/pools/${id}`, 'PUT', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/prize-drawings/pools-summary'] });
      setIsEditDialogOpen(false);
      resetForm();
      toast({
        title: 'Success',
        description: 'Prize drawing pool updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to update pool: ${error.message || 'Unknown error'}`,
        variant: 'destructive',
      });
    }
  });

  const handleCreatePool = (e: React.FormEvent) => {
    e.preventDefault();
    createPoolMutation.mutate(formData);
  };

  const handleUpdatePool = (e: React.FormEvent) => {
    e.preventDefault();
    if (activePool) {
      updatePoolMutation.mutate({ id: activePool, data: formData });
    }
  };

  const handleEditPool = (pool: PrizeDrawingPool) => {
    setActivePool(pool.id);
    setFormData({
      name: pool.name,
      description: pool.description || '',
      campaignId: pool.campaignId,
      prizeDescription: pool.prizeDescription || '',
      maxWinners: pool.maxWinners,
      status: pool.status,
      requiresVerification: pool.requiresVerification
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      campaignId: 'tournament-discovery',
      prizeDescription: '',
      maxWinners: 1,
      status: 'draft',
      requiresVerification: false
    });
    setActivePool(null);
  };

  if (isLoadingPools) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (poolsError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load prize drawing pools.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Prize Drawing Pools</h2>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create New Pool
        </Button>
      </div>

      {pools && pools.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-6">
              <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No prize drawing pools yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first prize drawing pool to get started
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Create Pool
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pools && pools.map((pool: PrizeDrawingPool) => (
            <Card key={pool.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{pool.name}</CardTitle>
                    <CardDescription className="mt-1 text-sm text-muted-foreground">
                      Campaign: {pool.campaignId}
                    </CardDescription>
                  </div>
                  <Badge 
                    variant={
                      pool.status === 'active' ? 'default' :
                      pool.status === 'completed' ? 'success' :
                      pool.status === 'cancelled' ? 'destructive' : 'outline'
                    }
                  >
                    {pool.status.charAt(0).toUpperCase() + pool.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                {pool.description && (
                  <p className="text-sm text-muted-foreground mb-4">{pool.description}</p>
                )}
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="flex items-center text-sm">
                      <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Entries: {pool.entryCount || 0}</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center text-sm">
                      <Trophy className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Winners: {pool.winnerCount || 0} / {pool.maxWinners}</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Created: {formatDateOnly(new Date(pool.createdAt))}</span>
                    </div>
                  </div>
                  <div>
                    {pool.drawingDate ? (
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>Drawn: {formatDateOnly(new Date(pool.drawingDate))}</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>No drawing yet</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {pool.prizeDescription && (
                  <Alert className="mt-2">
                    <Gift className="h-4 w-4" />
                    <AlertTitle>Prize</AlertTitle>
                    <AlertDescription className="text-xs">
                      {pool.prizeDescription}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleEditPool(pool)}
                >
                  Edit Details
                </Button>
                <Button 
                  variant="default" 
                  size="sm" 
                  asChild
                >
                  <a href={`#entries-${pool.id}`}>View Entries</a>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Create Pool Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleCreatePool}>
            <DialogHeader>
              <DialogTitle>Create New Prize Drawing Pool</DialogTitle>
              <DialogDescription>
                Create a new pool for prize drawings. Users will be entered into this pool when completing specific actions.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Pool Name</Label>
                <Input 
                  id="name" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="campaignId">Campaign ID</Label>
                <Input 
                  id="campaignId" 
                  value={formData.campaignId}
                  onChange={(e) => setFormData({...formData, campaignId: e.target.value})}
                  required
                />
                <p className="text-xs text-muted-foreground">Unique identifier for the campaign this pool belongs to</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="prizeDescription">Prize Description</Label>
                <Textarea 
                  id="prizeDescription" 
                  value={formData.prizeDescription}
                  onChange={(e) => setFormData({...formData, prizeDescription: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="maxWinners">Maximum Winners</Label>
                  <Input 
                    id="maxWinners" 
                    type="number"
                    min="1"
                    value={formData.maxWinners}
                    onChange={(e) => setFormData({...formData, maxWinners: parseInt(e.target.value)})}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={formData.status}
                    onValueChange={(value) => setFormData({
                      ...formData, 
                      status: value as 'draft' | 'active' | 'completed' | 'cancelled'
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="requiresVerification" 
                  checked={formData.requiresVerification}
                  onCheckedChange={(checked) => setFormData({...formData, requiresVerification: checked})}
                />
                <Label htmlFor="requiresVerification">Requires Verification</Label>
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  resetForm();
                  setIsCreateDialogOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={createPoolMutation.isPending}
              >
                {createPoolMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Pool
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Pool Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleUpdatePool}>
            <DialogHeader>
              <DialogTitle>Edit Prize Drawing Pool</DialogTitle>
              <DialogDescription>
                Update the details of this prize drawing pool.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Pool Name</Label>
                <Input 
                  id="edit-name" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea 
                  id="edit-description" 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-campaignId">Campaign ID</Label>
                <Input 
                  id="edit-campaignId" 
                  value={formData.campaignId}
                  onChange={(e) => setFormData({...formData, campaignId: e.target.value})}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-prizeDescription">Prize Description</Label>
                <Textarea 
                  id="edit-prizeDescription" 
                  value={formData.prizeDescription}
                  onChange={(e) => setFormData({...formData, prizeDescription: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-maxWinners">Maximum Winners</Label>
                  <Input 
                    id="edit-maxWinners" 
                    type="number"
                    min="1"
                    value={formData.maxWinners}
                    onChange={(e) => setFormData({...formData, maxWinners: parseInt(e.target.value)})}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select 
                    value={formData.status}
                    onValueChange={(value) => setFormData({
                      ...formData, 
                      status: value as 'draft' | 'active' | 'completed' | 'cancelled'
                    })}
                  >
                    <SelectTrigger id="edit-status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="edit-requiresVerification" 
                  checked={formData.requiresVerification}
                  onCheckedChange={(checked) => setFormData({...formData, requiresVerification: checked})}
                />
                <Label htmlFor="edit-requiresVerification">Requires Verification</Label>
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  resetForm();
                  setIsEditDialogOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={updatePoolMutation.isPending}
              >
                {updatePoolMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Pool
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

/**
 * Entries Management component to display and manage entries for a prize drawing pool
 */
const EntriesManagement: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPoolId, setSelectedPoolId] = useState<number | null>(null);
  const [numWinnersToDraw, setNumWinnersToDraw] = useState(1);
  const [showDrawingDialog, setShowDrawingDialog] = useState(false);
  const [drawingWinners, setDrawingWinners] = useState<any[]>([]);
  const [showWinnerAnimation, setShowWinnerAnimation] = useState(false);
  const [winnerIndex, setWinnerIndex] = useState(0);
  const [isDrawingInProgress, setIsDrawingInProgress] = useState(false);

  // Fetch pools data
  const { data: pools, isLoading: isLoadingPools } = useQuery({
    queryKey: ['/api/prize-drawings/pools-summary'],
    retry: 1
  });

  // Fetch entries for the selected pool
  const { data: entries, isLoading: isLoadingEntries } = useQuery({
    queryKey: ['/api/prize-drawings/pools', selectedPoolId, 'entries'],
    enabled: !!selectedPoolId,
    retry: 1
  });

  // Draw winners mutation
  const drawWinnersMutation = useMutation({
    mutationFn: ({ poolId, numWinners }: { poolId: number, numWinners: number }) => 
      apiRequest(`/api/prize-drawings/pools/${poolId}/draw`, 'POST', { numWinners }),
    onSuccess: (data: DrawWinnersResponse) => {
      queryClient.invalidateQueries({ queryKey: ['/api/prize-drawings/pools-summary'] });
      queryClient.invalidateQueries({ queryKey: ['/api/prize-drawings/pools', selectedPoolId, 'entries'] });
      
      // Start animation sequence
      setDrawingWinners(data.winners);
      setWinnerIndex(0);
      setShowWinnerAnimation(true);
      setIsDrawingInProgress(true);
      
      toast({
        title: 'Success',
        description: data.message,
      });
    },
    onError: (error: any) => {
      setShowDrawingDialog(false);
      toast({
        title: 'Error',
        description: `Failed to draw winners: ${error.message || 'Unknown error'}`,
        variant: 'destructive',
      });
    }
  });

  // Mark as notified mutation
  const notifyWinnerMutation = useMutation({
    mutationFn: (entryId: number) => 
      apiRequest(`/api/prize-drawings/entries/${entryId}/notify`, 'POST', {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/prize-drawings/pools', selectedPoolId, 'entries'] });
      toast({
        title: 'Success',
        description: 'Winner has been marked as notified',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to mark winner as notified: ${error.message || 'Unknown error'}`,
        variant: 'destructive',
      });
    }
  });

  // Mark token as claimed mutation
  const claimTokenMutation = useMutation({
    mutationFn: (entryId: number) => 
      apiRequest(`/api/prize-drawings/entries/${entryId}/claim`, 'POST', {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/prize-drawings/pools', selectedPoolId, 'entries'] });
      toast({
        title: 'Success',
        description: 'Token has been marked as claimed',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to mark token as claimed: ${error.message || 'Unknown error'}`,
        variant: 'destructive',
      });
    }
  });

  // Handle drawing winners
  const handleDrawWinners = () => {
    if (!selectedPoolId) return;
    
    drawWinnersMutation.mutate({ 
      poolId: selectedPoolId, 
      numWinners: numWinnersToDraw 
    });
    setShowDrawingDialog(false);
  };

  // Handle marking winner as notified
  const handleMarkAsNotified = (entryId: number) => {
    notifyWinnerMutation.mutate(entryId);
  };

  // Handle marking token as claimed
  const handleMarkAsClaimed = (entryId: number) => {
    claimTokenMutation.mutate(entryId);
  };

  // Animation effect for revealing winners
  useEffect(() => {
    if (showWinnerAnimation && drawingWinners.length > 0) {
      if (winnerIndex < drawingWinners.length) {
        const timer = setTimeout(() => {
          setWinnerIndex(winnerIndex + 1);
        }, 2000); // Reveal each winner after 2 seconds
        return () => clearTimeout(timer);
      } else {
        // Animation complete
        const timer = setTimeout(() => {
          setShowWinnerAnimation(false);
          setIsDrawingInProgress(false);
        }, 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [showWinnerAnimation, winnerIndex, drawingWinners.length]);

  if (isLoadingPools) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // Calculate winners, entries, and available entries for drawing
  const getPoolStats = (poolId: number) => {
    if (!pools) return { totalEntries: 0, winnerCount: 0, availableForDrawing: 0 };
    
    const pool = pools.find((p: any) => p.id === poolId);
    if (!pool) return { totalEntries: 0, winnerCount: 0, availableForDrawing: 0 };
    
    const totalEntries = pool.entryCount || 0;
    const winnerCount = pool.winnerCount || 0;
    
    // If we have entries data, calculate more precisely
    if (entries) {
      const availableForDrawing = entries.filter((e: PrizeDrawingEntry) => !e.isWinner).length;
      return { totalEntries, winnerCount, availableForDrawing };
    }
    
    // Otherwise estimate
    const availableForDrawing = totalEntries - winnerCount;
    return { totalEntries, winnerCount, availableForDrawing };
  };

  const stats = selectedPoolId ? getPoolStats(selectedPoolId) : { totalEntries: 0, winnerCount: 0, availableForDrawing: 0 };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div>
          <Label htmlFor="pool-select">Select Prize Drawing Pool</Label>
          <Select 
            value={selectedPoolId?.toString() || ''}
            onValueChange={(value) => setSelectedPoolId(parseInt(value))}
          >
            <SelectTrigger id="pool-select" className="w-[300px]">
              <SelectValue placeholder="Select a pool" />
            </SelectTrigger>
            <SelectContent>
              {pools && pools.length === 0 ? (
                <div className="p-2 text-center text-sm text-muted-foreground">
                  No pools available
                </div>
              ) : (
                pools && pools.map((pool: PrizeDrawingPool) => (
                  <SelectItem key={pool.id} value={pool.id.toString()}>
                    {pool.name} ({pool.status})
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {selectedPoolId && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center">
                  <Users className="h-8 w-8 text-primary mb-2" />
                  <p className="text-sm text-muted-foreground">Total Entries</p>
                  <p className="text-3xl font-bold">{stats.totalEntries}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center">
                  <Trophy className="h-8 w-8 text-amber-500 mb-2" />
                  <p className="text-sm text-muted-foreground">Winners Selected</p>
                  <p className="text-3xl font-bold">{stats.winnerCount}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center">
                  <Users className="h-8 w-8 text-green-500 mb-2" />
                  <p className="text-sm text-muted-foreground">Available for Drawing</p>
                  <p className="text-3xl font-bold">{stats.availableForDrawing}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {selectedPoolId && stats.availableForDrawing > 0 && (
          <div className="flex justify-center">
            <Button 
              onClick={() => setShowDrawingDialog(true)}
              disabled={isDrawingInProgress}
              className="mt-4"
            >
              <Trophy className="mr-2 h-4 w-4" />
              Draw Winners
            </Button>
          </div>
        )}

        {/* Draw Winners Dialog */}
        <Dialog open={showDrawingDialog} onOpenChange={setShowDrawingDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Draw Winners</DialogTitle>
              <DialogDescription>
                Select how many winners to draw from the prize pool.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="numWinners">Number of Winners to Draw</Label>
                  <Input 
                    id="numWinners" 
                    type="number"
                    min="1"
                    max={stats.availableForDrawing}
                    value={numWinnersToDraw}
                    onChange={(e) => setNumWinnersToDraw(parseInt(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximum {stats.availableForDrawing} winners can be drawn
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowDrawingDialog(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleDrawWinners}
                disabled={drawWinnersMutation.isPending}
              >
                {drawWinnersMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Draw Winners
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Winner Animation Dialog */}
        <Dialog open={showWinnerAnimation} onOpenChange={setShowWinnerAnimation}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-center">
                <Trophy className="h-10 w-10 text-amber-500 mx-auto mb-2" />
                Drawing Winners!
              </DialogTitle>
            </DialogHeader>
            <div className="py-8">
              {winnerIndex === 0 ? (
                <div className="text-center">
                  <Loader2 className="h-16 w-16 animate-spin mx-auto mb-4 text-primary" />
                  <p className="text-lg font-medium">Selecting winners...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <p className="text-center mb-4">
                    {winnerIndex === drawingWinners.length ? 
                      `All ${drawingWinners.length} winners have been selected!` : 
                      `Winner ${winnerIndex} of ${drawingWinners.length}`}
                  </p>
                  
                  <div className="space-y-4">
                    {drawingWinners.slice(0, winnerIndex).map((winner, index) => (
                      <div 
                        key={winner.id} 
                        className="flex items-center p-4 border rounded-lg bg-muted/50 animate-fadeIn"
                      >
                        <div className="flex-1 flex items-center">
                          <Avatar className="h-10 w-10 mr-4">
                            <AvatarFallback>
                              {winner.user.username.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{winner.user.displayName || winner.user.username}</p>
                            <p className="text-sm text-muted-foreground">{winner.user.email}</p>
                          </div>
                        </div>
                        <Check className="h-5 w-5 text-green-500" />
                      </div>
                    ))}
                  </div>
                  
                  {winnerIndex < drawingWinners.length && (
                    <div className="flex justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  )}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button 
                onClick={() => {
                  setShowWinnerAnimation(false);
                  setIsDrawingInProgress(false);
                }}
                disabled={winnerIndex < drawingWinners.length}
              >
                {winnerIndex < drawingWinners.length ? 'Drawing...' : 'Close'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Entries Table */}
      {selectedPoolId && (
        <div id={`entries-${selectedPoolId}`} className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold">Entries</h3>
            {entries && entries.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Showing {entries.length} entries
              </p>
            )}
          </div>

          {isLoadingEntries ? (
            <Skeleton className="h-64 w-full" />
          ) : entries && entries.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-6">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">No entries yet</p>
                  <p className="text-sm text-muted-foreground">
                    Entries will appear here when users complete the requirements
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Entry Method</TableHead>
                    <TableHead>Entry Date</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries && entries.slice(0, 50).map((entry: PrizeDrawingEntry) => (
                    <TableRow key={entry.id} className={entry.isWinner ? 'bg-yellow-100 dark:bg-yellow-900/20' : ''}>
                      <TableCell>{entry.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            {entry.user.avatarUrl ? (
                              <AvatarImage src={entry.user.avatarUrl} alt={entry.user.username} />
                            ) : null}
                            <AvatarFallback>
                              {entry.user.username.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{entry.user.displayName || entry.user.username}</p>
                            <p className="text-xs text-muted-foreground">{entry.user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {entry.entryMethod.split('_').map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatDate(new Date(entry.entryDate))}
                      </TableCell>
                      <TableCell className="text-center">
                        {entry.isWinner ? (
                          <div className="flex flex-col items-center">
                            <Badge variant="default" className="mb-1">
                              <Trophy className="h-3 w-3 mr-1" /> Winner
                            </Badge>
                            {entry.hasBeenNotified && (
                              <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                                <Check className="h-3 w-3 mr-1" /> Notified
                              </Badge>
                            )}
                            {entry.tokenClaimed && (
                              <Badge variant="outline" className="mt-1 bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300">
                                <Gift className="h-3 w-3 mr-1" /> Claimed
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <Badge variant="outline">Entered</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {entry.isWinner && !entry.hasBeenNotified && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="mr-2"
                            onClick={() => handleMarkAsNotified(entry.id)}
                            disabled={notifyWinnerMutation.isPending}
                          >
                            {notifyWinnerMutation.isPending ? (
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            ) : (
                              <Check className="h-3 w-3 mr-1" />
                            )}
                            Mark Notified
                          </Button>
                        )}
                        {entry.isWinner && entry.hasBeenNotified && !entry.tokenClaimed && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleMarkAsClaimed(entry.id)}
                            disabled={claimTokenMutation.isPending}
                          >
                            {claimTokenMutation.isPending ? (
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            ) : (
                              <Award className="h-3 w-3 mr-1" />
                            )}
                            Mark Claimed
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                {entries && entries.length > 50 && (
                  <TableCaption>
                    Showing first 50 entries of {entries.length} total entries
                  </TableCaption>
                )}
              </Table>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Main Prize Drawing Admin Page
 */
const PrizeDrawingPage: React.FC = () => {
  return (
    <div className="container py-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Prize Drawing Administration</h1>
        <p className="text-muted-foreground">
          Manage prize drawing pools and select winners for the Tournament Discovery Quest
        </p>
      </div>

      <Tabs defaultValue="pools" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pools">Pools</TabsTrigger>
          <TabsTrigger value="entries">Entries</TabsTrigger>
        </TabsList>
        <TabsContent value="pools" className="space-y-4">
          <PoolManagement />
        </TabsContent>
        <TabsContent value="entries" className="space-y-4">
          <EntriesManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PrizeDrawingPage;