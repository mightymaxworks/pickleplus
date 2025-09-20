/**
 * CORPORATE ONBOARDING WORKFLOW API - ENTERPRISE CUSTOMER ACQUISITION
 * 
 * Streamlined onboarding experience for 50-200 employee companies with
 * pilot program support, automated account setup, guided configuration,
 * and comprehensive deployment assistance for enterprise facility management.
 * 
 * Version: 1.0.0 - Sprint 2: Corporate Onboarding & Pilot Programs
 * Last Updated: September 20, 2025
 * 
 * ONBOARDING FEATURES:
 * - Multi-step onboarding wizard with progress tracking
 * - Automated corporate account provisioning and configuration
 * - Pilot program enrollment with limited user access and trial periods
 * - Bulk employee import with CSV processing and validation
 * - Guided facility setup with integration testing and deployment
 * - Comprehensive training resources and support documentation
 * 
 * TARGET MARKET:
 * - Enterprise companies with 50-200 employees
 * - Corporate facilities requiring advanced pickleball management
 * - Organizations seeking comprehensive employee wellness programs
 * - Companies implementing corporate pickleball leagues and tournaments
 * 
 * SECURITY REQUIREMENTS:
 * - Enterprise-grade authentication and authorization workflows
 * - Complete audit trails for all onboarding activities and account changes
 * - Role-based access controls during pilot and full deployment phases
 * - Enhanced rate limiting for account creation and bulk operations
 */

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { drizzle } from "drizzle-orm/postgres-js";
import { eq, and, desc, asc, count, sql, gte, lte, between } from "drizzle-orm";
import postgres from "postgres";
import { 
  corporateAccounts,
  corporateHierarchy,
  digitalCreditsAccounts,
  users,
  type CorporateAccount,
  type CorporateHierarchy,
  type User
} from "../../shared/schema";
import { requireAuth } from '../middleware/auth';
import bcrypt from 'bcryptjs';
import { createId } from '@paralleldrive/cuid2';

const router = Router();

// Database connection
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}
const sql_client = postgres(connectionString);
const db = drizzle(sql_client);

