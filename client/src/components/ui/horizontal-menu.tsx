/**
 * PKL-278651-COMM-0006-HUB-UI-MENU
 * Horizontal Menu Component
 * 
 * A reusable horizontal menu component for navigation across the platform.
 * Enhanced with the modern design from the test/community page mockup,
 * providing a consistent and interactive navigation experience.
 */

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
  showIndicator?: boolean;
  enableActiveScale?: boolean;
}

export function HorizontalMenu({
  items,
  activeItemId,
  onChange,
  className,
  scrollable = true,
  colorScheme = 'default',
  size = 'md',
  showIndicator = true,
  enableActiveScale = true
}: HorizontalMenuProps) {
  const [activeItem, setActiveItem] = useState<string | undefined>(activeItemId);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(false);

  // Update the active item when the activeItemId prop changes
  useEffect(() => {
    if (activeItemId !== undefined && activeItemId !== activeItem) {
      setActiveItem(activeItemId);
    }
  }, [activeItemId]);

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
      item: 'p-2 gap-1',
      icon: 'mb-0.5 p-1',
      iconSize: 'h-3.5 w-3.5',
      label: 'text-xs',
      indicator: 'w-6 h-0.5'
    },
    md: {
      container: 'py-2',
      item: 'p-2.5 gap-1.5',
      icon: 'mb-1 p-1.5',
      iconSize: 'h-5 w-5',
      label: 'text-xs font-medium',
      indicator: 'w-8 h-1'
    },
    lg: {
      container: 'py-3',
      item: 'p-3 gap-2',
      icon: 'mb-1 p-2',
      iconSize: 'h-6 w-6',
      label: 'text-sm font-medium',
      indicator: 'w-10 h-1'
    }
  };

  // Color scheme classes
  const colorSchemes = {
    default: {
      container: 'bg-muted/30 rounded-xl border border-muted/80 shadow-inner',
      item: 'text-muted-foreground hover:text-foreground hover:bg-background/10',
      activeItem: 'bg-primary text-primary-foreground shadow-lg',
      activeIconBg: 'bg-primary-foreground/20',
      hoverIconBg: 'group-hover:bg-background/10',
      indicator: 'bg-primary-foreground/50',
      scrollButton: 'bg-muted/50 hover:bg-muted text-muted-foreground'
    },
    primary: {
      container: 'bg-primary/5 rounded-xl border border-primary/20 shadow-inner',
      item: 'text-muted-foreground hover:text-foreground hover:bg-primary/10',
      activeItem: 'bg-primary text-primary-foreground shadow-lg',
      activeIconBg: 'bg-primary-foreground/20',
      hoverIconBg: 'group-hover:bg-background/10',
      indicator: 'bg-primary-foreground/50',
      scrollButton: 'bg-primary/10 hover:bg-primary/20 text-primary'
    },
    secondary: {
      container: 'bg-secondary/10 rounded-xl border border-secondary/20 shadow-inner',
      item: 'text-muted-foreground hover:text-foreground hover:bg-secondary/10',
      activeItem: 'bg-secondary text-secondary-foreground shadow-lg',
      activeIconBg: 'bg-secondary-foreground/20',
      hoverIconBg: 'group-hover:bg-background/10',
      indicator: 'bg-secondary-foreground/50',
      scrollButton: 'bg-secondary/10 hover:bg-secondary/20 text-secondary-foreground'
    },
    muted: {
      container: 'bg-muted/50 rounded-xl border border-muted shadow-inner',
      item: 'text-muted-foreground hover:text-foreground hover:bg-background/10',
      activeItem: 'bg-background text-foreground shadow-md',
      activeIconBg: 'bg-foreground/10',
      hoverIconBg: 'group-hover:bg-background/10',
      indicator: 'bg-foreground/30',
      scrollButton: 'bg-muted hover:bg-muted/80 text-muted-foreground'
    }
  };

  return (
    <div className={cn('relative w-full overflow-hidden', className)}>
      {/* Container */}
      <div className={cn('w-full', colorSchemes[colorScheme].container)}>
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
            scrollable ? 'px-4' : 'px-2',
            'py-2'
          )}
        >
          <div className="w-full flex items-center justify-center gap-1 sm:gap-3 lg:gap-6">
            {items.map((item) => {
              const isActive = activeItem === item.id;
              
              const ItemContent = (
                <button 
                  onClick={() => {
                    handleItemClick(item.id);
                    item.onClick?.();
                  }}
                  className={cn(
                    'relative group flex flex-col items-center justify-center',
                    'transition-all duration-300 ease-in-out',
                    sizeClasses[size].item,
                    isActive 
                      ? cn(colorSchemes[colorScheme].activeItem, 'rounded-xl', enableActiveScale && 'scale-110')
                      : cn('hover:bg-primary/10 rounded-lg', colorSchemes[colorScheme].item)
                  )}
                >
                  <div className={cn(
                    sizeClasses[size].icon,
                    'rounded-full', 
                    isActive ? colorSchemes[colorScheme].activeIconBg : cn('bg-transparent', colorSchemes[colorScheme].hoverIconBg)
                  )}>
                    <div className={sizeClasses[size].iconSize}>
                      {item.icon}
                    </div>
                  </div>
                  <span className={sizeClasses[size].label}>{item.label}</span>
                  
                  {showIndicator && isActive && (
                    <div className={cn(
                      'absolute -bottom-1 left-1/2 transform -translate-x-1/2 rounded-t-full',
                      sizeClasses[size].indicator,
                      colorSchemes[colorScheme].indicator
                    )} />
                  )}
                </button>
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
                    {ItemContent}
                  </a>
                );
              }
              
              return (
                <div key={item.id}>
                  {ItemContent}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}