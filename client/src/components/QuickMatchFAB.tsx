import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlusCircle, QrCode, ChevronRight } from "lucide-react";
import { MatchRecordingForm } from "@/components/MatchRecordingForm";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";

/**
 * Bottom action bar with quick match recording and QR scan buttons
 * Appears on all main app pages when user is authenticated
 */
export default function QuickMatchFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  if (!user) {
    return null;
  }

  return (
    <>
      {/* Sticky bottom navigation bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 shadow-lg border-t border-gray-200 bg-white px-2 py-2">
        <div className="grid grid-cols-2 gap-2">
          {/* Scan QR Code Button */}
          <Button 
            onClick={() => setLocation("/scan")}
            size="lg"
            className="flex flex-col items-center justify-center h-16 rounded-xl bg-[#2196F3] hover:bg-[#1976D2] focus:ring-[#2196F3]"
          >
            <QrCode className="h-6 w-6 mb-1" />
            <span className="text-xs">Scan QR</span>
          </Button>
          
          {/* Record Match Button */}
          <Button 
            onClick={() => setIsOpen(true)}
            size="lg"
            className="flex flex-col items-center justify-center h-16 rounded-xl bg-[#4CAF50] hover:bg-[#388E3C] focus:ring-[#4CAF50]"
          >
            <PlusCircle className="h-6 w-6 mb-1" />
            <span className="text-xs">Record Match</span>
          </Button>
        </div>
      </div>
      
      {/* Match Recording Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Record Match Results</DialogTitle>
          </DialogHeader>
          <MatchRecordingForm onSuccess={() => setIsOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}