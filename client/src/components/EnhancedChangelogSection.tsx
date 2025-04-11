import { motion } from 'framer-motion';
import { AnimatedTimeline, TimelineItem } from './animations/AnimatedTimeline';

export function EnhancedChangelogSection() {
  const changelogItems: TimelineItem[] = [
    {
      version: 'v5.2',
      date: 'April 5, 2025',
      title: 'Enhanced Match Recording System',
      description: 'A major update to how matches are recorded and analyzed, providing deeper insights into your performance.',
      highlights: [
        'Advanced match statistics with detailed breakdowns by shot type',
        'Performance impact tracking to see how each match affects your CourtIQ™ rating',
        'Match highlights system to record key moments',
        'Video recording integration (beta)',
      ],
      icon: 'zap',
      badgeText: 'New',
      badgeVariant: 'destructive'
    },
    {
      version: 'v5.1',
      date: 'March 18, 2025',
      title: 'Tournament Discovery Quest System',
      description: 'An innovative system that rewards users for interactive exploration of tournament features.',
      highlights: [
        'Tiered reward structure (Scout → Strategist → Pioneer)',
        'Integration with Prize Drawing System',
        'Tournament feature showcase with interactive elements',
        'Enhanced CourtIQ™ integration showing rating progression',
      ],
      icon: 'trophy',
      badgeText: 'Major',
      badgeVariant: 'outline'
    },
    {
      version: 'v5.0',
      date: 'February 22, 2025',
      title: 'CourtIQ™ Intelligence System',
      description: 'Introducing our new proprietary rating and analytics system with multi-dimensional insights.',
      highlights: [
        'CourtIQ™ Rating System with format-specific ratings',
        'Skill radar visualization showing strengths/weaknesses',
        'Personalized development recommendations',
        'Historical performance tracking with trends analysis',
      ],
      icon: 'chart',
      badgeText: 'Flagship',
      badgeVariant: 'secondary'
    },
    {
      version: 'Launch',
      date: 'February 1, 2025',
      title: 'Pickle+ Platform Launch',
      description: 'The official launch of the Pickle+ platform, designed to transform pickleball player development.',
      highlights: [
        'Unique 7-character alphanumeric passport codes for all players',
        'Foundation for the CourtIQ™ Rating System',
        'Mobile-first design with responsive interface',
        'Core match recording and player profile systems',
      ],
      icon: 'star',
      badgeText: 'Genesis',
      badgeVariant: 'secondary'
    },
    {
      version: 'v4.8',
      date: 'January 10, 2025',
      title: 'Social Features Expansion',
      description: 'New ways to connect with the pickleball community and coordinate play.',
      highlights: [
        'Partner finder with compatibility matching',
        'Club and facility integration',
        'Group messaging and event planning tools',
        'Community challenges and leaderboards',
      ],
      icon: 'users',
      badgeText: 'Feature',
      badgeVariant: 'default'
    },
    {
      version: 'v4.7',
      date: 'December 5, 2024',
      title: 'Achievement System',
      description: 'A comprehensive system to recognize your accomplishments on and off the court.',
      highlights: [
        'Over 50 unique achievements to unlock',
        'XP system with levels and rewards',
        'Shareable achievement cards for social media',
        'Community challenges with special badges',
      ],
      icon: 'award'
    },
    {
      version: 'v4.6',
      date: 'November 12, 2024',
      title: 'Player Passport System',
      description: 'Your digital identity in the pickleball world, with easy sharing and verification.',
      highlights: [
        'Unique passport ID for easy player identification',
        'QR code sharing for quick profile access',
        'Verified ratings with admin approval',
        'Digital match history and stats showcase',
      ],
      icon: 'calendar'
    }
  ];
  
  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center bg-[#FF5722]/10 rounded-full px-4 py-1.5 mb-4">
            <span className="flex h-2 w-2 rounded-full bg-[#FF5722] mr-2"></span>
            <span className="text-sm font-medium text-[#FF5722]">What's New</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Continuous Innovation</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We're constantly improving Pickle+ with regular updates and new features
            based on feedback from our growing community.
          </p>
        </motion.div>
        
        <div className="max-w-4xl mx-auto">
          <AnimatedTimeline items={changelogItems} />
        </div>
        
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <a 
            href="#" 
            className="text-[#673AB7] inline-flex items-center font-medium hover:underline"
          >
            View complete changelog
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 ml-1" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 5l7 7-7 7" 
              />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
}