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
            title="Coaching Connections"
            description="Connect with coaches, request sessions, and build your dream coaching team."
            icon="👨‍🏫"
            delay={0.4}
          />
          
          <FeatureCard 
            title="Enhanced Social"
            description="Build your pickleball network with our new connection system and player discovery."
            icon="🤝"
            delay={0.5}
          />
          
          <FeatureCard 
            title="XP Progression"
            description="Enjoy refined progression with better tier indicators and balanced XP distribution."
            icon="⭐"
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