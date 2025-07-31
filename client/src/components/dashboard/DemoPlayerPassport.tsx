/**
 * Demo Player Passport Component for Landing Page
 * 
 * Shows a sample passport card exactly as it appears in PassportDashboard.tsx
 * but with demo data for non-authenticated users on the landing page.
 * Matches the ACTUAL passport design from the dashboard.
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Trophy, QrCode, Scan, Medal, Edit } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export function DemoPlayerPassport() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="relative z-10"
    >
      <Card 
        className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm"
      >
        <CardContent className="p-3 md:p-4 lg:p-6">
          <div className="flex flex-col lg:flex-row items-center gap-4 lg:gap-8">
            {/* Player Information */}
            <div className="flex-1 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-4 mb-4">
                {/* Profile Photo */}
                <motion.div 
                  className="relative cursor-pointer group"
                  whileHover={{ scale: 1.08, rotate: 2 }}
                  whileTap={{ scale: 0.92 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <div className="w-28 h-32 bg-gradient-to-br from-orange-500 via-red-500 to-orange-600 rounded-lg flex items-center justify-center text-white font-bold text-2xl shadow-xl hover:shadow-2xl transition-all duration-500 passport-photo border-4 border-orange-400">
                    AJ
                  </div>
                  
                  <motion.div 
                    className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-3 border-white shadow-lg"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  ></motion.div>
                </motion.div>
                
                <div>
                  <motion.h1 
                    className="text-3xl lg:text-4xl font-extrabold text-orange-900 tracking-[-0.02em] leading-[1.1] font-mono"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    style={{ fontFamily: '"SF Pro Display", "Inter", "Segoe UI", system-ui, sans-serif' }}
                  >
                    Alex Jordan
                  </motion.h1>
                  <motion.p 
                    className="text-orange-700 text-lg font-medium tracking-wide uppercase opacity-80"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    style={{ fontFamily: '"JetBrains Mono", "Fira Code", monospace' }}
                  >
                    @alexjordan
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6, type: "spring" }}
                  >
                    <Badge className="mt-2 bg-gradient-to-r from-orange-100 to-orange-200 text-orange-900 border-orange-300 px-3 py-1 text-sm font-bold shadow-md">
                      <Medal className="w-4 h-4 mr-2" />
                      Player Passport
                    </Badge>
                  </motion.div>
                </div>
              </div>

              {/* Edit Profile Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex justify-center lg:justify-start mt-4"
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="text-orange-600 border-orange-300 hover:bg-orange-50"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </motion.div>

              {/* Key Stats Grid - Responsive layout */}
              <motion.div 
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 mt-4 lg:mt-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                <motion.div 
                  className="text-center lg:text-left bg-white/50 rounded-lg p-3 md:p-4 shadow-sm hover:shadow-md transition-all"
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.8)" }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <p className="text-xs text-orange-600 font-bold uppercase tracking-wider">DUPR Rating</p>
                  <p className="text-3xl font-black text-orange-900">3.8</p>
                </motion.div>
                <motion.div 
                  className="text-center lg:text-left bg-white/50 rounded-lg p-3 shadow-sm hover:shadow-md transition-all"
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.8)" }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <p className="text-xs text-purple-600 font-bold uppercase tracking-wider">Ranking Points</p>
                  <p className="text-3xl font-black text-purple-700">150</p>
                </motion.div>
                <motion.div 
                  className="text-center lg:text-left bg-white/50 rounded-lg p-3 shadow-sm hover:shadow-md transition-all"
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.8)" }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <p className="text-xs text-green-600 font-bold uppercase tracking-wider">Win Rate</p>
                  <p className="text-3xl font-black text-green-700">68%</p>
                </motion.div>
                <motion.div 
                  className="text-center lg:text-left bg-white/50 rounded-lg p-3 shadow-sm hover:shadow-md transition-all"
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.8)" }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">Matches</p>
                  <p className="text-3xl font-black text-blue-700">12</p>
                </motion.div>
                <motion.div 
                  className="text-center lg:text-left bg-white/50 rounded-lg p-3 shadow-sm hover:shadow-md transition-all"
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.8)" }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider">Streak</p>
                  <p className="text-3xl font-black text-indigo-700">3</p>
                </motion.div>
                <motion.div 
                  className="text-center lg:text-left bg-gradient-to-r from-orange-100 to-yellow-100 border-2 border-orange-300 rounded-lg p-3 shadow-md hover:shadow-lg transition-all cursor-pointer"
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(255,165,0,0.2)" }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <p className="text-xs text-orange-700 font-bold uppercase tracking-wider">Passport Code</p>
                  <p className="text-2xl font-mono font-black text-orange-800">
                    DEMO123X
                  </p>
                  <p className="text-xs text-orange-600 mt-1">Tap to Copy</p>
                </motion.div>
              </motion.div>
            </div>
            
            {/* Prominent QR Code Section - Responsive */}
            <div className="flex flex-col items-center lg:ml-6">
              <motion.div 
                className="w-32 h-32 md:w-40 md:h-40 lg:w-44 lg:h-44 bg-white border-4 border-orange-300 rounded-xl flex items-center justify-center mb-3 shadow-xl cursor-pointer hover:shadow-2xl transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <QrCode className="w-24 h-24 md:w-32 md:h-32 lg:w-36 lg:h-36 text-orange-600" />
              </motion.div>
              <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-300 px-3 py-1">
                <Scan className="w-3 h-3 mr-1" />
                Tap to Reveal
              </Badge>
              <p className="text-xs text-orange-600 mt-1 text-center max-w-32">
                Share your passport
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}