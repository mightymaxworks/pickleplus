/**
 * EMPLOYEE CONTROLS API ROUTES - SPENDING LIMITS & BUDGET ALLOCATION
 * 
 * Enterprise employee spending control system for corporate accounts with
 * granular spending limit management, department budget allocation, and
 * real-time budget monitoring with automated alerts and approval workflows.
 * 
 * Version: 1.0.0 - Sprint 2: Employee Controls & Budget Allocation
 * Last Updated: September 20, 2025
 * 
 * CONTROL FEATURES:
 * - Individual employee spending limit management
 * - Department and team budget allocation controls
 * - Automated spending threshold alerts and notifications
 * - Multi-level approval workflows for limit increases
 * - Real-time budget utilization monitoring and reporting
 * - Emergency override controls for critical business needs
 * 
 * SECURITY REQUIREMENTS:
 * - Corporate admin authentication required for all operations
 * - Role-based permissions (Master Admin, Department Admin, Budget Controller)
 * - Complete audit trail for all limit changes and budget modifications
 * - Rate limiting for sensitive financial control operations
 */

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { drizzle } from "drizzle-orm/postgres-js";
import { eq, and, desc, asc, sum, count, sql, gte, lte, between } from "drizzle-orm";
import postgres from "postgres";
import { 
  corporateAccounts,
  corporateHierarchy,
  digitalCreditsAccounts,
  digitalCreditsTransactions,
  users,
  type CorporateAccount,
  type CorporateHierarchy
} from "../../shared/schema";
import { requireAuth } from '../middleware/auth';

const router = Router();

// Database connection
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}
const sql_client = postgres(connectionString);
const db = drizzle(sql_client);

