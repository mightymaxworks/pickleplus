/**
 * PKL-278651-COMM-0007-ENGAGE-UI
 * Create Post Form Component
 * 
 * This component provides a form for creating posts in a community.
 */
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ImagePlus, Loader2, X } from "lucide-react";

interface CreatePostFormProps {
  communityId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

const postSchema = z.object({
  content: z.string().min(1, "Post content is required").max(2000, "Post content must be less than 2000 characters"),
  isPinned: z.boolean().optional().default(false),
  imageUrls: z.array(z.string()).optional(),
});

type PostFormData = z.infer<typeof postSchema>;

export const CreatePostForm = ({ communityId, onSuccess, onCancel }: CreatePostFormProps) => {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imageInput, setImageInput] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      content: "",
      isPinned: false,
      imageUrls: [],
    }
  });
  
  // Create post mutation
  const createPost = useMutation({
    mutationFn: async (data: PostFormData) => {
      return apiRequest('/api/communities/' + communityId + '/posts', {
        method: 'POST',
        body: {
          content: data.content,
          isPinned: data.isPinned,
          imageUrls: data.imageUrls,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/communities/${communityId}/posts`] });
      queryClient.invalidateQueries({ queryKey: ['/api/communities'] });
      onSuccess();
      
      toast({
        title: "Post Created",
        description: "Your post has been successfully created.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create the post. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = async (data: PostFormData) => {
    data.imageUrls = imageUrls;
    createPost.mutate(data);
  };
  
  const addImageUrl = () => {
    if (!imageInput.trim()) return;
    
    // Basic URL validation
    if (!imageInput.match(/^(https?:\/\/)/i)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL starting with http:// or https://",
        variant: "destructive",
      });
      return;
    }
    
    setImageUrls([...imageUrls, imageInput]);
    setImageInput("");
  };
  
  const removeImageUrl = (index: number) => {
    const newUrls = [...imageUrls];
    newUrls.splice(index, 1);
    setImageUrls(newUrls);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Post Content</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Share something with the community..."
                  className="min-h-[150px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Create a post to share with the community. Max 2000 characters.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Image URLs */}
        <div className="space-y-2">
          <FormLabel>Add Images (Optional)</FormLabel>
          <div className="flex gap-2">
            <Input
              placeholder="Enter image URL"
              value={imageInput}
              onChange={(e) => setImageInput(e.target.value)}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              onClick={addImageUrl}
              className="gap-1"
            >
              <ImagePlus className="h-4 w-4" />
              Add
            </Button>
          </div>
          <FormDescription>
            Add images to your post by entering their URLs.
          </FormDescription>
          
          {/* Image URL list */}
          {imageUrls.length > 0 && (
            <div className="space-y-2 mt-2">
              {imageUrls.map((url, index) => (
                <div key={index} className="flex items-center gap-2 bg-muted/50 p-2 rounded-md">
                  <div className="flex-1 text-sm truncate">{url}</div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeImageUrl(index)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Pin Post (Advanced option or admin) */}
        <FormField
          control={form.control}
          name="isPinned"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel>Pin Post</FormLabel>
                <FormDescription>
                  Pinned posts appear at the top of the community feed.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createPost.isPending || !form.formState.isValid}
          >
            {createPost.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Posting...
              </>
            ) : "Post"}
          </Button>
        </div>
      </form>
    </Form>
  );
};