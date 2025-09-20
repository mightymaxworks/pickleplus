/**
 * CORPORATE ADMIN DASHBOARD API ROUTES - REAL-TIME ANALYTICS
 * 
 * Enterprise dashboard for corporate account management with real-time analytics,
 * spending controls, employee activity monitoring, and multi-level reporting.
 * 
 * Version: 1.0.0 - Sprint 2: Corporate Admin Dashboard System
 * Last Updated: September 20, 2025
 * 
 * DASHBOARD FEATURES:
 * - Real-time spending analytics and trends
 * - Department/team budget breakdown and utilization
 * - Employee activity monitoring with drill-down capabilities
 * - Credit usage forecasting and optimization insights
 * - Multi-level reporting for different admin roles
 * - Budget allocation controls and limit management
 * 
 * SECURITY REQUIREMENTS:
 * - Corporate admin authentication required
 * - Role-based data access (Master Admin sees all, Department Admins see their dept)
 * - Rate limiting for analytics queries
 * - Complete audit trail for financial data access
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

// Rate limiting for analytics queries
const analyticsRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50, // 50 analytics requests per 5 minutes
  message: { error: 'Analytics rate limit exceeded, please wait before requesting more data' },
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
      req.userRole = 'master_admin';
      req.canViewAllDepartments = true;
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
    
    // Validate admin roles
    if (!['department_admin', 'team_lead', 'budget_controller'].includes(userHierarchy.role)) {
      return res.status(403).json({
        success: false,
        error: 'Admin privileges required for dashboard access',
        code: 'INSUFFICIENT_ADMIN_ROLE'
      });
    }

    req.corporateAccount = corporateAccount[0];
    req.userHierarchy = userHierarchy;
    req.userRole = userHierarchy.role;
    req.canViewAllDepartments = userHierarchy.role === 'department_admin';
    req.userDepartment = userHierarchy.department;
    req.userTeam = userHierarchy.team;
    
    next();
  } catch (error) {
    console.error('[CORPORATE DASHBOARD] Authorization error:', error);
    res.status(500).json({
      success: false,
      error: 'Authorization check failed',
      code: 'AUTH_ERROR'
    });
  }
}

// Validation schemas
const analyticsTimeRangeSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  period: z.enum(['7d', '30d', '90d', '1y', 'all']).default('30d'),
  department: z.string().optional(),
  team: z.string().optional()
});

/**
 * GET /api/corporate-dashboard/:corporateAccountId/overview
 * Get corporate account overview with key metrics
 */
