# Unified Development Framework - Best Practices

**Version:** 2.0  
**Last Updated:** August 20, 2025  
**Purpose:** Prevent algorithm calculation errors and enforce single source of truth

---

## 🎯 **CRITICAL REQUIREMENT: Algorithm Adherence**

### **Single Source of Truth - MANDATORY**
- **Primary Reference:** `PICKLE_PLUS_ALGORITHM_DOCUMENT.md` is the ONLY authoritative source for all point calculations
- **Implementation Files:** All calculations MUST use `shared/utils/algorithmValidation.ts` and `shared/utils/matchPointsCalculator.ts`
- **Validation Required:** Every point calculation MUST be validated against official algorithm before database updates

### **Point Calculation Standards - NON-NEGOTIABLE**

#### **Ranking Points (System B)**
```typescript
// CORRECT - Always use official calculator
import { calculateOfficialPoints } from '@/shared/utils/algorithmValidation';

const result = calculateOfficialPoints({
  playerId: player.id,
  isWin: true,
  basePoints: 3, // System B: 3 win, 1 loss
  ageMultiplier: 1.2, // Based on age group
  genderMultiplier: 1.15, // Women under 1000 points
  eventMultiplier: 1.0 // Tournament type
});

// WRONG - Manual calculations
const points = isWin ? 3 : 1; // Missing multipliers and validation
```

#### **Pickle Points (1.5x Per Match)**
```typescript
// CORRECT - Per match calculation
const picklePoints = Math.round(rankingPointsEarned * 1.5);

// WRONG - Equal to ranking points
const picklePoints = rankingPointsEarned; // Incorrect algorithm
```

---

## 🛡️ **ENFORCEMENT MECHANISMS**

### **1. Automated Validation**
- **Pre-Commit Hooks:** Run algorithm validation tests before any code commit
- **CI/CD Pipeline:** Automated testing of all point calculations against reference document
- **Database Triggers:** Validation checks before any point updates

### **2. Code Review Requirements**
- **Algorithm Changes:** Require 2+ reviewer approval for any point calculation modifications
- **Reference Checks:** All point-related PRs must reference specific algorithm document sections
- **Test Coverage:** 100% test coverage required for all calculation functions

### **3. Development Guidelines**

#### **Import Standards**
```typescript
// ALWAYS import from official utilities
import { 
  calculateOfficialPoints, 
  validatePointCalculation,
  systemValidationTest 
} from '@/shared/utils/algorithmValidation';

import { 
  calculateMatchPoints,
  validateBatchCalculations 
} from '@/shared/utils/matchPointsCalculator';

// NEVER create inline calculations
```

#### **Validation Requirements**
```typescript
// ALWAYS validate before database updates
const calculation = calculateOfficialPoints(matchResult);
const validation = validatePointCalculation(calculation, expectedResult);

if (!validation.isValid) {
  throw new Error(`Algorithm validation failed: ${validation.errors.join(', ')}`);
}

// Proceed with database update only after validation
```

#### **Error Prevention Patterns**
```typescript
// GOOD - Explicit algorithm reference
/**
 * Calculates points per PICKLE_PLUS_ALGORITHM_DOCUMENT.md Section 1
 * System B: 3 points win, 1 point loss
 * Pickle Points: 1.5x multiplier per individual match
 */
function updatePlayerPoints(matchData: MatchData) {
  const officialCalculation = calculateOfficialPoints(matchData);
  // ... rest of implementation
}

// BAD - Unclear calculation source
function updatePoints(win: boolean) {
  const points = win ? 3 : 1; // Where does this come from?
  const pickle = points; // Incorrect algorithm
}
```

---

## 📋 **DEVELOPMENT WORKFLOW**

### **Step 1: Reference Check**
Before implementing any point calculation:
1. Read relevant section in `PICKLE_PLUS_ALGORITHM_DOCUMENT.md`
2. Identify specific algorithm requirements
3. Note any multipliers, bonuses, or special cases

