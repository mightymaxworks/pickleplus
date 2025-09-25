/**
 * PKL-278651-API-0001-SCOPES
 * API Scope Definitions for Algorithm IP Protection
 * 
 * Comprehensive scope system to protect ranking algorithm intellectual property
 * while providing useful data to legitimate developers.
 */

export interface ApiScope {
  scope: string;
  name: string;
  description: string;
  dataAccess: string[];
  restrictions: string[];
  requiresApproval: boolean;
  tierLevel: 'public' | 'basic' | 'advanced' | 'premium' | 'restricted';
}

/**
 * ALGORITHM PROTECTION SCOPE HIERARCHY
 * 
 * Each tier provides carefully curated data while protecting core IP:
 * - Public: Basic read-only access to final results
 * - Basic: Enhanced data with basic analytics
 * - Advanced: Rich insights but no algorithm details  
 * - Premium: Business intelligence data for partners
 * - Restricted: Limited algorithm metadata for approved research
 */
export const API_SCOPES: ApiScope[] = [
  // USER DATA SCOPES
  {
    scope: 'user:read',
    name: 'User Profile Read',
    description: 'Access to basic user profile information',
    dataAccess: ['name', 'avatar', 'public_stats', 'current_ranking_position'],
    restrictions: ['no_contact_info', 'no_private_data', 'no_calculation_details'],
    requiresApproval: false,
    tierLevel: 'public'
  },
  
  {
    scope: 'user:analytics',
    name: 'User Analytics',
    description: 'Access to user performance trends and insights',
    dataAccess: ['performance_trends', 'skill_progression', 'activity_patterns'],
    restrictions: ['no_raw_scores', 'no_algorithm_weights', 'aggregated_data_only'],
    requiresApproval: true,
    tierLevel: 'advanced'
  },

  // RANKING SCOPES - CORE IP PROTECTION
  {
    scope: 'ranking:read',
    name: 'Rankings Basic Read',
    description: 'Access to final ranking positions and tier classifications',
    dataAccess: [
      'current_position',
      'tier_classification',
      'rank_movement_direction',
      'last_updated'
    ],
    restrictions: [
      'no_score_calculations',
      'no_algorithm_factors',
      'no_decay_coefficients',
      'no_skill_multipliers',
      'final_results_only'
    ],
    requiresApproval: false,
    tierLevel: 'basic'
  },

  {
    scope: 'ranking:advanced',
    name: 'Rankings Advanced Analytics',
    description: 'Enhanced ranking insights with trend analysis',
    dataAccess: [
      'ranking_trends',
      'competitive_density',
      'tier_distribution_stats',
      'volatility_indicators',
      'peer_comparisons'
    ],
    restrictions: [
      'no_algorithm_implementation',
      'no_calculation_formulas',
      'no_internal_factors',
      'trend_data_only',
      'aggregated_insights_only'
    ],
    requiresApproval: true,
    tierLevel: 'advanced'
  },

  {
    scope: 'ranking:algorithm',
    name: 'Algorithm Metadata Access',
    description: 'LIMITED access to algorithm versioning and confidence metrics',
    dataAccess: [
      'algorithm_version',
      'confidence_scores',
      'recalibration_dates',
      'factor_count_only',
      'model_performance_metrics'
    ],
    restrictions: [
      'no_source_code',
      'no_formula_details',
      'no_parameter_weights',
      'no_proprietary_logic',
      'metadata_only',
      'approved_research_only'
    ],
    requiresApproval: true,
    tierLevel: 'restricted'
  },

  // MATCH DATA SCOPES
  {
    scope: 'match:read',
    name: 'Match Results Read',
    description: 'Access to completed match results and basic statistics',
    dataAccess: ['final_scores', 'participants', 'match_date', 'duration'],
    restrictions: ['no_real_time_data', 'no_in_progress_matches', 'completed_only'],
    requiresApproval: false,
    tierLevel: 'basic'
  },

  {
    scope: 'match:analytics',
    name: 'Match Performance Analytics',
    description: 'Detailed match performance metrics and patterns',
    dataAccess: [
      'performance_metrics',
      'shot_analysis',
      'strategy_patterns',
      'improvement_areas'
    ],
    restrictions: [
      'no_real_time_coaching_data',
      'no_proprietary_analysis_methods',
      'results_only'
    ],
    requiresApproval: true,
    tierLevel: 'advanced'
  },

  // TOURNAMENT SCOPES
  {
    scope: 'tournament:read',
    name: 'Tournament Information Read',
    description: 'Access to public tournament information and results',
    dataAccess: ['schedules', 'brackets', 'results', 'participant_lists'],
    restrictions: ['public_tournaments_only', 'no_private_events'],
    requiresApproval: false,
    tierLevel: 'basic'
  },

  {
    scope: 'tournament:analytics',
    name: 'Tournament Analytics',
    description: 'Tournament performance analytics and insights',
    dataAccess: [
      'participation_patterns',
      'performance_analytics',
      'competitive_insights',
      'bracket_predictions'
    ],
    restrictions: [
      'no_prediction_algorithms',
      'no_proprietary_analysis',
      'results_based_only'
    ],
    requiresApproval: true,
    tierLevel: 'advanced'
  },

  // COURTIQ PERFORMANCE SCOPES
  {
    scope: 'courtiq:read',
    name: 'CourtIQ Performance Read',
    description: 'Access to CourtIQ performance metrics and analysis',
    dataAccess: [
      'skill_assessments',
      'performance_scores',
      'improvement_recommendations',
      'technique_analysis'
    ],
    restrictions: [
      'no_assessment_algorithms',
      'no_calculation_methods',
      'no_proprietary_formulas',
      'final_scores_only'
    ],
    requiresApproval: true,
    tierLevel: 'advanced'
  },

  {
    scope: 'courtiq:advanced',
    name: 'CourtIQ Advanced Analytics',
    description: 'Advanced CourtIQ analytics with predictive insights',
    dataAccess: [
      'predictive_analytics',
      'skill_trajectory_analysis',
      'performance_optimization',
      'coaching_recommendations'
    ],
    restrictions: [
      'no_ai_model_details',
      'no_training_data',
      'no_algorithm_implementation',
      'insights_only'
    ],
    requiresApproval: true,
    tierLevel: 'premium'
  },

  // SOCIAL & COMMUNITY SCOPES
  {
    scope: 'social:read',
    name: 'Social Data Read',
    description: 'Access to public social interactions and community data',
    dataAccess: ['public_achievements', 'community_participation', 'social_connections'],
    restrictions: ['public_data_only', 'no_private_messages', 'no_personal_info'],
    requiresApproval: false,
    tierLevel: 'basic'
  },

  // WEBHOOKS & REAL-TIME DATA
  {
    scope: 'webhooks:receive',
    name: 'Webhook Events',
    description: 'Receive real-time event notifications via webhooks',
    dataAccess: ['event_notifications', 'real_time_updates', 'status_changes'],
    restrictions: ['subscribed_events_only', 'rate_limited', 'no_bulk_historical'],
    requiresApproval: true,
    tierLevel: 'advanced'
  }
];

