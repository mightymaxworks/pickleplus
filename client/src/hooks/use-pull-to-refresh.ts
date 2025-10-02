import { useEffect, useRef, useState } from 'react';
import { hapticFeedback } from '@/lib/mobile-utils';

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void> | void;
  threshold?: number;
  enabled?: boolean;
}

export function usePullToRefresh({
  onRefresh,
  threshold = 80,
  enabled = true
}: UsePullToRefreshOptions) {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const touchStartY = useRef(0);
  const refreshing = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        touchStartY.current = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (refreshing.current || window.scrollY > 0) return;

      const touchY = e.touches[0].clientY;
      const pullDist = touchY - touchStartY.current;

      if (pullDist > 0) {
        setPullDistance(pullDist);
        setIsPulling(pullDist > threshold / 2);
        
        if (pullDist > threshold && !refreshing.current) {
          hapticFeedback.medium();
        }
      }
    };

    const handleTouchEnd = async () => {
      if (pullDistance > threshold && !refreshing.current) {
        refreshing.current = true;
        hapticFeedback.success();
        
        try {
          await onRefresh();
        } finally {
          refreshing.current = false;
          setIsPulling(false);
          setPullDistance(0);
        }
      } else {
        setIsPulling(false);
        setPullDistance(0);
      }
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled, onRefresh, pullDistance, threshold]);

  return {
    isPulling,
    pullDistance,
    isRefreshing: refreshing.current
  };
}
