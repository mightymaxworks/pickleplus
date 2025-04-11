import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  ChevronRight, 
  TrendingUp, 
  Trophy, 
  Users, 
  Zap, 
  BarChart3,
  Sparkles
} from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { showGoldenTicket } from "@/core/modules/gamification/golden-ticket/api/goldenTicketApi";

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

export default function AboutUs() {
  const [, navigate] = useLocation();
  const [showSurpriseGlow, setShowSurpriseGlow] = useState(false);
  
  // This function handles the interaction that may reveal a Golden Ticket
  const handleInteractiveElement = () => {
    // Randomly decide if we should show a surprise glow (10% chance)
    const shouldShowSurprise = Math.random() < 0.1;
    
    if (shouldShowSurprise) {
      setShowSurpriseGlow(true);
      
      // After a brief delay, potentially show a golden ticket
      setTimeout(() => {
        setShowSurpriseGlow(false);
        // Random chance to trigger a golden ticket (50% if glow was shown)
        if (Math.random() < 0.5) {
          // Use the existing Golden Ticket API
          showGoldenTicket();
        }
      }, 2000);
    }
  };
  
  return (
    <div className="about-us-page min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#FF5722] to-[#FF9800] text-white py-16 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {/* Pattern background created with CSS */}
          <div className="w-full h-full opacity-20" 
            style={{ 
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)', 
              backgroundSize: '25px 25px' 
            }}>
          </div>
        </div>
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <motion.div 
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">About Pickle+</h1>
            <p className="text-xl sm:text-2xl text-white/90 mb-8 font-light">
              Transforming pickleball through data, innovation, and community since February 2025.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white/20 border-2 font-medium"
                onClick={() => navigate("/register")}
              >
                Join Our Community <ChevronRight className="ml-1 h-5 w-5" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Our Story Section */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div 
            className="grid md:grid-cols-2 gap-12 items-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeIn}>
              <div className="inline-flex items-center bg-[#673AB7]/10 rounded-full px-4 py-1.5 mb-4">
                <span className="flex h-2 w-2 rounded-full bg-[#673AB7] mr-2"></span>
                <span className="text-sm font-medium text-[#673AB7]">Our Origin Story</span>
              </div>
              
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">The Birth of Pickle+</h2>
              <p className="text-gray-600 mb-4 text-lg">
                Pickle+ was born in February 2025 from a simple observation: pickleball players needed a better way to track their progress and connect with others at their skill level.
              </p>
              <p className="text-gray-600 mb-6">
                Our founding team of pickleball enthusiasts and data scientists came together to create a platform that goes beyond traditional rating systems. The result is CourtIQ™, our proprietary intelligence system that provides multi-dimensional insights into player development.
              </p>
              
              <div 
                className={`relative mt-8 p-6 rounded-xl border border-dashed cursor-pointer transition-all duration-500 ${showSurpriseGlow ? 'border-[#FFD700] bg-[#FFD700]/5' : 'border-[#673AB7]/50 bg-[#673AB7]/5 hover:bg-[#673AB7]/10'}`} 
                onClick={handleInteractiveElement}
              >
                {showSurpriseGlow && (
                  <div className="absolute inset-0 animate-pulse bg-[#FFD700]/20 rounded-xl"></div>
                )}
                <h3 className="font-bold text-xl mb-2 text-[#673AB7]">Our Founding Vision</h3>
                <p className="text-gray-600">
                  To create an intelligent platform that transforms how pickleball players develop, connect, and compete. Click to learn more about our founders' story.
                </p>
                {showSurpriseGlow && (
                  <div className="absolute -top-2 -right-2">
                    <Sparkles className="h-6 w-6 text-[#FFD700] animate-spin" />
                  </div>
                )}
              </div>
            </motion.div>
            
            <motion.div 
              variants={fadeIn}
              className="relative"
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-[#673AB7]/20 to-[#FF5722]/20 rounded-3xl blur-xl opacity-70"></div>
              <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Timeline */}
                <div className="p-6 sm:p-8">
                  <h3 className="text-xl font-bold mb-6 border-b border-gray-100 pb-3">The Pickle+ Journey</h3>
                  
                  <div className="relative pl-8 space-y-8 before:absolute before:left-2.5 before:top-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-[#FF5722] before:via-[#2196F3] before:to-[#4CAF50]">
                    <TimelineItem 
                      icon={<Calendar size={16} />} 
                      date="February 2025" 
                      title="Founding & Launch" 
                      description="Pickle+ platform officially launched with passport system and core match recording"
                      iconBg="#FF5722" 
                    />
                    <TimelineItem 
                      icon={<Zap size={16} />} 
                      date="February 22, 2025" 
                      title="CourtIQ™ Intelligence System" 
                      description="Introduction of our proprietary rating and analytics engine"
                      iconBg="#2196F3" 
                    />
                    <TimelineItem 
                      icon={<Trophy size={16} />} 
                      date="March 18, 2025" 
                      title="Tournament Discovery Quests" 
                      description="Interactive tournament exploration with tiered rewards"
                      iconBg="#673AB7"
                    />
                    <TimelineItem 
                      icon={<BarChart3 size={16} />} 
                      date="April 5, 2025"
                      title="Enhanced Match Recording" 
                      description="Advanced statistics and video integration for deeper match analysis"
                      iconBg="#4CAF50"
                    />
                    <TimelineItem 
                      icon={<TrendingUp size={16} />} 
                      date="Coming Soon" 
                      title="What's Next..." 
                      description="New features and enhancements based on community feedback"
                      iconBg="#FF9800"
                      isLast={true}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
      
      {/* Mission & Values */}
      <section className="py-16 sm:py-24 bg-gray-50">
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
              <span className="text-sm font-medium text-[#2196F3]">Our Approach</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Mission & Values</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We're driven by a set of core values that guide everything we do at Pickle+.
            </p>
          </motion.div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <ValueCard 
              icon={<TrendingUp className="h-6 w-6 text-[#FF5722]" />} 
              title="Data-Driven Development" 
              description="We believe that meaningful progress comes from measurable insights. That's why CourtIQ™ provides deeper analytics than any other platform."
              color="#FF5722"
            />
            <ValueCard 
              icon={<Users className="h-6 w-6 text-[#2196F3]" />} 
              title="Community-Centered" 
              description="We're building more than a platform; we're fostering a community of passionate players who push each other to improve."
              color="#2196F3"
            />
            <ValueCard 
              icon={<Zap className="h-6 w-6 text-[#4CAF50]" />} 
              title="Continuous Innovation" 
              description="We're committed to constant evolution, regularly introducing new features based on player feedback and emerging technologies."
              color="#4CAF50"
            />
          </div>
        </div>
      </section>
      
      {/* Team Section */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div 
            className="text-center mb-12 sm:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center bg-[#4CAF50]/10 rounded-full px-4 py-1.5 mb-4">
              <span className="flex h-2 w-2 rounded-full bg-[#4CAF50] mr-2"></span>
              <span className="text-sm font-medium text-[#4CAF50]">Meet The Team</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">The People Behind Pickle+</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our diverse team combines expertise in data science, software development, 
              and a deep passion for pickleball.
            </p>
          </motion.div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <TeamMember 
              name="Alex Morgan" 
              role="Co-Founder & CEO" 
              bio="Former pro player turned tech entrepreneur with a vision to transform player development."
              initial="AM"
              bgColor="#FF5722"
            />
            <TeamMember 
              name="Jordan Chen" 
              role="CTO" 
              bio="AI and data science expert who architected the CourtIQ™ Intelligence System."
              initial="JC"
              bgColor="#2196F3"
            />
            <TeamMember 
              name="Taylor Rodriguez" 
              role="Head of Product" 
              bio="UX specialist focused on creating intuitive interfaces for players of all levels."
              initial="TR"
              bgColor="#673AB7"
            />
            <TeamMember 
              name="Casey Wilson" 
              role="Community Director" 
              bio="Tournament director and community builder who ensures Pickle+ meets real player needs."
              initial="CW"
              bgColor="#4CAF50"
            />
          </div>
          
          <div className="mt-12 text-center">
            <Button variant="outline" className="text-[#673AB7] border-[#673AB7] hover:bg-[#673AB7]/10">
              Join Our Team <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-[#673AB7] to-[#9C27B0] text-white">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div 
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">Ready to Transform Your Game?</h2>
            <p className="text-xl text-white/90 mb-8">
              Join thousands of players who are taking their pickleball journey to the next level with Pickle+.
            </p>
            <Button 
              size="lg" 
              className="bg-white text-[#673AB7] hover:bg-white/90 font-medium text-lg px-8"
              onClick={() => navigate("/register")}
            >
              Get Started for Free
            </Button>
            <p className="mt-4 text-sm text-white/70">
              No credit card required. Free account includes core features.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

interface TimelineItemProps {
  icon: React.ReactNode;
  date: string;
  title: string;
  description: string;
  iconBg: string;
  isLast?: boolean;
}

function TimelineItem({ icon, date, title, description, iconBg, isLast = false }: TimelineItemProps) {
  return (
    <div className="relative">
      <div 
        className="absolute left-[-27px] top-1 w-5 h-5 rounded-full flex items-center justify-center"
        style={{ backgroundColor: iconBg }}
      >
        <div className="text-white">
          {icon}
        </div>
      </div>
      
      <div className="mb-1 flex items-center">
        <div className="font-semibold text-gray-900">{title}</div>
        <div className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-500">
          {date}
        </div>
      </div>
      
      <p className="text-sm text-gray-600">{description}</p>
      
      {!isLast && (
        <div className="absolute left-[-24px] top-6 h-[calc(100%+16px)] w-px bg-gradient-to-b from-[iconBg] to-transparent opacity-20"></div>
      )}
    </div>
  );
}

interface ValueCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

function ValueCard({ icon, title, description, color }: ValueCardProps) {
  return (
    <motion.div 
      className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div 
        className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" 
        style={{ backgroundColor: `${color}10` }}
      >
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </motion.div>
  );
}

interface TeamMemberProps {
  name: string;
  role: string;
  bio: string;
  initial: string;
  bgColor: string;
}

function TeamMember({ name, role, bio, initial, bgColor }: TeamMemberProps) {
  return (
    <motion.div 
      className="text-center"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-4 relative mx-auto">
        <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-white font-bold text-xl" style={{ backgroundColor: bgColor }}>
          {initial}
        </div>
      </div>
      <h3 className="font-bold text-lg">{name}</h3>
      <div className="text-[#673AB7] text-sm font-medium mb-2">{role}</div>
      <p className="text-sm text-gray-600">{bio}</p>
    </motion.div>
  );
}