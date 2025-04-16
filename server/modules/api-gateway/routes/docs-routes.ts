/**
 * PKL-278651-API-0001-GATEWAY
 * API Documentation Routes
 * 
 * Routes for the API documentation and reference.
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { eq, and, asc, sql } from 'drizzle-orm';
import { db } from '../../../db';
import { apiDocumentation } from '../../../../shared/schema/api-gateway';

const router = Router();

/**
 * Get all API documentation endpoints
 * GET /api/docs/endpoints
 */
router.get('/endpoints', async (req: Request, res: Response) => {
  try {
    // Parse query parameters
    const version = req.query.version as string;
    const tag = req.query.tag as string;
    
    // Build query
    let query = db.select()
      .from(apiDocumentation)
      .orderBy(
        asc(apiDocumentation.endpoint),
        asc(apiDocumentation.method)
      );
    
    // Apply version filter if provided
    if (version) {
      query = query.where(eq(apiDocumentation.version, version));
    }
    
    // Apply tag filter if provided
    if (tag) {
      query = query.where(sql`${apiDocumentation.tags} LIKE ${'%' + tag + '%'}`);
    }
    
    // Execute query
    const endpoints = await query;
    
    // Transform for response
    const transformedEndpoints = endpoints.map(endpoint => ({
      ...endpoint,
      tags: endpoint.tags ? endpoint.tags.split(',') : [],
      requiredScopes: endpoint.requiredScopes ? endpoint.requiredScopes.split(',') : []
    }));
    
    res.json({
      data: transformedEndpoints
    });
  } catch (error) {
    console.error('Error getting API documentation:', error);
    res.status(500).json({ 
      error: 'server_error',
      message: 'Failed to retrieve API documentation' 
    });
  }
});

/**
 * Get documentation for a specific endpoint
 * GET /api/docs/endpoints/:endpoint/:method
 */
router.get('/endpoints/:endpoint/:method', async (req: Request, res: Response) => {
  try {
    const endpoint = req.params.endpoint;
    const method = req.params.method.toUpperCase();
    
    // Validate method
    const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
    if (!validMethods.includes(method)) {
      return res.status(400).json({
        error: 'invalid_method',
        message: 'Invalid HTTP method'
      });
    }
    
    // Get documentation for specific endpoint
    const documentation = await db.select()
      .from(apiDocumentation)
      .where(
        and(
          eq(apiDocumentation.endpoint, endpoint),
          eq(apiDocumentation.method, method)
        )
      )
      .limit(1);
    
    if (documentation.length === 0) {
      return res.status(404).json({
        error: 'not_found',
        message: 'Documentation not found for this endpoint'
      });
    }
    
    // Transform for response
    const transformedDoc = {
      ...documentation[0],
      tags: documentation[0].tags ? documentation[0].tags.split(',') : [],
      requiredScopes: documentation[0].requiredScopes ? documentation[0].requiredScopes.split(',') : []
    };
    
    res.json({
      data: transformedDoc
    });
  } catch (error) {
    console.error('Error getting endpoint documentation:', error);
    res.status(500).json({ 
      error: 'server_error',
      message: 'Failed to retrieve endpoint documentation' 
    });
  }
});

/**
 * Get available API versions
 * GET /api/docs/versions
 */
router.get('/versions', async (req: Request, res: Response) => {
  try {
    // Get all unique versions
    const versions = await db.select({ version: apiDocumentation.version })
      .from(apiDocumentation)
      .groupBy(apiDocumentation.version)
      .orderBy(asc(apiDocumentation.version));
    
    res.json({
      data: versions.map(v => v.version)
    });
  } catch (error) {
    console.error('Error getting API versions:', error);
    res.status(500).json({ 
      error: 'server_error',
      message: 'Failed to retrieve API versions' 
    });
  }
});

/**
 * Get available API tags
 * GET /api/docs/tags
 */
