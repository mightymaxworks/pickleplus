# Pickle+ Coaching API Documentation
*PKL-278651-API-0002-COACHING*

## Overview

The Pickle+ Coaching API enables external applications to access and integrate with our comprehensive coaching ecosystem. External WeChat apps and other platforms can discover coaches, book sessions, manage relationships, and access educational content through secure, protected endpoints.

**Key Benefits:**
- Access to 400+ certified PCP coaches across 5 levels
- Real-time session booking and availability management  
- Comprehensive coach verification and trust indicators
- Educational content library with 150+ drills and lessons
- Performance analytics and optimization insights
- Webhook notifications for all coaching events

---

## Quick Start Guide

### 1. Authentication Setup

All Coaching API endpoints require proper authentication with appropriate scopes:

```javascript
// Required headers for all requests
headers: {
  'Authorization': 'Bearer YOUR_API_KEY',
  'Content-Type': 'application/json',
  'X-API-Version': 'v1'
}

// Required scopes
- coaching:read   // Access coach profiles, content, analytics
- coaching:write  // Book sessions, submit assessments, create connections
```

### 2. Basic Integration Example

```javascript
// 1. Discover coaches in user's area
const coaches = await fetch('/api/v1/coaching/discover?location=Seattle&radius=25', {
  headers: { 'Authorization': 'Bearer YOUR_API_KEY' }
});

// 2. Get detailed coach profile
const coachProfile = await fetch('/api/v1/coaching/coach/123', {
  headers: { 'Authorization': 'Bearer YOUR_API_KEY' }
});

// 3. Check coach availability
const availability = await fetch('/api/v1/coaching/coach/123/availability?start_date=2024-01-15', {
  headers: { 'Authorization': 'Bearer YOUR_API_KEY' }
});

// 4. Book a coaching session
const booking = await fetch('/api/v1/coaching/book-session', {
  method: 'POST',
  headers: { 
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    slot_id: 456,
    student_info: {
      skill_level: 'intermediate',
      goals: 'Improve third shot drop',
      emergency_contact: '+1234567890'
    },
    wechat_user_id: 'wx_user_123',
    payment_method: 'wechat_pay'
  })
});
```

---

## Core API Endpoints

### 1. Coach Discovery & Search

#### `GET /api/v1/coaching/discover`

Discover and filter coaches based on location, specialties, and preferences.

**Query Parameters:**
```
location         // Location name or city (optional)
radius          // Search radius in miles (default: 25)
specialties     // Comma-separated specialties (optional)
price_min       // Minimum hourly rate (optional)
price_max       // Maximum hourly rate (optional)
rating_min      // Minimum average rating 0-5 (default: 0)
skill_levels    // Target skill levels (optional)
session_types   // Preferred session types (optional)
pcp_level       // PCP certification level 1-5 (optional)
sort_by         // rating|price_low|price_high|sessions (default: rating)
limit           // Results limit (default: 20, max: 50)
offset          // Pagination offset (default: 0)
```

**Example Response:**
```json
{
  "api_version": "v1",
  "data": {
    "coaches": [
      {
        "coach_id": 123,
        "display_name": "Sarah Johnson",
        "tagline": "Master the mental game",
        "specialties": ["mental_training", "strategy", "tournament_prep"],
        "location": "Seattle, WA",
        "pricing": {
          "hourly_rate": 95.00,
          "package_rates": [
            {
              "session_count": 4,
              "price": 340.00,
              "description": "Monthly package"
            }
          ]
        },
        "ratings": {
          "average_rating": 4.8,
          "total_reviews": 127,
          "total_sessions": 342
        },
        "credentials": {
          "pcp_level": 4,
          "verification_level": "verified",
          "certification_number": "PCP-4-2024-0892"
        },
        "teaching_profile": {
          "teaching_style": {
            "approach": "mental",
            "intensity": "moderate", 
            "focus": "all-levels"
          },
          "response_time_hours": 2
        },
        "features": {
          "is_premium_listed": true,
          "instant_booking": true
        }
      }
    ],
    "search_metadata": {
      "total_results": 15,
      "search_parameters": {
        "location": "Seattle",
        "radius": 25,
        "sort_by": "rating"
      },
      "pagination": {
        "limit": 20,
        "offset": 0,
        "has_more": false
      }
    }
  }
}
```

