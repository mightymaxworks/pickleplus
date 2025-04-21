/**
 * PKL-278651-COMM-0036-MEDIA-UPLOAD
 * Enhanced Media Uploader Component
 * 
 * Upload interface with client-side image compression, drag-and-drop support,
 * and real-time progress tracking.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

import React, { useState, useRef, useCallback } from 'react';
import { 
  UploadCloud, 
  X, 
  AlertCircle, 
  Check, 
  FileText,
  Image as ImageIcon,
  Film,
  Loader2
} from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerFooter,
} from '@/components/ui/drawer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useMediaMutations, MediaUploadProgress } from '@/lib/hooks/useMedia';
import { useStorageQuota } from '@/lib/hooks/useMedia';
import { formatBytes, formatSizeWithDifference, calculatePercentUsed } from '@/lib/utils/quotaUtils';
import { compressImage, shouldCompressImage } from '@/lib/utils/compressImage';

interface MediaUploaderProps {
  communityId: number;
  onUploadSuccess?: () => void;
  trigger?: React.ReactNode;
}

// Form schema for media upload
const mediaUploadSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  tags: z.string().optional(),
  files: z.any().refine(
    (files) => files?.length > 0,
    'At least one file is required'
  )
});

type MediaUploadFormValues = z.infer<typeof mediaUploadSchema>;

export function MediaUploader({ 
  communityId, 
  onUploadSuccess,
  trigger
}: MediaUploaderProps) {
  const [open, setOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 640px)");
  const uploadButtonRef = useRef<HTMLButtonElement>(null);
  
  const { data: quota } = useStorageQuota(communityId);
  const { 
    uploadProgress, 
    setUploadProgress, 
    uploadMediaMutation 
  } = useMediaMutations(communityId);
  
  const [dragging, setDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'upload' | 'progress'>('upload');
  
  // Set up form with validation
  const form = useForm<MediaUploadFormValues>({
    resolver: zodResolver(mediaUploadSchema),
    defaultValues: {
      title: '',
      description: '',
      tags: '',
      files: undefined
    }
  });
  
  // Check if quota limit is reached
  const isQuotaExceeded = quota && quota.percentUsed >= 95;
  
  // Generate preview URLs for selected files
  const generatePreviews = useCallback((files: File[]) => {
    // Revoke any existing preview URLs to avoid memory leaks
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    
    // Create new preview URLs
    const newPreviews = Array.from(files).map(file => {
      return URL.createObjectURL(file);
    });
    
    setPreviewUrls(newPreviews);
  }, [previewUrls]);
  
  // Handle file drop
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      setSelectedFiles(droppedFiles);
      generatePreviews(droppedFiles);
      
      // Update form value
      form.setValue('files', droppedFiles);
    }
  }, [form, generatePreviews]);
  
  // Handle file selection via input
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setSelectedFiles(selectedFiles);
      generatePreviews(selectedFiles);
      
      // Update form value
      form.setValue('files', selectedFiles);
    }
  }, [form, generatePreviews]);
  
  // Remove a selected file
  const removeFile = useCallback((index: number) => {
    setSelectedFiles(prev => {
      const updatedFiles = [...prev];
      updatedFiles.splice(index, 1);
      
      // Update form value
      form.setValue('files', updatedFiles.length > 0 ? updatedFiles : undefined);
      
      return updatedFiles;
    });
    
    setPreviewUrls(prev => {
      const updatedUrls = [...prev];
      
      // Revoke the URL to free up memory
      URL.revokeObjectURL(updatedUrls[index]);
      updatedUrls.splice(index, 1);
      
      return updatedUrls;
    });
  }, [form]);
  
  // Clear all selected files
  const clearFiles = useCallback(() => {
    // Revoke all preview URLs to avoid memory leaks
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    
    setSelectedFiles([]);
    setPreviewUrls([]);
    form.setValue('files', undefined);
  }, [form, previewUrls]);
  
  // Process files for upload (with compression for images)
  const processFiles = async (files: File[]): Promise<File[]> => {
    if (!files || files.length === 0) return [];
    
    const processedFiles: File[] = [];
    const newProgress: MediaUploadProgress[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Set initial progress state
      newProgress.push({
        loaded: 0,
        total: file.size,
        percentage: 0,
        status: 'compressing',
        filename: file.name
      });
      
      // Apply compression for eligible images
      if (shouldCompressImage(file)) {
        try {
          // Update progress
          setUploadProgress([...newProgress]);
          
          // Apply compression
          const compressionResult = await compressImage(file, {
            maxWidth: 1920,
            maxHeight: 1080,
            quality: 0.8,
            adaptiveCompression: true
          });
          
          // Update progress with compression stats
          newProgress[i] = {
            ...newProgress[i],
            compressedSize: compressionResult.compressedSize,
            originalSize: compressionResult.originalSize,
            compressionRatio: compressionResult.compressionRatio,
            status: 'uploading'
          };
          
          setUploadProgress([...newProgress]);
          
          // Add compressed file
          processedFiles.push(compressionResult.file);
        } catch (error) {
          console.error('Compression failed:', error);
          
          // Update progress with error
          newProgress[i] = {
            ...newProgress[i],
            status: 'error',
            error: 'Compression failed'
          };
          
          setUploadProgress([...newProgress]);
          
          // Fall back to original file
          processedFiles.push(file);
        }
      } else {
        // For non-image files, just pass through
        newProgress[i] = {
          ...newProgress[i],
          status: 'uploading'
        };
        
        setUploadProgress([...newProgress]);
        processedFiles.push(file);
      }
    }
    
    return processedFiles;
  };
  
  // Handle form submission
  const onSubmit = async (data: MediaUploadFormValues) => {
    if (!data.files || data.files.length === 0) {
      return;
    }
    
    try {
      setActiveTab('progress');
      
      // Process files (compression etc.)
      const processedFiles = await processFiles(data.files);
      
      // Prepare tags
      const tags = data.tags ? 
        data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : 
        undefined;
      
      // Upload files
      await uploadMediaMutation.mutateAsync({
        files: processedFiles,
        title: data.title,
        description: data.description,
        tags
      });
      
      // Clear form on success
      form.reset();
      clearFiles();
      
      // Allow some time to see completion state
      setTimeout(() => {
        setActiveTab('upload');
        setOpen(false);
        
        // Notify parent component
        if (onUploadSuccess) {
          onUploadSuccess();
        }
      }, 1500);
      
    } catch (error) {
      console.error('Upload failed:', error);
      // Keep on progress tab to show errors
    }
  };
  
  // Get icon for file type
  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon className="h-6 w-6 text-blue-500" />;
    } else if (file.type.startsWith('video/')) {
      return <Film className="h-6 w-6 text-red-500" />;
    } else {
      return <FileText className="h-6 w-6 text-yellow-500" />;
    }
  };
  
  // Cancel active uploads
  const cancelUpload = () => {
    // This is a simplified version. In a real app, you would need to abort the fetch/XHR
    setUploadProgress([]);
    setActiveTab('upload');
  };
  
  // Total files size
  const totalSize = selectedFiles.reduce((sum, file) => sum + file.size, 0);
  
  // Create a component that works for both dialog and drawer
  const UploadContent = () => (
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'upload' | 'progress')}>
      {/* Display storage quota */}
      {quota && (
        <div className="p-4 bg-muted rounded-md mb-4">
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium">Storage used</span>
            <span className="text-sm">{formatBytes(quota.bytesUsed)} / {formatBytes(quota.quotaBytes)}</span>
          </div>
          <Progress 
            value={quota.percentUsed} 
            className="h-2"
            aria-label="Storage quota" 
          />
          <div className="mt-1 flex justify-between text-xs text-muted-foreground">
            <span>{quota.fileCount} files</span>
            <span>{quota.percentUsed}% used</span>
          </div>
        </div>
      )}
      
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="upload">Upload Files</TabsTrigger>
        <TabsTrigger value="progress">Progress</TabsTrigger>
      </TabsList>
      
      <TabsContent value="upload" className="space-y-4 py-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* File drop zone */}
            <FormField
              control={form.control}
              name="files"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Files</FormLabel>
                  <FormControl>
                    <div
                      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors
                        ${dragging ? 'border-primary bg-primary/5' : 'border-input'} 
                        ${isQuotaExceeded ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      onDragOver={(e) => {
                        e.preventDefault();
                        if (!isQuotaExceeded) setDragging(true);
                      }}
                      onDragLeave={() => setDragging(false)}
                      onDrop={isQuotaExceeded ? (e) => e.preventDefault() : handleDrop}
                      onClick={() => {
                        if (!isQuotaExceeded && uploadButtonRef.current) {
                          uploadButtonRef.current.click();
                        }
                      }}
                    >
                      {isQuotaExceeded ? (
                        <div className="flex flex-col items-center text-destructive">
                          <AlertCircle className="mb-2 h-10 w-10" />
                          <p className="text-sm font-medium">Storage quota exceeded</p>
                          <p className="text-xs mt-1">Please delete some files before uploading more.</p>
                        </div>
                      ) : (
                        <>
                          <UploadCloud className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                          <p className="text-sm font-medium">
                            Drag & drop files here or click to browse
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Supported formats: JPG, PNG, GIF, MP4, PDF
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Maximum file size: 10MB
                          </p>
                          <input
                            ref={uploadButtonRef as any}
                            type="file"
                            multiple
                            onChange={handleFileChange}
                            className="hidden"
                            disabled={isQuotaExceeded}
                          />
                        </>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Selected files preview */}
            {selectedFiles.length > 0 && (
              <div className="border rounded-md p-3">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium">Selected Files ({selectedFiles.length})</h4>
                  <Button type="button" variant="ghost" size="sm" onClick={clearFiles}>
                    Clear All
                  </Button>
                </div>
                
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      className="flex items-center justify-between py-2 px-3 bg-muted rounded-md"
                    >
                      <div className="flex items-center space-x-3 overflow-hidden">
                        {getFileIcon(file)}
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                
                <div className="mt-2 text-xs text-muted-foreground">
                  Total size: {formatBytes(totalSize)}
                </div>
              </div>
            )}
            
            {/* Title and description fields */}
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter a title for your upload" {...field} />
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
                        placeholder="Enter a description for your upload" 
                        className="resize-none"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags (optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter tags separated by commas" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={selectedFiles.length === 0 || uploadMediaMutation.isPending || isQuotaExceeded}
              >
                {uploadMediaMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Upload Files'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </TabsContent>
      
      <TabsContent value="progress" className="py-4">
        {uploadProgress.length > 0 ? (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Upload Progress</h3>
            
            <div className="space-y-3">
              {uploadProgress.map((progress, index) => (
                <div 
                  key={`progress-${index}`} 
                  className="border rounded-md p-3"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium truncate max-w-[250px]">
                      {progress.filename}
                    </span>
                    <span className="text-xs">
                      {progress.status === 'compressing' ? (
                        <Badge variant="outline" className="bg-amber-100 text-amber-800">
                          Compressing
                        </Badge>
                      ) : progress.status === 'uploading' ? (
                        <Badge variant="outline" className="bg-blue-100 text-blue-800">
                          Uploading
                        </Badge>
                      ) : progress.status === 'done' ? (
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          Complete
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-100 text-red-800">
                          Error
                        </Badge>
                      )}
                    </span>
                  </div>
                  
                  <Progress 
                    value={progress.percentage} 
                    className="h-2 mb-1"
                    aria-label={`Upload progress for ${progress.filename}`}
                  />
                  
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>
                      {progress.status === 'done' 
                        ? 'Complete' 
                        : progress.status === 'error'
                        ? progress.error || 'Failed'
                        : `${progress.percentage}%`}
                    </span>
                    {progress.originalSize && progress.compressedSize && (
                      <span className="text-xs text-muted-foreground">
                        Compression: {Math.round(100 - (progress.compressedSize / progress.originalSize * 100))}%
                      </span>
                    )}
                  </div>
                  
                  {/* Compression stats */}
                  {progress.originalSize && progress.compressedSize && (
                    <div className="mt-2 text-xs">
                      <span className="text-muted-foreground">
                        {formatSizeWithDifference(progress.originalSize, progress.compressedSize)}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="flex justify-end space-x-2">
              {uploadMediaMutation.isPending ? (
                <Button variant="outline" onClick={cancelUpload}>
                  Cancel
                </Button>
              ) : (
                <Button onClick={() => setActiveTab('upload')}>
                  Back
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-muted-foreground">No active uploads</p>
            <Button 
              className="mt-4" 
              variant="outline" 
              onClick={() => setActiveTab('upload')}
            >
              Back to Upload
            </Button>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
  
  // Use either dialog (desktop) or drawer (mobile)
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          {trigger || (
            <Button>
              <UploadCloud className="mr-2 h-4 w-4" />
              Upload Media
            </Button>
          )}
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>Upload Media</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-4">
            <UploadContent />
          </div>
          <DrawerFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <UploadCloud className="mr-2 h-4 w-4" />
            Upload Media
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Upload Media</DialogTitle>
        </DialogHeader>
        <UploadContent />
      </DialogContent>
    </Dialog>
  );
}