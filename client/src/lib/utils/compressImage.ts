/**
 * PKL-278651-COMM-0036-MEDIA-COST
 * Client-side Image Compression Utility
 * 
 * This utility provides client-side image compression using the Canvas API
 * to reduce file sizes before upload, optimizing for mobile devices and
 * keeping within size limits to control storage costs.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  targetSizeKB?: number;
  mimeType?: string;
}

/**
 * Compresses an image using the browser's Canvas API
 * 
 * @param file The original image file to compress
 * @param options Compression options
 * @returns Promise resolving to the compressed File
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  // Skip compression for non-image files
  if (!file.type.startsWith('image/')) {
    return file;
  }

  // Skip compression for GIFs to preserve animation
  if (file.type === 'image/gif') {
    return file;
  }

  const {
    maxWidth = 1920,          // Default max width (suitable for most displays)
    maxHeight = 1080,         // Default max height
    quality = 0.85,           // Default quality (good balance between size/quality)
    targetSizeKB = 1800,      // Target 1.8MB (below the 2MB limit)
    mimeType = 'image/jpeg'   // Default output format
  } = options;

  // Create image from the file
  const img = new Image();
  const imgUrl = URL.createObjectURL(file);
  
  try {
    // Load the image
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = imgUrl;
    });

    // Calculate dimensions while maintaining aspect ratio
    let width = img.width;
    let height = img.height;
    
    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width = Math.floor(width * ratio);
      height = Math.floor(height * ratio);
    }

    // Create canvas and draw image
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }
    
    // Draw with white background for images with transparency (like PNG)
    if (file.type === 'image/png') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
    }
    
    ctx.drawImage(img, 0, 0, width, height);
    
    // Try to achieve target size with progressive quality reduction
    let currentQuality = quality;
    let blob: Blob | null = null;
    let attempts = 0;
    const maxAttempts = 5;
    
    while (attempts < maxAttempts) {
      blob = await new Promise<Blob | null>(resolve => {
        canvas.toBlob(
          result => resolve(result),
          mimeType,
          currentQuality
        );
      });
      
      if (!blob) {
        throw new Error('Failed to create blob from canvas');
      }
      
      // If size is acceptable or we can't reduce quality further, break
      if (blob.size <= targetSizeKB * 1024 || currentQuality <= 0.5) {
        break;
      }
      
      // Reduce quality for next attempt
      currentQuality -= 0.1;
      attempts++;
    }
    
    if (!blob) {
      throw new Error('Failed to compress image');
    }
    
    // If compression doesn't save much, keep original
    if (blob.size > file.size * 0.9) {
      return file;
    }
    
    // Create new file from blob
    return new File([blob], file.name, {
      type: mimeType,
      lastModified: file.lastModified
    });
  } finally {
    // Clean up object URL
    URL.revokeObjectURL(imgUrl);
  }
}

/**
 * Batch compress multiple image files
 * 
 * @param files Array of files to compress (only images will be affected)
 * @param options Compression options
 * @returns Promise resolving to array of compressed files
 */
export async function compressImages(
  files: File[],
  options: CompressionOptions = {}
): Promise<File[]> {
  // Process files in parallel for better performance
  const compressedFiles = await Promise.all(
    files.map(async file => {
      if (file.type.startsWith('image/')) {
        try {
          return await compressImage(file, options);
        } catch (error) {
          console.warn('Image compression failed, using original:', error);
          return file;
        }
      }
      return file;
    })
  );
  
  return compressedFiles;
}