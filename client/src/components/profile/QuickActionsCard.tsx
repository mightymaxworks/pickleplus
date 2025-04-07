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
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Record Match Results</DialogTitle>
              </DialogHeader>
              <MatchRecordingForm onSuccess={() => setMatchDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}