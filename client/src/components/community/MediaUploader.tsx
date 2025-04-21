/**
 * PKL-278651-COMM-0036-MEDIA-COST
 * Media Uploader Component with Cost Control
 * 
 * Component for uploading media files to community galleries
 * with drag and drop support, previews, progress indicators,
 * strict file size/type restrictions, and client-side image
 * compression to maximize storage efficiency.
 * 
 * @framework Framework5.2
 * @version 1.2.0
 * @lastModified 2025-04-21
 */

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useMedia } from "@/lib/hooks/useMedia";
import {
  UploadCloud,
  X,
  Loader2,
  Image as ImageIcon,
  FileText,
  Video,
  File,
  AlertCircle,
  Info,
  ZoomIn
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MediaType } from "@shared/schema/media";
import { compressImages } from "@/lib/utils/compressImage";

// File type size limits (in bytes) - must match server restrictions
const FILE_SIZE_LIMITS = {
  image: 2 * 1024 * 1024, // 2MB for images
  video: 10 * 1024 * 1024, // 10MB for videos
  document: 5 * 1024 * 1024, // 5MB for documents
  default: 2 * 1024 * 1024 // Default 2MB limit
};

interface MediaUploaderProps {
  communityId: number;
  maxFiles?: number;
  allowedTypes?: string[];
  onUploadComplete?: () => void;
}

