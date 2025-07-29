import React, { useState } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { 
  Award, 
  Target, 
  Users, 
  TrendingUp, 
  CheckCircle, 
  Star,
  ArrowRight,
  PlayCircle,
  BarChart3,
  Brain,
  Calendar,
  DollarSign,
  Trophy,
  BookOpen,
  Zap,
  Shield,
  ChevronRight,
  User,
  GraduationCap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function EnhancedCoachingLanding() {
  const [selectedTab, setSelectedTab] = useState<'coach' | 'student'>('coach');

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
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

  const certificationLevels = [
    { level: 'L1', name: 'Foundation Coach', price: 699, color: 'from-green-500 to-emerald-600' },
    { level: 'L2', name: 'Advanced Coach', price: 849, color: 'from-blue-500 to-cyan-600' },
    { level: 'L3', name: 'Expert Coach', price: 1049, color: 'from-purple-500 to-violet-600' },
    { level: 'L4', name: 'Facility Manager', price: 1449, color: 'from-orange-500 to-amber-600' },
    { level: 'L5', name: 'Master Coach', price: 2499, color: 'from-gray-700 to-gray-900' }
  ];

  const coachingFeatures = [
    {
      icon: <Target className="h-8 w-8" />,
      title: 'PCP 4-Dimensional Assessment',
      description: '35 detailed skills across Technical, Tactical, Physical, and Mental dimensions',
      status: 'Complete'
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: 'Real-Time Progress Tracking',
      description: 'Live integration between assessments, goals, and student achievements',
      status: 'Complete'
    },
    {
      icon: <Brain className="h-8 w-8" />,
      title: 'AI-Powered Analytics',
      description: 'Advanced insights, predictions, and personalized coaching recommendations',
      status: 'Complete'
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: 'Student Management',
      description: 'Comprehensive roster with progress history and performance analytics',
      status: 'Complete'
    },
    {
      icon: <Calendar className="h-8 w-8" />,
      title: 'Session Planning',
      description: '39 PCP drills with session templates and curriculum management',
      status: 'Complete'
    },
    {
      icon: <Trophy className="h-8 w-8" />,
      title: 'Goal Creation System',
      description: 'Intelligent goal generation with bulk assignment and milestone tracking',
      status: 'Complete'
    }
  ];

  const revenueStreams = [
    {
      title: 'Coaching Sessions',
      description: 'Earn $60-120/hour through platform bookings',
      icon: <DollarSign className="h-6 w-6" />,
      potential: '$75,000+/year'
    },
    {
      title: 'Group Coaching',
      description: 'Teach multiple students simultaneously',
      icon: <Users className="h-6 w-6" />,
      potential: '$150/hour'
    },
    {
      title: 'Advanced Certifications',
      description: 'Unlock higher-tier coaching opportunities',
      icon: <Award className="h-6 w-6" />,
      potential: '$200+/hour'
    },
    {
      title: 'Facility Management',
      description: 'Level 4+ coaches can manage entire venues',
      icon: <Shield className="h-6 w-6" />,
      potential: '$100,000+/year'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-6">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto">
          <motion.div 
            className="text-center space-y-8"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={fadeIn}>
              <Badge className="mb-4 px-3 py-1.5 text-sm md:text-base bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                🏆 Complete Coaching Ecosystem Now Live
              </Badge>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6 leading-tight">
                Transform Pickleball Through
                <br />
                <span className="text-4xl md:text-5xl lg:text-6xl">Scientific Coaching</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Pickle+ combines PCP methodology with advanced AI analytics to create the world's most comprehensive pickleball coaching platform. Whether you're becoming a certified coach or seeking elite improvement.
              </p>
            </motion.div>

            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              variants={fadeIn}
            >
              <Button size="lg" asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg">
                <Link to="/coach">
                  <GraduationCap className="mr-2 h-5 w-5" />
                  Become a Certified Coach
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg">
                <Link to="/find-coaches">
                  <User className="mr-2 h-5 w-5" />
                  Find Your Coach
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Journey Selection Tabs */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center mb-12">
            <div className="bg-white p-2 rounded-2xl shadow-lg border">
              <button
                onClick={() => setSelectedTab('coach')}
                className={`px-8 py-4 rounded-xl font-semibold transition-all ${
                  selectedTab === 'coach'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Coach Journey
              </button>
              <button
                onClick={() => setSelectedTab('student')}
                className={`px-8 py-4 rounded-xl font-semibold transition-all ${
                  selectedTab === 'student'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Student Journey
              </button>
            </div>
          </div>

          {selectedTab === 'coach' ? (
            <motion.div
              key="coach"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <CoachJourneyContent />
            </motion.div>
          ) : (
            <motion.div
              key="student"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <StudentJourneyContent />
            </motion.div>
          )}
        </div>
      </section>

      {/* Coaching Features Showcase */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <h2 className="text-4xl font-bold mb-6">Complete Coaching Ecosystem</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              All 10 core coaching modules are 100% complete and operational, providing the most comprehensive pickleball coaching experience available.
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {coachingFeatures.map((feature, index) => (
              <motion.div key={index} variants={fadeIn}>
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                        {feature.icon}
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        ✅ {feature.status}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* PCP Certification Levels */}
      <section className="py-20 px-6 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <h2 className="text-4xl font-bold mb-6">PCP Certification Pathway</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Sequential progression from Foundation to Master Coach with comprehensive training and real-world application.
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-5 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {certificationLevels.map((cert, index) => (
              <motion.div key={cert.level} variants={fadeIn}>
                <Card className="h-full hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                  <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${cert.color}`}></div>
                  <CardHeader className="text-center pt-6">
                    <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r ${cert.color} flex items-center justify-center text-white font-bold text-lg mb-3`}>
                      {cert.level}
                    </div>
                    <CardTitle className="text-lg">{cert.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="text-2xl font-bold text-gray-900 mb-2">${cert.price}</div>
                    <p className="text-sm text-gray-600">Sequential progression required</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Revenue Opportunities */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <h2 className="text-4xl font-bold mb-6">Coach Revenue Opportunities</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Multiple income streams with transparent earning potential and professional growth pathways.
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {revenueStreams.map((stream, index) => (
              <motion.div key={index} variants={fadeIn}>
                <Card className="h-full hover:shadow-xl transition-all duration-300 text-center">
                  <CardHeader>
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 text-white w-fit mx-auto">
                      {stream.icon}
                    </div>
                    <CardTitle className="text-lg">{stream.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{stream.description}</p>
                    <div className="text-2xl font-bold text-green-600">{stream.potential}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2 className="text-4xl font-bold mb-6" variants={fadeIn}>
              Ready to Transform Pickleball?
            </motion.h2>
            <motion.p className="text-xl mb-8 opacity-90" variants={fadeIn}>
              Join the revolution in pickleball coaching. Our complete ecosystem is ready for your success.
            </motion.p>
            <motion.div className="flex flex-col sm:flex-row gap-4 justify-center" variants={fadeIn}>
              <Button size="lg" variant="secondary" asChild className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg">
                <Link to="/coach">
                  <Zap className="mr-2 h-5 w-5" />
                  Start Coach Application
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-white text-white hover:bg-white/10 px-8 py-4 text-lg">
                <Link to="/find-coaches">
                  <PlayCircle className="mr-2 h-5 w-5" />
                  Find Your Coach Today
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

// Coach Journey Component
function CoachJourneyContent() {
  const coachSteps = [
    {
      phase: 'Phase 1',
      title: 'Discovery & Application',
      description: 'Learn PCP methodology and submit coach application with background verification',
      icon: <BookOpen className="h-8 w-8" />,
      color: 'from-blue-500 to-cyan-600',
      outcomes: ['Approved coach status', 'PCP Level 1 eligibility', 'Platform access']
    },
    {
      phase: 'Phase 2',
      title: 'Certification & Training',
      description: 'Complete PCP Level 1 certification and master coaching tools',
      icon: <GraduationCap className="h-8 w-8" />,
      color: 'from-green-500 to-emerald-600',
      outcomes: ['Level 1 certification', 'Student management access', 'Assessment tools']
    },
    {
      phase: 'Phase 3',
      title: 'Active Coaching',
      description: 'Build student roster, conduct assessments, and track progress',
      icon: <Users className="h-8 w-8" />,
      color: 'from-purple-500 to-violet-600',
      outcomes: ['Active students', 'Regular income', 'Advanced certifications']
    },
    {
      phase: 'Phase 4',
      title: 'Mastery & Leadership',
      description: 'Achieve Level 4+ certification and facility management opportunities',
      icon: <Trophy className="h-8 w-8" />,
      color: 'from-orange-500 to-amber-600',
      outcomes: ['Master coach status', 'Facility management', 'Mentor opportunities']
    }
  ];

  return (
    <div className="space-y-8">
      <h3 className="text-3xl font-bold text-center mb-12">Your Path to Coaching Excellence</h3>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {coachSteps.map((step, index) => (
          <Card key={index} className="h-full hover:shadow-xl transition-all duration-300 relative overflow-hidden">
            <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${step.color}`}></div>
            <CardHeader className="text-center pt-6">
              <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center text-white mb-4`}>
                {step.icon}
              </div>
              <Badge className="mb-2">{step.phase}</Badge>
              <CardTitle className="text-lg">{step.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{step.description}</p>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Outcomes:</h4>
                {step.outcomes.map((outcome, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-600">{outcome}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="text-center pt-8">
        <Button size="lg" asChild className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4">
          <Link to="/coach">
            Begin Your Coach Journey
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

// Student Journey Component
function StudentJourneyContent() {
  const studentSteps = [
    {
      phase: 'Phase 1',
      title: 'Platform Discovery',
      description: 'Create account, complete skill assessment, and explore coaching options',
      icon: <Target className="h-8 w-8" />,
      color: 'from-green-500 to-emerald-600',
      outcomes: ['Skill assessment', 'Coach recommendations', 'Clear development path']
    },
    {
      phase: 'Phase 2',
      title: 'Coach Connection',
      description: 'Browse certified coaches and establish coaching relationship',
      icon: <Users className="h-8 w-8" />,
      color: 'from-blue-500 to-cyan-600',
      outcomes: ['Matched coach', 'Session scheduling', 'Personal development plan']
    },
    {
      phase: 'Phase 3',
      title: 'Active Development',
      description: 'Regular coaching sessions with PCP assessments and goal tracking',
      icon: <TrendingUp className="h-8 w-8" />,
      color: 'from-purple-500 to-violet-600',
      outcomes: ['Skill improvement', 'Progress tracking', 'Tournament readiness']
    },
    {
      phase: 'Phase 4',
      title: 'Elite Performance',
      description: 'Advanced coaching with Level 3+ coaches and competitive play',
      icon: <Star className="h-8 w-8" />,
      color: 'from-orange-500 to-amber-600',
      outcomes: ['Elite performance', 'Competition success', 'Coaching pathway']
    }
  ];

  return (
    <div className="space-y-8">
      <h3 className="text-3xl font-bold text-center mb-12">Your Path to Pickleball Excellence</h3>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {studentSteps.map((step, index) => (
          <Card key={index} className="h-full hover:shadow-xl transition-all duration-300 relative overflow-hidden">
            <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${step.color}`}></div>
            <CardHeader className="text-center pt-6">
              <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center text-white mb-4`}>
                {step.icon}
              </div>
              <Badge className="mb-2">{step.phase}</Badge>
              <CardTitle className="text-lg">{step.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{step.description}</p>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Outcomes:</h4>
                {step.outcomes.map((outcome, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-600">{outcome}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="text-center pt-8">
        <Button size="lg" asChild className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4">
          <Link to="/find-coaches">
            Find Your Coach
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}