/**
 * PKL-278651-PERF-0001.5-SIZE
 * Asset Optimization Utilities
 * 
 * This file provides utilities for optimizing asset loading and rendering,
 * particularly for images, icons, and media files.
 */

import { useEffect, useState } from 'react';

/**
 * Device capability detection
 */
export const deviceCapabilities = {
  get isHighPerformance(): boolean {
    if (typeof window === 'undefined') return false;
    
    // Check if device is high-end based on memory and hardware concurrency
    const memory = (navigator as any).deviceMemory || 4; // Default to mid-range if not available
    const cores = navigator.hardwareConcurrency || 4; // Default to mid-range if not available
    
    return memory >= 4 && cores >= 4;
  },
  
  get supportsWebP(): boolean {
    if (typeof window === 'undefined') return false;
    
    // Check for WebP support
    const canvas = document.createElement('canvas');
    if (canvas.getContext && canvas.getContext('2d')) {
      return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }
    return false;
  },
  
  get supportsAvif(): boolean {
    // This would typically check for AVIF support
    // For now, default to false as browser support is still limited
    return false;
  },
  
  get connectionType(): 'slow' | 'medium' | 'fast' {
    if (typeof window === 'undefined') return 'medium';
    
    // Check connection type if available
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      
      if (connection) {
        if (connection.saveData) return 'slow'; // Data saver is enabled
        
        if (connection.effectiveType) {
          if (connection.effectiveType === '4g') return 'fast';
          if (connection.effectiveType === '3g') return 'medium';
          return 'slow'; // 2g or slower
        }
      }
    }
    
    return 'medium'; // Default to medium if cannot determine
  },
  
  get preferReducedMotion(): boolean {
    if (typeof window === 'undefined') return false;
    
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
};

/**
 * Optimized image path based on device capabilities
 */
export function getOptimizedImagePath(
  imagePath: string,
  options: {
    quality?: 'low' | 'medium' | 'high';
    supportsAnimation?: boolean;
  } = {}
): string {
  const { quality = 'medium', supportsAnimation = true } = options;
  
  if (!imagePath) return '';
  
  // Extract path parts
  const lastDotIndex = imagePath.lastIndexOf('.');
  const basePath = lastDotIndex !== -1 ? imagePath.substring(0, lastDotIndex) : imagePath;
  const extension = lastDotIndex !== -1 ? imagePath.substring(lastDotIndex + 1) : '';
  
  // Determine best format
  let newExtension = extension;
  if (deviceCapabilities.supportsAvif) {
    newExtension = 'avif';
  } else if (deviceCapabilities.supportsWebP && extension !== 'gif') {
    newExtension = 'webp';
  } else if (extension === 'gif' && !supportsAnimation) {
    // If animation not needed, convert GIF to static format
    newExtension = deviceCapabilities.supportsWebP ? 'webp' : 'png';
  }
  
  // Determine quality suffix
  let qualitySuffix = '';
  if (quality === 'low') {
    qualitySuffix = '-low';
  } else if (quality === 'high' && deviceCapabilities.isHighPerformance) {
    qualitySuffix = '-high';
  }
  
  // Build optimized path - this assumes your build process generates these variants
  // If the optimized version doesn't exist, it will fall back to the original
  const optimizedPath = `${basePath}${qualitySuffix}.${newExtension}`;
  
  // This would need error handling in a real implementation to fall back if the file doesn't exist
  return optimizedPath;
}

/**
 * Hook to handle adaptive loading based on device capabilities
 */
export function useAdaptiveLoading<T>(
  highQualityLoader: () => Promise<T>,
  lowQualityLoader: () => Promise<T>
): { data: T | null; isLoading: boolean; error: Error | null } {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Choose which loader to use based on device and connection
        const shouldUseHighQuality = 
          deviceCapabilities.isHighPerformance && 
          deviceCapabilities.connectionType !== 'slow';
        
        const loader = shouldUseHighQuality ? highQualityLoader : lowQualityLoader;
        const result = await loader();
        
        setData(result);
        setError(null);
      } catch (err) {
        console.error('Error in adaptive loading:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [highQualityLoader, lowQualityLoader]);
  
  return { data, isLoading, error };
}

/**
 * Preload critical assets
 */
export function preloadCriticalAssets(assetUrls: string[]): void {
  if (typeof window === 'undefined') return;
  
  assetUrls.forEach(url => {
    const linkElement = document.createElement('link');
    linkElement.rel = 'preload';
    
    // Determine correct 'as' attribute based on file extension
    if (url.endsWith('.js')) {
      linkElement.as = 'script';
    } else if (url.endsWith('.css')) {
      linkElement.as = 'style';
    } else if (/\.(jpe?g|png|gif|webp|avif|svg)$/i.test(url)) {
      linkElement.as = 'image';
    } else if (/\.(woff2?|ttf|otf|eot)$/i.test(url)) {
      linkElement.as = 'font';
      linkElement.crossOrigin = 'anonymous';
    }
    
    linkElement.href = url;
    document.head.appendChild(linkElement);
  });
}

/**
 * Lazily load images with IntersectionObserver
 */
export function useLazyImage(
  src: string,
  options: { threshold?: number; rootMargin?: string } = {}
): { currentSrc: string; isLoaded: boolean; ref: (node: HTMLElement | null) => void } {
  const [currentSrc, setCurrentSrc] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [observer, setObserver] = useState<IntersectionObserver | null>(null);
  
  const ref = (node: HTMLElement | null) => {
    if (observer) {
      observer.disconnect();
    }
    
    if (!node) return;
    
    const newObserver = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          setCurrentSrc(src);
          newObserver.disconnect();
        }
      },
      {
        threshold: options.threshold || 0,
        rootMargin: options.rootMargin || '0px'
      }
    );
    
    newObserver.observe(node);
    setObserver(newObserver);
  };
  
  useEffect(() => {
    if (currentSrc) {
      const img = new Image();
      img.src = currentSrc;
      img.onload = () => setIsLoaded(true);
    }
    
    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [currentSrc, observer]);
  
  return { currentSrc, isLoaded, ref };
}