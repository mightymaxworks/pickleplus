/**
 * PKL-278651-SAGE-0009-DRILLS - Drill Database Setup
 * 
 * This script creates the required database tables for the pickleball drills
 * feature and adds some sample drill data to allow testing.
 */

import { pool } from './server/db';

/**
 * Create the necessary database tables if they don't exist
 */
async function createTables() {
  console.log("Creating Pickleball drill tables...");
  
  try {
    // Check if pickleball_drills table exists
    const checkResult = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'pickleball_drills'
      );
    `);
    
    const tableExists = checkResult.rows[0].exists;
    
    if (tableExists) {
      console.log("Tables already exist, skipping creation.");
      return;
    }
    
    // Create tables using raw SQL to ensure they're created in the correct order
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pickleball_drills (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        skill_level TEXT NOT NULL,
        focus_areas TEXT[] NOT NULL,
        duration INTEGER NOT NULL,
        participants INTEGER NOT NULL,
        equipment TEXT[] NOT NULL,
        setup_instructions TEXT NOT NULL,
        execution_steps TEXT[] NOT NULL,
        success_metrics TEXT[] NOT NULL,
        progression_options TEXT[],
        related_rules TEXT[],
        media_urls TEXT[],
        coaching_tips TEXT[],
        created_by INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        last_modified_by INTEGER,
        last_modified_at TIMESTAMP,
        status TEXT NOT NULL DEFAULT 'active',
        source TEXT NOT NULL,
        internal_notes TEXT,
        recommendation_count INTEGER NOT NULL DEFAULT 0,
        average_feedback_rating INTEGER,
        last_recommended_at TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS drill_feedback (
        id SERIAL PRIMARY KEY,
        drill_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        rating INTEGER NOT NULL,
        comment TEXT,
        helpfulness_rating INTEGER,
        difficulty_rating INTEGER,
        completed_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS drill_recommendations (
        id SERIAL PRIMARY KEY,
        drill_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        conversation_id TEXT,
        recommended_at TIMESTAMP DEFAULT NOW() NOT NULL,
        context TEXT,
        viewed BOOLEAN NOT NULL DEFAULT FALSE,
        saved BOOLEAN NOT NULL DEFAULT FALSE,
        completed BOOLEAN NOT NULL DEFAULT FALSE
      );
      
      CREATE TABLE IF NOT EXISTS drill_generation_params (
        id SERIAL PRIMARY KEY,
        base_drill_id INTEGER,
        user_id INTEGER NOT NULL,
        requested_at TIMESTAMP DEFAULT NOW() NOT NULL,
        params JSONB NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        result_drill_id INTEGER,
        error TEXT
      );
    `);
    
    console.log("Tables created successfully.");
    
  } catch (error) {
    console.error("Error creating tables:", error);
    throw error;
  }
}

/**
 * Insert sample drill data
 */
