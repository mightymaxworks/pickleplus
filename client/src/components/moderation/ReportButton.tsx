/**
 * PKL-278651-COMM-0029-MOD - Report Button Component
 * Implementation timestamp: 2025-04-20 23:45 ET
 * 
 * Reusable button for reporting content
 * Framework 5.2 compliant implementation
 */

import React, { useState } from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { Flag } from "lucide-react";
import { ReportContentDialog } from "./ReportContentDialog";

interface ReportButtonProps extends Omit<ButtonProps, "onClick"> {
  contentId: number;
  contentType: 'post' | 'comment' | 'event';
  communityId: number;
  variant?: "default" | "outline" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  onReportComplete?: () => void;
}

/**
 * Reusable button component that opens a report dialog
 * Use this component anywhere content can be reported
 */
export function ReportButton({
  contentId,
  contentType,
  communityId,
  variant = "ghost",
  size = "icon",
  onReportComplete,
  ...props
}: ReportButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setDialogOpen(true)}
        title="Report content"
        {...props}
      >
        {size === "icon" ? (
          <Flag className="h-4 w-4" />
        ) : (
          <>
            <Flag className="mr-2 h-4 w-4" />
            Report
          </>
        )}
      </Button>

      <ReportContentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        contentId={contentId}
        contentType={contentType}
        communityId={communityId}
        onReportComplete={onReportComplete}
      />
    </>
  );
}

export default ReportButton;