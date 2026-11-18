import { NextResponse } from "next/server";
import { getCurrentStaffSession } from "@/lib/server/auth";
import { createTreatmentPlan, logClinicalAuditEvent } from "@/lib/server/emr";

export async function POST(request: Request) {
  const session = await getCurrentStaffSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (!body.patientId || !body.title || !body.primaryDiagnosis) {
      return NextResponse.json(
        { error: "Patient ID, Title, and Primary Diagnosis are required." },
        { status: 400 }
      );
    }

    const plan = await createTreatmentPlan({
      ...body,
      therapistId: session.userId,
      therapistName: session.fullName,
    });

    logClinicalAuditEvent({
      patientId: body.patientId,
      staffId: session.userId,
      staffName: session.fullName,
      action: "UPDATED_TREATMENT_PLAN",
      details: { planId: plan.id, title: plan.title },
    });

    return NextResponse.json({ success: true, treatmentPlan: plan });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create treatment plan" }, { status: 500 });
  }
}
