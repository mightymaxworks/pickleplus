/**
 * Admin Security Core Module
 * 
 * PKL-278651-ADMIN-SEC-002
 * Centralized admin security, role-based access control, and audit logging
 * UDF Rule 19 & 20 Compliance Implementation
 */
import { Request, Response, NextFunction } from 'express';
import { db } from '../../db';
import { eq, and, sql } from 'drizzle-orm';
import { 
  adminRoles, 
  adminPermissions, 
  rolePermissions, 
  adminAuditLog,
  adminSessions,
  AdminRole,
  AdminActionType,
  AdminActionContext,
  AdminPermissionCheck,
  DEFAULT_ROLE_PERMISSIONS,
  type InsertAuditLogEntry
} from '../../../shared/schema/admin-security';
import { users } from '../../../shared/schema';

// Enhanced Request interface with admin context
export interface AdminRequest extends Request {
  adminContext?: {
    role: AdminRole;
    permissions: string[];
    sessionId: string;
    lastActivity: Date;
  };
}

/**
 * Admin Security Service - Core security operations
 */
export class AdminSecurityService {
  
  /**
   * Get user's admin role and permissions
   */
  async getUserAdminRole(userId: number): Promise<AdminRole | null> {
    const roleRecord = await db.query.adminRoles.findFirst({
      where: and(
        eq(adminRoles.userId, userId),
        eq(adminRoles.isActive, true)
      )
    });
    
    if (!roleRecord) return null;
    
    // Check if role has expired
    if (roleRecord.expiresAt && new Date() > roleRecord.expiresAt) {
      await this.deactivateAdminRole(userId);
      return null;
    }
    
    return roleRecord.role as AdminRole;
  }
  
  /**
   * Check if user has specific permission
   */
  async checkPermission(userId: number, action: string, resource: string): Promise<AdminPermissionCheck> {
    const role = await this.getUserAdminRole(userId);
    
    if (!role) {
      return {
        hasPermission: false,
        role: AdminRole.SUPPORT,
        permissions: [],
        reason: 'No admin role assigned'
      };
    }
    
    // Get user's permissions
    const permissions = await this.getUserPermissions(userId, role);
    
    // Check permission
    const requiredPermission = `${resource}.${action}`;
    const hasWildcard = permissions.some(p => 
      p === `${resource}.*` || 
      p === '*.*' || 
      p === `*.${action}`
    );
    const hasExactPermission = permissions.includes(requiredPermission);
    
    return {
      hasPermission: hasWildcard || hasExactPermission,
      role,
      permissions,
      reason: hasWildcard || hasExactPermission ? undefined : 'Insufficient permissions'
    };
  }
  
  /**
   * Get user's effective permissions
   */
  async getUserPermissions(userId: number, role?: AdminRole): Promise<string[]> {
    if (!role) {
      role = await this.getUserAdminRole(userId) || undefined;
      if (!role) return [];
    }
    
    // Start with default role permissions
    const defaultPermissions = DEFAULT_ROLE_PERMISSIONS[role] || [];
    
    // Get custom permissions from database
    const customPermissions = await db.select({
      name: adminPermissions.name
    })
    .from(rolePermissions)
    .innerJoin(adminPermissions, eq(rolePermissions.permissionId, adminPermissions.id))
    .where(and(
      eq(rolePermissions.role, role),
      eq(rolePermissions.isGranted, true),
      eq(adminPermissions.isActive, true)
    ));
    
    const customPermissionNames = customPermissions.map(p => p.name);
    
    // Combine and deduplicate
    return Array.from(new Set([...defaultPermissions, ...customPermissionNames]));
  }
  
  /**
   * Assign admin role to user
   */
  async assignAdminRole(
    userId: number, 
    role: AdminRole, 
    assignedBy: number,
    expiresAt?: Date
  ): Promise<void> {
    // Deactivate existing roles
    await db.update(adminRoles)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(adminRoles.userId, userId));
    
    // Insert new role
    await db.insert(adminRoles).values({
      userId,
      role,
      assignedBy,
      expiresAt,
      isActive: true
    });
    
    // Audit the role assignment
    await this.auditAction({
      adminId: assignedBy,
      action: AdminActionType.GRANT_ADMIN_ROLE,
      resource: 'admin_roles',
      resourceId: userId.toString(),
      newState: { role, expiresAt }
    });
  }
  
  /**
   * Deactivate admin role
   */
  async deactivateAdminRole(userId: number, deactivatedBy?: number): Promise<void> {
    await db.update(adminRoles)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(adminRoles.userId, userId));
    
    if (deactivatedBy) {
      await this.auditAction({
        adminId: deactivatedBy,
        action: AdminActionType.REVOKE_ADMIN_ROLE,
        resource: 'admin_roles',
        resourceId: userId.toString()
      });
    }
  }
  
  /**
   * Log admin action - UDF Rule 20 Compliance
   */
  async auditAction(context: AdminActionContext & { 
    previousState?: any; 
    newState?: any; 
    success?: boolean; 
    errorMessage?: string;
    riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  }): Promise<void> {
    try {
      await db.insert(adminAuditLog).values({
        adminId: context.adminId,
        action: context.action,
        resource: context.resource,
        resourceId: context.resourceId,
        previousState: context.previousState,
        newState: context.newState,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        sessionId: context.sessionId,
        success: context.success ?? true,
        errorMessage: context.errorMessage,
        riskLevel: context.riskLevel ?? 'low'
      });
    } catch (error) {
      console.error('Failed to audit admin action:', error);
      // Don't throw - audit failures shouldn't break the main operation
    }
  }
  
  /**
   * Track admin session
   */
  async trackAdminSession(
    adminId: number, 
    sessionId: string, 
    ipAddress: string, 
    userAgent: string
  ): Promise<void> {
    // Deactivate old sessions
    await db.update(adminSessions)
      .set({ isActive: false, logoutAt: new Date() })
      .where(and(
        eq(adminSessions.adminId, adminId),
        eq(adminSessions.isActive, true)
      ));
    
    // Create new session
    await db.insert(adminSessions).values({
      adminId,
      sessionId,
      ipAddress,
      userAgent,
      isActive: true
    });
  }
  
  /**
   * Update session activity
   */
  async updateSessionActivity(sessionId: string): Promise<void> {
    await db.update(adminSessions)
      .set({ lastActivityAt: new Date() })
      .where(eq(adminSessions.sessionId, sessionId));
  }
  
  /**
   * End admin session
   */
  async endAdminSession(sessionId: string): Promise<void> {
    await db.update(adminSessions)
      .set({ 
        isActive: false, 
        logoutAt: new Date() 
      })
      .where(eq(adminSessions.sessionId, sessionId));
  }
}

