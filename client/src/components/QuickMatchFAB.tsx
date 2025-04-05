import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { MatchRecordingForm } from "@/components/MatchRecordingForm";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";

/**
 * Floating Action Button (FAB) for quick match recording
 * Appears on all main app pages when user is authenticated
 */
export default function QuickMatchFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const isMobile = useIsMobile();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <div className={`fixed z-40 ${isMobile ? 'bottom-20 left-4' : 'bottom-8 left-8'}`}>
        <Button 
          onClick={() => setIsOpen(true)}
          size="lg"
          className="rounded-full w-14 h-14 shadow-lg bg-[#4CAF50] hover:bg-[#388E3C] focus:ring-[#4CAF50]"
        >
          <PlusCircle className="h-6 w-6" />
          <span className="sr-only">Record Match</span>
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto p-4 pt-6">
          <DialogHeader className="pb-2">
            <DialogTitle>Record Match Results</DialogTitle>
          </DialogHeader>
          
          <div className="bg-gradient-to-r from-orange-50 to-blue-50 p-4 rounded-lg border border-orange-100 shadow-sm my-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[#FF5722] font-bold">COMING SOON</div>
              <div className="bg-[#FF5722] text-white text-xs px-2 py-1 rounded-full">April 13</div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Transform Your Pickleball Journey</h3>
            <p className="text-gray-700 mb-3">Our revolutionary match tracking system helps you dominate the court with data-driven insights.</p>
            
            {/* Mobile-optimized grid layout - single column on small screens, two columns on larger */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
              <div className="flex items-start">
                <div className="bg-[#4CAF50] rounded-full p-1 mr-2 mt-1 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="text-xs">Boost XP up to 100 points per match</div>
              </div>
              <div className="flex items-start">
                <div className="bg-[#2196F3] rounded-full p-1 mr-2 mt-1 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="text-xs">Track performance progress visually</div>
              </div>
              <div className="flex items-start">
                <div className="bg-[#FF5722] rounded-full p-1 mr-2 mt-1 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="text-xs">Unlock exclusive achievements</div>
              </div>
              <div className="flex items-start">
                <div className="bg-[#9C27B0] rounded-full p-1 mr-2 mt-1 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="text-xs">Climb leaderboards & rankings</div>
              </div>
            </div>
            
            <div className="text-center text-xs text-gray-500">Be the first to experience this game-changing feature, unlocking April 13, 1:00 AM SGT</div>
          </div>
          
          <div className="mt-4 flex justify-center">
            <Button 
              onClick={() => setIsOpen(false)} 
              className="bg-gray-200 hover:bg-gray-300 text-gray-600"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}