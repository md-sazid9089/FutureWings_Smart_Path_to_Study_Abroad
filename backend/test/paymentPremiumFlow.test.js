// Automated test for Stripe payment and premium unlock
// Run with: npx jest test/paymentPremiumFlow.test.js


const axios = require('axios');
const prisma = require('../src/prisma/client');

const TEST_USER_EMAIL = 'testuser-stripe@example.com';
const TEST_USER_PASSWORD = 'Test1234!';
const BASE_URL = 'http://localhost:5000';

let testUser;

beforeAll(async () => {
  // Clean up any existing test user
  await prisma.user.deleteMany({ where: { email: TEST_USER_EMAIL } });
  // Create a new test user
  testUser = await prisma.user.create({
    data: {
      email: TEST_USER_EMAIL,
      passwordHash: TEST_USER_PASSWORD, // Assume plaintext for test, or hash if needed
      isPremium: false,
    },
  });
});

afterAll(async () => {
  await prisma.payment.deleteMany({ where: { userId: testUser.id } });
  await prisma.user.delete({ where: { id: testUser.id } });
  await prisma.$disconnect();
});

test('Stripe payment unlocks premium and saves payment', async () => {
  // 1. Use Stripe test token instead of raw card
  // See https://stripe.com/docs/testing#tokens
  const stripeTestToken = 'tok_visa';

  // 2. Simulate authentication: patch backend to allow test userId via header for test, or set up a test-only bypass
  // Here, we assume the backend uses req.auth.userId from a middleware, so we pass userId in a custom header for test

  // 3. Call the payment intent endpoint on the running backend
  const res = await axios.post(
    `${BASE_URL}/api/payments/create-payment-intent`,
    { paymentMethodId: stripeTestToken, amount: 5000 },
    { headers: { 'x-test-user-id': testUser.id } }
  );

  expect(res.status).toBe(200);
  expect(res.data.status).toBe('succeeded');

  // 4. Check user isPremium is true
  const updatedUser = await prisma.user.findUnique({ where: { id: testUser.id } });
  expect(updatedUser.isPremium).toBe(true);

  // 5. Check payment record exists
  const payment = await prisma.payment.findFirst({ where: { userId: testUser.id } });
  expect(payment).toBeTruthy();
  expect(payment.amount).toBe(5000);
  expect(payment.status).toBe('SUCCESS');
});