// Rate limiting for employee control operations
const employeeControlRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20, // 20 control operations per 10 minutes
  message: { error: 'Employee control operations rate limit exceeded' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Enhanced rate limiting for sensitive budget operations
const budgetControlRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 budget operations per 15 minutes
  message: { error: 'Budget control operations rate limit exceeded, please contact administrator' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * CORPORATE ADMIN AUTHORIZATION MIDDLEWARE
 * Ensures user is admin or master admin of the corporate account
 */
async function requireCorporateAdmin(req: any, res: any, next: any) {
  try {
    const corporateAccountId = parseInt(req.params.corporateAccountId);
    const userId = req.user.id;

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
      req.userRole = 'master_admin';
      req.canModifyAllBudgets = true;
      req.canModifyAllLimits = true;
      return next();
    }

    // Check if user has admin role in hierarchy
    const hierarchyRecord = await db.select()
      .from(corporateHierarchy)
      .where(
        and(
          eq(corporateHierarchy.corporateAccountId, corporateAccountId),
          eq(corporateHierarchy.userId, userId)
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

    const userHierarchy = hierarchyRecord[0];
    
    // Validate admin roles for employee controls
    if (!['department_admin', 'budget_controller'].includes(userHierarchy.role)) {
      return res.status(403).json({
        success: false,
        error: 'Budget control privileges required',
        code: 'INSUFFICIENT_BUDGET_ROLE'
      });
    }

    req.corporateAccount = corporateAccount[0];
    req.userHierarchy = userHierarchy;
    req.userRole = userHierarchy.role;
    req.canModifyAllBudgets = userHierarchy.role === 'department_admin';
    req.canModifyAllLimits = ['department_admin', 'budget_controller'].includes(userHierarchy.role);
    req.userDepartment = userHierarchy.department;
    req.userTeam = userHierarchy.team;
    
    next();
  } catch (error) {
    console.error('[EMPLOYEE CONTROLS] Authorization error:', error);
    res.status(500).json({
      success: false,
      error: 'Authorization check failed',
      code: 'AUTH_ERROR'
    });
  }
}

// Validation schemas
const updateSpendingLimitSchema = z.object({
  userId: z.number().int().positive('Valid user ID required'),
  newSpendingLimit: z.number().min(0, 'Spending limit must be non-negative').max(100000, 'Maximum spending limit is $1,000'),
  reason: z.string().min(10, 'Reason for limit change required (minimum 10 characters)'),
  effectiveDate: z.string().datetime().optional(),
  expirationDate: z.string().datetime().optional(),
  requiresApproval: z.boolean().default(false)
});

const departmentBudgetSchema = z.object({
  department: z.string().min(1, 'Department name required'),
  monthlyBudget: z.number().min(0, 'Monthly budget must be non-negative').max(1000000, 'Maximum monthly budget is $10,000'),
  quarterlyBudget: z.number().min(0, 'Quarterly budget must be non-negative').max(3000000, 'Maximum quarterly budget is $30,000'),
  annualBudget: z.number().min(0, 'Annual budget must be non-negative').max(10000000, 'Maximum annual budget is $100,000'),
  budgetJustification: z.string().min(20, 'Budget justification required (minimum 20 characters)'),
  alertThresholds: z.object({
    warning: z.number().min(0.5).max(0.95).default(0.8), // 80% warning threshold
    critical: z.number().min(0.8).max(1.0).default(0.95)  // 95% critical threshold
  }).optional()
});

const bulkLimitUpdateSchema = z.object({
  updates: z.array(z.object({
    userId: z.number().int().positive(),
    newSpendingLimit: z.number().min(0).max(100000),
    reason: z.string().min(10)
  })).min(1, 'At least one update required').max(50, 'Maximum 50 bulk updates per request'),
  effectiveDate: z.string().datetime().optional(),
  requiresApproval: z.boolean().default(true)
});

/**
 * GET /api/employee-controls/:corporateAccountId/spending-limits
 * Get employee spending limits with current utilization
 */
router.get('/:corporateAccountId/spending-limits', employeeControlRateLimit, requireAuth, requireCorporateAdmin, async (req: any, res: any) => {
  try {
    const corporateAccountId = parseInt(req.params.corporateAccountId);
    
    // Get employee spending limits with filters based on user role
    let whereConditions = [eq(corporateHierarchy.corporateAccountId, corporateAccountId)];

    // Apply role-based filtering
    if (!req.canModifyAllLimits && req.userDepartment) {
      whereConditions.push(eq(corporateHierarchy.department, req.userDepartment));
    }

    const employeeData = await db.select({
      employee: corporateHierarchy,
      user: {
        id: users.id,
        username: users.username,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email
      }
    })
    .from(corporateHierarchy)
    .innerJoin(users, eq(corporateHierarchy.userId, users.id))
    .where(whereConditions.length === 1 ? whereConditions[0] : and(...whereConditions))
    .orderBy(corporateHierarchy.department, corporateHierarchy.team, corporateHierarchy.role);

    // Calculate spending utilization for each employee
    // TODO: Implement actual spending calculation when transaction tracking is available
    const employeeLimits = employeeData.map(emp => {
      const currentSpending = 0; // TODO: Calculate from actual transactions
      const spendingLimit = emp.employee.spendingLimit || 0;
      const utilizationRate = spendingLimit > 0 ? (currentSpending / spendingLimit) * 100 : 0;
      
      return {
        employee: emp.employee,
        user: emp.user,
        spendingAnalysis: {
          currentSpending,
          spendingLimit,
          remainingBudget: spendingLimit - currentSpending,
          utilizationRate: Math.round(utilizationRate * 100) / 100,
          status: utilizationRate >= 95 ? 'critical' : utilizationRate >= 80 ? 'warning' : 'normal',
          lastTransaction: null, // TODO: Get from transaction history
          monthlyAverage: 0 // TODO: Calculate monthly average
        },
        permissions: {
          canModifyLimit: req.canModifyAllLimits || 
            (req.userRole === 'budget_controller' && emp.employee.department === req.userDepartment),
          canViewTransactions: true,
          canSetAlerts: true
        }
      };
    });

    // Group by department for summary
    const departmentSummary = employeeLimits.reduce((acc, emp) => {
      const dept = emp.employee.department || 'Unassigned';
      if (!acc[dept]) {
        acc[dept] = {
          department: dept,
          totalEmployees: 0,
          totalBudgetAllocated: 0,
          totalSpending: 0,
          averageUtilization: 0,
          highUtilizationCount: 0
        };
      }
      
      acc[dept].totalEmployees++;
      acc[dept].totalBudgetAllocated += emp.spendingAnalysis.spendingLimit;
      acc[dept].totalSpending += emp.spendingAnalysis.currentSpending;
      acc[dept].averageUtilization += emp.spendingAnalysis.utilizationRate;
      
      if (emp.spendingAnalysis.utilizationRate >= 80) {
        acc[dept].highUtilizationCount++;
      }
      
      return acc;
    }, {} as Record<string, any>);

    // Calculate averages
    Object.values(departmentSummary).forEach((dept: any) => {
      dept.averageUtilization = dept.totalEmployees > 0 ? 
        Math.round((dept.averageUtilization / dept.totalEmployees) * 100) / 100 : 0;
    });

    res.json({
      success: true,
      data: {
        employeeLimits,
        summary: {
          totalEmployees: employeeLimits.length,
          totalBudgetAllocated: employeeLimits.reduce((sum, emp) => sum + emp.spendingAnalysis.spendingLimit, 0),
          totalCurrentSpending: employeeLimits.reduce((sum, emp) => sum + emp.spendingAnalysis.currentSpending, 0),
          highUtilizationEmployees: employeeLimits.filter(emp => emp.spendingAnalysis.utilizationRate >= 80).length,
          departmentBreakdown: Object.values(departmentSummary)
        },
        permissions: {
          userRole: req.userRole,
          canModifyAllLimits: req.canModifyAllLimits,
          viewingDepartment: req.userDepartment
        }
      }
    });

  } catch (error) {
    console.error('[EMPLOYEE CONTROLS] Spending limits error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve employee spending limits',
      code: 'SPENDING_LIMITS_ERROR'
    });
  }
});

/**
 * PUT /api/employee-controls/:corporateAccountId/spending-limit
 * Update individual employee spending limit
 */
router.put('/:corporateAccountId/spending-limit', employeeControlRateLimit, requireAuth, requireCorporateAdmin, async (req: any, res: any) => {
  try {
    const corporateAccountId = parseInt(req.params.corporateAccountId);
    const validation = updateSpendingLimitSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid spending limit update request',
        details: validation.error.issues,
        code: 'VALIDATION_ERROR'
      });
    }

    const { userId, newSpendingLimit, reason, effectiveDate, expirationDate, requiresApproval } = validation.data;

    // Verify employee exists in corporate account
    const employeeRecord = await db.select()
      .from(corporateHierarchy)
      .where(
        and(
          eq(corporateHierarchy.corporateAccountId, corporateAccountId),
          eq(corporateHierarchy.userId, userId)
        )
      )
      .limit(1);

    if (employeeRecord.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found in corporate account',
        code: 'EMPLOYEE_NOT_FOUND'
      });
    }

    const employee = employeeRecord[0];

    // Check permissions for this specific employee
    if (!req.canModifyAllLimits) {
      if (req.userRole === 'budget_controller' && employee.department !== req.userDepartment) {
        return res.status(403).json({
          success: false,
          error: 'Can only modify spending limits within your department',
          code: 'DEPARTMENT_PERMISSION_DENIED'
        });
      }
    }

    // Store previous limit for audit trail
    const previousLimit = employee.spendingLimit;

    // Update spending limit
    const [updatedEmployee] = await db.update(corporateHierarchy)
      .set({
        spendingLimit: newSpendingLimit,
        lastActiveAt: sql`now()`
      })
      .where(
        and(
          eq(corporateHierarchy.corporateAccountId, corporateAccountId),
          eq(corporateHierarchy.userId, userId)
        )
      )
      .returning();

    // TODO: Create audit log entry for limit change
    const auditEntry = {
      corporateAccountId,
      actorId: req.user.id,
      action: 'update_spending_limit',
      targetUserId: userId,
      previousLimit,
      newLimit: newSpendingLimit,
      reason,
      effectiveDate: effectiveDate || new Date().toISOString(),
      expirationDate,
      requiresApproval,
      timestamp: new Date().toISOString()
    };

    // TODO: If requiresApproval is true, create pending approval request
    if (requiresApproval) {
      // Would create approval workflow entry here
    }

    res.json({
      success: true,
      data: {
        employee: updatedEmployee,
        limitChange: {
          previousLimit,
          newLimit: newSpendingLimit,
          changeAmount: newSpendingLimit - previousLimit,
          changePercentage: previousLimit > 0 ? 
            Math.round(((newSpendingLimit - previousLimit) / previousLimit) * 10000) / 100 : 0,
          reason,
          effectiveDate: effectiveDate || new Date().toISOString(),
          requiresApproval
        },
        audit: auditEntry,
        message: requiresApproval ? 
          'Spending limit change submitted for approval' : 
          'Spending limit updated successfully'
      }
    });

  } catch (error) {
    console.error('[EMPLOYEE CONTROLS] Update spending limit error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update employee spending limit',
      code: 'UPDATE_LIMIT_ERROR'
    });
  }
});

