/**
 * PKL-278651-OAUTH-0005: OAuth Developer Routes
 * 
 * API endpoints for the OAuth Developer Dashboard for managing OAuth client applications.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-30
 */

import express, { Request, Response } from 'express';
import { isAuthenticated } from '../middleware/auth';
import { isAdmin } from '../middleware/admin';
import * as oauthService from '../services/oauth-service';
import { z } from 'zod';

const router = express.Router();

// Validation schema for client creation/update
const clientSchema = z.object({
  name: z.string().min(3).max(50),
  description: z.string().max(500).optional(),
  website: z.string().url(),
  redirectUris: z.array(z.string().url()),
  logoUrl: z.string().url().optional().or(z.literal('')),
  termsUrl: z.string().url().optional().or(z.literal('')),
  privacyUrl: z.string().url().optional().or(z.literal('')),
});

/**
 * Get all OAuth client applications for the authenticated developer
 * GET /api/oauth/developer/clients
 */
router.get('/clients', isAuthenticated, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const clients = await oauthService.getClientsByOwnerId(req.user.id);

    res.json({ 
      success: true,
      clients
    });
  } catch (error) {
    console.error('[OAuth Developer API] Error getting clients:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Create a new OAuth client application
 * POST /api/oauth/developer/clients
 */
router.post('/clients', isAuthenticated, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const validationResult = clientSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid client data',
        details: validationResult.error.format() 
      });
    }

    const clientData = {
      ...validationResult.data,
      ownerId: req.user.id,
      status: 'pending', // Default to pending, admins can change to active later
      isVerified: false
    };

    const client = await oauthService.createClient(clientData);
    
    // Remove sensitive data from response
    const { clientSecret, ...safeClient } = client;

    res.status(201).json({ 
      success: true,
      client: safeClient
    });
  } catch (error) {
    console.error('[OAuth Developer API] Error creating client:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to create client application'
    });
  }
});

/**
 * Get a specific OAuth client application
 * GET /api/oauth/developer/clients/:clientId
 */
router.get('/clients/:clientId', isAuthenticated, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const client = await oauthService.getClientById(req.params.clientId);
    
    if (!client) {
      return res.status(404).json({ 
        success: false,
        error: 'Client not found'
      });
    }

    // Check if the user is the owner of the client or an admin
    if (client.ownerId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ 
        success: false,
        error: 'You do not have permission to view this client'
      });
    }

    res.json({ 
      success: true,
      client
    });
  } catch (error) {
    console.error('[OAuth Developer API] Error getting client:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Update a client application
 * PATCH /api/oauth/developer/clients/:clientId
 */
router.patch('/clients/:clientId', isAuthenticated, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const client = await oauthService.getClientById(req.params.clientId);
    
    if (!client) {
      return res.status(404).json({ 
        success: false,
        error: 'Client not found'
      });
    }

    // Check if the user is the owner of the client or an admin
    if (client.ownerId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ 
        success: false,
        error: 'You do not have permission to update this client'
      });
    }

    // Allow partial updates (only validate the fields that are being updated)
    const partialSchema = clientSchema.partial();
    const validationResult = partialSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid client data',
        details: validationResult.error.format() 
      });
    }

    // Update the client
    const updatedClient = await oauthService.updateClient(req.params.clientId, {
      ...validationResult.data,
      updatedAt: new Date()
    });

    res.json({ 
      success: true,
      client: updatedClient
    });
  } catch (error) {
    console.error('[OAuth Developer API] Error updating client:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to update client application'
    });
  }
});

/**
 * Revoke all tokens for a client application
 * POST /api/oauth/developer/clients/:clientId/revoke
 */
router.post('/clients/:clientId/revoke', isAuthenticated, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const client = await oauthService.getClientById(req.params.clientId);
    
    if (!client) {
      return res.status(404).json({ 
        success: false,
        error: 'Client not found'
      });
    }

    // Check if the user is the owner of the client or an admin
    if (client.ownerId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ 
        success: false,
        error: 'You do not have permission to revoke tokens for this client'
      });
    }

    // Revoke all tokens
    await oauthService.revokeAllTokensForClient(req.params.clientId);

    // Update client status to revoked
    const updatedClient = await oauthService.updateClient(req.params.clientId, {
      status: 'revoked',
      updatedAt: new Date()
    });

    res.json({ 
      success: true,
      client: updatedClient
    });
  } catch (error) {
    console.error('[OAuth Developer API] Error revoking client tokens:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to revoke tokens'
    });
  }
});

