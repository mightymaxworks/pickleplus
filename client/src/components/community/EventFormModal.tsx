/**
 * PKL-278651-COMM-0007-ENGAGE - Event Form Modal
 * 
 * This component provides a modal dialog for creating or editing community events
 * using the enhanced EventForm component.
 * 
 * @version 1.0.0
 * @lastModified 2025-04-17
 */
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { EventForm } from "./EventForm";
import { useCreateCommunityEvent } from "@/lib/hooks/useCommunity";
import { type InsertCommunityEvent } from "@shared/schema/community";

interface EventFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  communityId: number;
  existingEvent?: InsertCommunityEvent;
  onSuccess?: () => void;
}

export function EventFormModal({
  open,
  onOpenChange,
  communityId,
  existingEvent,
  onSuccess,
}: EventFormModalProps) {
  const createEvent = useCreateCommunityEvent();
  
  const handleSubmit = async (formData: any) => {
    try {
      await createEvent.mutateAsync({
        communityId,
        data: {
          ...formData,
          // Convert the Date objects to ISO strings for the API
          eventDate: formData.eventDate.toISOString(),
          endDate: formData.endDate ? formData.endDate.toISOString() : undefined,
        },
      });
      
      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Failed to create event:", error);
    }
  };
  
  // Format dates for the form if editing an existing event
  const formDefaults = existingEvent
    ? {
        ...existingEvent,
        eventDate: existingEvent.eventDate ? new Date(existingEvent.eventDate) : new Date(),
        endDate: existingEvent.endDate ? new Date(existingEvent.endDate) : undefined,
        // Ensure null values are converted to undefined to avoid type issues
        maxAttendees: existingEvent.maxAttendees || undefined,
        minSkillLevel: existingEvent.minSkillLevel || undefined,
        maxSkillLevel: existingEvent.maxSkillLevel || undefined,
      }
    : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {existingEvent ? "Edit Event" : "Create New Event"}
          </DialogTitle>
          <DialogDescription>
            {existingEvent
              ? "Update the details of your community event"
              : "Fill out the form to create a new community event"}
          </DialogDescription>
        </DialogHeader>
        <EventForm
          communityId={communityId}
          defaultValues={formDefaults}
          onSubmit={handleSubmit}
          isSubmitting={createEvent.isPending}
        />
      </DialogContent>
    </Dialog>
  );
}