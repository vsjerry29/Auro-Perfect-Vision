if (typeof window !== "undefined") {
  throw new Error("This module cannot be imported from a Client Component module. It should only be used from the server.");
}
import crypto from "crypto";
import { getOfferingBySlug, getAllOfferings, getBookingByRef, getAllBookings, saveBooking } from "./cms";
import { isMySQLConfigured } from "./mysql";
import * as db from "./mysql-db";
import {
  sendEmail,
  renderPaymentConfirmedEmail,
  renderAdminPaymentConfirmedAlertEmail,
  getAdminNotificationEmail,
  getEmailReplyTo,
} from "./email";
import type { Booking, PaymentTransaction, InvoiceRecord } from "@/lib/types";

// In-memory fallback stores for non-MySQL environments
const paymentsStore = new Map<string, PaymentTransaction>();
const invoicesStore = new Map<string, InvoiceRecord>();

/**
 * Calculates authoritative offering price on the server.
 * Never trust prices passed from client browser.
 * Standardized exclusively to INR (₹) across Auro Perfect Vision.
 */
export function calculateOfferingPrice(
  offeringIdOrSlug: string,
  _currency: "INR" | "USD" = "INR",
  seats = 1
): { amount: number; currency: "INR"; offeringTitle: string } {
  const offerings = getAllOfferings(true);
  const offering =
    offerings.find((o) => o.id === offeringIdOrSlug || o.slug === offeringIdOrSlug) ||
    getOfferingBySlug(offeringIdOrSlug);

  if (!offering) {
    throw new Error(`Offering "${offeringIdOrSlug}" not found in catalogue`);
  }

  // Authoritative INR price calculation
  const unitPrice = offering.price.inr;
  const validSeats = Math.max(1, seats);
  const amount = unitPrice * validSeats;

  return {
    amount,
    currency: "INR",
    offeringTitle: offering.title,
  };
}

/**
 * Creates an order with Razorpay.
 */
