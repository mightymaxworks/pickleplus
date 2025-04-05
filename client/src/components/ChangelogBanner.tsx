import React, { useState, useEffect } from 'react';
import { X, ChevronRight } from 'lucide-react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { motion, AnimatePresence } from 'framer-motion';

// Version number to identify this changelog
const CURRENT_VERSION = '1.2';
const CHANGELOG_SEEN_KEY = 'pickle_plus_changelog_seen';

export function ChangelogBanner() {
  const [isOpen, setIsOpen] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  
  useEffect(() => {
    // Check if user has seen this version's changelog
    const seenVersions = localStorage.getItem(CHANGELOG_SEEN_KEY);
    const hasSeenCurrentVersion = seenVersions ? 
      seenVersions.split(',').includes(CURRENT_VERSION) : false;
    
    if (!hasSeenCurrentVersion) {
      setShowBanner(true);
    }
  }, []);
  
  const handleOpenDialog = () => {
    setIsOpen(true);
  };
  
  const handleDismiss = () => {
    // Mark this version as seen
    const seenVersions = localStorage.getItem(CHANGELOG_SEEN_KEY);
    const updatedVersions = seenVersions ? 
      seenVersions.split(',').filter(v => v !== CURRENT_VERSION) : [];
    updatedVersions.push(CURRENT_VERSION);
    localStorage.setItem(CHANGELOG_SEEN_KEY, updatedVersions.join(','));
    
    setShowBanner(false);
  };
  
  if (!showBanner) return null;
  
  return (
    <>
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Alert 
              className="border-l-4 border-l-[#FF5722] bg-[#FFF3F0] mb-6 pr-12 relative"
            >
              <AlertCircle className="h-5 w-5 text-[#FF5722]" />
              <AlertTitle className="text-[#FF5722] font-bold">New features available!</AlertTitle>
              <AlertDescription className="text-gray-700">
                Pickle+ v{CURRENT_VERSION} is here with coaching connections, enhanced social features, and more!
                <Button 
                  variant="link" 
                  className="px-0 font-semibold text-[#FF5722]"
                  onClick={handleOpenDialog}
                >
                  See what's new <ChevronRight className="h-4 w-4 inline" />
                </Button>
              </AlertDescription>
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-4 right-4 h-8 w-8 rounded-full p-0 text-gray-500 hover:bg-[#FFE0D6] hover:text-[#FF5722]"
                onClick={handleDismiss}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Dismiss</span>
              </Button>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>
      
      <ChangelogDialog isOpen={isOpen} setIsOpen={setIsOpen} />
    </>
  );
}

interface ChangelogDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

function ChangelogDialog({ isOpen, setIsOpen }: ChangelogDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#FF5722]">
            What's New in Pickle+ v{CURRENT_VERSION}
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            Here's what we've been working on to enhance your pickleball experience
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 pt-4">
          <section>
            <h3 className="text-xl font-bold mb-3 flex items-center">
              <span className="text-[#FF5722] mr-2">🌟</span> Major Features
            </h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-semibold text-[#FF5722]">Coaching Connections</h4>
                <ul className="list-disc pl-5 mt-1 space-y-1 text-gray-700">
                  <li>Connect with coaches directly within the Pickle+ platform</li>
                  <li>Request coaching sessions from verified pickleball experts</li>
                  <li>View your active coaching relationships in one convenient place</li>
                  <li>Build your dream team of coaches for different aspects of your game</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-[#FF5722]">Enhanced Social Experience</h4>
                <ul className="list-disc pl-5 mt-1 space-y-1 text-gray-700">
                  <li>New connection system for building your pickleball network</li>
                  <li>Real-time connection notifications keep you in the loop</li>
                  <li>Improved player discovery to find partners and coaches</li>
                  <li>Track your social connections with activity history</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-[#FF5722]">XP Progression Refinements</h4>
                <ul className="list-disc pl-5 mt-1 space-y-1 text-gray-700">
                  <li>More balanced XP distribution for various activities</li>
                  <li>Enhanced tier progression visual indicators</li>
                  <li>Clear pathways from Dink Dabbler to Pickleball Pro</li>
                  <li>Animated level-up notifications celebrate your progress</li>
                </ul>
              </div>
            </div>
          </section>
          
          <section>
            <h3 className="text-xl font-bold mb-3 flex items-center">
              <span className="text-[#FF5722] mr-2">🛠️</span> Improvements
            </h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-semibold text-[#FF5722]">Profile Enhancements</h4>
                <ul className="list-disc pl-5 mt-1 space-y-1 text-gray-700">
                  <li>Redesigned profile pages showcase your pickleball journey</li>
                  <li>More customization options to express your playing style</li>
                  <li>Improved stat tracking and visualization</li>
                  <li>Enhanced privacy controls for your profile information</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-[#FF5722]">Tournament Experience</h4>
                <ul className="list-disc pl-5 mt-1 space-y-1 text-gray-700">
                  <li>Streamlined tournament check-in process</li>
                  <li>Improved tournament discovery based on your skill level</li>
                  <li>Enhanced tournament detail pages with more participant information</li>
                  <li>Quick access to upcoming tournaments right from your dashboard</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-[#FF5722]">Performance & Reliability</h4>
                <ul className="list-disc pl-5 mt-1 space-y-1 text-gray-700">
                  <li>Faster page loading throughout the application</li>
                  <li>Improved mobile responsiveness for on-the-go access</li>
                  <li>Enhanced data synchronization for real-time updates</li>
                  <li>More robust error handling for uninterrupted play</li>
                </ul>
              </div>
            </div>
          </section>
          
          <section>
            <h3 className="text-xl font-bold mb-3 flex items-center">
              <span className="text-[#FF5722] mr-2">🔮</span> Coming Soon
            </h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-semibold text-[#FF5722]">Messaging System</h4>
                <ul className="list-disc pl-5 mt-1 space-y-1 text-gray-700">
                  <li>Direct messaging with coaches and partners</li>
                  <li>Group chats for teams and communities</li>
                  <li>Media sharing capabilities for technique videos</li>
                  <li>Customizable notification preferences</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-[#FF5722]">Advanced Match Analytics</h4>
                <ul className="list-disc pl-5 mt-1 space-y-1 text-gray-700">
                  <li>Detailed performance breakdowns after each match</li>
                  <li>Track your improvement over time with trend analysis</li>
                  <li>Compare your stats with players in your tier</li>
                  <li>Identify areas for improvement with AI-powered insights</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-[#FF5722]">Content Library</h4>
                <ul className="list-disc pl-5 mt-1 space-y-1 text-gray-700">
                  <li>Training materials from top coaches</li>
                  <li>Technique videos for all skill levels</li>
                  <li>Strategy guides for competitive play</li>
                  <li>Community-contributed drills and exercises</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
        
        <div className="mt-6 flex justify-end">
          <Button 
            className="bg-[#FF5722] hover:bg-[#E64A19] text-white" 
            onClick={() => setIsOpen(false)}
          >
            Got it!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}