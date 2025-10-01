import { motion, useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Trophy, Target, Zap, TrendingUp, Swords, Award } from 'lucide-react';

interface StatItem {
  label: string;
  value: number;
  suffix?: string;
  icon: typeof Trophy;
  color: string;
  gradient: string;
}

interface HexagonalStatsProps {
  stats: {
    wins: number;
    losses: number;
    winRate: number;
    totalMatches: number;
    currentStreak: number;
    bestStreak: number;
  };
  className?: string;
}

function AnimatedCounter({ 
  end, 
  duration = 1500, 
  suffix = '',
  decimals = 0 
}: { 
  end: number; 
  duration?: number; 
  suffix?: string;
  decimals?: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number | null = null;
    const startValue = 0;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuad = (t: number) => t * (2 - t);
      const easedProgress = easeOutQuad(progress);
      
      const currentCount = startValue + (end - startValue) * easedProgress;
      setCount(currentCount);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(animate);
  }, [end, duration, isInView]);

  return (
    <div ref={ref} className="tabular-nums">
      {count.toFixed(decimals)}{suffix}
    </div>
  );
}

function HexagonStat({ 
  stat, 
  index,
  shimmer = false 
}: { 
  stat: StatItem; 
  index: number;
  shimmer?: boolean;
}) {
  const Icon = stat.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        type: "spring",
        stiffness: 100
      }}
      className="relative group"
      data-testid={`hex-stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}
    >
      {/* Hexagonal Container */}
      <div className="relative">
        {/* Hexagonal Background Pattern */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
            background: stat.gradient
          }}
        />
        
        {/* Outer Glow */}
        <div 
          className={`absolute inset-0 blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300 ${shimmer ? 'animate-pulse' : ''}`}
          style={{ 
            background: stat.gradient,
            clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)'
          }}
        />
        
        {/* Main Card with Hexagonal Clip */}
        <div 
          className="relative bg-black/40 backdrop-blur-sm p-4 transition-all duration-300"
          style={{
            clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)'
          }}
        >
          {/* Hexagonal Border */}
          <div 
            className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity"
            style={{
              background: stat.gradient,
              clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
              padding: '1px'
            }}
          />
          
          {/* Gradient Overlay */}
          <div 
            className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity"
            style={{ 
              background: stat.gradient,
              clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)'
            }}
          />
          
          {/* Content */}
          <div className="relative z-10 flex flex-col items-center space-y-2">
            {/* Icon with Glow */}
            <div className="relative">
              <div 
                className="absolute inset-0 blur-md opacity-60"
                style={{ background: stat.color }}
              />
              <div 
                className="relative rounded-lg p-2"
                style={{ background: stat.gradient }}
              >
                <Icon className="w-5 h-5 text-white" />
              </div>
            </div>

            {/* Value */}
            <div 
              className="text-3xl font-bold tabular-nums"
              style={{ 
                background: stat.gradient,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              <AnimatedCounter 
                end={stat.value} 
                suffix={stat.suffix}
                decimals={stat.suffix === '%' ? 1 : 0}
              />
            </div>

            {/* Label */}
            <div className="text-xs text-white/60 font-medium uppercase tracking-wider text-center">
              {stat.label}
            </div>
          </div>
        </div>
      </div>

      {/* Scan Line Effect with Hexagonal Clip */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent"
        animate={{ y: ['-100%', '200%'] }}
        transition={{ 
          duration: 2, 
          repeat: Infinity, 
          repeatDelay: 3,
          ease: "linear" 
        }}
        style={{ 
          pointerEvents: 'none',
          clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)'
        }}
      />
    </motion.div>
  );
}

export default function HexagonalStats({ stats, className = '' }: HexagonalStatsProps) {
  // Unified orange→pink→purple gradient theme throughout
  const primaryGradient = 'linear-gradient(135deg, #f97316 0%, #ec4899 50%, #a855f7 100%)';
  
  const statItems: StatItem[] = [
    {
      label: 'Wins',
      value: stats.wins,
      icon: Trophy,
      color: '#f97316',
      gradient: primaryGradient
    },
    {
      label: 'Losses',
      value: stats.losses,
      icon: Target,
      color: '#ec4899',
      gradient: primaryGradient
    },
    {
      label: 'Win Rate',
      value: stats.winRate,
      suffix: '%',
      icon: TrendingUp,
      color: '#a855f7',
      gradient: primaryGradient
    },
    {
      label: 'Matches',
      value: stats.totalMatches,
      icon: Swords,
      color: '#f97316',
      gradient: primaryGradient
    },
    {
      label: 'Streak',
      value: stats.currentStreak,
      icon: Zap,
      color: '#ec4899',
      gradient: primaryGradient
    },
    {
      label: 'Best Streak',
      value: stats.bestStreak,
      icon: Award,
      color: '#a855f7',
      gradient: primaryGradient
    }
  ];

  return (
    <div className={`space-y-4 ${className}`} data-testid="hexagonal-stats-container">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center justify-between"
      >
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <div className="w-1 h-6 bg-gradient-to-b from-[#f97316] via-[#ec4899] to-[#a855f7] rounded-full" />
          Battle Stats
        </h3>
        <div className="flex items-center gap-1 text-xs text-white/40">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span>LIVE</span>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {statItems.map((stat, index) => (
          <HexagonStat 
            key={stat.label} 
            stat={stat} 
            index={index}
          />
        ))}
      </div>

      {/* Bottom Accent Line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1, delay: 0.6 }}
        className="h-[1px] bg-gradient-to-r from-transparent via-[#f97316] to-transparent origin-left"
      />
    </div>
  );
}