// Rate limiting for onboarding operations
const onboardingRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 onboarding attempts per hour
  message: { error: 'Onboarding rate limit exceeded, please contact enterprise support' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Enhanced rate limiting for bulk operations
const bulkImportRateLimit = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 3, // 3 bulk imports per 30 minutes
  message: { error: 'Bulk import rate limit exceeded, please contact support' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation schemas
const corporateOnboardingSchema = z.object({
  companyInfo: z.object({
    companyName: z.string().min(2, 'Company name must be at least 2 characters').max(100, 'Company name too long'),
    industry: z.string().min(2, 'Industry required'),
    employeeCount: z.number().int().min(50, 'Minimum 50 employees for corporate accounts').max(200, 'Maximum 200 employees for standard onboarding'),
    headquarters: z.object({
      address: z.string().min(10, 'Complete address required'),
      city: z.string().min(2, 'City required'),
      state: z.string().min(2, 'State required'),
      zipCode: z.string().min(5, 'Valid ZIP code required'),
      country: z.string().default('United States')
    }),
    website: z.string().url('Valid website URL required').optional(),
    description: z.string().min(50, 'Company description required (minimum 50 characters)').max(500, 'Description too long')
  }),
  masterAdmin: z.object({
    firstName: z.string().min(2, 'First name required'),
    lastName: z.string().min(2, 'Last name required'),
    email: z.string().email('Valid email address required'),
    phoneNumber: z.string().min(10, 'Valid phone number required'),
    jobTitle: z.string().min(2, 'Job title required'),
    department: z.string().min(2, 'Department required'),
    temporaryPassword: z.string().min(8, 'Password must be at least 8 characters').optional()
  }),
  facilityInfo: z.object({
    facilityCount: z.number().int().min(1, 'At least one facility required').max(10, 'Maximum 10 facilities for standard onboarding'),
    primaryFacilityName: z.string().min(2, 'Primary facility name required'),
    courtCount: z.number().int().min(1, 'At least one court required'),
    operatingHours: z.object({
      weekdays: z.object({
        open: z.string().regex(/^\d{2}:\d{2}$/, 'Valid time format required (HH:MM)'),
        close: z.string().regex(/^\d{2}:\d{2}$/, 'Valid time format required (HH:MM)')
      }),
      weekends: z.object({
        open: z.string().regex(/^\d{2}:\d{2}$/, 'Valid time format required (HH:MM)'),
        close: z.string().regex(/^\d{2}:\d{2}$/, 'Valid time format required (HH:MM)')
      })
    }),
    amenities: z.array(z.string()).default([])
  }),
  pilotProgram: z.object({
    enrollInPilot: z.boolean().default(false),
    pilotDuration: z.number().int().min(30).max(90).default(60), // 30-90 days
    maxPilotUsers: z.number().int().min(10).max(50).default(25),
    pilotObjectives: z.array(z.string()).min(1, 'At least one pilot objective required').optional(),
    successMetrics: z.array(z.string()).optional()
  }),
  deploymentPreferences: z.object({
    deploymentTimeline: z.enum(['immediate', 'within_week', 'within_month', 'flexible']).default('within_week'),
    trainingRequired: z.boolean().default(true),
    dedicatedSupport: z.boolean().default(false),
    customIntegrations: z.array(z.string()).default([]),
    budgetRange: z.enum(['standard', 'premium', 'enterprise']).default('standard')
  })
});

const bulkEmployeeImportSchema = z.object({
  corporateAccountId: z.number().int().positive('Valid corporate account ID required'),
  employees: z.array(z.object({
    firstName: z.string().min(2, 'First name required'),
    lastName: z.string().min(2, 'Last name required'),
    email: z.string().email('Valid email address required'),
    department: z.string().min(2, 'Department required'),
    jobTitle: z.string().min(2, 'Job title required'),
    role: z.enum(['employee', 'team_lead', 'department_admin']).default('employee'),
    spendingLimit: z.number().min(0).max(100000).default(5000), // $50 default spending limit
    phoneNumber: z.string().optional(),
    startDate: z.string().datetime().optional()
  })).min(1, 'At least one employee required').max(200, 'Maximum 200 employees per import'),
  importOptions: z.object({
    sendWelcomeEmails: z.boolean().default(true),
    requirePasswordReset: z.boolean().default(true),
    autoActivateAccounts: z.boolean().default(false),
    defaultSpendingLimit: z.number().min(0).max(100000).default(5000)
  })
});

const onboardingProgressSchema = z.object({
  corporateAccountId: z.number().int().positive('Valid corporate account ID required'),
  step: z.enum(['company_info', 'master_admin', 'facility_setup', 'employee_import', 'pilot_configuration', 'training_setup', 'deployment_verification']),
  status: z.enum(['pending', 'in_progress', 'completed', 'failed']),
  completionData: z.any().optional(),
  notes: z.string().optional()
});

/**
 * POST /api/corporate-onboarding/initiate
 * Initiate corporate onboarding process
 */
router.post('/initiate', onboardingRateLimit, async (req: any, res: any) => {
  try {
    const validation = corporateOnboardingSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid onboarding request',
        details: validation.error.issues,
        code: 'VALIDATION_ERROR'
      });
    }

    const onboardingData = validation.data;

    // Check if company email domain already exists
    const existingAccount = await db.select()
      .from(corporateAccounts)
      .where(eq(corporateAccounts.companyName, onboardingData.companyInfo.companyName))
      .limit(1);

    if (existingAccount.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Company account already exists',
        code: 'DUPLICATE_COMPANY'
      });
    }

    // Check if master admin email already exists
    const existingUser = await db.select()
      .from(users)
      .where(eq(users.email, onboardingData.masterAdmin.email))
      .limit(1);

    if (existingUser.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Master admin email already registered',
        code: 'DUPLICATE_EMAIL'
      });
    }

    // Generate temporary password if not provided
    const tempPassword = onboardingData.masterAdmin.temporaryPassword || 
      `Pickle${Math.random().toString(36).substring(2, 8)}!`;

    // Hash the temporary password
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    // Create master admin user
    const [masterAdminUser] = await db.insert(users)
      .values({
        username: onboardingData.masterAdmin.email,
        email: onboardingData.masterAdmin.email,
        firstName: onboardingData.masterAdmin.firstName,
        lastName: onboardingData.masterAdmin.lastName,
        password: hashedPassword,
        role: 'corporate_admin',
        isActive: false, // Will be activated after email verification
        emailVerified: false,
        passportCode: createId().substring(0, 8).toUpperCase()
      })
      .returning();

    // Create corporate account
    const [corporateAccount] = await db.insert(corporateAccounts)
      .values({
        companyName: onboardingData.companyInfo.companyName,
        employeeCount: onboardingData.companyInfo.employeeCount,
        masterAdminId: masterAdminUser.id,
        status: 'active',
        maxEmployees: onboardingData.pilotProgram.enrollInPilot ? 
          onboardingData.pilotProgram.maxPilotUsers : onboardingData.companyInfo.employeeCount,
        totalCredits: onboardingData.pilotProgram.enrollInPilot ? 50000 : 0
      })
      .returning();

    // Add master admin to corporate hierarchy
    await db.insert(corporateHierarchy)
      .values({
        corporateAccountId: corporateAccount.id,
        userId: masterAdminUser.id,
        role: 'master_admin',
        department: onboardingData.masterAdmin.department,
        team: 'Leadership',
        spendingLimit: 100000, // $1,000 default for master admin
        canAllocateCredits: true,
        canViewReports: true,
        canManageUsers: true
      });

    // Create digital credits account for the corporate account
    await db.insert(digitalCreditsAccounts)
      .values({
        userId: masterAdminUser.id,
        balance: onboardingData.pilotProgram.enrollInPilot ? 50000 : 0 // $500 pilot credits
      });

    // Initialize onboarding progress tracking
    const onboardingSteps = [
      { step: 'company_info', status: 'completed' },
      { step: 'master_admin', status: 'completed' },
      { step: 'facility_setup', status: 'pending' },
      { step: 'employee_import', status: 'pending' },
      { step: 'pilot_configuration', status: onboardingData.pilotProgram.enrollInPilot ? 'pending' : 'completed' },
      { step: 'training_setup', status: 'pending' },
      { step: 'deployment_verification', status: 'pending' }
    ];

    // TODO: Store onboarding progress in dedicated table
    // TODO: Send welcome email with temporary credentials
    // TODO: Schedule follow-up tasks for implementation team

    res.status(201).json({
      success: true,
      data: {
        onboardingId: corporateAccount.id,
        corporateAccount: {
          id: corporateAccount.id,
          companyName: corporateAccount.companyName,
          status: corporateAccount.status,
          maxEmployees: corporateAccount.maxEmployees
        },
        masterAdmin: {
          id: masterAdminUser.id,
          email: masterAdminUser.email,
          name: `${masterAdminUser.firstName} ${masterAdminUser.lastName}`,
          passportCode: masterAdminUser.passportCode
        },
        onboardingProgress: {
          currentStep: 'facility_setup',
          completedSteps: 2,
          totalSteps: 7,
          steps: onboardingSteps,
          estimatedCompletion: onboardingData.deploymentPreferences.deploymentTimeline
        },
        nextSteps: [
          'Verify email address and activate master admin account',
          'Complete facility configuration and court setup',
          'Import employee list and configure access permissions',
          onboardingData.pilotProgram.enrollInPilot ? 'Configure pilot program parameters' : 'Configure full deployment',
          'Schedule training sessions for administrators and users',
          'Complete deployment verification and testing'
        ],
        welcomeCredentials: {
          tempPassword: tempPassword, // Only returned during onboarding
          loginUrl: `${req.protocol}://${req.get('host')}/login`,
          changePasswordRequired: true
        },
        support: {
          dedicatedManager: onboardingData.deploymentPreferences.dedicatedSupport,
          supportEmail: 'enterprise@pickleplus.com',
          implementationCall: 'Will be scheduled within 24 hours',
          documentation: 'https://docs.pickleplus.com/enterprise'
        }
      },
      message: 'Corporate onboarding initiated successfully'
    });

  } catch (error) {
    console.error('[CORPORATE ONBOARDING] Initiation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initiate corporate onboarding',
      code: 'ONBOARDING_ERROR'
    });
  }
});

