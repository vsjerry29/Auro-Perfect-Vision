import { NextResponse } from "next/server";
import { getCurrentStaffSession } from "@/lib/server/auth";
import { getAllInquiries, saveInquiry, updateInquiryStage } from "@/lib/server/crm";

export async function GET(request: Request) {
  const session = await getCurrentStaffSession();
  if (!session || (session.role !== "admin" && session.role !== "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const stage = searchParams.get("stage") || undefined;
  const search = searchParams.get("search") || undefined;

  const inquiries = getAllInquiries({ stage, search });
  return NextResponse.json({ inquiries });
}

export async function POST(request: Request) {
  const session = await getCurrentStaffSession();
  if (!session || (session.role !== "admin" && session.role !== "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (!body.name || !body.email || !body.subject || !body.message) {
      return NextResponse.json({ error: "Missing required inquiry fields" }, { status: 400 });
    }

    const saved = saveInquiry(body, { id: session.userId, fullName: session.fullName });
    return NextResponse.json({ success: true, inquiry: saved });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to save inquiry" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await getCurrentStaffSession();
  if (!session || (session.role !== "admin" && session.role !== "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, stage, assignedStaffId, assignedStaffName, internalNotes } = body;

    if (!id) {
      return NextResponse.json({ error: "Inquiry ID required" }, { status: 400 });
    }

    if (stage) {
      const updated = updateInquiryStage(id, stage, {
        id: session.userId,
        fullName: session.fullName,
      });
      if (!updated) return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
      return NextResponse.json({ success: true, inquiry: updated });
    }

    const inquiries = getAllInquiries();
    const target = inquiries.find((i) => i.id === id);
    if (!target) return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });

    const updated = saveInquiry(
      {
        ...target,
        assignedStaffId: assignedStaffId !== undefined ? assignedStaffId : target.assignedStaffId,
        assignedStaffName: assignedStaffName !== undefined ? assignedStaffName : target.assignedStaffName,
        internalNotes: internalNotes !== undefined ? internalNotes : target.internalNotes,
      },
      { id: session.userId, fullName: session.fullName }
    );

    return NextResponse.json({ success: true, inquiry: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update inquiry" }, { status: 500 });
  }
}
