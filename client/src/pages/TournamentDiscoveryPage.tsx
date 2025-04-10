/**
 * PKL-278651-GAME-0003-DISC
 * Tournament Discovery Page Wrapper
 * 
 * This component wraps the tournament discovery components with the necessary
 * context providers, making it ready for use in the routing system.
 */

import React from 'react';
import { TournamentDiscoveryProvider } from '@/core/modules/gamification/tournament/context/TournamentDiscoveryContext';
import TournamentDiscovery from '@/core/modules/gamification/tournament/components/TournamentDiscoveryPage';
import { Toaster } from '@/components/ui/toaster';
import { AppHeader } from '@/components/layout/AppHeader';

/**
 * Tournament Discovery Page Wrapper
 * 
 * Provides the necessary context and layout elements for the tournament discovery page.
 */
const TournamentDiscoveryPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      <TournamentDiscoveryProvider>
        <TournamentDiscovery />
      </TournamentDiscoveryProvider>
      <Toaster />
    </div>
  );
};

export default TournamentDiscoveryPage;