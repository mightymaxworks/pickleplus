/**
 * PKL-278651-COMM-0006-HUB-UI-UTIL
 * Community UI Shared Components
 * 
 * Shared UI components for the Community module with modern design elements
 * Based on the design patterns from TestCommunityPage.
 */

import React from 'react';
// @ts-ignore
import communityLogoImage from '@/assets/community-logo-new.png';

// Pickleball SVG Icon
export const PickleballIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
    <path d="M12 2C13.3 2 14.6 2.3 15.8 2.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M19.4 5.2C21.5 7.8 22.5 11.4 21.5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M17.7 19.8C15.1 21.9 11.5 22.5 8.2 21.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M3.3 16.5C2 13.3 2.3 9.6 4.3 6.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M8 3.3C8.4 3.1 8.8 3 9.2 2.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// Custom Paddle SVG Icon
export const PaddleIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 4C19 7 20 13 17 17C15 19.5 12 20 9 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M8.5 18.5L5 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M4 20.6L5.1 19.5L3.9 18.3L3 19.2C2.8 19.4 2.8 19.8 3 20L4 21C4.2 21.2 4.6 21.2 4.8 21L5.7 20.1L4.5 18.9L3.4 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 6L16 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// Court Lines Background Component
export const CourtLinesBackground = () => (
  <div className="absolute inset-0 z-0 opacity-[0.03]">
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <pattern id="courtLines" width="100" height="100" patternUnits="userSpaceOnUse">
        <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" strokeWidth="1" />
        <line x1="50" y1="0" x2="50" y2="100" stroke="currentColor" strokeWidth="1" />
        <rect x="10" y="10" width="80" height="80" stroke="currentColor" strokeWidth="0.5" fill="none" />
      </pattern>
      <rect width="100%" height="100%" fill="url(#courtLines)" />
    </svg>
  </div>
);

// Confetti Animation Component
export const ConfettiEffect = ({ active }: { active: boolean }) => {
  if (!active) return null;
  
  return (
    <div className="confetti-container absolute inset-0 overflow-hidden pointer-events-none z-50">
      {Array.from({ length: 40 }).map((_, i) => {
        const size = Math.random() * 10 + 5;
        const left = Math.random() * 100;
        const animationDuration = Math.random() * 3 + 2;
        const delay = Math.random() * 0.5;
        const type = Math.floor(Math.random() * 3); // 0: square, 1: circle, 2: triangle
        const colors = ['#F2D362', '#83C167', '#EC4C56', '#45C4E5', '#9683EC'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        let shape;
        if (type === 0) {
          shape = <div style={{ width: `${size}px`, height: `${size}px`, backgroundColor: color }} className="rounded-sm" />;
        } else if (type === 1) {
          shape = <div style={{ width: `${size}px`, height: `${size}px`, backgroundColor: color }} className="rounded-full" />;
        } else {
          shape = (
            <div 
              style={{ 
                width: `${size}px`, 
                height: `${size}px`,
                backgroundColor: 'transparent',
                borderLeft: `${size/2}px solid transparent`,
                borderRight: `${size/2}px solid transparent`,
                borderBottom: `${size}px solid ${color}`
              }} 
            />
          );
        }
        
        return (
          <div 
            key={i}
            className="confetti absolute top-0"
            style={{
              left: `${left}%`,
              animation: `confetti-fall ${animationDuration}s ease-in ${delay}s forwards`,
              opacity: active ? 1 : 0,
            }}
          >
            {shape}
          </div>
        );
      })}
      
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes confetti-fall {
            0% {
              transform: translateY(-10px) rotate(0deg);
            }
            100% {
              transform: translateY(100vh) rotate(360deg);
            }
          }
          
          @keyframes ping-slow {
            0% {
              transform: scale(1);
              opacity: 0.8;
            }
            50% {
              transform: scale(1.5);
              opacity: 0.4;
            }
            100% {
              transform: scale(1);
              opacity: 0.8;
            }
          }
          
          @keyframes float {
            0% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-10px);
            }
            100% {
              transform: translateY(0px);
            }
          }
          
          @keyframes float-delay {
            0% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-8px);
            }
            100% {
              transform: translateY(0px);
            }
          }
          
          @keyframes wiggle {
            0%, 100% {
              transform: rotate(-3deg);
            }
            50% {
              transform: rotate(3deg);
            }
          }
          
          .animate-ping-slow {
            animation: ping-slow 3s cubic-bezier(0, 0, 0.2, 1) infinite;
          }
          
          .animate-float {
            animation: float 6s ease-in-out infinite;
          }
          
          .animate-float-delay {
            animation: float-delay 8s ease-in-out infinite;
          }
          
          .animate-wiggle {
            animation: wiggle 1s ease-in-out infinite;
          }
          
          .ease-spring {
            transition-timing-function: cubic-bezier(0.5, 0, 0.1, 1.5);
          }
        `
      }} />
    </div>
  );
};

// Feature Badge Pill
interface FeatureBadgeProps {
  icon: React.ReactNode;
  label: string;
  color: 'green' | 'blue' | 'purple' | 'amber' | 'rose' | 'primary';
}

export const FeatureBadge: React.FC<FeatureBadgeProps> = ({ icon, label, color }) => {
  const colorClasses = {
    green: "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300",
    blue: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300",
    purple: "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300",
    amber: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300",
    rose: "bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300",
    primary: "bg-primary/10 text-primary border border-primary/30"
  };

  return (
    <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${colorClasses[color]}`}>
      {icon && <span className="mr-1">{icon}</span>}
      <span>{label}</span>
    </div>
  );
};

// Decorative Elements
export const DecorativeElements = () => (
  <>
    {/* Floating Decoration Elements */}
    <div className="hidden lg:block absolute top-40 -left-6 w-12 h-12 rounded-full bg-yellow-300/30 backdrop-blur-xl animate-pulse-slow"></div>
    <div className="hidden lg:block absolute bottom-20 right-10 w-20 h-20 rounded-full bg-green-300/20 backdrop-blur-xl animate-float"></div>
    <div className="hidden lg:block absolute top-1/4 right-16 w-8 h-8 rounded-full bg-blue-300/20 backdrop-blur-md animate-float-delay"></div>
  </>
);

export const CommunityHeader = ({ 
  title, 
  subtitle
}: { 
  title: string; 
  subtitle: string;
}) => (
  <div className="flex items-center gap-4 mb-8">
    <img src={communityLogoImage} alt="Community Logo" className="h-12 w-auto" />
    <div>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
    </div>
  </div>
);