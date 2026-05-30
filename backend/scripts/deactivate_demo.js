const prisma = require('../src/prisma/client');

(async () => {
  try {
    const u = await prisma.user.update({
      where: { email: 'demo@futurewings.com' },
      data: {
        isPremium: false,
        premiumFeatures: null,
        premiumExpiryDate: null,
      },
    });
    console.log('deactivated', u.email, u.isPremium, u.premiumFeatures);
  } catch (e) {
    console.error('ERR', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
