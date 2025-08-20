# Unified Development Framework (UDF) Best Practices

## PCP Assessment and Rating Standards

### CRITICAL RATING STATUS REQUIREMENTS

**All PCP ratings in the Pickle+ ecosystem follow a two-tier validation system:**

1. **PROVISIONAL RATINGS** (L1-L3 Coaches)
   - Temporary assessments requiring L4+ confirmation
   - Maximum validity: 60 days (L1-L2) or 90 days (L3)
   - Must display "PROVISIONAL" status prominently in all UI components
   - Cannot be used for official tournament eligibility
   - Require clear warnings about temporary nature

2. **CONFIRMED RATINGS** (L4+ Coaches Required)
   - Official PCP ratings validated by expert-level coaches
   - Only L4 and L5 coaches can provide CONFIRMED status
   - Validity: 120 days from L4+ assessment date
   - Required for tournament participation and official rankings
   - Automatically validate any existing provisional assessments

### UDF Implementation Requirements

**ALL components dealing with PCP ratings MUST:**

1. **Display Rating Status Clearly**
   ```tsx
   // REQUIRED: Always show rating status
   <Badge variant={ratingStatus === 'CONFIRMED' ? 'default' : 'secondary'}>
     {ratingStatus} RATING
   </Badge>
   ```

2. **Include Expiration Warnings**
   ```tsx
   // REQUIRED: Show days until expiration
   {daysUntilExpiration && daysUntilExpiration < 30 && (
     <Alert variant="warning">
       Rating expires in {daysUntilExpiration} days - L4+ confirmation needed
     </Alert>
   )}
   ```

3. **Prevent Unauthorized Actions**
   ```tsx
   // REQUIRED: Block tournament entry with provisional ratings
   if (ratingStatus === 'PROVISIONAL') {
     return <TournamentBlockedMessage reason="Requires confirmed PCP rating" />;
   }
   ```

### Coach Assessment Component Standards

**Assessment Tools MUST:**

1. **Display Coach Level Authority**
   ```tsx
   // Show what the coach's assessment can accomplish
   {coachLevel >= 4 ? (
     <Badge className="bg-green-600">Can Confirm Ratings</Badge>
   ) : (
     <Badge variant="outline">Provisional Assessment Only</Badge>
   )}
   ```

2. **Show Assessment Impact**
   ```tsx
   // Explain the result of the assessment
   <div className="assessment-impact">
     Your L{coachLevel} assessment will {coachLevel >= 4 ? 'CONFIRM' : 'create PROVISIONAL'} rating
   </div>
   ```

3. **Validate Coach-Student Relationships**
   ```tsx
   // Prevent self-assessment and unauthorized assessments
   if (coachId === studentId) {
     throw new Error("Coaches cannot assess themselves");
   }
   ```

### Algorithm Integration Requirements

**All PCP calculations MUST:**

1. **Use Weighted Assessment Utilities**
   ```typescript
   import { calculateWeightedPCP, validateAssessmentRequirements } from '@shared/utils/coachWeightedAssessment';
   
   const result = calculateWeightedPCP(assessments);
   // result.ratingStatus will be 'PROVISIONAL' or 'CONFIRMED'
   ```

2. **Enforce Validation Requirements**
   ```typescript
   const validation = validateAssessmentRequirements(assessments);
   if (!validation.isValid) {
     throw new Error(validation.reason);
   }
   ```

3. **Apply Correct Weight Matrix**
   ```typescript
   // REQUIRED: Use updated coach level weights
   const COACH_WEIGHTS = {
     1: 0.7, // Minimal influence
     2: 1.0, // Standard baseline  
     3: 1.8, // Advanced tactical
     4: 3.2, // Expert analysis (largest gap)
     5: 3.8  // Master authority
   };
   ```

### Database Schema Requirements

**All rating storage MUST include:**

```sql
-- REQUIRED fields for any PCP rating storage
rating_status VARCHAR(20) NOT NULL CHECK (rating_status IN ('PROVISIONAL', 'CONFIRMED')),
status_reason VARCHAR(200) NOT NULL,
confirmed_by_coach_id INTEGER, -- L4+ coach who confirmed rating
confirmation_date TIMESTAMP,
expiration_date TIMESTAMP NOT NULL,
highest_assessing_coach_level INTEGER NOT NULL
```

### UI/UX Standards

**Rating Display Components MUST:**

1. **Color-Code Status**
   - CONFIRMED: Green badges/indicators
   - PROVISIONAL: Orange/amber badges with warning indicators

2. **Show Clear Messaging**
   - "Official PCP Rating" for confirmed
   - "Provisional Rating - Requires L4+ Confirmation" for provisional

3. **Provide Action Guidance**
   - Clear paths to find L4+ coaches for confirmation
   - Expiration date countdowns
   - Blocked feature explanations

### Quality Assurance Checklist

**Before any PCP-related deployment, verify:**

- [ ] Rating status displayed in all PCP components
- [ ] Expiration dates calculated and shown correctly
- [ ] Tournament/official features blocked for provisional ratings
- [ ] Coach level validation working properly
- [ ] Assessment weight calculations using updated matrix
- [ ] Self-assessment prevention active
- [ ] L4+ confirmation logic implemented
- [ ] Database includes all required rating status fields
- [ ] UI shows clear provisional vs confirmed distinction

### Error Handling Standards

**Common scenarios requiring specific handling:**

1. **Expired Provisional Ratings**
   ```typescript
   if (ratingStatus === 'PROVISIONAL' && daysUntilExpiration <= 0) {
     return <ExpiredRatingWarning />;
   }
   ```

2. **Missing L4+ Validation**
   ```typescript
   if (!hasL4PlusValidation && daysSinceAssessment > 60) {
     return <RequiresConfirmationMessage />;
   }
   ```

3. **Coach Level Insufficient**
   ```typescript
   if (coachLevel < 4 && attemptingToConfirm) {
     throw new Error("Only L4+ coaches can confirm PCP ratings");
   }
   ```

This framework ensures consistent, high-quality PCP assessment implementation across all Pickle+ components while maintaining the critical distinction between provisional and confirmed ratings.