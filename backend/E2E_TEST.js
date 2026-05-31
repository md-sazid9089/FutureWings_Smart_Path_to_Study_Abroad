const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
const userEmail = `test_${Date.now()}@futurewings.com`;
const password = 'TestPassword123!';

async function runE2ETests() {
  console.log('--- STARTING END-TO-END TEST ---');
  try {
    // 1. Signup
    console.log(`\n[1] Registering user ${userEmail}...`);
    const signupRes = await axios.post(`${BASE_URL}/auth/signup`, {
      email: userEmail,
      password: password,
      fullName: 'E2E Test User'
    });
    console.log('Signup Response:', signupRes.status, signupRes.data.success ? 'Success' : 'Failed');
    const token = signupRes.data.data.token;
    
    const api = axios.create({
      baseURL: BASE_URL,
      headers: { Authorization: `Bearer ${token}` }
    });

    // 2. Fetch Countries
    console.log('\n[2] Fetching countries...');
    const countriesRes = await api.get('/countries');
    console.log(`Fetched ${countriesRes.data.data.length} countries. Status: ${countriesRes.status}`);

    // 3. Create Notification
    console.log('\n[3] Simulating backend notification creation...');
    // We don't have a direct frontend route to create a notification, but let's check unread notifications
    const unreadRes = await api.get('/notifications?status=unread');
    console.log(`Unread notifications count: ${unreadRes.data.data.total}. Status: ${unreadRes.status}`);

    // 4. Fetch User Profile
    console.log('\n[4] Fetching user profile...');
    const profileRes = await api.get('/user/me');
    console.log(`User Profile Name: ${profileRes.data.data.fullName}. Status: ${profileRes.status}`);

    // 5. Check Stripe Status
    console.log('\n[5] Fetching Stripe payment status...');
    const paymentStatusRes = await api.get('/payments/status');
    console.log(`Premium Status: ${paymentStatusRes.data.data.isPremium}. Status: ${paymentStatusRes.status}`);

    console.log('\n--- ALL E2E TESTS COMPLETED SUCCESSFULLY ---');
  } catch (error) {
    console.error('\n!!! E2E TEST FAILED !!!');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
  }
}

runE2ETests();
