/**
 * PKL-278651-TOURN-0001-BRCKT
 * Tournament Details Page
 * 
 * This page displays details for a specific tournament and allows
 * management of teams and brackets.
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRoute } from 'wouter';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Calendar, MapPin, Users, Trophy, ChevronLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { LayoutContainer } from '@/components/layout/LayoutContainer';
import { Link } from 'wouter';
import { format } from 'date-fns';
import { CreateBracketDialog } from '../components/CreateBracketDialog';
import { BracketsList } from '../components/BracketsList';
import { TeamsList } from '../components/TeamsList';
import { CreateTeamDialog } from '../components/CreateTeamDialog';

export function TournamentDetailsPage() {
  const [, params] = useRoute('/tournaments/:id');
  const tournamentId = params?.id ? parseInt(params.id) : null;
  
  const [activeTab, setActiveTab] = useState('overview');
  const [isCreateBracketDialogOpen, setIsCreateBracketDialogOpen] = useState(false);
  const [isCreateTeamDialogOpen, setIsCreateTeamDialogOpen] = useState(false);
  
  // Fetch tournament details
  const { 
    data: tournament, 
    isLoading: isLoadingTournament, 
    isError: isErrorTournament 
  } = useQuery({
    queryKey: [`/api/tournaments/${tournamentId}`],
    enabled: !!tournamentId,
    retry: 1,
  });
  
  // Fetch tournament brackets
  const { 
    data: brackets, 
    isLoading: isLoadingBrackets, 
    isError: isErrorBrackets 
  } = useQuery({
    queryKey: [`/api/tournaments/${tournamentId}/brackets`],
    enabled: !!tournamentId,
    retry: 1,
  });
  
  // Fetch tournament teams
  const { 
    data: teams, 
    isLoading: isLoadingTeams, 
    isError: isErrorTeams 
  } = useQuery({
    queryKey: [`/api/tournaments/${tournamentId}/teams`],
    enabled: !!tournamentId,
    retry: 1,
  });
  
  // Loading state
  if (isLoadingTournament) {
    return (
      <LayoutContainer className="max-w-6xl">
        <div className="space-y-6">
          <LoadingState />
        </div>
      </LayoutContainer>
    );
  }
  
  // Error state
  if (isErrorTournament || !tournament) {
    return (
      <LayoutContainer className="max-w-6xl">
        <div className="space-y-6">
          <div className="flex items-center mb-6">
            <Link to="/tournaments">
              <Button variant="ghost" className="gap-1">
                <ChevronLeft size={16} />
                <span>Back to tournaments</span>
              </Button>
            </Link>
          </div>
          
          <ErrorState message="Failed to load tournament details" />
        </div>
      </LayoutContainer>
    );
  }
  
  // Format tournament dates
  const startDate = new Date(tournament.startDate);
  const endDate = new Date(tournament.endDate);
  
  const formattedDateRange = startDate.toLocaleDateString() === endDate.toLocaleDateString()
    ? format(startDate, 'MMMM d, yyyy')
    : `${format(startDate, 'MMMM d')} - ${format(endDate, 'MMMM d, yyyy')}`;
  
  const getTournamentStatusBadge = () => {
    const now = new Date();
    const isUpcoming = startDate > now;
    const isInProgress = startDate <= now && endDate >= now;
    const isPast = endDate < now;
    
    if (isUpcoming) {
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Upcoming</Badge>;
    } else if (isInProgress) {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">In Progress</Badge>;
    } else if (isPast) {
      return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Completed</Badge>;
    }
    
    return <Badge>{tournament.status}</Badge>;
  };
  
  return (
    <LayoutContainer className="max-w-6xl">
      <div className="space-y-6">
        <div className="flex items-center mb-6">
          <Link to="/tournaments">
            <Button variant="ghost" className="gap-1">
              <ChevronLeft size={16} />
              <span>Back to tournaments</span>
            </Button>
          </Link>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{tournament.name}</h1>
              {getTournamentStatusBadge()}
            </div>
            <p className="text-muted-foreground mt-1">
              {tournament.description}
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-6 text-sm">
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
          
          <div className="flex items-center gap-1 text-muted-foreground">
            <Users size={16} />
            <span>{teams?.length || 0} teams</span>
          </div>
          
          <div className="flex items-center gap-1 text-muted-foreground">
            <Trophy size={16} />
            <span>{brackets?.length || 0} brackets</span>
          </div>
        </div>
        
        <Tabs defaultValue="overview" onValueChange={setActiveTab} value={activeTab}>
          <TabsList className="grid grid-cols-3 w-[400px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="brackets">Brackets</TabsTrigger>
            <TabsTrigger value="teams">Teams</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-primary" />
                    <span>Brackets</span>
                  </CardTitle>
                  <CardDescription>
                    Create and manage tournament brackets
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    {brackets?.length || 0} brackets created
                  </p>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => setIsCreateBracketDialogOpen(true)}>
                    Create Bracket
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <span>Teams</span>
                  </CardTitle>
                  <CardDescription>
                    Register teams for the tournament
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    {teams?.length || 0} teams registered
                  </p>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => setIsCreateTeamDialogOpen(true)}>
                    Add Team
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="brackets" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Tournament Brackets</h2>
              <Button onClick={() => setIsCreateBracketDialogOpen(true)}>
                Create Bracket
              </Button>
            </div>
            
            {isLoadingBrackets ? (
              <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : isErrorBrackets ? (
              <ErrorState message="Failed to load brackets" />
            ) : brackets?.length ? (
              <BracketsList brackets={brackets} tournamentId={tournamentId} />
            ) : (
              <EmptyState 
                title="No brackets yet"
                description="Create your first bracket to organize matches"
                actionLabel="Create Bracket"
                onAction={() => setIsCreateBracketDialogOpen(true)}
                icon={<Trophy className="h-12 w-12 text-muted-foreground" />}
              />
            )}
          </TabsContent>
          
          <TabsContent value="teams" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Registered Teams</h2>
              <Button onClick={() => setIsCreateTeamDialogOpen(true)}>
                Add Team
              </Button>
            </div>
            
            {isLoadingTeams ? (
              <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : isErrorTeams ? (
              <ErrorState message="Failed to load teams" />
            ) : teams?.length ? (
              <TeamsList teams={teams} tournamentId={tournamentId} />
            ) : (
              <EmptyState 
                title="No teams registered"
                description="Add teams to participate in the tournament"
                actionLabel="Add Team"
                onAction={() => setIsCreateTeamDialogOpen(true)}
                icon={<Users className="h-12 w-12 text-muted-foreground" />}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Dialogs */}
      {tournamentId && (
        <>
          <CreateBracketDialog
            open={isCreateBracketDialogOpen}
            onOpenChange={setIsCreateBracketDialogOpen}
            tournamentId={tournamentId}
            teams={teams || []}
          />
          
          <CreateTeamDialog
            open={isCreateTeamDialogOpen}
            onOpenChange={setIsCreateTeamDialogOpen}
            tournamentId={tournamentId}
          />
        </>
      )}
    </LayoutContainer>
  );
}

function EmptyState({ 
  title, 
  description, 
  actionLabel, 
  onAction, 
  icon 
}: { 
  title: string, 
  description: string, 
  actionLabel: string, 
  onAction: () => void,
  icon: React.ReactNode
}) {
  return (
    <Card className="flex flex-col items-center justify-center text-center p-8">
      {icon}
      <h3 className="text-xl font-semibold mt-4">{title}</h3>
      <p className="text-muted-foreground mt-2 mb-6">
        {description}
      </p>
      <Button onClick={onAction}>{actionLabel}</Button>
    </Card>
  );
}

function ErrorState({ message = "An error occurred" }: { message?: string }) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        {message}. Please try again later.
      </AlertDescription>
    </Alert>
  );
}

function LoadingState() {
  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <Skeleton className="h-10 w-40" />
      </div>
      
      <div className="space-y-2">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      
      <div className="flex gap-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-32" />
      </div>
      
      <Skeleton className="h-10 w-full" />
      
      <div className="space-y-4">
        <Skeleton className="h-40 w-full rounded-lg" />
        <Skeleton className="h-40 w-full rounded-lg" />
      </div>
    </div>
  );
}