/**
 * Regenerate client secret
 * POST /api/oauth/developer/clients/:clientId/regenerate-secret
 */
router.post('/clients/:clientId/regenerate-secret', isAuthenticated, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const client = await oauthService.getClientById(req.params.clientId);
    
    if (!client) {
      return res.status(404).json({ 
        success: false,
        error: 'Client not found'
      });
    }

    // Check if the user is the owner of the client or an admin
    if (client.ownerId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ 
        success: false,
        error: 'You do not have permission to regenerate secret for this client'
      });
    }

    // Regenerate client secret
    const newSecret = await oauthService.regenerateClientSecret(req.params.clientId);

    // Also revoke all existing tokens for security
    await oauthService.revokeAllTokensForClient(req.params.clientId);

    res.json({ 
      success: true,
      clientSecret: newSecret,
      message: 'Client secret regenerated successfully. All existing tokens have been revoked.'
    });
  } catch (error) {
    console.error('[OAuth Developer API] Error regenerating client secret:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to regenerate client secret'
    });
  }
});

/**
 * ADMIN API: Get all OAuth clients
 * GET /api/oauth/developer/admin/clients
 */
router.get('/admin/clients', isAdmin, async (req: Request, res: Response) => {
  try {
    const clients = await oauthService.getAllClients();

    res.json({ 
      success: true,
      clients
    });
  } catch (error) {
    console.error('[OAuth Developer API] Error getting all clients:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * ADMIN API: Verify a client application
 * PATCH /api/oauth/developer/admin/clients/:clientId/verify
 */
router.patch('/admin/clients/:clientId/verify', isAdmin, async (req: Request, res: Response) => {
  try {
    const client = await oauthService.getClientById(req.params.clientId);
    
    if (!client) {
      return res.status(404).json({ 
        success: false,
        error: 'Client not found'
      });
    }

    // Update the client verification status
    const { isVerified, status } = req.body;
    
    const updates: any = {
      updatedAt: new Date()
    };
    
    if (typeof isVerified === 'boolean') {
      updates.isVerified = isVerified;
    }
    
    if (status && ['active', 'pending', 'suspended', 'revoked', 'rejected'].includes(status)) {
      updates.status = status;
    }

    const updatedClient = await oauthService.updateClient(req.params.clientId, updates);

    // If client was activated, log this
    if (status === 'active' && client.status !== 'active') {
      await oauthService.createAuditLog({
        action: 'client_activated',
        clientId: client.clientId,
        userId: req.user?.id,
        details: `Client ${client.name} activated by admin`
      });
    }

    // If client was verified, log this
    if (isVerified && !client.isVerified) {
      await oauthService.createAuditLog({
        action: 'client_verified',
        clientId: client.clientId,
        userId: req.user?.id,
        details: `Client ${client.name} verified by admin`
      });
    }

    res.json({ 
      success: true,
      client: updatedClient
    });
  } catch (error) {
    console.error('[OAuth Developer API] Error verifying client:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to update client verification status'
    });
  }
});

/**
 * ADMIN API: Reject a client application
 * PATCH /api/oauth/developer/admin/clients/:clientId/reject
 */
router.patch('/admin/clients/:clientId/reject', isAdmin, async (req: Request, res: Response) => {
  try {
    const client = await oauthService.getClientById(req.params.clientId);
    
    if (!client) {
      return res.status(404).json({ 
        success: false,
        error: 'Client not found'
      });
    }

    const { reason } = req.body;
    
    // Update client status to rejected
    const updatedClient = await oauthService.updateClient(req.params.clientId, {
      status: 'rejected',
      rejectionReason: reason || 'Application rejected by administrator',
      updatedAt: new Date()
    });

    // Revoke all tokens
    await oauthService.revokeAllTokensForClient(req.params.clientId);

    // Log the rejection
    await oauthService.createAuditLog({
      action: 'client_rejected',
      clientId: client.clientId,
      userId: req.user?.id,
      details: `Client ${client.name} rejected by admin: ${reason || 'No reason provided'}`
    });

    res.json({ 
      success: true,
      client: updatedClient
    });
  } catch (error) {
    console.error('[OAuth Developer API] Error rejecting client:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to reject client application'
    });
  }
});

export default router;