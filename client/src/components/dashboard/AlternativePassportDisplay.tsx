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

      {/* Quick Actions */}
      <motion.div
        className="grid md:grid-cols-2 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
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