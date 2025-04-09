# Pickle+ Development Framework v4.0

## Core Architecture Principles

### 1. Four-Layer Architecture
All features must follow this layered architecture:

1. **Database Layer**: Schema definitions, migrations, and raw data operations
2. **Server Layer**: API endpoints, business logic, validation, and storage interface
3. **SDK Layer**: Client-side API wrappers, data transformations, and integration points
4. **UI Layer**: Components, pages, state management, and user interactions

### 2. Modular Design
- Features are organized into independent modules with clear boundaries
- Inter-module communication happens through the event bus
- Each module has its own directory structure and API surface
- Avoid direct dependencies between modules

### 3. Middleware Order & Express Configuration
- Follow this exact middleware order:
  1. Body parser middleware
  2. CORS configuration
  3. Session management
  4. Authentication setup
  5. API routes
  6. Error handlers
  7. Vite middleware (last)
- Always call `setupAuth(app)` in `registerRoutes` before defining any API routes
- Configure CORS properly for cookie handling:
  ```javascript
  app.use(cors({
    origin: true, 
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'Set-Cookie']
  }));
  ```

### 4. Route Management
- API routes must be registered before Vite middleware to prevent conflicts
- Avoid custom handlers for paths that should be handled by frontend routing
- For 404 handlers, only handle API routes (`/api/*`) and let Vite handle client-side routes
- Use wildcard patterns for API routes to prevent unintended route handling
- Always return proper status codes and consistent error formats from API endpoints

### 5. Authentication & Session Management
- Use Passport.js with properly configured session middleware
- In development, set `secure: false` in cookie options for Replit compatibility
- Session store should use PostgreSQL via `connect-pg-simple`
- Ensure all protected routes use the `isAuthenticated` middleware

## Data Management

### 1. Schema Definition
- All database schema is defined in `shared/schema.ts` and related files
- Use Drizzle's schema definition for all tables
- Each entity should have:
  - Table definition with proper column types and constraints
  - Relations defined using Drizzle's relations API
  - Insert schema with validation using `createInsertSchema` from drizzle-zod
  - Type definitions using `z.infer<typeof insertSchema>` and `typeof table.$inferSelect`

### 2. Storage Interface
- All database operations must go through the storage interface
- Direct `db.insert()` calls should only be in the storage implementation
- Update `IStorage` interface in `server/storage.ts` before implementing new functionality
- Use transactions for operations that affect multiple tables

### 3. API Implementation
- All API routes should be thin and delegate to the storage interface
- Validate requests using Zod schemas from `shared/schema.ts`
- Handle errors consistently and provide meaningful error messages
- Include transaction logging for complex operations
- Implement pagination for list endpoints

## Frontend Implementation

### 1. React Patterns
- Use `wouter` for routing
- For forms, use shadcn's `useForm` hook and `Form` component
- Validate forms with `zodResolver` from `@hookform/resolvers/zod`
- Use `@tanstack/react-query` for data fetching with proper caching

### 2. SDK Layer
- Create SDK functions in the `client/src/lib/sdk` directory
- Each SDK function should handle:
  - API request formatting
  - Error handling
  - Data transformation
  - Type safety

### 3. Component Organization
- Reusable UI components go in `components/ui`
- Feature-specific components go in their feature directory
- Create custom hooks for complex state or data fetching logic
- Use context providers sparingly and with clear boundaries

### 4. State Management
- Use React Query for server state
- Use React Context for global UI state
- Use local state for component-specific state
- Use the event bus for cross-module communication

## Styling and UX

### 1. Design System
- Use the established color scheme:
  - Primary: #FF5722
  - Secondary: #2196F3
  - Accent: #4CAF50
- Use Tailwind CSS for styling
- Use shadcn components for consistent UI elements
- Override `theme.json` for global theming

### 2. Responsive Design
- Use mobile-first approach
- Test on multiple viewports
- Use Tailwind's responsive prefixes consistently

## Testing and Debugging

### 1. Debugging Methodology
- Include detailed logging at crucial points
- Format complex objects with `JSON.stringify(obj, null, 2)`
- For auth issues, trace the full request-response cycle
- Check for 404 errors which may indicate missing routes
- Verify cookies are being properly set and sent

### 2. Common Pitfalls to Avoid
- Don't modify core infrastructure files (`server/index.ts`, `server/vite.ts`)
- Don't create conflicting catch-all routes
- Don't bypass the storage interface
- Don't directly modify `package.json` or `drizzle.config.ts`
- Don't use direct database connections in API routes

## Deployment

### 1. Environment Configuration
- Use environment variables for configuration
- Set `secure: true` for cookies in production
- Use `process.env.NODE_ENV` to toggle development-specific behavior

### 2. Production Considerations
- Add proper error handling and fallbacks
- Use production database connection strings
- Implement rate limiting for public endpoints
- Add appropriate security headers

This framework represents our best practices based on lessons learned during development and should be followed for all new features.