/**
 * Communities Page - Player Connection Hub
 * Placeholder page with translation support for community features
 */

import React from 'react';
import { StandardLayout } from '@/components/layout/StandardLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, MapPin, Calendar, Trophy } from 'lucide-react';

export default function Communities() {
  const { t } = useLanguage();

  return (
    <StandardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">{t('comingSoon.playerDiscovery')}</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('comingSoon.playerDescription')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                {t('nav.findPlayers')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Connect with players in your area based on skill level and availability.
              </p>
              <Button variant="outline" disabled>
                {t('comingSoon.feature')}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Local Groups
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Join local pickleball groups and community events.
              </p>
              <Button variant="outline" disabled>
                {t('comingSoon.feature')}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Community Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Discover and participate in community-organized events.
              </p>
              <Button variant="outline" disabled>
                {t('comingSoon.feature')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </StandardLayout>
  );
}