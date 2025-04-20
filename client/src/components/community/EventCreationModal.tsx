/**
 * PKL-278651-COMM-0015-EVENT
 * Event Creation Modal
 * 
 * This component provides a modal dialog for creating new community events.
 * 
 * @version 1.0.0
 * @lastModified 2025-04-17
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { EventCreationForm } from "./EventCreationForm";
import { useState } from "react";

interface EventCreationModalProps {
  communityId: number;
  trigger?: React.ReactNode;
  onEventCreated?: () => void;
}

export function EventCreationModal({
  communityId,
  trigger,
  onEventCreated,
}: EventCreationModalProps) {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
    onEventCreated?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-1 whitespace-nowrap text-sm">
            <PlusCircle className="h-4 w-4" />
            <span>Create Event</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-left">
          <DialogTitle>Create New Event</DialogTitle>
          <DialogDescription>
            Create a new event for your community members to join.
          </DialogDescription>
        </DialogHeader>
        <EventCreationForm 
          communityId={communityId} 
          onSuccess={handleSuccess}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}