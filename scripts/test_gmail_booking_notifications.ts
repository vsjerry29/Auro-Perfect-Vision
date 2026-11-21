import assert from "assert";
import {
  getEmailSender,
  getEmailReplyTo,
  getAdminNotificationEmail,
  getContactEmail,
  renderBookingConfirmationEmail,
  renderAdminNewBookingAlertEmail,
  renderAdminPaymentConfirmedAlertEmail,
  renderAdminBookingCancelledAlertEmail,
  renderContactInquiryAdminEmail,
  renderContactAcknowledgmentClientEmail,
} from "../src/lib/server/email";
import { calculateOfferingPrice } from "../src/lib/server/payments";
import { getSiteContent } from "../src/lib/server/cms";

async function runTests() {
  console.log("=================================================");
  console.log("  TESTING AURO PERFECT VISION GMAIL NOTIFICATIONS");
  console.log("=================================================");

  // 1. Verify Configuration Getters
  console.log("\n[Test 1] Verify Official Email Config");
  assert.strictEqual(getAdminNotificationEmail(), "auroperfectvision@gmail.com");
  assert.strictEqual(getEmailReplyTo(), "auroperfectvision@gmail.com");
  assert.strictEqual(getContactEmail(), "auroperfectvision@gmail.com");
  assert(getEmailSender().includes("notifications@auroperfectvision.com"));
  console.log("✓ Admin notification email:", getAdminNotificationEmail());
  console.log("✓ Email reply-to:", getEmailReplyTo());
  console.log("✓ Contact email:", getContactEmail());
  console.log("✓ Resend verified sender:", getEmailSender());

  // 2. Verify CMS Content Default
  console.log("\n[Test 2] Verify CMS Site Content Email");
  const siteContent = getSiteContent();
  assert.strictEqual(siteContent.email, "auroperfectvision@gmail.com");
  console.log("✓ CMS site content email:", siteContent.email);

  // 3. Test Offline Booking Notification Templates
  console.log("\n[Test 3] Test Offline Booking Customer & Admin Emails");
  const bookingRef = `APV-TEST-${Date.now()}`;
  const pricing = calculateOfferingPrice("eye-yoga", "INR", 2);

  // 3a. Customer email for offline booking
  const customerEmail = renderBookingConfirmationEmail({
    clientName: "Deepak Verma",
    bookingReference: bookingRef,
    offeringTitle: "Conscious Eye Yoga",
    therapistName: "Dr. Ananya Sen",
    bookingDate: "2026-11-28",
    timeSlot: "10:00 AM - 11:00 AM",
    paymentMethod: "offline_cash",
    paymentStatus: "pending",
    totalAmount: pricing.amount,
    currency: "INR",
  });

  assert(customerEmail.html.includes("Booking Received — Payment Pending"));
  assert(customerEmail.html.includes("Pending Offline / Counter Payment"));
  assert(customerEmail.html.includes("auroperfectvision@gmail.com"));
  assert(customerEmail.text.includes("auroperfectvision@gmail.com"));
  console.log("✓ Customer offline booking email clearly notes 'Booking Received — Payment Pending'");
  console.log("✓ Customer email includes official contact 'auroperfectvision@gmail.com'");

  // 3b. Admin email for offline booking
  const adminEmail = renderAdminNewBookingAlertEmail({
    bookingReference: bookingRef,
    clientName: "Deepak Verma",
    clientEmail: "deepak@example.com",
    clientPhone: "+91 98401 22334",
    offeringTitle: "Conscious Eye Yoga",
    therapistName: "Dr. Ananya Sen",
    bookingDate: "2026-11-28",
    timeSlot: "10:00 AM - 11:00 AM",
    participants: 2,
    totalAmount: pricing.amount,
    currency: "INR",
    paymentMethod: "offline_cash",
    paymentStatus: "pending",
    bookingStatus: "confirmed",
    dashboardUrl: "https://auroperfectvision.com/admin/bookings",
  });

  assert(adminEmail.html.includes("NEW BOOKING — AURO PERFECT VISION"));
  assert(adminEmail.html.includes(bookingRef));
  assert(adminEmail.html.includes("Deepak Verma"));
  assert(adminEmail.html.includes("deepak@example.com"));
  assert(adminEmail.html.includes("+91 98401 22334"));
  assert(adminEmail.html.includes("Conscious Eye Yoga"));
  assert(adminEmail.html.includes("Dr. Ananya Sen"));
  assert(adminEmail.html.includes("2026-11-28"));
  assert(adminEmail.html.includes("10:00 AM - 11:00 AM"));
  assert(adminEmail.html.includes("2"));
  assert(adminEmail.html.includes(`₹${pricing.amount.toLocaleString("en-IN")}`));
  assert(adminEmail.html.includes("offline cash"));
  assert(adminEmail.html.includes("pending"));
  assert(adminEmail.html.includes("https://auroperfectvision.com/admin/bookings"));

  // Ensure NO intake or health answers leaked
  assert(!adminEmail.html.includes("clinicalAlerts"));
  assert(!adminEmail.html.includes("medicalHistory"));
  assert(!adminEmail.text.includes("clinicalAlerts"));
  console.log("✓ Admin new booking alert email formats all required fields accurately");
  console.log("✓ Admin alert strictly preserves patient privacy and excludes clinical intake data");

  // 4. Test Payment Confirmed Admin Alert
  console.log("\n[Test 4] Test Payment Confirmed Admin Alert");
  const paymentAlert = renderAdminPaymentConfirmedAlertEmail({
    bookingReference: bookingRef,
    invoiceNumber: "APV-2026-9999",
    clientName: "Deepak Verma",
    clientEmail: "deepak@example.com",
    offeringTitle: "Conscious Eye Yoga",
    therapistName: "Dr. Ananya Sen",
    totalAmount: pricing.amount,
    currency: "INR",
    paymentGateway: "RAZORPAY",
    paymentId: "pay_live_test_123",
    dashboardUrl: "https://auroperfectvision.com/admin/bookings",
  });

  assert(paymentAlert.html.includes("PAYMENT CONFIRMED — AURO PERFECT VISION"));
  assert(paymentAlert.html.includes("APV-2026-9999"));
  assert(paymentAlert.html.includes(bookingRef));
  assert(paymentAlert.html.includes(`₹${pricing.amount.toLocaleString("en-IN")}`));
  assert(paymentAlert.html.includes("RAZORPAY"));
  assert(paymentAlert.html.includes("pay_live_test_123"));
  console.log("✓ Admin payment confirmed alert accurately includes invoice, gateway and amount");

  // 5. Test Contact Form Inquiry Admin Alert & Client Acknowledgment
  console.log("\n[Test 5] Test Contact Form Notifications");
  const inqRef = `INQ-${Date.now()}`;
  const contactAdminAlert = renderContactInquiryAdminEmail({
    reference: inqRef,
    name: "Sowmya Raman",
    email: "sowmya@example.com",
    phone: "+91 97910 88776",
    category: "General Inquiry",
    subject: "Retreat Schedule in Auroville",
    message: "Could you share the dates for the next residential eye retreat?",
  });

  assert(contactAdminAlert.html.includes(inqRef));
  assert(contactAdminAlert.html.includes("Sowmya Raman"));
  assert(contactAdminAlert.html.includes("sowmya@example.com"));
  assert(contactAdminAlert.html.includes("+91 97910 88776"));

  const contactClientAck = renderContactAcknowledgmentClientEmail({
    name: "Sowmya Raman",
    reference: inqRef,
    subject: "Retreat Schedule in Auroville",
  });

  assert(contactClientAck.html.includes(inqRef));
  assert(contactClientAck.html.includes("Sowmya Raman"));
  assert(contactClientAck.html.includes("auroperfectvision@gmail.com"));
  console.log("✓ Contact inquiry admin alert formatted with direct client email");
  console.log("✓ Contact acknowledgment formatted with official contact email");

  console.log("\n=================================================");
  console.log("  ALL GMAIL NOTIFICATION CHECKS PASSED (100%)");
  console.log("=================================================");
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
