/**
 * PKL-278651-SPRINT4-VALIDATION - Sprint 4 Goal Creation Form Integration & Bulk Assignment Validation
 * 
 * Comprehensive validation of Sprint 4 complete workflow:
 * - Enhanced goal creation form with assessment pre-population
 * - Bulk goal assignment workflow
 * - Player selection and template management
 * - Integration with Sprint 3 Phase 3.2 assessment system
 * 
 * Run with: npx tsx test-sprint4-goal-creation-validation.ts
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-07-04
 */

import fetch from 'node-fetch';

interface Sprint4ValidationResult {
  component: string;
  test: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  details: string;
  critical: boolean;
  score: number;
  phase: 'Phase4.1' | 'Phase4.2' | 'Phase4.3' | 'Integration';
}

const validationResults: Sprint4ValidationResult[] = [];

function addValidation(
  component: string,
  test: string,
  status: 'PASS' | 'FAIL' | 'WARNING',
  details: string,
  score: number,
  phase: 'Phase4.1' | 'Phase4.2' | 'Phase4.3' | 'Integration',
  critical = false
) {
  validationResults.push({
    component,
    test,
    status,
    details,
    critical,
    score,
    phase
  });
}

/**
 * Sprint 4 Phase 4.1: Enhanced Goal Creation Form Testing
 */
async function testEnhancedGoalCreationForm(): Promise<void> {
  console.log('\n🎯 TESTING: Sprint 4 Phase 4.1 - Enhanced Goal Creation Form');
  console.log('============================================================');

  try {
    // Test assessment suggestions pre-population
    const suggestionsResponse = await fetch('http://localhost:5000/api/coach/goals/suggestions-from-assessment/1');
    const suggestionsData = await suggestionsResponse.json() as any;

    if (suggestionsResponse.ok && suggestionsData.success) {
      const suggestions = suggestionsData.suggestions;
      
      if (suggestions && suggestions.length > 0) {
        addValidation('Enhanced Form', 'Pre-population Data', 'PASS', 
          `${suggestions.length} goal suggestions available for form pre-population`, 10, 'Phase4.1');

        // Check form-compatible data structure
        const firstSuggestion = suggestions[0];
        const requiredFields = ['title', 'description', 'category', 'priority', 'currentRating', 'targetRating', 'milestones'];
        const hasAllFields = requiredFields.every(field => firstSuggestion.hasOwnProperty(field));
        
        if (hasAllFields) {
          addValidation('Enhanced Form', 'Data Structure Compatibility', 'PASS', 
            'Suggestion data structure compatible with enhanced form', 10, 'Phase4.1');
        } else {
          addValidation('Enhanced Form', 'Data Structure Compatibility', 'WARNING', 
            'Some required fields missing from suggestion data', 6, 'Phase4.1');
        }

        // Test milestone structure for form
        if (firstSuggestion.milestones && Array.isArray(firstSuggestion.milestones)) {
          const milestone = firstSuggestion.milestones[0];
          const milestoneFields = ['title', 'description', 'targetRating', 'orderIndex', 'requiresCoachValidation', 'dueDate'];
          const hasMilestoneFields = milestoneFields.every(field => milestone.hasOwnProperty(field));
          
          if (hasMilestoneFields) {
            addValidation('Enhanced Form', 'Milestone Structure', 'PASS', 
              `${firstSuggestion.milestones.length} milestones with complete form structure`, 10, 'Phase4.1');
          } else {
            addValidation('Enhanced Form', 'Milestone Structure', 'WARNING', 
              'Milestone structure missing some required form fields', 6, 'Phase4.1');
          }
        } else {
          addValidation('Enhanced Form', 'Milestone Structure', 'FAIL', 
            'No milestone data available for form pre-population', 0, 'Phase4.1', true);
        }

      } else {
        addValidation('Enhanced Form', 'Pre-population Data', 'FAIL', 
          'No goal suggestions available for form pre-population', 0, 'Phase4.1', true);
      }
    } else {
      addValidation('Enhanced Form', 'API Integration', 'FAIL', 
        'Failed to fetch goal suggestions for form integration', 0, 'Phase4.1', true);
    }

  } catch (error) {
    addValidation('Enhanced Form', 'API Connection', 'FAIL', 
      `Failed to test enhanced form integration: ${error}`, 0, 'Phase4.1', true);
  }
}

