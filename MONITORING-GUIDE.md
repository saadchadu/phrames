# Monitoring and Alerting Guide

This guide provides comprehensive instructions for monitoring the Phrames paid campaign system in production.

## Overview

The monitoring system tracks:
- Payment event logging
- Payment failure alerts
- Webhook processing times
- Expiry function execution
- API error rates
- System health metrics

## 1. Vercel Monitoring

### Setup Vercel Alerts

1. **Navigate to Project Settings**:
   - Go to https://vercel.com/dashboard
   - Select your project
   - Click Settings → Notifications

2. **Enable Alerts**:
   - ✓ Deployment Failed
   - ✓ Function Errors
   - ✓ High Error Rate
   - ✓ Build Errors

3. **Configure Notification Channels**:
   - Add email addresses
   - Configure Slack webhook (optional)
   - Set up PagerDuty integration (optional)

### Monitor Vercel Logs

**Real-time monitoring**:
```bash
# View all logs
vercel logs --follow

# Filter by function
vercel logs --follow --filter=api/payments

# View errors only
vercel logs --follow --filter=error

# View specific deployment
vercel logs [deployment-url]
```

**Search logs**:
```bash
# Search for payment-related logs
vercel logs --filter=payment --limit=100

# Search for webhook logs
vercel logs --filter=webhook --limit=50

# Search for errors in last hour
vercel logs --filter=error --since=1h
```

### Key Metrics to Monitor

1. **Function Execution Time**:
   - Payment initiation: < 2 seconds
   - Webhook processing: < 1 second
   - Target: 95th percentile under threshold

2. **Error Rate**:
   - Target: < 1% of requests
   - Alert if > 5% error rate

3. **Function Invocations**:
   - Track payment API calls
   - Monitor unusual spikes

## 2. Firebase Monitoring

### Setup Firebase Alerts

1. **Navigate to Firebase Console**:
   - Go to https://console.firebase.google.com/
   - Select your project

2. **Enable Cloud Functions Monitoring**:
   - Go to Functions → Dashboard
   - View execution metrics
   - Check error rates

3. **Set Up Log-Based Alerts**:
   - Go to Logs Explorer
   - Create alert policies:
     - Function errors
     - High execution time
     - Failed expiry checks

### Monitor Cloud Functions

**View function logs**:
```bash
# View all function logs
firebase functions:log

# View specific function
firebase functions:log --only scheduledCampaignExpiryCheck

# View recent logs
firebase functions:log --limit 100
```

**Key metrics for expiry function**:
- Execution time: < 5 minutes
- Success rate: > 99%
- Campaigns processed per run
- Error count

### Firestore Monitoring

Monitor these collections:
- `campaigns`: Check isActive status changes
- `payments`: Track payment records
- `expiryLogs`: Verify expiry processing

**Query examples**:
```javascript
// Check recent payments
db.collection('payments')
  .where('createdAt', '>', yesterday)
  .orderBy('createdAt', 'desc')
  .get()

// Check failed payments
db.collection('payments')
  .where('status', '==', 'failed')
  .where('createdAt', '>', yesterday)
  .get()

// Check recent expiries
db.collection('expiryLogs')
  .where('processedAt', '>', yesterday)
  .orderBy('processedAt', 'desc')
  .get()
```

## 3. Cashfree Monitoring

### Setup Cashfree Alerts

1. **Navigate to Cashfree Dashboard**:
   - Go to https://merchant.cashfree.com/
   - Login to your account

2. **Enable Notifications**:
   - Go to Settings → Notifications
   - Enable:
     - Payment failure alerts
     - Webhook failure alerts
     - Daily transaction summary
     - Settlement notifications

3. **Monitor Webhook Status**:
   - Go to Developers → Webhooks
   - Check delivery status
   - View failed webhooks
   - Enable retry notifications

### Key Metrics

1. **Payment Success Rate**:
   - Target: > 95%
   - Alert if < 90%

2. **Webhook Delivery**:
   - Target: 100% delivery
   - Alert on any failures

3. **Average Transaction Value**:
   - Track by plan type
   - Monitor trends

### Cashfree Dashboard Checks

**Daily checks**:
- View transaction summary
- Check for failed payments
- Review webhook delivery status
- Verify settlement amounts

**Weekly checks**:
- Analyze payment trends
- Review refund requests
- Check for chargebacks
- Verify reconciliation

## 4. Payment Event Logging

### Log Structure

All payment events are logged with:
```typescript
{
  timestamp: Date,
  event: 'payment_initiated' | 'payment_success' | 'payment_failed' | 'webhook_received',
  userId: string,
  campaignId: string,
  planType: string,
  amount: number,
  orderId: string,
  status: string,
  metadata: object
}
```

### Monitor Payment Events

**Check payment initiation logs**:
```bash
vercel logs --filter="Payment initiated" --limit=50
```

**Check payment success logs**:
```bash
vercel logs --filter="Payment successful" --limit=50
```

