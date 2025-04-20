/**
 * PKL-278651-COMM-0036-MEDIA
 * Gallery Manager Component
 * 
 * Component for creating, editing, and managing community media galleries.
 * Allows users to organize media into collections with custom settings.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-20
 */

import { useState } from "react";
import { useMedia } from "@/lib/hooks/useMedia";
import { Gallery, Media, GalleryPrivacyLevel } from "@shared/schema/media";
import { MediaGallery } from "./MediaGallery";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { 
  ImagePlus, 
  FolderPlus, 
  Edit, 
  Trash2, 
  MoreVertical,
  Lock,
  Users,
  Globe,
  ExternalLink,
  Image as ImageIcon,
  AlertCircle,
  Loader2
} from "lucide-react";
import { format } from "date-fns";

// Form schema for gallery creation/editing
const galleryFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  description: z.string().max(500, "Description is too long").optional(),
  privacyLevel: z.enum([
    GalleryPrivacyLevel.PUBLIC,
    GalleryPrivacyLevel.MEMBERS,
    GalleryPrivacyLevel.PRIVATE
  ]).default(GalleryPrivacyLevel.PUBLIC),
  coverMediaId: z.number().optional(),
  eventId: z.number().optional(),
});

type GalleryFormValues = z.infer<typeof galleryFormSchema>;

interface GalleryManagerProps {
  communityId: number;
}

