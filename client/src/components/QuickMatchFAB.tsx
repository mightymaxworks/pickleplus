import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { MatchRecordingForm } from "@/components/MatchRecordingForm";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/useIsMobile";

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
      <div className={`fixed z-40 ${isMobile ? 'bottom-20 right-4' : 'bottom-8 right-8'}`}>
        <Button 
          onClick={() => setIsOpen(true)}
          size="lg"
          className="rounded-full w-14 h-14 shadow-lg bg-[#FF5722] hover:bg-[#E64A19] focus:ring-[#FF5722]"
        >
          <PlusCircle className="h-6 w-6" />
          <span className="sr-only">Record Match</span>
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Record Match Results</DialogTitle>
            <DialogDescription>
              Log your match results to earn XP and ranking points.
            </DialogDescription>
          </DialogHeader>
          <MatchRecordingForm onSuccess={() => setIsOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}