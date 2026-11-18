import { NextResponse } from "next/server";
import {
  getCurrentStaffSession,
  getStaffUsers,
  createStaffUser,
  updateStaffUser,
  deleteStaffUser,
} from "@/lib/server/auth";
import { saveTherapist, logAuditEvent } from "@/lib/server/cms";

export async function GET() {
  const session = await getCurrentStaffSession();
  if (!session || (session.role !== "admin" && session.role !== "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const users = await getStaffUsers();
    const sanitized = users.map(({ passwordHash, salt, ...safe }) => safe);
    return NextResponse.json({ users: sanitized });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to load staff roster" },
      { status: 500 }
    );
  }
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
      return NextResponse.json(
        { error: "Email, Full Name, and Role are required." },
        { status: 400 }
      );
    }

    // Privilege escalation prevention: only super_admin can create another super_admin
    if (role === "super_admin" && session.role !== "super_admin") {
      return NextResponse.json(
        { error: "Forbidden: Only Super Administrators can invite new Super Administrators." },
        { status: 403 }
      );
    }

    let therapistId: string | undefined = undefined;

    // If role is therapist, create matching therapist public profile
    if (role === "therapist") {
      const savedProfile = await saveTherapist({
        displayName: therapistProfile?.displayName || fullName,
        roleTitle: therapistProfile?.roleTitle || "Vision Wellness Guide",
        bio: therapistProfile?.bio || "",
        specialties: therapistProfile?.specialties || ["Eye Yoga"],
        qualifications: therapistProfile?.qualifications || "Holistic Vision Specialist",
        photoUrl: therapistProfile?.photoUrl,
        email,
        phone: phone || "",
        isPublished:
          therapistProfile?.isPublished !== undefined
            ? therapistProfile.isPublished
            : true,
      });
      therapistId = savedProfile.id;
    }

    const newUser = await createStaffUser({
      email,
      fullName,
      role,
      phone,
      therapistId,
      initialPassword: body.initialPassword,
    });

    await logAuditEvent({
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
    return NextResponse.json(
      { error: err.message || "Failed to create staff user" },
      { status: 500 }
    );
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

    // Check target user existing role to enforce privilege escalation rules
    const users = await getStaffUsers();
    const targetUser = users.find((u) => u.id === id);
    if (!targetUser) {
      return NextResponse.json({ error: "Staff user not found" }, { status: 404 });
    }

    // Rule: Admin cannot edit a Super Admin
    if (targetUser.role === "super_admin" && session.role !== "super_admin") {
      return NextResponse.json(
        { error: "Forbidden: Only Super Administrators can modify Super Administrator accounts." },
        { status: 403 }
      );
    }

    // Rule: Admin cannot promote anyone (including themselves) to Super Admin
    if (role === "super_admin" && session.role !== "super_admin") {
      return NextResponse.json(
        { error: "Forbidden: Only Super Administrators can grant Super Administrator privileges." },
        { status: 403 }
      );
    }

    // Check if there are actual changes
    const roleChanged = role !== undefined && role !== targetUser.role;
    const statusChanged = status !== undefined && status !== targetUser.status;
    const activeChanged = isActive !== undefined && isActive !== targetUser.isActive;
    const nameChanged = fullName !== undefined && fullName !== targetUser.fullName;
    const phoneChanged = phone !== undefined && phone !== targetUser.phone;

    if (!roleChanged && !statusChanged && !activeChanged && !nameChanged && !phoneChanged) {
      const { passwordHash, salt, ...safe } = targetUser;
      return NextResponse.json({
        success: true,
        user: safe,
        message: "No changes detected.",
      });
    }

    const updated = await updateStaffUser(id, {
      role,
      isActive,
      status,
      fullName,
      phone,
    });

    if (!updated) {
      return NextResponse.json({ error: "Staff user not found" }, { status: 404 });
    }

    await logAuditEvent({
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
    return NextResponse.json(
      { error: err.message || "Failed to update staff user" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const session = await getCurrentStaffSession();
  if (!session || session.role !== "super_admin") {
    return NextResponse.json(
      { error: "Forbidden: Only Super Administrators can remove staff accounts." },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Staff User ID is required" }, { status: 400 });
  }

  try {
    const deleted = await deleteStaffUser(id);
    if (!deleted) {
      return NextResponse.json({ error: "Staff user not found" }, { status: 404 });
    }

    await logAuditEvent({
      staffId: session.userId,
      staffEmail: session.email,
      staffName: session.fullName,
      action: "STAFF_USER_DELETED",
      entityType: "StaffUser",
      entityId: id,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to delete staff user" },
      { status: 500 }
    );
  }
}
