# Pickle+ 4-Layer Architecture: Technical Prompt

This document provides a simple, practical framework for implementing new features in the Pickle+ platform following our 4-layer architecture pattern.

## General Implementation Pattern

```
Let's build the [feature name] feature following our 4-layer approach:

1. DATABASE LAYER:
Create/update tables in shared/schema.ts to store [specific data needed]

2. SERVER LAYER:
Add these API endpoints to server/routes.ts:
- GET /api/[feature]/[resource] to retrieve [data]
- POST /api/[feature]/[resource] to create [data]

3. SDK LAYER:
Create a client/src/lib/sdk/[feature]SDK.ts with simple functions to:
- get[Resource]() - fetch data from API
- create[Resource]() - send data to API

4. UI LAYER:
Update components to use the SDK functions instead of direct API calls

Remember our golden rule: Components should only talk to SDKs, not directly to APIs.
```

## Example: Match Recording Feature

```
Let's build the match recording feature following our 4-layer approach:

1. DATABASE LAYER:
Create/update match tables in shared/schema.ts to store match data, players, scores

2. SERVER LAYER:
Add these API endpoints to server/routes.ts:
- GET /api/match/recent to get recent matches
- POST /api/match/record to save a new match

3. SDK LAYER:
Create a client/src/lib/sdk/matchSDK.ts with simple functions to:
- getRecentMatches() - fetch recent matches
- recordMatch() - send match data to server

4. UI LAYER:
Update NewMatchRecordingForm to use the matchSDK.recordMatch() function

Remember our golden rule: Components should only talk to SDKs, not directly to APIs.
```

## Benefits of This Approach

1. **Consistent Structure**: All features follow the same pattern
2. **Separation of Concerns**: Each layer has a clear responsibility
3. **Testability**: Business logic is centralized in SDK and API layers
4. **Maintainability**: Changes to API implementation don't affect components
5. **Scalability**: Each layer can scale independently as the application grows

## Architectural Layers in Detail

### 1. Database Layer
- Defines the data structure
- Uses Drizzle ORM for schema definition
- Located in shared/schema.ts

### 2. Server Layer
- Implements API endpoints
- Handles authentication/validation
- Located in server/routes.ts
- Uses the storage interface for data access

### 3. SDK Layer
- Abstracts API communication
- Provides a clean interface for components
- Located in client/src/lib/sdk/[feature]SDK.ts

### 4. UI Layer
- Consumes SDK functions
- Focuses on presentation and user interaction
- Located in client/src/components/

By following this approach, we maintain a clean architecture that's easy to understand and extend as the Pickle+ platform grows.
