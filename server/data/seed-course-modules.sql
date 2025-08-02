-- Sample Course Module Data Population
-- DAF Level 2: Database Testing Data

INSERT INTO course_modules (
  pcp_level, module_number, title, description, content, video_url,
  estimated_duration_minutes, learning_objectives, skills_required, skills_gained,
  has_assessment, passing_score, max_attempts, associated_drills, practical_exercises,
  is_active, version
) VALUES
-- PCP Level 1 Modules
(1, 1, 'Fundamentals of Pickleball Coaching', 
 'Introduction to coaching principles, safety protocols, and basic instruction techniques for new pickleball coaches.',
 '<h2>Welcome to PCP Level 1 Coaching</h2><p>This foundational module introduces you to the essential principles of pickleball coaching. You will learn about safety protocols, basic instruction techniques, and how to create a positive learning environment for players of all ages and skill levels.</p><h3>Key Topics Covered:</h3><ul><li>Coach responsibilities and professional standards</li><li>Safety protocols and court management</li><li>Basic teaching methodologies</li><li>Effective communication with students</li><li>Equipment knowledge and court setup</li></ul>',
 'https://www.youtube.com/watch?v=example1',
 45,
 '["Understand fundamental coaching responsibilities", "Implement basic safety protocols", "Demonstrate effective communication techniques", "Apply basic teaching methodologies"]',
 'Basic pickleball knowledge',
 'Foundation coaching skills, safety awareness, communication techniques',
 true, 80, 3,
 '[1, 2, 3, 4, 5]',
 '["Practice explaining basic rules to a beginner", "Demonstrate proper court setup", "Conduct a 10-minute safety briefing"]',
 true, '1.0'),

(1, 2, 'Basic Stroke Mechanics and Instruction',
 'Learn to teach fundamental pickleball strokes including forehand, backhand, serves, and volleys with proper technique demonstrations.',
 '<h2>Teaching Basic Stroke Mechanics</h2><p>This module focuses on the fundamental strokes in pickleball and how to effectively teach them to students. You will learn proper biomechanics, common errors, and correction techniques.</p><h3>Strokes Covered:</h3><ul><li>Forehand groundstroke technique</li><li>Backhand groundstroke fundamentals</li><li>Serve mechanics and placement</li><li>Volley techniques at the net</li><li>Return of serve positioning</li></ul>',
 'https://www.youtube.com/watch?v=example2',
 60,
 '["Demonstrate proper stroke mechanics", "Identify and correct common stroke errors", "Design progressive skill-building exercises", "Provide effective technical feedback"]',
 'Module 1 completion, basic stroke proficiency',
 'Technical instruction skills, error correction, progressive training design',
 true, 85, 3,
 '[6, 7, 8, 9, 10]',
 '["Demonstrate forehand technique breakdown", "Create a 15-minute stroke instruction lesson", "Practice providing technical feedback"]',
 true, '1.0'),

(1, 3, 'Court Positioning and Basic Strategy',
 'Understanding court positioning, basic doubles strategy, and how to teach tactical awareness to beginning and intermediate players.',
 '<h2>Court Positioning and Strategy Fundamentals</h2><p>Strategic understanding is crucial for player development. This module covers basic positioning, doubles strategy, and how to develop tactical awareness in your students.</p><h3>Positioning Concepts:</h3><ul><li>Baseline positioning and movement</li><li>Net positioning and responsibilities</li><li>Transition zone awareness</li><li>Doubles positioning and communication</li><li>Court coverage patterns</li></ul>',
 'https://www.youtube.com/watch?v=example3',
 50,
 '["Explain fundamental court positioning", "Teach basic doubles strategy", "Develop tactical awareness in students", "Design strategy-focused practice sessions"]',
 'Modules 1-2 completion, understanding of basic rules',
 'Strategic thinking, tactical instruction, positional awareness',
 true, 80, 3,
 '[11, 12, 13, 14, 15]',
 '["Diagram basic court positioning scenarios", "Teach a 20-minute strategy lesson", "Create positioning drills for doubles play"]',
 true, '1.0'),

-- PCP Level 2 Module  
(2, 1, 'Advanced Technical Skills Development',
 'Advanced stroke refinement, specialty shots, and techniques for coaching intermediate to advanced players.',
 '<h2>Advanced Technical Skills for Level 2 Coaches</h2><p>Building on Level 1 fundamentals, this module introduces advanced technical skills and specialty shots essential for coaching higher-level players.</p><h3>Advanced Techniques:</h3><ul><li>Third shot drop execution and instruction</li><li>Dinking techniques and soft game development</li><li>Advanced serving strategies and spins</li><li>Attacking shots and put-aways</li><li>Defensive shot selection and execution</li></ul>',
 'https://www.youtube.com/watch?v=example4',
 75,
 '["Master advanced stroke techniques", "Develop specialty shot instruction methods", "Create progressive training programs", "Coach competitive-level players effectively"]',
 'PCP Level 1 certification, advanced playing ability',
 'Advanced technical coaching, competitive preparation, specialized instruction',
 true, 85, 2,
 '[16, 17, 18, 19, 20]',
 '["Demonstrate third shot drop progression", "Design advanced skills training session", "Coach a competitive strategy session"]',
 true, '1.0');