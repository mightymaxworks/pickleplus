/**
 * PKL-278651-BOUNCE-0006-AWARE - Bounce Awareness Enhancement
 * 
 * BounceStatusTicker - A futuristic ticker component that displays real-time
 * information about Bounce testing activities, metrics, and forecasts.
 * 
 * @version 1.0.0
 * @framework Framework5.2
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Info, Activity, Clock, AlertCircle } from 'lucide-react';
import { useLocation } from 'wouter';
import { 
  bounceStatusService, 
  type TestingArea,
  type TestingMetrics,
  type WeatherForecast,
  type CommunityImpact
} from '@/lib/services/bounceStatusService';
import { useBounceAwareness } from '@/hooks/use-bounce-awareness';

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
  const [testingAreas, setTestingAreas] = useState<TestingArea[]>([]);
  const [metrics, setMetrics] = useState<TestingMetrics | null>(null);
  const [forecast, setForecast] = useState<WeatherForecast | null>(null);
  const [impact, setImpact] = useState<CommunityImpact | null>(null);
  const [, setLocation] = useLocation();
  const { joinTesting } = useBounceAwareness();
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        const [areasData, metricsData, forecastData, impactData] = await Promise.all([
          bounceStatusService.getCurrentTestingAreas(),
          bounceStatusService.getTestingMetrics(),
          bounceStatusService.getWeatherForecast(),
          bounceStatusService.getCommunityImpact()
        ]);
        
        setTestingAreas(areasData);
        setMetrics(metricsData);
        setForecast(forecastData);
        setImpact(impactData);
      } catch (error) {
        console.error('Error loading bounce status:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
    
    // Refresh data every 5 minutes
    const intervalId = setInterval(loadData, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Format testing areas as a readable list
  const formatTestingAreas = (areas: TestingArea[]): string => {
    return areas.map(area => area.name).join(' • ');
  };
  
  // Format next areas from forecast
  const formatNextAreas = (forecast: WeatherForecast | null): string => {
    if (!forecast) return 'No forecast available';
    return forecast.nextAreas.map(area => area.name).join(' • ');
  };
  
  if (isLoading) {
    return (
      <div className={`relative overflow-hidden bg-gradient-to-r from-gray-900/90 to-gray-800/90 dark:from-gray-900 dark:to-black rounded-md shadow-md border border-gray-700/30 dark:border-gray-700/50 ${className}`}>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-blue-500"></div>
        <div className="flex items-center justify-center px-4 py-3">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-gray-700 h-8 w-8"></div>
            <div className="flex-1 space-y-2 py-1">
              <div className="h-2 bg-gray-700 rounded w-3/4"></div>
              <div className="h-2 bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Compact view for smaller devices
  if (compact) {
    return (
      <div className={`relative overflow-hidden bg-gradient-to-r from-gray-900/90 to-gray-800/90 dark:from-gray-900 dark:to-black rounded-md shadow-md border border-gray-700/30 dark:border-gray-700/50 ${className}`}>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-blue-500"></div>
        <div className="flex items-center px-3 py-2">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
            <div className="text-xs text-cyan-400 font-mono">LIVE</div>
          </div>
          <div className="ml-2 text-white text-xs truncate">
            {metrics ? `${metrics.successRate}% success rate` : 'Bounce active'}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`relative overflow-hidden bg-gradient-to-r from-gray-900/90 to-gray-800/90 dark:from-gray-900 dark:to-black rounded-md shadow-md border border-gray-700/30 dark:border-gray-700/50 ${className}`}>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-blue-500"></div>
      <div className="absolute top-1 right-2 flex items-center gap-1 z-10">
        <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
        <div className="text-xs text-cyan-400 font-mono">LIVE</div>
      </div>
      <div className="flex items-center px-4 py-3">
        <div className="mr-3 bg-gradient-to-r from-cyan-500 to-blue-500 p-1.5 rounded-full text-white">
          <Activity size={16} />
        </div>
        <div className="relative overflow-hidden flex-1">
          {/* For smooth animation, we use CSS animation on this div */}
          <div className="whitespace-nowrap flex items-center gap-8 animate-marquee">
            <div className="ticker-item">
              <span className="text-cyan-400 font-medium mr-2">Bounce Testing:</span>
              <span className="text-white text-sm">
                {metrics ? `${metrics.successRate}% of users experienced error-free matches this week` : 'Testing in progress'}
              </span>
            </div>
            <div className="ticker-item">
              <span className="text-cyan-400 font-medium mr-2">Currently Testing:</span>
              <span className="text-white text-sm">
                {testingAreas.length > 0 ? formatTestingAreas(testingAreas) : 'No active tests'}
              </span>
            </div>
            <div className="ticker-item">
              <span className="text-cyan-400 font-medium mr-2">Community Impact:</span>
              <span className="text-white text-sm">
                {metrics ? `Bounce testers have found ${metrics.issuesFound} issues this month` : 'Calculating impact...'}
              </span>
            </div>
            <div className="ticker-item">
              <span className="text-cyan-400 font-medium mr-2">Weather Report:</span>
              <span className="text-white text-sm">
                {forecast ? `Next focus areas: ${formatNextAreas(forecast)}` : 'Generating forecast...'}
              </span>
            </div>
          </div>
        </div>
        <div className="hidden md:flex items-center ml-3 pl-3 border-l border-gray-700/30">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
            <Info size={14} className="text-white" />
          </div>
          <button 
            onClick={() => {
              // PKL-278651-GAMF-0007-JOIN - Add friendly message for non-admin users
              const isAdmin = window.localStorage.getItem('user_role') === 'admin';
              if (isAdmin) {
                joinTesting();
                setLocation('/admin/bounce');
              } else {
                // Show friendly message for non-admin users
                const { toast } = require('@/hooks/use-toast');
                toast({
                  title: "Coming Soon!",
                  description: "We will be welcoming testers to earn XP very soon!",
                  variant: "default",
                  duration: 5000,
                });
              }
            }}
            className="ml-2 text-xs text-white bg-blue-600 hover:bg-blue-700 transition-colors px-2 py-1 rounded"
          >
            Join Testing
          </button>
        </div>
      </div>
    </div>
  );
};