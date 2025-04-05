import { CalendarClock, Trophy } from "lucide-react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  CardDescription
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface TournamentRegistration {
  id: number;
  name: string;
  date: string;
  location: string;
  checkedIn: boolean;
}

interface UpcomingTournamentsCardProps {
  tournaments?: TournamentRegistration[];
  isLoading?: boolean;
}

export function UpcomingTournamentsCard({ 
  tournaments = [], 
  isLoading = false 
}: UpcomingTournamentsCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-[#9C27B0]" /> 
            Upcoming Tournaments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (tournaments.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-[#9C27B0]" /> 
            Upcoming Tournaments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Trophy className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No upcoming tournaments</p>
            <Button variant="outline" className="mt-4" asChild>
              <Link to="/tournaments">Browse Tournaments</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <CalendarClock className="h-5 w-5 text-[#9C27B0]" /> 
          Upcoming Tournaments
        </CardTitle>
        <CardDescription>
          Your registered tournaments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tournaments.map((tournament, index) => (
            <div key={index} className="flex items-center p-3 rounded-lg border border-border">
              <div className="bg-[#9C27B0]/10 text-[#9C27B0] p-3 rounded-full mr-4">
                <Trophy className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="font-medium line-clamp-1">{tournament.name}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(tournament.date).toLocaleDateString()}
                </div>
              </div>
              <Badge className={tournament.checkedIn ? 'bg-[#4CAF50]' : 'bg-amber-500'}>
                {tournament.checkedIn ? 'Checked In' : 'Not Checked In'}
              </Badge>
            </div>
          ))}
          
          <Button variant="outline" className="w-full" asChild>
            <Link to="/tournaments">View All Tournaments</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}