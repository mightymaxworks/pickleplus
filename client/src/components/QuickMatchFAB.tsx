import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { MatchRecordingForm } from "@/components/MatchRecordingForm";
import { useAuth } from "@/hooks/useAuth";

/**
 * Bottom action bar with quick match recording button
 * Appears on all main app pages when user is authenticated
 */
export default function QuickMatchFAB() {
  const [matchDialogOpen, setMatchDialogOpen] = useState(false);
  const { user } = useAuth();
  
  if (!user) {
    return null;
  }

  // Determine if user is a founding member for special styling
  const isFoundingMember = user?.isFoundingMember === true;

  // Set button colors based on founding member status
  const buttonClass = isFoundingMember 
    ? "bg-gradient-to-br from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 focus:ring-green-500"
    : "bg-[#4CAF50] hover:bg-[#388E3C] focus:ring-[#4CAF50]";

  return (
    <>
      {/* Sticky bottom navigation bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 shadow-lg border-t border-gray-200 bg-white px-2 py-2">
        <div className="px-2">
          {/* Full-width Record Match Button */}
          <Button 
            onClick={() => setMatchDialogOpen(true)}
            size="lg"
            className={`flex items-center justify-center h-16 rounded-xl w-full gap-2 ${buttonClass}`}
          >
            <PlusCircle className="h-6 w-6" />
            <span className="text-base font-medium">Record Match</span>
          </Button>
        </div>
      </div>
      
      {/* Match Recording Dialog */}
      <Dialog open={matchDialogOpen} onOpenChange={setMatchDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Record Match Results</DialogTitle>
          </DialogHeader>
          <MatchRecordingForm onSuccess={() => setMatchDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}