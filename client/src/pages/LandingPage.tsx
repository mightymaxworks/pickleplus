import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { PicklePlusTextLogo } from "@/components/icons/PicklePlusTextLogo";
import { PicklePlusLogo } from "@/components/icons/PicklePlusLogo";
import { Button } from "@/components/ui/button";
import { ChevronDown, Award, Calendar, BarChart, ArrowRight, Users, Trophy, Zap } from "lucide-react";

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6 }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const FeatureCard = ({ icon, title, description }: { 
  icon: React.ReactNode, 
  title: string, 
  description: string 
}) => {
  return (
    <motion.div 
      className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow"
      variants={fadeIn}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <div className="mb-4 text-[#FF5722]">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </motion.div>
  );
};

const HowItWorksStep = ({ number, title, description }: {
  number: number,
  title: string,
  description: string
}) => {
  return (
    <motion.div 
      className="flex items-start gap-4"
      variants={fadeIn}
    >
      <div className="flex-shrink-0 w-10 h-10 bg-[#2196F3] text-white rounded-full flex items-center justify-center font-bold text-lg">
        {number}
      </div>
      <div>
        <h3 className="text-lg font-bold mb-1">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </motion.div>
  );
};

export default function LandingPage() {
  const [, navigate] = useLocation();

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-[#FF5722] to-[#FF8A65] text-white py-16 md:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-10">
            <motion.div 
              className="w-full md:w-1/2 text-center md:text-left"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight">
                Level Up Your Pickleball Game with Pickle+
              </h1>
              <p className="text-lg sm:text-xl mb-6 md:mb-8 text-white/90">
                Track your progress, compete in tournaments, and unlock achievements in the ultimate pickleball companion app
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center md:justify-start">
                <Button 
                  size="lg" 
                  className="bg-white text-[#FF5722] hover:bg-white/90 w-full sm:w-auto"
                  onClick={() => navigate("/register")}
                >
                  Get Started
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white border-2 text-white hover:bg-white/10 hover:border-white w-full sm:w-auto bg-black/20"
                  onClick={() => {
                    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  See How It Works
                </Button>
              </div>
            </motion.div>
            <motion.div 
              className="w-full md:w-1/2 flex justify-center mt-10 md:mt-0"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="relative w-full max-w-sm sm:max-w-md bg-white rounded-xl shadow-xl overflow-hidden">
                {/* Header with logo */}
                <div className="bg-gradient-to-r from-[#FF5722] to-[#FF9800] pt-3 pb-5 px-5 text-white">
                  <div className="flex justify-between items-center">
                    <div className="font-bold text-lg">Player Passport</div>
                    <PicklePlusLogo className="h-8 w-auto" />
                  </div>
                  
                  {/* Player info */}
                  <div className="flex items-center mt-2">
                    <div className="h-14 w-14 rounded-full bg-white p-0.5 mr-3">
                      <div className="h-full w-full rounded-full bg-gradient-to-r from-[#2196F3] to-[#03A9F4] flex items-center justify-center text-white font-bold text-xl">
                        JS
                      </div>
                    </div>
                    <div>
                      <div className="font-bold text-xl">John Smith</div>
                      <div className="flex items-center text-sm text-white/80 mt-0.5">
                        <div className="font-medium bg-white/20 rounded-full px-2 py-0.5">3.5 Intermediate+</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Stats section */}
                <div className="p-4 sm:p-6">
                  {/* XP Progress */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-4 border border-gray-100">
                    <div className="flex justify-between items-center mb-1">
                      <div className="font-bold text-gray-700">Level 5</div>
                      <div className="text-[#FF5722] font-medium text-sm">520/1000 XP</div>
                    </div>
                    <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="bg-[#FF5722] h-full rounded-full" style={{ width: '52%' }}></div>
                    </div>
                  </div>
                  
                  {/* Key stats in a grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-[#2196F3]/10 border border-[#2196F3]/20 rounded-lg p-3 text-center">
                      <div className="text-[#2196F3] font-bold text-xl mb-0.5">1,248</div>
                      <div className="text-xs text-gray-600">Ranking Points</div>
                    </div>
                    <div className="bg-[#FF9800]/10 border border-[#FF9800]/20 rounded-lg p-3 text-center">
                      <div className="text-[#FF9800] font-bold text-xl mb-0.5">24</div>
                      <div className="text-xs text-gray-600">Matches Played</div>
                    </div>
                  </div>
                  
                  {/* Additional stats */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-[#FF5722]/10 border border-[#FF5722]/20 rounded-lg p-2 text-center">
                      <div className="text-[#FF5722] font-bold text-lg">8</div>
                      <div className="text-xs text-gray-600">Achievements</div>
                    </div>
                    <div className="bg-[#4CAF50]/10 border border-[#4CAF50]/20 rounded-lg p-2 text-center">
                      <div className="text-[#4CAF50] font-bold text-lg">3</div>
                      <div className="text-xs text-gray-600">Tournaments</div>
                    </div>
                    <div className="bg-[#673AB7]/10 border border-[#673AB7]/20 rounded-lg p-2 text-center">
                      <div className="text-[#673AB7] font-bold text-lg">7</div>
                      <div className="text-xs text-gray-600">Ranking</div>
                    </div>
                  </div>
                  
                  {/* Activity badge - latest achievement */}
                  <div className="mt-4 flex items-center gap-2 bg-gradient-to-r from-[#2196F3]/5 to-[#03A9F4]/5 p-2 rounded-lg border border-[#2196F3]/10">
                    <div className="bg-[#2196F3] rounded-full p-1 text-white">
                      <Trophy size={16} />
                    </div>
                    <div className="text-xs text-gray-700">Won mixed doubles tournament at Willow Park</div>
                    <div className="text-[10px] text-[#2196F3] ml-auto font-medium">+100 RP</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
          <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 text-white/80 animate-bounce">
            <ChevronDown size={24} />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div 
            className="text-center mb-8 sm:mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Elevate Your Pickleball Experience</h2>
            <p className="text-base sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Pickle+ brings your pickleball journey to life with powerful features designed to help you track, improve, and enjoy the game like never before.
            </p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <FeatureCard 
              icon={<BarChart size={32} />} 
              title="Match Tracking" 
              description="Record your matches with our easy step-by-step wizard. Support for singles, doubles, and different scoring systems."
            />
            <FeatureCard 
              icon={<Award size={32} />} 
              title="Achievement System" 
              description="Unlock rewards as you progress through your pickleball journey. Earn XP for participating and points for winning."
            />
            <FeatureCard 
              icon={<Calendar size={32} />} 
              title="Tournament Passport" 
              description="Register for tournaments and check in with your personal QR code. Track your tournament history and performance."
            />
            <FeatureCard 
              icon={<BarChart size={32} />} 
              title="Skill Progression" 
              description="Visualize your improvement over time with detailed statistics. Compare your ranking with friends and local players."
            />
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 sm:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div 
            className="text-center mb-8 sm:mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Why Pickleball Players Love Pickle+</h2>
            <p className="text-base sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of players who are taking their game to the next level with our innovative platform.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
            <motion.div 
              className="order-2 md:order-1"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <ul className="space-y-4 sm:space-y-6">
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 bg-[#FF5722]/10 p-2 rounded-full text-[#FF5722]">
                    <Zap size={20} className="sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base sm:text-lg mb-0.5 sm:mb-1">Gamified Progression</h3>
                    <p className="text-sm sm:text-base text-gray-600">Makes improvement fun and addictive with levels, XP, and achievements.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 bg-[#2196F3]/10 p-2 rounded-full text-[#2196F3]">
                    <Users size={20} className="sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base sm:text-lg mb-0.5 sm:mb-1">Community-Driven</h3>
                    <p className="text-sm sm:text-base text-gray-600">Connect with other players, organize matches, and join local events.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 bg-[#4CAF50]/10 p-2 rounded-full text-[#4CAF50]">
                    <BarChart size={20} className="sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base sm:text-lg mb-0.5 sm:mb-1">Detailed Insights</h3>
                    <p className="text-sm sm:text-base text-gray-600">Get a clear view of your playing style and areas for improvement.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 bg-[#FF9800]/10 p-2 rounded-full text-[#FF9800]">
                    <Trophy size={20} className="sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base sm:text-lg mb-0.5 sm:mb-1">Tournament Ready</h3>
                    <p className="text-sm sm:text-base text-gray-600">Simplifies tournament participation with digital check-ins and history tracking.</p>
                  </div>
                </li>
              </ul>
            </motion.div>

            <motion.div 
              className="order-1 md:order-2 bg-gradient-to-br from-[#FF5722]/5 to-[#2196F3]/5 rounded-2xl p-4 sm:p-8"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="relative">
                <div className="absolute -top-4 sm:-top-6 -left-4 sm:-left-6 bg-white p-2 sm:p-3 rounded-lg shadow-md">
                  <Award className="text-[#FF5722]" size={24} />
                </div>
                <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
                  <h3 className="font-bold text-lg sm:text-xl mb-2">Recently Unlocked</h3>
                  <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-[#F5F5F5] rounded-lg">
                    <div className="h-12 w-12 sm:h-16 sm:w-16 bg-[#4CAF50] rounded-full flex items-center justify-center text-white">
                      <Trophy size={24} className="sm:w-8 sm:h-8" />
                    </div>
                    <div>
                      <div className="font-bold text-base sm:text-lg">Tournament Champion</div>
                      <div className="text-xs sm:text-sm text-gray-600">Win your first tournament</div>
                      <div className="text-xs sm:text-sm font-semibold text-[#FF5722]">+500 XP</div>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
                  <h3 className="font-bold text-lg sm:text-xl mb-2">Your Stats This Month</h3>
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm sm:text-base font-medium">Matches Played</span>
                        <span className="text-sm sm:text-base text-[#2196F3]">8</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="bg-[#2196F3] h-full" style={{ width: '80%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm sm:text-base font-medium">Win Rate</span>
                        <span className="text-sm sm:text-base text-[#4CAF50]">62.5%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="bg-[#4CAF50] h-full" style={{ width: '62.5%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm sm:text-base font-medium">XP Earned</span>
                        <span className="text-sm sm:text-base text-[#FF5722]">720</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="bg-[#FF5722] h-full" style={{ width: '72%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 sm:py-20 bg-gray-50" id="how-it-works">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div 
            className="text-center mb-8 sm:mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">How Pickle+ Works</h2>
            <p className="text-base sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Get started in minutes and begin your pickleball journey with these simple steps
            </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <div className="space-y-6 sm:space-y-8 md:space-y-12">
              <HowItWorksStep 
                number={1} 
                title="Create Your Profile" 
                description="Set up your player profile with your skill level and playing history to get personalized recommendations."
              />
              <HowItWorksStep 
                number={2} 
                title="Record Matches" 
                description="Use our mobile-optimized interface to quickly log match results and track your performance over time."
              />
              <HowItWorksStep 
                number={3} 
                title="Earn Rewards" 
                description="Unlock achievements and gain XP as you play more, leveling up your pickleball passport."
              />
              <HowItWorksStep 
                number={4} 
                title="Join Tournaments" 
                description="Register for events and check in with your digital passport. Track your tournament history."
              />
            </div>

            <motion.div 
              className="bg-white rounded-xl shadow-lg overflow-hidden mt-4 sm:mt-0"
              variants={fadeIn}
            >
              <div className="p-3 sm:p-4 bg-[#FF5722] text-white font-bold text-center">
                Match Recording Wizard
              </div>
              <div className="p-4 sm:p-6">
                <div className="flex justify-between text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3">
                  <div>Step 2 of 4</div>
                  <div>Match Details</div>
                </div>
                <div className="h-1 bg-gray-200 rounded-full mb-4 sm:mb-6">
                  <div className="bg-[#FF5722] h-full rounded-full" style={{ width: '50%' }}></div>
                </div>
                <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                  <div>
                    <h4 className="text-sm sm:text-base font-medium mb-1 sm:mb-2">Match Type</h4>
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      <div className="bg-[#FF5722] text-white p-2 sm:p-3 rounded-lg text-center text-sm sm:text-base font-medium">Singles</div>
                      <div className="border border-gray-300 p-2 sm:p-3 rounded-lg text-center text-sm sm:text-base">Doubles</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-medium mb-1 sm:mb-2">Scoring System</h4>
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      <div className="bg-[#2196F3] text-white p-2 sm:p-3 rounded-lg text-center text-sm sm:text-base font-medium">Standard (11 pts)</div>
                      <div className="border border-gray-300 p-2 sm:p-3 rounded-lg text-center text-sm sm:text-base">Rally (15 pts)</div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between">
                  <Button size="sm" className="sm:hidden" variant="outline">Back</Button>
                  <Button size="default" className="hidden sm:flex" variant="outline">Back</Button>
                  
                  <Button size="sm" className="sm:hidden">
                    Continue <ArrowRight size={14} className="ml-1" />
                  </Button>
                  <Button size="default" className="hidden sm:flex">
                    Continue <ArrowRight size={16} className="ml-2" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Ranking System Section */}
      <section className="py-12 sm:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div 
            className="text-center mb-8 sm:mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Triple-Threat Progression System</h2>
            <p className="text-base sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Pickle+ offers a unique three-tiered progression system that rewards every aspect of your pickleball journey
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <motion.div 
              className="bg-white rounded-xl border border-[#FF5722]/20 shadow-md p-5 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-16 h-16 rounded-full bg-[#FF5722]/10 flex items-center justify-center mx-auto mb-4">
                <Award className="text-[#FF5722]" size={28} />
              </div>
              <h3 className="font-bold text-xl mb-2 text-[#FF5722]">XP Points</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4">
                Earned for participation and achievements. XP determines your player level and unlocks features and cosmetics.
              </p>
              <div className="bg-[#FF5722]/5 rounded-lg p-3 mb-2">
                <div className="text-[#FF5722] font-bold mb-1 text-sm">How to earn XP:</div>
                <ul className="text-left text-sm text-gray-600 space-y-1">
                  <li className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#FF5722]"></div>
                    <div>Playing matches (+15 XP)</div>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#FF5722]"></div>
                    <div>Completing achievements (varies)</div>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#FF5722]"></div>
                    <div>Attending tournaments (+50 XP)</div>
                  </li>
                </ul>
              </div>
              <div className="text-xs text-gray-500">XP never decreases — it's a lifetime measure of your pickleball journey</div>
            </motion.div>

            <motion.div 
              className="bg-white rounded-xl border border-[#2196F3]/20 shadow-md p-5 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="w-16 h-16 rounded-full bg-[#2196F3]/10 flex items-center justify-center mx-auto mb-4">
                <Trophy className="text-[#2196F3]" size={28} />
              </div>
              <h3 className="font-bold text-xl mb-2 text-[#2196F3]">Ranking Points</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4">
                Competitive score that rises and falls based on match performance. Determines your position on the leaderboard.
              </p>
              <div className="bg-[#2196F3]/5 rounded-lg p-3 mb-2">
                <div className="text-[#2196F3] font-bold mb-1 text-sm">How ranking changes:</div>
                <ul className="text-left text-sm text-gray-600 space-y-1">
                  <li className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#2196F3]"></div>
                    <div>Win vs higher-ranked (+12 pts)</div>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#2196F3]"></div>
                    <div>Win vs similar-ranked (+8 pts)</div>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#2196F3]"></div>
                    <div>Win vs lower-ranked (+5 pts)</div>
                  </li>
                </ul>
              </div>
              <div className="text-xs text-gray-500 italic">Point values shown are illustrative—your pickleball journey always moves forward!</div>
            </motion.div>

            <motion.div 
              className="bg-white rounded-xl border border-[#4CAF50]/20 shadow-md p-5 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="w-16 h-16 rounded-full bg-[#4CAF50]/10 flex items-center justify-center mx-auto mb-4">
                <Users className="text-[#4CAF50]" size={28} />
              </div>
              <h3 className="font-bold text-xl mb-2 text-[#4CAF50]">Skill Rating</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4">
                Standard pickleball skill classification (1.0 - 5.0+) used to find appropriate competition and training partners.
              </p>
              <div className="bg-[#4CAF50]/5 rounded-lg p-3 mb-2">
                <div className="text-[#4CAF50] font-bold mb-1 text-sm">Rating indicators:</div>
                <ul className="text-left text-sm text-gray-600 space-y-1">
                  <li className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#4CAF50]"></div>
                    <div>2.0-2.5: Beginner</div>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#4CAF50]"></div>
                    <div>3.0-3.5: Intermediate</div>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#4CAF50]"></div>
                    <div>4.0-5.0+: Advanced/Pro</div>
                  </li>
                </ul>
              </div>
              <div className="text-xs text-gray-500">Self-reported, but verified through app challenges and tournaments</div>
            </motion.div>
          </div>

          <motion.div
            className="bg-gray-50 rounded-xl p-5 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <div className="flex items-center justify-center gap-2 sm:gap-4 mb-4">
              <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-[#FF5722]"></div>
              <div className="text-xs sm:text-sm text-gray-500">XP for participation</div>
              <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-[#2196F3]"></div>
              <div className="text-xs sm:text-sm text-gray-500">Ranking for competition</div>
              <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-[#4CAF50]"></div>
              <div className="text-xs sm:text-sm text-gray-500">Rating for matchmaking</div>
            </div>
            <p className="text-center text-sm sm:text-base text-gray-600">
              Our triple system ensures players of all skill levels have meaningful progression paths regardless of their competitive focus.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-14 sm:py-20 bg-gradient-to-br from-[#2196F3] to-[#1a75c9] text-white">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 leading-tight">
              Ready to Transform Your Pickleball Experience?
            </h2>
            <p className="text-base sm:text-lg mb-8 sm:mb-10 mx-auto text-white/90 max-w-2xl">
              Join thousands of players who are already tracking their progress and improving their game with Pickle+
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-sm sm:max-w-md mx-auto">
              <Button 
                size="lg" 
                className="bg-white text-[#2196F3] hover:bg-white/90 w-full font-medium text-base sm:text-lg"
                onClick={() => navigate("/register")}
              >
                Create Free Account
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white border-2 text-white hover:bg-white/10 w-full font-medium text-base sm:text-lg bg-black/20"
                onClick={() => navigate("/login")}
              >
                Sign In
              </Button>
            </div>
            
            <p className="mt-6 text-sm text-white/70">
              No credit card required · Free forever · Level up today
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-10 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-8 md:mb-0 text-center md:text-left">
              <PicklePlusLogo className="mx-auto md:mx-0 mb-2" />
              <p className="text-gray-400">The ultimate pickleball companion app</p>
            </div>
            <div className="grid grid-cols-2 md:flex md:flex-row gap-8 sm:gap-12 text-center md:text-left">
              <div className="col-span-1">
                <h3 className="font-bold mb-3 sm:mb-4">Features</h3>
                <ul className="space-y-1 sm:space-y-2 text-gray-400">
                  <li>Match Recording</li>
                  <li>Achievement System</li>
                  <li>Tournament Passport</li>
                  <li>Player Rankings</li>
                </ul>
              </div>
              <div className="col-span-1">
                <h3 className="font-bold mb-3 sm:mb-4">Community</h3>
                <ul className="space-y-1 sm:space-y-2 text-gray-400">
                  <li>Find Players</li>
                  <li>Local Events</li>
                  <li>Forums</li>
                  <li>Coaching</li>
                </ul>
              </div>
              <div className="col-span-2 mt-6 md:mt-0">
                <h3 className="font-bold mb-3 sm:mb-4">Company</h3>
                <ul className="space-y-1 sm:space-y-2 text-gray-400 md:text-left">
                  <li>About Us</li>
                  <li>Contact</li>
                  <li>Privacy Policy</li>
                  <li>Terms of Service</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 sm:mt-12 pt-6 sm:pt-8 text-center text-gray-500">
            <p>© {new Date().getFullYear()} Pickle+. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}