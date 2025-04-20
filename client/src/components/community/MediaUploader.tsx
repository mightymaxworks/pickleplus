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

  // Create file previews
  const renderPreviews = () => {
    return files.map((file, index) => (
      <div
        key={`${file.name}-${index}`}
        className="relative rounded-md border border-border p-2 flex items-center gap-2 group"
      >
        {getFileIcon(file)}
        <div className="flex-1 truncate">
          <p className="text-sm font-medium truncate">{file.name}</p>
          <p className="text-xs text-muted-foreground">
            {(file.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity absolute right-1 top-1/2 -translate-y-1/2"
          onClick={() => removeFile(index)}
          disabled={isUploading}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Remove</span>
        </Button>
      </div>
    ));
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit}>
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-4 text-center mb-4 cursor-pointer transition-colors",
              isDragOver 
                ? "border-primary bg-primary/10" 
                : "border-border hover:border-primary/50"
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
              capture="environment"
            />
            <UploadCloud className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm font-medium">
              {window.innerWidth <= 640 ? "Tap to upload files" : "Drag and drop files here or click to browse"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Upload up to {maxFiles} files
              <span className="hidden sm:inline"> (images, videos, or PDFs)</span>
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

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title (optional)</Label>
              <Input
                id="title"
                placeholder="Media title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isUploading}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Add a description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isUploading}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="tags">Tags (comma-separated, optional)</Label>
              <Input
                id="tags"
                placeholder="event, tournament, practice"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                disabled={isUploading}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={files.length === 0 || isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload Files"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}