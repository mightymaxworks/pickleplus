import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  PlusCircle, 
  QrCode, 
  Scan, 
  CreditCard, 
  ChevronUp 
} from "lucide-react";
import { MatchRecordingForm } from "@/components/MatchRecordingForm";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

/**
 * Bottom action bar with quick match recording and QR scan buttons
 * Appears on all main app pages when user is authenticated
 */
export default function QuickMatchFAB() {
  const [matchDialogOpen, setMatchDialogOpen] = useState(false);
  const [qrPopoverOpen, setQrPopoverOpen] = useState(false);
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  if (!user) {
    return null;
  }

  // Determine if user is a founding member for special styling
  const isFoundingMember = user?.isFoundingMember === true;

  // Set button colors based on founding member status
  const qrButtonClass = isFoundingMember 
    ? "bg-gradient-to-br from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 focus:ring-yellow-500"
    : "bg-[#2196F3] hover:bg-[#1976D2] focus:ring-[#2196F3]";

  return (
    <>
      {/* Sticky bottom navigation bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 shadow-lg border-t border-gray-200 bg-white px-2 py-2">
        <div className="grid grid-cols-2 gap-2">
          {/* Scan/Show QR Code Button with Popover */}
          <Popover open={qrPopoverOpen} onOpenChange={setQrPopoverOpen}>
            <PopoverTrigger asChild>
              <Button 
                size="lg"
                className={`flex flex-col items-center justify-center h-16 rounded-xl ${qrButtonClass}`}
              >
                <QrCode className="h-6 w-6 mb-1" />
                <span className="text-xs flex items-center">
                  QR Options <ChevronUp className="h-3 w-3 ml-1" />
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-0">
              <div className="flex flex-col">
                <Button 
                  variant="ghost"
                  className="flex items-center justify-start rounded-none px-4 py-3 hover:bg-slate-100"
                  onClick={() => {
                    setQrPopoverOpen(false);
                    setLocation("/scan");
                  }}
                >
                  <Scan className="h-5 w-5 mr-2" />
                  <span>Scan QR Code</span>
                </Button>
                <Button 
                  variant="ghost"
                  className="flex items-center justify-start rounded-none px-4 py-3 hover:bg-slate-100"
                  onClick={() => {
                    setQrPopoverOpen(false);
                    setLocation("/passport");
                  }}
                >
                  <CreditCard className="h-5 w-5 mr-2" />
                  <span>My Passport</span>
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          
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