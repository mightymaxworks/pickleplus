import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  UserPlus, 
  Search, 
  Calendar, 
  PlayCircle, 
  TrendingUp,
  ArrowRight,
  Star,
  Target,
  Trophy,
  Users
} from "lucide-react";

const journeySteps = [
  {
    id: 1,
    title: "Create Profile",
    description: "Set your skill level and goals",
    icon: UserPlus,
    details: "DUPR integration, skill assessment, goal setting",
    color: "from-blue-500 to-cyan-500"
  },
  {
    id: 2,
    title: "Discover Coaches",
    description: "Find certified PCP coaches",
    icon: Search,
    details: "Filter by speciality, rating, price, location",
    color: "from-purple-500 to-pink-500"
  },
  {
    id: 3,
    title: "Book Sessions",
    description: "Schedule training with ease",
    icon: Calendar,
    details: "Flexible scheduling, instant booking, payment processing",
    color: "from-green-500 to-emerald-500"
  },
  {
    id: 4,
    title: "Train & Learn",
    description: "Personalized coaching sessions",
    icon: PlayCircle,
    details: "PCP methodology, video analysis, drill recommendations",
    color: "from-orange-500 to-red-500"
  },
  {
    id: 5,
    title: "Track Progress",
    description: "Monitor your improvement",
    icon: TrendingUp,
    details: "Performance analytics, goal tracking, achievement system",
    color: "from-indigo-500 to-blue-500"
  }
];

export function StudentJourneyFlow() {
  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">Your Pickleball Growth Journey</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          From beginner to advanced player - we guide you every step of the way
        </p>
      </div>

      {/* Journey Flow */}
      <div className="space-y-8">
        {journeySteps.map((step, index) => {
          const Icon = step.icon;
          const isEven = index % 2 === 0;
          
          return (
            <motion.div
              key={step.id}
              className={`flex items-center gap-8 ${isEven ? 'flex-row' : 'flex-row-reverse'}`}
              initial={{ opacity: 0, x: isEven ? -50 : 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              {/* Content Card */}
              <div className="flex-1">
                <Card className="border-2 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${step.color} flex items-center justify-center shadow-lg`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge variant="outline" className="text-xs">Step {step.id}</Badge>
                          <h3 className="text-xl font-bold">{step.title}</h3>
                        </div>
                        <p className="text-gray-600 mb-3">{step.description}</p>
                        <p className="text-sm text-gray-500">{step.details}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Arrow Connector */}
              <div className="flex-shrink-0">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center shadow-lg`}>
                  <span className="text-2xl font-bold text-white">{step.id}</span>
                </div>
              </div>

              {/* Visual Representation */}
              <div className="flex-1">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                  {step.id === 1 && (
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                        <UserPlus className="w-8 h-8 text-blue-600" />
                      </div>
                      <p className="font-semibold">Welcome to Pickle+!</p>
                      <p className="text-sm text-gray-600">Set your DUPR: 3.2</p>
                    </div>
                  )}

                  {step.id === 2 && (
                    <div>
                      <p className="font-semibold mb-3">Available Coaches:</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Coach Sarah M.</span>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span>4.9</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Coach Mike R.</span>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span>4.8</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {step.id === 3 && (
                    <div>
                      <div className="bg-white rounded-lg p-3 border">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="w-4 h-4 text-green-600" />
                          <span className="font-semibold text-sm">Next Session</span>
                        </div>
                        <p className="text-sm">Tomorrow 2:00 PM</p>
                        <p className="text-xs text-gray-600">Court 3, Tennis Club</p>
                      </div>
                    </div>
                  )}

                  {step.id === 4 && (
                    <div className="text-center">
                      <PlayCircle className="w-12 h-12 text-orange-600 mx-auto mb-2" />
                      <p className="font-semibold text-sm">Active Session</p>
                      <p className="text-xs text-gray-600">Backhand drills in progress</p>
                    </div>
                  )}

                  {step.id === 5 && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-sm">Progress</span>
                        <Trophy className="w-4 h-4 text-yellow-600" />
                      </div>
                      <div className="bg-green-200 rounded-full h-2 mb-1">
                        <div className="bg-green-600 h-2 rounded-full w-3/4"></div>
                      </div>
                      <p className="text-xs text-gray-600">DUPR improved from 3.2 → 3.8</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* CTA Section */}
      <motion.div 
        className="mt-12 text-center bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-8 text-white"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.2 }}
      >
        <h3 className="text-2xl font-bold mb-4">Ready to Start Your Journey?</h3>
        <p className="text-lg mb-6 opacity-90">
          Join thousands of players improving their game with certified PCP coaches
        </p>
        <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100">
          Start Your Journey <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </motion.div>
    </div>
  );
}