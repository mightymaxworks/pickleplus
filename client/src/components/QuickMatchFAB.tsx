import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation, useRoute } from "wouter";

/**
 * Bottom action bar with quick match recording button
 * Appears on all main app pages when user is authenticated
 * Opens the match recording dialog in the match page or navigates to the match page
 */
export default function QuickMatchFAB() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [isOnMatchPage] = useRoute('/matches');
  
  if (!user || isOnMatchPage) {
    return null; // Don't show FAB on match page or if not logged in
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

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 shadow-lg border-t border-gray-200 bg-white px-2 py-2">
      <div className="px-2">
        {/* Full-width Record Match Button */}
        <Button 
          onClick={handleRecordMatch}
          size="lg"
          className={`flex items-center justify-center h-16 rounded-xl w-full gap-2 ${buttonClass}`}
        >
          <PlusCircle className="h-6 w-6" />
          <span className="text-base font-medium">Record Match</span>
        </Button>
      </div>
    </div>
  );
}