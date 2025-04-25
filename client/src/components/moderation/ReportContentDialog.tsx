/**
 * PKL-278651-SAGE-0011-SOCIAL - Report Content Dialog Component
 * 
 * This component provides a dialog for reporting inappropriate content
 * Part of Sprint 5: Social Features & UI Polish
 */

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle } from "lucide-react";

interface ReportContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentId: number;
  contentType: string;
}

export function ReportContentDialog({
  open,
  onOpenChange,
  contentId,
  contentType,
}: ReportContentDialogProps) {
  const { toast } = useToast();
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Reset form
  const resetForm = () => {
    setReason("");
    setDetails("");
  };
  
  // Handle close
  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };
  
  // Handle report submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason) {
      toast({
        title: "Reason required",
        description: "Please select a reason for your report.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Mock API call for now - will be replaced with actual API integration
    setTimeout(() => {
      toast({
        title: "Report submitted",
        description: "Thank you for helping to keep our community safe.",
      });
      setIsSubmitting(false);
      handleClose();
    }, 1000);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-yellow-500" />
            Report Content
          </DialogTitle>
          <DialogDescription>
            Report this content if it violates our community guidelines.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="report-reason">Reason</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger id="report-reason">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inappropriate">Inappropriate Content</SelectItem>
                <SelectItem value="harassment">Harassment or Bullying</SelectItem>
                <SelectItem value="spam">Spam or Misleading</SelectItem>
                <SelectItem value="violence">Threatening or Violent</SelectItem>
                <SelectItem value="hate_speech">Hate Speech</SelectItem>
                <SelectItem value="misinformation">False Information</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="report-details">Details (Optional)</Label>
            <Textarea
              id="report-details"
              value={details}
              onChange={e => setDetails(e.target.value)}
              placeholder="Provide additional details about your report"
              rows={4}
            />
          </div>
          
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
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}