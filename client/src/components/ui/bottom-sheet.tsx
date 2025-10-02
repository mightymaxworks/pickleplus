import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { hapticFeedback } from '@/lib/mobile-utils';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  height?: 'auto' | 'full' | 'half';
}

export function BottomSheet({ open, onClose, children, title, height = 'auto' }: BottomSheetProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  useEffect(() => {
    if (open) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const handleClose = () => {
    hapticFeedback.light();
    setIsVisible(false);
    setTimeout(onClose, 200);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd < -50) {
      handleClose();
    }
  };

  if (!open) return null;

  const heightClasses = {
    auto: 'max-h-[85vh]',
    half: 'h-[50vh]',
    full: 'h-[95vh]'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className={cn(
          "absolute inset-0 bg-black transition-opacity duration-200",
          isVisible ? "opacity-50" : "opacity-0"
        )}
        onClick={handleClose}
      />
      
      <div
        className={cn(
          "relative w-full bg-background rounded-t-3xl shadow-2xl transition-transform duration-300 ease-out",
          heightClasses[height],
          isVisible ? "translate-y-0" : "translate-y-full"
        )}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-muted-foreground/30 rounded-full" />
        
        <div className="flex items-center justify-between p-4 border-b">
          {title && <h2 className="text-lg font-semibold">{title}</h2>}
          <button
            onClick={handleClose}
            className="ml-auto p-2 rounded-full hover:bg-muted transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            data-testid="bottom-sheet-close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="overflow-y-auto max-h-[calc(100%-4rem)] p-4 safe-area-pb">
          {children}
        </div>
      </div>
    </div>
  );
}
