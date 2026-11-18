import { NextResponse } from "next/server";
import { getCurrentStaffSession } from "@/lib/server/auth";
import { signAndLockSoapNote } from "@/lib/server/emr";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getCurrentStaffSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const signed = await signAndLockSoapNote(params.id, {
      id: session.userId,
      fullName: session.fullName,
    });

    return NextResponse.json({
      success: true,
      message: "SOAP Clinical Note officially signed and locked in legal compliance.",
      note: signed,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to sign SOAP note" }, { status: 400 });
  }
}
