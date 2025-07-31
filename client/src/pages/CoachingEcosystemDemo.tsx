import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen,
  Users,
  Target,
  BarChart3,
  Calendar,
  Award,
  TrendingUp,
  Clock,
  CheckCircle,
  Lock,
  Play,
  User,
  GraduationCap,
  Star,
  Trophy
} from "lucide-react";

export default function CoachingEcosystemDemo() {
  const [selectedCertification, setSelectedCertification] = useState('L1');

  const certificationLevels = [
    {
      level: 'L1',
      title: 'Clear Communication',
      status: 'completed',
      description: 'Foundation of effective coaching communication',
      progress: 100,
      modules: 8,
      completedModules: 8,
      color: 'bg-green-500'
    },
    {
      level: 'L2', 
      title: 'Stroke Development',
      status: 'in-progress',
      description: 'Technical skill development and correction',
      progress: 65,
      modules: 12,
      completedModules: 8,
      color: 'bg-blue-500'
    },
    {
      level: 'L3',
      title: 'Strategy & Tactics',
      status: 'locked',
      description: 'Game strategy and tactical development',
      progress: 0,
      modules: 10,
      completedModules: 0,
      color: 'bg-gray-400'
    },
    {
      level: 'L4',
      title: 'Mental Performance',
      status: 'locked',
      description: 'Psychological aspects of performance',
      progress: 0,
      modules: 8,
      completedModules: 0,
      color: 'bg-gray-400'
    },
    {
      level: 'L5',
      title: 'Elite Coaching',
      status: 'locked',
      description: 'Advanced coaching methodologies',
      progress: 0,
      modules: 15,
      completedModules: 0,
      color: 'bg-gray-400'
    }
  ];

  const studentProgress = [
    {
      name: 'Sarah Chen',
      level: '3.5 DUPR',
      sessions: 24,
      improvement: '+0.7',
      nextGoal: 'Improve backhand consistency',
      progress: 78,
      status: 'active'
    },
    {
      name: 'Mike Rodriguez',
      level: '4.2 DUPR',
      sessions: 18,
      improvement: '+0.4',
      nextGoal: 'Master third shot drop',
      progress: 62,
      status: 'active'
    },
    {
      name: 'Jenny Park',
      level: '2.8 DUPR',
      sessions: 32,
      improvement: '+1.2',
      nextGoal: 'Tournament preparation',
      progress: 85,
      status: 'active'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            PCP Coaching Ecosystem
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive coaching platform with certification tracking, student management, 
            and advanced analytics for professional pickleball development
          </p>
        </div>

        {/* Coach Status Overview */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">L2</div>
              <div className="text-sm text-gray-600">Current Level</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">16</div>
              <div className="text-sm text-gray-600">Modules Complete</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">12</div>
              <div className="text-sm text-gray-600">Active Students</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">4.8</div>
              <div className="text-sm text-gray-600">Coach Rating</div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <Tabs defaultValue="certification" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 h-auto">
            <TabsTrigger value="certification" className="text-xs sm:text-sm px-2 py-3 sm:px-4">
              <span className="hidden sm:inline">PCP Certification</span>
              <span className="sm:hidden">Cert</span>
            </TabsTrigger>
            <TabsTrigger value="assessment" className="text-xs sm:text-sm px-2 py-3 sm:px-4">
              <span className="hidden sm:inline">Assessment Tool</span>
              <span className="sm:hidden">Test</span>
            </TabsTrigger>
            <TabsTrigger value="students" className="text-xs sm:text-sm px-2 py-3 sm:px-4">
              <span className="hidden sm:inline">Student Management</span>
              <span className="sm:hidden">Students</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs sm:text-sm px-2 py-3 sm:px-4">
              <span className="hidden sm:inline">Analytics Dashboard</span>
              <span className="sm:hidden">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="sessions" className="text-xs sm:text-sm px-2 py-3 sm:px-4">
              <span className="hidden sm:inline">Session Planning</span>
              <span className="sm:hidden">Sessions</span>
            </TabsTrigger>
          </TabsList>

          {/* PCP Certification Tab */}
          <TabsContent value="certification" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  Professional Certification Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Certification Levels */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Certification Pathway</h3>
                    {certificationLevels.map((cert, index) => (
                      <motion.div
                        key={cert.level}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                          selectedCertification === cert.level 
                            ? 'border-blue-300 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedCertification(cert.level)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${cert.color}`}>
                              {cert.level}
                            </div>
                            <div>
                              <h4 className="font-semibold">{cert.title}</h4>
                              <p className="text-sm text-gray-600">{cert.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            {cert.status === 'completed' && <CheckCircle className="w-5 h-5 text-green-500" />}
                            {cert.status === 'in-progress' && <Play className="w-5 h-5 text-blue-500" />}
                            {cert.status === 'locked' && <Lock className="w-5 h-5 text-gray-400" />}
                          </div>
                        </div>
                        <div className="mt-3">
                          <div className="flex justify-between text-sm mb-2">
                            <span>{cert.completedModules}/{cert.modules} modules</span>
                            <span>{cert.progress}%</span>
                          </div>
                          <Progress value={cert.progress} className="h-2" />
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Selected Certification Details */}
                  <div>
                    <h3 className="font-semibold text-lg mb-4">Level Details</h3>
                    <Card>
                      <CardContent className="p-6">
                        {selectedCertification === 'L1' && (
                          <div className="space-y-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                                L1
                              </div>
                              <h4 className="text-xl font-bold">Clear Communication</h4>
                              <Badge className="bg-green-100 text-green-800">Completed</Badge>
                            </div>
                            <p className="text-gray-600">
                              Master the fundamentals of effective coaching communication, 
                              including instruction delivery, feedback techniques, and student motivation.
                            </p>
                            <div className="grid grid-cols-2 gap-4 mt-4">
                              <div className="p-3 bg-gray-50 rounded-lg">
                                <div className="text-lg font-bold text-green-600">100%</div>
                                <div className="text-sm text-gray-600">Progress</div>
                              </div>
                              <div className="p-3 bg-gray-50 rounded-lg">
                                <div className="text-lg font-bold text-blue-600">8/8</div>
                                <div className="text-sm text-gray-600">Modules</div>
                              </div>
                            </div>
                          </div>
                        )}
                        {selectedCertification === 'L2' && (
                          <div className="space-y-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                                L2
                              </div>
                              <h4 className="text-xl font-bold">Stroke Development</h4>
                              <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
                            </div>
                            <p className="text-gray-600">
                              Advanced technical instruction covering all strokes, biomechanics, 
                              and progressive skill development methodologies.
                            </p>
                            <div className="grid grid-cols-2 gap-4 mt-4">
                              <div className="p-3 bg-gray-50 rounded-lg">
                                <div className="text-lg font-bold text-blue-600">65%</div>
                                <div className="text-sm text-gray-600">Progress</div>
                              </div>
                              <div className="p-3 bg-gray-50 rounded-lg">
                                <div className="text-lg font-bold text-blue-600">8/12</div>
                                <div className="text-sm text-gray-600">Modules</div>
                              </div>
                            </div>
                            <Button className="w-full">Continue Learning</Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Assessment Tool Tab */}
          <TabsContent value="assessment" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      PCP 4-Dimensional Assessment System
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Technical Skills Assessment */}
                      <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                              <Target className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h4 className="font-bold text-blue-800">Technical Skills</h4>
                              <p className="text-sm text-blue-600">Stroke mechanics and fundamentals</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-blue-700">7.2/10</div>
                            <div className="text-sm text-blue-600">Current Rating</div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Forehand Drive</span>
                              <span className="font-medium">8.0/10</span>
                            </div>
                            <Progress value={80} className="h-2" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Backhand Drive</span>
                              <span className="font-medium">6.5/10</span>
                            </div>
                            <Progress value={65} className="h-2" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Serve (Power)</span>
                              <span className="font-medium">7.0/10</span>
                            </div>
                            <Progress value={70} className="h-2" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Serve (Placement)</span>
                              <span className="font-medium">7.5/10</span>
                            </div>
                            <Progress value={75} className="h-2" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Return of Serve</span>
                              <span className="font-medium">6.8/10</span>
                            </div>
                            <Progress value={68} className="h-2" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Third Shot Drop</span>
                              <span className="font-medium">6.0/10</span>
                            </div>
                            <Progress value={60} className="h-2" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Third Shot Drive</span>
                              <span className="font-medium">7.2/10</span>
                            </div>
                            <Progress value={72} className="h-2" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Dinking</span>
                              <span className="font-medium">7.8/10</span>
                            </div>
                            <Progress value={78} className="h-2" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Volleying</span>
                              <span className="font-medium">7.5/10</span>
                            </div>
                            <Progress value={75} className="h-2" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Overhead Smash</span>
                              <span className="font-medium">6.9/10</span>
                            </div>
                            <Progress value={69} className="h-2" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Lob Defense</span>
                              <span className="font-medium">6.3/10</span>
                            </div>
                            <Progress value={63} className="h-2" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Drop Shot</span>
                              <span className="font-medium">7.1/10</span>
                            </div>
                            <Progress value={71} className="h-2" />
                          </div>
                        </div>
                        
                        <div className="bg-white p-3 rounded-lg">
                          <p className="text-sm font-medium text-blue-800 mb-1">Key Focus Areas:</p>
                          <p className="text-sm text-gray-700">Improve backhand drive consistency, master third shot drop technique, enhance lob defense positioning</p>
                        </div>
                      </div>

                      {/* Tactical Skills Assessment */}
                      <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                              <BarChart3 className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h4 className="font-bold text-green-800">Tactical Awareness</h4>
                              <p className="text-sm text-green-600">Game strategy and court positioning</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-700">6.8/10</div>
                            <div className="text-sm text-green-600">Current Rating</div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Court Positioning</span>
                              <span className="font-medium">7.5/10</span>
                            </div>
                            <Progress value={75} className="h-2" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Shot Selection</span>
                              <span className="font-medium">6.0/10</span>
                            </div>
                            <Progress value={60} className="h-2" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Doubles Strategy</span>
                              <span className="font-medium">7.0/10</span>
                            </div>
                            <Progress value={70} className="h-2" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Singles Strategy</span>
                              <span className="font-medium">6.8/10</span>
                            </div>
                            <Progress value={68} className="h-2" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Pattern Recognition</span>
                              <span className="font-medium">6.5/10</span>
                            </div>
                            <Progress value={65} className="h-2" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Transition Game</span>
                              <span className="font-medium">6.7/10</span>
                            </div>
                            <Progress value={67} className="h-2" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Kitchen Play</span>
                              <span className="font-medium">7.3/10</span>
                            </div>
                            <Progress value={73} className="h-2" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Baseline Strategy</span>
                              <span className="font-medium">6.4/10</span>
                            </div>
                            <Progress value={64} className="h-2" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Communication</span>
                              <span className="font-medium">7.8/10</span>
                            </div>
                            <Progress value={78} className="h-2" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Game Adaptation</span>
                              <span className="font-medium">6.6/10</span>
                            </div>
                            <Progress value={66} className="h-2" />
                          </div>
                        </div>
                        
                        <div className="bg-white p-3 rounded-lg">
                          <p className="text-sm font-medium text-green-800 mb-1">Improvement Areas:</p>
                          <p className="text-sm text-gray-700">Enhance shot selection under pressure, improve baseline strategy, develop better game adaptation skills</p>
                        </div>
                      </div>

                      {/* Physical Assessment */}
                      <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                              <TrendingUp className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h4 className="font-bold text-purple-800">Physical Conditioning</h4>
                              <p className="text-sm text-purple-600">Fitness and movement quality</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-purple-700">6.9/10</div>
                            <div className="text-sm text-purple-600">Current Rating</div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Footwork & Movement</span>
                              <span className="font-medium">7.0/10</span>
                            </div>
                            <Progress value={70} className="h-2" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Cardiovascular Endurance</span>
                              <span className="font-medium">6.5/10</span>
                            </div>
                            <Progress value={65} className="h-2" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Agility & Quickness</span>
                              <span className="font-medium">7.5/10</span>
                            </div>
                            <Progress value={75} className="h-2" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Balance & Stability</span>
                              <span className="font-medium">7.2/10</span>
                            </div>
                            <Progress value={72} className="h-2" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Core Strength</span>
                              <span className="font-medium">6.8/10</span>
                            </div>
                            <Progress value={68} className="h-2" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Flexibility</span>
                              <span className="font-medium">6.9/10</span>
                            </div>
                            <Progress value={69} className="h-2" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Recovery Time</span>
                              <span className="font-medium">6.5/10</span>
                            </div>
                            <Progress value={65} className="h-2" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Injury Prevention</span>
                              <span className="font-medium">7.3/10</span>
                            </div>
                            <Progress value={73} className="h-2" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Power & Explosiveness</span>
                              <span className="font-medium">6.7/10</span>
                            </div>
                            <Progress value={67} className="h-2" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Court Coverage</span>
                              <span className="font-medium">7.1/10</span>
                            </div>
                            <Progress value={71} className="h-2" />
                          </div>
                        </div>
                        
                        <div className="bg-white p-3 rounded-lg">
                          <p className="text-sm font-medium text-purple-800 mb-1">Training Focus:</p>
                          <p className="text-sm text-gray-700">Build cardiovascular endurance, improve recovery protocols, strengthen core stability, enhance power development</p>
                        </div>
                      </div>

                      {/* Mental Assessment */}
                      <div className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                              <Trophy className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h4 className="font-bold text-orange-800">Mental Performance</h4>
                              <p className="text-sm text-orange-600">Focus and competitive mindset</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-orange-700">7.3/10</div>
                            <div className="text-sm text-orange-600">Current Rating</div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Focus & Concentration</span>
                              <span className="font-medium">7.5/10</span>
                            </div>
                            <Progress value={75} className="h-2" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Pressure Management</span>
                              <span className="font-medium">6.5/10</span>
                            </div>
                            <Progress value={65} className="h-2" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Confidence Level</span>
                              <span className="font-medium">8.0/10</span>
                            </div>
                            <Progress value={80} className="h-2" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Adaptability</span>
                              <span className="font-medium">7.0/10</span>
                            </div>
                            <Progress value={70} className="h-2" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Emotional Control</span>
                              <span className="font-medium">6.8/10</span>
                            </div>
                            <Progress value={68} className="h-2" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Competitive Spirit</span>
                              <span className="font-medium">7.9/10</span>
                            </div>
                            <Progress value={79} className="h-2" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Mental Resilience</span>
                              <span className="font-medium">7.1/10</span>
                            </div>
                            <Progress value={71} className="h-2" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Game Intelligence</span>
                              <span className="font-medium">7.4/10</span>
                            </div>
                            <Progress value={74} className="h-2" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Visualization Skills</span>
                              <span className="font-medium">6.6/10</span>
                            </div>
                            <Progress value={66} className="h-2" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Pre-Point Routine</span>
                              <span className="font-medium">6.3/10</span>
                            </div>
                            <Progress value={63} className="h-2" />
                          </div>
                        </div>
                        
                        <div className="bg-white p-3 rounded-lg">
                          <p className="text-sm font-medium text-orange-800 mb-1">Development Areas:</p>
                          <p className="text-sm text-gray-700">Enhance pressure performance, develop consistent pre-point routines, improve visualization techniques, strengthen emotional control</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Assessment Tools Sidebar */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Assessment Tools
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button className="w-full">New Assessment</Button>
                    <Button className="w-full" variant="outline">Video Analysis</Button>
                    <Button className="w-full" variant="outline">Progress Report</Button>
                    <Button className="w-full" variant="outline">Compare Results</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Overall Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center space-y-4">
                      <div className="text-4xl font-bold text-blue-600">7.1/10</div>
                      <div className="text-sm text-gray-600">Comprehensive Rating</div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            Technical
                          </span>
                          <span className="font-medium">7.2</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            Tactical
                          </span>
                          <span className="font-medium">6.8</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                            Physical
                          </span>
                          <span className="font-medium">6.9</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                            Mental
                          </span>
                          <span className="font-medium">7.3</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Recent Assessments
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-sm">Sarah Chen</span>
                        <span className="text-xs text-gray-500">2 days ago</span>
                      </div>
                      <div className="text-sm text-gray-600">Overall: 6.8/10</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-sm">Mike Rodriguez</span>
                        <span className="text-xs text-gray-500">1 week ago</span>
                      </div>
                      <div className="text-sm text-gray-600">Overall: 7.4/10</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-sm">Jenny Park</span>
                        <span className="text-xs text-gray-500">2 weeks ago</span>
                      </div>
                      <div className="text-sm text-gray-600">Overall: 5.9/10</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Student Management Tab */}
          <TabsContent value="students" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Active Students
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {studentProgress.map((student, index) => (
                        <motion.div
                          key={student.name}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <h4 className="font-semibold">{student.name}</h4>
                                <p className="text-sm text-gray-600">{student.level}</p>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-green-700 border-green-300">
                              {student.improvement} improvement
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div className="text-center p-2 bg-gray-50 rounded">
                              <div className="font-bold text-blue-600">{student.sessions}</div>
                              <div className="text-xs text-gray-600">Sessions</div>
                            </div>
                            <div className="text-center p-2 bg-gray-50 rounded">
                              <div className="font-bold text-purple-600">{student.progress}%</div>
                              <div className="text-xs text-gray-600">Goal Progress</div>
                            </div>
                          </div>
                          
                          <div className="mb-3">
                            <p className="text-sm font-medium mb-1">Current Goal:</p>
                            <p className="text-sm text-gray-600">{student.nextGoal}</p>
                          </div>
                          
                          <Progress value={student.progress} className="h-2" />
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Quick Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">+0.8</div>
                      <div className="text-sm text-gray-600">Avg DUPR Improvement</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">96%</div>
                      <div className="text-sm text-gray-600">Goal Completion Rate</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">4.8/5</div>
                      <div className="text-sm text-gray-600">Student Satisfaction</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Analytics Dashboard Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span>Student Retention Rate</span>
                      <span className="font-bold text-green-600">94%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span>Average Session Rating</span>
                      <span className="font-bold text-blue-600">4.7/5</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span>Monthly Revenue</span>
                      <span className="font-bold text-purple-600">$3,240</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span>Referral Rate</span>
                      <span className="font-bold text-orange-600">28%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Recent Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                      <Award className="w-5 h-5 text-yellow-600" />
                      <div>
                        <p className="font-semibold text-sm">L2 Certification Milestone</p>
                        <p className="text-xs text-gray-600">65% completion achieved</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <Star className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-semibold text-sm">Student Tournament Win</p>
                        <p className="text-xs text-gray-600">Sarah Chen won local 3.5 tournament</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-semibold text-sm">Perfect Month</p>
                        <p className="text-xs text-gray-600">100% goal completion in June</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Session Planning Tab */}
          <TabsContent value="sessions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Upcoming Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className="font-semibold">Today 2:00 PM</span>
                    </div>
                    <h4 className="font-semibold">Sarah Chen</h4>
                    <p className="text-sm text-gray-600">Backhand consistency drills</p>
                    <div className="mt-2">
                      <Badge variant="outline" className="text-xs">Individual</Badge>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-green-600" />
                      <span className="font-semibold">Today 4:00 PM</span>
                    </div>
                    <h4 className="font-semibold">Group Session</h4>
                    <p className="text-sm text-gray-600">3.5 level strategy class</p>
                    <div className="mt-2">
                      <Badge variant="outline" className="text-xs">Group (4)</Badge>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-purple-600" />
                      <span className="font-semibold">Tomorrow 10:00 AM</span>
                    </div>
                    <h4 className="font-semibold">Mike Rodriguez</h4>
                    <p className="text-sm text-gray-600">Third shot development</p>
                    <div className="mt-2">
                      <Badge variant="outline" className="text-xs">Individual</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}