/**
 * PKL-278651-TOURN-0001-BRCKT
 * Tournament List Component
 * 
 * Displays a list of tournaments with key information and actions
 */

import { Link } from 'wouter';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

// Import the Tournament type from shared types file
import { Tournament } from '../types';

type TournamentListProps = {
  tournaments: Tournament[];
};

export function TournamentList({ tournaments }: TournamentListProps) {
  return (
    <div className="space-y-4">
      {tournaments.map((tournament) => (
        <TournamentCard key={tournament.id} tournament={tournament} />
      ))}
    </div>
  );
}

function TournamentCard({ tournament }: { tournament: Tournament }) {
  const startDate = new Date(tournament.startDate);
  const endDate = new Date(tournament.endDate);
  
  const formattedDateRange = startDate.toLocaleDateString() === endDate.toLocaleDateString()
    ? format(startDate, 'MMM d, yyyy')
    : `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`;
  
  const getTournamentStatusBadge = () => {
    const now = new Date();
    const isUpcoming = startDate > now;
    const isInProgress = startDate <= now && endDate >= now;
    const isPast = endDate < now;
    
    if (isUpcoming) {
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Upcoming</Badge>;
    } else if (isInProgress) {
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">In Progress</Badge>;
    } else if (isPast) {
      return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Completed</Badge>;
    }
    
    return <Badge variant="outline">{tournament.status}</Badge>;
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{tournament.name}</CardTitle>
            <p className="text-muted-foreground text-sm mt-1">{tournament.description}</p>
          </div>
          {getTournamentStatusBadge()}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Calendar size={16} />
            <span>{formattedDateRange}</span>
          </div>
          
          {tournament.location && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin size={16} />
              <span>{tournament.location}</span>
            </div>
          )}
          
          {tournament.participantsCount !== undefined && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Users size={16} />
              <span>{tournament.participantsCount} participants</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-0 flex justify-end">
        <Link to={`/admin/tournaments/${tournament.id}`}>
          <Button variant="outline" className="gap-1">
            <span>Manage</span>
            <ChevronRight size={16} />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}