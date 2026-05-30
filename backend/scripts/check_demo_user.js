const prisma = require('../src/prisma/client');

(async () => {
  try {
    const u = await prisma.user.findUnique({
      where: { email: 'demo@futurewings.com' },
      select: { id: true, email: true, isPremium: true, role: true, premiumFeatures: true },
    });
    console.log(JSON.stringify(u, null, 2));
  } catch (e) {
    console.error('Error querying demo user', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
