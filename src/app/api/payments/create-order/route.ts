import { NextResponse } from "next/server";
import { getBookingByRef, getAllBookings } from "@/lib/server/cms";
import { isMySQLConfigured } from "@/lib/server/mysql";
import * as db from "@/lib/server/mysql-db";
import { calculateOfferingPrice, createRazorpayOrder, createPayPalOrder } from "@/lib/server/payments";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { bookingReference, gateway = "razorpay" } = body;

    if (!bookingReference) {
      return NextResponse.json({ error: "Booking reference is required" }, { status: 400 });
    }

    if (gateway === "paypal") {
      return NextResponse.json(
        {
          error:
            "PayPal USD checkout is disabled. Auro Perfect Vision processes payments exclusively in Indian Rupees (₹ INR) via Razorpay or offline at clinic.",
        },
        { status: 400 }
      );
    }

    // Locate booking
    let booking = null;
    if (isMySQLConfigured()) {
      booking = await db.dbGetBookingByRef(bookingReference);
    } else {
      booking = getBookingByRef(bookingReference);
    }

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Authoritative Server-side Price Calculation in INR
    const pricing = calculateOfferingPrice(
      booking.offeringId,
      "INR",
      booking.seatsBooked || 1
    );

    if (gateway === "razorpay") {
      const order = await createRazorpayOrder({
        amount: pricing.amount,
        currency: "INR",
        receipt: booking.bookingReference,
        notes: {
          bookingId: booking.id,
          bookingReference: booking.bookingReference,
          clientName: booking.clientName,
        },
      });

      return NextResponse.json({
        success: true,
        gateway: "razorpay",
        orderId: order.orderId,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
        simulated: order.simulated,
      });
    }

    return NextResponse.json({ error: "Unsupported payment gateway" }, { status: 400 });
  } catch (err: any) {
    console.error("[Create Order Error]:", err);
    return NextResponse.json(
      { error: err.message || "Failed to initialize payment gateway order" },
      { status: 500 }
    );
  }
}
