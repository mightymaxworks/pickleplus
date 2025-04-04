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
              Log your match results to earn XP and ranking points.
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