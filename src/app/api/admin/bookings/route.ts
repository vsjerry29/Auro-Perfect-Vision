import { NextResponse } from "next/server";
import { getCurrentStaffSession } from "@/lib/server/auth";
import { getAllBookings, saveBooking, approveBooking, rejectBooking } from "@/lib/server/cms";
import { isMySQLConfigured } from "@/lib/server/mysql";
import * as db from "@/lib/server/mysql-db";
import { finalizePayment } from "@/lib/server/payments";
import {
  sendEmail,
  renderBookingApprovedEmail,
  renderBookingRejectedEmail,
  renderAdminBookingCancelledAlertEmail,
  renderPaymentConfirmedEmail,
  renderAdminPaymentConfirmedAlertEmail,
  getAdminNotificationEmail,
  getEmailReplyTo,
} from "@/lib/server/email";
import { Booking } from "@/lib/types";

export async function GET() {
  const session = await getCurrentStaffSession();
  if (!session || (session.role !== "admin" && session.role !== "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const bookings = isMySQLConfigured() ? await db.dbGetAllBookings() : getAllBookings();
  return NextResponse.json({ bookings });
}

export async function PUT(request: Request) {
  const session = await getCurrentStaffSession();
  if (!session || (session.role !== "admin" && session.role !== "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, bookingId, reason, amount } = body;

    if (!bookingId) {
      return NextResponse.json({ error: "Booking ID is required" }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://auroperfectvision.com";

    // ─────────────────────────────────────────────────────────────────────────
    // 1. APPROVE / CONFIRM BOOKING (Independent from payment)
    // ─────────────────────────────────────────────────────────────────────────
    if (action === "confirm_booking") {
      let updated: Booking | null = null;
      if (isMySQLConfigured()) {
        try {
          updated = await db.dbApproveBooking(bookingId, session.fullName || "Admin");
          saveBooking(updated);
        } catch (err: any) {
          return NextResponse.json({ error: err.message || "Failed to approve booking in database" }, { status: 500 });
        }
      } else {
        updated = approveBooking(bookingId, session.fullName || "Admin");
      }

      if (!updated) {
        return NextResponse.json({ error: "Booking not found" }, { status: 404 });
      }

      // Dispatch booking approved email to customer
      if (updated.clientEmail) {
        try {
          const tpl = renderBookingApprovedEmail({
            clientName: updated.clientName,
            bookingReference: updated.bookingReference,
            offeringTitle: updated.offeringTitle,
            therapistName: updated.therapistName,
            bookingDate: updated.date,
            timeSlot: updated.timeSlot,
            totalAmount: updated.totalAmount,
            currency: updated.currency || "INR",
            paymentStatus: updated.paymentStatus,
            trackingUrl: `${appUrl}/booking/${updated.bookingReference}`,
          });

          await sendEmail({
            to: updated.clientEmail,
            subject: `Appointment Confirmed [${updated.bookingReference}] — Auro Perfect Vision`,
            html: tpl.html,
            text: tpl.text,
            replyTo: getEmailReplyTo(),
            templateKey: "booking_approved",
            bookingId: updated.id,
          });
        } catch (emailErr: any) {
          console.warn("[Booking Approval Email Notice]:", emailErr.message);
        }
      }

      return NextResponse.json({ success: true, booking: updated });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 2. REJECT / CANCEL BOOKING (Release slot safely, notify client)
    // ─────────────────────────────────────────────────────────────────────────
    if (action === "reject_booking") {
      let updated: Booking | null = null;
      if (isMySQLConfigured()) {
        try {
          updated = await db.dbRejectBooking(bookingId, reason, session.fullName || "Admin");
          saveBooking(updated);
        } catch (err: any) {
          return NextResponse.json({ error: err.message || "Failed to reject booking in database" }, { status: 500 });
        }
      } else {
        updated = rejectBooking(bookingId, reason, session.fullName || "Admin");
      }

      if (!updated) {
        return NextResponse.json({ error: "Booking not found" }, { status: 404 });
      }

      // Dispatch rejection email to client
      if (updated.clientEmail) {
        try {
          const tpl = renderBookingRejectedEmail({
            clientName: updated.clientName,
            bookingReference: updated.bookingReference,
            offeringTitle: updated.offeringTitle,
            bookingDate: updated.date,
            timeSlot: updated.timeSlot,
            reason: reason || "Slot or practitioner unavailable for the requested schedule",
            rescheduleUrl: `${appUrl}/therapies`,
          });

          await sendEmail({
            to: updated.clientEmail,
            subject: `Booking Request Update [${updated.bookingReference}] — Auro Perfect Vision`,
            html: tpl.html,
            text: tpl.text,
            replyTo: getEmailReplyTo(),
            templateKey: "booking_rejected",
            bookingId: updated.id,
          });
        } catch (emailErr: any) {
          console.warn("[Booking Rejection Email Notice]:", emailErr.message);
        }
      }

      // Dispatch alert to admin mailbox
      try {
        const adminTpl = renderAdminBookingCancelledAlertEmail({
          bookingReference: updated.bookingReference,
          clientName: updated.clientName,
          clientEmail: updated.clientEmail,
          offeringTitle: updated.offeringTitle,
          bookingDate: updated.date,
          timeSlot: updated.timeSlot,
          reason: reason || "Rejected by administrator",
          cancelledBy: session.fullName || "Admin",
          dashboardUrl: `${appUrl}/admin/bookings`,
        });

        await sendEmail({
          to: getAdminNotificationEmail(),
          subject: `Booking Cancelled / Rejected — ${updated.bookingReference} | Auro Perfect Vision`,
          html: adminTpl.html,
          text: adminTpl.text,
          replyTo: updated.clientEmail || getEmailReplyTo(),
          templateKey: "admin_booking_cancelled_alert",
          bookingId: updated.id,
        });
      } catch (adminAlertErr: any) {
        console.warn("[Admin Cancel Alert Notice]:", adminAlertErr.message);
      }

      return NextResponse.json({ success: true, booking: updated });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 3. CONFIRM PAYMENT (Independent operation: generates invoice, preserves booking status)
    // ─────────────────────────────────────────────────────────────────────────
    if (action === "confirm_payment" || action === "mark_paid") {
      const result = await finalizePayment({
        bookingIdOrRef: bookingId,
        gateway: "offline",
        amount: typeof amount === "number" ? amount : undefined,
        confirmedByStaffName: session.fullName || "Admin (Front Desk)",
        rawResponse: {
          confirmedByUserId: session.userId,
          confirmedByRole: session.role,
          confirmedAt: new Date().toISOString(),
        },
      });

      // Dispatch payment confirmation email to client
      if (result.booking.clientEmail) {
        try {
          const clientTpl = renderPaymentConfirmedEmail({
            clientName: result.booking.clientName,
            bookingReference: result.booking.bookingReference,
            invoiceNumber: result.invoice.invoiceNumber,
            amount: result.payment.amount,
            currency: result.payment.currency,
            paymentGateway: "Offline Cash / Counter Verification",
            invoiceUrl: `${appUrl}/api/invoices/${result.invoice.invoiceNumber}`,
          });

          await sendEmail({
            to: result.booking.clientEmail,
            subject: `Payment Receipt: ${result.invoice.invoiceNumber} [${result.booking.bookingReference}]`,
            html: clientTpl.html,
            text: clientTpl.text,
            replyTo: getEmailReplyTo(),
            templateKey: "payment_confirmation",
            bookingId: result.booking.id,
          });
        } catch (emailErr: any) {
          console.warn("[Payment Confirmation Email Notice]:", emailErr.message);
        }
      }

      // Dispatch alert to admin
      try {
        const adminTpl = renderAdminPaymentConfirmedAlertEmail({
          bookingReference: result.booking.bookingReference,
          invoiceNumber: result.invoice.invoiceNumber,
          clientName: result.booking.clientName,
          clientEmail: result.booking.clientEmail,
          offeringTitle: result.booking.offeringTitle,
          therapistName: result.booking.therapistName,
          totalAmount: result.payment.amount,
          currency: result.payment.currency,
          paymentGateway: "Offline Cash / Counter Verification",
          paymentId: result.payment.id,
          dashboardUrl: `${appUrl}/admin/payments`,
        });

        await sendEmail({
          to: getAdminNotificationEmail(),
          subject: `Payment Confirmed — ${result.booking.bookingReference} | Auro Perfect Vision`,
          html: adminTpl.html,
          text: adminTpl.text,
          replyTo: result.booking.clientEmail || getEmailReplyTo(),
          templateKey: "admin_payment_confirmed_alert",
          bookingId: result.booking.id,
        });
      } catch (adminAlertErr: any) {
        console.warn("[Admin Payment Alert Notice]:", adminAlertErr.message);
      }

      return NextResponse.json({
        success: true,
        booking: result.booking,
        invoiceNumber: result.invoice.invoiceNumber,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    console.error("[Booking Action Error]:", err);
    return NextResponse.json(
      { error: err.message || "Server error processing booking action" },
      { status: 500 }
    );
  }
}