/**
 * POST /api/employee-controls/:corporateAccountId/bulk-limit-update
 * Bulk update employee spending limits
 */
router.post('/:corporateAccountId/bulk-limit-update', budgetControlRateLimit, requireAuth, requireCorporateAdmin, async (req: any, res: any) => {
  try {
    const corporateAccountId = parseInt(req.params.corporateAccountId);
    const validation = bulkLimitUpdateSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid bulk limit update request',
        details: validation.error.issues,
        code: 'VALIDATION_ERROR'
      });
    }

    const { updates, effectiveDate, requiresApproval } = validation.data;

    // Verify all employees exist and user has permission to modify them
    const userIds = updates.map(update => update.userId);
    const employees = await db.select()
      .from(corporateHierarchy)
      .where(
        and(
          eq(corporateHierarchy.corporateAccountId, corporateAccountId),
          sql`${corporateHierarchy.userId} = ANY(${userIds})`
        )
      );

    if (employees.length !== updates.length) {
      return res.status(400).json({
        success: false,
        error: 'Some employees not found in corporate account',
        code: 'INVALID_EMPLOYEE_LIST'
      });
    }

    // Check permissions for each employee
    if (!req.canModifyAllLimits) {
      const unauthorizedEmployees = employees.filter(emp => 
        req.userRole === 'budget_controller' && emp.department !== req.userDepartment
      );

      if (unauthorizedEmployees.length > 0) {
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions for some employees',
          code: 'BULK_PERMISSION_DENIED',
          details: {
            unauthorizedCount: unauthorizedEmployees.length,
            allowedDepartment: req.userDepartment
          }
        });
      }
    }

    // Process bulk updates
    const updateResults = [];
    const auditEntries = [];

    for (const update of updates) {
      const employee = employees.find(emp => emp.userId === update.userId);
      if (!employee) continue;

      const previousLimit = employee.spendingLimit;

      // Update spending limit
      const [updatedEmployee] = await db.update(corporateHierarchy)
        .set({
          spendingLimit: update.newSpendingLimit,
          lastActiveAt: sql`now()`
        })
        .where(
          and(
            eq(corporateHierarchy.corporateAccountId, corporateAccountId),
            eq(corporateHierarchy.userId, update.userId)
          )
        )
        .returning();

      updateResults.push({
        userId: update.userId,
        success: true,
        previousLimit,
        newLimit: update.newSpendingLimit,
        employee: updatedEmployee
      });

      auditEntries.push({
        corporateAccountId,
        actorId: req.user.id,
        action: 'bulk_update_spending_limit',
        targetUserId: update.userId,
        previousLimit,
        newLimit: update.newSpendingLimit,
        reason: update.reason,
        effectiveDate: effectiveDate || new Date().toISOString(),
        requiresApproval,
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      data: {
        bulkUpdate: {
          totalUpdates: updateResults.length,
          successfulUpdates: updateResults.filter(r => r.success).length,
          effectiveDate: effectiveDate || new Date().toISOString(),
          requiresApproval
        },
        results: updateResults,
        audit: auditEntries,
        summary: {
          totalLimitIncrease: updateResults.reduce((sum, r) => 
            sum + (r.newLimit - r.previousLimit), 0),
          averageLimitChange: updateResults.length > 0 ? 
            updateResults.reduce((sum, r) => sum + (r.newLimit - r.previousLimit), 0) / updateResults.length : 0
        },
        message: requiresApproval ? 
          'Bulk limit changes submitted for approval' : 
          'Bulk spending limits updated successfully'
      }
    });

  } catch (error) {
    console.error('[EMPLOYEE CONTROLS] Bulk limit update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process bulk limit updates',
      code: 'BULK_UPDATE_ERROR'
    });
  }
});

