/**
 * PKL-278651-API-0001-GATEWAY
 * API Gateway Routes Index
 * 
 * This file exports all API Gateway routes.
 */

import { Router, Request, Response } from 'express';
import developerRoutes from './developer-routes';
import keyManagementRoutes from './key-management-routes';
import gatewayV1Routes from './gateway-v1-routes';
import webhookRoutes from './webhook-routes';
import adminRoutes from './admin-routes';
import docsRoutes from './docs-routes';

// Create API Gateway router
const apiGatewayRouter = Router();

// API version and base path
const API_VERSION = 'v1';
const API_BASE_PATH = `/api/${API_VERSION}`;

// Register all routes
apiGatewayRouter.use('/api/developer', developerRoutes);
apiGatewayRouter.use('/api/developer/keys', keyManagementRoutes);
apiGatewayRouter.use('/api/developer/webhooks', webhookRoutes);
apiGatewayRouter.use('/api/admin/developers', adminRoutes);
apiGatewayRouter.use('/api/docs', docsRoutes);

// Gateway entry routes
apiGatewayRouter.use(API_BASE_PATH, gatewayV1Routes);

// Health check endpoint
apiGatewayRouter.get(`${API_BASE_PATH}/health`, (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    version: API_VERSION,
    timestamp: new Date().toISOString()
  });
});

// Root API docs redirect
apiGatewayRouter.get(`${API_BASE_PATH}`, (req: Request, res: Response) => {
  res.redirect('/api/docs');
});

export default apiGatewayRouter;