### 2. Coach Profile Details

#### `GET /api/v1/coaching/coach/{coachId}`

Get comprehensive profile information for a specific coach.

**Example Response:**
```json
{
  "api_version": "v1",
  "data": {
    "coach_id": 123,
    "user_id": 456,
    "basic_info": {
      "display_name": "Sarah Johnson",
      "username": "sarahj_coach",
      "tagline": "Master the mental game",
      "profile_image": "https://cdn.pickle.app/profiles/sarah.jpg",
      "location": "Seattle, WA",
      "service_radius": 25
    },
    "credentials": {
      "pcp_level": 4,
      "pcp_certification_number": "PCP-4-2024-0892",
      "verification_level": "verified",
      "certified_since": "2024-03-15T00:00:00Z",
      "specializations": ["mental_training", "strategy", "tournament_prep"]
    },
    "teaching": {
      "teaching_style": {
        "approach": "mental",
        "intensity": "moderate",
        "focus": "all-levels"
      },
      "coaching_philosophy": "Empower players through mental resilience and strategic thinking",
      "player_preferences": {
        "age_groups": ["adult", "senior"],
        "skill_levels": ["intermediate", "advanced"],
        "session_types": ["individual", "small_group"]
      },
      "languages_spoken": ["English", "Spanish"]
    },
    "pricing": {
      "hourly_rate": 95.00,
      "package_rates": [
        {
          "session_count": 4,
          "price": 340.00,
          "description": "Monthly package with 10% discount"
        }
      ],
      "session_types": ["individual", "assessment", "strategy"]
    },
    "performance": {
      "average_rating": 4.8,
      "total_reviews": 127,
      "total_sessions": 342,
      "retention_rate": 0.85,
      "profile_views": 1240
    },
    "features": {
      "is_discoverable": true,
      "is_premium_listed": true,
      "instant_booking": true,
      "verified_coach": true
    }
  }
}
```

### 3. Coach Availability

#### `GET /api/v1/coaching/coach/{coachId}/availability`

Get real-time availability for booking sessions with a coach.

**Query Parameters:**
```
start_date      // Start date YYYY-MM-DD (optional, default: today)
end_date        // End date YYYY-MM-DD (optional, default: +30 days)
session_type    // individual|group|clinic|assessment (optional)
```

**Example Response:**
```json
{
  "api_version": "v1",
  "data": {
    "coach_id": 123,
    "availability_period": {
      "start_date": "2024-01-15",
      "end_date": "2024-02-14"
    },
    "available_slots": [
      {
        "slot_id": 789,
        "session_details": {
          "date": "2024-01-16",
          "start_time": "2024-01-16T10:00:00Z",
          "end_time": "2024-01-16T11:00:00Z", 
          "duration_minutes": 60
        },
        "session_info": {
          "type": "individual",
          "skill_level": "intermediate",
          "focus": "Strategy & positioning",
          "location": "Pine Lake Tennis Center",
          "court_number": "Court 3"
        },
        "capacity": {
          "max_students": 1,
          "current_bookings": 0,
          "spots_available": 1
        },
        "pricing": {
          "price_per_student": 95.00,
          "total_session_cost": 95.00
        },
        "booking_status": {
          "is_available": true,
          "urgency": "available"
        }
      }
    ],
    "summary": {
      "total_slots": 18,
      "session_types": ["individual", "assessment"],
      "price_range": {
        "min": 85.00,
        "max": 120.00
      },
      "earliest_available": "2024-01-16T10:00:00Z",
      "booking_options": {
        "instant_booking": true,
        "advance_booking_days": 30,
        "cancellation_policy": "24_hours"
      }
    }
  }
}
```

### 4. Session Booking

#### `POST /api/v1/coaching/book-session`

Book a coaching session with a specific coach.

