import { NextResponse } from "next/server";
import { findStaffByEmail, verifyPassword, createSessionToken, SESSION_COOKIE_NAME } from "@/lib/server/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const staff = await findStaffByEmail(email);

    // Generic error message to prevent account enumeration
    if (!staff || !verifyPassword(password, staff.passwordHash, staff.salt)) {
      return NextResponse.json(
        { error: "Invalid credentials. Please verify your email and password." },
        { status: 401 }
      );
    }

    // Session valid for 7 days
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
    const token = createSessionToken({
      userId: staff.id,
      email: staff.email,
      fullName: staff.fullName,
      role: staff.role,
      therapistId: staff.therapistId,
      expiresAt,
    });

    const redirectPath =
      staff.role === "admin" || staff.role === "super_admin"
        ? "/admin"
        : "/therapist";

    const response = NextResponse.json({
      success: true,
      role: staff.role,
      fullName: staff.fullName,
      redirectUrl: redirectPath,
    });

    // Set secure HTTP-only cookie
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    });

    return response;
  } catch (err: any) {
    console.error("Login error:", err);
    return NextResponse.json(
      { error: "Authentication system error. Please try again." },
      { status: 500 }
    );
  }
}
