import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  PlusCircle, 
  CreditCard
} from "lucide-react";
import { MatchRecordingForm } from "@/components/MatchRecordingForm";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";

/**
 * Bottom action bar with quick match recording and passport options
 * Appears on all main app pages when user is authenticated
 */
export default function QuickMatchFAB() {
  const [matchDialogOpen, setMatchDialogOpen] = useState(false);
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  if (!user) {
    return null;
  }

  // Determine if user is a founding member for special styling
  const isFoundingMember = user?.isFoundingMember === true;

  // Set button colors based on founding member status
  const passportButtonClass = isFoundingMember 
    ? "bg-gradient-to-br from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 focus:ring-yellow-500"
    : "bg-[#FF5722] hover:bg-[#E64A19] focus:ring-[#FF5722]";

  return (
    <>
      {/* Sticky bottom navigation bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 shadow-lg border-t border-gray-200 bg-white px-2 py-2">
        <div className="grid grid-cols-2 gap-2">
          {/* Passport Options Button */}
          <Button 
            onClick={() => setLocation("/profile")}
            size="lg"
            className={`flex flex-col items-center justify-center h-16 rounded-xl ${passportButtonClass}`}
          >
            <CreditCard className="h-6 w-6 mb-1" />
            <span className="text-xs">Passport Options</span>
          </Button>
          
          {/* Record Match Button */}
          <Button 
            onClick={() => setMatchDialogOpen(true)}
            size="lg"
            className="flex flex-col items-center justify-center h-16 rounded-xl bg-[#4CAF50] hover:bg-[#388E3C] focus:ring-[#4CAF50]"
          >
            <PlusCircle className="h-6 w-6 mb-1" />
            <span className="text-xs">Record Match</span>
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