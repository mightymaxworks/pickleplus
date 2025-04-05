import { BadgePlus, TrendingUp, PlusCircle } from "lucide-react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CodeRedemptionForm } from "@/components/CodeRedemptionForm";
import { MatchRecordingForm } from "@/components/MatchRecordingForm";
import { 
  Dialog, 
  DialogTrigger, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";

interface QuickActionsCardProps {
  matchDialogOpen: boolean;
  setMatchDialogOpen: (open: boolean) => void;
}

export function QuickActionsCard({ 
  matchDialogOpen, 
  setMatchDialogOpen 
}: QuickActionsCardProps) {
  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Code Redemption Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <BadgePlus className="h-5 w-5 text-[#FF5722]" /> 
            Redeem Code
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CodeRedemptionForm />
        </CardContent>
      </Card>
      
      {/* Record Match Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[#2196F3]" /> 
            Record Match
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Dialog open={matchDialogOpen} onOpenChange={setMatchDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full bg-[#2196F3] hover:bg-[#1976D2]">
                <PlusCircle size={16} className="mr-2" /> Log Match Results
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Record Match Results</DialogTitle>
                </DialogHeader>
                
                <div className="bg-gradient-to-r from-orange-50 to-blue-50 p-4 rounded-lg border border-orange-100 shadow-sm my-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-[#FF5722] font-bold">COMING SOON</div>
                    <div className="bg-[#FF5722] text-white text-xs px-2 py-1 rounded-full">April 13</div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Transform Your Pickleball Journey</h3>
                  <p className="text-gray-700 mb-3">Our revolutionary match tracking system helps you dominate the court with data-driven insights.</p>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="flex items-start">
                      <div className="bg-[#4CAF50] rounded-full p-1 mr-2 mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="text-xs">Boost XP up to 100 points per match</div>
                    </div>
                    <div className="flex items-start">
                      <div className="bg-[#2196F3] rounded-full p-1 mr-2 mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="text-xs">Track performance progress visually</div>
                    </div>
                    <div className="flex items-start">
                      <div className="bg-[#FF5722] rounded-full p-1 mr-2 mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="text-xs">Unlock exclusive achievements</div>
                    </div>
                    <div className="flex items-start">
                      <div className="bg-[#9C27B0] rounded-full p-1 mr-2 mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="text-xs">Climb leaderboards & rankings</div>
                    </div>
                  </div>
                  <div className="text-center text-xs text-gray-500">Be the first to experience this game-changing feature, unlocking April 13, 1:00 AM SGT</div>
                </div>
                
                <DialogHeader className="hidden">
              </DialogHeader>
              <MatchRecordingForm onSuccess={() => setMatchDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}