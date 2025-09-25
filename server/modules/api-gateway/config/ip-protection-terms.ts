/**
 * PKL-278651-API-0001-IP-PROTECTION
 * Intellectual Property Protection Terms and Enforcement
 * 
 * Legal and technical framework for protecting ranking algorithm IP
 * through comprehensive terms of service and usage monitoring.
 */

export const API_TERMS_OF_SERVICE = {
  version: "2.0",
  effective_date: "2025-01-15",
  
  intellectual_property: {
    algorithm_protection: {
      statement: "All ranking algorithms, calculation methods, performance analysis techniques, and related intellectual property are proprietary to Pickle+ and protected by trade secret, copyright, and other applicable laws.",
      
      prohibited_activities: [
        "Reverse engineering of ranking algorithms through API data analysis",
        "Attempting to reconstruct calculation formulas from API responses", 
        "Bulk extraction of data for competitive analysis or algorithm replication",
        "Creating competing ranking systems using insights gained from API access",
        "Sharing, selling, or redistributing algorithmic insights to third parties",
        "Using machine learning or statistical analysis to deduce proprietary methods",
        "Coordinated data collection across multiple API keys to circumvent rate limits",
        "Any automated analysis designed to understand internal algorithm logic"
      ],
      
      enforcement_measures: [
        "Immediate API key revocation for violations",
        "Legal action for intellectual property theft",
        "Permanent ban from developer program",
        "Financial penalties as specified in developer agreement"
      ]
    },
    
    data_usage_restrictions: {
      permitted_uses: [
        "Displaying ranking positions in your application interface",
        "Creating user dashboards with performance summaries", 
        "Generating basic analytics reports for end users",
        "Integrating tournament and match data into event systems",
        "Building social features around public player achievements"
      ],
      
      prohibited_uses: [
        "Creating alternative ranking systems or competitive algorithms",
        "Selling access to Pickle+ data or derived insights to third parties",
        "Building products that compete directly with Pickle+ core functionality",
        "Aggregating data across users for market research without permission",
        "Using predictive modeling to forecast ranking changes or outcomes"
      ]
    }
  },
  
  technical_enforcement: {
    monitoring: "All API usage is continuously monitored for compliance with these terms",
    detection_methods: [
      "Automated pattern recognition for suspicious usage",
      "Rate limiting and bulk extraction prevention",
      "Statistical analysis of request patterns",
      "Real-time anomaly detection",
      "Cross-referencing usage patterns across developer accounts"
    ],
    
    violation_detection_criteria: {
      bulk_extraction: "Requesting more than 50 records per request or 500 records per day",
      pattern_analysis: "Making requests to diverse endpoints in patterns suggesting algorithm reverse engineering", 
      high_volume: "Exceeding normal usage patterns by 10x without business justification",
      suspicious_timing: "Coordinated requests timed to capture algorithm recalibrations",
      data_correlation: "Cross-referencing data from multiple endpoints to deduce internal calculations"
    }
  },
  
  developer_responsibilities: {
    compliance: "Developers must ensure their applications comply with all IP protection terms",
    reporting: "Any discovered vulnerabilities or unintended algorithm exposure must be reported immediately",
    data_security: "All API data must be stored securely and not exposed to unauthorized parties",
    user_consent: "End users must consent to data usage as specified in Pickle+ privacy policy",
    attribution: "Proper attribution to Pickle+ must be displayed when using API data"
  },
  
  audit_and_review: {
    periodic_reviews: "Pickle+ reserves the right to audit API usage for compliance",
    data_requests: "Developers may be required to provide usage logs and data handling documentation",
    application_review: "Applications using advanced scopes subject to periodic compliance review",
    immediate_access: "Pickle+ retains right to immediate access for security investigations"
  }
};

/**
 * Generate developer agreement text based on requested scopes
 */
