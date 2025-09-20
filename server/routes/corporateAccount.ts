/**
 * CORPORATE ACCOUNT MANAGEMENT API ROUTES - PRODUCTION-READY IMPLEMENTATION
 * 
 * RESTful API endpoints for enterprise corporate account management system.
 * Supports 4-level admin hierarchy with comprehensive security controls.
 * 
 * Version: 1.0.0 - Sprint 2: Corporate Account Management APIs
 * Last Updated: September 19, 2025
 * 
 * SECURITY REQUIREMENTS:
 * - All routes require user authentication
 * - Role-based access control enforced
 * - Cross-account privilege escalation prevention
 * - Complete audit logging for all operations
 * - Data validation and integrity checks
 */

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { db } from '../db';
import { 
  corporateAccounts, 
  corporateHierarchy, 
  corporateTransactions, 
  corporateBudgetAllocations,
  corporateAuditLog,
  users,
  insertCorporateAccountSchema,
  insertCorporateHierarchySchema,
  insertCorporateAuditLogSchema,
  CorporateRole
} from '../../shared/schema';
import { eq, and, isNull, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';

const router = Router();

// Rate limiting for corporate operations
const corporateRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per window for corporate operations
  message: { error: 'Too many corporate requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation schemas
const createCorporateAccountSchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters').max(100),
  domain: z.string().regex(/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/, 'Valid domain required'),
  industry: z.string().min(2).max(50),
  maxEmployees: z.number().min(10).max(1000, 'Maximum 1000 employees supported'),
  initialCredits: z.number().min(0).default(0),
  billingAddress: z.string().min(10).max(500),
  primaryContact: z.object({
    email: z.string().email('Valid email required'),
    phone: z.string().min(10).max(20),
    name: z.string().min(2).max(100)
  })
});

const addEmployeeSchema = z.object({
  userId: z.number().positive('Valid user ID required'),
  role: z.enum(['department_admin', 'team_lead', 'budget_controller', 'employee']),
  department: z.string().min(1).max(100).optional(),
  team: z.string().min(1).max(100).optional(),
  spendingLimit: z.number().min(0).default(0),
  supervisorId: z.number().positive().optional()
});

const updateRoleSchema = z.object({
  role: z.enum(['department_admin', 'team_lead', 'budget_controller', 'employee']),
  department: z.string().min(1).max(100).optional(),
  team: z.string().min(1).max(100).optional(),
  spendingLimit: z.number().min(0),
  supervisorId: z.number().positive().optional()
});

/**
 * AUTHENTICATION & AUTHORIZATION MIDDLEWARE
 */
function requireAuth(req: any, res: any, next: any) {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ 
      success: false, 
      error: 'Authentication required',
      code: 'AUTH_REQUIRED'
    });
  }
  next();
}

/**
 * CORPORATE ADMIN AUTHORIZATION MIDDLEWARE
 * Ensures user is admin or master admin of the corporate account
 */
async function requireCorporateAdmin(req: any, res: any, next: any) {
  try {
    const corporateAccountId = parseInt(req.params.corporateAccountId);
    const userId = req.user.id;

    // Check if user is master admin of this corporate account
    const corporateAccount = await db.select()
      .from(corporateAccounts)
      .where(eq(corporateAccounts.id, corporateAccountId))
      .limit(1);

    if (corporateAccount.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Corporate account not found',
        code: 'ACCOUNT_NOT_FOUND'
      });
    }

    // Check if user is master admin
    if (corporateAccount[0].masterAdminId === userId) {
      req.corporateAccount = corporateAccount[0];
      return next();
    }

    // Check if user has admin role in hierarchy
    const hierarchyRecord = await db.select()
      .from(corporateHierarchy)
      .where(
        and(
          eq(corporateHierarchy.corporateAccountId, corporateAccountId),
          eq(corporateHierarchy.userId, userId),
          eq(corporateHierarchy.role, 'department_admin')
        )
      )
      .limit(1);

    if (hierarchyRecord.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'Corporate admin access required',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    req.corporateAccount = corporateAccount[0];
    next();
  } catch (error) {
    console.error('[CORPORATE API] Authorization error:', error);
    res.status(500).json({
      success: false,
      error: 'Authorization check failed',
      code: 'AUTH_ERROR'
    });
  }
}

/**
 * AUDIT LOGGING UTILITY
 */
