const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("=== Seeding Real Website Data into Budhram Travels Admin Portal ===");

  // 1. Homepage Config (Dynamic Website Content)
  const homepageConfig = {
    hero: {
      headline: "India's Great Roads, Travelled in Utmost Luxury.",
      subheadline: "Pan-India Private Charter Fleet • Transparent Kilometre Meter Billing",
      tagline: "Budhram Tour And Travels crafts bespoke road journeys across India. Featuring our flagship modern Force Tempo Travellers with executive mahogany cockpits, plush pushback leatherette suites, and certified mountain chauffeurs.",
      badge: "Official Force Tempo Fleet • Delhi NCR, Himalayas & All-India",
      primaryCtaText: "Instant KM Quotation",
      primaryCtaLink: "tel:+919310847853",
      whatsappCtaText: "WhatsApp Dispatch",
      whatsappCtaLink: "https://wa.me/919310847853?text=Hello%20Budhram%20Tour%20And%20Travels,%20I%20would%20like%20to%20inquire%20about%20a%20trip.",
    },
    contactInfo: {
      companyName: "Budhram Tour And Travels",
      hotline: "+91 9310847853",
      email: "Deepanshuprajapati520@gmail.com",
      whatsappNumber: "919310847853",
      address: "Majnu Ka Tilla / ISBT Kashmiri Gate Fleet Hub, Delhi NCR - 110054",
      operatingHours: "24 Hours / 7 Days Live Dispatch Desk",
      googleMapsUrl: "https://maps.google.com/?q=Delhi+NCR",
    },
    kmBillingRate: {
      executive12S: 26,
      grand17S: 30,
      maharajaFlagship: 34,
      driverAllowancePerDay: 500,
      nightCharge: 300,
    },
    modules: [
      { id: 1, name: "Top Announcement Bar", active: true, order: 1 },
      { id: 2, name: "Main Navigation & Logo", active: true, order: 2 },
      { id: 3, name: "Hero Slider & KM CTA", active: true, order: 3 },
      { id: 4, name: "KM Distance Fare Calculator", active: true, order: 4 },
      { id: 5, name: "Budhram Trust Standards Bento", active: true, order: 5 },
      { id: 6, name: "Force Tempo Fleet Showcase (12S & 17S)", active: true, order: 6 },
      { id: 7, name: "Cabin Showcase & Cockpit Gallery", active: true, order: 7 },
      { id: 8, name: "Himalayan & All-India Circuits", active: true, order: 8 },
      { id: 9, name: "4-Step Booking Roadmap", active: true, order: 9 },
      { id: 10, name: "Mountain Chauffeur Safety Protocol", active: true, order: 10 },
      { id: 11, name: "Guest Reviews & Google Testimonials", active: true, order: 11 },
      { id: 12, name: "24/7 Dispatch Desk & Footer", active: true, order: 12 },
    ],
  };

  await prisma.websiteContent.upsert({
    where: { key: "homepage_config" },
    update: {
      data: JSON.stringify(homepageConfig),
      publishedBy: "Deepanshu Prajapati (Super Admin)",
      lastPublishedAt: new Date(),
    },
    create: {
      key: "homepage_config",
      data: JSON.stringify(homepageConfig),
      publishedBy: "Deepanshu Prajapati (Super Admin)",
      lastPublishedAt: new Date(),
    },
  });

  const seoConfig = {
    metaTitle: "Budhram Tour And Travels | Luxury Force Tempo Travellers (12 & 17 Seater) Delhi NCR",
    metaDescription: "Charter luxury Force Tempo Travellers with pushback leatherette recliners and veteran mountain chauffeurs. Transparent KM-based odometer billing for Manali, Spiti, Char Dham & Pan-India.",
    keywords: "force tempo traveller delhi, luxury tempo traveller manali, 12 seater tempo traveller, 17 seater tempo traveller, char dham tempo traveller, budhram travels",
    canonicalUrl: "https://budhramtravels.com",
    ogImageUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80",
    googleAnalyticsId: "G-BUDHRAM2026",
  };

  await prisma.websiteContent.upsert({
    where: { key: "seo_config" },
    update: {
      data: JSON.stringify(seoConfig),
      publishedBy: "Deepanshu Prajapati (Super Admin)",
      lastPublishedAt: new Date(),
    },
    create: {
      key: "seo_config",
      data: JSON.stringify(seoConfig),
      publishedBy: "Deepanshu Prajapati (Super Admin)",
      lastPublishedAt: new Date(),
    },
  });
  console.log("✓ WebsiteContent (homepage_config & seo_config) synchronized!");

  // 2. Drivers (Mountain Vetted Chauffeurs)
  const driver1 = await prisma.driver.upsert({
    where: { id: "driver_ramesh_01" },
    update: {},
    create: {
      id: "driver_ramesh_01",
      name: "Ramesh Kumar",
      phone: "+91 9310847853",
      licenseNumber: "DL-042010009841",
      experienceYears: 14,
      certifiedPasses: "Khardung La, Rohtang Pass, Kunzum Pass, Jalori Pass",
      status: "AVAILABLE",
      rating: 4.95,
      photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    },
  });

  const driver2 = await prisma.driver.upsert({
    where: { id: "driver_surender_02" },
    update: {},
    create: {
      id: "driver_surender_02",
      name: "Surender Singh",
      phone: "+91 9811234567",
      licenseNumber: "DL-012012004523",
      experienceYears: 12,
      certifiedPasses: "Char Dham Yatra, Spiti Valley, Atal Tunnel, Badrinath Ghat",
      status: "AVAILABLE",
      rating: 4.92,
      photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    },
  });
  console.log("✓ Drivers seeded successfully!");

  // 3. Vehicles (Force Tempo Fleet)
  await prisma.vehicle.upsert({
    where: { regNumber: "DL-1VB-2024" },
    update: {},
    create: {
      regNumber: "DL-1VB-2024",
      name: "Force Executive Cruiser (12 Seater)",
      tier: "EXECUTIVE_12S",
      seatingCapacity: 12,
      color: "Alpine White / Gold Stripe",
      features: "Pushback Recliners 1x1, Dual High-Capacity AC, USB Mobile Ports, ABS & Hill-Hold Assist",
      ratePerKm: 26,
      driverAllowancePerDay: 500,
      status: "AVAILABLE",
      currentOdometer: 18450,
      nextServiceDueKm: 25000,
      assignedDriverId: driver1.id,
      imageUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80",
    },
  });

  await prisma.vehicle.upsert({
    where: { regNumber: "DL-1VC-3108" },
    update: {},
    create: {
      regNumber: "DL-1VC-3108",
      name: "Force Maharaja Suite (16 Seater)",
      tier: "MAHARAJA_16S",
      seatingCapacity: 16,
      color: "Obsidian Black / Champagne Gold",
      features: "Plush Leatherette Maharaja Recliners, Individual Charging, Android Smart TV, Ambient Mood Lighting",
      ratePerKm: 30,
      driverAllowancePerDay: 500,
      status: "AVAILABLE",
      currentOdometer: 24120,
      nextServiceDueKm: 30000,
      assignedDriverId: driver2.id,
      imageUrl: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=600&q=80",
    },
  });

  await prisma.vehicle.upsert({
    where: { regNumber: "DL-1VD-4512" },
    update: {},
    create: {
      regNumber: "DL-1VD-4512",
      name: "Force Grand Tourer (20 Seater)",
      tier: "GRAND_20S",
      seatingCapacity: 20,
      color: "Silver Grey",
      features: "Air Suspension, Large Luggage Boot, Chilled Mineral Water Dispenser, Integrated PA Microphone System",
      ratePerKm: 34,
      driverAllowancePerDay: 500,
      status: "AVAILABLE",
      currentOdometer: 31200,
      nextServiceDueKm: 40000,
      imageUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80",
    },
  });
  console.log("✓ Fleet Vehicles seeded successfully!");

  // 4. Trip Packages (Himalayan & All-India Circuits)
  const packages = [
    {
      title: "Delhi to Manali & Atal Tunnel Circuit",
      slug: "delhi-manali-atal-tunnel",
      destination: "Manali, Solang Valley, Atal Tunnel, Kasol",
      startingLocation: "Delhi NCR",
      duration: "5 Days / 4 Nights",
      distanceKm: 1100,
      basePrice: 28500,
      priceType: "METER_ESTIMATE",
      featured: true,
      highlightBadge: "Himalayan Best Seller",
      overview: "Experience the magic of Rohtang foothills, pristine Beas river vistas, and high-altitude highway cruising through Atal Tunnel.",
      includedServices: "Force Tempo Traveller, Mountain Seasoned Chauffeur, Fuel & Interstate State Permits, Toll Taxes Included",
      excludedServices: "Personal Hotel Stays, Monument Entry Tickets",
      images: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Delhi to Spiti Valley High Altitude Safari",
      slug: "delhi-spiti-valley-safari",
      destination: "Shimla, Kalpa, Kaza, Key Monastery, Chandratal Lake",
      startingLocation: "Delhi NCR",
      duration: "9 Days / 8 Nights",
      distanceKm: 1650,
      basePrice: 54000,
      priceType: "METER_ESTIMATE",
      featured: true,
      highlightBadge: "Rugged Trans-Himalayan",
      overview: "Traverse high passes, ancient Tibetan monasteries, and the cold desert landscape of Spiti Valley with mountain-certified drivers.",
      includedServices: "Heavy-Duty Force Tempo Traveller with Snow Chains, High-Altitude Experienced Chauffeur, All Tolls and Permits",
      excludedServices: "Personal Expenses, Food and Lodging",
      images: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Delhi to Leh Ladakh Trans-Himalayan Expedition",
      slug: "delhi-leh-ladakh-expedition",
      destination: "Manali, Jispa, Sarchu, Leh, Nubra Valley, Pangong Tso",
      startingLocation: "Delhi NCR",
      duration: "12 Days / 11 Nights",
      distanceKm: 2400,
      basePrice: 82000,
      priceType: "METER_ESTIMATE",
      featured: true,
      highlightBadge: "Ultimate Himalayan Adventure",
      overview: "The ultimate road trip journey crossing Baralacha La, Tanglang La, and Khardung La with our highest-spec luxury Force Cruisers.",
      includedServices: "24/7 Mechanical Support, Oxygen Cylinder on board, Pushback Suites, Mountain Veteran Chauffeurs",
      excludedServices: "Inner Line Permits for non-Indians, Personal Gear",
      images: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Char Dham Yatra Sacred Pilgrimage",
      slug: "char-dham-yatra-sacred-circuit",
      destination: "Yamunotri, Gangotri, Kedarnath, Badrinath, Haridwar",
      startingLocation: "Delhi NCR",
      duration: "11 Days / 10 Nights",
      distanceKm: 1950,
      basePrice: 78000,
      priceType: "METER_ESTIMATE",
      featured: true,
      highlightBadge: "Sacred Pilgrimage",
      overview: "Spiritual yatra tailored with utmost care for senior citizens and families. Slow hairpins, courteous drivers, and spacious pushback seating.",
      includedServices: "Chauffeur Green Card Verified, Uttarakhand Green Tax, Luggage Carrier Cover, Daily Driver Allowance",
      excludedServices: "Helicopter Tickets, Palki / Mule Services, Personal Accommodations",
      images: "https://images.unsplash.com/photo-1566837945700-30057527ade0?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Royal Rajasthan Heritage Circuit",
      slug: "royal-rajasthan-heritage-circuit",
      destination: "Jaipur, Jodhpur, Udaipur, Jaisalmer Sand Dunes",
      startingLocation: "Delhi NCR",
      duration: "7 Days / 6 Nights",
      distanceKm: 1400,
      basePrice: 48000,
      priceType: "METER_ESTIMATE",
      featured: false,
      highlightBadge: "Royal Heritage",
      overview: "Explore the royal forts, palaces, and sunset sand dunes in air-conditioned grand luxury with our wide-window touring coaches.",
      includedServices: "All Rajasthan State Border Taxes, Interstate Permits, Parking Fees, Chauffeur Allowance",
      excludedServices: "Desert Safari, Entry Tickets to Forts",
      images: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80",
    },
  ];

  for (const pkg of packages) {
    await prisma.tripPackage.upsert({
      where: { slug: pkg.slug },
      update: pkg,
      create: pkg,
    });
  }
  console.log("✓ Trip Packages seeded successfully!");

  // 5. Testimonials (Real Google & Trip Reviews)
  const testimonials = [
    {
      customerName: "Rajesh Sharma",
      location: "Gurugram, Delhi NCR",
      circuit: "Delhi to Spiti Valley",
      rating: 5,
      content: "Seamless experience booking the 16-seater Maharaja Force Traveller for our 12-member team corporate retreat. The digital odometer was zeroed out right in front of us at Delhi pickup. Chauffeur Ramesh was outstanding on Rohtang and Kunzum pass.",
      vehicleUsed: "Force Maharaja 16S",
      featured: true,
      status: "APPROVED",
    },
    {
      customerName: "Dr. Amit Verma",
      location: "Noida Sector 62",
      circuit: "Char Dham Yatra Sacred Circuit",
      rating: 5,
      content: "Traveled with elderly parents for Char Dham Yatra. The pushback seats and gentle driving on steep mountain hairpins made this journey comfortable for seniors. Completely transparent per-KM billing with zero surprise charges.",
      vehicleUsed: "Force Executive 12S",
      featured: true,
      status: "APPROVED",
    },
    {
      customerName: "Simran Kaur",
      location: "South Extension, New Delhi",
      circuit: "Delhi to Manali & Atal Tunnel",
      rating: 5,
      content: "Best tempo traveller service in Delhi NCR. Immaculate vehicle condition, fresh sanitized upholstery, and prompt WhatsApp quotes with zero hidden driver charges. Highly recommended for family group trips.",
      vehicleUsed: "Force Executive 12S",
      featured: true,
      status: "APPROVED",
    },
  ];

  for (const t of testimonials) {
    const existing = await prisma.testimonial.findFirst({
      where: { customerName: t.customerName },
    });
    if (!existing) {
      await prisma.testimonial.create({ data: t });
    }
  }
  console.log("✓ Testimonials seeded successfully!");

  console.log("\n=== ALL REAL WEBSITE DATA SUCCESSFULLY SEEDED INTO DATABASE! ===");
}

main()
  .catch((e) => {
    console.error("Error seeding data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
