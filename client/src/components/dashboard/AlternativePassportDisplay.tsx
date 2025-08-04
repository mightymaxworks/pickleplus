import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QrCode, Trophy, TrendingUp, Calendar, Target, Award } from "lucide-react";

export function AlternativePassportDisplay() {
  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header Card */}
      <motion.div 
        className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 mb-4 border-2 border-orange-200 shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-orange-200 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-orange-800">AJ</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-orange-900">Alex Jordan</h2>
              <p className="text-orange-700">@mockuser • DEMO123X</p>
              <Badge className="bg-orange-600 text-white mt-1">Level 3 Player</Badge>
            </div>
          </div>
          <div className="text-center">
            <QrCode className="w-20 h-20 text-orange-600 mx-auto mb-2" />
            <p className="text-sm text-orange-700 font-medium">Scan to Connect</p>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-4 mb-4">
        <motion.div
          className="bg-white rounded-lg p-4 border border-orange-100 shadow-sm"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-orange-600" />
            <div>
              <p className="text-sm text-gray-600">DUPR Rating</p>
              <p className="text-2xl font-bold text-orange-900">3.8</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white rounded-lg p-4 border border-orange-100 shadow-sm"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Pickle Points</p>
              <p className="text-2xl font-bold text-green-700">875</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white rounded-lg p-4 border border-orange-100 shadow-sm"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="flex items-center gap-3">
            <Award className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">Achievements</p>
              <p className="text-2xl font-bold text-purple-700">12</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Comprehensive Ranking Stats */}
      <motion.div
        className="mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-orange-600" />
              Rankings Across All Categories
            </h3>
            
            {/* Singles Rankings */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="font-semibold text-gray-800 mb-3 text-center">Singles Rankings</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-orange-50 rounded-lg">
                    <span className="text-sm font-medium">Open Division</span>
                    <Badge className="bg-orange-600 text-white">#12</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">35+ Division</span>
                    <Badge variant="outline">#8</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">50+ Division</span>
                    <Badge variant="outline">N/A</Badge>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-800 mb-3 text-center">Doubles Rankings</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium">Open Division</span>
                    <Badge className="bg-blue-600 text-white">#7</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">35+ Division</span>
                    <Badge variant="outline">#5</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">50+ Division</span>
                    <Badge variant="outline">N/A</Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Gender-Specific Rankings */}
            <div className="border-t pt-4">
              <h4 className="font-semibold text-gray-800 mb-3 text-center">Gender-Specific Rankings (Male)</h4>
              <div className="grid md:grid-cols-4 gap-3">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-xs text-gray-600">Singles Open</p>
                  <p className="font-bold text-green-700">#6</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-xs text-gray-600">Singles 35+</p>
                  <p className="font-bold text-green-700">#4</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <p className="text-xs text-gray-600">Doubles Open</p>
                  <p className="font-bold text-purple-700">#3</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <p className="text-xs text-gray-600">Doubles 35+</p>
                  <p className="font-bold text-purple-700">#2</p>
                </div>
              </div>
            </div>

            {/* Performance Summary */}
            <div className="border-t pt-4 mt-4">
              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <p className="text-xs text-gray-600">Highest Ranking</p>
                  <p className="font-bold text-yellow-700">#2 (M-Doubles-35+)</p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <p className="text-xs text-gray-600">Total Categories</p>
                  <p className="font-bold text-red-700">6 Active</p>
                </div>
                <div className="p-3 bg-indigo-50 rounded-lg">
                  <p className="text-xs text-gray-600">Rank Trend</p>
                  <p className="font-bold text-indigo-700">↗ +3 Overall</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        className="grid md:grid-cols-2 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-6 h-6 text-blue-600" />
            <span className="font-semibold text-blue-900">Recent Activity</span>
          </div>
          <p className="text-sm text-blue-800">Completed match vs. Sarah M.</p>
          <p className="text-xs text-blue-600">2 hours ago</p>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-6 h-6 text-green-600" />
            <span className="font-semibold text-green-900">Current Goal</span>
          </div>
          <p className="text-sm text-green-800">Improve backhand consistency</p>
          <p className="text-xs text-green-600">Progress: 68%</p>
        </div>
      </motion.div>
    </div>
  );
}