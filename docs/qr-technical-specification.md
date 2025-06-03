# QR Code Technical Specification for Pickle+

## QR Code Data Structure

### Player QR Codes
```json
{
  "type": "player_passport",
  "version": "1.0",
  "playerId": 12345,
  "passportId": "1000PP12345",
  "timestamp": 1704067200,
  "signature": "encrypted_hash",
  "metadata": {
    "displayName": "Player Name",
    "rating": 4.2,
    "lastActive": "2025-01-01"
  }
}
```

### Tournament QR Codes
```json
{
  "type": "tournament_checkin",
  "version": "1.0", 
  "tournamentId": 567,
  "eventCode": "TOUR2025001",
  "timestamp": 1704067200,
  "checkInWindow": {
    "start": 1704060000,
    "end": 1704070800
  },
  "venue": "Main Courts",
  "signature": "encrypted_hash"
}
```

### Event QR Codes
```json
{
  "type": "event_registration",
  "version": "1.0",
  "eventId": 789,
  "eventType": "clinic|tournament|social",
  "maxParticipants": 16,
  "registrationFee": 25.00,
  "timestamp": 1704067200,
  "signature": "encrypted_hash"
}
```

## Role-Based Scanning Responses

### Regular Player Scanning Player QR
**API Endpoint**: `POST /api/qr/scan/player`
```json
{
  "scannedPlayerId": 12345,
  "scannerRole": "player",
  "actions": [
    {
      "type": "connect",
      "label": "Connect with Player",
      "endpoint": "/api/connections/request"
    },
    {
      "type": "match",
      "label": "Start Match",
      "endpoint": "/api/matches/initiate"
    },
    {
      "type": "challenge", 
      "label": "Send Challenge",
      "endpoint": "/api/challenges/create"
    }
  ],
  "playerData": {
    "displayName": "Player Name",
    "rating": 4.2,
    "winRate": 0.75,
    "recentMatches": 5,
    "availability": "available"
  }
}
```

### Coach Scanning Player QR
**API Endpoint**: `POST /api/qr/scan/player`
```json
{
  "scannedPlayerId": 12345,
  "scannerRole": "coach",
  "actions": [
    {
      "type": "analyze",
      "label": "View Analytics",
      "endpoint": "/api/coaching/analytics"
    },
    {
      "type": "schedule_lesson",
      "label": "Schedule Lesson", 
      "endpoint": "/api/coaching/schedule"
    },
    {
      "type": "add_to_roster",
      "label": "Add to Coaching Roster",
      "endpoint": "/api/coaching/roster/add"
    }
  ],
  "enhancedData": {
    "skillAnalysis": {
      "strengths": ["forehand", "court_positioning"],
      "weaknesses": ["backhand", "serve_consistency"],
      "improvementTrend": "positive"
    },
    "lessonHistory": {
      "totalLessons": 8,
      "lastLesson": "2024-12-15",
      "progressRating": 4.1
    },
    "performanceMetrics": {
      "techniqueScore": 7.2,
      "consistencyScore": 6.8,
      "gameIQ": 7.5
    }
  }
}
```

### Tournament Director Scanning Player QR
**API Endpoint**: `POST /api/qr/scan/player`
```json
{
  "scannedPlayerId": 12345,
  "scannerRole": "tournament_director",
  "actions": [
    {
      "type": "verify_registration",
      "label": "Verify Registration",
      "endpoint": "/api/tournaments/verify"
    },
    {
      "type": "add_to_bracket",
      "label": "Add to Bracket", 
      "endpoint": "/api/tournaments/bracket/add"
    },
    {
      "type": "record_result",
      "label": "Record Match Result",
      "endpoint": "/api/matches/record"
    }
  ],
  "adminData": {
    "registrationStatus": "confirmed",
    "division": "4.0-4.5",
    "seedingRank": 12,
    "paymentStatus": "paid",
    "waiverSigned": true,
    "eligibilityVerified": true,
    "ratingHistory": [
      {"date": "2024-12-01", "rating": 4.15},
      {"date": "2024-11-01", "rating": 4.08},
      {"date": "2024-10-01", "rating": 4.02}
    ]
  }
}
```

## Security Implementation

### QR Code Generation
```typescript
interface QRSecurityConfig {
  encryption: "AES-256-GCM";
  keyDerivation: "PBKDF2";
  timestampTolerance: 3600; // 1 hour
  signatureAlgorithm: "HMAC-SHA256";
}

function generateSecureQR(data: QRData, userRole: UserRole): string {
  const timestamp = Math.floor(Date.now() / 1000);
  const payload = {
    ...data,
    timestamp,
    nonce: generateNonce()
  };
  
  const encrypted = encrypt(payload, getEncryptionKey());
  const signature = sign(encrypted, getSigningKey());
  
  return base64Encode({
    data: encrypted,
    signature,
    version: "1.0"
  });
}
```