**Check payment failures**:
```bash
vercel logs --filter="Payment failed" --limit=50
```

**Check webhook processing**:
```bash
vercel logs --filter="Webhook received" --limit=50
```

### Alert Conditions

Set up alerts for:
1. **High failure rate**: > 10% of payments fail
2. **Webhook delays**: Webhook processing > 5 seconds
3. **Missing webhooks**: Payment success but no webhook
4. **Duplicate webhooks**: Same orderId processed multiple times

## 5. API Error Monitoring

### Error Categories

1. **Client Errors (4xx)**:
   - 400: Bad request (validation errors)
   - 401: Unauthorized (auth failures)
   - 403: Forbidden (permission errors)
   - 404: Not found

2. **Server Errors (5xx)**:
   - 500: Internal server error
   - 502: Bad gateway
   - 503: Service unavailable
   - 504: Gateway timeout

### Monitor Error Rates

**Check error distribution**:
```bash
# View all errors
vercel logs --filter=error --limit=100

# View 500 errors
vercel logs --filter="500" --limit=50

# View authentication errors
vercel logs --filter="401" --limit=50
```

### Error Response Times

Monitor API response times:
- Payment initiation: < 2s
- Webhook processing: < 1s
- Campaign queries: < 500ms

**Alert thresholds**:
- Warning: > 3s response time
- Critical: > 5s response time

## 6. Expiry Function Monitoring

### Monitor Scheduled Execution

**Check function runs**:
```bash
# View expiry function logs
firebase functions:log --only scheduledCampaignExpiryCheck

# Check recent executions
firebase functions:log --only scheduledCampaignExpiryCheck --limit 10
```

### Key Metrics

1. **Execution frequency**: Daily at 00:00 UTC
2. **Execution time**: < 5 minutes
3. **Campaigns processed**: Track count
4. **Success rate**: > 99%

### Verify Expiry Processing

**Check expiry logs in Firestore**:
```javascript
// Get today's expiry logs
const today = new Date()
today.setHours(0, 0, 0, 0)

db.collection('expiryLogs')
  .where('processedAt', '>=', today)
  .get()
  .then(snapshot => {
    console.log(`Processed ${snapshot.size} campaigns today`)
  })
```

**Verify campaigns were deactivated**:
```javascript
// Check for campaigns that should be expired but are still active
const now = new Date()

db.collection('campaigns')
  .where('isActive', '==', true)
  .where('expiresAt', '<', now)
  .get()
  .then(snapshot => {
    if (snapshot.size > 0) {
      console.warn(`Found ${snapshot.size} campaigns that should be expired`)
    }
  })
```

### Alert Conditions

Set up alerts for:
1. **Function not executed**: No logs for > 25 hours
2. **High execution time**: > 5 minutes
3. **Processing errors**: Any errors in logs
4. **Missed campaigns**: Active campaigns past expiry

## 7. Monitoring Dashboard

### Create Custom Dashboard

Use the provided monitoring script:
```bash
./scripts/monitor-dashboard.sh
```

### Dashboard Components

1. **System Health**:
   - Vercel deployment status
   - Function error rates
   - API response times

2. **Payment Metrics**:
   - Payments today
   - Success rate
   - Revenue by plan

3. **Campaign Metrics**:
   - Active campaigns
   - Expired today
   - Reactivations

4. **Error Summary**:
   - Recent errors
   - Error distribution
   - Critical alerts

### Automated Monitoring Script

Create a cron job for automated checks:

```bash
# Add to crontab (run every hour)
0 * * * * /path/to/scripts/monitor-dashboard.sh >> /var/log/phrames-monitor.log 2>&1
```

## 8. Alert Configuration

### Critical Alerts (Immediate Action)

1. **Payment system down**:
   - Condition: All payment initiations failing
   - Action: Check Cashfree status, verify env vars

2. **Webhook failures**:
   - Condition: Webhooks not being received
   - Action: Check webhook URL, verify signature

3. **Database errors**:
   - Condition: Firestore connection failures
   - Action: Check Firebase status, verify credentials

### Warning Alerts (Monitor Closely)

1. **High error rate**:
   - Condition: > 5% error rate
   - Action: Review logs, identify pattern

2. **Slow response times**:
   - Condition: > 3s average response time
   - Action: Check function performance, optimize queries

3. **Unusual payment patterns**:
   - Condition: Spike in failures or cancellations
   - Action: Review user feedback, check for issues

### Info Alerts (Track Trends)

1. **Daily summary**:
   - Payments processed
   - Revenue generated
   - Campaigns expired

2. **Weekly report**:
   - Payment trends
   - Popular plans
   - User growth

## 9. Incident Response

### Response Procedure

1. **Identify Issue**:
   - Check alerts
   - Review logs
   - Determine severity

2. **Assess Impact**:
   - How many users affected?
   - Is payment processing blocked?
   - Are campaigns being affected?

