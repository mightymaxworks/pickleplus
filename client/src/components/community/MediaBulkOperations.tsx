/**
 * PKL-278651-COMM-0036-MEDIA-BULK
 * Media Bulk Operations Component
 * 
 * Provides an interface for selecting and performing bulk operations on media items
 * such as adding to galleries, tagging, and deleting multiple items at once.
 * Optimized for mobile with persistent selection indicator.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Check, 
  X, 
  Trash2, 
  Tag, 
  FolderPlus, 
  Star,
  ChevronUp,
  ChevronDown,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useMediaQuery } from '@/hooks/use-media-query';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogClose,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerFooter
} from '@/components/ui/drawer';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { 
  Form, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormDescription 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Media, MediaType, useMediaMutations } from '@/lib/hooks/useMedia';
import { useGalleries, useGalleryMutations, Gallery } from '@/lib/hooks/useGalleries';

interface MediaBulkOperationsProps {
  communityId: number;
  mediaItems: Media[];
  onSelectionComplete?: () => void;
  onMediaUpdated?: () => void;
}

export function MediaBulkOperations({ 
  communityId, 
  mediaItems, 
  onSelectionComplete,
  onMediaUpdated
}: MediaBulkOperationsProps) {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isSelecting, setIsSelecting] = useState(false);
  const [actionPanelOpen, setActionPanelOpen] = useState(false);
  const [expandedPanel, setExpandedPanel] = useState<boolean>(false);
  
  const isMobile = useMediaQuery('(max-width: 640px)');
  const isTablet = useMediaQuery('(min-width: 641px) and (max-width: 1024px)');
  
  // Use hooks for media and gallery operations
  const { data: galleries } = useGalleries(communityId);
  const { 
    deleteMediaMutation, 
    updateMediaMutation 
  } = useMediaMutations(communityId);
  const { addMediaToGalleryMutation } = useGalleryMutations(communityId);
  
  const { toast } = useToast();
  
  // Count of selected items
  const selectedCount = selectedIds.size;
  
  // Toggle selection mode
  const toggleSelectionMode = () => {
    if (isSelecting) {
      // If exiting selection mode, clear selections
      setSelectedIds(new Set());
      if (onSelectionComplete) {
        onSelectionComplete();
      }
    }
    setIsSelecting(!isSelecting);
    setActionPanelOpen(false);
  };
  
  // Toggle selection of a media item
  const toggleSelection = (id: number) => {
    if (!isSelecting) return;
    
    const newSelectedIds = new Set(selectedIds);
    if (newSelectedIds.has(id)) {
      newSelectedIds.delete(id);
    } else {
      newSelectedIds.add(id);
    }
    setSelectedIds(newSelectedIds);
    
    // If selecting items, show the action panel
    if (newSelectedIds.size > 0 && !actionPanelOpen) {
      setActionPanelOpen(true);
    } else if (newSelectedIds.size === 0 && actionPanelOpen) {
      setActionPanelOpen(false);
    }
  };
  
  // Select all items
  const selectAll = () => {
    const allIds = new Set(mediaItems.map(item => item.id));
    setSelectedIds(allIds);
    setActionPanelOpen(true);
  };
  
  // Clear all selections
  const clearSelections = () => {
    setSelectedIds(new Set());
    setActionPanelOpen(false);
  };
  
  // Get selected media items
  const getSelectedItems = (): Media[] => {
    return mediaItems.filter(item => selectedIds.has(item.id));
  };
  
  // Handle delete operation
  const handleDelete = async () => {
    if (selectedIds.size === 0) return;
    
    // Confirm deletion
    if (!confirm(`Are you sure you want to delete ${selectedIds.size} items? This cannot be undone.`)) {
      return;
    }
    
    try {
      // Delete each selected item
      const promises = Array.from(selectedIds).map(id => 
        deleteMediaMutation.mutateAsync(id)
      );
      
      await Promise.all(promises);
      
      // Show success toast
      toast({
        title: "Media deleted",
        description: `Successfully deleted ${selectedIds.size} items`,
      });
      
      // Clear selections and update
      setSelectedIds(new Set());
      setActionPanelOpen(false);
      if (onMediaUpdated) onMediaUpdated();
      
    } catch (error) {
      toast({
        title: "Error deleting media",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };
  
  // Handle "Add to Gallery" operation
  const handleAddToGallery = async (galleryId: number) => {
    if (selectedIds.size === 0) return;
    
    try {
      // Add each selected item to the gallery
      const promises = Array.from(selectedIds).map(mediaId => 
        addMediaToGalleryMutation.mutateAsync({ galleryId, mediaId })
      );
      
      await Promise.all(promises);
      
      // Show success toast
      toast({
        title: "Added to gallery",
        description: `Added ${selectedIds.size} items to gallery`,
      });
      
      // Clear selections
      setSelectedIds(new Set());
      setActionPanelOpen(false);
      
    } catch (error) {
      toast({
        title: "Error adding to gallery",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };
  
  // Handle toggling featured status
  const handleToggleFeatured = async (isFeatured: boolean) => {
    if (selectedIds.size === 0) return;
    
    try {
      // Update each selected item
      const promises = Array.from(selectedIds).map(mediaId => 
        updateMediaMutation.mutateAsync({
          mediaId,
          data: { isFeatured }
        })
      );
      
      await Promise.all(promises);
      
      // Show success toast
      toast({
        title: isFeatured ? "Items featured" : "Items unfeatured",
        description: `Updated ${selectedIds.size} items`,
      });
      
      // Clear selections and update
      setSelectedIds(new Set());
      setActionPanelOpen(false);
      if (onMediaUpdated) onMediaUpdated();
      
    } catch (error) {
      toast({
        title: "Error updating media",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };
  
  // Schema for tag form
  const tagFormSchema = z.object({
    tags: z.string().min(1, "At least one tag is required")
  });
  
  // Form for tag operations
  const tagForm = useForm<z.infer<typeof tagFormSchema>>({
    resolver: zodResolver(tagFormSchema),
    defaultValues: {
      tags: ""
    }
  });
  
  // Handle adding tags
  const handleAddTags = async (data: z.infer<typeof tagFormSchema>) => {
    if (selectedIds.size === 0) return;
    
    const tags = data.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    
    if (tags.length === 0) {
      toast({
        title: "No valid tags",
        description: "Please enter at least one valid tag",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Update tags for each selected item
      // We need to get the current tags first, then merge with new ones
      const selectedItems = getSelectedItems();
      
      const promises = selectedItems.map(item => {
        // Create a new array with existing tags plus new ones
        const existingTags = item.tags || [];
        const mergedTags = [...new Set([...existingTags, ...tags])];
        
        return updateMediaMutation.mutateAsync({
          mediaId: item.id,
          data: { tags: mergedTags }
        });
      });
      
      await Promise.all(promises);
      
      // Show success toast
      toast({
        title: "Tags added",
        description: `Added tags to ${selectedIds.size} items`,
      });
      
      // Clear the form
      tagForm.reset();
      
      // Clear selections and update
      setSelectedIds(new Set());
      setActionPanelOpen(false);
      if (onMediaUpdated) onMediaUpdated();
      
    } catch (error) {
      toast({
        title: "Error adding tags",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };
  
  // Custom component for dialogs and drawers based on screen size
  const ResponsiveDialogOrDrawer = ({ 
    trigger, 
    title, 
    children,
    footer
  }: { 
    trigger: React.ReactNode; 
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
  }) => {
    if (isMobile) {
      return (
        <Drawer>
          <DrawerTrigger asChild>
            {trigger}
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>{title}</DrawerTitle>
            </DrawerHeader>
            <div className="px-4">
              {children}
            </div>
            {footer && (
              <DrawerFooter>
                {footer}
              </DrawerFooter>
            )}
          </DrawerContent>
        </Drawer>
      );
    }
    
    return (
      <Dialog>
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          {children}
          {footer && (
            <DialogFooter>
              {footer}
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    );
  };
  
  // Bulk Action Panel - shown when items are selected
  const BulkActionPanel = () => {
    if (!actionPanelOpen || selectedIds.size === 0) return null;
    
    return (
      <div className={`fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-lg 
        transition-all duration-300 transform ${expandedPanel ? 'translate-y-0' : 'translate-y-full'} 
        ${selectedIds.size > 0 ? 'block' : 'hidden'}`}
      >
        <div 
          className={`sticky top-0 left-0 right-0 p-2 bg-muted flex items-center justify-between
          border-b cursor-pointer`}
          onClick={() => setExpandedPanel(!expandedPanel)}
        >
          <div className="flex items-center space-x-2">
            <div className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center">
              {selectedCount}
            </div>
            <span className="font-medium">Selected items</span>
          </div>
          {expandedPanel ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
        </div>
        
        {expandedPanel && (
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="flex items-center justify-center"
                onClick={handleDelete}
                disabled={deleteMediaMutation.isPending}
              >
                {deleteMediaMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Delete
              </Button>
              
              <ResponsiveDialogOrDrawer
                trigger={
                  <Button variant="outline" className="flex items-center justify-center">
                    <Tag className="mr-2 h-4 w-4" />
                    Add Tags
                  </Button>
                }
                title="Add Tags"
                footer={
                  <div className="flex justify-end space-x-2">
                    <Button 
                      type="submit" 
                      form="tag-form"
                      disabled={updateMediaMutation.isPending}
                    >
                      {updateMediaMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="mr-2 h-4 w-4" />
                      )}
                      Apply Tags
                    </Button>
                  </div>
                }
              >
                <form id="tag-form" onSubmit={tagForm.handleSubmit(handleAddTags)}>
                  <div className="space-y-4 py-4">
                    <FormField
                      control={tagForm.control}
                      name="tags"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tags</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter tags, comma separated" 
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Example: outdoor, tournament, training
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  </div>
                </form>
              </ResponsiveDialogOrDrawer>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center justify-center">
                    <FolderPlus className="mr-2 h-4 w-4" />
                    Add to Gallery
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center">
                  {galleries && galleries.length > 0 ? (
                    galleries.map(gallery => (
                      <DropdownMenuItem 
                        key={gallery.id}
                        onClick={() => handleAddToGallery(gallery.id)}
                      >
                        {gallery.name}
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <DropdownMenuItem disabled>
                      No galleries found
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    Create New Gallery...
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button 
                variant="outline" 
                className="flex items-center justify-center"
                onClick={() => handleToggleFeatured(true)}
                disabled={updateMediaMutation.isPending}
              >
                {updateMediaMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Star className="mr-2 h-4 w-4" />
                )}
                Feature
              </Button>
            </div>
            
            <div className="flex justify-between pt-2 border-t">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={clearSelections}
              >
                Clear
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={selectAll}
              >
                Select All
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  // Floating selection count indicator (shown when panel is collapsed)
  const SelectionCountIndicator = () => {
    if (!actionPanelOpen || selectedIds.size === 0 || expandedPanel) return null;
    
    return (
      <div 
        className="fixed bottom-4 right-4 z-50 bg-primary text-primary-foreground rounded-full
          shadow-lg p-3 flex items-center justify-center cursor-pointer hover:opacity-90"
        onClick={() => setExpandedPanel(true)}
      >
        <span className="font-bold mr-1">{selectedCount}</span>
        <span className="text-xs">selected</span>
      </div>
    );
  };
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape key to exit selection mode
      if (e.key === 'Escape' && isSelecting) {
        toggleSelectionMode();
      }
      
      // Ctrl/Cmd + A to select all
      if ((e.ctrlKey || e.metaKey) && e.key === 'a' && isSelecting) {
        e.preventDefault();
        selectAll();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSelecting, mediaItems]);
  
  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <Button 
          variant={isSelecting ? "default" : "outline"}
          size="sm"
          onClick={toggleSelectionMode}
          className="flex items-center"
        >
          {isSelecting ? (
            <>
              <X className="mr-1 h-4 w-4" />
              Cancel
            </>
          ) : (
            <>
              <Check className="mr-1 h-4 w-4" />
              Select
            </>
          )}
        </Button>
        
        {isSelecting && (
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={selectAll}
            >
              Select All
            </Button>
            
            {selectedCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={clearSelections}
              >
                Clear
              </Button>
            )}
          </div>
        )}
      </div>
      
      {/* Render selected count on the parent component */}
      {selectedCount > 0 && (
        <div className="mb-4 p-2 bg-muted rounded-md">
          <span className="font-medium">{selectedCount} items selected</span>
        </div>
      )}
      
      {/* Selection count indicator - visible when scrolling on mobile */}
      <SelectionCountIndicator />
      
      {/* Bulk action panel */}
      <BulkActionPanel />
    </>
  );
}

