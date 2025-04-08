import { useLocation, Link } from "wouter";
import { motion } from "framer-motion";
import { PicklePlusTextLogo } from "@/components/icons/PicklePlusTextLogo";
import { PicklePlusLogo } from "@/components/icons/PicklePlusLogo";
import { PicklePlusNewLogo } from "@/components/icons/PicklePlusNewLogo";
import { PicklePlusWhiteLogo } from "@/components/icons/PicklePlusWhiteLogo";
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
  MapPin,
  MousePointerClick,
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
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 leading-tight">
                Your Pickleball Journey, <span className="text-yellow-200">Powered by CourtIQ™</span>
              </h1>
              <p className="text-lg sm:text-xl mb-8 text-white/90 leading-relaxed">
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
            
            {/* Enhanced Player Passport Card with Live Demo Effect */}
            <motion.div 
              className="w-full md:w-1/2 flex justify-center mt-10 md:mt-0"
              initial="hidden"
              animate="visible"
              variants={slideIn("right")}
            >
              <div className="relative w-full max-w-sm sm:max-w-md perspective">
                {/* Interactive instruction tag */}
                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg z-10 flex items-center space-x-2 animate-bounce">
                  <MousePointerClick className="h-4 w-4 text-[#FF5722]" />
                  <span className="text-xs font-medium text-gray-800">Interactive Passport - Hover to Explore</span>
                </div>
                
                {/* Live updates notification */}
                <div className="absolute -right-4 -top-4 bg-[#4CAF50] text-white text-xs font-bold px-2 py-1 rounded-full z-10 shadow-lg flex items-center">
                  <div className="w-2 h-2 bg-white rounded-full mr-1 animate-ping"></div>
                  LIVE
                </div>
                
                <div className="preserve-3d passport-card hover:passport-card-rotate">
                  {/* Passport Front - with live update animations */}
                  <div className="bg-white rounded-xl shadow-2xl overflow-hidden absolute inset-0 backface-hidden">
                    {/* Header with logo */}
                    <div className="bg-gradient-to-r from-[#FF5722] to-[#FF9800] pt-3 pb-5 px-5 text-white">
                      <div className="flex justify-between items-center">
                        <div className="font-bold text-lg">Pickle+ Digital Passport</div>
                        <PicklePlusWhiteLogo className="h-10 w-auto" />
                      </div>
                      
                      {/* CourtIQ badge - enhanced */}
                      <div className="absolute top-16 right-2 bg-black/20 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium flex items-center">
                        <div className="w-2 h-2 bg-blue-300 rounded-full mr-1 animate-pulse"></div>
                        <motion.span
                          initial={{ opacity: 0.8 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                        >
                          Powered by CourtIQ™
                        </motion.span>
                      </div>
                      
                      {/* Player info */}
                      <div className="flex items-center mt-2">
                        <div className="h-16 w-16 rounded-full bg-white p-0.5 mr-3 shadow-lg">
                          <motion.div 
                            className="h-full w-full rounded-full bg-gradient-to-r from-[#2196F3] to-[#03A9F4] flex items-center justify-center text-white font-bold text-xl"
                            animate={{ 
                              boxShadow: [
                                "0 0 0 0px rgba(33, 150, 243, 0.4)",
                                "0 0 0 8px rgba(33, 150, 243, 0)"
                              ]
                            }}
                            transition={{ 
                              duration: 2,
                              repeat: Infinity,
                              repeatDelay: 1
                            }}
                          >
                            JS
                          </motion.div>
                        </div>
                        <div>
                          <div className="font-bold text-xl">John Smith</div>
                          <div className="flex items-center text-sm text-white/80 mt-0.5">
                            <motion.div 
                              className="font-medium bg-white/20 backdrop-blur-sm rounded-full px-2 py-0.5"
                              initial={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                              animate={{ backgroundColor: "rgba(255, 255, 255, 0.3)" }}
                              transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
                            >
                              3.5 Intermediate+
                            </motion.div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Stats section - with live data animation */}
                    <div className="p-4 sm:p-6">
                      {/* XP Progress - with animated progress */}
                      <div className="bg-gray-50 rounded-lg p-3 mb-4 border border-gray-100">
                        <div className="flex justify-between items-center mb-1">
                          <div className="font-bold text-gray-700">Level 5</div>
                          <motion.div 
                            className="text-[#FF5722] font-medium text-sm"
                            initial={{ opacity: 1 }}
                            animate={{ opacity: [1, 0.6, 1] }}
                            transition={{ duration: 3, repeat: Infinity }}
                          >
                            520/1000 XP
                          </motion.div>
                        </div>
                        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div 
                            className="bg-gradient-to-r from-[#FF5722] to-[#FF9800] h-full rounded-full" 
                            initial={{ width: "47%" }}
                            animate={{ width: "52%" }}
                            transition={{ duration: 2 }}
                          />
                        </div>
                      </div>
                      
                      {/* CourtIQ metrics in a grid - with highlight animations */}
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <motion.div 
                          className="bg-[#FF5722]/10 border border-[#FF5722]/20 rounded-lg p-3 text-center"
                          whileHover={{ 
                            scale: 1.05, 
                            boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                            borderColor: "rgba(255, 87, 34, 0.4)"
                          }}
                        >
                          <div className="text-[#FF5722] font-bold text-lg mb-0.5">Lvl 5</div>
                          <div className="text-xs text-gray-600">CourtIQ XP</div>
                        </motion.div>
                        <motion.div 
                          className="bg-[#2196F3]/10 border border-[#2196F3]/20 rounded-lg p-3 text-center"
                          whileHover={{ 
                            scale: 1.05, 
                            boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                            borderColor: "rgba(33, 150, 243, 0.4)"
                          }}
                          animate={{
                            borderColor: ["rgba(33, 150, 243, 0.2)", "rgba(33, 150, 243, 0.4)", "rgba(33, 150, 243, 0.2)"]
                          }}
                          transition={{ duration: 3, repeat: Infinity }}
                        >
                          <motion.div 
                            className="text-[#2196F3] font-bold text-lg mb-0.5"
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 3, repeat: Infinity }}
                          >
                            1,248
                          </motion.div>
                          <div className="text-xs text-gray-600">CourtIQ Rating</div>
                        </motion.div>
                        <motion.div 
                          className="bg-[#673AB7]/10 border border-[#673AB7]/20 rounded-lg p-3 text-center"
                          whileHover={{ 
                            scale: 1.05, 
                            boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                            borderColor: "rgba(103, 58, 183, 0.4)"
                          }}
                        >
                          <div className="text-[#673AB7] font-bold text-lg mb-0.5">7th</div>
                          <div className="text-xs text-gray-600">CourtIQ Rank</div>
                        </motion.div>
                      </div>
                      
                      {/* Additional stats with hover effects */}
                      <div className="grid grid-cols-2 gap-3">
                        <motion.div 
                          className="bg-[#4CAF50]/10 border border-[#4CAF50]/20 rounded-lg p-2 text-center"
                          whileHover={{ 
                            scale: 1.05, 
                            boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                            borderColor: "rgba(76, 175, 80, 0.4)"
                          }}
                        >
                          <div className="text-[#4CAF50] font-bold text-lg">3</div>
                          <div className="text-xs text-gray-600">Tournaments</div>
                        </motion.div>
                        <motion.div 
                          className="bg-[#FF9800]/10 border border-[#FF9800]/20 rounded-lg p-2 text-center"
                          whileHover={{ 
                            scale: 1.05, 
                            boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                            borderColor: "rgba(255, 152, 0, 0.4)"
                          }}
                        >
                          <motion.div 
                            className="text-[#FF9800] font-bold text-lg"
                            initial={{ opacity: 1 }}
                            animate={{ 
                              opacity: [1, 1, 1],
                              scale: [1, 1, 1]
                            }}
                            transition={{ 
                              duration: 8,
                              times: [0, 0.9, 1],
                              repeat: Infinity,
                              repeatDelay: 3
                            }}
                          >
                            <span className="relative">
                              <span>24</span>
                              <span className="absolute -top-1 -right-3 text-[10px] text-[#FF5722] opacity-0 animate-ping-once">+1</span>
                            </span>
                          </motion.div>
                          <div className="text-xs text-gray-600">Matches Played</div>
                        </motion.div>
                      </div>
                      
                      {/* Live activity notification */}
                      <motion.div 
                        className="mt-4 flex items-center gap-2 bg-gradient-to-r from-[#2196F3]/5 to-[#03A9F4]/5 p-2 rounded-lg border border-[#2196F3]/10"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 1.5 }}
                      >
                        <div className="bg-[#2196F3] rounded-full p-1 text-white">
                          <Trophy size={16} />
                        </div>
                        <div className="text-xs text-gray-700">Won mixed doubles tournament at Willow Park</div>
                        <div className="text-[10px] text-[#2196F3] ml-auto font-medium">+100 RP</div>
                      </motion.div>
                    </div>
                  </div>
                  
                  {/* Passport Back - with enhanced interactivity */}
                  <div className="bg-white rounded-xl shadow-2xl overflow-hidden absolute inset-0 backface-hidden passport-card-back">
                    <div className="bg-gradient-to-r from-[#2196F3] to-[#03A9F4] p-5 text-white">
                      <h3 className="font-bold text-xl flex items-center">
                        Player Achievements
                        <motion.div 
                          className="ml-2 bg-white/20 text-xs px-2 py-0.5 rounded-full"
                          animate={{ 
                            scale: [1, 1.1, 1],
                            backgroundColor: ["rgba(255,255,255,0.2)", "rgba(255,255,255,0.3)", "rgba(255,255,255,0.2)"]
                          }}
                          transition={{ duration: 3, repeat: Infinity }}
                        >
                          UPDATED
                        </motion.div>
                      </h3>
                    </div>
                    <div className="p-5">
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <motion.div 
                          className="bg-[#FFD700]/10 border border-[#FFD700]/20 rounded-lg p-3 text-center"
                          whileHover={{ scale: 1.05, boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}
                        >
                          <motion.div 
                            className="bg-[#FFD700] text-white p-2 rounded-full mx-auto mb-2 w-10 h-10 flex items-center justify-center"
                            animate={{ 
                              boxShadow: ["0 0 0 0 rgba(255, 215, 0, 0.4)", "0 0 0 10px rgba(255, 215, 0, 0)"]
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <Trophy size={20} />
                          </motion.div>
                          <div className="text-xs text-gray-600">Champion</div>
                        </motion.div>
                        <motion.div 
                          className="bg-[#4CAF50]/10 border border-[#4CAF50]/20 rounded-lg p-3 text-center" 
                          whileHover={{ scale: 1.05, boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}
                        >
                          <div className="bg-[#4CAF50] text-white p-2 rounded-full mx-auto mb-2 w-10 h-10 flex items-center justify-center">
                            <Award size={20} />
                          </div>
                          <div className="text-xs text-gray-600">Veteran</div>
                        </motion.div>
                        <motion.div 
                          className="bg-[#9C27B0]/10 border border-[#9C27B0]/20 rounded-lg p-3 text-center"
                          whileHover={{ scale: 1.05, boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}
                        >
                          <div className="bg-[#9C27B0] text-white p-2 rounded-full mx-auto mb-2 w-10 h-10 flex items-center justify-center">
                            <Star size={20} />
                          </div>
                          <div className="text-xs text-gray-600">All-Star</div>
                        </motion.div>
                      </div>
                      
                      <div className="mb-4">
                        <div className="text-sm font-bold mb-2 flex items-center">
                          Recent Matches
                          <div className="ml-2 px-1.5 py-0.5 bg-green-100 rounded-full text-[10px] text-green-700 font-medium">LIVE</div>
                        </div>
                        <div className="space-y-2">
                          <motion.div 
                            className="bg-gray-50 rounded-md p-2 flex justify-between items-center"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1 }}
                          >
                            <div className="text-xs">vs. Sarah Johnson</div>
                            <div className="text-xs font-medium text-green-600">W 11-8</div>
                          </motion.div>
                          <div className="bg-gray-50 rounded-md p-2 flex justify-between items-center">
                            <div className="text-xs">vs. Mike Taylor</div>
                            <div className="text-xs font-medium text-green-600">W 11-7</div>
                          </div>
                          <div className="bg-gray-50 rounded-md p-2 flex justify-between items-center">
                            <div className="text-xs">vs. Emma Davis</div>
                            <div className="text-xs font-medium text-red-600">L 8-11</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-center mt-4">
                        <motion.div 
                          className="inline-block bg-[#FF5722]/10 rounded-full px-3 py-2 text-sm"
                          animate={{ 
                            scale: [1, 1.03, 1],
                            backgroundColor: ["rgba(255, 87, 34, 0.1)", "rgba(255, 87, 34, 0.15)", "rgba(255, 87, 34, 0.1)"]
                          }}
                          transition={{ duration: 3, repeat: Infinity }}
                        >
                          <div className="flex items-center">
                            <MapPin size={14} className="mr-1 text-[#FF5722]" />
                            <span className="text-gray-700">Westside Pickleball Club</span>
                          </div>
                        </motion.div>
                      </div>
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

      {/* Testimonials Section */}
      <section className="py-16 sm:py-24 bg-white overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div 
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={slideUp}
          >
            <div className="mb-3 inline-block bg-[#2196F3]/10 rounded-full px-3 py-1 text-sm font-medium text-[#2196F3]">
              Player Stories
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Transforming Pickleball Journeys</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              See how players of all levels are using Pickle+ to track their progress and improve their game.
            </p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <Testimonial 
              quote="Pickle+ has completely transformed how I track my progress. The CourtIQ analytics showed me exactly where I needed to improve."
              author="Sarah Johnson"
              role="3.5 Intermediate Player"
              improvement="Improved from 3.0 to 3.5 in just 3 months"
            />
            <Testimonial 
              quote="The tournament passport feature makes check-ins so easy. I love how I can see my entire match history and progression over time."
              author="Michael Rodriguez"
              role="4.0 Advanced Player"
              improvement="Won 2 local tournaments after 6 months with Pickle+"
            />
            <Testimonial 
              quote="As a founding member, I've watched Pickle+ evolve into an amazing tool. The XP system keeps me motivated to play more often."
              author="Jessica Chen"
              role="Founding Member"
              improvement="Improved win rate from 58% to 72% in one season"
            />
          </motion.div>
        </div>
      </section>

      {/* CourtIQ Technology Section with animated graphics */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-[#2196F3]/5 to-[#03A9F4]/10 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={slideIn("left")}
            >
              <div className="mb-3 inline-block bg-[#2196F3]/20 rounded-full px-3 py-1 text-sm font-medium text-[#2196F3]">
                CourtIQ™ Technology
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Advanced Analytics Designed for Pickleball</h2>
              <p className="text-lg text-gray-600 mb-6">
                Our proprietary CourtIQ™ system analyzes your play patterns, tracks your improvement, and provides personalized insights to elevate your game.
              </p>
              
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 bg-[#2196F3]/10 p-2 rounded-full text-[#2196F3] mt-1">
                    <Check size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Multi-Dimensional Rating</h3>
                    <p className="text-gray-600">Track your skills across multiple dimensions including power, control, strategy, and mobility.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 bg-[#2196F3]/10 p-2 rounded-full text-[#2196F3] mt-1">
                    <Check size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Personalized Improvement Path</h3>
                    <p className="text-gray-600">Get tailored recommendations to improve your specific weaknesses and enhance your strengths.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 bg-[#2196F3]/10 p-2 rounded-full text-[#2196F3] mt-1">
                    <Check size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Progress Visualization</h3>
                    <p className="text-gray-600">See your improvement over time with beautiful charts and progression timelines.</p>
                  </div>
                </li>
              </ul>
            </motion.div>
            
            <motion.div
              className="relative"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={slideIn("right")}
            >
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <h3 className="font-bold text-xl mb-4 text-[#2196F3]">CourtIQ™ Player Dashboard</h3>
                
                {/* Radar Chart Visualization (Simulated) */}
                <div className="relative w-full aspect-square max-w-md mx-auto mb-6">
                  <div className="absolute inset-0 bg-[#2196F3]/5 rounded-full"></div>
                  <div className="absolute inset-4 bg-[#2196F3]/10 rounded-full"></div>
                  <div className="absolute inset-8 bg-[#2196F3]/15 rounded-full"></div>
                  <div className="absolute inset-12 bg-[#2196F3]/20 rounded-full"></div>
                  
                  {/* Skill Points with animation */}
                  <div className="absolute top-[15%] left-[50%] transform -translate-x-1/2 h-4 w-4 bg-[#FF5722] rounded-full"></div>
                  <div className="absolute top-[50%] left-[85%] transform -translate-y-1/2 h-4 w-4 bg-[#4CAF50] rounded-full"></div>
                  <div className="absolute bottom-[15%] left-[50%] transform -translate-x-1/2 h-4 w-4 bg-[#2196F3] rounded-full"></div>
                  <div className="absolute top-[50%] left-[15%] transform -translate-y-1/2 h-4 w-4 bg-[#9C27B0] rounded-full"></div>
                  
                  {/* Skill Radar (Simulated) */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-[65%] h-[65%] bg-[#2196F3]/30 rounded-full backdrop-blur-sm"></div>
                  </div>
                  
                  {/* Skill Labels */}
                  <div className="absolute top-[5%] left-[50%] transform -translate-x-1/2 text-sm font-medium">Power</div>
                  <div className="absolute top-[50%] right-[5%] transform translate-y-[-50%] text-sm font-medium">Control</div>
                  <div className="absolute bottom-[5%] left-[50%] transform -translate-x-1/2 text-sm font-medium">Strategy</div>
                  <div className="absolute top-[50%] left-[5%] transform translate-y-[-50%] text-sm font-medium">Mobility</div>
                </div>
                
                {/* Skill Rankings */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#FF5722]/10 rounded-lg p-3">
                    <div className="text-sm text-gray-600 mb-1">Power Rating</div>
                    <div className="text-xl font-bold text-[#FF5722]">8.2</div>
                    <div className="text-xs text-gray-500">+0.5 this month</div>
                  </div>
                  <div className="bg-[#4CAF50]/10 rounded-lg p-3">
                    <div className="text-sm text-gray-600 mb-1">Control Rating</div>
                    <div className="text-xl font-bold text-[#4CAF50]">7.8</div>
                    <div className="text-xs text-gray-500">+0.3 this month</div>
                  </div>
                  <div className="bg-[#2196F3]/10 rounded-lg p-3">
                    <div className="text-sm text-gray-600 mb-1">Strategy Rating</div>
                    <div className="text-xl font-bold text-[#2196F3]">8.5</div>
                    <div className="text-xs text-gray-500">+0.7 this month</div>
                  </div>
                  <div className="bg-[#9C27B0]/10 rounded-lg p-3">
                    <div className="text-sm text-gray-600 mb-1">Mobility Rating</div>
                    <div className="text-xl font-bold text-[#9C27B0]">7.5</div>
                    <div className="text-xs text-gray-500">+0.2 this month</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Founding Member Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-black to-[#222] text-white overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={slideIn("left")}
              className="order-2 md:order-1"
            >
              <div className="bg-gradient-to-r from-[#FFD700]/20 to-[#FFA000]/20 p-1 rounded-xl">
                <div className="bg-black rounded-lg p-6 border border-[#FFD700]/30">
                  <div className="flex items-center mb-4">
                    <div className="bg-gradient-to-r from-[#FFD700] to-[#FFA000] p-3 rounded-full mr-4">
                      <Star size={24} className="text-black" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#FFD700]">Founding Member Benefits</h3>
                  </div>
                  
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <div className="flex-shrink-0 text-[#FFD700] mt-1">
                        <Check size={18} />
                      </div>
                      <div>
                        <p className="text-white/90">Premium golden accents and exclusive founding member badge</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="flex-shrink-0 text-[#FFD700] mt-1">
                        <Check size={18} />
                      </div>
                      <div>
                        <p className="text-white/90">10% XP boost on all activities for faster progression</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="flex-shrink-0 text-[#FFD700] mt-1">
                        <Check size={18} />
                      </div>
                      <div>
                        <p className="text-white/90">Priority placement in tournament registrations and events</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="flex-shrink-0 text-[#FFD700] mt-1">
                        <Check size={18} />
                      </div>
                      <div>
                        <p className="text-white/90">Early access to new features and updates before general release</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="flex-shrink-0 text-[#FFD700] mt-1">
                        <Check size={18} />
                      </div>
                      <div>
                        <p className="text-white/90">Exclusive founding member community and events</p>
                      </div>
                    </li>
                  </ul>
                  
                  <div className="mt-6">
                    <Link href="/register">
                      <Button 
                        size="lg" 
                        className="bg-gradient-to-r from-[#FFD700] to-[#FFA000] text-black hover:opacity-90 w-full"
                      >
                        Become a Founding Member
                      </Button>
                    </Link>
                    <p className="text-center text-white/60 text-sm mt-2">Limited availability - Join now to secure your place</p>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={slideIn("right")}
              className="order-1 md:order-2"
            >
              <div className="mb-3 inline-block bg-[#FFD700]/20 rounded-full px-3 py-1 text-sm font-medium text-[#FFD700]">
                Exclusive Opportunity
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Join as a <span className="text-[#FFD700]">Founding Member</span></h2>
              <p className="text-lg text-white/80 mb-6">
                Become part of our exclusive founding community and enjoy special benefits that will enhance your Pickle+ experience.
              </p>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <Users size={20} className="text-[#FFD700]" />
                  <div className="text-lg font-medium">Founding Community</div>
                </div>
                <p className="text-white/70">
                  Connect with other passionate founding members who are helping shape the future of Pickle+.
                </p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Award size={20} className="text-[#FFD700]" />
                  <div className="text-lg font-medium">Permanent Recognition</div>
                </div>
                <p className="text-white/70">
                  Your status as a founding member never expires and will always be proudly displayed on your profile.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-[#FF5722] to-[#FF8A65] text-white">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">Ready to Level Up Your Pickleball Journey?</h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto text-white/90">
              Join Pickle+ today and start tracking your progress, connecting with players, and elevating your game.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button 
                  size="lg" 
                  className="bg-white text-[#FF5722] hover:bg-white/90"
                >
                  Create Account
                </Button>
              </Link>
              <Link href="/login">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white border-2 text-white hover:bg-white/10 hover:border-white bg-transparent"
                >
                  Login
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <PicklePlusTextLogo className="h-8 w-auto mb-4 md:mb-0" />
            <div className="flex items-center space-x-4">
              <a href="#" className="text-white/70 hover:text-white transition-colors">
                Terms
              </a>
              <a href="#" className="text-white/70 hover:text-white transition-colors">
                Privacy
              </a>
              <a href="#" className="text-white/70 hover:text-white transition-colors">
                Help
              </a>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center md:text-left">
            <p className="text-white/50 text-sm">
              © {new Date().getFullYear()} Pickle+. All rights reserved. Powered by CourtIQ™.
            </p>
          </div>
        </div>
      </footer>

      {/* CSS for 3D Card Effect */}
      <style dangerouslySetInnerHTML={{__html: `
        .perspective {
          perspective: 1500px;
        }
        
        .preserve-3d {
          transform-style: preserve-3d;
          transition: transform 1s;
        }
        
        .backface-hidden {
          backface-visibility: hidden;
        }
        
        .passport-card-back {
          transform: rotateY(180deg);
        }
        
        .passport-card-rotate {
          transform: rotateY(180deg);
        }
        
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float 5s ease-in-out 1s infinite;
        }
        
        .animate-float-slow {
          animation: float 6s ease-in-out 2s infinite;
        }
      `}} />
    </div>
  );
}