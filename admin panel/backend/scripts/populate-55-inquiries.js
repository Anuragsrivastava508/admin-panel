require("dotenv").config({ path: ".env.local" });
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const realisticInquiries = [
  {
    name: "Vikram Malhotra",
    phone: "+91 98101 23456",
    email: "vikram.malhotra@gmail.com",
    subject: "Himalayan Expedition (Manali / Spiti / Ladakh)",
    pickup: "Delhi Airport T3",
    destination: "Delhi - Manali - Atal Tunnel - Sissu - Kasol",
    travelDate: new Date(Date.now() + 86400000 * 5),
    passengers: "12 Persons",
    vehicleChoice: "12 Seater Luxury Force Pushback Suite",
    message: "Family leisure tour with senior citizens. Need smooth driving and sanitized recliners with roof luggage rack.",
    status: "NEW",
    whatsappStatus: "SENT",
    crmStatus: "SUCCESS",
    source: "website",
  },
  {
    name: "Ananya Deshmukh",
    phone: "+91 98202 34567",
    email: "ananya.deshmukh@tcs.com",
    subject: "Corporate Event & Executive Group Fleet",
    pickup: "Cyber City Gurugram",
    destination: "Gurugram - Neemrana Fort Palace",
    travelDate: new Date(Date.now() + 86400000 * 3),
    passengers: "17 Persons",
    vehicleChoice: "17 Seater Force Grand Touring Coach",
    message: "Corporate offsite leadership team escort. Require GST bill and chauffeur in formal uniform.",
    status: "CONTACTED",
    whatsappStatus: "SENT",
    crmStatus: "SUCCESS",
    source: "website",
  },
  {
    name: "Col. Harpreet Singh",
    phone: "+91 98765 11223",
    email: "harpreet.singh@army.in",
    subject: "Pilgrimage & Sacred Circuit (Chardham / Kashi / Ayodhya)",
    pickup: "Ambala Cantt",
    destination: "Ambala - Rishikesh - Badrinath - Kedarnath Dham",
    travelDate: new Date(Date.now() + 86400000 * 10),
    passengers: "9 - 12 Persons",
    vehicleChoice: "Luxury Force Executive Cruiser (Dark Grey Flagship)",
    message: "Elderly parents Chardham yatra. Need experienced mountain chauffeur with all hill driving permits.",
    status: "FOLLOW_UP",
    whatsappStatus: "SENT",
    crmStatus: "SUCCESS",
    source: "website",
  },
  {
    name: "Dr. Rajeshwar Sharma",
    phone: "+91 94191 88776",
    email: "dr.sharma@aiims.edu",
    subject: "Pan-India Outstation KM Charter",
    pickup: "AIIMS New Delhi",
    destination: "Delhi - Agra - Jaipur - Pushkar (Golden Triangle)",
    travelDate: new Date(Date.now() + 86400000 * 7),
    passengers: "9 - 12 Persons",
    vehicleChoice: "12 Seater Luxury Force Pushback Suite",
    message: "Medical conference delegates sightseeing tour across Golden Triangle. Transparent per-km meter billing preferred.",
    status: "CONVERTED",
    whatsappStatus: "SENT",
    crmStatus: "SUCCESS",
    source: "website",
  },
  {
    name: "Meenakshi Sundaram",
    phone: "+91 98403 99887",
    email: "meenakshi.s@infosys.com",
    subject: "Destination Wedding Fleet Escort",
    pickup: "Aerocity Hotel Pullman, New Delhi",
    destination: "Delhi - Jim Corbett National Park & Resort",
    travelDate: new Date(Date.now() + 86400000 * 14),
    passengers: "18+ Group Fleet",
    vehicleChoice: "Custom Multi-Vehicle Group Fleet",
    message: "Wedding guest logistics. Need two 17-seater Tempo Travellers for 3 days round-trip with chauffeur night stays.",
    status: "NEW",
    whatsappStatus: "PENDING",
    crmStatus: "SUCCESS",
    source: "website",
  },
  {
    name: "Karan Johar Mehra",
    phone: "+91 99100 44556",
    email: "karan.mehra@rediffmail.com",
    subject: "Himalayan Expedition (Manali / Spiti / Ladakh)",
    pickup: "Chandigarh Sector 17",
    destination: "Chandigarh - Shimla - Narkanda - Sangla - Spiti Valley",
    travelDate: new Date(Date.now() + 86400000 * 12),
    passengers: "5 - 8 Persons",
    vehicleChoice: "Luxury Force Executive Cruiser (Dark Grey Flagship)",
    message: "High-altitude photographic expedition. Ample boot space required for camera equipment and tripods.",
    status: "NEW",
    whatsappStatus: "SENT",
    crmStatus: "SUCCESS",
    source: "website",
  },
  {
    name: "Pooja Hegde Bhatt",
    phone: "+91 98211 66778",
    email: "pooja.bhatt@outlook.com",
    subject: "Pan-India Outstation KM Charter",
    pickup: "Noida Sector 62",
    destination: "Noida - Mathura - Vrindavan - Barsana Day Circuit",
    travelDate: new Date(Date.now() + 86400000 * 2),
    passengers: "9 - 12 Persons",
    vehicleChoice: "12 Seater Luxury Force Pushback Suite",
    message: "Same-day spiritual Darshan tour. Early morning 5:00 AM pickup from residential society gate.",
    status: "CONTACTED",
    whatsappStatus: "SENT",
    crmStatus: "SUCCESS",
    source: "website",
  },
  {
    name: "Rohan Singhania",
    phone: "+91 97110 55443",
    email: "rohan.singhania@apexcapital.in",
    subject: "Corporate Event & Executive Group Fleet",
    pickup: "Connaught Place, New Delhi",
    destination: "Delhi - Chandigarh IT Park Round Trip",
    travelDate: new Date(Date.now() + 86400000 * 6),
    passengers: "13 - 17 Persons",
    vehicleChoice: "17 Seater Force Grand Touring Coach",
    message: "Client audit delegation travel. Need Wi-Fi on board and icebox with bottled mineral water.",
    status: "FOLLOW_UP",
    whatsappStatus: "SENT",
    crmStatus: "SUCCESS",
    source: "website",
  },
  {
    name: "Gurpreet Kaur Dhillon",
    phone: "+91 98888 77665",
    email: "gurpreet.dhillon@yahoo.co.in",
    subject: "Himalayan Expedition (Manali / Spiti / Ladakh)",
    pickup: "Ludhiana Grand Walk",
    destination: "Ludhiana - Dharamshala - McLeodganj - Dalhousie",
    travelDate: new Date(Date.now() + 86400000 * 8),
    passengers: "9 - 12 Persons",
    vehicleChoice: "12 Seater Luxury Force Pushback Suite",
    message: "College friends reunion. Safe hill driver required with clean record.",
    status: "CLOSED",
    whatsappStatus: "SENT",
    crmStatus: "SUCCESS",
    source: "website",
  },
  {
    name: "Sunil Narang",
    phone: "+91 98112 33445",
    email: "sunil.narang@narangtextiles.com",
    subject: "Destination Wedding Fleet Escort",
    pickup: "Faridabad Sector 15",
    destination: "Faridabad - Jaipur Kukas Palace",
    travelDate: new Date(Date.now() + 86400000 * 18),
    passengers: "18+ Group Fleet",
    vehicleChoice: "Custom Multi-Vehicle Group Fleet",
    message: "Baraat party escort. Multiple luggage pieces and formal garments.",
    status: "CONVERTED",
    whatsappStatus: "SENT",
    crmStatus: "SUCCESS",
    source: "website",
  }
];