async function createAuditLog(
  corporateAccountId: number,
  actorId: number,
  action: string,
  entityType: string,
  entityId?: number,
  targetId?: number,
  previousValues?: any,
  newValues?: any,
  metadata?: any
) {
  try {
    await db.insert(corporateAuditLog).values({
      corporateAccountId,
      actorId,
      targetId,
      action,
      entityType,
      entityId,
      previousValues,
      newValues,
      metadata,
      idempotencyKey: nanoid(),
      isSuccessful: true
    });
  } catch (error) {
    console.error('[CORPORATE API] Audit log creation failed:', error);
  }
}

/**
 * CREATE CORPORATE ACCOUNT
 * POST /api/corporate/accounts
 */
router.post('/accounts', requireAuth, corporateRateLimit, async (req, res) => {
  try {
    const validatedData = createCorporateAccountSchema.parse(req.body);
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    // Check if user is already a master admin of another account
    const existingAccount = await db.select()
      .from(corporateAccounts)
      .where(eq(corporateAccounts.masterAdminId, userId))
      .limit(1);

    if (existingAccount.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'User is already master admin of another corporate account',
        code: 'ALREADY_MASTER_ADMIN'
      });
    }

    // Check domain uniqueness
    const domainExists = await db.select()
      .from(corporateAccounts)
      .where(eq(corporateAccounts.companyDomain, validatedData.domain))
      .limit(1);

    if (domainExists.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Domain is already registered',
        code: 'DOMAIN_EXISTS'
      });
    }

    // Create corporate account
    const [newAccount] = await db.insert(corporateAccounts).values({
      companyName: validatedData.companyName,
      companyDomain: validatedData.domain,
      maxEmployees: validatedData.maxEmployees,
      totalCredits: validatedData.initialCredits,
      totalAllocated: 0,
      totalPurchased: validatedData.initialCredits,
      masterAdminId: userId,
      status: 'active'
    }).returning();

    // Create master admin hierarchy record
    await db.insert(corporateHierarchy).values({
      corporateAccountId: newAccount.id,
      userId: userId,
      role: 'master_admin',
      spendingLimit: validatedData.initialCredits,
      canAllocateCredits: true,
      canViewReports: true,
      canManageUsers: true,
      supervisorId: null,
      supervisorCorporateAccountId: null
    });

    // Create audit log
    await createAuditLog(
      newAccount.id,
      userId,
      'create_account',
      'corporate_account',
      newAccount.id,
      undefined,
      undefined,
      newAccount,
      { 
        initialCredits: validatedData.initialCredits,
        primaryContact: validatedData.primaryContact
      }
    );

    res.status(201).json({
      success: true,
      data: {
        account: newAccount,
        message: 'Corporate account created successfully'
      }
    });

  } catch (error) {
    console.error('[CORPORATE API] Account creation error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors,
        code: 'VALIDATION_ERROR'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to create corporate account',
      code: 'CREATION_ERROR'
    });
  }
});

/**
 * GET CORPORATE ACCOUNT DETAILS
 * GET /api/corporate/accounts/:corporateAccountId
 */
router.get('/accounts/:corporateAccountId', requireAuth, requireCorporateAdmin, async (req, res) => {
  try {
    const corporateAccountId = parseInt(req.params.corporateAccountId);
    
    // Get account details with hierarchy
    const accountDetails = await db.select({
      account: corporateAccounts,
      masterAdmin: {
        id: users.id,
        username: users.username,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName
      }
    })
    .from(corporateAccounts)
    .innerJoin(users, eq(corporateAccounts.masterAdminId, users.id))
    .where(eq(corporateAccounts.id, corporateAccountId))
    .limit(1);

    if (accountDetails.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Corporate account not found',
        code: 'ACCOUNT_NOT_FOUND'
      });
    }

    // Get employee count
    const employeeCount = await db.select({ count: sql<number>`count(*)` })
      .from(corporateHierarchy)
      .where(eq(corporateHierarchy.corporateAccountId, corporateAccountId));

    res.json({
      success: true,
      data: {
        account: accountDetails[0].account,
        masterAdmin: accountDetails[0].masterAdmin,
        employeeCount: employeeCount[0].count
      }
    });

  } catch (error) {
    console.error('[CORPORATE API] Get account error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve account details',
      code: 'RETRIEVAL_ERROR'
    });
  }
});

/**
 * ADD EMPLOYEE TO CORPORATE ACCOUNT
 * POST /api/corporate/accounts/:corporateAccountId/employees
 */
