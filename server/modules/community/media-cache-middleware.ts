/**
 * PKL-278651-COMM-0036-MEDIA-CACHE
 * Media Cache Middleware
 * 
 * Middleware that adds proper cache headers to media API responses
 * for improved performance and reduced bandwidth usage
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

import { Request, Response, NextFunction } from 'express';
import path from 'path';

// Cache durations in seconds
const CACHE_DURATIONS = {
  // Static images (user uploads) are cached for longer
  STATIC_MEDIA: 60 * 60 * 24 * 7, // 7 days
  // Thumbnails can be cached for medium duration
  THUMBNAILS: 60 * 60 * 24 * 3, // 3 days
  // API responses with media lists are cached for shorter duration
  API_MEDIA_LISTS: 60 * 5, // 5 minutes
  // User-specific data should have shorter cache
  USER_SPECIFIC: 60 * 1 // 1 minute
};

/**
 * Add appropriate cache control headers based on the request and media type
 */
export function mediaCacheControl(req: Request, res: Response, next: NextFunction) {
  const { originalUrl, method, query } = req;
  
  // Only apply cache headers for GET requests
  if (method !== 'GET') {
    return next();
  }
  
  // Don't cache if user is requesting uncached version
  if (query.noCache === 'true') {
    res.setHeader('Cache-Control', 'no-store');
    return next();
  }
  
  // Handle different types of media requests
  if (originalUrl.includes('/uploads/community-media/')) {
    // This is a direct file request - determine the file type
    const fileExt = path.extname(originalUrl).toLowerCase();
    
    // Images and videos can be cached for longer
    if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(fileExt)) {
      addCacheHeaders(res, CACHE_DURATIONS.STATIC_MEDIA);
    } 
    // Video files
    else if (['.mp4', '.webm', '.ogg'].includes(fileExt)) {
      addCacheHeaders(res, CACHE_DURATIONS.STATIC_MEDIA);
    }
    // Documents should have shorter cache time as they might be updated
    else if (['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'].includes(fileExt)) {
      addCacheHeaders(res, CACHE_DURATIONS.API_MEDIA_LISTS);
    }
    // Default for other file types
    else {
      addCacheHeaders(res, CACHE_DURATIONS.API_MEDIA_LISTS);
    }
  } 
  // API endpoints that return media lists
  else if (originalUrl.match(/\/api\/community\/\d+\/media\/?$/)) {
    addCacheHeaders(res, CACHE_DURATIONS.API_MEDIA_LISTS);
  }
  // API endpoints for galleries
  else if (originalUrl.match(/\/api\/community\/\d+\/galleries\/?$/)) {
    addCacheHeaders(res, CACHE_DURATIONS.API_MEDIA_LISTS);
  }
  // Individual media items
  else if (originalUrl.match(/\/api\/community\/\d+\/media\/\d+\/?$/)) {
    addCacheHeaders(res, CACHE_DURATIONS.API_MEDIA_LISTS);
  }
  // Quota endpoint should have minimal caching
  else if (originalUrl.includes('/media/quota')) {
    addCacheHeaders(res, CACHE_DURATIONS.USER_SPECIFIC);
  }
  
  next();
}

/**
 * Add cache control headers to response
 */
function addCacheHeaders(res: Response, maxAge: number) {
  // Set Cache-Control header
  res.setHeader(
    'Cache-Control', 
    `public, max-age=${maxAge}, stale-while-revalidate=${Math.floor(maxAge / 2)}`
  );
  
  // Set Expires header
  const expiresDate = new Date();
  expiresDate.setSeconds(expiresDate.getSeconds() + maxAge);
  res.setHeader('Expires', expiresDate.toUTCString());
  
  // Vary header to handle different client capabilities
  res.setHeader('Vary', 'Accept-Encoding');
}

/**
 * Middleware for handling image resizing in URLs
 * Example: /uploads/community-media/image.jpg?width=300&quality=80
 */
export function mediaResizeMiddleware(req: Request, res: Response, next: NextFunction) {
  const { originalUrl, query } = req;
  
  // Only process for media files with width or quality parameters
  if (
    originalUrl.includes('/uploads/community-media/') && 
    (query.width || query.quality)
  ) {
    // Parse parameters
    const width = query.width ? parseInt(query.width as string, 10) : null;
    const quality = query.quality ? parseInt(query.quality as string, 10) : 80;
    
    // Only allow specific width values for security
    const allowedWidths = [100, 200, 300, 400, 600, 800, 1200, 1600, 2000];
    
    // Validate width parameter
    if (width && !allowedWidths.includes(width)) {
      return res.status(400).json({
        message: 'Invalid width parameter. Allowed values: ' + allowedWidths.join(', ')
      });
    }
    
    // Validate quality parameter (between 10 and 100)
    if (quality < 10 || quality > 100) {
      return res.status(400).json({
        message: 'Invalid quality parameter. Must be between 10 and 100.'
      });
    }
    
    // In a real implementation, you would resize the image here
    // For now, we'll just pass it through with appropriate cache headers
    
    // Add a long cache duration for resized images
    addCacheHeaders(res, CACHE_DURATIONS.STATIC_MEDIA);
  }
  
  next();
}