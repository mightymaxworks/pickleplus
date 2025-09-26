# Pickle+ WeChat Integration API Documentation

## Overview

The Pickle+ WeChat Integration API enables WeChat mini-programs and apps to seamlessly integrate with the Pickle+ pickleball ecosystem. This "Pickleball Data OS" approach allows external apps to leverage Pickle+'s advanced ranking algorithms, user management, and real-time sync capabilities while maintaining complete IP protection.

### Architecture Philosophy: "Pickleball Stripe"
Pickle+ functions as essential infrastructure for external pickleball apps, similar to how Stripe powers payments. External apps send data → Pickle+ processes with protected algorithms → returns calculated results for local updates.

## Quick Start Guide

### 1. Authentication Setup

All API requests require an API key in the header:

```http
X-API-Key: your_api_key_here
```

### 2. Basic WeChat User Registration

```javascript
// WeChat Mini-Program Example
const registerUser = async (wechatUserInfo) => {
  const response = await wx.request({
    url: 'https://api.pickle.app/api/v1/wechat/register',
    method: 'POST',
    header: {
      'X-API-Key': 'your_api_key',
      'Content-Type': 'application/json'
    },
    data: {
      wechat_oauth_data: {
        openid: wechatUserInfo.openid,
        nickname: wechatUserInfo.nickname,
        sex: wechatUserInfo.sex,
        city: wechatUserInfo.city,
        country: wechatUserInfo.country,
        headimgurl: wechatUserInfo.headimgurl
      },
      registration_metadata: {
        source: 'wechat_miniprogram',
        app_version: '1.0.0',
        platform: 'iOS'
      }
    }
  });
  
  // Response includes Pickle+ user ID and passport code
  return response.data;
};
```

### 3. Real-Time Webhook Setup

```javascript
// Register for real-time updates
const setupWebhooks = async () => {
  await wx.request({
    url: 'https://api.pickle.app/api/v1/wechat/register-webhook',
    method: 'POST',
    header: {
      'X-API-Key': 'your_api_key',
      'Content-Type': 'application/json'
    },
    data: {
      webhook_url: 'https://your-wechat-app.com/webhook',
      events: [
        'user.created',
        'user.ranking_changed', 
        'wechat.user_linked',
        'wechat.profile_synced'
      ],
      secret: 'your_webhook_secret'
    }
  });
};
```

## API Endpoints

### POST /api/v1/wechat/register

Register a new WeChat user in the Pickle+ system.

**Required Scopes:** `user:write`

**Request Body:**
```json
{
  "wechat_oauth_data": {
    "openid": "string (required)",
    "unionid": "string (optional)",
    "nickname": "string (required)",
    "sex": "number (optional, 1=male, 2=female)",
    "city": "string (optional)",
    "country": "string (optional)", 
    "province": "string (optional)",
    "language": "string (optional)",
    "headimgurl": "string (optional)"
  },
  "registration_metadata": {
    "source": "string (required, e.g., 'wechat_miniprogram')",
    "app_version": "string (optional)",
    "platform": "string (optional)",
    "registration_ip": "string (optional)"
  },
  "user_preferences": {
    "preferred_language": "string (optional, 'zh' or 'en')",
    "marketing_consent": "boolean (optional)",
    "data_sharing_consent": "boolean (optional)"
  }
}
```

**Response (200 OK):**
```json
{
  "api_version": "v1",
  "data": {
    "registration_status": "success",
    "user_id": 12345,
    "passport_code": "HVGN0BW0",
    "display_name": "用户昵称",
    "email": "wechat_openid123@pickle.app",
    "profile_completion": 45,
    "ranking_points": {
      "singles": 800,
      "doubles": 750
    },
    "created_at": "2025-09-26T06:58:45.123Z",
    "pickle_plus_features": {
      "real_time_sync": true,
      "ranking_updates": true,
      "tournament_eligibility": true,
      "coach_matching": true
    }
  }
}
```

**Error Responses:**
- `409 Conflict`: User already exists
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Invalid API key
- `403 Forbidden`: Insufficient scope

### POST /api/v1/wechat/register-webhook

Register a webhook endpoint to receive real-time updates.

**Required Scopes:** `webhook:manage`

