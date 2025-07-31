/**
 * PKL-278651-BOUNCE-0006-AWARE - Bounce Awareness Enhancement
 * 
 * BounceTestMobilePage - A mobile-optimized page for Bounce testing with
 * collapsible sections, lazy loading, and gesture controls.
 * 
 * @version 1.0.0
 * @framework Framework5.2
 */

import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { 
  Smartphone, 
  Bug, 
  ChevronsUp, 
  BarChart3, 
  Medal, 
  Info,
  Upload,
  Send
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useBounceAwareness } from '@/hooks/use-bounce-awareness';
import { BounceCollapsibleSection } from '@/components/bounce/BounceCollapsibleSection';
import { BounceStatusTicker } from '@/components/bounce/BounceStatusTicker';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';

// Import possible attached assets (placeholder images)
import placeholderImg from '@assets/Pickle (12).png';

// Types for our lazy loading items
interface TestingArea {
  id: string;
  name: string;
  description: string;
  issuesFound: number;
  completionPercentage: number;
}

// Extended type for the bounce hook
interface BounceFindings {
  description: string;
  evidence?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  area: string;
}

export default function BounceTestMobilePage() {
  const [, setLocation] = useLocation();
  const { isActive, testingSince, currentAreas, completedTests, joinTesting } = useBounceAwareness();
  
  // State for image capture
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  
  // Refs for gesture detection
  const mainContainerRef = useRef<HTMLDivElement>(null);

  // Lazy loading state
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [testingAreas, setTestingAreas] = useState<TestingArea[]>([]);
  const loadingRef = useRef<HTMLDivElement>(null);

  // Handle lazy loading
  useEffect(() => {
    // Setup Intersection Observer for infinite scroll
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading) {
          loadMoreAreas();
        }
      },
      { threshold: 0.1 }
    );

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    return () => {
      if (loadingRef.current) {
        observer.unobserve(loadingRef.current);
      }
    };
  }, [isLoading]);

  // Simulate loading more testing areas
  const loadMoreAreas = () => {
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const newAreas: TestingArea[] = [
        {
          id: "area-" + (page * 3 + 1),
          name: "Testing Area " + (page * 3 + 1),
          description: 'Test this area for potential issues with user interactions',
          issuesFound: Math.floor(Math.random() * 10),
          completionPercentage: Math.floor(Math.random() * 100)
        },
        {
          id: "area-" + (page * 3 + 2),
          name: "Testing Area " + (page * 3 + 2),
          description: 'Verify data is correctly displayed and updated',
          issuesFound: Math.floor(Math.random() * 10),
          completionPercentage: Math.floor(Math.random() * 100)
        },
        {
          id: "area-" + (page * 3 + 3),
          name: "Testing Area " + (page * 3 + 3),
          description: 'Look for visual or layout issues on different screen sizes',
          issuesFound: Math.floor(Math.random() * 10),
          completionPercentage: Math.floor(Math.random() * 100)
        }
      ];
      
      setTestingAreas((prev) => [...prev, ...newAreas]);
      setPage((prev) => prev + 1);
      setIsLoading(false);
    }, 1000);
  };

  // Load initial testing areas
  useEffect(() => {
    if (testingAreas.length === 0) {
      loadMoreAreas();
    }
  }, []);

  // Simulate capturing a screenshot
  const captureScreenshot = () => {
    // In a real implementation, we would use a library to capture the screen
    // For now, we'll simulate by using a placeholder image
    setScreenshot(placeholderImg);
  };

  // Handle submission of a finding
  const handleSubmitFinding = () => {
    if (notes.trim() === '') {
      alert('Please add notes to describe the issue');
      return;
    }

    // In a real implementation, this would call the submitFinding function
    // from the useBounceAwareness hook
    alert(`Finding submitted: ${notes}`);

    // Reset form
    setNotes('');
    setScreenshot(null);
  };

  // Swipe handling
  const handleTouchStart = (e: React.TouchEvent) => {
    // Implementation would go here for gesture controls
  };

  return (
    <div 
      ref={mainContainerRef}
      className="container max-w-md mx-auto px-4 py-6"
      onTouchStart={handleTouchStart}
    >
      <header className="mb-6">
        <h1 className="text-2xl font-bold mb-2 flex items-center">
          <Smartphone className="mr-2" /> Bounce Mobile Testing
        </h1>
        <BounceStatusTicker compact className="mb-4" />
        
        {!isActive && (
          <Button 
            className="w-full py-6 text-lg font-medium"
            onClick={() => joinTesting()}
          >
            Start Testing Session
          </Button>
        )}
      </header>
      
      {isActive && (
        <div className="space-y-6">
          <Card className="p-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium text-green-800 dark:text-green-300">
                  Testing Active
                </h2>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Started: {testingSince?.toLocaleTimeString()}
                </p>
              </div>
              <div className="bg-green-100 dark:bg-green-800 p-2 rounded-full">
                <Bug className="h-6 w-6 text-green-500 dark:text-green-300" />
              </div>
            </div>
          </Card>
          
          <BounceCollapsibleSection 
            title="Report an Issue" 
            defaultOpen={true}
            className="border-blue-200 dark:border-blue-900"
            titleClassName="bg-blue-50 dark:bg-blue-900/20"
          >
            <div className="space-y-4">
              <div>
                <label htmlFor="notes" className="block text-sm font-medium mb-1">
                  Describe the issue
                </label>
                <textarea 
                  id="notes"
                  className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md"
                  rows={4}
                  placeholder="What went wrong? Be as specific as possible..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={captureScreenshot}
                  className="flex items-center"
                >
                  <Upload className="mr-1 h-4 w-4" />
                  {screenshot ? 'Change Image' : 'Add Screenshot'}
                </Button>
                
                <Button 
                  size="sm"
                  onClick={handleSubmitFinding}
                  className="flex items-center"
                >
                  <Send className="mr-1 h-4 w-4" />
                  Submit
                </Button>
              </div>
              
              {screenshot && (
                <div className="mt-2 relative">
                  <img 
                    src={screenshot} 
                    alt="Captured screenshot" 
                    className="w-full rounded-md border border-gray-300 dark:border-gray-700" 
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => setScreenshot(null)}
                  >
                    Remove
                  </Button>
                </div>
              )}
            </div>
          </BounceCollapsibleSection>
          
          <BounceCollapsibleSection 
            title="Testing Areas"
            className="border-purple-200 dark:border-purple-900"
            titleClassName="bg-purple-50 dark:bg-purple-900/20"
          >
            <div className="space-y-4">
              {testingAreas.map((area) => (
                <div 
                  key={area.id} 
                  className="p-3 border border-gray-200 dark:border-gray-800 rounded-md"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">{area.name}</h3>
                    <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300 px-2 py-1 rounded-full">
                      {area.issuesFound} issues
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{area.description}</p>
                  <div className="flex items-center">
                    <Progress value={area.completionPercentage} className="flex-1 mr-2" />
                    <span className="text-xs">{area.completionPercentage}%</span>
                  </div>
                </div>
              ))}
              
              <div 
                ref={loadingRef} 
                className="py-4 text-center text-gray-500 dark:text-gray-400"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                ) : (
                  'Pull up to load more areas'
                )}
              </div>
            </div>
          </BounceCollapsibleSection>
          
          <BounceCollapsibleSection 
            title="Your Stats"
            className="border-amber-200 dark:border-amber-900"
            titleClassName="bg-amber-50 dark:bg-amber-900/20"
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-md text-center">
                  <div className="mb-1 flex justify-center">
                    <Bug className="h-5 w-5 text-amber-500" />
                  </div>
                  <p className="text-xs text-amber-800 dark:text-amber-300">Issues Found</p>
                  <p className="text-xl font-bold text-amber-900 dark:text-amber-200">12</p>
                </div>
                
                <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-md text-center">
                  <div className="mb-1 flex justify-center">
                    <ChevronsUp className="h-5 w-5 text-amber-500" />
                  </div>
                  <p className="text-xs text-amber-800 dark:text-amber-300">XP Earned</p>
                  <p className="text-xl font-bold text-amber-900 dark:text-amber-200">450</p>
                </div>
                
                <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-md text-center">
                  <div className="mb-1 flex justify-center">
                    <BarChart3 className="h-5 w-5 text-amber-500" />
                  </div>
                  <p className="text-xs text-amber-800 dark:text-amber-300">Tests Run</p>
                  <p className="text-xl font-bold text-amber-900 dark:text-amber-200">{completedTests}</p>
                </div>
                
                <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-md text-center">
                  <div className="mb-1 flex justify-center">
                    <Medal className="h-5 w-5 text-amber-500" />
                  </div>
                  <p className="text-xs text-amber-800 dark:text-amber-300">Rank</p>
                  <p className="text-xl font-bold text-amber-900 dark:text-amber-200">3rd</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
                <div className="flex items-center">
                  <Avatar>
                    <div className="bg-blue-500 w-full h-full flex items-center justify-center text-white font-medium">
                      JS
                    </div>
                  </Avatar>
                  <div className="ml-3">
                    <p className="font-medium">Tester Level</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Bounce Explorer</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">14</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Next level at 600 XP</p>
                </div>
              </div>
            </div>
          </BounceCollapsibleSection>
          
          <BounceCollapsibleSection 
            title="Help & Tips"
            className="border-teal-200 dark:border-teal-900"
            titleClassName="bg-teal-50 dark:bg-teal-900/20"
          >
            <div className="space-y-4">
              <div className="flex">
                <div className="mr-3 mt-1">
                  <Info className="h-5 w-5 text-teal-500" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">Focus on real-world scenarios</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Test like a real user would use the app. Try common workflows and edge cases.
                  </p>
                </div>
              </div>
              
              <div className="flex">
                <div className="mr-3 mt-1">
                  <Info className="h-5 w-5 text-teal-500" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">Be specific in your reports</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Include steps to reproduce, expected behavior, and what actually happened.
                  </p>
                </div>
              </div>
              
              <div className="flex">
                <div className="mr-3 mt-1">
                  <Info className="h-5 w-5 text-teal-500" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">Test on different devices</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    If possible, try the app on different devices and orientations.
                  </p>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.open('/docs/bounce-testing-guide', '_blank')}
              >
                View Full Testing Guide
              </Button>
            </div>
          </BounceCollapsibleSection>
        </div>
      )}
      
      <footer className="mt-8 text-center text-gray-500 dark:text-gray-400 text-xs">
        <p>Bounce Testing System v1.0.0</p>
        <button 
          className="mt-2 text-blue-500 dark:text-blue-400"
          onClick={() => setLocation('/dashboard')}
        >
          Return to Dashboard
        </button>
      </footer>
    </div>
  );
}