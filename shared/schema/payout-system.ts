/**
 * Payout System Schema
 * Phase 1 Sprint 1.4: Automated Commission Calculation and WISE Integration
 */

import { pgTable, serial, integer, varchar, text, timestamp, boolean, decimal } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Coach Payout Configuration - Individual coach payout settings
export const coachPayoutConfig = pgTable("coach_payout_config", {
  id: serial("id").primaryKey(),
  coachId: integer("coach_id").notNull().unique(),
  
  // Commission structure
  currentPcpLevel: integer("current_pcp_level").notNull(), // 1-5
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).notNull(), // Percentage
  
  // Level-based commission rates (JSON for future levels)
  levelCommissionRates: text("level_commission_rates").notNull(),
  // JSON: {"1": 15, "2": 13, "3": 12, "4": 10, "5": 8}
  
  // Payout preferences
  payoutFrequency: varchar("payout_frequency", { length: 20 }).default("weekly"),
  // weekly, bi_weekly, monthly
  
  minimumPayoutAmount: decimal("minimum_payout_amount", { precision: 8, scale: 2 }).default(50.00),
  
  // WISE integration
  wiseProfileId: varchar("wise_profile_id", { length: 100 }),
  wiseAccountId: varchar("wise_account_id", { length: 100 }),
  preferredCurrency: varchar("preferred_currency", { length: 10 }).default("USD"),
  
  // Bank account details (encrypted)
  bankAccountDetails: text("bank_account_details"), // JSON with encrypted bank info
  taxInformation: text("tax_information"), // JSON with tax details
  
  // Payout status
  isPayoutEnabled: boolean("is_payout_enabled").default(true),
  suspensionReason: text("suspension_reason"),
  
  // Performance metrics
  totalEarnings: decimal("total_earnings", { precision: 12, scale: 2 }).default(0),
  totalPayouts: decimal("total_payouts", { precision: 12, scale: 2 }).default(0),
  pendingAmount: decimal("pending_amount", { precision: 10, scale: 2 }).default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Session Transactions - Individual session revenue tracking
export const sessionTransactions = pgTable("session_transactions", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").notNull().unique(),
  coachId: integer("coach_id").notNull(),
  studentId: integer("student_id").notNull(),
  
  // Session details
  sessionDate: timestamp("session_date").notNull(),
  sessionType: varchar("session_type", { length: 20 }).notNull(),
  
  // Financial breakdown
  grossAmount: decimal("gross_amount", { precision: 8, scale: 2 }).notNull(), // Student payment
  platformFee: decimal("platform_fee", { precision: 8, scale: 2 }).notNull(), // Our commission
  coachEarnings: decimal("coach_earnings", { precision: 8, scale: 2 }).notNull(), // Coach payout
  
  // Commission calculation
  pcpLevel: integer("pcp_level").notNull(), // Coach's level at time of session
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).notNull(),
  
  // Payment processing
  paymentMethod: varchar("payment_method", { length: 30 }).notNull(),
  paymentReference: varchar("payment_reference", { length: 100 }),
  processingFee: decimal("processing_fee", { precision: 6, scale: 2 }).default(0),
  
  // Status tracking
  status: varchar("status", { length: 30 }).default("completed"),
  // pending, completed, refunded, disputed, cancelled
  
  // Payout tracking
  payoutBatchId: integer("payout_batch_id"), // Reference to payout batch
  payoutStatus: varchar("payout_status", { length: 20 }).default("pending"),
  // pending, included_in_batch, paid, failed
  
  // Tax and reporting
  taxYear: integer("tax_year").notNull(),
  taxQuarter: integer("tax_quarter").notNull(),
  isReportable: boolean("is_reportable").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payout Batches - Groups of transactions for bulk payouts
export const payoutBatches = pgTable("payout_batches", {
  id: serial("id").primaryKey(),
  
  // Batch identification
  batchNumber: varchar("batch_number", { length: 50 }).notNull().unique(),
  batchDate: timestamp("batch_date").defaultNow(),
  
  // Period covered
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  
  // Batch summary
  totalCoaches: integer("total_coaches").notNull(),
  totalTransactions: integer("total_transactions").notNull(),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).notNull(),
  
  // Processing status
  status: varchar("status", { length: 30 }).default("pending"),
  // pending, processing, completed, failed, partially_failed
  
  // WISE integration
  wiseTransferId: varchar("wise_transfer_id", { length: 100 }),
  wiseBatchId: varchar("wise_batch_id", { length: 100 }),
  
  // Processing details
  processedAt: timestamp("processed_at"),
  processedBy: integer("processed_by"), // Admin user ID
  completedAt: timestamp("completed_at"),
  
  // Error handling
  failedPayouts: integer("failed_payouts").default(0),
  errorSummary: text("error_summary"), // JSON array of errors
  
  // Notifications
  notificationsSent: boolean("notifications_sent").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Individual Coach Payouts - Specific payout records for each coach
export const coachPayouts = pgTable("coach_payouts", {
  id: serial("id").primaryKey(),
  batchId: integer("batch_id").notNull(),
  coachId: integer("coach_id").notNull(),
  
  // Payout calculation
  totalSessions: integer("total_sessions").notNull(),
  grossRevenue: decimal("gross_revenue", { precision: 10, scale: 2 }).notNull(),
  platformFees: decimal("platform_fees", { precision: 10, scale: 2 }).notNull(),
  netPayout: decimal("net_payout", { precision: 10, scale: 2 }).notNull(),
  
  // Deductions and adjustments
  previousAdjustments: decimal("previous_adjustments", { precision: 8, scale: 2 }).default(0),
  bonuses: decimal("bonuses", { precision: 8, scale: 2 }).default(0),
  penalties: decimal("penalties", { precision: 8, scale: 2 }).default(0),
  finalAmount: decimal("final_amount", { precision: 10, scale: 2 }).notNull(),
  
  // Currency and conversion
  payoutCurrency: varchar("payout_currency", { length: 10 }).notNull(),
  exchangeRate: decimal("exchange_rate", { precision: 10, scale: 6 }),
  convertedAmount: decimal("converted_amount", { precision: 10, scale: 2 }),
  
  // WISE transaction details
  wiseTransactionId: varchar("wise_transaction_id", { length: 100 }),
  wiseQuoteId: varchar("wise_quote_id", { length: 100 }),
  wiseTransferStatus: varchar("wise_transfer_status", { length: 30 }),
  
  // Processing status
  status: varchar("status", { length: 30 }).default("pending"),
  // pending, processing, completed, failed, cancelled
  
  // Timing
  processedAt: timestamp("processed_at"),
  completedAt: timestamp("completed_at"),
  expectedArrival: timestamp("expected_arrival"),
  
  // Error handling
  errorCode: varchar("error_code", { length: 50 }),
  errorMessage: text("error_message"),
  retryCount: integer("retry_count").default(0),
  
  // Notifications and receipts
  notificationSent: boolean("notification_sent").default(false),
  receiptGenerated: boolean("receipt_generated").default(false),
  receiptUrl: varchar("receipt_url", { length: 500 }),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tax Documents - Annual tax reporting documents
export const taxDocuments = pgTable("tax_documents", {
  id: serial("id").primaryKey(),
  coachId: integer("coach_id").notNull(),
  
  // Tax period
  taxYear: integer("tax_year").notNull(),
  documentType: varchar("document_type", { length: 20 }).notNull(), // 1099, summary, etc.
  
  // Financial summary
  totalEarnings: decimal("total_earnings", { precision: 12, scale: 2 }).notNull(),
  totalSessions: integer("total_sessions").notNull(),
  averageSessionEarnings: decimal("average_session_earnings", { precision: 8, scale: 2 }),
  
  // Document generation
  documentStatus: varchar("document_status", { length: 20 }).default("pending"),
  // pending, generated, sent, acknowledged
  
  documentPath: varchar("document_path", { length: 500 }),
  generatedAt: timestamp("generated_at"),
  sentAt: timestamp("sent_at"),
  
  // Compliance
  isCompliant: boolean("is_compliant").default(true),
  complianceNotes: text("compliance_notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payout Adjustments - Manual adjustments to payouts
export const payoutAdjustments = pgTable("payout_adjustments", {
  id: serial("id").primaryKey(),
  coachId: integer("coach_id").notNull(),
  
  // Adjustment details
  adjustmentType: varchar("adjustment_type", { length: 30 }).notNull(),
  // bonus, penalty, correction, refund, chargeback
  
  amount: decimal("amount", { precision: 8, scale: 2 }).notNull(), // Can be negative
  currency: varchar("currency", { length: 10 }).default("USD"),
  
  // Reason and documentation
  reason: text("reason").notNull(),
  description: text("description"),
  referenceId: varchar("reference_id", { length: 100 }), // Related transaction/session
  
  // Authorization
  authorizedBy: integer("authorized_by").notNull(), // Admin user ID
  approvalLevel: varchar("approval_level", { length: 20 }).default("standard"),
  // standard, manager, director
  
  // Processing
  status: varchar("status", { length: 20 }).default("pending"),
  // pending, approved, applied, rejected
  
  appliedToBatchId: integer("applied_to_batch_id"), // Which batch included this adjustment
  appliedAt: timestamp("applied_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const sessionTransactionsRelations = relations(sessionTransactions, ({ one }) => ({
  payoutBatch: one(payoutBatches, {
    fields: [sessionTransactions.payoutBatchId],
    references: [payoutBatches.id],
  }),
}));

export const payoutBatchesRelations = relations(payoutBatches, ({ many }) => ({
  sessionTransactions: many(sessionTransactions),
  coachPayouts: many(coachPayouts),
}));

export const coachPayoutsRelations = relations(coachPayouts, ({ one }) => ({
  batch: one(payoutBatches, {
    fields: [coachPayouts.batchId],
    references: [payoutBatches.id],
  }),
}));

export const payoutAdjustmentsRelations = relations(payoutAdjustments, ({ one }) => ({
  appliedToBatch: one(payoutBatches, {
    fields: [payoutAdjustments.appliedToBatchId],
    references: [payoutBatches.id],
  }),
}));

// Zod Schemas
export const insertCoachPayoutConfigSchema = createInsertSchema(coachPayoutConfig).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSessionTransactionSchema = createInsertSchema(sessionTransactions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPayoutBatchSchema = createInsertSchema(payoutBatches).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCoachPayoutSchema = createInsertSchema(coachPayouts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTaxDocumentSchema = createInsertSchema(taxDocuments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPayoutAdjustmentSchema = createInsertSchema(payoutAdjustments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// TypeScript Types
export type CoachPayoutConfig = typeof coachPayoutConfig.$inferSelect;
export type InsertCoachPayoutConfig = z.infer<typeof insertCoachPayoutConfigSchema>;

export type SessionTransaction = typeof sessionTransactions.$inferSelect;
export type InsertSessionTransaction = z.infer<typeof insertSessionTransactionSchema>;

export type PayoutBatch = typeof payoutBatches.$inferSelect;
export type InsertPayoutBatch = z.infer<typeof insertPayoutBatchSchema>;

export type CoachPayout = typeof coachPayouts.$inferSelect;
export type InsertCoachPayout = z.infer<typeof insertCoachPayoutSchema>;

export type TaxDocument = typeof taxDocuments.$inferSelect;
export type InsertTaxDocument = z.infer<typeof insertTaxDocumentSchema>;

export type PayoutAdjustment = typeof payoutAdjustments.$inferSelect;
export type InsertPayoutAdjustment = z.infer<typeof insertPayoutAdjustmentSchema>;

// Utility types for complex operations
export type CoachEarningsSummary = {
  coachId: number;
  period: { start: Date; end: Date };
  totalSessions: number;
  grossRevenue: number;
  platformFees: number;
  netEarnings: number;
  averageSessionValue: number;
  topPerformingSessionType: string;
  growthRate: number;
};

export type PayoutDashboard = {
  pendingAmount: number;
  nextPayoutDate: Date;
  recentPayouts: CoachPayout[];
  monthlyEarnings: number;
  yearToDateEarnings: number;
  averageSessionEarnings: number;
  totalSessions: number;
  payoutHistory: CoachPayout[];
};

export type AdminPayoutOverview = {
  totalPendingAmount: number;
  totalCoachesAwaitingPayout: number;
  nextBatchDate: Date;
  monthlyPayoutVolume: number;
  averagePayoutAmount: number;
  topEarningCoaches: CoachEarningsSummary[];
  payoutTrends: { month: string; amount: number; coaches: number }[];
};