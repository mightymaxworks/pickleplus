/**
 * Test endpoints for Coach Weighted Assessment Algorithm
 * These endpoints create test scenarios to validate the provisional/confirmed rating system
 */

import { Request, Response } from 'express';
import { 
  calculateWeightedPCP, 
  validateAssessmentRequirements,
  type CoachAssessment 
} from '@shared/utils/coachWeightedAssessment';

/**
 * Test endpoint: Create sample coach assessments for algorithm testing
 * GET /api/test/coach-weighted-assessment/scenarios
 */
export async function getTestScenarios(req: Request, res: Response) {
  try {
    const scenarios = [
      {
        name: "L1 Coach Only - Should be Provisional",
        description: "Single L1 coach assessment - should result in provisional rating",
        assessments: [
          {
            coachId: 1,
            coachLevel: 1,
            studentId: 100,
            assessmentDate: new Date(),
            skillRatings: {
              technical: 6.0,
              tactical: 5.5,
              physical: 7.0,
              mental: 5.0
            },
            sessionNotes: "Initial assessment by L1 coach"
          }
        ]
      },
      {
        name: "L2 and L3 Coaches - Should be Provisional",
        description: "Multiple assessments but no L4+ - should remain provisional",
        assessments: [
          {
            coachId: 2,
            coachLevel: 2,
            studentId: 100,
            assessmentDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
            skillRatings: {
              technical: 6.5,
              tactical: 6.0,
              physical: 7.2,
              mental: 5.8
            },
            sessionNotes: "L2 coach assessment"
          },
          {
            coachId: 3,
            coachLevel: 3,
            studentId: 100,
            assessmentDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
            skillRatings: {
              technical: 7.0,
              tactical: 6.5,
              physical: 7.0,
              mental: 6.2
            },
            sessionNotes: "L3 coach advanced assessment"
          }
        ]
      },
      {
        name: "L4 Coach Confirmation - Should be Confirmed",
        description: "L4 coach assessment should confirm the rating",
        assessments: [
          {
            coachId: 2,
            coachLevel: 2,
            studentId: 100,
            assessmentDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
            skillRatings: {
              technical: 6.5,
              tactical: 6.0,
              physical: 7.2,
              mental: 5.8
            },
            sessionNotes: "L2 coach preliminary assessment"
          },
          {
            coachId: 4,
            coachLevel: 4,
            studentId: 100,
            assessmentDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
            skillRatings: {
              technical: 7.2,
              tactical: 6.8,
              physical: 7.5,
              mental: 6.5
            },
            sessionNotes: "L4 expert validation assessment"
          }
        ]
      },
      {
        name: "L5 Master Coach - Should be Confirmed",
        description: "L5 master coach assessment with highest authority",
        assessments: [
          {
            coachId: 5,
            coachLevel: 5,
            studentId: 100,
            assessmentDate: new Date(),
            skillRatings: {
              technical: 8.0,
              tactical: 7.5,
              physical: 8.2,
              mental: 7.8
            },
            sessionNotes: "L5 master coach comprehensive evaluation"
          }
        ]
      },
      {
        name: "Expired L4 Assessment - Should Revert to Provisional",
        description: "L4 assessment older than 120 days should expire",
        assessments: [
          {
            coachId: 4,
            coachLevel: 4,
            studentId: 100,
            assessmentDate: new Date(Date.now() - 130 * 24 * 60 * 60 * 1000), // 130 days ago
            skillRatings: {
              technical: 7.2,
              tactical: 6.8,
              physical: 7.5,
              mental: 6.5
            },
            sessionNotes: "Expired L4 assessment"
          },
          {
            coachId: 3,
            coachLevel: 3,
            studentId: 100,
            assessmentDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
            skillRatings: {
              technical: 6.8,
              tactical: 6.2,
              physical: 7.0,
              mental: 6.0
            },
            sessionNotes: "Recent L3 assessment"
          }
        ]
      }
    ];

    res.json({
      success: true,
      scenarios,
      testInstructions: {
        usage: "Use these scenarios to test the coach weighted assessment algorithm",
        expectedBehavior: [
          "L1-L3 assessments should always be PROVISIONAL",
          "L4+ assessments should be CONFIRMED (within 120 days)",
          "Expired L4+ assessments should revert to PROVISIONAL",
          "Higher level coaches should have greater influence on final ratings",
          "Algorithm should show weight distribution and consensus metrics"
        ]
      }
    });

  } catch (error) {
    console.error('Test scenarios error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate test scenarios'
    });
  }
}

