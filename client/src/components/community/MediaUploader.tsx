/**
 * PKL-278651-COMM-0036-MEDIA
 * Media Uploader Component
 * 
 * Component for uploading media files to community galleries
 * with drag and drop support, previews, and progress indicators.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-20
 */

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMedia } from "@/lib/hooks/useMedia";
import {
  UploadCloud,
  X,
  Loader2,
  Image as ImageIcon,
  FileText,
  Video,
  File
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MediaType } from "@shared/schema/media";

interface MediaUploaderProps {
  communityId: number;
  maxFiles?: number;
  allowedTypes?: string[];
  onUploadComplete?: () => void;
}

export function MediaUploader({
  communityId,
  maxFiles = 10,
  allowedTypes = ["image/*", "video/*", "application/pdf"],
  onUploadComplete
}: MediaUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploadMediaMutation, handleFileUpload } = useMedia(communityId);
  const isUploading = uploadMediaMutation.isPending;

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      setFiles(prev => {
        // Check if adding would exceed maximum
        if (prev.length + newFiles.length > maxFiles) {
          alert(`You can only upload up to ${maxFiles} files at a time.`);
          return prev;
        }
        return [...prev, ...newFiles];
      });
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
      
      setFiles(prev => [...prev, ...validFiles]);
    }
  };

  // Remove a file from the queue
  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) {
      alert("Please select at least one file to upload.");
      return;
    }

    const formData = new FormData();
    
    // Add all files
    files.forEach(file => {
      formData.append("files", file);
    });
    
    // Add metadata
    if (title) formData.append("title", title);
    if (description) formData.append("description", description);
    if (tags) formData.append("tags", tags);
    
    try {
      await uploadMediaMutation.mutateAsync(formData);
      // Reset form on success
      setFiles([]);
      setTitle("");
      setDescription("");
      setTags("");
      if (onUploadComplete) onUploadComplete();
    } catch (error) {
      console.error("Upload failed:", error);
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

          {files.length > 0 && (
            <div className="grid gap-2 mb-4">
              <Label>Selected Files</Label>
              <div className="grid gap-2 max-h-60 overflow-y-auto p-1">
                {renderPreviews()}
              </div>
            </div>
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
                disabled={isUploading}
                className="h-8 sm:h-10 text-sm"
              />
            </div>

            <Button
              type="submit"
              className="w-full mt-2 h-10 sm:h-11"
              disabled={files.length === 0 || isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span className="text-sm">Uploading...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="mr-2 h-4 w-4" />
                  <span className="text-sm">Upload {files.length > 0 ? `${files.length} File${files.length !== 1 ? 's' : ''}` : 'Files'}</span>
                </>
              )}
            </Button>
            
            {/* Mobile upload progress indicator */}
            {isUploading && (
              <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary animate-pulse" style={{ width: '100%' }}></div>
              </div>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}