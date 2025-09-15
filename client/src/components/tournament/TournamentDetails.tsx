import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { useLocation } from "wouter";
import WisePaymentForm from "@/components/payments/WisePaymentForm";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Calendar,
  MapPin,
  Trophy,
  Users,
  Clock,
  DollarSign,
  ScrollText,
  Star,
  ChevronLeft,
  Award,
  Loader2,
} from "lucide-react";

// Define tournament type based on our schema
interface Tournament {
  id: number;
  name: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  registrationStartDate: string | null;
  registrationEndDate: string | null;
  maxParticipants: number | null;
  currentParticipants: number;
  format: string;
  division: string;
  level: string;
  entryFee: number | null;
  prizePool: number | null;
  status: string;
  organizer: string | null;
  brackets: any[];
  currentRegistrations: number;
}

interface TournamentDetailsProps {
  tournamentId: string;
}

export default function TournamentDetails({ tournamentId }: TournamentDetailsProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [showPayment, setShowPayment] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  // Fetch tournament details
  const { data: tournament, isLoading, error } = useQuery({
    queryKey: ["/api/tournaments", tournamentId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/tournaments/${tournamentId}`);
      return await response.json() as Tournament;
    }
  });

  // Check if user is registered
  const { data: isRegistered, isLoading: isLoadingRegistration } = useQuery({
    queryKey: ["/api/tournaments", tournamentId, "registration"],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", `/api/tournaments/${tournamentId}/registration/check`);
        if (response.status === 200) {
          return true;
        }
        return false;
      } catch (error) {
        return false;
      }
    }
  });

  // Tournament registration mutation
  const registerMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/tournaments/${tournamentId}/register`);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Registration successful",
        description: "You are now registered for this tournament",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments", tournamentId] });
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments", tournamentId, "registration"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Tournament withdrawal mutation
  const withdrawMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", `/api/tournaments/${tournamentId}/register`);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Withdrawal successful",
        description: "You have been withdrawn from this tournament",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments", tournamentId] });
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments", tournamentId, "registration"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Withdrawal failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleRegister = () => {
    // Check if tournament has entry fee
    if (tournament?.entryFee && tournament.entryFee > 0 && !paymentCompleted) {
      // Show payment form for paid tournaments
      setShowPayment(true);
    } else {
      // Free tournament or payment already completed
      registerMutation.mutate();
    }
  };

  const handlePaymentSuccess = (paymentResult: any) => {
    console.log('Tournament entry payment successful:', paymentResult);
    setPaymentCompleted(true);
    setShowPayment(false);
    
    toast({
      title: "Payment Successful",
      description: "Your tournament entry fee has been processed. Completing registration...",
    });

    // Register for tournament with payment information
    registerTournamentWithPayment(paymentResult);
  };

  const handlePaymentError = (error: string) => {
    console.error('Tournament payment failed:', error);
    setShowPayment(false);
    toast({
      title: "Payment Failed",
      description: error || "There was an error processing your payment. Please try again.",
      variant: "destructive",
    });
  };

  const registerTournamentWithPayment = async (paymentResult: any) => {
    try {
      const response = await apiRequest("POST", `/api/tournaments/${tournamentId}/register`, {
        paymentData: {
          transactionId: paymentResult.transactionId || paymentResult.id,
          amount: tournament?.entryFee || 0,
          currency: 'USD',
          paymentMethod: 'wise'
        }
      });
      
      if (response.ok) {
        toast({
          title: "Registration successful",
          description: "You have been successfully registered for this tournament with payment processed.",
        });
        queryClient.invalidateQueries({ queryKey: ["/api/tournaments", tournamentId] });
        queryClient.invalidateQueries({ queryKey: ["/api/tournaments", tournamentId, "registration"] });
      } else {
        throw new Error('Registration failed after payment');
      }
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "Payment was processed but registration failed. Please contact support.",
        variant: "destructive",
      });
    }
  };

  const handleWithdraw = () => {
    withdrawMutation.mutate();
  };

  const formatLabel = (format: string): string => {
    switch(format) {
      case "single_elimination": return "Single Elimination";
      case "double_elimination": return "Double Elimination";
      case "round_robin": return "Round Robin";
      case "round_robin_to_bracket": return "Round Robin to Bracket";
      default: return format;
    }
  };

  const tierLabel = (tier: string): string => {
    switch(tier) {
      case "club": return "Club";
      case "district": return "District";
      case "city": return "City";
      case "provincial": return "Provincial";
      case "national": return "National";
      case "regional": return "Regional";
      case "international": return "International";
      default: return tier;
    }
  };

  const getTierMultiplier = (tier: string): string => {
    switch(tier) {
      case "club": return "1.2x";
      case "district": return "1.5x";
      case "city": return "1.8x";
      case "provincial": return "2.0x";
      case "national": return "2.5x";
      case "regional": return "3.0x";
      case "international": return "4.0x";
      default: return "";
    }
  };

  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch(status) {
      case "upcoming": return "default";
      case "in_progress": return "secondary";
      case "completed": return "outline";
      case "cancelled": return "destructive";
      default: return "outline";
    }
  };

  const isRegistrationOpen = (): boolean => {
    if (!tournament) return false;
    
    const now = new Date();
    const regStartDate = tournament.registrationStartDate ? new Date(tournament.registrationStartDate) : null;
    const regEndDate = tournament.registrationEndDate ? new Date(tournament.registrationEndDate) : null;
    
    if (!regStartDate || !regEndDate) return false;
    
    return now >= regStartDate && now <= regEndDate;
  };

  const getRegistrationStatus = (): string => {
    if (!tournament) return "Not available";
    
    const now = new Date();
    const regStartDate = tournament.registrationStartDate ? new Date(tournament.registrationStartDate) : null;
    const regEndDate = tournament.registrationEndDate ? new Date(tournament.registrationEndDate) : null;
    
    if (!regStartDate || !regEndDate) return "Not available";
    
    if (now < regStartDate) {
      return `Opens ${format(regStartDate, 'MMM d, yyyy')}`;
    } else if (now <= regEndDate) {
      return `Closes ${format(regEndDate, 'MMM d, yyyy')}`;
    } else {
      return "Closed";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setLocation("/tournaments")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Skeleton className="h-8 w-1/3" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/2 mb-2" />
            <Skeleton className="h-5 w-1/3" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-40 w-full rounded-lg" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Skeleton className="h-24 w-full rounded" />
                <Skeleton className="h-24 w-full rounded" />
                <Skeleton className="h-24 w-full rounded" />
                <Skeleton className="h-24 w-full rounded" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setLocation("/tournaments")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Tournament Details</h2>
        </div>
        <Card className="p-8 text-center">
          <CardHeader>
            <CardTitle>Error Loading Tournament</CardTitle>
            <CardDescription>
              The tournament could not be loaded. It may not exist or may have been deleted.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button onClick={() => setLocation("/tournaments")}>Return to Tournaments</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => setLocation("/tournaments")}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">Tournament Details</h2>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-start mb-6">
        <div>
          <div className="flex flex-wrap gap-2 mb-2">
            <Badge variant={getStatusBadgeVariant(tournament.status)}>
              {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
            </Badge>
            <Badge variant="outline" className="font-semibold">
              {tierLabel(tournament.level)} ({getTierMultiplier(tournament.level)})
            </Badge>
            <Badge variant="secondary">
              {tournament.division.charAt(0).toUpperCase() + tournament.division.slice(1)}
            </Badge>
          </div>
          <h1 className="text-3xl font-bold">{tournament.name}</h1>
          <div className="flex items-center mt-1 text-muted-foreground">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{tournament.location}</span>
          </div>
        </div>
        
        <div className="mt-4 md:mt-0">
          {isRegistered ? (
            <Button 
              variant="destructive" 
              onClick={handleWithdraw}
              disabled={!isRegistrationOpen() || withdrawMutation.isPending}
              className="min-w-[150px]"
            >
              {withdrawMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Withdraw
            </Button>
          ) : (
            <Button 
              onClick={handleRegister} 
              disabled={!isRegistrationOpen() || registerMutation.isPending}
              className="min-w-[150px]"
            >
              {registerMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Register
            </Button>
          )}
        </div>
      </div>
      
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="bracket">Bracket</TabsTrigger>
          <TabsTrigger value="participants">Participants</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tournament Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Date</h3>
                  </div>
                  <div className="text-sm pl-7">
                    {format(new Date(tournament.startDate), 'MMM d, yyyy')}
                    {tournament.startDate !== tournament.endDate && 
                      ` - ${format(new Date(tournament.endDate), 'MMM d, yyyy')}`}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Format</h3>
                  </div>
                  <div className="text-sm pl-7">
                    {formatLabel(tournament.format)}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Participants</h3>
                  </div>
                  <div className="text-sm pl-7">
                    {tournament.currentRegistrations} 
                    {tournament.maxParticipants && ` / ${tournament.maxParticipants}`}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Registration</h3>
                  </div>
                  <div className="text-sm pl-7">
                    {getRegistrationStatus()}
                  </div>
                </div>
                
                {tournament.entryFee && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">Entry Fee</h3>
                    </div>
                    <div className="text-sm pl-7">
                      ${tournament.entryFee}
                    </div>
                  </div>
                )}
                
                {tournament.prizePool && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">Prize Pool</h3>
                    </div>
                    <div className="text-sm pl-7">
                      ${tournament.prizePool}
                    </div>
                  </div>
                )}
                
                {tournament.organizer && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">Organizer</h3>
                    </div>
                    <div className="text-sm pl-7">
                      {tournament.organizer}
                    </div>
                  </div>
                )}
              </div>
              
              <Separator className="my-6" />
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <ScrollText className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Description</h3>
                </div>
                <div className="text-sm mt-2 whitespace-pre-line">
                  {tournament.description}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Ranking Points</CardTitle>
              <CardDescription>
                Points awarded for this tournament depend on how far you advance and the tier multiplier.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4">Round</th>
                      <th className="text-right py-2 px-4">Base Points</th>
                      <th className="text-right py-2 px-4">Tier Multiplier</th>
                      <th className="text-right py-2 px-4">Total Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="py-2 px-4">Round of 64</td>
                      <td className="text-right py-2 px-4">10</td>
                      <td className="text-right py-2 px-4">{getTierMultiplier(tournament.level)}</td>
                      <td className="text-right py-2 px-4 font-medium">
                        {Math.round(10 * parseFloat(getTierMultiplier(tournament.level)))}
                      </td>
                    </tr>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="py-2 px-4">Round of 32</td>
                      <td className="text-right py-2 px-4">15</td>
                      <td className="text-right py-2 px-4">{getTierMultiplier(tournament.level)}</td>
                      <td className="text-right py-2 px-4 font-medium">
                        {Math.round(15 * parseFloat(getTierMultiplier(tournament.level)))}
                      </td>
                    </tr>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="py-2 px-4">Round of 16</td>
                      <td className="text-right py-2 px-4">25</td>
                      <td className="text-right py-2 px-4">{getTierMultiplier(tournament.level)}</td>
                      <td className="text-right py-2 px-4 font-medium">
                        {Math.round(25 * parseFloat(getTierMultiplier(tournament.level)))}
                      </td>
                    </tr>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="py-2 px-4">Quarter-Finals</td>
                      <td className="text-right py-2 px-4">40</td>
                      <td className="text-right py-2 px-4">{getTierMultiplier(tournament.level)}</td>
                      <td className="text-right py-2 px-4 font-medium">
                        {Math.round(40 * parseFloat(getTierMultiplier(tournament.level)))}
                      </td>
                    </tr>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="py-2 px-4">Semi-Finals</td>
                      <td className="text-right py-2 px-4">60</td>
                      <td className="text-right py-2 px-4">{getTierMultiplier(tournament.level)}</td>
                      <td className="text-right py-2 px-4 font-medium">
                        {Math.round(60 * parseFloat(getTierMultiplier(tournament.level)))}
                      </td>
                    </tr>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="py-2 px-4">Finals</td>
                      <td className="text-right py-2 px-4">80</td>
                      <td className="text-right py-2 px-4">{getTierMultiplier(tournament.level)}</td>
                      <td className="text-right py-2 px-4 font-medium">
                        {Math.round(80 * parseFloat(getTierMultiplier(tournament.level)))}
                      </td>
                    </tr>
                    <tr className="border-b hover:bg-muted/50 bg-muted/30">
                      <td className="py-2 px-4 font-medium">Champion</td>
                      <td className="text-right py-2 px-4 font-medium">100</td>
                      <td className="text-right py-2 px-4 font-medium">{getTierMultiplier(tournament.level)}</td>
                      <td className="text-right py-2 px-4 font-bold">
                        {Math.round(100 * parseFloat(getTierMultiplier(tournament.level)))}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              {tournament.format === "round_robin" && (
                <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-medium mb-2">Round Robin Format Special Rules</h4>
                  <p className="text-sm">
                    In round robin tournaments, points are awarded based on:
                  </p>
                  <ul className="list-disc list-inside text-sm mt-1 space-y-1">
                    <li>3 points per match win</li>
                    <li>10% bonus for first place</li>
                    <li>5% bonus for second place</li>
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="bracket">
          <Card>
            <CardHeader>
              <CardTitle>Tournament Bracket</CardTitle>
              <CardDescription>
                {tournament.brackets && tournament.brackets.length > 0
                  ? "The tournament bracket is available."
                  : "The tournament bracket has not been generated yet."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tournament.brackets && tournament.brackets.length > 0 ? (
                <div className="text-center p-8">
                  <h3 className="text-lg font-semibold">Bracket Visualization</h3>
                  <p className="text-sm text-muted-foreground">
                    (Bracket visualization will be implemented in Sprint 3)
                  </p>
                </div>
              ) : (
                <div className="text-center p-8 border rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">No Bracket Available</h3>
                  <p className="text-sm text-muted-foreground">
                    The tournament bracket will be generated after the registration period closes or when the organizer manually creates it.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="participants">
          <Card>
            <CardHeader>
              <CardTitle>Participants</CardTitle>
              <CardDescription>
                {tournament.currentRegistrations > 0
                  ? `${tournament.currentRegistrations} registered participants`
                  : "No participants have registered yet."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center p-8">
                <h3 className="text-lg font-semibold mb-2">Participant List</h3>
                <p className="text-sm text-muted-foreground">
                  (Participant list will be implemented in Sprint 2)
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="results">
          <Card>
            <CardHeader>
              <CardTitle>Tournament Results</CardTitle>
              <CardDescription>
                {tournament.status === "completed" 
                  ? "The tournament has been completed. Results are available."
                  : "Results will be available after the tournament is completed."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center p-8 border rounded-lg">
                <h3 className="text-lg font-semibold mb-2">No Results Available</h3>
                <p className="text-sm text-muted-foreground">
                  Results will be published after matches are completed.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Payment Dialog */}
      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tournament Entry Fee</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">{tournament?.name}</h3>
              <p className="text-gray-600 mb-4">
                This tournament requires an entry fee of <strong>${tournament?.entryFee}</strong>
              </p>
              <div className="text-sm text-gray-500">
                Processing secure payment through Wise
              </div>
            </div>

            {tournament?.entryFee && (
              <WisePaymentForm
                amount={tournament.entryFee}
                currency="USD"
                paymentType="coach_session"
                recipientName={tournament.organizer || "Tournament Organizer"}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}