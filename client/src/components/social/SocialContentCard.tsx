/**
 * PKL-278651-SAGE-0011-SOCIAL - Social Content Card Component
 * 
 * This component displays a shared content item in the social feed
 * Part of Sprint 5: Social Features & UI Polish
 */

import React, { useState } from "react";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { SharedContent } from "@/types/social";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Heart,
  MessageCircle,
  Share2,
  MoreVertical,
  Edit,
  Trash2,
  BookmarkPlus,
  Flag,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAddReactionMutation, useRemoveReactionMutation } from "@/hooks/use-social";
import { useAuth } from "@/hooks/use-auth";
import { ContentCommentDialog } from "./ContentCommentDialog";
import { ReportContentDialog } from "@/components/moderation/ReportContentDialog";
import { ContentShareDialog } from "./ContentShareDialog";

interface SocialContentCardProps {
  content: SharedContent;
  onEdit?: (content: SharedContent) => void;
  onDelete?: (id: number) => void;
}

export function SocialContentCard({ content, onEdit, onDelete }: SocialContentCardProps) {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  
  const addReactionMutation = useAddReactionMutation();
  const removeReactionMutation = useRemoveReactionMutation();
  
  // Format the creation date
  const formattedDate = formatDistanceToNow(new Date(content.createdAt), {
    addSuffix: true,
  });
  
  // Get type-specific label and icon
  const getContentTypeInfo = () => {
    switch (content.contentType) {
      case "journal_entry":
        return { label: "Journal", color: "bg-blue-100 text-blue-800" };
      case "drill":
        return { label: "Drill", color: "bg-orange-100 text-orange-800" };
      case "training_plan":
        return { label: "Training Plan", color: "bg-purple-100 text-purple-800" };
      case "match_result":
        return { label: "Match Result", color: "bg-green-100 text-green-800" };
      case "achievement":
        return { label: "Achievement", color: "bg-yellow-100 text-yellow-800" };
      case "sage_insight":
        return { label: "SAGE Insight", color: "bg-indigo-100 text-indigo-800" };
      case "feedback":
        return { label: "Feedback", color: "bg-pink-100 text-pink-800" };
      default:
        return { label: "Content", color: "bg-gray-100 text-gray-800" };
    }
  };
  
  const contentTypeInfo = getContentTypeInfo();
  
  // Handle like toggle
  const handleLikeToggle = () => {
    if (isLiked) {
      removeReactionMutation.mutate({ contentId: content.id, reactionType: "like" });
    } else {
      addReactionMutation.mutate({ contentId: content.id, reactionType: "like" });
    }
    setIsLiked(!isLiked);
  };
  
  // Check if current user is the content owner
  const isOwner = user?.id === content.userId;
  
  // Get link to the original content
  const getContentLink = () => {
    switch (content.contentType) {
      case "journal_entry":
        return `/journal/${content.contentId}`;
      case "drill":
        return `/drills/${content.contentId}`;
      case "training_plan":
        return `/training-plans/${content.contentId}`;
      case "match_result":
        return `/matches/${content.contentId}`;
      case "achievement":
        return `/achievements/${content.contentId}`;
      case "sage_insight":
        return `/sage/insights/${content.contentId}`;
      case "feedback":
        return `/feedback/${content.contentId}`;
      default:
        return `/social/content/${content.id}`;
    }
  };
  
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="p-4 pb-2 flex flex-row justify-between items-start space-y-0">
        <div className="flex items-center space-x-2">
          <Link href={`/profile/${content.userId}`}>
            <Avatar className="h-10 w-10 cursor-pointer">
              <AvatarImage src={`/api/users/${content.userId}/avatar`} />
              <AvatarFallback>PK</AvatarFallback>
            </Avatar>
          </Link>
          <div>
            <div className="font-medium leading-none">User {content.userId}</div>
            <div className="text-sm text-muted-foreground">{formattedDate}</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className={cn("font-normal", contentTypeInfo.color)}>
            {contentTypeInfo.label}
          </Badge>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShareDialogOpen(true)}>
                <Share2 className="mr-2 h-4 w-4" />
                <span>Share</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <BookmarkPlus className="mr-2 h-4 w-4" />
                <span>Save</span>
              </DropdownMenuItem>
              {isOwner && (
                <>
                  <DropdownMenuItem onClick={() => onEdit?.(content)}>
                    <Edit className="mr-2 h-4 w-4" />
                    <span>Edit</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDelete?.(content.id)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </>
              )}
              {!isOwner && (
                <DropdownMenuItem onClick={() => setReportDialogOpen(true)}>
                  <Flag className="mr-2 h-4 w-4" />
                  <span>Report</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <Link href={getContentLink()}>
          <h3 className="text-lg font-semibold mb-2 hover:text-primary transition-colors cursor-pointer">
            {content.title}
          </h3>
        </Link>
        
        {content.description && (
          <p className="text-muted-foreground mb-3">{content.description}</p>
        )}
        
        {content.highlightedText && (
          <blockquote className="border-l-4 border-primary/30 pl-4 py-2 my-3 italic bg-primary/5 rounded-r">
            {content.highlightedText}
          </blockquote>
        )}
        
        {content.customImage && (
          <div className="mt-3 rounded-md overflow-hidden">
            <img 
              src={content.customImage} 
              alt={content.title} 
              className="w-full object-cover h-48"
            />
          </div>
        )}
        
        {content.customTags && content.customTags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {content.customTags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex justify-between">
        <div className="flex items-center space-x-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "flex items-center gap-1",
                    isLiked ? "text-red-500 hover:text-red-600" : ""
                  )}
                  onClick={handleLikeToggle}
                >
                  <Heart
                    className={cn("h-4 w-4", isLiked ? "fill-current" : "")}
                  />
                  <span>{content.likeCount + (isLiked ? 1 : 0)}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isLiked ? "Unlike" : "Like"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => setCommentDialogOpen(true)}
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>{content.commentCount}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Comment</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => setShareDialogOpen(true)}
                >
                  <Share2 className="h-4 w-4" />
                  <span>{content.shareCount}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Share</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <div className="flex items-center text-muted-foreground text-sm">
          <Eye className="h-4 w-4 mr-1" />
          <span>{content.viewCount} views</span>
        </div>
      </CardFooter>
      
      {/* Comment Dialog */}
      <ContentCommentDialog
        open={commentDialogOpen}
        onOpenChange={setCommentDialogOpen}
        contentId={content.id}
      />
      
      {/* Report Dialog */}
      <ReportContentDialog
        open={reportDialogOpen}
        onOpenChange={setReportDialogOpen}
        contentId={content.id}
        contentType="social_content"
      />
      
      {/* Share Dialog */}
      <ContentShareDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        userId={user?.id}
        prefilledContent={content}
      />
    </Card>
  );
}