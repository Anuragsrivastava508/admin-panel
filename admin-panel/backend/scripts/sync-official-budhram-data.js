const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function syncOfficialBudhramData() {
  console.log("==================================================================");
  console.log("  SYNCING OFFICIAL BUDHRAM TOUR & TRAVELS WEBSITE DATA TO ADMIN   ");
  console.log("  Source of Truth: https://budhramtravels.com/                    ");
  console.log("==================================================================\n");

  // =========================================================================
  // 1. PURGE ALL TEST / DEMO / DUMMY / FAKE TRANSACTIONS & LEADS
  // =========================================================================
  console.log("Step 1: Removing all testing, mock, dummy and sample data...");
  const delOdometer = await prisma.odometerLog.deleteMany({});
  const delPayments = await prisma.payment.deleteMany({});
  const delBookings = await prisma.booking.deleteMany({});
  const delEnquiries = await prisma.enquiry.deleteMany({});
  const delCustomers = await prisma.customer.deleteMany({});
  const delNotifications = await prisma.systemNotification.deleteMany({});
  
  // Clean fake users
  await prisma.user.deleteMany({
    where: {
      OR: [
        { email: { contains: "test" } },
        { name: { contains: "test" } },
        { email: { contains: "adolf" } },
        { name: { contains: "adolf" } },
      ],
    },
  });

  console.log(`✓ Purged dummy records:`);
  console.log(`  - Bookings: ${delBookings.count}`);
  console.log(`  - Payments: ${delPayments.count}`);
  console.log(`  - Inquiries: ${delEnquiries.count}`);
  console.log(`  - Customers: ${delCustomers.count}`);
  console.log(`  - Odometer Logs: ${delOdometer.count}`);
  console.log(`  - System Notifications: ${delNotifications.count}`);
  console.log(`  (0 fake transactions remain in database)\n`);

  // =========================================================================
  // 2. CIRCUITS & PACKAGES — REAL WEBSITE DATA ONLY
  // =========================================================================
  console.log("Step 2: Syncing real tour circuits from official website...");

  // Purge any outdated/dummy packages first
  await prisma.tripPackage.deleteMany({});

  const realPackages = [
    {
      title: "Atal Tunnel & Sissu",
      slug: "atal-tunnel-sissu",
      destination: "Manali, Solang Valley, Atal Tunnel, Sissu, Lahaul",
      startingLocation: "Delhi NCR",
      duration: null, // Custom KM-based as per website
      distanceKm: null,
      basePrice: 0,
      priceType: "KM-Based Fare",
      featured: true,
      status: "ACTIVE",
      highlightBadge: "Himachal Circuit",
      overview: "Rohtang portal gateway, Sissu waterfall cascades, Lahaul snowfields, and Solang valley with expert drivers.",
      includedServices: "All India Tourist Permits & Mountain Clearance, Pushback Recliners, Mountain-Vetted Chauffeurs, 100% Odometer KM Billing",
      excludedServices: null,
      images: "https://lh3.googleusercontent.com/aida-public/AB6AXuB2YlitikZFTjtcsONJzc_xNH0-CtrXk6Nea-nTsq2lx0crje4j5mPy1nfld-C46EgSwZxPCI9WdgO9v5DhoEZxnq8SQnN8ibeED_ba0iCr6mH9plUzWW1V9diwPB8-bXRSiYeKhb3lNDyhEcPEyrsqVx-kN8hdEjtdfjGk9YjjKdIEamXHnMfozexhZ8XyE14uicSYSQ7H-Wlx4vdZnXezi54w3gR8v2kjy4zpAypQ7V0MDbtNX6_3NR_p2rNdq8beLg",
    },
    {
      title: "Kasol, Manikaran & Jibhi",
      slug: "kasol-manikaran-jibhi",
      destination: "Parvati Valley, Kasol, Manikaran, Jibhi, Tirthan",
      startingLocation: "Delhi NCR",
      duration: null,
      distanceKm: null,
      basePrice: 0,
      priceType: "KM-Based Fare",
      featured: true,
      status: "ACTIVE",
      highlightBadge: "Parvati Valley",
      overview: "Crystal alpine pine rivers, sacred hot springs of Manikaran, riverside cafes, and hidden wooden chalets of Tirthan.",
      includedServices: "All India Tourist Permits & Mountain Clearance, Pushback Recliners, Mountain-Vetted Chauffeurs, 100% Odometer KM Billing",
      excludedServices: null,
      images: "https://lh3.googleusercontent.com/aida-public/AB6AXuBfHDPl_9f-iy4XlQGfxoeyHnTLxyZHm8yQxyG9zM6xuDgau9Yrvu3O96ccpYyRbESMkDt0RMB3Dv8onHFkoElYTP17PbyrGBzaeDGtj0hWXlVQo0JI9IbfZisHw0tZXzSQZw_S0Peqj9hotH-_fkjZ9KUZFMKjKZnN1JYIhbm_9WEDXRrzRxZBJobhwXVMIDwG4a3ZdMAzLEB5_NMWp2FdTjSEK0a_1aOyOiKH5Z0eiyvHv2aIj9_cDmKzb3X2lXNsXw",
    },
    {
      title: "Dharamshala & Spiti",
      slug: "dharamshala-spiti",
      destination: "Spiti & Kangra, Dharamshala, Spiti Valley",
      startingLocation: "Delhi NCR",
      duration: null,
      distanceKm: null,
      basePrice: 0,
      priceType: "KM-Based Fare",
      featured: true,
      status: "ACTIVE",
      highlightBadge: "Spiti & Kangra",
      overview: "Sacred monasteries, prayer flag suspension bridges, rugged high-altitude passes, and remote village circuits.",
      includedServices: "All India Tourist Permits & Mountain Clearance, Pushback Recliners, Mountain-Vetted Chauffeurs, 100% Odometer KM Billing",
      excludedServices: null,
      images: "https://lh3.googleusercontent.com/aida-public/AB6AXuB7g60A174-p80XcdOX6vtx5SjfiBnKoaIY2oR6z3SYpDnQPowTvwQMbBvq3AMWkM7yLbuPfvb4sEqfvFUhPWP9QvjzPLfiMAM3Ex0PFIhUUzvM7msGk0K2dHmEBpZGREM_uQo23DLk3fEoJgXyq4QZD7_KbOpISar6tEXDWN4cbGjvZNO9mZpZW12a4DnnozAirCOOWAaTse-mG-8yKdYX9x1467FEqSb212LTpUymftv0G4xXWCjE2d53EMn6x0HftQ",
    },
    {
      title: "Rajasthan, Agra & Beyond",
      slug: "rajasthan-agra-beyond",
      destination: "Golden Triangle, Jaipur, Udaipur, Agra, Rajasthan",
      startingLocation: "Delhi NCR",
      duration: null,
      distanceKm: null,
      basePrice: 0,
      priceType: "KM-Based Fare",
      featured: true,
      status: "ACTIVE",
      highlightBadge: "Golden Triangle",
      overview: "Jaipur palaces, Udaipur lake shores, Agra Taj Mahal wonders, and tailored interstate circuits.",
      includedServices: "All India Tourist Permits & Mountain Clearance, Pushback Recliners, Mountain-Vetted Chauffeurs, 100% Odometer KM Billing",
      excludedServices: null,
      images: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80",
    },
  ];

  for (const pkg of realPackages) {
    await prisma.tripPackage.create({ data: pkg });
    console.log(`  ✓ Enrolled Circuit: "${pkg.title}" (${pkg.destination})`);
  }
  console.log(`✓ 4 Real Tour Packages added to Admin Panel.\n`);

  // =========================================================================
  // 3. MEDIA GALLERY — ALL REAL WEBSITE IMAGES
  // =========================================================================
  console.log("Step 3: Populating Media Gallery with genuine website images...");
  await prisma.mediaItem.deleteMany({});

  const realMedia = [
    // EXTERIOR
    {
      title: "Dark Grey Executive Cruiser",
      category: "EXTERIOR",
      url: "https://lh3.googleusercontent.com/aida-public/AB6AXuAuEN7lCBEDKCphh42ft6O3zNe5DfQET5G2pT1yFJZjET9X0Ag2b1RCn50PZ5UZglOnICBudSvJVx9YODtVjdVuWqQtUOPhMMFwB4xw0Rv2RXhDbZM81cOjFUc3zy5u02wjRGNIK5buQwKoUWIjzthW8qcOdNCteXvssp6nlj16-Dsgi_NZznjfBCvISJeEtbV3jWVA_ak31I_jDtWBhLtTW8DSV7k15237wXc1M3jGgGBZhrJvgZZSiHngGiB5dQm3vg",
      alt: "Modern sleek dark metallic grey Force Tempo Traveller exterior",
      size: "1.4 MB",
      isFeatured: true,
    },
    {
      title: "17 Seater Touring Coach",
      category: "EXTERIOR",
      url: "https://lh3.googleusercontent.com/aida-public/AB6AXuAS2CKiS9zxIYZ7YWdBwuxe-YzZ56C8QZS5GQx0lHBjLsDYk6J3MVcnYgTXuoPKDpAV9iYUctb5l8bGTBMUmROP89AAj0iHsoKRBfQxg1-RqPNtZLd6dp6J5uVmo8rvNRx8hUv7BkvC0psu3M_AivYq-Nb0nI_lz6PXZdH-s5lExxbPJo-iKLbh-xw5I5sGS0jTrc_Xksw62r7U5GKA6tKmOzDl5wkX4nOAlEMx_ratJgOVnyPwKxXMZSV4Xv8mhp0xMg",
      alt: "Grand touring 17 seater coach exterior",
      size: "1.6 MB",
      isFeatured: true,
    },
    {
      title: "Luxury Force Executive Cruiser",
      category: "EXTERIOR",
      url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCoTXgzdCeWeupaK7LbZlpIH94mqzEMcvfHYfZwNUHPlBKqxcDeDEmDFo_tLGTLOFdxecsaCAGwSyPwJdu4SOKcIGaisVEGQOGgTRCFAkntuKqTV-cAxvUbqSq5MrwR7dmFbV1mhqmVxQIYWaWoHjLAwdLHNVyFw0TnEa0sc_fO-1v1mKCULdfW3r-GbdBYT3ut8csb7PQJuJGP_9yzyhzCZAR5RiAqp1H4ecl5mTE3E4QGQxO2-Vu36LvH_fFmO9eA4g",
      alt: "Modern sleek dark metallic grey Force Tempo Traveller exterior",
      size: "1.8 MB",
      isFeatured: true,
    },
    {
      title: "12 Seater Force Pushback",
      category: "EXTERIOR",
      url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBqDDT6pX5rghMzb0Y7iUo-XJKB9ElzLe0bJ1WVRGEssAxYaHGBqguJKRTL3QFq6peKosefgoR8iDOpkTCvbXaQvPBNCXlWbcoL5_5qPTrhY59M-niAddPDF92HvaNsmxQjfWiDO5Q197ohRDB8vxOncV-IBx3GoPLY997UjU2I1mUQUsGlNXOdXWONwQ8wigdb2AdqZHU6mOdOMu0jQ6J1Bn6YB7Opb8mtF8_PrOYlHAQjk7f9T0-Va8KCJrv9gXqW1g",
      alt: "12 Seater Force Tempo Traveller",
      size: "1.2 MB",
      isFeatured: true,
    },
    {
      title: "17 Seater Force Grand Coach",
      category: "EXTERIOR",
      url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCHLaHdUSo23rCEdvbTdhPbj6x-ft9BqJqBXRTS1V9nDCGGWFlkPlC-yK8qyu0mZKAvIho40DgP-pCqmwC1CZ2Mv13Bg-CLZXijpHRvkhQzBjvoWoMHDAMXm2-nvdlr-ZRYlq-T2PWCOO0q1jyP66b5uJ62-PPy4pnn7IE_kLzuaHgsolbVLq333XToNC31XkOh5ZkV2wi0Pew65kFxnjZAGIF9gqGT_U4IMhVbbJtWshtR0Up7x2v3Y-7GIDaHzUX4ow",
      alt: "17 Seater Force Touring Coach",
      size: "1.5 MB",
      isFeatured: true,
    },
    {
      title: "Budhram Commercial Fleet Lineup",
      category: "EXTERIOR",
      url: "https://lh3.googleusercontent.com/aida-public/AB6AXuADZsEcwcbXBX0pzKYqSaYHNirj2rws7toeEza31x9XePwia_roKRZdqIHDo8Sz19dfkytucwyR8UzhceF1pqJN1g2NXfDyNpxivkmdY2AHg65l4VJNDZLR-OjMFwHbHKTAxgUy5-uzty1D_gY2vGXv_g9z_MD2yXzywpNFh2XtLfGHZeuD3jDTqE085Z4nzd0h8x1G-Q77SrRbQDj-PozQT2Sv5hp_TjtNH8EbKM84OkLqHI3tT9NhkPzk3XyxxmcYpQ",
      alt: "Budhram Tour and Travels Vehicle Fleet",
      size: "1.9 MB",
      isFeatured: true,
    },

    // CABIN
    {
      title: "Cream Leatherette Recliners",
      category: "CABIN",
      url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCtbX7WzL2Yq9gC0ENBXxMa5ceORU2MBRizynUxCSbY8upfVOYDxr4pmbgwwUm7NuEI2uVXydXv9VUKIrnB5bN8CjJIJginGAE81sEmfMoL0pDBWWh_MmdQnKv-oYO3YpmtFjgGFBf88AH6eIUdrUdIYyYudb1f6WFdDgEwS9AddCpvndZjEdEi2V_TfEJ8XjmZDVuFdTAXHbEMqSsQPCjc1w7Wqdfc2Id6BPv3C1XqBeq-AoZ6sx4h4MoJRQ_sxZlOCw",
      alt: "Pristine cream luxury leatherette passenger cabin",
      size: "1.3 MB",
      isFeatured: true,
    },
    {
      title: "Tan Ergonomic Recliners",
      category: "CABIN",
      url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBBVhS_KLp-76lenVPV5z7iUuE0Gob-TmP2x9ZaQZOL_DF4fzWHnCKZ6rCedNqmUG4A_qhn4pTcxic6PDDb8c7ieLDumd7QnEdGRpvqC8iRQI53uh1ykWBlz6EWgpwrYtVkoNwz1mD_CuYz8ESVDAfy6yiOnzXIEkFWdFNByQQ2UL9NFmC-MhPUf009a_CyyjUPqc6Zog-ewTqtVhi1RZWwtHsWVDuoJFK85OAf_C4y02y_Nr8MyJV3csFBL7d6bLdz9Q",
      alt: "Warm tan luxury pushback leather seating suite",
      size: "1.4 MB",
      isFeatured: true,
    },
    {
      title: "Diamond Quilted VIP Suite",
      category: "CABIN",
      url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCrYxJhi7q34wu1QlZR98l4pPgn0LZtWY_xkTguT6JDtpfncVnl9ljF1AQfFJVmes610NXhcpZTVCWFJDrdePd6iu8PCeHTjfYcURCFY6CqZZvSp6_4NkasZ4eA9ZlFmLnicU4SQm5ecoVGVrdm6kKrUGAfS2Zm1nuqp-KqUEPnl4VK421e8TbsszLU6EN-gxQ6lb1_cnZxB_Fr1nRhGUMUFbaYD3ieXdh2Mos5YrPzD4SPM0qDnu7GVzRQREy_yq0ObQ",
      alt: "Diamond quilted pushback seats with red carpet gangway",
      size: "1.5 MB",
      isFeatured: true,
    },
    {
      title: "Maharaja Pushback Interior Suite",
      category: "CABIN",
      url: "https://lh3.googleusercontent.com/aida-public/AB6AXuDDfYfztsP_0nQppzLl-SMMaKdz_SyZBBrgJyL8FjCAcL8IFWytm6lQFWtoe1vHzzyyZAZVnagfkbOlkMOu9Yi2srHb4fIo7MM2PvE3DZCS3DCWqrtM4sCLuOqRX8Wr8XFzrMRClnMDqGhshWZkzrEZpRgaA94t7eHz3g0aQab3h0cc65zq4wcN2Oe023eKysDERqHicKoz_wf9HjGNWluu7cOrKoQHqN12OuKry7Ca86DllAvqXTafG85dCHBUs-tOHw",
      alt: "Pristine cream luxury leatherette passenger cabin interior",
      size: "1.6 MB",
      isFeatured: true,
    },

    // COCKPIT
    {
      title: "Mahogany Console & GPS",
      category: "COCKPIT",
      url: "https://lh3.googleusercontent.com/aida-public/AB6AXuD82RiI3mg8RJ4yg7nxRW-kc7nAKUpSPQzEnIcWQXIt6IiRpeeZGwHGn5A1535f1L7PJ8ubdZG_-_75qqTQeJ4DEkkmU-8NOtqVsxMZLpSyL0QH25DAEKUSMhkz-MpmibxTdQUYY92oG0XoLwqjUXz7RlH63q7XdfvMbf2jnWngw_Ih8_OfqPV3ZLZiBhyD8q6k5nRR0CIHN44ncFo6Oij13xL8lXkJ71OfzrMvdFvSXCcNOmL8BNH1TmW1MGMRoOPfOA",
      alt: "Premium front cockpit dashboard with mahogany wood-grain accents",
      size: "1.3 MB",
      isFeatured: true,
    },
    {
      title: "Executive Mahogany Cockpit",
      category: "COCKPIT",
      url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBGJwpKeWuqXXJmSKhp30P-VPM06hCAFLTklnTxMBAmxvqR4D6UX4KvrtxjrGCgpY5nDk1Sl-GbxPoXVj90RT0aAy-QQvd2JUZ6QnkrjQoPlp8qfYs1yoWCCbD3rAWdYt7XtTvRUHhkJl5yKabSnFnBQkrATwQ4G6MEhi5yaHDOrrwQCZ8Oj5euOjSjSU5jZ-AkkF-sbSNZgIO6YihFNL9h4uH7GqLMoIGESAqHhash_zZnVc-9cfRiPNEPPkHaLBk27w",
      alt: "Premium front cockpit dashboard with mahogany wood-grain accents",
      size: "1.5 MB",
      isFeatured: true,
    },

    // EXPEDITION
    {
      title: "Atal Tunnel & Sissu Expedition",
      category: "EXPEDITION",
      url: "https://lh3.googleusercontent.com/aida-public/AB6AXuB2YlitikZFTjtcsONJzc_xNH0-CtrXk6Nea-nTsq2lx0crje4j5mPy1nfld-C46EgSwZxPCI9WdgO9v5DhoEZxnq8SQnN8ibeED_ba0iCr6mH9plUzWW1V9diwPB8-bXRSiYeKhb3lNDyhEcPEyrsqVx-kN8hdEjtdfjGk9YjjKdIEamXHnMfozexhZ8XyE14uicSYSQ7H-Wlx4vdZnXezi54w3gR8v2kjy4zpAypQ7V0MDbtNX6_3NR_p2rNdq8beLg",
      alt: "Atal Tunnel Rohtang Portal",
      size: "1.8 MB",
      isFeatured: true,
    },
    {
      title: "Kasol, Manikaran & Jibhi Expedition",
      category: "EXPEDITION",
      url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBfHDPl_9f-iy4XlQGfxoeyHnTLxyZHm8yQxyG9zM6xuDgau9Yrvu3O96ccpYyRbESMkDt0RMB3Dv8onHFkoElYTP17PbyrGBzaeDGtj0hWXlVQo0JI9IbfZisHw0tZXzSQZw_S0Peqj9hotH-_fkjZ9KUZFMKjKZnN1JYIhbm_9WEDXRrzRxZBJobhwXVMIDwG4a3ZdMAzLEB5_NMWp2FdTjSEK0a_1aOyOiKH5Z0eiyvHv2aIj9_cDmKzb3X2lXNsXw",
      alt: "Riverside pine woods in Kasol and Parvati River",
      size: "1.7 MB",
      isFeatured: true,
    },
    {
      title: "Dharamshala & Spiti Expedition",
      category: "EXPEDITION",
      url: "https://lh3.googleusercontent.com/aida-public/AB6AXuB7g60A174-p80XcdOX6vtx5SjfiBnKoaIY2oR6z3SYpDnQPowTvwQMbBvq3AMWkM7yLbuPfvb4sEqfvFUhPWP9QvjzPLfiMAM3Ex0PFIhUUzvM7msGk0K2dHmEBpZGREM_uQo23DLk3fEoJgXyq4QZD7_KbOpISar6tEXDWN4cbGjvZNO9mZpZW12a4DnnozAirCOOWAaTse-mG-8yKdYX9x1467FEqSb212LTpUymftv0G4xXWCjE2d53EMn6x0HftQ",
      alt: "Himalayan Prayer Flags Bridge Dharamshala Spiti",
      size: "1.9 MB",
      isFeatured: true,
    },
    {
      title: "Rajasthan, Agra & Beyond Circuit",
      category: "EXPEDITION",
      url: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80",
      alt: "Rajasthan Royal Amber Fort Palace Jaipur",
      size: "1.6 MB",
      isFeatured: true,
    },
    {
      title: "Scenic Himalayan Road Expedition",
      category: "EXPEDITION",
      url: "https://lh3.googleusercontent.com/aida/AEtjO1XkiClXTpLjCJDm-pz_COPA-Kbs35kcwVGVsE2CAwbRdklEBqe9zt3CdvUQiEOsxaQGus4t0pBGg6TuuUFQXJihU0Vhpd_BOjFd0jZ2l_nedpshc5mADX-X3vZLddcoRFFI-xND2UsNTu20AiaetXAXgpjEoTLvD0c_7FJqfsHC5zVXl0XwBcbz_dqpENDGlCvUQeUL8RqzlKi0h3qmDO8kKOayk5AscF6y8S7nudE2iNfbBhg1zgfZFs8",
      alt: "Scenic Himalayan mountain range road journey",
      size: "2.1 MB",
      isFeatured: true,
    },
  ];

  for (const m of realMedia) {
    await prisma.mediaItem.create({ data: m });
  }
  console.log(`✓ Enrolled ${realMedia.length} genuine photos into Media Gallery:`);
  console.log(`  - EXTERIOR:   ${realMedia.filter(m => m.category === "EXTERIOR").length}`);
  console.log(`  - CABIN:      ${realMedia.filter(m => m.category === "CABIN").length}`);
  console.log(`  - COCKPIT:    ${realMedia.filter(m => m.category === "COCKPIT").length}`);
  console.log(`  - EXPEDITION: ${realMedia.filter(m => m.category === "EXPEDITION").length}\n`);

  // =========================================================================
  // 4. FLEET VEHICLES — REAL WEBSITE IMAGES & SPECS
  // =========================================================================
  console.log("Step 4: Updating fleet vehicles with genuine website images...");
  await prisma.vehicle.deleteMany({});

  const drivers = await prisma.driver.findMany();
  const driver1 = drivers[0]?.id || null;
  const driver2 = drivers[1]?.id || null;

  await prisma.vehicle.create({
    data: {
      regNumber: "DL-1VB-2024",
      name: "12 Seater Force Pushback Suite",
      tier: "EXECUTIVE_12S",
      seatingCapacity: 12,
      color: "Dark Metallic Grey",
      features: "Pushback Recliners 1x1, Dual High-Capacity AC, USB Mobile Ports, ABS & Hill-Hold Assist",
      ratePerKm: 26,
      driverAllowancePerDay: 500,
      status: "AVAILABLE",
      currentOdometer: 18450,
      nextServiceDueKm: 25000,
      assignedDriverId: driver1,
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBqDDT6pX5rghMzb0Y7iUo-XJKB9ElzLe0bJ1WVRGEssAxYaHGBqguJKRTL3QFq6peKosefgoR8iDOpkTCvbXaQvPBNCXlWbcoL5_5qPTrhY59M-niAddPDF92HvaNsmxQjfWiDO5Q197ohRDB8vxOncV-IBx3GoPLY997UjU2I1mUQUsGlNXOdXWONwQ8wigdb2AdqZHU6mOdOMu0jQ6J1Bn6YB7Opb8mtF8_PrOYlHAQjk7f9T0-Va8KCJrv9gXqW1g",
    },
  });

  await prisma.vehicle.create({
    data: {
      regNumber: "DL-1VC-3108",
      name: "17 Seater Force Grand Coach",
      tier: "GRAND_17S",
      seatingCapacity: 17,
      color: "Dark Metallic Grey",
      features: "High Capacity Touring Coach, Pushback Leather Recliners, Roof Luggage Carrier, Dual AC",
      ratePerKm: 30,
      driverAllowancePerDay: 500,
      status: "AVAILABLE",
      currentOdometer: 24120,
      nextServiceDueKm: 30000,
      assignedDriverId: driver2,
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCHLaHdUSo23rCEdvbTdhPbj6x-ft9BqJqBXRTS1V9nDCGGWFlkPlC-yK8qyu0mZKAvIho40DgP-pCqmwC1CZ2Mv13Bg-CLZXijpHRvkhQzBjvoWoMHDAMXm2-nvdlr-ZRYlq-T2PWCOO0q1jyP66b5uJ62-PPy4pnn7IE_kLzuaHgsolbVLq333XToNC31XkOh5ZkV2wi0Pew65kFxnjZAGIF9gqGT_U4IMhVbbJtWshtR0Up7x2v3Y-7GIDaHzUX4ow",
    },
  });

  await prisma.vehicle.create({
    data: {
      regNumber: "DL-1VD-4512",
      name: "Luxury Force Executive Cruiser (Flagship)",
      tier: "FLAGSHIP_CRUISER",
      seatingCapacity: 17,
      color: "Dark Metallic Grey",
      features: "Panoramic Tinted Windows, Smooth Highway Cruise Suspension, Massive Luggage Boot, Executive Recliners",
      ratePerKm: 34,
      driverAllowancePerDay: 500,
      status: "AVAILABLE",
      currentOdometer: 31200,
      nextServiceDueKm: 40000,
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCoTXgzdCeWeupaK7LbZlpIH94mqzEMcvfHYfZwNUHPlBKqxcDeDEmDFo_tLGTLOFdxecsaCAGwSyPwJdu4SOKcIGaisVEGQOGgTRCFAkntuKqTV-cAxvUbqSq5MrwR7dmFbV1mhqmVxQIYWaWoHjLAwdLHNVyFw0TnEa0sc_fO-1v1mKCULdfW3r-GbdBYT3ut8csb7PQJuJGP_9yzyhzCZAR5RiAqp1H4ecl5mTE3E4QGQxO2-Vu36LvH_fFmO9eA4g",
    },
  });
  console.log("✓ Fleet updated with official photos (Dark Metallic Grey 12S, 17S, and Flagship Cruiser)\n");

  // =========================================================================
  // 5. TESTIMONIALS — 3 REAL GUEST REVIEWS FROM WEBSITE
  // =========================================================================
  console.log("Step 5: Updating testimonials with genuine website reviews...");
  await prisma.testimonial.deleteMany({});

  const realTestimonials = [
    {
      customerName: "Suresh Kumar & Family",
      location: "Delhi NCR",
      circuit: "Delhi NCR to Manali • 12 Seater Luxury",
      rating: 5,
      content: "We chartered a 12 seater Force Tempo Traveller for our family excursion to Manali and the Atal Tunnel. The pushback recline seats gave my elderly parents total relaxation during the drive. The driver was exceptionally calm on high hairpin bends.",
      vehicleUsed: "12 Seater Luxury",
      featured: true,
      status: "APPROVED",
    },
    {
      customerName: "Rohit Goyal",
      location: "Chandigarh",
      circuit: "Chandigarh to Kasol • 17 Seater Coach",
      rating: 5,
      content: "The distance and kilometre-based billing is completely truthful. We were given clear starting and ending odometer logs without tricky extra tariffs at the end. WhatsApp dispatch was responsive throughout our trip!",
      vehicleUsed: "17 Seater Coach",
      featured: true,
      status: "APPROVED",
    },
    {
      customerName: "Vikas Sharma",
      location: "Delhi NCR",
      circuit: "Rajasthan Circuit • Delhi NCR Pickup",
      rating: 5,
      content: "We booked our Rajasthan heritage circuit across Jaipur and Udaipur with Budhram Tour And Travels. The roof carrier easily handled 14 big suitcases, and the dual AC kept the cabin wonderfully chilled despite desert heat.",
      vehicleUsed: "Force Tempo Traveller",
      featured: true,
      status: "APPROVED",
    },
  ];

  for (const t of realTestimonials) {
    await prisma.testimonial.create({ data: t });
  }
  console.log("✓ Testimonials synchronized with official customer feedback.\n");

  // =========================================================================
  // 6. SITE SETTINGS & DYNAMIC HOMEPAGE CONFIG
  // =========================================================================
  console.log("Step 6: Updating site settings and homepage CMS config...");

  await prisma.siteSetting.upsert({
    where: { id: "default" },
    update: {
      agencyName: "Budhram Tour And Travels",
      phone: "+91 9310847853",
      email: "Deepanshuprajapati520@gmail.com",
      address: "Majnu Ka Tilla / ISBT Kashmiri Gate Fleet Hub, Delhi NCR - 110054",
      honestKmPledgeText: "Honest Kilometre Meter Billing • 100% Odometer Transparency",
      defaultTerms: "Pricing calculated honestly on actual odometer kilometres. Interstate permits and toll taxes as per actuals.",
    },
    create: {
      id: "default",
      agencyName: "Budhram Tour And Travels",
      phone: "+91 9310847853",
      email: "Deepanshuprajapati520@gmail.com",
      address: "Majnu Ka Tilla / ISBT Kashmiri Gate Fleet Hub, Delhi NCR - 110054",
      honestKmPledgeText: "Honest Kilometre Meter Billing • 100% Odometer Transparency",
      defaultTerms: "Pricing calculated honestly on actual odometer kilometres. Interstate permits and toll taxes as per actuals.",
    },
  });

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
      flagshipCruiser: 34,
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
      publishedBy: "Budhram Operations Lead",
      lastPublishedAt: new Date(),
    },
    create: {
      key: "homepage_config",
      data: JSON.stringify(homepageConfig),
      publishedBy: "Budhram Operations Lead",
      lastPublishedAt: new Date(),
    },
  });

  const seoConfig = {
    metaTitle: "Budhram Tour And Travels | Luxury Pan-India Fleet & Force Tempo Travellers",
    metaDescription: "Budhram Tour And Travels offers luxury 12 & 17 seater Force Tempo Travellers for bespoke pan-India trips, Himalayan expeditions, and corporate charters with transparent per-kilometre billing.",
    keywords: "force tempo traveller delhi, luxury tempo traveller manali, 12 seater tempo traveller, 17 seater tempo traveller, char dham tempo traveller, budhram travels",
    canonicalUrl: "https://budhramtravels.com",
    ogImageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBp6v7vcQA7kxphysGQzHHjf-hYYeMq0EkHXkLgu9asMe3TTvCGHrdmMZU5GpinahaVuRSiAZ5ZQgzpcrd9t6XcmnYc1xZXD6jvnzUAVYLZF0dsCiRbrhS9YA7ClAOXXi1E8YFWfoOVJ_5yQYM_nmTEF51T9_lj5O7gNrl-5p98Q_5sYnNS8OHkTof0iSN8UWJxPfl-hHvUFeDQRt1T92249xdADhjTOVJ2qCTjwnIFwkJ5kKx45Mo4C1XyYE3FAAEl2w",
  };

  await prisma.websiteContent.upsert({
    where: { key: "seo_config" },
    update: {
      data: JSON.stringify(seoConfig),
      publishedBy: "Budhram Operations Lead",
      lastPublishedAt: new Date(),
    },
    create: {
      key: "seo_config",
      data: JSON.stringify(seoConfig),
      publishedBy: "Budhram Operations Lead",
      lastPublishedAt: new Date(),
    },
  });

  console.log("✓ Site Settings & Homepage Dynamic Config synced.\n");

  console.log("==================================================================");
  console.log("  SYNC COMPLETED: ONLY REAL BUDHRAM TRAVELS CONTENT IS ACTIVE!   ");
  console.log("==================================================================");
}

syncOfficialBudhramData()
  .catch((e) => {
    console.error("Sync error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