**Request Body:**
```json
{
  "slot_id": 789,
  "student_info": {
    "skill_level": "intermediate",
    "goals": "Improve third shot drop and court positioning",
    "medical_notes": "No physical limitations",
    "emergency_contact": "+1-555-123-4567"
  },
  "wechat_user_id": "wx_user_abc123",
  "payment_method": "wechat_pay",
  "special_requests": "Prefer outdoor courts if available"
}
```

**Example Response:**
```json
{
  "api_version": "v1",
  "data": {
    "booking_id": 1001,
    "status": "confirmed",
    "session_details": {
      "date": "2024-01-16",
      "start_time": "2024-01-16T10:00:00Z",
      "end_time": "2024-01-16T11:00:00Z",
      "location": "Pine Lake Tennis Center",
      "court_number": "Court 3"
    },
    "coach_info": {
      "coach_id": 123,
      "session_type": "individual",
      "focus": "Strategy & positioning"
    },
    "payment_info": {
      "amount_paid": 95.00,
      "payment_status": "pending",
      "payment_method": "wechat_pay"
    },
    "booking_confirmation": {
      "confirmation_code": "PKL-001001",
      "booking_time": "2024-01-15T14:30:00Z",
      "cancellation_deadline": "2024-01-15T10:00:00Z"
    }
  }
}
```

### 5. Coach Verification

#### `GET /api/v1/coaching/verify/{coachId}`

Verify coach credentials and certification status.

**Example Response:**
```json
{
  "api_version": "v1",
  "data": {
    "coach_id": 123,
    "verification_status": {
      "is_verified": true,
      "verification_level": "verified",
      "is_active": true,
      "coach_type": "certified-pcp"
    },
    "pcp_certification": {
      "is_pcp_certified": true,
      "pcp_level": 4,
      "certification_number": "PCP-4-2024-0892",
      "certified_since": "2024-03-15T00:00:00Z",
      "expires_at": "2025-03-15T00:00:00Z",
      "is_expired": false,
      "completed_levels": [1, 2, 3, 4]
    },
    "subscription_status": {
      "tier": "premium",
      "is_active": true,
      "expires_at": "2024-12-31T23:59:59Z"
    },
    "performance_metrics": {
      "total_sessions": 342,
      "average_rating": 4.8,
      "total_reviews": 127,
      "experience_level": "experienced"
    },
    "trust_indicators": {
      "background_checked": true,
      "certification_verified": true,
      "performance_rating": "excellent",
      "platform_experience": true
    }
  }
}
```

### 6. Coach Assessment & Rating

#### `POST /api/v1/coaching/assess/{coachId}`

Submit assessment and rating for a coach after a session.

**Request Body:**
```json
{
  "student_wechat_id": "wx_user_abc123",
  "booking_id": 1001,
  "rating": 5,
  "technical_skills": 5,
  "communication": 4,
  "reliability": 5,
  "value_for_money": 4,
  "review_title": "Excellent strategy session",
  "review_content": "Sarah helped me understand court positioning much better. Her mental game tips were invaluable.",
  "tags": ["strategic", "patient", "knowledgeable"],
  "session_date": "2024-01-16"
}
```

**Example Response:**
```json
{
  "api_version": "v1",
  "data": {
    "assessment_id": "assess_1642358400000",
    "coach_id": 123,
    "student_id": 456,
    "booking_id": 1001,
    "ratings": {
      "overall_rating": 5,
      "technical_skills": 5,
      "communication": 4,
      "reliability": 5,
      "value_for_money": 4
    },
    "review": {
      "title": "Excellent strategy session",
      "content": "Sarah helped me understand court positioning much better...",
      "tags": ["strategic", "patient", "knowledgeable"]
    },
    "assessment_metadata": {
      "session_date": "2024-01-16",
      "submitted_at": "2024-01-16T18:30:00Z",
      "is_verified": true,
      "platform": "wechat_integration"
    },
    "coach_impact": {
      "contributes_to_average": true,
      "affects_discovery_ranking": true,
      "triggers_performance_review": false
    }
  }
}
```

### 7. Student-Coach Connections

#### `POST /api/v1/coaching/connect`

Create a connection between student and coach for ongoing coaching relationship.