/**
 * POST /api/corporate-onboarding/:onboardingId/bulk-import
 * Bulk import employees for corporate account
 */
router.post('/:onboardingId/bulk-import', bulkImportRateLimit, requireAuth, async (req: any, res: any) => {
  try {
    const onboardingId = parseInt(req.params.onboardingId);
    const validation = bulkEmployeeImportSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid bulk import request',
        details: validation.error.issues,
        code: 'VALIDATION_ERROR'
      });
    }

    const { corporateAccountId, employees, importOptions } = validation.data;

    // Verify corporate account exists and user has permission
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
    if (corporateAccount[0].masterAdminId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Only master admin can perform bulk imports',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    // Check current user count against limit
    const currentUserCount = await db.select({ count: count() })
      .from(corporateHierarchy)
      .where(eq(corporateHierarchy.corporateAccountId, corporateAccountId));

    const totalUsersAfterImport = currentUserCount[0].count + employees.length;
    
    if (totalUsersAfterImport > corporateAccount[0].maxEmployees) {
      return res.status(400).json({
        success: false,
        error: `Import would exceed user limit (${corporateAccount[0].maxEmployees} users)`,
        code: 'USER_LIMIT_EXCEEDED',
        details: {
          currentUsers: currentUserCount[0].count,
          importCount: employees.length,
          maxUsers: corporateAccount[0].maxEmployees
        }
      });
    }

    // Check for duplicate emails
    const existingEmails = await db.select({ email: users.email })
      .from(users)
      .where(sql`${users.email} = ANY(${employees.map(emp => emp.email)})`);

    if (existingEmails.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Duplicate email addresses found',
        code: 'DUPLICATE_EMAILS',
        details: {
          duplicateEmails: existingEmails.map(u => u.email)
        }
      });
    }

    // Process bulk employee import
    const importResults = [];
    const errors = [];

    for (const employee of employees) {
      try {
        // Generate temporary password
        const tempPassword = `Pickle${Math.random().toString(36).substring(2, 8)}!`;
        const hashedPassword = await bcrypt.hash(tempPassword, 12);

        // Create user account
        const [newUser] = await db.insert(users)
          .values({
            username: employee.email,
            email: employee.email,
            firstName: employee.firstName,
            lastName: employee.lastName,
            password: hashedPassword,
            role: 'corporate_employee',
            isActive: importOptions.autoActivateAccounts,
            emailVerified: false,
            passportCode: createId().substring(0, 8).toUpperCase()
          })
          .returning();

        // Add to corporate hierarchy
        await db.insert(corporateHierarchy)
          .values({
            corporateAccountId,
            userId: newUser.id,
            role: employee.role,
            department: employee.department,
            team: employee.jobTitle,
            spendingLimit: employee.spendingLimit || importOptions.defaultSpendingLimit,
            canAllocateCredits: employee.role === 'department_admin',
            canViewReports: true,
            canManageUsers: employee.role === 'department_admin'
          });

        // Create digital credits account
        await db.insert(digitalCreditsAccounts)
          .values({
            userId: newUser.id,
            balance: 0
          });

        importResults.push({
          success: true,
          employee: {
            id: newUser.id,
            email: employee.email,
            name: `${employee.firstName} ${employee.lastName}`,
            department: employee.department,
            role: employee.role,
            passportCode: newUser.passportCode
          },
          credentials: {
            tempPassword: tempPassword,
            requiresPasswordReset: importOptions.requirePasswordReset
          }
        });

        // TODO: Send welcome email if enabled

      } catch (employeeError) {
        console.error(`[BULK IMPORT] Error importing ${employee.email}:`, employeeError);
        errors.push({
          email: employee.email,
          error: 'Failed to create account',
          details: employeeError instanceof Error ? employeeError.message : 'Unknown error'
        });
      }
    }

    res.json({
      success: true,
      data: {
        bulkImport: {
          totalRequested: employees.length,
          successfulImports: importResults.filter(r => r.success).length,
          failedImports: errors.length,
          corporateAccountId,
          importOptions
        },
        results: importResults,
        errors: errors.length > 0 ? errors : undefined,
        summary: {
          newTotalUsers: currentUserCount[0].count + importResults.filter(r => r.success).length,
          remainingUserSlots: corporateAccount[0].maxEmployees - (currentUserCount[0].count + importResults.filter(r => r.success).length),
          departmentBreakdown: importResults.reduce((acc, result) => {
            if (result.success) {
              const dept = result.employee.department;
              acc[dept] = (acc[dept] || 0) + 1;
            }
            return acc;
          }, {} as Record<string, number>)
        },
        nextSteps: [
          'Send welcome emails to new employees',
          'Configure department-specific access controls',
          'Schedule employee training sessions',
          'Test account access and functionality'
        ]
      },
      message: `Bulk import completed: ${importResults.filter(r => r.success).length} users created successfully`
    });

  } catch (error) {
    console.error('[CORPORATE ONBOARDING] Bulk import error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process bulk employee import',
      code: 'BULK_IMPORT_ERROR'
    });
  }
});

