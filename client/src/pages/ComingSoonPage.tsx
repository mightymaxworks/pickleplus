import React from 'react';
import { useLocation, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { CalendarDays, Clock, ChevronLeft } from 'lucide-react';

// Launch date in Singapore timezone
const LAUNCH_DATE = new Date('2025-04-12T22:00:00+08:00');

interface FeatureInfo {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export default function ComingSoonPage() {
  const [location] = useLocation();
  
  // Determine which feature we're showing
  const getFeatureInfo = (): FeatureInfo => {
    if (location.includes('/tournaments')) {
      return {
        title: 'Tournaments',
        description: 'Compete in pickleball tournaments, climb the ranks, and showcase your skills against other players. Tournament schedules, registration, and results will be available soon!',
        icon: <span className="material-icons text-5xl text-[#FF5722]">emoji_events</span>
      };
    }
    
    if (location.includes('/achievements')) {
      return {
        title: 'Achievements',
        description: 'Unlock achievements as you play matches, join tournaments, and improve your skills. Track your progress and earn rewards for your pickleball journey!',
        icon: <span className="material-icons text-5xl text-[#FF5722]">military_tech</span>
      };
    }
    
    if (location.includes('/leaderboard')) {
      return {
        title: 'Leaderboard',
        description: 'See how you stack up against other players in the community. Compare stats, track your ranking progress, and aim for the top spot!',
        icon: <span className="material-icons text-5xl text-[#FF5722]">leaderboard</span>
      };
    }
    
    // Default
    return {
      title: 'Coming Soon',
      description: 'This feature is currently under development and will be available soon. Check back later for updates!',
      icon: <span className="material-icons text-5xl text-[#FF5722]">construction</span>
    };
  };
  
  const featureInfo = getFeatureInfo();
  
  // Calculate days until launch
  const calculateTimeRemaining = () => {
    const now = new Date();
    const diffTime = LAUNCH_DATE.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  const daysRemaining = calculateTimeRemaining();
  const formattedLaunchDate = LAUNCH_DATE.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
      <div className="mb-8">{featureInfo.icon}</div>
      
      <h1 className="text-3xl font-bold mb-4">{featureInfo.title} Coming Soon!</h1>
      <p className="text-gray-600 mb-8 max-w-md">{featureInfo.description}</p>
      
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-8 flex items-center">
        <CalendarDays className="text-[#FF5722] mr-3" />
        <div className="text-left">
          <p className="font-medium">Expected Launch Date</p>
          <p className="text-gray-600">{formattedLaunchDate}</p>
        </div>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 flex items-center">
        <Clock className="text-[#2196F3] mr-3" />
        <div className="text-left">
          <p className="font-medium">{daysRemaining} Days Remaining</p>
          <p className="text-gray-600">We're working hard to bring this to you!</p>
        </div>
      </div>
      
      <div className="flex flex-col space-y-3">
        <Link href="/dashboard">
          <Button className="flex items-center">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
        
        {/* Could add email signup here in the future */}
      </div>
    </div>
  );
}