/**
 * PKL-278651-COMM-0001
 * Community Marketing Page
 * 
 * This page showcases upcoming community features planned for release in mid-to-late May.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, MessageCircle, Award, Star, Map, Video, Globe, Heart, Zap } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function CommunityPage() {
  const { toast } = useToast();

  const handleFeatureInterest = (featureName: string) => {
    toast({
      title: "Thanks for your interest!",
      description: `We've recorded your interest in ${featureName}. You'll be notified when it launches.`,
      duration: 3000,
    });
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  // Upcoming features data
  const upcomingFeatures = [
    {
      title: "Local Court Finder",
      description: "Find pickleball courts near you, complete with ratings, amenities, and real-time availability.",
      icon: <Map className="h-8 w-8 text-emerald-500" />,
      timeline: "Mid May",
      color: "emerald",
    },
    {
      title: "Community Groups",
      description: "Join skill-based groups in your area to find playing partners and organize casual games.",
      icon: <Users className="h-8 w-8 text-blue-500" />,
      timeline: "Mid May",
      color: "blue",
    },
    {
      title: "Direct Messaging",
      description: "Connect directly with other players to coordinate matches and share tips.",
      icon: <MessageCircle className="h-8 w-8 text-indigo-500" />,
      timeline: "Late May",
      color: "indigo", 
    },
    {
      title: "Training Videos",
      description: "Access exclusive training content from professional players and certified coaches.",
      icon: <Video className="h-8 w-8 text-purple-500" />,
      timeline: "Late May",
      color: "purple",
    },
    {
      title: "Player Mentorship",
      description: "Connect with experienced players willing to mentor newcomers and help improve your game.",
      icon: <Star className="h-8 w-8 text-amber-500" />,
      timeline: "Late May",
      color: "amber",
    },
    {
      title: "Global Challenges",
      description: "Participate in worldwide skill challenges and see how you stack up against the global community.",
      icon: <Globe className="h-8 w-8 text-cyan-500" />,
      timeline: "End of May",
      color: "cyan",
    },
  ];

  return (
    <DashboardLayout>
      {/* Hero section */}
      <motion.div 
        className="mb-12 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h1 
          className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-[#FF5722] to-[#FF9800] text-transparent bg-clip-text"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Coming Soon: Expanded Community Features
        </motion.h1>
        <motion.p 
          className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          We're excited to announce a suite of new community features launching this May
          to help you connect with other players, improve your skills, and get more enjoyment out of pickleball.
        </motion.p>
      </motion.div>

      {/* Feature timeline */}
      <div className="mb-12">
        <div className="relative mx-auto w-full max-w-6xl">
          <div className="absolute left-1/2 h-full w-px bg-gradient-to-b from-[#FF5722]/20 via-[#FF9800]/20 to-transparent -translate-x-1/2"></div>
          
          <motion.div 
            className="relative z-10 mb-8 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <span className="inline-block px-4 py-2 rounded-full bg-[#FF5722] text-white font-medium">
              May 2025 Feature Roadmap
            </span>
          </motion.div>
        </div>
      </div>

      {/* Feature cards */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {upcomingFeatures.map((feature, index) => (
          <motion.div key={index} variants={itemVariants}>
            <Card className="h-full border-t-4" style={{ borderTopColor: `var(--${feature.color}-500)` }}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                    {feature.icon}
                  </div>
                  <Badge variant="outline" className={`bg-${feature.color}-50 text-${feature.color}-700 border-${feature.color}-200`}>
                    {feature.timeline}
                  </Badge>
                </div>
                <CardTitle className="mt-4">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleFeatureInterest(feature.title)}
                >
                  <Heart className="mr-2 h-4 w-4" /> 
                  <span>I'm interested</span>
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Newsletter signup */}
      <motion.div 
        className="bg-gradient-to-r from-[#FF5722]/10 to-[#FF9800]/10 p-8 rounded-2xl mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold mb-2">Stay Updated</h3>
            <p className="text-gray-600 dark:text-gray-300">
              We'll notify you when these exciting new features launch.
            </p>
          </div>
          
          <Button 
            className="bg-[#FF5722] hover:bg-[#E64A19] px-6"
            onClick={() => {
              toast({
                title: "You're all set!",
                description: "You'll receive notifications when our new features launch.",
                duration: 3000,
              });
            }}
          >
            <Zap className="mr-2 h-4 w-4" />
            <span>Notify Me</span>
          </Button>
        </div>
      </motion.div>
      
      {/* Community feedback */}
      <motion.div 
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
      >
        <h3 className="text-xl font-bold mb-3">Your Input Matters</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
          Have ideas for other community features you'd like to see? We value your feedback as we continue to build the ultimate pickleball platform.
        </p>
        <Button 
          variant="outline" 
          className="border-[#FF5722] text-[#FF5722] hover:bg-[#FF5722]/10"
          onClick={() => {
            toast({
              title: "Feedback Form Coming Soon",
              description: "Our community feedback form will be available next week. Thank you for your patience!",
              duration: 3000,
            });
          }}
        >
          Share Your Ideas
        </Button>
      </motion.div>
    </DashboardLayout>
  );
}