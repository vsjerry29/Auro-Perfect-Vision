import { NextResponse } from "next/server";
import { verifyRazorpaySignature, finalizePayment } from "@/lib/server/payments";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      bookingReference,
      gateway = "razorpay",
      orderId,
      paymentId,
      signature,
    } = body;

    if (!bookingReference) {
      return NextResponse.json({ error: "Booking reference is required" }, { status: 400 });
    }

    if (gateway === "razorpay") {
      if (!orderId || !paymentId) {
        return NextResponse.json(
          { error: "orderId and paymentId are required for Razorpay verification" },
          { status: 400 }
        );
      }

      const isValid = verifyRazorpaySignature({
        orderId,
        paymentId,
        signature: signature || "",
      });

      if (!isValid) {
        return NextResponse.json(
          { error: "Cryptographic payment signature verification failed. Transaction rejected." },
          { status: 400 }
        );
      }

      const result = await finalizePayment({
        bookingIdOrRef: bookingReference,
        gateway: "razorpay",
        gatewayPaymentId: paymentId,
        gatewayOrderId: orderId,
        rawResponse: body,
      });

      return NextResponse.json({
        success: true,
        bookingReference: result.booking.bookingReference,
        invoiceNumber: result.invoice.invoiceNumber,
        paymentStatus: result.booking.paymentStatus,
      });
    }

    if (gateway === "paypal") {
      if (!orderId) {
        return NextResponse.json(
          { error: "orderId is required for PayPal capture verification" },
          { status: 400 }
        );
      }

      const result = await finalizePayment({
        bookingIdOrRef: bookingReference,
        gateway: "paypal",
        gatewayPaymentId: paymentId || orderId,
        gatewayOrderId: orderId,
        rawResponse: body,
      });

      return NextResponse.json({
        success: true,
        bookingReference: result.booking.bookingReference,
        invoiceNumber: result.invoice.invoiceNumber,
        paymentStatus: result.booking.paymentStatus,
      });
    }

    return NextResponse.json({ error: "Unsupported payment gateway" }, { status: 400 });
  } catch (err: any) {
    console.error("[Verify Payment Error]:", err);
    return NextResponse.json(
      { error: err.message || "Failed to verify and finalize payment" },
      { status: 500 }
    );
  }
}
