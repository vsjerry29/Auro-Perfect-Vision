import crypto from "crypto";
import { cookies } from "next/headers";
import { isMySQLConfigured } from "./mysql";
import * as db from "./mysql-db";
import { readStore, writeStore } from "./storage-engine";
import { StaffUser } from "@/lib/types";
import { sendEmail, renderStaffInvitationEmail } from "./email";

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

// OWASP recommended iteration standards for PBKDF2-HMAC-SHA512
export const PBKDF2_ITERATIONS = 220000;
export const INTERMEDIATE_PBKDF2_ITERATIONS = 210000;
export const LEGACY_PBKDF2_ITERATIONS = 10000;

export function hashPassword(
  password: string,
  salt?: string,
  iterations: number = PBKDF2_ITERATIONS
): { hash: string; salt: string; iterations: number } {
  const generatedSalt = salt || crypto.randomBytes(32).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, generatedSalt, iterations, 64, "sha512")
    .toString("hex");
  return { hash, salt: generatedSalt, iterations };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  if (!password || !hash || !salt) return false;

  try {
    // 1. Check with modern standard (>= 220,000 iterations)
    const modernHash = crypto
      .pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, 64, "sha512")
      .toString("hex");

    if (
      hash.length === modernHash.length &&
      crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(modernHash))
    ) {
      return true;
    }

    // 2. Check with intermediate baseline (210,000 iterations)
    const intermediateHash = crypto
      .pbkdf2Sync(password, salt, INTERMEDIATE_PBKDF2_ITERATIONS, 64, "sha512")
      .toString("hex");

    if (
      hash.length === intermediateHash.length &&
      crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(intermediateHash))
    ) {
      return true;
    }

    // 3. Check with legacy baseline (10,000 iterations) for backward compatibility
    const legacyHash = crypto
      .pbkdf2Sync(password, salt, LEGACY_PBKDF2_ITERATIONS, 64, "sha512")
      .toString("hex");

    if (
      hash.length === legacyHash.length &&
      crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(legacyHash))
    ) {
      return true;
    }
  } catch {
    return false;
  }

  return false;
}

/**
 * Verifies credentials and seamlessly upgrades legacy or intermediate hashes
 * to the modern 220,000 OWASP standard in MySQL on successful login.
 */
export async function verifyAndUpgradeStaffPassword(
  password: string,
  staff: StaffUser
): Promise<{ isValid: boolean; wasUpgraded: boolean }> {
  if (!password || !staff?.passwordHash || !staff?.salt) {
    return { isValid: false, wasUpgraded: false };
  }

  // 1. Check modern 220,000 iterations
  const modernHash = crypto
    .pbkdf2Sync(password, staff.salt, PBKDF2_ITERATIONS, 64, "sha512")
    .toString("hex");

  if (
    staff.passwordHash.length === modernHash.length &&
    crypto.timingSafeEqual(Buffer.from(staff.passwordHash), Buffer.from(modernHash))
  ) {
    return { isValid: true, wasUpgraded: false };
  }

  // 2. Check intermediate 210,000 or legacy 10,000 iterations
  const intermediateHash = crypto
    .pbkdf2Sync(password, staff.salt, INTERMEDIATE_PBKDF2_ITERATIONS, 64, "sha512")
    .toString("hex");
  const legacyHash = crypto
    .pbkdf2Sync(password, staff.salt, LEGACY_PBKDF2_ITERATIONS, 64, "sha512")
    .toString("hex");

  const isIntermediate =
    staff.passwordHash.length === intermediateHash.length &&
    crypto.timingSafeEqual(Buffer.from(staff.passwordHash), Buffer.from(intermediateHash));
  const isLegacy =
    staff.passwordHash.length === legacyHash.length &&
    crypto.timingSafeEqual(Buffer.from(staff.passwordHash), Buffer.from(legacyHash));

  if (isIntermediate || isLegacy) {
    // Earlier credentials match: automatically upgrade to 220,000 iterations
    try {
      const { hash: newHash, salt: newSalt } = hashPassword(password, undefined, PBKDF2_ITERATIONS);
      await updateStaffUser(staff.id, {
        passwordHash: newHash,
        salt: newSalt,
      });
      return { isValid: true, wasUpgraded: true };
    } catch {
      // If DB update fails transiently, login still succeeds
      return { isValid: true, wasUpgraded: false };
    }
  }

  return { isValid: false, wasUpgraded: false };
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
  if (isMySQLConfigured()) {
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
      console.error("MySQL getStaffUsers error:", err);
      throw err;
    }
  }

  // Fallback to unified storage engine (never writes to disk in production)
  return readStore<StaffUser[]>("staff_users.json", getBootstrapUsers());
}

