import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, MapPin, Users, Trophy, Calendar, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

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
}

export default function TournamentList() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>("upcoming");
  const [formatFilter, setFormatFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [divisionFilter, setDivisionFilter] = useState<string>("");
  const [tierFilter, setTierFilter] = useState<string>("");
  
  // Check if user is an admin - use isAdmin property directly
  const isAdmin = !!user?.isAdmin;
  
  // Fetch tournaments
  const { data: tournaments, isLoading, error } = useQuery({
    queryKey: ["/api/tournaments", statusFilter, formatFilter, categoryFilter, divisionFilter, tierFilter],
    queryFn: async () => {
      // Build query params
      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);
      if (formatFilter) params.append("format", formatFilter);
      if (categoryFilter && categoryFilter !== "any") params.append("category", categoryFilter);
      if (divisionFilter && divisionFilter !== "any") params.append("division", divisionFilter);
      if (tierFilter && tierFilter !== "any") params.append("tier", tierFilter);
      
      const response = await apiRequest(
        "GET", 
        `/api/tournaments?${params.toString()}`
      );
      return await response.json() as Tournament[];
    }
  });

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

  const handleTournamentClick = (id: number) => {
    setLocation(`/tournaments/${id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tournaments</h2>
          <p className="text-muted-foreground">
            Browse and register for upcoming tournaments
          </p>
        </div>
        {isAdmin && (
          <Button 
            onClick={() => setLocation("/tournaments/create")}
            className="shrink-0"
          >
            Create Tournament
          </Button>
        )}
      </div>
      
      <Tabs defaultValue="upcoming" onValueChange={(value) => setStatusFilter(value)}>
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="bg-muted/40 p-4 rounded-lg">
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="grid gap-2 flex-1">
            <label className="text-sm font-medium">Search</label>
            <Input placeholder="Search tournaments..." />
          </div>
          
          <div className="grid gap-2 w-full sm:w-[150px]">
            <label className="text-sm font-medium">Format</label>
            <Select value={formatFilter} onValueChange={setFormatFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Any Format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Format</SelectItem>
                <SelectItem value="single_elimination">Single Elimination</SelectItem>
                <SelectItem value="double_elimination">Double Elimination</SelectItem>
                <SelectItem value="round_robin">Round Robin</SelectItem>
                <SelectItem value="round_robin_to_bracket">Round Robin to Bracket</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2 w-full sm:w-[150px]">
            <label className="text-sm font-medium">Division</label>
            <Select value={divisionFilter} onValueChange={setDivisionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Any Division" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Division</SelectItem>
                <SelectItem value="singles">Singles</SelectItem>
                <SelectItem value="doubles">Doubles</SelectItem>
                <SelectItem value="mixed">Mixed Doubles</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2 w-full sm:w-[150px]">
            <label className="text-sm font-medium">Tier</label>
            <Select value={tierFilter} onValueChange={setTierFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Any Tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Tier</SelectItem>
                <SelectItem value="club">Club</SelectItem>
                <SelectItem value="district">District</SelectItem>
                <SelectItem value="city">City</SelectItem>
                <SelectItem value="provincial">Provincial</SelectItem>
                <SelectItem value="national">National</SelectItem>
                <SelectItem value="regional">Regional</SelectItem>
                <SelectItem value="international">International</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button variant="outline" size="icon" className="shrink-0">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-5 w-1/2" />
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-28" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-lg border p-8 text-center">
          <h3 className="text-lg font-semibold">Error loading tournaments</h3>
          <p className="text-muted-foreground">Please try again later</p>
        </div>
      ) : tournaments && tournaments.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {tournaments.map((tournament) => (
            <Card 
              key={tournament.id} 
              className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleTournamentClick(tournament.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <Badge variant={getStatusBadgeVariant(tournament.status)}>
                    {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
                  </Badge>
                  <Badge variant="outline" className="font-semibold">
                    {tierLabel(tournament.level)} ({getTierMultiplier(tournament.level)})
                  </Badge>
                </div>
                <CardTitle className="text-xl mt-2">{tournament.name}</CardTitle>
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 mr-1" />
                  <span>{tournament.location}</span>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div className="text-sm">
                      {format(new Date(tournament.startDate), 'MMM d, yyyy')}
                      {tournament.startDate !== tournament.endDate && 
                        ` - ${format(new Date(tournament.endDate), 'MMM d, yyyy')}`}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                    <div className="text-sm">{formatLabel(tournament.format)} • {tournament.division}</div>
                  </div>
                  {tournament.maxParticipants && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <div className="text-sm">
                        {tournament.currentParticipants} / {tournament.maxParticipants} participants
                      </div>
                    </div>
                  )}
                </div>
                <Separator className="my-2" />
                <div className="line-clamp-2 text-sm text-muted-foreground">
                  {tournament.description}
                </div>
              </CardContent>
              <CardFooter className="pt-2">
                <Button variant="outline" className="w-full">
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border p-8 text-center">
          <h3 className="text-lg font-semibold">No tournaments found</h3>
          <p className="text-muted-foreground">
            {statusFilter === "upcoming" 
              ? "There are no upcoming tournaments scheduled."
              : statusFilter === "in_progress"
                ? "There are no tournaments currently in progress."
                : "There are no completed tournaments."}
          </p>
        </div>
      )}
    </div>
  );
}