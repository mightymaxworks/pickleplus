/**
 * Test Assessment Analysis API - Sprint 3 Phase 3.1 Validation
 * 
 * Quick test to verify our new assessment analysis endpoints work properly
 * with real PCP assessment data.
 */

import { AssessmentAnalysisService } from './server/services/AssessmentAnalysisService';

async function testAssessmentAnalysis() {
  console.log('🎯 Testing Assessment Analysis Service - Sprint 3 Phase 3.1\n');

  // Mock assessment data that would come from PCP assessment
  const sampleAssessment = {
    id: 1,
    profile_id: 1,
    coach_id: 1,
    assessment_type: 'comprehensive',
    
    // Technical Skills (some weak areas for testing)
    serve_execution: 7.5,
    return_technique: 4.2, // WEAK AREA
    third_shot: 5.8, // WEAK AREA
    overhead_defense: 6.5,
    shot_creativity: 8.0,
    court_movement: 6.2,
    
    // Groundstrokes (mixed performance)
    forehand_topspin: 7.0,
    forehand_slice: 5.5, // WEAK AREA
    backhand_topspin: 6.5,
    backhand_slice: 3.8, // WEAK AREA - PRIORITY
    
    // Net Play (strong area)
    forehand_dead_dink: 8.5,
    forehand_topspin_dink: 7.8,
    forehand_slice_dink: 7.2,
    backhand_dead_dink: 6.8,
    backhand_topspin_dink: 6.0, // WEAK AREA
    backhand_slice_dink: 5.5, // WEAK AREA
    forehand_block_volley: 7.5,
    forehand_drive_volley: 7.0,
    forehand_dink_volley: 8.0,
    backhand_block_volley: 6.5,
    backhand_drive_volley: 5.9, // WEAK AREA
    backhand_dink_volley: 6.2,
    
    // Tactical (needs improvement)
    shot_selection: 5.2, // WEAK AREA
    court_positioning: 6.8,
    pattern_recognition: 4.9, // WEAK AREA
    risk_management: 6.1,
    communication: 7.5,
    
    // Physical (solid)
    footwork: 6.5,
    balance_stability: 7.0,
    reaction_time: 6.8,
    endurance: 6.2,
    
    // Mental (mixed)
    focus_concentration: 5.5, // WEAK AREA
    pressure_performance: 4.7, // WEAK AREA
    adaptability: 6.5,
    sportsmanship: 8.5,
    
    session_notes: 'Player shows strong net play but needs work on consistency',
    confidence_level: 0.8
  };

  try {
    // Test the assessment analysis
    console.log('📊 Analyzing Assessment Data...');
    const analysis = AssessmentAnalysisService.analyzeAssessment(sampleAssessment);
    
    console.log('\n🎯 ASSESSMENT ANALYSIS RESULTS:');
    console.log(`Overall PCP Rating: ${analysis.overallRating.toFixed(1)}/10`);
    
    console.log('\n📈 Dimensional Ratings:');
    console.log(`• Technical: ${analysis.dimensionalRatings.technical.toFixed(1)}/10 (40% weight)`);
    console.log(`• Tactical: ${analysis.dimensionalRatings.tactical.toFixed(1)}/10 (25% weight)`);
    console.log(`• Physical: ${analysis.dimensionalRatings.physical.toFixed(1)}/10 (20% weight)`);
    console.log(`• Mental: ${analysis.dimensionalRatings.mental.toFixed(1)}/10 (15% weight)`);
    
    console.log('\n⚠️ WEAK AREAS IDENTIFIED (< 6.0):');
    analysis.weakAreas.forEach((area, index) => {
      console.log(`${index + 1}. ${area.skillLabel} (${area.currentRating}/10) - ${area.priority.toUpperCase()} PRIORITY`);
      console.log(`   Goal: ${area.suggestedGoal}`);
      console.log(`   Target: ${(area.currentRating + area.targetImprovement).toFixed(1)}/10`);
      console.log(`   Milestones: ${area.milestoneTemplate.length} progressive steps`);
      console.log('');
    });
    
    console.log(`🎯 Recommended Focus: ${analysis.recommendedFocus}`);
    console.log(`📈 Improvement Potential: ${analysis.improvementPotential.toFixed(1)} points average`);
    
    // Test goal suggestions format
    console.log('\n🎯 GOAL SUGGESTIONS PREVIEW:');
    const topWeakAreas = analysis.weakAreas.slice(0, 3);
    topWeakAreas.forEach((area, index) => {
      console.log(`\nGoal ${index + 1}: ${area.suggestedGoal}`);
      console.log(`Category: ${area.category} | Priority: ${area.priority}`);
      console.log(`Current: ${area.currentRating} → Target: ${(area.currentRating + area.targetImprovement).toFixed(1)}`);
      
      console.log('Milestones:');
      area.milestoneTemplate.forEach((milestone, mIndex) => {
        console.log(`  ${mIndex + 1}. ${milestone.title} (Target: ${milestone.targetRating})`);
      });
    });
    
    console.log('\n✅ Assessment Analysis Service Test PASSED');
    console.log('🔗 Ready to integrate with goal assignment system');
    
  } catch (error) {
    console.error('❌ Assessment Analysis Test FAILED:', error);
    throw error;
  }
}

// Run the test
testAssessmentAnalysis().catch(console.error);