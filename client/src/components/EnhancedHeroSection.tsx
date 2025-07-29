import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronDown, Trophy, LayoutDashboard } from "lucide-react";
import { LanguageAwareLogo } from "@/components/icons/LanguageAwareLogo";
import { ParticleBackground } from "./animations/ParticleBackground";
import { useAuth } from "@/contexts/AuthContext";

export function EnhancedHeroSection() {
  const [, navigate] = useLocation();
  const { user, isLoading } = useAuth();

  return (
    <section className="relative bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 text-gray-900 overflow-hidden min-h-screen flex items-center">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5"></div>
      <div className="absolute inset-0 opacity-30">
        <ParticleBackground 
          count={40}
          colors={['#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#C084FC']}
        />
      </div>
      
      <div className="container relative z-10 mx-auto px-4 sm:px-6 py-16 md:py-24">
        <div className="grid md:grid-cols-12 gap-8 md:gap-12 items-center">
          {/* Content */}
          <motion.div 
            className="md:col-span-7 text-center md:text-left"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center bg-white/60 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6 border border-blue-200/50 shadow-lg">
              <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2 animate-pulse"></span>
              <span className="text-sm font-medium text-gray-700">Platform Evolution: Advanced Features Now Live</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 leading-tight tracking-tight">
              Transform Your Pickleball <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent relative">
                Experience Forever
                <svg className="absolute -bottom-1 left-0 w-full h-3 text-blue-200" viewBox="0 0 100 15" preserveAspectRatio="none">
                  <path d="M0,7.5 C15,2.5 35,12.5 50,7.5 C65,2.5 85,12.5 100,7.5 L100,15 L0,15 Z" fill="currentColor"/>
                </svg>
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-8 sm:mb-10 font-light max-w-3xl leading-relaxed">
              Join thousands of players elevating their game through intelligent analytics, 
              professional coaching, and dynamic community experiences. 
              <span className="hidden md:inline">Where every match becomes a pathway to mastery.</span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 justify-center md:justify-start">
              {user ? (
                // Already logged in - show dashboard button
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl text-base sm:text-lg px-6 py-3 rounded-full font-medium w-full sm:w-auto flex items-center justify-center transition-all duration-300"
                  onClick={() => navigate("/dashboard")}
                >
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  <span>Go to Dashboard</span>
                </Button>
              ) : (
                // Not logged in - show account creation button
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl text-base sm:text-lg px-6 py-3 rounded-full font-medium w-full sm:w-auto relative overflow-hidden group transition-all duration-300"
                  onClick={() => navigate("/auth")}
                  disabled={isLoading}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <Trophy className="h-4 w-4" />
                    {isLoading ? "Loading..." : "Start Your Journey"}
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
                </Button>
              )}
              
              <Button 
                size="lg" 
                variant="outline"
                className="text-blue-600 border-blue-600 border-2 bg-white/60 hover:bg-blue-50 backdrop-blur-sm text-base sm:text-lg px-6 py-3 rounded-full font-medium w-full sm:w-auto flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300"
                onClick={() => {
                  document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <span className="whitespace-nowrap mr-2">See How It Works</span> <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="mt-8 sm:mt-10 flex flex-wrap justify-center md:justify-start gap-3 sm:gap-5 text-sm text-gray-600">
              <div className="flex items-center">
                <div className="w-4 h-4 mr-1.5 bg-blue-100 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                </div>
                <span>Free to create an account</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 mr-1.5 bg-blue-100 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                </div>
                <span>No credit card required</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 mr-1.5 bg-blue-100 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                </div>
                <span>Join thousands of players worldwide</span>
              </div>
            </div>
          </motion.div>
          
          {/* Passport Card */}
          <motion.div 
            className="md:col-span-5"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="relative max-w-sm mx-auto">
              {/* Card glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-white/30 to-[#FFC107]/30 rounded-2xl blur-xl opacity-70"></div>
              
              {/* Card container */}
              <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden">
                {/* Header with logo */}
                <div className="bg-gradient-to-r from-[#FF5722] to-[#FF9800] pt-4 pb-6 px-5 text-white">
                  <div className="flex flex-col sm:flex-row justify-center sm:justify-between items-center">
                    <div className="font-bold text-xl mb-2 sm:mb-0">Player Passport</div>
                    <LanguageAwareLogo className="h-8 w-auto" />
                  </div>
                  
                  {/* CourtIQ badge */}
                  <div className="absolute hidden sm:flex top-16 right-3 bg-black/20 px-2 py-1 rounded-full text-xs font-medium items-center">
                    <div className="w-2 h-2 bg-blue-300 rounded-full mr-1"></div>
                    Powered by CourtIQ™
                  </div>
                  {/* Mobile CourtIQ badge */}
                  <div className="flex sm:hidden justify-center mt-2 bg-black/20 px-2 py-1 rounded-full text-xs font-medium items-center w-fit mx-auto">
                    <div className="w-2 h-2 bg-blue-300 rounded-full mr-1"></div>
                    Powered by CourtIQ™
                  </div>
                  
                  {/* Player info */}
                  <div className="flex flex-col sm:flex-row sm:items-center mt-3">
                    <div className="h-16 w-16 rounded-full bg-white p-0.5 mx-auto sm:mx-0 sm:mr-3 shadow-lg mb-2 sm:mb-0">
                      <div className="h-full w-full rounded-full bg-gradient-to-r from-[#2196F3] to-[#03A9F4] flex items-center justify-center text-white font-bold text-2xl">
                        {user ? user.displayName?.substring(0, 2).toUpperCase() : "JS"}
                      </div>
                    </div>
                    <div className="text-center sm:text-left">
                      <div className="font-bold text-2xl">{user ? user.displayName : "John Smith"}</div>
                      <div className="flex flex-col sm:flex-row items-center text-sm text-white/80 mt-1">
                        <div className="font-medium bg-white/20 rounded-full px-2 py-0.5 flex items-center mb-1 sm:mb-0">
                          <span className="w-1.5 h-1.5 bg-white rounded-full mr-1"></span>
                          {user?.skillLevel || "3.5 Intermediate+"}
                        </div>
                        <div className="sm:ml-2 text-xs">Passport: {user?.passportCode || "XP39R45"}</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Stats section */}
                <div className="p-5">
                  {/* XP Progress */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-4 border border-gray-100">
                    <div className="flex justify-between items-center mb-1">
                      <div className="font-bold text-gray-700">Level 5</div>
                      <div className="text-[#FF5722] font-medium text-sm">520/1000 XP</div>
                    </div>
                    <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-[#FF5722] to-[#FF9800] h-full rounded-full" style={{ width: '52%' }}></div>
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
                  
                  {/* Activity badge - latest achievement */}
                  <div className="mt-4 flex flex-wrap items-center gap-2 bg-gradient-to-r from-[#2196F3]/5 to-[#03A9F4]/5 p-2 rounded-lg border border-[#2196F3]/10">
                    <div className="bg-[#2196F3] rounded-full p-1 text-white">
                      <Trophy size={16} />
                    </div>
                    <div className="text-xs text-gray-700 flex-1 min-w-0">Won mixed doubles tournament at Willow Park</div>
                    <div className="text-[10px] text-[#2196F3] font-medium ml-auto mt-0 sm:mt-0">+100 RP</div>
                  </div>
                </div>
              </div>
              
              {/* Shadow decoration */}
              <div className="absolute -bottom-4 left-4 right-4 h-4 bg-black/5 blur-xl rounded-full"></div>
            </div>
          </motion.div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white/80 animate-bounce">
          <ChevronDown size={24} />
        </div>
      </div>
    </section>
  );
}