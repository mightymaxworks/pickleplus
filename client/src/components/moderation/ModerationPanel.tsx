/**
 * PKL-278651-COMM-0029-MOD - Moderation Panel Component
 * Implementation timestamp: 2025-04-20 23:05 ET
 * 
 * Panel for community moderators to manage moderation tasks
 * Framework 5.2 compliant implementation
 */

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { moderationService } from "@/lib/api/community/moderation-service";
import { ReportList } from "./ReportList";
import { PendingContentList } from "./PendingContentList";
import { FilterSettings } from "./FilterSettings";

interface ModerationPanelProps {
  communityId: number;
}

/**
 * Moderation Panel component for community moderators
 */
export function ModerationPanel({ communityId }: ModerationPanelProps) {
  const [activeTab, setActiveTab] = useState("reports");

  // Fetch reports
  const reportsQuery = useQuery({
    queryKey: ['/api/communities', communityId, 'moderation/reports'],
    queryFn: () => moderationService.getReports(communityId),
    enabled: activeTab === "reports" || activeTab === "all",
  });

  // Fetch pending content items
  const pendingContentQuery = useQuery({
    queryKey: ['/api/communities', communityId, 'moderation/approval-queue'],
    queryFn: () => moderationService.getPendingContentItems(communityId),
    enabled: activeTab === "pending" || activeTab === "all",
  });

  // Fetch filter settings
  const filterSettingsQuery = useQuery({
    queryKey: ['/api/communities', communityId, 'moderation/filter-settings'],
    queryFn: () => moderationService.getContentFilterSettings(communityId),
    enabled: activeTab === "settings" || activeTab === "all",
  });

  // Count of pending items
  const pendingReportsCount = reportsQuery.data?.filter(r => r.status === 'pending')?.length || 0;
  const pendingContentCount = pendingContentQuery.data?.length || 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Community Moderation</CardTitle>
        <CardDescription>
          Manage reports, review content, and update moderation settings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="reports" className="relative">
              Reports
              {pendingReportsCount > 0 && (
                <Badge variant="destructive" className="absolute -top-2 -right-2 text-xs">
                  {pendingReportsCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="pending" className="relative">
              Pending Content
              {pendingContentCount > 0 && (
                <Badge variant="destructive" className="absolute -top-2 -right-2 text-xs">
                  {pendingContentCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="settings">
              Filter Settings
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="reports" className="mt-4">
            {reportsQuery.isPending ? (
              <div className="text-center py-4">Loading reports...</div>
            ) : reportsQuery.isError ? (
              <div className="text-center py-4 text-red-500">
                Error loading reports: {reportsQuery.error.toString()}
              </div>
            ) : (
              <ReportList 
                reports={reportsQuery.data || []} 
                communityId={communityId}
                onReportReviewed={() => reportsQuery.refetch()}
              />
            )}
          </TabsContent>
          
          <TabsContent value="pending" className="mt-4">
            {pendingContentQuery.isPending ? (
              <div className="text-center py-4">Loading pending content...</div>
            ) : pendingContentQuery.isError ? (
              <div className="text-center py-4 text-red-500">
                Error loading pending content: {pendingContentQuery.error.toString()}
              </div>
            ) : (
              <PendingContentList 
                pendingItems={pendingContentQuery.data || []} 
                communityId={communityId}
                onItemReviewed={() => pendingContentQuery.refetch()}
              />
            )}
          </TabsContent>
          
          <TabsContent value="settings" className="mt-4">
            {filterSettingsQuery.isPending ? (
              <div className="text-center py-4">Loading filter settings...</div>
            ) : filterSettingsQuery.isError ? (
              <div className="text-center py-4 text-red-500">
                Error loading filter settings: {filterSettingsQuery.error.toString()}
              </div>
            ) : (
              <FilterSettings 
                settings={filterSettingsQuery.data} 
                communityId={communityId}
                onSettingsUpdated={() => filterSettingsQuery.refetch()}
              />
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default ModerationPanel;