/**
 * Get scope details by scope name
 */
export function getScopeDetails(scopeName: string): ApiScope | undefined {
  return API_SCOPES.find(scope => scope.scope === scopeName);
}

/**
 * Get all scopes for a specific tier level
 */
export function getScopesByTier(tierLevel: ApiScope['tierLevel']): ApiScope[] {
  return API_SCOPES.filter(scope => scope.tierLevel === tierLevel);
}

/**
 * Check if a scope requires approval
 */
export function requiresApproval(scopeName: string): boolean {
  const scope = getScopeDetails(scopeName);
  return scope ? scope.requiresApproval : true; // Default to requiring approval
}

/**
 * Get maximum allowed scopes for a developer tier
 */
export function getAllowedScopesForTier(developerTier: string): string[] {
  const tierHierarchy = {
    'free': ['public'],
    'basic': ['public', 'basic'],
    'advanced': ['public', 'basic', 'advanced'], 
    'premium': ['public', 'basic', 'advanced', 'premium'],
    'enterprise': ['public', 'basic', 'advanced', 'premium', 'restricted']
  };

  const allowedTierLevels = tierHierarchy[developerTier as keyof typeof tierHierarchy] || ['public'];
  
  return API_SCOPES
    .filter(scope => allowedTierLevels.includes(scope.tierLevel))
    .map(scope => scope.scope);
}

/**
 * Validate if requested scopes are allowed for developer tier
 */
export function validateScopesForTier(requestedScopes: string[], developerTier: string): {
  valid: boolean;
  allowedScopes: string[];
  deniedScopes: string[];
} {
  const allowedScopes = getAllowedScopesForTier(developerTier);
  const deniedScopes = requestedScopes.filter(scope => !allowedScopes.includes(scope));
  
  return {
    valid: deniedScopes.length === 0,
    allowedScopes: requestedScopes.filter(scope => allowedScopes.includes(scope)),
    deniedScopes
  };
}