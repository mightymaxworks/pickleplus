/**
 * PKL-278651-GAME-0005-GOLD
 * Golden Ticket Admin Page
 * 
 * Admin interface for managing golden tickets and sponsors.
 */

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  getAllGoldenTickets, 
  getAllSponsors,
  getTicketClaims 
} from '../../core/modules/gamification/golden-ticket/api/goldenTicketApi';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import GoldenTicketForm from '../../core/modules/gamification/golden-ticket/components/admin/GoldenTicketForm';
import GoldenTicketList from '../../core/modules/gamification/golden-ticket/components/admin/GoldenTicketList';
import SponsorForm from '../../core/modules/gamification/golden-ticket/components/admin/SponsorForm';
import SponsorList from '../../core/modules/gamification/golden-ticket/components/admin/SponsorList';
import ClaimsList from '../../core/modules/gamification/golden-ticket/components/admin/ClaimsList';

const GoldenTicketAdmin: React.FC = () => {
  // Fetch golden tickets
  const { data: tickets, isLoading: ticketsLoading } = useQuery({
    queryKey: ['admin', 'golden-tickets'],
    queryFn: getAllGoldenTickets
  });
  
  // Fetch sponsors
  const { data: sponsors, isLoading: sponsorsLoading } = useQuery({
    queryKey: ['admin', 'sponsors'],
    queryFn: getAllSponsors
  });
  
  // Fetch claims
  const { data: claims, isLoading: claimsLoading } = useQuery({
    queryKey: ['admin', 'ticket-claims'],
    queryFn: getTicketClaims
  });
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Golden Ticket Management</h1>
      
      <Tabs defaultValue="tickets">
        <TabsList className="mb-6">
          <TabsTrigger value="tickets">Tickets</TabsTrigger>
          <TabsTrigger value="sponsors">Sponsors</TabsTrigger>
          <TabsTrigger value="claims">Claims</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tickets">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Create New Golden Ticket</CardTitle>
                <CardDescription>
                  Configure a new golden ticket campaign for sponsors.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GoldenTicketForm sponsors={sponsors || []} />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Active Golden Tickets</CardTitle>
                <CardDescription>
                  Manage existing golden ticket campaigns.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GoldenTicketList tickets={tickets || []} isLoading={ticketsLoading} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="sponsors">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Add New Sponsor</CardTitle>
                <CardDescription>
                  Add a new sponsor for golden ticket campaigns.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SponsorForm />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Sponsors List</CardTitle>
                <CardDescription>
                  View and manage existing sponsors.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SponsorList sponsors={sponsors || []} isLoading={sponsorsLoading} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="claims">
          <Card>
            <CardHeader>
              <CardTitle>Ticket Claims</CardTitle>
              <CardDescription>
                View all ticket claims and manage redemptions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ClaimsList claims={claims || []} isLoading={claimsLoading} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GoldenTicketAdmin;