**Request Body:**
```json
{
  "webhook_url": "https://your-app.com/webhook",
  "events": [
    "user.created",
    "user.updated", 
    "user.ranking_changed",
    "wechat.user_linked",
    "wechat.profile_synced",
    "match.completed"
  ],
  "secret": "your_webhook_secret_for_signature_verification"
}
```

**Response (200 OK):**
```json
{
  "api_version": "v1",
  "data": {
    "webhook_id": "wh_1632847293",
    "application_id": 123,
    "url": "https://your-app.com/webhook",
    "events": ["user.created", "user.ranking_changed"],
    "status": "active",
    "created_at": "2025-09-26T06:58:45.123Z",
    "sync_capabilities": {
      "real_time_user_updates": true,
      "ranking_notifications": true,
      "match_result_sync": true,
      "profile_change_alerts": true
    }
  }
}
```

### PATCH /api/v1/wechat/sync-user-profile

Synchronize user profile changes from WeChat app to Pickle+.

**Required Scopes:** `user:write`

**Request Body:**
```json
{
  "wechat_openid": "string (required if no pickle_user_id)",
  "pickle_user_id": "number (required if no wechat_openid)",
  "profile_updates": {
    "display_name": "string (optional)",
    "bio": "string (optional)",
    "skill_level": "string (optional, 'beginner'|'intermediate'|'advanced')",
    "playing_since": "string (optional, ISO date)",
    "equipment_preferences": {
      "paddle_brand": "string (optional)",
      "paddle_model": "string (optional)"
    },
    "skill_ratings": {
      "forehand": "number (optional, 1-10)",
      "backhand": "number (optional, 1-10)",
      "serve": "number (optional, 1-10)"
    }
  },
  "sync_timestamp": "string (optional, ISO timestamp)",
  "conflict_resolution": "string (optional, 'pickle_plus_wins'|'wechat_wins')"
}
```

**Response (200 OK):**
```json
{
  "api_version": "v1",
  "data": {
    "sync_status": "success",
    "user_id": 12345,
    "passport_code": "HVGN0BW0",
    "updated_fields": ["displayName", "bio", "skillLevel"],
    "profile_completion": 85,
    "sync_timestamp": "2025-09-26T06:58:45.123Z",
    "next_sync_eligible_at": "2025-09-26T06:59:45.123Z"
  }
}
```

### POST /api/v1/wechat/match-submit

Submit match data for processing by Pickle+ ranking algorithms.

**Required Scopes:** `match:write`, `ranking:advanced`

**Request Body:**
```json
{
  "match_data": {
    "match_type": "string (required, 'singles'|'doubles')",
    "duration_minutes": "number (optional)",
    "score": "array (optional, game scores)",
    "location": "string (optional)",
    "court_surface": "string (optional)"
  },
  "participants": [
    {
      "player_id": "number|string (required)",
      "wechat_openid": "string (required)",
      "previous_ranking": "number (optional)",
      "match_result": "string (required, 'win'|'loss')"
    }
  ],
  "wechat_openids": ["string (required, array of all participant openids)"],
  "tournament_context": {
    "tournament_id": "string (optional)",
    "bracket_progression": "string (optional)",
    "round": "string (optional)"
  }
}
```

**Response (200 OK):**
```json
{
  "api_version": "v1",
  "data": {
    "match_id": "pkl_1632847293",
    "processed_at": "2025-09-26T06:58:45.123Z",
    "participants": [
      {
        "wechat_openid": "participant_openid",
        "player_id": 12345,
        "ranking_update": {
          "previous_position": 150,
          "new_position": 142,
          "points_change": 25,
          "tier_change": null,
          "confidence_score": 0.95
        },
        "performance_summary": {
          "match_impact": "positive",
          "skill_development": "improving",
          "competitive_level": "appropriate"
        }
      }
    ],
    "ranking_table_updates": {
      "local_leaderboard_changes": true,
      "affected_rankings_count": 2,
      "recalculation_scope": "local"
    }
  }
}
```

## Webhook Events

### Event Types

**User Events:**
- `user.created` - New user registered
- `user.updated` - User profile updated
- `user.ranking_changed` - User ranking position changed

