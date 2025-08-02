/**
 * Sample Course Module Data
 * DAF Level 2: Database Population for Testing
 */

import { db } from '../db';
import { courseModules } from '../../shared/schema/course-modules';

export async function seedCourseModules() {
  console.log('[SEED] Starting Course Module data population...');
  
  try {
    // Sample modules for PCP Level 1
    const level1Modules = [
      {
        pcpLevel: 1,
        moduleNumber: 1,
        title: "Fundamentals of Pickleball Coaching",
        description: "Introduction to coaching principles, safety protocols, and basic instruction techniques for new pickleball coaches.",
        content: `
          <h2>Welcome to PCP Level 1 Coaching</h2>
          <p>This foundational module introduces you to the essential principles of pickleball coaching. You'll learn about safety protocols, basic instruction techniques, and how to create a positive learning environment for players of all ages and skill levels.</p>
          
          <h3>Key Topics Covered:</h3>
          <ul>
            <li>Coach responsibilities and professional standards</li>
            <li>Safety protocols and court management</li>
            <li>Basic teaching methodologies</li>
            <li>Effective communication with students</li>
            <li>Equipment knowledge and court setup</li>
          </ul>
          
          <h3>Learning Outcomes:</h3>
          <p>By completing this module, you will be able to:</p>
          <ul>
            <li>Demonstrate proper safety protocols</li>
            <li>Explain basic pickleball rules and scoring</li>
            <li>Use effective communication techniques</li>
            <li>Set up proper practice environments</li>
          </ul>
        `,
        videoUrl: "https://www.youtube.com/watch?v=example1",
        estimatedDuration: 45,
        learningObjectives: JSON.stringify([
          "Understand fundamental coaching responsibilities",
          "Implement basic safety protocols",
          "Demonstrate effective communication techniques",
          "Apply basic teaching methodologies"
        ]),
        skillsRequired: "Basic pickleball knowledge",
        skillsGained: "Foundation coaching skills, safety awareness, communication techniques",
        hasAssessment: true,
        passingScore: 80,
        maxAttempts: 3,
        associatedDrills: JSON.stringify([1, 2, 3, 4, 5]),
        practicalExercises: JSON.stringify([
          "Practice explaining basic rules to a beginner",
          "Demonstrate proper court setup",
          "Conduct a 10-minute safety briefing"
        ]),
        isActive: true,
        version: "1.0"
      },
      {
        pcpLevel: 1,
        moduleNumber: 2,
        title: "Basic Stroke Mechanics and Instruction",
        description: "Learn to teach fundamental pickleball strokes including forehand, backhand, serves, and volleys with proper technique demonstrations.",
        content: `
          <h2>Teaching Basic Stroke Mechanics</h2>
          <p>This module focuses on the fundamental strokes in pickleball and how to effectively teach them to students. You'll learn proper biomechanics, common errors, and correction techniques.</p>
          
          <h3>Strokes Covered:</h3>
          <ul>
            <li>Forehand groundstroke technique</li>
            <li>Backhand groundstroke fundamentals</li>
            <li>Serve mechanics and placement</li>
            <li>Volley techniques at the net</li>
            <li>Return of serve positioning</li>
          </ul>
          
          <h3>Teaching Methodology:</h3>
          <p>Learn progressive teaching methods:</p>
          <ul>
            <li>Break down complex movements into simple steps</li>
            <li>Use visual demonstrations effectively</li>
            <li>Provide constructive feedback</li>
            <li>Create appropriate practice drills</li>
          </ul>
        `,
        videoUrl: "https://www.youtube.com/watch?v=example2",
        estimatedDuration: 60,
        learningObjectives: JSON.stringify([
          "Demonstrate proper stroke mechanics",
          "Identify and correct common stroke errors",
          "Design progressive skill-building exercises",
          "Provide effective technical feedback"
        ]),
        skillsRequired: "Module 1 completion, basic stroke proficiency",
        skillsGained: "Technical instruction skills, error correction, progressive training design",
        hasAssessment: true,
        passingScore: 85,
        maxAttempts: 3,
        associatedDrills: JSON.stringify([6, 7, 8, 9, 10]),
        practicalExercises: JSON.stringify([
          "Demonstrate forehand technique breakdown",
          "Create a 15-minute stroke instruction lesson",
          "Practice providing technical feedback"
        ]),
        isActive: true,
        version: "1.0"
      },
      {
        pcpLevel: 1,
        moduleNumber: 3,
        title: "Court Positioning and Basic Strategy",
        description: "Understanding court positioning, basic doubles strategy, and how to teach tactical awareness to beginning and intermediate players.",
        content: `
          <h2>Court Positioning and Strategy Fundamentals</h2>
          <p>Strategic understanding is crucial for player development. This module covers basic positioning, doubles strategy, and how to develop tactical awareness in your students.</p>
          
          <h3>Positioning Concepts:</h3>
          <ul>
            <li>Baseline positioning and movement</li>
            <li>Net positioning and responsibilities</li>
            <li>Transition zone awareness</li>
            <li>Doubles positioning and communication</li>
            <li>Court coverage patterns</li>
          </ul>
          
          <h3>Basic Strategy Elements:</h3>
          <ul>
            <li>When to approach the net</li>
            <li>Shot selection based on position</li>
            <li>Defensive vs. offensive positioning</li>
            <li>Partner communication in doubles</li>
          </ul>
        `,
        videoUrl: "https://www.youtube.com/watch?v=example3",
        estimatedDuration: 50,
        learningObjectives: JSON.stringify([
          "Explain fundamental court positioning",
          "Teach basic doubles strategy",
          "Develop tactical awareness in students",
          "Design strategy-focused practice sessions"
        ]),
        skillsRequired: "Modules 1-2 completion, understanding of basic rules",
        skillsGained: "Strategic thinking, tactical instruction, positional awareness",
        hasAssessment: true,
        passingScore: 80,
        maxAttempts: 3,
        associatedDrills: JSON.stringify([11, 12, 13, 14, 15]),
        practicalExercises: JSON.stringify([
          "Diagram basic court positioning scenarios",
          "Teach a 20-minute strategy lesson",
          "Create positioning drills for doubles play"
        ]),
        isActive: true,
        version: "1.0"
      }
    ];

    // Sample modules for PCP Level 2
    const level2Modules = [
      {
        pcpLevel: 2,
        moduleNumber: 1,
        title: "Advanced Technical Skills Development",
        description: "Advanced stroke refinement, specialty shots, and techniques for coaching intermediate to advanced players.",
        content: `
          <h2>Advanced Technical Skills for Level 2 Coaches</h2>
          <p>Building on Level 1 fundamentals, this module introduces advanced technical skills and specialty shots essential for coaching higher-level players.</p>
          
          <h3>Advanced Techniques:</h3>
          <ul>
            <li>Third shot drop execution and instruction</li>
            <li>Dinking techniques and soft game development</li>
            <li>Advanced serving strategies and spins</li>
            <li>Attacking shots and put-aways</li>
            <li>Defensive shot selection and execution</li>
          </ul>
          
          <h3>Coaching Advanced Players:</h3>
          <ul>
            <li>Identifying technical refinement needs</li>
            <li>Progressive skill development sequences</li>
            <li>Mental preparation and focus training</li>
            <li>Competitive play preparation</li>
          </ul>
        `,
        videoUrl: "https://www.youtube.com/watch?v=example4",
        estimatedDuration: 75,
        learningObjectives: JSON.stringify([
          "Master advanced stroke techniques",
          "Develop specialty shot instruction methods",
          "Create progressive training programs",
          "Coach competitive-level players effectively"
        ]),
        skillsRequired: "PCP Level 1 certification, advanced playing ability",
        skillsGained: "Advanced technical coaching, competitive preparation, specialized instruction",
        hasAssessment: true,
        passingScore: 85,
        maxAttempts: 2,
        associatedDrills: JSON.stringify([16, 17, 18, 19, 20]),
        practicalExercises: JSON.stringify([
          "Demonstrate third shot drop progression",
          "Design advanced skills training session",
          "Coach a competitive strategy session"
        ]),
        isActive: true,
        version: "1.0"
      }
    ];

    // Insert sample data
    const allModules = [...level1Modules, ...level2Modules];
    
    for (const module of allModules) {
      await db.insert(courseModules).values(module);
      console.log(`[SEED] Inserted module: ${module.title}`);
    }
    
    console.log(`[SEED] Successfully inserted ${allModules.length} course modules`);
    return { success: true, count: allModules.length };
    
  } catch (error) {
    console.error('[SEED] Error seeding course modules:', error);
    throw error;
  }
}

// Run seeding if called directly
if (require.main === module) {
  seedCourseModules()
    .then(() => {
      console.log('[SEED] Course modules seeding completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('[SEED] Seeding failed:', error);
      process.exit(1);
    });
}