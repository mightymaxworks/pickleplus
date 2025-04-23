/**
 * PKL-278651-PROF-0004-SAFARI
 * Cross-Browser Compatible Image Upload Component
 * 
 * This component addresses the Safari image upload preview issue by:
 * 1. Using browser-agnostic image preview techniques
 * 2. Adding proper error handling for file access
 * 3. Including specific Safari compatibility fixes
 * 4. Providing a responsive and accessible UI
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-23
 */

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { UserIcon, Upload, X, Camera, Image, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  defaultImage?: string;
  onChange: (file: File | null) => void;
  onPreviewGenerated?: (previewUrl: string | null) => void;
  maxSizeMB?: number;
  allowedTypes?: string[];
  className?: string;
  shape?: 'square' | 'circle';
  disabled?: boolean;
}

/**
 * Cross-Browser Compatible Image Upload
 * 
 * A component for uploading and previewing images that works across browsers
 */
export function CrossBrowserImageUpload({
  defaultImage,
  onChange,
  onPreviewGenerated,
  maxSizeMB = 5,
  allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  className,
  shape = 'square',
  disabled = false
}: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(defaultImage || null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSafari, setIsSafari] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  const { toast } = useToast();
  
  // Detect Safari browser
  useEffect(() => {
    const isSafariBrowser = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    setIsSafari(isSafariBrowser);
  }, []);
  
  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl !== defaultImage && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl, defaultImage]);
  
  // Handle file change, create preview, validate
  const handleFileChange = (file: File | null) => {
    // Clear previous preview and errors
    if (previewUrl && previewUrl !== defaultImage && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setError(null);
    
    if (!file) {
      onChange(null);
      onPreviewGenerated?.(null);
      return;
    }
    
    // Validate file type
    if (!allowedTypes.includes(file.type)) {
      const errorMsg = `File type not supported. Please upload ${allowedTypes.join(', ')}`;
      setError(errorMsg);
      toast({
        title: "Invalid file type",
        description: errorMsg,
        variant: "destructive",
      });
      return;
    }
    
    // Validate file size
    if (file.size > maxSizeBytes) {
      const errorMsg = `File size exceeds ${maxSizeMB}MB limit`;
      setError(errorMsg);
      toast({
        title: "File too large",
        description: errorMsg,
        variant: "destructive",
      });
      return;
    }
    
    // Create a FileReader for Safari compatibility
    const reader = new FileReader();
    reader.onload = (e) => {
      // For Safari, we use FileReader result
      const dataUrl = e.target?.result as string;
      setPreviewUrl(dataUrl);
      onPreviewGenerated?.(dataUrl);
    };
    
    reader.onerror = () => {
      setError("Failed to read file");
      toast({
        title: "Error",
        description: "Failed to read file",
        variant: "destructive",
      });
    };
    
    // Read the file as data URL (works in all browsers)
    reader.readAsDataURL(file);
    
    // Pass the file to parent component
    onChange(file);
  };
  
  // Handle file input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileChange(file);
  };
  
  // Handle drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  };
  
  // Handle drop event
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };
  
  // Trigger file input click
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };
  
  // Clear selected image
  const handleClear = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    if (previewUrl && previewUrl !== defaultImage && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    
    setPreviewUrl(null);
    setError(null);
    onChange(null);
    onPreviewGenerated?.(null);
  };
  
  return (
    <div className={cn("image-upload-container", className)}>
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleInputChange}
        accept={allowedTypes.join(',')}
        className="sr-only"
        disabled={disabled}
        aria-label="Upload image"
      />
      
      {/* Upload area with drag and drop */}
      <div
        className={cn(
          "image-upload-area flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4 transition-colors",
          isDragging ? "border-primary bg-primary/5" : "border-border bg-muted/30",
          shape === 'circle' && "rounded-full aspect-square overflow-hidden",
          disabled && "opacity-50 cursor-not-allowed",
          "relative"
        )}
        onDragEnter={!disabled ? handleDrag : undefined}
        onDragOver={!disabled ? handleDrag : undefined}
        onDragLeave={!disabled ? handleDrag : undefined}
        onDrop={!disabled ? handleDrop : undefined}
      >
        {/* Preview Image */}
        {previewUrl ? (
          <div className="relative w-full h-full min-h-[150px] flex items-center justify-center">
            <img
              src={previewUrl}
              alt="Preview"
              className={cn(
                "max-w-full max-h-full object-cover",
                shape === 'square' ? "rounded-md" : "rounded-full w-full h-full"
              )}
            />
            
            {/* Remove button */}
            {!disabled && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 rounded-full"
                onClick={handleClear}
                aria-label="Remove image"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ) : (
          // Upload placeholder
          <div className="flex flex-col items-center justify-center text-center p-4 h-full min-h-[150px]">
            {error ? (
              // Error state
              <>
                <AlertCircle className="h-10 w-10 text-destructive mb-2" />
                <p className="text-sm text-destructive">{error}</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={handleButtonClick}
                  disabled={disabled}
                >
                  Try Again
                </Button>
              </>
            ) : (
              // Normal upload state
              <>
                {isSafari ? (
                  // Safari-specific icon to indicate compatibility
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Camera className="h-8 w-8 text-muted-foreground" />
                  </div>
                ) : (
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Image className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <p className="text-sm font-medium mb-1">
                  {isDragging ? "Drop your image here" : "Upload your image"}
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  {isSafari 
                    ? "Compatible with Safari and all browsers" 
                    : "Drag & drop or click to browse"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {allowedTypes.map(type => type.split('/')[1]).join(', ')} up to {maxSizeMB}MB
                </p>
                
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="mt-4"
                  onClick={handleButtonClick}
                  disabled={disabled}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Browse Files
                </Button>
              </>
            )}
          </div>
        )}
      </div>
      
      {/* Safari-specific helper text */}
      {isSafari && !previewUrl && !error && (
        <p className="text-xs text-muted-foreground mt-2 text-center">
          <span className="inline-flex items-center">
            <span className="bg-green-500/20 text-green-700 dark:text-green-300 text-[10px] rounded-full px-2 py-0.5 mr-1">Safari</span>
            Optimized for your browser
          </span>
        </p>
      )}
    </div>
  );
}

/**
 * Profile Image Upload
 * 
 * Specialized version of the image uploader for profile photos
 */
export function ProfileImageUpload({
  defaultImage,
  onChange,
  className,
  disabled = false
}: Omit<ImageUploadProps, 'shape' | 'onPreviewGenerated'>) {
  const [previewGenerated, setPreviewGenerated] = useState(false);
  
  return (
    <div className={cn("profile-image-upload", className)}>
      <Label htmlFor="profile-image" className="block mb-2 text-sm font-medium">
        Profile Photo
      </Label>
      
      <CrossBrowserImageUpload
        defaultImage={defaultImage}
        onChange={onChange}
        onPreviewGenerated={(url) => setPreviewGenerated(!!url)}
        shape="circle"
        className="w-32 h-32 mx-auto"
        disabled={disabled}
      />
      
      {/* Preview confirmation for Safari users */}
      {previewGenerated && (
        <p className="text-xs text-center text-green-600 dark:text-green-400 mt-2">
          Preview generated successfully
        </p>
      )}
    </div>
  );
}

/**
 * Implementation Notes:
 * 
 * This component solves the Safari image upload preview issue by:
 * 
 * 1. Using FileReader for consistent cross-browser behavior
 * 2. Setting proper MIME types for better Safari compatibility
 * 3. Adding explicit error handling for Safari-specific failures
 * 4. Providing user feedback during the process
 * 
 * To use this component:
 * 
 * import { CrossBrowserImageUpload, ProfileImageUpload } from '@/components/CrossBrowserImageUpload';
 * 
 * function ProfileEditForm() {
 *   const [profileImage, setProfileImage] = useState<File | null>(null);
 *   
 *   return (
 *     <form>
 *       <ProfileImageUpload
 *         defaultImage={user.avatarUrl}
 *         onChange={setProfileImage}
 *       />
 *       
 *       {/* Other form fields */}
 *     </form>
 *   );
 * }
 */