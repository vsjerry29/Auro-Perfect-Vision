import { NextResponse } from "next/server";
import { getCurrentStaffSession } from "@/lib/server/auth";
import { amendSoapNote } from "@/lib/server/emr";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getCurrentStaffSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { reasonForAmendment, amendmentText } = body;

    if (!reasonForAmendment || !amendmentText) {
      return NextResponse.json(
        { error: "Reason for amendment and amendment text are required." },
        { status: 400 }
      );
    }

    const updated = await amendSoapNote(params.id, {
      staffId: session.userId,
      staffName: session.fullName,
      reasonForAmendment,
      amendmentText,
    });

    return NextResponse.json({
      success: true,
      message: "Clinical amendment recorded and appended to note.",
      note: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to amend SOAP note" }, { status: 400 });
  }
}