router.get('/:corporateAccountId/overview', analyticsRateLimit, requireAuth, requireCorporateAdmin, async (req: any, res: any) => {
  try {
    const corporateAccountId = parseInt(req.params.corporateAccountId);
    
    // Get employee count and structure
    const employeeStats = await db.select({
      total: count(),
      role: corporateHierarchy.role,
      department: corporateHierarchy.department
    })
    .from(corporateHierarchy)
    .where(eq(corporateHierarchy.corporateAccountId, corporateAccountId))
    .groupBy(corporateHierarchy.role, corporateHierarchy.department);

    // Calculate total employees and role distribution
    const totalEmployees = employeeStats.reduce((sum, stat) => sum + stat.total, 0);
    const roleDistribution = employeeStats.reduce((acc, stat) => {
      acc[stat.role] = (acc[stat.role] || 0) + stat.total;
      return acc;
    }, {} as Record<string, number>);

    // Get department breakdown
    const departmentStats = await db.select({
      department: corporateHierarchy.department,
      count: count(),
      avgSpendingLimit: sql<number>`avg(${corporateHierarchy.spendingLimit})`
    })
    .from(corporateHierarchy)
    .where(
      and(
        eq(corporateHierarchy.corporateAccountId, corporateAccountId),
        sql`${corporateHierarchy.department} IS NOT NULL`
      )
    )
    .groupBy(corporateHierarchy.department);

    // Get recent bulk purchases (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // TODO: Get actual bulk purchase transactions when bulk purchase history is implemented
    const recentPurchases = {
      totalPurchases: 0,
      totalAmount: 0,
      totalCreditsReceived: 0,
      averageDiscount: 0
    };

    // Get credit utilization across organization
    // TODO: Implement when individual credit spending tracking is available
    const creditUtilization = {
      totalAllocated: 0,
      totalSpent: 0,
      utilizationRate: 0,
      topSpendingDepartments: []
    };

    res.json({
      success: true,
      data: {
        overview: {
          corporateAccount: req.corporateAccount,
          totalEmployees,
          activeEmployees: totalEmployees, // TODO: Calculate based on recent activity
          totalDepartments: departmentStats.length
        },
        employeeDistribution: {
          total: totalEmployees,
          byRole: roleDistribution,
          byDepartment: departmentStats.map(dept => ({
            department: dept.department,
            employeeCount: dept.count,
            averageSpendingLimit: Math.round(dept.avgSpendingLimit || 0)
          }))
        },
        recentActivity: {
          bulkPurchases: recentPurchases,
          creditUtilization,
          lastUpdated: new Date().toISOString()
        },
        permissions: {
          userRole: req.userRole,
          canViewAllDepartments: req.canViewAllDepartments,
          userDepartment: req.userDepartment,
          userTeam: req.userTeam
        }
      }
    });

  } catch (error) {
    console.error('[CORPORATE DASHBOARD] Overview error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve corporate overview',
      code: 'OVERVIEW_ERROR'
    });
  }
});

/**
 * GET /api/corporate-dashboard/:corporateAccountId/spending-analytics
 * Get detailed spending analytics with time-based trends
 */
router.get('/:corporateAccountId/spending-analytics', analyticsRateLimit, requireAuth, requireCorporateAdmin, async (req: any, res: any) => {
  try {
    const corporateAccountId = parseInt(req.params.corporateAccountId);
    const queryValidation = analyticsTimeRangeSchema.safeParse(req.query);
    
    if (!queryValidation.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid analytics parameters',
        details: queryValidation.error.issues,
        code: 'VALIDATION_ERROR'
      });
    }

    const { period, department, team } = queryValidation.data;

    // Calculate date range based on period
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      case 'all':
        startDate.setFullYear(2020); // Set to a very early date
        break;
    }

    // Get employee spending data (filtered by department/team if specified and user has access)
    let departmentFilter = null;
    let teamFilter = null;

    if (!req.canViewAllDepartments) {
      // Department admins can only see their department
      departmentFilter = req.userDepartment;
      if (req.userRole === 'team_lead') {
        teamFilter = req.userTeam;
      }
    } else if (department) {
      departmentFilter = department;
      if (team) {
        teamFilter = team;
      }
    }

    // Build employee list with filters
    let whereConditions = [eq(corporateHierarchy.corporateAccountId, corporateAccountId)];
    
    if (departmentFilter) {
      whereConditions.push(eq(corporateHierarchy.department, departmentFilter));
    }
    
    if (teamFilter) {
      whereConditions.push(eq(corporateHierarchy.team, teamFilter));
    }

    const employees = await db.select({
      userId: corporateHierarchy.userId,
      role: corporateHierarchy.role,
      department: corporateHierarchy.department,
      team: corporateHierarchy.team,
      spendingLimit: corporateHierarchy.spendingLimit,
      user: {
        id: users.id,
        username: users.username,
        firstName: users.firstName,
        lastName: users.lastName
      }
    })
    .from(corporateHierarchy)
    .innerJoin(users, eq(corporateHierarchy.userId, users.id))
    .where(whereConditions.length === 1 ? whereConditions[0] : and(...whereConditions));

    // TODO: Implement actual spending analytics when credit transaction tracking is available
    const spendingAnalytics = {
      totalSpending: 0,
      averageDailySpending: 0,
      topSpenders: employees.slice(0, 10).map(emp => ({
        user: emp.user,
        department: emp.department,
        team: emp.team,
        spendingLimit: emp.spendingLimit,
        totalSpent: 0,
        utilizationRate: 0
      })),
      departmentBreakdown: [],
      dailyTrends: [],
      weeklyComparison: {
        thisWeek: 0,
        lastWeek: 0,
        percentChange: 0
      }
    };

    res.json({
      success: true,
      data: {
        analytics: spendingAnalytics,
        period: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          period
        },
        filters: {
          department: departmentFilter,
          team: teamFilter,
          totalEmployees: employees.length
        },
        permissions: {
          userRole: req.userRole,
          canViewAllDepartments: req.canViewAllDepartments
        }
      }
    });

  } catch (error) {
    console.error('[CORPORATE DASHBOARD] Spending analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve spending analytics',
      code: 'ANALYTICS_ERROR'
    });
  }
});

