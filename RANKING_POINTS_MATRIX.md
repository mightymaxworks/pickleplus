# Pickle+ Ranking Points Matrix

## Overview
Pickle+ uses multiple ranking systems that award points differently:
1. **Pickle Points** - Community engagement and rewards
2. **Ranking Points** - Competitive skill-based rating
3. **CourtIQ Rating** - ELO-based rating system
4. **PCP Global Ranking** - Tournament-focused points

---

## 1. Pickle Points System (Community Engagement)

### Match Points
| Activity | Base Points | Notes |
|----------|-------------|-------|
| Match Win | 15 points | First 2 matches per day |
| Match Participation | 5 points | First 2 matches per day |
| Daily Match #3 | 25% reduction | 11 points win / 4 points participation |
| Daily Match #4 | 50% reduction | 8 points win / 3 points participation |
| Daily Match #5+ | 0 points | Daily limit reached |

### Additional Activities
| Activity | Points | Frequency |
|----------|--------|-----------|
| Profile Update | 25 points | Once per week |
| Tournament Participation | Variable | Based on placement |
| Community Engagement | Variable | Posts, comments, etc. |

---

## 2. Ranking Points System (Competitive Rating)

### Match Type Base Points
| Match Type | Winner Points | Loser Points | Weight Factor |
|------------|---------------|--------------|---------------|
| **Casual Match** | 3 points | 1 point | 0.5x (50% weight) |
| **League Match** | 3 points | 1 point | 0.67x (67% weight) |
| **Tournament Match** | 3 points | 1 point | 1.0x (100% weight) |

### Tournament Tier Multipliers
| Tournament Level | Multiplier | Example Win Points |
|------------------|------------|-------------------|
| Club | 1.0x | 3 points |
| Regional | 1.5x | 4.5 points |
| National | 2.0x | 6 points |
| International | 3.0x | 9 points |

---

## 3. MatchRewardService System (Variable Points)

### Casual Matches
| Result | Points Range | Average |
|--------|--------------|---------|
| Win | 3-5 points | 4 points |
| Loss | 25% of winner | 1 point |

### Tournament Matches
| Result | Points Range | Average | Notes |
|--------|--------------|---------|-------|
| Win | 8-12 points | 10 points | Before tier multiplier |
| Loss | 25% of winner | 2.5 points | Before tier multiplier |

### Tournament Tier Effects
| Tier | Multiplier | Win Range | Loss Range |
|------|------------|-----------|------------|
| Club | 1.0x | 8-12 points | 2-3 points |
| Regional | 1.5x | 12-18 points | 3-4.5 points |
| National | 2.0x | 16-24 points | 4-6 points |
| International | 3.0x | 24-36 points | 6-9 points |

---

## 4. CourtIQ Rating System (ELO-Based)

### Match Type Base Points
| Match Type | Event Tier | Winner Points | Notes |
|------------|------------|---------------|-------|
| **Casual** | - | 2 points | Base casual match |
| **League** | Local | 3 points | Local league |
| **League** | Premium/Regional | 5 points | Higher tier league |
| **Tournament** | Local | 8 points | Local tournament |
| **Tournament** | Regional | 15 points | Regional tournament |
| **Tournament** | National | 30 points | National tournament |
| **Tournament** | International | 60 points | International tournament |

### K-Factor System (Rating Changes)
| Match Type | K-Factor | Rating Impact |
|------------|----------|---------------|
| Casual | 12 | Low impact |
| League | 15 | Medium impact |
| Tournament (Club) | 24 | High impact |
| Tournament (District) | 32 | Higher impact |
| Tournament (National) | 60 | Maximum impact |
| Tournament (International) | 70 | Extreme impact |

### Loser Points (CourtIQ)
- **Participation Points**: 0.5-2.0 points for participating
- **Learning Bonus**: +10% for competitive losses (7+ point differential)
- **Close Match Bonus**: +10% for close losses (1-3 point differential)

---

## 5. PCP Global Ranking System (Tournament Focus)

### Tournament Placement Points
| Placement | Base Points | Notes |
|-----------|-------------|-------|
| Winner | 100 points | Tournament champion |
| Runner-up | 60 points | Final loss |
| Semi-finalist | 35 points | Top 4 finish |
| Quarter-finalist | 20 points | Top 8 finish |
| Round of 16 | 10 points | Top 16 finish |
| Round of 32 | 5 points | Top 32 finish |
| First Round | 1 point | Participation |
| Round Robin | 1 point | Group stage |

### Tournament Level Multipliers
| Level | Multiplier | Winner Points |
|-------|------------|---------------|
| Club | 1.0x | 100 points |
| District | 1.05x | 105 points |
| City | 1.2x | 120 points |
| Provincial | 2.0x | 200 points |
| National | 2.2x | 220 points |
| Regional | 2.7x | 270 points |
| International | 3.5x | 350 points |

### Match Points (PCP System)
| Match Type | Win Points | Loss Points |
|------------|------------|-------------|
| Casual | 1.5 points | 0.5 points |
| League | 2 points | 0.7 points |
| Tournament | 3 points | 1 point |

---

## Summary Matrix: Winner Points by System

| Match Type | Pickle Points | Ranking Points | CourtIQ | PCP Global |
|------------|---------------|----------------|---------|------------|
| **Casual Win** | 15 | 3 | 2 | 1.5 |
| **League Win** | 15 | 3 | 3-5 | 2 |
| **Club Tournament** | 15 | 3 | 8 | 3 |
| **Regional Tournament** | 15 | 4.5 | 15 | 5.4 |
| **National Tournament** | 15 | 6 | 30 | 6.6 |
| **International Tournament** | 15 | 9 | 60 | 10.5 |

## Key Differences

1. **Pickle Points**: Fixed community engagement rewards (15 per win)
2. **Ranking Points**: Competitive rating with match type weighting
3. **CourtIQ**: ELO-based system with rating differentials
4. **PCP Global**: Tournament-focused with rolling 52-week accumulation

## Active Systems
- ✅ Pickle Points (Community engagement)
- ✅ Ranking Points (Display ranking)
- ✅ CourtIQ (Advanced rating calculations)
- ✅ PCP Global (Tournament leaderboards)