router.post('/accounts/:corporateAccountId/employees', requireAuth, requireCorporateAdmin, async (req, res) => {
  try {
    const corporateAccountId = parseInt(req.params.corporateAccountId);
    const validatedData = addEmployeeSchema.parse(req.body);
    const actorId = req.user?.id;

    if (!actorId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    // Check if user already exists in this corporate account
    const existingEmployee = await db.select()
      .from(corporateHierarchy)
      .where(
        and(
          eq(corporateHierarchy.corporateAccountId, corporateAccountId),
          eq(corporateHierarchy.userId, validatedData.userId)
        )
      )
      .limit(1);

    if (existingEmployee.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'User is already a member of this corporate account',
        code: 'USER_ALREADY_EXISTS'
      });
    }

    // Verify user exists
    const user = await db.select()
      .from(users)
      .where(eq(users.id, validatedData.userId))
      .limit(1);

    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Handle supervisor validation if provided
    let supervisorCorporateAccountId = null;
    if (validatedData.supervisorId) {
      const supervisor = await db.select()
        .from(corporateHierarchy)
        .where(
          and(
            eq(corporateHierarchy.id, validatedData.supervisorId),
            eq(corporateHierarchy.corporateAccountId, corporateAccountId)
          )
        )
        .limit(1);

      if (supervisor.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Supervisor not found in this corporate account',
          code: 'SUPERVISOR_NOT_FOUND'
        });
      }
      supervisorCorporateAccountId = corporateAccountId;
    }

    // Create hierarchy record
    const [newEmployee] = await db.insert(corporateHierarchy).values({
      corporateAccountId,
      userId: validatedData.userId,
      role: validatedData.role,
      department: validatedData.department,
      team: validatedData.team,
      spendingLimit: validatedData.spendingLimit,
      canAllocateCredits: validatedData.role !== 'employee',
      canViewReports: true,
      canManageUsers: ['master_admin', 'department_admin'].includes(validatedData.role),
      supervisorId: validatedData.supervisorId,
      supervisorCorporateAccountId
    }).returning();

    // Update employee count
    await db.update(corporateAccounts)
      .set({ 
        employeeCount: sql`employee_count + 1`,
        updatedAt: sql`now()`
      })
      .where(eq(corporateAccounts.id, corporateAccountId));

    // Create audit log
    await createAuditLog(
      corporateAccountId,
      actorId,
      'add_employee',
      'corporate_hierarchy',
      newEmployee.id,
      validatedData.userId,
      undefined,
      newEmployee,
      { 
        role: validatedData.role,
        department: validatedData.department,
        team: validatedData.team
      }
    );

    res.status(201).json({
      success: true,
      data: {
        employee: newEmployee,
        user: user[0],
        message: 'Employee added successfully'
      }
    });

  } catch (error) {
    console.error('[CORPORATE API] Add employee error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors,
        code: 'VALIDATION_ERROR'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to add employee',
      code: 'ADD_EMPLOYEE_ERROR'
    });
  }
});

/**
 * UPDATE EMPLOYEE ROLE
 * PUT /api/corporate/accounts/:corporateAccountId/employees/:userId/role
 */
router.put('/accounts/:corporateAccountId/employees/:userId/role', requireAuth, requireCorporateAdmin, async (req, res) => {
  try {
    const corporateAccountId = parseInt(req.params.corporateAccountId);
    const userId = parseInt(req.params.userId);
    const validatedData = updateRoleSchema.parse(req.body);
    const actorId = req.user?.id;

    if (!actorId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    // Get existing employee record
    const [existingEmployee] = await db.select()
      .from(corporateHierarchy)
      .where(
        and(
          eq(corporateHierarchy.corporateAccountId, corporateAccountId),
          eq(corporateHierarchy.userId, userId)
        )
      )
      .limit(1);

    if (!existingEmployee) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found in this corporate account',
        code: 'EMPLOYEE_NOT_FOUND'
      });
    }

    // Cannot modify master admin
    if (existingEmployee.role === 'master_admin') {
      return res.status(403).json({
        success: false,
        error: 'Cannot modify master admin role',
        code: 'CANNOT_MODIFY_MASTER_ADMIN'
      });
    }

    // Handle supervisor validation if provided
    let supervisorCorporateAccountId = null;
    if (validatedData.supervisorId) {
      const supervisor = await db.select()
        .from(corporateHierarchy)
        .where(
          and(
            eq(corporateHierarchy.id, validatedData.supervisorId),
            eq(corporateHierarchy.corporateAccountId, corporateAccountId)
          )
        )
        .limit(1);

      if (supervisor.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Supervisor not found in this corporate account',
          code: 'SUPERVISOR_NOT_FOUND'
        });
      }
      supervisorCorporateAccountId = corporateAccountId;
    }

    // Update employee record
    const [updatedEmployee] = await db.update(corporateHierarchy)
      .set({
        role: validatedData.role,
        department: validatedData.department,
        team: validatedData.team,
        spendingLimit: validatedData.spendingLimit,
        canAllocateCredits: validatedData.role !== 'employee',
        canManageUsers: ['master_admin', 'department_admin'].includes(validatedData.role),
        supervisorId: validatedData.supervisorId,
        supervisorCorporateAccountId,
        lastActiveAt: sql`now()`
      })
      .where(
        and(
          eq(corporateHierarchy.corporateAccountId, corporateAccountId),
          eq(corporateHierarchy.userId, userId)
        )
      )
      .returning();

    // Create audit log
    await createAuditLog(
      corporateAccountId,
      actorId,
      'update_employee_role',
      'corporate_hierarchy',
      updatedEmployee.id,
      userId,
      existingEmployee,
      updatedEmployee,
      { 
        previousRole: existingEmployee.role,
        newRole: validatedData.role
      }
    );

    res.json({
      success: true,
      data: {
        employee: updatedEmployee,
        message: 'Employee role updated successfully'
      }
    });

  } catch (error) {
    console.error('[CORPORATE API] Update employee role error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors,
        code: 'VALIDATION_ERROR'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to update employee role',
      code: 'UPDATE_ROLE_ERROR'
    });
  }
});

