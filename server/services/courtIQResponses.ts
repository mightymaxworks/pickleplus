/**
 * PKL-278651-COACH-0004-COURTIQ-RESP
 * CourtIQ Response Templates
 * 
 * This file provides response templates for the CourtIQ dimensions
 * to generate appropriate coaching feedback.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-24
 */

import { type DimensionCode } from '../types/courtiq';

/**
 * Generic responses for each CourtIQ dimension
 */
export const dimensionResponses: Record<DimensionCode, string[]> = {
  'TECH': [
    'Your technical skills are the foundation of your game. Focus on consistent, repeatable mechanics.',
    'Technical development comes from deliberate practice. What specific shots would you like to improve?',
    'Mastering technical fundamentals creates reliability under pressure. Let\'s work on building your technical arsenal.'
  ],
  'TACT': [
    'Tactical awareness is about making smart decisions on the court. Let\'s enhance your strategic understanding.',
    'Recognizing patterns in play is key to tactical growth. What situations do you find most challenging?',
    'Tactical improvements often yield the fastest results. Let\'s develop your court awareness and decision-making.'
  ],
  'PHYS': [
    'Physical conditioning specifically for pickleball improves movement and endurance. How are you training off the court?',
    'Pickleball-specific fitness focuses on explosive movement, core stability, and injury prevention.',
    'Physical preparation enables technical execution. Let\'s ensure your fitness supports your pickleball goals.'
  ],
  'MENT': [
    'Mental toughness is often the difference-maker in close matches. How do you prepare mentally?',
    'Developing mental skills like focus, confidence, and emotional control can transform your game.',
    'The mental game requires practice just like technical skills. Let\'s work on strengthening your mental approach.'
  ],
  'CONS': [
    'Consistency comes from a combination of technical reliability and mental discipline.',
    'Establishing patterns in practice creates consistency in matches. What aspects of consistency are you working on?',
    'Consistency is about minimizing unforced errors while maintaining your tactical approach. Let\'s build your reliability.'
  ]
};

/**
 * Responses specific to improvement areas in each dimension
 */
