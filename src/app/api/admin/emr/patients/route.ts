import { NextResponse } from "next/server";
import { getCurrentStaffSession } from "@/lib/server/auth";
import { getAllPatients, createPatient, logClinicalAuditEvent } from "@/lib/server/emr";

export async function GET(request: Request) {
  const session = await getCurrentStaffSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized: Staff session required." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || undefined;
  const status = searchParams.get("status") || undefined;
  const therapistId = searchParams.get("therapistId") || undefined;

  try {
    const patients = await getAllPatients({ search, status, therapistId });
    return NextResponse.json({ patients });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to retrieve patients" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getCurrentStaffSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized: Staff session required." }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (!body.fullName || !body.phone) {
      return NextResponse.json(
        { error: "Full Name and Phone Number are required to open a medical chart." },
        { status: 400 }
      );
    }

    const patient = await createPatient({
      ...body,
      primaryTherapistId: body.primaryTherapistId || (session.role === "therapist" ? session.userId : "therapist-1"),
      primaryTherapistName: body.primaryTherapistName || (session.role === "therapist" ? session.fullName : "Dr. Ananya Sen"),
    });

    logClinicalAuditEvent({
      patientId: patient.id,
      staffId: session.userId,
      staffName: session.fullName,
      action: "VIEWED_PATIENT_CHART",
      details: { action: "REGISTERED_NEW_PATIENT", mrn: patient.mrn },
    });

    return NextResponse.json({ success: true, patient });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create patient" }, { status: 500 });
  }
}