export function MediaSelectionProvider({
  children,
  communityId,
  mediaItems,
  onMediaUpdated
}: {
  children: React.ReactNode;
  communityId: number;
  mediaItems: Media[];
  onMediaUpdated?: () => void;
}) {
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  
  // Toggle selection of a media item
  const toggleSelection = (id: number) => {
    if (!isSelecting) return;
    
    const newSelectedIds = new Set(selectedIds);
    if (newSelectedIds.has(id)) {
      newSelectedIds.delete(id);
    } else {
      newSelectedIds.add(id);
    }
    setSelectedIds(newSelectedIds);
  };
  
  // Check if an item is selected
  const isSelected = (id: number) => {
    return selectedIds.has(id);
  };
  
  const handleSelectionComplete = () => {
    setIsSelecting(false);
    setSelectedIds(new Set());
  };
  
  // Value to pass to context
  const contextValue = {
    isSelecting,
    setIsSelecting,
    selectedIds,
    toggleSelection,
    isSelected
  };
  
  return (
    <div>
      {isSelecting && (
        <MediaBulkOperations 
          communityId={communityId}
          mediaItems={mediaItems}
          onSelectionComplete={handleSelectionComplete}
          onMediaUpdated={onMediaUpdated}
        />
      )}
      
      {children}
    </div>
  );
}

