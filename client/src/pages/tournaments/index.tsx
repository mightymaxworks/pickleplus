import TournamentList from "@/components/tournament/TournamentList";

export default function TournamentsPage() {
  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Tournaments</h1>
        <p className="text-muted-foreground">Discover and register for upcoming tournaments in your area.</p>
      </div>
      <TournamentList />
    </div>
  );
}