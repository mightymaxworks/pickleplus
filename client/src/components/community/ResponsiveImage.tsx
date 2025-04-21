/**
 * PKL-278651-COMM-0036-MEDIA-CACHE
 * Responsive Image Component with Lazy Loading
 * 
 * Optimizes images for different screen sizes and implements cache-friendly
 * loading patterns
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

import React, { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  quality?: number;
  onLoad?: () => void;
  onClick?: () => void;
}

export function ResponsiveImage({
  src,
  alt,
  className = '',
  width,
  height,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  priority = false,
  objectFit = 'cover',
  quality = 80,
  onLoad,
  onClick
}: ResponsiveImageProps) {
  const [isLoading, setIsLoading] = useState(!priority);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [error, setError] = useState(false);
  
  // Generate srcset for responsive images
  const generateSrcSet = () => {
    // Check if the image is from our media API
    if (src.includes('/api/community/') && src.includes('/media/')) {
      // For our media API, we can add width parameters
      const baseSrc = src.split('?')[0]; // Remove any existing query params
      return [320, 640, 960, 1280, 1920]
        .map(w => `${baseSrc}?width=${w}&quality=${quality} ${w}w`)
        .join(', ');
    }
    
    // For external or static images, just return the original
    return '';
  };
  
  // Handle image loading
  useEffect(() => {
    if (!src) return;
    
    // If priority, load immediately
    if (priority) {
      setImgSrc(src);
      return;
    }
    
    // Use Intersection Observer for lazy loading
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setImgSrc(src);
          observer.disconnect();
        }
      });
    });
    
    // Get a reference to a div that we'll track for intersection
    const element = document.getElementById(`image-container-${src.replace(/[^a-zA-Z0-9]/g, '-')}`);
    if (element) {
      observer.observe(element);
    }
    
    return () => {
      observer.disconnect();
    };
  }, [src, priority]);
  
  // Create an id for the container based on the src
  const containerId = `image-container-${src.replace(/[^a-zA-Z0-9]/g, '-')}`;
  
  const handleImageLoad = () => {
    setIsLoading(false);
    if (onLoad) onLoad();
  };
  
  const handleImageError = () => {
    setIsLoading(false);
    setError(true);
  };
  
  const srcSet = generateSrcSet();
  
  return (
    <div 
      id={containerId}
      className={`relative overflow-hidden ${className}`}
      style={{ position: 'relative', width: width ? `${width}px` : '100%', height: height ? `${height}px` : 'auto' }}
      onClick={onClick}
    >
      {isLoading && (
        <Skeleton className="absolute inset-0 w-full h-full" />
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
          <span className="text-sm text-muted-foreground">Failed to load image</span>
        </div>
      )}
      
      {imgSrc && !error && (
        <img
          src={imgSrc}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          onLoad={handleImageLoad}
          onError={handleImageError}
          className={`w-full h-full transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          style={{ objectFit }}
        />
      )}
    </div>
  );
}