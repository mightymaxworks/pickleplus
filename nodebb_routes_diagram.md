# NodeBB Integration Routes Diagram

This document provides a visual representation of how the NodeBB routes will integrate with the existing Pickle+ application routes.

```
┌─────────────────────────────────────────────────────────────────┐
│                       Pickle+ Application                        │
│                                                                 │
│  ┌─────────────────────────┐         ┌────────────────────────┐ │
│  │    Existing Routes      │         │     NodeBB Routes      │ │
│  │                         │         │                        │ │
│  │  /                      │         │  /community/v2         │ │
│  │  /login                 │         │                        │ │
│  │  /dashboard             │         │                        │ │
│  │  /profile               │         │                        │ │
│  │  /matches               │         │                        │ │
│  │  /tournaments           │         │                        │ │
│  │  /communities           │◄───────┐│                        │ │
│  │  /communities/:id       │        ││                        │ │
│  │  /communities/create    │        ││                        │ │
│  │                         │        ││                        │ │
│  └─────────────────────────┘        ││                        │ │
│                                     ││                        │ │
│                                     │└────────────────────────┘ │
│                                     │                           │
│           Cross-linking for comparison testing                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    API Route Structure                           │
│                                                                 │
│  ┌─────────────────────────┐         ┌────────────────────────┐ │
│  │    Existing API         │         │     NodeBB API         │ │
│  │                         │         │                        │ │
│  │  /api/auth/*            │         │  /api/nodebb/*         │ │
│  │  /api/users/*           │         │  /api/webhooks/nodebb  │ │
│  │  /api/matches/*         │         │                        │ │
│  │  /api/tournaments/*     │         │                        │ │
│  │  /api/communities/*     │         │                        │ │
│  │  /api/rankings/*        │         │                        │ │
│  │  /api/events/*          │         │                        │ │
│  │                         │         │                        │ │
│  └──────────┬──────────────┘         └────────────┬───────────┘ │
│             │                                     │             │
│             │          Data Synchronization       │             │
│             └─────────────────────────────────────┘             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                  Authentication Flow                             │
│                                                                 │
│  ┌─────────────────────────┐         ┌────────────────────────┐ │
│  │    Pickle+ Auth         │         │     NodeBB Auth        │ │
│  │                         │         │                        │ │
│  │  Login/Register         │─────────►  OAuth2 SSO            │ │
│  │  Session Management     │◄─────────  Token Validation      │ │
│  │  User Profiles          │─────────►  User Synchronization  │ │
│  │                         │         │                        │ │
│  └─────────────────────────┘         └────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Route Mapping Details

### Frontend Routes

| Existing Routes                 | NodeBB Integration Routes     |
|---------------------------------|-------------------------------|
| `/communities`                  | `/community/v2`               |
| `/communities/:id`              | `/community/v2/discussions/:categoryId` |
| *(No equivalent)*               | `/community/v2/discussion/:id` |
| *(No equivalent)*               | `/community/v2/profile/:username` |

### API Routes

| Existing API Routes                 | NodeBB API Routes              |
|------------------------------------|-------------------------------|
| `/api/communities/*`               | `/api/nodebb/*`               |
| `/api/communities/:id/posts`       | `/api/nodebb/topics`          |
| `/api/communities/:id/members`     | `/api/nodebb/users/groups`    |
| *(No equivalent)*                  | `/api/webhooks/nodebb`        |

## Key Integration Points

1. **User Authentication**
   - Pickle+ handles primary authentication
   - NodeBB receives authentication via OAuth2
   - Single sign-on maintains unified experience

2. **User Profile Data**
   - User profiles synchronized between systems
   - Skill ratings from Pickle+ displayed in NodeBB

3. **Community Data**
   - Communities in Pickle+ map to categories in NodeBB
   - Posts in Pickle+ map to topics in NodeBB
   
4. **Analytics**
   - Both systems tracked independently
   - Cross-linking allows users to try both versions

## Summary

This integration approach maintains complete separation between the systems while allowing for proper A/B testing. No existing routes are overwritten, and users can easily compare both community implementations.