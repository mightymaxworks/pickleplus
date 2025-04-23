/**
 * PKL-278651-PROF-0005-UPLOAD
 * Enhanced Profile Image Editor Component
 * 
 * Features:
 * - Real-time image preview on file selection
 * - Immediate UI updates after successful uploads
 * - Error handling and validation
 * - Integration with UserDataContext for global user data updates
 */
import { useState, useRef, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useUserData } from "@/contexts/UserDataContext";
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Camera, 
  Upload, 
  Trash2, 
  X, 
  Check, 
  Loader2, 
  RefreshCw 
} from "lucide-react";

// Import default avatar for new users
import defaultAvatarPath from "@assets/Untitled design (51).png";

interface User {
  id: number;
  username?: string;
  displayName?: string;
  avatarUrl?: string | null;
  // Add other properties as needed
}

interface ProfileImageEditorProps {
  user: User;
}

export function ProfileImageEditor({ user }: ProfileImageEditorProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [localAvatarUrl, setLocalAvatarUrl] = useState<string | null>(user.avatarUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { refreshUserData } = useUserData();

  const triggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Update local avatar URL when user prop changes
  useEffect(() => {
    setLocalAvatarUrl(user.avatarUrl || null);
  }, [user.avatarUrl]);

  // Clean up any object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // PKL-278651-PROF-0005-UPLOAD-FIX
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    // Create a preview immediately and show it
    console.log("[ProfileImageEditor] Creating preview for file:", file.name);
    
    // Clean up any existing preview URL first
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    
    // Create new object URL and update state
    const url = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(url);
    setIsModalOpen(true);
    
    // Reset the file input so the same file can be reselected
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const uploadImage = async () => {
    if (!selectedFile) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("/api/user/profile/avatar", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to upload avatar');
      }

      // Get the response data with the new avatar URL
      const responseData = await response.json();
      
      // Update local state immediately for instant UI feedback
      if (responseData.avatarUrl) {
        setLocalAvatarUrl(responseData.avatarUrl);
      }

      // Invalidate both current user and any profile queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["/api/auth/current-user"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] })
      ]);

      // Force a refresh of user data context
      await refreshUserData();

      toast({
        title: "Success", 
        description: "Profile picture updated successfully",
      });

      closeModal();
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "There was an error uploading your image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeProfileImage = async () => {
    setIsUploading(true);

    try {
      await apiRequest("DELETE", "/api/profile/remove-image");

      // Update UI
      queryClient.invalidateQueries({ queryKey: ["/api/auth/current-user"] });

      toast({
        title: "Success",
        description: "Profile image removed successfully",
      });

      closeModal();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove profile image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Get initials for avatar fallback
  const getInitials = () => {
    if (user.displayName) {
      return user.displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase();
    }
    return user.username?.substring(0, 2).toUpperCase() || "?";
  };

  // Use the most up-to-date avatar (localAvatarUrl or user.avatarUrl)
  const currentAvatarUrl = localAvatarUrl || user.avatarUrl;
  
  return (
    <>
      <div className="relative group">
        <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full overflow-hidden mx-auto">
          {currentAvatarUrl ? (
            <img 
              src={currentAvatarUrl} 
              alt={user.username} 
              className="h-full w-full object-cover"
              key={currentAvatarUrl} // Force re-render when URL changes
            />
          ) : (
            <img 
              src={defaultAvatarPath} 
              alt={user.username || "Default avatar"} 
              className="h-full w-full object-contain bg-yellow-100"
              key="default-avatar"
            />
          )}
        </div>

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 rounded-full">
          <div className="flex gap-1">
            <Button 
              variant="secondary" 
              size="sm" 
              className="h-8 w-8 p-0 rounded-full"
              onClick={triggerFileSelect}
            >
              <Camera className="h-4 w-4" />
            </Button>
            {user.avatarUrl && (
              <Button 
                variant="secondary" 
                size="sm" 
                className="h-8 w-8 p-0 rounded-full"
                onClick={() => refreshUserData()}
                title="Refresh profile image"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </div>
          <input 
            type="file" 
            ref={fileInputRef}
            className="hidden" 
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Profile Photo</DialogTitle>
            <DialogDescription>
              Choose an image to represent you across Pickle+
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex justify-center p-2">
              <div className="h-48 w-48 rounded-full overflow-hidden bg-muted relative">
                {previewUrl ? (
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="h-full w-full object-cover"
                  />
                ) : currentAvatarUrl ? (
                  <img 
                    src={currentAvatarUrl} 
                    alt={user.username || 'Current avatar'} 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <img 
                    src={defaultAvatarPath} 
                    alt="Default avatar" 
                    className="h-full w-full object-contain bg-yellow-100"
                  />
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={triggerFileSelect}
                disabled={isUploading}
              >
                <Upload className="h-4 w-4 mr-2" />
                Choose Another
              </Button>

              {currentAvatarUrl && (
                <Button 
                  variant="destructive" 
                  className="flex-1"
                  onClick={removeProfileImage}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Remove Photo
                </Button>
              )}
            </div>
          </div>

          <DialogFooter className="flex justify-between sm:justify-end">
            <Button 
              variant="ghost" 
              onClick={closeModal}
              disabled={isUploading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>

            <Button 
              variant="default" 
              onClick={uploadImage}
              disabled={isUploading || !selectedFile}
              className="bg-[#4CAF50] hover:bg-[#3d8b40]"
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Save Photo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}