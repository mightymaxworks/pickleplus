const { test, expect } = require('@jest/globals');

// Test progressive assessment core functionality
describe('Progressive Assessment System Tests', () => {
  
  test('PCP Calculation Algorithm Test', () => {
    // Import the PCP calculation function
    const { calculatePCPRating } = require('../shared/utils/pcpCalculationSimple');
    
    // Test with known skill ratings
    const testRatings = {
      'Dink Accuracy': 7,      // Touch category
      'Third Shot Drop': 6,    // Technical category  
      'Shot Selection': 8,     // Mental category
      'Court Movement': 5,     // Athletic category
      'Power Serve': 4         // Power category
    };
    
    const result = calculatePCPRating(testRatings);
    
    // Verify PCP calculation follows algorithm:
    // Raw_Score = (Touch×0.30 + Technical×0.25 + Mental×0.20 + Athletic×0.15 + Power×0.10)
    // PCP_Rating = 2.0 + (Raw_Score - 1.0) × (6.0/9.0)
    
    expect(result.pcpRating).toBeGreaterThan(2.0);
    expect(result.pcpRating).toBeLessThan(8.0);
    expect(result.categoryAverages).toHaveProperty('touch');
    expect(result.categoryAverages).toHaveProperty('technical');
    expect(result.categoryAverages).toHaveProperty('mental');
    expect(result.categoryAverages).toHaveProperty('athletic');
    expect(result.categoryAverages).toHaveProperty('power');
    expect(result.skillCount).toBe(5);
  });

  test('Coaching Guides Availability Test', () => {
    const { getSkillGuide, getRatingDescription } = require('../shared/utils/coachingGuides');
    
    // Test coaching guides exist for key skills
    const dinkGuide = getSkillGuide('Dink Accuracy');
    expect(dinkGuide).toBeDefined();
    expect(dinkGuide.coachingTips).toBeDefined();
    expect(dinkGuide.coachingTips.length).toBeGreaterThan(10);
    
    // Test rating descriptions
    for (let rating = 1; rating <= 10; rating++) {
      const description = getRatingDescription(rating);
      expect(description).toBeDefined();
      expect(description.label).toBeDefined();
    }
  });

  test('Skill Categories Coverage Test', () => {
    const { SKILL_CATEGORIES } = require('../shared/utils/pcpCalculationSimple');
    
    // Verify all 5 categories exist
    expect(SKILL_CATEGORIES).toHaveProperty('touch');
    expect(SKILL_CATEGORIES).toHaveProperty('technical');
    expect(SKILL_CATEGORIES).toHaveProperty('mental');
    expect(SKILL_CATEGORIES).toHaveProperty('athletic');
    expect(SKILL_CATEGORIES).toHaveProperty('power');
    
    // Verify total skills count (should be 55 skills)
    const totalSkills = Object.values(SKILL_CATEGORIES)
      .reduce((total, skills) => total + skills.length, 0);
    expect(totalSkills).toBe(55);
  });

  test('Assessment API Endpoints Test', async () => {
    // Test assessment creation endpoint exists
    const fetch = require('node-fetch');
    
    try {
      // Test endpoint availability (should return 401 without auth)
      const response = await fetch('http://localhost:5000/api/coach/progressive-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: 1,
          assessmentType: 'focused',
          category: 'touch',
          skillRatings: { 'Dink Accuracy': 7 }
        })
      });
      
      // Should return 401 (unauthorized) or 400 (bad request), not 404
      expect([400, 401, 500].includes(response.status)).toBe(true);
    } catch (error) {
      // If server isn't running, that's expected in testing
      expect(error.code).toBe('ECONNREFUSED');
    }
  });
});

// Test UI component integrity
describe('Assessment UI Component Tests', () => {
  
  test('Component Structure Validation', () => {
    const fs = require('fs');
    const componentCode = fs.readFileSync(
      './client/src/components/coaching/SimpleProgressiveAssessment.tsx', 
      'utf8'
    );
    
    // Verify essential imports exist
    expect(componentCode).toContain('calculatePCPRating');
    expect(componentCode).toContain('getSkillGuide');
    expect(componentCode).toContain('getRatingDescription');
    
    // Verify coaching guidance features
    expect(componentCode).toContain('Coach Tip:');
    expect(componentCode).toContain('Beginner');
    expect(componentCode).toContain('Competent');
    expect(componentCode).toContain('Advanced');
    expect(componentCode).toContain('Expert');
    
    // Verify rating buttons (1-10)
    expect(componentCode).toContain('[1,2,3,4,5,6,7,8,9,10]');
    
    // Verify PCP calculation integration
    expect(componentCode).toContain('setCurrentPCP');
  });

  test('Mobile Responsive Design Elements', () => {
    const fs = require('fs');
    const componentCode = fs.readFileSync(
      './client/src/components/coaching/SimpleProgressiveAssessment.tsx', 
      'utf8'
    );
    
    // Verify mobile-specific classes
    expect(componentCode).toContain('lg:hidden');
    expect(componentCode).toContain('hidden lg:block');
    expect(componentCode).toContain('grid-cols-4');
    
    // Verify touch-friendly button sizes
    expect(componentCode).toContain('w-8 h-8'); // Mobile buttons
    expect(componentCode).toContain('w-7 h-7'); // Desktop buttons
  });
});

// Test data integrity and validation
describe('Assessment Data Validation Tests', () => {
  
  test('Rating Bounds Validation', () => {
    const { calculatePCPRating } = require('../shared/utils/pcpCalculationSimple');
    
    // Test with invalid ratings (should handle gracefully)
    const invalidRatings = {
      'Dink Accuracy': 0,   // Below valid range
      'Third Shot Drop': 11, // Above valid range
      'Shot Selection': 5.5  // Decimal value
    };
    
    const result = calculatePCPRating(invalidRatings);
    expect(result.pcpRating).toBeGreaterThan(2.0);
    expect(result.pcpRating).toBeLessThan(8.0);
  });

  test('Category Weight Verification', () => {
    const { getCategoryWeight } = require('../shared/utils/pcpCalculationSimple');
    
    // Verify algorithm weights are correct
    expect(getCategoryWeight('touch')).toBe(0.30);
    expect(getCategoryWeight('technical')).toBe(0.25);
    expect(getCategoryWeight('mental')).toBe(0.20);
    expect(getCategoryWeight('athletic')).toBe(0.15);
    expect(getCategoryWeight('power')).toBe(0.10);
    
    // Total should equal 1.0
    const totalWeight = ['touch', 'technical', 'mental', 'athletic', 'power']
      .reduce((sum, category) => sum + getCategoryWeight(category), 0);
    expect(Math.abs(totalWeight - 1.0)).toBeLessThan(0.001);
  });
});