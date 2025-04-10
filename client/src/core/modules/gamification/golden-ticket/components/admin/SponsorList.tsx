/**
 * PKL-278651-GAME-0005-GOLD
 * Sponsor List Component
 * 
 * Component for displaying the list of sponsors.
 */

import React from 'react';
import { Sponsor } from '@shared/golden-ticket.schema';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface SponsorListProps {
  sponsors: Sponsor[];
  isLoading: boolean;
}

const SponsorList: React.FC<SponsorListProps> = ({ sponsors, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  if (sponsors.length === 0) {
    return (
      <div className="text-center p-6 bg-gray-50 rounded-lg">
        <Users className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900">No sponsors</h3>
        <p className="mt-1 text-sm text-gray-500">
          No sponsors have been added yet.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
      {sponsors.map((sponsor) => (
        <Card key={sponsor.id}>
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={sponsor.logoPath || ''} alt={sponsor.name} />
                <AvatarFallback className="bg-blue-100 text-blue-800">
                  {sponsor.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{sponsor.name}</h3>
                  <Badge className={sponsor.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                    {sponsor.active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                
                {sponsor.description && (
                  <p className="text-sm text-gray-500 mt-1">{sponsor.description}</p>
                )}
                
                <div className="mt-2 space-y-1 text-xs text-gray-500">
                  {sponsor.contactEmail && (
                    <div>Email: {sponsor.contactEmail}</div>
                  )}
                  
                  {sponsor.website && (
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="px-0 h-auto text-xs text-blue-600"
                      asChild
                    >
                      <a 
                        href={sponsor.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center"
                      >
                        Visit website
                        <ExternalLink size={10} className="ml-1" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SponsorList;