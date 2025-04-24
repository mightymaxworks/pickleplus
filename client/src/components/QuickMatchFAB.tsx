import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation, useRoute } from "wouter";
import { useState, useEffect } from "react";

/**
 * Bottom action bar with quick match recording button
 * Appears on all main app pages when user is authenticated
 * Opens the match recording dialog in the match page or navigates to the match page
 * 
 * PKL-278651-UI-0023-FAB: Framework 5.2 - Record Match FAB visibility
 * Record match FAB should not appear on the landing page (/) or for non-authenticated users
 * PKL-278651-LAYC-0008-FLOAT - Improved floating action button placement
 * PKL-278651-STATS-0001-CORE - Mobile-friendly implementation to avoid blocking stats display
 * @lastModified 2025-04-24
 */
export default function QuickMatchFAB() {
  const { user } = useAuth();
  const [location, navigate] = useLocation();
  const [isOnMatchPage] = useRoute('/matches');
  const [isMobile, setIsMobile] = useState(false);
  const [isScrolledDown, setIsScrolledDown] = useState(false);
  const [wasScrollingDown, setWasScrollingDown] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  // PKL-278651-UI-0023-FAB - Add explicit check for landing page
  const isOnLandingPage = location === '/';

  // PKL-278651-LAYC-0008-FLOAT - Fix Record Match button position to avoid element overlap
  // Note: Hooks must be called in the same order on every render
  // IMPORTANT: Always declare hooks at the top level, before any conditional returns
  const [position, setPosition] = useState({ bottom: 0, right: 20 });

  // Check if we're on mobile and handle visibility based on scroll direction
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Detect scroll direction
      const isScrollingDown = currentScrollY > lastScrollY;
      setWasScrollingDown(isScrollingDown);
      setLastScrollY(currentScrollY);
      
      // Set scrolled state based on scroll position threshold
      setIsScrolledDown(currentScrollY > 150);
    };
    
    // Initialize on mount
    checkMobile();
    handleScroll();
    
    // Add event listeners
    window.addEventListener('resize', checkMobile);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  // PKL-278651-LAYC-0008-FLOAT - Enhanced adjustment for position based on content and viewport
  useEffect(() => {
    // Only run the effect if the button should be shown
    if (!user || isOnMatchPage || isOnLandingPage) {
      return;
    }

    const checkPosition = () => {
      // Check for footer visibility
      const footer = document.querySelector('footer');
      const isFooterVisible = footer && footer.getBoundingClientRect().top < window.innerHeight;

      // Determine current page for context-aware adjustments
      const currentPage = window.location.pathname;

      // Enhanced page context detection
      const isEventsPage = currentPage.includes('/events');
      const isProfilePage = currentPage.includes('/profile');
      const isDashboardPage = currentPage === '/dashboard';

      // PKL-278651-PASS-0014-DEFT-FIX - Customized spacing based on page context
      // Events page needs more space for scrolling through events cards
      // Profile page needs space for bottom action buttons
      let extraSpace = 0;
      if (isEventsPage) {
        extraSpace = 80; // Significant extra space to ensure multiple event cards are visible
      } else if (isProfilePage) {
        extraSpace = 60; // Extra space for profile action buttons
      } else if (isDashboardPage) {
        extraSpace = 60; // Increased space for dashboard content to not block stats
      } else {
        extraSpace = 30; // Default extra space for other pages
      }

      // PKL-278651-STATS-0001-CORE - Special dashboard handling to avoid blocking stats
      let rightPosition = 20; // Default right position
      
      if (isDashboardPage && isMobile) {
        // Move the button to a better position on dashboard for mobile
        // If stats cards exist, adjust position accordingly
        const statCards = document.querySelectorAll('.stats-card');
        if (statCards.length > 0) {
          rightPosition = 10; // More to the edge on mobile dashboard
          extraSpace = 100; // Greater bottom margin to avoid overlapping charts
        }
      }

      // Responsive adjustment based on viewport size
      if (isMobile) {
        // Mobile devices: position higher to avoid navigation and ensure content visibility
        // Special handling for dashboard page - show semi-transparent FAB only when scrolling up
        if (isDashboardPage) {
          // On dashboard, handle based on scroll direction
          if (isScrolledDown && wasScrollingDown) {
            // User scrolled down - hide the FAB
            setPosition({ 
              bottom: -100, // Move off-screen 
              right: rightPosition
            });
          } else {
            // User scrolled up or at top - show the FAB
            const mobileOffset = isFooterVisible ? 90 + extraSpace : 10 + extraSpace;
            setPosition({ 
              bottom: mobileOffset,
              right: rightPosition
            });
          }
        } else {
          // Normal positioning for other pages
          const mobileOffset = isFooterVisible ? 90 + extraSpace : 10 + extraSpace;
          setPosition({ 
            bottom: mobileOffset,
            right: rightPosition
          });
        }
      } else if (window.innerWidth < 1024) {
        // Tablet devices: intermediate positioning
        const tabletOffset = isFooterVisible ? 40 + (extraSpace * 0.7) : extraSpace * 0.7;
        setPosition({ 
          bottom: tabletOffset,
          right: rightPosition
        });
      } else {
        // Desktop: more subtle positioning
        const desktopOffset = isFooterVisible ? 30 + (extraSpace * 0.5) : extraSpace * 0.5;
        setPosition({ 
          bottom: desktopOffset,
          right: rightPosition
        });
      }
    };

    // Check position on initial render and on relevant events
    checkPosition();
    window.addEventListener('scroll', checkPosition);
    window.addEventListener('resize', checkPosition);
    window.addEventListener('popstate', checkPosition);

    // Clear previous interval first
    const intervalCheck = setInterval(checkPosition, 1000);

    return () => {
      window.removeEventListener('scroll', checkPosition);
      window.removeEventListener('resize', checkPosition);
      window.removeEventListener('popstate', checkPosition);
      clearInterval(intervalCheck);
    };
  }, [user, isOnMatchPage, isOnLandingPage, location, isMobile, isScrolledDown, wasScrollingDown]);

  // Don't show FAB on landing page, match page, or if not logged in
  if (!user || isOnMatchPage || isOnLandingPage) {
    return null;
  }

  // Determine if user is a founding member for special styling
  // PKL-278651-STATS-0001-CORE - Fix type issue with badges property
  // Using type assertion since we know the user object may have badges
  const isFoundingMember = user && (user as any).badges ? (user as any).badges.includes('founding_member') : false;

  // Set button colors based on founding member status
  const buttonClass = isFoundingMember 
    ? "bg-gradient-to-br from-orange-500 to-orange-700 hover:from-orange-600 hover:to-orange-800 focus:ring-orange-500"
    : "bg-primary hover:bg-primary/90 focus:ring-primary";

  // Handle record match button click
  const handleRecordMatch = () => {
    navigate('/matches?dialog=open');
  };

  // PKL-278651-STATS-0001-CORE - Mobile-optimized FAB implementation
  return (
    <div 
      className="fixed z-50"
      style={{ 
        bottom: `${position.bottom}px`,
        right: `${position.right}px`,
        transition: 'all 0.3s ease',
        opacity: (isScrolledDown && wasScrollingDown && isMobile && location === '/dashboard') ? 0.6 : 1
      }}
    >
      <div className="group relative">
        {/* Button container with hover effects */}
        <div className="rounded-full shadow-lg transition-all duration-200 hover:shadow-xl 
                       transform hover:scale-105 active:scale-95">
          {/* Circular Record Match Button - smaller on mobile */}
          <Button 
            onClick={handleRecordMatch}
            size="icon"
            className={`flex items-center justify-center ${isMobile ? 'h-12 w-12' : 'h-16 w-16'} rounded-full ${buttonClass}`}
          >
            <PlusCircle className={isMobile ? "h-5 w-5" : "h-8 w-8"} />
            <span className="sr-only">Record Match</span>
          </Button>
        </div>

        {/* Tooltip that appears on hover - desktop only */}
        <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100
                     shadow-md rounded-md bg-white dark:bg-gray-800 text-sm font-medium 
                     px-3 py-1.5 border border-gray-200 dark:border-gray-700 
                     transition-opacity duration-200 hidden md:block">
          Record Match
        </div>
      </div>
    </div>
  );
}