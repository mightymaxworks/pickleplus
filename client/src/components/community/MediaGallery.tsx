/**
 * PKL-278651-COMM-0036-MEDIA
 * Media Gallery Component
 * 
 * Displays a responsive grid of community media items with filtering,
 * lazy loading, and interactive features like selecting and preview.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-20
 */

import { useState, useMemo } from "react";
import { useMedia, MediaFilter } from "@/lib/hooks/useMedia";
import { Media, MediaType } from "@shared/schema/media";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Image as ImageIcon, 
  Video, 
  FileText, 
  MoreVertical,
  Download,
  Trash2,
  Plus,
  Filter,
  RefreshCw,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input"; 
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface MediaGalleryProps {
  communityId: number;
  selectable?: boolean;
  onSelect?: (media: Media) => void;
  maxSelectable?: number;
  initialFilter?: MediaFilter;
}

export function MediaGallery({
  communityId,
  selectable = false,
  onSelect,
  maxSelectable = 0,
  initialFilter,
}: MediaGalleryProps) {
  const { toast } = useToast();
  const [previewItem, setPreviewItem] = useState<Media | null>(null);
  const [selectedItems, setSelectedItems] = useState<Media[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Use the media hook
  const {
    media,
    isLoadingMedia,
    mediaError,
    filter,
    setFilter,
    refetchMedia,
    deleteMediaMutation,
  } = useMedia(communityId);

  // Initialize filter with props if provided
  useState(() => {
    if (initialFilter) {
      setFilter({
        ...filter,
        ...initialFilter,
      });
    }
  });

  // Filter media by search term
  const filteredMedia = useMemo(() => {
    if (!media) return [];
    
    if (!searchTerm.trim()) return media;
    
    const term = searchTerm.toLowerCase();
    return media.filter((item) => {
      return (
        item.title?.toLowerCase().includes(term) ||
        item.description?.toLowerCase().includes(term) ||
        item.tags?.some(tag => tag.toLowerCase().includes(term))
      );
    });
  }, [media, searchTerm]);

  // Toggle media selection
  const toggleSelection = (item: Media) => {
    if (!selectable || !onSelect) return;
    
    if (selectedItems.some(selected => selected.id === item.id)) {
      setSelectedItems(prev => prev.filter(i => i.id !== item.id));
    } else {
      if (maxSelectable > 0 && selectedItems.length >= maxSelectable) {
        toast({
          title: "Selection limit reached",
          description: `You can only select up to ${maxSelectable} items.`,
          variant: "destructive",
        });
        return;
      }
      setSelectedItems(prev => [...prev, item]);
      if (onSelect) onSelect(item);
    }
  };

  // Handle deletion
  const handleDelete = async (mediaId: number) => {
    if (confirm("Are you sure you want to delete this media item? This cannot be undone.")) {
      try {
        await deleteMediaMutation.mutateAsync(mediaId);
      } catch (error) {
        console.error("Failed to delete media:", error);
      }
    }
  };

  // Get appropriate icon for media type
  const getMediaIcon = (mediaType: MediaType) => {
    switch (mediaType) {
      case MediaType.IMAGE:
        return <ImageIcon className="h-6 w-6 text-blue-500" />;
      case MediaType.VIDEO:
        return <Video className="h-6 w-6 text-purple-500" />;
      case MediaType.DOCUMENT:
        return <FileText className="h-6 w-6 text-red-500" />;
      default:
        return <FileText className="h-6 w-6 text-gray-500" />;
    }
  };

  // Handle filter changes
  const handleFilterChange = (type: MediaType | "all") => {
    setFilter({
      ...filter,
      mediaType: type === "all" ? undefined : type,
    });
  };

  // Handle sort change
  const handleSortChange = (sort: "newest" | "oldest" | "featured") => {
    setFilter({
      ...filter,
      sort,
    });
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-2 justify-between">
        <div className="flex flex-col sm:flex-row gap-2">
          <Tabs 
            defaultValue={filter.mediaType || "all"} 
            className="w-full sm:w-auto"
            onValueChange={(value) => handleFilterChange(value as MediaType | "all")}
          >
            <TabsList className="grid grid-cols-4 w-full sm:w-auto">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value={MediaType.IMAGE}>Images</TabsTrigger>
              <TabsTrigger value={MediaType.VIDEO}>Videos</TabsTrigger>
              <TabsTrigger value={MediaType.DOCUMENT}>Docs</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Input
            placeholder="Search media..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-[250px]"
          />
        </div>
        
        <div className="flex gap-2">
          <Select
            value={filter.sort}
            onValueChange={(value) => handleSortChange(value as "newest" | "oldest" | "featured")}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="featured">Featured</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => refetchMedia()}
            disabled={isLoadingMedia}
          >
            <RefreshCw className={cn(
              "h-4 w-4",
              isLoadingMedia && "animate-spin"
            )} />
            <span className="sr-only">Refresh</span>
          </Button>
        </div>
      </div>
      
      {/* Selected count (if selectable) */}
      {selectable && maxSelectable > 0 && (
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs">
            {selectedItems.length} of {maxSelectable} selected
          </Badge>
          
          {selectedItems.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSelectedItems([])}
              className="text-xs h-7 px-2"
            >
              Clear selection
            </Button>
          )}
        </div>
      )}
      
      {/* Loading state */}
      {isLoadingMedia && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-square bg-muted">
                <Skeleton className="h-full w-full" />
              </div>
              <CardFooter className="p-2">
                <Skeleton className="h-4 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {/* Error state */}
      {mediaError && (
        <div className="text-center p-8 border rounded-lg">
          <p className="text-destructive">Failed to load media.</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetchMedia()}
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      )}
      
      {/* Empty state */}
      {!isLoadingMedia && filteredMedia.length === 0 && (
        <div className="text-center p-8 border rounded-lg">
          <p className="text-muted-foreground">No media found.</p>
          {searchTerm && (
            <p className="text-sm text-muted-foreground mt-2">
              Try adjusting your search or filters.
            </p>
          )}
        </div>
      )}
      
      {/* Media grid - Mobile optimized */}
      {!isLoadingMedia && filteredMedia.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
          {filteredMedia.map((item) => (
            <Card 
              key={item.id}
              className={cn(
                "overflow-hidden transition-all",
                selectable && "cursor-pointer hover:ring-2 hover:ring-primary/50",
                selectedItems.some(i => i.id === item.id) && "ring-2 ring-primary"
              )}
              onClick={selectable ? () => toggleSelection(item) : undefined}
            >
              <div className="relative aspect-square bg-muted group">
                {/* Media preview - Optimized for mobile with smaller file fetches */}
                {item.mediaType === MediaType.IMAGE && (
                  <img
                    src={item.thumbnailPath || item.filePath}
                    alt={item.title || "Image"}
                    className="object-cover w-full h-full"
                    loading="lazy"
                    decoding="async"
                    onClick={(e) => {
                      if (!selectable) {
                        e.stopPropagation();
                        setPreviewItem(item);
                      }
                    }}
                  />
                )}
                
                {item.mediaType === MediaType.VIDEO && (
                  <div 
                    className="flex items-center justify-center w-full h-full"
                    onClick={(e) => {
                      if (!selectable) {
                        e.stopPropagation();
                        setPreviewItem(item);
                      }
                    }}
                  >
                    {item.thumbnailPath ? (
                      <img
                        src={item.thumbnailPath}
                        alt={item.title || "Video thumbnail"}
                        className="object-cover w-full h-full"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <Video className="h-10 w-10 text-muted-foreground" />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="rounded-full bg-background/80 p-2">
                        <Play className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                      </div>
                    </div>
                  </div>
                )}
                
                {(item.mediaType === MediaType.DOCUMENT || item.mediaType === MediaType.OTHER) && (
                  <div 
                    className="flex flex-col items-center justify-center w-full h-full p-2 sm:p-4"
                    onClick={(e) => {
                      if (!selectable) {
                        e.stopPropagation();
                        window.open(item.filePath, '_blank');
                      }
                    }}
                  >
                    {getMediaIcon(item.mediaType)}
                    <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-center truncate max-w-full">
                      {item.title || (item.metadata && typeof item.metadata === 'object' && item.metadata && 'originalFilename' in item.metadata ? String(item.metadata.originalFilename) : "Document")}
                    </p>
                  </div>
                )}
                
                {/* Action buttons - Mobile-friendly with tap detection */}
                {!selectable && (
                  <div className={cn(
                    "absolute top-2 right-2 transition-opacity",
                    window.innerWidth <= 640 ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  )}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 bg-background/80">
                          <MoreVertical className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => window.open(item.filePath, '_blank')}>
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
                
                {/* Selection indicator */}
                {selectable && selectedItems.some(i => i.id === item.id) && (
                  <div className="absolute top-2 right-2">
                    <div className="bg-primary text-primary-foreground w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center">
                      <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                    </div>
                  </div>
                )}
              </div>
              
              <CardContent className="p-2 sm:p-3">
                <h3 className="text-xs sm:text-sm font-medium truncate">
                  {item.title || (item.metadata && typeof item.metadata === 'object' && item.metadata && 'originalFilename' in item.metadata ? String(item.metadata.originalFilename) : "Untitled")}
                </h3>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  {format(new Date(item.createdAt || new Date()), 'MMM d, yyyy')}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Media preview dialog - Mobile optimized */}
      <Dialog open={!!previewItem} onOpenChange={(open) => !open && setPreviewItem(null)}>
        <DialogContent className="max-w-4xl w-[95vw] sm:w-[90vw] p-0 overflow-hidden">
          <DialogHeader className="p-3 sm:p-4 bg-background/90 backdrop-blur-sm absolute top-0 left-0 right-0 z-10">
            <DialogTitle className="text-sm sm:text-base">{previewItem?.title || "Media Preview"}</DialogTitle>
            {previewItem?.description && (
              <DialogDescription className="text-xs sm:text-sm line-clamp-2 sm:line-clamp-3">
                {previewItem.description}
              </DialogDescription>
            )}
          </DialogHeader>
          
          <div className="mt-12 flex items-center justify-center">
            {previewItem?.mediaType === MediaType.IMAGE && (
              <div className="overflow-auto w-full h-full">
                <img
                  src={previewItem.filePath}
                  alt={previewItem.title || "Image"}
                  className="max-w-full max-h-[85vh] mx-auto"
                  loading="eager"
                />
              </div>
            )}
            
            {previewItem?.mediaType === MediaType.VIDEO && (
              <div className="w-full h-full flex items-center justify-center p-2 sm:p-4">
                <video 
                  src={previewItem.filePath}
                  controls
                  playsInline
                  controlsList="nodownload"
                  className="max-w-full max-h-[85vh] w-full"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            )}
            
            {/* Download button for mobile convenience */}
            <div className="absolute bottom-3 right-3 z-10">
              <Button 
                size="sm"
                variant="secondary"
                className="h-8 sm:h-9 shadow-md"
                onClick={() => previewItem && window.open(previewItem.filePath, '_blank')}
              >
                <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="text-xs sm:text-sm">Download</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { Check, Play } from "lucide-react";