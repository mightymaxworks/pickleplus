# CourtIQ™ Skill Profile - Visual Mockup Reference

## Radar Chart Visualization

```
                Serve Strength (SRV)
                       ^
                       |
                       |
                       |
Mental Toughness (MNT) +----------> Return Accuracy (RET)
                      /|\
                     / | \
                    /  |  \
                   /   |   \
Strategic Awareness +---+---+ Net Play (NET)
        (STR)      \   |   /
                    \  |  /
                     \ | /
                      \|/
Court Movement (MOV) <-+-> Dinking/Soft Game (DNK)
                       |
                       |
                       v
                Power Shots (PWR)
```

## Color Scheme

- Primary CourtIQ™ Color: `#FF5722` (Pickle+ Orange)
- Secondary/Comparison Color: `#2196F3` (Pickle+ Blue)
- Tertiary Accent: `#4CAF50` (Pickle+ Green)
- Background: White (`#FFFFFF`)
- Radar Chart Fill: `#FF5722` with 30% opacity (`#FF5722` with 0.3 alpha)
- Confidence Interval Visual: Lighter orange band around the primary line

## Component Wireframe

```
+-------------------------------------------------------+
| CourtIQ™ Skill Profile                  [Share] [Export] |
| Based on 24 matches • Provisional                     |
+-------------------------------------------------------+
| 875 CourtIQ™ Rating        Advanced Level [Top 15%] ↑ |
+-------------------------------------------------------+
| [Current] [1 Month] [3 Months] [6 Months] [1 Year]    |
+-------------------------------------------------------+
|                                                       |
|                    RADAR CHART                        |
|                                                       |
|                                                       |
|                                                       |
|                                                       |
+-------------------------------------------------------+
| +-------------+ +-------------+ +-------------+ +-------------+ 
| | Serve: 72 ↑ | | Return: 65  | | Net Play: 45| | Dinking: 38↓| 
| +-------------+ +-------------+ +-------------+ +-------------+ 
| +-------------+ +-------------+ +-------------+ +-------------+ 
| | Power: 81 ↑ | | Movement: 58| | Strategy: 67| | Mental: 54 | 
| +-------------+ +-------------+ +-------------+ +-------------+ 
+-------------------------------------------------------+
```

## Interactive Elements

1. **Dimension Selection**
   - Clicking on a dimension in the legend highlights that dimension on the chart
   - Detailed stats appear in a tooltip

2. **Timeframe Tabs**
   - Switching tabs changes the view between current snapshot and historical progression
   - Historical views show line charts of dimension values over time

3. **Comparison Toggle**
   - When in comparison mode, two radar patterns appear with different colors
   - Skills gap analysis section appears at the bottom

4. **Rating Details Tooltip**
   - Clicking on the composite rating shows a detailed breakdown

## Mobile Responsive Layout

```
+--------------------------+
| CourtIQ™ Skill Profile   |
| Based on 24 matches      |
| [Menu Icon]              |
+--------------------------+
| 875 CourtIQ™ Rating   ↑  |
| Advanced Level           |
+--------------------------+
| [Current] [1M] [3M] [6M] |
+--------------------------+
|                          |
|       RADAR CHART        |
|                          |
|                          |
+--------------------------+
| [Dimension Scroll List]  |
| > Serve: 72 ↑            |
| > Return: 65             |
| > Net Play: 45           |
+--------------------------+
```

## Empty State Design

```
+-------------------------------------------------------+
| CourtIQ™ Skill Profile                         [Info] |
| No matches recorded yet                               |
+-------------------------------------------------------+
|                                                       |
|     [Illustration of empty radar chart outline]       |
|                                                       |
|     Your CourtIQ™ Skill Profile will appear here     |
|     after you've played and recorded matches.         |
|                                                       |
|     [Record Your First Match] button                  |
|                                                       |
+-------------------------------------------------------+
```

## Provisional Status Visuals

```
+-------------------------------------------------------+
| CourtIQ™ Skill Profile                                |
| Based on 3 matches • PROVISIONAL                      |
+-------------------------------------------------------+
| [Information Box]                                     |
| Your skill profile is still being calibrated.         |
| Play 7 more matches for a more accurate assessment.   |
+-------------------------------------------------------+
|                                                       |
|         RADAR CHART WITH WIDER CONFIDENCE BANDS       |
|                                                       |
+-------------------------------------------------------+
```

## Dimension Improvement Notification

```
+--------------------------------------------+
| Skill Improvement Detected!                |
|                                            |
| Your Net Play dimension improved by 7%     |
| after your last match against John D.      |
|                                            |
| [View Details]        [Dismiss]            |
+--------------------------------------------+
```

## Performance Insights Section

```
+-------------------------------------------------------+
| Recommended Focus Areas                               |
+-------------------------------------------------------+
| 1. Dinking/Soft Game (38/100)                         |
|    Your soft game is below average for your level.    |
|    [View Drills] [Find Practice Partner]              |
|                                                       |
| 2. Net Play (45/100)                                  |
|    Recent improvement, but still room to grow.        |
|    [View Drills] [Find Coach]                         |
+-------------------------------------------------------+
```

---

This mockup document serves as a visual reference guide for implementing the CourtIQ™ Skill Profile component. The actual implementation will follow the technical specifications outlined in the implementation document while adhering to this visual design language.