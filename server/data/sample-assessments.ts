// Sample assessment data for development and testing
export const sampleAssessmentTemplates = [
  {
    id: 1,
    title: 'PCP Level 1 - Basic Coaching Knowledge',
    description: 'Fundamental assessment covering basic coaching principles, safety protocols, and beginner instruction techniques.',
    pcpLevel: 1,
    assessmentType: 'written',
    skillCategories: ['Technical', 'Safety', 'Communication'],
    totalQuestions: 15,
    passingScore: 70,
    timeLimit: 30,
    maxAttempts: 3,
    instructions: 'Answer all questions to the best of your ability. You have 30 minutes to complete this assessment.',
    isActive: true
  },
  {
    id: 2,
    title: 'PCP Level 1 - Practical Teaching Skills',
    description: 'Hands-on assessment of basic teaching skills and court safety awareness.',
    pcpLevel: 1,
    assessmentType: 'practical',
    skillCategories: ['Technical', 'Communication', 'Safety'],
    totalQuestions: 8,
    passingScore: 75,
    timeLimit: 45,
    maxAttempts: 2,
    instructions: 'Demonstrate basic teaching skills and safety protocols as outlined in the PCP Level 1 curriculum.',
    isActive: true
  },
  {
    id: 3,
    title: 'PCP Level 2 - Advanced Strategy & Tactics',
    description: 'Comprehensive assessment of intermediate coaching strategies and tactical knowledge.',
    pcpLevel: 2,
    assessmentType: 'combined',
    skillCategories: ['Tactical', 'Technical', 'Mental'],
    totalQuestions: 20,
    passingScore: 75,
    timeLimit: 40,
    maxAttempts: 3,
    instructions: 'This assessment combines written questions with practical demonstrations. Complete all sections within the time limit.',
    isActive: true
  }
];

export const sampleAssessmentQuestions = [
  // Level 1 Basic Knowledge Questions
  {
    id: 1,
    templateId: 1,
    questionType: 'multiple_choice',
    questionText: 'What is the standard height of a pickleball net at the center?',
    options: ['34 inches', '36 inches', '35 inches', '37 inches'],
    correctAnswer: '36 inches',
    points: 2,
    skillCategory: 'Technical',
    difficultyLevel: 1,
    explanation: 'The official pickleball net height is 36 inches at the center and 34 inches at the posts.',
    orderIndex: 1
  },
  {
    id: 2,
    templateId: 1,
    questionType: 'multiple_choice',
    questionText: 'Which serve is NOT allowed in pickleball?',
    options: ['Underhand serve', 'Overhand serve', 'Side-arm serve', 'Drop serve'],
    correctAnswer: 'Overhand serve',
    points: 2,
    skillCategory: 'Technical',
    difficultyLevel: 1,
    explanation: 'Pickleball serves must be made underhand with an upward arc. Overhand serves are not permitted.',
    orderIndex: 2
  },
  {
    id: 3,
    templateId: 1,
    questionType: 'multiple_choice',
    questionText: 'What is the primary safety concern when teaching beginners?',
    options: ['Court positioning', 'Paddle grip', 'Eye protection', 'All of the above'],
    correctAnswer: 'All of the above',
    points: 3,
    skillCategory: 'Safety',
    difficultyLevel: 1,
    explanation: 'All aspects are important for beginner safety: proper positioning prevents collisions, correct grip prevents injury, and eye protection is essential.',
    orderIndex: 3
  },
  {
    id: 4,
    templateId: 1,
    questionType: 'multiple_choice',
    questionText: 'When teaching the ready position, what should be emphasized?',
    options: ['Feet together', 'Knees locked', 'Balanced stance with bent knees', 'Leaning forward'],
    correctAnswer: 'Balanced stance with bent knees',
    points: 2,
    skillCategory: 'Technical',
    difficultyLevel: 1,
    explanation: 'The ready position requires a balanced stance with slightly bent knees for quick movement in any direction.',
    orderIndex: 4
  },
  {
    id: 5,
    templateId: 1,
    questionType: 'multiple_choice',
    questionText: 'How should you communicate corrections to a beginner?',
    options: ['Point out every mistake immediately', 'Use positive reinforcement first', 'Focus only on major errors', 'Let them figure it out themselves'],
    correctAnswer: 'Use positive reinforcement first',
    points: 3,
    skillCategory: 'Communication',
    difficultyLevel: 2,
    explanation: 'Positive reinforcement creates a supportive learning environment and builds confidence before making corrections.',
    orderIndex: 5
  },

  // Level 2 Questions
  {
    id: 6,
    templateId: 3,
    questionType: 'multiple_choice',
    questionText: 'What is the most effective strategy against aggressive baseline players?',
    options: ['Match their aggression', 'Use drop shots and soft play', 'Stay at the baseline', 'Hit harder'],
    correctAnswer: 'Use drop shots and soft play',
    points: 3,
    skillCategory: 'Tactical',
    difficultyLevel: 3,
    explanation: 'Drop shots and soft play force aggressive players out of their comfort zone and reduce their power advantage.',
    orderIndex: 1
  },
  {
    id: 7,
    templateId: 3,
    questionType: 'multiple_choice',
    questionText: 'In doubles play, when should you poach?',
    options: ['Whenever possible', 'Only on weak returns', 'When you can finish the point', 'Never'],
    correctAnswer: 'When you can finish the point',
    points: 4,
    skillCategory: 'Tactical',
    difficultyLevel: 3,
    explanation: 'Poaching should be done strategically when you can end the point, not just to intercept any ball.',
    orderIndex: 2
  },
  {
    id: 8,
    templateId: 3,
    questionType: 'multiple_choice',
    questionText: 'How do you help a student overcome fear of the net?',
    options: ['Force them to stay at net', 'Practice soft hands drills', 'Avoid net play entirely', 'Use harder balls'],
    correctAnswer: 'Practice soft hands drills',
    points: 3,
    skillCategory: 'Mental',
    difficultyLevel: 2,
    explanation: 'Soft hands drills build confidence and control at the net, reducing fear through improved skill.',
    orderIndex: 3
  }
];

// Function to seed sample data in development
export async function seedAssessmentData(db: any) {
  console.log('[ASSESSMENT] Seeding sample assessment data...');
  
  try {
    // Note: In a real implementation, you would insert this data into the database
    // For now, this is just structure for reference
    console.log('[ASSESSMENT] Sample data structure ready');
    console.log(`[ASSESSMENT] Templates: ${sampleAssessmentTemplates.length}`);
    console.log(`[ASSESSMENT] Questions: ${sampleAssessmentQuestions.length}`);
  } catch (error) {
    console.error('[ASSESSMENT] Error seeding sample data:', error);
  }
}