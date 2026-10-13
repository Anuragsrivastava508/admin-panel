async function runE2ETests() {
  console.log("=== END-TO-END VERIFICATION: FRONTEND (PORT 3000) -> BACKEND (PORT 5000) ===");

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
    // 1. Check API proxy through frontend port 3000
    console.log("\n1. Testing Frontend /api/health Proxy (http://localhost:3000/api/health)");
    const healthRes = await fetch("http://localhost:3000/api/health");
    const healthJson = await healthRes.json();
    assert(healthRes.status === 200, `Frontend proxies /api/health to Express backend (HTTP 200)`);
    assert(healthJson.service === "Budhram Tour & Travels Node.js REST API", `Service name confirms Express backend`);
    assert(healthJson.database === "connected", `Database connection status is connected`);

    // 2. Check /login page rendering
    console.log("\n2. Testing Frontend Login Page (http://localhost:3000/login)");
    const loginPageRes = await fetch("http://localhost:3000/login");
    const loginHtml = await loginPageRes.text();
    assert(loginPageRes.status === 200, `Login page returns HTTP 200`);
    assert(loginHtml.includes("BUDHRAM TOUR"), `Login page contains Budhram Tour branding`);
    assert(loginHtml.includes("Honest KM Meter Dispatch System"), `Login page contains dispatch badge`);

    // 3. Check Unauthenticated Dashboard Redirect
    console.log("\n3. Testing Protected Dashboard Route (http://localhost:3000/ without cookie)");
    const unauthRes = await fetch("http://localhost:3000/", { redirect: "manual" });
    assert(unauthRes.status === 307 || unauthRes.status === 302, `Unauthenticated user redirected (Status: ${unauthRes.status})`);
    const location = unauthRes.headers.get("location");
    assert(location && location.includes("/login"), `Redirect destination is /login (got: ${location})`);

    // 4. Test Login through Frontend Proxy
    console.log("\n4. Testing Admin Login via Frontend Proxy (http://localhost:3000/api/auth/login)");
    const loginApiRes = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@budhramtravels.com",
        password: "Admin@12345",
      }),
    });
    const loginData = await loginApiRes.json();
    assert(loginApiRes.status === 200, `Login API through port 3000 returns HTTP 200`);
    assert(loginData.success === true, `Login returns success: true`);
    assert(loginData.admin.name === "Budhram Operations Lead", `Admin profile returned: ${loginData.admin.name}`);
    const token = loginData.token;
    assert(!!token, `JWT token received`);

    // 5. Test Accessing Dashboard with Auth Cookie
    console.log("\n5. Testing Protected Dashboard with Cookie (http://localhost:3000/ with budhram_admin_session)");
    const authPageRes = await fetch("http://localhost:3000/", {
      headers: {
        Cookie: `budhram_admin_session=${token}`,
      },
    });
    const authPageHtml = await authPageRes.text();
    assert(authPageRes.status === 200, `Dashboard loads with valid cookie (HTTP 200)`);
    assert(authPageHtml.includes("BUDHRAM") || authPageHtml.includes("Tour"), `Dashboard contains Admin Portal markup`);

    // 6. Test Stats Proxy
    console.log("\n6. Testing /api/stats via Frontend Proxy");
    const statsRes = await fetch("http://localhost:3000/api/stats", {
      headers: {
        Cookie: `budhram_admin_session=${token}`,
      },
    });
    const statsJson = await statsRes.json();
    assert(statsRes.status === 200, `/api/stats returns HTTP 200`);
    assert(statsJson.stats.totalVehicles === 3, `Stats total vehicles is 3 (got: ${statsJson.stats.totalVehicles})`);
    assert(statsJson.stats.totalDrivers === 2, `Stats total drivers is 2 (got: ${statsJson.stats.totalDrivers})`);
    assert(statsJson.stats.totalBookings === 0, `Stats total bookings is 0 (real data intact)`);

    // 7. Test Vehicles Proxy
    console.log("\n7. Testing /api/vehicles via Frontend Proxy");
    const vehiclesRes = await fetch("http://localhost:3000/api/vehicles");
    const vehiclesJson = await vehiclesRes.json();
    assert(vehiclesRes.status === 200, `/api/vehicles returns HTTP 200`);
    assert(vehiclesJson.vehicles.length === 3, `Vehicles count is 3`);

    // 8. Test Packages Proxy
    console.log("\n8. Testing /api/packages via Frontend Proxy");
    const packagesRes = await fetch("http://localhost:3000/api/packages");
    const packagesJson = await packagesRes.json();
    assert(packagesRes.status === 200, `/api/packages returns HTTP 200`);
    assert(packagesJson.packages.length === 4, `Packages count is 4`);

    // 9. Test CMS Content Proxy
    console.log("\n9. Testing /api/content?key=homepage_config via Frontend Proxy");
    const contentRes = await fetch("http://localhost:3000/api/content?key=homepage_config");
    const contentJson = await contentRes.json();
    assert(contentRes.status === 200, `/api/content returns HTTP 200`);
    assert(contentJson.key === "homepage_config", `Content key is homepage_config`);

    // 10. Test Bookings Proxy
    console.log("\n10. Testing /api/bookings via Frontend Proxy");
    const bookingsRes = await fetch("http://localhost:3000/api/bookings", {
      headers: {
        Cookie: `budhram_admin_session=${token}`,
      },
    });
    const bookingsJson = await bookingsRes.json();
    assert(bookingsRes.status === 200, `/api/bookings returns HTTP 200`);
    assert(Array.isArray(bookingsJson.bookings), `Bookings array returned`);

    console.log("\n=================================================");
    console.log(`END-TO-END TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log("=================================================");

    if (failed > 0) process.exit(1);
    process.exit(0);
  } catch (error) {
    console.error("E2E Test Failure:", error);
    process.exit(1);
  }
}

runE2ETests();
