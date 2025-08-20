import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useLocation } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  ArrowRight, 
  QrCode, 
  Trophy, 
  Users, 
  Shield, 
  Zap,
  CheckCircle,
  Star,
  Target,
  Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

// Import brand assets
import pickleLogoPath from '@assets/Pickle (2).png';
import pickleCharacterPath from '@assets/Untitled design (51).png';
import { LanguageToggle } from '@/components/LanguageToggle';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
};

const scaleIn = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

// QR Code Passport Visual Component
const PassportPreview = () => {
  return (
    <motion.div 
      className="relative mx-auto max-w-sm"
      variants={scaleIn}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-100">
        <div className="text-center mb-4">
          <div className="w-24 h-24 bg-gradient-to-r from-orange-500 to-cyan-400 rounded-full mx-auto mb-3 flex items-center justify-center">
            <QrCode className="w-12 h-12 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">PKL-X7K9M2</h3>
          <p className="text-sm text-gray-600">Player Passport</p>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Ranking Points</span>
            <span className="font-bold text-orange-500">1,247</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Tier</span>
            <Badge className="bg-orange-100 text-orange-700">Elite</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Profile Complete</span>
            <span className="font-bold text-green-500">87%</span>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-gradient-to-r from-orange-500 to-cyan-400 h-2 rounded-full w-[87%]"></div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Tier Badge Component
const TierBadge = ({ tier, color, description }: { tier: string; color: string; description: string }) => (
  <motion.div 
    className="text-center p-4"
    variants={fadeInUp}
    whileHover={{ y: -5 }}
  >
    <div className={`w-16 h-16 ${color} rounded-full mx-auto mb-3 flex items-center justify-center shadow-lg`}>
      <Trophy className="w-8 h-8 text-white" />
    </div>
    <h4 className="font-bold text-gray-900 mb-1">{tier}</h4>
    <p className="text-sm text-gray-600">{description}</p>
  </motion.div>
);

// Feature Card Component
const FeatureCard = ({ icon, title, description }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) => (
  <motion.div
    className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300"
    variants={fadeInUp}
    whileHover={{ y: -8, transition: { duration: 0.2 } }}
  >
    <div className="mb-4 text-orange-500">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </motion.div>
);

export default function NewLandingPage() {
  const [, setLocation] = useLocation();
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);
  const { t } = useLanguage();

  // Safety check to ensure translation function exists
  const safeT = (key: string, fallback: string = '') => {
    try {
      return t && typeof t === 'function' ? t(key, fallback) : fallback || key;
    } catch (error) {
      console.warn('Translation error:', error);
      return fallback || key;
    }
  };

  const scrollToRanking = () => {
    const rankingSection = document.getElementById('ranking-explanation');
    if (rankingSection) {
      rankingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <motion.section 
        className="relative min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-gray-50 to-white"
        style={{ opacity }}
      >
        {/* Language Toggle in top-right corner */}
        <div className="absolute top-4 right-4">
          <LanguageToggle />
        </div>
        
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="space-y-8"
          >
            {/* Logo */}
            <motion.div variants={fadeInUp} className="mb-8">
              <img 
                src={pickleLogoPath} 
                alt="Pickle+"
                className="h-16 md:h-20 mx-auto"
              />
            </motion.div>

            {/* Main Headline */}
            <motion.h1 
              variants={fadeInUp}
              className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight"
            >
              {safeT('landing.hero.title', 'One Passport.')}
              <br />
              <span className="bg-gradient-to-r from-orange-500 to-cyan-400 bg-clip-text text-transparent">
                {safeT('landing.hero.titleHighlight', 'Every Court.')}
              </span>
              <br />
              {safeT('landing.hero.titleEnd', 'Your True Ranking.')}
            </motion.h1>

            {/* Subtitle */}
            <motion.p 
              variants={fadeInUp}
              className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
            >
              {safeT('landing.hero.subtitle1', 'The first transparent ranking system built for players, by players.')}<br />
              {safeT('landing.hero.subtitle2', 'No black boxes. No hidden algorithms.')}
            </motion.p>

            {/* Launch Badge */}
            <motion.div variants={fadeInUp} className="flex justify-center">
              <Badge className="bg-green-100 text-green-700 px-6 py-2 text-sm font-medium">
                <CheckCircle className="w-4 h-4 mr-2" />
{safeT('landing.hero.achievementBadge', '100% Platform Capability Achieved')}
              </Badge>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div 
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Button 
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-4 text-lg font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => setLocation('/register')}
              >
                {safeT('landing.hero.getStarted', 'Start Your Player Journey')}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 text-lg font-medium rounded-full transition-all duration-300"
                onClick={scrollToRanking}
              >
{safeT('landing.hero.seeRanking', 'See How Ranking Works')}
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Floating Passport Preview */}
        <motion.div 
          className="absolute right-8 top-1/2 transform -translate-y-1/2 hidden lg:block"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          <PassportPreview />
        </motion.div>
      </motion.section>

      {/* Algorithm Transparency Section */}
      <section id="ranking-explanation" className="py-24 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 
              variants={fadeInUp}
              className="text-3xl md:text-5xl font-bold text-gray-900 mb-6"
            >
{safeT('landing.ranking.title', 'Fair. Transparent. Proven.')}
            </motion.h2>
            <motion.p 
              variants={fadeInUp}
              className="text-xl text-gray-600 max-w-3xl mx-auto"
            >
{safeT('landing.ranking.subtitle', 'Age-adjusted rankings that actually make sense. Built with sophisticated algorithms that reward skill over demographics.')}
            </motion.p>
          </motion.div>

          {/* 4-Tier System */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16"
          >
            <TierBadge 
              tier={safeT('landing.tiers.recreational', 'Recreational')} 
              color="bg-green-500" 
              description={safeT('landing.tiers.recreationalPoints', '0-299 pts')} 
            />
            <TierBadge 
              tier={safeT('landing.tiers.competitive', 'Competitive')} 
              color="bg-blue-500" 
              description={safeT('landing.tiers.competitivePoints', '300-999 pts')} 
            />
            <TierBadge 
              tier={safeT('landing.tiers.elite', 'Elite')} 
              color="bg-orange-500" 
              description={safeT('landing.tiers.elitePoints', '1000-1799 pts')} 
            />
            <TierBadge 
              tier={safeT('landing.tiers.professional', 'Professional')} 
              color="bg-purple-500" 
              description={safeT('landing.tiers.professionalPoints', '1800+ pts')} 
            />
          </motion.div>

          {/* Algorithm Philosophy */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 mb-16"
          >
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{safeT('landing.philosophy.title', 'Our Ranking Philosophy')}</h3>
              <p className="text-gray-600 max-w-2xl mx-auto">
                {safeT('landing.philosophy.subtitle', 'Every player deserves a fair shot. Our algorithm recognizes that skill transcends age, gender, and playing frequency.')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-bold text-lg text-gray-900 mb-2">{safeT('landing.features.performanceTitle', 'Performance Weighted')}</h4>
                <p className="text-gray-600">{safeT('landing.features.performanceDesc', 'Tournament victories carry more weight than casual games, reflecting competitive achievement.')}</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-bold text-lg text-gray-900 mb-2">{safeT('landing.features.ageTitle', 'Age Balanced')}</h4>
                <p className="text-gray-600">{safeT('landing.features.ageDesc', 'Thoughtful adjustments ensure players of all ages can compete meaningfully within their cohort.')}</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-bold text-lg text-gray-900 mb-2">{safeT('landing.features.activityTitle', 'Activity Protected')}</h4>
                <p className="text-gray-600">{safeT('landing.features.activityDesc', 'Smart decay systems maintain your ranking even during busy life periods.')}</p>
              </div>
            </div>

            <div className="mt-8 p-6 bg-gradient-to-r from-orange-50 to-cyan-50 rounded-lg">
              <div className="text-center">
                <h4 className="font-bold text-gray-900 mb-3">{safeT('landing.result.title', 'The Result: True Competitive Balance')}</h4>
                <p className="text-gray-700">
                  {safeT('landing.result.description', 'A 25-year-old college athlete and a 55-year-old weekend warrior both earn rankings that reflect their skill within their respective competitive contexts.')}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Key Features Grid */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <FeatureCard
              icon={<Shield className="w-8 h-8" />}
              title={safeT('landing.features.ageGroupTitle', 'Age Group Fairness')}
              description={safeT('landing.features.ageGroupDesc', 'Automatic age multipliers ensure fair competition across generations with proven mathematical balance.')}
            />
            <FeatureCard
              icon={<Target className="w-8 h-8" />}
              title={safeT('landing.features.genderTitle', 'Gender Balance System')}
              description={safeT('landing.features.genderDesc', 'Cross-gender bonus system for developing players, with elite-level competitive parity.')}
            />
            <FeatureCard
              icon={<Zap className="w-8 h-8" />}
              title={safeT('landing.features.decayTitle', 'Decay Protection')}
              description={safeT('landing.features.decayDesc', 'Tier-specific activity requirements with enhanced professional weighting system.')}
            />
          </motion.div>
        </div>
      </section>

      {/* Player Passport Showcase */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
          >
            <div>
              <motion.h2 
                variants={fadeInUp}
                className="text-3xl md:text-5xl font-bold text-gray-900 mb-6"
              >
{safeT('landing.passport.title1', 'Your Digital')}
                <br />
                <span className="bg-gradient-to-r from-orange-500 to-cyan-400 bg-clip-text text-transparent">
                  {safeT('landing.passport.title2', 'Player Passport')}
                </span>
              </motion.h2>
              
              <motion.p 
                variants={fadeInUp}
                className="text-xl text-gray-600 mb-8 leading-relaxed"
              >
{safeT('landing.passport.subtitle', 'From 0% to Champion Status. Track your journey with meaningful milestones, Pickle Points rewards, and complete profile progression.')}
              </motion.p>

              <motion.div variants={fadeInUp} className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">{safeT('landing.passport.feature1', 'QR Code court check-ins')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">{safeT('landing.passport.feature2', 'Real-time ranking updates')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">{safeT('landing.passport.feature3', 'Milestone reward system')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">{safeT('landing.passport.feature4', 'Cross-platform compatibility')}</span>
                </div>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white px-8 py-4 text-lg font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={() => setLocation('/register')}
                >
{safeT('landing.passport.createButton', 'Create Your Passport')}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                
                <motion.div variants={fadeInUp}>
                  <Button 
                    variant="outline"
                    size="lg"
                    className="border-2 border-cyan-200 text-cyan-700 hover:bg-cyan-50 px-8 py-4 text-lg font-medium rounded-full transition-all duration-300"
                    onClick={scrollToRanking}
                  >
{safeT('landing.passport.learnMore', 'Learn More About Rankings')}
                  </Button>
                </motion.div>
              </motion.div>
            </div>

            <motion.div variants={scaleIn} className="flex justify-center">
              <PassportPreview />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Revolutionary Coaching Rating System */}
      <section className="py-16 sm:py-20 bg-gradient-to-b from-slate-900 to-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div 
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.h2 
              variants={fadeInUp}
              className="text-3xl sm:text-4xl font-bold mb-4 text-white"
            >
              Revolutionary <span className="text-orange-500">Coach Rating System</span>
            </motion.h2>
            <motion.p 
              variants={fadeInUp}
              className="text-lg text-gray-300 max-w-3xl mx-auto"
            >
              The most comprehensive skill assessment platform in pickleball, featuring expert coach validation and tournament-ready ratings.
            </motion.p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Key Features */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
            >
              <div className="space-y-8">
                <motion.div variants={fadeInUp} className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-orange-500 to-cyan-400 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-white">55-Point Skill Framework™</h3>
                    <p className="text-gray-300">
                      Comprehensive assessment covering Technical, Tactical, Physical, and Mental dimensions with granular skill tracking.
                    </p>
                  </div>
                </motion.div>

                <motion.div variants={fadeInUp} className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-white">Expert Coach Certification</h3>
                    <p className="text-gray-300">
                      5-level certification system (L1-L5) with weighted assessment authority and professional validation standards.
                    </p>
                  </div>
                </motion.div>

                <motion.div variants={fadeInUp} className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-white">Two-Tier Validation</h3>
                    <p className="text-gray-300">
                      PROVISIONAL ratings for development tracking, VERIFIED ratings for official tournament use.
                    </p>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Right: Rating Examples */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700"
            >
              <h3 className="text-2xl font-bold text-white mb-6 text-center">Live Rating Examples</h3>
              
              <div className="space-y-6">
                {/* Verified Rating Example */}
                <div className="bg-emerald-900/30 border border-emerald-500/20 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center">
                        <Shield className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-semibold">Alex Rodriguez</p>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400">
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                          <span className="text-emerald-300 text-sm font-bold">VERIFIED</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-emerald-400 font-bold text-lg">7.2 PCP</span>
                  </div>
                  <p className="text-sm text-gray-300">
                    <span className="text-emerald-400">✓ Tournament Eligible</span> • Confirmed by L4+ expert coach
                  </p>
                </div>

                {/* Provisional Rating Example */}
                <div className="bg-amber-900/30 border border-amber-500/20 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center">
                        <Target className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-semibold">Sarah Chen</p>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400">
                          <Target className="w-4 h-4 text-amber-400" />
                          <span className="text-amber-300 text-sm font-bold">PROVISIONAL</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-amber-400 font-bold text-lg">6.8 PCP</span>
                  </div>
                  <p className="text-sm text-gray-300">
                    <span className="text-amber-400">⚠ Requires L4+ validation</span> • Perfect for development tracking
                  </p>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-400">
                    Only expert-level coaches (L4-L5) can create tournament-eligible verified ratings
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-24 px-4 bg-gradient-to-r from-orange-50 to-cyan-50">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.h2 
              variants={fadeInUp}
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-6"
            >
              {safeT('landing.community.title', 'Built by the Community')}
            </motion.h2>
            
            <motion.p 
              variants={fadeInUp}
              className="text-xl text-gray-600 mb-12"
            >
              {safeT('landing.community.subtitle', 'Developed with input from players, coaches, and tournament directors to create the ranking system pickleball deserves.')}
            </motion.p>

            <motion.div 
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
            >
              <motion.div variants={fadeInUp} className="text-center">
                <div className="text-4xl font-bold text-orange-500 mb-2">100%</div>
                <div className="text-gray-600">{safeT('landing.community.stat1', 'Platform Ready')}</div>
              </motion.div>
              <motion.div variants={fadeInUp} className="text-center">
                <div className="text-4xl font-bold text-cyan-500 mb-2">4-Tier</div>
                <div className="text-gray-600">{safeT('landing.community.stat2', 'Classification System')}</div>
              </motion.div>
              <motion.div variants={fadeInUp} className="text-center">
                <div className="text-4xl font-bold text-purple-500 mb-2">Fair</div>
                <div className="text-gray-600">{safeT('landing.community.stat3', 'Age & Gender Balance')}</div>
              </motion.div>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Button 
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-cyan-500 hover:from-orange-600 hover:to-cyan-600 text-white px-12 py-4 text-lg font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => setLocation('/register')}
              >
{safeT('landing.community.joinButton', 'Join the Revolution')}
                <Star className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="py-12 px-4 bg-gray-900 text-white text-center">
        <div className="max-w-4xl mx-auto">
          <img 
            src={pickleLogoPath} 
            alt="Pickle+"
            className="h-8 mx-auto mb-4 opacity-80"
          />
          <p className="text-gray-400 text-sm">
            {safeT('landing.footer.copyright', '© 2025 Pickle+. The future of pickleball ranking systems.')}
          </p>
        </div>
      </footer>
    </div>
  );
}