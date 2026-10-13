/**
 * WhatsApp Business Cloud API Integration Service
 * Dispatches real-time WhatsApp notifications to Admin upon new website inquiries
 */
const env = require("../config/env");

async function sendAdminWhatsAppNotification(inquiry) {
  const token = env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = env.WHATSAPP_PHONE_NUMBER_ID;
  const rawAdminNumber = env.WHATSAPP_ADMIN_NUMBER || "919310847853";

  // Sanitize Admin Phone Number (E.164 format without '+')
  const cleanAdminNumber = rawAdminNumber.replace(/\D/g, "");

  // Format Travel Date
  let travelDateStr = "Flexible / As needed";
  if (inquiry.travelDate) {
    const tDate = new Date(inquiry.travelDate);
    if (!isNaN(tDate.getTime())) {
      travelDateStr = tDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } else {
      travelDateStr = String(inquiry.travelDate);
    }
  }

  const inqId = inquiry.inquiryId || inquiry.id || "INQ-NEW";

  // Construct message text matching exact specification
  const messageBody = [
    "🚨 *NEW WEBSITE INQUIRY*",
    "",
    `*Inquiry ID:* ${inqId}`,
    `*Name:* ${inquiry.name}`,
    `*Phone:* ${inquiry.phone}`,
    `*Email:* ${inquiry.email || "Not provided"}`,
    `*Subject:* ${inquiry.subject || "Tour Package Inquiry"}`,
    `*Pickup:* ${inquiry.pickupLocation || inquiry.pickup || "Delhi NCR"}`,
    `*Destination:* ${inquiry.destination || inquiry.destinationCircuit || "Custom Route"}`,
    `*Travel Date:* ${travelDateStr}`,
    `*Passengers:* ${inquiry.passengers || "1"}`,
    `*Vehicle:* ${inquiry.vehicleChoice || inquiry.vehicle || "Force Tempo Traveller"}`,
    `*Message:* ${inquiry.message || "Customer requested quote via website form."}`,
    "",
    `*Source:* ${inquiry.source || "Website"}`,
  ].join("\n");

  // Check if WhatsApp Cloud API credentials are configured
  if (
    !token ||
    !phoneNumberId ||
    token.includes("your_token") ||
    token.includes("your_meta") ||
    phoneNumberId.includes("your_phone")
  ) {
    console.log(
      `[WhatsApp Alert - SIMULATION MODE] (No live Meta API token configured in .env)\nAlert recipient: +${cleanAdminNumber}\nMessage:\n${messageBody}\n`
    );
    return {
      success: false,
      status: "FAILED",
      error: "WhatsApp Cloud API credentials not configured in .env",
    };
  }

  try {
    const apiUrl = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: cleanAdminNumber,
        type: "text",
        text: {
          preview_url: false,
          body: messageBody,
        },
      }),
    });

    const data = await response.json();

    if (response.ok && data.messages?.[0]?.id) {
      console.log(`[WhatsApp Alert SUCCESS] Dispatched to +${cleanAdminNumber}, ID: ${data.messages[0].id}`);
      return {
        success: true,
        status: "SENT",
        messageId: data.messages[0].id,
      };
    } else {
      const errorMsg = data.error?.message || "WhatsApp Meta API returned an error";
      console.warn(`[WhatsApp Alert FAILED]:`, errorMsg);
      return {
        success: false,
        status: "FAILED",
        error: errorMsg,
      };
    }
  } catch (err) {
    console.error(`[WhatsApp Alert NETWORK ERROR]:`, err.message);
    return {
      success: false,
      status: "FAILED",
      error: err.message,
    };
  }
}

module.exports = {
  sendAdminWhatsAppNotification,
};
