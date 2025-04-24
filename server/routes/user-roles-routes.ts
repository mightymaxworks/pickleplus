/**
 * PKL-278651-AUTH-0016-PROLES - Role Management API Routes
 * 
 * This file defines API routes for managing user roles and permissions
 * as part of the persistent role management system.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-24
 */

import express, { Request, Response } from "express";
import { storage } from "../storage";
import { isAdmin, isAuthenticated } from "../auth";
import { z } from "zod";

export function registerUserRolesRoutes(app: express.Express) {
  console.log("[API] Registering user role management routes");

  // Get current user's roles
  app.get("/api/auth/roles", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const userRoles = await storage.getUserRoles(userId);
      
      // Map to simplified format for client
      const roles = userRoles.map(ur => ({
        id: ur.roleId,
        name: ur.role.name,
        label: ur.role.label,
        description: ur.role.description,
        priority: ur.role.priority,
        isActive: ur.isActive,
        assignedAt: ur.assignedAt
      }));
      
      res.json({ roles });
    } catch (error) {
      console.error('[API] Error getting user roles:', error);
      res.status(500).json({ error: 'Error getting user roles' });
    }
  });

  // Check if current user has a specific role
  app.get("/api/auth/has-role/:roleName", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const roleName = req.params.roleName;
      
      const hasRole = await storage.hasRole(userId, roleName);
      
      res.json({ hasRole });
    } catch (error) {
      console.error('[API] Error checking user role:', error);
      res.status(500).json({ error: 'Error checking user role' });
    }
  });

  // Admin routes for managing roles
  // Get all roles
  app.get("/api/admin/roles", isAuthenticated, isAdmin, async (_req: Request, res: Response) => {
    try {
      const roles = await storage.getAllRoles();
      res.json(roles);
    } catch (error) {
      console.error('[API] Error getting all roles:', error);
      res.status(500).json({ error: 'Error getting all roles' });
    }
  });

  // Get single role
  app.get("/api/admin/roles/:id", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const roleId = parseInt(req.params.id);
      if (isNaN(roleId)) {
        return res.status(400).json({ error: 'Invalid role ID' });
      }
      
      const role = await storage.getRoleById(roleId);
      if (!role) {
        return res.status(404).json({ error: 'Role not found' });
      }
      
      res.json(role);
    } catch (error) {
      console.error('[API] Error getting role:', error);
      res.status(500).json({ error: 'Error getting role' });
    }
  });

  // Create a new role
  const createRoleSchema = z.object({
    name: z.string().min(1).max(50),
    label: z.string().min(1).max(100),
    description: z.string().optional(),
    isDefault: z.boolean().optional(),
    priority: z.number().int().nonnegative().default(0)
  });

  app.post("/api/admin/roles", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const parseResult = createRoleSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ errors: parseResult.error.format() });
      }
      
      const newRole = await storage.createRole(parseResult.data);
      res.status(201).json(newRole);
    } catch (error) {
      console.error('[API] Error creating role:', error);
      res.status(500).json({ error: 'Error creating role' });
    }
  });

  // Update a role
  app.put("/api/admin/roles/:id", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const roleId = parseInt(req.params.id);
      if (isNaN(roleId)) {
        return res.status(400).json({ error: 'Invalid role ID' });
      }
      
      const parseResult = createRoleSchema.partial().safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ errors: parseResult.error.format() });
      }
      
      const updatedRole = await storage.updateRole(roleId, parseResult.data);
      if (!updatedRole) {
        return res.status(404).json({ error: 'Role not found' });
      }
      
      res.json(updatedRole);
    } catch (error) {
      console.error('[API] Error updating role:', error);
      res.status(500).json({ error: 'Error updating role' });
    }
  });

  // Delete a role
  app.delete("/api/admin/roles/:id", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const roleId = parseInt(req.params.id);
      if (isNaN(roleId)) {
        return res.status(400).json({ error: 'Invalid role ID' });
      }
      
      const success = await storage.deleteRole(roleId);
      if (!success) {
        return res.status(404).json({ error: 'Role not found or could not be deleted' });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error('[API] Error deleting role:', error);
      
      if (error instanceof Error && error.message.includes('assigned to users')) {
        return res.status(400).json({ error: error.message });
      }
      
      res.status(500).json({ error: 'Error deleting role' });
    }
  });

  // Assign role to user
  const assignRoleSchema = z.object({
    userId: z.number().int().positive(),
    roleId: z.number().int().positive()
  });

  app.post("/api/admin/user-roles", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const parseResult = assignRoleSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ errors: parseResult.error.format() });
      }
      
      const { userId, roleId } = parseResult.data;
      const adminId = req.user!.id;
      
      const userRole = await storage.assignRoleToUser(userId, roleId, adminId);
      res.status(201).json(userRole);
    } catch (error) {
      console.error('[API] Error assigning role to user:', error);
      res.status(500).json({ error: 'Error assigning role to user' });
    }
  });

  // Remove role from user
  app.delete("/api/admin/user-roles/:userId/:roleId", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const roleId = parseInt(req.params.roleId);
      
      if (isNaN(userId) || isNaN(roleId)) {
        return res.status(400).json({ error: 'Invalid user ID or role ID' });
      }
      
      const success = await storage.removeRoleFromUser(userId, roleId);
      if (!success) {
        return res.status(404).json({ error: 'User role not found or could not be removed' });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error('[API] Error removing role from user:', error);
      res.status(500).json({ error: 'Error removing role from user' });
    }
  });

  // Get all users with a specific role
  app.get("/api/admin/roles/:roleId/users", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const roleId = parseInt(req.params.roleId);
      if (isNaN(roleId)) {
        return res.status(400).json({ error: 'Invalid role ID' });
      }
      
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      
      const users = await storage.getUsersWithRole(roleId, { limit, offset });
      
      // Map to simplified format for client
      const result = users.map(u => ({
        id: u.userId,
        username: u.user.username,
        displayName: u.user.displayName,
        assignedAt: u.assignedAt,
        assignedBy: u.assignedBy
      }));
      
      res.json(result);
    } catch (error) {
      console.error('[API] Error getting users with role:', error);
      res.status(500).json({ error: 'Error getting users with role' });
    }
  });

  // Get role audit logs
  app.get("/api/admin/role-audit-logs", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const filters: {
        userId?: number;
        roleId?: number;
        action?: string;
        limit?: number;
        offset?: number;
      } = {};
      
      if (req.query.userId) {
        filters.userId = parseInt(req.query.userId as string);
      }
      
      if (req.query.roleId) {
        filters.roleId = parseInt(req.query.roleId as string);
      }
      
      if (req.query.action) {
        filters.action = req.query.action as string;
      }
      
      if (req.query.limit) {
        filters.limit = parseInt(req.query.limit as string);
      }
      
      if (req.query.offset) {
        filters.offset = parseInt(req.query.offset as string);
      }
      
      const logs = await storage.getRoleAuditLogs(filters);
      res.json(logs);
    } catch (error) {
      console.error('[API] Error getting role audit logs:', error);
      res.status(500).json({ error: 'Error getting role audit logs' });
    }
  });

  console.log("[API] User role management routes registered");
}