require("dotenv").config({ path: ".env.local" });
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Checking and migrating Enquiry table columns...");
  
  // Check existing columns using PRAGMA
  const columns = await prisma.$queryRawUnsafe(`PRAGMA table_info(enquiries);`);
  const colNames = columns.map(c => c.name);
  console.log("Existing columns:", colNames);

  if (!colNames.includes("subject")) {
    console.log("Adding column 'subject'...");
    await prisma.$executeRawUnsafe(`ALTER TABLE enquiries ADD COLUMN subject TEXT;`);
  }
  if (!colNames.includes("whatsappStatus")) {
    console.log("Adding column 'whatsappStatus'...");
    await prisma.$executeRawUnsafe(`ALTER TABLE enquiries ADD COLUMN whatsappStatus TEXT DEFAULT 'PENDING';`);
  }
  if (!colNames.includes("crmStatus")) {
    console.log("Adding column 'crmStatus'...");
    await prisma.$executeRawUnsafe(`ALTER TABLE enquiries ADD COLUMN crmStatus TEXT DEFAULT 'SUCCESS';`);
  }

  const updatedCols = await prisma.$queryRawUnsafe(`PRAGMA table_info(enquiries);`);
  console.log("Updated columns:", updatedCols.map(c => c.name));
  console.log("Migration complete!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
