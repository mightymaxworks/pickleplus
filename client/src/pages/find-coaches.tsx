import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, UserCheck, Calendar, TrendingUp, Star, MapPin } from "lucide-react";
import { motion } from "framer-motion";

export default function FindCoachesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4 mt-[56px] mb-[56px]">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <motion.div 
          className="text-center space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-full mb-6">
              <Search className="h-10 w-10 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Advanced Coach Discovery
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Coming Soon in Phase 2! Find verified PCP coaches with advanced matching, 
            instant booking, and detailed profiles.
          </p>
        </motion.div>

        {/* Coming Soon Features */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm border-orange-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-orange-700">
                <UserCheck className="h-6 w-6" />
                Verified Coach Profiles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Browse detailed profiles of PCP certified coaches with ratings, 
                specialties, and verified credentials.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-orange-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-orange-700">
                <Calendar className="h-6 w-6" />
                Instant Booking System
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Book coaching sessions directly through the platform with 
                real-time availability and payment processing.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-orange-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-orange-700">
                <Search className="h-6 w-6" />
                Smart Coach Matching
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                AI-powered matching based on your skill level, goals, 
                location, and coaching preferences.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-orange-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-orange-700">
                <TrendingUp className="h-6 w-6" />
                Progress Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Track your coaching progress, session history, and 
                skill development over time.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-orange-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-orange-700">
                <Star className="h-6 w-6" />
                Reviews & Ratings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Read authentic reviews and ratings from other players 
                to choose the perfect coach.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-orange-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-orange-700">
                <MapPin className="h-6 w-6" />
                Location-Based Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Find coaches near you or book remote sessions with 
                advanced location filtering.
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
          <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Ready to Get Certified?
              </h3>
              <p className="text-gray-600 mb-6">
                In the meantime, you can apply to become a PCP certified coach yourself!
              </p>
              <Button 
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                onClick={() => window.location.href = '/coach-application'}
              >
                Apply for PCP Certification
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}