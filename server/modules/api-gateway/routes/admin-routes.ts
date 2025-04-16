/**
 * PKL-278651-API-0001-GATEWAY
 * API Gateway Admin Routes
 * 
 * Routes for administrator management of developer accounts and applications.
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { eq, and, desc, asc, sql } from 'drizzle-orm';
import { db } from '../../../db';
import { apiDeveloperAccounts, apiApplications, apiKeys } from '../../../../shared/schema/api-gateway';
import { users } from '../../../../shared/schema';
import { isAuthenticated, isAdmin } from '../../../auth';

const router = Router();

// Apply admin authentication to all routes
router.use(isAuthenticated, isAdmin);

/**
 * Get all developer accounts (admin only)
 * GET /api/admin/developers
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    // Parse query parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    const sortBy = req.query.sort_by as string || 'createdAt';
    const sortOrder = req.query.sort_order as string || 'desc';
    
    // Get all developer accounts with user details
    const developerAccounts = await db.select({
      id: apiDeveloperAccounts.id,
      userId: apiDeveloperAccounts.userId,
      username: users.username,
      email: users.email,
      companyName: apiDeveloperAccounts.companyName,
      website: apiDeveloperAccounts.website,
      isApproved: apiDeveloperAccounts.isApproved,
      developerTier: apiDeveloperAccounts.developerTier,
      monthlyQuota: apiDeveloperAccounts.monthlyQuota,
      createdAt: apiDeveloperAccounts.createdAt
    })
    .from(apiDeveloperAccounts)
    .innerJoin(users, eq(apiDeveloperAccounts.userId, users.id))
    .orderBy(
      sortOrder === 'desc' 
        ? desc(apiDeveloperAccounts[sortBy as keyof typeof apiDeveloperAccounts]) 
        : asc(apiDeveloperAccounts[sortBy as keyof typeof apiDeveloperAccounts])
    )
    .limit(limit)
    .offset(offset);
    
    // Get total count for pagination
    const totalCountResult = await db.select({ count: sql`count(*)` })
      .from(apiDeveloperAccounts);
    
    const totalCount = parseInt(totalCountResult[0]?.count as string) || 0;
    
    res.json({
      data: developerAccounts,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Error getting developer accounts:', error);
    res.status(500).json({ 
      error: 'server_error',
      message: 'Failed to retrieve developer accounts' 
    });
  }
});

/**
 * Approve a developer account (admin only)
 * PATCH /api/admin/developers/:id/approve
 */
router.patch('/:id/approve', async (req: Request, res: Response) => {
  try {
    const developerId = parseInt(req.params.id);
    
    if (isNaN(developerId)) {
      return res.status(400).json({
        error: 'invalid_id',
        message: 'Invalid developer ID'
      });
    }
    
    // Check if developer account exists
    const developerAccount = await db.select()
      .from(apiDeveloperAccounts)
      .where(eq(apiDeveloperAccounts.id, developerId))
      .limit(1);
    
    if (developerAccount.length === 0) {
      return res.status(404).json({
        error: 'not_found',
        message: 'Developer account not found'
      });
    }
    
    // Update developer account approval status
    const [updatedAccount] = await db.update(apiDeveloperAccounts)
      .set({
        isApproved: true,
        approvalDate: new Date(),
        updatedAt: new Date()
      })
      .where(eq(apiDeveloperAccounts.id, developerId))
      .returning();
    
    res.json({
      message: 'Developer account approved successfully',
      data: updatedAccount
    });
  } catch (error) {
    console.error('Error approving developer account:', error);
    res.status(500).json({ 
      error: 'server_error',
      message: 'Failed to approve developer account' 
    });
  }
});

/**
 * Revoke a developer account (admin only)
 * PATCH /api/admin/developers/:id/revoke
 */
router.patch('/:id/revoke', async (req: Request, res: Response) => {
  try {
    const developerId = parseInt(req.params.id);
    
    if (isNaN(developerId)) {
      return res.status(400).json({
        error: 'invalid_id',
        message: 'Invalid developer ID'
      });
    }
    
    // Check if developer account exists
    const developerAccount = await db.select()
      .from(apiDeveloperAccounts)
      .where(eq(apiDeveloperAccounts.id, developerId))
      .limit(1);
    
    if (developerAccount.length === 0) {
      return res.status(404).json({
        error: 'not_found',
        message: 'Developer account not found'
      });
    }
    
    // Update developer account approval status
    const [updatedAccount] = await db.update(apiDeveloperAccounts)
      .set({
        isApproved: false,
        updatedAt: new Date()
      })
      .where(eq(apiDeveloperAccounts.id, developerId))
      .returning();
    
    // Deactivate all associated API keys
    const applications = await db.select({ id: apiApplications.id })
      .from(apiApplications)
      .where(eq(apiApplications.developerId, developerId));
    
    const applicationIds = applications.map(app => app.id);
    
    if (applicationIds.length > 0) {
      await db.update(apiKeys)
        .set({ 
          isActive: false,
        })
        .where(apiKeys.applicationId.in(applicationIds));
    }
    
    res.json({
      message: 'Developer account revoked successfully',
      data: updatedAccount
    });
  } catch (error) {
    console.error('Error revoking developer account:', error);
    res.status(500).json({ 
      error: 'server_error',
      message: 'Failed to revoke developer account' 
    });
  }
});

/**
 * Update developer tier and quota (admin only)
 * PATCH /api/admin/developers/:id/tier
 */