export function GalleryManager({ communityId }: GalleryManagerProps) {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingGallery, setEditingGallery] = useState<Gallery | null>(null);
  const [selectedGallery, setSelectedGallery] = useState<Gallery | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<Media[]>([]);
  const [isSelectingMedia, setIsSelectingMedia] = useState(false);
  
  const {
    galleries,
    isLoadingGalleries,
    galleriesError,
    media,
    isLoadingMedia,
    createGalleryMutation,
    updateGalleryMutation,
    deleteGalleryMutation,
    addToGalleryMutation,
    removeFromGalleryMutation,
  } = useMedia(communityId);

  // Form for gallery creation/editing
  const form = useForm<GalleryFormValues>({
    resolver: zodResolver(galleryFormSchema),
    defaultValues: {
      title: "",
      description: "",
      privacyLevel: GalleryPrivacyLevel.PUBLIC,
    },
  });

  // Handle dialog close
  const handleDialogClose = () => {
    setIsCreateDialogOpen(false);
    setEditingGallery(null);
    form.reset();
  };

  // Open edit dialog
  const handleEditGallery = (gallery: Gallery) => {
    setEditingGallery(gallery);
    form.reset({
      title: gallery.name || "",
      description: gallery.description || "",
      privacyLevel: gallery.privacyLevel || GalleryPrivacyLevel.PUBLIC,
      coverMediaId: gallery.coverImageId ?? undefined,
      eventId: gallery.eventId ?? undefined,
    });
    setIsCreateDialogOpen(true);
  };

  // Submit handler for gallery form
  const onSubmit = async (data: GalleryFormValues) => {
    try {
      if (editingGallery) {
        await updateGalleryMutation.mutateAsync({
          galleryId: editingGallery.id,
          data: {
            ...data,
            communityId,
          },
        });
        toast({
          title: "Gallery updated",
          description: "Your gallery has been updated successfully.",
        });
      } else {
        await createGalleryMutation.mutateAsync({
          ...data,
          communityId,
        });
        toast({
          title: "Gallery created",
          description: "Your gallery has been created successfully.",
        });
      }
      handleDialogClose();
    } catch (error) {
      console.error("Gallery operation failed:", error);
      toast({
        title: "Operation failed",
        description: "Failed to save gallery. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle gallery deletion
  const handleDeleteGallery = async (galleryId: number) => {
    if (confirm("Are you sure you want to delete this gallery? This cannot be undone.")) {
      try {
        await deleteGalleryMutation.mutateAsync(galleryId);
        toast({
          title: "Gallery deleted",
          description: "The gallery has been deleted successfully.",
        });
        if (selectedGallery?.id === galleryId) {
          setSelectedGallery(null);
        }
      } catch (error) {
        console.error("Failed to delete gallery:", error);
        toast({
          title: "Deletion failed",
          description: "Failed to delete gallery. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  // Handle adding media to gallery
  const handleAddMediaToGallery = async () => {
    if (!selectedGallery || selectedMedia.length === 0) return;
    
    try {
      for (const media of selectedMedia) {
        await addToGalleryMutation.mutateAsync({
          galleryId: selectedGallery.id,
          mediaId: media.id,
        });
      }
      
      toast({
        title: "Media added",
        description: `Added ${selectedMedia.length} item${selectedMedia.length > 1 ? 's' : ''} to the gallery.`,
      });
      
      setSelectedMedia([]);
      setIsSelectingMedia(false);
    } catch (error) {
      console.error("Failed to add media to gallery:", error);
      toast({
        title: "Operation failed",
        description: "Failed to add media to gallery. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Get privacy icon
  const getPrivacyIcon = (privacyLevel: GalleryPrivacyLevel) => {
    switch (privacyLevel) {
      case GalleryPrivacyLevel.PRIVATE:
        return <Lock className="h-4 w-4" />;
      case GalleryPrivacyLevel.MEMBERS:
        return <Users className="h-4 w-4" />;
      case GalleryPrivacyLevel.PUBLIC:
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Gallery creation dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingGallery ? "Edit gallery" : "Create new gallery"}
            </DialogTitle>
            <DialogDescription>
              {editingGallery
                ? "Update your gallery settings and information."
                : "Create a new gallery to organize your media."}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gallery Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter gallery title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter gallery description"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      A brief description of what's in this gallery.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="privacyLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Privacy Level</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select privacy level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={GalleryPrivacyLevel.PUBLIC}>
                          <div className="flex items-center">
                            <Globe className="mr-2 h-4 w-4" />
                            Public (Everyone)
                          </div>
                        </SelectItem>
                        <SelectItem value={GalleryPrivacyLevel.MEMBERS}>
                          <div className="flex items-center">
                            <Users className="mr-2 h-4 w-4" />
                            Members Only
                          </div>
                        </SelectItem>
                        <SelectItem value={GalleryPrivacyLevel.PRIVATE}>
                          <div className="flex items-center">
                            <Lock className="mr-2 h-4 w-4" />
                            Private (Admins only)
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Controls who can view this gallery.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleDialogClose}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createGalleryMutation.isPending || updateGalleryMutation.isPending}
                >
                  {(createGalleryMutation.isPending || updateGalleryMutation.isPending) ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    editingGallery ? "Update Gallery" : "Create Gallery"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Main gallery management interface - Mobile optimized */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Media Galleries</h2>
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          className="w-full sm:w-auto justify-center"
          size={window.innerWidth <= 640 ? "sm" : "default"}
        >
          <FolderPlus className="mr-2 h-4 w-4" />
          New Gallery
        </Button>
      </div>
      
      <Tabs defaultValue="galleries" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="galleries" className="py-2 text-sm sm:text-base">Galleries</TabsTrigger>
          <TabsTrigger value="media" className="py-2 text-sm sm:text-base">Media Library</TabsTrigger>
        </TabsList>
        
        {/* Galleries view */}
        <TabsContent value="galleries" className="space-y-4">
          {isLoadingGalleries ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">Loading galleries...</p>
            </div>
          ) : galleriesError ? (
            <div className="text-center py-8 border rounded-lg">
              <AlertCircle className="h-8 w-8 mx-auto text-destructive" />
              <p className="mt-2 text-destructive">Failed to load galleries.</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.location.reload()}
                className="mt-4"
              >
                Retry
              </Button>
            </div>
          ) : galleries && galleries.length > 0 ? (
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {galleries.map((gallery) => (
                <Card key={gallery.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 py-2 px-3 sm:pb-2 sm:px-4">
                    <div className="flex items-center space-x-2 max-w-[75%]">
                      <div className="bg-muted rounded-full p-1 flex-shrink-0">
                        {getPrivacyIcon(gallery.privacyLevel as GalleryPrivacyLevel)}
                      </div>
                      <CardTitle className="text-xs sm:text-sm font-medium truncate">
                        {gallery.name}
                      </CardTitle>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8">
                          <MoreVertical className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          setSelectedGallery(gallery);
                          setIsSelectingMedia(true);
                        }}>
                          <ImagePlus className="mr-2 h-4 w-4" />
                          Add Media
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditGallery(gallery)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Gallery
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.open(`/community/${communityId}/gallery/${gallery.id}`, '_blank')}>
                          <ExternalLink className="mr-2 h-4 w-4" />
                          View Gallery
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDeleteGallery(gallery.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Gallery
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>
                  <CardContent className="py-1 px-3 sm:pb-2 sm:px-4">
                    {gallery.description && (
                      <CardDescription className="text-[11px] sm:text-xs line-clamp-2">
                        {gallery.description}
                      </CardDescription>
                    )}
                  </CardContent>
                  <CardFooter className="py-2 px-3 sm:px-4 text-[10px] sm:text-xs text-muted-foreground">
                    Created {gallery.createdAt ? format(new Date(gallery.createdAt), 'MMM d, yyyy') : format(new Date(), 'MMM d, yyyy')}
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg">
              <FolderPlus className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No galleries yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto mt-2">
                Create your first gallery to organize your community's media into collections.
              </p>
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                variant="outline"
                className="mt-4"
              >
                Create Gallery
              </Button>
            </div>
          )}
          
          {/* Media selection mode - Mobile optimized */}
          {isSelectingMedia && selectedGallery && (
            <Dialog open={true} onOpenChange={(open) => {
              if (!open) {
                setIsSelectingMedia(false);
                setSelectedMedia([]);
              }
            }}>
              <DialogContent className="sm:max-w-[90vw] max-h-[90vh] p-3 sm:p-6">
                <DialogHeader className="mb-2 sm:mb-4">
                  <DialogTitle className="text-base sm:text-lg">
                    Add Media to {selectedGallery.name}
                  </DialogTitle>
                  <DialogDescription className="text-xs sm:text-sm">
                    Tap images to select items for this gallery.
                  </DialogDescription>
                </DialogHeader>
                
                {/* Selection count badge for mobile - fixed position */}
                <div className="fixed top-16 sm:top-20 left-1/2 -translate-x-1/2 z-50 sm:hidden">
                  <div className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full shadow-md">
                    {selectedMedia.length} selected
                  </div>
                </div>
                
                <ScrollArea className="h-[50vh] sm:h-[60vh] w-full">
                  <MediaGallery
                    communityId={communityId}
                    selectable={true}
                    onSelect={(media) => {
                      setSelectedMedia((prev) => {
                        if (prev.some((item) => item.id === media.id)) {
                          return prev.filter((item) => item.id !== media.id);
                        } else {
                          return [...prev, media];
                        }
                      });
                    }}
                    maxSelectable={50}
                  />
                </ScrollArea>
                
                <DialogFooter className="flex-col sm:flex-row gap-3 sm:gap-2 mt-3 sm:mt-0">
                  <div className="hidden sm:block text-xs sm:text-sm text-muted-foreground">
                    {selectedMedia.length} items selected
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsSelectingMedia(false);
                        setSelectedMedia([]);
                      }}
                      className="flex-1 sm:flex-none text-xs sm:text-sm py-2 px-3 h-9 sm:h-10"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleAddMediaToGallery}
                      disabled={selectedMedia.length === 0 || addToGalleryMutation.isPending}
                      className="flex-1 sm:flex-none text-xs sm:text-sm py-2 px-3 h-9 sm:h-10"
                    >
                      {addToGalleryMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        <>Add {selectedMedia.length > 0 ? selectedMedia.length : ''} to Gallery</>
                      )}
                    </Button>
                  </div>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </TabsContent>
        
        {/* Media library view */}
        <TabsContent value="media">
          <MediaGallery communityId={communityId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}