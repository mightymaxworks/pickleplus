/**
 * PKL-278651-GAME-0005-GOLD
 * Golden Ticket Admin Page
 * 
 * Admin interface for managing golden tickets, sponsors, and claims.
 */

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { getGoldenTickets, getClaims, getSponsors } from '../../core/modules/gamification/golden-ticket/api/goldenTicketApi';
import GoldenTicketForm from '../../core/modules/gamification/golden-ticket/components/admin/GoldenTicketForm';
import GoldenTicketList from '../../core/modules/gamification/golden-ticket/components/admin/GoldenTicketList';
import SponsorForm from '../../core/modules/gamification/golden-ticket/components/admin/SponsorForm';
import SponsorList from '../../core/modules/gamification/golden-ticket/components/admin/SponsorList';
import ClaimsList from '../../core/modules/gamification/golden-ticket/components/admin/ClaimsList';
import { Ticket, Users, Gift, BadgeDollarSign } from 'lucide-react';

const GoldenTicketAdmin: React.FC = () => {
  // Fetch golden tickets
  const { 
    data: tickets = [], 
    isLoading: isLoadingTickets,
    refetch: refetchTickets
  } = useQuery({
    queryKey: ['admin', 'golden-tickets'],
    queryFn: getGoldenTickets
  });

  // Fetch claims
  const { 
    data: claims = [], 
    isLoading: isLoadingClaims,
    refetch: refetchClaims
  } = useQuery({
    queryKey: ['admin', 'ticket-claims'],
    queryFn: getClaims
  });

  // Fetch sponsors
  const { 
    data: sponsors = [], 
    isLoading: isLoadingSponsors,
    refetch: refetchSponsors
  } = useQuery({
    queryKey: ['admin', 'sponsors'],
    queryFn: getSponsors
  });

  // Stats for overview
  const activeTickets = tickets.filter(ticket => ticket.status === 'active').length;
  const totalClaims = claims.length;
  const redemptionRate = tickets.length > 0 
    ? Math.round((totalClaims / tickets.reduce((acc, ticket) => acc + ticket.maxClaims, 0)) * 100) 
    : 0;
  const activeSponsors = sponsors.filter(sponsor => sponsor.active).length;

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Golden Ticket Management</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage promotional golden tickets
          </p>
        </div>
        <div className="flex items-center gap-2">
          <BadgeDollarSign className="h-8 w-8 text-yellow-500" />
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tickets.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {activeTickets} active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClaims}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Redemption rate: {redemptionRate}%
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sponsors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sponsors.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {activeSponsors} active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Latest Status</CardTitle>
            <BadgeDollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {claims.length > 0 ? "Active" : "No Activity"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Last claim: {claims.length > 0 ? new Date(claims[0].claimedAt).toLocaleDateString() : "N/A"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tickets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tickets" className="flex items-center gap-1">
            <Ticket className="h-4 w-4" />
            <span>Golden Tickets</span>
          </TabsTrigger>
          <TabsTrigger value="claims" className="flex items-center gap-1">
            <Gift className="h-4 w-4" />
            <span>Claims</span>
          </TabsTrigger>
          <TabsTrigger value="sponsors" className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>Sponsors</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="tickets" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Create Golden Ticket</CardTitle>
                <CardDescription>
                  Add a new golden ticket campaign
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GoldenTicketForm />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Manage Golden Tickets</CardTitle>
                <CardDescription>
                  View and update existing golden tickets
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GoldenTicketList tickets={tickets} isLoading={isLoadingTickets} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="claims" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Manage Claims</CardTitle>
              <CardDescription>
                View and process user claims for golden tickets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ClaimsList claims={claims} isLoading={isLoadingClaims} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sponsors" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Create Sponsor</CardTitle>
                <CardDescription>
                  Add a new sponsor for golden tickets
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SponsorForm />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Manage Sponsors</CardTitle>
                <CardDescription>
                  View and update existing sponsors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SponsorList sponsors={sponsors} isLoading={isLoadingSponsors} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GoldenTicketAdmin;