import { NextResponse } from "next/server";
import { getCurrentStaffSession } from "@/lib/server/auth";
import {
  getAllProgrammes,
  saveProgramme,
  duplicateProgramme,
  deleteProgramme,
  logAuditEvent,
} from "@/lib/server/cms";

export async function GET() {
  const session = await getCurrentStaffSession();
  if (!session || (session.role !== "admin" && session.role !== "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const programmes = getAllProgrammes(true);
  return NextResponse.json({ programmes });
}

export async function POST(request: Request) {
  const session = await getCurrentStaffSession();
  if (!session || (session.role !== "admin" && session.role !== "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, id, ...progData } = body;

    if (action === "duplicate" && id) {
      const duplicated = duplicateProgramme(id);
      if (!duplicated) {
        return NextResponse.json({ error: "Programme not found" }, { status: 404 });
      }
      logAuditEvent({
        staffId: session.userId,
        staffEmail: session.email,
        staffName: session.fullName,
        action: "PROGRAMME_DUPLICATED",
        entityType: "Programme",
        entityId: duplicated.id,
      });
      return NextResponse.json({ success: true, programme: duplicated });
    }

    if (!progData.title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const saved = saveProgramme(progData);
    logAuditEvent({
      staffId: session.userId,
      staffEmail: session.email,
      staffName: session.fullName,
      action: progData.id ? "PROGRAMME_UPDATED" : "PROGRAMME_CREATED",
      entityType: "Programme",
      entityId: saved.id,
      details: { title: saved.title, isPublished: saved.isPublished },
    });

    return NextResponse.json({ success: true, programme: saved });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to save programme" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await getCurrentStaffSession();
  if (!session || (session.role !== "admin" && session.role !== "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ error: "Programme ID required" }, { status: 400 });
    }

    const saved = saveProgramme(body);
    return NextResponse.json({ success: true, programme: saved });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update programme" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getCurrentStaffSession();
  if (!session || (session.role !== "admin" && session.role !== "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Programme ID required" }, { status: 400 });
  }

  deleteProgramme(id);
  logAuditEvent({
    staffId: session.userId,
    staffEmail: session.email,
    staffName: session.fullName,
    action: "PROGRAMME_DELETED",
    entityType: "Programme",
    entityId: id,
  });

  return NextResponse.json({ success: true });
}
