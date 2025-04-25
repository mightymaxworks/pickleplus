/**
 * PKL-278651-SAGE-0011-SOCIAL - Social Content Page
 * 
 * This page displays the social content feed where users can browse and interact with shared content.
 * Part of Sprint 5: Social Features & UI Polish
 */

import React, { useState } from "react";
import { useContentFeed } from "@/hooks/use-social";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, RefreshCw } from "lucide-react";
import { 
  PageHeader, 
  PageHeaderDescription, 
  PageHeaderHeading 
} from "@/components/ui/page-header";
import { LayoutContainer } from "@/components/layout/LayoutContainer";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";

// Import the types
import { SharedContent } from "@/types/social";

// Temporary placeholders until components are fully implemented
const SocialContentCard = ({ content }: { content: SharedContent }) => (
  <div className="border rounded-lg p-6">
    <h3 className="font-semibold text-lg">{content.title}</h3>
    <p className="text-muted-foreground mt-2">{content.description || "No description provided."}</p>
  </div>
);

const ContentShareDialog = ({ 
  open, 
  onOpenChange, 
  userId 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
  userId?: number 
}) => null;

export default function SocialContentPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const { data: contentFeed, isLoading, isError, error, refetch } = useContentFeed({ limit: 20 });
  
  // Filter content based on active tab
  const filteredContent = Array.isArray(contentFeed) ? contentFeed.filter(content => {
    if (activeTab === "all") return true;
    if (activeTab === "journals" && content.contentType === "journal_entry") return true;
    if (activeTab === "drills" && content.contentType === "drill") return true;
    if (activeTab === "insights" && content.contentType === "sage_insight") return true;
    if (activeTab === "feedback" && content.contentType === "feedback") return true;
    return false;
  }) : [];
  
  return (
    <LayoutContainer>
      <PageHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div>
            <PageHeaderHeading>Community Content</PageHeaderHeading>
            <PageHeaderDescription>
              Discover and share valuable pickleball insights, drills, and feedback with the community.
            </PageHeaderDescription>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetch()}
              className="flex items-center gap-1"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </Button>
            
            <Button 
              size="sm" 
              onClick={() => setShareDialogOpen(true)}
              className="flex items-center gap-1"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Share Content</span>
            </Button>
          </div>
        </div>
      </PageHeader>
      
      <Tabs defaultValue="all" onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Content</TabsTrigger>
          <TabsTrigger value="journals">Journals</TabsTrigger>
          <TabsTrigger value="drills">Drills</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="pt-2">
          <div className="grid grid-cols-1 gap-6">
            {isLoading ? (
              // Loading state
              Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="border rounded-lg p-6 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-20 w-full" />
                  <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <Skeleton className="h-4 w-24 ml-2" />
                    </div>
                    <div className="flex space-x-2">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                  </div>
                </div>
              ))
            ) : filteredContent.length > 0 ? (
              // Content cards
              filteredContent.map(content => (
                <SocialContentCard key={content.id} content={content} />
              ))
            ) : (
              // Empty state
              <div className="border rounded-lg p-10 text-center">
                <h3 className="text-lg font-medium mb-2">No content found</h3>
                <p className="text-muted-foreground mb-6">
                  {activeTab === "all" 
                    ? "There's no content to display yet. Be the first to share something with the community!"
                    : `There are no ${activeTab} shared yet. Share your own or switch to a different category.`}
                </p>
                <Button onClick={() => setShareDialogOpen(true)}>
                  Share Content
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Share dialog */}
      <ContentShareDialog 
        open={shareDialogOpen} 
        onOpenChange={setShareDialogOpen} 
        userId={user?.id} 
      />
    </LayoutContainer>
  );
}