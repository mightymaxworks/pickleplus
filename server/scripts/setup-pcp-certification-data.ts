/**
 * Setup PCP Certification Programme Initial Data
 * Creates certification levels, modules, assessments, and requirements
 */

import { storage } from '../storage';

async function setupPcpCertificationData() {
  console.log('Setting up PCP Certification Programme data...');

  try {
    // Level 1: 2-day intensive course
    const level1 = await storage.createPcpCertificationLevel({
      levelName: 'PCP Level 1 Certification',
      levelCode: 'PCP-L1',
      description: 'Essential coaching fundamentals in an intensive 2-day program covering basic instruction techniques and safety protocols.',
      prerequisites: [],
      requirements: [
        'Attend full 2-day intensive course',
        'Pass written certification exam',
        'Demonstrate basic teaching skills',
        'Complete safety and liability training'
      ],
      benefits: [
        'Official PCP Level 1 certification',
        'Foundation coaching authorization',
        'Access to Level 1 coaching resources',
        'Eligibility for facility partnerships'
      ],
      duration: 2, // 2 days
      cost: 69900, // $699
      isActive: true
    });

    // Level 2: Intermediate Coach
    const level2 = await storage.createPcpCertificationLevel({
      levelName: 'PCP Intermediate Coach',
      levelCode: 'PCP-L2',
      description: 'Advanced coaching techniques, game strategy, and player development methodologies.',
      prerequisites: ['PCP-L1'],
      requirements: [
        'Hold PCP Level 1 certification',
        'Complete 8 advanced learning modules',
        'Pass comprehensive written assessment',
        'Demonstrate advanced teaching techniques',
        'Complete 25 hours of coaching experience',
        'Mentorship with certified Level 3 coach'
      ],
      benefits: [
        'Official PCP Level 2 certification',
        'Advanced strategy instruction authorization',
        'Tournament coaching eligibility',
        'Higher rate earning potential'
      ],
      duration: 6,
      cost: 39900, // $399
      isActive: true
    });

    // Level 3: Advanced Coach
    const level3 = await storage.createPcpCertificationLevel({
      levelName: 'PCP Advanced Coach',
      levelCode: 'PCP-L3',
      description: 'Elite coaching skills, mental performance, and professional development strategies.',
      prerequisites: ['PCP-L2'],
      requirements: [
        'Hold PCP Level 2 certification',
        'Complete 10 specialized modules',
        'Pass expert-level assessment',
        'Demonstrate professional coaching session',
        'Complete 50 hours of advanced coaching',
        'Peer evaluation from other Level 3 coaches'
      ],
      benefits: [
        'Official PCP Level 3 certification',
        'Mental performance coaching authorization',
        'Elite player development qualification',
        'Mentorship program participation'
      ],
      duration: 8,
      cost: 59900, // $599
      isActive: true
    });

    // Master Coach
    const masterLevel = await storage.createPcpCertificationLevel({
      levelName: 'PCP Master Coach',
      levelCode: 'PCP-MC',
      description: 'The highest level of coaching certification, focusing on coach education and program development.',
      prerequisites: ['PCP-L3'],
      requirements: [
        'Hold PCP Level 3 certification',
        'Complete 12 master-level modules',
        'Pass comprehensive master assessment',
        'Develop original coaching methodology',
        'Complete 100 hours of elite coaching',
        'Mentor at least 3 Level 1 candidates'
      ],
      benefits: [
        'Official PCP Master Coach certification',
        'Coach trainer authorization',
        'Program development opportunities',
        'Exclusive master coach network access'
      ],
      duration: 12,
      cost: 99900, // $999
      isActive: true
    });

    console.log('✓ Created certification levels');

    // Create Learning Modules for Level 1
    const level1Modules = [
      {
        certificationLevelId: level1.id,
        moduleName: 'Pickleball Fundamentals',
        moduleCode: 'PCP-L1-M1',
        description: 'Core rules, court dimensions, equipment, and basic gameplay',
        learningObjectives: [
          'Understand official pickleball rules',
          'Know court layout and dimensions',
          'Identify proper equipment',
          'Explain basic scoring system'
        ],
        content: {
          sections: ['Rules Overview', 'Court Setup', 'Equipment Guide', 'Scoring System'],
          videos: ['basic-rules.mp4', 'court-setup.mp4'],
          documents: ['official-rules.pdf', 'equipment-guide.pdf']
        },
        estimatedHours: 3,
        orderIndex: 1,
        isRequired: true
      },
      {
        certificationLevelId: level1.id,
        moduleName: 'Teaching Methodology',
        moduleCode: 'PCP-L1-M2',
        description: 'Effective coaching techniques and communication strategies',
        learningObjectives: [
          'Apply adult learning principles',
          'Use effective demonstration techniques',
          'Provide constructive feedback',
          'Manage group dynamics'
        ],
        content: {
          sections: ['Adult Learning', 'Demonstration Techniques', 'Feedback Methods', 'Group Management'],
          videos: ['teaching-techniques.mp4', 'feedback-examples.mp4'],
          documents: ['teaching-guide.pdf', 'communication-tips.pdf']
        },
        estimatedHours: 4,
        orderIndex: 2,
        isRequired: true
      },
      {
        certificationLevelId: level1.id,
        moduleName: 'Basic Stroke Techniques',
        moduleCode: 'PCP-L1-M3',
        description: 'Fundamental strokes and movement patterns',
        learningObjectives: [
          'Demonstrate proper grip techniques',
          'Teach basic serve mechanics',
          'Explain forehand and backhand fundamentals',
          'Understand footwork basics'
        ],
        content: {
          sections: ['Grip Techniques', 'Serving Fundamentals', 'Groundstrokes', 'Basic Footwork'],
          videos: ['grip-demo.mp4', 'serve-technique.mp4', 'groundstrokes.mp4'],
          documents: ['stroke-guide.pdf', 'common-errors.pdf']
        },
        estimatedHours: 5,
        orderIndex: 3,
        isRequired: true
      }
    ];

    for (const moduleData of level1Modules) {
      await storage.createPcpLearningModule(moduleData);
    }

    console.log('✓ Created learning modules');

    // Create Assessments
    const level1Assessment = await storage.createPcpAssessment({
      certificationLevelId: level1.id,
      assessmentName: 'Level 1 Written Assessment',
      assessmentType: 'quiz',
      description: 'Comprehensive test covering all Level 1 learning modules',
      instructions: 'Answer all questions to the best of your ability. You need 80% to pass.',
      questions: [
        {
          type: 'multiple_choice',
          question: 'What is the standard height of a pickleball net?',
          options: ['34 inches', '36 inches', '38 inches', '40 inches'],
          correct: 1,
          points: 5
        },
        {
          type: 'true_false',
          question: 'The serve must be made underhand in pickleball.',
          correct: true,
          points: 5
        },
        {
          type: 'short_answer',
          question: 'Describe the two-bounce rule in pickleball.',
          points: 10,
          expectedLength: 100
        }
      ],
      passingScore: 80,
      maxAttempts: 3,
      timeLimit: 60,
      isRequired: true,
      orderIndex: 1
    });

    const level1PracticalAssessment = await storage.createPcpAssessment({
      certificationLevelId: level1.id,
      assessmentName: 'Teaching Demonstration Video',
      assessmentType: 'video_submission',
      description: 'Submit a 10-minute video demonstrating your teaching skills',
      instructions: 'Record yourself teaching a basic pickleball skill to a beginner. Focus on clear communication and proper demonstration.',
      questions: [
        {
          type: 'video_upload',
          question: 'Upload your teaching demonstration video (10 minutes maximum)',
          requirements: ['Clear audio', 'Visible demonstration', 'Student interaction'],
          points: 50
        }
      ],
      passingScore: 70,
      maxAttempts: 2,
      timeLimit: null,
      isRequired: true,
      orderIndex: 2
    });

    console.log('✓ Created assessments');

    // Create Practical Requirements
    const level1PracticalReqs = [
      {
        certificationLevelId: level1.id,
        requirementName: 'Supervised Coaching Hours',
        description: 'Complete 10 hours of coaching under supervision of a certified coach',
        requiredHours: 10,
        requirementType: 'coaching_hours',
        verificationMethod: 'mentor_verified',
        isRequired: true,
        orderIndex: 1
      },
      {
        certificationLevelId: level1.id,
        requirementName: 'Observation Hours',
        description: 'Observe 5 hours of experienced coaches teaching',
        requiredHours: 5,
        requirementType: 'observation_hours',
        verificationMethod: 'self_reported',
        isRequired: true,
        orderIndex: 2
      }
    ];

    for (const reqData of level1PracticalReqs) {
      await storage.createPcpPracticalRequirement(reqData);
    }

    console.log('✓ Created practical requirements');
    console.log('PCP Certification Programme setup complete!');

  } catch (error) {
    console.error('Error setting up PCP certification data:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  setupPcpCertificationData()
    .then(() => {
      console.log('Setup completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Setup failed:', error);
      process.exit(1);
    });
}

export { setupPcpCertificationData };