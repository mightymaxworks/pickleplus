# Player Experience 2.0: Gaming HUD Command Center
## Complete Specification & Development Plan

**Version:** 2.0.0  
**Status:** Planning Complete - Ready for Development  
**Target Release:** Q2 2025  
**Primary Route:** `/unified-prototype`

---

## 🎯 Executive Summary

Player Experience 2.0 transforms the Pickle+ dashboard into a comprehensive **Gaming HUD Command Center** that combines esports-style visual design with personalized player content. This evolution integrates match tracking, coaching materials, tournament media, and social content into a unified, interactive experience.

---

## 🎨 Core Design Philosophy

### Visual Identity
- **Gaming/Esports Aesthetic**: Hexagonal geometry, neon glows, particle effects
- **Color Palette**: Orange (#f97316) → Pink (#ec4899) → Purple (#a855f7) gradients
- **Typography**: Bold headers, monospace for codes/stats, clean sans-serif for content
- **Animations**: Smooth transitions, hover glows, animated counters, scan line effects

### User Experience Principles
1. **Personalization First**: Player photos, custom content, regional rankings
2. **Content Intelligence**: Relevant videos, assessments, and media automatically surfaced
3. **Quick Actions**: One-click challenges, instant match recording, rapid navigation
4. **Progressive Disclosure**: Complex features revealed contextually, not overwhelming

---

## 📐 Layout Architecture

### Desktop Layout (1920px+)
```
┌─────────────────────────────────────────────────────────────────┐
│  PASSPORT HERO - Hexagonal Card                                 │
│  [Player Photo] | Name | Tier Badge | Passport Code | Actions   │
└─────────────────────────────────────────────────────────────────┘

┌────────────────────────┬────────────────────────────────────────┐
│  PERFORMANCE HUD       │  CONTENT FEED                          │
│  (40% width)           │  (60% width)                           │
│                        │                                        │
│  🎯 Hexagonal Stats    │  📱 Personalized Media Hub            │
│  Win Rate | Matches    │  - Videos (multi-platform)            │
│  Points | Streak       │  - Photos & Galleries                 │
│  Rank | Next Tier      │  - Assessment Reports                 │
│                        │  - Tournament Updates                 │
│  🏆 Interactive        │  - Coaching Materials                 │
│     Leaderboard        │                                        │
│  [Filter: Regional ▼]  │  [Filter: All ▼] [Search]            │
│                        │                                        │
│  Top 3 (Challenge)     │  [Video Card] [Photo Card]            │
│  #3 Player C  ⚔️       │  [Article Card] [Tournament Card]     │
│  #2 Player B  ⚔️       │                                        │
│  #1 Player A  ⚔️       │  [Load More...]                       │
│  ─────────────────     │                                        │
│  #4 YOU ⭐            │                                        │
│  ─────────────────     │                                        │
│  Below You (5)         │                                        │
└────────────────────────┴────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  MATCH HISTORY - Battle Log                                     │
│  Recent matches with quick stats, replays, and analysis         │
└─────────────────────────────────────────────────────────────────┘
```

### Responsive Behavior
- **Tablet (768-1919px)**: 2-column stacked (HUD top, Content bottom)
- **Mobile (<768px)**: Single column, swipeable cards

---

## 🎮 Feature Specifications

### 1. Player Personalization System

#### Photo Upload & Management
**Capabilities:**
- **Profile/Passport Photo**: Main identity photo with tier-colored border
- **Action Gallery**: Multiple photos from tournaments, training, achievements
- **Upload Methods**: 
  - Drag & drop
  - Click to browse
  - Camera capture (mobile)
  - Import from social media (future)

**Photo Requirements:**
- **Formats**: JPG, PNG, WebP
- **Size Limits**: 
  - Profile photo: 400x400px min, 2048x2048px max, 5MB max
  - Gallery photos: 800x600px min, 4K max, 10MB max each
- **Cropping Tools**:
  - Circular crop for profile avatars
  - Square crop for passport cards
  - Freeform crop for gallery
- **Filters**: Optional tier-themed filters (orange/pink/purple tints)

**Storage & Integration:**
- Store via Replit Object Storage
- CDN delivery for performance
- Automatic thumbnail generation
- Display in:
  - Hero passport card (large, 200x200px)
  - Leaderboard avatars (small, 48x48px)
  - Match history cards (medium, 80x80px)
  - Content feed author badges (40x40px)

**Privacy:**
- Public (visible to all)
- Friends only
- Private (only you)

---

### 2. Multi-Platform Video Integration

#### Supported Video Platforms

**Phase 1 - Global Platforms:**

1. **YouTube**
   - **Embed Method**: iframe API
   - **Features**: Autoplay control, quality selection, captions
   - **Integration**: Replit YouTube Connector (available)
   - **URL Format**: `https://www.youtube.com/watch?v=VIDEO_ID`
   - **Extract ID**: Regex pattern `(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})`

2. **Vimeo**
   - **Embed Method**: iframe oEmbed
   - **Features**: Privacy controls, quality selection, branding options
   - **URL Format**: `https://vimeo.com/VIDEO_ID`
   - **Extract ID**: Regex pattern `vimeo\.com\/(\d+)`

3. **Facebook**
   - **Embed Method**: Facebook SDK + Video Plugin
   - **Features**: Like, share, comment integration
   - **URL Format**: `https://www.facebook.com/watch/?v=VIDEO_ID`
   - **Requirements**: Facebook App ID (public, no secret needed)
   - **Extract ID**: Regex pattern `facebook\.com\/.*\/videos\/(\d+)` or `watch\/\?v=(\d+)`

4. **TikTok**
   - **Embed Method**: oEmbed API
   - **Features**: Autoplay, mute controls
   - **URL Format**: `https://www.tiktok.com/@username/video/VIDEO_ID`
   - **API Endpoint**: `https://www.tiktok.com/oembed?url={VIDEO_URL}`
   - **Extract ID**: Regex pattern `tiktok\.com\/@[^\/]+\/video\/(\d+)`

**Phase 2 - Chinese Platforms:**

5. **Douyin (抖音)** - Chinese TikTok
   - **Embed Method**: iframe with share URL
   - **URL Format**: `https://www.douyin.com/video/VIDEO_ID`
   - **Challenges**: Region restrictions, may require VPN/proxy
   - **Fallback**: Link preview with thumbnail, click opens in new tab

6. **Xiaohongshu (小红书)** - Little Red Book
   - **Embed Method**: Custom iframe (limited official support)
   - **URL Format**: `https://www.xiaohongshu.com/discovery/item/ITEM_ID`
   - **Implementation**: URL preview card with thumbnail + metadata
   - **Note**: Full embed may be limited, prioritize link + preview

**Phase 3 - Future/Internal:**

7. **Direct Upload** (Current)
   - **Format**: MP4, WebM
   - **Max Size**: 500MB
   - **Storage**: Replit Object Storage → Future internal CDN
   - **Player**: HTML5 video with custom controls

8. **Pickle+ Video Service** (Future)
   - **Purpose**: Full control, analytics, processing
   - **Features**: Automatic transcoding, adaptive bitrate, DRM
   - **Migration Path**: Easy switch from external to internal

#### Video Card Component Design

**Card Structure:**
```jsx
<VideoCard>
  <Thumbnail>
    <PlatformBadge icon={YouTube/Vimeo/etc} />
    <DurationOverlay>12:45</DurationOverlay>
    <PlayButton /> {/* Hexagonal play icon */}
  </Thumbnail>
  
  <CardContent>
    <Title>Coaching Session #4 - Serve Technique</Title>
    <Metadata>
      <UploadSource avatar={coachPhoto}>Coach Mike</UploadSource>
      <UploadDate>2 days ago</UploadDate>
      <ViewCount>127 views</ViewCount>
    </Metadata>
    <Tags>
      <Tag color="blue">Coaching</Tag>
      <Tag color="orange">Technical</Tag>
    </Tags>
    <PrivacyIndicator>🔒 Private</PrivacyIndicator>
  </CardContent>
  
  <CardActions>
    <Button variant="ghost">Watch</Button>
    <Button variant="ghost">Share</Button>
    <Button variant="ghost">Save</Button>
  </CardActions>
</VideoCard>
```

**Embed Player Features:**
- **Fullscreen mode**
- **Playback speed control**
- **Quality selection** (if supported by platform)
- **Timestamp seeking** via URL parameters
- **Coach annotations** (see section below)

#### Video Annotation System

**Coach Timestamp Comments:**

**Purpose:** Allow coaches to leave feedback at specific moments in videos

**User Flow:**
1. Coach watches student match/practice video
2. Pauses at key moment (e.g., 2:35)
3. Clicks "Add Comment" button
4. Enters feedback: "Good footwork positioning here! ✅"
5. Comment saved with timestamp
6. Student sees timeline markers when viewing video
7. Click marker → Video jumps to moment + shows comment overlay

**Comment Display:**
```jsx
<VideoPlayer>
  <VideoEmbed src={videoUrl} />
  
  <TimestampTimeline>
    {comments.map(comment => (
      <TimelineMarker 
        position={(comment.timestamp / videoDuration) * 100 + '%'}
        onClick={() => seekToTimestamp(comment.timestamp)}
      >
        <Tooltip>{comment.text}</Tooltip>
        <MarkerDot color={comment.type} />
      </TimelineMarker>
    ))}
  </TimestampTimeline>
  
  <CommentOverlay visible={currentComment}>
    <CoachAvatar src={comment.coach.photo} />
    <CommentText>{comment.text}</CommentText>
    <CommentTime>At {formatTime(comment.timestamp)}</CommentTime>
  </CommentOverlay>
</VideoPlayer>
```

**Comment Types:**
- ✅ **Positive**: Green marker (good technique, excellent shot)
- ⚠️ **Improvement**: Orange marker (watch this, adjust here)
- 📝 **Note**: Blue marker (general observation, tactical note)
- 🎯 **Key Moment**: Purple marker (critical play, turning point)

**Database Schema:**
```sql
CREATE TABLE video_annotations (
  id SERIAL PRIMARY KEY,
  video_content_id INT REFERENCES player_content(id),
  coach_id INT REFERENCES users(id),
  student_id INT REFERENCES users(id),
  timestamp_seconds INT NOT NULL,
  comment_text TEXT NOT NULL,
  comment_type VARCHAR(20) DEFAULT 'note', -- 'positive', 'improvement', 'note', 'key_moment'
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### 3. Regional Leaderboard System

#### Filter & Display Options

**Location Filters:**
- **My Gym** (default for new users)
- **Regional** (city/province - default for active players)
- **National** (country-wide)
- **Global** (worldwide)

**Category Filters:**
- **All Categories** (combined ranking)
- **Open** (19+)
- **Age Groups** (U19, 35+, 50+, 60+, 70+)
- **Gender** (Men's, Women's, Mixed)

**Timeframe Filters:**
- **Current Season** (default)
- **All-Time**
- **Last 30 Days**
- **Last 7 Days**

#### Display Logic

**Top Section (Above You):**
- Show **top 3 players** above your rank
- Display format:
  ```
  #3 👤 Player Name         1,234 pts    ⚔️ Challenge
     Regional Rank #3 | +127 pts ahead
  
  #2 👤 Player Name         1,156 pts    ⚔️ Challenge
     Regional Rank #2 | +50 pts ahead
  
  #1 👤 Player Name         1,106 pts    ⚔️ Challenge
     Regional Rank #1 | Just ahead!
  ```

**Your Position (Highlighted):**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#4 ⭐ YOU                  1,089 pts    📊 View Details
   Regional Rank #4 | 17 pts from #3
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
- **Pulsing glow effect** in tier color
- **Prominent positioning**
- **Detailed breakdown** on click

**Bottom Section (Below You):**
- Show **5 players** below your rank (compact view)
- Display format:
  ```
  #5 Player Name    1,034 pts   -55 pts behind
  #6 Player Name      978 pts   -111 pts behind
  #7 Player Name      921 pts   -168 pts behind
  ...
  ```

**Data Source & Performance:**
- Query from existing `rankings` table
- Filter by `region`, `country`, or `gym_id`
- Cache for 5 minutes (Redis/in-memory)
- Real-time updates via WebSocket for rank changes
- Paginate for large leaderboards (load more)

---

### 4. Challenge & Match Lobby System

#### Challenge Workflow

**Step 1: Initiate Challenge**
```
User clicks ⚔️ Challenge button on leaderboard
  ↓
Modal opens:
┌─────────────────────────────────────┐
│  Challenge Player Name?             │
│  Current Rank: #3 (Regional)        │
│  ─────────────────────────────      │
│  Add a message (optional):          │
│  [Text input: "Ready to battle!"]   │
│  ─────────────────────────────      │
│  Stakes: Ranked Challenge           │
│  Points at Risk: ±25-50 pts         │
│  ─────────────────────────────      │
│  [Send Challenge]  [Cancel]         │
└─────────────────────────────────────┘
  ↓
Challenge created with status: PENDING
Notification sent to opponent
```

**Step 2: Notification System**
```
Opponent receives:
1. Push Notification (if enabled):
   "⚔️ [Your Name] has challenged you!"
   
2. In-App Badge:
   Bell icon shows (1) unread
   
3. Toast Message:
   Appears on dashboard:
   "[Your Name] wants to battle! Tap to view"
   
4. Challenge Center Entry:
   New challenge appears in inbox
```

**Step 3: Challenge Center/Lobby**

**New Route:** `/challenges` (or modal overlay)

**Layout:**
```
┌─────────────────────────────────────────────────┐
│  MATCH CHALLENGES                               │
│  [Incoming (3)] [Sent (2)] [History (15)]       │
├─────────────────────────────────────────────────┤
│                                                 │
│  INCOMING CHALLENGES                            │
│  ┌─────────────────────────────────────────┐   │
│  │ ⚔️ RANKED CHALLENGE                     │   │
│  │ ────────────────────────────────────    │   │
│  │ 👤 [Photo] Player Name    Rank: #3     │   │
│  │ "I'm ready to take you on!"            │   │
│  │                                         │   │
│  │ Stakes: ±25-50 ranking points          │   │
│  │ Expires in: 18 hours                   │   │
│  │                                         │   │
│  │ [Accept Challenge] [Decline] [View]    │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  SENT CHALLENGES                                │
│  ┌─────────────────────────────────────────┐   │
│  │ 👤 [Photo] Player Name    Rank: #1     │   │
│  │ Status: ⏳ Pending Response             │   │
│  │ Sent: 2 hours ago                      │   │
│  │ Expires in: 22 hours                   │   │
│  │                                         │   │
│  │ [Cancel Challenge] [View Profile]      │   │
│  └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

**Step 4: Accept → Match Recording**
```
Player clicks "Accept Challenge"
  ↓
Redirect to: /match/record?challenge=CHALLENGE_ID
  ↓
Quick Match Recorder opens with:
- Opponent pre-filled from challenge
- Special badge: "⚔️ RANKED CHALLENGE"
- Points multiplier shown (if applicable)
- Challenge ID linked to match
  ↓
Record match normally
  ↓
On submit:
- Match saved with challenge_id
- Challenge status → COMPLETED
- Rankings auto-update
- Both players notified of outcome
  ↓
Redirect to: /unified-prototype
Updated leaderboard reflects new rankings
```

#### Challenge States & Lifecycle

**States:**
1. **PENDING**: Waiting for opponent response (24h expiry)
2. **ACCEPTED**: Opponent agreed, match scheduled
3. **IN_PROGRESS**: Match currently being played
4. **COMPLETED**: Match finished, recorded
5. **DECLINED**: Opponent refused
6. **EXPIRED**: No response within 24 hours
7. **CANCELLED**: Challenger withdrew

**Auto-Expiry:**
- Challenges expire after **24 hours** if no response
- Notification sent 1 hour before expiry
- Expired challenges move to History tab
- Option to re-challenge immediately

**Database Schema:**
```sql
CREATE TABLE match_challenges (
  id SERIAL PRIMARY KEY,
  challenger_id INT REFERENCES users(id) NOT NULL,
  challenged_id INT REFERENCES users(id) NOT NULL,
  
  status VARCHAR(20) DEFAULT 'pending',
  -- 'pending', 'accepted', 'in_progress', 'completed', 'declined', 'expired', 'cancelled'
  
  challenge_message TEXT,
  points_at_stake INT, -- Calculated based on ranking difference
  
  match_id INT REFERENCES matches(id), -- Linked when match recorded
  
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '24 hours',
  responded_at TIMESTAMP,
  completed_at TIMESTAMP,
  
  -- Additional metadata
  challenge_type VARCHAR(20) DEFAULT 'ranked', -- 'ranked', 'casual', 'tournament'
  location_filter VARCHAR(50), -- 'regional', 'national', 'global'
  
  CONSTRAINT no_self_challenge CHECK (challenger_id != challenged_id)
);

CREATE INDEX idx_challenges_challenged ON match_challenges(challenged_id, status);
CREATE INDEX idx_challenges_challenger ON match_challenges(challenger_id, status);
CREATE INDEX idx_challenges_expires ON match_challenges(expires_at) WHERE status = 'pending';
```

**Notification Integration:**
```sql
-- Trigger notification on challenge creation
CREATE OR REPLACE FUNCTION notify_challenge()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (user_id, type, title, message, metadata)
  VALUES (
    NEW.challenged_id,
    'challenge_received',
    'New Challenge!',
    (SELECT username FROM users WHERE id = NEW.challenger_id) || ' has challenged you to a match!',
    json_build_object(
      'challenge_id', NEW.id,
      'challenger_id', NEW.challenger_id,
      'points_at_stake', NEW.points_at_stake
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER challenge_notification
  AFTER INSERT ON match_challenges
  FOR EACH ROW
  EXECUTE FUNCTION notify_challenge();
```

---

### 5. Content Privacy & Permissions

#### Privacy Levels

**For Videos, Photos, Articles:**

1. **🌐 Public**
   - Visible to all platform users
   - Appears in public feeds
   - Searchable
   - Shareable via link
   - Can be embedded externally (future)

2. **👥 Friends Only**
   - Visible to connected players
   - Requires friendship/connection
   - Not searchable publicly
   - Share link requires login

3. **🏆 Team Only**
   - Visible to tournament team members
   - Visible to training group members
   - Coaches with team access can view
   - Private to others

4. **🔒 Private**
   - Only visible to content owner
   - Tagged coaches can view (with permission)
   - Admins with permission (audit purposes)
   - Not searchable, not shareable

#### Permission System

**Content Upload Permissions:**
```
Player:
  - Upload own videos ✅
  - Upload own photos ✅
  - Set privacy level ✅
  - Delete own content ✅
  - Tag coaches (requires approval) ✅

Coach:
  - Upload videos for students ✅
  - Upload assessment materials ✅
  - Default privacy: Private (student only) ✅
  - Can share to public (with student consent) ✅
  - Delete own uploads ✅
  - Cannot delete student uploads ❌

Admin:
  - Upload platform content ✅
  - Upload tournament media ✅
  - Moderate all content ✅
  - Set featured content ✅
  - Delete inappropriate content ✅
```

**Coach Override (Important):**
- Coach uploads assessment video → Default: Private
- Coach can offer to "Share publicly" (e.g., as teaching example)
- Requires student explicit consent via popup:
  ```
  Coach Mike wants to share your assessment video:
  "Great example of serve technique improvement"
  
  Privacy: Public (visible to all users)
  
  [Allow] [Keep Private]
  ```

**Visibility Logic (Database Query):**
```sql
-- Get visible content for user
SELECT c.* FROM player_content c
WHERE 
  c.privacy = 'public'
  OR c.user_id = :current_user_id
  OR (c.privacy = 'friends' AND EXISTS (
    SELECT 1 FROM friendships f 
    WHERE (f.user_id = :current_user_id AND f.friend_id = c.user_id)
       OR (f.friend_id = :current_user_id AND f.user_id = c.user_id)
    AND f.status = 'accepted'
  ))
  OR (c.privacy = 'team' AND EXISTS (
    SELECT 1 FROM team_members tm1
    JOIN team_members tm2 ON tm1.team_id = tm2.team_id
    WHERE tm1.user_id = :current_user_id 
      AND tm2.user_id = c.user_id
  ))
  OR (c.privacy = 'private' AND EXISTS (
    SELECT 1 FROM coach_student_assignments csa
    WHERE csa.coach_id = :current_user_id 
      AND csa.student_id = c.user_id
      AND csa.status = 'active'
  ))
ORDER BY c.created_at DESC;
```

**Privacy Controls UI:**
```jsx
<PrivacySelector>
  <RadioGroup value={privacy} onChange={setPrivacy}>
    <RadioOption value="public">
      <Icon>🌐</Icon>
      <Label>Public</Label>
      <Description>Everyone can see this</Description>
    </RadioOption>
    
    <RadioOption value="friends">
      <Icon>👥</Icon>
      <Label>Friends Only</Label>
      <Description>Only connected players</Description>
    </RadioOption>
    
    <RadioOption value="team">
      <Icon>🏆</Icon>
      <Label>Team Only</Label>
      <Description>Tournament/training teammates</Description>
    </RadioOption>
    
    <RadioOption value="private">
      <Icon>🔒</Icon>
      <Label>Private</Label>
      <Description>Only you and tagged coaches</Description>
    </RadioOption>
  </RadioGroup>
</PrivacySelector>
```

---

### 6. Content Feed Intelligence

#### Content Types & Sources

**Video Content:**
- **Coaching Sessions**: Coach uploads, tagged to student
- **Match Recordings**: Player or admin uploads from tournaments
- **Assessment Replays**: Coach analysis with annotations
- **Tutorial Videos**: Platform educational content
- **Highlight Reels**: Auto-generated or manual compilations

**Photo Content:**
- **Tournament Photos**: Event photographer uploads
- **Training Captures**: Coach/player training session moments
- **Achievement Photos**: Award ceremonies, milestone celebrations
- **Action Shots**: In-game moments, technique demonstrations

**Article Content:**
- **Coach Reports**: Assessment PDFs, progress notes
- **Tournament Recaps**: Event summaries with stats
- **Training Plans**: Structured development programs
- **Platform News**: Updates, features, announcements
- **Educational Articles**: Technique guides, strategy tips

**Tournament Updates:**
- **Registration Reminders**: "Tournament starts in 3 days!"
- **Bracket Updates**: "You're playing in Round 2 tomorrow"
- **Live Scores**: "Your match is starting now"
- **Results**: "Congratulations! You placed 3rd"

#### Content Prioritization Algorithm

**Ranking Factors (Weighted):**
1. **Recency** (40%): Newer content ranks higher
2. **Relevance** (30%): 
   - Direct tags (your name, your coach)
   - Skill level match
   - Tournament participation
3. **Engagement** (15%):
   - View count
   - Interaction rate
   - Completion rate (for videos)
4. **Source Authority** (10%):
   - Your coach > Other coaches
   - Your team > Other teams
   - Platform official > User-generated
5. **Content Type Preference** (5%):
   - User's viewing history
   - Content type interactions

**Scoring Formula:**
```javascript
contentScore = (
  (recencyScore * 0.40) +
  (relevanceScore * 0.30) +
  (engagementScore * 0.15) +
  (authorityScore * 0.10) +
  (preferenceScore * 0.05)
)

// Boost factors:
if (content.unviewed) score *= 1.5;
if (content.coachTagged && coach.isYourCoach) score *= 2.0;
if (content.tournamentActive) score *= 1.3;
```

**Feed Filtering:**
```jsx
<ContentFilters>
  <FilterTabs>
    <Tab active={filter === 'all'}>All Content</Tab>
    <Tab active={filter === 'videos'}>🎥 Videos</Tab>
    <Tab active={filter === 'photos'}>📸 Photos</Tab>
    <Tab active={filter === 'reports'}>📄 Reports</Tab>
    <Tab active={filter === 'tournaments'}>🏆 Tournaments</Tab>
  </FilterTabs>
  
  <AdvancedFilters>
    <DateRange>Last 7 days ▼</DateRange>
    <SourceFilter>All sources ▼</SourceFilter>
    <PrivacyFilter>All privacy ▼</PrivacyFilter>
  </AdvancedFilters>
  
  <SearchBar>
    <Icon>🔍</Icon>
    <Input placeholder="Search your content..." />
  </SearchBar>
</ContentFilters>
```

**Content States:**
- **New/Unviewed**: Blue dot badge, highlighted border
- **In Progress**: Progress bar for videos (e.g., "45% watched")
- **Completed**: Checkmark, subtle styling
- **Saved**: Star icon, "Saved" collection
- **Shared**: Share count indicator

---

## 🗄️ Database Schema

### New Tables

```sql
-- Enhanced player content with multi-platform support
CREATE TABLE player_content (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) NOT NULL,
  
  -- Content basics
  content_type VARCHAR(20) NOT NULL, -- 'video', 'photo', 'article', 'tournament_update'
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Video-specific
  video_platform VARCHAR(30), -- 'youtube', 'vimeo', 'facebook', 'tiktok', 'douyin', 'xiaohongshu', 'direct', 'internal'
  video_url TEXT, -- Full URL for external platforms
  video_id VARCHAR(255), -- Extracted platform video ID
  video_duration_seconds INT,
  
  -- Photo-specific
  photo_url TEXT,
  photo_thumbnail_url TEXT,
  
  -- Article-specific
  article_url TEXT, -- PDF or external link
  article_type VARCHAR(30), -- 'assessment', 'progress_report', 'tutorial', 'news'
  
  -- Privacy & permissions
  privacy VARCHAR(20) DEFAULT 'private', -- 'public', 'friends', 'team', 'private'
  
  -- Metadata
  tags TEXT[], -- ['coaching', 'match', 'assessment', 'technique']
  created_by_id INT REFERENCES users(id), -- Coach or player who uploaded
  tagged_user_ids INT[], -- Students or players tagged in content
  
  -- Engagement
  view_count INT DEFAULT 0,
  like_count INT DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Indexing
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, ''))
  ) STORED
);

CREATE INDEX idx_content_user ON player_content(user_id);
CREATE INDEX idx_content_type ON player_content(content_type);
CREATE INDEX idx_content_privacy ON player_content(privacy);
CREATE INDEX idx_content_created ON player_content(created_at DESC);
CREATE INDEX idx_content_search ON player_content USING GIN(search_vector);

-- Video annotations (coach timestamp comments)
CREATE TABLE video_annotations (
  id SERIAL PRIMARY KEY,
  content_id INT REFERENCES player_content(id) ON DELETE CASCADE,
  coach_id INT REFERENCES users(id) NOT NULL,
  student_id INT REFERENCES users(id), -- Optional, for targeted feedback
  
  timestamp_seconds INT NOT NULL,
  comment_text TEXT NOT NULL,
  comment_type VARCHAR(20) DEFAULT 'note', -- 'positive', 'improvement', 'note', 'key_moment'
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT valid_timestamp CHECK (timestamp_seconds >= 0)
);

CREATE INDEX idx_annotations_content ON video_annotations(content_id, timestamp_seconds);
CREATE INDEX idx_annotations_student ON video_annotations(student_id);

-- Content interactions (views, likes, saves)
CREATE TABLE content_interactions (
  id SERIAL PRIMARY KEY,
  content_id INT REFERENCES player_content(id) ON DELETE CASCADE,
  user_id INT REFERENCES users(id) NOT NULL,
  
  interaction_type VARCHAR(20) NOT NULL, -- 'view', 'like', 'save', 'share'
  
  -- For videos: track progress
  video_progress_seconds INT,
  video_completed BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(content_id, user_id, interaction_type)
);

CREATE INDEX idx_interactions_content ON content_interactions(content_id);
CREATE INDEX idx_interactions_user ON content_interactions(user_id, interaction_type);

-- Photo gallery support (multiple photos per upload)
CREATE TABLE content_photos (
  id SERIAL PRIMARY KEY,
  content_id INT REFERENCES player_content(id) ON DELETE CASCADE,
  
  photo_url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,
  display_order INT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_photos_content ON content_photos(content_id, display_order);

-- Enhanced match challenges
CREATE TABLE match_challenges (
  id SERIAL PRIMARY KEY,
  challenger_id INT REFERENCES users(id) NOT NULL,
  challenged_id INT REFERENCES users(id) NOT NULL,
  
  status VARCHAR(20) DEFAULT 'pending',
  challenge_message TEXT,
  points_at_stake INT,
  
  match_id INT REFERENCES matches(id),
  
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '24 hours',
  responded_at TIMESTAMP,
  completed_at TIMESTAMP,
  
  challenge_type VARCHAR(20) DEFAULT 'ranked',
  location_filter VARCHAR(50),
  
  CONSTRAINT no_self_challenge CHECK (challenger_id != challenged_id),
  CONSTRAINT valid_expiry CHECK (expires_at > created_at)
);

CREATE INDEX idx_challenges_challenged ON match_challenges(challenged_id, status);
CREATE INDEX idx_challenges_challenger ON match_challenges(challenger_id, status);
CREATE INDEX idx_challenges_expires ON match_challenges(expires_at) WHERE status = 'pending';

-- Notifications (enhanced)
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) NOT NULL,
  
  notification_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  
  metadata JSONB, -- Flexible data for different notification types
  
  read BOOLEAN DEFAULT FALSE,
  action_url TEXT, -- Where to navigate when clicked
  
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP, -- Optional expiry for time-sensitive notifications
  
  priority VARCHAR(20) DEFAULT 'normal' -- 'low', 'normal', 'high', 'urgent'
);

CREATE INDEX idx_notifications_user ON notifications(user_id, read, created_at DESC);
CREATE INDEX idx_notifications_expires ON notifications(expires_at) WHERE expires_at IS NOT NULL;
```

---

## 🚀 Development Sprints

### Sprint 1: Foundation & Core HUD (Week 1)
**Goal:** Build basic HUD structure with hexagonal design system

**Tasks:**
1. **HUD Layout & Navigation**
   - Create responsive 3-column layout (hero, HUD, content)
   - Implement hexagonal geometry components
   - Set up gaming color system (orange/pink/purple gradients)
   - Add particle background effects

2. **Player Personalization**
   - Photo upload component with cropping
   - Profile/passport photo integration
   - Avatar display in all relevant sections
   - Gallery upload support

3. **Hexagonal Stats Display**
   - Win rate, matches, points, streak, rank, next tier
   - Animated counter on load
   - Hover glow effects
   - Click to drill down

4. **Basic Content Feed**
   - Content card components (video, photo, article)
   - Filter tabs (All, Videos, Photos, Reports)
   - Search functionality
   - Infinite scroll/pagination

**Deliverables:**
- Functional HUD layout on `/unified-prototype`
- Photo upload working with tier-colored borders
- Hexagonal stats with animations
- Basic content feed displaying mock content

---

### Sprint 2: Challenge System & Leaderboard (Week 2)
**Goal:** Implement interactive leaderboard and match challenge flow

**Tasks:**
1. **Regional Leaderboard**
   - Location filters (My Gym, Regional, National, Global)
   - Category filters (All, Open, Age Groups, Gender)
   - Timeframe filters (Current Season, All-Time, etc.)
   - Top 3 above, your position highlighted, 5 below

2. **Challenge System**
   - Challenge initiation modal
   - Challenge center/lobby page
   - Incoming/Sent/History tabs
   - Accept/Decline actions

3. **Match Recording Integration**
   - Pre-fill opponent from challenge
   - Link challenge to match
   - Update rankings on completion
   - Notification flow

4. **Notification System**
   - Push notification setup (browser)
   - In-app notification badge
   - Toast messages
   - Notification center

**Deliverables:**
- Interactive leaderboard with all filters working
- Complete challenge workflow (issue → notify → accept → record → update)
- Notification system functional
- Database schema implemented

---

### Sprint 3: Multi-Platform Video & Content (Week 3)
**Goal:** Integrate external video platforms and content intelligence

**Tasks:**
1. **Video Platform Integration**
   - YouTube embed (with Replit connector)
   - Vimeo embed
   - Facebook video embed (SDK setup)
   - TikTok oEmbed
   - Douyin/Xiaohongshu preview cards
   - Direct upload support

2. **Video Annotation System**
   - Coach timestamp comment UI
   - Timeline marker display
   - Comment overlay on video player
   - Seek-to-timestamp functionality
   - Database implementation

3. **Content Intelligence**
   - Prioritization algorithm
   - Relevance scoring
   - Unviewed content highlighting
   - Auto-tagging system

4. **Privacy & Permissions**
   - Privacy level selection UI
   - Visibility logic implementation
   - Coach consent flow
   - Permission checks

**Deliverables:**
- All video platforms embedded and working
- Video annotation system functional
- Content feed shows prioritized, relevant content
- Privacy controls implemented

---

### Sprint 4: Polish, Animations & Advanced Features (Week 4)
**Goal:** Add gaming polish and advanced interactions

**Tasks:**
1. **Gaming Aesthetics**
   - Scan line effects
   - Holographic shimmer on passport card
   - Particle trails on cursor
   - Glitch transitions
   - Neon glow animations

2. **Advanced Interactions**
   - Sound effects system (toggleable)
   - Achievement unlock animations
   - Live activity ticker (bottom)
   - Quick actions menu

3. **Match History Enhancement**
   - Battle log styling
   - Timeline view with connecting lines
   - Win/loss glow effects
   - Replay button integration
   - Detailed stats on hover/expand

4. **Performance & Optimization**
   - Content feed pagination optimization
   - Video thumbnail lazy loading
   - Cache strategy (Redis)
   - WebSocket for real-time updates

5. **Mobile Responsive**
   - Mobile layout adjustments
   - Swipeable cards
   - Touch-friendly interactions
   - Mobile video player controls

**Deliverables:**
- Full gaming aesthetic with animations
- Sound effects working
- Match history enhanced
- Mobile-optimized experience
- Performance benchmarks met

---

## 📊 Success Metrics

### User Engagement
- **Content Views**: 80% of users view at least 1 content item per session
- **Challenge Participation**: 30% of active users issue/accept challenges weekly
- **Photo Uploads**: 60% of users upload profile photo within first week
- **Return Visits**: 50% increase in daily active users

### Content Performance
- **Video Completion Rate**: 70% average completion for coaching videos
- **Annotation Engagement**: 85% of students view coach annotations
- **Privacy Usage**: 40% of content set to non-public privacy
- **Multi-Platform**: Videos from 4+ platforms active in feed

### Technical Performance
- **Page Load**: < 2 seconds for HUD initial render
- **Video Embed**: < 1 second for platform detection and embed
- **Leaderboard Query**: < 500ms for filtered rankings
- **Real-time Updates**: < 200ms notification delivery

---

## 🔐 Security & Privacy Considerations

1. **Content Privacy**: Strict enforcement of privacy levels, audit logs for access
2. **Challenge Abuse Prevention**: Rate limiting (max 5 challenges/day), spam detection
3. **Video Platform Security**: No API keys exposed, server-side validation
4. **Data Protection**: GDPR/CCPA compliant content deletion, user data export
5. **Coach Permissions**: Verified coach status required for annotations

---

## 🌏 Internationalization (i18n)

### Supported Languages (Phase 1)
- English (en-US)
- Chinese Simplified (zh-CN)
- Chinese Traditional (zh-TW)

### Chinese Platform Considerations
- Douyin/Xiaohongshu optimized for Chinese users
- Region-based platform recommendations
- Localized privacy terminology
- Cultural UX adaptations

---

## 🔮 Future Roadmap (Post-v2.0)

### Phase 3 Features
- AI-generated highlight reels
- Live streaming integration
- Virtual coaching rooms
- AR/VR match replays
- Trading card generation from content
- Blockchain verification for achievements

### Platform Expansion
- Internal video CDN with adaptive bitrate
- Live tournament broadcasting
- Coach certification video courses
- Marketplace for coaching content

---

## 📝 Technical Stack Summary

**Frontend:**
- React 18 + TypeScript
- Framer Motion (animations)
- Tailwind CSS + Custom gaming theme
- Wouter (routing)
- TanStack Query (state management)

**Backend:**
- Node.js + Express
- PostgreSQL (with existing schema extensions)
- Redis (caching, real-time)
- WebSocket (live updates)

**Media:**
- Replit Object Storage (uploads)
- YouTube/Vimeo/Facebook/TikTok APIs
- Future: Internal video service

**Integrations:**
- Replit YouTube Connector
- Facebook SDK
- TikTok oEmbed API
- Custom integrations for Chinese platforms

---

## ✅ Definition of Done

**Each feature must:**
1. ✅ Match gaming/esports visual design spec
2. ✅ Work on desktop, tablet, mobile
3. ✅ Pass security & privacy review
4. ✅ Include loading states and error handling
5. ✅ Meet performance benchmarks
6. ✅ Have analytics tracking
7. ✅ Include user documentation (tooltips, hints)
8. ✅ Pass accessibility audit (WCAG 2.1 AA)

---

**Document Version:** 2.0.0  
**Last Updated:** 2025-10-01  
**Status:** ✅ Planning Complete - Ready for Implementation  
**Next Step:** Begin Sprint 1 Development

---

*This document serves as the single source of truth for Player Experience 2.0. All development work should reference and update this specification.*
