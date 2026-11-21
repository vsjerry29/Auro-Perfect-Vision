import { NextResponse } from "next/server";
import {
  findStaffByEmail,
  verifyAndUpgradeStaffPassword,
  createSessionToken,
  SESSION_COOKIE_NAME,
} from "@/lib/server/auth";
import { getMySQLPool, isMySQLConfigured } from "@/lib/server/mysql";

// Login rate limiter: Max 5 failed attempts per 15 minutes (Memory + Persistent MySQL)
interface RateLimitRecord {
  attempts: number;
  firstAttemptAt: number;
}
const loginRateLimitMap = new Map<string, RateLimitRecord>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

async function checkRateLimit(key: string): Promise<{ allowed: boolean; retryAfterSeconds: number }> {
  const now = Date.now();
  const record = loginRateLimitMap.get(key);

  if (record) {
    if (now - record.firstAttemptAt > WINDOW_MS) {
      loginRateLimitMap.delete(key);
    } else if (record.attempts >= MAX_ATTEMPTS) {
      const retryAfter = Math.ceil((record.firstAttemptAt + WINDOW_MS - now) / 1000);
      return { allowed: false, retryAfterSeconds: Math.max(1, retryAfter) };
    }
  }

  // Check persistent MySQL audit logs to survive server restarts/worker recycling
  if (isMySQLConfigured()) {
    try {
      const pool = getMySQLPool();
      const [rows] = await pool.query<any[]>(
        `SELECT COUNT(*) as attempts, UNIX_TIMESTAMP(MIN(created_at)) * 1000 as firstAttemptAt
         FROM audit_logs
         WHERE action = 'AUTH_FAILED' AND entity_id = ? AND created_at >= NOW() - INTERVAL 15 MINUTE`,
        [key]
      );
      if (rows && rows.length > 0 && rows[0].attempts >= MAX_ATTEMPTS) {
        const firstAt = Number(rows[0].firstAttemptAt) || (now - WINDOW_MS);
        const retryAfter = Math.ceil((firstAt + WINDOW_MS - now) / 1000);
        return { allowed: false, retryAfterSeconds: Math.max(1, retryAfter) };
      }
    } catch {
      // Non-fatal: in-memory limiter continues to protect
    }
  }

  return { allowed: true, retryAfterSeconds: 0 };
}

async function recordFailedAttempt(key: string, ipAddress?: string): Promise<void> {
  const now = Date.now();
  const record = loginRateLimitMap.get(key);
  if (!record || now - record.firstAttemptAt > WINDOW_MS) {
    loginRateLimitMap.set(key, { attempts: 1, firstAttemptAt: now });
  } else {
    record.attempts += 1;
  }

  // Record failed attempt in MySQL audit_logs for durable rate limiting
  if (isMySQLConfigured()) {
    try {
      const pool = getMySQLPool();
      await pool.execute(
        `INSERT INTO audit_logs (id, action, entity_type, entity_id, details, ip_address, created_at)
         VALUES (?, 'AUTH_FAILED', 'staff_login', ?, ?, ?, NOW())`,
        [
          `fail_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
          key,
          JSON.stringify({ attempt: "failed_password", timestamp: Date.now() }),
          ipAddress || "unknown",
        ]
      );
    } catch {
      // Non-fatal
    }
  }
}

async function clearRateLimit(key: string): Promise<void> {
  loginRateLimitMap.delete(key);
  if (isMySQLConfigured()) {
    try {
      const pool = getMySQLPool();
      await pool.execute(
        `DELETE FROM audit_logs WHERE action = 'AUTH_FAILED' AND entity_id = ? AND created_at >= NOW() - INTERVAL 15 MINUTE`,
        [key]
      );
    } catch {
      // Non-fatal
    }
  }
}

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

    const normalizedEmail = email.toLowerCase().trim();
    const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "local";

    // Check rate limit by normalized email (Memory + MySQL)
    const rateCheck = await checkRateLimit(normalizedEmail);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Too many failed login attempts. Please wait ${rateCheck.retryAfterSeconds} seconds before trying again.`,
        },
        { status: 429 }
      );
    }

    const staff = await findStaffByEmail(normalizedEmail);

    if (!staff) {
      await recordFailedAttempt(normalizedEmail, ipAddress);
      return NextResponse.json(
        { error: "Invalid credentials. Please verify your email and password." },
        { status: 401 }
      );
    }

    // Pending invited accounts must activate via their secure invitation link first
    if (staff.status === "invited") {
      return NextResponse.json(
        {
          error:
            "This account is pending activation. Please open the secure invitation link sent to your email to establish your password and activate your access.",
        },
        { status: 403 }
      );
    }

    // Suspended or deactivated staff accounts cannot authenticate
    if (staff.status === "suspended" || !staff.isActive) {
      return NextResponse.json(
        {
          error:
            "This staff account has been deactivated or suspended. Please contact your Super Administrator.",
        },
        { status: 403 }
      );
    }

    // Verify password with automatic upgrade of legacy iterations to modern 220,000
    const { isValid, wasUpgraded } = await verifyAndUpgradeStaffPassword(password, staff);

    if (!isValid) {
      await recordFailedAttempt(normalizedEmail, ipAddress);
      return NextResponse.json(
        { error: "Invalid credentials. Please verify your email and password." },
        { status: 401 }
      );
    }

    // Login successful: reset rate limit
    await clearRateLimit(normalizedEmail);

    if (wasUpgraded) {
      console.log(`[Security Notice] Staff account ${staff.email} automatically upgraded to OWASP 220,000 PBKDF2 iterations.`);
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
