import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, BadgeCheck, ShieldCheck } from 'lucide-react';

export function RatingSystemsIntegrationSection() {
  return (
    <section className="py-16 sm:py-24 bg-gradient-to-br from-[#F5F5F5] to-[#EEEEEE] overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center bg-[#2196F3]/10 rounded-full px-4 py-1.5 mb-4">
            <span className="flex h-2 w-2 rounded-full bg-[#2196F3] mr-2"></span>
            <span className="text-sm font-medium text-[#2196F3]">Verified Ratings</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Multi-Rating System Integration</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Pickle+ brings all major rating systems together in one place, with verified
            credentials to ensure accurate and reliable player matching.
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-12 gap-8 items-center mb-16">
          {/* Cards Column */}
          <motion.div 
            className="md:col-span-7 grid sm:grid-cols-2 gap-4"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <RatingCard 
              name="DUPR"
              description="Dynamic Universal Pickleball Rating"
              logo={<DUPRLogo />}
              color="#2196F3"
              value="4.5"
              verified={true}
            />
            <RatingCard 
              name="UTPR"
              description="USA Pickleball Tournament Player Rating"
              logo={<UTPRLogo />}
              color="#4CAF50" 
              value="5.0"
              verified={true}
            />
            <RatingCard 
              name="WPR"
              description="World Pickleball Rating"
              logo={<WPRLogo />}
              color="#FF9800"
              value="4.0"
              verified={false}
            />
            <RatingCard 
              name="CourtIQ™"
              description="Pickle+ Proprietary Rating"
              logo={<CourtIQLogo />}
              color="#673AB7"
              value="1248"
              verified={true}
              isSpecial={true}
            />
          </motion.div>
          
          {/* Content Column */}
          <motion.div 
            className="md:col-span-5"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-2xl font-bold mb-4">Verified Credentials</h3>
            <p className="text-gray-600 mb-6">
              Your ratings from across the major systems can be verified and displayed on your
              passport, ensuring accurate matchmaking and tournament eligibility.
            </p>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 p-1.5 bg-[#2196F3]/10 rounded-md mt-0.5">
                  <BadgeCheck className="h-5 w-5 text-[#2196F3]" />
                </div>
                <div>
                  <div className="font-bold">Verification Process</div>
                  <p className="text-sm text-gray-600">
                    Submit your official ratings for admin verification and
                    have them prominently displayed on your profile.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 p-1.5 bg-[#4CAF50]/10 rounded-md mt-0.5">
                  <ShieldCheck className="h-5 w-5 text-[#4CAF50]" />
                </div>
                <div>
                  <div className="font-bold">Trusted Community</div>
                  <p className="text-sm text-gray-600">
                    Play with confidence knowing ratings are verified and accurate,
                    creating better matches for everyone.
                  </p>
                </div>
              </div>
            </div>
            
            <Button 
              size="lg" 
              className="bg-[#2196F3] hover:bg-[#1E88E5] text-white"
            >
              Get Your Ratings Verified <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </div>
        
        {/* Feature Highlights */}
        <motion.div
          className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#2196F3]/5 to-[#673AB7]/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <h3 className="text-xl sm:text-2xl font-bold mb-4">Why Use Verified Ratings?</h3>
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="font-bold">Accurate Matchmaking</div>
                <p className="text-sm text-gray-600">
                  Find opponents and partners at your exact skill level for more enjoyable and competitive play.
                </p>
              </div>
              <div className="space-y-2">
                <div className="font-bold">Tournament Eligibility</div>
                <p className="text-sm text-gray-600">
                  Easily prove your eligibility for tournament divisions without additional verification steps.
                </p>
              </div>
              <div className="space-y-2">
                <div className="font-bold">Progress Tracking</div>
                <p className="text-sm text-gray-600">
                  Track your improvement across multiple systems and identify patterns in your development.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

interface RatingCardProps {
  name: string;
  description: string;
  logo: React.ReactNode;
  color: string;
  value: string;
  verified: boolean;
  isSpecial?: boolean;
}

function RatingCard({ name, description, logo, color, value, verified, isSpecial = false }: RatingCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
      {/* Background accent */}
      <div 
        className="absolute top-0 left-0 h-full w-1.5 rounded-l-xl" 
        style={{ backgroundColor: color }}
      ></div>
      
      {/* Content */}
      <div className="pl-2">
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="font-bold text-lg">{name}</div>
            <div className="text-xs text-gray-500">{description}</div>
          </div>
          <div className="h-10 w-10">{logo}</div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="font-bold text-2xl" style={{ color }}>{value}</div>
          {verified ? (
            <div className="flex items-center bg-green-50 text-green-600 px-2 py-1 rounded-full text-xs font-medium">
              <BadgeCheck className="h-3 w-3 mr-1" />
              Verified
            </div>
          ) : (
            <div className="flex items-center bg-gray-100 text-gray-500 px-2 py-1 rounded-full text-xs font-medium">
              Unverified
            </div>
          )}
        </div>
        
        {isSpecial && (
          <div className="mt-2 pt-2 border-t border-dashed border-gray-200 text-xs text-gray-500">
            Exclusive to Pickle+ • Advanced metrics with deep insights
          </div>
        )}
      </div>
    </div>
  );
}

// Simple logo components
function DUPRLogo() {
  return (
    <div className="bg-[#2196F3] text-white font-bold rounded-md p-1 text-center text-xs flex items-center justify-center h-full">
      DUPR
    </div>
  );
}

function UTPRLogo() {
  return (
    <div className="bg-[#4CAF50] text-white font-bold rounded-md p-1 text-center text-xs flex items-center justify-center h-full">
      UTPR
    </div>
  );
}

function WPRLogo() {
  return (
    <div className="bg-[#FF9800] text-white font-bold rounded-md p-1 text-center text-xs flex items-center justify-center h-full">
      WPR
    </div>
  );
}

function CourtIQLogo() {
  return (
    <div className="bg-[#673AB7] text-white font-bold rounded-md p-1 text-center text-xs flex items-center justify-center h-full">
      CourtIQ
    </div>
  );
}