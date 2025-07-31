# Wise Payment Integration Plan for Pickle+

## Executive Summary

Wise provides an excellent payment solution for Pickle+ with significantly lower fees than traditional processors and robust API capabilities perfect for our coaching and certification revenue streams.

## Business Case

### Cost Comparison
- **Wise**: 1% domestic cards, 2.9% international
- **Stripe**: 2.9% + 30¢ per transaction
- **PayPal**: 3.49% + fixed fee

**Savings Example (Monthly $10K revenue):**
- Wise: ~$200/month in fees
- Stripe: ~$320/month in fees
- **Savings: $120/month or $1,440/year**

### Revenue Streams Perfect for Wise

1. **Coach Hourly Payments**: $95/hour sessions
2. **PCP Certifications**: $699-$2,499 programs
3. **Premium Subscriptions**: Monthly/annual plans
4. **International Payments**: Global coach marketplace

## Technical Integration Plan

### Phase 1: Basic Payment Processing (Week 1-2)

#### Required Wise Setup
1. **Business Account**: £45 one-time setup fee
2. **API Tokens**: Sandbox → Production progression
3. **Webhook Endpoints**: Real-time payment notifications

#### Core API Endpoints to Implement
```typescript
// 1. Create Payment Quote
POST /api/wise/quote
{
  sourceCurrency: "USD",
  targetCurrency: "USD", 
  sourceAmount: 95.00, // Coach hourly rate
  profile: BUSINESS_PROFILE_ID
}

// 2. Create Payment Transfer
POST /api/wise/transfer
{
  targetAccount: RECIPIENT_ID,
  quote: QUOTE_ID,
  customerTransactionId: "pickle-coach-session-123"
}

// 3. Process Payment
POST /api/wise/fund-transfer
{
  type: "CARD",
  cardDetails: { /* encrypted card data */ }
}
```

### Phase 2: Advanced Features (Week 3-4)

#### Batch Payment Processing
- **Coach Payouts**: Weekly batch payments to coaches
- **Certification Refunds**: Automated refund processing
- **Volume Discounts**: Automatic savings after $25K/month

#### Multi-currency Support
- **Global Coaches**: Accept payments in local currencies
- **Exchange Rate Optimization**: Real-time mid-market rates
- **Currency Hedging**: Protect against exchange rate fluctuations

### Phase 3: Automation & Analytics (Week 5-6)

#### Payment Automation
- **Recurring Subscriptions**: Automated monthly billing
- **Coach Commission Split**: Automatic percentage distribution
- **Tax Reporting**: Automated 1099 generation for coaches

#### Advanced Analytics
- **Revenue Dashboard**: Real-time payment tracking
- **Coach Earnings**: Individual coach performance metrics
- **Geographic Analysis**: Payment patterns by region

## Implementation Details

### Required Environment Variables
```
WISE_API_TOKEN_SANDBOX=your_sandbox_token
WISE_API_TOKEN_PRODUCTION=your_production_token
WISE_BUSINESS_PROFILE_ID=your_profile_id
WISE_WEBHOOK_SECRET=your_webhook_secret
```

### Database Schema Extensions
```sql
-- Payment tracking
CREATE TABLE wise_payments (
  id SERIAL PRIMARY KEY,
  wise_transfer_id VARCHAR(255) UNIQUE,
  user_id INTEGER REFERENCES users(id),
  amount DECIMAL(10,2),
  currency VARCHAR(3),
  status VARCHAR(50),
  payment_type VARCHAR(50), -- 'coach_session', 'pcp_cert', 'subscription'
  created_at TIMESTAMP DEFAULT NOW()
);

-- Coach payouts
CREATE TABLE coach_payouts (
  id SERIAL PRIMARY KEY,
  coach_id INTEGER REFERENCES coach_profiles(id),
  wise_transfer_id VARCHAR(255),
  amount DECIMAL(10,2),
  period_start DATE,
  period_end DATE,
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Webhook Handler Implementation
```typescript
// server/routes/wise-webhooks.ts
app.post('/api/wise/webhook', async (req, res) => {
  const signature = req.headers['x-wise-signature'];
  const payload = req.body;
  
  // Verify webhook authenticity
  if (!verifyWiseSignature(payload, signature)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  // Process payment status updates
  switch (payload.event_type) {
    case 'transfer.completed':
      await handlePaymentCompleted(payload.data);
      break;
    case 'transfer.failed':
      await handlePaymentFailed(payload.data);
      break;
  }
  
  res.status(200).json({ received: true });
});
```

## Security Considerations

### API Key Management
- **Replit Secrets**: Store all Wise API tokens securely
- **Environment Separation**: Separate sandbox/production tokens
- **Token Rotation**: Regular API token updates

### Data Protection
- **PCI Compliance**: Wise handles card data processing
- **Encryption**: All sensitive data encrypted at rest
- **Audit Logging**: Complete payment audit trail

### Fraud Prevention
- **Rate Limiting**: Prevent payment spam
- **User Verification**: Link payments to verified accounts
- **Monitoring**: Real-time payment anomaly detection

## Business Impact Projections

### Revenue Enhancement
- **Lower Processing Fees**: 30-40% reduction vs. Stripe
- **International Expansion**: Multi-currency coaching marketplace
- **Faster Payouts**: Same-day coach payments

### Operational Benefits
- **Automated Reconciliation**: Reduced manual accounting
- **Real-time Reporting**: Instant payment insights
- **Scalable Infrastructure**: Handle growth without complexity

### Coach Benefits
- **Lower Platform Fees**: More earnings retained
- **Faster Payments**: Weekly vs. monthly payouts
- **Global Reach**: Accept international students

## Risk Assessment

### Low Risk Factors
- **Wise Stability**: Established fintech with strong reputation
- **API Maturity**: Well-documented, stable API
- **Regulatory Compliance**: FCA-regulated in UK

### Mitigation Strategies
- **Dual Processing**: Keep Stripe as backup initially
- **Gradual Migration**: Start with new payments, migrate existing
- **Monitoring**: Real-time payment success rate tracking

## Go-Live Timeline

### Week 1-2: Foundation
- [ ] Wise business account setup
- [ ] Sandbox integration development
- [ ] Basic payment flow implementation

### Week 3-4: Features
- [ ] Coach payout automation
- [ ] Multi-currency support
- [ ] Webhook handling

### Week 5-6: Production
- [ ] Production API integration
- [ ] User acceptance testing
- [ ] Gradual traffic migration

### Week 7-8: Optimization
- [ ] Performance monitoring
- [ ] Cost analysis validation
- [ ] Feature enhancement

## Success Metrics

### Financial KPIs
- **Processing Fee Reduction**: Target 35% savings
- **Payment Success Rate**: >99% completion
- **Payout Speed**: <24 hours for coaches

### Operational KPIs
- **API Response Time**: <500ms average
- **Webhook Reliability**: >99.9% delivery
- **Error Rate**: <0.1% failed payments

## Conclusion

Wise integration offers Pickle+ significant competitive advantages:
- **Lower costs** = Higher coach retention
- **Global reach** = International market expansion  
- **Automation** = Reduced operational overhead
- **Transparency** = Better user experience

**Recommendation: Proceed with Wise integration as primary payment processor**

---
*Integration plan prepared: July 31, 2025*
*Business case validated with current platform revenue streams*