/**
 * PKL-278651-COMM-0006-HUB-UI-MENU
 * Horizontal Menu Component
 * 
 * A reusable horizontal menu component for navigation across the platform.
 * Based on the design from the community mockups, this provides a consistent
 * and modern navigation experience.
 */

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface MenuItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  href?: string;
}

interface HorizontalMenuProps {
  items: MenuItem[];
  activeItemId?: string;
  onChange?: (itemId: string) => void;
  className?: string;
  scrollable?: boolean;
  colorScheme?: 'default' | 'primary' | 'secondary' | 'muted';
  size?: 'sm' | 'md' | 'lg';
}

export function HorizontalMenu({
  items,
  activeItemId,
  onChange,
  className,
  scrollable = true,
  colorScheme = 'default',
  size = 'md'
}: HorizontalMenuProps) {
  const [activeItem, setActiveItem] = useState<string | undefined>(activeItemId);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(false);

  // Check if scroll buttons should be shown
  useEffect(() => {
    if (!scrollable || !scrollRef.current) return;

    const checkScrollButtons = () => {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current!;
      setShowLeftScroll(scrollLeft > 0);
      setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 10); // 10px buffer
    };

    checkScrollButtons();
    
    // Add scroll event listener
    const scrollContainer = scrollRef.current;
    scrollContainer.addEventListener('scroll', checkScrollButtons);
    
    // Add resize observer to handle container size changes
    const resizeObserver = new ResizeObserver(() => {
      checkScrollButtons();
    });
    
    resizeObserver.observe(scrollContainer);
    
    return () => {
      scrollContainer.removeEventListener('scroll', checkScrollButtons);
      resizeObserver.disconnect();
    };
  }, [scrollable, items]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    
    const container = scrollRef.current;
    const scrollAmount = container.clientWidth * 0.8;
    
    if (direction === 'left') {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleItemClick = (itemId: string) => {
    setActiveItem(itemId);
    onChange?.(itemId);
  };

  // Size classes
  const sizeClasses = {
    sm: {
      container: 'py-1',
      item: 'px-2 py-1 gap-1',
      icon: 'h-3.5 w-3.5',
      label: 'text-xs'
    },
    md: {
      container: 'py-2',
      item: 'px-3 py-2 gap-1.5',
      icon: 'h-5 w-5',
      label: 'text-sm'
    },
    lg: {
      container: 'py-3',
      item: 'px-4 py-3 gap-2',
      icon: 'h-6 w-6',
      label: 'text-base'
    }
  };

  // Color scheme classes
  const colorSchemes = {
    default: {
      container: 'bg-background border-b border-border',
      item: 'text-muted-foreground hover:text-foreground',
      activeItem: 'bg-primary/10 text-primary',
      scrollButton: 'bg-muted/50 hover:bg-muted text-muted-foreground'
    },
    primary: {
      container: 'bg-primary/5 border-b border-primary/20',
      item: 'text-primary/70 hover:text-primary',
      activeItem: 'bg-primary/15 text-primary',
      scrollButton: 'bg-primary/10 hover:bg-primary/20 text-primary'
    },
    secondary: {
      container: 'bg-secondary/10 border-b border-secondary/20',
      item: 'text-secondary-foreground/70 hover:text-secondary-foreground',
      activeItem: 'bg-secondary/20 text-secondary-foreground',
      scrollButton: 'bg-secondary/10 hover:bg-secondary/20 text-secondary-foreground'
    },
    muted: {
      container: 'bg-muted/50 border-b border-muted',
      item: 'text-muted-foreground hover:text-foreground',
      activeItem: 'bg-background text-foreground',
      scrollButton: 'bg-muted hover:bg-muted/80 text-muted-foreground'
    }
  };

  return (
    <div className={cn('relative w-full', colorSchemes[colorScheme].container, sizeClasses[size].container, className)}>
      {/* Left scroll button */}
      {scrollable && showLeftScroll && (
        <button
          onClick={() => handleScroll('left')}
          className={cn(
            'absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-r-full p-1',
            colorSchemes[colorScheme].scrollButton,
            'shadow-sm'
          )}
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}
      
      {/* Right scroll button */}
      {scrollable && showRightScroll && (
        <button
          onClick={() => handleScroll('right')}
          className={cn(
            'absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-l-full p-1',
            colorSchemes[colorScheme].scrollButton,
            'shadow-sm'
          )}
          aria-label="Scroll right"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
      
      {/* Scrollable menu container */}
      <div 
        ref={scrollRef}
        className={cn(
          'flex items-center w-full overflow-x-auto scrollbar-none',
          scrollable ? 'px-6' : 'px-2'
        )}
      >
        {items.map((item) => {
          const isActive = activeItem === item.id;
          
          const MenuItem = (
            <div
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={cn(
                'flex flex-col items-center justify-center rounded-lg transition-colors duration-200 cursor-pointer',
                sizeClasses[size].item,
                colorSchemes[colorScheme].item,
                isActive && colorSchemes[colorScheme].activeItem
              )}
              role="button"
              tabIndex={0}
            >
              <div 
                className={cn(
                  'flex items-center justify-center', 
                  sizeClasses[size].icon
                )}
              >
                {item.icon}
              </div>
              <span className={sizeClasses[size].label}>{item.label}</span>
            </div>
          );
          
          if (item.href) {
            return (
              <a
                key={item.id}
                href={item.href}
                className="no-underline"
                onClick={(e) => {
                  e.preventDefault();
                  handleItemClick(item.id);
                  item.onClick?.();
                  window.location.href = item.href!;
                }}
              >
                {MenuItem}
              </a>
            );
          }
          
          return (
            <div 
              key={item.id}
              onClick={() => {
                handleItemClick(item.id);
                item.onClick?.();
              }}
            >
              {MenuItem}
            </div>
          );
        })}
      </div>
    </div>
  );
}