router.get('/tags', async (req: Request, res: Response) => {
  try {
    // Get all tags (this is a simplified approach)
    const tagsResult = await db.select({ tags: apiDocumentation.tags })
      .from(apiDocumentation)
      .groupBy(apiDocumentation.tags);
    
    // Process and deduplicate tags
    const allTags = new Set<string>();
    
    tagsResult.forEach(result => {
      if (result.tags) {
        result.tags.split(',').forEach(tag => {
          allTags.add(tag.trim());
        });
      }
    });
    
    res.json({
      data: Array.from(allTags).sort()
    });
  } catch (error) {
    console.error('Error getting API tags:', error);
    res.status(500).json({ 
      error: 'server_error',
      message: 'Failed to retrieve API tags' 
    });
  }
});

/**
 * Generate OpenAPI specification
 * GET /api/docs/openapi
 */
router.get('/openapi', async (req: Request, res: Response) => {
  try {
    // Get all documentation
    const endpoints = await db.select()
      .from(apiDocumentation)
      .orderBy(
        asc(apiDocumentation.endpoint),
        asc(apiDocumentation.method)
      );
    
    // Generate OpenAPI specification
    const openApiSpec = generateOpenApiSpec(endpoints);
    
    res.json(openApiSpec);
  } catch (error) {
    console.error('Error generating OpenAPI specification:', error);
    res.status(500).json({ 
      error: 'server_error',
      message: 'Failed to generate OpenAPI specification' 
    });
  }
});

/**
 * Generate OpenAPI specification from documentation
 */
function generateOpenApiSpec(endpoints: any[]): any {
  // Group endpoints by version
  const endpointsByVersion: Record<string, any[]> = {};
  
  endpoints.forEach(endpoint => {
    const version = endpoint.version || 'latest';
    if (!endpointsByVersion[version]) {
      endpointsByVersion[version] = [];
    }
    endpointsByVersion[version].push(endpoint);
  });
  
  // Get the latest version
  const latestVersion = Object.keys(endpointsByVersion).sort().pop() || 'latest';
  const latestEndpoints = endpointsByVersion[latestVersion];
  
  // Build paths object
  const paths: Record<string, any> = {};
  
  latestEndpoints.forEach(endpoint => {
    const path = `/api/v1${endpoint.endpoint}`;
    
    if (!paths[path]) {
      paths[path] = {};
    }
    
    const method = endpoint.method.toLowerCase();
    
    // Transform request and response schemas
    const requestSchema = endpoint.requestSchema || null;
    const responseSchema = endpoint.responseSchema || null;
    
    paths[path][method] = {
      summary: endpoint.summary,
      description: endpoint.description,
      tags: endpoint.tags ? endpoint.tags.split(',') : [],
      security: endpoint.authRequired ? [
        {
          ApiKeyAuth: endpoint.requiredScopes ? endpoint.requiredScopes.split(',') : []
        }
      ] : [],
      deprecated: endpoint.deprecated,
      ...(requestSchema && {
        requestBody: {
          content: {
            'application/json': {
              schema: requestSchema
            }
          }
        }
      }),
      responses: {
        '200': {
          description: 'Successful response',
          ...(responseSchema && {
            content: {
              'application/json': {
                schema: responseSchema
              }
            }
          })
        },
        '401': {
          description: 'Unauthorized - Missing or invalid API key'
        },
        '403': {
          description: 'Forbidden - Insufficient scope'
        },
        '429': {
          description: 'Too Many Requests - Rate limit exceeded'
        }
      }
    };
  });
  
  // Build components object
  const components = {
    securitySchemes: {
      ApiKeyAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'X-API-Key'
      },
      BearerAuth: {
        type: 'http',
        scheme: 'bearer'
      }
    }
  };
  
  // Build final OpenAPI specification
  return {
    openapi: '3.0.0',
    info: {
      title: 'Pickle+ API',
      description: 'API for accessing Pickle+ functionality',
      version: latestVersion
    },
    servers: [
      {
        url: 'https://api.pickleplus.com',
        description: 'Production server'
      },
      {
        url: 'https://sandbox.pickleplus.com',
        description: 'Sandbox server'
      }
    ],
    paths,
    components
  };
}

/**
 * Render API documentation UI
 * GET /api/docs
 */
router.get('/', (req: Request, res: Response) => {
  // Redirect to developer portal for now
  res.redirect('/developer/docs');
});

export default router;