**Request Body:**
```json
{
  "student_wechat_id": "wx_user_abc123",
  "coach_id": 123,
  "connection_type": "ongoing",
  "message": "I'd like to work with you on improving my tournament game"
}
```

**Example Response:**
```json
{
  "api_version": "v1",
  "data": {
    "connection_id": "conn_1642358400000",
    "student_id": 456,
    "coach_id": 123,
    "connection_type": "ongoing",
    "status": "pending",
    "created_at": "2024-01-15T14:30:00Z",
    "connection_features": {
      "progress_tracking": true,
      "goal_setting": true,
      "session_history": true,
      "direct_messaging": true
    },
    "next_steps": {
      "student_action": "Wait for coach approval",
      "coach_notification": "sent",
      "estimated_response_time": "24 hours"
    }
  }
}
```

### 8. Coaching Content & Drills

#### `GET /api/v1/coaching/content`

Access coaching drills and educational content library.

**Query Parameters:**
```
category        // technical|tactical|physical|mental (optional)
skill_level     // beginner|intermediate|advanced|professional (optional)
drill_type      // individual|group|assessment (optional)
coach_id        // Filter by specific coach's content (optional)
limit           // Results limit (default: 20)
search          // Search terms (optional)
```

**Example Response:**
```json
{
  "api_version": "v1",
  "data": {
    "content_categories": {
      "drills": {
        "total_count": 150,
        "categories": ["technical", "tactical", "physical", "mental"],
        "skill_levels": ["beginner", "intermediate", "advanced", "professional"]
      },
      "video_lessons": {
        "total_count": 75,
        "categories": ["fundamentals", "strategy", "equipment", "rules"]
      },
      "assessment_templates": {
        "total_count": 25,
        "types": ["skill_evaluation", "progress_tracking", "goal_setting"]
      }
    },
    "featured_content": [
      {
        "content_id": "drill_001",
        "title": "Third Shot Drop Mastery",
        "description": "Perfect your third shot drop with progressive difficulty levels",
        "category": "technical",
        "skill_level": "intermediate",
        "duration_minutes": 30,
        "equipment_needed": ["balls", "cones"],
        "coach_rating": 4.8,
        "usage_count": 1250
      }
    ],
    "access_features": {
      "coach_customization": true,
      "progress_tracking": true,
      "skill_assessment": true,
      "content_filtering": true,
      "offline_download": false
    }
  }
}
```

### 9. Coach Performance Analytics

#### `GET /api/v1/coaching/analytics/{coachId}`

Get performance analytics and insights for a coach.

**Query Parameters:**
```
period                    // 7d|30d|90d|1y (default: 30d)
include_detailed_metrics  // true|false (default: false)
```

**Example Response:**
```json
{
  "api_version": "v1",
  "data": {
    "coach_id": 123,
    "analytics_period": "30d",
    "performance_summary": {
      "total_sessions": 342,
      "total_earnings": 32490.00,
      "average_rating": 4.8,
      "total_reviews": 127,
      "pcp_level": 4
    },
    "growth_metrics": {
      "sessions_growth": "+12%",
      "rating_trend": "stable",
      "earnings_growth": "+8%",
      "student_retention": "85%"
    },
    "teaching_effectiveness": {
      "student_improvement_rate": 4.2,
      "session_completion_rate": 0.96,
      "rebooking_rate": 0.73,
      "recommendation_score": 4.6
    },
    "market_position": {
      "ranking_in_area": 15,
      "total_coaches_in_area": 127,
      "competitiveness_score": 78,
      "demand_level": "high"
    },
    "optimization_insights": [
      {
        "category": "pricing",
        "insight": "Your rates are 15% below market average for PCP Level 4",
        "impact": "potential_revenue_increase",
        "confidence": 0.87
      }
    ]
  }
}
```

---

## Webhook Notifications

The Coaching API sends webhook notifications for key coaching events. Configure webhook URLs in your developer dashboard.

### Webhook Events

#### `session_booked`
Triggered when a student books a coaching session.

```json
{
  "event": "session_booked",
  "timestamp": "2024-01-15T14:30:00Z",
  "data": {
    "booking_id": 1001,
    "student_user_id": 456,
    "coach_id": 123,
    "session_date": "2024-01-16T10:00:00Z",
    "amount_paid": 95.00,
    "booking_status": "confirmed"
  }
}
```

