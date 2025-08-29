/**
 * Security Admin API Router
 * 
 * PKL-278651-ADMIN-API-006
 * Security management and audit log admin endpoints
 * UDF Rule 18-20 Compliance - Admin controls with security and audit
 */
import express from 'express';
import { eq, desc, and } from 'drizzle-orm';
import { db } from '../../../db';
import { adminAuditLog, adminRoles } from '../../../../shared/schema/admin-security';
import { 
  requireAdminRole, 
  requirePermission, 
  withAudit,
  adminSecurityService,
  AdminRole,
  AdminActionType,
  AdminRequest 
} from '../../core/security';
import { z } from 'zod';

const auditQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  adminId: z.coerce.number().optional(),
  action: z.string().optional(),
  resource: z.string().optional(),
  riskLevel: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export function createSecurityAdminRouter(): express.Router {
  const router = express.Router();

  /**
   * GET /audit-logs
   * View audit logs (Auditor+ role required)
   */
  router.get('/audit-logs',
    requireAdminRole(AdminRole.AUDITOR),
    withAudit(AdminActionType.VIEW_FINANCIAL_DATA, 'audit_logs'),
    async (req: AdminRequest, res) => {
      try {
        const query = auditQuerySchema.parse(req.query);
        
        let auditQuery = db.select({
          id: adminAuditLog.id,
          adminId: adminAuditLog.adminId,
          action: adminAuditLog.action,
          resource: adminAuditLog.resource,
          resourceId: adminAuditLog.resourceId,
          success: adminAuditLog.success,
          riskLevel: adminAuditLog.riskLevel,
          timestamp: adminAuditLog.timestamp,
          ipAddress: adminAuditLog.ipAddress,
          // Only show sensitive data to Super Admin
          ...(req.adminContext?.role === AdminRole.SUPER_ADMIN ? {
            previousState: adminAuditLog.previousState,
            newState: adminAuditLog.newState,
            errorMessage: adminAuditLog.errorMessage,
          } : {})
        }).from(adminAuditLog);

        // Apply filters
        const filters = [];
        if (query.adminId) {
          filters.push(eq(adminAuditLog.adminId, query.adminId));
        }
        if (query.action) {
          filters.push(eq(adminAuditLog.action, query.action));
        }
        if (query.resource) {
          filters.push(eq(adminAuditLog.resource, query.resource));
        }
        if (query.riskLevel) {
          filters.push(eq(adminAuditLog.riskLevel, query.riskLevel));
        }

        if (filters.length > 0) {
          auditQuery = auditQuery.where(and(...filters));
        }

        // Apply pagination and sorting
        const offset = (query.page - 1) * query.limit;
        const auditLogs = await auditQuery
          .orderBy(desc(adminAuditLog.timestamp))
          .limit(query.limit)
          .offset(offset);

        res.json({
          auditLogs,
          pagination: {
            page: query.page,
            limit: query.limit,
            // Total count would be calculated in real implementation
            total: auditLogs.length, // Placeholder
            pages: Math.ceil(auditLogs.length / query.limit)
          }
        });
      } catch (error) {
        console.error('Audit logs error:', error);
        res.status(500).json({ error: 'Failed to fetch audit logs' });
      }
    }
  );

  /**
   * GET /admin-roles
   * View admin role assignments (Super Admin only)
   */
  router.get('/admin-roles',
    requireAdminRole(AdminRole.SUPER_ADMIN),
    withAudit(AdminActionType.VIEW_FINANCIAL_DATA, 'admin_roles'),
    async (req: AdminRequest, res) => {
      try {
        const roles = await db.select({
          id: adminRoles.id,
          userId: adminRoles.userId,
          role: adminRoles.role,
          assignedBy: adminRoles.assignedBy,
          assignedAt: adminRoles.assignedAt,
          expiresAt: adminRoles.expiresAt,
          isActive: adminRoles.isActive,
        }).from(adminRoles).orderBy(desc(adminRoles.assignedAt));

        res.json({ adminRoles: roles });
      } catch (error) {
        console.error('Admin roles error:', error);
        res.status(500).json({ error: 'Failed to fetch admin roles' });
      }
    }
  );

  /**
   * POST /admin-roles
   * Assign admin role (Super Admin only)
   */
  router.post('/admin-roles',
    requireAdminRole(AdminRole.SUPER_ADMIN),
    withAudit(AdminActionType.GRANT_ADMIN_ROLE, 'admin_role_assignment'),
    async (req: AdminRequest, res) => {
      try {
        const { userId, role, expiresAt } = req.body;

        if (!userId || !role) {
          return res.status(400).json({ error: 'User ID and role are required' });
        }

        if (!Object.values(AdminRole).includes(role)) {
          return res.status(400).json({ error: 'Invalid admin role' });
        }

        await adminSecurityService.assignAdminRole(
          userId,
          role,
          req.user!.id,
          expiresAt ? new Date(expiresAt) : undefined
        );

        res.json({ message: 'Admin role assigned successfully' });
      } catch (error) {
        console.error('Admin role assignment error:', error);
        res.status(500).json({ error: 'Failed to assign admin role' });
      }
    }
  );

  /**
   * DELETE /admin-roles/:userId
   * Revoke admin role (Super Admin only)
   */
  router.delete('/admin-roles/:userId',
    requireAdminRole(AdminRole.SUPER_ADMIN),
    withAudit(AdminActionType.REVOKE_ADMIN_ROLE, 'admin_role_revocation'),
    async (req: AdminRequest, res) => {
      try {
        const userId = parseInt(req.params.userId);
        if (isNaN(userId)) {
          return res.status(400).json({ error: 'Invalid user ID' });
        }

        await adminSecurityService.deactivateAdminRole(userId, req.user!.id);

        res.json({ message: 'Admin role revoked successfully' });
      } catch (error) {
        console.error('Admin role revocation error:', error);
        res.status(500).json({ error: 'Failed to revoke admin role' });
      }
    }
  );

  return router;
}