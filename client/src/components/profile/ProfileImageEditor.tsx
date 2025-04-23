import { useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Camera, 
  Upload, 
  Trash2, 
  X, 
  Check, 
  Loader2 
} from "lucide-react";

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const triggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

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

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setIsModalOpen(true);
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

      await queryClient.invalidateQueries({ queryKey: ["/api/auth/current-user"] });

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

  return (
    <>
      <div className="relative group">
        <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full overflow-hidden mx-auto">
          {user.avatarUrl ? (
            <img 
              src={user.avatarUrl} 
              alt={user.username} 
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold">
              {getInitials()}
            </div>
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
          </DialogHeader>

          <div className="space-y-4">
            {previewUrl && (
              <div className="flex justify-center p-2">
                <div className="h-48 w-48 rounded-full overflow-hidden bg-muted">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            )}

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

              {user.avatarUrl && (
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

            {previewUrl && (
              <Button 
                variant="default" 
                onClick={uploadImage}
                disabled={isUploading}
                className="bg-[#4CAF50] hover:bg-[#3d8b40]"
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                Save Photo
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}