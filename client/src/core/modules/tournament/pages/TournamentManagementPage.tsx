/**
 * PKL-278651-TOURN-0002-ADMIN
 * Tournament Management Page - Admin Integration
 * 
 * This page provides a UI for tournament admins to manage tournaments,
 * teams, and brackets. Integrated with the admin interface for consistent
 * look and feel according to the PKL-278651-ADMIN series.
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
import { AlertCircle, Calendar, Users, Award, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { TournamentList } from '../components/TournamentList';
import { CreateTournamentDialog } from '../components/CreateTournamentDialog';
import { Badge } from '@/components/ui/badge';
import { AdminLayout } from '@/modules/admin/components/AdminLayout';
import { LayoutContainer } from '@/components/layout/LayoutContainer';
import { Tournament } from '@shared/schema';

export function TournamentManagementPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  
  const { data: tournaments = [], isLoading, isError } = useQuery<Tournament[]>({
    queryKey: ['/api/tournaments'],
    retry: 1,
  });

  const upcomingTournaments = tournaments.filter((tournament) => {
    const tournamentDate = new Date(tournament.startDate);
    return tournamentDate > new Date();
  });

  const inProgressTournaments = tournaments.filter((tournament) => {
    const startDate = new Date(tournament.startDate);
    const endDate = new Date(tournament.endDate);
    const now = new Date();
    return startDate <= now && endDate >= now;
  });

  const pastTournaments = tournaments.filter((tournament) => {
    const endDate = new Date(tournament.endDate);
    return endDate < new Date();
  });

  return (
    <AdminLayout title="Tournament Management">
      <LayoutContainer className="max-w-6xl">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Tournament Management</h1>
              <p className="text-muted-foreground">
                Create and manage tournaments, brackets, and teams
              </p>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              Create Tournament
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Calendar size={18} className="text-primary" />
                  <span>Upcoming</span>
                  <Badge className="ml-2">{upcomingTournaments.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Tournaments that haven't started yet
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Users size={18} className="text-primary" />
                  <span>In Progress</span>
                  <Badge className="ml-2">{inProgressTournaments.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Currently active tournaments
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Award size={18} className="text-primary" />
                  <span>Completed</span>
                  <Badge className="ml-2">{pastTournaments.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Tournaments that have finished
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="all" onValueChange={setActiveTab} value={activeTab}>
            <TabsList className="grid grid-cols-4 md:w-[400px]">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="in-progress">In Progress</TabsTrigger>
              <TabsTrigger value="past">Completed</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-4">
              {isLoading ? (
                <LoadingState />
              ) : isError ? (
                <ErrorState />
              ) : tournaments.length ? (
                <TournamentList tournaments={tournaments} />
              ) : (
                <EmptyState onCreateClick={() => setIsCreateDialogOpen(true)} />
              )}
            </TabsContent>
            
            <TabsContent value="upcoming" className="mt-4">
              {isLoading ? (
                <LoadingState />
              ) : isError ? (
                <ErrorState />
              ) : upcomingTournaments.length ? (
                <TournamentList tournaments={upcomingTournaments} />
              ) : (
                <EmptyState 
                  message="No upcoming tournaments found"
                  onCreateClick={() => setIsCreateDialogOpen(true)} 
                />
              )}
            </TabsContent>
            
            <TabsContent value="in-progress" className="mt-4">
              {isLoading ? (
                <LoadingState />
              ) : isError ? (
                <ErrorState />
              ) : inProgressTournaments.length ? (
                <TournamentList tournaments={inProgressTournaments} />
              ) : (
                <EmptyState 
                  message="No tournaments currently in progress"
                  onCreateClick={() => setIsCreateDialogOpen(true)} 
                />
              )}
            </TabsContent>
            
            <TabsContent value="past" className="mt-4">
              {isLoading ? (
                <LoadingState />
              ) : isError ? (
                <ErrorState />
              ) : pastTournaments.length ? (
                <TournamentList tournaments={pastTournaments} />
              ) : (
                <EmptyState 
                  message="No completed tournaments found"
                  onCreateClick={() => setIsCreateDialogOpen(true)} 
                />
              )}
            </TabsContent>
          </Tabs>
        </div>
        
        <CreateTournamentDialog 
          open={isCreateDialogOpen} 
          onOpenChange={setIsCreateDialogOpen} 
        />
      </LayoutContainer>
    </AdminLayout>
  );
}

function EmptyState({ message = "No tournaments found", onCreateClick }: { message?: string, onCreateClick: () => void }) {
  return (
    <Card className="flex flex-col items-center justify-center text-center p-8">
      <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-xl font-semibold">{message}</h3>
      <p className="text-muted-foreground mt-2 mb-6">
        Get started by creating your first tournament
      </p>
      <Button onClick={onCreateClick}>Create Tournament</Button>
    </Card>
  );
}

function ErrorState() {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        Failed to load tournaments. Please try again later.
      </AlertDescription>
    </Alert>
  );
}

function LoadingState() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index} className="overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-80" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
            <div className="flex gap-4 mt-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}