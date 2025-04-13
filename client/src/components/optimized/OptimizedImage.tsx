/**
 * PKL-278651-PERF-0001.5-SIZE
 * Optimized Image Component
 * 
 * This component demonstrates using the bundle and asset optimization 
 * utilities to create a highly efficient image component.
 */

import { useState, useEffect, ImgHTMLAttributes } from 'react';
import { useLazyImage, deviceCapabilities, getOptimizedImagePath } from '@/utils/assetOptimizer';
import { errorTracking } from '@/utils/bundleOptimizer';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'onLoad' | 'src'> {
  src: string;
  lowQualitySrc?: string;
  fallbackSrc?: string;
  aspectRatio?: number;
  lazyLoad?: boolean;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  blurhash?: string;
}

/**
 * A highly optimized image component that:
 * - Uses appropriate image format based on browser support
 * - Handles lazy loading with IntersectionObserver
 * - Provides low-quality image placeholder
 * - Handles errors with fallbacks
 * - Respects reduced motion preferences
 * - Optimizes for connection speed
 */
export function OptimizedImage({
  src,
  lowQualitySrc,
  fallbackSrc,
  aspectRatio,
  lazyLoad = true,
  priority = false,
  alt = '',
  className,
  onLoad,
  onError,
  blurhash,
  ...props
}: OptimizedImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showBlurhash, setShowBlurhash] = useState(!!blurhash);
  
  // Get connection-optimized image quality
  const imageQuality = 
    deviceCapabilities.connectionType === 'slow' 
      ? 'low' 
      : deviceCapabilities.connectionType === 'fast' && deviceCapabilities.isHighPerformance
        ? 'high'
        : 'medium';
  
  // Get optimized image path
  const optimizedSrc = getOptimizedImagePath(src, {
    quality: imageQuality,
    supportsAnimation: !deviceCapabilities.preferReducedMotion
  });
  
  // For high priority images, don't use lazy loading
  const { currentSrc, isLoaded: isLazyLoaded, ref } = useLazyImage(
    optimizedSrc,
    { rootMargin: '200px' }
  );
  
  // Determine which source to use
  const imageSrc = !lazyLoad || priority
    ? optimizedSrc
    : currentSrc || (lowQualitySrc ?? '');
  
  const finalSrc = hasError ? (fallbackSrc || '') : imageSrc;
  
  // Handle errors
  const handleError = () => {
    if (!hasError && fallbackSrc) {
      setHasError(true);
      errorTracking.captureError(new Error(`Failed to load image: ${src}`), {
        component: 'OptimizedImage', 
        originalSrc: src
      });
      onError?.();
    }
  };
  
  // Handle successful load
  const handleLoad = () => {
    setIsLoaded(true);
    setShowBlurhash(false);
    onLoad?.();
  };
  
  // Calculate padding based on aspect ratio for consistent layout
  const paddingBottom = aspectRatio ? `${(1 / aspectRatio) * 100}%` : undefined;
  
  // Effect to preload high priority images
  useEffect(() => {
    if (priority && optimizedSrc) {
      const img = new Image();
      img.src = optimizedSrc;
      img.onload = handleLoad;
      img.onerror = handleError;
    }
  }, [priority, optimizedSrc]);
  
  return (
    <div 
      className={cn(
        "relative overflow-hidden", 
        isLoaded ? "bg-transparent" : "bg-muted/30",
        className
      )} 
      style={{ paddingBottom, height: paddingBottom ? 0 : undefined }}
      ref={lazyLoad && !priority ? ref : undefined}
    >
      {/* Blurhash placeholder */}
      {showBlurhash && blurhash && (
        <div 
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-300"
          style={{ 
            backgroundImage: `url(${blurhash})`,
            opacity: isLoaded ? 0 : 1
          }} 
        />
      )}
      
      {/* Actual image */}
      {finalSrc && (
        <img
          src={finalSrc}
          alt={alt}
          className={cn(
            "transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0",
            aspectRatio ? "absolute inset-0 h-full w-full object-cover" : "w-full"
          )}
          loading={priority ? "eager" : "lazy"}
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />
      )}
      
      {/* Loading skeleton */}
      {!isLoaded && !showBlurhash && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/30">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent text-primary" />
        </div>
      )}
    </div>
  );
}

export default OptimizedImage;