/**
 * PKL-278651-COMM-0007-ENGAGE-UI
 * Create Post Form Component
 * 
 * This component provides a form for creating new posts in a community.
 */
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Image as ImageIcon } from 'lucide-react';
import { CreatePostRequest } from '@/lib/api/community';

// Props interface
interface CreatePostFormProps {
  communityId: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// Form schema
const postSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title cannot exceed 100 characters"),
  content: z.string().min(5, "Content must be at least 5 characters").max(5000, "Content cannot exceed 5000 characters"),
  imageUrl: z.string().url("Please enter a valid URL").optional().or(z.literal(''))
});

type FormValues = z.infer<typeof postSchema>;

export const CreatePostForm = ({ communityId, onSuccess, onCancel }: CreatePostFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: '',
      content: '',
      imageUrl: ''
    },
  });
  
  // Create post mutation
  const createPost = useMutation({
    mutationFn: async (data: CreatePostRequest) => {
      return apiRequest('/api/communities/posts', {
        method: 'POST',
        body: data,
      });
    },
    onMutate: () => {
      setIsSubmitting(true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/communities/' + communityId + '/posts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/communities/' + communityId] });
      
      toast({
        title: 'Post Created',
        description: 'Your post has been created successfully.',
      });
      
      form.reset();
      setIsSubmitting(false);
      
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error) => {
      console.error('Error creating post:', error);
      
      toast({
        title: 'Error',
        description: 'Failed to create post. Please try again.',
        variant: 'destructive',
      });
      
      setIsSubmitting(false);
    },
  });
  
  // Handle form submission
  const onSubmit = (values: FormValues) => {
    const postData: CreatePostRequest = {
      communityId,
      title: values.title,
      content: values.content,
      imageUrl: values.imageUrl || undefined
    };
    
    createPost.mutate(postData);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter post title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="What's on your mind?"
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  <span>Image URL (optional)</span>
                </div>
              </FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/image.jpg" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-2 pt-2">
          {onCancel && (
            <Button 
              type="button" 
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          
          <Button 
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Creating...' : 'Create Post'}
          </Button>
        </div>
      </form>
    </Form>
  );
};