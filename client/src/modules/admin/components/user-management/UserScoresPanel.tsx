/**
 * PKL-278651-ADMIN-0015-USER
 * User Scores Panel Component
 * 
 * This component allows admins to update a user's XP and ranking points
 */

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Trophy, Award, Undo2 } from 'lucide-react';
import { updateUserScores } from '@/lib/api/admin/user-management';

interface UserScoresPanelProps {
  userId: number;
  user: {
    xp: number | null;
    level: number | null;
    rankingPoints: number | null;
  };
}

/**
 * User Scores Panel Component
 */
export const UserScoresPanel = ({ userId, user }: UserScoresPanelProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Current values
  const currentXp = user.xp || 0;
  const currentRankingPoints = user.rankingPoints || 0;
  
  // Form state
  const [xp, setXp] = useState<string>(currentXp.toString());
  const [rankingPoints, setRankingPoints] = useState<string>(currentRankingPoints.toString());
  const [changing, setChanging] = useState<'xp' | 'ranking' | 'both' | null>(null);
  
  // Track if values have changed
  const xpChanged = xp !== currentXp.toString();
  const rankingPointsChanged = rankingPoints !== currentRankingPoints.toString();
  const hasChanges = xpChanged || rankingPointsChanged;
  
  // Mutations
  const updateScoresMutation = useMutation({
    mutationFn: async ({ xp, rankingPoints }: { xp?: number; rankingPoints?: number }) => {
      return await updateUserScores(userId, { xp, rankingPoints });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', userId] });
      
      // Show success message
      let message = 'User scores updated successfully.';
      let details = [];
      
      if (data.previousValues.xp !== data.xp) {
        details.push(`XP: ${data.previousValues.xp} → ${data.xp}`);
      }
      if (data.previousValues.rankingPoints !== data.rankingPoints) {
        details.push(`Ranking Points: ${data.previousValues.rankingPoints} → ${data.rankingPoints}`);
      }
      
      toast({
        title: 'Success',
        description: `${message} ${details.join(', ')}`,
        variant: 'default',
      });
      
      // Reset state
      setChanging(null);
      setXp(data.xp.toString());
      setRankingPoints(data.rankingPoints.toString());
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update user scores: ${error.message}`,
        variant: 'destructive',
      });
      
      // Reset to original values
      setXp(currentXp.toString());
      setRankingPoints(currentRankingPoints.toString());
      setChanging(null);
    }
  });
  
  // Handle update XP
  const handleUpdateXp = () => {
    const parsedXp = parseInt(xp);
    if (isNaN(parsedXp) || parsedXp < 0) {
      toast({
        title: 'Invalid XP',
        description: 'XP must be a valid non-negative number',
        variant: 'destructive',
      });
      return;
    }
    
    setChanging('xp');
    updateScoresMutation.mutate({ xp: parsedXp });
  };
  
  // Handle update ranking points
  const handleUpdateRankingPoints = () => {
    const parsedPoints = parseInt(rankingPoints);
    if (isNaN(parsedPoints) || parsedPoints < 0) {
      toast({
        title: 'Invalid Ranking Points',
        description: 'Ranking points must be a valid non-negative number',
        variant: 'destructive',
      });
      return;
    }
    
    setChanging('ranking');
    updateScoresMutation.mutate({ rankingPoints: parsedPoints });
  };
  
  // Handle update both scores
  const handleUpdateBoth = () => {
    const parsedXp = parseInt(xp);
    const parsedPoints = parseInt(rankingPoints);
    
    if (isNaN(parsedXp) || parsedXp < 0 || isNaN(parsedPoints) || parsedPoints < 0) {
      toast({
        title: 'Invalid Values',
        description: 'Both XP and ranking points must be valid non-negative numbers',
        variant: 'destructive',
      });
      return;
    }
    
    setChanging('both');
    updateScoresMutation.mutate({ xp: parsedXp, rankingPoints: parsedPoints });
  };
  
  // Reset all form values
  const resetForm = () => {
    setXp(currentXp.toString());
    setRankingPoints(currentRankingPoints.toString());
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" /> 
          User Achievement Scores
        </CardTitle>
        <CardDescription>
          Manage user XP and ranking points
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="xp" className="flex items-center gap-1">
              <Award className="h-4 w-4" /> Experience Points (XP)
            </Label>
            <Badge variant="outline" className="ml-2">Level {user.level || 1}</Badge>
          </div>
          <div className="flex gap-2">
            <Input 
              id="xp" 
              type="number" 
              min="0"
              value={xp} 
              onChange={(e) => setXp(e.target.value)}
              className="flex-1"
              disabled={updateScoresMutation.isPending}
            />
            <Button 
              onClick={handleUpdateXp} 
              disabled={!xpChanged || updateScoresMutation.isPending}
              size="sm"
              variant={xpChanged ? "default" : "outline"}
              className="whitespace-nowrap"
            >
              {changing === 'xp' && updateScoresMutation.isPending ? 'Updating...' : 'Update XP'}
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="rankingPoints" className="flex items-center gap-1">
            <Trophy className="h-4 w-4" /> Ranking Points
          </Label>
          <div className="flex gap-2">
            <Input 
              id="rankingPoints" 
              type="number" 
              min="0"
              value={rankingPoints} 
              onChange={(e) => setRankingPoints(e.target.value)}
              className="flex-1"
              disabled={updateScoresMutation.isPending}
            />
            <Button 
              onClick={handleUpdateRankingPoints} 
              disabled={!rankingPointsChanged || updateScoresMutation.isPending}
              size="sm"
              variant={rankingPointsChanged ? "default" : "outline"}
              className="whitespace-nowrap"
            >
              {changing === 'ranking' && updateScoresMutation.isPending ? 'Updating...' : 'Update Points'}
            </Button>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <Button 
            onClick={handleUpdateBoth} 
            disabled={!hasChanges || updateScoresMutation.isPending}
            variant="default"
            className="flex-1"
          >
            {changing === 'both' && updateScoresMutation.isPending ? 'Updating All...' : 'Update All Scores'}
          </Button>
          
          <Button 
            onClick={resetForm} 
            disabled={!hasChanges || updateScoresMutation.isPending}
            variant="ghost" 
            className="gap-1"
          >
            <Undo2 className="h-4 w-4" /> Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};