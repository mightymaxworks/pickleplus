# NodeBB Route Integration Guide

This document provides clear instructions for safely integrating NodeBB routes into the existing Pickle+ application without overwriting any current functionality.

## Frontend Route Integration

### 1. Add New Route in App.tsx

Locate your main `App.tsx` file and add the new route for the NodeBB integration. Do not modify any existing routes.

```tsx
// In client/src/App.tsx
// Find the section with other route definitions

// Add this new route alongside existing ones - DO NOT REPLACE ANY ROUTES
<Route path="/community/v2" component={lazy(() => import('./pages/community/v2'))} />
```

### 2. Add Navigation Links (Optional)

To make the NodeBB integration accessible, add a link in your navigation menu:

```tsx
// In your navigation component - DO NOT REPLACE EXISTING LINKS
<Link to="/community/v2">
  <Badge variant="outline" className="ml-2">New</Badge>
  Community Beta
</Link>
```

## Backend API Routes Integration

### 1. Register NodeBB Gateway in routes.ts

Add the NodeBB gateway routes to your Express application without modifying existing routes:

```typescript
// In server/routes.ts
// Import the NodeBB gateway
import { gateway as nodebbGateway } from './modules/community/nodebb';

// Inside your route registration function, add these routes WITHOUT modifying existing ones
export async function registerRoutes(app: express.Express): Promise<Server> {
  // Existing route registrations remain untouched
  
  // Add NodeBB gateway routes - DO NOT REPLACE ANY ROUTES
  app.use('/api/nodebb', nodebbGateway);
  
  // The rest of your existing code
}
```

### 2. Add Webhook Route

Add the NodeBB webhook route which will handle incoming notifications from the NodeBB server:

```typescript
// In server/routes.ts, inside registerRoutes function

// Add NodeBB webhook route - DO NOT REPLACE ANY ROUTES
app.use('/api/webhooks/nodebb', nodebbGateway);
```

## Environment Configuration

To avoid conflicts with existing environment variables, use prefixed variables for NodeBB integration:

```
# Add these to your .env file - DO NOT MODIFY EXISTING VARIABLES
NODEBB_URL=http://localhost:4567
NODEBB_API_TOKEN=your_api_token_here
NODEBB_ADMIN_USERNAME=admin
NODEBB_ADMIN_PASSWORD=adminpassword
```

## URL Structure

The following URL structure ensures no conflicts with existing routes:

| Feature | URL Path | Notes |
|---------|----------|-------|
| Community Beta Homepage | `/community/v2` | New frontend route |
| NodeBB API Gateway | `/api/nodebb/*` | Proxies to NodeBB API |
| NodeBB Webhooks | `/api/webhooks/nodebb` | Receives events from NodeBB |
| Direct NodeBB Access | `http://localhost:4567` | Only for development |

## Integration Checklist

Before deploying:

- [ ] Verify no existing routes have been modified
- [ ] Test both original community features and new NodeBB integration
- [ ] Ensure user authentication works across both systems
- [ ] Confirm both interfaces can be accessed independently
- [ ] Verify no styling conflicts between systems

## A/B Testing

During the A/B testing phase:

1. The original community features remain at their current routes
2. The NodeBB integration is accessible at `/community/v2` routes
3. Both systems operate independently with synchronized user data
4. Analytics will track usage of both systems for comparison

## Rollback Strategy

If issues arise, a simple rollback strategy is to disable the NodeBB routes without affecting existing functionality:

```typescript
// Simply comment out these lines to disable NodeBB integration
// app.use('/api/nodebb', nodebbGateway);
// app.use('/api/webhooks/nodebb', nodebbGateway);
```

And remove the frontend route:

```tsx
// Comment out this line to disable NodeBB UI
// <Route path="/community/v2" component={lazy(() => import('./pages/community/v2'))} />
```