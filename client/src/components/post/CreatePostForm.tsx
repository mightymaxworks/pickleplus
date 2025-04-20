/**
 * PKL-278651-COMM-0022-POST - Create Post Form Component
 * Implementation timestamp: 2025-04-21 00:20 ET
 * 
 * Form component for creating new community posts
 * Framework 5.2 compliant implementation
 */

import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ImagePlus, 
  X, 
  Loader2,
  AlertCircle
} from "lucide-react";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage 
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

interface CreatePostFormProps {
  communityId: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// Form validation schema using zod
const formSchema = z.object({
  content: z.string()
    .min(1, "Post content cannot be empty")
    .max(2000, "Post content cannot exceed 2000 characters"),
  mediaUrls: z.array(z.string()).optional(),
});

type FormData = z.infer<typeof formSchema>;

export function CreatePostForm({ communityId, onSuccess, onCancel }: CreatePostFormProps) {
  const { toast } = useToast();
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Initialize form
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
      mediaUrls: [],
    },
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (data: FormData) => {
      // Construct the request URL
      const url = `/api/communities/${communityId}/posts`;
      
      // Make the API request
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ...data,
          // Add JSON stringified media URLs (if any)
          mediaUrls: data.mediaUrls && data.mediaUrls.length > 0 ? 
            JSON.stringify(data.mediaUrls) : null,
        }),
      });
      
      if (!response.ok) {
        // Try to get detailed error information
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create post");
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Reset form
      form.reset();
      setUploadedImages([]);
      
      // Show success message
      toast({
        title: "Post created",
        description: "Your post has been created successfully.",
      });
      
      // Invalidate queries to refresh the posts list
      queryClient.invalidateQueries({ 
        queryKey: ['/api/communities', communityId, 'posts']
      });
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error) => {
      toast({
        title: "Failed to create post",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
  });

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }
      
      // Upload files
      const response = await fetch("/api/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("Failed to upload images");
      }
      
      const { urls } = await response.json();
      
      // Update form state with new image URLs
      const currentMediaUrls = form.getValues("mediaUrls") || [];
      form.setValue("mediaUrls", [...currentMediaUrls, ...urls]);
      
      // Update UI state
      setUploadedImages([...uploadedImages, ...urls]);
      
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload images",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  // Remove an uploaded image
  const removeImage = (indexToRemove: number) => {
    const updatedImages = uploadedImages.filter((_, index) => index !== indexToRemove);
    setUploadedImages(updatedImages);
    form.setValue("mediaUrls", updatedImages);
  };
  
  // Handle form submission
  const onSubmit = (data: FormData) => {
    createPostMutation.mutate(data);
  };

  return (
    <Card>
      <CardContent className="p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="Share something with the community..."
                      className="min-h-[100px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Image upload preview */}
            {uploadedImages.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                {uploadedImages.map((url, index) => (
                  <div key={index} className="relative">
                    <img
                      src={url}
                      alt={`Uploaded image ${index + 1}`}
                      className="rounded-md h-24 w-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div>
                <label 
                  htmlFor="image-upload" 
                  className="cursor-pointer flex items-center text-sm text-muted-foreground hover:text-primary"
                >
                  <ImagePlus className="mr-1 h-4 w-4" />
                  <span>Add Images</span>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                </label>
                {isUploading && (
                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    <span>Uploading...</span>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-2">
                {onCancel && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={createPostMutation.isPending}
                  >
                    Cancel
                  </Button>
                )}
                
                <Button
                  type="submit"
                  disabled={createPostMutation.isPending || isUploading}
                >
                  {createPostMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    "Post"
                  )}
                </Button>
              </div>
            </div>
            
            {/* Form error message */}
            {Object.keys(form.formState.errors).length > 0 && (
              <div className="flex items-center gap-2 text-destructive text-sm mt-2">
                <AlertCircle className="h-4 w-4" />
                <span>Please fix the errors above before submitting</span>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export default CreatePostForm;