export async function findStaffByEmail(email: string): Promise<StaffUser | undefined> {
  const normalized = email.toLowerCase().trim();
  if (isMySQLConfigured()) {
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
  if (isMySQLConfigured()) {
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
  const cookieStore = await cookies();
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

/**
 * Creates a pending staff invitation with a single-use cryptographically secure token,
 * stores ONLY the SHA-256 hash in MySQL, sets a 48-hour expiration, and dispatches
 * a branded invitation email via Resend.
 */
export async function createStaffInvitation(data: {
  email: string;
  fullName: string;
  role: "super_admin" | "admin" | "therapist";
  phone?: string;
  therapistId?: string;
  invitedBy?: { id: string; email: string; fullName: string };
}): Promise<{
  user: StaffUser;
  rawToken: string;
  inviteUrl: string;
  emailSent: boolean;
  emailError?: string;
}> {
  const users = await getStaffUsers();
  const normalizedEmail = data.email.toLowerCase().trim();
  const existing = users.find(
    (u) => u.email.toLowerCase() === normalizedEmail
  );
  if (existing) {
    throw new Error("A staff user with this email address already exists.");
  }

  // Generate 32 bytes of secure random entropy (64 hex characters)
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

  const id = `staff-${Date.now()}`;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 48 * 60 * 60 * 1000); // 48-hour expiration

  const newUser: StaffUser = {
    id,
    email: normalizedEmail,
    fullName: data.fullName.trim(),
    role: data.role,
    phone: data.phone?.trim() || "",
    therapistId: data.therapistId,
    passwordHash: "", // No default passwords allowed
    salt: "",
    isActive: true,
    status: "invited",
    invitationToken: tokenHash, // Store ONLY the SHA-256 hash in database
    invitationSentAt: now.toISOString(),
    invitationExpiresAt: expiresAt.toISOString(),
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  let savedUser: StaffUser;
  if (isMySQLConfigured()) {
    savedUser = await db.dbCreateStaffUser(newUser);
  } else {
    users.push(newUser);
    await writeStore("staff_users.json", users);
    savedUser = newUser;
  }

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://auroperfectvision.com").replace(/\/$/, "");
  const inviteUrl = `${appUrl}/staff/activate?token=${rawToken}`;

  let emailSent = false;
  let emailError: string | undefined;

  const emailTemplates = renderStaffInvitationEmail({
    fullName: savedUser.fullName,
    role: savedUser.role,
    inviteUrl,
    expiresInHours: 48,
  });

  const sendResult = await sendEmail({
    to: savedUser.email,
    subject: "Invitation to Join Auro Perfect Vision Staff Portal",
    html: emailTemplates.html,
    text: emailTemplates.text,
    templateKey: "staff_invitation",
  });

  if (sendResult.success) {
    emailSent = true;
  } else {
    emailError = sendResult.error || "Email delivery failed";
  }

  return {
    user: savedUser,
    rawToken,
    inviteUrl,
    emailSent,
    emailError,
  };
}

/**
 * Resends a staff invitation with a fresh single-use token and 48-hour expiration.
 */
export async function resendStaffInvitation(
  userId: string,
  requesterSession: SessionPayload
): Promise<{
  success: boolean;
  rawToken: string;
  inviteUrl: string;
  emailSent: boolean;
  emailError?: string;
}> {
  const staff = await findStaffById(userId);
  if (!staff) {
    throw new Error("Staff user not found.");
  }
  if (staff.status !== "invited") {
    throw new Error("Only pending accounts in invited status can receive an invitation resend.");
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 48 * 60 * 60 * 1000);

  const updated = await updateStaffUser(userId, {
    invitationToken: tokenHash,
    invitationSentAt: now.toISOString(),
    invitationExpiresAt: expiresAt.toISOString(),
  });

  if (!updated) {
    throw new Error("Failed to update staff invitation token in database.");
  }

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://auroperfectvision.com").replace(/\/$/, "");
  const inviteUrl = `${appUrl}/staff/activate?token=${rawToken}`;

  let emailSent = false;
  let emailError: string | undefined;

  const emailTemplates = renderStaffInvitationEmail({
    fullName: staff.fullName,
    role: staff.role,
    inviteUrl,
    expiresInHours: 48,
  });

  const sendResult = await sendEmail({
    to: staff.email,
    subject: "Your New Invitation Link — Auro Perfect Vision Staff Portal",
    html: emailTemplates.html,
    text: emailTemplates.text,
    templateKey: "staff_invitation_resend",
  });

  if (sendResult.success) {
    emailSent = true;
  } else {
    emailError = sendResult.error || "Email delivery failed";
  }

  return {
    success: true,
    rawToken,
    inviteUrl,
    emailSent,
    emailError,
  };
}

/**
 * Revokes a pending staff invitation by removing the unactivated account.
 */
export async function revokeStaffInvitation(
  userId: string,
  requesterSession: SessionPayload
): Promise<{ success: boolean }> {
  const staff = await findStaffById(userId);
  if (!staff) {
    throw new Error("Staff user not found.");
  }
  if (staff.status !== "invited") {
    throw new Error("Only pending invitations can be revoked.");
  }

  await deleteStaffUser(userId);
  return { success: true };
}

/**
 * Verifies an invitation token without consuming it. Used by the activation page.
 */
export async function verifyStaffInvitationToken(rawToken: string): Promise<{
  valid: boolean;
  user?: { id: string; email: string; fullName: string; role: string };
  error?: string;
}> {
  if (!rawToken || typeof rawToken !== "string" || rawToken.trim().length < 32) {
    return { valid: false, error: "Invalid invitation link." };
  }

  const tokenHash = crypto.createHash("sha256").update(rawToken.trim()).digest("hex");
  let user: StaffUser | null = null;

  if (isMySQLConfigured()) {
    user = await db.dbFindStaffByInvitationTokenHash(tokenHash);
  } else {
    const users = await getStaffUsers();
    user = users.find((u) => u.invitationToken === tokenHash) || null;
  }

  if (!user || user.status !== "invited") {
    return {
      valid: false,
      error: "This invitation link is invalid or has already been used. Please request a new invitation from your administrator.",
    };
  }

  const now = Date.now();
  const expiresAt = user.invitationExpiresAt
    ? new Date(user.invitationExpiresAt).getTime()
    : user.invitationSentAt
    ? new Date(user.invitationSentAt).getTime() + 48 * 60 * 60 * 1000
    : 0;

  if (now > expiresAt) {
    return {
      valid: false,
      error: "This invitation link expired after 48 hours. Please request your administrator to resend the invitation.",
    };
  }

  return {
    valid: true,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    },
  };
}

/**
 * Accepts a staff invitation, validates password complexity, stores OWASP PBKDF2 hash,
 * activates the account, and invalidates the single-use token.
 */
export async function acceptStaffInvitation(
  rawToken: string,
  newPassword: string
): Promise<{
  success: boolean;
  user?: { id: string; email: string; fullName: string; role: string };
  error?: string;
}> {
  const verification = await verifyStaffInvitationToken(rawToken);
  if (!verification.valid || !verification.user) {
    return { success: false, error: verification.error || "Invalid invitation token." };
  }

  if (!newPassword || typeof newPassword !== "string" || newPassword.length < 8) {
    return { success: false, error: "Password must be at least 8 characters long." };
  }
  if (!/[A-Z]/.test(newPassword)) {
    return { success: false, error: "Password must contain at least one uppercase letter." };
  }
  if (!/[a-z]/.test(newPassword)) {
    return { success: false, error: "Password must contain at least one lowercase letter." };
  }
  if (!/[0-9]/.test(newPassword)) {
    return { success: false, error: "Password must contain at least one digit." };
  }
  if (!/[^A-Za-z0-9]/.test(newPassword)) {
    return { success: false, error: "Password must contain at least one special character." };
  }

  const { hash, salt } = hashPassword(newPassword, undefined, PBKDF2_ITERATIONS);

  const updated = await updateStaffUser(verification.user.id, {
    passwordHash: hash,
    salt,
    status: "active",
    isActive: true,
    invitationToken: undefined,
    invitationSentAt: undefined,
    invitationExpiresAt: undefined,
  });

  if (!updated) {
    return { success: false, error: "Failed to activate staff account. Please try again." };
  }

  return {
    success: true,
    user: {
      id: updated.id,
      email: updated.email,
      fullName: updated.fullName,
      role: updated.role,
    },
  };
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

  if (isMySQLConfigured()) {
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

  if (isMySQLConfigured()) {
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

  if (isMySQLConfigured()) {
    return await db.dbDeleteStaffUser(id);
  }

  const remaining = users.filter((u) => u.id !== id);
  await writeStore("staff_users.json", remaining);
  return true;
}
