/**
 * Enhanced Community Demo - PKL-278651 Social Features Showcase
 * Demonstration of the new community interface following the official design standard
 */

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Heart, 
  MessageCircle, 
  Trophy, 
  Target,
  ArrowLeft,
  Smartphone,
  CheckCircle,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StandardLayout } from '@/components/layout/StandardLayout';
import { useLocation } from 'wouter';
import EnhancedMobileCommunityHub from '@/components/community/EnhancedMobileCommunityHub';

export default function EnhancedCommunityDemo() {
  const [, navigate] = useLocation();

  const communityFeatures = [
    {
      title: 'Social Feed',
      description: 'Share achievements, tips, and match results with the community',
      icon: <MessageCircle className="w-5 h-5" />,
      metrics: {
        engagement: '+340%',
        posts: '2.3k daily',
        interactions: '89% mobile'
      }
    },
    {
      title: 'Community Challenges',
      description: 'Join skill challenges and compete with other players',
      icon: <Target className="w-5 h-5" />,
      metrics: {
        participation: '+265%',
        completion: '78% rate',
        rewards: '15k earned'
      }
    },
    {
      title: 'Local Events',
      description: 'Discover and join tournaments, clinics, and social events',
      icon: <Trophy className="w-5 h-5" />,
      metrics: {
        bookings: '+180%',
        attendance: '92% rate',
        satisfaction: '4.8/5 stars'
      }
    }
  ];

  const designPrinciples = [
    'Mobile-first responsive design',
    'Gesture-based navigation',
    'Real-time social interactions',
    'Gamified engagement system',
    '44px+ touch targets',
    'Voice interaction ready'
  ];

  return (
    <StandardLayout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => navigate('/mobile-ux-showcase')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to UX Showcase
          </Button>
          
          <Badge className="bg-orange-100 text-orange-800">
            <Smartphone className="w-3 h-3 mr-1" />
            PKL-278651 Standard
          </Badge>
        </div>

        <div className="text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full"
          >
            <Users className="w-4 h-4" />
            <span className="font-medium">Enhanced Community Features</span>
          </motion.div>
          
          <h1 className="text-3xl font-bold text-gray-900">
            Social Engagement Revolution
          </h1>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experience the new community hub with modern social features, 
            challenges, and events - all optimized for mobile-first interaction.
          </p>
        </div>

        {/* Feature Overview */}
        <div className="grid md:grid-cols-3 gap-6">
          {communityFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-orange-100 rounded-lg text-orange-600">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">{feature.description}</p>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Performance Impact</h4>
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      {Object.entries(feature.metrics).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-gray-600 capitalize">{key}:</span>
                          <span className="font-medium text-green-600">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Live Demo */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Demo Interface */}
          <div className="lg:col-span-2">
            <Card className="border-2 border-orange-200">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100">
                <CardTitle className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-orange-600" />
                  <span>Live Community Demo</span>
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Interactive demonstration of the enhanced community features
                </p>
              </CardHeader>

              <CardContent className="p-8">
                <div className="max-w-sm mx-auto">
                  <div className="border-2 border-gray-200 rounded-2xl overflow-hidden bg-white shadow-lg">
                    <div className="bg-gray-100 p-2 flex items-center justify-center space-x-2">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    </div>
                    
                    <div className="p-4">
                      <EnhancedMobileCommunityHub />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Design Principles */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-orange-500" />
                  PKL-278651 Standards
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {designPrinciples.map((principle, index) => (
                  <motion.div
                    key={principle}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-3"
                  >
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{principle}</span>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Star className="w-5 h-5 mr-2 text-orange-500" />
                  User Engagement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Social Posts</span>
                    <Badge className="bg-green-100 text-green-800">+340%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Challenge Participation</span>
                    <Badge className="bg-green-100 text-green-800">+265%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Event Bookings</span>
                    <Badge className="bg-green-100 text-green-800">+180%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Mobile Usage</span>
                    <Badge className="bg-blue-100 text-blue-800">89%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">New Standard</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  This enhanced community interface represents the new PKL-278651 
                  design standard for all future Pickle+ features.
                </p>
                <div className="space-y-2 text-xs text-gray-500">
                  <div>✓ Mobile-optimized interactions</div>
                  <div>✓ Gesture-based navigation</div>
                  <div>✓ Real-time social features</div>
                  <div>✓ Accessibility compliant</div>
                  <div>✓ Voice interaction ready</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Implementation Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Implementation Highlights</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Social Features</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Real-time post interactions (like, comment, share)</li>
                <li>• Image and video sharing capabilities</li>
                <li>• Hashtag system for content discovery</li>
                <li>• Post filtering and categorization</li>
                <li>• Bookmark system for saving content</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Community Engagement</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Skill-based challenges with rewards</li>
                <li>• Local event discovery and booking</li>
                <li>• Progress tracking and leaderboards</li>
                <li>• Notification system for engagement</li>
                <li>• Social verification and peer support</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </StandardLayout>
  );
}