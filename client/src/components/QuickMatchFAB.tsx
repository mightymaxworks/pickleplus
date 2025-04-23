import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation, useRoute } from "wouter";
import { useState, useEffect } from "react";

/**
 * Bottom action bar with quick match recording button
 * Appears on all main app pages when user is authenticated
 * Opens the match recording dialog in the match page or navigates to the match page
 * 
 * PKL-278651-UI-0023-FAB: Framework 5.2 - Record Match FAB visibility
 * Record match FAB should not appear on the landing page (/) or for non-authenticated users
 * @lastModified 2025-04-23
 */
export default function QuickMatchFAB() {
  const { user } = useAuth();
  const [location, navigate] = useLocation();
  const [isOnMatchPage] = useRoute('/matches');
  
  // PKL-278651-UI-0023-FAB - Add explicit check for landing page
  const isOnLandingPage = location === '/';
  
  // Don't show FAB on landing page, match page, or if not logged in
  if (!user || isOnMatchPage || isOnLandingPage) {
    return null;
  }

  // Determine if user is a founding member for special styling
  const isFoundingMember = user?.isFoundingMember === true;

  // Set button colors based on founding member status
  const buttonClass = isFoundingMember 
    ? "bg-gradient-to-br from-orange-500 to-orange-700 hover:from-orange-600 hover:to-orange-800 focus:ring-orange-500"
    : "bg-[#FF9800] hover:bg-[#F57C00] focus:ring-[#FF9800]";

  // Handle record match button click
  const handleRecordMatch = () => {
    navigate('/matches?dialog=open');
  };

  // PKL-278651-LAYC-0008-FLOAT - Fix Record Match button position to avoid element overlap
  const [position, setPosition] = useState({ bottom: 0 });
  
  // Adjust position based on footer visibility and screen size
  useEffect(() => {
    const checkPosition = () => {
      const footer = document.querySelector('footer');
      const isFooterVisible = footer && footer.getBoundingClientRect().top < window.innerHeight;
      
      // PKL-278651-PASS-0014-DEFT-FIX - Add additional space at the bottom to avoid blocking content
      // Especially important on the events page to prevent blocking the last event card
      const currentPage = window.location.pathname;
      const isEventsPage = currentPage.includes('/events');
      const extraSpace = isEventsPage ? 20 : 0;
      
      // Adjust position based on viewport size, page type, and footer visibility
      if (window.innerWidth < 768) {
        // On mobile, position higher to avoid nav and add extra space on events page
        setPosition({ bottom: isFooterVisible ? 80 + extraSpace : extraSpace });
      } else {
        // On desktop, adjust based on footer and add extra space on events page
        setPosition({ bottom: isFooterVisible ? 20 + extraSpace : extraSpace });
      }
    };
    
    // Check position on initial render and on scroll/resize
    checkPosition();
    window.addEventListener('scroll', checkPosition);
    window.addEventListener('resize', checkPosition);
    window.addEventListener('popstate', checkPosition);
    
    return () => {
      window.removeEventListener('scroll', checkPosition);
      window.removeEventListener('resize', checkPosition);
      window.removeEventListener('popstate', checkPosition);
    };
  }, []);
  
  return (
    <>
      {/* PKL-278651-PASS-0014-DEFT-FIX - Bottom padding spacer element to prevent content from being hidden */}
      <div className="pb-24 w-full" />
      
      <div 
        className={`fixed left-0 right-0 z-50 shadow-lg border-t border-gray-200 bg-white px-2 py-2`}
        style={{ 
          bottom: `${position.bottom}px`,
          transition: 'bottom 0.3s ease'
        }}
      >
        <div className="px-2 py-2 md:py-0">
          {/* Full-width Record Match Button */}
          <Button 
            onClick={handleRecordMatch}
            size="lg"
            className={`flex items-center justify-center h-14 md:h-16 rounded-xl w-full gap-2 ${buttonClass}`}
          >
            <PlusCircle className="h-6 w-6" />
            <span className="text-base font-medium">Record Match</span>
          </Button>
        </div>
      </div>
    </>
  );
}