# Development Framework v5.0

This framework defines the core principles and practices for developing the Pickle+ platform. It extends and enhances Framework 4.0, incorporating critical lessons learned from production issues.

## Core Architecture Principles

1. **Modular Architecture**
   - Maintain strict separation of concerns between modules
   - Use event bus for cross-module communication
   - Each module should have distinct boundaries and responsibilities

2. **Data Flow Integrity**
   - Follow unidirectional data flow patterns
   - Maintain type safety throughout the application
   - Single source of truth for all data
   - No duplicate or conflicting state management

3. **Standardized API Interactions**
   - Consistent patterns for all data fetching and mutations
   - Proper error handling at every layer
   - Clear typing of all request and response objects

## Express Middleware & API Configuration

1. **Required Middleware Order**
   - bodyParser → CORS → session → auth → API routes → error handlers → Vite
   - Authentication setup (`setupAuth(app)`) MUST be called before registering API routes
   - API routes MUST be registered before Vite middleware
   - 404 handlers should only process API routes and use `next()` for client routes
   - Avoid conflicting catch-all routes that interfere with Vite's frontend serving

2. **API Response Format Standardization**
   - All API responses MUST follow consistent structure
   - Success responses: `{ data: { ... } }` or `{ data: [ ... ] }`
   - Error responses: `{ error: { message: "...", code: "..." } }`
   - Paginated responses: `{ data: [...], pagination: { currentPage, totalPages, totalItems } }`

## Database Schema Management

1. **Data Integrity**
   - Always favor database-level constraints and defaults over application-level validations
   - Use proper migration scripts for any schema changes with "up" and "down" paths
   - Implement data integrity through constraints, defaults, and transactions
   - Maintain synchronization between application code and database schema
   - **CRITICAL**: Enforce consistent naming conventions in both database schema and application code

2. **ORM Configuration**
   - Define all schemas in `shared/schema.ts` to ensure frontend and backend consistency
   - Use Drizzle-zod for validation schema creation
   - Follow the type creation pattern: 
     - Define table schema
     - Create insert schema with `createInsertSchema`
     - Create insert type with `z.infer<typeof insertSchema>`
     - Create select type with `typeof table.$inferSelect`
   - **NEW**: Always be aware of naming convention translation between TypeScript fields and DB columns
   - **NEW**: Understand exactly how your ORM maps JavaScript/TypeScript property names to database column names
   - **NEW**: When defining columns with different naming styles (e.g., camelCase in code, snake_case in DB), ensure the mapping layer correctly translates between them

## Frontend Data Management

1. **Query Management**
   - **CRITICAL**: Always use standard query patterns from our framework
   - Use `@tanstack/react-query` for all data fetching
   - NEVER create custom fetch or API request wrappers that bypass the standard pattern
   - Always use `useQuery` with proper query keys for fetching
   - Always use `useMutation` for data modifications
   - Properly invalidate queries with precise query keys after mutations
   - For critical operations, implement multiple independent cache invalidation strategies
   - Use predicate-based invalidation to catch all variants of query keys when necessary
   - Consider both with/without leading slash patterns in API paths for invalidation
   - Manually trigger immediate refetches for time-critical operations

2. **API Request Lifecycle**
   - **NEVER directly manipulate response objects**
   - Always use the framework's `apiRequest` function for all API calls
   - When extending for debugging purposes, wrap the existing function; don't replace it
   - Respect the complete response processing flow: 
     - fetch → status check → response.text() → JSON.parse()

3. **Type Safety Requirements**
   - Define proper interfaces for all API responses
   - Use proper type guards when processing API responses
   - Avoid type assertions (`as` keyword) except when absolutely necessary
   - Minimize use of `any` type; use explicit unknown and appropriate type narrowing

## Component Patterns

1. **Form Management**
   - Use shadcn's `useForm` hook and `Form` component
   - Use `zodResolver` to validate form data
   - Ensure all fields have proper validation rules
   - Properly handle default values

2. **UI Component Guidelines**
   - Use existing shadcn components wherever possible
   - When extending components, maintain accessibility
   - Follow consistent styling patterns using theme variables
   
3. **Component Communication Strategy**
   - Use explicit callback props for critical operations (onCreated, onUpdated, etc.)
   - For components with complex state requirements, implement React Context
   - Implement error boundaries or try-catch when consuming context
   - Provide fallback mechanisms when context might be unavailable
   - For lists requiring immediate updates after CRUD operations, implement multiple data refresh mechanisms
   - Include timestamps or force refresh keys in component state to trigger re-renders

4. **UI Refresh Strategy**
   - For critical UI updates, implement multiple independent refresh mechanisms
   - Never rely solely on React Query cache invalidation for critical UI updates
   - Consider combining these approaches for maximum reliability:
     - Context system for broadcasting changes to interested components
     - Direct API calls that bypass the cache entirely
     - Callback propagation between parent-child components
     - Component state refresh triggers (forceRefreshKey)
     - Window focus event handlers for automatic refreshes
   - Add comprehensive logging for each refresh strategy

## Testing and Quality Assurance

1. **Integration Testing Requirements**
   - Test complete user flows, not just individual functions
   - Verify data appears correctly in the UI before considering a feature complete
   - Use React Query's devtools during development to inspect query states

2. **Error Handling Strategy**
   - All errors must be properly caught and handled
   - User-facing errors should be friendly and actionable
   - Developer errors should be detailed and logged
   - No unhandled promise rejections or exceptions

3. **Logging Standards**
   - Implement structured logging at key points in the data flow
   - Log both request and response details in development mode
   - Create dedicated debugging tools that don't modify the core data flow

## API Response Debugging

