/**
 * PKL-278651-COMM-0036-MEDIA-COMPRESS
 * Image Compression Utility
 * 
 * Client-side image compression using Canvas API to reduce upload size
 * and bandwidth usage, especially critical for mobile users
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

/**
 * Compression options for images
 */
export interface CompressionOptions {
  /**
   * Maximum width in pixels
   * Set to 0 to maintain aspect ratio based on height
   */
  maxWidth?: number;
  
  /**
   * Maximum height in pixels
   * Set to 0 to maintain aspect ratio based on width
   */
  maxHeight?: number;
  
  /**
   * JPEG quality (0-1)
   * Lower values = smaller file size but lower quality
   */
  quality?: number;
  
  /**
   * Target format (defaults to the original format where possible)
   */
  format?: 'jpeg' | 'png' | 'webp';
  
  /**
   * Maintain EXIF data like orientation (jpeg only)
   */
  preserveExif?: boolean;
  
  /**
   * Adapt compression based on image content
   * Reduces quality more for images with less detail
   */
  adaptiveCompression?: boolean;
}

/**
 * Compression result with metadata
 */
export interface CompressionResult {
  /** Compressed file object */
  file: File;
  /** Original size in bytes */
  originalSize: number;
  /** Compressed size in bytes */
  compressedSize: number;
  /** Compression ratio (e.g., 0.5 means 50% of original size) */
  compressionRatio: number;
  /** Width of the compressed image */
  width: number;
  /** Height of the compressed image */
  height: number;
  /** Format of the compressed image */
  format: string;
  /** The quality setting used (0-1) */
  qualityUsed: number;
}

/**
 * Default options for image compression
 */
const DEFAULT_OPTIONS: CompressionOptions = {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 0.8,
  format: 'jpeg',
  preserveExif: true,
  adaptiveCompression: true
};

/**
 * Analyze image complexity to determine optimal quality
 * @param imageData Canvas image data
 * @returns Complexity score (0-1)
 */
function analyzeImageComplexity(imageData: ImageData): number {
  const data = imageData.data;
  const totalPixels = imageData.width * imageData.height;
  
  // Sample pixels (analyze every 10th pixel for performance)
  let pixelDifferences = 0;
  let sampleSize = 0;
  
  for (let i = 0; i < data.length; i += 40) { // Step by 40 (10 pixels × 4 channels)
    if (i + 40 < data.length) {
      // Compare adjacent pixels
      const diff = 
        Math.abs(data[i] - data[i + 4]) +
        Math.abs(data[i + 1] - data[i + 5]) +
        Math.abs(data[i + 2] - data[i + 6]);
      
      pixelDifferences += diff;
      sampleSize++;
    }
  }
  
  // Calculate complexity score (0-1)
  // Higher values indicate more complex images with more detail
  const normalizedScore = Math.min(1, pixelDifferences / (sampleSize * 765)); // 765 = 255 * 3 channels (max diff)
  return normalizedScore;
}

/**
 * Compress an image using Canvas API
 * @param file Original image file
 * @param options Compression options
 * @returns Promise with compression result
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  // Merge with default options
  const settings = { ...DEFAULT_OPTIONS, ...options };
  
  return new Promise((resolve, reject) => {
    const originalSize = file.size;
    
    // Create file reader to load image
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      // Create image element to get dimensions
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        // Determine new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        
        // Scale down if needed
        if (settings.maxWidth && settings.maxHeight) {
          if (width > settings.maxWidth) {
            height = (height * settings.maxWidth) / width;
            width = settings.maxWidth;
          }
          
          if (height > settings.maxHeight) {
            width = (width * settings.maxHeight) / height;
            height = settings.maxHeight;
          }
        } else if (settings.maxWidth && width > settings.maxWidth) {
          height = (height * settings.maxWidth) / width;
          width = settings.maxWidth;
        } else if (settings.maxHeight && height > settings.maxHeight) {
          width = (width * settings.maxHeight) / height;
          height = settings.maxHeight;
        }
        
        // Round dimensions
        width = Math.round(width);
        height = Math.round(height);
        
        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        // Draw image to canvas
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // For adaptive compression, analyze image complexity
        let quality = settings.quality || 0.8;
        
        if (settings.adaptiveCompression) {
          // Get image data for analysis
          const imageData = ctx.getImageData(0, 0, width, height);
          const complexity = analyzeImageComplexity(imageData);
          
          // Adjust quality based on complexity
          // Less complex images (like screenshots) can be compressed more
          // Images with more detail need higher quality
          const baseQuality = settings.quality || 0.8;
          quality = baseQuality * (0.7 + (complexity * 0.3));
          
          // Ensure quality remains within reasonable bounds
          quality = Math.max(0.5, Math.min(quality, 0.95));
        }
        
        // Determine output format
        let format = settings.format || 'jpeg';
        const origFormat = file.type.split('/')[1];
        
        // If no format specified, try to keep original (except for BMP, TIFF which we'll convert)
        if (!settings.format && ['jpeg', 'jpg', 'png', 'webp'].includes(origFormat)) {
          format = origFormat === 'jpg' ? 'jpeg' : 
                  (origFormat === 'png' ? 'png' : 
                  (origFormat === 'webp' ? 'webp' : 'jpeg'));
        }
        
        // Create output MIME type
        const outputType = `image/${format}`;
        
        // Convert to blob with specified quality
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Canvas to Blob conversion failed'));
              return;
            }
            
            // Create a new file with the same name but compressed
            const fileName = file.name;
            const compressedFile = new File([blob], fileName, {
              type: outputType,
              lastModified: Date.now()
            });
            
            // Create result object
            resolve({
              file: compressedFile,
              originalSize,
              compressedSize: compressedFile.size,
              compressionRatio: compressedFile.size / originalSize,
              width,
              height,
              format,
              qualityUsed: quality
            });
          },
          outputType,
          quality
        );
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
  });
}

/**
 * Determine if a file should be compressed based on type and size
 * @param file File to check
 * @returns Boolean indicating if file should be compressed
 */
export function shouldCompressImage(file: File): boolean {
  // Only compress images
  if (!file.type.startsWith('image/')) {
    return false;
  }
  
  // Skip already compressed formats for small files
  if (
    (file.type === 'image/webp' || file.type === 'image/avif') &&
    file.size < 500 * 1024 // 500KB
  ) {
    return false;
  }
  
  // Skip very small JPEG/PNG if they're already small
  if (
    (file.type === 'image/jpeg' || file.type === 'image/png') &&
    file.size < 100 * 1024 // 100KB
  ) {
    return false;
  }
  
  // Skip SVG files (they're usually small and compression won't help)
  if (file.type === 'image/svg+xml') {
    return false;
  }
  
  return true;
}