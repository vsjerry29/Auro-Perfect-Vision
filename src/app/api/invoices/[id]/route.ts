import { NextResponse } from "next/server";
import { isMySQLConfigured } from "@/lib/server/mysql";
import * as db from "@/lib/server/mysql-db";
import { getBookingByRef, getAllBookings } from "@/lib/server/cms";
import type { InvoiceRecord, Booking } from "@/lib/types";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const url = new URL(request.url);
  const wantsJson =
    url.searchParams.get("format") === "json" ||
    request.headers.get("accept")?.includes("application/json");

  let invoice: InvoiceRecord | null = null;
  let booking: Booking | null = null;

  if (isMySQLConfigured()) {
    invoice = await db.dbGetInvoiceByNumber(id);
    if (!invoice) {
      // Try by booking ID
      invoice = await db.dbGetInvoiceByBookingId(id);
    }

    if (invoice) {
      const allBookings = await db.dbGetAllBookings();
      booking = allBookings.find((b) => b.id === invoice?.bookingId) || null;
    } else {
      // Fallback: check if id is booking reference
      booking = await db.dbGetBookingByRef(id);
      if (booking && booking.invoiceNumber) {
        invoice = {
          id: `inv-${booking.id}`,
          bookingId: booking.id,
          invoiceNumber: booking.invoiceNumber,
          totalAmount: booking.totalAmount,
          currency: booking.currency,
          status: "paid" as const,
          issuedAt: booking.offlineConfirmedAt || booking.createdAt,
          createdAt: booking.createdAt,
        };
      }
    }
  } else {
    // In-memory fallback
    const all = getAllBookings();
    booking =
      all.find(
        (b) =>
          b.invoiceNumber?.toLowerCase() === id.toLowerCase() ||
          b.bookingReference.toLowerCase() === id.toLowerCase() ||
          b.id === id
      ) || null;

    if (booking) {
      invoice = {
        id: `inv-${booking.id}`,
        bookingId: booking.id,
        invoiceNumber: booking.invoiceNumber || `APV-2026-${booking.id.slice(-4)}`,
        totalAmount: booking.totalAmount,
        currency: booking.currency,
        status: "paid" as const,
        issuedAt: booking.offlineConfirmedAt || booking.createdAt,
        createdAt: booking.createdAt,
      };
    }
  }

  if (!booking || !invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  if (wantsJson) {
    return NextResponse.json({
      invoice,
      booking: {
        bookingReference: booking.bookingReference,
        offeringTitle: booking.offeringTitle,
        therapistName: booking.therapistName,
        date: booking.date,
        timeSlot: booking.timeSlot,
        clientName: booking.clientName,
        clientEmail: booking.clientEmail,
        paymentStatus: booking.paymentStatus,
        paymentMethod: booking.paymentMethod,
      },
    });
  }

  // Render Printable HTML Invoice
  const isINR = booking.currency === "INR" || !booking.currency;
  const unitRateFormatted = isINR
    ? `₹${Math.round(booking.totalAmount / (booking.seatsBooked || 1)).toLocaleString("en-IN")}`
    : "—";
  const totalAmountFormatted = isINR
    ? `₹${Math.round(booking.totalAmount).toLocaleString("en-IN")}`
    : "—";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Invoice ${invoice.invoiceNumber} — Auro Perfect Vision</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Georgia, serif; color: #2C2621; margin: 0; padding: 40px 20px; background: #FDFCFA; line-height: 1.5; }
    .invoice-card { max-width: 720px; margin: 0 auto; background: #FFFFFF; border: 1px solid #EBE5DC; border-radius: 16px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.04); }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #FAF8F5; padding-bottom: 24px; margin-bottom: 24px; }
    .logo-title h1 { font-family: Georgia, serif; font-size: 22px; color: #3B1E4A; margin: 0 0 4px 0; }
    .logo-title p { margin: 0; font-size: 12px; color: #7B7268; }
    .badge-paid { background: #ECFDF5; color: #047857; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 9999px; border: 1px solid #A7F3D0; text-transform: uppercase; }
    .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; font-size: 13px; margin-bottom: 30px; }
    .meta-box h3 { font-size: 11px; text-transform: uppercase; color: #8F6B2A; margin: 0 0 8px 0; letter-spacing: 0.05em; }
    .meta-box p { margin: 2px 0; color: #4B453E; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 13px; }
    th { text-align: left; padding: 10px; background: #FAF8F5; color: #7B7268; font-size: 11px; text-transform: uppercase; border-bottom: 1px solid #EBE5DC; }
    td { padding: 12px 10px; border-bottom: 1px solid #F3EFEA; }
    .text-right { text-align: right; }
    .total-row td { font-weight: bold; font-size: 15px; color: #3B1E4A; border-top: 2px solid #EBE5DC; border-bottom: none; }
    .footer { text-align: center; font-size: 11px; color: #9E968D; border-top: 1px solid #EBE5DC; padding-top: 20px; }
    .print-btn { display: inline-block; background: #3B1E4A; color: #FFFFFF; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-size: 12px; font-weight: 600; cursor: pointer; border: none; margin-bottom: 20px; }
    .print-bar { max-width: 720px; margin: 0 auto 16px auto; display: flex; justify-content: flex-end; }
    @media print {
      body { background: #FFFFFF; padding: 0; }
      .invoice-card { border: none; box-shadow: none; padding: 0; }
      .print-bar { display: none; }
    }
  </style>
</head>
<body>
  <div class="print-bar">
    <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
  </div>
  <div class="invoice-card">
    <div class="header">
      <div class="logo-title">
        <h1>Auro Perfect Vision</h1>
        <p>Holistic Ocular Restoration Sanctuary • Auroville</p>
        <p style="margin-top: 4px; font-size: 11px; color: #9E968D;">Crown Road, Auroville International Township, Tamil Nadu 605101, India</p>
      </div>
      <div style="text-align: right;">
        <span class="badge-paid">Paid &amp; Captured</span>
        <p style="font-family: monospace; font-size: 13px; font-weight: bold; margin: 8px 0 2px 0;">${invoice.invoiceNumber}</p>
        <p style="font-size: 11px; color: #7B7268; margin: 0;">Issued: ${new Date(invoice.issuedAt).toLocaleDateString()}</p>
      </div>
    </div>

    <div class="meta-grid">
      <div class="meta-box">
        <h3>Billed To (Client)</h3>
        <p><strong>${booking.clientName}</strong></p>
        <p>${booking.clientEmail}</p>
        <p>${booking.clientPhone || "—"}</p>
      </div>
      <div class="meta-box">
        <h3>Appointment Details</h3>
        <p><strong>Booking Ref:</strong> ${booking.bookingReference}</p>
        <p><strong>Date &amp; Slot:</strong> ${booking.date} at ${booking.timeSlot} IST</p>
        <p><strong>Practitioner:</strong> ${booking.therapistName}</p>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th>Seats / Format</th>
          <th class="text-right">Rate</th>
          <th class="text-right">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <strong>${booking.offeringTitle}</strong><br>
            <span style="font-size: 11px; color: #7B7268;">Natural Bates vision session, ocular muscle realignment, relaxation</span>
          </td>
          <td>${booking.seatsBooked || 1} Participant(s)</td>
          <td class="text-right">${unitRateFormatted}</td>
          <td class="text-right">${totalAmountFormatted}</td>
        </tr>
        <tr class="total-row">
          <td colspan="3" class="text-right">Total Amount Paid:</td>
          <td class="text-right">${totalAmountFormatted}</td>
        </tr>
      </tbody>
    </table>

    <div class="footer">
      <p>Thank you for choosing Auro Perfect Vision. For questions, call our clinic reception at +91 80123 05151 or email auroperfectvision@gmail.com.</p>
      <p style="font-size: 10px;">This computer-generated tax invoice is officially valid under the regulations of Auroville International Township, Tamil Nadu.</p>
    </div>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
