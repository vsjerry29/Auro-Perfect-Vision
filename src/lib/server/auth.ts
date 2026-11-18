import crypto from "crypto";
import { cookies } from "next/headers";
import { isSupabaseConfigured } from "./supabase";
import * as db from "./supabase-db";
import { readStore, writeStore } from "./storage-engine";
import { StaffUser } from "@/lib/types";

export type { StaffUser };

export interface SessionPayload {
  userId: string;
  email: string;
  fullName: string;
  role: "super_admin" | "admin" | "therapist";
  therapistId?: string;
  expiresAt: number;
}

export const SESSION_COOKIE_NAME = "apv_staff_session";

// Secret for signing session tokens; can be set in process.env.SESSION_SECRET
const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  "auro_perfect_vision_secure_staff_secret_2026_auroville_holistic_eye_care";

export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const generatedSalt = salt || crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, generatedSalt, 10000, 64, "sha512")
    .toString("hex");
  return { hash, salt: generatedSalt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const { hash: calculatedHash } = hashPassword(password, salt);
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(calculatedHash));
}

function getBootstrapUsers(): StaffUser[] {
  const adminPass = process.env.ADMIN_INITIAL_PASSWORD || "AuroVision@2026!";
  const therapistPass = process.env.THERAPIST_INITIAL_PASSWORD || "AnanyaVision@2026!";

  const { hash: adminHash, salt: adminSalt } = hashPassword(adminPass);
  const { hash: therHash, salt: therSalt } = hashPassword(therapistPass);

  return [
    {
      id: "staff-admin-1",
      email: "admin@auroperfectvision.com",
      fullName: "Auro Perfect Vision Admin",
      role: "super_admin",
      phone: "+91 8012305151",
      passwordHash: adminHash,
      salt: adminSalt,
      isActive: true,
      status: "active",
      createdAt: "2026-11-01T00:00:00.000Z",
      updatedAt: "2026-11-01T00:00:00.000Z",
    },
    {
      id: "staff-therapist-1",
      email: "therapist@auroperfectvision.com",
      fullName: "Dr. Ananya Sen",
      role: "therapist",
      therapistId: "therapist-1",
      phone: "+91 9488005685",
      passwordHash: therHash,
      salt: therSalt,
      isActive: true,
      status: "active",
      createdAt: "2026-11-01T00:00:00.000Z",
      updatedAt: "2026-11-01T00:00:00.000Z",
    },
  ];
}

export async function getStaffUsers(): Promise<StaffUser[]> {
  if (isSupabaseConfigured()) {
    try {
      const users = await db.dbGetStaffUsers();
      if (users.length > 0) return users;

      // If database table is empty, bootstrap initial staff users
      const initialUsers = getBootstrapUsers();
      for (const u of initialUsers) {
        await db.dbCreateStaffUser(u);
      }
      return initialUsers;
    } catch (err) {
      console.error("Supabase getStaffUsers error:", err);
      throw err;
    }
  }

  // Fallback to unified storage engine (never writes to disk in production)
  return readStore<StaffUser[]>("staff_users.json", getBootstrapUsers());
}

export async function findStaffByEmail(email: string): Promise<StaffUser | undefined> {
  const normalized = email.toLowerCase().trim();
  if (isSupabaseConfigured()) {
    const user = await db.dbFindStaffByEmail(normalized);
    if (user && user.isActive && user.status !== "suspended") {
      return user;
    }
    return undefined;
  }

  const users = await getStaffUsers();
  return users.find(
    (u) =>
      u.email.toLowerCase() === normalized &&
      u.isActive &&
      u.status !== "suspended"
  );
}

export async function findStaffById(id: string): Promise<StaffUser | undefined> {
  if (isSupabaseConfigured()) {
    const user = await db.dbFindStaffById(id);
    return user || undefined;
  }

  const users = await getStaffUsers();
  return users.find((u) => u.id === id);
}

export function createSessionToken(payload: SessionPayload): string {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(data)
    .digest("base64url");
  return `${data}.${signature}`;
}

export function verifySessionToken(token: string): SessionPayload | null {
  if (!token || !token.includes(".")) return null;
  const [data, signature] = token.split(".");
  const expectedSignature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(data)
    .digest("base64url");

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    return null;
  }

  try {
    const payload: SessionPayload = JSON.parse(
      Buffer.from(data, "base64url").toString("utf-8")
    );
    if (Date.now() > payload.expiresAt) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

/**
 * Retrieves the current authenticated staff session.
 * Actively checks the database/store: if the account is suspended or deactivated,
 * active sessions are IMMEDIATELY revoked (returns null).
 */
export async function getCurrentStaffSession(): Promise<SessionPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = verifySessionToken(token);
  if (!payload) return null;

  // Active revocation check: user must exist, be active, and not suspended
  try {
    const staff = await findStaffById(payload.userId);
    if (!staff || !staff.isActive || staff.status === "suspended") {
      return null; // Session revoked immediately on suspension!
    }

    // Return updated session with live effective role from database
    return {
      ...payload,
      role: staff.role,
      fullName: staff.fullName,
      therapistId: staff.therapistId,
    };
  } catch {
    // If DB check fails transiently, verify payload is still valid
    return payload;
  }
}

