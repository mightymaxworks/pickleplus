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
      <DialogContent className="sm:max-w-md max-h-[95vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="p-0 sm:p-0">
          <DialogTitle className="flex items-center justify-center gap-2 text-center font-bold text-lg sm:text-xl">
            <Sparkles className="h-5 w-5 text-[#FF5722]" /> 
            <span>Origin Story Unlocked!</span>
            <Sparkles className="h-5 w-5 text-[#FF5722]" />
          </DialogTitle>
          <DialogDescription className="text-center pt-1 sm:pt-2">
            You've discovered the hidden foundation of Pickle+
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-black/90 text-green-400 p-3 sm:p-4 rounded-md font-mono text-xs sm:text-sm space-y-2 sm:space-y-3 my-3 sm:my-4 overflow-y-auto max-h-[60vh]">
          <div className="text-white/70 uppercase text-[0.6rem] tracking-widest font-sans mb-1">
            [CLASSIFIED TRANSMISSION // P+_PROTO_CORE]
          </div>
          
          <p>Welcome, Traveler.</p>
          
          <p>You've just unlocked a hidden layer of the Pickle+ ecosystem — and with it, the origin story behind the platform you're now a part of.</p>
          
          <p className="font-semibold text-white/90">The Origin Protocol</p>
          
          <p>Pickle+ was never meant to be "just an app."<br/>
          It's a living, evolving ecosystem — built by players, for players.</p>
          
          <p>My name is Darren. I've walked many paths — as a professional tennis player, an Ironman triathlete, an international pickleball athlete, a coach, and an entrepreneur.</p>
          
          <p>Across all those worlds, I saw the same thing:<br/>
          Talent is everywhere. Opportunity is not.</p>
          
          <p>Tournaments were fragmented. Rankings were broken. Beginners got lost.<br/>
          There was no platform that embraced everyone — the grinders, the rookies, the dreamers, the legends.</p>
          
          <p>So we built Pickle+.</p>
          
          <p className="font-semibold text-white/90">A System for Everyone</p>
          
          <p>At the heart of Pickle+ is a unified system built to reflect the entire journey of a player:</p>
          
          <p>Rating shows your skill — updated as you play.</p>
          
          <p>Ranking shows your standing — by age, division, and event.</p>
          
          <p>XP tracks your growth — rewarding effort, not just victory.</p>
          
          <p>These three elements work together to create a fair, fun, and motivating ecosystem — one that adapts with you, no matter your level or location.</p>
          
          <p>Because greatness isn't defined by medals alone — it's in the consistency, the commitment, the showing up.</p>
          
          <p className="font-semibold text-white/90">The Passport System</p>
          
          <p>Your profile is more than stats. It's your passport to a global pickleball universe.</p>
          
          <p>Each game stamps your journey.<br/>
          Each event connects you with others.<br/>
          Each step unlocks more of what Pickle+ can offer — community, recognition, and purpose.</p>
          
          <p>This platform was created to include everyone —<br/>
          from first-time players discovering a new love,<br/>
          to professionals chasing gold on the world stage.</p>
          
          <p className="font-semibold text-white/90">The Alpha Moment</p>
          
          <p>You've discovered this message during our Alpha Phase — a moment in time where everything is just beginning.</p>
          
          <p>If you're reading this, you're early. You're part of the foundation.<br/>
          And we want to reward that.</p>
          
          <p className="font-semibold text-white/90">XP Bonus Code Unlocked</p>
          
          <div 
            ref={codeRef}
            className="bg-[#FF5722]/10 border border-[#FF5722]/30 text-[#FF5722] p-2 rounded flex items-center justify-between mt-2 sm:mt-3"
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
          <p>Reward: +100 XP (One-time Use)</p>
          
          <p className="font-semibold text-white/90">To redeem your XP:</p>
          
          <p>1. Log in (or register a new profile)<br/>
          2. Visit your Profile Page<br/>
          3. Enter the code in the Bonus Code Portal<br/>
          4. +100 XP will be added to your journey</p>
          
          <p className="font-semibold text-white/90">One Last Thing...</p>
          
          <p>Pickle+ will evolve with you — with every match played, every passport issued, and every connection made.</p>
          
          <p>This is more than a platform.<br/>
          It's the beginning of a new global language — spoken through spin, serve, and community.</p>
          
          <p>Keep playing. Keep growing.<br/>
          The court is bigger than you think.</p>
          
          <p className="text-white/60 text-xs">[End Transmission.]</p>
        </div>
        
        <DialogFooter className="sm:justify-center gap-2 pt-1 sm:pt-2">
          <Button 
            variant="default" 
            onClick={onClose}
            className="bg-[#FF5722] hover:bg-[#FF5722]/90 w-full sm:w-auto"
          >
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}