// Singleton instance
export const adminSecurityService = new AdminSecurityService();

/**
 * Middleware: Require specific admin role
 */
export const requireAdminRole = (minRole: AdminRole) => {
  return async (req: AdminRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const userRole = await adminSecurityService.getUserAdminRole(req.user.id);
      
      if (!userRole) {
        return res.status(403).json({ error: 'Admin access required' });
      }
      
      // Check role hierarchy
      const roleHierarchy = [
        AdminRole.AUDITOR,
        AdminRole.SUPPORT,
        AdminRole.MODERATOR,
        AdminRole.ADMIN,
        AdminRole.SUPER_ADMIN
      ];
      
      const userRoleLevel = roleHierarchy.indexOf(userRole);
      const requiredRoleLevel = roleHierarchy.indexOf(minRole);
      
      if (userRoleLevel < requiredRoleLevel) {
        return res.status(403).json({ 
          error: 'Insufficient admin privileges',
          required: minRole,
          current: userRole
        });
      }
      
      // Get permissions for context
      const permissions = await adminSecurityService.getUserPermissions(req.user.id, userRole);
      
      // Add admin context to request
      req.adminContext = {
        role: userRole,
        permissions,
        sessionId: req.sessionID,
        lastActivity: new Date()
      };
      
      // Update session activity
      await adminSecurityService.updateSessionActivity(req.sessionID);
      
      next();
    } catch (error) {
      console.error('Admin role check error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};

/**
 * Middleware: Require specific permission
 */
export const requirePermission = (action: string, resource: string) => {
  return async (req: AdminRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const permissionCheck = await adminSecurityService.checkPermission(
        req.user.id, 
        action, 
        resource
      );
      
      if (!permissionCheck.hasPermission) {
        return res.status(403).json({ 
          error: 'Permission denied',
          reason: permissionCheck.reason,
          required: `${resource}.${action}`
        });
      }
      
      // Add admin context to request
      req.adminContext = {
        role: permissionCheck.role,
        permissions: permissionCheck.permissions,
        sessionId: req.sessionID,
        lastActivity: new Date()
      };
      
      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};

/**
 * Middleware: Audit admin action wrapper
 */
export const withAudit = (actionType: AdminActionType, resourceType: string) => {
  return (handler: (req: AdminRequest, res: Response, next: NextFunction) => Promise<any>) => {
    return async (req: AdminRequest, res: Response, next: NextFunction) => {
      const startTime = Date.now();
      let success = true;
      let errorMessage: string | undefined;
      
      try {
        // Capture state before action (if applicable)
        let previousState: any = undefined;
        if (req.params.id) {
          // Try to capture current state for updates/deletes
          // This would be resource-specific implementation
        }
        
        // Execute the handler
        const result = await handler(req, res, next);
        
        // Capture state after action
        let newState: any = undefined;
        if (res.locals.newState) {
          newState = res.locals.newState;
        }
        
        // Log successful action
        await adminSecurityService.auditAction({
          adminId: req.user!.id,
          action: actionType,
          resource: resourceType,
          resourceId: req.params.id,
          previousState,
          newState,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          sessionId: req.sessionID,
          success: true
        });
        
        return result;
      } catch (error) {
        success = false;
        errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        // Log failed action
        await adminSecurityService.auditAction({
          adminId: req.user!.id,
          action: actionType,
          resource: resourceType,
          resourceId: req.params.id,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          sessionId: req.sessionID,
          success: false,
          errorMessage,
          riskLevel: 'medium' // Failed admin actions are medium risk
        });
        
        throw error;
      }
    };
  };
};

/**
 * Enhanced admin authentication middleware
 */
export const enhancedAdminAuth = async (req: AdminRequest, res: Response, next: NextFunction) => {
  try {
    // Check basic authentication
    if (!req.isAuthenticated() || !req.user?.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Check if user has any admin role
    const adminRole = await adminSecurityService.getUserAdminRole(req.user.id);
    if (!adminRole) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    // Track session if not already tracked
    if (req.sessionID) {
      await adminSecurityService.trackAdminSession(
        req.user.id,
        req.sessionID,
        req.ip || '',
        req.get('User-Agent') || ''
      );
    }
    
    next();
  } catch (error) {
    console.error('Enhanced admin auth error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Export all admin roles for easy access
export { AdminRole, AdminActionType };