/**
 * Test endpoint: Run algorithm with specific test scenario
 * POST /api/test/coach-weighted-assessment/run-scenario
 */
export async function runTestScenario(req: Request, res: Response) {
  try {
    const { assessments, scenarioName } = req.body;

    if (!assessments || !Array.isArray(assessments)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid assessments data'
      });
    }

    // Convert assessment dates to Date objects
    const processedAssessments: CoachAssessment[] = assessments.map((assessment: any) => ({
      ...assessment,
      assessmentDate: new Date(assessment.assessmentDate)
    }));

    // Validate assessments
    const validation = validateAssessmentRequirements(processedAssessments);

    // Calculate weighted PCP
    let weightedResult = null;
    let calculationError = null;

    try {
      weightedResult = calculateWeightedPCP(processedAssessments);
    } catch (error) {
      calculationError = error instanceof Error ? error.message : 'Calculation failed';
    }

    res.json({
      success: true,
      scenarioName,
      testResults: {
        validation,
        weightedResult,
        calculationError,
        assessmentInput: {
          count: processedAssessments.length,
          coachLevels: processedAssessments.map(a => a.coachLevel),
          dateRange: {
            oldest: Math.min(...processedAssessments.map(a => a.assessmentDate.getTime())),
            newest: Math.max(...processedAssessments.map(a => a.assessmentDate.getTime()))
          }
        },
        algorithmAnalysis: {
          expectedStatus: processedAssessments.some(a => a.coachLevel >= 4) ? 'CONFIRMED' : 'PROVISIONAL',
          highestCoachLevel: Math.max(...processedAssessments.map(a => a.coachLevel)),
          weightDistribution: processedAssessments.map(a => ({
            coachId: a.coachId,
            coachLevel: a.coachLevel,
            baseWeight: a.coachLevel === 1 ? 0.7 : 
                       a.coachLevel === 2 ? 1.0 :
                       a.coachLevel === 3 ? 1.8 :
                       a.coachLevel === 4 ? 3.2 : 3.8,
            influence: `${(a.coachLevel >= 4 ? 'HIGH' : a.coachLevel >= 3 ? 'MEDIUM' : 'LOW')} - ${a.coachLevel >= 4 ? 'Can confirm ratings' : 'Provisional only'}`
          }))
        }
      }
    });

  } catch (error) {
    console.error('Test scenario execution error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to execute test scenario',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Test endpoint: Validate coach level weighting matrix
 * GET /api/test/coach-weighted-assessment/weight-matrix
 */
export async function getWeightMatrix(req: Request, res: Response) {
  try {
    const weightMatrix = {
      L1: { 
        baseWeight: 0.7, 
        authority: "Minimal influence - foundational assessment only",
        canConfirm: false,
        provisionalPeriod: "60 days"
      },
      L2: { 
        baseWeight: 1.0, 
        authority: "Standard baseline - enhanced technical knowledge",
        canConfirm: false,
        provisionalPeriod: "60 days"
      },
      L3: { 
        baseWeight: 1.8, 
        authority: "Advanced tactical understanding",
        canConfirm: false,
        provisionalPeriod: "90 days"
      },
      L4: { 
        baseWeight: 3.2, 
        authority: "Expert-level analysis - can confirm ratings",
        canConfirm: true,
        confirmedPeriod: "120 days"
      },
      L5: { 
        baseWeight: 3.8, 
        authority: "Master-level assessment authority",
        canConfirm: true,
        confirmedPeriod: "120 days"
      }
    };

    const weightComparisons = {
      "L1 to L2 gap": "43% increase (0.7 → 1.0)",
      "L2 to L3 gap": "80% increase (1.0 → 1.8)", 
      "L3 to L4 gap": "78% increase (1.8 → 3.2) - LARGEST GAP",
      "L4 to L5 gap": "19% increase (3.2 → 3.8) - smallest expert gap",
      "L5 vs L1 total": "5.4x multiplier (reflects full hierarchy)"
    };

    res.json({
      success: true,
      weightMatrix,
      weightComparisons,
      algorithmPrinciples: [
        "L3-L4 gap is largest to reflect certification difficulty",
        "L2-L3 gap is larger than L1-L2 gap",
        "L4-L5 gap is smallest (both expert levels)",
        "L1 has minimal influence (0.7x weight)",
        "Only L4+ coaches can confirm official ratings"
      ]
    });

  } catch (error) {
    console.error('Weight matrix error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate weight matrix'
    });
  }
}