async function insertSampleDrills() {
  console.log("Inserting sample drill data...");
  
  try {
    // Check if we already have data
    const countResult = await pool.query('SELECT COUNT(*) FROM pickleball_drills');
    const drillCount = parseInt(countResult.rows[0].count);
    
    if (drillCount > 0) {
      console.log(`Found ${drillCount} drills, skipping sample data insertion.`);
      return;
    }
    
    // Sample drills - focused on "dink" related drills
    const sampleDrills = [
      {
        name: "Precision Dink Practice",
        category: "technical",
        skillLevel: "intermediate",
        focusAreas: ["technical", "consistency", "kitchen"],
        duration: 15,
        participants: 2,
        equipment: ["paddle", "ball", "court", "cones"],
        setupInstructions: "Place 4 cones in the kitchen area as targets, two on each side of the net.",
        executionSteps: [
          "Partners stand at the kitchen line across from each other.",
          "Dink the ball back and forth, aiming for the cones on your partner's side.",
          "One point for each cone hit.",
          "Continue for 5 minutes, then switch sides of the court and repeat."
        ],
        successMetrics: [
          "Hit at least 10 cones in 15 minutes",
          "Maintain a rally of at least 10 shots in a row"
        ],
        progressionOptions: [
          "Increase distance between cones for more challenge",
          "Add time constraint: hit all cones within 60 seconds"
        ],
        relatedRules: ["kitchen_rule", "non_volley_zone"],
        coachingTips: [
          "Keep your paddle face open and wrist firm",
          "Focus on soft control rather than power",
          "Maintain a relaxed grip pressure"
        ],
        createdBy: 1,
        source: "admin"
      },
      {
        name: "Third Shot Dink Transition",
        category: "tactical",
        skillLevel: "intermediate",
        focusAreas: ["tactical", "footwork", "kitchen"],
        duration: 20,
        participants: 4,
        equipment: ["paddle", "ball", "court"],
        setupInstructions: "Two players at the baseline, two at the kitchen line.",
        executionSteps: [
          "Baseline player serves diagonally.",
          "Return player hits to baseline player's partner.",
          "Third shot must be a dink to the kitchen.",
          "Baseline players then move up to the kitchen line.",
          "Continue rally with dinks until point is over.",
          "Rotate positions after each point."
        ],
        successMetrics: [
          "Successfully execute at least 7/10 third shot dinks",
          "Smoothly transition from baseline to kitchen"
        ],
        progressionOptions: [
          "Add a defensive lob in response to the third shot dink",
          "Require serving team to win 3 consecutive points before rotating"
        ],
        relatedRules: ["kitchen_rule", "service_rules"],
        coachingTips: [
          "Bend your knees during the third shot dink for better control",
          "Call 'mine' or 'yours' with your partner when deciding who takes the shot",
          "Use a continental grip for better dink control"
        ],
        createdBy: 1,
        source: "admin"
      },
      {
        name: "Cross-Court Dink Challenge",
        category: "technical",
        skillLevel: "beginner",
        focusAreas: ["technical", "accuracy", "kitchen"],
        duration: 10,
        participants: 2,
        equipment: ["paddle", "ball", "court", "targets"],
        setupInstructions: "Place small targets (e.g., towels) in the cross-court kitchen corners.",
        executionSteps: [
          "Players stand at opposite kitchen corners (diagonally).",
          "Dink cross-court aiming for the targets.",
          "Each player counts successful hits to their targets.",
          "Play for 10 minutes, switching sides halfway through."
        ],
        successMetrics: [
          "Hit the target at least 15 times in 10 minutes",
          "Maintain at least 8 consecutive cross-court dinks"
        ],
        progressionOptions: [
          "Add a time constraint: tally how many targets you can hit in 2 minutes",
          "Alternate forehand and backhand dinks"
        ],
        relatedRules: ["kitchen_rule"],
        coachingTips: [
          "Open your stance slightly toward the cross-court target",
          "Focus on ball placement rather than power",
          "Watch your opponent's contact point to anticipate the return"
        ],
        createdBy: 1,
        source: "admin"
      },
      {
        name: "Dink Around the World",
        category: "consistency",
        skillLevel: "advanced",
        focusAreas: ["consistency", "footwork", "kitchen"],
        duration: 15,
        participants: 4,
        equipment: ["paddle", "ball", "court"],
        setupInstructions: "All four players stand at the kitchen line, one in each position.",
        executionSteps: [
          "Start with a dink to the player diagonally opposite.",
          "That player dinks to the player on their right (or left, decide beforehand).",
          "Continue in sequence, with each player dinking to the next.",
          "If a player makes an error, they do 5 quick feet drills before rejoining."
        ],
        successMetrics: [
          "Complete at least 20 consecutive dinks around the world",
          "Maintain proper kitchen position throughout"
        ],
        progressionOptions: [
          "Increase speed gradually",
          "Add a second ball once players are comfortable with the pattern"
        ],
        relatedRules: ["kitchen_rule", "non_volley_zone"],
        coachingTips: [
          "Focus on preparation between shots",
          "Move your feet to get in proper position",
          "Communicate with your partner when the pattern changes"
        ],
        createdBy: 1,
        source: "admin"
      },
      {
        name: "Defensive Dink Recovery",
        category: "tactical",
        skillLevel: "advanced",
        focusAreas: ["tactical", "mental", "kitchen"],
        duration: 20,
        participants: 3,
        equipment: ["paddle", "ball", "court"],
        setupInstructions: "Two players at the kitchen line, one player as the 'attacker' at mid-court.",
        executionSteps: [
          "Kitchen players dink back and forth.",
          "Attacker randomly enters the drill with a more aggressive shot to either player.",
          "Defensive player must respond with a controlled dink.",
          "Resume the dinking pattern until the next attack.",
          "Rotate positions every 5 minutes."
        ],
        successMetrics: [
          "Successfully defend 7/10 attack shots with a quality dink",
          "Maintain composure and proper technique under pressure"
        ],
        progressionOptions: [
          "Attacker uses more power or varied placements",
          "Defenders restricted to using only backhand or forehand"
        ],
        relatedRules: ["kitchen_rule"],
        coachingTips: [
          "Stay low and ready for the attack",
          "Absorb the pace with a soft paddle and loose grip",
          "Focus on placement rather than returning power with power"
        ],
        createdBy: 1,
        source: "admin"
      }
    ];
    
    // Insert the sample drills using raw SQL to avoid type issues
    for (const drill of sampleDrills) {
      await pool.query(`
        INSERT INTO pickleball_drills 
        (name, category, skill_level, focus_areas, duration, participants, equipment, 
        setup_instructions, execution_steps, success_metrics, progression_options, 
        related_rules, coaching_tips, created_by, source)
        VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      `, [
        drill.name,
        drill.category,
        drill.skillLevel,
        drill.focusAreas,
        drill.duration,
        drill.participants,
        drill.equipment,
        drill.setupInstructions,
        drill.executionSteps,
        drill.successMetrics,
        drill.progressionOptions || null,
        drill.relatedRules || null,
        drill.coachingTips || null,
        drill.createdBy,
        drill.source
      ]);
    }
    
    console.log(`Inserted ${sampleDrills.length} sample drills.`);
    
  } catch (error) {
    console.error("Error inserting sample data:", error);
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  try {
    await createTables();
    await insertSampleDrills();
    console.log("Drill database setup completed successfully!");
  } catch (error) {
    console.error("Error in drill database setup:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the script
main();