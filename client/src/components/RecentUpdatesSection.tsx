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