import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { StrategyMessage } from './MomentumEngine';

interface MessageToastProps {
  messages: StrategyMessage[];
  onMessageExpire: (messageId: string) => void;
  team1Color: string;
  team2Color: string;
}

export const MessageToast = ({ messages, onMessageExpire, team1Color, team2Color }: MessageToastProps) => {
  const [visibleMessages, setVisibleMessages] = useState<StrategyMessage[]>([]);

  useEffect(() => {
    // Sort by priority (0 = highest) and show max 3 messages
    const sortedMessages = [...messages]
      .sort((a, b) => a.priority - b.priority)
      .slice(0, 3);
    
    setVisibleMessages(sortedMessages);

    // Set timers to remove messages
    sortedMessages.forEach(message => {
      const timer = setTimeout(() => {
        onMessageExpire(message.id);
      }, message.duration);

      return () => clearTimeout(timer);
    });
  }, [messages, onMessageExpire]);

  const getMessageStyle = (message: StrategyMessage) => {
    const baseStyle = {
      background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))',
      border: '1px solid rgba(148, 163, 184, 0.2)',
      backdropFilter: 'blur(8px)'
    };

    if (message.team) {
      const teamColor = message.team === 'team1' ? team1Color : team2Color;
      return {
        ...baseStyle,
        borderColor: teamColor,
        boxShadow: `0 0 20px ${teamColor}40, 0 4px 12px rgba(0, 0, 0, 0.3)`
      };
    }

    return baseStyle;
  };

  const getMessageIcon = (type: StrategyMessage['type']) => {
    const icons = {
      firstBlood: '🩸',
      streak: '🔥',
      momentumShift: '⚡',
      clutchSave: '💪',
      comeback: '🚀',
      gamePoint: '🎯',
      matchPoint: '🏆',
      break: '💥',
      deuce: '⚔️'
    };
    return icons[type] || '⭐';
  };

  const getPriorityAnimation = (priority: number) => {
    switch (priority) {
      case 0: // Highest priority - dramatic entrance
        return {
          initial: { scale: 0.5, opacity: 0, y: -50, rotate: -10 },
          animate: { scale: 1, opacity: 1, y: 0, rotate: 0 },
          exit: { scale: 0.8, opacity: 0, y: -20, transition: { duration: 0.2 } },
          transition: { type: "spring", stiffness: 400, damping: 25 }
        };
      case 1: // High priority - strong bounce
        return {
          initial: { scale: 0.8, opacity: 0, x: -30 },
          animate: { scale: 1, opacity: 1, x: 0 },
          exit: { scale: 0.9, opacity: 0, x: 30, transition: { duration: 0.3 } },
          transition: { type: "spring", stiffness: 300, damping: 20 }
        };
      case 2: // Medium priority - slide in
        return {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -10, transition: { duration: 0.25 } },
          transition: { duration: 0.4, ease: "easeOut" }
        };
      default: // Low priority - fade
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0, transition: { duration: 0.2 } },
          transition: { duration: 0.3 }
        };
    }
  };

  if (visibleMessages.length === 0) return null;

  return (
    <div className="fixed top-32 left-1/2 transform -translate-x-1/2 z-50 space-y-2 max-w-sm w-full px-4">
      <AnimatePresence mode="popLayout">
        {visibleMessages.map((message, index) => {
          const animation = getPriorityAnimation(message.priority);
          const style = getMessageStyle(message);
          const icon = getMessageIcon(message.type);

          return (
            <motion.div
              key={message.id}
              style={style}
              className="rounded-lg p-4 text-center relative overflow-hidden"
              {...animation}
              layout
            >
              {/* Background glow effect for high priority messages */}
              {message.priority <= 1 && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
              )}

              {/* Message content */}
              <div className="relative z-10">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <motion.span
                    className="text-2xl"
                    animate={{ 
                      scale: message.priority === 0 ? [1, 1.2, 1] : 1,
                      rotate: message.priority === 0 ? [0, 5, -5, 0] : 0
                    }}
                    transition={{ 
                      duration: 0.6, 
                      repeat: message.priority === 0 ? Infinity : 0,
                      repeatDelay: 1
                    }}
                  >
                    {icon}
                  </motion.span>
                </div>
                
                <motion.div
                  className={`font-bold text-white ${
                    message.priority === 0 ? 'text-lg' :
                    message.priority === 1 ? 'text-base' : 'text-sm'
                  }`}
                  animate={message.priority === 0 ? { 
                    textShadow: [
                      '0 0 5px rgba(255,255,255,0.5)',
                      '0 0 15px rgba(255,255,255,0.8)',
                      '0 0 5px rgba(255,255,255,0.5)'
                    ]
                  } : {}}
                  transition={{ duration: 1, repeat: message.priority === 0 ? Infinity : 0 }}
                >
                  {message.text}
                </motion.div>

                {/* Priority indicator */}
                {message.priority === 0 && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                )}
              </div>

              {/* Progress bar for message duration */}
              <motion.div
                className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-400 to-purple-400"
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: message.duration / 1000, ease: "linear" }}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};