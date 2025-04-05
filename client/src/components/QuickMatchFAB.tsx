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
            <DialogDescription>
              <div className="space-y-2 py-2">
                <p>Track your pickleball journey! Recording matches helps you:</p>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  <li><span className="font-semibold text-[#4CAF50]">Earn XP</span> - Get 50-100 XP for each match recorded</li>
                  <li><span className="font-semibold text-[#2196F3]">Improve Rankings</span> - Boost your position on our leaderboards</li>
                  <li><span className="font-semibold text-[#FF5722]">Unlock Achievements</span> - Complete challenges for bonus rewards</li>
                  <li><span className="font-semibold text-[#9C27B0]">Build History</span> - Create your personal pickleball story</li>
                </ul>
                <p className="text-xs italic mt-3">Coming April 15: Match analytics and performance tracking!</p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="pb-safe">
            <MatchRecordingForm onSuccess={() => setIsOpen(false)} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}