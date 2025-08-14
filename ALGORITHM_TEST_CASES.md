# Pickle+ Algorithm Test Cases & Verification

## Base Algorithm Reference
- **Win:** 3 points
- **Loss:** 1 point
- **Age Multipliers:** Pro(1.0x), 19+(1.0x), 35+(1.2x), 50+(1.3x), 60+(1.5x), 70+(1.6x)
- **Tournament Multipliers:** Casual(1.0x), Club(1.0x), Tournament(1.5x), Regional(2.0x), National(2.5x), International(3.0x)
- **Gender Multipliers:** Women(1.15x cross-gender <1000pts), Mixed(1.075x cross-gender <1000pts), Elite(no bonus ≥1000pts)

---

## TEST CASE 1: SIMPLE SINGLES (BASELINE)
**Scenario:** Two 25-year-old males, casual match, both beginners

### Match Details:
- **Player A:** Male, 25 years (19+ category), 150 ranking points
- **Player B:** Male, 25 years (19+ category), 175 ranking points
- **Match Type:** Casual Singles
- **Result:** Player A wins

### Calculation Logic:
```
Base Points: Win = 3, Loss = 1
Age Multiplier: 19+ = 1.0x (both players)
Tournament Multiplier: Casual = 1.0x
Gender Multiplier: Same gender = 1.0x (no cross-gender bonus)

Player A (Winner): 3 × 1.0 × 1.0 × 1.0 = 3 points
Player B (Loser): 1 × 1.0 × 1.0 × 1.0 = 1 point
```

**Expected Allocation:**
- Player A: +3 points to Singles ranking, +3 points to 19+ age group
- Player B: +1 point to Singles ranking, +1 point to 19+ age group

---

## TEST CASE 2: AGE GROUP ADVANTAGE
**Scenario:** Senior vs younger player in tournament

### Match Details:
- **Player A:** Male, 72 years (70+ category), 800 ranking points
- **Player B:** Male, 30 years (19+ category), 850 ranking points
- **Match Type:** Tournament Singles
- **Result:** Player A wins

### Calculation Logic:
```
Base Points: Win = 3, Loss = 1
Age Multiplier: Player A (70+) = 1.6x, Player B (19+) = 1.0x
Tournament Multiplier: Tournament = 1.5x
Gender Multiplier: Same gender = 1.0x

Player A (Winner): 3 × 1.6 × 1.5 × 1.0 = 7.2 → 7 points
Player B (Loser): 1 × 1.0 × 1.5 × 1.0 = 1.5 → 2 points
```

**Expected Allocation:**
- Player A: +7 points to Singles ranking, +7 points to 70+ age group
- Player B: +2 points to Singles ranking, +2 points to 19+ age group

---

## TEST CASE 3: CROSS-GENDER WITH BONUS
**Scenario:** Development-level cross-gender match

### Match Details:
- **Player A:** Female, 28 years (19+ category), 750 ranking points
- **Player B:** Male, 32 years (19+ category), 800 ranking points
- **Match Type:** Tournament Singles
- **Result:** Player A wins

### Calculation Logic:
```
Base Points: Win = 3, Loss = 1
Age Multiplier: Both 19+ = 1.0x
Tournament Multiplier: Tournament = 1.5x
Gender Multiplier: Female gets 1.15x (cross-gender, <1000 pts), Male gets 1.0x

Player A (Winner): 3 × 1.0 × 1.5 × 1.15 = 5.175 → 5 points
Player B (Loser): 1 × 1.0 × 1.5 × 1.0 = 1.5 → 2 points
```

**Expected Allocation:**
- Player A: +5 points to Singles ranking, +5 points to 19+ age group
- Player B: +2 points to Singles ranking, +2 points to 19+ age group

---

## TEST CASE 4: ELITE CROSS-GENDER (NO BONUS)
**Scenario:** Elite-level cross-gender match

### Match Details:
- **Player A:** Female, 35 years (35+ category), 1200 ranking points
- **Player B:** Male, 40 years (35+ category), 1150 ranking points
- **Match Type:** Tournament Singles
- **Result:** Player B wins

### Calculation Logic:
```
Base Points: Win = 3, Loss = 1
Age Multiplier: Both 35+ = 1.2x
Tournament Multiplier: Tournament = 1.5x
Gender Multiplier: Both ≥1000 pts = 1.0x (NO gender bonus for elite players)

Player A (Loser): 1 × 1.2 × 1.5 × 1.0 = 1.8 → 2 points
Player B (Winner): 3 × 1.2 × 1.5 × 1.0 = 5.4 → 5 points
```

**Expected Allocation:**
- Player A: +2 points to Singles ranking, +2 points to 35+ age group
- Player B: +5 points to Singles ranking, +5 points to 35+ age group

---

## TEST CASE 5: COMPLEX DOUBLES WITH MIXED TEAM
**Scenario:** Mixed doubles with age differences

