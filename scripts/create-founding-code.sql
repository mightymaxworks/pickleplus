-- Generate a random code in format FOUNDER-XXXX
INSERT INTO redemption_codes (
  code,
  description,
  xp_reward,
  is_active,
  is_founding_member_code,
  max_redemptions,
  current_redemptions,
  expires_at
) 
VALUES (
  'FOUNDER-' || SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 4),
  'Founding Member Status - 1.1x XP Multiplier',
  100,  -- Small XP reward
  TRUE, -- Active
  TRUE, -- Is founding member code
  40,   -- Limit to 40 founding members
  0,    -- Current redemptions
  NOW() + INTERVAL '90 days' -- Expires in 90 days
) 
RETURNING code, description, max_redemptions, expires_at;