### **Step 2: Implementation**
1. Use official calculation utilities only
2. Import from `algorithmValidation.ts` or `matchPointsCalculator.ts`
3. Never create manual calculations

### **Step 3: Validation**
1. Run validation tests against expected results
2. Use `systemValidationTest()` for comprehensive checking
3. Log calculation breakdown in development mode

### **Step 4: Testing**
1. Write unit tests that reference algorithm document
2. Include edge cases (age multipliers, gender bonuses, etc.)
3. Validate against known correct examples

### **Step 5: Documentation**
1. Document which algorithm section was implemented
2. Include calculation examples in comments
3. Reference specific algorithm version and date

---

## 🔧 **TOOLS AND UTILITIES**

### **Required Development Tools**
- **ESLint Rules:** Custom rules to detect manual point calculations
- **TypeScript Types:** Strict typing for all calculation inputs/outputs
- **Testing Framework:** Jest with algorithm validation test suites
- **Documentation Generator:** Auto-generate docs from algorithm references

### **Monitoring and Alerts**
- **Point Calculation Monitoring:** Track all point awards for anomalies
- **Algorithm Drift Detection:** Alert when calculations deviate from expected patterns
- **Audit Logging:** Complete trail of all point calculation decisions

---

## ⚠️ **COMMON MISTAKES TO AVOID**

### **1. Incorrect Pickle Points Calculation**
```typescript
// WRONG - Equal to ranking points
picklePoints = rankingPoints;

// CORRECT - 1.5x per match
picklePoints = Math.round(rankingPointsEarned * 1.5);
```

### **2. Missing Multipliers**
```typescript
// WRONG - Base points only
const points = isWin ? 3 : 1;

// CORRECT - All multipliers applied
const points = basePoints * ageMultiplier * genderMultiplier * eventMultiplier;
```

### **3. Manual Implementation**
```typescript
// WRONG - Reimplementing algorithm
function calculatePoints(win, age, gender) {
  let points = win ? 3 : 1;
  if (age > 50) points *= 1.3;
  return points;
}

// CORRECT - Using official utilities
const result = calculateOfficialPoints(matchResult);
```

### **4. Inconsistent References**
```typescript
// WRONG - Outdated or unclear references
// Based on "old system" or "previous implementation"

// CORRECT - Explicit algorithm reference
// Per PICKLE_PLUS_ALGORITHM_DOCUMENT.md v4.0, Section 1.2
```

---

## 📊 **SUCCESS METRICS**

### **Quality Indicators**
- **Zero Algorithm Deviations:** All calculations match official document
- **100% Test Coverage:** Every calculation pathway tested
- **Automated Validation:** No manual point calculation errors
- **Clear Audit Trail:** Every point award can be traced to algorithm source

### **Performance Metrics**
- **Calculation Speed:** Sub-100ms for complex match calculations
- **Memory Efficiency:** Minimal overhead for validation processes
- **Error Rate:** Zero point calculation errors in production
- **Developer Velocity:** No delays due to algorithm confusion

---

## 🎯 **IMPLEMENTATION CHECKLIST**

### **For New Features**
- [ ] Algorithm document section identified
- [ ] Official calculation utilities imported
- [ ] Validation tests written
- [ ] Edge cases covered
- [ ] Documentation updated
- [ ] Code review completed
- [ ] CI/CD tests passing

### **For Bug Fixes**
- [ ] Root cause identified in algorithm adherence
- [ ] Correct calculation method implemented
- [ ] Validation against known examples
- [ ] Regression tests added
- [ ] Algorithm reference documented

### **For Code Reviews**
- [ ] Algorithm document sections referenced
- [ ] Official utilities used exclusively
- [ ] Manual calculations flagged and corrected
- [ ] Test coverage verified
- [ ] Performance impact assessed

---

**Remember: The algorithm document is law. When in doubt, reference the document, use the official utilities, and validate the results. Every point calculation error diminishes user trust and platform integrity.**