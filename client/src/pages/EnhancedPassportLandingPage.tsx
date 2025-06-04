/**
 * Enhanced Passport Landing Page
 * Showcases the actual passport features we've built with engaging animations
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-06-04
 */

import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useEffect } from "react";
import { PicklePlusTextLogo } from "@/components/icons/PicklePlusTextLogo";
import pickleLogoPath from "@assets/Pickle (2).png";
import { 
  QrCode, 
  Shield, 
  Trophy, 
  Users, 
  BarChart3,
  Star,
  Zap,
  CheckCircle,
  Award,
  Target,
  TrendingUp,
  Globe,
  Camera,
  Calendar,
  MapPin,
  Crown,
  Smartphone,
  Menu,
  X,
  Scan,
  Play,
  ArrowRight,
  Activity,
  Medal,
  ChevronDown,
  Sparkles
} from "lucide-react";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" }
  }
};

const slideInLeft = {
  hidden: { opacity: 0, x: -100 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.8, ease: "easeOut" }
  }
};

const slideInRight = {
  hidden: { opacity: 0, x: 100 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.8, ease: "easeOut" }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3
    }
  }
};

const floatingAnimation = {
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// Enhanced Interactive Passport Component
const EnhancedPassportDemo = () => {
  const [activeTab, setActiveTab] = useState<'passport' | 'rankings' | 'progress'>('passport');
  const [showQR, setShowQR] = useState(false);
  const [animatingPoints, setAnimatingPoints] = useState(false);

  // Mock ranking data showcasing our actual features
  const rankingData = [
    { division: '35+', format: 'Singles', points: 85, matches: '7/10', progress: 70, color: 'purple' },
    { division: 'Open', format: 'Singles', points: 72, matches: '4/10', progress: 40, color: 'blue' },
    { division: '35+', format: 'Doubles', points: 91, matches: '8/10', progress: 80, color: 'indigo' },
    { division: 'Open', format: 'Doubles', points: 68, matches: '5/10', progress: 50, color: 'violet' },
    { division: '35+', format: 'Mixed', points: 76, matches: '6/10', progress: 60, color: 'pink' },
    { division: 'Open', format: 'Mixed', points: 82, matches: '9/10', progress: 90, color: 'emerald' }
  ];

  const totalPoints = rankingData.reduce((sum, item) => sum + item.points, 0);

  useEffect(() => {
    if (activeTab === 'rankings') {
      setAnimatingPoints(true);
      setTimeout(() => setAnimatingPoints(false), 2000);
    }
  }, [activeTab]);

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Tab Navigation */}
      <div className="flex justify-center mb-8">
        <div className="bg-white/10 backdrop-blur-sm rounded-full p-2 border border-white/20">
          {[
            { key: 'passport', label: 'Passport', icon: QrCode },
            { key: 'rankings', label: 'Rankings', icon: Trophy },
            { key: 'progress', label: 'Progress', icon: TrendingUp }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 flex items-center gap-2 ${
                  activeTab === tab.key
                    ? 'bg-white text-orange-600 shadow-lg'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Display */}
      <AnimatePresence mode="wait">
        {activeTab === 'passport' && (
          <motion.div
            key="passport"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <motion.div 
              className="bg-gradient-to-br from-orange-500 via-orange-400 to-orange-600 rounded-2xl p-8 text-white shadow-2xl max-w-md mx-auto"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
              {...floatingAnimation}
            >
              {/* Passport Header */}
              <div className="text-center mb-6">
                <motion.h3 
                  className="text-2xl font-bold mb-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  PICKLE+ PASSPORT
                </motion.h3>
                <p className="text-orange-100 text-sm">Digital Player Identification</p>
              </div>
              
              {/* Player Info */}
              <motion.div 
                className="bg-white/20 rounded-lg p-4 mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/30 rounded-full flex items-center justify-center">
                    <Crown className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">Sarah Champion</h4>
                    <p className="text-orange-100 text-sm">Miami, FL</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs bg-white/20 text-white border-white/30">
                        Multi-Division Player
                      </Badge>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              {/* Stats Grid */}
              <motion.div 
                className="grid grid-cols-3 gap-3 mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <div className="text-center bg-white/10 rounded-lg p-3">
                  <div className="text-xl font-bold">{totalPoints}</div>
                  <div className="text-xs text-orange-100">Total Points</div>
                </div>
                <div className="text-center bg-white/10 rounded-lg p-3">
                  <div className="text-xl font-bold">4.8</div>
                  <div className="text-xs text-orange-100">DUPR Rating</div>
                </div>
                <div className="text-center bg-white/10 rounded-lg p-3">
                  <div className="text-xl font-bold">87%</div>
                  <div className="text-xs text-orange-100">Win Rate</div>
                </div>
              </motion.div>
              
              {/* QR Code Section */}
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9 }}
              >
                <div 
                  className="bg-white/20 rounded-lg py-4 px-4 cursor-pointer hover:bg-white/30 transition-all"
                  onClick={() => setShowQR(!showQR)}
                >
                  {showQR ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex flex-col items-center"
                    >
                      <div className="w-24 h-24 bg-white rounded-lg flex items-center justify-center mb-2">
                        <QrCode className="w-16 h-16 text-orange-600" />
                      </div>
                      <code className="text-lg font-mono font-bold tracking-wider">
                        SC4K9M2X
                      </code>
                    </motion.div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <Scan className="w-5 h-5" />
                      <span className="font-medium">Tap to Show QR Code</span>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {activeTab === 'rankings' && (
          <motion.div
            key="rankings"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto"
          >
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"
            >
              {rankingData.map((item, index) => (
                <motion.div
                  key={`${item.division}-${item.format}`}
                  variants={fadeInUp}
                  className={`bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:border-white/40 transition-all cursor-pointer`}
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 bg-${item.color}-400 rounded-full`}></div>
                      <span className="text-white font-medium text-sm">
                        {item.division} {item.format}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-xs text-white border-white/30">
                      Active
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <motion.div 
                        className="text-2xl font-bold text-white"
                        animate={animatingPoints ? { scale: [1, 1.2, 1] } : {}}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                      >
                        {item.points}
                      </motion.div>
                      <div className="text-xs text-white/70">Ranking Points</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-white font-medium">{item.matches}</div>
                      <div className="text-xs text-white/70">matches</div>
                    </div>
                  </div>
                  
                  <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className={`h-full bg-${item.color}-400 rounded-full`}
                      initial={{ width: 0 }}
                      animate={{ width: `${item.progress}%` }}
                      transition={{ duration: 1.5, delay: index * 0.2 }}
                    />
                  </div>
                </motion.div>
              ))}
            </motion.div>
            
            <motion.div
              className="text-center mt-8 bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.5 }}
            >
              <motion.div 
                className="text-3xl font-bold text-white mb-2"
                animate={animatingPoints ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 0.8 }}
              >
                {totalPoints}
              </motion.div>
              <div className="text-white/80">Total Ranking Points Across All Divisions</div>
            </motion.div>
          </motion.div>
        )}

        {activeTab === 'progress' && (
          <motion.div
            key="progress"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            className="max-w-lg mx-auto"
          >
            <motion.div 
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20"
              {...floatingAnimation}
            >
              <div className="text-center mb-8">
                <motion.div
                  className="w-32 h-32 mx-auto relative mb-4"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.8, type: "spring" }}
                >
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="8"
                      fill="none"
                    />
                    <motion.circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="white"
                      strokeWidth="8"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - 0.73) }}
                      transition={{ duration: 2, ease: "easeOut" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">73%</span>
                  </div>
                </motion.div>
                <h3 className="text-xl font-bold text-white mb-2">Overall Progress</h3>
                <p className="text-white/70">Across all ranking categories</p>
              </div>
              
              <motion.div 
                className="space-y-4"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {[
                  { label: 'Rankings Active', value: '6/6', icon: Trophy },
                  { label: 'Matches Played', value: '39/60', icon: Activity },
                  { label: 'Qualification Progress', value: '4/6', icon: Medal },
                  { label: 'Community Engagement', value: 'High', icon: Users }
                ].map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.label}
                      variants={fadeInUp}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-white/80" />
                        <span className="text-white font-medium">{item.label}</span>
                      </div>
                      <span className="text-white font-bold">{item.value}</span>
                    </motion.div>
                  );
                })}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Mobile-Friendly Feature Highlights
const MobileFeatureHighlights = () => {
  const features = [
    { icon: QrCode, title: "QR Passport", desc: "Instant player identification" },
    { icon: Trophy, title: "Multi-Division Rankings", desc: "Track progress across all categories" },
    { icon: BarChart3, title: "Real-time Analytics", desc: "Performance insights & trends" },
    { icon: Shield, title: "Verified Matches", desc: "Secure & authenticated results" }
  ];

  return (
    <motion.div 
      className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 max-w-4xl mx-auto px-4"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      {features.map((feature, index) => {
        const Icon = feature.icon;
        return (
          <motion.div
            key={feature.title}
            className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 text-center"
            variants={fadeInUp}
            whileHover={{ scale: 1.05, y: -2 }}
            animate={{
              y: [0, -5, 0],
              transition: {
                duration: 3 + index,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
          >
            <Icon className="w-8 h-8 text-white mb-2 mx-auto" />
            <h4 className="text-white font-medium text-sm mb-1">{feature.title}</h4>
            <p className="text-white/70 text-xs">{feature.desc}</p>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default function EnhancedPassportLandingPage() {
  const [, navigate] = useLocation();
  const [scrollY, setScrollY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-600 via-orange-500 to-orange-700 overflow-x-hidden">
      {/* Navigation Header */}
      <motion.header 
        className="py-4 px-4 sm:px-6 fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          backgroundColor: scrollY > 50 ? 'rgba(255,255,255,0.95)' : 'transparent',
          backdropFilter: scrollY > 50 ? 'blur(10px)' : 'none',
          borderBottom: scrollY > 50 ? '1px solid rgba(0,0,0,0.1)' : 'none'
        }}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <img 
                src={pickleLogoPath} 
                alt="Pickle+" 
                className="h-8 w-auto"
              />
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#passport" className={`font-medium transition-colors ${scrollY > 50 ? 'text-gray-700 hover:text-orange-600' : 'text-white/90 hover:text-white'}`}>
                Passport
              </a>
              <a href="#rankings" className={`font-medium transition-colors ${scrollY > 50 ? 'text-gray-700 hover:text-orange-600' : 'text-white/90 hover:text-white'}`}>
                Rankings
              </a>
              <a href="#features" className={`font-medium transition-colors ${scrollY > 50 ? 'text-gray-700 hover:text-orange-600' : 'text-white/90 hover:text-white'}`}>
                Features
              </a>
              <Button 
                onClick={() => navigate('/auth')}
                className="bg-orange-500 hover:bg-orange-600 text-white border-0"
              >
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </nav>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{ color: scrollY > 50 ? '#ea580c' : 'white' }}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation Menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden mt-4 pb-4"
              >
                <nav className="flex flex-col space-y-4">
                  <a 
                    href="#passport" 
                    className={`font-medium transition-colors ${scrollY > 50 ? 'text-gray-700 hover:text-orange-600' : 'text-white/90 hover:text-white'}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Passport
                  </a>
                  <a 
                    href="#rankings" 
                    className={`font-medium transition-colors ${scrollY > 50 ? 'text-gray-700 hover:text-orange-600' : 'text-white/90 hover:text-white'}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Rankings
                  </a>
                  <a 
                    href="#features" 
                    className={`font-medium transition-colors ${scrollY > 50 ? 'text-gray-700 hover:text-orange-600' : 'text-white/90 hover:text-white'}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Features
                  </a>
                  <Button 
                    onClick={() => {
                      navigate('/auth');
                      setMobileMenuOpen(false);
                    }}
                    className="bg-orange-500 hover:bg-orange-600 text-white border-0 w-full"
                  >
                    Get Started
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </nav>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 pt-20">
        <div className="container mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="max-w-4xl mx-auto"
          >
            <motion.h1 
              className="text-5xl md:text-7xl font-bold text-white mb-6"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            >
              Your Pickleball
              <motion.span 
                className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent"
                animate={{ 
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                Digital Passport
              </motion.span>
            </motion.h1>
            
            <motion.p 
              className="text-xl text-white/90 mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              Track your journey across all divisions with multi-dimensional rankings, 
              QR verification, and real-time performance analytics
            </motion.p>
            
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              <Button 
                size="lg"
                onClick={() => navigate('/auth')}
                className="bg-white text-orange-600 hover:bg-orange-50 font-bold px-8 py-4 text-lg"
              >
                <Play className="w-5 h-5 mr-2" />
                Start Your Journey
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-orange-600 font-medium px-8 py-4 text-lg"
              >
                <Camera className="w-5 h-5 mr-2" />
                See Demo
              </Button>
            </motion.div>
            
            {/* Mobile-Friendly Feature Highlights */}
            <MobileFeatureHighlights />
          </motion.div>
        </div>
        
        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown className="w-8 h-8 text-white/70" />
        </motion.div>
      </section>

      {/* Interactive Demo Section */}
      <section id="passport" className="py-20 px-4 sm:px-6 relative">
        <div className="container mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Experience Your Digital Passport
            </h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              See how our multi-division ranking system tracks your progress 
              across every category and division you play
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
          >
            <EnhancedPassportDemo />
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-4 sm:px-6 bg-black/20">
        <div className="container mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Why Choose Pickle+
            </h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              The most comprehensive pickleball player tracking system ever built
            </p>
          </motion.div>
          
          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                icon: Trophy,
                title: "Multi-Division Rankings",
                description: "Track your progress in Open, 35+, and all format combinations independently",
                color: "from-purple-500 to-pink-500"
              },
              {
                icon: QrCode,
                title: "QR Passport System",
                description: "Instant player verification and match initiation with secure QR codes",
                color: "from-blue-500 to-cyan-500"
              },
              {
                icon: BarChart3,
                title: "Real-time Analytics",
                description: "Advanced performance tracking with progress bars and trend analysis",
                color: "from-green-500 to-emerald-500"
              },
              {
                icon: Shield,
                title: "Verified Matches",
                description: "Authenticated results with comprehensive match history tracking",
                color: "from-orange-500 to-red-500"
              },
              {
                icon: Target,
                title: "Competitive Motivation",
                description: "See exactly what you need to advance in each ranking category",
                color: "from-indigo-500 to-purple-500"
              },
              {
                icon: Globe,
                title: "PCP Global System",
                description: "Participate in the most advanced pickleball ranking system worldwide",
                color: "from-teal-500 to-blue-500"
              }
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  variants={fadeInUp}
                  className="group"
                >
                  <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:border-white/40 transition-all duration-300 h-full">
                    <CardContent className="p-6">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                      <p className="text-white/70">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Elevate Your Game?
            </h2>
            <p className="text-xl text-white/80 mb-8">
              Join thousands of players already using Pickle+ to track their pickleball journey
            </p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              whileInView={{ opacity: 1, scale: 1 }}
              initial={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <Button 
                size="lg"
                onClick={() => navigate('/auth')}
                className="bg-white text-orange-600 hover:bg-orange-50 font-bold px-8 py-4 text-lg"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Create Your Passport
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-orange-600 font-medium px-8 py-4 text-lg"
              >
                <Users className="w-5 h-5 mr-2" />
                Find Players
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}