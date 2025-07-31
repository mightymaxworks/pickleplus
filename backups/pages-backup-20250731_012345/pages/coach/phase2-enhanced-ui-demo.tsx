/**
 * Sprint 3 Phase 2: Enhanced UI/UX Demo Page
 * Comprehensive demonstration of assessment analysis dashboard and intelligent goal creation
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Sparkles, 
  Target, 
  BarChart3, 
  ArrowRight, 
  CheckCircle2,
  Brain,
  Activity,
  TrendingUp,
  Eye,
  ExternalLink
} from 'lucide-react';

export default function Phase2EnhancedUIDemo() {
  const [activeDemo, setActiveDemo] = useState<'dashboard' | 'goals' | null>(null);

  const features = [
    {
      id: 'dashboard',
      title: 'Assessment Analysis Dashboard',
      description: 'Visual assessment data with trend charts and weakness identification',
      icon: <BarChart3 className="h-8 w-8 text-blue-600" />,
      url: '/coach/assessment-analysis-dashboard',
      highlights: [
        '4-dimensional PCP rating visualization with progress bars',
        'Assessment trend analysis with improvement tracking',
        'Weak areas identification with severity indicators',
        'Personalized improvement recommendations',
        'PKL-278651 glassmorphism design with responsive layout'
      ],
      status: 'complete'
    },
    {
      id: 'goals',
      title: 'Intelligent Goal Creation',
      description: 'AI-powered goal generation with customizable milestones',
      icon: <Sparkles className="h-8 w-8 text-purple-600" />,
      url: '/coach/intelligent-goal-creation',
      highlights: [
        'AI-generated goal recommendations from assessment analysis',
        'Customizable goal creation with milestone management',
        'Priority-based goal categorization and timeline setting',
        'Interactive goal selection and bulk creation workflow',
        'Real-time goal summary and category distribution'
      ],
      status: 'complete'
    }
  ];

  const integrationFlow = [
    {
      step: 1,
      title: 'Assessment Analysis',
      description: 'Comprehensive review of student performance data',
      component: 'Assessment Analysis Dashboard',
      actions: ['View 4D ratings', 'Analyze trends', 'Identify weak areas']
    },
    {
      step: 2,
      title: 'AI Goal Generation',
      description: 'Intelligent recommendations based on assessment insights',
      component: 'Intelligent Goal Creation',
      actions: ['Generate smart goals', 'Customize milestones', 'Set priorities']
    },
    {
      step: 3,
      title: 'Goal Implementation',
      description: 'Seamless transition to active coaching workflow',
      component: 'Goal Management System',
      actions: ['Create selected goals', 'Track progress', 'Update milestones']
    }
  ];

  const handlePreviewComponent = (url: string) => {
    window.open(url, '_blank');
  };

  const handleLiveDemo = (featureId: string) => {
    const feature = features.find(f => f.id === featureId);
    if (feature) {
      window.location.href = feature.url;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Sprint 3 Phase 2: Enhanced UI/UX
                  </CardTitle>
                  <CardDescription className="text-lg mt-2">
                    Assessment Analysis Dashboard + Intelligent Goal Creation System
                  </CardDescription>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800 border-green-200 text-sm px-3 py-1">
                PHASE 2 COMPLETE
              </Badge>
            </div>
          </CardHeader>
        </Card>

        <Tabs defaultValue="overview" className="space-y-6">
          <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-lg">
            <CardContent className="pt-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Component Overview</TabsTrigger>
                <TabsTrigger value="integration">Integration Flow</TabsTrigger>
                <TabsTrigger value="testing">Live Testing</TabsTrigger>
              </TabsList>
            </CardContent>
          </Card>

          {/* Component Overview */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {features.map((feature) => (
                <Card key={feature.id} className="backdrop-blur-sm bg-white/90 border-0 shadow-lg hover:shadow-xl transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {feature.icon}
                        <div>
                          <CardTitle className="text-xl">{feature.title}</CardTitle>
                          <CardDescription className="mt-1">
                            {feature.description}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        {feature.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900">Key Features:</h4>
                      <ul className="space-y-1">
                        {feature.highlights.map((highlight, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            {highlight}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button 
                        onClick={() => handlePreviewComponent(feature.url)}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </Button>
                      <Button 
                        onClick={() => handleLiveDemo(feature.id)}
                        size="sm"
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Live Demo
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Integration Flow */}
          <TabsContent value="integration" className="space-y-6">
            <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-6 w-6 text-blue-600" />
                  Complete Assessment-to-Goal Workflow
                </CardTitle>
                <CardDescription>
                  Seamless integration between assessment analysis and intelligent goal creation
                </CardDescription>
              </CardHeader>
            </Card>

            <div className="space-y-6">
              {integrationFlow.map((flow, index) => (
                <div key={flow.step} className="relative">
                  <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-6">
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg flex-shrink-0">
                          {flow.step}
                        </div>
                        <div className="flex-1 space-y-3">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900">{flow.title}</h3>
                            <p className="text-gray-600 mt-1">{flow.description}</p>
                          </div>
                          
                          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <div className="flex items-center gap-2 mb-2">
                              <Activity className="h-4 w-4 text-blue-600" />
                              <span className="font-medium text-blue-900">{flow.component}</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {flow.actions.map((action, actionIndex) => (
                                <Badge key={actionIndex} variant="outline" className="text-xs">
                                  {action}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {index < integrationFlow.length - 1 && (
                    <div className="flex justify-center py-4">
                      <ArrowRight className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Live Testing */}
          <TabsContent value="testing" className="space-y-6">
            <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                  Interactive Testing Environment
                </CardTitle>
                <CardDescription>
                  Test both components with live data and interactive features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Assessment Dashboard Test */}
                  <Card className="border-2 border-blue-200 bg-blue-50/50">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-blue-600" />
                        <CardTitle className="text-lg">Assessment Analysis</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-gray-600">
                        Test comprehensive assessment visualization with trend analysis and weak area identification
                      </p>
                      <div className="space-y-2">
                        <div className="text-xs text-gray-500">Features to Test:</div>
                        <ul className="text-xs space-y-1">
                          <li>• 4D PCP rating cards with progress bars</li>
                          <li>• Assessment trend analysis across dimensions</li>
                          <li>• Weak areas with severity indicators</li>
                          <li>• Personalized improvement recommendations</li>
                        </ul>
                      </div>
                      <Button 
                        onClick={() => handleLiveDemo('dashboard')}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Test Dashboard
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Goal Creation Test */}
                  <Card className="border-2 border-purple-200 bg-purple-50/50">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-purple-600" />
                        <CardTitle className="text-lg">Intelligent Goals</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-gray-600">
                        Test AI-powered goal generation and customizable milestone creation workflow
                      </p>
                      <div className="space-y-2">
                        <div className="text-xs text-gray-500">Features to Test:</div>
                        <ul className="text-xs space-y-1">
                          <li>• AI goal recommendations from assessment</li>
                          <li>• Custom goal creation with milestones</li>
                          <li>• Interactive goal selection interface</li>
                          <li>• Goal summary and batch creation</li>
                        </ul>
                      </div>
                      <Button 
                        onClick={() => handleLiveDemo('goals')}
                        className="w-full bg-purple-600 hover:bg-purple-700"
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Test Goal Creation
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Complete Workflow Test */}
                <Card className="border-2 border-green-200 bg-green-50/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-green-600" />
                      Complete Integration Workflow
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-600">
                      Test the complete assessment-to-goal workflow: analyze assessment data → generate intelligent goals → create and manage goals
                    </p>
                    <div className="flex gap-3">
                      <Button 
                        onClick={() => handleLiveDemo('dashboard')}
                        variant="outline"
                        className="flex-1"
                      >
                        1. Start with Assessment
                      </Button>
                      <ArrowRight className="h-5 w-5 text-gray-400 mt-2" />
                      <Button 
                        onClick={() => handleLiveDemo('goals')}
                        variant="outline"
                        className="flex-1"
                      >
                        2. Create Goals
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Phase 2 Summary */}
        <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Sprint 3 Phase 2 Complete ✓
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <BarChart3 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="font-semibold text-blue-900">Assessment Dashboard</div>
                <div className="text-sm text-blue-700">Complete visual analysis</div>
              </div>
              <div className="bg-purple-50 p-6 rounded-lg">
                <Sparkles className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="font-semibold text-purple-900">Intelligent Goals</div>
                <div className="text-sm text-purple-700">AI-powered creation</div>
              </div>
              <div className="bg-green-50 p-6 rounded-lg">
                <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="font-semibold text-green-900">Full Integration</div>
                <div className="text-sm text-green-700">Seamless workflow</div>
              </div>
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Both enhanced UI components are now fully operational with PKL-278651 glassmorphism design, 
              comprehensive data integration, and mobile-responsive interfaces. The assessment-to-goal workflow 
              provides coaches with powerful tools for student development planning.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}