1. **Proper Response Inspection**
   - When troubleshooting API issues, always log the raw text response
   - Check for valid JSON before attempting to parse
   - Inspect both headers and status codes

2. **API Request Debugging**
   - Add verbose logging without modifying the standard request flow
   - Use browser devtools network tab to inspect actual requests
   - Verify request method, headers, and body are correct

## Performance Standards

1. **Query Optimization**
   - Use appropriate caching strategies
   - Implement proper query deduplication
   - Use stale-while-revalidate patterns for better UX

2. **Code Splitting**
   - Use dynamic imports for larger components
   - Optimize bundle size with proper tree shaking

## Implementation Rules

1. **No Custom API Request Handling**: 
   - Always use the standard `apiRequest` and `queryClient` functions
   - If debugging is needed, add logging to the standard functions rather than creating alternative paths

2. **Proper Response Processing**:
   - Never assume a response is already in JSON format
   - Always follow the full pattern: fetch → check status → response.text() → JSON.parse()
   - Use the built-in utilities in our framework that handle this automatically

3. **Strong TypeScript Practices**:
   - Define clear interfaces for all API responses in `shared/schema.ts`
   - Avoid type assertions (`as`) except when absolutely necessary
   - Use proper type guards to check shapes of data
   - Minimize use of `any` type
   - **NEW**: Ensure all field names are consistently used between frontend and backend

4. **Data Access Abstraction**:
   - **CRITICAL**: Always use standardized storage interfaces for database operations
   - **NEW**: Never bypass the storage layer with direct database operations
   - **NEW**: Use storage interfaces that properly handle field name conversions
   - **NEW**: Keep route handlers thin and delegate data operations to storage interfaces
   - **NEW**: If storage interface doesn't support a specific operation, extend it rather than creating workarounds

5. **Component Integration Testing**:
   - Test complete user flows, not just API calls
   - Verify data appears correctly in the UI before considering a feature complete
   - Use React Query's built-in devtools to inspect query states during development

6. **Enhanced Logging Strategy**:
   - Implement structured logging at key points in the data flow
   - Log both request and response details in development mode
   - Create dedicated debugging tools that don't modify the core data flow
   - **NEW**: Log the exact data being sent to and returned from the database for debugging

## Resilient Component Design

1. **UI Refresh Reliability**
   - Design components to be resilient to different data refresh mechanisms
   - Implement multi-layer refresh strategies for critical CRUD operations
   - Use redundant notification systems for maximum reliability
   - Never assume cache invalidation alone will be sufficient

2. **Context System Design**
   - Wrap context providers close to where they're needed
   - Include error handling in context consumers
   - Provide multiple mechanisms for components to detect data changes:
     - Timestamp-based change detection
     - Direct notification callbacks
     - Force refresh mechanisms
   - Document context dependencies and fallback behaviors

3. **Form Dialog Communication**
   - Dialog components should always have explicit callbacks for completion events
   - For critical operations, implement at least three independent refresh mechanisms
   - Add verbose logging of component lifecycles
   - Implement robust error handling with clear user feedback

## Golden Ticket Subsystem Guidelines

1. **File Uploads**
   - Use dedicated file upload endpoints with appropriate MIME type validation
   - Store uploaded files in appropriate directories with unique filenames
   - Reference files using relative paths, not absolute paths

2. **Sponsor Management**
   - ALWAYS invalidate query cache after sponsor creation/update
   - Use proper and consistent field naming between frontend and backend
   - Ensure proper null/undefined handling for optional fields

3. **Golden Ticket Creation**
   - Validate that required fields are provided and consistent
   - Use proper date format validation and parsing
   - Apply consistent rate limiting

## Debug-Friendly Development

1. **Console Logging Standards**
   - Add comprehensive prefixed logging for all critical operations
   - Use consistent prefixes for related components (e.g., `[Tournament]`, `[API]`, etc.)
   - Log the exact values being used in queries and mutations
   - Implement lifecycle logging (start, processing, completion) for critical operations
   - Include timestamps in logs for tracing sequential operations

2. **Component Instrumentation**
   - Add internal state monitoring capabilities
   - Log query key composition and cache state
   - Include console reporting for context updates
   - Add direct visibility into cache operations

3. **Defensive Logging**
   - Log both success and error paths
   - Add verbose logging around critical boundaries
   - Include logging for fallback paths
   - Make failure conditions explicitly visible

## Troubleshooting Checklist

When an issue occurs, follow this checklist:

1. Check server logs for API errors
2. Inspect network requests in browser devtools
3. Verify data is being properly fetched and parsed
4. Check query cache state with React Query devtools
5. Validate form data against schema requirements
6. Check component props and state flow
7. Verify route handlers are correctly registered
8. **NEW**: Verify field naming conventions match between frontend and database
9. **NEW**: Check if column names in database (snake_case) align with property names in code (camelCase)
10. **NEW**: Verify storage interface correctly handles field name translation
11. **NEW**: Ensure API route handlers use storage interfaces instead of direct database operations
12. Check database schema matches expected fields
13. Examine console logs for component refresh operations
14. Verify multiple refresh strategies are working
15. Check for error handling around context usage

### Field Naming Convention Debugging

When dealing with field mapping issues:

1. **Identify the data path**: 
   - Frontend field name (e.g., `firstName`) 
   - → API route parameter 
   - → Storage interface method 
   - → SQL column name (e.g., `first_name`)

2. **Check field name transformation**: 
   - Verify how field names are transformed at each layer
   - Ensure the storage interface correctly maps between camelCase and snake_case
   - Add logging to see the exact field names being sent to and returned from the database

3. **Use standard interfaces**:
   - Always prefer using the established storage interface over direct SQL operations
   - If special handling is needed, extend the interface rather than bypassing it