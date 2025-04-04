import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Code } from "lucide-react";
import { useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface EasterEggModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EasterEggModal({ isOpen, onClose }: EasterEggModalProps) {
  const { toast } = useToast();
  const [codeCopied, setCodeCopied] = useState(false);
  const codeRef = useRef<HTMLDivElement>(null);
  
  // Function to copy the redemption code
  const copyCode = () => {
    navigator.clipboard.writeText("ALPHA100")
      .then(() => {
        setCodeCopied(true);
        toast({
          title: "Code copied!",
          description: "The redemption code has been copied to your clipboard.",
        });
      })
      .catch(() => {
        toast({
          title: "Failed to copy",
          description: "Please manually copy the code: ALPHA100",
          variant: "destructive",
        });
      });
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center gap-2 text-center font-bold text-xl">
            <Sparkles className="h-5 w-5 text-[#FF5722]" /> 
            <span>Secret Unlocked!</span>
            <Sparkles className="h-5 w-5 text-[#FF5722]" />
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            You've discovered a hidden layer of the Pickle+ universe
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-black/90 text-green-400 p-4 rounded-md font-mono text-sm space-y-3 my-4">
          <div className="text-white/70 uppercase text-[0.6rem] tracking-widest font-sans mb-1">
            CLASSIFIED TRANSMISSION [P+ PROTO-CORE]
          </div>
          <p>Welcome, Traveler. You've just unlocked a hidden layer of the Pickle+ network.</p>
          <p>Originally designed as a military-grade performance tracking system, Project Pickle was repurposed for civilian use in 2023.</p>
          <p>The gamification elements? Not just for fun. They're derived from classified behavioral science research on peak performance.</p>
          <p>Your participation helps us refine the system while you enjoy the game.</p>
          <p>As a token of appreciation for discovering this message, we've authorized a special bonus code for your account.</p>
          
          <div 
            ref={codeRef}
            className="bg-[#FF5722]/10 border border-[#FF5722]/30 text-[#FF5722] p-2 rounded flex items-center justify-between mt-3"
          >
            <code>ALPHA100</code>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 px-2 text-[#FF5722]" 
              onClick={copyCode}
            >
              <Code className="h-3.5 w-3.5 mr-1" />
              <span className="text-xs">{codeCopied ? 'Copied!' : 'Copy'}</span>
            </Button>
          </div>
          
          <p className="text-xs text-green-400/70 mt-4">
            [REMINDER: The above narrative is fictional and part of the Pickle+ gamification experience.]
          </p>
        </div>
        
        <DialogFooter className="sm:justify-center gap-2">
          <Button 
            variant="default" 
            onClick={onClose}
            className="bg-[#FF5722] hover:bg-[#FF5722]/90"
          >
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}