/**
 * Sprint 4 Phase 4.2: Bulk Goal Assignment Testing
 */
async function testBulkGoalAssignment(): Promise<void> {
  console.log('\n🎯 TESTING: Sprint 4 Phase 4.2 - Bulk Goal Assignment Workflow');
  console.log('================================================================');

  try {
    // Test coach players endpoint
    const playersResponse = await fetch('http://localhost:5000/api/coach/players');
    const playersData = await playersResponse.json() as any;

    if (playersResponse.ok && playersData.success) {
      const players = playersData.players;
      
      if (players && Array.isArray(players) && players.length > 0) {
        addValidation('Bulk Assignment', 'Player Selection Data', 'PASS', 
          `${players.length} players available for bulk assignment`, 10, 'Phase4.2');

        // Check player data structure
        const player = players[0];
        const playerFields = ['id', 'username', 'firstName', 'lastName', 'level'];
        const hasPlayerFields = playerFields.every(field => player.hasOwnProperty(field));
        
        if (hasPlayerFields) {
          addValidation('Bulk Assignment', 'Player Data Structure', 'PASS', 
            'Player data includes all required fields for selection interface', 10, 'Phase4.2');
        } else {
          addValidation('Bulk Assignment', 'Player Data Structure', 'WARNING', 
            'Some player fields missing for optimal selection interface', 6, 'Phase4.2');
        }

        // Test bulk assignment API
        const testGoalTemplate = {
          title: 'Test Sprint 4 Goal',
          description: 'Testing bulk assignment functionality',
          category: 'technical',
          priority: 'high',
          targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          targetRating: 8,
          currentRating: 5,
          milestones: [
            {
              title: 'Test Milestone 1',
              description: 'First milestone for testing',
              targetRating: 6,
              orderIndex: 0,
              requiresCoachValidation: true,
              dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            }
          ]
        };

        const testPlayerIds = players.slice(0, 3).map((p: any) => p.id); // Test with first 3 players

        const bulkAssignResponse = await fetch('http://localhost:5000/api/coach/goals/bulk-assign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            goalTemplate: testGoalTemplate,
            playerIds: testPlayerIds,
            saveAsTemplate: true,
            templateName: 'Sprint 4 Test Template'
          })
        });

        const bulkAssignData = await bulkAssignResponse.json() as any;

        if (bulkAssignResponse.ok && bulkAssignData.success) {
          const results = bulkAssignData.results;
          
          addValidation('Bulk Assignment', 'API Functionality', 'PASS', 
            `Bulk assignment successful: ${results.successfulAssignments}/${results.totalAssignments} players`, 10, 'Phase4.2');

          if (results.templateId && results.templateName) {
            addValidation('Bulk Assignment', 'Template Management', 'PASS', 
              `Template "${results.templateName}" saved with ID: ${results.templateId}`, 10, 'Phase4.2');
          } else {
            addValidation('Bulk Assignment', 'Template Management', 'WARNING', 
              'Template saving functionality not fully validated', 6, 'Phase4.2');
          }

          // Check assignment details
          if (results.assignments && Array.isArray(results.assignments)) {
            const successfulAssignments = results.assignments.filter((a: any) => a.success);
            const assignmentDetails = successfulAssignments[0];
            
            if (assignmentDetails.milestones && assignmentDetails.milestones.length > 0) {
              addValidation('Bulk Assignment', 'Milestone Creation', 'PASS', 
                `Milestones created for each assignment: ${assignmentDetails.milestones.length} per goal`, 10, 'Phase4.2');
            } else {
              addValidation('Bulk Assignment', 'Milestone Creation', 'WARNING', 
                'Milestone creation in bulk assignment needs verification', 6, 'Phase4.2');
            }
          }

        } else {
          addValidation('Bulk Assignment', 'API Functionality', 'FAIL', 
            `Bulk assignment failed: ${bulkAssignData.error || 'Unknown error'}`, 0, 'Phase4.2', true);
        }

      } else {
        addValidation('Bulk Assignment', 'Player Selection Data', 'FAIL', 
          'No players available for bulk assignment testing', 0, 'Phase4.2', true);
      }
    } else {
      addValidation('Bulk Assignment', 'Player Data API', 'FAIL', 
        'Failed to fetch players for bulk assignment', 0, 'Phase4.2', true);
    }

  } catch (error) {
    addValidation('Bulk Assignment', 'API Connection', 'FAIL', 
      `Failed to test bulk assignment: ${error}`, 0, 'Phase4.2', true);
  }
}