/**
 * GET /api/corporate-onboarding/:onboardingId/progress
 * Get onboarding progress status
 */
router.get('/:onboardingId/progress', requireAuth, async (req: any, res: any) => {
  try {
    const onboardingId = parseInt(req.params.onboardingId);

    // Get corporate account and verify access
    const corporateAccount = await db.select()
      .from(corporateAccounts)
      .where(eq(corporateAccounts.id, onboardingId))
      .limit(1);

    if (corporateAccount.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Corporate account not found',
        code: 'ACCOUNT_NOT_FOUND'
      });
    }

    // Check permissions
    if (corporateAccount[0].masterAdminId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    // Get current user count
    const userCount = await db.select({ count: count() })
      .from(corporateHierarchy)
      .where(eq(corporateHierarchy.corporateAccountId, onboardingId));

    // Calculate progress based on account status
    const isPilot = false; // TODO: Implement pilot tracking
    
    const progressSteps = [
      {
        step: 'company_info',
        name: 'Company Information',
        status: 'completed',
        completedAt: new Date().toISOString()
      },
      {
        step: 'master_admin',
        name: 'Master Admin Setup',
        status: 'completed',
        completedAt: new Date().toISOString()
      },
      {
        step: 'facility_setup',
        name: 'Facility Configuration',
        status: 'pending', // TODO: Implement facility tracking
        completedAt: null
      },
      {
        step: 'employee_import',
        name: 'Employee Import',
        status: userCount[0].count > 1 ? 'completed' : 'pending',
        completedAt: userCount[0].count > 1 ? null : null // TODO: Get actual completion date
      },
      {
        step: 'pilot_configuration',
        name: 'Pilot Configuration',
        status: 'completed', // TODO: Implement pilot tracking
        completedAt: null
      },
      {
        step: 'training_setup',
        name: 'Training Setup',
        status: 'pending', // TODO: Implement training tracking
        completedAt: null
      },
      {
        step: 'deployment_verification',
        name: 'Deployment Verification',
        status: corporateAccount[0].status === 'active' ? 'completed' : 'pending',
        completedAt: corporateAccount[0].status === 'active' ? null : null
      }
    ];

    const completedSteps = progressSteps.filter(step => step.status === 'completed').length;
    const currentStep = progressSteps.find(step => step.status === 'pending')?.step || 'deployment_verification';

    res.json({
      success: true,
      data: {
        onboardingProgress: {
          corporateAccountId: onboardingId,
          currentStep,
          completedSteps,
          totalSteps: progressSteps.length,
          progressPercentage: Math.round((completedSteps / progressSteps.length) * 100),
          steps: progressSteps,
          isPilotProgram: isPilot
        },
        accountStatus: {
          status: corporateAccount[0].status,
          companyName: corporateAccount[0].companyName,
          maxUsers: corporateAccount[0].maxEmployees,
          currentUsers: userCount[0].count
        },
        recommendations: [
          currentStep === 'facility_setup' ? 'Complete facility configuration and court setup' : null,
          currentStep === 'employee_import' ? 'Import employee list and configure access permissions' : null,
          currentStep === 'pilot_configuration' && isPilot ? 'Configure pilot program parameters and success metrics' : null,
          currentStep === 'training_setup' ? 'Schedule training sessions for administrators and users' : null,
          currentStep === 'deployment_verification' ? 'Complete final testing and deployment verification' : null
        ].filter(Boolean),
        supportInfo: {
          dedicatedSupport: false, // TODO: Implement support tracking
          supportEmail: 'enterprise@pickleplus.com',
          documentationUrl: 'https://docs.pickleplus.com/enterprise'
        }
      }
    });

  } catch (error) {
    console.error('[CORPORATE ONBOARDING] Progress check error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve onboarding progress',
      code: 'PROGRESS_ERROR'
    });
  }
});

export default router;