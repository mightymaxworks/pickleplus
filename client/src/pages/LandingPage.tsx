import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { PicklePlusTextLogo } from "@/components/icons/PicklePlusTextLogo";
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
                  className="border-white text-white hover:bg-white/10 w-full sm:w-auto"
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
              <div className="relative w-full max-w-sm sm:max-w-md bg-white p-6 sm:p-8 rounded-xl shadow-xl">
                <div className="absolute -top-8 sm:-top-10 left-1/2 transform -translate-x-1/2">
                  <PicklePlusTextLogo className="h-16 sm:h-20 w-auto" />
                </div>
                <div className="pt-10 sm:pt-12 pb-2 sm:pb-4">
                  <div className="bg-gray-100 rounded-lg p-3 sm:p-4 mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-bold">Level 5</div>
                      <div className="text-[#FF5722]">520/1000 XP</div>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="bg-[#FF5722] h-full" style={{ width: '52%' }}></div>
                    </div>
                  </div>
                  <div className="flex gap-2 sm:gap-3 mb-4">
                    <div className="bg-[#2196F3]/10 rounded-lg p-2 sm:p-3 flex-1 text-center">
                      <div className="text-xl sm:text-2xl font-bold text-[#2196F3]">24</div>
                      <div className="text-xs sm:text-sm text-gray-600">Matches</div>
                    </div>
                    <div className="bg-[#FF5722]/10 rounded-lg p-2 sm:p-3 flex-1 text-center">
                      <div className="text-xl sm:text-2xl font-bold text-[#FF5722]">8</div>
                      <div className="text-xs sm:text-sm text-gray-600">Achievements</div>
                    </div>
                    <div className="bg-[#4CAF50]/10 rounded-lg p-2 sm:p-3 flex-1 text-center">
                      <div className="text-xl sm:text-2xl font-bold text-[#4CAF50]">3</div>
                      <div className="text-xs sm:text-sm text-gray-600">Tournaments</div>
                    </div>
                  </div>
                  <div className="flex items-center mb-2">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-[#FF5722] to-[#2196F3] mr-3 flex items-center justify-center text-white font-bold">
                      JS
                    </div>
                    <div>
                      <div className="font-bold">John Smith</div>
                      <div className="text-sm text-gray-500">3.5 Intermediate+</div>
                    </div>
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
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <motion.div 
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <h2 className="text-3xl font-bold mb-4">Elevate Your Pickleball Experience</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Pickle+ brings your pickleball journey to life with powerful features designed to help you track, improve, and enjoy the game like never before.
            </p>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
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
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <motion.div 
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <h2 className="text-3xl font-bold mb-4">Why Pickleball Players Love Pickle+</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of players who are taking their game to the next level with our innovative platform.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div 
              className="order-2 md:order-1"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <ul className="space-y-6">
                <li className="flex items-start gap-3">
                  <div className="bg-[#FF5722]/10 p-2 rounded-full text-[#FF5722]">
                    <Zap size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Gamified Progression</h3>
                    <p className="text-gray-600">Makes improvement fun and addictive with levels, XP, and achievements.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-[#2196F3]/10 p-2 rounded-full text-[#2196F3]">
                    <Users size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Community-Driven</h3>
                    <p className="text-gray-600">Connect with other players, organize matches, and join local events.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-[#4CAF50]/10 p-2 rounded-full text-[#4CAF50]">
                    <BarChart size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Detailed Insights</h3>
                    <p className="text-gray-600">Get a clear view of your playing style and areas for improvement.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-[#FF9800]/10 p-2 rounded-full text-[#FF9800]">
                    <Trophy size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Tournament Ready</h3>
                    <p className="text-gray-600">Simplifies tournament participation with digital check-ins and history tracking.</p>
                  </div>
                </li>
              </ul>
            </motion.div>

            <motion.div 
              className="order-1 md:order-2 bg-gradient-to-br from-[#FF5722]/5 to-[#2196F3]/5 rounded-2xl p-8"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="relative">
                <div className="absolute -top-6 -left-6 bg-white p-3 rounded-lg shadow-md">
                  <Award className="text-[#FF5722]" size={32} />
                </div>
                <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                  <h3 className="font-bold text-xl mb-2">Recently Unlocked</h3>
                  <div className="flex items-center gap-4 p-4 bg-[#F5F5F5] rounded-lg">
                    <div className="h-16 w-16 bg-[#4CAF50] rounded-full flex items-center justify-center text-white">
                      <Trophy size={32} />
                    </div>
                    <div>
                      <div className="font-bold text-lg">Tournament Champion</div>
                      <div className="text-sm text-gray-600">Win your first tournament</div>
                      <div className="text-sm font-semibold text-[#FF5722]">+500 XP</div>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="font-bold text-xl mb-2">Your Stats This Month</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">Matches Played</span>
                        <span className="text-[#2196F3]">8</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="bg-[#2196F3] h-full" style={{ width: '80%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">Win Rate</span>
                        <span className="text-[#4CAF50]">62.5%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="bg-[#4CAF50] h-full" style={{ width: '62.5%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">XP Earned</span>
                        <span className="text-[#FF5722]">720</span>
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
      <section className="py-20 bg-gray-50" id="how-it-works">
        <div className="container mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <h2 className="text-3xl font-bold mb-4">How Pickle+ Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get started in minutes and begin your pickleball journey with these simple steps
            </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-2 gap-16 items-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <div className="space-y-12">
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
              className="bg-white rounded-xl shadow-lg overflow-hidden"
              variants={fadeIn}
            >
              <div className="p-4 bg-[#FF5722] text-white font-bold text-center">
                Match Recording Wizard
              </div>
              <div className="p-6">
                <div className="flex justify-between text-sm text-gray-500 mb-3">
                  <div>Step 2 of 4</div>
                  <div>Match Details</div>
                </div>
                <div className="h-1 bg-gray-200 rounded-full mb-6">
                  <div className="bg-[#FF5722] h-full rounded-full" style={{ width: '50%' }}></div>
                </div>
                <div className="space-y-4 mb-6">
                  <div>
                    <h4 className="font-medium mb-2">Match Type</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-[#FF5722] text-white p-3 rounded-lg text-center font-medium">Singles</div>
                      <div className="border border-gray-300 p-3 rounded-lg text-center">Doubles</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Scoring System</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-[#2196F3] text-white p-3 rounded-lg text-center font-medium">Standard (11 pts)</div>
                      <div className="border border-gray-300 p-3 rounded-lg text-center">Rally (15 pts)</div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between">
                  <Button variant="outline">Back</Button>
                  <Button>Continue <ArrowRight size={16} className="ml-2" /></Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 bg-[#2196F3] text-white">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Pickleball Experience?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Join thousands of players who are already tracking their progress and improving their game with Pickle+
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-[#2196F3] hover:bg-white/90"
                onClick={() => navigate("/register")}
              >
                Create Free Account
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white/10"
                onClick={() => navigate("/login")}
              >
                Sign In
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <PicklePlusTextLogo className="h-10 w-auto text-white" />
              <p className="mt-2 text-gray-400">The ultimate pickleball companion app</p>
            </div>
            <div className="flex flex-col md:flex-row gap-8">
              <div>
                <h3 className="font-bold mb-4">Features</h3>
                <ul className="space-y-2 text-gray-400">
                  <li>Match Recording</li>
                  <li>Achievement System</li>
                  <li>Tournament Passport</li>
                  <li>Player Rankings</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold mb-4">Community</h3>
                <ul className="space-y-2 text-gray-400">
                  <li>Find Players</li>
                  <li>Local Events</li>
                  <li>Forums</li>
                  <li>Coaching</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold mb-4">Company</h3>
                <ul className="space-y-2 text-gray-400">
                  <li>About Us</li>
                  <li>Contact</li>
                  <li>Privacy Policy</li>
                  <li>Terms of Service</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500">
            <p>© {new Date().getFullYear()} Pickle+. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}