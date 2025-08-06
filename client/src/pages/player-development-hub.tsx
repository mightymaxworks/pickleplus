import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Target, Calendar, TrendingUp, Award, Users } from "lucide-react";
import { motion } from "framer-motion";

export default function PlayerDevelopmentHubPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 mt-[56px] mb-[56px]">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <motion.div 
          className="text-center space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full mb-6">
              <Target className="h-10 w-10 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Player Development Hub
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Coming Soon in Phase 2! A comprehensive training center with structured skill programs, 
            personalized coaching paths, and performance analytics.
          </p>
        </motion.div>

        {/* Coming Soon Features */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm border-blue-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-blue-700">
                <BookOpen className="h-6 w-6" />
                Structured Training Programs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Access curated training programs designed by PCP certified coaches, 
                with progressive skill building and milestone tracking.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-blue-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-blue-700">
                <Calendar className="h-6 w-6" />
                Class Booking System
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Book training center classes, workshops, and clinics directly 
                through the platform with automated scheduling.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-blue-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-blue-700">
                <TrendingUp className="h-6 w-6" />
                Skill Progress Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Track your skill development with detailed analytics, 
                performance metrics, and personalized improvement recommendations.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-blue-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-blue-700">
                <Award className="h-6 w-6" />
                PCP Certification Path
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Follow structured pathways to PCP certifications with 
                guided assessments and expert feedback.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-blue-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-blue-700">
                <Users className="h-6 w-6" />
                Group Training Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Join skill-matched group training sessions and clinics 
                for collaborative learning and practice.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-blue-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-blue-700">
                <Target className="h-6 w-6" />
                Personalized Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Set and track personalized skill goals with coach guidance 
                and achievement milestones.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Current V1.0 Action */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Start Your Journey Today
              </h3>
              <p className="text-gray-600 mb-6">
                While we build the full training hub, you can start recording matches 
                and tracking your progress with our ranking system!
              </p>
              <div className="flex gap-4 justify-center">
                <Button 
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                  onClick={() => window.location.href = '/record-match'}
                >
                  Record a Match
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.location.href = '/leaderboard'}
                >
                  View Rankings
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}