export function MediaUploader({
  communityId,
  maxFiles = 5, // Reduced from 10 to 5 files per upload
  allowedTypes = ["image/*", "video/*", "application/pdf"],
  onUploadComplete
}: MediaUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [oversizedFiles, setOversizedFiles] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploadMediaMutation, handleFileUpload } = useMedia(communityId);
  const isUploading = uploadMediaMutation.isPending;

  // Check if file size is within the limit for its type
  const isValidFileSize = (file: File): boolean => {
    let sizeLimit = FILE_SIZE_LIMITS.default;
    
    if (file.type.startsWith('image/')) {
      sizeLimit = FILE_SIZE_LIMITS.image;
    } else if (file.type.startsWith('video/')) {
      sizeLimit = FILE_SIZE_LIMITS.video;
    } else if (file.type === 'application/pdf') {
      sizeLimit = FILE_SIZE_LIMITS.document;
    }
    
    return file.size <= sizeLimit;
  };
  
  // Get the size limit for display
  const getFileSizeLimit = (fileType: string): string => {
    if (fileType.startsWith('image/')) {
      return '2MB';
    } else if (fileType.startsWith('video/')) {
      return '10MB';
    } else if (fileType === 'application/pdf') {
      return '5MB';
    }
    return '2MB';
  };

  // Check for files exceeding size limits
  useEffect(() => {
    const oversized = files
      .filter(file => !isValidFileSize(file))
      .map(file => file.name);
    
    setOversizedFiles(oversized);
  }, [files]);

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      
      // Check if adding would exceed maximum
      if (files.length + newFiles.length > maxFiles) {
        alert(`You can only upload up to ${maxFiles} files at a time.`);
        return;
      }
      
      // Check file sizes and warn about large files
      const oversizedNewFiles = newFiles.filter(file => !isValidFileSize(file));
      if (oversizedNewFiles.length > 0) {
        const fileNames = oversizedNewFiles.map(f => f.name).join(', ');
        alert(`The following files exceed size limits and may be rejected by the server: ${fileNames}`);
      }
      
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  // Handle file drop
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    
    if (event.dataTransfer.files) {
      const newFiles = Array.from(event.dataTransfer.files);
      
      // Check if adding would exceed maximum
      if (files.length + newFiles.length > maxFiles) {
        alert(`You can only upload up to ${maxFiles} files at a time.`);
        return;
      }
      
      // Filter by allowed types
      const validFiles = newFiles.filter(file => {
        return allowedTypes.some(type => {
          if (type.endsWith('/*')) {
            const baseType = type.split('/')[0];
            return file.type.startsWith(`${baseType}/`);
          }
          return type === file.type;
        });
      });
      
      if (validFiles.length !== newFiles.length) {
        alert("Some files were not added because they're not of an allowed type.");
      }
      
      // Check file sizes and warn about large files
      const oversizedNewFiles = validFiles.filter(file => !isValidFileSize(file));
      if (oversizedNewFiles.length > 0) {
        const fileNames = oversizedNewFiles.map(f => f.name).join(', ');
        alert(`The following files exceed size limits and may be rejected by the server: ${fileNames}`);
      }
      
      setFiles(prev => [...prev, ...validFiles]);
    }
  };

  // Remove a file from the queue
  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Status indicator for compression process
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionStatus, setCompressionStatus] = useState<string | null>(null);
  const [compressionStats, setCompressionStats] = useState<{originalSize: number, compressedSize: number} | null>(null);

  // Handle form submission with image compression
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) {
      alert("Please select at least one file to upload.");
      return;
    }

    try {
      // Start compression if there are images
      const hasImages = files.some(file => file.type.startsWith('image/'));
      let processedFiles = [...files];
      
      if (hasImages) {
        setIsCompressing(true);
        setCompressionStatus("Compressing images...");
        
        // Track original file sizes
        const originalSize = files.reduce((sum, file) => sum + file.size, 0);
        
        // Compress images with optimized settings for mobile uploads
        processedFiles = await compressImages(files, {
          maxWidth: 1920,  // Full HD resolution is sufficient for most uses
          maxHeight: 1080,
          quality: 0.85,   // Good balance between quality and file size
          targetSizeKB: 1800 // Try to get images under 1.8MB
        });
        
        // Calculate compression stats
        const compressedSize = processedFiles.reduce((sum, file) => sum + file.size, 0);
        const savedPercentage = Math.round((1 - compressedSize / originalSize) * 100);
        
        setCompressionStats({
          originalSize: originalSize,
          compressedSize: compressedSize
        });
        
        setCompressionStatus(
          savedPercentage > 0 
            ? `Compressed images, saved ${savedPercentage}% (${((originalSize - compressedSize) / (1024 * 1024)).toFixed(1)}MB)`
            : "Images already optimized"
        );
      }

      const formData = new FormData();
      
      // Add all processed files
      processedFiles.forEach(file => {
        formData.append("files", file);
      });
      
      // Add metadata
      if (title) formData.append("title", title);
      if (description) formData.append("description", description);
      if (tags) formData.append("tags", tags);
      
      // Upload the files
      await uploadMediaMutation.mutateAsync(formData);
      
      // Reset form on success
      setFiles([]);
      setTitle("");
      setDescription("");
      setTags("");
      setCompressionStatus(null);
      setCompressionStats(null);
      if (onUploadComplete) onUploadComplete();
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsCompressing(false);
    }
  };

  // Get file icon based on type
  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) {
      return <ImageIcon className="h-6 w-6 text-blue-500" />;
    } else if (file.type.startsWith("video/")) {
      return <Video className="h-6 w-6 text-purple-500" />;
    } else if (file.type === "application/pdf") {
      return <FileText className="h-6 w-6 text-red-500" />;
    } else {
      return <File className="h-6 w-6 text-gray-500" />;
    }
  };

  // Create file previews with mobile optimizations
  const renderPreviews = () => {
    return files.map((file, index) => (
      <div
        key={`${file.name}-${index}`}
        className="relative rounded-md border border-border p-2 flex items-center gap-2 group"
      >
        {getFileIcon(file)}
        <div className="flex-1 truncate">
          <p className="text-xs sm:text-sm font-medium truncate max-w-[150px] sm:max-w-none">
            {file.name.length > 25 && window.innerWidth <= 640 
              ? file.name.substring(0, 20) + '...' + file.name.substring(file.name.lastIndexOf('.')) 
              : file.name}
          </p>
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            {(file.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-7 w-7 sm:h-8 sm:w-8", 
            window.innerWidth <= 640 
              ? "opacity-100" // Always visible on mobile
              : "opacity-0 group-hover:opacity-100 transition-opacity absolute right-1 top-1/2 -translate-y-1/2"
          )}
          onClick={() => removeFile(index)}
          disabled={isUploading}
        >
          <X className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="sr-only">Remove</span>
        </Button>
      </div>
    ));
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit}>
          {/* Mobile-optimized Upload Area */}
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-4 text-center mb-4 transition-colors",
              isDragOver 
                ? "border-primary bg-primary/10" 
                : "border-border hover:border-primary/50",
              window.innerWidth <= 640 ? "active:bg-primary/5" : "cursor-pointer"
            )}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileChange}
              accept={allowedTypes.join(",")}
              disabled={isUploading}
              capture={window.innerWidth <= 640 ? "environment" : undefined}
            />
            
            {/* Mobile camera button for direct photo capture */}
            <div className="sm:hidden mb-2 flex justify-center">
              <Button 
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full h-12 w-12 p-0 flex items-center justify-center border-primary shadow-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  // Create a special input for camera capture only
                  const tempInput = document.createElement('input');
                  tempInput.type = 'file';
                  tempInput.accept = 'image/*';
                  tempInput.capture = 'environment';
                  tempInput.onchange = (e) => handleFileChange(e as any);
                  tempInput.click();
                }}
              >
                <ImageIcon className="h-5 w-5 text-primary" />
              </Button>
            </div>
            
            <UploadCloud className="h-8 w-8 sm:h-10 sm:w-10 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm font-medium">
              {window.innerWidth <= 640 ? "Tap to upload files" : "Drag and drop files here or click to browse"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Upload up to {maxFiles} files
              <span className="hidden sm:inline"> (images, videos, or PDFs)</span>
            </p>
            
            {/* Mobile-specific guidance */}
            <p className="text-xs text-primary mt-2 sm:hidden">
              Use the camera button to take a photo directly
            </p>
          </div>

          {/* File size limits information */}
          <Alert className="mb-4 bg-muted/40 p-3">
            <Info className="h-4 w-4" />
            <AlertTitle className="text-xs sm:text-sm font-medium">File Size Limits</AlertTitle>
            <AlertDescription className="text-xs text-muted-foreground">
              <ul className="list-disc pl-4 pt-1 space-y-1">
                <li>Images: max 2MB</li>
                <li>Videos: max 10MB</li>
                <li>Documents: max 5MB</li>
              </ul>
            </AlertDescription>
          </Alert>

          {files.length > 0 && (
            <div className="grid gap-2 mb-4">
              <div className="flex items-center justify-between">
                <Label>Selected Files</Label>
                <span className="text-xs text-muted-foreground">
                  {files.length}/{maxFiles} files
                </span>
              </div>
              <div className="grid gap-2 max-h-60 overflow-y-auto p-1">
                {renderPreviews()}
              </div>
              
              {/* File size indicator */}
              <div className="mt-1">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span>{(files.reduce((total, file) => total + file.size, 0) / (1024 * 1024)).toFixed(1)} MB total</span>
                  {files.some(file => !isValidFileSize(file)) && (
                    <span className="text-destructive font-medium flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1 inline" />
                      Some files exceed limits
                    </span>
                  )}
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full transition-all",
                      oversizedFiles.length > 0 
                        ? "bg-destructive/70" 
                        : "bg-primary/70"
                    )}
                    style={{ 
                      width: `${Math.min(100, (files.reduce((total, file) => total + file.size, 0) / (10 * 1024 * 1024)) * 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {/* Warning for oversized files */}
          {oversizedFiles.length > 0 && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>File size exceeded</AlertTitle>
              <AlertDescription className="text-xs">
                The following files exceed the size limits and may be rejected:
                <ul className="list-disc pl-4 mt-1">
                  {oversizedFiles.map((name, i) => (
                    <li key={i} className="truncate">{name}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Mobile-optimized Form Layout */}
          <div className="grid gap-3 sm:gap-4">
            {/* Mobile-specific file count indicator */}
            {files.length > 0 && (
              <div className="sm:hidden px-2 py-1 bg-muted/50 rounded-md text-center">
                <p className="text-xs text-muted-foreground">
                  {files.length} file{files.length !== 1 ? 's' : ''} selected 
                  {files.length > 0 && ` (${(files.reduce((total, file) => total + file.size, 0) / (1024 * 1024)).toFixed(1)} MB total)`}
                </p>
              </div>
            )}
            
            <div className="grid gap-1 sm:gap-2">
              <Label htmlFor="title" className="text-xs sm:text-sm">Title (optional)</Label>
              <Input
                id="title"
                placeholder="Media title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isUploading}
                className="h-8 sm:h-10 text-sm"
              />
            </div>
            
            <div className="grid gap-1 sm:gap-2">
              <Label htmlFor="description" className="text-xs sm:text-sm">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Add a description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isUploading}
                className="min-h-[60px] sm:min-h-[80px] text-sm"
              />
            </div>
            
            <div className="grid gap-1 sm:gap-2">
              <Label htmlFor="tags" className="text-xs sm:text-sm">Tags (comma-separated, optional)</Label>
              <Input
                id="tags"
                placeholder="event, tournament, practice"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                disabled={isUploading || isCompressing}
                className="h-8 sm:h-10 text-sm"
              />
            </div>

            {/* Compression status indicator */}
            {compressionStatus && (
              <Alert className="mt-2 bg-primary/10 border-primary/20">
                <div className="flex items-center">
                  {isCompressing ? (
                    <Loader2 className="h-4 w-4 text-primary mr-2 animate-spin" />
                  ) : (
                    <ZoomIn className="h-4 w-4 text-primary mr-2" />
                  )}
                  <div>
                    <AlertTitle className="text-xs sm:text-sm font-medium">Image Compression</AlertTitle>
                    <AlertDescription className="text-xs text-muted-foreground">
                      {compressionStatus}
                      {compressionStats && compressionStats.originalSize !== compressionStats.compressedSize && (
                        <div className="mt-1 text-xs flex items-center">
                          <span className="font-medium text-primary">
                            Original: {(compressionStats.originalSize / (1024 * 1024)).toFixed(1)}MB → 
                            Compressed: {(compressionStats.compressedSize / (1024 * 1024)).toFixed(1)}MB
                          </span>
                        </div>
                      )}
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full mt-2 h-10 sm:h-11"
              disabled={files.length === 0 || isUploading || isCompressing}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span className="text-sm">Uploading...</span>
                </>
              ) : isCompressing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span className="text-sm">Compressing...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="mr-2 h-4 w-4" />
                  <span className="text-sm">Upload {files.length > 0 ? `${files.length} File${files.length !== 1 ? 's' : ''}` : 'Files'}</span>
                </>
              )}
            </Button>
            
            {/* Mobile upload progress indicator */}
            {(isUploading || isCompressing) && (
              <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full animate-pulse",
                    isCompressing ? "bg-primary/60" : "bg-primary"
                  )} 
                  style={{ width: '100%' }}
                ></div>
              </div>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}