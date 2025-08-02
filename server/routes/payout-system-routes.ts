/**
 * Payout System API Routes
 * Phase 1 Sprint 1.4: Automated Commission Calculation and WISE Integration
 */

import type { Express } from "express";
import { storage } from "../storage";
import { 
  insertCoachPayoutConfigSchema,
  insertPayoutAdjustmentSchema
} from "@shared/schema/payout-system";

export function registerPayoutSystemRoutes(app: Express) {
  console.log('[API] Registering Payout System routes');

  // ========================================
  // Coach Payout Configuration
  // ========================================

  // Get coach payout configuration
  app.get('/api/payout/config', async (req, res) => {
    try {
      const coachId = req.user?.id;
      
      if (!coachId) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      const config = await storage.getCoachPayoutConfig(coachId);
      res.json({ success: true, data: config });
    } catch (error) {
      console.error('[Payout][API] Error getting payout config:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch payout configuration' });
    }
  });

  // Update coach payout configuration
  app.put('/api/payout/config', async (req, res) => {
    try {
      const coachId = req.user?.id;
      
      if (!coachId) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      const { payoutFrequency, minimumPayoutAmount, preferredCurrency, bankAccountDetails } = req.body;

      const updatedConfig = await storage.updateCoachPayoutConfig(coachId, {
        payoutFrequency,
        minimumPayoutAmount,
        preferredCurrency,
        bankAccountDetails: bankAccountDetails ? JSON.stringify(bankAccountDetails) : null
      });

      res.json({ success: true, data: updatedConfig });
    } catch (error) {
      console.error('[Payout][API] Error updating payout config:', error);
      res.status(500).json({ success: false, error: 'Failed to update payout configuration' });
    }
  });

  // Set up WISE integration
  app.post('/api/payout/wise/setup', async (req, res) => {
    try {
      const coachId = req.user?.id;
      
      if (!coachId) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      const { wiseProfileId, wiseAccountId, currency } = req.body;

      // Verify WISE account with API call
      const wiseVerification = await storage.verifyWiseAccount(wiseProfileId, wiseAccountId);
      
      if (!wiseVerification.isValid) {
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid WISE account details' 
        });
      }

      const updatedConfig = await storage.updateCoachPayoutConfig(coachId, {
        wiseProfileId,
        wiseAccountId,
        preferredCurrency: currency,
        isPayoutEnabled: true
      });

      res.json({ success: true, data: updatedConfig });
    } catch (error) {
      console.error('[Payout][API] Error setting up WISE:', error);
      res.status(500).json({ success: false, error: 'Failed to setup WISE integration' });
    }
  });

  // ========================================
  // Earnings and Transactions
  // ========================================

  // Get coach earnings summary
  app.get('/api/payout/earnings', async (req, res) => {
    try {
      const coachId = req.user?.id;
      
      if (!coachId) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      const { startDate, endDate, year, month } = req.query;

      const earningsSummary = await storage.getCoachEarningsSummary(coachId, {
        startDate: startDate as string,
        endDate: endDate as string,
        year: year ? parseInt(year as string) : undefined,
        month: month ? parseInt(month as string) : undefined
      });

      res.json({ success: true, data: earningsSummary });
    } catch (error) {
      console.error('[Payout][API] Error getting earnings summary:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch earnings summary' });
    }
  });

  // Get detailed transaction history
  app.get('/api/payout/transactions', async (req, res) => {
    try {
      const coachId = req.user?.id;
      
      if (!coachId) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      const { limit = 50, offset = 0, status } = req.query;

      const transactions = await storage.getCoachTransactions(coachId, {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        status: status as string
      });

      res.json({ success: true, data: transactions });
    } catch (error) {
      console.error('[Payout][API] Error getting transactions:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch transactions' });
    }
  });

  // Get payout dashboard data
  app.get('/api/payout/dashboard', async (req, res) => {
    try {
      const coachId = req.user?.id;
      
      if (!coachId) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      const dashboard = await storage.getCoachPayoutDashboard(coachId);
      res.json({ success: true, data: dashboard });
    } catch (error) {
      console.error('[Payout][API] Error getting payout dashboard:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch payout dashboard' });
    }
  });

  // ========================================
  // Payout History and Status
  // ========================================

  // Get payout history
  app.get('/api/payout/history', async (req, res) => {
    try {
      const coachId = req.user?.id;
      
      if (!coachId) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      const { limit = 20, offset = 0, year } = req.query;

      const payoutHistory = await storage.getCoachPayoutHistory(coachId, {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        year: year ? parseInt(year as string) : undefined
      });

      res.json({ success: true, data: payoutHistory });
    } catch (error) {
      console.error('[Payout][API] Error getting payout history:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch payout history' });
    }
  });

  // Get specific payout details
  app.get('/api/payout/:payoutId/details', async (req, res) => {
    try {
      const payoutId = parseInt(req.params.payoutId);
      const coachId = req.user?.id;
      
      if (!coachId) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      // Verify ownership
      const payout = await storage.getCoachPayoutById(payoutId);
      if (!payout || payout.coachId !== coachId) {
        return res.status(403).json({ success: false, error: 'Access denied' });
      }

      const payoutDetails = await storage.getPayoutDetails(payoutId);
      res.json({ success: true, data: payoutDetails });
    } catch (error) {
      console.error('[Payout][API] Error getting payout details:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch payout details' });
    }
  });

  // Download payout receipt
  app.get('/api/payout/:payoutId/receipt', async (req, res) => {
    try {
      const payoutId = parseInt(req.params.payoutId);
      const coachId = req.user?.id;
      
      if (!coachId) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      // Verify ownership
      const payout = await storage.getCoachPayoutById(payoutId);
      if (!payout || payout.coachId !== coachId) {
        return res.status(403).json({ success: false, error: 'Access denied' });
      }

      const receiptData = await storage.generatePayoutReceipt(payoutId);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="payout-receipt-${payoutId}.pdf"`);
      res.send(receiptData);
    } catch (error) {
      console.error('[Payout][API] Error downloading receipt:', error);
      res.status(500).json({ success: false, error: 'Failed to download receipt' });
    }
  });

  // ========================================
  // Tax Documents
  // ========================================

  // Get tax documents
  app.get('/api/payout/tax-documents', async (req, res) => {
    try {
      const coachId = req.user?.id;
      
      if (!coachId) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      const { year } = req.query;

      const taxDocuments = await storage.getCoachTaxDocuments(coachId, {
        year: year ? parseInt(year as string) : new Date().getFullYear()
      });

      res.json({ success: true, data: taxDocuments });
    } catch (error) {
      console.error('[Payout][API] Error getting tax documents:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch tax documents' });
    }
  });

  // Download tax document
  app.get('/api/payout/tax-documents/:documentId/download', async (req, res) => {
    try {
      const documentId = parseInt(req.params.documentId);
      const coachId = req.user?.id;
      
      if (!coachId) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      // Verify ownership
      const document = await storage.getTaxDocumentById(documentId);
      if (!document || document.coachId !== coachId) {
        return res.status(403).json({ success: false, error: 'Access denied' });
      }

      const documentData = await storage.downloadTaxDocument(documentId);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${document.documentType}-${document.taxYear}.pdf"`);
      res.send(documentData);
    } catch (error) {
      console.error('[Payout][API] Error downloading tax document:', error);
      res.status(500).json({ success: false, error: 'Failed to download tax document' });
    }
  });

  // ========================================
  // ADMIN ROUTES - Payout Management
  // ========================================

  // Get admin payout overview
  app.get('/api/admin/payout/overview', async (req, res) => {
    try {
      if (!req.user?.isAdmin) {
        return res.status(403).json({ success: false, error: 'Admin access required' });
      }

      const overview = await storage.getAdminPayoutOverview();
      res.json({ success: true, data: overview });
    } catch (error) {
      console.error('[Payout][API] Error getting admin overview:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch admin overview' });
    }
  });

  // Create payout batch
  app.post('/api/admin/payout/batches', async (req, res) => {
    try {
      if (!req.user?.isAdmin) {
        return res.status(403).json({ success: false, error: 'Admin access required' });
      }

      const { periodStart, periodEnd, coachIds } = req.body;

      const batch = await storage.createPayoutBatch({
        periodStart,
        periodEnd,
        coachIds,
        processedBy: req.user.id
      });

      res.json({ success: true, data: batch });
    } catch (error) {
      console.error('[Payout][API] Error creating payout batch:', error);
      res.status(500).json({ success: false, error: 'Failed to create payout batch' });
    }
  });

  // Process payout batch (initiate WISE transfers)
  app.post('/api/admin/payout/batches/:batchId/process', async (req, res) => {
    try {
      if (!req.user?.isAdmin) {
        return res.status(403).json({ success: false, error: 'Admin access required' });
      }

      const batchId = parseInt(req.params.batchId);

      const processedBatch = await storage.processPayoutBatch(batchId, req.user.id);
      res.json({ success: true, data: processedBatch });
    } catch (error) {
      console.error('[Payout][API] Error processing payout batch:', error);
      res.status(500).json({ success: false, error: 'Failed to process payout batch' });
    }
  });

  // Add payout adjustment
  app.post('/api/admin/payout/adjustments', async (req, res) => {
    try {
      if (!req.user?.isAdmin) {
        return res.status(403).json({ success: false, error: 'Admin access required' });
      }

      const adjustmentData = insertPayoutAdjustmentSchema.parse({
        ...req.body,
        authorizedBy: req.user.id
      });

      const adjustment = await storage.createPayoutAdjustment(adjustmentData);
      res.json({ success: true, data: adjustment });
    } catch (error) {
      console.error('[Payout][API] Error creating adjustment:', error);
      res.status(500).json({ success: false, error: 'Failed to create payout adjustment' });
    }
  });

  // ========================================
  // WISE Integration Endpoints
  // ========================================

  // Get WISE account balance
  app.get('/api/payout/wise/balance', async (req, res) => {
    try {
      if (!req.user?.isAdmin) {
        return res.status(403).json({ success: false, error: 'Admin access required' });
      }

      const balance = await storage.getWiseAccountBalance();
      res.json({ success: true, data: balance });
    } catch (error) {
      console.error('[Payout][API] Error getting WISE balance:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch WISE balance' });
    }
  });

  // Get WISE transfer status
  app.get('/api/payout/wise/transfers/:transferId/status', async (req, res) => {
    try {
      if (!req.user?.isAdmin) {
        return res.status(403).json({ success: false, error: 'Admin access required' });
      }

      const transferId = req.params.transferId;

      const transferStatus = await storage.getWiseTransferStatus(transferId);
      res.json({ success: true, data: transferStatus });
    } catch (error) {
      console.error('[Payout][API] Error getting WISE transfer status:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch transfer status' });
    }
  });

  console.log('[API] Payout System routes registered successfully');
}