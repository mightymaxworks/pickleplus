import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import { 
  Trophy, 
  Zap,
  Shield,
  Target,
  ArrowRight,
  Sparkles,
  Swords,
  Crown,
  ChevronRight,
  Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { PicklePlusGamingLogo } from '@/components/icons/PicklePlusGamingLogo';
import { LanguageToggle } from '@/components/LanguageToggle';

// Animated particles for background
const FloatingParticles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-orange-500/30 rounded-full"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          animate={{
            y: [null, Math.random() * window.innerHeight],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      ))}
    </div>
  );
};

// Feature Card with gaming aesthetic
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
  delay?: number;
}

const FeatureCard = ({ icon, title, description, gradient, delay = 0 }: FeatureCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay }}
    whileHover={{ y: -8, scale: 1.02 }}
  >
    <Card className="relative overflow-hidden bg-slate-800/50 border-slate-700 p-6 backdrop-blur-sm group hover:border-orange-500/50 transition-all duration-300">
      {/* Gradient glow on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
      
      {/* Icon with glow */}
      <div className="relative mb-4">
        <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
          <div className="text-white">
            {icon}
          </div>
        </div>
        <div className={`absolute inset-0 blur-xl bg-gradient-to-br ${gradient} opacity-50 -z-10`} />
      </div>
      
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{description}</p>
    </Card>
  </motion.div>
);

// Stats counter with animation
const StatCounter = ({ value, label, suffix = "" }: { value: number; label: string; suffix?: string }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [value]);
  
  return (
    <div className="text-center">
      <div className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500 mb-2">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-gray-400 text-sm uppercase tracking-wider">{label}</div>
    </div>
  );
};

export default function NewLandingPage() {
  const [, setLocation] = useLocation();
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95]);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <FloatingParticles />
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-lg border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <PicklePlusGamingLogo animated />
            
            <div className="flex items-center gap-4">
              <LanguageToggle />
              <Button 
                variant="ghost" 
                className="text-gray-300 hover:text-white"
                onClick={() => setLocation("/login")}
              >
                Sign In
              </Button>
              <Button 
                className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white shadow-lg shadow-orange-500/25"
                onClick={() => setLocation("/register")}
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <motion.section 
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative min-h-screen flex items-center justify-center px-4 pt-24"
      >
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-block mb-6"
            >
              <Badge className="px-4 py-2 text-sm bg-orange-500/20 text-orange-400 border-orange-500/50 backdrop-blur-sm">
                <Sparkles className="w-4 h-4 mr-2 inline" />
                The Future of Pickleball Tracking
              </Badge>
            </motion.div>
            
            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight"
            >
              <span className="text-white">Turn Every Match</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500">
                Into Your Legend
              </span>
            </motion.h1>
            
            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto"
            >
              Track your journey. Verify your wins. Build your reputation.
              <br className="hidden md:block" />
              <span className="text-orange-400 font-semibold">Where Players Become Legends.</span>
            </motion.p>
            
            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
            >
              <Button 
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white text-lg px-8 py-6 shadow-2xl shadow-orange-500/30 group"
                onClick={() => setLocation("/register")}
              >
                Create Your Passport
                <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button 
                size="lg"
                variant="outline"
                className="border-slate-700 bg-slate-800/50 hover:bg-slate-800 text-white text-lg px-8 py-6 backdrop-blur-sm"
                onClick={() => {
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <Play className="mr-2 h-5 w-5" />
                Learn More
              </Button>
            </motion.div>
            
            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="grid grid-cols-3 gap-8 max-w-3xl mx-auto"
            >
              <StatCounter value={10000} label="Matches Recorded" suffix="+" />
              <StatCounter value={5000} label="Active Players" suffix="+" />
              <StatCounter value={50000} label="Points Awarded" suffix="+" />
            </motion.div>
          </motion.div>
        </div>
        
        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 rounded-full border-2 border-gray-600 flex items-start justify-center p-2"
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1 h-2 bg-orange-500 rounded-full"
            />
          </motion.div>
        </motion.div>
      </motion.section>
      
      {/* Features Section */}
      <section id="features" className="relative py-32 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 px-4 py-2 bg-purple-500/20 text-purple-400 border-purple-500/50">
              <Zap className="w-4 h-4 mr-2 inline" />
              Core Features
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Your Complete <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500">Pickleball OS</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Everything you need to track, verify, and elevate your game
            </p>
          </motion.div>
          
          {/* Feature Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Swords className="w-6 h-6" />}
              title="Live Match Tracking"
              description="Record matches in real-time with our speed-focused Quick Match Recorder or gamified Live Score Tracker. Every point counts."
              gradient="from-orange-500 to-red-600"
              delay={0.1}
            />
            
            <FeatureCard
              icon={<Shield className="w-6 h-6" />}
              title="Verification System"
              description="Unique match URLs with serial numbers. Every match requires opponent verification before points are awarded. Zero fraud."
              gradient="from-blue-500 to-cyan-600"
              delay={0.2}
            />
            
            <FeatureCard
              icon={<Trophy className="w-6 h-6" />}
              title="Official Rankings"
              description="System B algorithm (3 win / 1 loss points) with age multipliers and gender balance. Fair, transparent, additive scoring."
              gradient="from-purple-500 to-pink-600"
              delay={0.3}
            />
            
            <FeatureCard
              icon={<Target className="w-6 h-6" />}
              title="Player Passport"
              description="Your unique QR-scannable passport code. Track your complete journey from recreational to professional tier."
              gradient="from-green-500 to-emerald-600"
              delay={0.4}
            />
            
            <FeatureCard
              icon={<Crown className="w-6 h-6" />}
              title="Tier System"
              description="Progress through Recreational, Competitive, Elite, and Professional tiers. Each tier unlocks new opportunities."
              gradient="from-yellow-500 to-orange-600"
              delay={0.5}
            />
            
            <FeatureCard
              icon={<Sparkles className="w-6 h-6" />}
              title="Match Analytics"
              description="Deep insights into your performance. Track trends, identify strengths, and get coaching recommendations."
              gradient="from-indigo-500 to-purple-600"
              delay={0.6}
            />
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="relative py-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Card className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 border-0 p-12 md:p-16">
              {/* Animated background */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEyYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMTIgMTJjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00eiIvPjwvZz48L2c+PC9zdmc+')] animate-pulse" />
              </div>
              
              <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  Ready to Begin Your Journey?
                </h2>
                <p className="text-xl text-white/90 mb-8">
                  Join thousands of players building their legend on Pickle+
                </p>
                
                <Button 
                  size="lg"
                  className="bg-white text-orange-600 hover:bg-gray-100 text-lg px-8 py-6 shadow-2xl group"
                  onClick={() => setLocation("/register")}
                >
                  Create Your Passport Now
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                
                <p className="mt-6 text-white/70 text-sm">
                  Free to start • No credit card required • Start tracking in seconds
                </p>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="border-t border-slate-800 py-12 px-4">
        <div className="max-w-7xl mx-auto text-center text-gray-500">
          <p className="mb-2">© 2025 Pickle+. Where Players Become Legends.</p>
          <p className="text-sm">Built for the pickleball community, powered by innovation.</p>
        </div>
      </footer>
    </div>
  );
}