/**
 * GET /api/corporate-dashboard/:corporateAccountId/employee-activity
 * Get employee activity monitoring with drill-down capabilities
 */
router.get('/:corporateAccountId/employee-activity', analyticsRateLimit, requireAuth, requireCorporateAdmin, async (req: any, res: any) => {
  try {
    const corporateAccountId = parseInt(req.params.corporateAccountId);
    
    // Get employee activity data with filters based on user role
    let whereConditions = [eq(corporateHierarchy.corporateAccountId, corporateAccountId)];

    // Apply role-based filtering
    if (!req.canViewAllDepartments && req.userDepartment) {
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
    .orderBy(
      corporateHierarchy.department,
      corporateHierarchy.team,
      corporateHierarchy.role
    );

    // Process employee activity data
    const activityData = employeeData.map(emp => ({
      employee: {
        id: emp.employee.id,
        userId: emp.employee.userId,
        role: emp.employee.role,
        department: emp.employee.department,
        team: emp.employee.team,
        spendingLimit: emp.employee.spendingLimit,
        lastActiveAt: emp.employee.lastActiveAt
      },
      user: emp.user,
      activity: {
        // TODO: Implement actual activity tracking
        creditsSpent: 0,
        transactionCount: 0,
        lastTransaction: null,
        utilizationRate: 0,
        status: 'active' // active, inactive, suspended
      },
      permissions: {
        canAllocateCredits: emp.employee.canAllocateCredits,
        canViewReports: emp.employee.canViewReports,
        canManageUsers: emp.employee.canManageUsers
      }
    }));

    // Group by department and team
    const departmentGroups = activityData.reduce((acc, emp) => {
      const dept = emp.employee.department || 'Unassigned';
      if (!acc[dept]) {
        acc[dept] = {
          department: dept,
          totalEmployees: 0,
          teams: {},
          totalSpending: 0,
          averageUtilization: 0
        };
      }
      
      acc[dept].totalEmployees++;
      
      const team = emp.employee.team || 'Unassigned';
      if (!acc[dept].teams[team]) {
        acc[dept].teams[team] = {
          team,
          employees: [],
          totalSpending: 0,
          averageUtilization: 0
        };
      }
      
      acc[dept].teams[team].employees.push(emp);
      return acc;
    }, {} as Record<string, any>);

    // Convert teams object to array
    Object.values(departmentGroups).forEach((dept: any) => {
      dept.teams = Object.values(dept.teams);
    });

    res.json({
      success: true,
      data: {
        employees: activityData,
        departmentGroups: Object.values(departmentGroups),
        summary: {
          totalEmployees: activityData.length,
          activeEmployees: activityData.filter(emp => emp.activity.status === 'active').length,
          inactiveEmployees: activityData.filter(emp => emp.activity.status === 'inactive').length,
          totalDepartments: Object.keys(departmentGroups).length
        },
        permissions: {
          userRole: req.userRole,
          canViewAllDepartments: req.canViewAllDepartments,
          viewingDepartment: req.userDepartment
        }
      }
    });

  } catch (error) {
    console.error('[CORPORATE DASHBOARD] Employee activity error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve employee activity data',
      code: 'ACTIVITY_ERROR'
    });
  }
});

