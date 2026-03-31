require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  console.log(" Seeding database...\n");

  // ─── 1. Application Statuses ──────────────────────────────
  const statusNames = ["Pending", "Processing", "Accepted", "Rejected"];
  for (const name of statusNames) {
    await prisma.applicationStatus.upsert({
      where: { statusName: name },
      update: {},
      create: { statusName: name },
    });
  }
  console.log("✔  ApplicationStatuses seeded:", statusNames.join(", "));

  // ─── 2. Admin Users ────────────────────────────────────────
  const admins = [
    { email: "sazidcse@gmail.com", fullName: "Sazid Admin" },
    { email: "irfancse@gmail.com", fullName: "Irfan Admin" },
  ];
  const adminPassword = await bcrypt.hash("admin124", 10);
  for (const admin of admins) {
    const existing = await prisma.user.findUnique({ where: { email: admin.email } });
    if (!existing) {
      await prisma.user.create({
        data: {
          email: admin.email,
          passwordHash: adminPassword,
          role: "ADMIN",
          fullName: admin.fullName,
        },
      });
      console.log("✔  Admin user created:", admin.email, "/ admin124");
    } else {
      // Update password and role in case they already exist as regular users
      await prisma.user.update({
        where: { email: admin.email },
        data: { passwordHash: adminPassword, role: "ADMIN", fullName: admin.fullName },
      });
      console.log("✔  Admin user updated:", admin.email, "/ admin124");
    }
  }

  // ─── 3. Demo User ────────────────────────────────────────
  const demoEmail = "demo@futurewings.com";
  const existingDemo = await prisma.user.findUnique({ where: { email: demoEmail } });
  if (!existingDemo) {
    await prisma.user.create({
      data: {
        email: demoEmail,
        passwordHash: await bcrypt.hash("demo123", 10),
        role: "USER",
        fullName: "Demo User",
        cgpa: 3.8,
        degreeLevel: "Bachelors",
        major: "Computer Science",
        fundScore: 7,
      },
    });
    console.log("✔  Demo user created:", demoEmail, "/ demo123");
  } else {
    console.log("⏭  Demo user already exists");
  }

  // ─── 4. Sample Countries ──────────────────────────────────
  const countries = [
    { countryName: "United States",  region: "North America", currency: "USD", tierLevel: 1 },
    { countryName: "United Kingdom", region: "Europe",        currency: "GBP", tierLevel: 1 },
    { countryName: "Canada",         region: "North America", currency: "CAD", tierLevel: 1 },
    { countryName: "Germany",        region: "Europe",        currency: "EUR", tierLevel: 2 },
    { countryName: "Australia",      region: "Oceania",       currency: "AUD", tierLevel: 1 },
    { countryName: "Japan",          region: "Asia",          currency: "JPY", tierLevel: 2 },
  ];
  for (const c of countries) {
    const exists = await prisma.country.findFirst({ where: { countryName: c.countryName } });
    if (!exists) await prisma.country.create({ data: c });
  }
  console.log("✔  Countries seeded:", countries.length);

  // ─── 5. Sample Universities ───────────────────────────────
  const allCountries = await prisma.country.findMany();
  const countryMap = Object.fromEntries(allCountries.map((c) => [c.countryName, c.id]));

  const universities = [
    { universityName: "MIT",                          countryId: countryMap["United States"],  type: "Private", city: "Cambridge" },
    { universityName: "Stanford University",          countryId: countryMap["United States"],  type: "Private", city: "Stanford" },
    { universityName: "University of Oxford",         countryId: countryMap["United Kingdom"], type: "Public",  city: "Oxford" },
    { universityName: "University of Toronto",        countryId: countryMap["Canada"],         type: "Public",  city: "Toronto" },
    { universityName: "Technical University of Munich", countryId: countryMap["Germany"],      type: "Public",  city: "Munich" },
    { universityName: "University of Melbourne",      countryId: countryMap["Australia"],      type: "Public",  city: "Melbourne" },
    { universityName: "University of Tokyo",          countryId: countryMap["Japan"],          type: "National",city: "Tokyo" },
    { universityName: "Imperial College London",      countryId: countryMap["United Kingdom"], type: "Public",  city: "London" },
  ];
  for (const u of universities) {
    const exists = await prisma.university.findFirst({ where: { universityName: u.universityName } });
    if (!exists) await prisma.university.create({ data: u });
  }
  console.log("✔  Universities seeded:", universities.length);

  // ─── 6. Sample Programs ──────────────────────────────────
  const allUnis = await prisma.university.findMany();
  const uniMap = Object.fromEntries(allUnis.map((u) => [u.universityName, u.id]));

  const programs = [
    { programName: "MSc Computer Science",       universityId: uniMap["MIT"],                            level: "Masters",   tuitionPerYear: 55000 },
    { programName: "MBA",                        universityId: uniMap["Stanford University"],            level: "Masters",   tuitionPerYear: 75000 },
    { programName: "MSc Data Science",           universityId: uniMap["University of Oxford"],           level: "Masters",   tuitionPerYear: 35000 },
    { programName: "BSc Engineering",            universityId: uniMap["University of Toronto"],          level: "Bachelors", tuitionPerYear: 28000 },
    { programName: "MSc Mechanical Engineering", universityId: uniMap["Technical University of Munich"], level: "Masters",   tuitionPerYear: 500 },
    { programName: "MSc AI",                     universityId: uniMap["University of Melbourne"],        level: "Masters",   tuitionPerYear: 38000 },
    { programName: "MSc Robotics",               universityId: uniMap["University of Tokyo"],            level: "Masters",   tuitionPerYear: 5000 },
    { programName: "MSc Biomedical Engineering", universityId: uniMap["Imperial College London"],        level: "Masters",   tuitionPerYear: 40000 },
  ];
  for (const p of programs) {
    const exists = await prisma.program.findFirst({ where: { programName: p.programName, universityId: p.universityId } });
    if (!exists) await prisma.program.create({ data: p });
  }
  console.log("✔  Programs seeded:", programs.length);

  // ─── 7. Sample Scholarships ───────────────────────────────
  const scholarships = [
    { scholarshipName: "Fulbright Scholarship",      countryId: countryMap["United States"],  eligibilityCriteria: "GPA > 3.5", amount: 50000, applyLink: "https://fulbright.org" },
    { scholarshipName: "Chevening Scholarship",      countryId: countryMap["United Kingdom"], eligibilityCriteria: "Leadership experience", amount: 40000, applyLink: "https://chevening.org" },
    { scholarshipName: "DAAD Scholarship",           countryId: countryMap["Germany"],        eligibilityCriteria: "CGPA > 3.0", amount: 15000, applyLink: "https://daad.de" },
    { scholarshipName: "Vanier Canada Graduate",     countryId: countryMap["Canada"],         eligibilityCriteria: "Research excellence", amount: 50000, applyLink: "https://vanier.gc.ca" },
    { scholarshipName: "Australia Awards",           countryId: countryMap["Australia"],       eligibilityCriteria: "Developing country citizen", amount: 35000, applyLink: "https://australiaawards.gov.au" },
    { scholarshipName: "MEXT Scholarship",           countryId: countryMap["Japan"],          eligibilityCriteria: "Under 35 years", amount: 12000, applyLink: "https://mext.go.jp" },
  ];
  for (const s of scholarships) {
    const exists = await prisma.scholarship.findFirst({ where: { scholarshipName: s.scholarshipName } });
    if (!exists) await prisma.scholarship.create({ data: s });
  }
  console.log("✔  Scholarships seeded:", scholarships.length);

  console.log("\n🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