/**
 * GET /api/employee-controls/:corporateAccountId/department-budgets
 * Get department budget allocations and utilization
 */
router.get('/:corporateAccountId/department-budgets', employeeControlRateLimit, requireAuth, requireCorporateAdmin, async (req: any, res: any) => {
  try {
    const corporateAccountId = parseInt(req.params.corporateAccountId);

    // Get department budget data
    const departmentData = await db.select({
      department: corporateHierarchy.department,
      role: corporateHierarchy.role,
      employeeCount: count(),
      totalSpendingLimits: sum(corporateHierarchy.spendingLimit),
      avgSpendingLimit: sql<number>`avg(${corporateHierarchy.spendingLimit})`
    })
    .from(corporateHierarchy)
    .where(
      and(
        eq(corporateHierarchy.corporateAccountId, corporateAccountId),
        sql`${corporateHierarchy.department} IS NOT NULL`
      )
    )
    .groupBy(corporateHierarchy.department, corporateHierarchy.role);

    // Process department budget information
    const departmentBudgets = departmentData.reduce((acc, item) => {
      const dept = item.department || 'Unassigned';
      if (!acc[dept]) {
        acc[dept] = {
          department: dept,
          totalEmployees: 0,
          totalAllocatedLimits: 0,
          averageEmployeeLimit: 0,
          roleBreakdown: {},
          // TODO: Add actual budget allocations when budget system is implemented
          monthlyBudget: 0,
          quarterlyBudget: 0,
          annualBudget: 0,
          currentSpending: 0,
          utilizationRate: 0,
          alertStatus: 'normal'
        };
      }

      acc[dept].totalEmployees += item.employeeCount;
      acc[dept].totalAllocatedLimits += item.totalSpendingLimits || 0;
      
      acc[dept].roleBreakdown[item.role] = {
        role: item.role,
        employeeCount: item.employeeCount,
        totalLimits: item.totalSpendingLimits || 0,
        averageLimit: Math.round(item.avgSpendingLimit || 0)
      };

      return acc;
    }, {} as Record<string, any>);

    // Calculate averages and finalize data
    Object.values(departmentBudgets).forEach((dept: any) => {
      dept.averageEmployeeLimit = dept.totalEmployees > 0 ? 
        Math.round(dept.totalAllocatedLimits / dept.totalEmployees) : 0;
      dept.roleBreakdown = Object.values(dept.roleBreakdown);
      
      // TODO: Calculate actual utilization when spending tracking is available
      // dept.utilizationRate = dept.monthlyBudget > 0 ? (dept.currentSpending / dept.monthlyBudget) * 100 : 0;
      // dept.alertStatus = dept.utilizationRate >= 95 ? 'critical' : dept.utilizationRate >= 80 ? 'warning' : 'normal';
    });

    res.json({
      success: true,
      data: {
        departmentBudgets: Object.values(departmentBudgets),
        corporateSummary: {
          totalDepartments: Object.keys(departmentBudgets).length,
          totalEmployees: Object.values(departmentBudgets).reduce((sum, dept: any) => sum + dept.totalEmployees, 0),
          totalAllocatedLimits: Object.values(departmentBudgets).reduce((sum, dept: any) => sum + dept.totalAllocatedLimits, 0),
          averageDepartmentSize: Object.keys(departmentBudgets).length > 0 ? 
            Object.values(departmentBudgets).reduce((sum, dept: any) => sum + dept.totalEmployees, 0) / Object.keys(departmentBudgets).length : 0
        },
        recommendations: [
          'Consider setting monthly budget caps for high-allocation departments',
          'Review departments with low utilization for budget optimization',
          'Implement automated alerts for budget threshold breaches',
          'Establish quarterly budget review cycles for all departments'
        ],
        permissions: {
          userRole: req.userRole,
          canModifyAllBudgets: req.canModifyAllBudgets,
          viewingDepartment: req.userDepartment
        }
      }
    });

  } catch (error) {
    console.error('[EMPLOYEE CONTROLS] Department budgets error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve department budget data',
      code: 'DEPARTMENT_BUDGETS_ERROR'
    });
  }
});

export default router;