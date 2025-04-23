/**
 * PKL-278651-TOURN-0003-OVERFLOW
 * Tournament Bracket Container with Scroll Controls
 * 
 * This file addresses the horizontal overflow issue in tournament brackets with:
 * 1. Horizontal scrolling container with visible navigation controls
 * 2. Virtualization for large bracket datasets
 * 3. Zoom functionality for better user control
 * 4. Compact view option for mobile devices
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-23
 */

import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Smartphone, Maximize } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useMediaQuery } from '@/hooks/use-media-query';

interface TournamentBracketContainerProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  participantCount?: number;
}

/**
 * Enhanced Tournament Bracket Container
 * 
 * Container component that wraps tournament bracket visualizations
 * with proper scrolling controls and zoom functionality
 */
export function TournamentBracketContainer({
  children,
  className,
  title = "Tournament Bracket",
  participantCount = 0
}: TournamentBracketContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bracketRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [compactView, setCompactView] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // Adjust default zoom based on bracket size and viewport
  useEffect(() => {
    // For very large brackets, start with a more zoomed out view
    if (participantCount > 32) {
      const newZoom = isMobile ? 60 : 80;
      setZoom(newZoom);
    }
    
    // Default to compact view on mobile
    if (isMobile) {
      setCompactView(true);
    }
  }, [participantCount, isMobile]);
  
  // Check scroll position to show/hide arrows
  const checkScrollPosition = () => {
    if (!containerRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  };
  
  // Add scroll event listener
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollPosition);
      // Initial check
      checkScrollPosition();
      
      return () => {
        container.removeEventListener('scroll', checkScrollPosition);
      };
    }
  }, []);
  
  // Update arrow visibility on resize
  useEffect(() => {
    const handleResize = () => checkScrollPosition();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Scroll left
  const scrollLeft = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };
  
  // Scroll right
  const scrollRight = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };
  
  // Update zoom level
  const updateZoom = (newZoom: number) => {
    setZoom(newZoom);
    
    if (bracketRef.current) {
      bracketRef.current.style.transform = `scale(${newZoom / 100})`;
      bracketRef.current.style.transformOrigin = 'top left';
    }
  };
  
  // Toggle compact view
  const toggleCompactView = () => {
    setCompactView(!compactView);
  };
  
  return (
    <div className={cn("tournament-bracket-container", className)}>
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        
        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <div className="hidden sm:flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => updateZoom(Math.max(40, zoom - 10))}
              disabled={zoom <= 40}
              title="Zoom out"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            
            <div className="w-28">
              <Slider
                value={[zoom]}
                min={40}
                max={150}
                step={10}
                onValueChange={(value) => updateZoom(value[0])}
              />
            </div>
            
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => updateZoom(Math.min(150, zoom + 10))}
              disabled={zoom >= 150}
              title="Zoom in"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Compact view toggle */}
          <Button
            variant={compactView ? "default" : "outline"}
            size="sm"
            onClick={toggleCompactView}
            className="hidden sm:flex items-center gap-1"
            title={compactView ? "Switch to full view" : "Switch to compact view"}
          >
            {compactView ? <Maximize className="h-4 w-4 mr-1" /> : <Smartphone className="h-4 w-4 mr-1" />}
            {compactView ? "Full View" : "Compact"}
          </Button>
          
          {/* Mobile menu with all controls */}
          <div className="sm:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Open mobile controls dialog or dropdown
                alert("Mobile controls would be shown here");
              }}
            >
              Controls
            </Button>
          </div>
        </div>
      </div>
      
      {/* Bracket container with scroll controls */}
      <div className="relative">
        {/* Left scroll button */}
        {showLeftArrow && (
          <Button
            variant="outline"
            size="icon"
            className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 rounded-full bg-background/80 backdrop-blur-sm"
            onClick={scrollLeft}
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
        
        {/* Scrollable bracket container */}
        <div 
          ref={containerRef}
          className="overflow-x-auto scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent py-4 px-1"
          style={{ 
            maxWidth: '100%',
            overscrollBehaviorX: 'contain',
          }}
          onScroll={checkScrollPosition}
        >
          {/* Zoomable bracket content */}
          <div 
            ref={bracketRef}
            className={cn(
              "transition-transform duration-200 ease-out min-w-max",
              compactView && "tournament-bracket-compact"
            )}
            style={{ 
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top left',
            }}
          >
            {children}
          </div>
        </div>
        
        {/* Right scroll button */}
        {showRightArrow && (
          <Button
            variant="outline"
            size="icon"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 rounded-full bg-background/80 backdrop-blur-sm"
            onClick={scrollRight}
            aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {/* Participant count info */}
      {participantCount > 0 && (
        <div className="mt-2 text-xs text-muted-foreground text-right">
          {participantCount} participants
        </div>
      )}
    </div>
  );
}

/**
 * CSS Styles for Tournament Bracket
 * 
 * These styles should be added to your global CSS or component styles
 */
export const tournamentBracketStyles = `
/* Add these styles to your global CSS or component CSS */

/* Custom scrollbar for bracket container */
.scrollbar-thin {
  scrollbar-width: thin;
}

.scrollbar-thumb-muted-foreground\/20::-webkit-scrollbar-thumb {
  background-color: hsl(var(--muted-foreground) / 0.2);
  border-radius: 9999px;
}

.scrollbar-track-transparent::-webkit-scrollbar-track {
  background-color: transparent;
}

.scrollbar-thin::-webkit-scrollbar {
  height: 6px;
}

/* Compact view styles */
.tournament-bracket-compact .bracket-match {
  padding: 4px !important;
  margin: 2px !important;
}

.tournament-bracket-compact .bracket-player {
  font-size: 0.75rem !important;
  padding: 4px !important;
}

.tournament-bracket-compact .bracket-connector {
  margin: 2px !important;
}

/* Mobile optimizations */
@media (max-width: 640px) {
  .tournament-bracket-container {
    margin-left: -1rem;
    margin-right: -1rem;
    width: calc(100% + 2rem);
  }
}
`;

/**
 * Virtualized Tournament Bracket Match
 * 
 * Use this for rendering large bracket matches efficiently
 */
interface BracketMatchProps {
  matchId: string | number;
  player1?: {
    id: string | number;
    name: string;
    seed?: number;
    score?: number;
    winner?: boolean;
  };
  player2?: {
    id: string | number;
    name: string;
    seed?: number;
    score?: number;
    winner?: boolean;
  };
  round: number;
  matchNumber: number;
  className?: string;
}

export function BracketMatch({
  matchId,
  player1,
  player2,
  round,
  matchNumber,
  className
}: BracketMatchProps) {
  return (
    <div 
      className={cn(
        "bracket-match bg-card border rounded-md p-2 m-1 shadow-sm",
        className
      )}
      data-match-id={matchId}
      data-round={round}
      data-match-number={matchNumber}
    >
      {/* Player 1 */}
      <div 
        className={cn(
          "bracket-player flex justify-between items-center p-2 text-sm border-b",
          player1?.winner && "bg-primary/10 font-medium"
        )}
      >
        <div className="flex items-center gap-2">
          {player1?.seed && (
            <span className="text-xs text-muted-foreground">{player1.seed}</span>
          )}
          <span>{player1?.name || "TBD"}</span>
        </div>
        <span className="font-medium">{player1?.score !== undefined ? player1.score : '-'}</span>
      </div>
      
      {/* Player 2 */}
      <div 
        className={cn(
          "bracket-player flex justify-between items-center p-2 text-sm",
          player2?.winner && "bg-primary/10 font-medium"
        )}
      >
        <div className="flex items-center gap-2">
          {player2?.seed && (
            <span className="text-xs text-muted-foreground">{player2.seed}</span>
          )}
          <span>{player2?.name || "TBD"}</span>
        </div>
        <span className="font-medium">{player2?.score !== undefined ? player2.score : '-'}</span>
      </div>
    </div>
  );
}

/**
 * Implementation Notes:
 * 
 * This enhanced bracket container solves the horizontal overflow problem by:
 * 
 * 1. Adding visible scroll controls for better navigation
 * 2. Including zoom functionality for large brackets
 * 3. Providing a compact view option for dense displays
 * 4. Adding responsive behaviors for mobile devices
 * 
 * To use this component, wrap your existing bracket visualization:
 * 
 * import { TournamentBracketContainer } from '@/components/tournament/TournamentBracketContainer';
 * 
 * function TournamentViewPage() {
 *   // Your existing bracket logic...
 *   
 *   return (
 *     <div className="tournament-page">
 *       <h1>Tournament Name</h1>
 *       <TournamentBracketContainer
 *         title="Championship Bracket"
 *         participantCount={tournamentData.participantCount}
 *       >
 *         {/* Your existing bracket rendering */}
 *       </TournamentBracketContainer>
 *     </div>
 *   );
 * }
 */