3. **Take Action**:
   - Critical: Immediate fix or rollback
   - Warning: Schedule fix within 24 hours
   - Info: Track and fix in next release

4. **Communicate**:
   - Notify affected users
   - Update status page
   - Document incident

5. **Post-Mortem**:
   - Analyze root cause
   - Implement preventive measures
   - Update monitoring

### Common Issues and Solutions

**Issue: Payment initiation fails**
- Check: Cashfree credentials
- Check: Environment variables
- Check: API rate limits
- Solution: Verify config, restart if needed

**Issue: Webhooks not received**
- Check: Webhook URL in Cashfree
- Check: Endpoint accessibility
- Check: Signature verification
- Solution: Update webhook URL, verify secret

**Issue: Campaigns not expiring**
- Check: Cloud function logs
- Check: Function schedule
- Check: Firestore queries
- Solution: Manually trigger function, fix query

**Issue: High error rate**
- Check: Recent deployments
- Check: Error patterns
- Check: External service status
- Solution: Rollback if needed, fix and redeploy

## 10. Performance Optimization

### Monitor Performance Metrics

1. **Database Queries**:
   - Use Firestore query profiling
   - Optimize indexes
   - Reduce read operations

2. **Function Cold Starts**:
   - Monitor cold start frequency
   - Consider keeping functions warm
   - Optimize bundle size

3. **API Response Times**:
   - Use Vercel Analytics
   - Identify slow endpoints
   - Optimize code paths

### Optimization Checklist

- [ ] Database indexes created for common queries
- [ ] API responses cached where appropriate
- [ ] Function bundle sizes minimized
- [ ] Unnecessary dependencies removed
- [ ] Database queries batched
- [ ] Error handling optimized

## 11. Reporting

### Daily Report

Generate daily report with:
- Total payments processed
- Success rate
- Revenue by plan
- Campaigns expired
- Error summary

### Weekly Report

Generate weekly report with:
- Payment trends
- Popular plans
- User growth
- System health
- Incidents and resolutions

### Monthly Report

Generate monthly report with:
- Revenue analysis
- User retention
- System performance
- Optimization opportunities
- Feature requests

## 12. Monitoring Tools

### Recommended Tools

1. **Vercel Analytics**: Built-in performance monitoring
2. **Firebase Console**: Function and database monitoring
3. **Cashfree Dashboard**: Payment and webhook monitoring
4. **Sentry** (optional): Error tracking and alerting
5. **Datadog** (optional): Comprehensive monitoring
6. **PagerDuty** (optional): Incident management

### Tool Setup

**Sentry (Optional)**:
```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

Configure in `next.config.js`:
```javascript
const { withSentryConfig } = require('@sentry/nextjs')

module.exports = withSentryConfig(
  nextConfig,
  { silent: true },
  { hideSourceMaps: true }
)
```

## 13. Maintenance Schedule

### Daily Tasks
- [ ] Check error logs
- [ ] Monitor payment success rate
- [ ] Verify expiry function ran
- [ ] Review critical alerts

### Weekly Tasks
- [ ] Analyze payment trends
- [ ] Review webhook delivery
- [ ] Check system performance
- [ ] Update documentation

### Monthly Tasks
- [ ] Generate performance report
- [ ] Review and optimize queries
- [ ] Update monitoring thresholds
- [ ] Plan improvements

## 14. Troubleshooting

### Debug Payment Issues

```bash
# Check payment initiation logs
vercel logs --filter="api/payments/initiate" --limit=50

# Check webhook logs
vercel logs --filter="api/payments/webhook" --limit=50

# Check for specific order ID
vercel logs --filter="order_123456" --limit=20
```

### Debug Expiry Issues

```bash
# Check expiry function logs
firebase functions:log --only scheduledCampaignExpiryCheck

# Manually trigger expiry check
node tests/trigger-expiry-check.ts
```

### Debug API Errors

```bash
# Check recent errors
vercel logs --filter=error --limit=100

# Check specific endpoint
vercel logs --filter="api/payments" --filter=error --limit=50
```

## 15. Security Monitoring

### Monitor for Security Issues

1. **Unusual payment patterns**:
   - Multiple failed attempts
   - Rapid payment requests
   - Unusual amounts

2. **Authentication issues**:
   - Failed login attempts
   - Unauthorized access attempts
   - Token manipulation

3. **API abuse**:
   - Rate limit violations
   - Unusual request patterns
   - Suspicious user agents

### Security Alerts

Set up alerts for:
- Multiple failed payments from same user
- Webhook signature verification failures
- Unauthorized API access attempts
- Unusual traffic patterns

## Conclusion

Effective monitoring ensures the paid campaign system runs smoothly and issues are detected early. Follow this guide to maintain system health and provide a reliable experience for users.

For additional support:
- Vercel: https://vercel.com/docs
- Firebase: https://firebase.google.com/docs
- Cashfree: https://docs.cashfree.com/

---

**Last Updated**: Task 13.3 Implementation
**Next Review**: After first week of production monitoring
