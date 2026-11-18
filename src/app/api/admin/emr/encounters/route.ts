import { NextResponse } from "next/server";
import { getCurrentStaffSession } from "@/lib/server/auth";
import { createEncounter, logClinicalAuditEvent } from "@/lib/server/emr";

export async function POST(request: Request) {
  const session = await getCurrentStaffSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (!body.patientId || !body.chiefComplaint) {
      return NextResponse.json(
        { error: "Patient ID and Chief Complaint are required." },
        { status: 400 }
      );
    }

    const encounter = await createEncounter({
      ...body,
      therapistId: session.userId,
      therapistName: session.fullName,
    });

    logClinicalAuditEvent({
      patientId: body.patientId,
      staffId: session.userId,
      staffName: session.fullName,
      action: "CREATED_ENCOUNTER",
      details: { encounterId: encounter.id, type: encounter.encounterType },
    });

    return NextResponse.json({ success: true, encounter });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create encounter" }, { status: 500 });
  }
}
