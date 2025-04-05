import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { motion } from 'framer-motion';

// Version number to match with the banner
const CURRENT_VERSION = '1.2';

export function RecentUpdatesSection() {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  
  return (
    <section className="py-12 bg-gradient-to-b from-white to-[#FFF8F5]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <motion.h2 
            className="text-3xl font-bold text-gray-900 mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Recently Added to Pickle+
          </motion.h2>
          <motion.p 
            className="text-gray-600 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Check out the latest features we've added to enhance your pickleball experience
          </motion.p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <FeatureCard 
            title="Tournament Passport"
            description="Check in to tournaments with QR codes and track your event history with enhanced details."
            icon="🎫"
            delay={0.4}
          />
          
          <FeatureCard 
            title="Player Connections"
            description="Connect with fellow players, find practice partners, and build your pickleball network."
            icon="🤝"
            delay={0.5}
          />
          
          <FeatureCard 
            title="Achievement System"
            description="Unlock new achievements, earn XP rewards, and showcase your accomplishments."
            icon="🏆"
            delay={0.6}
          />
        </div>
        
        <div className="text-center">
          <Button 
            onClick={() => setIsDialogOpen(true)}
            className="bg-[#FF5722] hover:bg-[#E64A19] text-white"
          >
            See All Updates <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <FullChangelogDialog isOpen={isDialogOpen} setIsOpen={setIsDialogOpen} />
    </section>
  );
}

interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
  delay: number;
}

function FeatureCard({ title, description, icon, delay }: FeatureCardProps) {
  return (
    <motion.div 
      className="bg-white rounded-lg p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-[#FF5722] mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </motion.div>
  );
}

interface FullChangelogDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

function FullChangelogDialog({ isOpen, setIsOpen }: FullChangelogDialogProps) {
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