/**
 * PKL-278651-COMM-0019-VISUALS
 * Community Visual Settings Component
 * 
 * This component provides an interface for community admins
 * to customize the visual appearance of their community including
 * avatar, banner, and theme color.
 */

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Upload, Image, Palette } from "lucide-react";
import { Community } from "@/types/community";
import communityApi from "@/api/communityApi";
import { useToast } from "@/hooks/use-toast";

interface CommunityVisualSettingsProps {
  community: Community;
  isAdmin: boolean;
}

export function CommunityVisualSettings({ community, isAdmin }: CommunityVisualSettingsProps) {
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(community.avatarUrl || null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(community.bannerUrl || null);
  const [themeColor, setThemeColor] = useState<string>((community as any).themeColor || "#6366F1");
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const [isBannerUploading, setIsBannerUploading] = useState(false);
  const [isThemeUpdating, setIsThemeUpdating] = useState(false);
  const { toast } = useToast();

  const form = useForm();

  // If user is not an admin, don't render the component
  if (!isAdmin) {
    return null;
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Image must be less than 5MB",
          variant: "destructive",
        });
        return;
      }
      
      setAvatarFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Image must be less than 5MB",
          variant: "destructive",
        });
        return;
      }
      
      setBannerFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setBannerPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadAvatar = async () => {
    if (!avatarFile) return;
    
    try {
      setIsAvatarUploading(true);
      await communityApi.uploadCommunityAvatar(community.id, avatarFile);
      toast({
        title: "Avatar uploaded",
        description: "Your community avatar has been updated",
      });
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your avatar",
        variant: "destructive",
      });
    } finally {
      setIsAvatarUploading(false);
    }
  };

  const uploadBanner = async () => {
    if (!bannerFile) return;
    
    try {
      setIsBannerUploading(true);
      await communityApi.uploadCommunityBanner(community.id, bannerFile);
      toast({
        title: "Banner uploaded",
        description: "Your community banner has been updated",
      });
    } catch (error) {
      console.error("Error uploading banner:", error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your banner",
        variant: "destructive",
      });
    } finally {
      setIsBannerUploading(false);
    }
  };

  const updateTheme = async () => {
    try {
      setIsThemeUpdating(true);
      await communityApi.updateCommunityTheme(community.id, themeColor);
      toast({
        title: "Theme updated",
        description: "Your community theme color has been updated",
      });
    } catch (error) {
      console.error("Error updating theme:", error);
      toast({
        title: "Update failed",
        description: "There was an error updating your theme color",
        variant: "destructive",
      });
    } finally {
      setIsThemeUpdating(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Visual Settings</CardTitle>
        <CardDescription>
          Customize your community's visual appearance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="avatar">
          <TabsList className="mb-4">
            <TabsTrigger value="avatar" className="flex items-center gap-2">
              <Image className="w-4 h-4" />
              <span className="hidden sm:inline">Avatar</span>
            </TabsTrigger>
            <TabsTrigger value="banner" className="flex items-center gap-2">
              <Image className="w-4 h-4" />
              <span className="hidden sm:inline">Banner</span>
            </TabsTrigger>
            <TabsTrigger value="theme" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              <span className="hidden sm:inline">Theme</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Avatar Upload */}
          <TabsContent value="avatar">
            <div className="space-y-4">
              <div className="flex flex-col items-center space-y-4">
                {avatarPreview ? (
                  <div className="relative w-32 h-32 rounded-full overflow-hidden border border-gray-200">
                    <img
                      src={avatarPreview}
                      alt="Community avatar preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center">
                    <Upload className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                
                <div className="w-full">
                  <Label htmlFor="avatar" className="block mb-2">
                    Upload Avatar
                  </Label>
                  <Input
                    id="avatar"
                    type="file"
                    onChange={handleAvatarChange}
                    accept="image/*"
                    className="w-full"
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    Recommended: Square image, at least 500x500px. Max size: 5MB.
                  </p>
                </div>
              </div>
              
              <Button
                onClick={uploadAvatar}
                disabled={!avatarFile || isAvatarUploading}
                className="w-full sm:w-auto"
              >
                {isAvatarUploading ? "Uploading..." : "Save Avatar"}
              </Button>
            </div>
          </TabsContent>
          
          {/* Banner Upload */}
          <TabsContent value="banner">
            <div className="space-y-4">
              <div className="flex flex-col items-center space-y-4">
                {bannerPreview ? (
                  <div className="relative w-full h-40 overflow-hidden rounded-md border border-gray-200">
                    <img
                      src={bannerPreview}
                      alt="Community banner preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full h-40 bg-gray-100 rounded-md flex items-center justify-center">
                    <Upload className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                
                <div className="w-full">
                  <Label htmlFor="banner" className="block mb-2">
                    Upload Banner
                  </Label>
                  <Input
                    id="banner"
                    type="file"
                    onChange={handleBannerChange}
                    accept="image/*"
                    className="w-full"
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    Recommended: 1200x300px (4:1 ratio). Max size: 5MB.
                  </p>
                </div>
              </div>
              
              <Button
                onClick={uploadBanner}
                disabled={!bannerFile || isBannerUploading}
                className="w-full sm:w-auto"
              >
                {isBannerUploading ? "Uploading..." : "Save Banner"}
              </Button>
            </div>
          </TabsContent>
          
          {/* Theme Color */}
          <TabsContent value="theme">
            <div className="space-y-4">
              <div className="flex flex-col space-y-4">
                <Label htmlFor="themeColor">Theme Color</Label>
                <div className="flex gap-4 flex-col sm:flex-row items-start">
                  <div className="grid grid-cols-5 gap-2 mx-auto sm:mx-0">
                    {/* Predefined colors palette */}
                    {[
                      "#FF5733", "#FFC300", "#36D7B7", "#3498DB", "#9B59B6",
                      "#6366F1", "#F472B6", "#10B981", "#FF6B6B", "#4C51BF",
                      "#8B5CF6", "#EC4899", "#F59E0B", "#84CC16", "#06B6D4"
                    ].map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`w-10 h-10 rounded-md border-2 ${
                          themeColor === color ? "border-black dark:border-white" : "border-transparent"
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setThemeColor(color)}
                        aria-label={`Select color ${color}`}
                      />
                    ))}
                  </div>
                  <div className="w-full sm:w-auto space-y-4">
                    <div>
                      <Label htmlFor="hex-color">Hex Color</Label>
                      <Input
                        id="hex-color"
                        type="text"
                        value={themeColor}
                        onChange={(e) => setThemeColor(e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label>Preview:</Label>
                      <div
                        className="w-12 h-12 rounded-md border border-gray-200"
                        style={{ backgroundColor: themeColor }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <Button
                onClick={updateTheme}
                disabled={isThemeUpdating}
                className="w-full sm:w-auto"
              >
                {isThemeUpdating ? "Updating..." : "Save Theme"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}