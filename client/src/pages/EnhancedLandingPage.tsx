import { useLocation, Link } from "wouter";
import { EnhancedHeroSection } from '@/components/EnhancedHeroSection';
import { CourtIQExplanationSection } from '@/components/CourtIQExplanationSection';
import { RatingSystemsIntegrationSection } from '@/components/RatingSystemsIntegrationSection';
import { EnhancedChangelogSection } from '@/components/EnhancedChangelogSection';
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import React from "react";
import { PicklePlusNewLogo } from "../components/icons/PicklePlusNewLogo";
import { 
  Award, 
  BarChart, 
  Calendar,
  Users, 
  Zap,
  Check,
  Star,
  ChevronDown,
  Trophy
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
      
      {/* Enhanced Hero Section */}
      <EnhancedHeroSection />
      
      {/* CourtIQ Explanation Section */}
      <CourtIQExplanationSection />
      
      {/* Rating Systems Integration Section */}
      <RatingSystemsIntegrationSection />
      
      {/* Enhanced Changelog Section */}
      <EnhancedChangelogSection />

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
              <div className="w-32 h-8 mb-4">
                <PicklePlusNewLogo width={120} preserveAspectRatio={true} />
              </div>
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