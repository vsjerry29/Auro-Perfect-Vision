import { NextResponse } from "next/server";
import crypto from "crypto";
import { finalizePayment } from "@/lib/server/payments";
import { isMySQLConfigured } from "@/lib/server/mysql";
import * as db from "@/lib/server/mysql-db";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature");
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // Verify webhook signature if secret configured
    if (webhookSecret && signature) {
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex");

      if (expectedSignature !== signature) {
        return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
      }
    }

    let payload: any = {};
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    const event = payload?.event;

    // Handle payment captured or order paid
    if (event === "payment.captured" || event === "order.paid") {
      const paymentEntity = payload?.payload?.payment?.entity;
      const orderId = paymentEntity?.order_id;
      const paymentId = paymentEntity?.id;
      const bookingRef = paymentEntity?.notes?.bookingReference || paymentEntity?.description;

      if (bookingRef) {
        // Prevent duplicate processing
        if (isMySQLConfigured()) {
          const existingPayment = await db.dbGetPaymentByGatewayOrderId(orderId);
          if (existingPayment && existingPayment.status === "captured") {
            return NextResponse.json({ status: "already_processed" });
          }
        }

        await finalizePayment({
          bookingIdOrRef: bookingRef,
          gateway: "razorpay",
          gatewayPaymentId: paymentId,
          gatewayOrderId: orderId,
          amount: paymentEntity?.amount ? paymentEntity.amount / 100 : undefined,
          rawResponse: payload,
        });
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (err: any) {
    console.error("[Payment Webhook Error]:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process payment webhook" },
      { status: 500 }
    );
  }
}
