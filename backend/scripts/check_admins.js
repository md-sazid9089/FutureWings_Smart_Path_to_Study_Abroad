const prisma = require('../src/prisma/client');

(async () => {
  try {
    const a = await prisma.user.findUnique({ where: { email: 'sazidcse@gmail.com' }, select: { email: true, isPremium: true } });
    const b = await prisma.user.findUnique({ where: { email: 'irfancse@gmail.com' }, select: { email: true, isPremium: true } });
    console.log('admin1', a);
    console.log('admin2', b);
  } catch (e) {
    console.error('ERR', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
