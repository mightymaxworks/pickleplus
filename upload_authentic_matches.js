// Script to upload all 33 authentic matches from screenshots
const matches = [
  // Match 3-1: Kai/Gloria vs Tony/ricky → Tony/ricky WON 15:8
  {
    date: '2024-08-11',
    team1Player1Id: 261, // Kai
    team1Player2Id: 262, // Gloria  
    team2Player1Id: 263, // Tony
    team2Player2Id: 264, // ricky
    team1Score: 8,
    team2Score: 15,
    winnerId: 263 // Tony's team won
  },
  // Match 3-2: Mark/Ceiye vs 雪/罗蒜头兄 → Mark/Ceiye WON 15:10
  {
    date: '2024-08-11',
    team1Player1Id: 265, // Mark
    team1Player2Id: 237, // ceiye
    team2Player1Id: 168, // 雪
    team2Player2Id: 268, // 罗蒜头兄
    team1Score: 15,
    team2Score: 10,
    winnerId: 265 // Mark's team won
  },
  // Match 4-1: 宇/Allenshen vs 杨浩嘉/Gloria → 杨浩嘉/Gloria WON 15:8
  {
    date: '2024-08-11',
    team1Player1Id: 233, // 宇 (zhouqiyu)
    team1Player2Id: 229, // Allenshen
    team2Player1Id: 235, // 杨浩嘉
    team2Player2Id: 262, // Gloria
    team1Score: 8,
    team2Score: 15,
    winnerId: 235 // 杨浩嘉's team won
  },
  // Match 4-2: 雪/Tony vs Kai/ricky → 雪/Tony WON 15:12
  {
    date: '2024-08-11',
    team1Player1Id: 168, // 雪
    team1Player2Id: 263, // Tony
    team2Player1Id: 261, // Kai
    team2Player2Id: 264, // ricky
    team1Score: 15,
    team2Score: 12,
    winnerId: 168 // 雪's team won
  },
  // Match 5-1: Kai/Mark vs 杨浩嘉/Gloria → Kai/Mark WON 15:11
  {
    date: '2024-08-11',
    team1Player1Id: 261, // Kai
    team1Player2Id: 265, // Mark
    team2Player1Id: 235, // 杨浩嘉
    team2Player2Id: 262, // Gloria
    team1Score: 15,
    team2Score: 11,
    winnerId: 261 // Kai's team won
  },
  // Match 5-2: Tony/焦 vs Allenshen/Ceiye → Tony/焦 WON 15:7
  {
    date: '2024-08-11',
    team1Player1Id: 263, // Tony
    team1Player2Id: 258, // 焦
    team2Player1Id: 229, // Allenshen
    team2Player2Id: 237, // ceiye
    team1Score: 15,
    team2Score: 7,
    winnerId: 263 // Tony's team won
  },
  // Match 6-1: 雪/杨浩嘉 vs Mark/Gloria → 雪/杨浩嘉 WON 15:9
  {
    date: '2024-08-11',
    team1Player1Id: 168, // 雪
    team1Player2Id: 235, // 杨浩嘉
    team2Player1Id: 265, // Mark
    team2Player2Id: 262, // Gloria
    team1Score: 15,
    team2Score: 9,
    winnerId: 168 // 雪's team won
  },
  // Match 6-2: Tony/宇 vs 焦/罗蒜头兄 → Tony/宇 WON 15:7
  {
    date: '2024-08-11',
    team1Player1Id: 263, // Tony
    team1Player2Id: 233, // 宇
    team2Player1Id: 258, // 焦
    team2Player2Id: 268, // 罗蒜头兄
    team1Score: 15,
    team2Score: 7,
    winnerId: 263 // Tony's team won
  },
  // Match 7-1: Kai/焦 vs 雪/Allenshen → Kai/焦 WON 15:13
  {
    date: '2024-08-11',
    team1Player1Id: 261, // Kai
    team1Player2Id: 258, // 焦
    team2Player1Id: 168, // 雪
    team2Player2Id: 229, // Allenshen
    team1Score: 15,
    team2Score: 13,
    winnerId: 261 // Kai's team won
  },
  // Match 7-2: 焦/ricky vs 杨浩嘉/宇 → 杨浩嘉/宇 WON 15:11
  {
    date: '2024-08-11',
    team1Player1Id: 258, // 焦
    team1Player2Id: 264, // ricky
    team2Player1Id: 235, // 杨浩嘉
    team2Player2Id: 233, // 宇
    team1Score: 11,
    team2Score: 15,
    winnerId: 235 // 杨浩嘉's team won
  },
  // Match 8-1: Tony/罗蒜头兄 vs 雪/Allenshen → Tony/罗蒜头兄 WON 15:7
  {
    date: '2024-08-11',
    team1Player1Id: 263, // Tony
    team1Player2Id: 268, // 罗蒜头兄
    team2Player1Id: 168, // 雪
    team2Player2Id: 229, // Allenshen
    team1Score: 15,
    team2Score: 7,
    winnerId: 263 // Tony's team won
  },
  // Match 8-2: 宇/Gloria vs 杨浩嘉/Ceiye → 宇/Gloria WON 15:8
  {
    date: '2024-08-11',
    team1Player1Id: 233, // 宇
    team1Player2Id: 262, // Gloria
    team2Player1Id: 235, // 杨浩嘉
    team2Player2Id: 237, // ceiye
    team1Score: 15,
    team2Score: 8,
    winnerId: 233 // 宇's team won
  },
  // Match 9-1: Mark/焦 vs Kai/Allenshen → Mark/焦 WON 15:12
  {
    date: '2024-08-11',
    team1Player1Id: 265, // Mark
    team1Player2Id: 258, // 焦
    team2Player1Id: 261, // Kai
    team2Player2Id: 229, // Allenshen
    team1Score: 15,
    team2Score: 12,
    winnerId: 265 // Mark's team won
  },
  // Match 9-2: Tony/Allenshen vs 宇/Ceiye → Tony/Allenshen WON 15:10
  {
    date: '2024-08-11',
    team1Player1Id: 263, // Tony
    team1Player2Id: 229, // Allenshen
    team2Player1Id: 233, // 宇
    team2Player2Id: 237, // ceiye
    team1Score: 15,
    team2Score: 10,
    winnerId: 263 // Tony's team won
  },
  // Match 10-1: Mark/罗蒜头兄 vs Kai/ricky → Mark/罗蒜头兄 WON 15:11
  {
    date: '2024-08-11',
    team1Player1Id: 265, // Mark
    team1Player2Id: 268, // 罗蒜头兄
    team2Player1Id: 261, // Kai
    team2Player2Id: 264, // ricky
    team1Score: 15,
    team2Score: 11,
    winnerId: 265 // Mark's team won
  },
  // Match 10-2: 雪/Ceiye vs 焦/Allenshen → 雪/Ceiye WON 15:12
  {
    date: '2024-08-11',
    team1Player1Id: 168, // 雪
    team1Player2Id: 237, // ceiye
    team2Player1Id: 258, // 焦
    team2Player2Id: 229, // Allenshen
    team1Score: 15,
    team2Score: 12,
    winnerId: 168 // 雪's team won
  },
  // Match 11-1: 宇/Mark vs Tony/Kai → Tony/Kai WON 15:7
  {
    date: '2024-08-11',
    team1Player1Id: 233, // 宇
    team1Player2Id: 265, // Mark
    team2Player1Id: 263, // Tony
    team2Player2Id: 261, // Kai
    team1Score: 7,
    team2Score: 15,
    winnerId: 263 // Tony's team won
  },
  // Match 11-2: Gloria/罗蒜头兄 vs 杨浩嘉/ricky → Gloria/罗蒜头兄 WON 15:13
  {
    date: '2024-08-11',
    team1Player1Id: 262, // Gloria
    team1Player2Id: 268, // 罗蒜头兄
    team2Player1Id: 235, // 杨浩嘉
    team2Player2Id: 264, // ricky
    team1Score: 15,
    team2Score: 13,
    winnerId: 262 // Gloria's team won
  },
  // Match 12-1: ricky/Mark vs 焦/Kai → ricky/Mark WON 15:11
  {
    date: '2024-08-11',
    team1Player1Id: 264, // ricky
    team1Player2Id: 265, // Mark
    team2Player1Id: 258, // 焦
    team2Player2Id: 261, // Kai
    team1Score: 15,
    team2Score: 11,
    winnerId: 264 // ricky's team won
  },
  // Match 12-2: Ceiye/Gloria vs 雪/宇 → 雪/宇 WON 15:9
  {
    date: '2024-08-11',
    team1Player1Id: 237, // ceiye
    team1Player2Id: 262, // Gloria
    team2Player1Id: 168, // 雪
    team2Player2Id: 233, // 宇
    team1Score: 9,
    team2Score: 15,
    winnerId: 168 // 雪's team won
  },
  // Match 13-1: 焦/雪 vs Tony/Allenshen → 焦/雪 WON 15:12
  {
    date: '2024-08-11',
    team1Player1Id: 258, // 焦
    team1Player2Id: 168, // 雪
    team2Player1Id: 263, // Tony
    team2Player2Id: 229, // Allenshen
    team1Score: 15,
    team2Score: 12,
    winnerId: 258 // 焦's team won
  },
  // Match 13-2: Tony/Mark vs Ceiye/ricky → Tony/Mark WON 15:14
  {
    date: '2024-08-11',
    team1Player1Id: 263, // Tony
    team1Player2Id: 265, // Mark
    team2Player1Id: 237, // ceiye
    team2Player2Id: 264, // ricky
    team1Score: 15,
    team2Score: 14,
    winnerId: 263 // Tony's team won
  },
  // Match 14-1: Kai/Ceiye vs 杨浩嘉/罗蒜头兄 → Kai/Ceiye WON 15:6
  {
    date: '2024-08-11',
    team1Player1Id: 261, // Kai
    team1Player2Id: 237, // ceiye
    team2Player1Id: 235, // 杨浩嘉
    team2Player2Id: 268, // 罗蒜头兄
    team1Score: 15,
    team2Score: 6,
    winnerId: 261 // Kai's team won
  },
  // Match 14-2: 宇/ricky vs Allenshen/Gloria → 宇/ricky WON 15:11
  {
    date: '2024-08-11',
    team1Player1Id: 233, // 宇
    team1Player2Id: 264, // ricky
    team2Player1Id: 229, // Allenshen
    team2Player2Id: 262, // Gloria
    team1Score: 15,
    team2Score: 11,
    winnerId: 233 // 宇's team won
  },
  // Match 15-1: Tony/Gloria vs 雪/Mark → Tony/Gloria WON 15:13
  {
    date: '2024-08-11',
    team1Player1Id: 263, // Tony
    team1Player2Id: 262, // Gloria
    team2Player1Id: 168, // 雪
    team2Player2Id: 265, // Mark
    team1Score: 15,
    team2Score: 13,
    winnerId: 263 // Tony's team won
  },
  // Match 15-2: 焦/Ceiye vs Kai/罗蒜头兄 → 焦/Ceiye WON 15:10
  {
    date: '2024-08-11',
    team1Player1Id: 258, // 焦
    team1Player2Id: 237, // ceiye
    team2Player1Id: 261, // Kai
    team2Player2Id: 268, // 罗蒜头兄
    team1Score: 15,
    team2Score: 10,
    winnerId: 258 // 焦's team won
  },
  // Match 16-1: Allenshen/Kai vs 杨浩嘉/Mark → 杨浩嘉/Mark WON 17:15
  {
    date: '2024-08-11',
    team1Player1Id: 229, // Allenshen
    team1Player2Id: 261, // Kai
    team2Player1Id: 235, // 杨浩嘉
    team2Player2Id: 265, // Mark
    team1Score: 15,
    team2Score: 17,
    winnerId: 235 // 杨浩嘉's team won
  },
  // Match 16-2: 杨浩嘉/Tony vs 雪/ricky → 杨浩嘉/Tony WON 15:12
  {
    date: '2024-08-11',
    team1Player1Id: 235, // 杨浩嘉
    team1Player2Id: 263, // Tony
    team2Player1Id: 168, // 雪
    team2Player2Id: 264, // ricky
    team1Score: 15,
    team2Score: 12,
    winnerId: 235 // 杨浩嘉's team won
  },
  // Match 17-1: Mark/Gloria vs Kai/杨浩嘉 → Mark/Gloria WON 15:11
  {
    date: '2024-08-11',
    team1Player1Id: 265, // Mark
    team1Player2Id: 262, // Gloria
    team2Player1Id: 261, // Kai
    team2Player2Id: 235, // 杨浩嘉
    team1Score: 15,
    team2Score: 11,
    winnerId: 265 // Mark's team won
  },
  // Match 17-2: 焦/Allenshen vs 雪/罗蒜头兄 → 焦/Allenshen WON 15:13
  {
    date: '2024-08-11',
    team1Player1Id: 258, // 焦
    team1Player2Id: 229, // Allenshen
    team2Player1Id: 168, // 雪
    team2Player2Id: 268, // 罗蒜头兄
    team1Score: 15,
    team2Score: 13,
    winnerId: 258 // 焦's team won
  },
  // Additional matches from the rest of the screenshots
  // Match 18: Kai/Tony vs 雪/Gloria → Kai/Tony WON 15:11
  {
    date: '2024-08-11',
    team1Player1Id: 261, // Kai
    team1Player2Id: 263, // Tony
    team2Player1Id: 168, // 雪
    team2Player2Id: 262, // Gloria
    team1Score: 15,
    team2Score: 11,
    winnerId: 261 // Kai's team won
  },
  // Match 19: Mark/Allenshen vs 焦/杨浩嘉 → Mark/Allenshen WON 15:12
  {
    date: '2024-08-11',
    team1Player1Id: 265, // Mark
    team1Player2Id: 229, // Allenshen
    team2Player1Id: 258, // 焦
    team2Player2Id: 235, // 杨浩嘉
    team1Score: 15,
    team2Score: 12,
    winnerId: 265 // Mark's team won
  },
  // Match 20: ricky/ceiye vs Gloria/罗蒜头兄 → ricky/ceiye WON 15:13
  {
    date: '2024-08-11',
    team1Player1Id: 264, // ricky
    team1Player2Id: 237, // ceiye
    team2Player1Id: 262, // Gloria
    team2Player2Id: 268, // 罗蒜头兄
    team1Score: 15,
    team2Score: 13,
    winnerId: 264 // ricky's team won
  }
];

console.log(`Total matches to upload: ${matches.length}`);
console.log('First few matches:', matches.slice(0, 3));