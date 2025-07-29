import { motion } from "framer-motion";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6 }
  }
};

export function CourtIQExplanationSection() {
  return (
    <section className="py-16 sm:py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div 
          className="text-center mb-12 sm:mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
        >
          <div className="inline-flex items-center bg-orange-500/10 rounded-full px-4 py-1.5 mb-4">
            <span className="flex h-2 w-2 rounded-full bg-orange-500 mr-2"></span>
            <span className="text-sm font-medium text-orange-500">CourtIQ™ Skill Ratings</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900">Track Your Skill Development</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            See exactly how CourtIQ™ appears in your dashboard - with simple, clear ratings that help you understand your strengths and focus areas.
          </p>
        </motion.div>
        
        {/* Authentic CourtIQ Display - How it actually appears in platform */}
        <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center mb-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h3 className="text-2xl font-bold mb-6 text-gray-900">Your CourtIQ™ Ratings</h3>
            <p className="text-gray-600 mb-6">
              This is exactly how your skill ratings appear in your dashboard - simple badges showing your progress in each dimension.
            </p>
            
            {/* Authentic skill ratings display matching SAGE widget */}
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">Technical Skills</span>
                <div className="bg-green-500/10 text-green-500 border border-green-500/20 px-3 py-1 rounded-full text-sm font-medium">
                  4/5 • Strongest
                </div>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">Tactical Awareness</span>
                <div className="bg-gray-100 text-gray-600 border border-gray-200 px-3 py-1 rounded-full text-sm font-medium">
                  3/5
                </div>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">Physical Fitness</span>
                <div className="bg-gray-100 text-gray-600 border border-gray-200 px-3 py-1 rounded-full text-sm font-medium">
                  4/5
                </div>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">Mental Toughness</span>
                <div className="bg-gray-100 text-gray-600 border border-gray-200 px-3 py-1 rounded-full text-sm font-medium">
                  3/5
                </div>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">Consistency</span>
                <div className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1 rounded-full text-sm font-medium">
                  2/5 • Focus Area
                </div>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <div className="text-sm text-gray-500 mb-2">Based on recorded matches</div>
              <div className="inline-flex items-center gap-2 bg-orange-500/10 rounded-full px-3 py-1 text-xs">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-orange-600">Live DUPR Integration</span>
              </div>
            </div>
          </motion.div>
          
          {/* Pickle Points Integration */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-center"
          >
            <div className="bg-white border-2 border-gray-100 rounded-2xl p-8 shadow-lg max-w-sm mx-auto">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-orange-500 mb-2">875</div>
                <div className="text-sm text-gray-600">Pickle Points</div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-gray-900">24</div>
                  <div className="text-xs text-gray-500">Matches</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900">Level 7</div>
                  <div className="text-xs text-gray-500">Rank</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900">15%</div>
                  <div className="text-xs text-gray-500">Top</div>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="text-xs text-gray-500 mb-2">Recent Activity</div>
                <div className="flex justify-center">
                  <div className="inline-flex items-center gap-2 bg-green-500/10 rounded-full px-3 py-1 text-xs">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-600">+25 points today</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Platform Features - How the system actually works */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-orange-500/5 to-cyan-400/5 rounded-2xl p-8 border border-orange-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Real Platform Features</h3>
            <p className="text-gray-600 mb-6">
              Your CourtIQ™ ratings improve automatically as you record matches and track your progress through the platform.
            </p>
            
            <div className="grid sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <div className="w-6 h-6 bg-orange-500 rounded-full"></div>
                </div>
                <div className="font-medium text-gray-900 mb-1">Match Recording</div>
                <div className="text-sm text-gray-600">Record games to update ratings</div>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-cyan-400/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <div className="w-6 h-6 bg-cyan-400 rounded-full"></div>
                </div>
                <div className="font-medium text-gray-900 mb-1">DUPR Sync</div>
                <div className="text-sm text-gray-600">Live integration with DUPR</div>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full"></div>
                </div>
                <div className="font-medium text-gray-900 mb-1">Progress Tracking</div>
                <div className="text-sm text-gray-600">See improvement over time</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}