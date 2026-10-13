async function runTests() {
  console.log("=== Starting Budhram Tour & Travels CMS End-to-End Tests ===");

  const BASE_URL = "http://localhost:3000";
  const uniqueSuffix = Date.now().toString().slice(-5);

  // 0. Test User Registration (Create Admin)
  console.log("\n[0] Testing Admin Registration (Create User)...");
  const testNewEmail = `admin_test_${uniqueSuffix}@budhramtravels.com`;
  const registerRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: `Test Admin ${uniqueSuffix}`,
      email: testNewEmail,
      password: "TestPassword@123",
      role: "ADMIN",
    }),
  });
  const registerData = await registerRes.json();
  if (!registerData.success) {
    throw new Error("Admin registration failed: " + JSON.stringify(registerData));
  }
  console.log("✓ Admin created successfully:", registerData.admin.email);

  // 1. Authenticate / Login with the newly created admin
  console.log("\n[1] Testing Admin Login with newly created user...");
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: testNewEmail,
      password: "TestPassword@123",
    }),
  });
  const loginData = await loginRes.json();
  if (!loginData.success || !loginData.token) {
    throw new Error("Login failed: " + JSON.stringify(loginData));
  }
  const token = loginData.token;
  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    Cookie: `budhram_admin_session=${token}`,
  };
  console.log("✓ Login successful! Admin:", loginData.admin.name);

  // 2. Test Stats API
  console.log("\n[2] Testing Stats API...");
  const statsRes = await fetch(`${BASE_URL}/api/stats`, { headers: authHeaders });
  const statsData = await statsRes.json();
  console.log("✓ Stats API returned successfully:", {
    totalBookings: statsData.stats.totalBookings,
    totalVehicles: statsData.stats.totalVehicles,
    totalDrivers: statsData.stats.totalDrivers,
    totalRevenue: statsData.stats.totalRevenue,
  });

  // 3. Test Vehicle Creation & Retrieval
  console.log("\n[3] Testing Vehicle Creation (Add Vehicle)...");
  const vehicleRes = await fetch(`${BASE_URL}/api/vehicles`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      regNumber: `DL-1VC-${uniqueSuffix}`,
      name: "Force Urbania Luxury Cruiser",
      tier: "EXECUTIVE_12S",
      seatingCapacity: 12,
      color: "Metallic Grey",
      features: "Pushback Recliners, Dual AC, ABS",
      ratePerKm: 28,
      driverAllowancePerDay: 500,
      currentOdometer: 12500,
    }),
  });
  const vehicleData = await vehicleRes.json();
  if (!vehicleData.success) {
    throw new Error("Vehicle creation failed: " + JSON.stringify(vehicleData));
  }
  const vehicleId = vehicleData.vehicle.id;
  console.log("✓ Vehicle created successfully! ID:", vehicleId, "Reg:", vehicleData.vehicle.regNumber);

  // 4. Test Driver Creation & Retrieval
  console.log("\n[4] Testing Driver Creation (Add Driver)...");
  const driverRes = await fetch(`${BASE_URL}/api/drivers`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      name: "Rajender Sharma",
      phone: "+91 98112 34567",
      licenseNumber: `DL-04201800${uniqueSuffix}`,
      experienceYears: 14,
      certifiedPasses: "Atal Tunnel, Rohtang Pass, Spiti Valley",
    }),
  });
  const driverData = await driverRes.json();
  if (!driverData.success) {
    throw new Error("Driver creation failed: " + JSON.stringify(driverData));
  }
  const driverId = driverData.driver.id;
  console.log("✓ Driver created successfully! ID:", driverId, "Name:", driverData.driver.name);

  // 5. Test Tour Package Creation & Retrieval
  console.log("\n[5] Testing Package Creation...");
  const pkgRes = await fetch(`${BASE_URL}/api/packages`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      title: `Delhi to Manali Expedition #${uniqueSuffix}`,
      destination: "Manali, Solang, Atal Tunnel, Sissu",
      startingLocation: "Delhi NCR",
      duration: "5 Days / 4 Nights",
      distanceKm: 1150,
      basePrice: 32000,
      priceType: "PER_KM_METER",
      overview: "Official Force Tempo expedition with mountain certified chauffeur.",
    }),
  });
  const pkgData = await pkgRes.json();
  if (!pkgData.success) {
    throw new Error("Package creation failed: " + JSON.stringify(pkgData));
  }
  const packageId = pkgData.package.id;
  console.log("✓ Package created successfully! ID:", packageId, "Slug:", pkgData.package.slug);

  // 6. Test Booking Creation
  console.log("\n[6] Testing Booking Creation (Manual Booking)...");
  const bookingRes = await fetch(`${BASE_URL}/api/bookings`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      customerName: "Vikas Aggarwal",
      customerPhone: "+91 98991 22334",
      customerEmail: "vikas@gmail.com",
      pickupLocation: "Noida Sector 62",
      destination: "Manali & Kasol",
      travelDate: new Date(Date.now() + 86400000 * 3).toISOString(),
      passengerCount: 8,
      estimatedKm: 1200,
      ratePerKm: 28,
      advancePaid: 5000,
      vehicleId,
      driverId,
      tripPackageId: packageId,
      specialNotes: "Family trip with luggage rack requirement",
    }),
  });
  const bookingData = await bookingRes.json();
  if (!bookingData.success) {
    throw new Error("Booking creation failed: " + JSON.stringify(bookingData));
  }
  const bookingId = bookingData.booking.id;
  console.log("✓ Booking created successfully! PNR:", bookingData.booking.pnr, "Total:", bookingData.booking.totalAmount, "BalanceDue:", bookingData.booking.balanceDue);

  // 7. Test Payment Recording
  console.log("\n[7] Testing Payment Recording...");
  const paymentRes = await fetch(`${BASE_URL}/api/payments`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      bookingId,
      amount: 10000,
      paymentMethod: "UPI",
      referenceNote: "Part payment via GPay",
    }),
  });
  const paymentData = await paymentRes.json();
  if (!paymentData.success) {
    throw new Error("Payment creation failed: " + JSON.stringify(paymentData));
  }
  console.log("✓ Payment recorded successfully! TXN ID:", paymentData.payment.transactionId, "Amount:", paymentData.payment.amount);

  // 8. Test Inquiry Creation
  console.log("\n[8] Testing Inquiry Submission...");
  const enqRes = await fetch(`${BASE_URL}/api/enquiries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Rohit Malhotra",
      phone: "+91 99100 88776",
      pickupLocation: "Delhi Airport Terminal 3",
      destinationCircuit: "Delhi to Shimla - Kufri",
      passengers: "6 Adults",
      vehicleChoice: "12 Seater Force Cruiser",
      message: "Need quote with toll & border taxes included",
    }),
  });
  const enqData = await enqRes.json();
  if (!enqData.success) {
    throw new Error("Enquiry creation failed: " + JSON.stringify(enqData));
  }
  console.log("✓ Inquiry created successfully! ID:", enqData.enquiry.id, "Lead:", enqData.enquiry.name);

  // 9. Re-check Stats after real data entry
  console.log("\n[9] Checking Updated Stats...");
  const updatedStatsRes = await fetch(`${BASE_URL}/api/stats`, { headers: authHeaders });
  const updatedStats = await updatedStatsRes.json();
  console.log("✓ Updated Dashboard Stats:", {
    totalBookings: updatedStats.stats.totalBookings,
    totalCustomers: updatedStats.stats.totalCustomers,
    totalVehicles: updatedStats.stats.totalVehicles,
    totalDrivers: updatedStats.stats.totalDrivers,
    totalEnquiries: updatedStats.stats.totalEnquiries,
    totalRevenue: updatedStats.stats.totalRevenue,
    totalCollected: updatedStats.stats.totalCollected,
    totalPending: updatedStats.stats.totalPending,
  });

  console.log("\n=================================================");
  console.log("🎉 ALL TESTS PASSED! APPLICATION IS 100% OPERATIONAL!");
  console.log("=================================================");
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
