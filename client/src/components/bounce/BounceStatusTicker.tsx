/**
 * PKL-278651-COMM-0007 - Enhanced Referral System & Community Ticker
 * 
 * Simplified BounceStatusTicker - A scrolling ticker that shows pickleball tips
 * and community activity.
 * 
 * @version 1.0.0
 * @framework Framework5.3
 */

import { useState, useEffect } from 'react';
import { Lightbulb, UserPlus } from 'lucide-react';
import { useLocation } from 'wouter';
import { formatDistanceToNow } from 'date-fns';
import './bounce-status-ticker.css';

interface BounceStatusTickerProps {
  className?: string;
  compact?: boolean;
}

// Type definitions
interface PickleballTip {
  id: number;
  tipContent: string;
  source?: string;
}

interface CommunityActivity {
  type: 'join' | 'achievement';
  username: string;
  displayName?: string;
  timestamp: string;
  achievementName?: string;
}

export const BounceStatusTicker = ({ 
  className = '',
  compact = false
}: BounceStatusTickerProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [tickerText, setTickerText] = useState('');
  const [, setLocation] = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch tips
        const tipsResponse = await fetch('/api/referrals/tips');
        const tipsData = tipsResponse.ok ? await tipsResponse.json() : { tips: [] };
        
        // Fetch activity
        const activityResponse = await fetch('/api/referrals/activity');
        const activityData = activityResponse.ok ? await activityResponse.json() : { activity: [] };
        
        // Format the ticker text
        let text = '';
        
        // Add tips
        if (tipsData.tips && tipsData.tips.length > 0) {
          tipsData.tips.forEach((tip: PickleballTip) => {
            text += `${tip.tipContent} • `;
          });
        } else {
          // Fallback tip
          text += 'Keep your paddle up and ready between shots for quicker reactions • ';
        }
        
        // Add activity
        if (activityData.activity && activityData.activity.length > 0) {
          activityData.activity.forEach((activity: CommunityActivity) => {
            if (activity.type === 'join') {
              text += `${activity.displayName || activity.username} joined Pickle+ • `;
            } else if (activity.type === 'achievement') {
              text += `${activity.displayName || activity.username} earned "${activity.achievementName}" • `;
            }
          });
        }
        
        setTickerText(text);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching ticker data:', error);
        // Fallback text
        setTickerText('Keep your paddle up and ready between shots for quicker reactions • Practice dinking to improve your soft game at the kitchen line • ');
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className={`relative overflow-hidden bg-gradient-to-r from-green-900/90 to-green-800/90 rounded-md shadow-md border border-green-700/30 ${className}`}>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-lime-500 to-green-600"></div>
        <div className="flex items-center p-3">
          <div className="animate-pulse h-4 w-3/4 bg-green-700 rounded"></div>
        </div>
      </div>
    );
  }

  // Simple version for compact view
  if (compact) {
    return (
      <div className={`relative overflow-hidden bg-gradient-to-r from-green-900/90 to-green-800/90 rounded-md shadow-md border border-green-700/30 ${className}`}>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-lime-500 to-green-600"></div>
        <div className="flex items-center p-2">
          <div className="w-2 h-2 rounded-full bg-lime-500 animate-pulse"></div>
          <div className="ticker-container ml-2 text-white text-xs">
            <div className="ticker-content">{tickerText}</div>
          </div>
        </div>
      </div>
    );
  }

  // Standard view
  return (
    <div className={`relative overflow-hidden bg-gradient-to-r from-green-900/90 to-green-800/90 rounded-md shadow-md border border-green-700/30 ${className}`}>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-lime-500 to-green-600"></div>
      <div className="absolute top-1 right-2 flex items-center gap-1 z-10">
        <div className="w-2 h-2 rounded-full bg-lime-500 animate-pulse"></div>
        <div className="text-xs text-lime-400 font-mono">LIVE</div>
      </div>
      <div className="flex items-center px-4 py-3">
        <div className="mr-3 bg-gradient-to-r from-lime-500 to-green-600 p-1.5 rounded-full text-white">
          <Lightbulb size={16} />
        </div>
        <div className="ticker-container flex-1 h-6">
          <div className="ticker-content text-white text-sm">{tickerText}</div>
        </div>
        <div className="hidden md:flex items-center ml-3 pl-3 border-l border-green-700/30">
          <button 
            onClick={() => setLocation('/refer')}
            className="ml-2 text-xs text-white bg-green-600 hover:bg-green-700 transition-colors px-2 py-1 rounded flex items-center"
          >
            <UserPlus size={12} className="mr-1" />
            Refer Friends
          </button>
        </div>
      </div>
    </div>
  );
};

export default BounceStatusTicker;