export async function requireAdminSession(): Promise<SessionPayload> {
  const session = await getCurrentStaffSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  if (session.role !== "admin" && session.role !== "super_admin") {
    throw new Error("FORBIDDEN");
  }
  return session;
}

export async function requireSuperAdminSession(): Promise<SessionPayload> {
  const session = await getCurrentStaffSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  if (session.role !== "super_admin") {
    throw new Error("FORBIDDEN");
  }
  return session;
}

export async function requireTherapistSession(): Promise<SessionPayload> {
  const session = await getCurrentStaffSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  if (session.role !== "therapist" && session.role !== "admin" && session.role !== "super_admin") {
    throw new Error("FORBIDDEN");
  }
  return session;
}

export async function createStaffUser(data: {
  email: string;
  fullName: string;
  role: "super_admin" | "admin" | "therapist";
  phone?: string;
  therapistId?: string;
  initialPassword?: string;
}): Promise<StaffUser> {
  const users = await getStaffUsers();
  const existing = users.find(
    (u) => u.email.toLowerCase() === data.email.toLowerCase().trim()
  );
  if (existing) {
    throw new Error("A staff user with this email already exists.");
  }

  const id = `staff-${Date.now()}`;
  const password = data.initialPassword || "AuroStaff@2026!";
  const { hash, salt } = hashPassword(password);

  const newUser: StaffUser = {
    id,
    email: data.email.toLowerCase().trim(),
    fullName: data.fullName,
    role: data.role,
    phone: data.phone || "",
    therapistId: data.therapistId,
    passwordHash: hash,
    salt,
    isActive: true,
    status: "invited",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    return await db.dbCreateStaffUser(newUser);
  }

  users.push(newUser);
  await writeStore("staff_users.json", users);
  return newUser;
}

export async function updateStaffUser(
  id: string,
  updates: Partial<StaffUser>
): Promise<StaffUser | null> {
  const users = await getStaffUsers();
  const target = users.find((u) => u.id === id);
  if (!target) return null;

  // Safeguard: do not allow deactivating, suspending, or demoting the last active super_admin
  const isDeactivatingOrSuspending =
    updates.isActive === false || updates.status === "suspended";
  const isDemoting = updates.role && updates.role !== "super_admin";

  if (target.role === "super_admin" && (isDeactivatingOrSuspending || isDemoting)) {
    const otherSuperAdmins = users.filter(
      (u) =>
        u.role === "super_admin" &&
        u.isActive &&
        u.status !== "suspended" &&
        u.id !== id
    );
    if (otherSuperAdmins.length === 0) {
      throw new Error(
        "Cannot deactivate, suspend, or demote the last remaining Super Administrator."
      );
    }
  }

  // Also prevent removing the last admin/super_admin if none left
  if (isDeactivatingOrSuspending || updates.role === "therapist") {
    const adminCount = users.filter(
      (u) =>
        (u.role === "admin" || u.role === "super_admin") &&
        u.isActive &&
        u.status !== "suspended" &&
        u.id !== id
    ).length;
    if (adminCount === 0) {
      throw new Error("Cannot deactivate or demote the last remaining administrator.");
    }
  }

  if (isSupabaseConfigured()) {
    return await db.dbUpdateStaffUser(id, updates);
  }

  const idx = users.findIndex((u) => u.id === id);
  const updated: StaffUser = {
    ...users[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  users[idx] = updated;
  await writeStore("staff_users.json", users);
  return updated;
}

export async function deleteStaffUser(id: string): Promise<boolean> {
  const users = await getStaffUsers();
  const target = users.find((u) => u.id === id);
  if (!target) return false;

  // Safeguard: cannot delete last super_admin or admin
  if (target.role === "super_admin") {
    const otherSuperAdmins = users.filter(
      (u) =>
        u.role === "super_admin" &&
        u.isActive &&
        u.status !== "suspended" &&
        u.id !== id
    );
    if (otherSuperAdmins.length === 0) {
      throw new Error("Cannot remove the last remaining Super Administrator.");
    }
  }

  const adminCount = users.filter(
    (u) => (u.role === "admin" || u.role === "super_admin") && u.id !== id
  ).length;
  if (adminCount === 0) {
    throw new Error("Cannot remove the last remaining administrator.");
  }

  if (isSupabaseConfigured()) {
    return await db.dbDeleteStaffUser(id);
  }

  const remaining = users.filter((u) => u.id !== id);
  await writeStore("staff_users.json", remaining);
  return true;
}
