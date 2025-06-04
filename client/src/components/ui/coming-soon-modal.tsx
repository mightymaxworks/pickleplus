/**
 * Coming Soon Modal Component
 * Shows an engaging animation for upcoming features
 */

import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Rocket, Star, Trophy } from "lucide-react";

interface ComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: string;
  description?: string;
}

export function ComingSoonModal({ isOpen, onClose, feature, description }: ComingSoonModalProps) {
  const floatingIcons = [
    { icon: Sparkles, delay: 0, color: "text-yellow-500" },
    { icon: Rocket, delay: 0.2, color: "text-blue-500" },
    { icon: Star, delay: 0.4, color: "text-purple-500" },
    { icon: Trophy, delay: 0.6, color: "text-orange-500" }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold bg-gradient-to-r from-orange-500 to-purple-600 bg-clip-text text-transparent">
            Coming Soon!
          </DialogTitle>
        </DialogHeader>
        
        <div className="text-center space-y-6 py-6">
          {/* Floating Icons Animation */}
          <div className="relative h-20 overflow-hidden">
            <AnimatePresence>
              {floatingIcons.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ y: 50, opacity: 0, rotate: 0 }}
                    animate={{ 
                      y: [50, -10, 50], 
                      opacity: [0, 1, 0], 
                      rotate: [0, 360, 720],
                      x: [0, Math.random() * 100 - 50, 0]
                    }}
                    transition={{
                      duration: 3,
                      delay: item.delay,
                      repeat: Infinity,
                      repeatDelay: 1
                    }}
                    className={`absolute left-1/2 transform -translate-x-1/2 ${item.color}`}
                  >
                    <Icon className="w-8 h-8" />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Feature Title */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="space-y-2"
          >
            <h3 className="text-xl font-semibold text-gray-900">
              {feature}
            </h3>
            {description && (
              <p className="text-gray-600 text-sm">
                {description}
              </p>
            )}
          </motion.div>

          {/* Animated Message */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="bg-gradient-to-r from-orange-50 to-purple-50 rounded-lg p-4 border border-orange-200"
          >
            <p className="text-gray-700 font-medium">
              We're cooking up something amazing! 🔥
            </p>
            <p className="text-sm text-gray-600 mt-1">
              This feature is in development and will be available soon.
            </p>
          </motion.div>

          {/* Pulse Effect Background */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-orange-400/10 to-purple-400/10 rounded-lg"
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        <div className="flex justify-center">
          <Button 
            onClick={onClose}
            className="bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white"
          >
            Got it!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}