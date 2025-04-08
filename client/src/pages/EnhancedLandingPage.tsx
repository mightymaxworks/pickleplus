import { useLocation, Link } from "wouter";
import { motion } from "framer-motion";
import React from "react";
import { PicklePlusNewLogo } from "../components/icons/PicklePlusNewLogo";
import { Button } from "@/components/ui/button";
import { 
  ChevronDown, 
  Award, 
  Calendar, 
  BarChart, 
  ArrowRight, 
  Users, 
  Trophy, 
  Zap,
  Star,
  Check,
  MapPin
} from "lucide-react";

// Enhanced animation variants with more refined animations
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const slideUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" }
  }
};

const slideIn = (direction: "left" | "right") => ({
  hidden: { 
    opacity: 0, 
    x: direction === "left" ? -40 : 40 
  },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.8, ease: "easeOut" }
  }
});

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

// Enhanced feature card with interactive elements
const EnhancedFeatureCard = ({ 
  icon, 
  title, 
  description,
  color = "#FF5722"
}: { 
  icon: React.ReactNode, 
  title: string, 
  description: string,
  color?: string
}) => {
  return (
    <motion.div 
      className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
      variants={fadeIn}
      whileHover={{ 
        y: -8, 
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        transition: { duration: 0.2 } 
      }}
    >
      <div className={`mb-4 text-[${color}] bg-[${color}]/10 p-3 rounded-full inline-block`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </motion.div>
  );
};

// Enhanced testimonial component
const Testimonial = ({ 
  quote, 
  author, 
  role, 
  imageSrc,
  improvement
}: {
  quote: string,
  author: string,
  role: string,
  imageSrc?: string,
  improvement: string
}) => {
  return (
    <motion.div 
      className="bg-white rounded-xl p-6 shadow-md border border-gray-100"
      variants={fadeIn}
    >
      <div className="flex items-start gap-4 mb-4">
        <div className="h-12 w-12 rounded-full bg-gradient-to-r from-[#2196F3] to-[#03A9F4] flex-shrink-0 flex items-center justify-center text-white font-bold text-lg">
          {imageSrc ? (
            <img src={imageSrc} alt={author} className="h-12 w-12 rounded-full object-cover" />
          ) : (
            author.substring(0, 2)
          )}
        </div>
        <div>
          <h4 className="font-bold text-lg">{author}</h4>
          <p className="text-sm text-gray-500">{role}</p>
        </div>
      </div>
      <p className="text-gray-700 italic mb-4">"{quote}"</p>
      <div className="flex items-center gap-2 bg-[#4CAF50]/10 rounded-lg p-2 text-sm">
        <div className="bg-[#4CAF50] rounded-full p-1 text-white">
          <Check size={14} />
        </div>
        <span className="text-gray-700">
          {improvement}
        </span>
      </div>
    </motion.div>
  );
};

export default function EnhancedLandingPage() {
  const [, navigate] = useLocation();
  
  return (
    <div className="enhanced-landing-page overflow-x-hidden w-full">
      {/* Clean, minimal navigation */}
      <header className="py-4 px-4 sm:px-6 absolute top-0 left-0 right-0 z-50">
        <div className="container mx-auto">
          <div className="flex justify-center md:justify-end">
            <nav className="flex items-center space-x-3 md:space-x-6">
              <a href="#features" className="text-white hover:text-white/90 font-medium text-xs sm:text-sm">Features</a>
              <a href="#technology" className="text-white hover:text-white/90 font-medium text-xs sm:text-sm">Technology</a>
              <a href="#founding" className="text-white hover:text-white/90 font-medium text-xs sm:text-sm">Founding Members</a>
            </nav>
          </div>
        </div>
      </header>
      
      {/* Enhanced Hero Section with animated elements */}
      <section className="relative bg-gradient-to-br from-[#FF5722] via-[#FF7043] to-[#FF8A65] text-white py-20 md:py-28 overflow-hidden">
        {/* Animated pattern overlay */}
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10 animate-pulse"></div>
        
        {/* Animated pickle ball shapes in background */}
        <div className="absolute top-20 right-10 w-20 h-20 bg-white/10 rounded-full blur-sm animate-float"></div>
        <div className="absolute bottom-10 left-10 w-16 h-16 bg-white/10 rounded-full blur-sm animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/4 w-12 h-12 bg-white/10 rounded-full blur-sm animate-float-slow"></div>
        
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-10">
            <motion.div 
              className="w-full md:w-1/2 text-center md:text-left"
              initial="hidden"
              animate="visible"
              variants={slideIn("left")}
            >
              <div className="mb-2 inline-block bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-medium">
                🔥 Level up your Pickleball game
              </div>
              <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-bold mb-4 leading-tight">
                Your Pickleball Journey, <span className="text-yellow-200">Powered by CourtIQ™</span>
              </h1>
              <p className="text-base xs:text-lg sm:text-xl mb-6 md:mb-8 text-white/90 leading-relaxed">
                Pickle+ Passport with CourtIQ™ analytics tracks your progress, connects you with the community, and elevates your game with real-time insights and rewards.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link href="/auth">
                  <Button 
                    size="lg" 
                    className="bg-white text-[#FF5722] hover:bg-white/90 w-full sm:w-auto"
                  >
                    Get Started
                  </Button>
                </Link>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white border-2 text-white hover:bg-white/10 hover:border-white w-full sm:w-auto bg-black/20"
                  onClick={() => {
                    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  See Features
                </Button>
              </div>
              
              {/* Founding member highlight */}
              <div className="mt-8 inline-flex items-center gap-2 bg-black/20 backdrop-blur-sm rounded-full px-4 py-2">
                <Star className="text-yellow-300 h-5 w-5" />
                <span className="text-yellow-200 font-medium">Limited Founding Member slots available - Pickle+</span>
              </div>
            </motion.div>
            
            {/* Simple Static Player Passport Card - Mobile Optimized */}
            <motion.div 
              className="w-full md:w-1/2 flex justify-center mt-10 md:mt-0"
              initial="hidden"
              animate="visible"
              variants={slideIn("right")}
            >
              <div className="relative w-full max-w-[320px] xs:max-w-[350px] sm:max-w-md">
                {/* Static instruction tag */}
                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm px-3 py-1.5 sm:px-4 sm:py-2 rounded-full shadow-lg z-10 flex items-center space-x-2">
                  <Star className="h-3 w-3 sm:h-4 sm:w-4 text-[#FF5722]" />
                  <span className="text-[10px] sm:text-xs font-medium text-gray-800">Player Passport Preview</span>
                </div>
                
                {/* Live updates notification */}
                <div className="absolute -right-2 sm:-right-4 -top-2 sm:-top-4 bg-[#4CAF50] text-white text-[10px] xs:text-xs font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full z-10 shadow-lg flex items-center">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full mr-1 animate-ping"></div>
                  LIVE
                </div>
                
                {/* Simplified static passport */}
                <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
                  {/* Header with logo */}
                  <div className="bg-gradient-to-r from-[#FF5722] to-[#FF9800] pt-3 pb-5 px-5 text-white">
                    <div className="flex justify-between items-center">
                      <div className="font-bold text-lg">Pickle+ Digital Passport</div>
                      <PicklePlusNewLogo className="h-10 w-auto" />
                    </div>
                    
                    {/* CourtIQ badge */}
                    <div className="absolute top-16 right-2 bg-black/20 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium flex items-center">
                      <div className="w-2 h-2 bg-blue-300 rounded-full mr-1 animate-pulse"></div>
                      <span>Powered by CourtIQ™</span>
                    </div>
                    
                    {/* Player info */}
                    <div className="flex items-center mt-2">
                      <div className="h-16 w-16 rounded-full bg-white p-0.5 mr-3 shadow-lg">
                        <div className="h-full w-full rounded-full bg-gradient-to-r from-[#2196F3] to-[#03A9F4] flex items-center justify-center text-white font-bold text-xl">
                          JS
                        </div>
                      </div>
                      <div>
                        <div className="font-bold text-xl">John Smith</div>
                        <div className="flex items-center text-sm text-white/80 mt-0.5">
                          <div className="font-medium bg-white/20 backdrop-blur-sm rounded-full px-2 py-0.5">
                            3.5 Intermediate+
                          </div>
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
                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div className="bg-gradient-to-r from-[#FF5722] to-[#FF9800] h-full rounded-full w-[52%]"></div>
                      </div>
                    </div>
                    
                    {/* CourtIQ metrics in a grid */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="bg-[#FF5722]/10 border border-[#FF5722]/20 rounded-lg p-3 text-center">
                        <div className="text-[#FF5722] font-bold text-lg mb-0.5">Lvl 5</div>
                        <div className="text-xs text-gray-600">CourtIQ XP</div>
                      </div>
                      <div className="bg-[#2196F3]/10 border border-[#2196F3]/20 rounded-lg p-3 text-center">
                        <div className="text-[#2196F3] font-bold text-lg mb-0.5">1,248</div>
                        <div className="text-xs text-gray-600">CourtIQ Rating</div>
                      </div>
                      <div className="bg-[#673AB7]/10 border border-[#673AB7]/20 rounded-lg p-3 text-center">
                        <div className="text-[#673AB7] font-bold text-lg mb-0.5">7th</div>
                        <div className="text-xs text-gray-600">CourtIQ Rank</div>
                      </div>
                    </div>
                    
                    {/* Additional stats */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-[#4CAF50]/10 border border-[#4CAF50]/20 rounded-lg p-2 text-center">
                        <div className="text-[#4CAF50] font-bold text-lg">3</div>
                        <div className="text-xs text-gray-600">Tournaments</div>
                      </div>
                      <div className="bg-[#FF9800]/10 border border-[#FF9800]/20 rounded-lg p-2 text-center">
                        <div className="text-[#FF9800] font-bold text-lg">24</div>
                        <div className="text-xs text-gray-600">Matches Played</div>
                      </div>
                    </div>
                    
                    {/* Recent activity */}
                    <div className="mt-4 flex items-center gap-2 bg-gradient-to-r from-[#2196F3]/5 to-[#03A9F4]/5 p-2 rounded-lg border border-[#2196F3]/10">
                      <div className="bg-[#2196F3] rounded-full p-1 text-white">
                        <Trophy size={16} />
                      </div>
                      <div className="text-xs text-gray-700">Won mixed doubles tournament at Willow Park</div>
                      <div className="text-[10px] text-[#2196F3] ml-auto font-medium">+100 RP</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white/80 animate-bounce">
            <ChevronDown size={24} />
          </div>
        </div>
      </section>

      {/* Features Section with enhanced card design */}
      <section id="features" className="py-16 sm:py-24 bg-gray-50 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div 
            className="text-center mb-12 sm:mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={slideUp}
          >
            <div className="mb-3 inline-block bg-[#FF5722]/10 rounded-full px-3 py-1 text-sm font-medium text-[#FF5722]">
              Intelligent Features
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Passport for the Modern Player</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Pickle+ brings your pickleball journey to life with CourtIQ™ analytics designed to help you track, improve, and enjoy the game.
            </p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <EnhancedFeatureCard 
              icon={<BarChart size={28} />} 
              title="Smart Match Tracking" 
              description="Record matches with our intuitive wizard. Get instant performance insights after every game."
              color="#FF5722"
            />
            <EnhancedFeatureCard 
              icon={<Award size={28} />} 
              title="Achievement System" 
              description="Unlock rewards as you progress through your pickleball journey with personalized challenges."
              color="#4CAF50"
            />
            <EnhancedFeatureCard 
              icon={<Calendar size={28} />} 
              title="Tournament Passport" 
              description="Register for tournaments and check in with your QR code. Track your tournament history."
              color="#2196F3"
            />
            <EnhancedFeatureCard 
              icon={<Users size={28} />} 
              title="Community Connect" 
              description="Find players at your skill level, organize matches, and build your pickleball network."
              color="#9C27B0"
            />
          </motion.div>
        </div>
      </section>

      {/* Call-to-action Section */}
      <section id="founding" className="py-16 sm:py-24 bg-[#FF5722] text-white overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={slideUp}
            >
              <div className="inline-flex items-center justify-center mb-4">
                <Star className="text-yellow-300 h-6 w-6 mr-2" />
                <span className="text-yellow-300 text-lg font-bold">Founding Members Program</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">Join the Pickle+ Movement</h2>
              <p className="text-lg mb-8 text-white/90 max-w-3xl mx-auto">
                Become a founding member and get lifetime access to premium features, exclusive tournament invites, and be part of shaping the future of pickleball technology.
              </p>
              <Link href="/auth">
                <Button 
                  size="lg" 
                  className="bg-white text-[#FF5722] hover:bg-white/90 font-bold"
                >
                  Become a Founding Member
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <PicklePlusNewLogo className="h-8 w-auto mb-4" />
              <p className="text-gray-400 text-sm mb-4">
                Revolutionizing the pickleball experience with cutting-edge technology and community focus.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">Twitter</span>
                  {/* Twitter icon placeholder */}
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">Instagram</span>
                  {/* Instagram icon placeholder */}
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">Features</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Player Passport</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">CourtIQ™ Analytics</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Tournament Hub</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Achievement System</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Tutorials</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Support</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} Pickle+. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* CSS Styles for specific animations */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }

        @keyframes float-delayed {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0px); }
        }

        @keyframes float-slow {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
          100% { transform: translateY(0px); }
        }

        @keyframes ping-once {
          0% { transform: scale(0.2); opacity: 0; }
          70% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 0; }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }

        .animate-float-slow {
          animation: float-slow 10s ease-in-out infinite;
        }

        .animate-ping-once {
          animation: ping-once 2s cubic-bezier(0, 0, 0.2, 1) forwards;
        }

        .xs\\:max-w-[350px] {
          max-width: 350px;
        }

        .xs\\:text-4xl {
          font-size: 2.25rem;
          line-height: 2.5rem;
        }

        .xs\\:text-lg {
          font-size: 1.125rem;
          line-height: 1.75rem;
        }

        .xs\\:text-xs {
          font-size: 0.75rem;
          line-height: 1rem;
        }

        @media (min-width: 320px) and (max-width: 480px) {
          .xs\\:max-w-[350px] {
            max-width: 350px;
          }
          
          .xs\\:text-4xl {
            font-size: 2.25rem;
            line-height: 2.5rem;
          }
          
          .xs\\:text-lg {
            font-size: 1.125rem;
            line-height: 1.75rem;
          }
          
          .xs\\:text-xs {
            font-size: 0.75rem;
            line-height: 1rem;
          }
        }
      `}</style>
    </div>
  );
}