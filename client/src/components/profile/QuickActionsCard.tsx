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
              <MatchRecordingForm onSuccess={() => setMatchDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}