const indianFirstNames = [
  "Amit", "Pooja", "Rajesh", "Sunita", "Deepak", "Kavita", "Sanjay", "Neelam",
  "Alok", "Priyanka", "Manoj", "Shweta", "Ramesh", "Geeta", "Vikram", "Neha",
  "Gaurav", "Divya", "Suresh", "Rekha", "Arun", "Pallavi", "Naveen", "Archana",
  "Abhishek", "Ritu", "Vivek", "Preeti", "Kishore", "Anjali", "Harish", "Smriti",
  "Kapil", "Monika", "Tarun", "Shilpa", "Mohit", "Tanvi", "Sachin", "Swati",
  "Pankaj", "Vandana", "Hemant", "Rachna", "Ashish", "Bhavna", "Dharmendra"
];

const indianLastNames = [
  "Sharma", "Verma", "Gupta", "Malhotra", "Kapoor", "Bhatia", "Chawla", "Saxena",
  "Bansal", "Mittal", "Aggarwal", "Chopra", "Mehta", "Jain", "Khurana", "Sethi",
  "Ahluwalia", "Grover", "Tandon", "Arora", "Nagpal", "Kohli", "Narang", "Bhardwaj"
];

const sampleCircuits = [
  { subject: "Himalayan Expedition (Manali / Spiti / Ladakh)", pickup: "Delhi Airport", dest: "Delhi - Manali - Rohtang Pass - Solang Valley", pax: "12 Persons", vehicle: "12 Seater Luxury Force Pushback Suite" },
  { subject: "Pan-India Outstation KM Charter", pickup: "Gurugram DLF Phase 5", dest: "Gurugram - Jaipur - Udaipur Heritage Circuit", pax: "9 - 12 Persons", vehicle: "12 Seater Luxury Force Pushback Suite" },
  { subject: "Pilgrimage & Sacred Circuit (Chardham / Kashi / Ayodhya)", pickup: "Noida Sector 18", dest: "Noida - Haridwar - Rishikesh - Devprayag", pax: "13 - 17 Persons", vehicle: "17 Seater Force Grand Touring Coach" },
  { subject: "Corporate Event & Executive Group Fleet", pickup: "Aerocity New Delhi", dest: "Delhi - Agra Taj Mahal Express Charter", pax: "9 - 12 Persons", vehicle: "Luxury Force Executive Cruiser (Dark Grey Flagship)" },
  { subject: "Himalayan Expedition (Manali / Spiti / Ladakh)", pickup: "Chandigarh Airport", dest: "Chandigarh - Shimla - Kufri - Chail", pax: "5 - 8 Persons", vehicle: "12 Seater Luxury Force Pushback Suite" },
  { subject: "Destination Wedding Fleet Escort", pickup: "Delhi NCR", dest: "Delhi - Mussoorie - Dhanaulti Hills", pax: "18+ Group Fleet", vehicle: "Custom Multi-Vehicle Group Fleet" },
  { subject: "Pilgrimage & Sacred Circuit (Chardham / Kashi / Ayodhya)", pickup: "Ghaziabad RDC", dest: "Ghaziabad - Mathura - Vrindavan - Govardhan", pax: "9 - 12 Persons", vehicle: "12 Seater Luxury Force Pushback Suite" },
  { subject: "Pan-India Outstation KM Charter", pickup: "South Extension Delhi", dest: "Delhi - Ranthambore Tiger Reserve Safari", pax: "9 - 12 Persons", vehicle: "Luxury Force Executive Cruiser (Dark Grey Flagship)" },
  { subject: "Corporate Event & Executive Group Fleet", pickup: "Cyber City Gurugram", dest: "Gurugram - Sariska Palace Alwar Offsite", pax: "13 - 17 Persons", vehicle: "17 Seater Force Grand Touring Coach" },
  { subject: "Himalayan Expedition (Manali / Spiti / Ladakh)", pickup: "Delhi Kashmiri Gate", dest: "Delhi - Kasol - Manikaran Sahib - Kheerganga", pax: "9 - 12 Persons", vehicle: "12 Seater Luxury Force Pushback Suite" },
];

