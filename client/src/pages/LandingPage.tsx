import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { PicklePlusTextLogo } from "@/components/icons/PicklePlusTextLogo";
import { PicklePlusLogo } from "@/components/icons/PicklePlusLogo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronDown, Award, Calendar, BarChart, ArrowRight, Users, Trophy, Zap,
  Activity, LayoutDashboard, Check, Play, Download, ChevronsRight, Star
} from "lucide-react";
import { useKonamiCode } from "@/hooks/useKonamiCode";
import { EasterEggModal } from "@/components/EasterEggModal";
import { useState, useEffect } from "react";
import { Features, useFeatureFlag } from "@/lib/featureFlags";
import BounceMascot from "@/modules/guidance-mini/components/BounceMascot";
import Footer from "@/components/Footer";

// Import enhanced components
import { EnhancedHeroSection } from "@/components/EnhancedHeroSection";
import { CourtIQExplanationSection } from "@/components/CourtIQExplanationSection";
import { RatingSystemsIntegrationSection } from "@/components/RatingSystemsIntegrationSection";
import { EnhancedChangelogSection } from "@/components/EnhancedChangelogSection";

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
      className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-100/50"
      variants={fadeIn}
      whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.3 } }}
    >
      <div className="mb-4 text-blue-600">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2 text-gray-900">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
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
      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
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
  const [isEasterEggModalOpen, setIsEasterEggModalOpen] = useState(false);
  const showMascot = useFeatureFlag(Features.GUIDANCE_MASCOT);
  
  // Set up Konami code detection
  const { konamiDetected, reset } = useKonamiCode();
  
  // Show Easter egg modal when Konami code is detected
  useEffect(() => {
    if (konamiDetected) {
      setIsEasterEggModalOpen(true);
      reset(); // Reset the Konami code detector
    }
  }, [konamiDetected, reset]);

  return (
    <div className="landing-page overflow-x-hidden w-full">
      {/* Enhanced Hero Section */}
      <EnhancedHeroSection />

      {/* Social Proof Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Join Our Growing Community</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Players like you are using Pickle+ to transform their game, connect with others, and enjoy the sport they love.
            </p>
          </motion.div>
          
          {/* Social Proof Stats */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">5000+</div>
              <div className="text-gray-600 font-medium">Matches Recorded</div>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">150+</div>
              <div className="text-gray-600 font-medium">Active Communities</div>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">300+</div>
              <div className="text-gray-600 font-medium">Tournaments</div>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">50K+</div>
              <div className="text-gray-600 font-medium">Hours of Training</div>
            </div>
          </motion.div>
          
          {/* Testimonials */}
          <div className="grid md:grid-cols-3 gap-6">
            <motion.div 
              className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-blue-100/50 shadow-lg hover:shadow-xl transition-all duration-300 relative"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0 }}
            >
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  MS
                </div>
                <div className="ml-4">
                  <div className="font-semibold">Michael S.</div>
                  <div className="text-sm text-gray-500">Intermediate Player</div>
                </div>
              </div>
              <p className="text-gray-700 italic mb-2 leading-relaxed">
                "The intelligent analytics and coaching tools have transformed my approach to pickleball. I've seen remarkable improvement in areas I didn't even know needed work."
              </p>
              <div className="flex text-[#FFC107]">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                </svg>
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-blue-100/50 shadow-lg hover:shadow-xl transition-all duration-300 relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  JD
                </div>
                <div className="ml-4">
                  <div className="font-semibold">Jennifer D.</div>
                  <div className="text-sm text-gray-500">Advanced Player</div>
                </div>
              </div>
              <p className="text-gray-700 italic mb-2 leading-relaxed">
                "The community features and tournament system have elevated my entire pickleball experience. Finding competitive matches and tracking progress has never been easier."
              </p>
              <div className="flex text-[#FFC107]">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                </svg>
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-blue-100/50 shadow-lg hover:shadow-xl transition-all duration-300 relative"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  RT
                </div>
                <div className="ml-4">
                  <div className="font-semibold">Robert T.</div>
                  <div className="text-sm text-gray-500">Club Owner</div>
                </div>
              </div>
              <p className="text-gray-700 italic mb-2 leading-relaxed">
                "Pickle+ has revolutionized how our facility operates. Member engagement is at an all-time high, and the professional coaching tools have attracted top-tier instructors."
              </p>
              <div className="flex text-[#FFC107]">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                </svg>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* CourtIQ Explanation Section */}
      <CourtIQExplanationSection />
      
      {/* Coming Soon / V1.0 Features Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div 
            className="text-center mb-12 sm:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center bg-[#FF5722]/10 rounded-full px-4 py-1.5 mb-4">
              <span className="flex h-2 w-2 rounded-full bg-[#FF5722] mr-2"></span>
              <span className="text-sm font-medium text-[#FF5722]">Coming in v1.0</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">The Future of Pickle+</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We're constantly evolving the platform with new features to enhance your pickleball journey.
              Here's a sneak peek at what's coming next.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <motion.div 
              className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <div className="p-6 sm:p-8">
                <div className="mb-4 text-[#2196F3]">
                  <LayoutDashboard size={32} />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-2">Enhanced Dashboard</h3>
                <p className="text-gray-600 mb-4">
                  A completely redesigned dashboard with personalized insights, progress tracking, 
                  and quick access to your most important pickleball stats and activities.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center text-gray-700">
                    <div className="h-5 w-5 rounded-full bg-[#2196F3]/10 flex items-center justify-center mr-2">
                      <Check size={12} className="text-[#2196F3]" />
                    </div>
                    Custom widget arrangement
                  </li>
                  <li className="flex items-center text-gray-700">
                    <div className="h-5 w-5 rounded-full bg-[#2196F3]/10 flex items-center justify-center mr-2">
                      <Check size={12} className="text-[#2196F3]" />
                    </div>
                    Performance trend visualization
                  </li>
                  <li className="flex items-center text-gray-700">
                    <div className="h-5 w-5 rounded-full bg-[#2196F3]/10 flex items-center justify-center mr-2">
                      <Check size={12} className="text-[#2196F3]" />
                    </div>
                    Goal-setting and tracking
                  </li>
                </ul>
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <div className="p-6 sm:p-8">
                <div className="mb-4 text-[#673AB7]">
                  <Activity size={32} />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-2">Advanced Match Analysis</h3>
                <p className="text-gray-600 mb-4">
                  Detailed match statistics and analysis to help you understand your performance 
                  and identify areas for improvement with actionable insights.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center text-gray-700">
                    <div className="h-5 w-5 rounded-full bg-[#673AB7]/10 flex items-center justify-center mr-2">
                      <Check size={12} className="text-[#673AB7]" />
                    </div>
                    Shot-by-shot breakdown
                  </li>
                  <li className="flex items-center text-gray-700">
                    <div className="h-5 w-5 rounded-full bg-[#673AB7]/10 flex items-center justify-center mr-2">
                      <Check size={12} className="text-[#673AB7]" />
                    </div>
                    Pattern recognition
                  </li>
                  <li className="flex items-center text-gray-700">
                    <div className="h-5 w-5 rounded-full bg-[#673AB7]/10 flex items-center justify-center mr-2">
                      <Check size={12} className="text-[#673AB7]" />
                    </div>
                    AI-powered improvement suggestions
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <motion.div 
              className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0 }}
            >
              <div className="h-12 w-12 rounded-lg bg-[#4CAF50]/10 flex items-center justify-center text-[#4CAF50] mb-4">
                <Users size={24} />
              </div>
              <h3 className="text-lg font-bold mb-2">Team Management</h3>
              <p className="text-gray-600 text-sm">
                Create and manage teams, track team performance, and coordinate practice sessions with your doubles partners.
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <div className="h-12 w-12 rounded-lg bg-[#FF9800]/10 flex items-center justify-center text-[#FF9800] mb-4">
                <Calendar size={24} />
              </div>
              <h3 className="text-lg font-bold mb-2">Advanced Scheduling</h3>
              <p className="text-gray-600 text-sm">
                Integrated calendar with court booking, availability sharing, and automated reminders for upcoming matches and events.
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <div className="h-12 w-12 rounded-lg bg-[#9C27B0]/10 flex items-center justify-center text-[#9C27B0] mb-4">
                <Trophy size={24} />
              </div>
              <h3 className="text-lg font-bold mb-2">Custom Tournaments</h3>
              <p className="text-gray-600 text-sm">
                Create your own tournaments with customizable formats, brackets, and scoring systems for clubs and community events.
              </p>
            </motion.div>
          </div>
          
          <motion.div 
            className="text-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Button size="lg" className="bg-[#FF5722] hover:bg-[#E64A19] text-white">
              Join the Waiting List <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <p className="text-sm text-gray-500 mt-3">
              Be the first to know when new features are released.
            </p>
          </motion.div>
        </div>
      </section>
      
      {/* Rating Systems Integration Section */}
      <RatingSystemsIntegrationSection />
      
      {/* Enhanced Changelog Section */}
      <EnhancedChangelogSection />

      {/* Features Section */}
      <section className="py-12 sm:py-20 bg-gray-50 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div 
            className="text-center mb-8 sm:mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Intelligent Passport for the Modern Player</h2>
            <p className="text-base sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Pickle+ brings your pickleball journey to life with CourtIQ™ analytics designed to help you track, improve, and enjoy the game.
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
      <section className="py-12 sm:py-20 bg-white overflow-hidden">
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
      <section className="py-12 sm:py-20 bg-gray-50 overflow-hidden" id="how-it-works">
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
      <section className="py-12 sm:py-20 bg-white overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div 
            className="text-center mb-8 sm:mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-1">CourtIQ™ Intelligence System</h2>
            <div className="text-base font-semibold text-[#2196F3] mb-4">Powered by CourtIQ™</div>
            <p className="text-base sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Your complete pickleball intelligence system that measures what matters through three interconnected metrics
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
              <h3 className="font-bold text-xl mb-2 text-[#FF5722]">CourtIQ XP</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4">
                Your experience progression tracks your overall journey and unlocks new features and achievements as you level up.
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
              <h3 className="font-bold text-xl mb-2 text-[#2196F3]">CourtIQ Rankings</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4">
                Your competitive standing based on match performance, tournament results, and quality of play.
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
              <h3 className="font-bold text-xl mb-2 text-[#4CAF50]">CourtIQ Rating</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4">
                Our proprietary 1000-2500 rating system works alongside existing rating systems while providing format-specific insights.
              </p>
              <div className="bg-[#4CAF50]/5 rounded-lg p-3 mb-2">
                <div className="text-[#4CAF50] font-bold mb-1 text-sm">CourtIQ Rating Features:</div>
                <ul className="text-left text-sm text-gray-600 space-y-1">
                  <li className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#4CAF50]"></div>
                    <div>1000-2500 scale with 10 pickleball-themed tiers</div>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#4CAF50]"></div>
                    <div>Format-specific ratings (singles, doubles, mixed)</div>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#4CAF50]"></div>
                    <div>Age division adjustments (19+, 35+, 50+, etc.)</div>
                  </li>
                </ul>
              </div>
              <div className="text-xs text-gray-500">Can be used alongside other rating systems while offering more detailed insights</div>
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
              <div className="text-xs sm:text-sm text-gray-500">CourtIQ XP for progression</div>
              <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-[#2196F3]"></div>
              <div className="text-xs sm:text-sm text-gray-500">CourtIQ Rankings for competition</div>
              <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-[#4CAF50]"></div>
              <div className="text-xs sm:text-sm text-gray-500">CourtIQ Rating for matchmaking</div>
            </div>
            <p className="text-center text-sm sm:text-base text-gray-600">
              The CourtIQ Intelligence System ensures players of all skill levels have meaningful progression paths regardless of their competitive focus.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Coming Soon Features Section */}
      <section className="py-16 sm:py-24 bg-gray-50 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center bg-[#673AB7]/10 rounded-full px-4 py-1.5 mb-4">
              <span className="flex h-2 w-2 rounded-full bg-[#673AB7] mr-2"></span>
              <span className="text-sm font-medium text-[#673AB7]">Coming in Full Release</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">The Future of Pickle+</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our roadmap is filled with innovative features designed to take your pickleball experience to the next level. Here's a preview of what's coming soon.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <motion.div 
              className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0 }}
            >
              <div className="absolute top-0 right-0">
                <div className="bg-[#FF5722] text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                  COMING SOON
                </div>
              </div>
              <div className="inline-flex items-center justify-center p-3 rounded-lg mb-4 bg-[#FF5722]/10">
                <LayoutDashboard className="h-8 w-8 text-[#FF5722]" />
              </div>
              <h3 className="text-xl font-bold mb-2">AI Coaching Assistant</h3>
              <p className="text-gray-600">
                Get personalized coaching recommendations and drills based on your CourtIQ™ performance data and skill profile.
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="absolute top-0 right-0">
                <div className="bg-[#2196F3] text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                  COMING SOON
                </div>
              </div>
              <div className="inline-flex items-center justify-center p-3 rounded-lg mb-4 bg-[#2196F3]/10">
                <Trophy className="h-8 w-8 text-[#2196F3]" />
              </div>
              <h3 className="text-xl font-bold mb-2">Team Tournaments</h3>
              <p className="text-gray-600">
                Create and manage team-based tournaments with advanced brackets, real-time scoring, and team statistics.
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="absolute top-0 right-0">
                <div className="bg-[#4CAF50] text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                  COMING SOON
                </div>
              </div>
              <div className="inline-flex items-center justify-center p-3 rounded-lg mb-4 bg-[#4CAF50]/10">
                <Activity className="h-8 w-8 text-[#4CAF50]" />
              </div>
              <h3 className="text-xl font-bold mb-2">Video Analysis</h3>
              <p className="text-gray-600">
                Upload match footage for AI-powered stroke analysis, technique feedback, and improvement recommendations.
              </p>
            </motion.div>
          </div>
          
          {/* Early Access Banner */}
          <motion.div 
            className="max-w-4xl mx-auto bg-gradient-to-r from-[#673AB7]/5 to-[#2196F3]/5 rounded-xl p-8 border border-[#673AB7]/20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2">Get Early Access to v1.0 Features</h3>
                <p className="text-gray-600 mb-4">
                  Beta members will be the first to experience new features before they're released to the public. Secure your spot today to join our community of testers.
                </p>
                <Button 
                  onClick={() => navigate("/auth")}
                  className="bg-[#673AB7] hover:bg-[#5E35B1] text-white"
                >
                  Join the Beta Program
                </Button>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
                <div className="text-sm font-medium text-gray-500 mb-2">Beta Access Includes:</div>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 text-[#4CAF50]">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="ml-2 text-sm text-gray-600">Early feature access</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 text-[#4CAF50]">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="ml-2 text-sm text-gray-600">Influence future development</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 text-[#4CAF50]">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="ml-2 text-sm text-gray-600">Exclusive beta tester badge</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Changelog is already included above */}

      {/* Enhanced Final CTA Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-[#FF5722]/5 via-[#673AB7]/5 to-[#2196F3]/5 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-8 sm:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <motion.div 
                className="inline-flex items-center bg-[#673AB7]/10 rounded-full px-4 py-1.5 mb-4"
                initial={{ opacity: 0, y: -10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <span className="flex h-2 w-2 rounded-full bg-[#673AB7] mr-2"></span>
                <span className="text-sm font-medium text-[#673AB7]">Limited Time Offer</span>
              </motion.div>
              
              <h2 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight">
                Transform Your <br className="hidden sm:block" />
                <span className="text-[#FF5722]">Pickleball Journey</span> <br className="hidden sm:block" />
                Today
              </h2>
              
              <p className="text-lg text-gray-700 mb-8 max-w-lg">
                Join thousands of players who are tracking their progress, connecting with the community, and taking their game to the next level with Pickle+.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center text-gray-700">
                  <div className="h-6 w-6 rounded-full bg-[#4CAF50]/10 flex items-center justify-center mr-3">
                    <Check className="h-4 w-4 text-[#4CAF50]" />
                  </div>
                  <span className="font-medium">Free access to community features</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <div className="h-6 w-6 rounded-full bg-[#4CAF50]/10 flex items-center justify-center mr-3">
                    <Check className="h-4 w-4 text-[#4CAF50]" />
                  </div>
                  <span className="font-medium">Unlimited match tracking</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <div className="h-6 w-6 rounded-full bg-[#4CAF50]/10 flex items-center justify-center mr-3">
                    <Check className="h-4 w-4 text-[#4CAF50]" />
                  </div>
                  <span className="font-medium">Exclusive early access to new features</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-[#FF5722] hover:bg-[#E64A19] text-white" onClick={() => navigate("/auth")}>
                  Get Started Now <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" className="border-[#673AB7] text-[#673AB7] hover:bg-[#673AB7]/10">
                  Schedule a Demo
                </Button>
              </div>
            </motion.div>
            
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200 p-6 sm:p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-bold mb-1">Founding Member</h3>
                    <div className="flex items-center">
                      <span className="text-3xl font-bold text-[#FF5722]">$0</span>
                      <span className="text-gray-500 ml-2">/ Limited Time</span>
                    </div>
                  </div>
                  <Badge className="bg-[#4CAF50]">Most Popular</Badge>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {[
                    "Premium CourtIQ™ Analytics",
                    "Tournament Passport with QR Code",
                    "Community Membership Features",
                    "Match History and Statistics",
                    "Achievement System",
                    "Court Booking Integration",
                    "Partner Matching System"
                  ].map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <div className="h-6 w-6 rounded-full bg-[#673AB7]/10 flex-shrink-0 flex items-center justify-center mr-3 mt-0.5">
                        <Check size={14} className="text-[#673AB7]" />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="bg-gray-50 -mx-8 -mb-8 p-6 mt-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="font-medium">Available Spots</div>
                    <div className="font-bold">27 / 100</div>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-8">
                    <div className="h-full bg-[#FF5722] rounded-full" style={{ width: "27%" }}></div>
                  </div>
                  
                  <Button size="lg" className="w-full bg-[#673AB7] hover:bg-[#5E35B1] text-white" onClick={() => navigate("/auth")}>
                    Claim Your Spot <ChevronsRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -right-4 bg-white p-3 rounded-lg shadow-lg rotate-6">
                <div className="text-[#FF5722] font-bold text-lg flex items-center">
                  <Star className="h-5 w-5 fill-[#FF5722] mr-1" />
                  Limited Offer!
                </div>
              </div>
            </motion.div>
          </div>
          
          <motion.p 
            className="text-center text-sm text-gray-500 mt-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.6 }}
          >
            No credit card required · Free forever · Level up today
          </motion.p>
        </div>
      </section>

      {/* Footer */}
      <Footer />
      
      {/* Easter Egg Modal */}
      <EasterEggModal 
        isOpen={isEasterEggModalOpen}
        onClose={() => setIsEasterEggModalOpen(false)}
      />
      
      {/* Bounce Mascot */}
      {showMascot && <BounceMascot position="bottom-right" />}
    </div>
  );
}