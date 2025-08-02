/**
 * Admin Approval Workflow API
 * PKL-278651-ADMIN-APPROVAL-WORKFLOW
 * 
 * Complete admin approval system for PCP coach applications
 */

import { Router } from 'express';
import { z } from 'zod';
import { storage } from '../storage';

const router = Router();

// Approval Action Schema
const approvalActionSchema = z.object({
  applicationId: z.number().int().positive(),
  action: z.enum(['approve', 'reject', 'request_changes']),
  reviewComments: z.string().optional(),
  requestedChanges: z.array(z.string()).optional(),
  conditionalRequirements: z.array(z.string()).optional()
});

/**
 * Get pending coach applications for admin review
 */
router.get('/pending-applications', async (req, res) => {
  try {
    const pendingApplications = await storage.getPendingCoachApplications();
    
    // Enhance with user data
    const enhancedApplications = await Promise.all(
      pendingApplications.map(async (app: any) => {
        const user = await storage.getUser(app.userId);
        return {
          ...app,
          user: {
            id: user?.id,
            username: user?.username,
            email: user?.email,
            firstName: user?.firstName,
            lastName: user?.lastName,
            profileImageUrl: user?.profileImageUrl
          }
        };
      })
    );

    res.json({
      success: true,
      applications: enhancedApplications,
      total: enhancedApplications.length
    });
  } catch (error) {
    console.error('[ADMIN-APPROVAL] Error fetching pending applications:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch pending applications' 
    });
  }
});

/**
 * Get application details for review
 */
router.get('/application/:id', async (req, res) => {
  try {
    const applicationId = parseInt(req.params.id);
    
    if (isNaN(applicationId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid application ID'
      });
    }

    const application = await storage.getCoachApplication(applicationId);
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Get full user details
    const user = await storage.getUser(application.userId);
    
    // Get any existing coach profile (in case of reapplication)
    const existingProfile = await storage.getCoachProfile(application.userId);

    res.json({
      success: true,
      application: {
        ...application,
        user,
        existingProfile
      }
    });
  } catch (error) {
    console.error('[ADMIN-APPROVAL] Error fetching application:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch application details' 
    });
  }
});

/**
 * Process approval action (approve/reject/request changes)
 */
router.post('/process-approval', async (req, res) => {
  try {
    const validation = approvalActionSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid approval data',
        errors: validation.error.issues
      });
    }

    const { applicationId, action, reviewComments, requestedChanges, conditionalRequirements } = validation.data;

    // Get the application
    const application = await storage.getCoachApplication(applicationId);
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Get admin user info (assuming req.user contains admin)
    const adminUserId = req.user?.id;
    if (!adminUserId) {
      return res.status(401).json({
        success: false,
        message: 'Admin authentication required'
      });
    }

    let result;

    switch (action) {
      case 'approve':
        result = await storage.approveCoachApplication({
          applicationId,
          adminUserId,
          reviewComments,
          conditionalRequirements
        });
        break;

      case 'reject':
        result = await storage.rejectCoachApplication({
          applicationId,
          adminUserId,
          reviewComments,
          rejectionReason: reviewComments || 'Application does not meet requirements'
        });
        break;

      case 'request_changes':
        result = await storage.requestApplicationChanges({
          applicationId,
          adminUserId,
          requestedChanges: requestedChanges || [],
          reviewComments
        });
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid approval action'
        });
    }

    res.json({
      success: true,
      message: `Application ${action} successfully`,
      result
    });

  } catch (error) {
    console.error('[ADMIN-APPROVAL] Error processing approval:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process approval action' 
    });
  }
});

/**
 * Get approval history for an application
 */
router.get('/application/:id/history', async (req, res) => {
  try {
    const applicationId = parseInt(req.params.id);
    
    if (isNaN(applicationId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid application ID'
      });
    }

    const history = await storage.getApplicationApprovalHistory(applicationId);

    res.json({
      success: true,
      history
    });
  } catch (error) {
    console.error('[ADMIN-APPROVAL] Error fetching approval history:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch approval history' 
    });
  }
});

/**
 * Get admin approval dashboard stats
 */
router.get('/dashboard-stats', async (req, res) => {
  try {
    const stats = await storage.getAdminApprovalStats();

    res.json({
      success: true,
      stats: {
        pendingCount: stats.pendingCount || 0,
        approvedCount: stats.approvedCount || 0,
        rejectedCount: stats.rejectedCount || 0,
        changesRequestedCount: stats.changesRequestedCount || 0,
        totalApplications: stats.totalApplications || 0,
        avgProcessingTime: stats.avgProcessingTime || 0,
        recentActivity: stats.recentActivity || []
      }
    });
  } catch (error) {
    console.error('[ADMIN-APPROVAL] Error fetching dashboard stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch dashboard statistics' 
    });
  }
});

/**
 * Bulk approval actions
 */
router.post('/bulk-approval', async (req, res) => {
  try {
    const bulkActionSchema = z.object({
      applicationIds: z.array(z.number().int().positive()),
      action: z.enum(['approve', 'reject']),
      reviewComments: z.string().optional()
    });

    const validation = bulkActionSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid bulk approval data',
        errors: validation.error.issues
      });
    }

    const { applicationIds, action, reviewComments } = validation.data;
    const adminUserId = req.user?.id;

    if (!adminUserId) {
      return res.status(401).json({
        success: false,
        message: 'Admin authentication required'
      });
    }

    const results = await storage.processBulkApproval({
      applicationIds,
      action,
      adminUserId,
      reviewComments
    });

    res.json({
      success: true,
      message: `Bulk ${action} completed`,
      results: {
        successful: results.successful || [],
        failed: results.failed || [],
        total: applicationIds.length
      }
    });

  } catch (error) {
    console.error('[ADMIN-APPROVAL] Error processing bulk approval:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process bulk approval' 
    });
  }
});

export default router;