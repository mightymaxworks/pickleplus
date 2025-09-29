import React from 'react';
import { MatchCreationWizard } from '@/components/match/MatchCreationWizard';
import { useLocation } from 'wouter';

interface MatchCreationData {
  format: 'singles' | 'doubles';
  selectedPlayers: any[];
  pairings?: { team1: any[]; team2: any[] };
  matchStatus: {
    competitiveBalance: number;
    genderBonus: number;
    description: string;
  };
  teamIdentity?: {
    team1: {
      name: string;
      color: string;
      members: string[];
    };
    team2: {
      name: string;
      color: string;
      members: string[];
    };
  };
}

export default function MatchCreatePage() {
  const [, setLocation] = useLocation();

  const handleMatchCreated = (data: MatchCreationData) => {
    console.log('Match created with data:', data);
    
    // Generate match ID and persist data
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 10);
    const matchId = `match_${timestamp}_${random}`;
    
    try {
      sessionStorage.setItem(`match:${matchId}`, JSON.stringify(data));
      console.log('Persisted match data to sessionStorage with ID:', matchId);
    } catch (error) {
      console.error('Failed to persist match data:', error);
    }
    
    // Navigate to recording phase
    setLocation(`/match/record/${matchId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <MatchCreationWizard onMatchCreated={handleMatchCreated} />
      </div>
    </div>
  );
}