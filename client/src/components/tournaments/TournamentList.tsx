import { Tournament } from "@/lib/types";
import TournamentCard from "@/components/dashboard/TournamentCard";

interface TournamentListProps {
  tournaments: Tournament[];
  userTournaments: { tournament: Tournament; participant: any }[];
  onSelectTournament: (id: number) => void;
  registeredOnly?: boolean;
}

const TournamentList = ({ 
  tournaments, 
  userTournaments, 
  onSelectTournament,
  registeredOnly = false 
}: TournamentListProps) => {
  
  if (tournaments.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="text-4xl text-gray-300 mb-4">
          <i className="fas fa-trophy"></i>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {registeredOnly 
            ? "You haven't registered for any tournaments yet" 
            : "No tournaments available"}
        </h3>
        <p className="text-gray-500">
          {registeredOnly 
            ? "Browse upcoming tournaments and join the competition!" 
            : "Check back later for new tournaments."}
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tournaments.map((tournament) => {
        const userTournament = userTournaments.find(
          (ut) => ut.tournament.id === tournament.id
        );
        return (
          <div key={tournament.id} onClick={() => onSelectTournament(tournament.id)} className="cursor-pointer">
            <TournamentCard
              tournament={tournament}
              isRegistered={!!userTournament}
              userStatus={userTournament?.participant.status.toUpperCase()}
            />
          </div>
        );
      })}
    </div>
  );
};

export default TournamentList;
