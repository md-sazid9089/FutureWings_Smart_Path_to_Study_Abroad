/**
 * Stripe Payment API Testing Script
 * Usage: Run this in Node.js to test payment endpoints
 * 
 * Prerequisites:
 * - Backend server running on localhost:5000
 * - Valid JWT token in localStorage (or export TOKEN=your_token)
 * - Database configured and running
 */

const axios = require('axios');

// Configuration
const API_BASE = 'http://localhost:5000/api';
const TOKEN = process.env.TOKEN || 'YOUR_JWT_TOKEN_HERE';

// Test data
const testUser = {
  email: 'test@futurewings.com',
  password: 'Test@1234',
};

const testPayments = [
  { featureType: 'AI_HELP', amount: 4999, description: 'AI Help - $49.99' },
  { featureType: 'SOP_TESTING', amount: 4999, description: 'SOP Testing - $49.99' },
  { featureType: 'VISA_CONSULTANCY', amount: 9999, description: 'Visa Consultancy - $99.99' },
  { featureType: 'PREMIUM_BUNDLE', amount: 14999, description: 'Premium Bundle - $149.99' },
];

// Helper functions
const request = async (method, url, data = null) => {
  try {
    const config = {
      method,
      url: `${API_BASE}${url}`,
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
    };
    
    if (data) config.data = data;
    
    const response = await axios(config);
    return {
      status: 'success',
      statusCode: response.status,
      data: response.data,
    };
  } catch (error) {
    return {
      status: 'error',
      statusCode: error.response?.status,
      message: error.response?.data?.message || error.message,
      error: error.response?.data,
    };
  }
};

// Display formatted results
const displayResult = (testName, result) => {
  console.log('\n' + '='.repeat(60));
  console.log(`🧪 TEST: ${testName}`);
  console.log('='.repeat(60));
  
  if (result.status === 'success') {
    console.log(`✅ Status: ${result.statusCode}`);
    console.log('📊 Response:', JSON.stringify(result.data, null, 2));
  } else {
    console.log(`❌ Status: ${result.statusCode}`);
    console.log('⚠️ Error:', result.message);
    console.log('Details:', JSON.stringify(result.error, null, 2));
  }
};

// Test suite
const runTests = async () => {
  console.log('\n🚀 STRIPE PAYMENT INTEGRATION - API TEST SUITE');
  console.log('API Base:', API_BASE);
  console.log('Token:', TOKEN.substring(0, 20) + '...');

  // Test 1: Get Payment Status
  console.log('\n\n📋 SECTION 1: User Status & History');
  
  const statusResult = await request('GET', '/payments/status');
  displayResult('Get Payment Status', statusResult);

  const historyResult = await request('GET', '/payments/history');
  displayResult('Get Payment History', historyResult);

  // Test 2: Create Checkout Sessions
  console.log('\n\n💳 SECTION 2: Create Checkout Sessions');

  for (const payment of testPayments) {
    const result = await request('POST', '/payments/create-checkout-session', {
      featureType: payment.featureType,
    });
    
    displayResult(`Create Session - ${payment.description}`, result);
    
    // If successful, log session ID for later verification
    if (result.status === 'success' && result.data.data?.sessionId) {
      console.log(`\n📌 Session ID: ${result.data.data.sessionId}`);
      console.log(`📌 Checkout URL: ${result.data.data.url}`);
    }
  }

  // Test 3: Verify Session (requires valid session ID from above)
  console.log('\n\n🔍 SECTION 3: Verify Checkout Session');
  
  // Example with mock session ID
  const mockSessionId = 'cs_test_mock_session';
  const verifyResult = await request('GET', `/payments/verify-session/${mockSessionId}`);
  displayResult('Verify Session', verifyResult);

  // Test 4: Payment Analytics
  console.log('\n\n📈 SECTION 4: Payment Analytics');
  
  const analyticsResult = await request('GET', '/admin/payment-analytics');
  displayResult('Get Payment Analytics', analyticsResult);
};

// Main execution
if (require.main === module) {
  runTests().then(() => {
    console.log('\n\n✅ Test suite completed!');
    process.exit(0);
  }).catch((error) => {
    console.error('\n❌ Test suite failed:', error);
    process.exit(1);
  });
}

module.exports = { request, testPayments };