### Scan Validation
```typescript
function validateQRScan(
  qrData: string, 
  scannerUserId: number,
  scannerRole: UserRole
): ValidationResult {
  
  // Decrypt and verify signature
  const decoded = decryptQR(qrData);
  if (!decoded.isValid) {
    return { error: "Invalid QR code" };
  }
  
  // Check timestamp validity
  const age = Date.now() / 1000 - decoded.timestamp;
  if (age > QR_EXPIRY_SECONDS) {
    return { error: "QR code expired" };
  }
  
  // Validate scanner permissions
  if (!hasPermission(scannerRole, decoded.type)) {
    return { error: "Insufficient permissions" };
  }
  
  // Anti-gaming validation
  const antiGaming = validateScanFrequency(scannerUserId);
  if (!antiGaming.isValid) {
    return { error: antiGaming.reason };
  }
  
  return { 
    isValid: true, 
    data: decoded,
    permissions: getRolePermissions(scannerRole)
  };
}
```

## Anti-Gaming Protection for QR Scanning

### Scan Rate Limiting
```typescript
interface ScanLimits {
  playerScans: {
    maxPerHour: 50;
    maxPerDay: 200;
  };
  tournamentScans: {
    maxPerEvent: 100;
    cooldownMinutes: 1;
  };
  suspiciousPatterns: {
    samePairScans: 10; // Same two players scanning repeatedly
    rapidScans: 20; // Scans within 30 seconds
  };
}

function validateScanRate(userId: number, qrType: string): boolean {
  const recentScans = getScanHistory(userId, 3600); // Last hour
  
  switch (qrType) {
    case 'player_passport':
      return recentScans.length < ScanLimits.playerScans.maxPerHour;
    case 'tournament_checkin':
      return recentScans.filter(s => s.type === qrType).length < 
             ScanLimits.tournamentScans.maxPerEvent;
    default:
      return true;
  }
}
```

### Duplicate Detection
```typescript
function detectSuspiciousScanning(
  scannerUserId: number,
  scannedData: QRData
): SuspicionLevel {
  
  const history = getScanHistory(scannerUserId, 86400); // 24 hours
  
  // Check for repeated scanning of same QR
  const sameQRScans = history.filter(h => 
    h.targetId === scannedData.playerId && 
    h.type === scannedData.type
  );
  
  if (sameQRScans.length > 5) {
    return SuspicionLevel.HIGH;
  }
  
  // Check for rapid scanning pattern
  const recentScans = history.filter(h => 
    Date.now() - h.timestamp < 30000 // 30 seconds
  );
  
  if (recentScans.length > 10) {
    return SuspicionLevel.MEDIUM;
  }
  
  return SuspicionLevel.LOW;
}
```

## Integration with Pickle Points System

### Points Award Validation Through QR
```typescript
async function awardPointsFromQR(
  scanResult: QRScanResult,
  action: QRAction
): Promise<PointsResult> {
  
  // Validate through anti-gaming system
  const validation = await AntiGamingService.validateQRAction(
    scanResult.scannerId,
    action.type,
    scanResult.targetId
  );
  
  if (!validation.isValid) {
    return {
      pointsAwarded: 0,
      reason: validation.reason,
      success: false
    };
  }
  
  // Calculate points based on action type
  let points = 0;
  switch (action.type) {
    case 'player_connect':
      points = 2; // Small reward for networking
      break;
    case 'tournament_checkin':
      points = 5; // Tournament participation
      break;
    case 'match_initiate':
      points = 0; // No points for scan, points come from match result
      break;
  }
  
  // Apply daily limits and reductions
  const pointCalc = await PicklePointsCalculator.calculateQRPoints(
    scanResult.scannerId,
    points,
    action.type
  );
  
  return {
    pointsAwarded: pointCalc.finalPoints,
    basePoints: points,
    reduction: pointCalc.reduction,
    reason: pointCalc.reason,
    success: true
  };
}
```

## QR Code Display Implementation

### Player Passport QR Generation
```typescript
function generatePlayerPassportQR(userId: number): QRDisplayData {
  const user = getUserData(userId);
  
  const qrData = {
    type: "player_passport",
    playerId: userId,
    passportId: user.passportId,
    displayName: user.displayName,
    rating: user.currentRating,
    timestamp: Math.floor(Date.now() / 1000),
    expiresAt: Math.floor(Date.now() / 1000) + 3600 // 1 hour
  };
  
  const encryptedData = encryptQRData(qrData);
  
  return {
    qrCodeValue: `PicklePlus:${encryptedData}`,
    displayText: `${user.displayName} (${user.currentRating})`,
    validUntil: new Date(qrData.expiresAt * 1000),
    refreshUrl: `/api/qr/refresh/${userId}`
  };
}
```

This technical specification ensures secure, role-appropriate QR code functionality that integrates seamlessly with Pickle+'s anti-gaming systems and points economy.