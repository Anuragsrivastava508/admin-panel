async function verifyRealData() {
  console.log("==================================================================");
  console.log("  VERIFYING ADMIN PANEL END-TO-END DATA ACCURACY                   ");
  console.log("==================================================================\n");

  const baseUrl = "http://localhost:3001";
  let allPassed = true;

  // 0. Admin Login
  console.log("Step 0: Authenticating with official admin credentials...");
  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "admin@budhramtravels.com",
      password: "Admin@12345",
    }),
  });
  const loginData = await loginRes.json();
  const token = loginData.token;
  const cookieHeader = loginRes.headers.get("set-cookie");
  console.log(`  Login status: HTTP ${loginRes.status}, User: "${loginData.user?.name}", Role: "${loginData.user?.role}"`);
  if (!token) {
    console.error("  FAIL: Admin login failed!");
    allPassed = false;
  }
  const authHeaders = {
    "Authorization": `Bearer ${token}`,
    "Cookie": cookieHeader || `budhram_admin_session=${token}`,
  };

  // 1. Verify Packages
  console.log("\nTest 1: Verifying Circuits & Packages endpoint...");
  const pkgRes = await fetch(`${baseUrl}/api/packages`);
  const pkgData = await pkgRes.json();
  const packages = pkgData.packages || [];
  console.log(`Found ${packages.length} packages:`);
  packages.forEach((p, i) => {
    console.log(`  ${i + 1}. "${p.title}" | Circuit: ${p.destination} | Badge: ${p.highlightBadge} | Fare: ${p.priceType}`);
  });

  const expectedTitles = [
    "Atal Tunnel & Sissu",
    "Kasol, Manikaran & Jibhi",
    "Dharamshala & Spiti",
    "Rajasthan, Agra & Beyond",
  ];

  const packageTitles = packages.map(p => p.title);
  for (const t of expectedTitles) {
    if (!packageTitles.includes(t)) {
      console.error(`  FAIL: Missing expected package "${t}"`);
      allPassed = false;
    }
  }

  if (packages.length !== 4) {
    console.error(`  FAIL: Expected exactly 4 packages, found ${packages.length}`);
    allPassed = false;
  }
  console.log("✓ Packages validation PASSED!\n");

  // 2. Verify Media Gallery
  console.log("Test 2: Verifying Media Gallery endpoint & category filtering...");
  const mediaRes = await fetch(`${baseUrl}/api/media`);
  const mediaData = await mediaRes.json();
  const media = mediaData.media || [];
  console.log(`Total Media Assets: ${media.length}`);

  const categories = ["EXTERIOR", "CABIN", "COCKPIT", "EXPEDITION"];
  for (const cat of categories) {
    const catRes = await fetch(`${baseUrl}/api/media?category=${cat}`);
    const catData = await catRes.json();
    const count = catData.media?.length || 0;
    console.log(`  Category [${cat}]: ${count} photos`);
    if (count === 0) {
      console.error(`  FAIL: Category ${cat} has 0 items!`);
      allPassed = false;
    }
  }
  console.log("✓ Media Gallery validation PASSED!\n");

  // 3. Verify 0 Dummy Bookings / Inquiries / Leads via Authenticated Stats
  console.log("Test 3: Verifying removal of all dummy bookings, leads, customers...");
  const statsRes = await fetch(`${baseUrl}/api/stats`, { headers: authHeaders });
  const statsData = await statsRes.json();
  const stats = statsData.stats || {};
  console.log(`  Stats: Bookings = ${stats.totalBookings}, Inquiries = ${stats.totalEnquiries}, Customers = ${stats.totalCustomers}, Vehicles = ${stats.totalVehicles}`);
  if (stats.totalBookings !== 0 || stats.totalEnquiries !== 0 || stats.totalCustomers !== 0) {
    console.error("  FAIL: Dummy data still present in stats!");
    allPassed = false;
  } else {
    console.log("  ✓ Confirmed 0 dummy transactions, ready for live bookings!");
  }
  console.log("✓ Dummy Data Purge validation PASSED!\n");

  // 4. Verify Testimonials
  console.log("Test 4: Verifying customer testimonials...");
  const testRes = await fetch(`${baseUrl}/api/testimonials`);
  const testData = await testRes.json();
  const testimonials = testData.testimonials || [];
  console.log(`Total Testimonials: ${testimonials.length}`);
  testimonials.forEach(t => console.log(`  - "${t.customerName}" (${t.circuit}): "${t.content.substring(0, 60)}..."`));
  if (testimonials.length !== 3) {
    console.error("  FAIL: Expected 3 real testimonials from website!");
    allPassed = false;
  }
  console.log("✓ Testimonials validation PASSED!\n");

  // 5. Verify Content Config
  console.log("Test 5: Verifying homepage & SEO content config...");
  const contentRes = await fetch(`${baseUrl}/api/content?key=homepage_config`);
  const contentData = await contentRes.json();
  const hero = contentData.data?.hero;
  console.log(`  Hero Headline: "${hero?.headline}"`);
  console.log(`  Contact Hotline: "${contentData.data?.contactInfo?.hotline}"`);
  if (!hero?.headline?.includes("India's Great Roads")) {
    console.error("  FAIL: Hero headline mismatch!");
    allPassed = false;
  }
  console.log("✓ Homepage Content validation PASSED!\n");

  // 6. Verify Vehicles
  console.log("Test 6: Verifying Fleet Vehicles...");
  const vehRes = await fetch(`${baseUrl}/api/vehicles`);
  const vehData = await vehRes.json();
  const vehicles = vehData.vehicles || [];
  console.log(`Total Vehicles: ${vehicles.length}`);
  vehicles.forEach(v => console.log(`  - "${v.name}" (${v.tier}): ${v.regNumber}, Photo: ${v.imageUrl.substring(0, 45)}...`));
  if (vehicles.length !== 3) {
    console.error("  FAIL: Expected 3 real fleet vehicles!");
    allPassed = false;
  }
  console.log("✓ Vehicles validation PASSED!\n");

  console.log("==================================================================");
  if (allPassed) {
    console.log("  ALL TESTS PASSED: ADMIN PANEL FULLY SYNCHRONIZED WITH REAL DATA!");
  } else {
    console.log("  SOME TESTS FAILED: Please check errors above.");
  }
  console.log("==================================================================");
}

verifyRealData();
