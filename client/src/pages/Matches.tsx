/**
 * Matches Page - Match Recording and History Hub
 * Page with translation support for match management features
 */

import React, { useState } from 'react';
import { StandardLayout } from '@/components/layout/StandardLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, Trophy, Clock, Target, Plus } from 'lucide-react';
import { QuickMatchRecorder } from '@/components/match/QuickMatchRecorder';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

export default function Matches() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [matchDialogOpen, setMatchDialogOpen] = useState(false);

  const handleMatchRecorded = () => {
    setMatchDialogOpen(false);
    toast({
      title: "Match Recorded",
      description: "Your match has been successfully recorded",
    });
  };

  const handleRecordMatch = () => {
    setMatchDialogOpen(true);
  };

  const handleViewHistory = () => {
    navigate('/match-history');
  };

  const handleViewStats = () => {
    navigate('/dashboard');
  };

  return (
    <StandardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">{t('nav.matches')}</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Track your performance and view detailed match analytics
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                {t('match.record')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Record a new match and update your statistics.
              </p>
              <Button className="w-full" onClick={handleRecordMatch}>
                {t('match.record')}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                {t('match.date')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                View your complete match history and performance trends.
              </p>
              <Button variant="outline" onClick={handleViewHistory}>
                {t('action.view')} {t('training.history')}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                {t('stats.winRate')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Analyze your performance with detailed statistics.
              </p>
              <Button variant="outline" onClick={handleViewStats}>
                {t('action.view')} {t('profile.statistics')}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="h-5 w-5 mr-2" />
                Recent {t('nav.matches')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {t('stats.loading')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Match Recording Dialog */}
        <Dialog open={matchDialogOpen} onOpenChange={setMatchDialogOpen}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Record Match Results</DialogTitle>
            </DialogHeader>
            <QuickMatchRecorder onSuccess={handleMatchRecorded} />
          </DialogContent>
        </Dialog>
      </div>
    </StandardLayout>
  );
}