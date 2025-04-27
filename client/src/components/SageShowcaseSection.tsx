import { motion } from 'framer-motion';
import { Brain, Code, Copy, Crown, MessageCircle, BarChart, Library, Database, Zap, Heart, Activity, FilePieChart, Lightbulb, Target, ChevronRight, BadgeCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCallback, useState } from 'react';

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
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

// Message component for the chat interface
interface MessageProps {
  content: React.ReactNode;
  isUser: boolean;
  extraClasses?: string;
}

const Message = ({ content, isUser, extraClasses = "" }: MessageProps) => (
  <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
    <div className={`max-w-[80%] md:max-w-[70%] rounded-2xl px-4 py-3 ${
      isUser 
        ? 'bg-[#FF5722] text-white rounded-tr-none' 
        : 'bg-gray-100 text-gray-800 rounded-tl-none'
      } ${extraClasses}`}
    >
      {content}
    </div>
  </div>
);

// SAGE Showcase Section
export function SageShowcaseSection() {
  const [activeTab, setActiveTab] = useState<'coach' | 'wellness' | 'assistant'>('coach');
  
  const renderTabContent = useCallback(() => {
    switch(activeTab) {
      case 'coach':
        return <CoachingTabContent />;
      case 'wellness':
        return <WellnessTabContent />;
      case 'assistant':
        return <AssistantTabContent />;
      default:
        return <CoachingTabContent />;
    }
  }, [activeTab]);
  
  return (
    <section id="sage" className="py-16 sm:py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div 
          className="text-center mb-12 sm:mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
        >
          <div className="mb-3 inline-block bg-[#9C27B0]/10 rounded-full px-3 py-1 text-sm font-medium text-[#9C27B0]">
            SAGE™ AI Assistant
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Your Personal Pickleball Companion</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Meet SAGE™, the Smart Assistant and Guidance Engine designed to enhance your pickleball journey with AI-powered coaching, wellness insights, and personalized support.
          </p>
        </motion.div>
        
        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1 bg-gray-100 rounded-lg">
            <button 
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                activeTab === 'coach' 
                  ? 'bg-[#9C27B0] text-white shadow-md' 
                  : 'text-gray-700 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('coach')}
            >
              AI Coach
            </button>
            <button 
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                activeTab === 'wellness' 
                  ? 'bg-[#9C27B0] text-white shadow-md' 
                  : 'text-gray-700 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('wellness')}
            >
              Wellness
            </button>
            <button 
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                activeTab === 'assistant' 
                  ? 'bg-[#9C27B0] text-white shadow-md' 
                  : 'text-gray-700 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('assistant')}
            >
              Assistant
            </button>
          </div>
        </div>
        
        {/* Active Tab Content */}
        {renderTabContent()}
      </div>
    </section>
  );
}

