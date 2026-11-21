import { NextResponse } from "next/server";
import { getCurrentStaffSession } from "@/lib/server/auth";
import { finalizePayment } from "@/lib/server/payments";
import {
  sendEmail,
  renderPaymentConfirmedEmail,
  renderAdminPaymentConfirmedAlertEmail,
  getAdminNotificationEmail,
  getEmailReplyTo,
} from "@/lib/server/email";

export async function POST(request: Request) {
  const session = await getCurrentStaffSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { bookingId, amount, confirmedByStaffName } = body;

    if (!bookingId) {
      return NextResponse.json({ error: "Booking ID is required" }, { status: 400 });
    }

    const result = await finalizePayment({
      bookingIdOrRef: bookingId,
      gateway: "offline",
      amount: typeof amount === "number" ? amount : undefined,
      confirmedByStaffName: confirmedByStaffName || session.fullName,
      rawResponse: {
        confirmedByUserId: session.userId,
        confirmedByRole: session.role,
        confirmedAt: new Date().toISOString(),
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://auroperfectvision.com";

    // Dispatch customer payment receipt email
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

    // Dispatch alert to official admin mailbox
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
      message: `Offline payment successfully confirmed by ${session.fullName}. Invoice issued.`,
    });
  } catch (err: any) {
    console.error("[Offline Payment Confirm Error]:", err);
    return NextResponse.json(
      { error: err.message || "Failed to confirm offline payment" },
      { status: 500 }
    );
  }
}
