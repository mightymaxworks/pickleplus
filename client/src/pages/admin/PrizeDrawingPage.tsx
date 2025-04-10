/**
 * PKL-278651-GAME-0002-TOURN
 * Prize Drawing Admin Page
 * 
 * This page allows administrators to manage prize drawings
 * and select winners from eligible entries.
 */

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Gift, 
  Trophy, 
  Users, 
  Calendar, 
  Check, 
  X, 
  Loader2,
  Mail
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/utils';
import { PrizeDrawingPool, DrawingWinner } from '../../core/modules/gamification/tournament/types';

const PrizeDrawingPage: React.FC = () => {
  const [selectedPoolId, setSelectedPoolId] = useState<string>('');
  const [drawingInProgress, setDrawingInProgress] = useState(false);
  const [winner, setWinner] = useState<DrawingWinner | null>(null);
  const [showWinnerDialog, setShowWinnerDialog] = useState(false);
  const [drawingPhase, setDrawingPhase] = useState<'idle' | 'entries' | 'shuffling' | 'winner'>('idle');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch prize pools
  const { 
    data: pools, 
    isLoading: isLoadingPools 
  } = useQuery({ 
    queryKey: ['/api/admin/prize-drawings/pools'],
    refetchOnWindowFocus: false
  });
  
  // Get selected pool details
  const selectedPool = pools?.find(pool => pool.id.toString() === selectedPoolId);
  
  // Fetch entries for selected pool
  const { 
    data: entries, 
    isLoading: isLoadingEntries 
  } = useQuery({
    queryKey: ['/api/admin/prize-drawings/pools', selectedPoolId, 'entries'],
    enabled: !!selectedPoolId,
    refetchOnWindowFocus: false
  });
  
  // Perform drawing mutation
  const drawMutation = useMutation({
    mutationFn: async (poolId: number) => {
      const response = await fetch('/api/admin/prize-drawings/draw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ poolId })
      });
      
      if (!response.ok) {
        throw new Error('Failed to perform drawing');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setWinner(data.winner);
        setDrawingPhase('winner');
        setShowWinnerDialog(true);
        
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['/api/admin/prize-drawings/pools'] });
        queryClient.invalidateQueries({ 
          queryKey: ['/api/admin/prize-drawings/pools', selectedPoolId, 'entries'] 
        });
        
        toast({
          title: 'Winner Selected!',
          description: `${data.winner.user.username} has been selected as the winner.`,
          variant: 'default'
        });
      }
    },
    onError: (error) => {
      toast({
        title: 'Error Performing Drawing',
        description: (error as Error).message,
        variant: 'destructive'
      });
    }
  });
  
  // Notify winner mutation
  const notifyMutation = useMutation({
    mutationFn: async (entryId: number) => {
      const response = await fetch(`/api/admin/prize-drawings/notify/${entryId}`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark as notified');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Update winner state
      if (winner) {
        setWinner({
          ...winner,
          hasBeenNotified: true
        });
      }
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ 
        queryKey: ['/api/admin/prize-drawings/pools', selectedPoolId, 'entries'] 
      });
      
      toast({
        title: 'Winner Notified',
        description: 'The winner has been marked as notified.',
        variant: 'default'
      });
    },
    onError: (error) => {
      toast({
        title: 'Error Notifying Winner',
        description: (error as Error).message,
        variant: 'destructive'
      });
    }
  });
  
  // Handle pool selection
  const handlePoolSelect = (value: string) => {
    setSelectedPoolId(value);
    setWinner(null);
    setDrawingPhase('idle');
  };
  
  // Handle drawing button click
  const handleDrawWinner = async () => {
    if (!selectedPool || drawingInProgress) return;
    
    setDrawingInProgress(true);
    setDrawingPhase('entries');
    
    // Animation sequence timeouts
    setTimeout(() => {
      setDrawingPhase('shuffling');
      
      setTimeout(() => {
        if (selectedPool) {
          drawMutation.mutate(selectedPool.id);
        }
      }, 2000);
    }, 1500);
  };
  
  // Handle notify winner
  const handleNotifyWinner = () => {
    if (winner) {
      notifyMutation.mutate(winner.id);
    }
  };
  
  // Reset drawing state when done
  useEffect(() => {
    if (drawingPhase === 'winner') {
      setDrawingInProgress(false);
    }
  }, [drawingPhase]);
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center mb-8">
        <Trophy className="text-yellow-500 mr-3" size={28} />
        <h1 className="text-2xl font-bold">Prize Drawing Administration</h1>
      </div>
      
      {/* Pool selection card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Gift className="mr-2 text-blue-500" size={20} />
            Select Drawing Pool
          </CardTitle>
          <CardDescription>
            Choose a prize drawing pool to manage and select winners
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingPools ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>Loading prize pools...</span>
            </div>
          ) : (
            pools && pools.length > 0 ? (
              <Select 
                value={selectedPoolId} 
                onValueChange={handlePoolSelect}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a drawing pool" />
                </SelectTrigger>
                <SelectContent>
                  {pools.map((pool: PrizeDrawingPool) => (
                    <SelectItem key={pool.id} value={pool.id.toString()}>
                      {pool.name} ({pool.entryCount} entries)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="text-center py-4 text-gray-500">
                No drawing pools available
              </div>
            )
          )}
        </CardContent>
      </Card>
      
      {/* Drawing interface */}
      {selectedPool && (
        <Card>
          <CardHeader>
            <CardTitle>{selectedPool.name}</CardTitle>
            <CardDescription>
              {selectedPool.description || 'Prize drawing pool'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-6">
              {/* Pool stats */}
              <div className="stats grid grid-cols-3 gap-4 text-center">
                <div className="stat bg-gray-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold">{selectedPool.entryCount}</div>
                  <div className="text-sm text-gray-500">Total Entries</div>
                </div>
                <div className="stat bg-gray-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold">
                    {formatDate(new Date(selectedPool.startDate))}
                  </div>
                  <div className="text-sm text-gray-500">Start Date</div>
                </div>
                <div className="stat bg-gray-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold capitalize">{selectedPool.status}</div>
                  <div className="text-sm text-gray-500">Status</div>
                </div>
              </div>
              
              {/* Drawing animation area */}
              {drawingPhase !== 'idle' && (
                <div className="drawing-animation bg-gray-50 rounded-lg p-6 text-center min-h-[200px] flex flex-col items-center justify-center">
                  {drawingPhase === 'entries' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center"
                    >
                      <Users className="text-blue-500 mb-3" size={40} />
                      <h3 className="text-lg font-medium">Gathering Entries</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {selectedPool.entryCount} eligible participants
                      </p>
                    </motion.div>
                  )}
                  
                  {drawingPhase === 'shuffling' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center"
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ 
                          duration: 2, 
                          repeat: Infinity, 
                          ease: "linear" 
                        }}
                      >
                        <Gift className="text-indigo-500" size={40} />
                      </motion.div>
                      <h3 className="text-lg font-medium mt-3">Selecting Winner</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Randomizing selection...
                      </p>
                    </motion.div>
                  )}
                  
                  {drawingPhase === 'winner' && winner && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center"
                    >
                      <motion.div
                        initial={{ y: -10 }}
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 1.5, repeat: 2 }}
                      >
                        <Trophy className="text-yellow-500" size={40} />
                      </motion.div>
                      <h3 className="text-lg font-medium mt-3">Winner Selected!</h3>
                      <div className="winner-info mt-3 p-3 bg-white rounded-lg border border-gray-200">
                        <p className="font-medium">{winner.user.username}</p>
                        <p className="text-sm text-gray-500">{winner.user.email}</p>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
              
              {/* Entries table */}
              <div className="entries-list mt-4">
                <h3 className="text-lg font-medium mb-3">Recent Entries</h3>
                {isLoadingEntries ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>Loading entries...</span>
                  </div>
                ) : (
                  entries && entries.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-50 text-left">
                            <th className="py-2 px-3 text-sm font-medium">User</th>
                            <th className="py-2 px-3 text-sm font-medium">Entry Date</th>
                            <th className="py-2 px-3 text-sm font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {entries.slice(0, 5).map((entry: any) => (
                            <tr key={entry.id} className="border-t border-gray-200">
                              <td className="py-3 px-3">{entry.username}</td>
                              <td className="py-3 px-3 text-sm">
                                {formatDate(new Date(entry.entryDate))}
                              </td>
                              <td className="py-3 px-3">
                                {entry.isWinner ? (
                                  <span className="inline-flex items-center bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                    <Trophy size={12} className="mr-1" />
                                    Winner
                                  </span>
                                ) : (
                                  <span className="text-gray-500 text-sm">Entered</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {entries.length > 5 && (
                        <div className="text-center mt-2 text-sm text-gray-500">
                          Showing 5 of {entries.length} entries
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
                      No entries found for this pool
                    </div>
                  )
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center pt-2">
            <Button 
              size="lg" 
              className="w-full max-w-md"
              disabled={drawingInProgress || selectedPool.status !== 'active'}
              onClick={handleDrawWinner}
            >
              {drawingInProgress ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Drawing in Progress...
                </>
              ) : (
                <>
                  <Gift className="mr-2 h-5 w-5" />
                  Draw Random Winner
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {/* Winner dialog */}
      <Dialog open={showWinnerDialog} onOpenChange={setShowWinnerDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center text-center">
              <Trophy className="text-yellow-500 mr-2" size={20} />
              Prize Drawing Winner
            </DialogTitle>
            <DialogDescription className="text-center">
              The following user has been selected as the winner
            </DialogDescription>
          </DialogHeader>
          
          {winner && (
            <div className="py-6">
              <div className="winner-card bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200 text-center">
                <h3 className="text-xl font-bold mb-1">{winner.user.username}</h3>
                <p className="text-gray-600">{winner.user.email}</p>
                
                <div className="mt-4 text-sm text-gray-500">
                  <div className="flex items-center justify-center">
                    <Calendar size={14} className="mr-1" />
                    Entry date: {formatDate(new Date(winner.entryDate))}
                  </div>
                  <div className="flex items-center justify-center mt-1">
                    <Trophy size={14} className="mr-1" />
                    Drawing date: {formatDate(new Date(winner.drawingDate))}
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-white rounded-md border border-gray-200">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2 bg-green-500"></div>
                    <span className="text-sm font-medium">
                      Notification Status:
                    </span>
                    <span className="ml-1 text-sm">
                      {winner.hasBeenNotified ? (
                        <span className="text-green-600 flex items-center">
                          <Check size={14} className="mr-1" />
                          Notified
                        </span>
                      ) : (
                        <span className="text-amber-600 flex items-center">
                          <X size={14} className="mr-1" />
                          Not notified
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            {winner && !winner.hasBeenNotified && (
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={handleNotifyWinner}
                disabled={notifyMutation.isPending}
              >
                {notifyMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="mr-2 h-4 w-4" />
                )}
                Mark as Notified
              </Button>
            )}
            <Button 
              type="button" 
              className="flex-1"
              onClick={() => setShowWinnerDialog(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PrizeDrawingPage;