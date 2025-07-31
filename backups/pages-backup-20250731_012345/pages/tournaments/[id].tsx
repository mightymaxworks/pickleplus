import { useRoute } from 'wouter';
import TournamentDetails from '@/components/tournament/TournamentDetails';

export default function TournamentDetailsPage() {
  const [, params] = useRoute('/tournaments/:id');
  const tournamentId = params?.id;

  if (!tournamentId) {
    return <div>Tournament ID is required</div>;
  }

  return (
    <div className="container py-8">
      <TournamentDetails tournamentId={tournamentId} />
    </div>
  );
}