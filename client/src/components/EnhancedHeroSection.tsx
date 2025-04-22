import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronDown, Trophy, LayoutDashboard } from "lucide-react";
import { PicklePlusLogo } from "@/components/icons/PicklePlusLogo";
import { ParticleBackground } from "./animations/ParticleBackground";
import { useAuth } from "@/hooks/useAuth";

export function EnhancedHeroSection() {
  const [, navigate] = useLocation();
  const { user, isLoading } = useAuth();

  return (
    <section className="relative bg-gradient-to-br from-[#FF5722] to-[#FF7043] text-white overflow-hidden">
      <div className="absolute inset-0 opacity-40">
        <ParticleBackground 
          count={60}
          colors={['#FFFFFF', '#FFD6C9', '#FFC5B3', '#FFA98C', '#FFE0D6']}
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
            <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6 border border-white/20">
              <span className="flex h-2 w-2 rounded-full bg-white mr-2 animate-pulse"></span>
              <span className="text-sm font-medium">Final Beta v0.9.0: Limited Access Available</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 leading-tight tracking-tight">
              Elevate Your Game with <br className="hidden sm:block" />
              <span className="text-white relative">
                Data-Driven Intelligence
                <svg className="absolute -bottom-1 left-0 w-full h-3 text-[#FFCCBC]" viewBox="0 0 100 15" preserveAspectRatio="none">
                  <path d="M0,7.5 C15,2.5 35,12.5 50,7.5 C65,2.5 85,12.5 100,7.5 L100,15 L0,15 Z" fill="currentColor"/>
                </svg>
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-8 sm:mb-10 font-light max-w-3xl">
              Join our thriving community of players transforming their game through 
              CourtIQ™ analytics, achievement systems, and immersive tournament experiences.
              <span className="hidden md:inline"> The final beta is now available before full launch.</span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 justify-center md:justify-start">
              {user ? (
                // Already logged in - show dashboard button
                <Button 
                  size="lg"
                  className="text-[#FF5722] bg-white hover:bg-white/90 shadow-lg text-base sm:text-lg px-4 sm:px-8 py-4 sm:py-6 h-auto font-medium w-full sm:w-auto flex items-center justify-center"
                  onClick={() => navigate("/dashboard")}
                >
                  <LayoutDashboard className="h-5 w-5 mr-2" />
                  <span>Go to Dashboard</span>
                </Button>
              ) : (
                // Not logged in - show account creation button
                <Button 
                  size="lg"
                  className="text-[#FF5722] bg-white hover:bg-white/90 shadow-xl text-base sm:text-lg px-4 sm:px-8 py-4 sm:py-6 h-auto font-semibold w-full sm:w-auto relative overflow-hidden group"
                  onClick={() => navigate("/auth")}
                  disabled={isLoading}
                >
                  <span className="relative z-10">
                    {isLoading ? "Loading..." : "Secure Your Beta Spot"}
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
                </Button>
              )}
              
              <Button 
                size="lg" 
                variant="outline"
                className="text-white border-white border-2 bg-white/10 hover:bg-white/20 text-base sm:text-lg px-4 sm:px-8 py-4 sm:py-6 h-auto font-medium w-full sm:w-auto flex items-center justify-center"
                onClick={() => {
                  document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <span className="whitespace-nowrap mr-2">See How It Works</span> <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="mt-8 sm:mt-10 flex flex-wrap justify-center md:justify-start gap-3 sm:gap-5 text-sm text-white/80">
              <div className="flex items-center">
                <div className="w-4 h-4 mr-1.5 bg-white/20 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <span>Free to create an account</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 mr-1.5 bg-white/20 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <span>No credit card required</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 mr-1.5 bg-white/20 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <span>Join our growing community</span>
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
                    <PicklePlusLogo className="h-8 w-auto" />
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
                        <div className="sm:ml-2 text-xs">Passport: {user?.passportId || "XP39R45"}</div>
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