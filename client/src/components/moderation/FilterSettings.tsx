/**
 * PKL-278651-COMM-0029-MOD - Filter Settings Component
 * Implementation timestamp: 2025-04-20 23:35 ET
 * 
 * Component for managing community content filter settings
 * Framework 5.2 compliant implementation
 */

import React, { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { moderationService } from "@/lib/api/community/moderation-service";

interface ContentFilterSettings {
  id: number;
  communityId: number;
  enabledFilters: any;
  bannedKeywords: string;
  sensitiveContentTypes: string;
  requireApproval: boolean;
  autoModEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FilterSettingsProps {
  settings?: ContentFilterSettings;
  communityId: number;
  onSettingsUpdated: () => void;
}

export function FilterSettings({ settings, communityId, onSettingsUpdated }: FilterSettingsProps) {
  const { toast } = useToast();
  
  // Local state for form
  const [requireApproval, setRequireApproval] = useState(false);
  const [autoModEnabled, setAutoModEnabled] = useState(true);
  const [bannedKeywordsText, setBannedKeywordsText] = useState('');
  const [sensitiveContentTypesText, setSensitiveContentTypesText] = useState('');
  
  // Initialize form with settings
  useEffect(() => {
    if (settings) {
      setRequireApproval(settings.requireApproval);
      setAutoModEnabled(settings.autoModEnabled);
      
      try {
        // Try to parse the JSON strings
        const bannedKeywords = JSON.parse(settings.bannedKeywords);
        setBannedKeywordsText(Array.isArray(bannedKeywords) ? bannedKeywords.join('\n') : '');
        
        const sensitiveTypes = JSON.parse(settings.sensitiveContentTypes);
        setSensitiveContentTypesText(Array.isArray(sensitiveTypes) ? sensitiveTypes.join('\n') : '');
      } catch (e) {
        console.error('Error parsing filter settings JSON:', e);
        setBannedKeywordsText('');
        setSensitiveContentTypesText('');
      }
    }
  }, [settings]);

  // Mutation for updating settings
  const updateMutation = useMutation({
    mutationFn: async () => {
      // Convert newline-separated values to arrays, then to JSON strings
      const bannedKeywords = bannedKeywordsText
        .split('\n')
        .map(k => k.trim())
        .filter(k => k.length > 0);
        
      const sensitiveContentTypes = sensitiveContentTypesText
        .split('\n')
        .map(t => t.trim())
        .filter(t => t.length > 0);
      
      return await moderationService.updateContentFilterSettings(communityId, {
        requireApproval,
        autoModEnabled,
        bannedKeywords: JSON.stringify(bannedKeywords),
        sensitiveContentTypes: JSON.stringify(sensitiveContentTypes)
      });
    },
    onSuccess: () => {
      toast({
        title: "Settings updated",
        description: "Content filter settings have been updated successfully.",
      });
      if (onSettingsUpdated) {
        onSettingsUpdated();
      }
    },
    onError: (error) => {
      toast({
        title: "Failed to update settings",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
  });

  if (!settings) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading filter settings...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Content Filter Settings</h3>
      
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="requireApproval">Require Content Approval</Label>
                  <p className="text-sm text-muted-foreground">
                    All new content will require moderator approval before becoming visible.
                  </p>
                </div>
                <Switch
                  id="requireApproval"
                  checked={requireApproval}
                  onCheckedChange={setRequireApproval}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="autoModEnabled">Auto-Moderation</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically filter content based on the rules below.
                  </p>
                </div>
                <Switch
                  id="autoModEnabled"
                  checked={autoModEnabled}
                  onCheckedChange={setAutoModEnabled}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="banned-keywords">
            <AccordionTrigger>Banned Keywords</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Enter one keyword per line. Content containing these words will be flagged or blocked.
                </p>
                <Textarea
                  placeholder="Enter banned keywords, one per line"
                  value={bannedKeywordsText}
                  onChange={(e) => setBannedKeywordsText(e.target.value)}
                  rows={5}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="sensitive-content-types">
            <AccordionTrigger>Sensitive Content Types</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Enter content types that require special attention, one per line (e.g., 'event', 'post').
                </p>
                <Textarea
                  placeholder="Enter sensitive content types, one per line"
                  value={sensitiveContentTypesText}
                  onChange={(e) => setSensitiveContentTypesText(e.target.value)}
                  rows={3}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        
        <div className="flex justify-end">
          <Button
            onClick={() => updateMutation.mutate()}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default FilterSettings;