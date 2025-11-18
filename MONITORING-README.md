# Monitoring and Alerting System

This document provides a quick reference for the monitoring and alerting system implemented for the Phrames paid campaign system.

## Overview

The monitoring system tracks:
- ✅ Payment event logging
- ✅ Payment failure alerts
- ✅ Webhook processing times
- ✅ Expiry function execution
- ✅ API error rates

## Quick Start

### 1. View Real-time Dashboard

```bash
./scripts/monitor-dashboard.sh
```

This displays:
- System status
- Payment events (last hour)
- Recent errors
- Webhook status
- API health
- Firebase function status

### 2. Analyze Payment Logs

```bash
./scripts/analyze-payment-logs.sh [time-range]
```

Examples:
```bash
./scripts/analyze-payment-logs.sh 24h    # Last 24 hours
./scripts/analyze-payment-logs.sh 7d     # Last 7 days
./scripts/analyze-payment-logs.sh 1h     # Last hour
```

### 3. Check System Health

```bash
./scripts/check-system-health.sh
```

Checks:
- Environment variables
- Payment system configuration
- API endpoints
- Recent errors
- Firebase function status

## Log Events

### Payment Events

All payment operations are logged with structured data:

```typescript
// Payment initiated
logPaymentInitiated({
  userId: string,
  campaignId: string,
  planType: string,
  amount: number,
  orderId: string
})

// Payment success
logPaymentSuccess({
  userId: string,
  campaignId: string,
  orderId: string,
  amount: number,
  planType: string
})

// Payment failed
logPaymentFailed({
  userId: string,
  campaignId: string,
  orderId: string,
  error: string
})
```

### Webhook Events

```typescript
// Webhook received
logWebhookReceived({
  type: string,
  orderId: string
})

// Webhook processed
logWebhookProcessed({
  orderId: string,
  campaignId: string,
  duration: number
})

// Webhook error
logWebhookError({
  orderId: string,
  error: string,
  metadata: object
})
```

### Campaign Events

```typescript
// Campaign activated
logCampaignActivated({
  campaignId: string,
  userId: string,
  planType: string,
  expiresAt: string
})
```

### API Errors

```typescript
// API error
logApiError({
  endpoint: string,
  error: string,
  userId: string,
  statusCode: number,
  metadata: object
})
```

## Viewing Logs

### Vercel Logs

```bash
# Real-time logs
vercel logs --follow

# Payment logs
vercel logs --filter=payment --limit=50

# Error logs
vercel logs --filter=error --limit=50

# Webhook logs
vercel logs --filter=webhook --limit=50

# Specific time range
vercel logs --since=1h --limit=100
vercel logs --since=24h --limit=200
```

### Firebase Function Logs

```bash
# View expiry function logs
firebase functions:log --only scheduledCampaignExpiryCheck

# View all function logs
firebase functions:log

# Recent logs
firebase functions:log --limit 100
```

## Performance Tracking

The system automatically tracks:

1. **API Response Times**
   - Payment initiation: Target < 2s
   - Webhook processing: Target < 1s
   - Logs warning if > 3s

2. **Error Rates**
   - Tracks errors per minute
   - Alerts if > 10% error rate
   - Logs high error rate warnings

3. **Webhook Processing**
   - Tracks processing duration
   - Logs slow webhooks (> 3s)
   - Monitors webhook delivery

## Alert Conditions

### Critical Alerts

1. **Payment System Down**
   - All payment initiations failing
   - Immediate action required

2. **Webhook Failures**
   - Webhooks not being received
   - Check webhook configuration

3. **Database Errors**
   - Firestore connection failures
   - Check Firebase status

4. **Expiry Function Not Running**
   - No execution for 25+ hours
   - Check function deployment

### Warning Alerts

1. **High Error Rate**
   - > 5% error rate over 15 minutes
   - Monitor and investigate

2. **Slow Response Times**
   - > 3s average response time
   - Check performance

3. **Unusual Payment Patterns**
   - Spike in failures
   - Review user experience

## Monitoring Files

### Core Files

- `lib/monitoring.ts` - Monitoring utilities and logging functions
- `MONITORING-GUIDE.md` - Comprehensive monitoring guide
- `monitoring-alerts.json` - Alert configuration

### Scripts

- `scripts/monitor-dashboard.sh` - Real-time monitoring dashboard
- `scripts/analyze-payment-logs.sh` - Payment log analysis
- `scripts/check-system-health.sh` - System health check
- `scripts/setup-monitoring.sh` - Initial monitoring setup

## Integration Points

### Payment Initiation API
- Logs all payment attempts
- Tracks success/failure rates
- Monitors response times
- Records errors with context

### Webhook Handler
- Logs webhook receipt
- Tracks processing time
- Records idempotency checks
- Logs campaign activation

### Firebase Function
- Logs expiry check start
- Tracks campaigns processed
- Records batch operations
- Logs completion with metrics

## Troubleshooting

### No Logs Appearing

1. Check Vercel CLI is installed: `vercel --version`
2. Ensure you're logged in: `vercel login`
3. Verify project is linked: `vercel link`

### High Error Rate

1. View recent errors: `vercel logs --filter=error --limit=50`
2. Check for patterns in error messages
3. Review recent deployments
4. Check external service status (Cashfree, Firebase)

### Webhook Not Processing

1. Check webhook logs: `vercel logs --filter=webhook --limit=50`
2. Verify webhook URL in Cashfree dashboard
3. Test webhook signature verification
4. Check Firestore write permissions

### Function Not Running

1. Check function logs: `firebase functions:log --only scheduledCampaignExpiryCheck`
2. Verify function is deployed: `firebase functions:list`
3. Check function schedule configuration
4. Manually trigger for testing

## Best Practices

1. **Regular Monitoring**
   - Check dashboard daily
   - Review error logs weekly
   - Analyze payment trends monthly

2. **Alert Response**
   - Respond to critical alerts immediately
   - Investigate warnings within 24 hours
   - Track and resolve patterns

3. **Log Analysis**
   - Use structured logging for easy parsing
   - Include context in all logs
   - Sanitize sensitive data

4. **Performance Optimization**
   - Monitor response times
   - Optimize slow operations
   - Review database queries

## Additional Resources

- [Vercel Monitoring Docs](https://vercel.com/docs/concepts/observability)
- [Firebase Functions Monitoring](https://firebase.google.com/docs/functions/monitoring)
- [Cashfree Webhook Guide](https://docs.cashfree.com/docs/webhooks)

## Support

For issues or questions:
1. Check MONITORING-GUIDE.md for detailed procedures
2. Review monitoring-alerts.json for alert configurations
3. Run health check: `./scripts/check-system-health.sh`
4. Contact engineering team if issues persist

---

**Last Updated**: Task 13.3 Implementation
**Version**: 1.0.0
