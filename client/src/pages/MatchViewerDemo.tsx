import React from 'react';
import { MatchViewer } from '@/components/match/MatchViewer';

export default function MatchViewerDemo() {
  const demoMatchData = {
    id: 'demo-match-123',
    title: 'Epic Live Demo Match',
    team1: { 
      name: 'Thunder Bolts', 
      score: 18, 
      color: '#22c55e',
      players: ['Alex Chen', 'Sarah Kim']
    },
    team2: { 
      name: 'Fire Hawks', 
      score: 15, 
      color: '#ef4444',
      players: ['Mike Johnson', 'Lisa Zhang']
    },
    isLive: true,
    viewerCount: 2847,
    streamUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&controls=0&modestbranding=1&rel=0',
    momentumState: {
      momentum: 0.35,
      momentumScore: 72,
      streak: { team: 'team1' as const, length: 4 },
      wave: [
        { team: 'team1', intensity: 0.8, timestamp: Date.now() - 5000 },
        { team: 'team1', intensity: 0.6, timestamp: Date.now() - 3000 },
        { team: 'team1', intensity: 0.9, timestamp: Date.now() - 1000 },
      ],
      totalPoints: 33,
      gamePhase: 'late' as const
    }
  };

  return <MatchViewer matchData={demoMatchData} />;
}