**WeChat-Specific Events:**
- `wechat.user_linked` - WeChat user linked to Pickle+ account
- `wechat.profile_synced` - Profile synchronized between systems

**Match Events:**
- `match.completed` - Match processing completed
- `match.rankings_updated` - Rankings updated after match

### Webhook Payload Format

All webhooks follow this structure:

```json
{
  "event": "user.created",
  "timestamp": "2025-09-26T06:58:45.123Z",
  "api_version": "v1",
  "data": {
    // Event-specific data
  }
}
```

### Webhook Security

Webhooks are secured with HMAC-SHA256 signatures:

**Headers:**
- `X-Pickle-Signature`: HMAC signature (format: `v1=<signature>`)
- `X-Pickle-Timestamp`: Unix timestamp of request

**Verification Example:**
```javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, timestamp, secret) {
  const [version, sig] = signature.split('=');
  
  if (version !== 'v1') return false;
  
  const signatureContent = `${version}.${timestamp}.${payload}`;
  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(signatureContent)
    .digest('hex');
    
  return crypto.timingSafeEqual(
    Buffer.from(sig),
    Buffer.from(expectedSig)
  );
}
```

## API Scopes

### Available Scopes

| Scope | Description |
|-------|-------------|
| `user:read` | Read user profile data |
| `user:write` | Create and update user profiles |
| `match:read` | Read match data |
| `match:write` | Submit match results |
| `ranking:basic` | Access basic ranking information |
| `ranking:advanced` | Access detailed ranking calculations |
| `webhook:manage` | Register and manage webhooks |
| `tournament:read` | Read tournament data |
| `tournament:write` | Submit tournament results |

### Scope Requirements by Endpoint

| Endpoint | Required Scopes |
|----------|----------------|
| `POST /wechat/register` | `user:write` |
| `POST /wechat/register-webhook` | `webhook:manage` |
| `PATCH /wechat/sync-user-profile` | `user:write` |
| `POST /wechat/match-submit` | `match:write`, `ranking:advanced` |

## Error Handling

### Standard Error Format

