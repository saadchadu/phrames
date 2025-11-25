import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

// Initialize Firebase Admin
if (getApps().length === 0) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  })
}

async function testPaymentAPI() {
  try {
    console.log('Testing payment API...')
    
    // Test Cashfree configuration
    console.log('\n1. Checking Cashfree configuration:')
    console.log('   CASHFREE_CLIENT_ID:', process.env.CASHFREE_CLIENT_ID ? '✓ Set' : '✗ Missing')
    console.log('   CASHFREE_CLIENT_SECRET:', process.env.CASHFREE_CLIENT_SECRET ? '✓ Set' : '✗ Missing')
    console.log('   CASHFREE_ENV:', process.env.CASHFREE_ENV)
    console.log('   NEXT_PUBLIC_CASHFREE_ENV:', process.env.NEXT_PUBLIC_CASHFREE_ENV)
    console.log('   NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL)
    
    // Test Cashfree SDK
    console.log('\n2. Testing Cashfree SDK:')
    const { Cashfree: CashfreeSDK, CFEnvironment } = await import('cashfree-pg')
    const environment = process.env.CASHFREE_ENV === 'PRODUCTION' 
      ? CFEnvironment.PRODUCTION 
      : CFEnvironment.SANDBOX
    
    const cashfree = new CashfreeSDK(
      environment,
      process.env.CASHFREE_CLIENT_ID!,
      process.env.CASHFREE_CLIENT_SECRET!
    )
    
    console.log('   Cashfree SDK initialized successfully ✓')
    console.log('   Environment:', environment === CFEnvironment.SANDBOX ? 'SANDBOX' : 'PRODUCTION')
    
    // Create a test order
    console.log('\n3. Creating test order:')
    const testOrder = {
      order_amount: 99,
      order_currency: 'INR',
      order_id: `test_order_${Date.now()}`,
      customer_details: {
        customer_id: 'test_user_123',
        customer_email: 'test@example.com',
        customer_phone: '9999999999'
      },
      order_meta: {
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
        notify_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/webhook`
      },
      order_note: 'Test order'
    }
    
    console.log('   Order request:', JSON.stringify(testOrder, null, 2))
    
    const response = await cashfree.PGCreateOrder(testOrder)
    console.log('\n   ✓ Order created successfully!')
    console.log('   Order ID:', response.data?.order_id)
    console.log('   Payment Session ID:', response.data?.payment_session_id)
    console.log('   CF Order ID:', response.data?.cf_order_id)
    
    if (!response.data?.payment_session_id) {
      console.error('\n   ✗ ERROR: No payment_session_id in response!')
      console.error('   Full response:', JSON.stringify(response.data, null, 2))
    } else {
      console.log('\n   ✓ Payment session ID is present and valid')
    }
    
  } catch (error: any) {
    console.error('\n✗ Error:', error.message)
    if (error.response?.data) {
      console.error('   Cashfree error response:', JSON.stringify(error.response.data, null, 2))
    }
    console.error('   Stack:', error.stack)
  }
}

testPaymentAPI()
