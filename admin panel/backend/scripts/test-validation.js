async function testValidation() {
  const fields = [
    { field: "name", payload: { phone: "9876543210", email: "test@example.com", subject: "Tour", destination: "Shimla", travelDate: "2026-10-20", passengers: "4" } },
    { field: "phone", payload: { name: "Raj", email: "test@example.com", subject: "Tour", destination: "Shimla", travelDate: "2026-10-20", passengers: "4" } },
    { field: "email", payload: { name: "Raj", phone: "9876543210", subject: "Tour", destination: "Shimla", travelDate: "2026-10-20", passengers: "4" } },
    { field: "subject", payload: { name: "Raj", phone: "9876543210", email: "test@example.com", destination: "Shimla", travelDate: "2026-10-20", passengers: "4" } },
    { field: "destination", payload: { name: "Raj", phone: "9876543210", email: "test@example.com", subject: "Tour", travelDate: "2026-10-20", passengers: "4" } },
    { field: "travelDate", payload: { name: "Raj", phone: "9876543210", email: "test@example.com", subject: "Tour", destination: "Shimla", passengers: "4" } },
    { field: "passengers", payload: { name: "Raj", phone: "9876543210", email: "test@example.com", subject: "Tour", destination: "Shimla", travelDate: "2026-10-20" } }
  ];

  for (const { field, payload } of fields) {
    const res = await fetch("http://localhost:3001/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    console.log(`[✓] Missing [${field}]: HTTP ${res.status} -> "${data.error}"`);
  }
}
testValidation();
