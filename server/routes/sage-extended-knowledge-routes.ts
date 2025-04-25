/**
 * PKL-278651-SAGE-0016-EXTENDED-API
 * SAGE Extended Knowledge Base API Routes
 * 
 * This file provides API endpoints for accessing the extended SAGE knowledge base,
 * including pickleball rules, platform features, and training information.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-25
 */

import express, { Request, Response } from 'express';
import { searchKnowledge, getKnowledgeItem, getPremiumPreview, extendedKnowledgeBase } from '../services/sageExtendedKnowledgeBase';
import { isAuthenticated, hasRole } from '../middleware/auth';
import { UserRole } from '../../shared/schema/sage-concierge';

const router = express.Router();

/**
 * GET /api/coach/sage/knowledge/search
 * Search the knowledge base for content matching the query
 */
router.get('/search', isAuthenticated, (req: Request, res: Response) => {
  try {
    const { query, includePremium = 'false' } = req.query;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ 
        success: false, 
        message: 'Query parameter is required' 
      });
    }
    
    // Determine if premium content should be included based on user role
    // Premium content is available to paid users (and coaches/admins)
    const userHasPremiumAccess = 
      req.user?.role === UserRole.COACH || 
      req.user?.role === UserRole.ADMIN ||
      req.user?.subscriptionTier === 'premium' || 
      req.user?.subscriptionTier === 'power';
    
    const includesPremium = includePremium === 'true' && userHasPremiumAccess;
    
    // Search the knowledge base
    const results = searchKnowledge(query, includesPremium);
    
    return res.status(200).json({
      success: true,
      results
    });
  } catch (error) {
    console.error('Error searching knowledge base:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error searching knowledge base' 
    });
  }
});

/**
 * GET /api/coach/sage/knowledge/item/:id
 * Get a specific knowledge item by ID
 */
router.get('/item/:id', isAuthenticated, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const item = getKnowledgeItem(id);
    
    if (!item) {
      return res.status(404).json({ 
        success: false, 
        message: 'Knowledge item not found' 
      });
    }
    
    // Check if this is premium content and user has access
    const userHasPremiumAccess = 
      req.user?.role === UserRole.COACH || 
      req.user?.role === UserRole.ADMIN ||
      req.user?.subscriptionTier === 'premium' || 
      req.user?.subscriptionTier === 'power';
    
    if (item.isPremium && !userHasPremiumAccess) {
      // Return the preview version for premium content
      const preview = getPremiumPreview(id);
      return res.status(200).json({
        success: true,
        item: {
          ...item,
          content: preview,
          isPremiumPreview: true
        }
      });
    }
    
    // Return the full item
    return res.status(200).json({
      success: true,
      item
    });
  } catch (error) {
    console.error('Error fetching knowledge item:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error fetching knowledge item' 
    });
  }
});

/**
 * GET /api/coach/sage/knowledge/categories
 * Get all knowledge categories
 */
router.get('/categories', isAuthenticated, (req: Request, res: Response) => {
  try {
    const categories = extendedKnowledgeBase.getAllCategories();
    
    return res.status(200).json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Error fetching knowledge categories:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error fetching knowledge categories' 
    });
  }
});

/**
 * GET /api/coach/sage/knowledge/category/:id
 * Get all knowledge items in a specific category
 */
router.get('/category/:id', isAuthenticated, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { includePremium = 'false' } = req.query;
    
    // Determine if premium content should be included
    const userHasPremiumAccess = 
      req.user?.role === UserRole.COACH || 
      req.user?.role === UserRole.ADMIN ||
      req.user?.subscriptionTier === 'premium' || 
      req.user?.subscriptionTier === 'power';
    
    const includesPremium = includePremium === 'true' && userHasPremiumAccess;
    
    const items = extendedKnowledgeBase.getKnowledgeByCategory(id, includesPremium);
    
    return res.status(200).json({
      success: true,
      categoryId: id,
      items
    });
  } catch (error) {
    console.error('Error fetching category items:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error fetching category items' 
    });
  }
});

/**
 * GET /api/coach/sage/knowledge/related/:id
 * Get related knowledge items for a specific item
 */
router.get('/related/:id', isAuthenticated, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { includePremium = 'false' } = req.query;
    
    // Determine if premium content should be included
    const userHasPremiumAccess = 
      req.user?.role === UserRole.COACH || 
      req.user?.role === UserRole.ADMIN ||
      req.user?.subscriptionTier === 'premium' || 
      req.user?.subscriptionTier === 'power';
    
    const includesPremium = includePremium === 'true' && userHasPremiumAccess;
    
    const relatedItems = extendedKnowledgeBase.getRelatedKnowledge(id, includesPremium);
    
    return res.status(200).json({
      success: true,
      itemId: id,
      relatedItems
    });
  } catch (error) {
    console.error('Error fetching related items:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error fetching related items' 
    });
  }
});

/**
 * POST /api/coach/sage/knowledge/intent
 * Get knowledge based on conversation intent
 */
router.post('/intent', isAuthenticated, (req: Request, res: Response) => {
  try {
    const { query, intent, context } = req.body;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ 
        success: false, 
        message: 'Query parameter is required' 
      });
    }
    
    // Determine if premium content should be included
    const userHasPremiumAccess = 
      req.user?.role === UserRole.COACH || 
      req.user?.role === UserRole.ADMIN ||
      req.user?.subscriptionTier === 'premium' || 
      req.user?.subscriptionTier === 'power';
    
    // Search the knowledge base
    const results = searchKnowledge(query, userHasPremiumAccess);
    
    // For training intent, limit to 3 drills for free users
    if (intent === 'training' && !userHasPremiumAccess) {
      const trainingItems = results.filter(item => 
        item.keywords.some(k => ['drill', 'practice', 'exercise', 'training'].includes(k))
      ).slice(0, 3);
      
      return res.status(200).json({
        success: true,
        results: trainingItems,
        isPremiumLimited: true,
        message: "Free users are limited to 3 drills. Upgrade to SAGE Premium for complete training plans and unlimited access."
      });
    }
    
    return res.status(200).json({
      success: true,
      results
    });
  } catch (error) {
    console.error('Error processing knowledge intent:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error processing knowledge intent' 
    });
  }
});

export default router;