/**
 * PKL-278651-COMM-0036-MEDIA-BULK
 * Community Media Bulk Operations Component
 * 
 * Provides UI for selecting multiple media items and performing bulk operations
 * such as delete, add to gallery, etc.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Trash2, 
  FolderPlus, 
  Tags, 
  Star, 
  X, 
  CheckSquare, 
  Square,
  AlertCircle
} from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { useMediaMutations } from '@/lib/hooks/useMedia';
import { useGalleries } from '@/lib/hooks/useGalleries';
import { queryClient } from '@/lib/queryClient';

interface Media {
  id: number;
  title: string;
  filePath: string;
  fileSizeBytes: number;
}

interface MediaBulkOperationsProps {
  communityId: number;
  mediaItems: Media[];
  onSelectionChange?: (selectedIds: number[]) => void;
}

export function MediaBulkOperations({ communityId, mediaItems, onSelectionChange }: MediaBulkOperationsProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [addToGalleryDialogOpen, setAddToGalleryDialogOpen] = useState(false);
  const [selectedGalleryId, setSelectedGalleryId] = useState<number | null>(null);

  // Import mutation hooks
  const { deleteMediaMutation } = useMediaMutations(communityId);
  const { data: galleries } = useGalleries(communityId);
  const { addMediaToGalleryMutation } = useMediaMutations(communityId);

  // Toggle selection mode
  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode);
    if (isSelectMode) {
      // Clear selections when exiting select mode
      setSelectedIds([]);
    }
  };

  // Toggle selection of an item
  const toggleItemSelection = (id: number) => {
    setSelectedIds(prevState => {
      if (prevState.includes(id)) {
        return prevState.filter(itemId => itemId !== id);
      } else {
        return [...prevState, id];
      }
    });
  };

  // Select all items
  const selectAll = () => {
    setSelectedIds(mediaItems.map(item => item.id));
  };

  // Deselect all items
  const deselectAll = () => {
    setSelectedIds([]);
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    setConfirmDelete(false);
    
    try {
      // Calculate total bytes to be deleted
      const bytesToDelete = mediaItems
        .filter(item => selectedIds.includes(item.id))
        .reduce((sum, item) => sum + (item.fileSizeBytes || 0), 0);
      
      // Perform the deletions sequentially
      for (const id of selectedIds) {
        await deleteMediaMutation.mutateAsync(id);
      }
      
      toast({
        title: "Media deleted",
        description: `Successfully deleted ${selectedIds.length} items (${formatBytes(bytesToDelete)})`,
      });
      
      // Clear selections after operation
      setSelectedIds([]);
      setIsSelectMode(false);
      
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/community/${communityId}/media`] });
      queryClient.invalidateQueries({ queryKey: [`/api/community/${communityId}/media/quota`] });
    } catch (error) {
      console.error('Bulk delete failed:', error);
      toast({
        title: "Delete failed",
        description: "There was an error deleting the selected items.",
        variant: "destructive",
      });
    }
  };

  // Handle adding items to gallery
  const handleAddToGallery = async () => {
    if (!selectedGalleryId) return;
    
    setAddToGalleryDialogOpen(false);
    
    try {
      // Add items to gallery sequentially
      for (const mediaId of selectedIds) {
        await addMediaToGalleryMutation.mutateAsync({
          galleryId: selectedGalleryId,
          mediaId
        });
      }
      
      toast({
        title: "Added to gallery",
        description: `Successfully added ${selectedIds.length} items to gallery`,
      });
      
      // Clear selections after operation
      setSelectedIds([]);
      setIsSelectMode(false);
      
      // Reset selected gallery
      setSelectedGalleryId(null);
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: [`/api/community/${communityId}/galleries/${selectedGalleryId}`] });
    } catch (error) {
      console.error('Add to gallery failed:', error);
      toast({
        title: "Operation failed",
        description: "There was an error adding items to the gallery.",
        variant: "destructive",
      });
    }
  };

  // Notify parent of selection changes
  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(selectedIds);
    }
  }, [selectedIds, onSelectionChange]);

  // Format bytes to human-readable string
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
  };

  const totalSize = mediaItems
    .filter(item => selectedIds.includes(item.id))
    .reduce((sum, item) => sum + (item.fileSizeBytes || 0), 0);

  return (
    <div className="w-full">
      {/* Selection bar that appears when in select mode */}
      {isSelectMode && (
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur p-2 mb-3 border rounded-md flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={selectAll}
              className="h-8"
            >
              <CheckSquare className="mr-1 h-4 w-4" />
              All
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={deselectAll}
              className="h-8"
              disabled={selectedIds.length === 0}
            >
              <Square className="mr-1 h-4 w-4" />
              None
            </Button>
            <Badge variant="secondary">
              {selectedIds.length} selected ({formatBytes(totalSize)})
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            {selectedIds.length > 0 && (
              <>
                <Button 
                  size="sm" 
                  variant="destructive"
                  className="h-8"
                  onClick={() => setConfirmDelete(true)}
                >
                  <Trash2 className="mr-1 h-4 w-4" />
                  Delete
                </Button>
                
                <Dialog open={addToGalleryDialogOpen} onOpenChange={setAddToGalleryDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      size="sm" 
                      variant="secondary"
                      className="h-8"
                    >
                      <FolderPlus className="mr-1 h-4 w-4" />
                      Add to Gallery
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add to Gallery</DialogTitle>
                      <DialogDescription>
                        Select a gallery to add the {selectedIds.length} selected item(s).
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="max-h-[300px] overflow-y-auto">
                      {galleries?.length ? (
                        <div className="space-y-2 mt-2">
                          {galleries.map(gallery => (
                            <div 
                              key={gallery.id}
                              className={`p-3 border rounded-md cursor-pointer transition-colors ${
                                selectedGalleryId === gallery.id ? 'bg-primary/10 border-primary' : 'hover:bg-muted'
                              }`}
                              onClick={() => setSelectedGalleryId(gallery.id)}
                            >
                              <h4 className="font-medium">{gallery.name}</h4>
                              {gallery.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2">{gallery.description}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-8 text-center text-muted-foreground">
                          <FolderPlus className="mx-auto h-10 w-10 mb-3 opacity-30" />
                          <p>No galleries found</p>
                          <p className="text-sm mt-1">Create a gallery first</p>
                        </div>
                      )}
                    </div>
                    
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setAddToGalleryDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleAddToGallery}
                        disabled={!selectedGalleryId || galleries?.length === 0}
                      >
                        Add to Gallery
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                
                {/* Add more bulk actions here */}
              </>
            )}
            
            <Button 
              size="sm" 
              variant="outline"
              className="h-8"
              onClick={toggleSelectMode}
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
          </div>
        </div>
      )}
      
      {/* Toggle select mode button */}
      {!isSelectMode && (
        <Button 
          size="sm" 
          variant="outline"
          className="mb-3"
          onClick={toggleSelectMode}
        >
          <CheckSquare className="mr-1 h-4 w-4" />
          Select Multiple
        </Button>
      )}
      
      {/* Confirmation dialog for delete */}
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedIds.length} item(s)? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 mt-2 p-3 bg-destructive/10 rounded-md">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p className="text-sm"><strong>{formatBytes(totalSize)}</strong> of storage will be freed up.</p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDelete(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={deleteMediaMutation.isPending}
            >
              {deleteMediaMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Hidden input to expose selection state */}
      <input 
        type="hidden" 
        id="selected-media-ids" 
        value={selectedIds.join(',')} 
      />
    </div>
  );
}

export function MediaSelectionOverlay({ 
  id, 
  isSelected, 
  onToggle 
}: { 
  id: number;
  isSelected: boolean;
  onToggle: (id: number) => void;
}) {
  return (
    <div 
      className={`absolute inset-0 z-10 transition-colors ${
        isSelected ? 'bg-primary/30 backdrop-blur-sm' : 'hover:bg-foreground/10'
      }`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle(id);
      }}
    >
      <div className="absolute top-2 right-2">
        {isSelected ? (
          <CheckSquare className="h-6 w-6 text-primary bg-background rounded-sm" />
        ) : (
          <Square className="h-6 w-6 text-muted-foreground opacity-70 hover:opacity-100" />
        )}
      </div>
    </div>
  );
}