// Coaching Tab Content
function CoachingTabContent() {
  return (
    <motion.div 
      className="grid md:grid-cols-12 gap-8 items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Coaching Features */}
      <motion.div 
        className="md:col-span-5"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <motion.h3 
          className="text-2xl font-bold mb-6 text-[#9C27B0]"
          variants={fadeIn}
        >
          Personalized Coaching Intelligence
        </motion.h3>
        
        <motion.div className="space-y-6" variants={staggerContainer}>
          <motion.div 
            className="flex items-start gap-4"
            variants={fadeIn}
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#9C27B0]/10 flex items-center justify-center text-[#9C27B0]">
              <FilePieChart size={20} />
            </div>
            <div>
              <h4 className="font-bold text-lg mb-1">Match Analysis</h4>
              <p className="text-gray-600">
                Advanced statistical analysis of your matches with personalized insights on your performance patterns.
              </p>
            </div>
          </motion.div>
          
          <motion.div 
            className="flex items-start gap-4"
            variants={fadeIn}
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#9C27B0]/10 flex items-center justify-center text-[#9C27B0]">
              <Target size={20} />
            </div>
            <div>
              <h4 className="font-bold text-lg mb-1">Skill Development</h4>
              <p className="text-gray-600">
                Custom training recommendations based on your CourtIQ™ profile and areas for improvement.
              </p>
            </div>
          </motion.div>
          
          <motion.div 
            className="flex items-start gap-4"
            variants={fadeIn}
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#9C27B0]/10 flex items-center justify-center text-[#9C27B0]">
              <Lightbulb size={20} />
            </div>
            <div>
              <h4 className="font-bold text-lg mb-1">Strategy Insights</h4>
              <p className="text-gray-600">
                Tactical recommendations and game plans tailored to your playing style and opponents.
              </p>
            </div>
          </motion.div>
        </motion.div>
        
        <motion.div
          className="mt-8"
          variants={fadeIn}
        >
          <Button className="bg-[#9C27B0] hover:bg-[#8E24AA] text-white">
            Explore AI Coaching <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </motion.div>
      </motion.div>
      
      {/* Coaching Chat Example */}
      <motion.div 
        className="md:col-span-7"
        initial={{ opacity: 0, x: 30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
          {/* Chat Header */}
          <div className="bg-[#9C27B0] text-white p-4 flex items-center">
            <Brain className="h-6 w-6 mr-3" />
            <div>
              <div className="font-bold">SAGE™ Coaching Assistant</div>
              <div className="text-xs text-white/80">Powered by advanced AI</div>
            </div>
          </div>
          
          {/* Chat Messages */}
          <div className="p-4 max-h-96 overflow-y-auto bg-white/50 backdrop-blur-sm">
            <Message 
              isUser={true} 
              content="Can you analyze my last match? I lost 9-11, 11-6, 7-11. My third shot drops were inconsistent."
            />
            
            <Message 
              isUser={false} 
              content={
                <div className="space-y-3">
                  <p>Based on your match data and recent performance, I can see a few patterns:</p>
                  <div className="pl-3 border-l-2 border-[#9C27B0]/30">
                    <p className="font-medium text-[#9C27B0]">Third Shot Analysis:</p>
                    <p>Your third shot drop success rate was 62% (below your usual 78%). This appears to be the primary factor in your loss.</p>
                  </div>
                  <p>Would you like specific drills to improve your third shot consistency?</p>
                </div>
              } 
            />
            
            <Message 
              isUser={true} 
              content="Yes, please recommend some drills I can do."
            />
            
            <Message 
              isUser={false} 
              content={
                <div className="space-y-3">
                  <p>Here are three drills tailored to your specific third shot drop issues:</p>
                  <ol className="space-y-2 pl-5 list-decimal">
                    <li>
                      <span className="font-medium">Shadow Drop Practice</span>: 20 minutes of shadow drops focusing on follow-through and soft hands
                    </li>
                    <li>
                      <span className="font-medium">Target Zone Drops</span>: Set up boxes in the kitchen and practice precision placement (15 min)
                    </li>
                    <li>
                      <span className="font-medium">Partner Feed Drill</span>: Have a partner hit returns while you practice third shot drops from various court positions
                    </li>
                  </ol>
                  <div className="bg-[#9C27B0]/10 p-3 rounded-lg mt-2 flex items-center">
                    <BadgeCheck className="h-5 w-5 text-[#9C27B0] mr-2 flex-shrink-0" />
                    <span className="text-sm">These recommendations are based on your CourtIQ™ Technical profile (4.2/5.0) and recent match footage analysis.</span>
                  </div>
                </div>
              } 
            />
          </div>
          
          {/* Chat Input (non-functional) */}
          <div className="border-t border-gray-200 p-3 bg-gray-50">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Ask SAGE about your game..." 
                className="w-full rounded-full border border-gray-300 py-2 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-[#9C27B0]/50"
                disabled
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9C27B0] disabled:opacity-50" disabled>
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Wellness Tab Content
function WellnessTabContent() {
  return (
    <motion.div 
      className="grid md:grid-cols-12 gap-8 items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Wellness Chat Example */}
      <motion.div 
        className="md:col-span-7 md:order-1 lg:order-first"
        initial={{ opacity: 0, x: -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
          {/* Chat Header */}
          <div className="bg-[#00BCD4] text-white p-4 flex items-center">
            <Heart className="h-6 w-6 mr-3" />
            <div>
              <div className="font-bold">SAGE™ Wellness Guide</div>
              <div className="text-xs text-white/80">Holistic player development</div>
            </div>
          </div>
          
          {/* Chat Messages */}
          <div className="p-4 max-h-96 overflow-y-auto bg-white/50 backdrop-blur-sm">
            <Message 
              isUser={true} 
              content="I've been experiencing some elbow pain after longer playing sessions. Any advice?"
            />
            
            <Message 
              isUser={false} 
              content={
                <div className="space-y-3">
                  <p>I'm noticing this is the second time you've mentioned elbow discomfort this month. Based on your playing history and equipment data, I have some recommendations:</p>
                  
                  <div className="bg-[#00BCD4]/10 p-3 rounded-lg">
                    <h4 className="font-bold text-[#00BCD4] mb-1">Possible Contributing Factors:</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      <li>Your current paddle (SHOT3 Genesis Pro Ai) has a stiffness rating that can sometimes contribute to tennis elbow</li>
                      <li>Your recent increase in play frequency (from 2x to 4x weekly)</li>
                      <li>Limited cool-down stretching after sessions (based on your activity logs)</li>
                    </ul>
                  </div>
                </div>
              }
            />
            
            <Message 
              isUser={true} 
              content="That makes sense. What should I do to address this?"
            />
            
            <Message 
              isUser={false} 
              content={
                <div className="space-y-3">
                  <p>Here's a comprehensive plan to address your elbow pain:</p>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <div className="bg-[#00BCD4] text-white rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
                      <div>
                        <span className="font-medium">Immediate Relief:</span> Apply ice for 15-20 minutes after playing and consider a counterforce brace
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <div className="bg-[#00BCD4] text-white rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
                      <div>
                        <span className="font-medium">Equipment Adjustment:</span> Consider testing a paddle with more vibration dampening (I've added several recommendations to your equipment dashboard)
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <div className="bg-[#00BCD4] text-white rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
                      <div>
                        <span className="font-medium">Technique Refinement:</span> I've noticed you tend to lead with your elbow on backhand shots. I've added a specific technique video to your training queue
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <div className="bg-[#00BCD4] text-white rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">4</div>
                      <div>
                        <span className="font-medium">Strengthening Routine:</span> I've created a 5-minute forearm strengthening routine in your wellness section
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm italic">Would you like me to set reminders for these activities in your training schedule?</p>
                </div>
              }
            />
          </div>
          
          {/* Chat Input (non-functional) */}
          <div className="border-t border-gray-200 p-3 bg-gray-50">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Ask about wellness, recovery, or training..." 
                className="w-full rounded-full border border-gray-300 py-2 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-[#00BCD4]/50"
                disabled
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 text-[#00BCD4] disabled:opacity-50" disabled>
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Wellness Features */}
      <motion.div 
        className="md:col-span-5 md:order-first lg:order-1"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <motion.h3 
          className="text-2xl font-bold mb-6 text-[#00BCD4]"
          variants={fadeIn}
        >
          Holistic Player Wellness
        </motion.h3>
        
        <motion.div className="space-y-6" variants={staggerContainer}>
          <motion.div 
            className="flex items-start gap-4"
            variants={fadeIn}
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#00BCD4]/10 flex items-center justify-center text-[#00BCD4]">
              <Activity size={20} />
            </div>
            <div>
              <h4 className="font-bold text-lg mb-1">Injury Prevention</h4>
              <p className="text-gray-600">
                Personalized guidance to prevent common pickleball injuries based on your play history and physical profile.
              </p>
            </div>
          </motion.div>
          
          <motion.div 
            className="flex items-start gap-4"
            variants={fadeIn}
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#00BCD4]/10 flex items-center justify-center text-[#00BCD4]">
              <Heart size={20} />
            </div>
            <div>
              <h4 className="font-bold text-lg mb-1">Recovery Programs</h4>
              <p className="text-gray-600">
                Custom recovery routines and schedules to maximize performance and longevity in the sport.
              </p>
            </div>
          </motion.div>
          
          <motion.div 
            className="flex items-start gap-4"
            variants={fadeIn}
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#00BCD4]/10 flex items-center justify-center text-[#00BCD4]">
              <Database size={20} />
            </div>
            <div>
              <h4 className="font-bold text-lg mb-1">Equipment Analysis</h4>
              <p className="text-gray-600">
                Recommendations for equipment that complements your physical needs and playing style.
              </p>
            </div>
          </motion.div>
        </motion.div>
        
        <motion.div
          className="mt-8"
          variants={fadeIn}
        >
          <Button className="bg-[#00BCD4] hover:bg-[#00ACC1] text-white">
            Explore Wellness Features <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// Assistant Tab Content
function AssistantTabContent() {
  return (
    <motion.div 
      className="grid md:grid-cols-12 gap-8 items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Assistant Features */}
      <motion.div 
        className="md:col-span-5"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <motion.h3 
          className="text-2xl font-bold mb-6 text-[#FF9800]"
          variants={fadeIn}
        >
          Your Personal Sport Concierge
        </motion.h3>
        
        <motion.div className="space-y-6" variants={staggerContainer}>
          <motion.div 
            className="flex items-start gap-4"
            variants={fadeIn}
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#FF9800]/10 flex items-center justify-center text-[#FF9800]">
              <Library size={20} />
            </div>
            <div>
              <h4 className="font-bold text-lg mb-1">Pickleball Knowledge</h4>
              <p className="text-gray-600">
                Access to comprehensive information about rules, strategies, and techniques from beginner to advanced.
              </p>
            </div>
          </motion.div>
          
          <motion.div 
            className="flex items-start gap-4"
            variants={fadeIn}
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#FF9800]/10 flex items-center justify-center text-[#FF9800]">
              <Crown size={20} />
            </div>
            <div>
              <h4 className="font-bold text-lg mb-1">Tournament Guide</h4>
              <p className="text-gray-600">
                Personalized tournament recommendations, registration assistance, and preparation guidance.
              </p>
            </div>
          </motion.div>
          
          <motion.div 
            className="flex items-start gap-4"
            variants={fadeIn}
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#FF9800]/10 flex items-center justify-center text-[#FF9800]">
              <MessageCircle size={20} />
            </div>
            <div>
              <h4 className="font-bold text-lg mb-1">Community Connector</h4>
              <p className="text-gray-600">
                Find players, clubs, and events in your area that match your skill level and preferences.
              </p>
            </div>
          </motion.div>
        </motion.div>
        
        <motion.div
          className="mt-8"
          variants={fadeIn}
        >
          <Button className="bg-[#FF9800] hover:bg-[#FB8C00] text-white">
            Explore All Features <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </motion.div>
      </motion.div>
      
      {/* Assistant Chat Example */}
      <motion.div 
        className="md:col-span-7"
        initial={{ opacity: 0, x: 30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
          {/* Chat Header */}
          <div className="bg-[#FF9800] text-white p-4 flex items-center">
            <Zap className="h-6 w-6 mr-3" />
            <div>
              <div className="font-bold">SAGE™ General Assistant</div>
              <div className="text-xs text-white/80">Your pickleball concierge</div>
            </div>
          </div>
          
          {/* Chat Messages */}
          <div className="p-4 max-h-96 overflow-y-auto bg-white/50 backdrop-blur-sm">
            <Message 
              isUser={true} 
              content="Are there any tournaments coming up in Miami that would be suitable for my skill level?"
            />
            
            <Message 
              isUser={false} 
              content={
                <div className="space-y-3">
                  <p>Based on your profile (DUPR 4.5, residence in South Florida), I found these upcoming tournaments in Miami:</p>
                  
                  <div className="space-y-4 mt-3">
                    <div className="bg-[#FF9800]/5 border border-[#FF9800]/20 rounded-lg p-3">
                      <div className="flex justify-between">
                        <div className="font-bold text-[#FF9800]">Miami Open Pickleball Championship</div>
                        <div className="text-xs bg-[#FF9800]/10 text-[#FF9800] px-2 py-0.5 rounded-full font-medium">Best Match</div>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">June 14-16, 2025 • Crandon Park Tennis Center</div>
                      <div className="flex justify-between items-center mt-2">
                        <div className="text-xs text-gray-500">4.5 Mixed Doubles Available</div>
                        <button className="text-xs bg-[#FF9800] text-white px-2 py-0.5 rounded-md font-medium">View Details</button>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <div className="font-bold">South Beach Pickleball Invitational</div>
                      <div className="text-sm text-gray-600 mt-1">July 8-10, 2025 • South Beach Courts</div>
                      <div className="flex justify-between items-center mt-2">
                        <div className="text-xs text-gray-500">4.0-5.0 Singles & Doubles</div>
                        <button className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-md font-medium">View Details</button>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm">Would you like me to help you register for the Miami Open? I can also remind you about registration deadlines.</p>
                </div>
              }
            />
            
            <Message 
              isUser={true} 
              content="Yes, please set a reminder for the Miami Open registration and show me more details about the event."
            />
            
            <Message 
              isUser={false} 
              content={
                <div className="space-y-3">
                  <div className="bg-[#FF9800]/10 p-3 rounded-lg flex items-start gap-3">
                    <div className="text-[#FF9800]">
                      <BadgeCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-medium">Reminder Set</div>
                      <div className="text-sm">I'll remind you on May 15th, 2025 (registration opens)</div>
                    </div>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-[#FF9800] text-white text-center py-2 font-bold">
                      Miami Open Pickleball Championship
                    </div>
                    <div className="p-3 space-y-2">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="font-medium">Date:</div>
                        <div>June 14-16, 2025</div>
                        <div className="font-medium">Location:</div>
                        <div>Crandon Park Tennis Center</div>
                        <div className="font-medium">Format:</div>
                        <div>Double Elimination</div>
                        <div className="font-medium">Registration:</div>
                        <div>$65 per player/event</div>
                        <div className="font-medium">Divisions:</div>
                        <div>3.0, 3.5, 4.0, 4.5, 5.0</div>
                      </div>
                      
                      <div className="text-xs text-gray-500 mt-2">
                        Based on your match history, the 4.5 Mixed Doubles would be ideal. Would you like me to find potential partners?
                      </div>
                    </div>
                  </div>
                </div>
              }
            />
          </div>
          
          {/* Chat Input (non-functional) */}
          <div className="border-t border-gray-200 p-3 bg-gray-50">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Ask about tournaments, rules, or equipment..." 
                className="w-full rounded-full border border-gray-300 py-2 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-[#FF9800]/50"
                disabled
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 text-[#FF9800] disabled:opacity-50" disabled>
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}