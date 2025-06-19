/**
 * Modern Landing Page - Bilingual Support
 * Designed to attract users with contemporary design and English/Mandarin language toggle
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-06-19
 */

import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useAuth } from "@/contexts/AuthContext";
import pickleLogoPath from "@assets/Pickle (2).png";
import { 
  ArrowRight, 
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
  Calendar,
  MapPin,
  Crown,
  Smartphone,
  Menu,
  X,
  Play,
  Activity,
  Medal,
  ChevronDown,
  Sparkles,
  Shield,
  LayoutDashboard
} from "lucide-react";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
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
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

const slideInFromLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.8, ease: "easeOut" }
  }
};

const slideInFromRight = {
  hidden: { opacity: 0, x: 60 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.8, ease: "easeOut" }
  }
};

export default function ModernLandingPage() {
  const [, navigate] = useLocation();
  const { t } = useLanguage();
  const { user, isLoading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="modern-landing-page overflow-x-hidden w-full bg-white">
      {/* Modern Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <img src={pickleLogoPath} alt="Pickle+" className="h-10 w-auto" />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-orange-600 transition-colors font-medium">
                {t('landing.nav.features')}
              </a>
              <a href="#benefits" className="text-gray-600 hover:text-orange-600 transition-colors font-medium">
                {t('landing.nav.benefits')}
              </a>
              <a href="#community" className="text-gray-600 hover:text-orange-600 transition-colors font-medium">
                {t('landing.nav.community')}
              </a>
              <LanguageToggle />
              {user ? (
                <Button onClick={() => navigate("/dashboard")} className="bg-orange-600 hover:bg-orange-700">
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  {t('landing.nav.dashboard')}
                </Button>
              ) : (
                <Button onClick={() => navigate("/auth")} className="bg-orange-600 hover:bg-orange-700">
                  {t('landing.nav.getStarted')}
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-3">
              <LanguageToggle />
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-600 hover:text-gray-900"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden py-4 border-t border-gray-100"
              >
                <div className="flex flex-col space-y-4">
                  <a href="#features" className="text-gray-600 hover:text-orange-600 transition-colors">
                    {t('landing.nav.features')}
                  </a>
                  <a href="#benefits" className="text-gray-600 hover:text-orange-600 transition-colors">
                    {t('landing.nav.benefits')}
                  </a>
                  <a href="#community" className="text-gray-600 hover:text-orange-600 transition-colors">
                    {t('landing.nav.community')}
                  </a>
                  {user ? (
                    <Button onClick={() => navigate("/dashboard")} className="bg-orange-600 hover:bg-orange-700 w-full">
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      {t('landing.nav.dashboard')}
                    </Button>
                  ) : (
                    <Button onClick={() => navigate("/auth")} className="bg-orange-600 hover:bg-orange-700 w-full">
                      {t('landing.nav.getStarted')}
                    </Button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-16 pb-20 bg-gradient-to-br from-orange-50 via-white to-blue-50">
        <div className="container mx-auto px-4 sm:px-6 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="text-center lg:text-left"
            >
              <motion.div variants={fadeInUp} className="mb-6">
                <Badge className="bg-orange-100 text-orange-800 border-orange-200 px-4 py-2 text-sm font-medium">
                  <Sparkles className="w-4 h-4 mr-2" />
                  {t('landing.hero.badge')}
                </Badge>
              </motion.div>

              <motion.h1 
                variants={fadeInUp}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight"
              >
                {t('landing.hero.title')}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-blue-600">
                  {t('landing.hero.titleHighlight')}
                </span>
              </motion.h1>

              <motion.p 
                variants={fadeInUp}
                className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0"
              >
                {t('landing.hero.description')}
              </motion.p>

              <motion.div 
                variants={fadeInUp}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                {user ? (
                  <Button 
                    size="lg"
                    onClick={() => navigate("/dashboard")}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 text-lg font-medium"
                  >
                    <LayoutDashboard className="w-5 h-5 mr-2" />
                    {t('landing.hero.goToDashboard')}
                  </Button>
                ) : (
                  <Button 
                    size="lg"
                    onClick={() => navigate("/auth")}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 text-lg font-medium"
                  >
                    {t('landing.hero.startFree')}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                )}
                
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 text-lg"
                >
                  <Play className="w-5 h-5 mr-2" />
                  {t('landing.hero.watchDemo')}
                </Button>
              </motion.div>

              <motion.div 
                variants={fadeInUp}
                className="mt-8 flex items-center justify-center lg:justify-start space-x-4 text-sm text-gray-600"
              >
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  {t('landing.hero.feature1')}
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  {t('landing.hero.feature2')}
                </div>
              </motion.div>
            </motion.div>

            {/* Hero Visual */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={slideInFromRight}
              className="relative"
            >
              <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="bg-gradient-to-br from-orange-500 to-blue-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">{t('landing.hero.card.title')}</h3>
                    <Trophy className="w-8 h-8 text-yellow-300" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-white/80">{t('landing.hero.card.rating')}</div>
                      <div className="text-2xl font-bold">4.25</div>
                    </div>
                    <div>
                      <div className="text-white/80">{t('landing.hero.card.matches')}</div>
                      <div className="text-2xl font-bold">47</div>
                    </div>
                    <div>
                      <div className="text-white/80">{t('landing.hero.card.rank')}</div>
                      <div className="text-2xl font-bold">#12</div>
                    </div>
                    <div>
                      <div className="text-white/80">{t('landing.hero.card.points')}</div>
                      <div className="text-2xl font-bold">1,250</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating elements */}
              <motion.div 
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-4 -right-4 bg-blue-500 text-white p-3 rounded-full shadow-lg"
              >
                <BarChart3 className="w-6 h-6" />
              </motion.div>
              
              <motion.div 
                animate={{ y: [10, -10, 10] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-4 -left-4 bg-green-500 text-white p-3 rounded-full shadow-lg"
              >
                <Target className="w-6 h-6" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {t('landing.features.title')}
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('landing.features.description')}
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {/* Feature 1 */}
            <motion.div variants={fadeInUp}>
              <Card className="p-6 h-full hover:shadow-lg transition-shadow border-0 bg-gradient-to-br from-orange-50 to-orange-100">
                <CardContent className="p-0">
                  <div className="bg-orange-500 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{t('landing.features.analytics.title')}</h3>
                  <p className="text-gray-600">{t('landing.features.analytics.description')}</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Feature 2 */}
            <motion.div variants={fadeInUp}>
              <Card className="p-6 h-full hover:shadow-lg transition-shadow border-0 bg-gradient-to-br from-blue-50 to-blue-100">
                <CardContent className="p-0">
                  <div className="bg-blue-500 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{t('landing.features.community.title')}</h3>
                  <p className="text-gray-600">{t('landing.features.community.description')}</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Feature 3 */}
            <motion.div variants={fadeInUp}>
              <Card className="p-6 h-full hover:shadow-lg transition-shadow border-0 bg-gradient-to-br from-green-50 to-green-100">
                <CardContent className="p-0">
                  <div className="bg-green-500 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{t('landing.features.tournaments.title')}</h3>
                  <p className="text-gray-600">{t('landing.features.tournaments.description')}</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Feature 4 */}
            <motion.div variants={fadeInUp}>
              <Card className="p-6 h-full hover:shadow-lg transition-shadow border-0 bg-gradient-to-br from-purple-50 to-purple-100">
                <CardContent className="p-0">
                  <div className="bg-purple-500 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{t('landing.features.coaching.title')}</h3>
                  <p className="text-gray-600">{t('landing.features.coaching.description')}</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Feature 5 */}
            <motion.div variants={fadeInUp}>
              <Card className="p-6 h-full hover:shadow-lg transition-shadow border-0 bg-gradient-to-br from-yellow-50 to-yellow-100">
                <CardContent className="p-0">
                  <div className="bg-yellow-500 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                    <Smartphone className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{t('landing.features.mobile.title')}</h3>
                  <p className="text-gray-600">{t('landing.features.mobile.description')}</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Feature 6 */}
            <motion.div variants={fadeInUp}>
              <Card className="p-6 h-full hover:shadow-lg transition-shadow border-0 bg-gradient-to-br from-red-50 to-red-100">
                <CardContent className="p-0">
                  <div className="bg-red-500 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{t('landing.features.progress.title')}</h3>
                  <p className="text-gray-600">{t('landing.features.progress.description')}</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={slideInFromLeft}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                {t('landing.benefits.title')}
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                {t('landing.benefits.description')}
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-orange-500 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{t('landing.benefits.benefit1.title')}</h3>
                    <p className="text-gray-600">{t('landing.benefits.benefit1.description')}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-500 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{t('landing.benefits.benefit2.title')}</h3>
                    <p className="text-gray-600">{t('landing.benefits.benefit2.description')}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-green-500 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{t('landing.benefits.benefit3.title')}</h3>
                    <p className="text-gray-600">{t('landing.benefits.benefit3.description')}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={slideInFromRight}
              className="relative"
            >
              <div className="bg-gradient-to-br from-orange-500 to-blue-600 rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-6">{t('landing.benefits.stats.title')}</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-2">98%</div>
                    <div className="text-white/80">{t('landing.benefits.stats.improvement')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-2">5,000+</div>
                    <div className="text-white/80">{t('landing.benefits.stats.players')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-2">15min</div>
                    <div className="text-white/80">{t('landing.benefits.stats.setup')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-2">24/7</div>
                    <div className="text-white/80">{t('landing.benefits.stats.tracking')}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section id="community" className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              {t('landing.community.title')}
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-gray-600 mb-16 max-w-3xl mx-auto">
              {t('landing.community.description')}
            </motion.p>

            <motion.div variants={fadeInUp} className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="bg-orange-50 rounded-2xl p-8">
                <Globe className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">50+</h3>
                <p className="text-gray-600">{t('landing.community.countries')}</p>
              </div>
              <div className="bg-blue-50 rounded-2xl p-8">
                <Users className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">10,000+</h3>
                <p className="text-gray-600">{t('landing.community.activeUsers')}</p>
              </div>
              <div className="bg-green-50 rounded-2xl p-8">
                <Activity className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">1M+</h3>
                <p className="text-gray-600">{t('landing.community.matchesTracked')}</p>
              </div>
            </motion.div>

            <motion.div variants={fadeInUp}>
              {user ? (
                <Button 
                  size="lg"
                  onClick={() => navigate("/dashboard")}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 text-lg font-medium"
                >
                  <LayoutDashboard className="w-5 h-5 mr-2" />
                  {t('landing.community.goToDashboard')}
                </Button>
              ) : (
                <Button 
                  size="lg"
                  onClick={() => navigate("/auth")}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 text-lg font-medium"
                >
                  {t('landing.community.joinNow')}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <img src={pickleLogoPath} alt="Pickle+" className="h-10 w-auto" />
              </div>
              <p className="text-gray-400 max-w-sm">
                {t('landing.footer.description')}
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">{t('landing.footer.product')}</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">{t('landing.footer.features')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('landing.footer.pricing')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('landing.footer.tutorials')}</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">{t('landing.footer.company')}</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">{t('landing.footer.about')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('landing.footer.contact')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('landing.footer.privacy')}</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">{t('landing.footer.support')}</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">{t('landing.footer.help')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('landing.footer.community')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('landing.footer.updates')}</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Pickle+. {t('landing.footer.rights')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}