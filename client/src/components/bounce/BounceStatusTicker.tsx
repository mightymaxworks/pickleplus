/**
 * PKL-278651-MATCH-0007-TICKER - Latest Match Updates Ticker
 * 
 * StatusTicker - A modern ticker component that displays real-time information
 * about recent matches, system updates, and community activity.
 * 
 * @version 1.0.0
 * @framework Framework5.3
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Activity, Calendar, Bell, Info } from 'lucide-react';
import { useLocation } from 'wouter';
import { format } from 'date-fns';
import { 
  bounceStatusService, 
  type RecentMatch,
  type SystemUpdate,
  type CommunityStats,
  type UpcomingEvents
} from '@/lib/services/bounceStatusService';

// Import CSS for ticker animations and styles
import './bounce-status-ticker.css';

interface BounceStatusTickerProps {
  className?: string;
  compact?: boolean;
}

export const BounceStatusTicker = ({ 
  className = '',
  compact = false
}: BounceStatusTickerProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [recentMatches, setRecentMatches] = useState<RecentMatch[]>([]);
  const [systemUpdates, setSystemUpdates] = useState<SystemUpdate[]>([]);
  const [communityStats, setCommunityStats] = useState<CommunityStats | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvents | null>(null);
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        const [matchesData, updatesData, statsData, eventsData] = await Promise.all([
          bounceStatusService.getRecentMatches(),
          bounceStatusService.getSystemUpdates(),
          bounceStatusService.getCommunityStats(),
          bounceStatusService.getUpcomingEvents()
        ]);
        
        setRecentMatches(matchesData);
        setSystemUpdates(updatesData);
        setCommunityStats(statsData);
        setUpcomingEvents(eventsData);
      } catch (error) {
        console.error('Error loading status data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
    
    // Refresh data every 5 minutes
    const intervalId = setInterval(loadData, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Format a match result as a readable string
  const formatMatchResult = (match: RecentMatch): string => {
    const winner = match.players.find(p => p.isWinner);
    const loser = match.players.find(p => !p.isWinner);
    
    if (winner && loser) {
      return `${winner.displayName} def. ${loser.displayName} ${winner.score}-${loser.score}`;
    }
    
    return match.players.map(p => `${p.displayName}: ${p.score}`).join(' vs ');
  };
  
  // Format an upcoming event
  const formatUpcomingEvent = (event: {name: string, date: string, location: string}): string => {
    const eventDate = new Date(event.date);
    return `${event.name} on ${format(eventDate, 'MMM d')} at ${event.location}`;
  };
  
  if (isLoading) {
    return (
      <div className={`relative overflow-hidden bg-gradient-to-r from-green-900/90 to-green-800/90 dark:from-green-900 dark:to-black rounded-md shadow-md border border-green-700/30 dark:border-green-700/50 ${className}`}>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-lime-500 to-green-600"></div>
        <div className="flex items-center justify-center px-4 py-3">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-green-700 h-8 w-8"></div>
            <div className="flex-1 space-y-2 py-1">
              <div className="h-2 bg-green-700 rounded w-3/4"></div>
              <div className="h-2 bg-green-700 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Compact view for smaller devices
  if (compact) {
    return (
      <div className={`relative overflow-hidden bg-gradient-to-r from-green-900/90 to-green-800/90 dark:from-green-900 dark:to-black rounded-md shadow-md border border-green-700/30 dark:border-green-700/50 ${className}`}>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-lime-500 to-green-600"></div>
        <div className="flex items-center px-3 py-2">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-lime-500 animate-pulse"></div>
            <div className="text-xs text-lime-400 font-mono">LIVE</div>
          </div>
          <div className="ml-2 text-white text-xs truncate">
            {communityStats ? `${communityStats.matchesPlayed} matches played` : 'Pickle+ active'}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`relative overflow-hidden bg-gradient-to-r from-green-900/90 to-green-800/90 dark:from-green-900 dark:to-black rounded-md shadow-md border border-green-700/30 dark:border-green-700/50 ${className}`}>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-lime-500 to-green-600"></div>
      <div className="absolute top-1 right-2 flex items-center gap-1 z-10">
        <div className="w-2 h-2 rounded-full bg-lime-500 animate-pulse"></div>
        <div className="text-xs text-lime-400 font-mono">LIVE</div>
      </div>
      <div className="flex items-center px-4 py-3">
        <div className="mr-3 bg-gradient-to-r from-lime-500 to-green-600 p-1.5 rounded-full text-white">
          <Trophy size={16} />
        </div>
        <div className="relative overflow-hidden flex-1">
          {/* For smooth animation, we use CSS animation on this div */}
          <div className="whitespace-nowrap flex items-center gap-8 animate-marquee">
            {recentMatches.length > 0 && recentMatches.map((match, index) => (
              <div key={`match-${match.id || index}`} className="ticker-item">
                <span className="text-lime-400 font-medium mr-2">Recent Match:</span>
                <span className="text-white text-sm">
                  {formatMatchResult(match)} {match.location ? `at ${match.location}` : ''}
                </span>
              </div>
            ))}
            
            {systemUpdates.map((update, index) => (
              <div key={`update-${update.id || index}`} className="ticker-item">
                <span className="text-lime-400 font-medium mr-2">
                  {update.category === 'feature' ? 'New Feature:' : 
                   update.category === 'improvement' ? 'Improvement:' : 
                   update.category === 'event' ? 'Event:' : 'Update:'}
                </span>
                <span className="text-white text-sm">
                  {update.message}
                </span>
              </div>
            ))}
            
            {communityStats && (
              <div className="ticker-item">
                <span className="text-lime-400 font-medium mr-2">Community:</span>
                <span className="text-white text-sm">
                  {communityStats.matchesPlayed} matches played across {communityStats.activeTournaments} active tournaments
                </span>
              </div>
            )}
            
            {communityStats?.userMilestone && (
              <div className="ticker-item">
                <span className="text-lime-400 font-medium mr-2">Milestone:</span>
                <span className="text-white text-sm">
                  {communityStats.userMilestone}
                </span>
              </div>
            )}
            
            {upcomingEvents?.nextEvents && upcomingEvents.nextEvents.map((event, index) => (
              <div key={`event-${event.id || index}`} className="ticker-item">
                <span className="text-lime-400 font-medium mr-2">Upcoming:</span>
                <span className="text-white text-sm">
                  {formatUpcomingEvent(event)}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="hidden md:flex items-center ml-3 pl-3 border-l border-green-700/30">
          <button 
            onClick={() => {
              setLocation('/tournaments');
            }}
            className="ml-2 text-xs text-white bg-green-600 hover:bg-green-700 transition-colors px-2 py-1 rounded flex items-center"
          >
            <Calendar size={12} className="mr-1" />
            View Events
          </button>
        </div>
      </div>
    </div>
  );
};