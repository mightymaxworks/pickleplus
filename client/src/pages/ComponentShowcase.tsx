import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ModernPassportDisplay from "@/components/passport/ModernPassportDisplay";
import { 
  Layout,
  Crown,
  Users,
  Trophy,
  Target,
  Calendar,
  BookOpen,
  Award,
  BarChart3,
  Zap,
  QrCode,
  Eye,
  Smartphone,
  Monitor,
  Building,
  Palette,
  Sparkles,
  ArrowRight,
  CheckCircle
} from "lucide-react";

type ComponentDemo = {
  id: string;
  title: string;
  description: string;
  category: 'passport' | 'coaching' | 'community' | 'tournaments' | 'analytics';
  status: 'complete' | 'in-progress' | 'planned';
  component: React.ReactNode;
  features: string[];
};

export default function ComponentShowcase() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'detailed'>('grid');

  const demos: ComponentDemo[] = [
    {
      id: 'modern-passport',
      title: 'Modern Passport Display',
      description: 'Revolutionary passport design with QR code integration, comprehensive rankings, and facility management optimization',
      category: 'passport',
      status: 'complete',
      features: [
        'QR Code Integration (PKL-AC-2024-7719)',
        'Singles, Doubles, Mixed Rankings',
        'Three View Modes (Full, Quick, Facility)',
        'Tournament Performance Tracking',
        'Mobile-First Responsive Design',
        'Progressive Disclosure Interface'
      ],
      component: <ModernPassportDisplay view="full" interactive={true} />
    },
    {
      id: 'compact-passport',
      title: 'Quick View Passport',
      description: 'Condensed passport view perfect for widgets, mobile cards, and quick reference displays',
      category: 'passport',
      status: 'complete',
      features: [
        'Compact Design',
        'Essential Information Only',
        'QR Code Preview',
        'Touch-Friendly',
        'Widget Ready'
      ],
      component: <ModernPassportDisplay view="compact" interactive={false} />
    },
    {
      id: 'facility-passport',
      title: 'Facility Mode Passport',
      description: 'Specialized interface optimized for facility check-in, court management, and operations',
      category: 'passport',
      status: 'complete',
      features: [
        'Facility Access Verification',
        'QR Code Prominence',
        'Quick Check-in Actions',
        'Membership Level Display',
        'Court Booking Integration'
      ],
      component: <ModernPassportDisplay view="facility" interactive={true} />
    },
    {
      id: 'coaching-ecosystem',
      title: 'PCP Coaching Ecosystem',
      description: 'Comprehensive coaching platform with certification, student management, and progress tracking',
      category: 'coaching',
      status: 'complete',
      features: [
        'PCP Certification (L1-L5)',
        'Student Progress Tracking',
        'Session Planning Tools',
        'Assessment Integration',
        'Advanced Analytics Dashboard'
      ],
      component: (
        <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg border border-green-200">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-green-800">PCP Coaching Hub</h3>
            <p className="text-green-700">Complete coaching ecosystem with certification tracking</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <Badge variant="outline" className="text-green-700">L1-L5 Certification</Badge>
              <Badge variant="outline" className="text-green-700">Student Tracking</Badge>
              <Badge variant="outline" className="text-green-700">Session Planning</Badge>
              <Badge variant="outline" className="text-green-700">Analytics Dashboard</Badge>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'community-system',
      title: 'Community Management',
      description: 'Modern community discovery, creation, and engagement platform with PKL-278651 design',
      category: 'community',
      status: 'complete',
      features: [
        'Community Discovery',
        'Event Management',
        'Member Engagement',
        'Advanced Search',
        'Responsive Design'
      ],
      component: (
        <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-100 rounded-lg border border-blue-200">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-blue-800">Community Hub</h3>
            <p className="text-blue-700">Connect players and manage communities</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <Badge variant="outline" className="text-blue-700">Discovery</Badge>
              <Badge variant="outline" className="text-blue-700">Events</Badge>
              <Badge variant="outline" className="text-blue-700">Engagement</Badge>
              <Badge variant="outline" className="text-blue-700">Search</Badge>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'tournament-system',
      title: 'Tournament Management',
      description: 'Enhanced tournament system with bracket management, real-time updates, and comprehensive analytics',
      category: 'tournaments',
      status: 'complete',
      features: [
        'Bracket Management',
        'Real-time Updates',
        'Player Registration',
        'Results Tracking',
        'Performance Analytics'
      ],
      component: (
        <div className="p-6 bg-gradient-to-br from-yellow-50 to-orange-100 rounded-lg border border-yellow-200">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-yellow-800">Tournament System</h3>
            <p className="text-yellow-700">Complete tournament management platform</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <Badge variant="outline" className="text-yellow-700">Brackets</Badge>
              <Badge variant="outline" className="text-yellow-700">Live Updates</Badge>
              <Badge variant="outline" className="text-yellow-700">Registration</Badge>
              <Badge variant="outline" className="text-yellow-700">Analytics</Badge>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'analytics-dashboard',
      title: 'Advanced Analytics',
      description: 'Comprehensive analytics platform with performance insights, trend analysis, and predictive features',
      category: 'analytics',
      status: 'complete',
      features: [
        'Performance Insights',
        'Trend Analysis',
        'Predictive Analytics',
        'Coach Dashboard',
        'Player Progress Tracking'
      ],
      component: (
        <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-100 rounded-lg border border-purple-200">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-purple-800">Analytics Platform</h3>
            <p className="text-purple-700">Deep insights and performance analytics</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <Badge variant="outline" className="text-purple-700">Performance</Badge>
              <Badge variant="outline" className="text-purple-700">Trends</Badge>
              <Badge variant="outline" className="text-purple-700">Predictions</Badge>
              <Badge variant="outline" className="text-purple-700">Progress</Badge>
            </div>
          </div>
        </div>
      )
    }
  ];

  const categories = [
    { id: 'all', label: 'All Components', icon: Layout },
    { id: 'passport', label: 'Passport System', icon: QrCode },
    { id: 'coaching', label: 'Coaching Platform', icon: BookOpen },
    { id: 'community', label: 'Community Hub', icon: Users },
    { id: 'tournaments', label: 'Tournaments', icon: Trophy },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ];

  const filteredDemos = selectedCategory === 'all' 
    ? demos 
    : demos.filter(demo => demo.category === selectedCategory);

  const getStatusColor = (status: ComponentDemo['status']) => {
    switch (status) {
      case 'complete': return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'planned': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: ComponentDemo['status']) => {
    switch (status) {
      case 'complete': return <CheckCircle className="w-4 h-4" />;
      case 'in-progress': return <Zap className="w-4 h-4" />;
      case 'planned': return <Calendar className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Pickle+ Component Showcase
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive demonstration of all platform components with modern UI/UX design, 
            fewer clicks philosophy, and scalable architecture
          </p>
        </div>

        {/* Statistics */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{demos.filter(d => d.status === 'complete').length}</div>
              <div className="text-sm text-gray-600">Complete Components</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{demos.length}</div>
              <div className="text-sm text-gray-600">Total Components</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">5</div>
              <div className="text-sm text-gray-600">Platform Areas</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">3</div>
              <div className="text-sm text-gray-600">View Modes</div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Showcase Controls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 items-center justify-between">
              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "outline"}
                      onClick={() => setSelectedCategory(category.id)}
                      className="flex items-center gap-2"
                    >
                      <Icon className="w-4 h-4" />
                      {category.label}
                    </Button>
                  );
                })}
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">View:</span>
                <Button
                  variant={viewMode === 'grid' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Layout className="w-4 h-4 mr-2" />
                  Grid
                </Button>
                <Button
                  variant={viewMode === 'detailed' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode('detailed')}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Detailed
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Component Showcase */}
      <div className="max-w-7xl mx-auto">
        {viewMode === 'grid' ? (
          <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredDemos.map((demo, index) => (
              <motion.div
                key={demo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{demo.title}</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">{demo.description}</p>
                      </div>
                      <Badge className={`ml-2 flex items-center gap-1 ${getStatusColor(demo.status)}`}>
                        {getStatusIcon(demo.status)}
                        {demo.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      {demo.component}
                    </div>
                    
                    {/* Demo Links */}
                    {demo.id === 'coaching-ecosystem' && (
                      <div className="mb-4">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => window.open('/coaching-ecosystem-demo', '_blank')}
                          className="w-full"
                        >
                          <ArrowRight className="w-4 h-4 mr-2" />
                          View Full Demo
                        </Button>
                      </div>
                    )}
                    
                    {demo.id === 'community-system' && (
                      <div className="mb-4">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => window.open('/community-system-demo', '_blank')}
                          className="w-full"
                        >
                          <ArrowRight className="w-4 h-4 mr-2" />
                          View Full Demo
                        </Button>
                      </div>
                    )}
                    
                    {(demo.id === 'modern-passport' || demo.id === 'compact-passport' || demo.id === 'facility-passport') && (
                      <div className="mb-4">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => window.open('/passport-demo', '_blank')}
                          className="w-full"
                        >
                          <ArrowRight className="w-4 h-4 mr-2" />
                          View Full Demo
                        </Button>
                      </div>
                    )}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Key Features:</h4>
                      <div className="flex flex-wrap gap-1">
                        {demo.features.slice(0, 3).map((feature, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                        {demo.features.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{demo.features.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {filteredDemos.map((demo, index) => (
              <motion.div
                key={demo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl">{demo.title}</CardTitle>
                        <p className="text-gray-600 mt-2">{demo.description}</p>
                      </div>
                      <Badge className={`ml-4 flex items-center gap-2 ${getStatusColor(demo.status)}`}>
                        {getStatusIcon(demo.status)}
                        {demo.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid lg:grid-cols-2 gap-8">
                      <div>
                        <h4 className="font-semibold mb-4">Component Preview:</h4>
                        {demo.component}
                      </div>
                      <div>
                        <h4 className="font-semibold mb-4">Features & Capabilities:</h4>
                        <ul className="space-y-2">
                          {demo.features.map((feature, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Key Design Principles */}
      <div className="max-w-7xl mx-auto mt-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Design Principles & Architecture
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-bold mb-2">Fewer Clicks</h3>
                <p className="text-sm text-gray-600">
                  One-click actions and streamlined workflows reduce user friction
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-bold mb-2">Intuitive Design</h3>
                <p className="text-sm text-gray-600">
                  Context-aware interfaces that adapt to user needs and roles
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Building className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-bold mb-2">Scalable Architecture</h3>
                <p className="text-sm text-gray-600">
                  Built for facility management and enterprise-level operations
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}