/**
 * PKL-278651-COMM-0036-MEDIA
 * Community Media Management Page
 * 
 * Main page component for the Community Media Management feature.
 * Integrates the media uploader, gallery manager, and media gallery components.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-20
 */

import { useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { communityKeys } from "@/lib/api/community/keys";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, ArrowLeft, Upload, Images, FolderPlus } from "lucide-react";
import { MediaUploader } from "@/components/community/MediaUploader";
import { MediaGallery } from "@/components/community/MediaGallery";
import { GalleryManager } from "@/components/community/GalleryManager";
import { Link } from "wouter";

export default function MediaManagementPage() {
  const { communityId } = useParams<{ communityId: string }>();
  const [activeTab, setActiveTab] = useState("upload");
  
  // Validate communityId
  const communityIdNum = communityId ? parseInt(communityId) : 0;
  
  // Fetch community data to show in the header
  const {
    data: community,
    isLoading: isLoadingCommunity,
    error: communityError
  } = useQuery({
    queryKey: communityKeys.detail(communityIdNum),
    queryFn: async () => {
      const response = await fetch(`/api/communities/${communityIdNum}`);
      if (!response.ok) {
        throw new Error("Failed to load community");
      }
      return response.json();
    },
    enabled: !!communityIdNum,
  });
  
  if (communityError) {
    return (
      <div className="container mx-auto py-10">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle /> Error Loading Community
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              There was a problem loading the community information. Please try again.
            </p>
            <Button 
              variant="outline" 
              className="mt-4"
              asChild
            >
              <Link href="/communities">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Communities
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header with Breadcrumb */}
      <div className="space-y-1">
        <div className="flex items-center text-sm text-muted-foreground">
          <Link href="/communities" className="hover:underline">
            Communities
          </Link>
          <span className="mx-2">/</span>
          {isLoadingCommunity ? (
            <Skeleton className="h-4 w-[100px]" />
          ) : (
            <Link 
              href={`/community/${communityIdNum}`} 
              className="hover:underline"
            >
              {community?.name || `Community ${communityIdNum}`}
            </Link>
          )}
          <span className="mx-2">/</span>
          <span>Media</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">
          {isLoadingCommunity ? (
            <Skeleton className="h-9 w-[300px]" />
          ) : (
            `${community?.name || 'Community'} Media`
          )}
        </h1>
        {isLoadingCommunity ? (
          <Skeleton className="h-5 w-full max-w-[600px]" />
        ) : (
          <p className="text-muted-foreground">
            Upload, organize, and manage your community's photos, videos, and documents.
          </p>
        )}
      </div>
      
      {/* Main Tabs Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">Upload</span>
          </TabsTrigger>
          <TabsTrigger value="gallery" className="flex items-center gap-2">
            <Images className="h-4 w-4" />
            <span className="hidden sm:inline">Media Library</span>
          </TabsTrigger>
          <TabsTrigger value="manage" className="flex items-center gap-2">
            <FolderPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Manage Galleries</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Upload Tab */}
        <TabsContent value="upload" className="pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Upload Media</CardTitle>
                  <CardDescription>
                    Add photos, videos, and documents to your community's media library.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <MediaUploader
                    communityId={communityIdNum}
                    onUploadComplete={() => setActiveTab("gallery")}
                  />
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Upload Guidelines</CardTitle>
                  <CardDescription>
                    Follow these guidelines for best results.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-medium">Supported File Types</h3>
                    <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground">
                      <li>Images: JPEG, PNG, GIF, WebP (max 10MB)</li>
                      <li>Videos: MP4, WebM, QuickTime (max 25MB)</li>
                      <li>Documents: PDF, Word, Excel (max 10MB)</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-medium">Recommendations</h3>
                    <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground">
                      <li>Add descriptive titles and tags to make media easier to find</li>
                      <li>For events, include the date in the title or description</li>
                      <li>Consider privacy settings when uploading sensitive content</li>
                      <li>Organize related media into galleries after uploading</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        {/* Media Library Tab */}
        <TabsContent value="gallery" className="pt-6">
          <Card>
            <CardHeader>
              <CardTitle>Media Library</CardTitle>
              <CardDescription>
                Browse and manage all media files in this community.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MediaGallery communityId={communityIdNum} />
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Manage Galleries Tab */}
        <TabsContent value="manage" className="pt-6">
          <Card>
            <CardHeader>
              <CardTitle>Gallery Management</CardTitle>
              <CardDescription>
                Create and manage media galleries for your community.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GalleryManager communityId={communityIdNum} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}