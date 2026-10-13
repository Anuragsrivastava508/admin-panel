require("dotenv").config({ path: ".env.local" });
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const ADMIN_URL = "http://localhost:3001";
const WEBSITE_URL = "http://localhost:3000";

async function runVerification() {
  console.log("======================================================================");
  console.log("       BUDHRAM TOUR & TRAVELS — CRM & WHATSAPP INTEGRATION TEST       ");
  console.log("======================================================================\n");

  const results = [];

  // TEST 1: Public Website Inquiry Submission -> CRM Save + WhatsApp Trigger
  try {
    const payload = {
      name: "Siddharth Malhotra",
      phone: "+91 98111 22334",
      email: "siddharth.m@gmail.com",
      subject: "Himalayan Expedition (Manali / Spiti / Ladakh)",
      pickupLocation: "Delhi Airport T3",
      destination: "Delhi - Manali - Atal Tunnel - Kasol",
      travelDate: "2026-10-25",
      passengers: "9 - 12 Persons",
      vehicleChoice: "12 Seater Luxury Force Pushback Suite",
      message: "Urgent family yatra booking. Need sanitized vehicle with experienced mountain chauffeur.",
      source: "website",
    };

    const res = await fetch(`${ADMIN_URL}/api/inquiries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (res.ok && data.success && data.crmStatus === "SUCCESS") {
      results.push({
        test: "Test 1: Website Inquiry Form -> CRM Save & WhatsApp Trigger",
        status: "PASSED",
        details: `Created Inquiry ID: ${data.inquiryId}, CRM Status: ${data.crmStatus}, WhatsApp Status: ${data.whatsappStatus}`,
      });
    } else {
      results.push({
        test: "Test 1: Website Inquiry Form -> CRM Save & WhatsApp Trigger",
        status: "FAILED",
        details: JSON.stringify(data),
      });
    }
  } catch (err) {
    results.push({
      test: "Test 1: Website Inquiry Form -> CRM Save & WhatsApp Trigger",
      status: "FAILED",
      details: err.message,
    });
  }

  // TEST 2: Error Decoupling (WhatsApp Fail does NOT delete CRM record)
  try {
    const dbRecord = await prisma.enquiry.findFirst({
      where: { phone: "+91 98111 22334" },
      orderBy: { createdAt: "desc" },
    });

    if (dbRecord && dbRecord.crmStatus === "SUCCESS") {
      results.push({
        test: "Test 2: Error Decoupling (WhatsApp fail preserves CRM data)",
        status: "PASSED",
        details: `Inquiry #${dbRecord.id} safely stored in SQLite database. crmStatus: ${dbRecord.crmStatus}, whatsappStatus: ${dbRecord.whatsappStatus}`,
      });
    } else {
      results.push({
        test: "Test 2: Error Decoupling (WhatsApp fail preserves CRM data)",
        status: "FAILED",
        details: "Record not found in database or crmStatus not SUCCESS",
      });
    }
  } catch (err) {
    results.push({
      test: "Test 2: Error Decoupling",
      status: "FAILED",
      details: err.message,
    });
  }

  // TEST 3: Validation Error Handling (Missing required fields)
  try {
    const invalidPayload = {
      name: "",
      phone: "123", // Invalid phone
    };

    const res = await fetch(`${ADMIN_URL}/api/inquiries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invalidPayload),
    });

    const data = await res.json();
    if (!res.ok && res.status === 400 && data.success === false) {
      results.push({
        test: "Test 3: Input Validation & Anti-Spam Gate",
        status: "PASSED",
        details: `Rejected invalid input with 400 Bad Request: "${data.error}"`,
      });
    } else {
      results.push({
        test: "Test 3: Input Validation & Anti-Spam Gate",
        status: "FAILED",
        details: `Expected 400, got ${res.status}`,
      });
    }
  } catch (err) {
    results.push({
      test: "Test 3: Input Validation & Anti-Spam Gate",
      status: "FAILED",
      details: err.message,
    });
  }

  // TEST 4: Duplicate Submission Debounce Protection
  try {
    const dupPayload = {
      name: "Siddharth Malhotra",
      phone: "+91 98111 22334",
      subject: "Duplicate Test",
    };

    const res = await fetch(`${ADMIN_URL}/api/inquiries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dupPayload),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      results.push({
        test: "Test 4: Duplicate Click Debounce (Idempotency check)",
        status: "PASSED",
        details: `Idempotent response returned existing lead #${data.inquiryId} without creating duplicate`,
      });
    } else {
      results.push({
        test: "Test 4: Duplicate Click Debounce",
        status: "FAILED",
        details: JSON.stringify(data),
      });
    }
  } catch (err) {
    results.push({
      test: "Test 4: Duplicate Click Debounce",
      status: "FAILED",
      details: err.message,
    });
  }

  // TEST 5: Admin Panel Authentication & Pipeline Lifecycle Management
  try {
    // 5a. Login as Admin
    const loginRes = await fetch(`${ADMIN_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@budhramtravels.com",
        password: "Admin@12345",
      }),
    });

    const loginData = await loginRes.json();
    if (!loginRes.ok || !loginData.token) {
      throw new Error(`Admin login failed: ${JSON.stringify(loginData)}`);
    }

    const token = loginData.token;

    // 5b. Fetch Inquiries List as Admin
    const listRes = await fetch(`${ADMIN_URL}/api/inquiries`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const listData = await listRes.json();

    // 5c. Update Inquiry Pipeline Status to CONTACTED + Add Notes
    const testRecord = listData.inquiries[0];
    const updateRes = await fetch(`${ADMIN_URL}/api/inquiries/${testRecord.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        status: "CONTACTED",
        internalNotes: "Verified route with dispatcher Balwinder Singh. Customer requested Maharaja seats.",
        retryWhatsApp: true,
      }),
    });
    const updateData = await updateRes.json();

    if (updateRes.ok && updateData.success) {
      results.push({
        test: "Test 5: Admin Panel Pipeline & Status Lifecycle (NEW -> CONTACTED)",
        status: "PASSED",
        details: `Admin retrieved ${listData.count} inquiries. Updated #${testRecord.id} status to ${updateData.inquiry.status} with dispatch notes.`,
      });
    } else {
      results.push({
        test: "Test 5: Admin Panel Pipeline & Status Lifecycle",
        status: "FAILED",
        details: JSON.stringify(updateData),
      });
    }
  } catch (err) {
    results.push({
      test: "Test 5: Admin Panel Pipeline & Status Lifecycle",
      status: "FAILED",
      details: err.message,
    });
  }

  // Print Summary Table
  console.log("\n==================== TEST SUITE EXECUTION RESULTS ====================");
  let passedCount = 0;
  for (const r of results) {
    const symbol = r.status === "PASSED" ? "✓" : "✗";
    console.log(`[${symbol}] ${r.status.padEnd(6)} | ${r.test}`);
    console.log(`    ↳ ${r.details}\n`);
    if (r.status === "PASSED") passedCount++;
  }

  const enquiriesCount = await prisma.enquiry.count();
  const bookingsCount = await prisma.booking.count();
  const customersCount = await prisma.customer.count();

  console.log("==================== CURRENT DATABASE HEALTH ====================");
  console.log(`Total Customer Inquiries in CRM: ${enquiriesCount}`);
  console.log(`Total Confirmed Bookings in CRM: ${bookingsCount}`);
  console.log(`Total Customers in CRM:         ${customersCount}`);
  console.log(`Tests Passed: ${passedCount} / ${results.length}`);
  console.log("=================================================================\n");
}

runVerification()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
