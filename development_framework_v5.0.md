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

2. **ORM Configuration**
   - Define all schemas in `shared/schema.ts` to ensure frontend and backend consistency
   - Use Drizzle-zod for validation schema creation
   - Follow the type creation pattern: 
     - Define table schema
     - Create insert schema with `createInsertSchema`
     - Create insert type with `z.infer<typeof insertSchema>`
     - Create select type with `typeof table.$inferSelect`

## Frontend Data Management

1. **Query Management**
   - **CRITICAL**: Always use standard query patterns from our framework
   - Use `@tanstack/react-query` for all data fetching
   - NEVER create custom fetch or API request wrappers that bypass the standard pattern
   - Always use `useQuery` with proper query keys for fetching
   - Always use `useMutation` for data modifications
   - Properly invalidate queries with precise query keys after mutations

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

4. **Component Integration Testing**:
   - Test complete user flows, not just API calls
   - Verify data appears correctly in the UI before considering a feature complete
   - Use React Query's built-in devtools to inspect query states during development

5. **Enhanced Logging Strategy**:
   - Implement structured logging at key points in the data flow
   - Log both request and response details in development mode
   - Create dedicated debugging tools that don't modify the core data flow

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

## Troubleshooting Checklist

When an issue occurs, follow this checklist:

1. Check server logs for API errors
2. Inspect network requests in browser devtools
3. Verify data is being properly fetched and parsed
4. Check query cache state with React Query devtools
5. Validate form data against schema requirements
6. Check component props and state flow
7. Verify route handlers are correctly registered
8. Check database schema matches expected fields