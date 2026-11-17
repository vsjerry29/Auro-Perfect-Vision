import { NextResponse } from "next/server";
import {
  getCurrentStaffSession,
  getStaffUsers,
  createStaffUser,
  updateStaffUser,
  deleteStaffUser,
} from "@/lib/server/auth";
import { saveTherapist, getAllTherapists, logAuditEvent } from "@/lib/server/cms";

export async function GET() {
  const session = await getCurrentStaffSession();
  if (!session || (session.role !== "admin" && session.role !== "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = getStaffUsers();
  const sanitized = users.map(({ passwordHash, salt, ...safe }) => safe);
  return NextResponse.json({ users: sanitized });
}

export async function POST(request: Request) {
  const session = await getCurrentStaffSession();
  if (!session || (session.role !== "admin" && session.role !== "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { email, fullName, role, phone, therapistProfile } = body;

    if (!email || !fullName || !role) {
      return NextResponse.json({ error: "Email, Full Name, and Role are required." }, { status: 400 });
    }

    let therapistId: string | undefined = undefined;

    // If role is therapist, create matching therapist public profile
    if (role === "therapist") {
      const savedProfile = saveTherapist({
        displayName: therapistProfile?.displayName || fullName,
        roleTitle: therapistProfile?.roleTitle || "Vision Wellness Guide",
        bio: therapistProfile?.bio || "",
        specialties: therapistProfile?.specialties || ["Eye Yoga"],
        qualifications: therapistProfile?.qualifications || "Holistic Vision Specialist",
        photoUrl: therapistProfile?.photoUrl,
        email,
        phone: phone || "",
        isPublished: therapistProfile?.isPublished !== undefined ? therapistProfile.isPublished : true,
      });
      therapistId = savedProfile.id;
    }

    const newUser = createStaffUser({
      email,
      fullName,
      role,
      phone,
      therapistId,
      initialPassword: body.initialPassword,
    });

    logAuditEvent({
      staffId: session.userId,
      staffEmail: session.email,
      staffName: session.fullName,
      action: "STAFF_USER_INVITED",
      entityType: "StaffUser",
      entityId: newUser.id,
      details: { email: newUser.email, role: newUser.role },
    });

    const { passwordHash, salt, ...safe } = newUser;
    return NextResponse.json({ success: true, user: safe });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create staff user" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await getCurrentStaffSession();
  if (!session || (session.role !== "admin" && session.role !== "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, role, isActive, status, fullName, phone } = body;

    if (!id) {
      return NextResponse.json({ error: "Staff User ID is required" }, { status: 400 });
    }

    const updated = updateStaffUser(id, {
      role,
      isActive,
      status,
      fullName,
      phone,
    });

    if (!updated) {
      return NextResponse.json({ error: "Staff user not found" }, { status: 404 });
    }

    logAuditEvent({
      staffId: session.userId,
      staffEmail: session.email,
      staffName: session.fullName,
      action: "STAFF_USER_UPDATED",
      entityType: "StaffUser",
      entityId: updated.id,
      details: { role: updated.role, isActive: updated.isActive, status: updated.status },
    });

    const { passwordHash, salt, ...safe } = updated;
    return NextResponse.json({ success: true, user: safe });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update staff user" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getCurrentStaffSession();
  if (!session || session.role !== "super_admin") {
    return NextResponse.json({ error: "Only Super Admin can remove staff users" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Staff User ID is required" }, { status: 400 });
  }

  try {
    const deleted = deleteStaffUser(id);
    if (!deleted) {
      return NextResponse.json({ error: "Staff user not found" }, { status: 404 });
    }

    logAuditEvent({
      staffId: session.userId,
      staffEmail: session.email,
      staffName: session.fullName,
      action: "STAFF_USER_DELETED",
      entityType: "StaffUser",
      entityId: id,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete staff user" }, { status: 500 });
  }
}
