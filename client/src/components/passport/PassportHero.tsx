import { 
  IdCard, 
  Shield, 
  Target, 
  Award, 
  Crown,
  Eye,
  EyeOff,
  Copy,
  QrCode
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Types
export type PlayerTier = 'recreational' | 'competitive' | 'elite' | 'professional';

export interface PlayerData {
  id: string;
  name: string;
  tier: PlayerTier;
  rankingPoints: number;
  picklePoints: number;
  globalRank: number;
  localRank: number;
  avatar?: string;
  passportCode: string;
  recentChange: number;
  winRate: number;
  nextMilestone: {
    tier: string;
    pointsNeeded: number;
  };
}

// Passport Code Utilities
export function formatPassportCode(code: string): string {
  // Official passport codes have no hyphens (e.g., HVGN0BW0)
  return code;
}

export function maskPassportCode(code: string, revealed: boolean): string {
  if (revealed) return formatPassportCode(code);
  return code.length === 8 ? `••••${code.slice(4, 8)}` : '••••••••';
}

// Tier Configuration
export const tierConfig = {
  recreational: { name: 'Recreational', color: 'from-slate-500 to-slate-600', icon: Shield },
  competitive: { name: 'Competitive', color: 'from-blue-500 to-blue-600', icon: Target },
  elite: { name: 'Elite', color: 'from-purple-500 to-purple-600', icon: Award },
  professional: { name: 'Professional', color: 'from-orange-500 to-orange-600', icon: Crown },
};

// Enhanced tier styling with premium visual effects
export function getTierStyling(tier: PlayerTier) {
  const configs = {
    recreational: {
      gradient: 'from-slate-600 via-slate-700 to-slate-800',
      border: 'border-slate-500',
      glow: '',
      badge: 'bg-slate-600/80 text-slate-100',
      iconBg: 'from-slate-500 to-slate-600',
      accentColor: 'text-slate-300',
      priority: 'STANDARD'
    },
    competitive: {
      gradient: 'from-blue-600 via-blue-700 to-blue-800',
      border: 'border-blue-400',
      glow: 'shadow-lg shadow-blue-500/20',
      badge: 'bg-blue-600/80 text-blue-100',
      iconBg: 'from-blue-500 to-blue-600',
      accentColor: 'text-blue-300',
      priority: 'COMPETITIVE'
    },
    elite: {
      gradient: 'from-purple-600 via-purple-700 to-indigo-800',
      border: 'border-purple-400',
      glow: 'shadow-xl shadow-purple-500/30',
      badge: 'bg-purple-600/80 text-purple-100',
      iconBg: 'from-purple-500 to-purple-600',
      accentColor: 'text-purple-300',
      priority: 'ELITE'
    },
    professional: {
      gradient: 'from-orange-500 via-orange-600 to-red-700',
      border: 'border-orange-400',
      glow: 'shadow-2xl shadow-orange-500/40 ring-2 ring-orange-400/30',
      badge: 'bg-gradient-to-r from-orange-500 to-red-500 text-white',
      iconBg: 'from-orange-400 to-red-500',
      accentColor: 'text-orange-300',
      priority: 'PROFESSIONAL'
    }
  };
  return configs[tier];
}

// Component Props
interface PassportHeroProps {
  player: PlayerData;
  codeRevealed: boolean;
  onToggleReveal: () => void;
  onCopy: () => void;
  onShowQR: () => void;
}

// Passport Hero Component - Enhanced tier differentiation
export default function PassportHero({ 
  player, 
  codeRevealed, 
  onToggleReveal, 
  onCopy, 
  onShowQR 
}: PassportHeroProps) {
  const config = tierConfig[player.tier];
  const styling = getTierStyling(player.tier);
  const TierIcon = config.icon;
  const formattedCode = codeRevealed ? formatPassportCode(player.passportCode) : maskPassportCode(player.passportCode, false);

  return (
    <Card className={`p-6 bg-gradient-to-br ${styling.gradient} ${styling.border} ${styling.glow} mb-6 relative overflow-hidden`}>
      {/* Tier watermark/pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 right-4">
          <TierIcon className="h-24 w-24 text-white/20" />
        </div>
        <div className="absolute bottom-4 left-4 text-white/10 font-bold text-6xl">
          {styling.priority}
        </div>
      </div>
      
      <div className="relative z-10">
        <div className="text-center">
          {/* Enhanced Player Identity with tier prominence */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className={`w-16 h-16 bg-gradient-to-r ${styling.iconBg} rounded-full flex items-center justify-center border-2 border-white/30 shadow-lg`}>
              <TierIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white drop-shadow-lg">{player.name}</h2>
              <Badge className={`${styling.badge} px-4 py-2 text-lg font-semibold border-none shadow-md`}>
                {config.name} Player
              </Badge>
            </div>
          </div>

          {/* Enhanced Passport Code section */}
          <div className={`bg-black/30 backdrop-blur-sm rounded-xl p-6 mb-6 border ${styling.border} ${styling.glow}`}>
            <div className={`${styling.accentColor} text-sm mb-3 flex items-center justify-center gap-2 font-medium`}>
              <IdCard className="h-5 w-5" />
              Official Passport Code
            </div>
            
            {/* Large Segmented Code Display with tier styling */}
            <div className={`font-mono text-4xl md:text-5xl font-bold text-white tracking-[0.4em] mb-6 drop-shadow-lg ${styling.accentColor}`}>
              {formattedCode}
            </div>
            
            {/* Enhanced Action Buttons with tier colors */}
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleReveal}
                className={`${styling.accentColor} hover:text-white ${styling.border} hover:bg-white/10 backdrop-blur-sm`}
                data-testid="button-reveal-passport-code"
              >
                {codeRevealed ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                {codeRevealed ? 'Hide' : 'Reveal'}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={onCopy}
                className={`${styling.accentColor} hover:text-white ${styling.border} hover:bg-white/10 backdrop-blur-sm`}
                data-testid="button-copy-passport-code"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={onShowQR}
                className={`${styling.accentColor} hover:text-white ${styling.border} hover:bg-white/10 backdrop-blur-sm`}
                data-testid="button-show-qr-code"
              >
                <QrCode className="h-4 w-4 mr-2" />
                QR Code
              </Button>
            </div>
          </div>

          {/* Enhanced Performance KPIs with tier styling */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center border border-white/20">
              <div className="text-2xl font-bold text-white drop-shadow-lg" data-testid="text-global-rank">#{player.globalRank}</div>
              <div className={`${styling.accentColor} text-sm font-medium`}>Global Rank</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center border border-white/20">
              <div className="text-2xl font-bold text-white drop-shadow-lg" data-testid="text-win-rate">{Math.round(player.winRate * 100)}%</div>
              <div className={`${styling.accentColor} text-sm font-medium`}>Win Rate</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center border border-white/20">
              <div className="text-2xl font-bold text-white drop-shadow-lg" data-testid="text-ranking-points">{player.rankingPoints.toLocaleString()}</div>
              <div className={`${styling.accentColor} text-sm font-medium`}>Points</div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
