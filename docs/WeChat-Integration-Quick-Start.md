# Pickle+ WeChat Integration - Quick Start Guide

## 🚀 5-Minute Integration

### Step 1: Get API Credentials
Contact Pickle+ to receive your API key and application credentials.

### Step 2: Basic User Registration

```javascript
// Minimal WeChat user registration
const response = await wx.request({
  url: 'https://api.pickle.app/api/v1/wechat/register',
  method: 'POST',
  header: {
    'X-API-Key': 'your_api_key',
    'Content-Type': 'application/json'
  },
  data: {
    wechat_oauth_data: {
      openid: userInfo.openid,
      nickname: userInfo.nickname
    }
  }
});

// Save Pickle+ user data
const pickleUser = response.data.data;
console.log(`User registered: ${pickleUser.passport_code}`);
```

### Step 3: Submit Match Results

```javascript
// Submit a simple match result
const matchResult = await wx.request({
  url: 'https://api.pickle.app/api/v1/wechat/match-submit',
  method: 'POST',
  header: {
    'X-API-Key': 'your_api_key',
    'Content-Type': 'application/json'
  },
  data: {
    match_data: {
      match_type: 'singles',
      score: [11, 9, 11, 7]
    },
    participants: [
      {
        player_id: playerA_id,
        wechat_openid: playerA_openid,
        match_result: 'win'
      },
      {
        player_id: playerB_id,  
        wechat_openid: playerB_openid,
        match_result: 'loss'
      }
    ],
    wechat_openids: [playerA_openid, playerB_openid]
  }
});

// Get updated rankings
const rankings = matchResult.data.data.participants;
console.log('New rankings:', rankings);
```

### Step 4: Real-Time Updates

```javascript
// Set up webhooks for live data sync
await wx.request({
  url: 'https://api.pickle.app/api/v1/wechat/register-webhook',
  method: 'POST',
  header: {
    'X-API-Key': 'your_api_key',
    'Content-Type': 'application/json'
  },
  data: {
    webhook_url: 'https://your-server.com/pickle-webhook',
    events: ['user.ranking_changed', 'match.completed'],
    secret: 'your_webhook_secret'
  }
});
```

## 📱 Complete Mini-Program Example