export function generateDeveloperAgreement(requestedScopes: string[]): string {
  const hasAlgorithmScopes = requestedScopes.some(scope => 
    scope.includes('ranking') || scope.includes('courtiq') || scope.includes('algorithm')
  );
  
  const hasAdvancedScopes = requestedScopes.some(scope =>
    scope.includes('advanced') || scope.includes('analytics')
  );

  let agreement = `
PICKLE+ API DEVELOPER AGREEMENT
Version ${API_TERMS_OF_SERVICE.version}
Effective Date: ${API_TERMS_OF_SERVICE.effective_date}

By using the Pickle+ API, you agree to the following terms:

1. INTELLECTUAL PROPERTY PROTECTION
${API_TERMS_OF_SERVICE.intellectual_property.algorithm_protection.statement}

PROHIBITED ACTIVITIES:
${API_TERMS_OF_SERVICE.intellectual_property.algorithm_protection.prohibited_activities.map(activity => `• ${activity}`).join('\n')}

2. DATA USAGE TERMS
Your application is permitted to:
${API_TERMS_OF_SERVICE.intellectual_property.data_usage_restrictions.permitted_uses.map(use => `• ${use}`).join('\n')}

Your application is prohibited from:
${API_TERMS_OF_SERVICE.intellectual_property.data_usage_restrictions.prohibited_uses.map(use => `• ${use}`).join('\n')}

3. TECHNICAL MONITORING
${API_TERMS_OF_SERVICE.technical_enforcement.monitoring}

Violation detection includes:
${Object.entries(API_TERMS_OF_SERVICE.technical_enforcement.violation_detection_criteria).map(([key, value]) => `• ${key}: ${value}`).join('\n')}
`;

  if (hasAlgorithmScopes) {
    agreement += `
4. ENHANCED ALGORITHM PROTECTION
Due to your request for algorithm-related scopes, additional restrictions apply:
• No reverse engineering attempts of any kind
• No statistical analysis to infer calculation methods
• No sharing of algorithmic insights with competitors
• Immediate reporting of any algorithm-related vulnerabilities
• Enhanced monitoring and audit requirements
`;
  }

  if (hasAdvancedScopes) {
    agreement += `
5. ADVANCED DATA PROTECTION
Your access to advanced analytics requires:
• Secure storage of all API data
• Regular compliance reporting
• User consent documentation
• Data handling procedure documentation
• Quarterly compliance reviews
`;
  }

  agreement += `
6. ENFORCEMENT
Violations may result in:
${API_TERMS_OF_SERVICE.intellectual_property.algorithm_protection.enforcement_measures.map(measure => `• ${measure}`).join('\n')}

7. DEVELOPER RESPONSIBILITIES
${Object.entries(API_TERMS_OF_SERVICE.developer_responsibilities).map(([key, value]) => `• ${key}: ${value}`).join('\n')}

By proceeding with API key generation, you acknowledge that you have read, understood, and agree to comply with these terms.
`;

  return agreement;
}

/**
 * Check if usage pattern violates IP protection terms
 */
export function checkIPViolation(usagePattern: {
  requestCount: number;
  uniqueEndpoints: number;
  bulkRequests: number;
  algorithmEndpoints: number;
  timeSpan: number; // hours
}): {
  isViolation: boolean;
  violationType?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description?: string;
} {
  const { requestCount, uniqueEndpoints, bulkRequests, algorithmEndpoints, timeSpan } = usagePattern;
  
  // Critical: Clear reverse engineering attempt
  if (algorithmEndpoints > 100 && uniqueEndpoints > 15 && timeSpan < 24) {
    return {
      isViolation: true,
      violationType: 'reverse_engineering_attempt',
      severity: 'critical',
      description: 'Pattern suggests systematic algorithm reverse engineering attempt'
    };
  }
  
  // High: Bulk extraction violation
  if (bulkRequests > 10 && requestCount > 1000) {
    return {
      isViolation: true,
      violationType: 'bulk_extraction',
      severity: 'high', 
      description: 'Excessive bulk data extraction detected'
    };
  }
  
  // Medium: Suspicious scanning pattern
  if (uniqueEndpoints > 20 && requestCount > 500 && timeSpan < 48) {
    return {
      isViolation: true,
      violationType: 'endpoint_scanning',
      severity: 'medium',
      description: 'Suspicious endpoint scanning pattern detected'
    };
  }
  
  // Low: High volume usage
  if (requestCount > 2000 && timeSpan < 24) {
    return {
      isViolation: false, // Not a violation but worth monitoring
      violationType: 'high_volume',
      severity: 'low',
      description: 'High volume usage detected - monitor for escalation'
    };
  }
  
  return {
    isViolation: false,
    severity: 'low'
  };
}

/**
 * Generate compliance report template
 */
export function generateComplianceReport(apiKeyPrefix: string, timeframe: string): string {
  return `
PICKLE+ API COMPLIANCE REPORT
API Key: ${apiKeyPrefix}
Report Period: ${timeframe}
Generated: ${new Date().toISOString()}

This report documents compliance with Pickle+ IP protection terms:

1. USAGE SUMMARY
   - Total API requests: [TO BE FILLED]
   - Endpoints accessed: [TO BE FILLED] 
   - Peak usage periods: [TO BE FILLED]
   - Data volume transferred: [TO BE FILLED]

2. ALGORITHM ACCESS REVIEW
   - Ranking endpoint usage: [TO BE FILLED]
   - CourtIQ endpoint usage: [TO BE FILLED]
   - Advanced analytics usage: [TO BE FILLED]
   - Any algorithm-related concerns: [TO BE FILLED]

3. DATA HANDLING COMPLIANCE
   - Data storage security: [CONFIRM COMPLIANT]
   - User consent documentation: [CONFIRM COMPLIANT]
   - Third-party data sharing: [CONFIRM NONE]
   - Attribution compliance: [CONFIRM COMPLIANT]

4. VIOLATION MONITORING
   - Detected violations: [TO BE FILLED]
   - Corrective actions taken: [TO BE FILLED]
   - Ongoing monitoring: [CONFIRM ACTIVE]

Developer Signature: _______________________
Date: _______________________

This report must be submitted quarterly for advanced scope access.
`;
}