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
                Pickle+ v{CURRENT_VERSION} is here with tournament passport improvements, player connections, and more!
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
                <h4 className="text-lg font-semibold text-[#FF5722]">Tournament Passport System</h4>
                <ul className="list-disc pl-5 mt-1 space-y-1 text-gray-700">
                  <li>QR code check-ins for swift tournament registration</li>
                  <li>Enhanced tournament history tracking</li>
                  <li>Improved tournament leaderboards with real-time updates</li>
                  <li>Tournament notifications for upcoming events</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-[#FF5722]">Player Connections</h4>
                <ul className="list-disc pl-5 mt-1 space-y-1 text-gray-700">
                  <li>Connect with other players to build your pickleball network</li>
                  <li>Find practice partners based on skill level and location</li>
                  <li>Track matches played with your connections</li>
                  <li>See connection activity in your timeline</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-[#FF5722]">Achievement System Expansion</h4>
                <ul className="list-disc pl-5 mt-1 space-y-1 text-gray-700">
                  <li>New achievements for tournament participation</li>
                  <li>Skills-based achievement pathways</li>
                  <li>Improved visual badges for your profile</li>
                  <li>XP rewards for completing achievements</li>
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
                  <li>Improved profile statistics dashboard</li>
                  <li>Match history with detailed results</li>
                  <li>Achievement showcase section</li>
                  <li>Enhanced privacy controls for profile information</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-[#FF5722]">Match Recording</h4>
                <ul className="list-disc pl-5 mt-1 space-y-1 text-gray-700">
                  <li>Streamlined match entry process</li>
                  <li>Support for multiple scoring formats</li>
                  <li>Partner selection from your connections</li>
                  <li>Match validation improvements</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-[#FF5722]">XP & Ranking System</h4>
                <ul className="list-disc pl-5 mt-1 space-y-1 text-gray-700">
                  <li>Clearer tier progression visualization</li>
                  <li>Balanced XP distribution for activities</li>
                  <li>New ranking system based on match performance</li>
                  <li>Seasonal leaderboards implementation</li>
                </ul>
              </div>
            </div>
          </section>
          
          <section>
            <h3 className="text-xl font-bold mb-3 flex items-center">
              <span className="text-[#FF5722] mr-2">📱</span> User Experience
            </h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-semibold text-[#FF5722]">Mobile Improvements</h4>
                <ul className="list-disc pl-5 mt-1 space-y-1 text-gray-700">
                  <li>Redesigned mobile navigation</li>
                  <li>Optimized layouts for all screen sizes</li>
                  <li>Touch-friendly interface elements</li>
                  <li>Improved performance on mobile devices</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-[#FF5722]">Notification System</h4>
                <ul className="list-disc pl-5 mt-1 space-y-1 text-gray-700">
                  <li>Real-time notifications for important events</li>
                  <li>Customizable notification preferences</li>
                  <li>Activity feed with chronological updates</li>
                  <li>Tournament reminder notifications</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-[#FF5722]">Dashboard Refinements</h4>
                <ul className="list-disc pl-5 mt-1 space-y-1 text-gray-700">
                  <li>At-a-glance stats on main dashboard</li>
                  <li>Recent activity highlights</li>
                  <li>Quick access to upcoming tournaments</li>
                  <li>Achievement progress indicators</li>
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