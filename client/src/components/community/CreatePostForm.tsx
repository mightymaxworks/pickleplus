/**
 * PKL-278651-COMM-0007-ENGAGE-UI
 * Create Post Form Component
 * 
 * This component provides a form for creating posts in a community.
 */
import { useState } from "react";
import { useCreateCommunityPost } from "@/lib/hooks/useCommunity";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { ImagePlus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CreatePostFormProps {
  communityId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

const postSchema = z.object({
  content: z.string().min(1, "Post content is required").max(5000, "Post content must be less than 5000 characters"),
});

type PostFormData = z.infer<typeof postSchema>;

export const CreatePostForm = ({ communityId, onSuccess, onCancel }: CreatePostFormProps) => {
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const { toast } = useToast();
  
  const createPost = useCreateCommunityPost();
  
  const form = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      content: "",
    },
  });
  
  const onSubmit = async (data: PostFormData) => {
    try {
      // Handle media upload (in a real implementation)
      const mediaUrls: string[] = [];
      
      if (mediaFiles.length > 0) {
        // In a real implementation, you would upload the files to a storage service
        // and get back the URLs
        
        // For now, we'll just simulate this with the previews
        mediaUrls.push(...mediaPreviews);
      }
      
      await createPost.mutateAsync({
        communityId,
        content: data.content,
        mediaUrls
      });
      
      form.reset();
      setMediaFiles([]);
      setMediaPreviews([]);
      onSuccess();
      
    } catch (error) {
      console.error("Failed to create post", error);
      toast({
        title: "Failed to Create Post",
        description: "There was an error creating your post. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      
      // Limit to 4 images max
      if (mediaFiles.length + newFiles.length > 4) {
        toast({
          title: "Too Many Images",
          description: "You can only add up to 4 images per post.",
          variant: "destructive",
        });
        return;
      }
      
      // Create preview URLs
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      
      setMediaFiles(prev => [...prev, ...newFiles]);
      setMediaPreviews(prev => [...prev, ...newPreviews]);
    }
  };
  
  const removeMedia = (index: number) => {
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(mediaPreviews[index]);
    
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    setMediaPreviews(prev => prev.filter((_, i) => i !== index));
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  placeholder="What would you like to share with the community?"
                  className="min-h-[120px] resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Media previews */}
        {mediaPreviews.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {mediaPreviews.map((preview, index) => (
              <div key={index} className="relative">
                <img 
                  src={preview} 
                  alt={`Preview ${index}`} 
                  className="w-full h-32 object-cover rounded-md" 
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="w-6 h-6 absolute top-1 right-1 rounded-full"
                  onClick={() => removeMedia(index)}
                >
                  <X size={12} />
                </Button>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={() => document.getElementById('media-upload')?.click()}
              disabled={mediaFiles.length >= 4}
            >
              <ImagePlus size={16} />
              <span>Add Image</span>
            </Button>
            <input 
              type="file" 
              id="media-upload" 
              accept="image/*" 
              multiple 
              className="hidden" 
              onChange={handleFileChange}
              disabled={mediaFiles.length >= 4}
            />
            {mediaFiles.length > 0 && (
              <span className="text-xs text-muted-foreground ml-2">
                {mediaFiles.length}/4 images
              </span>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createPost.isPending || !form.formState.isValid}
            >
              {createPost.isPending ? "Posting..." : "Post"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};