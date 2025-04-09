import React from 'react';
import { motion } from 'framer-motion';
import { RatingSystemsComparison } from './animations/RatingSystemsComparison';
import { ArrowRight, Shield, CheckCircle, RefreshCw, GitMerge } from 'lucide-react';

// Rating systems data
const ratingSystems = [
  {
    id: 'courtiq',
    name: 'CourtIQ™',
    primaryColor: '#673AB7',
    secondaryColor: '#9C27B0',
    description: 'Our proprietary multi-dimensional rating system providing detailed skill analysis and format-specific ratings.',
    features: {
      'format_specific': true,
      'skill_breakdown': true, 
      'historical_tracking': true,
      'verification': true,
      'tournament_ready': true,
      'international': true,
      'community': true,
      'digital_integration': true
    }
  },
  {
    id: 'dupr',
    name: 'DUPR',
    primaryColor: '#2196F3',
    secondaryColor: '#03A9F4',
    description: 'Dynamic Universal Pickleball Rating system used globally across tournaments and platforms.',
    features: {
      'format_specific': 'partial' as const,
      'skill_breakdown': false,
      'historical_tracking': true,
      'verification': true,
      'tournament_ready': true,
      'international': true,
      'community': true,
      'digital_integration': true
    },
    infoUrl: 'https://mydupr.com'
  },
  {
    id: 'utpr',
    name: 'UTPR',
    primaryColor: '#4CAF50',
    secondaryColor: '#8BC34A',
    description: 'USA Pickleball Tournament Player Rating system used in official USA Pickleball tournaments.',
    features: {
      'format_specific': true,
      'skill_breakdown': false,
      'historical_tracking': true,
      'verification': true,
      'tournament_ready': true,
      'international': false,
      'community': false,
      'digital_integration': 'partial' as const
    },
    infoUrl: 'https://usapickleball.org'
  },
  {
    id: 'wpr',
    name: 'WPR',
    primaryColor: '#FF9800',
    secondaryColor: '#FF5722',
    description: 'World Pickleball Rating used in international competitions and across various platforms.',
    features: {
      'format_specific': false,
      'skill_breakdown': false,
      'historical_tracking': true,
      'verification': true,
      'tournament_ready': true, 
      'international': true,
      'community': 'partial' as const,
      'digital_integration': 'partial' as const
    }
  }
];

// Feature configuration for the comparison table
const featureConfig = [
  {
    id: 'format_specific',
    label: 'Format-Specific Ratings',
    tooltip: 'Separate ratings for singles, doubles, and mixed doubles play'
  },
  {
    id: 'skill_breakdown',
    label: 'Detailed Skill Analysis',
    tooltip: 'Breakdown of individual skills like power, control, strategy, etc.'
  },
  {
    id: 'historical_tracking',
    label: 'Historical Tracking',
    tooltip: 'Ability to track rating changes over time'
  },
  {
    id: 'verification',
    label: 'Rating Verification',
    tooltip: 'Official verification of rating accuracy'
  },
  {
    id: 'tournament_ready',
    label: 'Tournament Integration',
    tooltip: 'Used for tournament divisions and brackets'
  },
  {
    id: 'international',
    label: 'International Recognition',
    tooltip: 'Recognized across international competitions'
  },
  {
    id: 'community',
    label: 'Community Adoption',
    tooltip: 'Widely adopted by the player community'
  },
  {
    id: 'digital_integration',
    label: 'Digital Platform Integration',
    tooltip: 'Easy integration with digital platforms and apps'
  }
];

