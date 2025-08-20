import React from 'react';
import { 
  ShieldCheck, 
  Timer, 
  Star, 
  AlertTriangle,
  Award,
  AlertCircle
} from 'lucide-react';

interface RatingStatusBadgeProps {
  status: 'PROVISIONAL' | 'CONFIRMED';
  size?: 'sm' | 'md' | 'lg';
  showDescription?: boolean;
  className?: string;
}

export function RatingStatusBadge({ 
  status, 
  size = 'md', 
  showDescription = false,
  className = ''
}: RatingStatusBadgeProps) {
  const isConfirmed = status === 'CONFIRMED';
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };
  
  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4', 
    lg: 'w-5 h-5'
  };

  if (isConfirmed) {
    return (
      <div className={`inline-flex flex-col items-center gap-2 ${className}`}>
        <div className={`inline-flex items-center gap-2 rounded-full font-bold border-2 
          bg-emerald-50 text-emerald-800 border-emerald-200 ${sizeClasses[size]}`}>
          <ShieldCheck className={iconSizes[size]} />
          <span>VERIFIED RATING</span>
          {size === 'lg' && <Star className="w-4 h-4 fill-emerald-600 text-emerald-600" />}
        </div>
        
        {showDescription && (
          <div className="bg-emerald-50 border-2 border-emerald-200 rounded-lg p-3 max-w-md">
            <div className="flex items-start gap-2">
              <Award className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-bold text-emerald-800 mb-1">🏆 Achievement Unlocked</p>
                <p className="text-emerald-700">
                  This rating has been <strong>verified by expert-level coaches</strong> and is eligible for all official competitions.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  } else {
    return (
      <div className={`inline-flex flex-col items-center gap-2 ${className}`}>
        <div className={`inline-flex items-center gap-2 rounded-full font-bold border-2
          bg-amber-50 text-amber-800 border-amber-200 ${sizeClasses[size]}`}>
          <Timer className={iconSizes[size]} />
          <span>PROVISIONAL</span>
          {size === 'lg' && <AlertTriangle className="w-4 h-4 text-amber-600" />}
        </div>
        
        {showDescription && (
          <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-3 max-w-md">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-bold text-amber-800 mb-1">⚠️ Needs Verification</p>
                <p className="text-amber-700">
                  This rating requires validation by an <strong>L4+ certified coach</strong> before official use.
                </p>
                <div className="bg-amber-100 rounded-md p-2 mt-2">
                  <p className="text-xs font-medium text-amber-800">
                    💡 Book an assessment with an L4 or L5 coach to get verified!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

// Quick status indicator for compact displays
export function RatingStatusIcon({ status, size = 'md' }: { 
  status: 'PROVISIONAL' | 'CONFIRMED'; 
  size?: 'sm' | 'md' | 'lg' 
}) {
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5', 
    lg: 'w-6 h-6'
  };

  return status === 'CONFIRMED' ? (
    <ShieldCheck className={`${iconSizes[size]} text-emerald-600`} />
  ) : (
    <AlertCircle className={`${iconSizes[size]} text-amber-500`} />
  );
}