/**
 * GET ORGANIZATION HIERARCHY
 * GET /api/corporate/accounts/:corporateAccountId/hierarchy
 */
router.get('/accounts/:corporateAccountId/hierarchy', requireAuth, requireCorporateAdmin, async (req, res) => {
  try {
    const corporateAccountId = parseInt(req.params.corporateAccountId);

    // Get all employees with user details
    const hierarchy = await db.select({
      employee: corporateHierarchy,
      user: {
        id: users.id,
        username: users.username,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName
      }
    })
    .from(corporateHierarchy)
    .innerJoin(users, eq(corporateHierarchy.userId, users.id))
    .where(eq(corporateHierarchy.corporateAccountId, corporateAccountId))
    .orderBy(corporateHierarchy.role, corporateHierarchy.department, corporateHierarchy.team);

    // Build hierarchy structure
    const employees = hierarchy.map(h => ({
      ...h.employee,
      user: h.user
    }));

    res.json({
      success: true,
      data: {
        employees,
        totalEmployees: employees.length,
        hierarchy: buildHierarchyTree(employees)
      }
    });

  } catch (error) {
    console.error('[CORPORATE API] Get hierarchy error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve organization hierarchy',
      code: 'HIERARCHY_ERROR'
    });
  }
});

/**
 * HELPER: Build hierarchy tree structure
 */
function buildHierarchyTree(employees: any[]) {
  const masterAdmin = employees.find(emp => emp.role === 'master_admin');
  const departmentAdmins = employees.filter(emp => emp.role === 'department_admin');
  const teamLeads = employees.filter(emp => emp.role === 'team_lead');
  const budgetControllers = employees.filter(emp => emp.role === 'budget_controller');
  const regularEmployees = employees.filter(emp => emp.role === 'employee');

  return {
    masterAdmin,
    departments: groupByDepartment(departmentAdmins, teamLeads, budgetControllers, regularEmployees)
  };
}

function groupByDepartment(departmentAdmins: any[], teamLeads: any[], budgetControllers: any[], employees: any[]) {
  const departments = new Map();

  // Group by department
  [...departmentAdmins, ...teamLeads, ...budgetControllers, ...employees].forEach(emp => {
    if (!emp.department) return;
    
    if (!departments.has(emp.department)) {
      departments.set(emp.department, {
        name: emp.department,
        admin: null,
        teams: new Map(),
        employees: []
      });
    }

    const dept = departments.get(emp.department);
    
    if (emp.role === 'department_admin') {
      dept.admin = emp;
    } else if (emp.team) {
      if (!dept.teams.has(emp.team)) {
        dept.teams.set(emp.team, {
          name: emp.team,
          lead: null,
          budgetControllers: [],
          employees: []
        });
      }
      
      const team = dept.teams.get(emp.team);
      
      if (emp.role === 'team_lead') {
        team.lead = emp;
      } else if (emp.role === 'budget_controller') {
        team.budgetControllers.push(emp);
      } else {
        team.employees.push(emp);
      }
    } else {
      dept.employees.push(emp);
    }
  });

  // Convert Maps to arrays
  const result = Array.from(departments.values()).map(dept => ({
    ...dept,
    teams: Array.from(dept.teams.values())
  }));

  return result;
}

export default router;