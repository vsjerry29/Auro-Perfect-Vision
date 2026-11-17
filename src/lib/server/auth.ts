import crypto from "crypto";
import fs from "fs";
import path from "path";
import { cookies } from "next/headers";

export interface StaffUser {
  id: string;
  email: string;
  fullName: string;
  role: "super_admin" | "admin" | "therapist";
  therapistId?: string; // links to therapist_profile if role === "therapist"
  phone?: string;
  passwordHash: string;
  salt: string;
  isActive: boolean;
  status?: "active" | "invited" | "suspended";
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SessionPayload {
  userId: string;
  email: string;
  fullName: string;
  role: "super_admin" | "admin" | "therapist";
  therapistId?: string;
  expiresAt: number;
}

const DATA_DIR = path.join(process.cwd(), "data", "cms");
const USERS_FILE = path.join(DATA_DIR, "staff_users.json");
export const SESSION_COOKIE_NAME = "apv_staff_session";

// Secret for signing session tokens; can be set in process.env.SESSION_SECRET
const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  "auro_perfect_vision_secure_staff_secret_2026_auroville_holistic_eye_care";

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

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

export function getStaffUsers(): StaffUser[] {
  ensureDataDir();
  if (!fs.existsSync(USERS_FILE)) {
    // Bootstrap initial staff users
    const adminPass = process.env.ADMIN_INITIAL_PASSWORD || "AuroVision@2026!";
    const therapistPass = process.env.THERAPIST_INITIAL_PASSWORD || "AnanyaVision@2026!";

    const { hash: adminHash, salt: adminSalt } = hashPassword(adminPass);
    const { hash: therHash, salt: therSalt } = hashPassword(therapistPass);

    const initialUsers: StaffUser[] = [
      {
        id: "staff-admin-1",
        email: "admin@auroperfectvision.com",
        fullName: "Auro Perfect Vision Admin",
        role: "admin",
        passwordHash: adminHash,
        salt: adminSalt,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "staff-therapist-1",
        email: "therapist@auroperfectvision.com",
        fullName: "Dr. Ananya Sen",
        role: "therapist",
        therapistId: "therapist-1",
        passwordHash: therHash,
        salt: therSalt,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    fs.writeFileSync(USERS_FILE, JSON.stringify(initialUsers, null, 2), "utf-8");
    return initialUsers;
  }

  try {
    const raw = fs.readFileSync(USERS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading staff users file:", err);
    return [];
  }
}

export function saveStaffUsers(users: StaffUser[]) {
  ensureDataDir();
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
}

export function findStaffByEmail(email: string): StaffUser | undefined {
  const users = getStaffUsers();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim() && u.isActive);
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

export async function getCurrentStaffSession(): Promise<SessionPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
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

export function createStaffUser(data: {
  email: string;
  fullName: string;
  role: "super_admin" | "admin" | "therapist";
  phone?: string;
  therapistId?: string;
  initialPassword?: string;
}): StaffUser {
  const users = getStaffUsers();
  const existing = users.find((u) => u.email.toLowerCase() === data.email.toLowerCase().trim());
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

  users.push(newUser);
  saveStaffUsers(users);
  return newUser;
}

export function updateStaffUser(
  id: string,
  updates: Partial<StaffUser>
): StaffUser | null {
  const users = getStaffUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx < 0) return null;

  // Safeguard: do not allow deactivating the last active super_admin/admin
  if (updates.isActive === false || updates.role === "therapist") {
    const adminCount = users.filter(
      (u) => (u.role === "admin" || u.role === "super_admin") && u.isActive && u.id !== id
    ).length;
    if (adminCount === 0) {
      throw new Error("Cannot deactivate or demote the last remaining administrator.");
    }
  }

  const updated: StaffUser = {
    ...users[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  users[idx] = updated;
  saveStaffUsers(users);
  return updated;
}

export function deleteStaffUser(id: string): boolean {
  const users = getStaffUsers();
  const target = users.find((u) => u.id === id);
  if (!target) return false;

  // Safeguard: cannot delete last admin
  if (target.role === "admin" || target.role === "super_admin") {
    const adminCount = users.filter(
      (u) => (u.role === "admin" || u.role === "super_admin") && u.id !== id
    ).length;
    if (adminCount === 0) {
      throw new Error("Cannot remove the last remaining administrator.");
    }
  }

  const remaining = users.filter((u) => u.id !== id);
  saveStaffUsers(remaining);
  return true;
}