export const improvementResponses: Record<DimensionCode, Record<string, string[]>> = {
  'TECH': {
    'dink': [
      'Dink consistency is foundational to the modern game. Practice keeping the ball low and controlled.',
      'When dinking, focus on paddle angle, soft hands, and proper footwork positioning.',
      'Developing dink variations (topspin, slice, pace changes) adds valuable dimensions to your game.'
    ],
    'serve': [
      'Your serve sets the tone for each point. Work on consistency before power or spin.',
      'A reliable serve puts pressure on your opponent and gives you confidence to start points.',
      'Practice both location and depth with your serves to keep opponents guessing.'
    ],
    'third_shot': [
      'The third shot is a critical transition opportunity. Develop both drop and drive options.',
      'Third shot drops require touch, patience, and proper weight transfer.',
      'Having multiple third shot options gives you tactical flexibility based on the situation.'
    ],
    'volley': [
      'Quick hands and proper paddle preparation are essential for effective volleying.',
      'Practice both defensive and offensive volleys from different court positions.',
      'Volleying under pressure requires compact motion and confident decision-making.'
    ],
    'backhand': [
      'Backhand development often yields the fastest improvement for many players.',
      'Focus on proper grip, shoulder rotation, and weight transfer for backhand shots.',
      'A reliable backhand prevents opponents from targeting a weakness.'
    ],
    'forehand': [
      'Forehand technique should prioritize consistency and control before power.',
      'Proper forehand mechanics create a foundation for multiple shot variations.',
      'Developing different forehand speeds and spins expands your tactical options.'
    ]
  },
  'TACT': {
    'court_positioning': [
      'Proper positioning prevents opponents from exploiting court space.',
      'Practice recovery positioning after each shot to maintain court coverage.',
      'Anticipate where the next shot will go based on your opponent\'s position and tendencies.'
    ],
    'shot_selection': [
      'Shot selection should balance risk versus reward based on the specific situation.',
      'Develop a decision tree for common scenarios to improve your shot choices.',
      'Match your shot selection to your strengths and your opponent\'s weaknesses.'
    ],
    'partner_coordination': [
      'Clear communication with your partner prevents confusion and overlap.',
      'Develop standard protocols for who takes which balls in the middle.',
      'Understanding your partner\'s strengths allows for complementary tactical approaches.'
    ],
    'pattern_recognition': [
      'Identifying patterns in your opponent\'s play reveals tactical opportunities.',
      'Notice tendencies in serve locations, third shots, and pressure situations.',
      'Adjust your tactics when you recognize predictable patterns from opponents.'
    ]
  },
  'PHYS': {
    'footwork': [
      'Efficient footwork conserves energy and improves shot quality.',
      'Practice split-step timing to improve your first-step quickness.',
      'Proper ready position enables faster movement to all court areas.'
    ],
    'endurance': [
      'Match-specific endurance requires both aerobic and anaerobic training.',
      'Interval training mimics the stop-and-start nature of pickleball points.',
      'Building endurance prevents technique breakdown in long matches.'
    ],
    'balance': [
      'Core stability supports balance during complex shot execution.',
      'Practice shots with controlled weight transfer to improve balance.',
      'Good balance allows for recovery and preparation for the next shot.'
    ],
    'agility': [
      'Pickleball requires quick directional changes and precise movements.',
      'Ladder drills and cone exercises can improve court-specific agility.',
      'Agility training should include both planned and reactive movements.'
    ]
  },
  'MENT': {
    'focus': [
      'Developing present-moment focus prevents distractions during play.',
      'Create a between-point routine to reset your focus consistently.',
      'Practicing mindfulness techniques can improve on-court concentration.'
    ],
    'confidence': [
      'Confidence comes from preparation and positive self-talk.',
      'Document practice successes to build evidence for your self-belief.',
      'Confidence allows for decisive execution under pressure.'
    ],
    'pressure_management': [
      'Breathing techniques can manage nerves during high-pressure moments.',
      'Embrace pressure points as opportunities to execute your game plan.',
      'Simulating pressure in practice builds resilience for matches.'
    ],
    'emotional_control': [
      'Maintaining emotional equilibrium preserves focus and decision-making.',
      'Develop triggers to return to neutral after frustrating moments.',
      'Channel emotions productively rather than trying to eliminate them.'
    ]
  },
  'CONS': {
    'unforced_errors': [
      'Reducing unforced errors often yields immediate scoring improvements.',
      'Identify patterns in your unforced errors to target specific practice areas.',
      'Developing a margin-of-error mindset improves shot consistency.'
    ],
    'shot_reliability': [
      'Building reliable shots requires targeted repetition in practice.',
      'Track your shot percentages to measure improvement objectively.',
      'Focus on one shot pattern at a time when developing reliability.'
    ],
    'performance_variance': [
      'Consistent pre-match routines reduce performance variability.',
      'Mental preparation creates consistent emotional states for play.',
      'Process-focused goals produce more consistent outcomes than result-focused goals.'
    ],
    'focus_maintenance': [
      'Maintaining focus throughout a match requires mental conditioning.',
      'Practice extending your concentration periods progressively.',
      'Developing refocusing techniques helps recover from distractions quickly.'
    ]
  }
};

/**
 * Get a response for a specific CourtIQ dimension
 */
export function getDimensionResponse(dimension: DimensionCode): string {
  const responses = dimensionResponses[dimension];
  const randomIndex = Math.floor(Math.random() * responses.length);
  return responses[randomIndex];
}

/**
 * Get an improvement response for a specific area within a dimension
 */
export function getImprovementResponse(dimension: DimensionCode, area: string): string | null {
  const dimensionAreas = improvementResponses[dimension];
  if (!dimensionAreas[area]) {
    return null;
  }
  
  const responses = dimensionAreas[area];
  const randomIndex = Math.floor(Math.random() * responses.length);
  return responses[randomIndex];
}