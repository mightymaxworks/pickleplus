/**
 * PKL-278651-GAME-0005-GOLD
 * PKL-278651-GAME-0005-GOLD-SPDEL
 * Sponsor List Component
 * 
 * Component for displaying the list of sponsors with delete functionality.
 */

import React, { useState } from 'react';
import { Sponsor } from '@shared/golden-ticket.schema';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink, Users, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteSponsor } from '../../api/goldenTicketApi';

interface SponsorListProps {
  sponsors: Sponsor[];
  isLoading: boolean;
}

const SponsorList: React.FC<SponsorListProps> = ({ sponsors, isLoading }) => {
  const [sponsorToDelete, setSponsorToDelete] = useState<Sponsor | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Delete sponsor mutation following Framework 5.0 guidelines
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteSponsor(id),
    onSuccess: () => {
      // Properly invalidate cache to update UI immediately
      queryClient.invalidateQueries({ queryKey: ['admin', 'sponsors'] });
      
      toast({
        title: "Sponsor deleted",
        description: "The sponsor has been successfully deleted.",
        variant: "default",
      });
      
      // Close dialog and reset state
      setDialogOpen(false);
      setSponsorToDelete(null);
    },
    onError: (error) => {
      console.error("Error deleting sponsor:", error);
      toast({
        title: "Error",
        description: "Failed to delete sponsor. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Handle initiating sponsor deletion
  const handleDeleteClick = (sponsor: Sponsor) => {
    setSponsorToDelete(sponsor);
    setDialogOpen(true);
  };
  
  // Handle confirming sponsor deletion
  const handleConfirmDelete = () => {
    if (sponsorToDelete) {
      deleteMutation.mutate(sponsorToDelete.id);
    }
  };
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
    <>
      {/* Confirmation Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Sponsor</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {sponsorToDelete?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2 justify-end">
            <Button 
              variant="outline" 
              onClick={() => setDialogOpen(false)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Sponsor"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Sponsor Cards List */}
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
                    <div className="flex items-center gap-2">
                      <Badge className={sponsor.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                        {sponsor.active ? "Active" : "Inactive"}
                      </Badge>
                      
                      {/* Delete Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteClick(sponsor)}
                        aria-label={`Delete ${sponsor.name}`}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
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
    </>
  );
};

export default SponsorList;