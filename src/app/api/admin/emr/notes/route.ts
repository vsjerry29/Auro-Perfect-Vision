import { NextResponse } from "next/server";
import { getCurrentStaffSession } from "@/lib/server/auth";
import { saveSoapNote, logClinicalAuditEvent } from "@/lib/server/emr";

export async function POST(request: Request) {
  const session = await getCurrentStaffSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { patientId, subjective, objective, assessment, plan, id, encounterId, noteDate } = body;

    if (!patientId || !subjective || !objective || !assessment || !plan) {
      return NextResponse.json(
        { error: "All SOAP sections (Subjective, Objective, Assessment, Plan) are required." },
        { status: 400 }
      );
    }

    const note = await saveSoapNote({
      id,
      patientId,
      encounterId,
      therapistId: session.userId,
      therapistName: session.fullName,
      noteDate,
      subjective,
      objective,
      assessment,
      plan,
      status: "draft",
    });

    logClinicalAuditEvent({
      patientId,
      staffId: session.userId,
      staffName: session.fullName,
      action: "DRAFTED_SOAP_NOTE",
      details: { noteId: note.id },
    });

    return NextResponse.json({ success: true, note });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to save SOAP note" }, { status: 400 });
  }
}
