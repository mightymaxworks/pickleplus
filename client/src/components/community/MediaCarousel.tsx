/**
 * PKL-278651-COMM-0036-MEDIA-MOBILE
 * Media Carousel Component
 * 
 * A touch-friendly carousel specifically designed for mobile media browsing
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { ResponsiveImage } from './ResponsiveImage';
import { X, Maximize2, Plus, Download, Info } from 'lucide-react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Badge } from '@/components/ui/badge';
import { MediaType } from '@/lib/hooks/useMedia';
import { formatBytes } from '@/lib/utils/quotaUtils';

interface Media {
  id: number;
  title: string;
  description: string | null;
  filePath: string;
  thumbnailPath: string | null;
  mediaType: MediaType;
  fileSizeBytes: number;
  tags: string[];
  isFeatured?: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
}

interface MediaCarouselProps {
  mediaItems: Media[];
  initialIndex?: number;
  onClose?: () => void;
  communityId: number;
}

export function MediaCarousel({ mediaItems, initialIndex = 0, onClose, communityId }: MediaCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [infoOpen, setInfoOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  
  const isMobile = useMediaQuery('(max-width: 640px)');
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  
  const currentItem = mediaItems[currentIndex];
  
  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setCurrentIndex(prev => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === 'ArrowRight') {
        setCurrentIndex(prev => (prev < mediaItems.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'Escape') {
        if (onClose) onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mediaItems.length, onClose]);
  
  // Handle fullscreen
  useEffect(() => {
    if (!document.fullscreenElement && fullscreen) {
      setFullscreen(false);
    }
  }, [fullscreen]);
  
  const toggleFullscreen = async () => {
    if (!fullscreen) {
      if (carouselRef.current && carouselRef.current.requestFullscreen) {
        await carouselRef.current.requestFullscreen();
        setFullscreen(true);
      }
    } else if (document.exitFullscreen) {
      await document.exitFullscreen();
      setFullscreen(false);
    }
  };
  
  // Download current image
  const downloadImage = async () => {
    if (!currentItem) return;
    
    try {
      const response = await fetch(currentItem.filePath);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Create a link and trigger download
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      
      // Extract filename from path or use title
      const filename = currentItem.filePath.split('/').pop() || 
                       `${currentItem.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.jpg`;
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  return (
    <div className="relative bg-background h-full max-h-screen flex flex-col" ref={carouselRef}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-medium">
            {currentIndex + 1} / {mediaItems.length}
          </h3>
          {currentItem?.title && (
            <span className="hidden md:inline ml-2 text-muted-foreground truncate max-w-[300px]">
              {currentItem.title}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
            <Maximize2 className="h-5 w-5" />
          </Button>
          
          <Dialog open={infoOpen} onOpenChange={setInfoOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Info className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              {currentItem && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">{currentItem.title}</h3>
                  
                  {currentItem.description && (
                    <p className="text-muted-foreground">{currentItem.description}</p>
                  )}
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-muted-foreground">Type</div>
                    <div className="font-medium capitalize">{currentItem.mediaType}</div>
                    
                    <div className="text-muted-foreground">Size</div>
                    <div className="font-medium">{formatBytes(currentItem.fileSizeBytes)}</div>
                    
                    <div className="text-muted-foreground">Uploaded</div>
                    <div className="font-medium">{formatDate(currentItem.createdAt)}</div>
                  </div>
                  
                  {currentItem.tags && currentItem.tags.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">Tags</div>
                      <div className="flex flex-wrap gap-2">
                        {currentItem.tags.map(tag => (
                          <Badge key={tag} variant="secondary">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <Button className="w-full" onClick={downloadImage}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
          
          <Button variant="ghost" size="icon" onClick={downloadImage}>
            <Download className="h-5 w-5" />
          </Button>
          
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
      
      {/* Carousel */}
      <div className="flex-1 overflow-hidden">
        <Carousel
          className="h-full"
          orientation={isMobile ? "horizontal" : "horizontal"}
          opts={{
            align: "center",
            loop: true,
          }}
          onSelect={(index) => setCurrentIndex(index)}
          defaultIndex={initialIndex}
        >
          <CarouselContent className="h-full">
            {mediaItems.map((item, index) => (
              <CarouselItem key={item.id} className="h-full flex items-center justify-center p-2">
                <div className="relative h-full w-full flex items-center justify-center">
                  {item.mediaType === MediaType.IMAGE ? (
                    <ResponsiveImage
                      src={item.filePath}
                      alt={item.title}
                      objectFit="contain"
                      className="max-h-full rounded-md"
                    />
                  ) : item.mediaType === MediaType.VIDEO ? (
                    <video
                      src={item.filePath}
                      controls
                      className="max-h-full max-w-full rounded-md"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-8 bg-muted rounded-md">
                      <div className="text-4xl mb-4">📄</div>
                      <p className="text-center">{item.title}</p>
                      <a
                        href={item.filePath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 text-primary hover:underline"
                      >
                        Open document
                      </a>
                    </div>
                  )}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          
          {!isMobile && (
            <>
              <CarouselPrevious className="left-4" />
              <CarouselNext className="right-4" />
            </>
          )}
        </Carousel>
      </div>
      
      {/* Thumbnails strip - shown only on larger screens */}
      {isDesktop && mediaItems.length > 1 && (
        <div className="h-24 overflow-x-auto border-t">
          <div className="flex p-2 gap-2">
            {mediaItems.map((item, index) => (
              <div
                key={`thumb-${item.id}`}
                className={`relative h-16 w-16 flex-shrink-0 cursor-pointer rounded-md overflow-hidden transition-all ${
                  index === currentIndex ? 'ring-2 ring-primary' : 'opacity-70 hover:opacity-100'
                }`}
                onClick={() => setCurrentIndex(index)}
              >
                <ResponsiveImage
                  src={item.thumbnailPath || item.filePath}
                  alt={`Thumbnail ${index + 1}`}
                  objectFit="cover"
                  className="h-full w-full"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function MediaCarouselDialog({
  mediaItems,
  trigger,
  initialIndex = 0,
  communityId
}: {
  mediaItems: Media[];
  trigger: React.ReactNode;
  initialIndex?: number;
  communityId: number;
}) {
  const [open, setOpen] = useState(false);
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-7xl w-[95vw] h-[90vh] p-0">
        <MediaCarousel
          mediaItems={mediaItems}
          initialIndex={initialIndex}
          onClose={() => setOpen(false)}
          communityId={communityId}
        />
      </DialogContent>
    </Dialog>
  );
}