router.patch('/:id/tier', async (req: Request, res: Response) => {
  try {
    const developerId = parseInt(req.params.id);
    
    if (isNaN(developerId)) {
      return res.status(400).json({
        error: 'invalid_id',
        message: 'Invalid developer ID'
      });
    }
    
    // Validate request body
    const schema = z.object({
      developerTier: z.enum(['free', 'basic', 'professional', 'enterprise']),
      monthlyQuota: z.number().int().positive().optional()
    });
    
    const validatedData = schema.parse(req.body);
    
    // Check if developer account exists
    const developerAccount = await db.select()
      .from(apiDeveloperAccounts)
      .where(eq(apiDeveloperAccounts.id, developerId))
      .limit(1);
    
    if (developerAccount.length === 0) {
      return res.status(404).json({
        error: 'not_found',
        message: 'Developer account not found'
      });
    }
    
    // Set default monthly quota based on tier if not provided
    let monthlyQuota = validatedData.monthlyQuota;
    if (!monthlyQuota) {
      switch (validatedData.developerTier) {
        case 'free':
          monthlyQuota = 10000;
          break;
        case 'basic':
          monthlyQuota = 100000;
          break;
        case 'professional':
          monthlyQuota = 1000000;
          break;
        case 'enterprise':
          monthlyQuota = 10000000;
          break;
      }
    }
    
    // Update developer tier and quota
    const [updatedAccount] = await db.update(apiDeveloperAccounts)
      .set({
        developerTier: validatedData.developerTier,
        monthlyQuota,
        updatedAt: new Date()
      })
      .where(eq(apiDeveloperAccounts.id, developerId))
      .returning();
    
    res.json({
      message: 'Developer tier updated successfully',
      data: updatedAccount
    });
  } catch (error) {
    console.error('Error updating developer tier:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'validation_error',
        message: 'Validation error',
        details: error.errors 
      });
    }
    
    res.status(500).json({ 
      error: 'server_error',
      message: 'Failed to update developer tier' 
    });
  }
});

/**
 * Get developer details with usage stats (admin only)
 * GET /api/admin/developers/:id
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const developerId = parseInt(req.params.id);
    
    if (isNaN(developerId)) {
      return res.status(400).json({
        error: 'invalid_id',
        message: 'Invalid developer ID'
      });
    }
    
    // Get developer account with user details
    const developerAccount = await db.select({
      id: apiDeveloperAccounts.id,
      userId: apiDeveloperAccounts.userId,
      username: users.username,
      email: users.email,
      companyName: apiDeveloperAccounts.companyName,
      website: apiDeveloperAccounts.website,
      developerBio: apiDeveloperAccounts.developerBio,
      isApproved: apiDeveloperAccounts.isApproved,
      approvalDate: apiDeveloperAccounts.approvalDate,
      termsAccepted: apiDeveloperAccounts.termsAccepted,
      termsAcceptedDate: apiDeveloperAccounts.termsAcceptedDate,
      developerTier: apiDeveloperAccounts.developerTier,
      monthlyQuota: apiDeveloperAccounts.monthlyQuota,
      isTestAccount: apiDeveloperAccounts.isTestAccount,
      createdAt: apiDeveloperAccounts.createdAt,
      updatedAt: apiDeveloperAccounts.updatedAt
    })
    .from(apiDeveloperAccounts)
    .innerJoin(users, eq(apiDeveloperAccounts.userId, users.id))
    .where(eq(apiDeveloperAccounts.id, developerId))
    .limit(1);
    
    if (developerAccount.length === 0) {
      return res.status(404).json({
        error: 'not_found',
        message: 'Developer account not found'
      });
    }
    
    // Get applications for this developer
    const applications = await db.select()
      .from(apiApplications)
      .where(eq(apiApplications.developerId, developerId));
    
    // Get API key count
    const applicationIds = applications.map(app => app.id);
    let apiKeyCount = 0;
    let activeApiKeyCount = 0;
    
    if (applicationIds.length > 0) {
      const apiKeysResult = await db.select({
        count: sql`count(*)`,
        activeCount: sql`sum(case when is_active then 1 else 0 end)`
      })
        .from(apiKeys)
        .where(apiKeys.applicationId.in(applicationIds));
      
      if (apiKeysResult.length > 0) {
        apiKeyCount = parseInt(apiKeysResult[0].count as string) || 0;
        activeApiKeyCount = parseInt(apiKeysResult[0].activeCount as string) || 0;
      }
    }
    
    // Get API usage statistics (simplified version)
    // In a real implementation, you would provide more detailed statistics
    const apiUsage = await db.execute(sql`
      SELECT 
        COUNT(*) as total_requests,
        SUM(CASE WHEN status_code >= 200 AND status_code < 300 THEN 1 ELSE 0 END) as successful_requests,
        SUM(CASE WHEN status_code >= 400 THEN 1 ELSE 0 END) as failed_requests,
        MAX(timestamp) as last_request
      FROM api_usage_logs
      WHERE key_id IN (
        SELECT id FROM api_keys 
        WHERE application_id IN (
          SELECT id FROM api_applications 
          WHERE developer_id = ${developerId}
        )
      )
    `);
    
    res.json({
      data: {
        developer: developerAccount[0],
        applications: {
          count: applications.length,
          items: applications
        },
        apiKeys: {
          total: apiKeyCount,
          active: activeApiKeyCount
        },
        usage: apiUsage[0] || {
          total_requests: 0,
          successful_requests: 0,
          failed_requests: 0,
          last_request: null
        }
      }
    });
  } catch (error) {
    console.error('Error getting developer details:', error);
    res.status(500).json({ 
      error: 'server_error',
      message: 'Failed to retrieve developer details' 
    });
  }
});

export default router;