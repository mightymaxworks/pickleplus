/**
 * Casual Match Recorder Component
 * 
 * Records casual matches with hybrid point system that includes:
 * - Reduced points for casual matches (50% of tournament value)
 * - Anti-gaming safeguards with diminishing returns
 * - Transparent point breakdown display
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-06-04
 */

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trophy, Users, Target, AlertTriangle, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { PlayerSearchInput } from '@/components/match/PlayerSearchInput';
import { useLanguage } from '@/contexts/LanguageContext';

const casualMatchSchema = z.object({
  opponentId: z.number().min(1, 'Please select an opponent'),
  matchType: z.enum(['casual', 'league'], { required_error: 'Please select match type' }),
  format: z.enum(['mens_singles', 'womens_singles', 'mens_doubles', 'womens_doubles', 'mixed_doubles'], {
    required_error: 'Please select format'
  }),
  division: z.enum(['pro', 'open', '35+', '50+', '60+'], { required_error: 'Please select division' }),
  isWin: z.boolean(),
  score: z.string().optional(),
  notes: z.string().optional()
});

type CasualMatchFormData = z.infer<typeof casualMatchSchema>;

interface CasualMatchRecorderProps {
  onSuccess?: (data: any) => void;
  prefilledPlayer?: any;
  onMatchRecorded?: () => void;
}

export function CasualMatchRecorder({ onSuccess, prefilledPlayer, onMatchRecorded }: CasualMatchRecorderProps) {
  const [selectedOpponent, setSelectedOpponent] = useState<{ id: number; name: string } | null>(null);
  const { toast } = useToast();
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  const form = useForm<CasualMatchFormData>({
    resolver: zodResolver(casualMatchSchema),
    defaultValues: {
      matchType: 'casual',
      format: 'mens_singles',
      division: 'open',
      isWin: true,
      score: '',
      notes: ''
    }
  });

  const recordMatchMutation = useMutation({
    mutationFn: async (data: CasualMatchFormData) => {
      const response = await apiRequest('POST', '/api/matches/record-casual', data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: t('match.form.recordedSuccessfully'),
        description: t('match.form.earnedPoints', { points: data.pointsEarned, xp: data.xpAwarded }),
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/pcp-ranking'] });
      queryClient.invalidateQueries({ queryKey: ['/api/match/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/rankings/passport'] });
      
      form.reset();
      setSelectedOpponent(null);
      
      // Call the success callback if provided
      onSuccess?.(data);
      
      onMatchRecorded?.();
    },
    onError: (error: any) => {
      toast({
        title: t('match.form.failedToRecord'),
        description: error.message || t('common.tryAgain'),
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: CasualMatchFormData) => {
    if (!selectedOpponent) {
      toast({
        title: t('match.form.noOpponentSelected'),
        description: t('match.form.selectOpponent'),
        variant: "destructive"
      });
      return;
    }

    recordMatchMutation.mutate({
      ...data,
      opponentId: selectedOpponent.id
    });
  };

  const matchTypeInfo = {
    casual: {
      icon: Users,
      description: "Informal matches with friends or practice partners",
      pointValue: "50% of tournament points",
      color: "blue"
    },
    league: {
      icon: Target,
      description: "Organized league or club matches",
      pointValue: "67% of tournament points",
      color: "green"
    }
  };

  const selectedMatchType = form.watch('matchType');
  const currentInfo = matchTypeInfo[selectedMatchType];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-orange-600" />
          {t('match.form.recordCasualMatch')}
        </CardTitle>
        <CardDescription>
          {t('match.form.recordCasualDescription')}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Opponent Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('match.form.opponent')}</label>
              <PlayerSearchInput
                onPlayerSelected={(player) => {
                  if (player) {
                    setSelectedOpponent({ id: player.id, name: player.displayName || player.username });
                    form.setValue('opponentId', player.id);
                  }
                }}
                placeholder={t('match.form.searchOpponent')}
              />
              {selectedOpponent && (
                <div className="flex items-center gap-2 p-2 bg-orange-50 border border-orange-200 rounded-md">
                  <CheckCircle className="h-4 w-4 text-orange-600" />
                  <span className="text-sm text-orange-800">
                    {t('match.form.playingAgainst')}: <strong>{selectedOpponent.name}</strong>
                  </span>
                </div>
              )}
            </div>

            {/* Match Type Selection with Info */}
            <FormField
              control={form.control}
              name="matchType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('match.form.matchType')}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('match.form.selectResult')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="casual">{t('match.form.casual')}</SelectItem>
                      <SelectItem value="league">{t('match.form.league')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Match Type Information */}
            <Alert className={`border-${currentInfo.color}-200 bg-${currentInfo.color}-50`}>
              <currentInfo.icon className={`h-4 w-4 text-${currentInfo.color}-600`} />
              <AlertDescription className={`text-${currentInfo.color}-800`}>
                <strong>{currentInfo.description}</strong><br/>
                Point Value: {currentInfo.pointValue}
              </AlertDescription>
            </Alert>

            {/* Format and Division */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="format"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('match.form.format')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('match.form.selectFormat')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="mens_singles">{t('match.form.mensSingles')}</SelectItem>
                        <SelectItem value="womens_singles">{t('match.form.womensSingles')}</SelectItem>
                        <SelectItem value="mens_doubles">{t('match.form.mensDoubles')}</SelectItem>
                        <SelectItem value="womens_doubles">{t('match.form.womensDoubles')}</SelectItem>
                        <SelectItem value="mixed_doubles">{t('match.form.mixedDoubles')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="division"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('match.form.division')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('match.form.selectDivision')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pro">{t('match.form.pro')}</SelectItem>
                        <SelectItem value="open">{t('match.form.open')}</SelectItem>
                        <SelectItem value="35+">35+</SelectItem>
                        <SelectItem value="50+">50+</SelectItem>
                        <SelectItem value="60+">60+</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Match Result */}
            <FormField
              control={form.control}
              name="isWin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('match.form.matchResult')}</FormLabel>
                  <Select onValueChange={(value) => field.onChange(value === 'true')} defaultValue={field.value.toString()}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('match.form.selectResult')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="true">{t('match.form.win')}</SelectItem>
                      <SelectItem value="false">{t('match.form.loss')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Score (Optional) */}
            <FormField
              control={form.control}
              name="score"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('match.form.score')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('match.form.scorePlaceholder')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes (Optional) */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('match.form.notes')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('match.form.notesPlaceholder')}
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Anti-Gaming Information */}
            <Alert className="border-amber-200 bg-amber-50">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <strong>Fair Play Policy:</strong> Points are reduced for frequent matches against the same opponent to maintain competitive integrity.
                Full points for first 3 matches, then diminishing returns apply.
              </AlertDescription>
            </Alert>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={recordMatchMutation.isPending || !selectedOpponent}
              className="w-full bg-orange-600 hover:bg-orange-700"
            >
              {recordMatchMutation.isPending ? 'Recording Match...' : 'Record Match'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}