```json
{
  "error": "error_code",
  "error_description": "Human-readable description",
  "error_details": {
    // Additional context (optional)
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `unauthorized` | 401 | Missing or invalid API key |
| `invalid_api_key` | 401 | API key is not valid or revoked |
| `insufficient_scope` | 403 | API key lacks required permissions |
| `invalid_request` | 400 | Malformed request body or parameters |
| `user_already_exists` | 409 | User with openid already registered |
| `user_not_found` | 404 | User not found in system |
| `rate_limit_exceeded` | 429 | Too many requests |
| `server_error` | 500 | Internal server error |

## Rate Limiting

- **Rate Limits**: 1000 requests per hour per API key
- **Burst Allowance**: Up to 50 requests per minute
- **Headers**: Rate limit info included in response headers

## Integration Examples

### WeChat Mini-Program Integration

```javascript
// app.js
App({
  globalData: {
    pickleApiKey: 'your_api_key',
    pickleUserId: null,
    passportCode: null
  },
  
  async onLaunch() {
    // Initialize Pickle+ integration
    await this.initializePicklePlus();
  },
  
  async initializePicklePlus() {
    // Get WeChat user info
    const userInfo = await wx.getUserInfo();
    
    // Register with Pickle+
    const pickleUser = await this.registerWithPickle(userInfo);
    
    this.globalData.pickleUserId = pickleUser.user_id;
    this.globalData.passportCode = pickleUser.passport_code;
  },
  
  async registerWithPickle(wechatUserInfo) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: 'https://api.pickle.app/api/v1/wechat/register',
        method: 'POST',
        header: {
          'X-API-Key': this.globalData.pickleApiKey,
          'Content-Type': 'application/json'
        },
        data: {
          wechat_oauth_data: wechatUserInfo,
          registration_metadata: {
            source: 'wechat_miniprogram',
            app_version: '1.0.0'
          }
        },
        success: (res) => resolve(res.data.data),
        fail: reject
      });
    });
  }
});
```

### Match Result Submission

```javascript
// pages/match/match.js
Page({
  async submitMatchResult(matchData) {
    const app = getApp();
    
    const response = await wx.request({
      url: 'https://api.pickle.app/api/v1/wechat/match-submit',
      method: 'POST',
      header: {
        'X-API-Key': app.globalData.pickleApiKey,
        'Content-Type': 'application/json'
      },
      data: {
        match_data: {
          match_type: 'singles',
          duration_minutes: 45,
          score: [11, 9, 11, 7, 11, 5]
        },
        participants: [
          {
            player_id: app.globalData.pickleUserId,
            wechat_openid: wx.getStorageSync('openid'),
            match_result: 'win'
          },
          {
            player_id: matchData.opponentId,
            wechat_openid: matchData.opponentOpenid,
            match_result: 'loss'
          }
        ],
        wechat_openids: [
          wx.getStorageSync('openid'),
          matchData.opponentOpenid
        ]
      }
    });
    
    // Update local rankings with Pickle+ calculations
    this.updateLocalRankings(response.data.data.participants);
  },
  
  updateLocalRankings(participants) {
    participants.forEach(participant => {
      if (participant.wechat_openid === wx.getStorageSync('openid')) {
        // Update current user's ranking
        wx.setStorageSync('ranking_points', participant.ranking_update.new_position);
        wx.setStorageSync('points_change', participant.ranking_update.points_change);
      }
    });
  }
});
```

## SDKs and Libraries

### WeChat Mini-Program SDK

```javascript
// pickle-wechat-sdk.js
class PickleWeChatSDK {
  constructor(apiKey, baseUrl = 'https://api.pickle.app') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }
  
  async registerUser(wechatUserInfo, metadata = {}) {
    return this.request('POST', '/api/v1/wechat/register', {
      wechat_oauth_data: wechatUserInfo,
      registration_metadata: {
        source: 'wechat_miniprogram',
        ...metadata
      }
    });
  }
  
  async syncProfile(userId, profileUpdates) {
    return this.request('PATCH', '/api/v1/wechat/sync-user-profile', {
      pickle_user_id: userId,
      profile_updates: profileUpdates
    });
  }
  
  async submitMatch(matchData) {
    return this.request('POST', '/api/v1/wechat/match-submit', matchData);
  }
  
  async registerWebhook(webhookUrl, events, secret) {
    return this.request('POST', '/api/v1/wechat/register-webhook', {
      webhook_url: webhookUrl,
      events,
      secret
    });
  }
  
  request(method, endpoint, data) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${this.baseUrl}${endpoint}`,
        method,
        header: {
          'X-API-Key': this.apiKey,
          'Content-Type': 'application/json'
        },
        data,
        success: (res) => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(res.data);
          } else {
            reject(new Error(`API Error: ${res.data.error_description}`));
          }
        },
        fail: reject
      });
    });
  }
}

module.exports = PickleWeChatSDK;
```

## Testing

### Running Tests

```bash
# Run the comprehensive test suite
./tests/run-wechat-api-tests.js

# Run specific test files
npx jest tests/wechat-integration-api.test.js
npx jest tests/webhook-integration.test.js
```

### Test Coverage

The test suite covers:
- ✅ API endpoint functionality
- ✅ Webhook delivery and verification
- ✅ Error handling and edge cases
- ✅ Authentication and authorization
- ✅ Data validation and sanitization
- ✅ Performance and reliability

## Support and Resources

### Getting Help

- **API Documentation**: This document
- **Test Examples**: See `/tests/` directory
- **Integration Examples**: See examples above

### Best Practices

1. **Always verify webhook signatures** for security
2. **Handle API errors gracefully** with user-friendly messages
3. **Cache API responses** where appropriate to reduce calls
4. **Use appropriate scopes** - request only what you need
5. **Monitor rate limits** and implement backoff strategies
6. **Keep API keys secure** - never expose in client code

### Revenue Model

Pickle+ API usage is billed based on:
- **User Registration**: $0.01 per new user registration
- **Match Processing**: $0.05 per match submitted for ranking calculation
- **Webhook Deliveries**: $0.001 per webhook delivery
- **Advanced Analytics**: $0.10 per advanced ranking calculation

**Projected Revenue**: $10K-$1M monthly based on WeChat's 1B+ user potential

---

*This documentation is for Pickle+ WeChat Integration API v1. For updates and changes, please refer to the API changelog.*