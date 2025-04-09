-- CourtIQ™ Skill Profile System - SQL Schema
-- Pickle+ Platform
-- Last Updated: April 9, 2025

-- Skill Dimensions Reference Table
CREATE TABLE skill_dimensions (
    id SERIAL PRIMARY KEY,
    code VARCHAR(3) NOT NULL UNIQUE,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    weight_in_composite DECIMAL(3, 2) DEFAULT 1.00,
    display_order INTEGER DEFAULT 0
);

-- Player Dimensions Table
CREATE TABLE player_dimensions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    dimension_id INTEGER NOT NULL REFERENCES skill_dimensions(id),
    current_value DECIMAL(5, 2) NOT NULL,
    confidence_interval DECIMAL(5, 2) NOT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    matches_analyzed INTEGER DEFAULT 0,
    UNIQUE (user_id, dimension_id)
);

-- Dimension History Table
CREATE TABLE dimension_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    dimension_id INTEGER NOT NULL REFERENCES skill_dimensions(id),
    value DECIMAL(5, 2) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    match_id INTEGER REFERENCES matches(id)
);

-- Match Dimension Impacts Table
CREATE TABLE match_dimension_impacts (
    id SERIAL PRIMARY KEY,
    match_id INTEGER NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    dimension_id INTEGER NOT NULL REFERENCES skill_dimensions(id),
    previous_value DECIMAL(5, 2) NOT NULL,
    new_value DECIMAL(5, 2) NOT NULL,
    impact_reason TEXT
);

-- Composite Rating Table
CREATE TABLE composite_ratings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    courtiq_rating DECIMAL(6, 2) NOT NULL,
    confidence_interval DECIMAL(5, 2) NOT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tier VARCHAR(20),
    percentile DECIMAL(5, 2),
    is_provisional BOOLEAN DEFAULT TRUE,
    UNIQUE (user_id)
);

-- Skill Improvement Recommendations
CREATE TABLE skill_improvement_recs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    dimension_id INTEGER NOT NULL REFERENCES skill_dimensions(id),
    recommendation_type VARCHAR(30),
    recommendation_text TEXT NOT NULL,
    resource_link VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_completed BOOLEAN DEFAULT FALSE
);

-- Match Statistics Table (Extension for CourtIQ)
CREATE TABLE match_statistics (
    id SERIAL PRIMARY KEY,
    match_id INTEGER NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    player_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Serve Statistics
    serves_attempted INTEGER DEFAULT 0,
    serves_in INTEGER DEFAULT 0,
    aces INTEGER DEFAULT 0,
    service_points_won INTEGER DEFAULT 0,
    double_faults INTEGER DEFAULT 0,
    
    -- Return Statistics
    returns_attempted INTEGER DEFAULT 0,
    returns_in INTEGER DEFAULT 0,
    return_points_won INTEGER DEFAULT 0,
    return_winners INTEGER DEFAULT 0,
    
    -- Net Play Statistics
    net_points_played INTEGER DEFAULT 0,
    net_points_won INTEGER DEFAULT 0,
    volleys_attempted INTEGER DEFAULT 0,
    volley_winners INTEGER DEFAULT 0,
    volley_errors INTEGER DEFAULT 0,
    
    -- Dinking Statistics
    dinks_attempted INTEGER DEFAULT 0,
    dinks_in INTEGER DEFAULT 0,
    dink_winners INTEGER DEFAULT 0,
    dink_errors INTEGER DEFAULT 0,
    
    -- Power Shot Statistics
    drives_attempted INTEGER DEFAULT 0,
    drives_in INTEGER DEFAULT 0,
    drive_winners INTEGER DEFAULT 0,
    drive_errors INTEGER DEFAULT 0,
    
    -- Overall Shot Statistics
    winners INTEGER DEFAULT 0,
    forced_errors INTEGER DEFAULT 0,
    unforced_errors INTEGER DEFAULT 0,
    total_shots INTEGER DEFAULT 0,
    
    -- Placement Statistics (JSON format)
    shot_placement JSONB,
    
    -- Mental/Strategic Statistics
    points_played INTEGER DEFAULT 0,
    points_won INTEGER DEFAULT 0,
    pressure_points_played INTEGER DEFAULT 0, -- Points at game point, etc.
    pressure_points_won INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE (match_id, player_id)
);

-- Performance Impact Records
CREATE TABLE performance_impacts (
    id SERIAL PRIMARY KEY,
    match_id INTEGER NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    player_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    impact_type VARCHAR(30) NOT NULL, -- e.g., "Strength", "Weakness", "Improvement"
    dimension_code VARCHAR(3) NOT NULL,
    impact_value DECIMAL(5, 2) NOT NULL,
    impact_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Initial Data: Skill Dimensions
INSERT INTO skill_dimensions (code, name, description, weight_in_composite, display_order) VALUES
('SRV', 'Serve Strength', 'Measures effectiveness of the serve as an offensive weapon', 1.0, 1),
('RET', 'Return Accuracy', 'Evaluates ability to effectively return serves', 1.0, 2),
('NET', 'Net Play', 'Assesses volleying skills and net control', 1.2, 3),
('DNK', 'Dinking/Soft Game', 'Measures control and consistency in soft-game exchanges', 1.3, 4),
('PWR', 'Power Shots/Drives', 'Evaluates driving and power shot effectiveness', 1.0, 5),
('MOV', 'Court Movement', 'Tracks court coverage and positioning', 0.9, 6),
('STR', 'Strategic Awareness', 'Measures shot selection and tactical decision-making', 1.1, 7),
('MNT', 'Mental Toughness', 'Evaluates performance under pressure and focus', 1.0, 8);

-- Indexes for Performance
CREATE INDEX user_timestamp_idx ON dimension_history(user_id, timestamp);
CREATE INDEX match_user_idx ON match_dimension_impacts(match_id, user_id);
CREATE INDEX user_active_idx ON skill_improvement_recs(user_id, is_completed);
CREATE INDEX match_statistics_match_idx ON match_statistics(match_id);
CREATE INDEX match_statistics_player_idx ON match_statistics(player_id);
CREATE INDEX performance_impacts_match_idx ON performance_impacts(match_id);
CREATE INDEX performance_impacts_player_idx ON performance_impacts(player_id);

-- Comments for documentation
COMMENT ON TABLE skill_dimensions IS 'Reference table defining the skill dimensions measured in the CourtIQ system';
COMMENT ON TABLE player_dimensions IS 'Current skill dimension values for each player';
COMMENT ON TABLE dimension_history IS 'Historical record of dimension value changes over time';
COMMENT ON TABLE match_dimension_impacts IS 'Records how specific matches affected dimension values';
COMMENT ON TABLE composite_ratings IS 'Overall CourtIQ rating calculated from dimension values';
COMMENT ON TABLE skill_improvement_recs IS 'Personalized recommendations for skill improvement';
COMMENT ON TABLE match_statistics IS 'Detailed statistical breakdown of player performance in matches';
COMMENT ON TABLE performance_impacts IS 'Notable performance aspects identified during match analysis';

-- End of schema