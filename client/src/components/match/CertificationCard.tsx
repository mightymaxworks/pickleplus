import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertCircle, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { formatDistanceToNow } from 'date-fns';

interface CertificationCardProps {
  match: any;
  currentUserId: number;
  onCertify?: () => void;
}

export function CertificationCard({ match, currentUserId, onCertify }: CertificationCardProps) {
  const [isCertifying, setIsCertifying] = useState(false);
  const { toast } = useToast();

  const expiresAt = match.certificationExpiresAt ? new Date(match.certificationExpiresAt) : null;
  const isExpired = expiresAt && new Date() > expiresAt;
  const timeRemaining = expiresAt ? formatDistanceToNow(expiresAt, { addSuffix: true }) : null;

  const players = [
    { id: match.playerOneId, name: 'Player 1', certified: match.playerOneCertified },
    { id: match.playerTwoId, name: 'Player 2', certified: match.playerTwoCertified },
    match.playerOnePartnerId && { id: match.playerOnePartnerId, name: 'Player 1 Partner', certified: match.playerOnePartnerCertified },
    match.playerTwoPartnerId && { id: match.playerTwoPartnerId, name: 'Player 2 Partner', certified: match.playerTwoPartnerCertified }
  ].filter(Boolean);

  const currentUserCertified = players.find(p => p.id === currentUserId)?.certified || false;
  const allCertified = players.every(p => p.certified);
  const certifiedCount = players.filter(p => p.certified).length;

  const handleCertify = async () => {
    if (currentUserCertified) {
      toast({
        title: "Already Certified",
        description: "You have already certified this match.",
        variant: "default"
      });
      return;
    }

    setIsCertifying(true);

    try {
      const response: any = await apiRequest(`/api/matches/${match.id}/certify`, 'POST');

      toast({
        title: "Score Certified",
        description: response.allCertified 
          ? "All players have certified! Points awarded." 
          : "Your certification recorded. Waiting for other players.",
        variant: "default"
      });

      onCertify?.();
    } catch (error: any) {
      toast({
        title: "Certification Failed",
        description: error.message || "Failed to certify match score",
        variant: "destructive"
      });
    } finally {
      setIsCertifying(false);
    }
  };

  return (
    <Card className="p-4 bg-slate-800 border-slate-700" data-testid={`cert-card-${match.id}`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-bold">Match #{match.serial}</h3>
            <p className="text-sm text-slate-400">
              {new Date(match.matchDate).toLocaleDateString()}
            </p>
          </div>

          {allCertified ? (
            <Badge className="bg-green-500/20 text-green-400 border-green-500">
              <CheckCircle className="h-3 w-3 mr-1" />
              Certified
            </Badge>
          ) : isExpired ? (
            <Badge className="bg-red-500/20 text-red-400 border-red-500">
              <AlertCircle className="h-3 w-3 mr-1" />
              Expired
            </Badge>
          ) : (
            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500">
              <Clock className="h-3 w-3 mr-1" />
              Pending
            </Badge>
          )}
        </div>

        {/* Score */}
        <div className="flex items-center justify-center gap-4 p-3 bg-slate-700/50 rounded-lg">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{match.scorePlayerOne}</p>
            <p className="text-xs text-slate-400">Team 1</p>
          </div>
          <div className="text-slate-500 text-xl">-</div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{match.scorePlayerTwo}</p>
            <p className="text-xs text-slate-400">Team 2</p>
          </div>
        </div>

        {/* Certification Status */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Users className="h-4 w-4" />
            <span>Certification Status ({certifiedCount}/{players.length})</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {players.map((player, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-2 p-2 rounded-lg ${
                  player.certified ? 'bg-green-500/10' : 'bg-slate-700/50'
                }`}
                data-testid={`player-cert-${player.id}`}
              >
                {player.certified ? (
                  <CheckCircle className="h-4 w-4 text-green-400" />
                ) : (
                  <Clock className="h-4 w-4 text-slate-500" />
                )}
                <span className={`text-sm ${player.certified ? 'text-green-400' : 'text-slate-400'}`}>
                  {player.id === currentUserId ? 'You' : player.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Time Remaining */}
        {!isExpired && !allCertified && timeRemaining && (
          <div className="flex items-center gap-2 text-sm text-orange-400 bg-orange-500/10 p-2 rounded-lg">
            <Clock className="h-4 w-4" />
            <span>Expires {timeRemaining}</span>
          </div>
        )}

        {/* Certify Button */}
        {!isExpired && !currentUserCertified && !allCertified && (
          <Button
            onClick={handleCertify}
            disabled={isCertifying}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            data-testid={`button-certify-${match.id}`}
          >
            {isCertifying ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Certifying...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Certify This Score
              </>
            )}
          </Button>
        )}

        {currentUserCertified && !allCertified && (
          <div className="text-center text-sm text-green-400 p-2 bg-green-500/10 rounded-lg">
            ✓ You've certified. Waiting for other players.
          </div>
        )}
      </div>
    </Card>
  );
}
