import { motion } from 'framer-motion';
import { Activity, Award, BarChart3, Brain, ChevronRight, Gauge, LineChart, Sparkles, Target, Trophy, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
      staggerChildren: 0.1
    }
  }
};

export function CourtIQExplanationSection() {
  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-black to-gray-900 text-white overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div 
          className="text-center mb-12 sm:mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
        >
          <div className="inline-flex items-center bg-[#673AB7]/10 rounded-full px-4 py-1.5 mb-4">
            <span className="flex h-2 w-2 rounded-full bg-[#673AB7] mr-2"></span>
            <span className="text-sm font-medium text-[#673AB7]">CourtIQ™ Intelligence System</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">More Than Just a Rating</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            CourtIQ™ is a comprehensive intelligence system that provides detailed insights 
            into your playing style, skills, and progression path.
          </p>
        </motion.div>
        
        {/* Three Pillar System */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <PillarCard 
            icon={<LineChart className="h-8 w-8 text-[#FF5722]" />}
            title="Progression System"
            description="Track your progress over time with detailed metrics and insights into your playing history."
            color="#FF5722"
            delay={0}
          />
          <PillarCard 
            icon={<Activity className="h-8 w-8 text-[#2196F3]" />}
            title="Performance Analysis"
            description="Get detailed breakdowns of your matches with stats on serving, returns, positioning, and more."
            color="#2196F3" 
            delay={0.1}
          />
          <PillarCard 
            icon={<Target className="h-8 w-8 text-[#4CAF50]" />}
            title="Skill Identification"
            description="Understand your strengths and areas for improvement with our detailed skill radar system."
            color="#4CAF50"
            delay={0.2}
          />
        </div>
        
        {/* CourtIQ Radar Chart */}
        <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center mb-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h3 className="text-2xl font-bold mb-4 text-orange-500">CourtIQ™ Performance Analytics</h3>
            <p className="text-gray-600 mb-6">
              Advanced 6-dimensional skill analysis using radar visualization, exactly as shown in your dashboard. Track development across Power, Speed, Precision, Strategy, Control, and Consistency with DUPR integration.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-orange-500" />
                  <span className="font-medium">Power</span>
                </div>
                <span className="text-orange-500 font-bold">8.2/10</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Activity className="h-5 w-5 text-orange-500" />
                  <span className="font-medium">Speed</span>
                </div>
                <span className="text-orange-500 font-bold">7.8/10</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Target className="h-5 w-5 text-cyan-400" />
                  <span className="font-medium">Precision</span>
                </div>
                <span className="text-cyan-400 font-bold">6.9/10</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Brain className="h-5 w-5 text-cyan-400" />
                  <span className="font-medium">Strategy</span>
                </div>
                <span className="text-cyan-400 font-bold">7.3/10</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Gauge className="h-5 w-5 text-orange-500" />
                  <span className="font-medium">Control</span>
                </div>
                <span className="text-orange-500 font-bold">8.7/10</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-5 w-5 text-cyan-400" />
                  <span className="font-medium">Consistency</span>
                </div>
                <span className="text-cyan-400 font-bold">7.1/10</span>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-gradient-to-r from-orange-500/10 to-cyan-400/10 rounded-xl border border-orange-200">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="h-5 w-5 text-orange-500" />
                <span className="font-semibold text-gray-900">Overall CourtIQ™ Rating</span>
              </div>
              <div className="text-2xl font-bold text-orange-500">875 Points</div>
              <div className="text-sm text-gray-600">Advanced Level • Top 15% of players</div>
            </div>
            
            <div className="mt-6">
              <Button variant="outline" className="text-orange-500 border-orange-500 hover:bg-orange-500/10">
                View Dashboard Analytics <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
          
          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="relative max-w-sm">
              {/* Radar chart would go here */}
              <div className="w-72 h-72 sm:w-80 sm:h-80 relative mx-auto">
                {/* Base hexagon background */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-full bg-[#F5F5F5] rounded-full"></div>
                </div>
                
                {/* Grid lines */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-full border-2 border-dashed border-gray-300 rounded-full opacity-50"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-[75%] h-[75%] border-2 border-dashed border-gray-300 rounded-full opacity-50"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-[50%] h-[50%] border-2 border-dashed border-gray-300 rounded-full opacity-50"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-[25%] h-[25%] border-2 border-dashed border-gray-300 rounded-full opacity-50"></div>
                </div>
                
                {/* Skill axes */}
                <div className="absolute top-0 left-1/2 h-full -translate-x-1/2 w-0.5 bg-gray-300 opacity-50"></div>
                <div className="absolute bottom-1/2 left-0 w-full translate-y-1/2 h-0.5 bg-gray-300 opacity-50"></div>
                <div className="absolute top-[14.64%] left-[14.64%] w-[100%] h-0.5 bg-gray-300 opacity-50 origin-bottom-left rotate-[30deg]"></div>
                <div className="absolute top-[14.64%] right-[14.64%] w-[100%] h-0.5 bg-gray-300 opacity-50 origin-bottom-right rotate-[-30deg]"></div>
                <div className="absolute bottom-[14.64%] left-[14.64%] w-[100%] h-0.5 bg-gray-300 opacity-50 origin-top-left rotate-[-30deg]"></div>
                <div className="absolute bottom-[14.64%] right-[14.64%] w-[100%] h-0.5 bg-gray-300 opacity-50 origin-top-right rotate-[30deg]"></div>
                
                {/* Skill labels */}
                <div className="absolute top-1 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 py-1 rounded font-medium text-sm text-orange-500">Power</div>
                <div className="absolute top-[25%] right-[5%] translate-x-1/2 -translate-y-1/2 bg-white px-2 py-1 rounded font-medium text-sm text-orange-500">Control</div>
                <div className="absolute bottom-[25%] right-[5%] translate-x-1/2 translate-y-1/2 bg-white px-2 py-1 rounded font-medium text-sm text-orange-500">Speed</div>
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 translate-y-1/2 bg-white px-2 py-1 rounded font-medium text-sm text-cyan-400">Precision</div>
                <div className="absolute bottom-[25%] left-[5%] -translate-x-1/2 translate-y-1/2 bg-white px-2 py-1 rounded font-medium text-sm text-cyan-400">Strategy</div>
                <div className="absolute top-[25%] left-[5%] -translate-x-1/2 -translate-y-1/2 bg-white px-2 py-1 rounded font-medium text-sm text-cyan-400">Consistency</div>
                
                {/* Player's skill polygon */}
                <svg className="absolute inset-0" viewBox="0 0 200 200">
                  <defs>
                    <linearGradient id="skillGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FF5722" stopOpacity="0.7" />
                      <stop offset="100%" stopColor="#00BCD4" stopOpacity="0.7" />
                    </linearGradient>
                  </defs>
                  <polygon 
                    points="100,40 140,60 140,140 100,160 60,140 60,60" 
                    fill="url(#skillGradient)" 
                    stroke="#FF5722" 
                    strokeWidth="2"
                    className="origin-center"
                  />
                </svg>
                
                {/* Skill value dots */}
                <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-4 h-4 bg-orange-500 rounded-full border-2 border-white"></div>
                <div className="absolute top-[30%] right-[8%] w-4 h-4 bg-orange-500 rounded-full border-2 border-white"></div>
                <div className="absolute bottom-[30%] right-[8%] w-4 h-4 bg-orange-500 rounded-full border-2 border-white"></div>
                <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 w-4 h-4 bg-cyan-400 rounded-full border-2 border-white"></div>
                <div className="absolute bottom-[30%] left-[8%] w-4 h-4 bg-cyan-400 rounded-full border-2 border-white"></div>
                <div className="absolute top-[30%] left-[8%] w-4 h-4 bg-cyan-400 rounded-full border-2 border-white"></div>

                <div className="absolute bottom-[30%] left-[30%] w-4 h-4 bg-[#9C27B0] rounded-full border-2 border-white"></div>
                <div className="absolute top-[30%] left-[30%] w-4 h-4 bg-[#00BCD4] rounded-full border-2 border-white"></div>
                
                {/* Center badge */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white rounded-full h-16 w-16 flex items-center justify-center border-2 border-orange-500">
                    <div className="text-orange-500 font-bold text-xl">875</div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 text-center">
                <div className="text-sm text-gray-300 mb-2">Based on 24 recorded matches</div>
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 text-xs">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Live DUPR Integration</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Benefits */}
        <motion.div
          className="max-w-4xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <motion.div
            variants={fadeIn}
            className="text-center mb-10"
          >
            <h3 className="text-2xl font-bold mb-3 text-white">Why CourtIQ™ Is Different</h3>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Unlike traditional rating systems that only provide a single number, CourtIQ™ delivers actionable insights and personalized pathways through authentic platform analytics.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <BenefitCard 
              icon={<Sparkles size={24} />}
              title="Personalized Development"
              description="Receive custom insights and drills based on your specific skill profile and improvement opportunities."
            />
            <BenefitCard 
              icon={<Trophy size={24} />}
              title="Nuanced Matchmaking"
              description="Get matched with players based on compatible playing styles, not just a single rating number."
            />
            <BenefitCard 
              icon={<Award size={24} />}
              title="Holistic Progress"
              description="Track development across all skill dimensions instead of focusing on just winning or losing."
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

interface PillarCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  delay?: number;
}

function PillarCard({ icon, title, description, color, delay = 0 }: PillarCardProps) {
  return (
    <motion.div 
      className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6 shadow-sm hover:shadow-md transition-shadow"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
    >
      <div className={`inline-flex items-center justify-center p-3 rounded-lg mb-4`} style={{ backgroundColor: `${color}10` }}>
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </motion.div>
  );
}

interface SkillItemProps {
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

function SkillItem({ name, description, icon, color }: SkillItemProps) {
  return (
    <div className="flex items-start gap-3">
      <div className={`flex-shrink-0 p-1.5 rounded-md mt-0.5`} style={{ backgroundColor: `${color}20` }}>
        <div className="text-[#673AB7]">
          {icon}
        </div>
      </div>
      <div>
        <div className="font-bold flex items-center">
          {name}
          <div className="ml-2 w-16 h-1.5 rounded-full bg-gray-200 overflow-hidden">
            <div className="h-full rounded-full" style={{ 
              backgroundColor: color, 
              width: name === 'Power' ? '70%' : 
                     name === 'Control' ? '85%' : 
                     name === 'Speed' ? '65%' : 
                     name === 'Technique' ? '80%' : 
                     name === 'Strategy' ? '75%' : '90%'
            }}></div>
          </div>
        </div>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
}

interface BenefitCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function BenefitCard({ icon, title, description }: BenefitCardProps) {
  return (
    <motion.div 
      className="bg-gradient-to-br from-[#673AB7]/5 to-[#2196F3]/5 rounded-xl p-6 border border-[#673AB7]/10"
      variants={fadeIn}
    >
      <div className="text-[#673AB7] mb-4">{icon}</div>
      <h4 className="text-lg font-bold mb-2">{title}</h4>
      <p className="text-gray-600 text-sm">{description}</p>
    </motion.div>
  );
}