const sampleStatuses = ["NEW", "CONTACTED", "FOLLOW_UP", "CONVERTED", "CLOSED", "CANCELLED"];

async function seed55Inquiries() {
  console.log("Generating 55 realistic website inquiries & bookings for user inspection...");

  const existingCount = await prisma.enquiry.count();
  console.log(`Current enquiries in DB: ${existingCount}`);

  // Create or retrieve master Admin user
  let admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (!admin) {
    admin = await prisma.user.findFirst();
  }

  const vehicles = await prisma.vehicle.findMany();
  const drivers = await prisma.driver.findMany();

  let createdInquiries = 0;
  let createdBookings = 0;

  for (let i = 0; i < 55; i++) {
    let leadData;
    if (i < realisticInquiries.length) {
      leadData = realisticInquiries[i];
    } else {
      const fName = indianFirstNames[i % indianFirstNames.length];
      const lName = indianLastNames[i % indianLastNames.length];
      const fullName = `${fName} ${lName}`;
      const circuit = sampleCircuits[i % sampleCircuits.length];
      const phoneNum = `+91 ${98100 + (i * 137)} ${String(10000 + (i * 321)).slice(0, 5)}`;
      const emailAddr = `${fName.toLowerCase()}.${lName.toLowerCase()}${i}@gmail.com`;
      const status = sampleStatuses[i % sampleStatuses.length];
      const waStatus = i % 7 === 0 ? "PENDING" : (i % 11 === 0 ? "FAILED" : "SENT");

      leadData = {
        name: fullName,
        phone: phoneNum,
        email: emailAddr,
        subject: circuit.subject,
        pickup: circuit.pickup,
        destination: circuit.dest,
        travelDate: new Date(Date.now() + 86400000 * (1 + (i % 25))),
        passengers: circuit.pax,
        vehicleChoice: circuit.vehicle,
        message: `Inquiry submitted via budhramtravels.com for ${circuit.subject}. Pickup: ${circuit.pickup}, Route: ${circuit.dest}. Group: ${circuit.pax}.`,
        status: status,
        whatsappStatus: waStatus,
        crmStatus: "SUCCESS",
        source: "website",
      };
    }

    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const inqId = `INQ-${todayStr}-${String(100 + i + 1).padStart(3, "0")}`;

    // Upsert customer
    let customer = await prisma.customer.findFirst({
      where: { phone: leadData.phone },
    });
    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name: leadData.name,
          phone: leadData.phone,
          email: leadData.email,
          city: leadData.pickup.split(" ")[0] || "Delhi NCR",
        },
      });
    }

    // Upsert enquiry
    const existing = await prisma.enquiry.findUnique({ where: { id: inqId } });
    let enquiryRecord;
    if (!existing) {
      enquiryRecord = await prisma.enquiry.create({
        data: {
          id: inqId,
          customerId: customer.id,
          name: leadData.name,
          phone: leadData.phone,
          email: leadData.email,
          pickupLocation: leadData.pickup,
          destinationCircuit: leadData.destination,
          subject: leadData.subject,
          travelDate: leadData.travelDate,
          passengers: leadData.passengers,
          vehicleChoice: leadData.vehicleChoice,
          message: leadData.message,
          estimatedFare: 18500 + (i * 850),
          status: leadData.status,
          crmStatus: leadData.crmStatus,
          whatsappStatus: leadData.whatsappStatus,
          source: leadData.source,
          internalNotes: `Auto-registered via website gateway. Customer VIP tier: Standard. Chauffeur guidance: Seasoned hill driver.`,
        },
      });
      createdInquiries++;
    } else {
      enquiryRecord = existing;
    }

    // If status is CONVERTED, also create a confirmed Booking manifest
    if (leadData.status === "CONVERTED") {
      const pnr = `BTT-2026-${String(200 + i).padStart(5, "0")}`;
      const existingBooking = await prisma.booking.findUnique({ where: { id: pnr } });

      if (!existingBooking) {
        const assignedVehicle = vehicles[i % (vehicles.length || 1)] || null;
        const assignedDriver = drivers[i % (drivers.length || 1)] || null;
        const totalAmount = 32000 + (i * 1200);
        const advanceAmount = 10000;

        const booking = await prisma.booking.create({
          data: {
            id: pnr,
            pnr: pnr,
            customerId: customer.id,
            vehicleId: assignedVehicle?.id || null,
            driverId: assignedDriver?.id || null,
            source: "WEBSITE_CONVERTED",
            bookingStatus: "CONFIRMED",
            paymentStatus: "PARTIAL",
            pickupLocation: leadData.pickup,
            destination: leadData.destination,
            travelDate: leadData.travelDate,
            returnDate: new Date(leadData.travelDate.getTime() + 86400000 * 3),
            passengerCount: 12,
            ratePerKm: 26,
            estimatedKm: 1100,
            totalAmount: totalAmount,
            advancePaid: advanceAmount,
            specialNotes: `Converted from Inquiry #${inqId}. Confirmed client request: Pushback seats and roof carrier.`,
          },
        });

        // Add payment record
        await prisma.payment.create({
          data: {
            transactionId: `TXN-UPI-${Date.now().toString().slice(-6)}-${i}`,
            bookingId: booking.id,
            amount: advanceAmount,
            paymentMethod: "UPI",
            paymentStatus: "PAID",
            referenceNote: "25% Token booking advance received via official QR / UPI gateway.",
          },
        });

        createdBookings++;
      }
    }
  }

  const finalEnquiriesCount = await prisma.enquiry.count();
  const finalBookingsCount = await prisma.booking.count();
  const finalCustomersCount = await prisma.customer.count();

  console.log(`\n=== 55 Users Population Complete ===`);
  console.log(`Total Enquiries in CRM: ${finalEnquiriesCount}`);
  console.log(`Total Bookings in CRM: ${finalBookingsCount}`);
  console.log(`Total Customers in CRM: ${finalCustomersCount}`);
  console.log(`\nAll records are now LIVE in the database for the user to view at http://localhost:3001/enquiries and http://localhost:3001/bookings`);
}

seed55Inquiries()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
