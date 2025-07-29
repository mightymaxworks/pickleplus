import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronDown, Trophy, LayoutDashboard } from "lucide-react";
import { LanguageAwareLogo } from "@/components/icons/LanguageAwareLogo";
import { ParticleBackground } from "./animations/ParticleBackground";
import { useAuth } from "@/contexts/AuthContext";
import { DemoPlayerPassport } from '@/components/dashboard/DemoPlayerPassport';

export function EnhancedHeroSection() {
  const [, navigate] = useLocation();
  const { user, isLoading } = useAuth();

  return (
    <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden min-h-screen flex items-center">
      <div className="absolute inset-0 bg-gradient-to-r from-orange-600/10 to-cyan-500/10"></div>
      <div className="absolute inset-0 opacity-20">
        <ParticleBackground 
          count={40}
          colors={['#FF5722', '#F4511E', '#E64A19', '#00BCD4', '#00ACC1']}
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
            <div className="inline-flex items-center bg-orange-500/20 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6 border border-orange-400/50 shadow-lg">
              <span className="flex h-2 w-2 rounded-full bg-orange-500 mr-2 animate-pulse"></span>
              <span className="text-sm font-medium text-orange-100">PCP Certification • DUPR Integration • Mobile-First</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 leading-tight tracking-tight">
              Your Pickleball <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-orange-500 to-cyan-400 bg-clip-text text-transparent relative">
                Growth Platform
                <svg className="absolute -bottom-1 left-0 w-full h-3 text-orange-300/50" viewBox="0 0 100 15" preserveAspectRatio="none">
                  <path d="M0,7.5 C15,2.5 35,12.5 50,7.5 C65,2.5 85,12.5 100,7.5 L100,15 L0,15 Z" fill="currentColor"/>
                </svg>
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-8 sm:mb-10 font-light max-w-3xl leading-relaxed">
              Track your progress, improve your skills, and connect with the pickleball community. 
              <span className="hidden md:inline">From beginner to pro, we help every player reach their potential.</span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 justify-center md:justify-start">
              {user ? (
                // Already logged in - show dashboard button
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl text-base sm:text-lg px-6 py-3 rounded-full font-medium w-full sm:w-auto flex items-center justify-center transition-all duration-300"
                  onClick={() => navigate("/dashboard")}
                >
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  <span>Go to Dashboard</span>
                </Button>
              ) : (
                // Not logged in - show account creation button
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl text-base sm:text-lg px-6 py-3 rounded-full font-medium w-full sm:w-auto relative overflow-hidden group transition-all duration-300"
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
                className="text-cyan-400 border-cyan-400 border-2 bg-cyan-400/10 hover:bg-cyan-400/20 backdrop-blur-sm text-base sm:text-lg px-6 py-3 rounded-full font-medium w-full sm:w-auto flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300"
                onClick={() => {
                  document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <span className="whitespace-nowrap mr-2">See How It Works</span> <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="mt-8 sm:mt-10 flex flex-wrap justify-center md:justify-start gap-3 sm:gap-5 text-sm text-gray-300">
              <div className="flex items-center">
                <div className="w-4 h-4 mr-1.5 bg-orange-500/20 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                </div>
                <span>Free to create an account</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 mr-1.5 bg-orange-500/20 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                </div>
                <span>No credit card required</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 mr-1.5 bg-orange-500/20 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                </div>
                <span>Join thousands of players worldwide</span>
              </div>
            </div>
          </motion.div>
          
          {/* Live Passport Component */}
          <motion.div 
            className="md:col-span-5"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="relative max-w-sm mx-auto">
              {/* Card glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-white/30 to-[#FFC107]/30 rounded-2xl blur-xl opacity-70"></div>
              
              {/* Demo passport component showing authentic design */}
              <div className="relative">
                <DemoPlayerPassport />
              </div>
              
              {/* Shadow decoration */}
              <div className="absolute -bottom-4 left-4 right-4 h-4 bg-black/5 blur-xl rounded-full"></div>
            </div>
          </motion.div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-cyan-400/80 animate-bounce">
          <ChevronDown size={24} />
        </div>
      </div>
    </section>
  );
}