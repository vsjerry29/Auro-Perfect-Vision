import { NextResponse } from "next/server";
import { getCurrentStaffSession } from "@/lib/server/auth";
import {
  getAllTherapists,
  saveTherapist,
  archiveTherapist,
  reactivateTherapist,
  getTherapistUpcomingBookings,
  reassignTherapistBookings,
  logAuditEvent,
} from "@/lib/server/cms";

export async function GET() {
  const session = await getCurrentStaffSession();
  if (!session || (session.role !== "admin" && session.role !== "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const therapists = getAllTherapists(true);
  const enriched = therapists.map((t) => {
    const upcoming = getTherapistUpcomingBookings(t.id);
    return {
      ...t,
      upcomingBookingsCount: upcoming.length,
    };
  });

  return NextResponse.json({ therapists: enriched });
}

export async function POST(request: Request) {
  const session = await getCurrentStaffSession();
  if (!session || (session.role !== "admin" && session.role !== "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (!body.displayName) {
      return NextResponse.json({ error: "Display name is required" }, { status: 400 });
    }

    const saved = saveTherapist(body);

    logAuditEvent({
      staffId: session.userId,
      staffEmail: session.email,
      staffName: session.fullName,
      action: body.id ? "THERAPIST_UPDATED" : "THERAPIST_CREATED",
      entityType: "Therapist",
      entityId: saved.id,
      details: { displayName: saved.displayName },
    });

    return NextResponse.json({ success: true, therapist: saved });
  } catch (err: any) {
    return NextResponse.json({ error: "Server error saving therapist" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getCurrentStaffSession();
  if (!session || (session.role !== "admin" && session.role !== "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, force, reassignToTherapistId } = body;

    if (!id) {
      return NextResponse.json({ error: "Therapist ID is required." }, { status: 400 });
    }

    const result = archiveTherapist(id, { force, reassignToTherapistId });

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.message,
          blockedByBookings: result.blockedByBookings,
          upcomingCount: result.upcomingCount,
          upcomingBookings: result.upcomingBookings,
        },
        { status: 409 }
      );
    }

    logAuditEvent({
      staffId: session.userId,
      staffEmail: session.email,
      staffName: session.fullName,
      action: "THERAPIST_ARCHIVED",
      entityType: "Therapist",
      entityId: id,
      details: { reassignToTherapistId, force },
    });

    return NextResponse.json({
      success: true,
      message: "Therapist archived safely. Historical clinical records preserved.",
      therapist: result.therapist,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to remove therapist" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await getCurrentStaffSession();
  if (!session || (session.role !== "admin" && session.role !== "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, action, reassignToTherapistId, force } = body;

    if (!id) {
      return NextResponse.json({ error: "Therapist ID is required" }, { status: 400 });
    }

    if (action === "reactivate") {
      const result = reactivateTherapist(id);
      if (!result.success) {
        return NextResponse.json({ error: result.message }, { status: 404 });
      }

      logAuditEvent({
        staffId: session.userId,
        staffEmail: session.email,
        staffName: session.fullName,
        action: "THERAPIST_REACTIVATED",
        entityType: "Therapist",
        entityId: id,
      });

      return NextResponse.json({ success: true, therapist: result.therapist });
    }

    if (action === "archive") {
      const result = archiveTherapist(id, { force, reassignToTherapistId });
      if (!result.success) {
        return NextResponse.json(
          {
            error: result.message,
            blockedByBookings: result.blockedByBookings,
            upcomingCount: result.upcomingCount,
          },
          { status: 409 }
        );
      }
      return NextResponse.json({ success: true, therapist: result.therapist });
    }

    if (action === "reassign") {
      if (!reassignToTherapistId) {
        return NextResponse.json({ error: "Target therapist ID required" }, { status: 400 });
      }
      const reassignResult = reassignTherapistBookings(id, reassignToTherapistId);
      return NextResponse.json({ success: true, ...reassignResult });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
