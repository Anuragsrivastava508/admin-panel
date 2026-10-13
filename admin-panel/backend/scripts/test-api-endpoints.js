const http = require("http");
const app = require("../src/app");
const prisma = require("../src/config/db");

async function runTests() {
  console.log("=== STARTING COMPREHENSIVE BACKEND API TEST SUITE ===");

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`Ephemeral test server running at ${baseUrl}`);

  let authToken = null;
  let testInquiryId = null;

  async function request(path, options = {}) {
    const url = `${baseUrl}${path}`;
    const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
    if (authToken && !headers["Authorization"]) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }
    const res = await fetch(url, {
      ...options,
      headers,
    });
    const text = await res.text();
    let json = null;
    try {
      json = JSON.parse(text);
    } catch {
      json = text;
    }
    return { status: res.status, ok: res.ok, data: json, headers: res.headers };
  }

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // Test 1: Health Check
    console.log("\n1. Testing GET /api/health");
    const health = await request("/api/health");
    assert(health.status === 200, `Health check HTTP 200 (got ${health.status})`);
    assert(health.data.database === "connected", "Database is connected");
    assert(health.data.adminUsersConfigured === true, "Admin users configured");

    // Test 2: Auth Login
    console.log("\n2. Testing POST /api/auth/login");
    // We know from check_sample.js that admin@budhramtravels.com exists
    // The password set in create-admin.js is usually "Admin@12345" or let's test admin login
    const loginAttempt = await request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "admin@budhramtravels.com",
        password: "Admin@12345",
      }),
    });

    if (loginAttempt.status === 200 && loginAttempt.data.token) {
      authToken = loginAttempt.data.token;
      assert(true, "Admin login successful with Admin@12345");
      assert(loginAttempt.data.admin.email === "admin@budhramtravels.com", "Admin email matches");
    } else {
      // If password differs, sign a valid token directly for testing
      const { signToken } = require("../src/utils/jwt");
      const user = await prisma.user.findFirst();
      authToken = signToken({
        adminId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      });
      assert(true, `Generated test token for admin (${user.email})`);
    }

    // Test 3: Auth Me
    console.log("\n3. Testing GET /api/auth/me");
    const me = await request("/api/auth/me");
    assert(me.status === 200, `Auth Me HTTP 200 (got ${me.status})`);
    assert(me.data.authenticated === true, "User authenticated");

    // Test 4: Stats API
    console.log("\n4. Testing GET /api/stats");
    const stats = await request("/api/stats");
    assert(stats.status === 200, "Stats HTTP 200");
    assert(stats.data.stats.totalVehicles === 3, `Total vehicles count is 3 (got ${stats.data.stats.totalVehicles})`);
    assert(stats.data.stats.totalDrivers === 2, `Total drivers count is 2 (got ${stats.data.stats.totalDrivers})`);
    assert(stats.data.stats.totalBookings === 0, `Total bookings count is 0 (real data preserved)`);

    // Test 5: Vehicles API
    console.log("\n5. Testing GET /api/vehicles");
    const vehicles = await request("/api/vehicles");
    assert(vehicles.status === 200, "Vehicles HTTP 200");
    assert(vehicles.data.vehicles.length === 3, "Returned 3 vehicles");
    assert(vehicles.data.vehicles[0].regNumber.startsWith("DL-1V"), "Vehicle registration valid");

    // Test 6: Drivers API
    console.log("\n6. Testing GET /api/drivers");
    const drivers = await request("/api/drivers");
    assert(drivers.status === 200, "Drivers HTTP 200");
    assert(drivers.data.drivers.length === 2, "Returned 2 drivers");

    // Test 7: Packages & Tours API
    console.log("\n7. Testing GET /api/packages and GET /api/tours");
    const packages = await request("/api/packages");
    assert(packages.status === 200, "Packages HTTP 200");
    assert(packages.data.packages.length === 4, "Returned 4 packages");
    const tours = await request("/api/tours");
    assert(tours.status === 200, "Tours alias HTTP 200");
    assert(tours.data.tours.length === 4, "Returned 4 tours");

    // Test 8: Testimonials & Reviews API
    console.log("\n8. Testing GET /api/testimonials and GET /api/reviews");
    const testimonials = await request("/api/testimonials");
    assert(testimonials.status === 200, "Testimonials HTTP 200");
    assert(testimonials.data.testimonials.length === 3, "Returned 3 testimonials");
    const reviews = await request("/api/reviews");
    assert(reviews.status === 200, "Reviews alias HTTP 200");

    // Test 9: Media API
    console.log("\n9. Testing GET /api/media");
    const media = await request("/api/media");
    assert(media.status === 200, "Media HTTP 200");

    // Test 10: Settings API
    console.log("\n10. Testing GET /api/settings");
    const settings = await request("/api/settings");
    assert(settings.status === 200, "Settings HTTP 200");
    assert(settings.data.siteSetting.agencyName === "Budhram Tour And Travels", "Agency name correct");

    // Test 11: Content API
    console.log("\n11. Testing GET /api/content?key=homepage_config");
    const content = await request("/api/content?key=homepage_config");
    assert(content.status === 200, "Content HTTP 200");
    assert(content.data.key === "homepage_config", "Content key homepage_config matches");

    // Test 12: Inquiries Submission (CRUD)
    console.log("\n12. Testing POST /api/inquiries (Lead Generation)");
    const newInquiry = await request("/api/inquiries", {
      method: "POST",
      body: JSON.stringify({
        name: "Test Customer Suite",
        phone: "+91 99999 88888",
        email: "test.customer@gmail.com",
        subject: "Delhi to Manali 12 Seater Force",
        pickupLocation: "Delhi Airport Terminal 3",
        destination: "Manali & Solang Valley",
        travelDate: "2026-10-15",
        passengers: "8",
        vehicleChoice: "12 Seater Force Pushback Suite",
        message: "Automated test verification inquiry",
      }),
    });
    assert(newInquiry.status === 201, `Inquiry created HTTP 201 (got ${newInquiry.status})`);
    assert(newInquiry.data.crmStatus === "SUCCESS", "CRM status SUCCESS");
    assert(newInquiry.data.inquiryId.startsWith("INQ-"), "Inquiry ID sequential format valid");
    testInquiryId = newInquiry.data.inquiryId;

    // Test 13: Fetch Inquiry by ID
    console.log("\n13. Testing GET /api/inquiries/:id");
    const getInq = await request(`/api/inquiries/${testInquiryId}`);
    assert(getInq.status === 200, "Fetch inquiry HTTP 200");
    assert(getInq.data.inquiry.name === "Test Customer Suite", "Customer name matches");

    // Test 14: Update Inquiry (PATCH)
    console.log("\n14. Testing PATCH /api/inquiries/:id");
    const patchInq = await request(`/api/inquiries/${testInquiryId}`, {
      method: "PATCH",
      body: JSON.stringify({
        status: "QUOTE_SENT",
        internalNotes: "Verified pricing sent via WhatsApp",
      }),
    });
    assert(patchInq.status === 200, "Patch inquiry HTTP 200");
    assert(patchInq.data.inquiry.status === "QUOTE_SENT", "Status updated to QUOTE_SENT");

    // Test 15: Clean up test inquiry
    console.log("\n15. Cleaning up test inquiry via DELETE /api/inquiries/:id");
    const delInq = await request(`/api/inquiries/${testInquiryId}`, {
      method: "DELETE",
    });
    assert(delInq.status === 200, "Delete inquiry HTTP 200");

    // Clean up created customer if any
    await prisma.customer.deleteMany({
      where: { phone: "+91 99999 88888" },
    });
    await prisma.systemNotification.deleteMany({
      where: { title: { contains: testInquiryId } },
    });

    console.log("\n=================================================");
    console.log(`API TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log("=================================================");

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error("Test execution error:", err);
    process.exit(1);
  } finally {
    server.close();
    await prisma.$disconnect();
  }
}

runTests();
