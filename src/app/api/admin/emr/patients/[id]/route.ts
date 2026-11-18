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
  { params }: { params: { id: string } }
) {
  const session = await getCurrentStaffSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const chart = await getPatientChart(params.id);
    if (!chart.patient) {
      return NextResponse.json({ error: "Patient record not found" }, { status: 404 });
    }

    logClinicalAuditEvent({
      patientId: params.id,
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
  { params }: { params: { id: string } }
) {
  const session = await getCurrentStaffSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { patientData, medicalHistoryData } = body;

    let updatedPatient = null;
    let updatedHistory = null;

    if (patientData) {
      updatedPatient = await updatePatient(params.id, patientData);
    }

    if (medicalHistoryData) {
      updatedHistory = await updateMedicalHistory(params.id, medicalHistoryData);
    }

    logClinicalAuditEvent({
      patientId: params.id,
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
