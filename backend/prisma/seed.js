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

  // ─── 4. Comprehensive Countries ───────────────────────────
  const countries = [
    // North America
    { countryName: "United States",  region: "North America", currency: "USD", tierLevel: 1 },
    { countryName: "Canada",         region: "North America", currency: "CAD", tierLevel: 1 },
    // Europe
    { countryName: "United Kingdom", region: "Europe",        currency: "GBP", tierLevel: 1 },
    { countryName: "Germany",        region: "Europe",        currency: "EUR", tierLevel: 1 },
    { countryName: "France",         region: "Europe",        currency: "EUR", tierLevel: 1 },
    { countryName: "Netherlands",    region: "Europe",        currency: "EUR", tierLevel: 2 },
    { countryName: "Switzerland",    region: "Europe",        currency: "CHF", tierLevel: 1 },
    { countryName: "Sweden",         region: "Europe",        currency: "SEK", tierLevel: 2 },
    { countryName: "Spain",          region: "Europe",        currency: "EUR", tierLevel: 2 },
    { countryName: "Italy",          region: "Europe",        currency: "EUR", tierLevel: 2 },
    // Asia-Pacific
    { countryName: "Australia",      region: "Oceania",       currency: "AUD", tierLevel: 1 },
    { countryName: "Japan",          region: "Asia",          currency: "JPY", tierLevel: 1 },
    { countryName: "Singapore",      region: "Asia",          currency: "SGD", tierLevel: 2 },
    { countryName: "South Korea",    region: "Asia",          currency: "KRW", tierLevel: 2 },
    { countryName: "China",          region: "Asia",          currency: "CNY", tierLevel: 2 },
    { countryName: "India",          region: "Asia",          currency: "INR", tierLevel: 3 },
    // Other
    { countryName: "New Zealand",    region: "Oceania",       currency: "NZD", tierLevel: 2 },
  ];
  for (const c of countries) {
    const exists = await prisma.country.findFirst({ where: { countryName: c.countryName } });
    if (!exists) await prisma.country.create({ data: c });
  }
  console.log("✔  Countries seeded:", countries.length);

  // ─── 5. Comprehensive Universities ────────────────────────
  const allCountries = await prisma.country.findMany();
  const countryMap = Object.fromEntries(allCountries.map((c) => [c.countryName, c.id]));

  const universities = [
    // United States - Top Tier
    { universityName: "MIT",                          countryId: countryMap["United States"],  type: "Private", city: "Cambridge" },
    { universityName: "Stanford University",          countryId: countryMap["United States"],  type: "Private", city: "Stanford" },
    { universityName: "Harvard University",           countryId: countryMap["United States"],  type: "Private", city: "Cambridge" },
    { universityName: "California Institute of Technology", countryId: countryMap["United States"],  type: "Private", city: "Pasadena" },
    { universityName: "Princeton University",         countryId: countryMap["United States"],  type: "Private", city: "Princeton" },
    { universityName: "Yale University",              countryId: countryMap["United States"],  type: "Private", city: "New Haven" },
    { universityName: "Columbia University",          countryId: countryMap["United States"],  type: "Private", city: "New York" },
    { universityName: "University of Pennsylvania",   countryId: countryMap["United States"],  type: "Private", city: "Philadelphia" },
    { universityName: "University of Chicago",        countryId: countryMap["United States"],  type: "Private", city: "Chicago" },
    { universityName: "Northwestern University",      countryId: countryMap["United States"],  type: "Private", city: "Evanston" },
    { universityName: "University of California, Berkeley", countryId: countryMap["United States"],  type: "Public",  city: "Berkeley" },
    { universityName: "University of Michigan",       countryId: countryMap["United States"],  type: "Public",  city: "Ann Arbor" },
    // UK
    { universityName: "University of Oxford",         countryId: countryMap["United Kingdom"], type: "Public",  city: "Oxford" },
    { universityName: "University of Cambridge",      countryId: countryMap["United Kingdom"], type: "Public",  city: "Cambridge" },
    { universityName: "Imperial College London",      countryId: countryMap["United Kingdom"], type: "Public",  city: "London" },
    { universityName: "London School of Economics",   countryId: countryMap["United Kingdom"], type: "Public",  city: "London" },
    { universityName: "University College London",    countryId: countryMap["United Kingdom"], type: "Public",  city: "London" },
    { universityName: "University of Manchester",     countryId: countryMap["United Kingdom"], type: "Public",  city: "Manchester" },
    // Canada
    { universityName: "University of Toronto",        countryId: countryMap["Canada"],         type: "Public",  city: "Toronto" },
    { universityName: "University of British Columbia", countryId: countryMap["Canada"],       type: "Public",  city: "Vancouver" },
    { universityName: "McGill University",            countryId: countryMap["Canada"],         type: "Private", city: "Montreal" },
    { universityName: "McMaster University",          countryId: countryMap["Canada"],         type: "Public",  city: "Hamilton" },
    // Germany
    { universityName: "Technical University of Munich", countryId: countryMap["Germany"],      type: "Public",  city: "Munich" },
    { universityName: "Heidelberg University",        countryId: countryMap["Germany"],        type: "Public",  city: "Heidelberg" },
    { universityName: "University of Berlin",         countryId: countryMap["Germany"],        type: "Public",  city: "Berlin" },
    { universityName: "University of Hamburg",        countryId: countryMap["Germany"],        type: "Public",  city: "Hamburg" },
    // France
    { universityName: "Sorbonne University",          countryId: countryMap["France"],         type: "Public",  city: "Paris" },
    { universityName: "Paris-Saclay University",      countryId: countryMap["France"],         type: "Public",  city: "Paris" },
    { universityName: "Lyon University",              countryId: countryMap["France"],         type: "Public",  city: "Lyon" },
    // Netherlands
    { universityName: "University of Amsterdam",      countryId: countryMap["Netherlands"],    type: "Public",  city: "Amsterdam" },
    { universityName: "University of Utrecht",        countryId: countryMap["Netherlands"],    type: "Public",  city: "Utrecht" },
    { universityName: "Delft University of Technology", countryId: countryMap["Netherlands"],  type: "Public",  city: "Delft" },
    // Switzerland
    { universityName: "ETH Zurich",                   countryId: countryMap["Switzerland"],    type: "Public",  city: "Zurich" },
    { universityName: "University of Zurich",         countryId: countryMap["Switzerland"],    type: "Public",  city: "Zurich" },
    // Australia
    { universityName: "University of Melbourne",      countryId: countryMap["Australia"],      type: "Public",  city: "Melbourne" },
    { universityName: "University of Sydney",         countryId: countryMap["Australia"],      type: "Public",  city: "Sydney" },
    { universityName: "University of New South Wales", countryId: countryMap["Australia"],     type: "Public",  city: "Sydney" },
    { universityName: "Australian National University", countryId: countryMap["Australia"],    type: "Public",  city: "Canberra" },
    // Japan
    { universityName: "University of Tokyo",          countryId: countryMap["Japan"],          type: "National",city: "Tokyo" },
    { universityName: "Kyoto University",             countryId: countryMap["Japan"],          type: "National",city: "Kyoto" },
    { universityName: "Osaka University",             countryId: countryMap["Japan"],          type: "National",city: "Osaka" },
    { universityName: "Tokyo Institute of Technology", countryId: countryMap["Japan"],         type: "National",city: "Tokyo" },
    // Singapore
    { universityName: "National University of Singapore", countryId: countryMap["Singapore"],  type: "Public",  city: "Singapore" },
    { universityName: "Nanyang Technological University", countryId: countryMap["Singapore"],  type: "Public",  city: "Singapore" },
    // South Korea
    { universityName: "Seoul National University",    countryId: countryMap["South Korea"],    type: "National",city: "Seoul" },
    { universityName: "KAIST",                        countryId: countryMap["South Korea"],    type: "Private", city: "Daejeon" },
    // China
    { universityName: "Tsinghua University",          countryId: countryMap["China"],          type: "Public",  city: "Beijing" },
    { universityName: "Peking University",            countryId: countryMap["China"],          type: "Public",  city: "Beijing" },
    // India
    { universityName: "Indian Institute of Technology Delhi", countryId: countryMap["India"],  type: "Public",  city: "Delhi" },
    { universityName: "Indian Institute of Technology Bombay", countryId: countryMap["India"],  type: "Public",  city: "Mumbai" },
    // New Zealand
    { universityName: "University of Auckland",       countryId: countryMap["New Zealand"],    type: "Public",  city: "Auckland" },
    { universityName: "University of Otago",          countryId: countryMap["New Zealand"],    type: "Public",  city: "Dunedin" },
  ];
  for (const u of universities) {
    const exists = await prisma.university.findFirst({ where: { universityName: u.universityName } });
    if (!exists) await prisma.university.create({ data: u });
  }
  console.log("✔  Universities seeded:", universities.length);

  // ─── 6. Comprehensive Programs ────────────────────────────
  const allUnis = await prisma.university.findMany();
  const uniMap = Object.fromEntries(allUnis.map((u) => [u.universityName, u.id]));

  const programs = [
    // MIT Programs
    { programName: "MSc Computer Science",       universityId: uniMap["MIT"],                            level: "Masters",   tuitionPerYear: 60000 },
    { programName: "BSc Electrical Engineering", universityId: uniMap["MIT"],                            level: "Bachelors", tuitionPerYear: 60000 },
    { programName: "PhD Artificial Intelligence", universityId: uniMap["MIT"],                           level: "PhD",       tuitionPerYear: 50000 },
    { programName: "MEng Mechanical Engineering", universityId: uniMap["MIT"],                           level: "Masters",   tuitionPerYear: 60000 },
    { programName: "MBA",                        universityId: uniMap["MIT"],                            level: "Masters",   tuitionPerYear: 75000 },
    
    // Stanford Programs
    { programName: "MBA",                        universityId: uniMap["Stanford University"],            level: "Masters",   tuitionPerYear: 75000 },
    { programName: "MSc Data Science",           universityId: uniMap["Stanford University"],            level: "Masters",   tuitionPerYear: 65000 },
    { programName: "PhD Computer Science",       universityId: uniMap["Stanford University"],            level: "PhD",       tuitionPerYear: 55000 },
    { programName: "BSc Engineering",            universityId: uniMap["Stanford University"],            level: "Bachelors", tuitionPerYear: 65000 },
    { programName: "MSc Engineering",            universityId: uniMap["Stanford University"],            level: "Masters",   tuitionPerYear: 68000 },
    
    // Harvard Programs
    { programName: "MBA",                        universityId: uniMap["Harvard University"],             level: "Masters",   tuitionPerYear: 73000 },
    { programName: "LLM Law",                    universityId: uniMap["Harvard University"],             level: "Masters",   tuitionPerYear: 68000 },
    { programName: "MPH Public Health",          universityId: uniMap["Harvard University"],             level: "Masters",   tuitionPerYear: 58000 },
    { programName: "PhD Human Development",      universityId: uniMap["Harvard University"],             level: "PhD",       tuitionPerYear: 50000 },
    
    // Caltech Programs
    { programName: "PhD Physics",                universityId: uniMap["California Institute of Technology"], level: "PhD",     tuitionPerYear: 50000 },
    { programName: "MS Engineering and Applied Science", universityId: uniMap["California Institute of Technology"], level: "Masters", tuitionPerYear: 62000 },
    { programName: "PhD Chemistry",              universityId: uniMap["California Institute of Technology"], level: "PhD",     tuitionPerYear: 50000 },
    
    // Princeton Programs
    { programName: "MSc Engineering",            universityId: uniMap["Princeton University"],           level: "Masters",   tuitionPerYear: 62000 },
    { programName: "PhD Mathematics",            universityId: uniMap["Princeton University"],           level: "PhD",       tuitionPerYear: 48000 },
    { programName: "MBA",                        universityId: uniMap["Princeton University"],           level: "Masters",   tuitionPerYear: 72000 },
    
    // Yale Programs
    { programName: "MBA",                        universityId: uniMap["Yale University"],                level: "Masters",   tuitionPerYear: 72000 },
    { programName: "MSc Applied Physics",        universityId: uniMap["Yale University"],                level: "Masters",   tuitionPerYear: 60000 },
    { programName: "PhD Computer Science",       universityId: uniMap["Yale University"],                level: "PhD",       tuitionPerYear: 48000 },
    
    // Columbia Programs
    { programName: "MBA",                        universityId: uniMap["Columbia University"],            level: "Masters",   tuitionPerYear: 73000 },
    { programName: "MSc Data Science",           universityId: uniMap["Columbia University"],            level: "Masters",   tuitionPerYear: 66000 },
    { programName: "MSc Computer Science",       universityId: uniMap["Columbia University"],            level: "Masters",   tuitionPerYear: 64000 },
    
    // Penn Programs
    { programName: "MBA Wharton",                universityId: uniMap["University of Pennsylvania"],     level: "Masters",   tuitionPerYear: 70000 },
    { programName: "MSc Engineering",            universityId: uniMap["University of Pennsylvania"],     level: "Masters",   tuitionPerYear: 60000 },
    { programName: "MSc Data Science",           universityId: uniMap["University of Pennsylvania"],     level: "Masters",   tuitionPerYear: 62000 },
    
    // University of Chicago
    { programName: "MBA Booth",                  universityId: uniMap["University of Chicago"],          level: "Masters",   tuitionPerYear: 71000 },
    { programName: "MSc Financial Mathematics",  universityId: uniMap["University of Chicago"],          level: "Masters",   tuitionPerYear: 65000 },
    { programName: "PhD Physics",                universityId: uniMap["University of Chicago"],          level: "PhD",       tuitionPerYear: 48000 },
    
    // Northwestern
    { programName: "MBA Kellogg",                universityId: uniMap["Northwestern University"],        level: "Masters",   tuitionPerYear: 70000 },
    { programName: "MSc Computer Science",       universityId: uniMap["Northwestern University"],        level: "Masters",   tuitionPerYear: 62000 },
    { programName: "MSc Engineering",            universityId: uniMap["Northwestern University"],        level: "Masters",   tuitionPerYear: 60000 },
    
    // UC Berkeley
    { programName: "MSc Data Science",           universityId: uniMap["University of California, Berkeley"], level: "Masters", tuitionPerYear: 45000 },
    { programName: "PhD Computer Science",       universityId: uniMap["University of California, Berkeley"], level: "PhD",     tuitionPerYear: 35000 },
    { programName: "MSc Engineering",            universityId: uniMap["University of California, Berkeley"], level: "Masters", tuitionPerYear: 42000 },
    
    // University of Michigan
    { programName: "MBA Ross",                   universityId: uniMap["University of Michigan"],         level: "Masters",   tuitionPerYear: 68000 },
    { programName: "MSc Industrial Engineering", universityId: uniMap["University of Michigan"],         level: "Masters",   tuitionPerYear: 50000 },
    { programName: "MSc Computer Science",       universityId: uniMap["University of Michigan"],         level: "Masters",   tuitionPerYear: 48000 },
    
    // Oxford Programs
    { programName: "MSc Data Science",           universityId: uniMap["University of Oxford"],           level: "Masters",   tuitionPerYear: 35000 },
    { programName: "MSc Computer Science",       universityId: uniMap["University of Oxford"],           level: "Masters",   tuitionPerYear: 35000 },
    { programName: "PhD Engineering",            universityId: uniMap["University of Oxford"],           level: "PhD",       tuitionPerYear: 8000 },
    { programName: "MBA",                        universityId: uniMap["University of Oxford"],           level: "Masters",   tuitionPerYear: 62000 },
    { programName: "MSc Mathematical Sciences",  universityId: uniMap["University of Oxford"],           level: "Masters",   tuitionPerYear: 34000 },
    
    // Cambridge Programs
    { programName: "MSc Information Engineering", universityId: uniMap["University of Cambridge"],       level: "Masters",   tuitionPerYear: 33000 },
    { programName: "PhD Physics",                universityId: uniMap["University of Cambridge"],        level: "PhD",       tuitionPerYear: 8000 },
    { programName: "MBA",                        universityId: uniMap["University of Cambridge"],        level: "Masters",   tuitionPerYear: 60000 },
    { programName: "MSc Computer Science",       universityId: uniMap["University of Cambridge"],        level: "Masters",   tuitionPerYear: 34000 },
    
    // Imperial College London
    { programName: "MSc Biomedical Engineering", universityId: uniMap["Imperial College London"],        level: "Masters",   tuitionPerYear: 40000 },
    { programName: "MSc Data Science",           universityId: uniMap["Imperial College London"],        level: "Masters",   tuitionPerYear: 42000 },
    { programName: "PhD Computing",              universityId: uniMap["Imperial College London"],        level: "PhD",       tuitionPerYear: 10000 },
    { programName: "MSc Mechanical Engineering", universityId: uniMap["Imperial College London"],        level: "Masters",   tuitionPerYear: 41000 },
    
    // LSE Programs
    { programName: "MSc Finance",                universityId: uniMap["London School of Economics"],     level: "Masters",   tuitionPerYear: 38000 },
    { programName: "MSc Data Science",           universityId: uniMap["London School of Economics"],     level: "Masters",   tuitionPerYear: 37000 },
    { programName: "MSc Management",             universityId: uniMap["London School of Economics"],     level: "Masters",   tuitionPerYear: 36000 },
    
    // UCL Programs
    { programName: "MSc Computer Science",       universityId: uniMap["University College London"],      level: "Masters",   tuitionPerYear: 39000 },
    { programName: "MSc Engineering",            universityId: uniMap["University College London"],      level: "Masters",   tuitionPerYear: 38000 },
    { programName: "MSc Data Science",           universityId: uniMap["University College London"],      level: "Masters",   tuitionPerYear: 39000 },
    
    // University of Manchester
    { programName: "MSc Computer Science",       universityId: uniMap["University of Manchester"],       level: "Masters",   tuitionPerYear: 32000 },
    { programName: "MSc Data Science",           universityId: uniMap["University of Manchester"],       level: "Masters",   tuitionPerYear: 33000 },
    
    // University of Toronto Programs
    { programName: "MSc Computer Engineering",   universityId: uniMap["University of Toronto"],          level: "Masters",   tuitionPerYear: 32000 },
    { programName: "MBA Rotman",                 universityId: uniMap["University of Toronto"],          level: "Masters",   tuitionPerYear: 50000 },
    { programName: "MSc Data Science",           universityId: uniMap["University of Toronto"],          level: "Masters",   tuitionPerYear: 31000 },
    
    // UBC Programs
    { programName: "MSc Computer Science",       universityId: uniMap["University of British Columbia"], level: "Masters",   tuitionPerYear: 30000 },
    { programName: "MSc Engineering",            universityId: uniMap["University of British Columbia"], level: "Masters",   tuitionPerYear: 28000 },
    { programName: "MBA",                        universityId: uniMap["University of British Columbia"], level: "Masters",   tuitionPerYear: 45000 },
    
    // McGill Programs
    { programName: "MSc Computer Science",       universityId: uniMap["McGill University"],              level: "Masters",   tuitionPerYear: 35000 },
    { programName: "MBA",                        universityId: uniMap["McGill University"],              level: "Masters",   tuitionPerYear: 48000 },
    { programName: "MSc Data Science",           universityId: uniMap["McGill University"],              level: "Masters",   tuitionPerYear: 36000 },
    
    // McMaster Programs
    { programName: "MSc Engineering",            universityId: uniMap["McMaster University"],            level: "Masters",   tuitionPerYear: 27000 },
    { programName: "MSc Health Sciences",        universityId: uniMap["McMaster University"],            level: "Masters",   tuitionPerYear: 26000 },
    
    // TU Munich Programs
    { programName: "MSc Mechanical Engineering", universityId: uniMap["Technical University of Munich"], level: "Masters",   tuitionPerYear: 500 },
    { programName: "MSc Computer Science",       universityId: uniMap["Technical University of Munich"], level: "Masters",   tuitionPerYear: 500 },
    { programName: "MSc Electrical Engineering", universityId: uniMap["Technical University of Munich"], level: "Masters",   tuitionPerYear: 500 },
    { programName: "MSc Engineering",            universityId: uniMap["Technical University of Munich"], level: "Masters",   tuitionPerYear: 500 },
    
    // Heidelberg Programs
    { programName: "MSc Physics",                universityId: uniMap["Heidelberg University"],          level: "Masters",   tuitionPerYear: 500 },
    { programName: "MSc Computer Science",       universityId: uniMap["Heidelberg University"],          level: "Masters",   tuitionPerYear: 500 },
    { programName: "MSc Chemistry",              universityId: uniMap["Heidelberg University"],          level: "Masters",   tuitionPerYear: 500 },
    
    // University of Berlin
    { programName: "MSc Computer Science",       universityId: uniMap["University of Berlin"],           level: "Masters",   tuitionPerYear: 500 },
    { programName: "MSc Physics",                universityId: uniMap["University of Berlin"],           level: "Masters",   tuitionPerYear: 500 },
    
    // University of Hamburg
    { programName: "MSc Informatics",            universityId: uniMap["University of Hamburg"],          level: "Masters",   tuitionPerYear: 500 },
    
    // Sorbonne University Programs
    { programName: "MSc Computer Science",       universityId: uniMap["Sorbonne University"],            level: "Masters",   tuitionPerYear: 800 },
    { programName: "MBA",                        universityId: uniMap["Sorbonne University"],            level: "Masters",   tuitionPerYear: 40000 },
    { programName: "MSc Mathematics",            universityId: uniMap["Sorbonne University"],            level: "Masters",   tuitionPerYear: 800 },
    
    // Paris-Saclay University
    { programName: "MSc Engineering",            universityId: uniMap["Paris-Saclay University"],        level: "Masters",   tuitionPerYear: 900 },
    
    // Lyon University
    { programName: "MSc Computer Science",       universityId: uniMap["Lyon University"],                level: "Masters",   tuitionPerYear: 850 },
    
    // University of Amsterdam
    { programName: "MSc Artificial Intelligence", universityId: uniMap["University of Amsterdam"],       level: "Masters",   tuitionPerYear: 25000 },
    { programName: "MSc Business Administration", universityId: uniMap["University of Amsterdam"],       level: "Masters",   tuitionPerYear: 28000 },
    { programName: "MSc Data Science",           universityId: uniMap["University of Amsterdam"],        level: "Masters",   tuitionPerYear: 26000 },
    
    // University of Utrecht
    { programName: "MSc Computer Science",       universityId: uniMap["University of Utrecht"],          level: "Masters",   tuitionPerYear: 24000 },
    { programName: "MSc Engineering",            universityId: uniMap["University of Utrecht"],          level: "Masters",   tuitionPerYear: 23000 },
    
    // Delft University
    { programName: "MSc Computer Science",       universityId: uniMap["Delft University of Technology"], level: "Masters",   tuitionPerYear: 26000 },
    { programName: "MSc Civil Engineering",      universityId: uniMap["Delft University of Technology"], level: "Masters",   tuitionPerYear: 25000 },
    { programName: "MSc Aerospace Engineering",  universityId: uniMap["Delft University of Technology"], level: "Masters",   tuitionPerYear: 26000 },
    
    // ETH Zurich Programs
    { programName: "MSc Computer Science",       universityId: uniMap["ETH Zurich"],                     level: "Masters",   tuitionPerYear: 1500 },
    { programName: "MSc Electrical Engineering", universityId: uniMap["ETH Zurich"],                     level: "Masters",   tuitionPerYear: 1500 },
    { programName: "PhD Engineering",            universityId: uniMap["ETH Zurich"],                     level: "PhD",       tuitionPerYear: 1500 },
    { programName: "MSc Physics",                universityId: uniMap["ETH Zurich"],                     level: "Masters",   tuitionPerYear: 1500 },
    
    // University of Zurich
    { programName: "MSc Computer Science",       universityId: uniMap["University of Zurich"],           level: "Masters",   tuitionPerYear: 1500 },
    
    // University of Melbourne Programs
    { programName: "MBA",                        universityId: uniMap["University of Melbourne"],        level: "Masters",   tuitionPerYear: 55000 },
    { programName: "MSc Data Science",           universityId: uniMap["University of Melbourne"],        level: "Masters",   tuitionPerYear: 42000 },
    { programName: "MSc Engineering",            universityId: uniMap["University of Melbourne"],        level: "Masters",   tuitionPerYear: 40000 },
    { programName: "MSc AI",                     universityId: uniMap["University of Melbourne"],        level: "Masters",   tuitionPerYear: 38000 },
    { programName: "PhD Computer Science",       universityId: uniMap["University of Melbourne"],        level: "PhD",       tuitionPerYear: 32000 },
    
    // University of Sydney Programs
    { programName: "MSc Computer Science",       universityId: uniMap["University of Sydney"],           level: "Masters",   tuitionPerYear: 45000 },
    { programName: "MBA",                        universityId: uniMap["University of Sydney"],           level: "Masters",   tuitionPerYear: 52000 },
    { programName: "MSc Data Science",           universityId: uniMap["University of Sydney"],           level: "Masters",   tuitionPerYear: 44000 },
    
    // UNSW Programs
    { programName: "MSc Engineering",            universityId: uniMap["University of New South Wales"],  level: "Masters",   tuitionPerYear: 46000 },
    { programName: "PhD Information Technology", universityId: uniMap["University of New South Wales"],  level: "PhD",       tuitionPerYear: 35000 },
    { programName: "MSc Data Science",           universityId: uniMap["University of New South Wales"],  level: "Masters",   tuitionPerYear: 45000 },
    
    // ANU Programs
    { programName: "MSc Data Science",           universityId: uniMap["Australian National University"], level: "Masters",   tuitionPerYear: 44000 },
    { programName: "PhD Computer Science",       universityId: uniMap["Australian National University"], level: "PhD",       tuitionPerYear: 34000 },
    { programName: "MSc Engineering",            universityId: uniMap["Australian National University"], level: "Masters",   tuitionPerYear: 43000 },
    
    // University of Tokyo Programs
    { programName: "MSc Computer Science",       universityId: uniMap["University of Tokyo"],            level: "Masters",   tuitionPerYear: 5000 },
    { programName: "PhD Engineering",            universityId: uniMap["University of Tokyo"],            level: "PhD",       tuitionPerYear: 5000 },
    { programName: "MSc Robotics",               universityId: uniMap["University of Tokyo"],            level: "Masters",   tuitionPerYear: 5000 },
    { programName: "MSc Advanced Materials",     universityId: uniMap["University of Tokyo"],            level: "Masters",   tuitionPerYear: 5000 },
    
    // Kyoto University Programs
    { programName: "MSc Advanced Informatics",   universityId: uniMap["Kyoto University"],               level: "Masters",   tuitionPerYear: 5000 },
    { programName: "MSc Science and Engineering", universityId: uniMap["Kyoto University"],              level: "Masters",   tuitionPerYear: 5000 },
    
    // Osaka University Programs
    { programName: "MSc Engineering",            universityId: uniMap["Osaka University"],               level: "Masters",   tuitionPerYear: 5000 },
    { programName: "MSc Science",                universityId: uniMap["Osaka University"],               level: "Masters",   tuitionPerYear: 5000 },
    
    // Tokyo Tech
    { programName: "MSc Materials Science",      universityId: uniMap["Tokyo Institute of Technology"],  level: "Masters",   tuitionPerYear: 5000 },
    { programName: "MSc Engineering",            universityId: uniMap["Tokyo Institute of Technology"],  level: "Masters",   tuitionPerYear: 5000 },
    
    // NUS Programs
    { programName: "MBA",                        universityId: uniMap["National University of Singapore"], level: "Masters",   tuitionPerYear: 62000 },
    { programName: "MSc Computer Science",       universityId: uniMap["National University of Singapore"], level: "Masters",   tuitionPerYear: 32000 },
    { programName: "MSc Data Science",           universityId: uniMap["National University of Singapore"], level: "Masters",   tuitionPerYear: 33000 },
    
    // NTU Programs
    { programName: "MSc Artificial Intelligence", universityId: uniMap["Nanyang Technological University"], level: "Masters",  tuitionPerYear: 30000 },
    { programName: "MBA",                        universityId: uniMap["Nanyang Technological University"], level: "Masters",  tuitionPerYear: 55000 },
    { programName: "MSc Computer Science",       universityId: uniMap["Nanyang Technological University"], level: "Masters",  tuitionPerYear: 31000 },
    
    // Seoul National University Programs
    { programName: "MSc Engineering",            universityId: uniMap["Seoul National University"],      level: "Masters",   tuitionPerYear: 15000 },
    { programName: "MBA",                        universityId: uniMap["Seoul National University"],      level: "Masters",   tuitionPerYear: 25000 },
    { programName: "MSc Business Administration", universityId: uniMap["Seoul National University"],      level: "Masters",   tuitionPerYear: 14000 },
    
    // KAIST Programs
    { programName: "MSc Computer Science",       universityId: uniMap["KAIST"],                          level: "Masters",   tuitionPerYear: 8000 },
    { programName: "MSc Engineering",            universityId: uniMap["KAIST"],                          level: "Masters",   tuitionPerYear: 8000 },
    { programName: "MBA",                        universityId: uniMap["KAIST"],                          level: "Masters",   tuitionPerYear: 12000 },
    
    // Tsinghua Programs
    { programName: "MSc Computer Science",       universityId: uniMap["Tsinghua University"],            level: "Masters",   tuitionPerYear: 8000 },
    { programName: "MBA",                        universityId: uniMap["Tsinghua University"],            level: "Masters",   tuitionPerYear: 25000 },
    { programName: "MSc Engineering",            universityId: uniMap["Tsinghua University"],            level: "Masters",   tuitionPerYear: 8000 },
    
    // Peking University Programs
    { programName: "MSc Business Administration", universityId: uniMap["Peking University"],              level: "Masters",   tuitionPerYear: 24000 },
    { programName: "MBA",                        universityId: uniMap["Peking University"],              level: "Masters",   tuitionPerYear: 26000 },
    { programName: "MSc Economics",              universityId: uniMap["Peking University"],              level: "Masters",   tuitionPerYear: 8000 },
    
    // IIT Delhi Programs
    { programName: "MTech Computer Science",     universityId: uniMap["Indian Institute of Technology Delhi"], level: "Masters", tuitionPerYear: 1000 },
    { programName: "MTech Civil Engineering",    universityId: uniMap["Indian Institute of Technology Delhi"], level: "Masters", tuitionPerYear: 1000 },
    { programName: "MTech Mechanical Engineering", universityId: uniMap["Indian Institute of Technology Delhi"], level: "Masters", tuitionPerYear: 1000 },
    
    // IIT Bombay Programs
    { programName: "MTech Engineering",          universityId: uniMap["Indian Institute of Technology Bombay"], level: "Masters", tuitionPerYear: 1000 },
    { programName: "MTech Aerospace Engineering", universityId: uniMap["Indian Institute of Technology Bombay"], level: "Masters", tuitionPerYear: 1000 },
    { programName: "MTech Computer Science",     universityId: uniMap["Indian Institute of Technology Bombay"], level: "Masters", tuitionPerYear: 1000 },
    
    // University of Auckland Programs
    { programName: "MSc Computer Science",       universityId: uniMap["University of Auckland"],         level: "Masters",   tuitionPerYear: 35000 },
    { programName: "MBA",                        universityId: uniMap["University of Auckland"],         level: "Masters",   tuitionPerYear: 48000 },
    { programName: "MSc Engineering",            universityId: uniMap["University of Auckland"],         level: "Masters",   tuitionPerYear: 34000 },
    
    // University of Otago Programs
    { programName: "MSc Technology",             universityId: uniMap["University of Otago"],            level: "Masters",   tuitionPerYear: 32000 },
    { programName: "MSc Health Sciences",        universityId: uniMap["University of Otago"],            level: "Masters",   tuitionPerYear: 30000 },
    { programName: "MSc Science",                universityId: uniMap["University of Otago"],            level: "Masters",   tuitionPerYear: 31000 },
  ];
  for (const p of programs) {
    const exists = await prisma.program.findFirst({ where: { programName: p.programName, universityId: p.universityId } });
    if (!exists) await prisma.program.create({ data: p });
  }
  console.log("✔  Programs seeded:", programs.length);

  // ─── 7. Comprehensive Scholarships ────────────────────────
  const scholarships = [
    // United States
    { scholarshipName: "Fulbright Scholarship",      countryId: countryMap["United States"],  eligibilityCriteria: "GPA > 3.5, English fluency", amount: 50000, applyLink: "https://fulbright.org" },
    { scholarshipName: "Hubert Humphrey Fellowship", countryId: countryMap["United States"],  eligibilityCriteria: "Professional experience", amount: 35000, applyLink: "https://www.humphreyfellowship.org" },
    { scholarshipName: "Clinton Foundation", countryId: countryMap["United States"],  eligibilityCriteria: "Innovation and leadership", amount: 40000, applyLink: "https://www.clintonfoundation.org" },
    { scholarshipName: "USIA Scholarship",   countryId: countryMap["United States"],  eligibilityCriteria: "Diplomatic relations", amount: 45000, applyLink: "https://state.gov" },
    
    // United Kingdom
    { scholarshipName: "Chevening Scholarship",      countryId: countryMap["United Kingdom"], eligibilityCriteria: "Leadership potential and academic merit", amount: 40000, applyLink: "https://chevening.org" },
    { scholarshipName: "Marshall Scholarship",       countryId: countryMap["United Kingdom"], eligibilityCriteria: "US citizens, British ties", amount: 45000, applyLink: "https://marshallscholarship.org" },
    { scholarshipName: "Commonwealth Scholarship",   countryId: countryMap["United Kingdom"], eligibilityCriteria: "Commonwealth citizens", amount: 55000, applyLink: "https://www.afd.fr" },
    { scholarshipName: "Erasmus Mundus",             countryId: countryMap["United Kingdom"], eligibilityCriteria: "EU students primarily", amount: 35000, applyLink: "https://erasmusplusproject.eu" },
    { scholarshipName: "British Council Scholarship", countryId: countryMap["United Kingdom"], eligibilityCriteria: "Academic excellence", amount: 30000, applyLink: "https://britishcouncil.org" },
    
    // Canada
    { scholarshipName: "Vanier Canada Graduate",     countryId: countryMap["Canada"],         eligibilityCriteria: "Research excellence and leadership", amount: 50000, applyLink: "https://vanier.gc.ca" },
    { scholarshipName: "Trudeau Scholarship",        countryId: countryMap["Canada"],         eligibilityCriteria: "Research and intellectual leadership", amount: 60000, applyLink: "https://trudeaufoundation.ca" },
    { scholarshipName: "SSHRC Scholarship",          countryId: countryMap["Canada"],         eligibilityCriteria: "Social sciences research", amount: 35000, applyLink: "https://sshrc.gc.ca" },
    { scholarshipName: "NSERC Scholarship",          countryId: countryMap["Canada"],         eligibilityCriteria: "Natural sciences research", amount: 38000, applyLink: "https://nserc.gc.ca" },
    { scholarshipName: "Mitacs Globalink",             countryId: countryMap["Canada"],         eligibilityCriteria: "International internship", amount: 15000, applyLink: "https://mitacs.ca" },
    
    // Germany
    { scholarshipName: "DAAD Scholarship",           countryId: countryMap["Germany"],        eligibilityCriteria: "CGPA > 3.0, German language", amount: 15000, applyLink: "https://daad.de" },
    { scholarshipName: "German Academic Exchange",   countryId: countryMap["Germany"],        eligibilityCriteria: "Academic merit",  amount: 18000, applyLink: "https://daad-alumni.de" },
    { scholarshipName: "Friedrich Ebert Foundation", countryId: countryMap["Germany"],        eligibilityCriteria: "Social commitment and merit", amount: 16000, applyLink: "https://fes.de" },
    { scholarshipName: "Konrad Adenauer Foundation", countryId: countryMap["Germany"],        eligibilityCriteria: "Democracy and values", amount: 17000, applyLink: "https://kas.de" },
    
    // France
    { scholarshipName: "Eiffel Scholarship",         countryId: countryMap["France"],         eligibilityCriteria: "Academic excellence", amount: 25000, applyLink: "https://campusfrance.org" },
    { scholarshipName: "French Government Scholarship", countryId: countryMap["France"],     eligibilityCriteria: "French proficiency", amount: 20000, applyLink: "https://www.diplomatie.gouv.fr" },
    { scholarshipName: "Erasmus Mundus France",      countryId: countryMap["France"],         eligibilityCriteria: "EU cooperation", amount: 22000, applyLink: "https://erasmusplusproject.eu" },
    
    // Netherlands
    { scholarshipName: "Holland Scholarship",        countryId: countryMap["Netherlands"],    eligibilityCriteria: "International students", amount: 10000, applyLink: "https://hollandscholarship.nl" },
    { scholarshipName: "Delft Fellowship",           countryId: countryMap["Netherlands"],    eligibilityCriteria: "Excellent academics", amount: 20000, applyLink: "https://tudelft.nl" },
    { scholarshipName: "Nuffic Huygens Scholarship", countryId: countryMap["Netherlands"],    eligibilityCriteria: "Developing country citizens", amount: 18000, applyLink: "https://nuffic.nl" },
    
    // Switzerland
    { scholarshipName: "Swiss Government Scholarship", countryId: countryMap["Switzerland"],  eligibilityCriteria: "Academic excellence", amount: 25000, applyLink: "https://sbfi.admin.ch" },
    { scholarshipName: "ETH Excellence Scholarship", countryId: countryMap["Switzerland"],    eligibilityCriteria: "Outstanding potential", amount: 30000, applyLink: "https://ethz.ch" },
    
    // Sweden
    { scholarshipName: "Swedish Institute Scholarship", countryId: countryMap["Sweden"],       eligibilityCriteria: "Leadership and merit", amount: 20000, applyLink: "https://si.se" },
    
    // Spain
    { scholarshipName: "Carlos III Scholarship",    countryId: countryMap["Spain"],          eligibilityCriteria: "Research excellence", amount: 15000, applyLink: "https://uc3m.es" },
    
    // Italy
    { scholarshipName: "Italian Government Scholarship", countryId: countryMap["Italy"],     eligibilityCriteria: "Italian connection", amount: 12000, applyLink: "https://invest-italy.com" },
    
    // Australia
    { scholarshipName: "Australia Awards",           countryId: countryMap["Australia"],       eligibilityCriteria: "Developing country citizen", amount: 35000, applyLink: "https://australiaawards.gov.au" },
    { scholarshipName: "Endeavour Scholarship",      countryId: countryMap["Australia"],       eligibilityCriteria: "International students", amount: 25000, applyLink: "https://endeavour.education.gov.au" },
    { scholarshipName: "University of Melbourne Fellowship", countryId: countryMap["Australia"], eligibilityCriteria: "Academic merit", amount: 30000, applyLink: "https://unimelb.edu.au" },
    { scholarshipName: "ANU Research Scholarship",   countryId: countryMap["Australia"],       eligibilityCriteria: "Research potential", amount: 32000, applyLink: "https://anu.edu.au" },
    
    // Japan
    { scholarshipName: "MEXT Scholarship",           countryId: countryMap["Japan"],          eligibilityCriteria: "Under 35 years, academic merit", amount: 12000, applyLink: "https://mext.go.jp" },
    { scholarshipName: "Monbukagakusho Scholarship", countryId: countryMap["Japan"],          eligibilityCriteria: "Japanese cultural interest", amount: 11000, applyLink: "https://www.studychapan.go.jp" },
    { scholarshipName: "AFS Japan Scholarship",      countryId: countryMap["Japan"],          eligibilityCriteria: "Cultural exchange", amount: 10000, applyLink: "https://afs.org/japan" },
    
    // Singapore
    { scholarshipName: "Singapore Government Scholarship", countryId: countryMap["Singapore"],  eligibilityCriteria: "Academic excellence", amount: 28000, applyLink: "https://moe.gov.sg" },
    { scholarshipName: "NUS Scholarship",            countryId: countryMap["Singapore"],      eligibilityCriteria: "Academic merit", amount: 26000, applyLink: "https://nus.edu.sg" },
    
    // South Korea
    { scholarshipName: "Korean Government Scholarship (KGSP)", countryId: countryMap["South Korea"], eligibilityCriteria: "Academic excellence", amount: 22000, applyLink: "https://www.niied.go.kr" },
    { scholarshipName: "Seoul National University Scholarship", countryId: countryMap["South Korea"], eligibilityCriteria: "Merit-based", amount: 20000, applyLink: "https://snu.ac.kr" },
    
    // China
    { scholarshipName: "Chinese Government Scholarship (CSC)", countryId: countryMap["China"],  eligibilityCriteria: "Academic merit", amount: 8000, applyLink: "https://www.campuschina.org" },
    { scholarshipName: "Tsinghua Scholarship",       countryId: countryMap["China"],          eligibilityCriteria: "Excellence in studies", amount: 9000, applyLink: "https://tsinghua.edu.cn" },
    
    // India
    { scholarshipName: "Indian Council for Cultural Relations", countryId: countryMap["India"], eligibilityCriteria: "Bilateral relations", amount: 8000, applyLink: "https://iccr.gov.in" },
    { scholarshipName: "ICCR Merit Scholarship",     countryId: countryMap["India"],          eligibilityCriteria: "Academic excellence", amount: 7500, applyLink: "https://iccr.gov.in" },
    
    // New Zealand
    { scholarshipName: "New Zealand Aid Scholarship", countryId: countryMap["New Zealand"],    eligibilityCriteria: "Development assistance", amount: 32000, applyLink: "https://beehive.govt.nz" },
    { scholarshipName: "University of Auckland Scholarship", countryId: countryMap["New Zealand"], eligibilityCriteria: "Academic merit", amount: 28000, applyLink: "https://auckland.ac.nz" },
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
