# Sprint 3 Phase 1: CI/CD Testing Routes
## Assessment-Goal Integration Test Routes

### Test Environment Setup
- Base URL: `http://localhost:5000` (or deployed URL)
- Authentication: All routes require coach authentication
- Test Coach ID: Use existing coach account or create test coach
- Test Student ID: Use existing student data from Sprint 2

---

## PHASE 1 TEST ROUTES (Days 1-2)

### 1. Assessment Data Integration Tests

#### GET /api/coach/assessments/:studentId/latest
**Purpose**: Retrieve most recent assessment for a student  
**Test Cases**:
```bash
# Test Case 1: Valid student with assessments
curl -X GET "http://localhost:5000/api/coach/assessments/1/latest" \
  -H "Authorization: Bearer $COACH_TOKEN" \
  -H "Content-Type: application/json"

# Expected Response:
{
  "success": true,
  "data": {
    "id": 123,
    "student_id": 1,
    "technical_rating": 45,
    "tactical_rating": 52,
    "physical_rating": 38,
    "mental_rating": 41,
    "assessment_date": "2025-07-28T...",
    "coach_notes": "..."
  }
}

# Test Case 2: Student with no assessments
curl -X GET "http://localhost:5000/api/coach/assessments/999/latest" \
  -H "Authorization: Bearer $COACH_TOKEN"

# Expected Response:
{
  "error": "No assessments found for this student"
}
```

#### GET /api/coach/assessments/:studentId/trends
**Purpose**: Get assessment trends over time  
**Test Cases**:
```bash
# Test Case 1: 6-month trends (default)
curl -X GET "http://localhost:5000/api/coach/assessments/1/trends" \
  -H "Authorization: Bearer $COACH_TOKEN"

# Test Case 2: Custom timeframe
curl -X GET "http://localhost:5000/api/coach/assessments/1/trends?timeframe=3months" \
  -H "Authorization: Bearer $COACH_TOKEN"

# Expected Response:
{
  "success": true,
  "data": [
    {
      "dimension": "technical",
      "trend_direction": "improving",
      "starting_rating": 40,
      "ending_rating": 45,
      "average_improvement": 1.25,
      "assessment_count": 4
    }
  ]
}
```

#### GET /api/coach/assessments/:id/weak-areas
**Purpose**: Detailed weakness analysis from assessment  
**Test Cases**:
```bash
# Test Case 1: Assessment with identified weak areas
curl -X GET "http://localhost:5000/api/coach/assessments/123/weak-areas" \
  -H "Authorization: Bearer $COACH_TOKEN"

# Expected Response:
{
  "success": true,
  "data": {
    "assessmentId": 123,
    "overallRating": 44,
    "weakAreas": [
      {
        "dimension": "physical",
        "currentRating": 38,
        "targetRating": 53,
        "priority": "high",
        "suggestedGoal": "Build physical conditioning from 38/80 to 53/80",
        "improvementPotential": 15
      }
    ],
    "improvementPotential": 25
  }
}
```

#### POST /api/coach/assessments/:id/generate-goals
**Purpose**: Generate goals from assessment data  
**Test Cases**:
```bash
# Test Case 1: Generate goals from weak areas
curl -X POST "http://localhost:5000/api/coach/assessments/123/generate-goals" \
  -H "Authorization: Bearer $COACH_TOKEN" \
  -H "Content-Type: application/json"

# Expected Response:
{
  "success": true,
  "data": [
    {
      "title": "Improve Physical Skills",
      "description": "Build physical conditioning from 38/80 to 53/80",
      "category": "physical",
      "targetImprovement": 15,
      "difficulty": "intermediate",
      "estimatedDuration": "8 weeks",
      "milestones": [
        {
          "title": "Physical Milestone 1",
          "description": "Build foundational fitness and movement efficiency",
          "targetRating": 42,
          "orderIndex": 1,
          "validationCriteria": "Achieve 42/80 physical fitness benchmarks"
        }
      ]
    }
  ]
}
```

---

## AUTOMATED TEST VALIDATION

### Test Script: Phase 1 Route Validation
```bash
#!/bin/bash
# Sprint 3 Phase 1 Route Testing Script

echo "🧪 Sprint 3 Phase 1: Assessment-Goal Integration Tests"
echo "================================================="

# Set test environment
BASE_URL="http://localhost:5000"
STUDENT_ID=1
ASSESSMENT_ID=123

echo "📊 Testing Assessment Data Integration Routes..."

# Test 1: Latest Assessment
echo "Test 1: GET latest assessment"
response1=$(curl -s -X GET "$BASE_URL/api/coach/assessments/$STUDENT_ID/latest" \
  -H "Authorization: Bearer $COACH_TOKEN")
echo "Response: $response1"

# Test 2: Assessment Trends
echo "Test 2: GET assessment trends"
response2=$(curl -s -X GET "$BASE_URL/api/coach/assessments/$STUDENT_ID/trends" \
  -H "Authorization: Bearer $COACH_TOKEN")
echo "Response: $response2"

# Test 3: Weak Areas Analysis
echo "Test 3: GET weak areas analysis"
response3=$(curl -s -X GET "$BASE_URL/api/coach/assessments/$ASSESSMENT_ID/weak-areas" \
  -H "Authorization: Bearer $COACH_TOKEN")
echo "Response: $response3"

# Test 4: Generate Goals
echo "Test 4: POST generate goals"
response4=$(curl -s -X POST "$BASE_URL/api/coach/assessments/$ASSESSMENT_ID/generate-goals" \
  -H "Authorization: Bearer $COACH_TOKEN" \
  -H "Content-Type: application/json")
echo "Response: $response4"

echo "✅ Phase 1 Route Testing Complete"
```

---

## CI/CD VALIDATION CRITERIA

### Success Criteria for Phase 1
- [ ] All 4 API endpoints return 200 status codes
- [ ] Latest assessment endpoint returns valid assessment data
- [ ] Trends endpoint returns temporal analysis data
- [ ] Weak areas analysis identifies improvement opportunities
- [ ] Goal generation creates actionable recommendations
- [ ] All responses follow consistent JSON structure
- [ ] Error handling returns appropriate 404/500 status codes
- [ ] Authentication properly validates coach access

### Performance Benchmarks
- [ ] All endpoints respond within 500ms
- [ ] Assessment analysis completes within 2 seconds
- [ ] Goal generation produces 2-4 recommendations
- [ ] Database queries use proper indexing
- [ ] Memory usage remains stable during testing

### Data Integrity Checks
- [ ] Assessment ratings maintain 0-80 PCP scale
- [ ] Weak area priorities correctly calculated
- [ ] Goal recommendations include valid milestones
- [ ] Trends show proper temporal progression
- [ ] All foreign key relationships maintained

---

## NEXT PHASE PREPARATION

### Phase 2 Readiness Checklist
After Phase 1 testing passes:
- [ ] Database schema updated with new tables
- [ ] Assessment analysis service operational
- [ ] Goal recommendation engine functional
- [ ] Storage interface extended with new methods
- [ ] Route registration completed in main routes.ts

### Phase 2 Routes Preview
Next phase will test:
- `POST /api/coach/goals/from-assessment` - Create goals from insights
- `GET /api/coach/goals/:id/assessment-link` - Get assessment links
- `PUT /api/coach/goals/:id/progress-update` - Update progress
- `GET /api/coach/goals/analytics/:studentId` - Goal analytics

---

**Test Execution Date**: July 28, 2025  
**Expected Phase 1 Completion**: July 29, 2025  
**CI/CD Framework**: Automated route testing with performance validation