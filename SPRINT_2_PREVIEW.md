# Sprint 2: Curriculum Integration & Student Progress Tracking

## Sprint 1 → Sprint 2 Transition

### Sprint 1 Complete ✅
**Foundation Infrastructure Built**
- Complete CRUD curriculum management system
- 39 authentic PCP drills with video integration
- Full backend API and database schema
- Comprehensive frontend interface with search/filter

### Sprint 2 Objectives 🎯
**Integration & Student Progress Tracking**

## Sprint 2 Phase Breakdown

### Phase 1: Production Integration (Week 1)
**Move from Demo to Production**
- Migrate `/curriculum-management-demo` → `/coach/curriculum`
- Update coach navigation to include drill library
- Add coach authentication requirements
- Integrate with existing coach dashboard

**Key Integration Points:**
```javascript
// Coach Navigation Update
const coachNavItems = [
  { label: "Dashboard", path: "/coach" },
  { label: "My Students", path: "/coach/students" },
  { label: "Drill Library", path: "/coach/curriculum" }, // NEW - Sprint 1 System
  { label: "Session Planning", path: "/coach/sessions" }, // NEW - Sprint 2
  { label: "Student Progress", path: "/coach/progress" }, // NEW - Sprint 2
  { label: "Assessments", path: "/coach/assessments" }
];
```

### Phase 2: Session Planning Integration (Week 2)
**Connect Curriculum to Coaching Workflow**
- Add "Select for Session" buttons to drill cards
- Create lesson planning interface
- Build session templates using curriculum drills
- Coach can assign specific drills to upcoming sessions

**New Features:**
- Session planning dashboard
- Drill selection for lessons
- Template creation and reuse
- Session scheduling with drill assignments

### Phase 3: Student Progress Tracking (Week 3)
**Link Drills to Student Development**
- Track which drills students complete
- Record performance ratings per drill
- Generate progress reports
- Connect drill difficulty to student skill levels

**Database Extensions:**
```sql
-- New tables for Sprint 2
CREATE TABLE student_drill_completions (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES users(id),
  drill_id INTEGER REFERENCES drill_library(id),
  coach_id INTEGER REFERENCES users(id),
  session_id INTEGER,
  performance_rating DECIMAL(3,1), -- PCP scale 2.0-8.0
  completion_date TIMESTAMP,
  coach_notes TEXT,
  improvement_areas TEXT[]
);

CREATE TABLE session_drill_assignments (
  id SERIAL PRIMARY KEY,
  session_id INTEGER,
  drill_id INTEGER REFERENCES drill_library(id),
  order_sequence INTEGER,
  allocated_minutes INTEGER,
  objectives TEXT
);
```

## Sprint 2 Success Metrics

### Phase 1 Metrics
- ✅ Curriculum accessible via `/coach/curriculum`
- ✅ Coach navigation includes drill library
- ✅ Authentication integrated
- ✅ Zero disruption to existing coach features

### Phase 2 Metrics
- 📊 80% of coaches access drill library within first week
- 📊 60% of planned sessions include curriculum drills
- 📊 Average 4+ drills selected per session plan

### Phase 3 Metrics
- 📊 50% of student progress updates reference specific drills
- 📊 Coach retention increases due to comprehensive tracking tools
- 📊 Student progression data shows correlation with drill completion

## Technical Implementation Strategy

### Week 1: Route Migration
```javascript
// 1. Update App.tsx routing
<Route path="/coach/curriculum" component={CurriculumManagement} />

// 2. Add to coach navigation
import { BookOpen } from 'lucide-react';
const curriculumNavItem = {
  icon: BookOpen,
  label: "Drill Library",
  path: "/coach/curriculum"
};

// 3. Add authentication middleware
app.get('/coach/curriculum*', requireCoachAuth, serveStatic);
```

### Week 2: Session Planning
```javascript
// New session planning API endpoints
app.post('/api/coach/sessions/plan', createSessionPlan);
app.get('/api/coach/sessions/:id/drills', getSessionDrills);
app.patch('/api/coach/sessions/:id/add-drill', addDrillToSession);
```

### Week 3: Progress Tracking
```javascript
// Student progress tracking endpoints
app.post('/api/coach/students/:id/drill-completion', recordDrillCompletion);
app.get('/api/coach/students/:id/progress', getStudentProgress);
app.get('/api/coach/students/:id/drill-history', getDrillCompletionHistory);
```

## Integration Architecture

```
┌─────────────────────────────────────────────────────┐
│                    SPRINT 2 SCOPE                  │
├─────────────────────────────────────────────────────┤
│  Production Integration (Phase 1)                  │
│  ├── /coach/curriculum (from demo)                 │
│  ├── Coach navigation updates                      │
│  └── Authentication integration                    │
├─────────────────────────────────────────────────────┤
│  Session Planning (Phase 2)                        │
│  ├── Drill selection interface                     │
│  ├── Lesson planning tools                         │
│  └── Session templates                             │
├─────────────────────────────────────────────────────┤
│  Student Progress (Phase 3)                        │
│  ├── Drill completion tracking                     │
│  ├── Performance recording                         │
│  └── Progress visualization                        │
└─────────────────────────────────────────────────────┘
```

## Sprint 1 Foundation Enables Sprint 2

The complete CRUD curriculum system from Sprint 1 provides:
- **Drill Library**: 39 authenticated PCP drills ready for assignment
- **Search & Filter**: Coaches can quickly find appropriate drills
- **PCP Integration**: Drill difficulty aligns with student skill levels
- **Video Demos**: Rich learning resources for both coaches and students
- **Backend APIs**: All CRUD operations available for integration

## Next Immediate Steps

1. **Phase 1 Kickoff**: Migrate curriculum demo to production coach interface
2. **Coach Testing**: Validate navigation and authentication integration
3. **Session Planning Design**: Create wireframes for drill selection interface
4. **Database Planning**: Design student progress tracking schema extensions

Sprint 2 transforms the Sprint 1 foundation into an integrated coaching ecosystem where curriculum management becomes the core of effective coaching workflow.