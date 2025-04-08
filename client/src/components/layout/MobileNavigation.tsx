import React from 'react';
import { useLocation } from 'wouter';
import { Home, Calendar, Award, Users, PenTool, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { User } from '@shared/schema';
import { motion, AnimatePresence } from 'framer-motion';

interface MobileNavigationProps {
  user: User;
}

export function MobileNavigation({ user }: MobileNavigationProps) {
  const [location, navigate] = useLocation();
  const [recordExpanded, setRecordExpanded] = React.useState(false);

  const isActive = (path: string) => location === path;

  return (
    <>
      {/* Semi-transparent overlay when record menu is expanded */}
      <AnimatePresence>
        {recordExpanded && (
          <motion.div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setRecordExpanded(false)}
          />
        )}
      </AnimatePresence>
      
      {/* Main navigation bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        {/* Expanded Record Match Options */}
        <AnimatePresence>
          {recordExpanded && (
            <motion.div 
              className="bg-white dark:bg-gray-900 rounded-t-2xl border-t border-x border-gray-200 dark:border-gray-800 overflow-hidden shadow-lg"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            >
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <div className="font-semibold text-gray-900 dark:text-gray-100">Record Match</div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 rounded-full"
                  onClick={() => setRecordExpanded(false)}
                >
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                </Button>
              </div>
              
              <div className="p-4 grid grid-cols-1 gap-3">
                {[
                  { label: 'Quick Match', description: 'Record a casual match result' },
                  { label: 'League Match', description: 'Record a match in your league' },
                  { label: 'Tournament Match', description: 'Record an official tournament match' },
                  { label: 'Practice Session', description: 'Track your practice metrics' }
                ].map((option, i) => (
                  <motion.button
                    key={option.label}
                    className="bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-left flex flex-col shadow-sm hover:shadow-md transition-shadow"
                    onClick={() => {
                      navigate('/record-match');
                      setRecordExpanded(false);
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="font-medium text-gray-900 dark:text-gray-100 mb-1">{option.label}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{option.description}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Navigation Bar with Glass Effect */}
        <div className="backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-t border-gray-200 dark:border-gray-800 shadow-lg">
          {/* Top row with navigation items */}
          <div className="flex items-center justify-around px-2 h-16">
            <NavItem 
              icon={<Home size={20} />} 
              label="Home" 
              active={isActive('/dashboard')} 
              onClick={() => navigate('/dashboard')} 
            />
            <NavItem 
              icon={<Calendar size={20} />} 
              label="Matches" 
              active={isActive('/matches')} 
              onClick={() => navigate('/matches')} 
            />
            <NavItem 
              icon={<PenTool size={20} />} 
              label="Record" 
              active={recordExpanded}
              pulse={true}
              onClick={() => setRecordExpanded(!recordExpanded)} 
              className="relative z-10 -mb-6 transform -translate-y-5"
            />
            <NavItem 
              icon={<Award size={20} />} 
              label="Tournaments" 
              active={isActive('/tournaments')} 
              onClick={() => navigate('/tournaments')} 
            />
            <NavItem 
              icon={<Users size={20} />} 
              label="Community" 
              active={isActive('/community')} 
              onClick={() => navigate('/community')} 
            />
          </div>
        </div>
        
        {/* Floating Action Button for Record Match */}
        <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-8 z-20">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <button
              onClick={() => setRecordExpanded(!recordExpanded)}
              className={`h-16 w-16 rounded-full flex items-center justify-center shadow-lg ${
                recordExpanded 
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 rotate-45' 
                  : 'bg-gradient-to-r from-[#FF5722] to-[#FF9800]'
              } text-white transition-all duration-300`}
            >
              <PenTool size={24} />
              
              {/* Pulsing effect */}
              <div className="absolute inset-0 rounded-full bg-white opacity-20 animate-ping-slow"></div>
            </button>
          </motion.div>
        </div>
      </div>
      
      {/* Add custom animation keyframes */}
      <style jsx>{`
        @keyframes ping-slow {
          0% {
            transform: scale(1);
            opacity: 0.2;
          }
          50% {
            opacity: 0;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
        
        .animate-ping-slow {
          animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </>
  );
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  pulse?: boolean;
  className?: string;
}

function NavItem({ icon, label, active, onClick, pulse = false, className = '' }: NavItemProps) {
  return (
    <motion.button
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-1 ${className}`}
      whileTap={{ scale: 0.9 }}
    >
      <motion.div 
        className={`relative flex items-center justify-center mb-1 p-2 rounded-full transition-colors duration-300 ${
          active 
            ? 'bg-gradient-to-r from-[#FF5722]/10 to-[#FF9800]/10 text-[#FF5722]' 
            : 'text-gray-500 dark:text-gray-400'
        }`}
        animate={pulse && !active ? { scale: [1, 1.1, 1] } : {}}
        transition={pulse ? { duration: 2, repeat: Infinity } : {}}
      >
        {icon}
        
        {active && (
          <motion.div
            layoutId="nav-indicator"
            className="absolute -bottom-1 w-1 h-1 rounded-full bg-[#FF5722]"
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          />
        )}
      </motion.div>
      
      <span className={`text-xs font-medium transition-colors duration-300 ${
        active ? 'text-[#FF5722]' : 'text-gray-500 dark:text-gray-400'
      }`}>
        {label}
      </span>
    </motion.button>
  );
}