import { useQuery } from '@tanstack/react-query';
import { CertificationCard } from '@/components/match/CertificationCard';
import { Card } from '@/components/ui/card';
import { ClipboardCheck, Loader2 } from 'lucide-react';
import { useUserData } from '@/contexts/UserDataContext';

export default function PendingCertifications() {
  const { userData } = useUserData();

  const { data: pendingMatches, isLoading, refetch } = useQuery({
    queryKey: ['/api/matches/pending-certification'],
    enabled: !!userData
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  const matches = (pendingMatches as any)?.matches || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-orange-500/20 rounded-lg">
            <ClipboardCheck className="h-6 w-6 text-orange-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Pending Certifications</h1>
            <p className="text-slate-400">Review and certify match scores</p>
          </div>
        </div>

        {/* Matches */}
        {matches.length === 0 ? (
          <Card className="p-12 bg-slate-800 border-slate-700 text-center">
            <ClipboardCheck className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">All Caught Up!</h3>
            <p className="text-slate-400">You have no pending match certifications.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {matches.map((match: any) => (
              <CertificationCard
                key={match.id}
                match={match}
                currentUserId={userData?.id || 0}
                onCertify={() => refetch()}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
