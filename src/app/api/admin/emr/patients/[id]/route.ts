import { NextResponse } from "next/server";
import { getCurrentStaffSession } from "@/lib/server/auth";
import {
  getPatientChart,
  updatePatient,
  updateMedicalHistory,
  logClinicalAuditEvent,
} from "@/lib/server/emr";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getCurrentStaffSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const chart = await getPatientChart(id);
    if (!chart.patient) {
      return NextResponse.json({ error: "Patient record not found" }, { status: 404 });
    }

    // IDOR Protection: Therapists may only view charts assigned to them
    if (session.role === "therapist") {
      const isAssigned =
        Boolean(session.therapistId) &&
        (chart.patient.primaryTherapistId === session.therapistId ||
          chart.encounters.some((e) => e.therapistId === session.therapistId));

      if (!isAssigned) {
        return NextResponse.json(
          { error: "Forbidden: You are not authorized to view this patient's medical chart." },
          { status: 403 }
        );
      }
    }

    logClinicalAuditEvent({
      patientId: id,
      staffId: session.userId,
      staffName: session.fullName,
      action: "VIEWED_PATIENT_CHART",
    });

    return NextResponse.json(chart);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load patient chart" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getCurrentStaffSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const chart = await getPatientChart(id);
    if (!chart.patient) {
      return NextResponse.json({ error: "Patient record not found" }, { status: 404 });
    }

    // IDOR Protection: Therapists may only update charts assigned to them
    if (session.role === "therapist") {
      const isAssigned =
        Boolean(session.therapistId) &&
        (chart.patient.primaryTherapistId === session.therapistId ||
          chart.encounters.some((e) => e.therapistId === session.therapistId));

      if (!isAssigned) {
        return NextResponse.json(
          { error: "Forbidden: You are not authorized to modify this patient's medical chart." },
          { status: 403 }
        );
      }
    }

    const body = await request.json();
    const { patientData, medicalHistoryData } = body;

    let updatedPatient = null;
    let updatedHistory = null;

    if (patientData) {
      updatedPatient = await updatePatient(id, patientData);
    }

    if (medicalHistoryData) {
      updatedHistory = await updateMedicalHistory(id, medicalHistoryData);
    }

    logClinicalAuditEvent({
      patientId: id,
      staffId: session.userId,
      staffName: session.fullName,
      action: "VIEWED_PATIENT_CHART",
      details: { action: "UPDATED_CHART_DETAILS" },
    });

    return NextResponse.json({
      success: true,
      patient: updatedPatient,
      medicalHistory: updatedHistory,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update patient chart" }, { status: 500 });
  }
}