```javascript
// app.js
App({
  globalData: {
    pickleAPI: 'https://api.pickle.app',
    apiKey: 'your_api_key_here',
    pickleUser: null
  },

  async onLaunch() {
    await this.initPicklePlus();
  },

  async initPicklePlus() {
    try {
      // Get WeChat user info
      const userInfo = await this.getWeChatUserInfo();
      
      // Register or login with Pickle+
      const pickleUser = await this.registerWithPickle(userInfo);
      
      this.globalData.pickleUser = pickleUser;
      console.log('Pickle+ integration ready:', pickleUser.passport_code);
      
    } catch (error) {
      console.error('Pickle+ init failed:', error);
    }
  },

  getWeChatUserInfo() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: (res) => {
          wx.getUserInfo({
            success: (userRes) => resolve(userRes.userInfo),
            fail: reject
          });
        },
        fail: reject
      });
    });
  },

  async registerWithPickle(userInfo) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${this.globalData.pickleAPI}/api/v1/wechat/register`,
        method: 'POST',
        header: {
          'X-API-Key': this.globalData.apiKey,
          'Content-Type': 'application/json'
        },
        data: {
          wechat_oauth_data: userInfo,
          registration_metadata: {
            source: 'wechat_miniprogram',
            app_version: '1.0.0'
          }
        },
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data.data);
          } else {
            reject(new Error(res.data.error_description));
          }
        },
        fail: reject
      });
    });
  }
});
```

```javascript
// pages/match/match.js
Page({
  data: {
    opponent: null,
    score: [],
    gameInProgress: false
  },

  async recordMatch() {
    const app = getApp();
    
    try {
      const matchData = {
        match_data: {
          match_type: 'singles',
          duration_minutes: this.data.matchDuration,
          score: this.data.score
        },
        participants: [
          {
            player_id: app.globalData.pickleUser.user_id,
            wechat_openid: app.globalData.pickleUser.wechat_openid,
            match_result: this.determineResult()
          },
          {
            player_id: this.data.opponent.user_id,
            wechat_openid: this.data.opponent.wechat_openid,
            match_result: this.determineResult() === 'win' ? 'loss' : 'win'
          }
        ],
        wechat_openids: [
          app.globalData.pickleUser.wechat_openid,
          this.data.opponent.wechat_openid
        ]
      };

      const response = await this.submitToPickle(matchData);
      
      // Update local UI with new rankings
      this.updatePlayerRankings(response.participants);
      
      wx.showToast({
        title: '比赛记录成功！',
        icon: 'success'
      });
      
    } catch (error) {
      wx.showModal({
        title: '错误',
        content: `比赛记录失败: ${error.message}`
      });
    }
  },

  submitToPickle(matchData) {
    const app = getApp();
    
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${app.globalData.pickleAPI}/api/v1/wechat/match-submit`,
        method: 'POST',
        header: {
          'X-API-Key': app.globalData.apiKey,
          'Content-Type': 'application/json'
        },
        data: matchData,
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data.data);
          } else {
            reject(new Error(res.data.error_description));
          }
        },
        fail: reject
      });
    });
  },

  updatePlayerRankings(participants) {
    participants.forEach(participant => {
      if (participant.player_id === getApp().globalData.pickleUser.user_id) {
        // Update current user's ranking
        this.setData({
          currentRanking: participant.ranking_update.new_position,
          pointsChange: participant.ranking_update.points_change
        });
      }
    });
  },

  determineResult() {
    // Game logic to determine win/loss
    const myScore = this.data.score.filter((game, index) => index % 2 === 0).reduce((a, b) => a + b, 0);
    const opponentScore = this.data.score.filter((game, index) => index % 2 === 1).reduce((a, b) => a + b, 0);
    return myScore > opponentScore ? 'win' : 'loss';
  }
});
```

## 🔗 Webhook Endpoint Example

```javascript
// Express.js webhook handler
const express = require('express');
const crypto = require('crypto');
const app = express();

app.use(express.json());

app.post('/pickle-webhook', (req, res) => {
  // Verify webhook signature
  const signature = req.headers['x-pickle-signature'];
  const timestamp = req.headers['x-pickle-timestamp'];
  const payload = JSON.stringify(req.body);
  
  if (!verifyWebhookSignature(payload, signature, timestamp, 'your_webhook_secret')) {
    return res.status(401).send('Invalid signature');
  }
  
  // Process webhook event
  const { event, data } = req.body;
  
  switch (event) {
    case 'user.ranking_changed':
      handleRankingUpdate(data);
      break;
    case 'match.completed':
      handleMatchCompletion(data);
      break;
    case 'wechat.profile_synced':
      handleProfileSync(data);
      break;
    default:
      console.log('Unknown event:', event);
  }
  
  res.status(200).send('OK');
});

function verifyWebhookSignature(payload, signature, timestamp, secret) {
  const [version, sig] = signature.split('=');
  if (version !== 'v1') return false;
  
  const signatureContent = `${version}.${timestamp}.${payload}`;
  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(signatureContent)
    .digest('hex');
    
  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig));
}

function handleRankingUpdate(data) {
  console.log(`User ${data.user_id} ranking changed:`, data.ranking_update);
  // Update your local database or notify user
}

function handleMatchCompletion(data) {
  console.log(`Match ${data.match_id} completed:`, data.participants);
  // Update match history, notify participants
}

function handleProfileSync(data) {
  console.log(`Profile synced for user ${data.pickle_user_id}`);
  // Update local user profile cache
}

app.listen(3000, () => {
  console.log('Webhook server running on port 3000');
});
```

## 🛠️ Testing Your Integration

```bash
# Clone test repository
git clone https://github.com/pickle-plus/wechat-integration-tests.git

# Install dependencies
npm install

# Run integration tests
npm test

# Test specific endpoints
./tests/run-wechat-api-tests.js
```

## 📊 Monitoring and Analytics

Track your integration performance:

```javascript
// Track API usage
const apiMetrics = {
  userRegistrations: 0,
  matchSubmissions: 0,
  webhookDeliveries: 0,
  apiErrors: 0
};

// Log API calls for monitoring
function logApiCall(endpoint, success, responseTime) {
  console.log(`API Call: ${endpoint}, Success: ${success}, Time: ${responseTime}ms`);
  // Send to your analytics system
}
```

## 🎯 Revenue Optimization

Maximize your integration value:

1. **User Engagement**: Encourage match recording for better rankings
2. **Tournament Integration**: Use tournament endpoints for events
3. **Community Features**: Leverage social aspects of rankings
4. **Coach Matching**: Integrate coaching recommendations

## 📞 Support

- **Documentation**: Full API docs at `/docs/WeChat-API-Documentation.md`
- **Test Suite**: Comprehensive tests in `/tests/` directory
- **Examples**: Integration examples in this guide

---

*Ready to build the future of pickleball with Pickle+ API? Start with this quick start guide and scale to millions of WeChat users!*