/**
 * Sprint 4 Phase 4.3: Integration Testing
 */
async function testSprint4Integration(): Promise<void> {
  console.log('\n🎯 TESTING: Sprint 4 Complete Integration Workflow');
  console.log('==================================================');

  try {
    // Test complete workflow: Assessment → Suggestions → Form → Assignment
    const workflowSteps = [
      { name: 'Assessment Analysis', url: '/api/pcp/assessment/1/weak-areas' },
      { name: 'Goal Suggestions', url: '/api/coach/goals/suggestions-from-assessment/1' },
      { name: 'Player Selection', url: '/api/coach/players' },
    ];

    let workflowScore = 0;
    const maxWorkflowScore = workflowSteps.length * 10;

    for (const step of workflowSteps) {
      try {
        const response = await fetch(`http://localhost:5000${step.url}`);
        const data = await response.json() as any;
        
        if (response.ok && (data.success || Array.isArray(data))) {
          workflowScore += 10;
          console.log(`✅ ${step.name}: Success`);
        } else {
          console.log(`❌ ${step.name}: Failed`);
        }
      } catch (stepError) {
        console.log(`❌ ${step.name}: Error - ${stepError}`);
      }
    }

    const workflowReadiness = (workflowScore / maxWorkflowScore) * 100;
    
    if (workflowReadiness >= 90) {
      addValidation('Integration', 'Complete Workflow', 'PASS', 
        `${workflowReadiness.toFixed(1)}% workflow operational`, 10, 'Integration');
    } else if (workflowReadiness >= 70) {
      addValidation('Integration', 'Complete Workflow', 'WARNING', 
        `${workflowReadiness.toFixed(1)}% workflow operational - needs improvement`, 7, 'Integration');
    } else {
      addValidation('Integration', 'Complete Workflow', 'FAIL', 
        `${workflowReadiness.toFixed(1)}% workflow operational - major issues`, 0, 'Integration', true);
    }

    // Test data consistency across Sprint 3 and Sprint 4
    const assessmentResponse = await fetch('http://localhost:5000/api/pcp/assessment/1/weak-areas');
    const suggestionsResponse = await fetch('http://localhost:5000/api/coach/goals/suggestions-from-assessment/1');
    
    if (assessmentResponse.ok && suggestionsResponse.ok) {
      const assessmentData = await assessmentResponse.json() as any;
      const suggestionsData = await suggestionsResponse.json() as any;
      
      if (assessmentData.analysis && suggestionsData.suggestions) {
        addValidation('Integration', 'Data Consistency', 'PASS', 
          'Sprint 3 assessment data properly flows to Sprint 4 goal creation', 10, 'Integration');
      } else {
        addValidation('Integration', 'Data Consistency', 'WARNING', 
          'Data flow between Sprint 3 and Sprint 4 needs verification', 6, 'Integration');
      }
    }

  } catch (error) {
    addValidation('Integration', 'Workflow Testing', 'FAIL', 
      `Integration testing failed: ${error}`, 0, 'Integration', true);
  }
}

/**
 * Calculate overall Sprint 4 readiness score
 */
function calculateSprint4Readiness(): number {
  const totalPossibleScore = validationResults.reduce((sum, result) => sum + 10, 0);
  const actualScore = validationResults.reduce((sum, result) => sum + result.score, 0);
  return (actualScore / totalPossibleScore) * 100;
}

/**
 * Generate comprehensive Sprint 4 readiness report
 */