### Match Details:
**Team 1 (Mixed):**
- **Player A:** Female, 45 years (35+ category), 650 ranking points
- **Player B:** Male, 52 years (50+ category), 720 ranking points

**Team 2 (Same Gender):**
- **Player C:** Male, 38 years (35+ category), 680 ranking points
- **Player D:** Male, 41 years (35+ category), 710 ranking points

- **Match Type:** Regional Doubles
- **Result:** Team 1 wins

### Calculation Logic:
```
Base Points: Win = 3, Loss = 1
Age Multipliers: 
- Player A (35+) = 1.2x
- Player B (50+) = 1.3x  
- Player C (35+) = 1.2x
- Player D (35+) = 1.2x

Tournament Multiplier: Regional = 2.0x
Gender Multiplier: 
- Team 1 (Mixed, all <1000 pts) = 1.075x
- Team 2 (Same gender) = 1.0x

Team 1 Winners:
Player A: 3 × 1.2 × 2.0 × 1.075 = 7.74 → 8 points
Player B: 3 × 1.3 × 2.0 × 1.075 = 8.385 → 8 points

Team 2 Losers:
Player C: 1 × 1.2 × 2.0 × 1.0 = 2.4 → 2 points
Player D: 1 × 1.2 × 2.0 × 1.0 = 2.4 → 2 points
```

**Expected Allocation:**
- Player A: +8 points to Doubles ranking, +8 points to 35+ age group
- Player B: +8 points to Doubles ranking, +8 points to 50+ age group
- Player C: +2 points to Doubles ranking, +2 points to 35+ age group
- Player D: +2 points to Doubles ranking, +2 points to 35+ age group

---

## TEST CASE 6: MAXIMUM COMPLEXITY
**Scenario:** International tournament with elite cross-gender and age gaps

### Match Details:
**Team 1:**
- **Player A:** Female, 68 years (60+ category), 1500 ranking points (ELITE)
- **Player B:** Male, 35 years (35+ category), 1200 ranking points (ELITE)

**Team 2:**
- **Player C:** Female, 42 years (35+ category), 950 ranking points
- **Player D:** Male, 29 years (19+ category), 980 ranking points

- **Match Type:** International Doubles
- **Result:** Team 2 wins (upset!)

### Calculation Logic:
```
Base Points: Win = 3, Loss = 1
Age Multipliers:
- Player A (60+) = 1.5x
- Player B (35+) = 1.2x
- Player C (35+) = 1.2x
- Player D (19+) = 1.0x

Tournament Multiplier: International = 3.0x
Gender Multiplier:
- Team 1: Both players ≥1000 pts = 1.0x (NO bonus for elite)
- Team 2: Both players <1000 pts, mixed team = 1.075x

Team 1 Losers (Elite):
Player A: 1 × 1.5 × 3.0 × 1.0 = 4.5 → 5 points
Player B: 1 × 1.2 × 3.0 × 1.0 = 3.6 → 4 points

Team 2 Winners (Development):
Player C: 3 × 1.2 × 3.0 × 1.075 = 11.61 → 12 points
Player D: 3 × 1.0 × 3.0 × 1.075 = 9.675 → 10 points
```

**Expected Allocation:**
- Player A: +5 points to Doubles ranking, +5 points to 60+ age group
- Player B: +4 points to Doubles ranking, +4 points to 35+ age group
- Player C: +12 points to Doubles ranking, +12 points to 35+ age group
- Player D: +10 points to Doubles ranking, +10 points to 19+ age group

---

## VERIFICATION CHECKLIST

### ✅ Core Logic Validation:
1. **Base Points:** All calculations use 3/1 win/loss structure
2. **Age Multipliers:** Applied correctly per age category
3. **Tournament Multipliers:** Escalate properly by competition level
4. **Gender Logic:** 
   - Cross-gender bonuses only for <1000 point players
   - Elite players (≥1000) get no gender bonuses
   - Mixed teams get 1.075x, women get 1.15x in cross-gender

### ✅ Point Allocation Logic:
1. **Singles:** Points go to Singles ranking + age group ranking
2. **Doubles:** Points go to Doubles ranking + age group ranking
3. **No Cross-Gender Rankings:** Points allocated to respective category rankings only

### ✅ Rounding Rules:
- All final point calculations rounded to nearest integer
- Fractional points (0.5+) round up, (<0.5) round down

---

## EXPECTED BEHAVIOR SUMMARY

The algorithm should:
1. **Reward Participation:** Everyone gets points (minimum 1 for loss)
2. **Encourage Senior Play:** Age multipliers increase participation incentives
3. **Balance Gender Competition:** Development-level bonuses, no elite bonuses
4. **Scale with Competition:** Higher tournament levels = more points
5. **Maintain Simplicity:** Clear 3/1 base with transparent multipliers