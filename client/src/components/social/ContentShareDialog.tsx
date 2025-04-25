/**
 * PKL-278651-SAGE-0011-SOCIAL - Content Share Dialog Component
 * 
 * This component provides a dialog for sharing content to the social feed
 * Part of Sprint 5: Social Features & UI Polish
 */

import React, { useState, useEffect } from "react";
import { useShareContentMutation } from "@/hooks/use-social";
import { SharedContent, ContentType } from "@/types/social";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

// Temporary mock data for testing
const useJournals = () => ({ 
  data: [
    { id: 1, title: "Journal Entry 1" },
    { id: 2, title: "Journal Entry 2" }
  ] 
});

const useDrills = () => ({ 
  data: [
    { id: 1, name: "Drill 1" },
    { id: 2, name: "Drill 2" }
  ] 
});

const useFeedback = () => ({ 
  data: [
    { id: 1, title: "Feedback 1" },
    { id: 2, title: "Feedback 2" }
  ] 
});

interface ContentShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: number;
  prefilledContent?: SharedContent;
}

export function ContentShareDialog({
  open,
  onOpenChange,
  userId,
  prefilledContent,
}: ContentShareDialogProps) {
  const { toast } = useToast();
  const shareContentMutation = useShareContentMutation();
  
  // Get data for content selection
  const { data: journals } = useJournals();
  const { data: drills } = useDrills();
  const { data: feedback } = useFeedback();
  
  // Form state
  const [contentType, setContentType] = useState<ContentType>("journal_entry");
  const [contentId, setContentId] = useState<number | undefined>(undefined);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<string>("public");
  const [highlightedText, setHighlightedText] = useState("");
  const [customTag, setCustomTag] = useState("");
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [customImage, setCustomImage] = useState("");
  
  // If we have prefilled content, use it
  useEffect(() => {
    if (prefilledContent) {
      setContentType(prefilledContent.contentType);
      setContentId(prefilledContent.contentId);
      setTitle(prefilledContent.title);
      setDescription(prefilledContent.description || "");
      setVisibility(prefilledContent.visibility);
      setHighlightedText(prefilledContent.highlightedText || "");
      setCustomTags(prefilledContent.customTags || []);
      setCustomImage(prefilledContent.customImage || "");
    }
  }, [prefilledContent]);
  
  // Reset form
  const resetForm = () => {
    setContentType("journal_entry");
    setContentId(undefined);
    setTitle("");
    setDescription("");
    setVisibility("public");
    setHighlightedText("");
    setCustomTag("");
    setCustomTags([]);
    setCustomImage("");
  };
  
  // Close dialog
  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };
  
  // Content title options based on selected content type
  const getContentOptions = () => {
    switch (contentType) {
      case "journal_entry":
        return journals?.map(journal => ({
          id: journal.id,
          title: journal.title || `Journal Entry ${journal.id}`,
        })) || [];
      case "drill":
        return drills?.map(drill => ({
          id: drill.id,
          title: drill.name,
        })) || [];
      case "feedback":
        return feedback?.map(feed => ({
          id: feed.id,
          title: feed.title || `Feedback ${feed.id}`,
        })) || [];
      default:
        return [];
    }
  };
  
  // Add a tag
  const handleAddTag = () => {
    if (customTag && !customTags.includes(customTag)) {
      setCustomTags([...customTags, customTag]);
      setCustomTag("");
    }
  };
  
  // Remove a tag
  const handleRemoveTag = (tag: string) => {
    setCustomTags(customTags.filter(t => t !== tag));
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contentId) {
      toast({
        title: "Content selection required",
        description: "Please select the content you want to share.",
        variant: "destructive",
      });
      return;
    }
    
    if (!title) {
      toast({
        title: "Title required",
        description: "Please provide a title for your shared content.",
        variant: "destructive",
      });
      return;
    }
    
    shareContentMutation.mutate({
      contentType,
      contentId,
      userId,
      title,
      description: description || undefined,
      visibility: visibility as "public" | "friends" | "private" | "coaches",
      customTags: customTags.length > 0 ? customTags : undefined,
      highlightedText: highlightedText || undefined,
      customImage: customImage || undefined,
    }, {
      onSuccess: () => {
        handleClose();
      },
    });
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{prefilledContent ? "Edit Shared Content" : "Share Content"}</DialogTitle>
          <DialogDescription>
            Share your pickleball journey, insights, and achievements with the community.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Tabs defaultValue="content" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="customize">Customize</TabsTrigger>
              <TabsTrigger value="privacy">Privacy</TabsTrigger>
            </TabsList>
            
            <TabsContent value="content" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="content-type">Content Type</Label>
                <Select
                  value={contentType}
                  onValueChange={value => {
                    setContentType(value);
                    setContentId(undefined);
                  }}
                >
                  <SelectTrigger id="content-type">
                    <SelectValue placeholder="Select content type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="journal_entry">Journal Entry</SelectItem>
                    <SelectItem value="drill">Drill</SelectItem>
                    <SelectItem value="training_plan">Training Plan</SelectItem>
                    <SelectItem value="match_result">Match Result</SelectItem>
                    <SelectItem value="achievement">Achievement</SelectItem>
                    <SelectItem value="sage_insight">SAGE Insight</SelectItem>
                    <SelectItem value="feedback">Feedback</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="content-id">Select Content</Label>
                <Select 
                  value={contentId?.toString()} 
                  onValueChange={value => setContentId(Number(value))}
                >
                  <SelectTrigger id="content-id">
                    <SelectValue placeholder="Select content" />
                  </SelectTrigger>
                  <SelectContent>
                    {getContentOptions().map(option => (
                      <SelectItem key={option.id} value={option.id.toString()}>
                        {option.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Give your post a title"
                  maxLength={100}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Add a description to provide context"
                  rows={3}
                  maxLength={500}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="customize" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="highlighted-text">Highlighted Text (Optional)</Label>
                <Textarea
                  id="highlighted-text"
                  value={highlightedText}
                  onChange={e => setHighlightedText(e.target.value)}
                  placeholder="Add text you want to highlight"
                  rows={3}
                  maxLength={250}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="custom-image">Custom Image URL (Optional)</Label>
                <Input
                  id="custom-image"
                  value={customImage}
                  onChange={e => setCustomImage(e.target.value)}
                  placeholder="Enter image URL"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="custom-tags">Tags (Optional)</Label>
                <div className="flex gap-2">
                  <Input
                    id="custom-tags"
                    value={customTag}
                    onChange={e => setCustomTag(e.target.value)}
                    placeholder="Add tags"
                    onKeyDown={e => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <Button 
                    type="button" 
                    variant="secondary" 
                    onClick={handleAddTag}
                  >
                    Add
                  </Button>
                </div>
                
                {customTags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {customTags.map(tag => (
                      <Badge key={tag} className="flex items-center gap-1">
                        {tag}
                        <button 
                          type="button" 
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 h-4 w-4 rounded-full bg-muted flex items-center justify-center"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="privacy" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="visibility">Visibility</Label>
                <Select value={visibility} onValueChange={setVisibility}>
                  <SelectTrigger id="visibility">
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public (Everyone)</SelectItem>
                    <SelectItem value="friends">Friends Only</SelectItem>
                    <SelectItem value="coaches">Coaches Only</SelectItem>
                    <SelectItem value="private">Private (Only Me)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={shareContentMutation.isPending}
            >
              {shareContentMutation.isPending ? "Sharing..." : "Share"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}