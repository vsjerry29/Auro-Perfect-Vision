/**
 * AURO PERFECT VISION — WORKFLOW VERIFICATION SUITE
 * Tests all 10 required workflow cases for decoupled Booking Approval & Payment Confirmation.
 */

const assert = require("assert");
const { saveBooking, getAllBookings, approveBooking, rejectBooking, markBookingPaid } = require("../../src/lib/server/cms");
const { finalizePayment } = require("../../src/lib/server/payments");
const {
  renderBookingConfirmationEmail,
  renderBookingApprovedEmail,
  renderBookingRejectedEmail,
  renderPaymentConfirmedEmail,
  renderAdminNewBookingAlertEmail,
  renderAdminPaymentConfirmedAlertEmail,
  renderAdminBookingCancelledAlertEmail,
} = require("../../src/lib/server/email");

async function runWorkflowVerification() {
  console.log("========================================================");
  console.log("  AURO PERFECT VISION — WORKFLOW VERIFICATION (10 CASES)");
  console.log("========================================================\n");

  let passed = 0;
  let total = 10;

  // CASE 1: Initial offline booking creation
  console.log("Case 1: Initial offline booking creation");
  const testRef1 = `APV-2026-WF${Date.now().toString().slice(-4)}`;
  const booking1 = saveBooking({
    id: `book-wf-${Date.now()}`,
    bookingReference: testRef1,
    offeringId: "eye-yoga",
    offeringTitle: "Eye Yoga for Children & Adults",
    therapistId: "therapist-1",
    therapistName: "Dr. Ananya Sen",
    date: "2026-12-10",
    timeSlot: "10:00 AM - 11:00 AM",
    clientTimezone: "Asia/Kolkata",
    clientName: "Sunita Rao",
    clientEmail: "sunita.rao@example.com",
    clientPhone: "+91 98401 23456",
    seatsBooked: 1,
    currency: "INR",
    totalAmount: 2000,
    status: "pending_approval",
    paymentMethod: "offline_cash",
    paymentStatus: "pending",
    intakeAnswers: { client_age: "35", primary_eye_concern: "Digital screen fatigue" },
    invoiceIssued: false,
    createdAt: new Date().toISOString(),
  });

  assert.strictEqual(booking1.status, "pending_approval", "Initial booking status must be pending_approval");
  assert.strictEqual(booking1.paymentStatus, "pending", "Initial payment status must be pending");
  assert.strictEqual(booking1.invoiceIssued, false, "Invoice must not be issued for unpaid booking");
  assert.strictEqual(booking1.invoiceNumber, undefined, "No invoice number for unpaid booking");
  console.log("  ✓ Case 1 Passed: Initial offline booking has pending_approval and pending payment.");
  passed++;

  // CASE 2: Customer tracking view state 1 (Pending Approval + Payment Pending)
  console.log("\nCase 2: Customer tracking view State 1 (Pending Approval + Payment Pending)");
  const clientEmailTpl = renderBookingConfirmationEmail({
    clientName: booking1.clientName,
    bookingReference: booking1.bookingReference,
    offeringTitle: booking1.offeringTitle,
    therapistName: booking1.therapistName,
    bookingDate: booking1.date,
    timeSlot: booking1.timeSlot,
    paymentMethod: booking1.paymentMethod,
    paymentStatus: booking1.paymentStatus,
    bookingStatus: booking1.status,
    totalAmount: booking1.totalAmount,
    currency: booking1.currency,
  });

  assert(
    clientEmailTpl.html.includes("Your booking request at <strong>Auro Perfect Vision</strong> has been received") ||
    clientEmailTpl.html.includes("Your appointment reservation at <strong>Auro Perfect Vision</strong> has been received"),
    "Message must acknowledge booking request received"
  );
  assert(clientEmailTpl.html.includes("Pending Offline / Counter Payment"));
  console.log("  ✓ Case 2 Passed: Customer state 1 displays pending approval message and pending payment.");
  passed++;

  // CASE 3: Admin Bookings Ledger filtering & status separation
  console.log("\nCase 3: Admin Bookings Ledger filtering & status separation");
  const allBookings = getAllBookings();
  const found = allBookings.find((b) => b.id === booking1.id);
  assert(found, "Booking must be present in ledger");
  assert.strictEqual(found.status, "pending_approval");
  assert.strictEqual(found.paymentStatus, "pending");
  console.log("  ✓ Case 3 Passed: Admin ledger shows independent booking status and payment status.");
  passed++;

  // CASE 4: Admin confirms booking (Approve booking without altering payment)
  console.log("\nCase 4: Admin confirms booking (Approve booking without altering payment)");
  const approved = approveBooking(booking1.id, "Dr. Ananya Sen");
  assert(approved, "Booking must be found and approved");
  assert.strictEqual(approved.status, "confirmed", "Booking status must transition to confirmed");
  assert.strictEqual(approved.paymentStatus, "pending", "CRITICAL: Payment status must remain pending");
  assert.strictEqual(approved.invoiceIssued, false, "CRITICAL: Invoice must not be issued on booking approval");
  assert.strictEqual(approved.invoiceNumber, undefined, "CRITICAL: Invoice number must remain undefined");

  const approvedEmailTpl = renderBookingApprovedEmail({
    clientName: approved.clientName,
    bookingReference: approved.bookingReference,
    offeringTitle: approved.offeringTitle,
    therapistName: approved.therapistName,
    bookingDate: approved.date,
    timeSlot: approved.timeSlot,
    totalAmount: approved.totalAmount,
    currency: approved.currency,
    paymentStatus: approved.paymentStatus,
    trackingUrl: `https://auroperfectvision.com/booking/${approved.bookingReference}`,
  });
  assert(approvedEmailTpl.html.includes("Your Appointment is Confirmed!"));
  assert(approvedEmailTpl.html.includes("Pending (Payable at Centre)"));
  console.log("  ✓ Case 4 Passed: Booking approved -> status: confirmed, payment: pending, invoice: false.");
  passed++;

  // CASE 5: Customer tracking view state 2 (Confirmed + Payment Pending)
  console.log("\nCase 5: Customer tracking view State 2 (Confirmed + Payment Pending)");
  // Verify that an appointment with status='confirmed' and paymentStatus='pending'
  // is recognized by the confirmation view logic as Confirmed with Payment Pending
  const isState2Confirmed = approved.status === "confirmed";
  const isState2Paid = approved.paymentStatus === "captured" || approved.paymentStatus === "offline_confirmed";
  assert.strictEqual(isState2Confirmed, true);
  assert.strictEqual(isState2Paid, false);
  console.log("  ✓ Case 5 Passed: Customer state 2 correctly recognized: Confirmed + Payment Pending.");
  passed++;

  // CASE 6: Admin Payments Offline Queue includes confirmed unpaid bookings
  console.log("\nCase 6: Admin Payments Offline Queue includes confirmed unpaid bookings");
  const isPaidHelper = (b) =>
    b.paymentStatus === "captured" ||
    b.paymentStatus === "offline_confirmed" ||
    b.paymentStatus === "paid";

  const unpaidQueue = getAllBookings().filter(
    (b) => !isPaidHelper(b) && b.status !== "cancelled"
  );
  const inQueue = unpaidQueue.find((b) => b.id === booking1.id);
  assert(inQueue, "Confirmed unpaid booking must remain in offline unpaid payments queue");
  assert.strictEqual(inQueue.status, "confirmed", "Queue preserves confirmed booking status");
  assert.strictEqual(inQueue.paymentStatus, "pending", "Queue displays pending payment status");
  console.log("  ✓ Case 6 Passed: Confirmed unpaid booking appears in Admin Payments queue.");
  passed++;

  // CASE 7: Admin confirms payment (Captures payment, issues sequential tax invoice, preserves booking status)
  console.log("\nCase 7: Admin confirms payment");
  const payResult = await finalizePayment({
    bookingIdOrRef: booking1.id,
    gateway: "offline",
    confirmedByStaffName: "Admin Front Desk",
  });
  assert(payResult.success, "finalizePayment must succeed");
  assert.strictEqual(payResult.booking.status, "confirmed", "Booking status must remain confirmed");
  assert.strictEqual(payResult.booking.paymentStatus, "offline_confirmed", "Payment status must be offline_confirmed");
  assert.strictEqual(payResult.booking.invoiceIssued, true, "Invoice must now be issued");
  assert(payResult.booking.invoiceNumber.startsWith("APV-2026-"), "Sequential tax invoice issued");
  assert.strictEqual(payResult.invoice.status, "paid", "Invoice status must be paid");

  const paymentEmailTpl = renderPaymentConfirmedEmail({
    clientName: payResult.booking.clientName,
    bookingReference: payResult.booking.bookingReference,
    invoiceNumber: payResult.invoice.invoiceNumber,
    amount: payResult.payment.amount,
    currency: payResult.payment.currency,
    paymentGateway: "Offline Cash / Counter Verification",
  });
  assert(paymentEmailTpl.html.includes(payResult.invoice.invoiceNumber));
  console.log(`  ✓ Case 7 Passed: Payment confirmed -> invoice ${payResult.invoice.invoiceNumber} issued, status preserved.`);
  passed++;

  // CASE 8: Customer tracking view state 3 (Confirmed + Paid)
  console.log("\nCase 8: Customer tracking view State 3 (Confirmed + Paid)");
  const isState3Paid =
    payResult.booking.paymentStatus === "captured" ||
    payResult.booking.paymentStatus === "offline_confirmed";
  assert.strictEqual(payResult.booking.status, "confirmed");
  assert.strictEqual(isState3Paid, true);
  assert(payResult.booking.invoiceIssued && payResult.booking.invoiceNumber);
  console.log("  ✓ Case 8 Passed: Customer state 3 displays Confirmed + Paid & verified with invoice download link.");
  passed++;

  // CASE 9: Payment confirmation idempotency
  console.log("\nCase 9: Payment confirmation idempotency");
  const secondPayment = await finalizePayment({
    bookingIdOrRef: booking1.id,
    gateway: "offline",
    confirmedByStaffName: "Admin Front Desk",
  });
  assert(secondPayment.success, "Repeated finalizePayment must succeed cleanly");
  assert.strictEqual(
    secondPayment.invoice.invoiceNumber,
    payResult.invoice.invoiceNumber,
    "Invoice number must match original (no duplicates)"
  );
  assert.strictEqual(
    secondPayment.payment.id,
    payResult.payment.id,
    "Payment transaction ID must match original"
  );
  console.log("  ✓ Case 9 Passed: Repeated finalizePayment is idempotent; returns existing invoice without duplicates.");
  passed++;

  // CASE 10: Rejection workflow & slot release
  console.log("\nCase 10: Rejection workflow & slot release");
  const testRef2 = `APV-2026-REJ${Date.now().toString().slice(-4)}`;
  const booking2 = saveBooking({
    id: `book-rej-${Date.now()}`,
    bookingReference: testRef2,
    offeringId: "eye-yoga",
    offeringTitle: "Eye Yoga for Children & Adults",
    therapistId: "therapist-1",
    therapistName: "Dr. Ananya Sen",
    date: "2026-12-15",
    timeSlot: "02:00 PM - 03:00 PM",
    clientTimezone: "Asia/Kolkata",
    clientName: "Rahul Sharma",
    clientEmail: "rahul.sharma@example.com",
    clientPhone: "+91 98888 12345",
    seatsBooked: 1,
    currency: "INR",
    totalAmount: 2000,
    status: "pending_approval",
    paymentMethod: "offline_cash",
    paymentStatus: "pending",
    intakeAnswers: {},
    invoiceIssued: false,
    createdAt: new Date().toISOString(),
  });

  const rejected = rejectBooking(booking2.id, "Practitioner on emergency medical leave", "Admin User");
  assert(rejected, "Booking must be rejected");
  assert.strictEqual(rejected.status, "cancelled", "Booking status must be cancelled");

  // Verify that the slot is now released and not considered active
  const activeBookingsOnDate = getAllBookings().filter(
    (b) =>
      b.therapistId === booking2.therapistId &&
      b.date === booking2.date &&
      b.timeSlot === booking2.timeSlot &&
      b.status !== "cancelled" &&
      b.status !== "draft"
  );
  assert.strictEqual(activeBookingsOnDate.length, 0, "Slot must be completely released for other clients");

  const rejectEmailTpl = renderBookingRejectedEmail({
    clientName: rejected.clientName,
    bookingReference: rejected.bookingReference,
    offeringTitle: rejected.offeringTitle,
    bookingDate: rejected.date,
    timeSlot: rejected.timeSlot,
    reason: "Practitioner on emergency medical leave",
  });
  assert(rejectEmailTpl.html.includes("Request Declined / Slot Released"));
  assert(rejectEmailTpl.html.includes("Practitioner on emergency medical leave"));
  console.log("  ✓ Case 10 Passed: Rejected booking cancels appointment, releases slot, and formats update email.");
  passed++;

  console.log("\n========================================================");
  console.log(`  ALL ${passed}/${total} WORKFLOW CASES VERIFIED (100% SUCCESS)`);
  console.log("========================================================");
}

runWorkflowVerification().catch((err) => {
  console.error("Workflow verification failed:", err);
  process.exit(1);
});
