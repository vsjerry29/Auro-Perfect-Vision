import { NextResponse } from "next/server";
import { getCurrentStaffSession } from "@/lib/server/auth";
import { createVisionAssessment, logClinicalAuditEvent } from "@/lib/server/emr";

export async function POST(request: Request) {
  const session = await getCurrentStaffSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (!body.patientId || !body.clinicalImpression) {
      return NextResponse.json(
        { error: "Patient ID and Clinical Impression are required." },
        { status: 400 }
      );
    }

    const assessment = await createVisionAssessment({
      ...body,
      therapistId: session.userId,
      therapistName: session.fullName,
    });

    logClinicalAuditEvent({
      patientId: body.patientId,
      staffId: session.userId,
      staffName: session.fullName,
      action: "RECORDED_VISION_ASSESSMENT",
      details: { assessmentId: assessment.id },
    });

    return NextResponse.json({ success: true, assessment });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to record vision assessment" }, { status: 500 });
  }
}
