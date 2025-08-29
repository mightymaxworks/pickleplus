/**
 * Admin API v1 Router
 * 
 * PKL-278651-ADMIN-API-001
 * Organized, versioned admin API with comprehensive security and audit logging
 * UDF Rule 18-20 Compliance - Admin controls, security, and audit trails
 */
import express from 'express';
import { 
  requireAdminRole, 
  requirePermission, 
  withAudit,
  enhancedAdminAuth,
  AdminRole,
  AdminActionType 
} from '../../core/security';

// Import feature-specific admin routers
import { createUsersAdminRouter } from './users';
import { createMatchesAdminRouter } from './matches';
import { createAnalyticsAdminRouter } from './analytics';
import { createSystemAdminRouter } from './system';
import { createSecurityAdminRouter } from './security';

/**
 * Create versioned admin API router with comprehensive security
 */
export function createAdminAPIv1Router(): express.Router {
  const router = express.Router();

  // Apply enhanced admin authentication to all routes
  router.use(enhancedAdminAuth);

  // Health check endpoint - Available to all admin roles
  router.get('/health', 
    requireAdminRole(AdminRole.AUDITOR),
    withAudit(AdminActionType.VIEW_FINANCIAL_DATA, 'system_health'),
    async (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development'
      });
    }
  );

  // Dashboard metrics - Available to all admin roles
  router.get('/dashboard/metrics',
    requireAdminRole(AdminRole.AUDITOR),
    withAudit(AdminActionType.VIEW_FINANCIAL_DATA, 'dashboard_metrics'),
    async (req, res) => {
      // Implementation would fetch real metrics
      res.json({
        totalUsers: 15420,
        activeUsers: 8765,
        totalMatches: 45230,
        pendingVerifications: 23,
        systemHealth: 98.5,
        revenue: 125400,
      });
    }
  );

  // Mount feature-specific routers with appropriate security
  router.use('/users', createUsersAdminRouter());
  router.use('/matches', createMatchesAdminRouter());
  router.use('/analytics', createAnalyticsAdminRouter());
  router.use('/system', createSystemAdminRouter());
  router.use('/security', createSecurityAdminRouter());

  // Error handling middleware
  router.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Admin API Error:', error);
    
    // Log security errors with high priority
    if (error.status === 403 || error.status === 401) {
      // This would be logged via audit system
      console.warn('Admin API Security Violation:', {
        userId: req.user?.id,
        path: req.path,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
    }

    res.status(error.status || 500).json({
      error: error.message || 'Internal server error',
      timestamp: new Date().toISOString(),
      path: req.path
    });
  });

  return router;
}

// Export admin API factory
export { createAdminAPIv1Router as adminAPIv1 };