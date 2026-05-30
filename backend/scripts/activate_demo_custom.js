const prisma = require('../src/prisma/client');

(async () => {
  try {
    const u = await prisma.user.update({
      where: { email: 'demo@futurewings.com' },
      data: {
        isPremium: true,
        premiumFeatures: 'AI_HELP,SOP_TESTING,VISA_CONSULTANCY,SCHOLARSHIPS_PLUS',
        premiumExpiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
    console.log('activated', u.email, u.isPremium, u.premiumFeatures);
  } catch (e) {
    console.error('ERR', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
