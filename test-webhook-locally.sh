#!/bin/bash

# Test webhook with a realistic Cashfree payload
curl -X POST https://phrames.cleffon.com/api/payments/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "type": "PAYMENT_SUCCESS_WEBHOOK",
    "data": {
      "order": {
        "order_id": "order_1732579200_5iPhIO3Q"
      },
      "payment": {
        "cf_payment_id": "12345678",
        "payment_status": "SUCCESS",
        "payment_amount": 299,
        "payment_currency": "INR"
      }
    }
  }'

echo ""
echo "Check admin logs at: https://phrames.cleffon.com/admin/logs"