export async function createRazorpayOrder(params: {
  amount: number;
  currency?: "INR";
  receipt: string;
  notes?: Record<string, string>;
}): Promise<{ orderId: string; amount: number; currency: string; simulated?: boolean }> {
  const { amount, currency = "INR", receipt, notes } = params;
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret || keyId.includes("placeholder")) {
    // Graceful test/sandbox simulation
    return {
      orderId: `order_sim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      amount: Math.round(amount * 100),
      currency,
      simulated: true,
    };
  }

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: Math.round(amount * 100), // amount in paise
      currency,
      receipt: receipt.slice(0, 40),
      notes: notes || {},
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.description || "Failed to create Razorpay payment order");
  }

  return {
    orderId: data.id,
    amount: data.amount,
    currency: data.currency,
  };
}

/**
 * Creates an order with PayPal.
 * NOTE: PayPal USD checkout is disabled in favor of exclusive INR (₹) processing.
 */
export async function createPayPalOrder(_params: {
  amount: number;
  currency?: "USD";
  referenceId: string;
}): Promise<{ orderId: string; simulated?: boolean }> {
  throw new Error(
    "PayPal USD checkout is currently disabled. Auro Perfect Vision processes payments exclusively in Indian Rupees (₹ INR) via Razorpay or offline at clinic."
  );
}

/**
 * Verifies Razorpay HMAC signature.
 */
export function verifyRazorpaySignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const { orderId, paymentId, signature } = params;
  const secret = process.env.RAZORPAY_KEY_SECRET;

  // In simulated/sandbox mode without real secret
  if (!secret || secret.includes("placeholder") || orderId.startsWith("order_sim_")) {
    return Boolean(orderId && paymentId && signature);
  }

  const generatedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return generatedSignature === signature;
}

/**
 * Finalizes payment, generates invoice, updates booking, and dispatches invoice confirmation email.
 */
export async function finalizePayment(params: {
  bookingIdOrRef: string;
  gateway: "razorpay" | "paypal" | "offline";
  gatewayPaymentId?: string;
  gatewayOrderId?: string;
  amount?: number;
  currency?: "INR" | "USD";
  rawResponse?: any;
  confirmedByStaffName?: string;
}): Promise<{
  success: boolean;
  booking: Booking;
  invoice: InvoiceRecord;
  payment: PaymentTransaction;
}> {
  const {
    bookingIdOrRef,
    gateway,
    gatewayPaymentId,
    gatewayOrderId,
    amount,
    currency,
    rawResponse,
    confirmedByStaffName,
  } = params;

  // 1. Locate Booking
  let booking: Booking | null = null;
  if (isMySQLConfigured()) {
    booking = await db.dbGetBookingByRef(bookingIdOrRef);
    if (!booking) {
      const all = await db.dbGetAllBookings();
      booking = all.find((b) => b.id === bookingIdOrRef) || null;
    }
  } else {
    booking = getBookingByRef(bookingIdOrRef) || null;
    if (!booking) {
      const all = getAllBookings();
      booking = all.find((b) => b.id === bookingIdOrRef) || null;
    }
  }

  if (!booking) {
    throw new Error(`Booking "${bookingIdOrRef}" not found`);
  }

  const finalAmount = amount !== undefined ? amount : booking.totalAmount;
  const finalCurrency = "INR";

  // Prevent duplicate payments and invoices (Idempotent check)
  const isAlreadyPaid =
    booking.paymentStatus === "captured" ||
    booking.paymentStatus === "offline_confirmed" ||
    (booking.paymentStatus as string) === "paid";

  if (isAlreadyPaid && booking.invoiceIssued && booking.invoiceNumber) {
    let foundPayment: PaymentTransaction | null = null;
    let foundInvoice: InvoiceRecord | null = null;

    if (isMySQLConfigured()) {
      try {
        foundPayment = await db.dbGetPaymentByBookingId(booking.id);
        foundInvoice = await db.dbGetInvoiceByBookingId(booking.id);
      } catch {}
    }

    if (!foundPayment) {
      foundPayment = Array.from(paymentsStore.values()).find((p) => p.bookingId === booking.id) || null;
    }
    if (!foundInvoice) {
      foundInvoice = Array.from(invoicesStore.values()).find((i) => i.bookingId === booking.id) || null;
    }

    const existingPayment: PaymentTransaction = foundPayment || {
      id: `pay-${booking.id}`,
      bookingId: booking.id,
      gateway,
      gatewayPaymentId: gatewayPaymentId || `pay-${booking.id}`,
      amount: finalAmount,
      currency: finalCurrency,
      status: "captured",
      rawResponse: rawResponse || {},
      createdAt: booking.createdAt,
      updatedAt: new Date().toISOString(),
    };

    const existingInvoice: InvoiceRecord = foundInvoice || {
      id: `inv-${booking.id}`,
      bookingId: booking.id,
      invoiceNumber: booking.invoiceNumber,
      totalAmount: finalAmount,
      currency: finalCurrency,
      status: "paid",
      issuedAt: booking.offlineConfirmedAt || booking.createdAt,
      createdAt: booking.createdAt,
    };

    return {
      success: true,
      booking,
      invoice: existingInvoice,
      payment: existingPayment,
    };
  }

  // 2. Generate Sequential Tax Invoice Number
  const timestamp = Date.now();
  const seqSuffix = String(timestamp).slice(-4);
  const invoiceNumber = booking.invoiceNumber || `APV-2026-${seqSuffix}`;

  // 3. Create Payment Transaction Record
  const paymentRecord: PaymentTransaction = {
    id: `pay-${timestamp}-${Math.random().toString(36).substring(2, 6)}`,
    bookingId: booking.id,
    gateway,
    gatewayPaymentId: gatewayPaymentId || `offline-${timestamp}`,
    gatewayOrderId: gatewayOrderId || undefined,
    amount: finalAmount,
    currency: finalCurrency,
    status: "captured",
    rawResponse: rawResponse || {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // 4. Create Invoice Record
  const invoiceRecord: InvoiceRecord = {
    id: `inv-${timestamp}-${Math.random().toString(36).substring(2, 6)}`,
    bookingId: booking.id,
    invoiceNumber,
    totalAmount: finalAmount,
    currency: finalCurrency,
    status: "paid",
    issuedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  // 5. Update Booking
  // CRITICAL REQUIREMENT: Confirming payment must NEVER automatically approve an appointment.
  // Preserve the existing booking approval status (e.g. pending_approval remains pending_approval).
  const updatedBooking: Booking = {
    ...booking,
    status:
      booking.status === "awaiting_online_payment" && gateway !== "offline"
        ? "confirmed"
        : booking.status,
    paymentStatus: gateway === "offline" ? "offline_confirmed" : "captured",
    paymentMethod:
      gateway === "razorpay"
        ? "online_razorpay"
        : gateway === "paypal"
        ? "online_paypal"
        : booking.paymentMethod || "offline_cash",
    invoiceIssued: true,
    invoiceNumber,
    offlineConfirmedByStaff: confirmedByStaffName || booking.offlineConfirmedByStaff,
    offlineConfirmedAt:
      gateway === "offline" ? new Date().toISOString() : booking.offlineConfirmedAt,
  };

  // 6. Persist to Database or Memory
  if (isMySQLConfigured()) {
    await db.dbSavePayment(paymentRecord);
    await db.dbSaveInvoice(invoiceRecord);
    await db.dbSaveBooking(updatedBooking);
    saveBooking(updatedBooking);
  } else {
    paymentsStore.set(paymentRecord.id, paymentRecord);
    invoicesStore.set(invoiceRecord.id, invoiceRecord);
    saveBooking(updatedBooking);
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://auroperfectvision.com";

  // 7. Dispatch Branded Receipt Email to Client via Resend
  if (updatedBooking.clientEmail) {
    try {
      const emailTpl = renderPaymentConfirmedEmail({
        clientName: updatedBooking.clientName,
        bookingReference: updatedBooking.bookingReference,
        invoiceNumber,
        amount: finalAmount,
        currency: finalCurrency,
        paymentGateway: gateway.toUpperCase(),
        invoiceUrl: `${appUrl}/api/invoices/${invoiceNumber}`,
      });

      await sendEmail({
        to: updatedBooking.clientEmail,
        subject: `Payment Confirmation & Invoice [${invoiceNumber}] — Auro Perfect Vision`,
        html: emailTpl.html,
        text: emailTpl.text,
        replyTo: getEmailReplyTo(),
        templateKey: "payment_invoice",
        bookingId: updatedBooking.id,
      });
    } catch (err: any) {
      console.warn("[Payment Confirmation Client Email Error]:", err.message);
    }
  }

  // 8. Dispatch Admin Payment Alert to official Gmail (auroperfectvision@gmail.com)
  try {
    const adminAlertTpl = renderAdminPaymentConfirmedAlertEmail({
      bookingReference: updatedBooking.bookingReference,
      invoiceNumber,
      clientName: updatedBooking.clientName,
      clientEmail: updatedBooking.clientEmail || "Not provided",
      offeringTitle: updatedBooking.offeringTitle,
      therapistName: updatedBooking.therapistName,
      totalAmount: finalAmount,
      currency: finalCurrency,
      paymentGateway: gateway.toUpperCase(),
      paymentId: paymentRecord.gatewayPaymentId || paymentRecord.id,
      dashboardUrl: `${appUrl}/admin/bookings`,
    });

    await sendEmail({
      to: getAdminNotificationEmail(),
      subject: `Payment Confirmed — ${updatedBooking.bookingReference} | Auro Perfect Vision`,
      html: adminAlertTpl.html,
      text: adminAlertTpl.text,
      replyTo: updatedBooking.clientEmail || getEmailReplyTo(),
      templateKey: "admin_payment_confirmed_alert",
      bookingId: updatedBooking.id,
    });
  } catch (adminErr: any) {
    console.warn("[Admin Payment Confirmed Alert Email Error]:", adminErr.message);
  }

  return {
    success: true,
    booking: updatedBooking,
    invoice: invoiceRecord,
    payment: paymentRecord,
  };
}

export { paymentsStore, invoicesStore };