/**
 * GET /api/corporate-dashboard/:corporateAccountId/budget-controls
 * Get budget allocation controls and spending limits management
 */
router.get('/:corporateAccountId/budget-controls', analyticsRateLimit, requireAuth, requireCorporateAdmin, async (req: any, res: any) => {
  try {
    const corporateAccountId = parseInt(req.params.corporateAccountId);

    // Get budget allocation data by department and team
    const budgetData = await db.select({
      department: corporateHierarchy.department,
      team: corporateHierarchy.team,
      role: corporateHierarchy.role,
      spendingLimit: corporateHierarchy.spendingLimit,
      employeeCount: count()
    })
    .from(corporateHierarchy)
    .where(eq(corporateHierarchy.corporateAccountId, corporateAccountId))
    .groupBy(
      corporateHierarchy.department,
      corporateHierarchy.team,
      corporateHierarchy.role,
      corporateHierarchy.spendingLimit
    );

    // Calculate budget summaries
    const departmentBudgets = budgetData.reduce((acc, item) => {
      const dept = item.department || 'Unassigned';
      if (!acc[dept]) {
        acc[dept] = {
          department: dept,
          totalEmployees: 0,
          totalBudgetAllocated: 0,
          teams: {},
          roles: {}
        };
      }

      acc[dept].totalEmployees += item.employeeCount;
      acc[dept].totalBudgetAllocated += (item.spendingLimit || 0) * item.employeeCount;

      // Track by team
      const team = item.team || 'Unassigned';
      if (!acc[dept].teams[team]) {
        acc[dept].teams[team] = {
          team,
          employeeCount: 0,
          budgetAllocated: 0
        };
      }
      acc[dept].teams[team].employeeCount += item.employeeCount;
      acc[dept].teams[team].budgetAllocated += (item.spendingLimit || 0) * item.employeeCount;

      // Track by role
      if (!acc[dept].roles[item.role]) {
        acc[dept].roles[item.role] = {
          role: item.role,
          employeeCount: 0,
          budgetAllocated: 0,
          averageLimit: 0
        };
      }
      acc[dept].roles[item.role].employeeCount += item.employeeCount;
      acc[dept].roles[item.role].budgetAllocated += (item.spendingLimit || 0) * item.employeeCount;
      acc[dept].roles[item.role].averageLimit = acc[dept].roles[item.role].budgetAllocated / acc[dept].roles[item.role].employeeCount;

      return acc;
    }, {} as Record<string, any>);

    // Convert nested objects to arrays
    Object.values(departmentBudgets).forEach((dept: any) => {
      dept.teams = Object.values(dept.teams);
      dept.roles = Object.values(dept.roles);
    });

    // Calculate overall budget metrics
    const totalBudgetAllocated = Object.values(departmentBudgets).reduce((sum, dept: any) => sum + dept.totalBudgetAllocated, 0);
    const totalEmployees = Object.values(departmentBudgets).reduce((sum, dept: any) => sum + dept.totalEmployees, 0);

    res.json({
      success: true,
      data: {
        budgetControls: {
          totalBudgetAllocated,
          totalEmployees,
          averageAllocationPerEmployee: totalEmployees > 0 ? totalBudgetAllocated / totalEmployees : 0,
          departmentBreakdown: Object.values(departmentBudgets)
        },
        recommendations: [
          'Consider implementing department-level budget caps for better control',
          'Review high-allocation employees for spending pattern optimization',
          'Set up automated alerts for budget threshold breaches',
          'Implement quarterly budget reviews for department efficiency'
        ],
        permissions: {
          userRole: req.userRole,
          canModifyBudgets: req.userRole === 'master_admin' || req.userRole === 'department_admin',
          canViewAllDepartments: req.canViewAllDepartments
        }
      }
    });

  } catch (error) {
    console.error('[CORPORATE DASHBOARD] Budget controls error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve budget control data',
      code: 'BUDGET_ERROR'
    });
  }
});

export default router;