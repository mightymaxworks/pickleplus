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
const CURRENT_VERSION = '0.8.0';
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
              <span className="text-[#FF5722] mr-2">🏆</span> Enhanced Player Passport System
            </h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-semibold text-[#FF5722]">Digital Passport QR Codes</h4>
                <ul className="list-disc pl-5 mt-1 space-y-1 text-gray-700">
                  <li>Easily check in to tournaments with your unique QR code</li>
                  <li>Connect with other players by sharing your player passport</li>
                  <li>Quick access to your passport from anywhere in the app</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-[#FF5722]">Gold Accented Passports</h4>
                <ul className="list-disc pl-5 mt-1 space-y-1 text-gray-700">
                  <li>Founding members receive exclusive gold-accented passport displays</li>
                  <li>Special crown badge recognition for founding members</li>
                  <li>Enhanced visual design for member passports</li>
                </ul>
              </div>
            </div>
          </section>
          
          <section>
            <h3 className="text-xl font-bold mb-3 flex items-center">
              <span className="text-[#FF5722] mr-2">📊</span> Profile Improvements
            </h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-semibold text-[#FF5722]">Tournament Integration</h4>
                <ul className="list-disc pl-5 mt-1 space-y-1 text-gray-700">
                  <li>View all your registered tournaments directly on your profile</li>
                  <li>See tournament check-in status at a glance</li>
                  <li>Get quick access to upcoming tournament details</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-[#FF5722]">Performance Dashboard</h4>
                <ul className="list-disc pl-5 mt-1 space-y-1 text-gray-700">
                  <li>Track your win ratio with improved visualizations</li>
                  <li>Monitor ranking points and progression over time</li>
                  <li>View comprehensive tournament participation statistics</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-[#FF5722]">Tier Progression</h4>
                <ul className="list-disc pl-5 mt-1 space-y-1 text-gray-700">
                  <li>Clear visualization of your progress through the 7-tier player system</li>
                  <li>From Dink Dabbler to Pickleball Pro with descriptive tier badges</li>
                  <li>XP progress bar to show advancement to the next level</li>
                </ul>
              </div>
            </div>
          </section>
          
          <section>
            <h3 className="text-xl font-bold mb-3 flex items-center">
              <span className="text-[#FF5722] mr-2">🔄</span> Experience Enhancements
            </h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-semibold text-[#FF5722]">Improved Data Display</h4>
                <ul className="list-disc pl-5 mt-1 space-y-1 text-gray-700">
                  <li>More reliable tournament data synchronization</li>
                  <li>Enhanced player statistics and match history visualizations</li>
                  <li>Optimized data loading for faster performance</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-[#FF5722]">Simplified Navigation</h4>
                <ul className="list-disc pl-5 mt-1 space-y-1 text-gray-700">
                  <li>Streamlined profile interface with quick action buttons</li>
                  <li>Floating QR button for instant passport access</li>
                  <li>Improved mobile responsive design for all screen sizes</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-[#FF5722]">Performance Optimizations</h4>
                <ul className="list-disc pl-5 mt-1 space-y-1 text-gray-700">
                  <li>Faster loading times for player statistics</li>
                  <li>Optimized match history and tournament data retrieval</li>
                  <li>Smoother transitions and animations throughout the app</li>
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