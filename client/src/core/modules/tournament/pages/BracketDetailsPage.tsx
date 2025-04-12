/**
 * PKL-278651-TOURN-0001-BRCKT / PKL-278651-TOURN-0013-API
 * Bracket Details Page
 * 
 * This page displays the details and visualization of a tournament bracket.
 * Updated to use the dedicated tournament bracket API client for better API/UI alignment.
 */
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRoute, Link } from 'wouter';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  AlertCircle, 
  ChevronLeft, 
  Trophy, 
  Users, 
  Calendar, 
  ArrowRightLeft 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { LayoutContainer } from '@/components/layout/LayoutContainer';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { BracketVisualization } from '../components/BracketVisualization';
import { MatchesList } from '../components/MatchesList';
import { RecordMatchResultDialog } from '../components/RecordMatchResultDialog';
import { getBracket } from '../api';
import { BracketData } from '../types';

export function BracketDetailsPage() {
  // PKL-278651-TOURN-0011-ROUT: Update route path to align with App.tsx route definition
  const [, params] = useRoute('/admin/brackets/:id');
  console.log('[BracketDetailsPage][PKL-278651-TOURN-0011-ROUT] Route params:', params);
  const bracketId = params?.id ? parseInt(params.id) : 0;
  console.log('[BracketDetailsPage][PKL-278651-TOURN-0011-ROUT] Bracket ID:', bracketId);
  
  const [activeTab, setActiveTab] = useState('bracket');
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);
  const [isRecordResultDialogOpen, setIsRecordResultDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  
  // PKL-278651-TOURN-0013-API: Use dedicated API client for fetching bracket data
  const { 
    data: bracketData, 
    isLoading, 
    isError 
  } = useQuery({
    queryKey: [`bracket-${bracketId}`],
    queryFn: () => bracketId ? getBracket(bracketId) : Promise.reject('No bracket ID provided'),
    enabled: !!bracketId,
    retry: 1,
  });
  
  // Loading state
  if (isLoading) {
    return (
      <LayoutContainer className="max-w-6xl">
        <div className="space-y-6">
          <LoadingState />
        </div>
      </LayoutContainer>
    );
  }
  
  // Error state
  if (isError || !bracketData) {
    return (
      <LayoutContainer className="max-w-6xl">
        <div className="space-y-6">
          <div className="flex items-center mb-6">
            <Button onClick={() => window.history.back()} variant="ghost" className="gap-1">
              <ChevronLeft size={16} />
              <span>Back</span>
            </Button>
          </div>
          
          <ErrorState message="Failed to load bracket details" />
        </div>
      </LayoutContainer>
    );
  }
  
  const { bracket, rounds, matches } = bracketData;
  
  const getBracketTypeName = (type: string) => {
    switch (type) {
      case 'single_elimination':
        return 'Single Elimination';
      case 'double_elimination':
        return 'Double Elimination';
      case 'round_robin':
        return 'Round Robin';
      default:
        return type;
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const handleRecordResult = (matchId: number) => {
    setSelectedMatchId(matchId);
    setIsRecordResultDialogOpen(true);
  };
  
  // Find selected match details for the dialog
  const selectedMatch = matches?.find(match => match.id === selectedMatchId);
  
  // Get team information for the selected match
  const getTeamById = (teamId: number | null) => {
    if (!teamId) return null;
    // Look through all matches to find teams
    const team = matches?.flatMap(m => [
      m.team1 ? { id: m.team1Id, teamName: m.team1.teamName } : null,
      m.team2 ? { id: m.team2Id, teamName: m.team2.teamName } : null
    ])
    .filter(Boolean)
    .find(t => t?.id === teamId);
    
    return team || null;
  };
  
  return (
    <LayoutContainer className="max-w-6xl">
      <div className="space-y-6">
        <div className="flex items-center mb-6">
          <Button 
            onClick={() => {
              // PKL-278651-TOURN-0011-ROUT: Improved navigation back to tournament details
              if (bracket && bracket.tournamentId) {
                // Navigate to the tournament details page with the correct tournament ID
                console.log(`[BracketDetailsPage][PKL-278651-TOURN-0011-ROUT] Navigating back to tournament ${bracket.tournamentId}`);
                window.location.href = `/admin/tournaments/${bracket.tournamentId}`;
              } else {
                // Fallback to history back if tournament ID is not available
                window.history.back();
              }
            }} 
            variant="ghost" 
            className="gap-1"
          >
            <ChevronLeft size={16} />
            <span>Back to tournament</span>
          </Button>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{bracket.name}</h1>
              {getStatusBadge(bracket.status)}
            </div>
            <p className="text-muted-foreground mt-1">
              {getBracketTypeName(bracket.bracketType)}
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-6 text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Trophy size={16} />
            <span>{getBracketTypeName(bracket.bracketType)}</span>
          </div>
          
          <div className="flex items-center gap-1 text-muted-foreground">
            <Users size={16} />
            <span>{bracket.teamsCount} teams</span>
          </div>
          
          <div className="flex items-center gap-1 text-muted-foreground">
            <ArrowRightLeft size={16} />
            <span>{bracket.roundsCount} rounds</span>
          </div>
          
          {bracket.startDate && bracket.endDate && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Calendar size={16} />
              <span>
                {new Date(bracket.startDate).toLocaleDateString()} - {new Date(bracket.endDate).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
        
        <Tabs defaultValue="bracket" onValueChange={setActiveTab} value={activeTab}>
          <TabsList className="grid grid-cols-2 w-[300px]">
            <TabsTrigger value="bracket">Bracket View</TabsTrigger>
            <TabsTrigger value="matches">Matches</TabsTrigger>
          </TabsList>
          
          <TabsContent value="bracket" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Bracket Visualization</CardTitle>
                <CardDescription>
                  View the current state of the tournament bracket
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-auto">
                  <BracketVisualization 
                    rounds={rounds} 
                    matches={matches} 
                    onRecordResult={handleRecordResult}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="matches" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Match Schedule</CardTitle>
                <CardDescription>
                  View and manage matches in this bracket
                </CardDescription>
              </CardHeader>
              <CardContent>
                {matches && matches.length > 0 ? (
                  <MatchesList 
                    matches={matches} 
                    onRecordResult={handleRecordResult}
                  />
                ) : (
                  <EmptyState 
                    title="No matches found"
                    description="This bracket has no matches yet"
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {selectedMatchId && (
        <RecordMatchResultDialog
          open={isRecordResultDialogOpen}
          onOpenChange={setIsRecordResultDialogOpen}
          matchId={selectedMatchId}
          team1={selectedMatch?.team1 || null}
          team2={selectedMatch?.team2 || null}
          onSuccess={() => {
            // Refetch bracket data on successful match recording
            queryClient.invalidateQueries({ queryKey: [`bracket-${bracketId}`] });
          }}
        />
      )}
    </LayoutContainer>
  );
}

function EmptyState({ 
  title, 
  description, 
}: { 
  title: string, 
  description: string, 
}) {
  return (
    <div className="text-center py-8">
      <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="text-muted-foreground mt-2">
        {description}
      </p>
    </div>
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
      
      <Skeleton className="h-[400px] w-full rounded-lg" />
    </div>
  );
}