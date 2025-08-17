-- Tony Guo Data Integrity Audit
-- Find Tony Guo and analyze his match history

-- First, find Tony Guo's user ID
SELECT id, display_name, username, ranking_points, pickle_points, created_at
FROM users 
WHERE LOWER(display_name) LIKE '%tony%guo%' 
   OR LOWER(username) LIKE '%tony%guo%'
   OR LOWER(display_name) LIKE '%guo%tony%';

-- Count his total matches
SELECT COUNT(*) as total_matches
FROM matches 
WHERE player_one_id IN (SELECT id FROM users WHERE LOWER(display_name) LIKE '%tony%guo%')
   OR player_two_id IN (SELECT id FROM users WHERE LOWER(display_name) LIKE '%tony%guo%')
   OR player_one_partner_id IN (SELECT id FROM users WHERE LOWER(display_name) LIKE '%tony%guo%')
   OR player_two_partner_id IN (SELECT id FROM users WHERE LOWER(display_name) LIKE '%tony%guo%');

-- Show his match timeline
SELECT 
  m.id,
  m.created_at,
  m.format_type,
  m.player_one_id,
  m.player_two_id,
  m.player_one_partner_id,
  m.player_two_partner_id,
  m.player1_score,
  m.player2_score
FROM matches m
WHERE m.player_one_id IN (SELECT id FROM users WHERE LOWER(display_name) LIKE '%tony%guo%')
   OR m.player_two_id IN (SELECT id FROM users WHERE LOWER(display_name) LIKE '%tony%guo%')
   OR m.player_one_partner_id IN (SELECT id FROM users WHERE LOWER(display_name) LIKE '%tony%guo%')
   OR m.player_two_partner_id IN (SELECT id FROM users WHERE LOWER(display_name) LIKE '%tony%guo%')
ORDER BY m.created_at;

-- Check for potential duplicates (matches within 5 minutes with same players)
WITH tony_matches AS (
  SELECT 
    m.id,
    m.created_at,
    m.format_type,
    ARRAY[m.player_one_id, m.player_two_id, m.player_one_partner_id, m.player_two_partner_id] as players
  FROM matches m
  WHERE m.player_one_id IN (SELECT id FROM users WHERE LOWER(display_name) LIKE '%tony%guo%')
     OR m.player_two_id IN (SELECT id FROM users WHERE LOWER(display_name) LIKE '%tony%guo%')
     OR m.player_one_partner_id IN (SELECT id FROM users WHERE LOWER(display_name) LIKE '%tony%guo%')
     OR m.player_two_partner_id IN (SELECT id FROM users WHERE LOWER(display_name) LIKE '%tony%guo%')
)
SELECT 
  m1.id as match1_id,
  m1.created_at as match1_date,
  m2.id as match2_id,
  m2.created_at as match2_date,
  EXTRACT(EPOCH FROM (m2.created_at - m1.created_at))/60 as time_diff_minutes
FROM tony_matches m1
JOIN tony_matches m2 ON m1.id < m2.id
WHERE m1.players = m2.players
  AND ABS(EXTRACT(EPOCH FROM (m2.created_at - m1.created_at))/60) < 5
ORDER BY m1.created_at;