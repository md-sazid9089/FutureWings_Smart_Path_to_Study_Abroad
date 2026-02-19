import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ── Create default ApplicationStatus rows ──────────────
  const statuses = ["Pending", "Processing", "Accepted", "Rejected"];
  for (const name of statuses) {
    await prisma.applicationStatus.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log("✅ Application statuses seeded");

  // ── Create admin user ──────────────────────────────────
  const adminEmail = "admin@futurewings.com";
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        role: "ADMIN",
        fullname: "System Admin",
      },
    });
    console.log("✅ Admin user created (admin@futurewings.com / admin123)");
  } else {
    console.log("ℹ️  Admin user already exists");
  }

  // ── Create demo user ────────────────────────────────────
  const demoEmail = "demo@futurewings.com";
  const existingDemo = await prisma.user.findUnique({ where: { email: demoEmail } });
  if (!existingDemo) {
    const demoPassword = await bcrypt.hash("demo123", 10);
    await prisma.user.create({
      data: {
        email: demoEmail,
        password: demoPassword,
        role: "USER",
        fullname: "Demo Student",
        cgpa: 3.5,
        degreeLevel: "Bachelors",
        major: "Computer Science",
        fundScore: 7,
      },
    });
    console.log("✅ Demo user created (demo@futurewings.com / demo123)");
  } else {
    console.log("ℹ️  Demo user already exists");
  }

  // ── Sample countries ───────────────────────────────────
  const countries = [
    { name: "United States", code: "US", tier: 1, description: "Top destination for higher education." },
    { name: "United Kingdom", code: "UK", tier: 1, description: "World-class universities and research." },
    { name: "Canada", code: "CA", tier: 2, description: "Affordable education with great quality of life." },
    { name: "Australia", code: "AU", tier: 2, description: "Excellent student support and diverse programs." },
    { name: "Germany", code: "DE", tier: 3, description: "Low-cost education with strong engineering programs." },
  ];
  for (const c of countries) {
    await prisma.country.upsert({
      where: { code: c.code },
      update: {},
      create: c,
    });
  }
  console.log("✅ Sample countries seeded");

  console.log("🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
