import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ModernPassportDisplay from "@/components/passport/ModernPassportDisplay";
import { Monitor, Smartphone, Building, Eye, Layout, Palette } from "lucide-react";

type ViewMode = 'full' | 'compact' | 'facility';
type ScreenSize = 'desktop' | 'mobile';

export default function PassportDemo() {
  const [viewMode, setViewMode] = useState<ViewMode>('full');
  const [screenSize, setScreenSize] = useState<ScreenSize>('desktop');
  const [interactive, setInteractive] = useState(true);

  const viewOptions = [
    { 
      key: 'full' as ViewMode, 
      label: 'Full Dashboard', 
      icon: Layout,
      description: 'Complete passport with all sections and tabs'
    },
    { 
      key: 'compact' as ViewMode, 
      label: 'Quick View', 
      icon: Eye,
      description: 'Condensed view for mobile or widgets'
    },
    { 
      key: 'facility' as ViewMode, 
      label: 'Facility Mode', 
      icon: Building,
      description: 'Optimized for facility check-in and management'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Modern Passport Design
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Redesigned with fewer clicks, intuitive navigation, and scalable architecture 
            for both player experience and facility management
          </p>
        </div>

        {/* Controls */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Demo Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* View Mode Selection */}
            <div>
              <h4 className="font-semibold mb-3">Passport View Mode</h4>
              <div className="grid md:grid-cols-3 gap-4">
                {viewOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <motion.button
                      key={option.key}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        viewMode === option.key
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setViewMode(option.key)}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Icon className={`w-5 h-5 ${
                          viewMode === option.key ? 'text-orange-500' : 'text-gray-600'
                        }`} />
                        <span className="font-semibold">{option.label}</span>
                        {viewMode === option.key && (
                          <Badge variant="default" className="ml-auto">Active</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{option.description}</p>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Screen Size & Options */}
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Screen Size:</span>
                <Button
                  variant={screenSize === 'desktop' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setScreenSize('desktop')}
                >
                  <Monitor className="w-4 h-4 mr-2" />
                  Desktop
                </Button>
                <Button
                  variant={screenSize === 'mobile' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setScreenSize('mobile')}
                >
                  <Smartphone className="w-4 h-4 mr-2" />
                  Mobile
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-semibold">Interactive:</span>
                <Button
                  variant={interactive ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setInteractive(!interactive)}
                >
                  {interactive ? 'On' : 'Off'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Design Principles */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-bold mb-2">Fewer Clicks</h3>
              <p className="text-sm text-gray-600">
                Quick actions and one-click access to key functions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Layout className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-bold mb-2">Intuitive Design</h3>
              <p className="text-sm text-gray-600">
                Context-aware interface that adapts to user needs
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Building className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-bold mb-2">Scalable Architecture</h3>
              <p className="text-sm text-gray-600">
                Ready for facility management and operations
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Passport Demo Container */}
      <div className={`max-w-6xl mx-auto ${
        screenSize === 'mobile' ? 'max-w-sm' : ''
      }`}>
        <motion.div
          key={`${viewMode}-${screenSize}-${interactive}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`${
            screenSize === 'mobile' 
              ? 'transform scale-90 origin-top' 
              : ''
          }`}
        >
          <ModernPassportDisplay
            view={viewMode}
            interactive={interactive}
          />
        </motion.div>
      </div>

      {/* Feature Highlights */}
      <div className="max-w-6xl mx-auto mt-12">
        <Card>
          <CardHeader>
            <CardTitle>Key UI/UX Improvements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold mb-2 text-blue-600">✓ One-Click Actions</h4>
                <p className="text-sm text-gray-600">
                  Quick action buttons for common tasks like booking, recording matches, and sharing
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2 text-green-600">✓ Progressive Disclosure</h4>
                <p className="text-sm text-gray-600">
                  Information organized in tabs and expandable sections to reduce cognitive load
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2 text-purple-600">✓ Context-Aware Interface</h4>
                <p className="text-sm text-gray-600">
                  Different views and actions based on user role and current context
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2 text-orange-600">✓ Facility Mode</h4>
                <p className="text-sm text-gray-600">
                  Specialized interface for facility check-in and court management
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2 text-red-600">✓ Mobile Optimized</h4>
                <p className="text-sm text-gray-600">
                  Touch-friendly interactions and responsive design for all screen sizes
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2 text-indigo-600">✓ Visual Hierarchy</h4>
                <p className="text-sm text-gray-600">
                  Clear information hierarchy with improved readability and visual flow
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}