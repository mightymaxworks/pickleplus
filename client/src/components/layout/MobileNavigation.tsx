import React from 'react';
import { useLocation } from 'wouter';
import { Pencil, LogOut, Shield } from 'lucide-react';
import { User } from '@shared/schema';
import { motion } from 'framer-motion';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useAuth } from '@/hooks/useAuth';

interface MobileNavigationProps {
  user: User;
}

export function MobileNavigation({ user }: MobileNavigationProps) {
  const [location, navigate] = useLocation();
  const isExtraSmallScreen = useMediaQuery('(max-width: 480px)');
  const { logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 z-50"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', damping: 20, stiffness: 200, delay: 0.5 }}
    >
      {/* Admin button - positioned at the bottom right for admins */}
      {user.isAdmin && (
        <motion.button
          onClick={() => navigate('/admin/golden-ticket')}
          className="absolute -top-14 right-16 w-12 h-12 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-md border border-gray-200 dark:border-gray-700"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Admin Panel"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
        >
          <Shield size={20} className="text-purple-600 dark:text-purple-400" />
        </motion.button>
      )}
      
      {/* Logout button - positioned at the bottom right */}
      <motion.button
        onClick={handleLogout}
        className="absolute -top-14 right-4 w-12 h-12 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-md border border-gray-200 dark:border-gray-700"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title="Logout"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8 }}
      >
        <LogOut size={20} className="text-gray-600 dark:text-gray-300" />
      </motion.button>

      {/* Full-width Record Match Button for all screen sizes */}
      <motion.button
        onClick={() => navigate('/record-match')}
        className="w-full h-16 bg-gradient-to-r from-[#FF5722] to-[#FF9800] text-white font-bold text-lg flex items-center justify-center shadow-lg"
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
      >
        <motion.div
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
          className="relative flex items-center"
        >
          <Pencil className="mr-3 h-6 w-6" />
          RECORD MATCH
          
          {/* Glowing effect */}
          <motion.div
            className="absolute -inset-4 rounded-full bg-white/5"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          
          {/* Particle effects */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-white/30"
                initial={{
                  x: -20,
                  y: Math.random() * 60 - 30,
                  opacity: 0,
                  scale: 0
                }}
                animate={{
                  x: [null, '120%'],
                  opacity: [0, 0.7, 0],
                  scale: [0, 1, 0.5]
                }}
                transition={{
                  duration: 1.5 + Math.random() * 2,
                  repeat: Infinity,
                  delay: i * 0.4
                }}
                style={{
                  width: Math.random() * 6 + 2,
                  height: Math.random() * 6 + 2
                }}
              />
            ))}
          </div>
        </motion.div>
      </motion.button>
      
      {/* Top edge glow effect */}
      <div className="absolute -top-1 left-0 right-0 h-4 bg-gradient-to-t from-[#FF5722]/0 to-[#FF5722]/20 -z-10 blur-md"></div>
    </motion.div>
  );
}