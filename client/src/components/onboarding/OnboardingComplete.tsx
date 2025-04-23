/**
 * PKL-278651-COURTIQ-0002-GUIDANCE
 * Onboarding Complete Component
 * 
 * This component provides a comprehensive completion screen after
 * the onboarding process, highlighting accomplishments and offering
 * next-step guidance.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { 
  CheckCircle, 
  Award, 
  BarChart3, 
  Users, 
  Calendar,
  TrendingUp,
  ChevronRight
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface Feature {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  category: 'core' | 'social' | 'performance' | 'events';
}

interface OnboardingCompleteProps {
  xpEarned: number;
  className?: string;
}

const OnboardingComplete: React.FC<OnboardingCompleteProps> = ({ 
  xpEarned,
  className = ''
}) => {
  const [, setLocation] = useLocation();

  // Features unlocked after onboarding
  const features: Feature[] = [
    {
      title: 'CourtIQ™ Dashboard',
      description: 'View your multi-dimensional rating metrics and performance insights',
      icon: <BarChart3 className="h-5 w-5 text-blue-500" />,
      path: '/dashboard',
      category: 'core'
    },
    {
      title: 'Match Recording',
      description: 'Record your games and track your progress over time',
      icon: <TrendingUp className="h-5 w-5 text-green-500" />,
      path: '/match/record',
      category: 'performance'
    },
    {
      title: 'Community Hub',
      description: 'Connect with other players, join groups and discussions',
      icon: <Users className="h-5 w-5 text-violet-500" />,
      path: '/communities',
      category: 'social'
    },
    {
      title: 'Tournament Calendar',
      description: 'Discover and register for upcoming tournaments',
      icon: <Calendar className="h-5 w-5 text-amber-500" />,
      path: '/tournaments',
      category: 'events'
    }
  ];

  // Handle navigation to a specific feature
  const navigateTo = (path: string) => {
    setLocation(path);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
  };

  return (
    <Card className={`w-full max-w-2xl shadow-lg overflow-hidden ${className}`}>
      {/* Confetti-style header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/confetti-pattern.svg')] opacity-20"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="h-7 w-7" />
            <h2 className="text-2xl font-bold">Onboarding Complete!</h2>
          </div>
          <p className="text-blue-100">
            Congratulations on completing your CourtIQ™ profile setup!
          </p>
          <div className="mt-4 flex items-center gap-2 bg-white/20 rounded-lg p-3 backdrop-blur-sm">
            <Award className="h-10 w-10 text-yellow-300" />
            <div>
              <div className="text-xl font-bold">{xpEarned} XP earned</div>
              <div className="text-sm text-blue-100">You've made great progress on your Pickle+ journey</div>
            </div>
          </div>
        </div>
      </div>

      <CardHeader className="pb-2">
        <CardTitle>You've unlocked these features</CardTitle>
      </CardHeader>
      
      <CardContent className="pb-0">
        <motion.div 
          className="grid gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {features.map((feature, index) => (
            <motion.div key={index} variants={itemVariants}>
              <div className="group cursor-pointer" onClick={() => navigateTo(feature.path)}>
                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="mt-0.5">{feature.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium group-hover:text-blue-600 transition-colors">{feature.title}</h3>
                      <Badge variant="outline" className="text-xs">
                        {feature.category === 'core' && 'Core Feature'}
                        {feature.category === 'social' && 'Social'}
                        {feature.category === 'performance' && 'Performance'}
                        {feature.category === 'events' && 'Events'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-blue-600 transition-colors" />
                </div>
              </div>
              {index < features.length - 1 && <Separator className="my-1" />}
            </motion.div>
          ))}
        </motion.div>
      </CardContent>
      
      <CardFooter className="flex justify-between pt-6">
        <Button variant="outline" onClick={() => navigateTo('/profile')}>
          View Profile
        </Button>
        <Button onClick={() => navigateTo('/dashboard')}>
          Go to Dashboard
        </Button>
      </CardFooter>
    </Card>
  );
};

export default OnboardingComplete;