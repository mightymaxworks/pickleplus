# PickleJourney™ Database Schema

This document outlines the comprehensive database schema for the PickleJourney™ journaling system, designed to support players, coaches, and referees in documenting their pickleball journeys.

## Core Tables

### journal_entries

Central table for all journal entries across user types.

```sql
CREATE TABLE journal_entries (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    entry_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    entry_type VARCHAR(50) NOT NULL, -- match, practice, reflection, coaching, officiating, etc.
    user_role VARCHAR(20) NOT NULL, -- player, coach, referee
    title VARCHAR(255),
    content TEXT,
    mood_rating INTEGER CHECK (mood_rating BETWEEN 1 AND 5),
    energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 5),
    visibility VARCHAR(50) DEFAULT 'private', -- private, coach, public
    is_milestone BOOLEAN DEFAULT false,
    sentiment_score DECIMAL(3,2), -- AI-analyzed sentiment (-1.0 to 1.0)
    tagged_users JSONB, -- Array of user IDs mentioned in entry
    location TEXT,
    context_json JSONB, -- Additional contextual data
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### journal_tags

Tags for categorizing and filtering journal entries.

```sql
CREATE TABLE journal_tags (
    id SERIAL PRIMARY KEY,
    entry_id INTEGER NOT NULL REFERENCES journal_entries(id),
    tag_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_journal_tags_entry_id ON journal_tags(entry_id);
CREATE INDEX idx_journal_tags_tag_name ON journal_tags(tag_name);
```

### journal_media

Media attachments for journal entries (images, videos, audio).

```sql
CREATE TABLE journal_media (
    id SERIAL PRIMARY KEY,
    entry_id INTEGER NOT NULL REFERENCES journal_entries(id),
    media_type VARCHAR(50) NOT NULL, -- image, video, audio
    file_path TEXT NOT NULL,
    thumbnail_path TEXT,
    title VARCHAR(255),
    description TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    duration_seconds INTEGER, -- For video/audio
    start_timestamp INTEGER, -- For video clips, milliseconds from start
    end_timestamp INTEGER, -- For video clips, milliseconds from start
    annotations_json JSONB, -- For marked up media
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_journal_media_entry_id ON journal_media(entry_id);
```

### journal_comments

Comments and annotations on journal entries.

```sql
CREATE TABLE journal_comments (
    id SERIAL PRIMARY KEY,
    entry_id INTEGER NOT NULL REFERENCES journal_entries(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    comment_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_annotation BOOLEAN DEFAULT false, -- true if it's a specific annotation vs a general comment
    annotation_context JSONB -- Additional context for annotations (e.g., highlighted text)
);

CREATE INDEX idx_journal_comments_entry_id ON journal_comments(entry_id);
```

## Player-Specific Tables

### player_match_journals

Match-specific journal details for players.

```sql
CREATE TABLE player_match_journals (
    id SERIAL PRIMARY KEY,
    entry_id INTEGER NOT NULL REFERENCES journal_entries(id),
    match_id INTEGER REFERENCES matches(id), -- Can be null for practice matches
    score_json JSONB, -- Match score details
    opponent_id INTEGER REFERENCES users(id), -- Can be null
    partner_id INTEGER REFERENCES users(id), -- Can be null for singles
    pre_match_goals TEXT, -- Goals set before the match
    post_match_reflection TEXT, -- Reflection after the match
    technical_rating INTEGER CHECK (technical_rating BETWEEN 1 AND 5),
    tactical_rating INTEGER CHECK (tactical_rating BETWEEN 1 AND 5),
    physical_rating INTEGER CHECK (physical_rating BETWEEN 1 AND 5),
    mental_rating INTEGER CHECK (mental_rating BETWEEN 1 AND 5),
    consistency_rating INTEGER CHECK (consistency_rating BETWEEN 1 AND 5),
    learning_points TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_player_match_journals_entry_id ON player_match_journals(entry_id);
CREATE INDEX idx_player_match_journals_match_id ON player_match_journals(match_id);
```

### player_skill_journals

For tracking specific skill development.

```sql
CREATE TABLE player_skill_journals (
    id SERIAL PRIMARY KEY,
    entry_id INTEGER NOT NULL REFERENCES journal_entries(id),
    skill_name VARCHAR(100) NOT NULL,
    current_rating INTEGER CHECK (current_rating BETWEEN 1 AND 10),
    target_rating INTEGER CHECK (target_rating BETWEEN 1 AND 10),
    practice_duration_minutes INTEGER,
    practice_method TEXT,
    effectiveness_rating INTEGER CHECK (effectiveness_rating BETWEEN 1 AND 5),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_player_skill_journals_entry_id ON player_skill_journals(entry_id);
CREATE INDEX idx_player_skill_journals_skill_name ON player_skill_journals(skill_name);
```

### player_equipment_journals

For tracking equipment usage and effectiveness.

```sql
CREATE TABLE player_equipment_journals (
    id SERIAL PRIMARY KEY,
    entry_id INTEGER NOT NULL REFERENCES journal_entries(id),
    equipment_type VARCHAR(50) NOT NULL, -- paddle, shoes, etc.
    brand VARCHAR(100),
    model VARCHAR(100),
    usage_duration_hours DECIMAL(5,2),
    performance_rating INTEGER CHECK (performance_rating BETWEEN 1 AND 5),
    comfort_rating INTEGER CHECK (comfort_rating BETWEEN 1 AND 5),
    durability_rating INTEGER CHECK (durability_rating BETWEEN 1 AND 5),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_player_equipment_journals_entry_id ON player_equipment_journals(entry_id);
```

### player_mental_journals

For tracking the mental aspects of the game.

```sql
CREATE TABLE player_mental_journals (
    id SERIAL PRIMARY KEY,
    entry_id INTEGER NOT NULL REFERENCES journal_entries(id),
    mental_aspect VARCHAR(50) NOT NULL, -- focus, confidence, resilience, etc.
    situation_description TEXT,
    challenge_level INTEGER CHECK (challenge_level BETWEEN 1 AND 5),
    coping_strategy TEXT,
    effectiveness_rating INTEGER CHECK (effectiveness_rating BETWEEN 1 AND 5),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_player_mental_journals_entry_id ON player_mental_journals(entry_id);
```

## Coach-Specific Tables

### coach_session_journals

For tracking coaching sessions.

```sql
CREATE TABLE coach_session_journals (
    id SERIAL PRIMARY KEY,
    entry_id INTEGER NOT NULL REFERENCES journal_entries(id),
    student_id INTEGER REFERENCES users(id),
    session_type VARCHAR(50) NOT NULL, -- individual, group, clinic, etc.
    session_focus TEXT,
    session_duration_minutes INTEGER,
    preparation_notes TEXT,
    execution_notes TEXT,
    student_engagement_rating INTEGER CHECK (student_engagement_rating BETWEEN 1 AND 5),
    effectiveness_rating INTEGER CHECK (effectiveness_rating BETWEEN 1 AND 5),
    follow_up_plan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_coach_session_journals_entry_id ON coach_session_journals(entry_id);
CREATE INDEX idx_coach_session_journals_student_id ON coach_session_journals(student_id);
```

### coach_method_journals

For tracking and refining teaching methods.

```sql
CREATE TABLE coach_method_journals (
    id SERIAL PRIMARY KEY,
    entry_id INTEGER NOT NULL REFERENCES journal_entries(id),
    method_name VARCHAR(100) NOT NULL,
    target_skill VARCHAR(100),
    method_description TEXT,
    target_player_level VARCHAR(50),
    trial_context TEXT,
    effectiveness_rating INTEGER CHECK (effectiveness_rating BETWEEN 1 AND 5),
    adaptation_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_coach_method_journals_entry_id ON coach_method_journals(entry_id);
```

### coach_student_notes

Private notes coaches keep about students.

```sql
CREATE TABLE coach_student_notes (
    id SERIAL PRIMARY KEY,
    coach_id INTEGER NOT NULL REFERENCES users(id),
    student_id INTEGER NOT NULL REFERENCES users(id),
    note_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    note_type VARCHAR(50), -- progress, concern, strength, etc.
    note_content TEXT NOT NULL,
    priority INTEGER CHECK (priority BETWEEN 1 AND 5),
    is_addressed BOOLEAN DEFAULT false,
    follow_up_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_coach_student_notes_coach_id ON coach_student_notes(coach_id);
CREATE INDEX idx_coach_student_notes_student_id ON coach_student_notes(student_id);
```

## Referee-Specific Tables

### referee_match_journals

For tracking officiating experiences.

```sql
CREATE TABLE referee_match_journals (
    id SERIAL PRIMARY KEY,
    entry_id INTEGER NOT NULL REFERENCES journal_entries(id),
    match_id INTEGER REFERENCES matches(id), -- Can be null for unofficial matches
    match_type VARCHAR(50) NOT NULL, -- recreational, tournament, exhibition, etc.
    match_format VARCHAR(50), -- singles, doubles, mixed
    venue TEXT,
    player_level VARCHAR(50),
    difficult_calls_json JSONB, -- Array of difficult calls made
    player_interactions_json JSONB, -- Notable interactions with players
    self_assessment_rating INTEGER CHECK (self_assessment_rating BETWEEN 1 AND 5),
    areas_for_improvement TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_referee_match_journals_entry_id ON referee_match_journals(entry_id);
CREATE INDEX idx_referee_match_journals_match_id ON referee_match_journals(match_id);
```

### referee_rule_study_journals

For tracking rules knowledge development.

```sql
CREATE TABLE referee_rule_study_journals (
    id SERIAL PRIMARY KEY,
    entry_id INTEGER NOT NULL REFERENCES journal_entries(id),
    rule_section VARCHAR(100),
    rule_reference VARCHAR(100),
    rule_description TEXT,
    study_method TEXT,
    comprehension_rating INTEGER CHECK (comprehension_rating BETWEEN 1 AND 5),
    application_notes TEXT,
    questions_raised TEXT,
    resolution_status VARCHAR(50), -- resolved, pending, seeking clarification
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_referee_rule_study_journals_entry_id ON referee_rule_study_journals(entry_id);
```

## Integration Tables

### journal_goals

For tracking goals across all user types.

```sql
CREATE TABLE journal_goals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    goal_type VARCHAR(50) NOT NULL, -- technical, tactical, physical, mental, coaching, officiating
    title VARCHAR(255) NOT NULL,
    description TEXT,
    target_date DATE,
    status VARCHAR(50) DEFAULT 'active', -- active, achieved, abandoned
    completion_date DATE,
    progress_percentage INTEGER DEFAULT 0,
    priority INTEGER CHECK (priority BETWEEN 1 AND 5),
    related_dimension VARCHAR(50), -- TECH, TACT, PHYS, MENT, CONS
    parent_goal_id INTEGER REFERENCES journal_goals(id), -- For hierarchical goals
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_journal_goals_user_id ON journal_goals(user_id);
CREATE INDEX idx_journal_goals_status ON journal_goals(status);
```

### journal_goal_entries

Links journal entries to specific goals.

```sql
CREATE TABLE journal_goal_entries (
    id SERIAL PRIMARY KEY,
    goal_id INTEGER NOT NULL REFERENCES journal_goals(id),
    entry_id INTEGER NOT NULL REFERENCES journal_entries(id),
    contribution_note TEXT, -- How this entry contributes to the goal
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_journal_goal_entries_goal_id ON journal_goal_entries(goal_id);
CREATE INDEX idx_journal_goal_entries_entry_id ON journal_goal_entries(entry_id);
```

### sage_journal_insights

AI-generated insights from journal entries.

```sql
CREATE TABLE sage_journal_insights (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    insight_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    insight_type VARCHAR(50) NOT NULL, -- pattern, recommendation, milestone, warning
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    supporting_data JSONB, -- Data points that led to this insight
    action_recommended TEXT,
    user_acknowledged BOOLEAN DEFAULT false,
    user_feedback VARCHAR(50), -- helpful, not_helpful, neutral
    confidence_score DECIMAL(3,2), -- AI confidence in this insight (0.0 to 1.0)
    source_entries JSONB, -- Array of journal entry IDs this insight relates to
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sage_journal_insights_user_id ON sage_journal_insights(user_id);
CREATE INDEX idx_sage_journal_insights_insight_type ON sage_journal_insights(insight_type);
```

### journal_sharing

Controls who can access journal entries.

```sql
CREATE TABLE journal_sharing (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id), -- Journal owner
    shared_with_id INTEGER NOT NULL REFERENCES users(id), -- Person getting access
    sharing_level VARCHAR(50) NOT NULL, -- read, comment, full
    entry_types JSONB, -- Array of entry types that are shared
    start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP, -- NULL for indefinite
    created_by INTEGER NOT NULL REFERENCES users(id), -- Who created this sharing permission
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_journal_sharing_user_id ON journal_sharing(user_id);
CREATE INDEX idx_journal_sharing_shared_with_id ON journal_sharing(shared_with_id);
```

### journal_streaks

Tracks user journaling consistency for gamification.

```sql
CREATE TABLE journal_streaks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    current_streak_days INTEGER DEFAULT 0,
    longest_streak_days INTEGER DEFAULT 0,
    last_entry_date DATE,
    streak_start_date DATE,
    total_entries INTEGER DEFAULT 0,
    streaks_history JSONB, -- Historical record of streaks
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_journal_streaks_user_id ON journal_streaks(user_id);
```

## Indexing Strategy

- Indexes on foreign keys for relationship queries
- Indexes on frequently filtered fields (tags, entry types)
- Indexes on date fields for timeline queries
- Compound indexes for common query patterns

## Database Triggers

1. **Update Streaks Trigger**: Automatically updates journal_streaks when new entries are added
2. **Journal Updated Trigger**: Updates timestamp and notifies relevant users
3. **Goal Progress Trigger**: Updates goal progress based on linked entries

## Data Integrity

- Foreign key constraints to enforce relationships
- Check constraints for ratings and other bounded values
- Unique constraints where appropriate
- NOT NULL constraints for required fields

## Optimization Considerations

- Partitioning large tables (like journal_entries) by date
- Regular vacuum and analyze for performance
- Consider time-series optimization for chronological data
- Implement connection pooling for high write frequency