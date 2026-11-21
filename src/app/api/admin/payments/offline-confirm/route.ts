import { NextResponse } from "next/server";
import { getCurrentStaffSession } from "@/lib/server/auth";
import { finalizePayment } from "@/lib/server/payments";

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
