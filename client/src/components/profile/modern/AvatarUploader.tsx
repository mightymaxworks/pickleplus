/**
 * PKL-278651-PROF-0009-COMP - Avatar Uploader
 * 
 * Component for handling avatar image uploads with visual feedback.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastUpdated 2025-04-26
 */

import { useState, useRef, ReactNode } from "react";
import { apiRequest } from "@/lib/queryClient";

interface AvatarUploaderProps {
  userId: number;
  children: ReactNode;
  onUploadStart: () => void;
  onUploadComplete: () => void;
  onUploadError: (error: string) => void;
}

export default function AvatarUploader({
  userId,
  children,
  onUploadStart,
  onUploadComplete,
  onUploadError
}: AvatarUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      onUploadError('Only image files are allowed');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      onUploadError('File size must be less than 5MB');
      return;
    }
    
    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      onUploadStart();
      
      // Upload the file
      const response = await fetch('/api/user/profile/avatar', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }
      
      // Clear the input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      onUploadComplete();
    } catch (error) {
      console.error('Avatar upload error:', error);
      onUploadError(error instanceof Error ? error.message : 'Failed to upload avatar');
      
      // Clear the input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  return (
    <>
      <div onClick={handleClick}>
        {children}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        aria-label="Upload avatar"
      />
    </>
  );
}