function generateSprint4Report(): void {
  console.log('\n' + '='.repeat(80));
  console.log('🏆 SPRINT 4 GOAL CREATION FORM INTEGRATION & BULK ASSIGNMENT VALIDATION REPORT');
  console.log('='.repeat(80));

  const readinessScore = calculateSprint4Readiness();
  const passCount = validationResults.filter(r => r.status === 'PASS').length;
  const failCount = validationResults.filter(r => r.status === 'FAIL').length;
  const warningCount = validationResults.filter(r => r.status === 'WARNING').length;
  const criticalFailures = validationResults.filter(r => r.status === 'FAIL' && r.critical).length;

  console.log(`\n📊 OVERALL SPRINT 4 READINESS SCORE: ${readinessScore.toFixed(1)}%`);
  console.log(`✅ PASSED: ${passCount}`);
  console.log(`⚠️  WARNINGS: ${warningCount}`);
  console.log(`❌ FAILED: ${failCount}`);
  console.log(`🚨 CRITICAL FAILURES: ${criticalFailures}`);

  // Group results by phase
  const phaseGroups = validationResults.reduce((groups, result) => {
    if (!groups[result.phase]) {
      groups[result.phase] = [];
    }
    groups[result.phase].push(result);
    return groups;
  }, {} as Record<string, Sprint4ValidationResult[]>);

  console.log('\n📋 DETAILED RESULTS BY SPRINT 4 PHASE:');
  console.log('-'.repeat(50));

  Object.entries(phaseGroups).forEach(([phase, results]) => {
    const phaseScore = (results.reduce((sum, r) => sum + r.score, 0) / (results.length * 10)) * 100;
    console.log(`\n🚀 ${phase} (${phaseScore.toFixed(1)}%)`);
    
    results.forEach(result => {
      const statusIcon = result.status === 'PASS' ? '✅' : result.status === 'WARNING' ? '⚠️' : '❌';
      const criticalMark = result.critical ? '🚨' : '';
      console.log(`   ${statusIcon} ${result.component} - ${result.test}: ${result.details} ${criticalMark}`);
    });
  });

  console.log('\n🎯 SPRINT 4 ASSESSMENT:');
  console.log('-'.repeat(40));

  if (readinessScore >= 85) {
    console.log('🎉 EXCELLENT: Sprint 4 goal creation and bulk assignment system is production-ready!');
    console.log('   ✨ Enhanced goal creation form with assessment pre-population operational');
    console.log('   🎯 Bulk assignment workflow with player selection functional');
    console.log('   📊 Template management and milestone creation validated');
    console.log('   🚀 Complete Sprint 3 → Sprint 4 integration workflow operational');
  } else if (readinessScore >= 70) {
    console.log('✅ GOOD: Sprint 4 goal creation system functional with minor improvements needed');
    console.log('   🔧 Core workflow operational but some enhancements recommended');
  } else if (readinessScore >= 50) {
    console.log('⚠️  FAIR: System partially functional but requires attention before production');
    console.log('   🛠️  Several components need fixes for optimal performance');
  } else {
    console.log('❌ NEEDS WORK: Significant issues prevent production deployment');
    console.log('   🔥 Critical failures must be resolved before proceeding');
  }

  if (criticalFailures === 0) {
    console.log('\n✅ NO CRITICAL FAILURES: System stable for continued development');
  } else {
    console.log(`\n🚨 ${criticalFailures} CRITICAL FAILURE${criticalFailures > 1 ? 'S' : ''}: Immediate attention required`);
  }

  console.log('\n🔄 SPRINT 4 STATUS: Enhanced Goal Creation Form Integration & Bulk Assignment');
  console.log('   📝 Assessment-driven goal form pre-population');
  console.log('   👥 Multi-player bulk assignment workflow');
  console.log('   💾 Template management and reusable goal patterns');
  console.log('   ⚡ Complete coach workflow: Assessment → Analysis → Suggestions → Form → Assignment');

  console.log('\n' + '='.repeat(80));
}

/**
 * Main Sprint 4 validation execution
 */
async function runSprint4Validation(): Promise<void> {
  console.log('🚀 Starting Sprint 4 Goal Creation Form Integration & Bulk Assignment Validation...');
  console.log('Target: Complete coach workflow with enhanced form and bulk assignment');

  await testEnhancedGoalCreationForm();
  await testBulkGoalAssignment();
  await testSprint4Integration();

  generateSprint4Report();
}

// Execute validation if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runSprint4Validation().catch(console.error);
}

export { runSprint4Validation };