#### `coach_assessed`
Triggered when a student submits a coach assessment.

```json
{
  "event": "coach_assessed",
  "timestamp": "2024-01-16T18:30:00Z",
  "data": {
    "coach_id": 123,
    "student_user_id": 456,
    "overall_rating": 5,
    "booking_id": 1001,
    "assessment_data": {
      "technical_skills": 5,
      "communication": 4,
      "reliability": 5,
      "value_for_money": 4
    }
  }
}
```

#### `coach_connection_requested`
Triggered when a student requests an ongoing coaching relationship.

```json
{
  "event": "coach_connection_requested",
  "timestamp": "2024-01-15T14:30:00Z",
  "data": {
    "student_user_id": 456,
    "coach_id": 123,
    "connection_type": "ongoing",
    "request_message": "I'd like to work with you on improving my tournament game"
  }
}
```

---

## Error Handling

### Standard Error Response Format

```json
{
  "error": "error_code",
  "error_description": "Human-readable error description",
  "details": {
    "field": "specific_field_error"
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `insufficient_scope` | 403 | API key lacks required coaching scopes |
| `coach_not_found` | 404 | Specified coach does not exist |
| `slot_not_found` | 404 | Booking slot does not exist |
| `slot_unavailable` | 409 | Booking slot is no longer available |
| `student_not_found` | 404 | WeChat user not found in system |
| `invalid_rating` | 400 | Rating value outside 1-5 range |
| `booking_error` | 500 | Internal error during booking process |
| `assessment_error` | 500 | Error submitting coach assessment |

---

## Rate Limits & Usage

### Rate Limits
- **Discovery**: 100 requests/minute
- **Booking**: 10 requests/minute  
- **Assessment**: 20 requests/minute
- **Analytics**: 50 requests/minute

### Usage Analytics
All API usage is tracked and available in your developer dashboard:
- Request volume and patterns
- Response times and error rates
- Most popular endpoints
- Geographic usage distribution

---

## SDK Examples

### WeChat Mini-Program Integration

```javascript
// WeChat Mini-Program SDK Example
const PickleCoachingAPI = {
  baseURL: 'https://api.pickle.app/api/v1/coaching',
  apiKey: 'your_api_key_here',
  
  async discoverCoaches(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    const response = await wx.request({
      url: `${this.baseURL}/discover?${params}`,
      header: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  },
  
  async bookSession(bookingData) {
    const response = await wx.request({
      url: `${this.baseURL}/book-session`,
      method: 'POST',
      header: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      data: bookingData
    });
    return response.data;
  },
  
  async submitAssessment(coachId, assessmentData) {
    const response = await wx.request({
      url: `${this.baseURL}/assess/${coachId}`,
      method: 'POST',
      header: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      data: assessmentData
    });
    return response.data;
  }
};

// Example usage
const coaches = await PickleCoachingAPI.discoverCoaches({
  location: 'Shanghai',
  radius: 20,
  skill_levels: 'intermediate,advanced',
  sort_by: 'rating'
});
```

---

## Support & Resources

### Developer Support
- **Documentation**: https://docs.pickle.app/coaching-api
- **Developer Forum**: https://community.pickle.app/developers
- **Support Email**: developers@pickle.app
- **Status Page**: https://status.pickle.app

### Integration Checklist
- [ ] Obtain API keys with coaching scopes
- [ ] Implement coach discovery and search
- [ ] Set up session booking workflow
- [ ] Configure webhook endpoints
- [ ] Test assessment submission
- [ ] Implement error handling
- [ ] Add analytics tracking

---

## Changelog

### v1.0.0 (2024-01-15)
- Initial release of Coaching API
- Coach discovery and profile endpoints
- Session booking and availability management
- Coach verification and assessment systems
- Student-coach relationship management
- Educational content access
- Performance analytics and insights
- Comprehensive webhook notifications

---

*Built with ❤️ by the Pickle+ team. Empowering the pickleball coaching ecosystem through technology.*