export function RatingSystemsIntegrationSection() {
  return (
    <section className="py-16 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">Unified Rating Ecosystem</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Pickle+ seamlessly integrates with all major rating systems while enhancing your experience with CourtIQ™ analytics.
            </p>
          </motion.div>
        </div>
        
        {/* Rating systems comparison */}
        <div className="mb-16">
          <RatingSystemsComparison 
            systems={ratingSystems} 
            featuresConfig={featureConfig}
            className="mb-4" 
          />
          <p className="text-sm text-gray-500 text-center italic">
            Hover over system names and feature labels for more information
          </p>
        </div>
        
        {/* Integration process */}
        <div className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h3 className="text-2xl font-bold mb-3">How Our Integration Works</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We've created a seamless process for incorporating existing ratings while enhancing your experience with CourtIQ™.
            </p>
          </motion.div>
          
          <div className="max-w-4xl mx-auto">
            <IntegrationSteps />
          </div>
        </div>
        
        {/* Benefits */}
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h3 className="text-2xl font-bold text-[#673AB7] mb-4">Benefits of Our Approach</h3>
            <p className="text-gray-700 mb-6">
              By integrating all major rating systems while providing our enhanced CourtIQ™ analytics, players get the best of all worlds.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 bg-[#673AB7]/10 p-2 rounded-full text-[#673AB7] mt-1">
                  <CheckCircle size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-1">Universal Compatibility</h4>
                  <p className="text-gray-600">Participate in any tournament or league regardless of which rating system they use.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 bg-[#2196F3]/10 p-2 rounded-full text-[#2196F3] mt-1">
                  <Shield size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-1">Enhanced Verification</h4>
                  <p className="text-gray-600">Our admin-verified badges ensure your external ratings are accurately displayed and trusted.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 bg-[#4CAF50]/10 p-2 rounded-full text-[#4CAF50] mt-1">
                  <RefreshCw size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-1">Seamless Synchronization</h4>
                  <p className="text-gray-600">As your external ratings change, you can request updates to keep your profile current.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 bg-[#FF9800]/10 p-2 rounded-full text-[#FF9800] mt-1">
                  <GitMerge size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-1">Best of Both Worlds</h4>
                  <p className="text-gray-600">Keep your traditional ratings for tournaments while using CourtIQ™ for detailed progression insights.</p>
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="bg-gradient-to-br from-[#673AB7]/5 to-[#2196F3]/5 rounded-xl p-6 md:p-8"
          >
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h4 className="text-xl font-bold mb-4 text-[#673AB7]">Player Profile Example</h4>
              
              <div className="mb-6">
                <div className="flex items-center mb-2">
                  <div className="h-12 w-12 rounded-full bg-[#673AB7] text-white flex items-center justify-center font-bold text-xl mr-3">
                    JS
                  </div>
                  <div>
                    <div className="font-bold text-lg">John Smith</div>
                    <div className="text-sm text-gray-500">Passport: XP39R45</div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h5 className="font-medium text-gray-700 mb-2">External Verified Ratings</h5>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-[#2196F3]/10 rounded p-2 text-center">
                      <div className="text-[#2196F3] font-bold">4.5</div>
                      <div className="text-xs text-gray-600">DUPR</div>
                      <div className="mt-1">
                        <CheckCircle size={14} className="inline text-green-500" />
                      </div>
                    </div>
                    <div className="bg-[#4CAF50]/10 rounded p-2 text-center">
                      <div className="text-[#4CAF50] font-bold">4.25</div>
                      <div className="text-xs text-gray-600">UTPR</div>
                      <div className="mt-1">
                        <CheckCircle size={14} className="inline text-green-500" />
                      </div>
                    </div>
                    <div className="bg-[#FF9800]/10 rounded p-2 text-center">
                      <div className="text-[#FF9800] font-bold">4.0</div>
                      <div className="text-xs text-gray-600">WPR</div>
                      <div className="mt-1">
                        <CheckCircle size={14} className="inline text-green-500" />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h5 className="font-medium text-gray-700 mb-2">CourtIQ™ Enhanced Ratings</h5>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-[#673AB7]/10 rounded p-2 text-center">
                      <div className="text-[#673AB7] font-bold">1248</div>
                      <div className="text-xs text-gray-600">Overall</div>
                    </div>
                    <div className="bg-[#9C27B0]/10 rounded p-2 text-center">
                      <div className="text-[#9C27B0] font-bold">1301</div>
                      <div className="text-xs text-gray-600">Singles</div>
                    </div>
                    <div className="bg-[#E91E63]/10 rounded p-2 text-center">
                      <div className="text-[#E91E63] font-bold">1226</div>
                      <div className="text-xs text-gray-600">Doubles</div>
                    </div>
                  </div>
                </div>
                
                <div className="text-center pt-2">
                  <button className="text-[#673AB7] font-medium text-sm inline-flex items-center">
                    View Full Profile <ArrowRight size={14} className="ml-1" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function IntegrationSteps() {
  const steps = [
    {
      number: 1,
      title: "Import Your Ratings",
      description: "Add your existing DUPR, UTPR, or WPR ratings to your profile when you sign up or from your settings.",
    },
    {
      number: 2,
      title: "Verification Process",
      description: "Our admins verify your submitted ratings against official sources to ensure accuracy.",
    },
    {
      number: 3,
      title: "CourtIQ™ Enhancement",
      description: "Play matches on our platform to develop your CourtIQ™ profile alongside your existing ratings.",
    },
    {
      number: 4,
      title: "Complete Digital Passport",
      description: "Showcase both your verified external ratings and detailed CourtIQ™ analytics on your player passport.",
    }
  ];
  
  return (
    <div className="relative">
      {/* Connecting line */}
      <div className="absolute left-[25px] top-0 bottom-0 w-1 bg-gradient-to-b from-[#673AB7] to-[#2196F3] z-0 md:left-1/2 md:-ml-0.5"></div>
      
      <div className="relative z-10">
        {steps.map((step, index) => (
          <motion.div 
            key={`step-${index}`}
            className={`flex mb-8 md:mb-12 ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.2, duration: 0.5 }}
          >
            <div className="flex-shrink-0 relative z-10">
              <div className={`w-12 h-12 rounded-full bg-white border-2 flex items-center justify-center text-lg font-bold shadow-md ${
                index === 0 ? 'border-[#673AB7] text-[#673AB7]' : 
                index === 1 ? 'border-[#9C27B0] text-[#9C27B0]' : 
                index === 2 ? 'border-[#2196F3] text-[#2196F3]' : 
                'border-[#00BCD4] text-[#00BCD4]'
              }`}>
                {step.number}
              </div>
            </div>
            
            <div className={`ml-6 md:ml-0 md:w-[calc(50%-32px)] ${index % 2 === 1 ? 'md:mr-6 md:text-right' : 'md:ml-6'}`}>
              <div className={`bg-white p-5 rounded-lg shadow-md border border-gray-100 ${
                index === 0 ? 'border-l-4 border-l-[#673AB7]' : 
                index === 1 ? 'border-l-4 border-l-[#9C27B0] md:border-l md:border-r-4 md:border-r-[#9C27B0]' : 
                index === 2 ? 'border-l-4 border-l-[#2196F3]' : 
                'border-l-4 border-l-[#00BCD4] md:border-l md:border-r-4 md:border-r-[#00BCD4]'
              }`}>
                <h4 className={`text-lg font-bold mb-2 ${
                  index === 0 ? 'text-[#673AB7]' : 
                  index === 1 ? 'text-[#9C27B0]' : 
                  index === 2 ? 'text-[#2196F3]' : 
                  'text-[#00BCD4]'
                }`}>{step.title}</h4>
                <p className="text-gray-600">{step.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}