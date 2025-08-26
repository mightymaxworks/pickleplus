# MIXED DOUBLES ALGORITHM SCENARIOS - REAL-WORLD TESTING

## **CRITICAL DISCOVERY: Cross-Format Matches ARE Allowed**
Based on the algorithm document **Scenario 3**, mixed doubles teams CAN compete against same-gender teams. Our recent implementation incorrectly blocked these matches.

---

## **SCENARIO 1: Pure Mixed vs Mixed (Standard Case)**
**Match:** Mixed Team A (850M + 900F) vs Mixed Team B (800M + 820F)
**Tournament:** Provincial (Tier 2.0)
**All players <1000 points**

### **Calculation:**
- **Team A Gender Multiplier:** (1.0 + 1.15) ÷ 2 = **1.075x**
- **Team B Gender Multiplier:** (1.0 + 1.15) ÷ 2 = **1.075x**

### **Point Allocation:** → `mixedDoublesRankingPoints`
- **Team A Winners:** 3 × 1.075 × 2.0 = **6.45 points each**
- **Team B Losers:** 1 × 1.075 × 2.0 = **2.15 points each**

**✅ Result:** Points allocated to `mixedDoublesRankingPoints` field only.

---

## **SCENARIO 2: Mixed vs Men's Doubles (Cross-Format)**
**Match:** Mixed Team (850M + 900F) vs Men's Team (800M + 780M)
**Tournament:** Provincial (Tier 2.0)
**All players <1000 points**

### **Calculation:**
- **Mixed Team Gender Multiplier:** (1.0 + 1.15) ÷ 2 = **1.075x**
- **Men's Team Gender Multiplier:** 1.0x (same-gender)

### **Point Allocation Question:** 🤔
**CRITICAL DECISION NEEDED:**
- Should Mixed team points go to `mixedDoublesRankingPoints`?
- Should Men's team points go to `doublesRankingPoints`? 
- How do we compare rankings across different point pools?

**Current Algorithm Says:**
- **Mixed Team Winners:** 3 × 1.075 × 2.0 = **6.45 points each**
- **Men's Team Winners:** 3 × 1.0 × 2.0 = **6.0 points each**

**🚨 PROBLEM:** Different ranking pools make comparison meaningless!

---

## **SCENARIO 3: Mixed vs Women's Doubles (Cross-Format)**
**Match:** Mixed Team (850M + 900F) vs Women's Team (800F + 780F)
**Tournament:** Provincial (Tier 2.0)
**All players <1000 points**

### **Calculation:**
- **Mixed Team Gender Multiplier:** (1.0 + 1.15) ÷ 2 = **1.075x**
- **Women's Team Gender Multiplier:** 1.15x (both women <1000 points)

### **Point Allocation:**
- **Mixed Team Winners:** 3 × 1.075 × 2.0 = **6.45 points each**
- **Women's Team Winners:** 3 × 1.15 × 2.0 = **6.9 points each**

**🚨 SAME PROBLEM:** Separate ranking pools!

---

## **SCENARIO 4: Elite Level Cross-Format (No Gender Bonus)**
**Match:** Mixed Team (1200M + 1100F) vs Men's Team (1050M + 1150M)
**Tournament:** Provincial (Tier 2.0)
**Mixed team has elite players ≥1000 points**

### **Calculation:**
- **Mixed Team Gender Multiplier:** 1.0x (elite level - no bonus)
- **Men's Team Gender Multiplier:** 1.0x (same-gender)

### **Point Allocation:**
- **Mixed Team Winners:** 3 × 1.0 × 2.0 = **6.0 points each**
- **Men's Team Winners:** 3 × 1.0 × 2.0 = **6.0 points each**

**🤔 QUESTION:** Same points, but still different ranking pools?

---

## **SCENARIO 5: League Round-Robin Reality**
**League Setup:** 8 teams
- 3 Mixed Doubles teams
- 3 Men's Doubles teams  
- 2 Women's Doubles teams

**Round-Robin:** Every team plays every other team

### **Current Algorithm Problems:**
1. **Mixed teams** accumulate points in `mixedDoublesRankingPoints`
2. **Men's teams** accumulate points in `doublesRankingPoints`
3. **Women's teams** accumulate points in `doublesRankingPoints`
4. **League standings impossible** - comparing different point pools!

---

## **🚨 CRITICAL ALGORITHM FLAW IDENTIFIED**

### **The Problem:**
Our "completely separate format system" breaks down in real-world scenarios where:
1. **League play** mixes different team compositions
2. **Tournament brackets** include various team types
3. **Head-to-head records** need meaningful comparison

### **Proposed Solution Options:**

#### **Option A: Unified Doubles Pool (Recommended)**
- All doubles teams compete in same ranking pool
- Gender bonuses applied per calculation
- Points allocated to `doublesRankingPoints` for all teams
- League standings and comparisons work seamlessly

#### **Option B: Dual Allocation System**
- Cross-format matches allocate points to BOTH pools
- Mixed team vs Men's team: points go to both `mixedDoublesRankingPoints` AND `doublesRankingPoints`
- Maintains separate rankings while enabling comparisons

#### **Option C: Format-Specific Leagues Only**
- Strict segregation: Mixed only plays Mixed, Men only plays Men
- No cross-format matches allowed
- Requires restructuring all existing leagues

---

## **RECOMMENDATION: Return to Unified Doubles System**

**Reasoning:**
1. **Real-world compatibility** with existing league structures
2. **Meaningful comparisons** between all doubles teams
3. **Simplified tournament management** 
4. **Algorithm document already supports** cross-format matches

**Implementation:**
- All doubles teams use `doublesRankingPoints` field
- Gender bonuses applied during calculation
- Mixed vs Mixed, Mixed vs Same-Gender, Same-Gender vs Same-Gender all supported
- Single doubles leaderboard with fair gender adjustments