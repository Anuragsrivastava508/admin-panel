require("dotenv").config({ path: ".env.local" });
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const ADMIN_URL = "http://localhost:3001";
const WEBSITE_URL = "http://localhost:3000";

async function runE2ESuite() {
  console.log("======================================================================");
  console.log("   BUDHRAM TOUR & TRAVELS — LIVE INQUIRY INTEGRATION TEST SUITE (8 TESTS)");
  console.log("======================================================================\n");

  const results = [];
  let testInquiryId = "";
  const uniqueTimestamp = Date.now().toString().slice(-4);
  const testPhone = `+91 98765 4${uniqueTimestamp}`;
  const testEmail = `rahul.test${uniqueTimestamp}@gmail.com`;

  // TEST 1 & 2: Submit inquiry via API and verify API Response
  try {
    const payload = {
      name: "Rahul Sharma",
      phone: testPhone,
      email: testEmail,
      subject: "Chardham Yatra Circuit",
      service: "Chardham Yatra Circuit",
      pickupLocation: "Delhi Airport T3",
      destination: "Delhi → Haridwar → Rishikesh → Badrinath",
      destinationCircuit: "Delhi → Haridwar → Rishikesh → Badrinath",
      travelDate: "2026-10-15",
      passengers: "12 Persons",
      persons: "12 Persons",
      vehicleChoice: "12 Seater Luxury Force Urbania Pushback",
      message: "Need mountain-experienced driver and pushback recliners for senior citizens.",
      source: "website",
    };

    const res = await fetch(`${ADMIN_URL}/api/inquiries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (res.status === 201 && data.success && data.inquiryId && data.message === "Inquiry submitted successfully") {
      testInquiryId = data.inquiryId;
      results.push({
        num: 1,
        title: "Test 1 & 2: Submit Website Inquiry & Verify Standard API Response",
        status: "PASSED",
        details: `HTTP ${res.status} | Created ID: ${data.inquiryId} | Message: "${data.message}" | CRM: ${data.crmStatus}`,
      });
    } else {
      results.push({
        num: 1,
        title: "Test 1 & 2: Submit Website Inquiry & Verify Standard API Response",
        status: "FAILED",
        details: `HTTP ${res.status} | ${JSON.stringify(data)}`,
      });
    }
  } catch (err) {
    results.push({
      num: 1,
      title: "Test 1 & 2: Submit Website Inquiry & Verify Standard API Response",
      status: "FAILED",
      details: err.message,
    });
  }

  // TEST 3: Verify inquiry exists in Prisma / SQLite Database
  try {
    const dbRecord = await prisma.enquiry.findUnique({
      where: { id: testInquiryId },
    });

    if (dbRecord && dbRecord.id === testInquiryId && dbRecord.name === "Rahul Sharma") {
      results.push({
        num: 3,
        title: "Test 3: Verify Inquiry Exists in Prisma/SQLite Single Source of Truth",
        status: "PASSED",
        details: `Found record #${dbRecord.id} in dev.db. Customer: ${dbRecord.name}, Phone: ${dbRecord.phone}, TravelDate: ${dbRecord.travelDate.toISOString()}`,
      });
    } else {
      results.push({
        num: 3,
        title: "Test 3: Verify Inquiry Exists in Prisma/SQLite Single Source of Truth",
        status: "FAILED",
        details: `Record ${testInquiryId} not found in database`,
      });
    }
  } catch (err) {
    results.push({
      num: 3,
      title: "Test 3: Verify Inquiry Exists in Prisma/SQLite Single Source of Truth",
      status: "FAILED",
      details: err.message,
    });
  }

  // ADMIN AUTHENTICATION (Requirement 14: Admin operations require auth)
  let adminToken = "";
  try {
    const loginRes = await fetch(`${ADMIN_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@budhramtravels.com", password: "Admin@12345" }),
    });
    const loginData = await loginRes.json();
    if (loginRes.ok && loginData.token) {
      adminToken = loginData.token;
    }
  } catch (err) {
    console.warn("Could not log in as admin:", err.message);
  }

  // TEST 4: Fetch via GET /api/inquiries (Simulating Admin Dashboard /enquiries view)
  let adminRecord = null;
  try {
    const adminRes = await fetch(`${ADMIN_URL}/api/inquiries?search=${encodeURIComponent(testInquiryId)}`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
        Cookie: `budhram_admin_session=${adminToken}`,
      },
    });
    const adminData = await adminRes.json();
    adminRecord = (adminData.inquiries || []).find((i) => i.id === testInquiryId);

    if (adminRes.ok && adminRecord) {
      results.push({
        num: 4,
        title: "Test 4: Admin Dashboard /enquiries API Fetches Saved Website Inquiry",
        status: "PASSED",
        details: `Retrieved #${adminRecord.id} via Admin API (Auth Protected). Name: ${adminRecord.name}`,
      });
    } else {
      results.push({
        num: 4,
        title: "Test 4: Admin Dashboard /enquiries API Fetches Saved Website Inquiry",
        status: "FAILED",
        details: `Could not retrieve #${testInquiryId} from Admin API. HTTP Status: ${adminRes.status}`,
      });
    }
  } catch (err) {
    results.push({
      num: 4,
      title: "Test 4: Admin Dashboard /enquiries API Fetches Saved Website Inquiry",
      status: "FAILED",
      details: err.message,
    });
  }

  // TEST 5: Verify Status = NEW and Source = Website
  try {
    if (adminRecord && adminRecord.status === "NEW" && (adminRecord.source === "website" || adminRecord.source === "Website")) {
      results.push({
        num: 5,
        title: "Test 5: Verify Default CRM Status = 'NEW' & Source = 'website'",
        status: "PASSED",
        details: `Status: "${adminRecord.status}" | Source: "${adminRecord.source}" (Displays: 🌐 Website)`,
      });
    } else {
      results.push({
        num: 5,
        title: "Test 5: Verify Default CRM Status = 'NEW' & Source = 'website'",
        status: "FAILED",
        details: `Expected status="NEW", source="website". Got: status="${adminRecord?.status}", source="${adminRecord?.source}"`,
      });
    }
  } catch (err) {
    results.push({
      num: 5,
      title: "Test 5: Verify Default CRM Status = 'NEW' & Source = 'website'",
      status: "FAILED",
      details: err.message,
    });
  }

  // TEST 6: Change status NEW -> CONTACTED and verify it persists
  try {
    const patchRes = await fetch(`${ADMIN_URL}/api/inquiries/${testInquiryId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
        Cookie: `budhram_admin_session=${adminToken}`,
      },
      body: JSON.stringify({ status: "CONTACTED", internalNotes: "Chauffeur assigned for Delhi-Haridwar leg." }),
    });
    const patchData = await patchRes.json();

    // Verify persistence directly in database
    const refreshed = await prisma.enquiry.findUnique({ where: { id: testInquiryId } });
    if (patchRes.ok && refreshed && refreshed.status === "CONTACTED") {
      results.push({
        num: 6,
        title: "Test 6: Status Lifecycle Update (NEW → CONTACTED) Persists in Database",
        status: "PASSED",
        details: `Successfully transitioned to "${refreshed.status}". Notes: "${refreshed.internalNotes}"`,
      });
    } else {
      results.push({
        num: 6,
        title: "Test 6: Status Lifecycle Update (NEW → CONTACTED) Persists in Database",
        status: "FAILED",
        details: `Failed to update status. Current DB status: ${refreshed?.status}`,
      });
    }
  } catch (err) {
    results.push({
      num: 6,
      title: "Test 6: Status Lifecycle Update (NEW → CONTACTED) Persists in Database",
      status: "FAILED",
      details: err.message,
    });
  }

  // TEST 7: WhatsApp Notification Behavior (Decoupled, never causes data loss)
  try {
    const dbRecord = await prisma.enquiry.findUnique({ where: { id: testInquiryId } });
    // WhatsApp status will be "SENT" if credentials set, or "FAILED" / "SIMULATED" if mock/missing
    // In both cases, the DB record is preserved with crmStatus="SUCCESS"
    if (dbRecord && dbRecord.crmStatus === "SUCCESS" && ["SENT", "FAILED", "PENDING", "SIMULATED"].includes(dbRecord.whatsappStatus)) {
      results.push({
        num: 7,
        title: "Test 7: WhatsApp Error Decoupling & Admin Notification Resilience",
        status: "PASSED",
        details: `crmStatus: "${dbRecord.crmStatus}" | whatsappStatus: "${dbRecord.whatsappStatus}". Zero data loss verified.`,
      });
    } else {
      results.push({
        num: 7,
        title: "Test 7: WhatsApp Error Decoupling & Admin Notification Resilience",
        status: "FAILED",
        details: `Unexpected crmStatus or whatsappStatus: ${JSON.stringify(dbRecord)}`,
      });
    }
  } catch (err) {
    results.push({
      num: 7,
      title: "Test 7: WhatsApp Error Decoupling & Admin Notification Resilience",
      status: "FAILED",
      details: err.message,
    });
  }

  // TEST 8: Rapid Double-Submission Idempotency Check
  try {
    const duplicatePayload = {
      name: "Rahul Sharma",
      phone: testPhone,
      email: testEmail,
      subject: "Chardham Yatra Circuit",
      service: "Chardham Yatra Circuit",
      pickupLocation: "Delhi Airport T3",
      destination: "Delhi → Haridwar → Rishikesh → Badrinath",
      destinationCircuit: "Delhi → Haridwar → Rishikesh → Badrinath",
      travelDate: "2026-10-15",
      passengers: "12 Persons",
      vehicleChoice: "12 Seater Luxury Force Urbania Pushback",
      message: "Duplicate rapid submit check",
      source: "website",
    };

    const dupRes = await fetch(`${ADMIN_URL}/api/inquiries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(duplicatePayload),
    });

    const dupData = await dupRes.json();
    if (dupRes.ok && dupData.inquiryId === testInquiryId) {
      results.push({
        num: 8,
        title: "Test 8: Rapid Double-Submission Debounce & Idempotency Protection",
        status: "PASSED",
        details: `Idempotent response detected. Returned existing inquiry #${dupData.inquiryId} without creating duplicate record.`,
      });
    } else {
      results.push({
        num: 8,
        title: "Test 8: Rapid Double-Submission Debounce & Idempotency Protection",
        status: "FAILED",
        details: `Created new duplicate ID: ${dupData.inquiryId} instead of reusing ${testInquiryId}`,
      });
    }
  } catch (err) {
    results.push({
      num: 8,
      title: "Test 8: Rapid Double-Submission Debounce & Idempotency Protection",
      status: "FAILED",
      details: err.message,
    });
  }

  // Summary
  console.log("==================== TEST SUITE EXECUTION RESULTS ====================");
  let passedCount = 0;
  for (const r of results) {
    const mark = r.status === "PASSED" ? "[✓] PASSED" : "[✗] FAILED";
    if (r.status === "PASSED") passedCount++;
    console.log(`${mark} | ${r.title}`);
    console.log(`    ↳ ${r.details}\n`);
  }

  const [totalInquiries, newInquiries, contactedInquiries] = await Promise.all([
    prisma.enquiry.count(),
    prisma.enquiry.count({ where: { status: "NEW" } }),
    prisma.enquiry.count({ where: { status: "CONTACTED" } }),
  ]);

  console.log("==================== REAL DATABASE VERIFICATION ====================");
  console.log(`Total Inquiries in CRM:     ${totalInquiries}`);
  console.log(`New (Unread) Inquiries:    ${newInquiries}`);
  console.log(`Contacted Inquiries:        ${contactedInquiries}`);
  console.log(`Tests Passed:               ${passedCount} / ${results.length}`);
  console.log("=====================================================================\n");
}

runE2ESuite()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
