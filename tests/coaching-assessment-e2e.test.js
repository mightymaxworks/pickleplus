/**
 * End-to-End Testing Suite for 55-Skill PCP Assessment System
 * 
 * This comprehensive test suite ensures 100% reliability of the coaching assessment workflow:
 * 1. Coach authentication and dashboard access
 * 2. Student assignment validation
 * 3. Complete 55-skill assessment workflow
 * 4. Data persistence and validation
 * 5. Assessment completion and storage
 */

const puppeteer = require('puppeteer');
const { expect } = require('@jest/globals');

describe('55-Skill PCP Assessment System - End-to-End Tests', () => {
  let browser, page;
  
  const TEST_TIMEOUT = 120000; // 2 minutes for complete assessment
  const BASE_URL = process.env.TEST_URL || 'http://localhost:5173';
  
  // Test credentials - using existing admin user with coach privileges
  const COACH_CREDENTIALS = {
    username: 'mightymax',
    password: 'password123'
  };

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: process.env.NODE_ENV === 'production',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: { width: 1280, height: 720 }
    });
  });

  beforeEach(async () => {
    page = await browser.newPage();
    await page.goto(`${BASE_URL}/auth/login`);
  });

  afterEach(async () => {
    await page.close();
  });

  afterAll(async () => {
    await browser.close();
  });

  describe('Coach Authentication & Dashboard Access', () => {
    test('Coach can login and access dashboard', async () => {
      // Login as coach
      await page.type('input[name="username"]', COACH_CREDENTIALS.username);
      await page.type('input[name="password"]', COACH_CREDENTIALS.password);
      await page.click('button[type="submit"]');
      
      // Wait for redirect to dashboard
      await page.waitForNavigation();
      
      // Verify coach dashboard is accessible
      await page.waitForSelector('[data-testid="coach-dashboard"]', { timeout: 10000 });
      
      const pageTitle = await page.title();
      expect(pageTitle).toContain('Coach Dashboard');
      
      // Verify coach level is displayed
      const coachLevel = await page.$eval('[data-testid="coach-level"]', el => el.textContent);
      expect(coachLevel).toMatch(/Level \d+/);
    }, TEST_TIMEOUT);

    test('Assigned students are displayed correctly', async () => {
      await loginAsCoach();
      
      // Wait for students to load
      await page.waitForSelector('[data-testid="assigned-students"]');
      
      // Verify at least one student is assigned
      const studentCards = await page.$$('[data-testid="student-card"]');
      expect(studentCards.length).toBeGreaterThan(0);
      
      // Verify student information is displayed
      const firstStudent = studentCards[0];
      const studentName = await firstStudent.$eval('[data-testid="student-name"]', el => el.textContent);
      const assessmentButton = await firstStudent.$('[data-testid="start-assessment-btn"]');
      
      expect(studentName).toBeTruthy();
      expect(assessmentButton).toBeTruthy();
    });
  });

  describe('55-Skill Assessment Workflow', () => {
    test('Complete assessment workflow - all 5 categories with 55 skills', async () => {
      await loginAsCoach();
      
      // Start assessment for first student
      await page.click('[data-testid="start-assessment-btn"]:first-child');
      
      // Wait for assessment interface to load
      await page.waitForSelector('[data-testid="skill-assessment-interface"]');
      
      // Verify header shows "55-Skill PCP Assessment"
      const assessmentTitle = await page.$eval('[data-testid="assessment-title"]', el => el.textContent);
      expect(assessmentTitle).toContain('55-Skill PCP Assessment');
      
      // Test all 5 categories
      const expectedCategories = [
        { name: 'Groundstrokes and Serves', skills: 11 },
        { name: 'Dinks and Resets', skills: 16 },
        { name: 'Volleys and Smashes', skills: 6 },
        { name: 'Footwork & Fitness', skills: 10 },
        { name: 'Mental Game', skills: 10 }
      ];
      
      let totalSkillsAssessed = 0;
      
      for (let categoryIndex = 0; categoryIndex < expectedCategories.length; categoryIndex++) {
        const category = expectedCategories[categoryIndex];
        
        // Verify category name and description
        const categoryTitle = await page.$eval('[data-testid="category-title"]', el => el.textContent);
        expect(categoryTitle).toContain(category.name);
        
        // Verify correct number of skills in category
        const skillCards = await page.$$('[data-testid="skill-card"]');
        expect(skillCards.length).toBe(category.skills);
        
        // Assess each skill in the category
        for (let skillIndex = 0; skillIndex < category.skills; skillIndex++) {
          const skillCard = skillCards[skillIndex];
          
          // Verify skill name and descriptor are present
          const skillName = await skillCard.$eval('[data-testid="skill-name"]', el => el.textContent);
          const skillDesc = await skillCard.$eval('[data-testid="skill-descriptor"]', el => el.textContent);
          
          expect(skillName).toBeTruthy();
          expect(skillDesc).toBeTruthy();
          expect(skillDesc.length).toBeGreaterThan(20); // Meaningful descriptor
          
          // Rate the skill (random rating 1-10 for testing)
          const rating = Math.floor(Math.random() * 10) + 1;
          await skillCard.click(`[data-testid="rating-${rating}"]`);
          
          // Verify rating is selected
          const selectedRating = await skillCard.$eval('[data-testid="rating-selected"]', el => el.textContent);
          expect(selectedRating).toBe(rating.toString());
          
          totalSkillsAssessed++;
        }
        
        // Progress to next category or complete assessment
        if (categoryIndex < expectedCategories.length - 1) {
          await page.click('[data-testid="next-category-btn"]');
          await page.waitForTimeout(1000); // Brief pause for category transition
        } else {
          // Final category - submit assessment
          await page.click('[data-testid="submit-assessment-btn"]');
        }
      }
      
      // Verify total skills assessed equals 55
      expect(totalSkillsAssessed).toBe(55);
      
      // Wait for completion confirmation
      await page.waitForSelector('[data-testid="assessment-complete"]');
      
      const completionMessage = await page.$eval('[data-testid="completion-message"]', el => el.textContent);
      expect(completionMessage).toContain('55 PCP skills');
      expect(completionMessage).toContain('5 categories');
    }, TEST_TIMEOUT);

    test('Assessment data persistence and retrieval', async () => {
      await loginAsCoach();
      
      // Complete a quick assessment
      await completeTestAssessment();
      
      // Navigate back to dashboard
      await page.click('[data-testid="back-to-dashboard-btn"]');
      
      // Verify assessment appears in recent assessments
      await page.waitForSelector('[data-testid="recent-assessments"]');
      
      const recentAssessments = await page.$$('[data-testid="recent-assessment"]');
      expect(recentAssessments.length).toBeGreaterThan(0);
      
      // Verify assessment details
      const latestAssessment = recentAssessments[0];
      const assessmentType = await latestAssessment.$eval('[data-testid="assessment-type"]', el => el.textContent);
      const skillCount = await latestAssessment.$eval('[data-testid="skill-count"]', el => el.textContent);
      
      expect(assessmentType).toContain('55-Skill PCP');
      expect(skillCount).toContain('55');
    });
  });

  describe('Skill Descriptor Quality Tests', () => {
    test('All skill descriptors meet quality standards', async () => {
      await loginAsCoach();
      await page.click('[data-testid="start-assessment-btn"]:first-child');
      await page.waitForSelector('[data-testid="skill-assessment-interface"]');
      
      const skillDescriptors = [];
      
      // Collect all skill descriptors across categories
      for (let categoryIndex = 0; categoryIndex < 5; categoryIndex++) {
        const skillCards = await page.$$('[data-testid="skill-card"]');
        
        for (const skillCard of skillCards) {
          const skillName = await skillCard.$eval('[data-testid="skill-name"]', el => el.textContent);
          const skillDesc = await skillCard.$eval('[data-testid="skill-descriptor"]', el => el.textContent);
          
          skillDescriptors.push({ name: skillName, descriptor: skillDesc });
          
          // Quality checks for each descriptor
          expect(skillDesc.length).toBeGreaterThan(15); // Minimum meaningful length
          expect(skillDesc.length).toBeLessThan(100); // Not too verbose
          expect(skillDesc).not.toContain('TODO'); // No placeholder text
          expect(skillDesc).not.toContain('TBD'); // No placeholder text
          expect(skillDesc.charAt(0)).toMatch(/[A-Z]/); // Starts with capital letter
        }
        
        // Move to next category
        if (categoryIndex < 4) {
          await page.click('[data-testid="next-category-btn"]');
          await page.waitForTimeout(500);
        }
      }
      
      // Verify total descriptor count
      expect(skillDescriptors.length).toBe(55);
      
      // Verify no duplicate descriptors
      const uniqueDescriptors = new Set(skillDescriptors.map(s => s.descriptor));
      expect(uniqueDescriptors.size).toBe(skillDescriptors.length);
    });
  });

  describe('Assessment Navigation & User Experience', () => {
    test('Progress tracking and navigation controls work correctly', async () => {
      await loginAsCoach();
      await page.click('[data-testid="start-assessment-btn"]:first-child');
      await page.waitForSelector('[data-testid="skill-assessment-interface"]');
      
      // Test category navigation
      for (let categoryIndex = 0; categoryIndex < 5; categoryIndex++) {
        // Verify progress indicator
        const progressText = await page.$eval('[data-testid="progress-indicator"]', el => el.textContent);
        expect(progressText).toContain(`${categoryIndex + 1}/5`);
        
        // Verify progress bar
        const progressBar = await page.$eval('[data-testid="progress-bar"]', el => el.style.width);
        const expectedProgress = ((categoryIndex + 1) / 5 * 100).toFixed(0);
        expect(progressBar).toContain(expectedProgress);
        
        // Test back button (after first category)
        if (categoryIndex > 0) {
          const backButton = await page.$('[data-testid="previous-category-btn"]');
          expect(backButton).toBeTruthy();
        }
        
        // Test next/submit button
        const nextButton = await page.$('[data-testid="next-category-btn"], [data-testid="submit-assessment-btn"]');
        expect(nextButton).toBeTruthy();
        
        // Move to next category
        if (categoryIndex < 4) {
          await completeCurrentCategory();
          await page.click('[data-testid="next-category-btn"]');
          await page.waitForTimeout(500);
        }
      }
    });

    test('Assessment validation prevents incomplete submissions', async () => {
      await loginAsCoach();
      await page.click('[data-testid="start-assessment-btn"]:first-child');
      await page.waitForSelector('[data-testid="skill-assessment-interface"]');
      
      // Try to proceed without rating any skills
      const nextButton = await page.$('[data-testid="next-category-btn"]');
      const isDisabled = await page.evaluate(btn => btn.disabled, nextButton);
      
      expect(isDisabled).toBe(true);
      
      // Rate only some skills
      const skillCards = await page.$$('[data-testid="skill-card"]');
      const halfwayPoint = Math.floor(skillCards.length / 2);
      
      for (let i = 0; i < halfwayPoint; i++) {
        await skillCards[i].click('[data-testid="rating-5"]');
      }
      
      // Button should still be disabled
      const stillDisabled = await page.evaluate(btn => btn.disabled, nextButton);
      expect(stillDisabled).toBe(true);
      
      // Complete all skills in category
      for (let i = halfwayPoint; i < skillCards.length; i++) {
        await skillCards[i].click('[data-testid="rating-5"]');
      }
      
      // Button should now be enabled
      const nowEnabled = await page.evaluate(btn => !btn.disabled, nextButton);
      expect(nowEnabled).toBe(true);
    });
  });

  describe('Error Handling & Recovery', () => {
    test('Assessment handles network interruptions gracefully', async () => {
      await loginAsCoach();
      await page.click('[data-testid="start-assessment-btn"]:first-child');
      await page.waitForSelector('[data-testid="skill-assessment-interface"]');
      
      // Complete first category
      await completeCurrentCategory();
      
      // Simulate network interruption
      await page.setOfflineMode(true);
      
      // Try to submit category
      await page.click('[data-testid="next-category-btn"]');
      
      // Should show error message
      await page.waitForSelector('[data-testid="network-error"]');
      
      // Restore network
      await page.setOfflineMode(false);
      
      // Retry should work
      await page.click('[data-testid="retry-btn"]');
      await page.waitForTimeout(1000);
      
      // Should proceed to next category
      const progressText = await page.$eval('[data-testid="progress-indicator"]', el => el.textContent);
      expect(progressText).toContain('2/5');
    });

    test('Assessment data is preserved during browser refresh', async () => {
      await loginAsCoach();
      await page.click('[data-testid="start-assessment-btn"]:first-child');
      await page.waitForSelector('[data-testid="skill-assessment-interface"]');
      
      // Complete first category
      await completeCurrentCategory();
      await page.click('[data-testid="next-category-btn"]');
      
      // Refresh the page
      await page.reload();
      
      // Should resume from where left off
      await page.waitForSelector('[data-testid="skill-assessment-interface"]');
      const progressText = await page.$eval('[data-testid="progress-indicator"]', el => el.textContent);
      expect(progressText).toContain('2/5');
    });
  });

  // Helper functions
  async function loginAsCoach() {
    await page.type('input[name="username"]', COACH_CREDENTIALS.username);
    await page.type('input[name="password"]', COACH_CREDENTIALS.password);
    await page.click('button[type="submit"]');
    await page.waitForNavigation();
    await page.waitForSelector('[data-testid="coach-dashboard"]');
  }

  async function completeCurrentCategory() {
    const skillCards = await page.$$('[data-testid="skill-card"]');
    
    for (const skillCard of skillCards) {
      await skillCard.click('[data-testid="rating-7"]'); // Use rating 7 for consistency
    }
  }

  async function completeTestAssessment() {
    await page.click('[data-testid="start-assessment-btn"]:first-child');
    await page.waitForSelector('[data-testid="skill-assessment-interface"]');
    
    // Quickly complete all 5 categories
    for (let categoryIndex = 0; categoryIndex < 5; categoryIndex++) {
      await completeCurrentCategory();
      
      if (categoryIndex < 4) {
        await page.click('[data-testid="next-category-btn"]');
        await page.waitForTimeout(500);
      } else {
        await page.click('[data-testid="submit-assessment-btn"]');
        await page.waitForSelector('[data-testid="assessment-complete"]');
      }
    }
  }
});