import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import React, { useState, useEffect } from "react";
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
  Smartphone
} from "lucide-react";

// Animation variants
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

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

// Interactive Passport Component
const InteractivePassport = () => {
  const [showQR, setShowQR] = useState(false);
  
  return (
    <motion.div 
      className="relative bg-gradient-to-br from-orange-500 via-orange-400 to-orange-600 rounded-2xl p-8 text-white shadow-2xl max-w-md mx-auto"
      variants={slideUp}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.3 }}
    >
      {/* Passport Header */}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold mb-2">PICKLE+ PASSPORT</h3>
        <p className="text-orange-100 text-sm">Digital Player Identification</p>
      </div>
      
      {/* Player Info */}
      <div className="bg-white/20 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/30 rounded-full flex items-center justify-center">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <h4 className="font-bold text-lg">Player Name</h4>
            <p className="text-orange-100 text-sm">Miami, FL</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs bg-white/20 text-white border-white/30">
                Open Division
              </Badge>
            </div>
          </div>
        </div>
      </div>
      
      {/* Passport Code */}
      <div className="text-center mb-6">
        <p className="text-orange-100 text-sm mb-2">Passport Code</p>
        <div className="bg-white/20 rounded-lg py-3 px-4">
          <code className="text-2xl font-mono font-bold tracking-wider">
            MX8K7P2N
          </code>
        </div>
      </div>
      
      {/* QR Code Toggle */}
      <div className="text-center">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowQR(!showQR)}
          className="bg-white/20 text-white border-white/30 hover:bg-white/30"
        >
          <QrCode className="w-4 h-4 mr-2" />
          {showQR ? 'Hide QR' : 'Show QR'}
        </Button>
        
        {showQR && (
          <motion.div 
            className="mt-4 bg-white rounded-lg p-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-32 h-32 bg-gray-900 rounded-lg mx-auto flex items-center justify-center">
              <QrCode className="w-16 h-16 text-white" />
            </div>
            <p className="text-gray-600 text-xs mt-2">Scannable Player Profile</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

// Feature Card Component
const FeatureCard = ({ 
  icon, 
  title, 
  description,
  highlight = false
}: { 
  icon: React.ReactNode, 
  title: string, 
  description: string,
  highlight?: boolean
}) => {
  return (
    <motion.div 
      className={`rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border ${
        highlight 
          ? 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200' 
          : 'bg-white border-gray-100'
      }`}
      variants={fadeIn}
      whileHover={{ 
        y: -8, 
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        transition: { duration: 0.2 } 
      }}
    >
      <div className={`mb-4 ${highlight ? 'text-orange-600' : 'text-gray-700'} bg-gray-50 p-3 rounded-full inline-block`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </motion.div>
  );
};

// Point System Visualization
const PointSystemDemo = () => {
  const pointTypes = [
    { type: 'Tournament', value: 100, color: 'bg-green-500', icon: Trophy },
    { type: 'League', value: 67, color: 'bg-blue-500', icon: Users },
    { type: 'Casual', value: 50, color: 'bg-orange-500', icon: Target }
  ];
  
  return (
    <motion.div 
      className="bg-white rounded-xl p-6 shadow-lg"
      variants={fadeIn}
    >
      <h3 className="text-xl font-bold mb-4 text-center">Hybrid Point System</h3>
      <p className="text-gray-600 text-center mb-6">Transparent point values for all match types</p>
      
      <div className="space-y-4">
        {pointTypes.map((point, index) => {
          const IconComponent = point.icon;
          return (
            <motion.div 
              key={point.type}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${point.color} text-white`}>
                  <IconComponent className="w-4 h-4" />
                </div>
                <span className="font-medium">{point.type} Matches</span>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg">{point.value}%</div>
                <div className="text-xs text-gray-500">Point Value</div>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-4 h-4 text-orange-600" />
          <span className="font-medium text-orange-900">Anti-Gaming Protection</span>
        </div>
        <p className="text-sm text-orange-700">
          Frequency-based reduction prevents point farming from repeated opponents
        </p>
      </div>
    </motion.div>
  );
};

export default function PlayerPassportLandingPage() {
  const [, navigate] = useLocation();
  
  return (
    <div className="player-passport-landing overflow-x-hidden w-full">
      {/* Navigation Header */}
      <header className="py-4 px-4 sm:px-6 fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">P+</span>
              </div>
              <span className="font-bold text-lg">Pickle+</span>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#passport" className="text-gray-700 hover:text-orange-600 font-medium">Passport</a>
              <a href="#rankings" className="text-gray-700 hover:text-orange-600 font-medium">Rankings</a>
              <a href="#features" className="text-gray-700 hover:text-orange-600 font-medium">Features</a>
              <Button 
                onClick={() => navigate('/auth')}
                className="bg-orange-500 hover:bg-orange-600"
              >
                Get Started
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 bg-gradient-to-br from-orange-50 via-white to-orange-50">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.div variants={fadeIn}>
                <Badge className="mb-4 bg-orange-100 text-orange-800 border-orange-200">
                  Digital Player Passport
                </Badge>
              </motion.div>
              
              <motion.h1 
                className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6"
                variants={fadeIn}
              >
                Your{' '}
                <span className="text-orange-500">Digital</span>{' '}
                Pickleball{' '}
                <span className="text-orange-500">Passport</span>
              </motion.h1>
              
              <motion.p 
                className="text-xl text-gray-600 mb-8 leading-relaxed"
                variants={fadeIn}
              >
                Unique 8-digit passport codes, QR-scannable profiles, and independent rankings 
                across every category and division. Your complete pickleball identity in one place.
              </motion.p>
              
              <motion.div 
                className="flex flex-col sm:flex-row gap-4"
                variants={fadeIn}
              >
                <Button 
                  size="lg" 
                  onClick={() => navigate('/auth')}
                  className="bg-orange-500 hover:bg-orange-600 text-lg px-8 py-3"
                >
                  <QrCode className="w-5 h-5 mr-2" />
                  Get Your Passport
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => navigate('/auth')}
                  className="border-orange-200 text-orange-600 hover:bg-orange-50 text-lg px-8 py-3"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Scan a Player
                </Button>
              </motion.div>
            </motion.div>
            
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <InteractivePassport />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Independent Rankings Section */}
      <section id="rankings" className="py-16 px-4 sm:px-6 bg-gray-50">
        <div className="container mx-auto">
          <motion.div 
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeIn}>
              <Badge className="mb-4 bg-blue-100 text-blue-800 border-blue-200">
                PCP Global Ranking System
              </Badge>
            </motion.div>
            <motion.h2 
              className="text-3xl sm:text-4xl font-bold mb-4"
              variants={fadeIn}
            >
              Independent Rankings for{' '}
              <span className="text-orange-500">Every Category</span>
            </motion.h2>
            <motion.p 
              className="text-xl text-gray-600 max-w-3xl mx-auto"
              variants={fadeIn}
            >
              Your men's singles ranking is completely separate from your mixed doubles ranking. 
              True independence across all categories and divisions.
            </motion.p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              <PointSystemDemo />
            </motion.div>
            
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="lg:col-span-2"
            >
              <div className="grid sm:grid-cols-2 gap-6">
                <FeatureCard
                  icon={<Globe className="w-6 h-6" />}
                  title="Category Independence"
                  description="Rankings in men's singles don't affect your mixed doubles standing. Every category is completely separate."
                />
                <FeatureCard
                  icon={<TrendingUp className="w-6 h-6" />}
                  title="52-Week Rolling"
                  description="Points expire after one year, ensuring rankings reflect current skill level and recent performance."
                />
                <FeatureCard
                  icon={<Shield className="w-6 h-6" />}
                  title="Anti-Gaming System"
                  description="Frequency-based point reduction prevents exploitation while encouraging diverse competition."
                />
                <FeatureCard
                  icon={<Award className="w-6 h-6" />}
                  title="Transparent Scoring"
                  description="See exactly how points are calculated for every match type with full transparency."
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Passport Features Section */}
      <section id="passport" className="py-16 px-4 sm:px-6">
        <div className="container mx-auto">
          <motion.div 
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeIn}>
              <Badge className="mb-4 bg-green-100 text-green-800 border-green-200">
                Player Passport Features
              </Badge>
            </motion.div>
            <motion.h2 
              className="text-3xl sm:text-4xl font-bold mb-4"
              variants={fadeIn}
            >
              Everything in Your{' '}
              <span className="text-orange-500">Digital Passport</span>
            </motion.h2>
            <motion.p 
              className="text-xl text-gray-600 max-w-3xl mx-auto"
              variants={fadeIn}
            >
              From instant match recording to comprehensive player profiles, 
              your passport is your gateway to the entire pickleball ecosystem.
            </motion.p>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <FeatureCard
              icon={<QrCode className="w-6 h-6" />}
              title="QR Code Profile"
              description="Instant player identification and profile access. Tournament directors can scan to record matches immediately."
              highlight
            />
            <FeatureCard
              icon={<Smartphone className="w-6 h-6" />}
              title="8-Digit Passport Code"
              description="Unique alphanumeric identifier that never changes. Your permanent pickleball identity."
            />
            <FeatureCard
              icon={<Users className="w-6 h-6" />}
              title="Admin Match Recording"
              description="Tournament directors can record matches on behalf of players with automatic validation and point calculation."
            />
            <FeatureCard
              icon={<BarChart3 className="w-6 h-6" />}
              title="Independent Rankings"
              description="Separate rankings for every category and division combination. Men's singles, women's doubles, mixed - all independent."
            />
            <FeatureCard
              icon={<Trophy className="w-6 h-6" />}
              title="Hybrid Point System"
              description="Tournament matches worth 100%, league 67%, casual 50%. Transparent point values for all match types."
            />
            <FeatureCard
              icon={<Calendar className="w-6 h-6" />}
              title="Match History"
              description="Complete match history with detailed statistics, opponent analysis, and performance tracking across all categories."
            />
          </motion.div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 sm:px-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
        <div className="container mx-auto text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2 
              className="text-3xl sm:text-4xl font-bold mb-4"
              variants={fadeIn}
            >
              Ready for Your Digital Passport?
            </motion.h2>
            <motion.p 
              className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto"
              variants={fadeIn}
            >
              Join the revolution in pickleball player identification and ranking. 
              Get your unique passport code and start building your independent rankings today.
            </motion.p>
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              variants={fadeIn}
            >
              <Button 
                size="lg"
                onClick={() => navigate('/auth')}
                className="bg-white text-orange-600 hover:bg-orange-50 text-lg px-8 py-3"
              >
                <QrCode className="w-5 h-5 mr-2" />
                Get Your Passport Now
              </Button>
              <Button 
                size="lg"
                variant="outline"
                onClick={() => navigate('/auth')}
                className="border-white text-white hover:bg-white/10 text-lg px-8 py-3"
              >
                Learn More
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 bg-gray-900 text-white">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">P+</span>
              </div>
              <span className="font-bold text-lg">Pickle+</span>
            </div>
            <div className="text-center md:text-right">
              <p className="text-gray-400">
                Your Digital Pickleball Passport
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Independent rankings • Transparent points • QR profiles
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}