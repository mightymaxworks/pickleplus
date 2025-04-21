/**
 * PKL-278651-COMM-0036-MODAL
 * Media Upload Modal
 * 
 * Modal dialog for uploading media files directly from community page
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { MediaUploader } from "./MediaUploader";

interface MediaUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  communityId: number;
}

export function MediaUploadModal({ isOpen, onClose, communityId }: MediaUploadModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Media</DialogTitle>
          <DialogDescription>
            Upload photos, videos, or documents to share with the community
          </DialogDescription>
        </DialogHeader>
        
        <MediaUploader 
          communityId={communityId} 
          onUploadComplete={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}