export function MediaItem({
  item,
  isSelectable,
  isSelected,
  onSelect,
  onClick,
  className = ""
}: {
  item: Media;
  isSelectable?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <div 
      className={`relative rounded-md overflow-hidden border ${
        isSelected ? 'ring-2 ring-primary' : ''
      } ${className}`}
      onClick={(e) => {
        // If selectable and clicked directly (not on checkbox), select the item
        if (isSelectable && onSelect) {
          e.stopPropagation();
          onSelect();
        } else if (onClick) {
          onClick();
        }
      }}
    >
      {/* Media content */}
      {item.mediaType === MediaType.IMAGE && (
        <img 
          src={item.thumbnailPath || item.filePath} 
          alt={item.title} 
          className="w-full h-full object-cover aspect-square"
        />
      )}
      
      {item.mediaType === MediaType.VIDEO && (
        <div className="w-full h-full bg-muted aspect-square flex items-center justify-center">
          <div className="text-4xl">🎬</div>
        </div>
      )}
      
      {item.mediaType === MediaType.DOCUMENT && (
        <div className="w-full h-full bg-muted aspect-square flex items-center justify-center">
          <div className="text-4xl">📄</div>
        </div>
      )}
      
      {/* Selection overlay */}
      {isSelectable && (
        <div className="absolute top-2 left-2">
          <Checkbox 
            checked={isSelected}
            onCheckedChange={onSelect}
            onClick={(e) => e.stopPropagation()}
            className="h-5 w-5 border-2 bg-background/70"
          />
        </div>
      )}
      
      {/* Featured badge */}
      {item.isFeatured && (
        <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-sm">
          Featured
        </div>
      )}
    </div>
  );
}