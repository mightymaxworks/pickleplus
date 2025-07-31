import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'wouter';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import QRScanner from '@/components/scanner/QRScanner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tournament } from '@/types';

export default function TournamentCheckIn() {
  const { id } = useParams();
  const tournamentId = parseInt(id || '0');
  const [checkInComplete, setCheckInComplete] = useState(false);
  
  // Fetch tournament details
  const { data: tournament, isLoading } = useQuery<Tournament>({
    queryKey: [`/api/tournaments/${tournamentId}`],
    enabled: !!tournamentId,
  });
  
  // If the tournament ID is invalid
  if (!tournamentId) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Invalid Tournament</CardTitle>
            <CardDescription>
              No tournament ID was provided or the ID is invalid.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pt-4">
            <Link href="/tournaments">
              <Button>View All Tournaments</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Success screen after check-in
  if (checkInComplete) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle2 className="mr-2 text-primary h-6 w-6" />
              Check-In Successful
            </CardTitle>
            <CardDescription>
              The player has been successfully checked in to the tournament.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 items-center pt-4">
            <p className="text-center">
              You can continue checking in more players or return to the tournament page.
            </p>
            <div className="flex gap-4">
              <Button 
                variant="outline" 
                onClick={() => setCheckInComplete(false)}
              >
                Check In Another Player
              </Button>
              <Link href={`/tournaments/${tournamentId}`}>
                <Button>Return to Tournament</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6">
        <Link href={`/tournaments/${tournamentId}`}>
          <Button variant="ghost" className="pl-0">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tournament
          </Button>
        </Link>
      </div>
      
      <h1 className="text-2xl font-bold mb-6">Tournament Check-In</h1>
      
      {isLoading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-2/3 mb-2" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      ) : tournament ? (
        <>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{tournament.name}</CardTitle>
              <CardDescription>
                {new Date(tournament.startDate).toLocaleDateString()} • {tournament.location}
              </CardDescription>
            </CardHeader>
          </Card>
          
          <QRScanner 
            tournamentId={tournamentId} 
            onSuccess={() => setCheckInComplete(true)}
          />
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Tournament Not Found</CardTitle>
            <CardDescription>
              The tournament you are looking for could not be found.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pt-4">
            <Link href="/tournaments">
              <Button>View All Tournaments</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}