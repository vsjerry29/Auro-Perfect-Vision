/**
 * AURO PERFECT VISION — MYSQL DATA ACCESS LAYER
 * Production-ready MySQL persistence implementing all CMS, CRM, EMR, Booking,
 * Staff, and Operational entities using parameterized queries & transactions.
 */

import { query, execute, withTransaction, isMySQLConfigured } from "./mysql";
import { initMySQLSchema } from "./mysql-schema";
import { StaffUser } from "./auth";
import {
  Offering,
  Therapist,
  BlogPost,
  Booking,
  Programme,
  MediaAsset,
  CmsRevision,
  AuditLogEntry,
  RecurringScheduleDay,
  LeaveException,
  IntakeTemplate,
  SiteContent,
  PaymentTransaction,
  InvoiceRecord,
} from "@/lib/types";
import {
  ClientContact,
  CrmInquiry,
  CrmTask,
  CrmNote,
  CrmActivity,
} from "@/lib/types/crm";
import {
  PatientRecord,
  PatientMedicalHistory,
  ClinicalEncounter,
  VisionAssessment,
  ClinicalNote,
  TreatmentPlan,
  ClinicalAuditEvent,
} from "@/lib/types/emr";

// Safe JSON parser helper
function safeJsonParse<T>(val: any, fallback: T): T {
  if (val === null || val === undefined) return fallback;
  if (typeof val === "object") return val as T;
  try {
    return JSON.parse(val) as T;
  } catch {
    return fallback;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. STAFF PROFILES (Authentication & Accounts)
// ─────────────────────────────────────────────────────────────────────────────

export async function dbGetStaffUsers(): Promise<StaffUser[]> {
  await initMySQLSchema();
  const rows = await query<any>(
    "SELECT * FROM staff_profiles ORDER BY created_at DESC"
  );

  return rows.map((r) => ({
    id: r.id,
    email: r.email,
    fullName: r.full_name,
    role: r.role,
    phone: r.phone || "",
    passwordHash: r.password_hash || "",
    salt: r.salt || "",
    isActive: Boolean(r.is_active),
    status: r.status || (r.is_active ? "active" : "suspended"),
    therapistId: r.therapist_id,
    invitationToken: r.invitation_token || undefined,
    invitationSentAt: r.invitation_sent_at ? new Date(r.invitation_sent_at).toISOString() : undefined,
    invitationExpiresAt: r.invitation_expires_at ? new Date(r.invitation_expires_at).toISOString() : undefined,
    lastLoginAt: r.last_login_at ? new Date(r.last_login_at).toISOString() : undefined,
    createdAt: new Date(r.created_at).toISOString(),
    updatedAt: new Date(r.updated_at).toISOString(),
  }));
}



export async function dbFindStaffByEmail(email: string): Promise<StaffUser | null> {
  await initMySQLSchema();
  const rows = await query<any>(
    "SELECT * FROM staff_profiles WHERE LOWER(email) = LOWER(?) LIMIT 1",
    [email.trim()]
  );
  if (!rows || rows.length === 0) return null;
  const r = rows[0];

  return {
    id: r.id,
    email: r.email,
    fullName: r.full_name,
    role: r.role,
    phone: r.phone || "",
    passwordHash: r.password_hash || "",
    salt: r.salt || "",
    isActive: Boolean(r.is_active),
    status: r.status || (r.is_active ? "active" : "suspended"),
    therapistId: r.therapist_id,
    invitationToken: r.invitation_token || undefined,
    invitationSentAt: r.invitation_sent_at ? new Date(r.invitation_sent_at).toISOString() : undefined,
    invitationExpiresAt: r.invitation_expires_at ? new Date(r.invitation_expires_at).toISOString() : undefined,
    lastLoginAt: r.last_login_at ? new Date(r.last_login_at).toISOString() : undefined,
    createdAt: new Date(r.created_at).toISOString(),
    updatedAt: new Date(r.updated_at).toISOString(),
  };
}

export async function dbFindStaffById(id: string): Promise<StaffUser | null> {
  await initMySQLSchema();
  const rows = await query<any>(
    "SELECT * FROM staff_profiles WHERE id = ? LIMIT 1",
    [id]
  );
  if (!rows || rows.length === 0) return null;
  const r = rows[0];

  return {
    id: r.id,
    email: r.email,
    fullName: r.full_name,
    role: r.role,
    phone: r.phone || "",
    passwordHash: r.password_hash || "",
    salt: r.salt || "",
    isActive: Boolean(r.is_active),
    status: r.status || (r.is_active ? "active" : "suspended"),
    therapistId: r.therapist_id,
    invitationToken: r.invitation_token || undefined,
    invitationSentAt: r.invitation_sent_at ? new Date(r.invitation_sent_at).toISOString() : undefined,
    invitationExpiresAt: r.invitation_expires_at ? new Date(r.invitation_expires_at).toISOString() : undefined,
    lastLoginAt: r.last_login_at ? new Date(r.last_login_at).toISOString() : undefined,
    createdAt: new Date(r.created_at).toISOString(),
    updatedAt: new Date(r.updated_at).toISOString(),
  };
}

export async function dbCreateStaffUser(user: StaffUser): Promise<StaffUser> {
  await initMySQLSchema();
  const sql = `
    INSERT INTO staff_profiles (
      id, email, full_name, role, phone, password_hash, salt,
      is_active, status, therapist_id, invitation_token, invitation_sent_at, invitation_expires_at, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    ON DUPLICATE KEY UPDATE
      full_name = VALUES(full_name),
      role = VALUES(role),
      phone = VALUES(phone),
      password_hash = VALUES(password_hash),
      salt = VALUES(salt),
      is_active = VALUES(is_active),
      status = VALUES(status),
      therapist_id = VALUES(therapist_id),
      invitation_token = VALUES(invitation_token),
      invitation_sent_at = VALUES(invitation_sent_at),
      invitation_expires_at = VALUES(invitation_expires_at),
      updated_at = NOW()
  `;

  await execute(sql, [
    user.id,
    user.email.toLowerCase().trim(),
    user.fullName,
    user.role,
    user.phone || "",
    user.passwordHash || "",
    user.salt || "",
    user.isActive ? 1 : 0,
    user.status || "active",
    user.therapistId || null,
    user.invitationToken || null,
    user.invitationSentAt ? new Date(user.invitationSentAt) : null,
    user.invitationExpiresAt ? new Date(user.invitationExpiresAt) : null,
  ]);

  return user;
}

export async function dbFindStaffByInvitationTokenHash(tokenHash: string): Promise<StaffUser | null> {
  await initMySQLSchema();
  const rows = await query<any>(
    "SELECT * FROM staff_profiles WHERE invitation_token = ? LIMIT 1",
    [tokenHash]
  );
  if (!rows || rows.length === 0) return null;
  const r = rows[0];

  return {
    id: r.id,
    email: r.email,
    fullName: r.full_name,
    role: r.role,
    phone: r.phone || "",
    passwordHash: r.password_hash || "",
    salt: r.salt || "",
    isActive: Boolean(r.is_active),
    status: r.status || (r.is_active ? "active" : "suspended"),
    therapistId: r.therapist_id,
    invitationToken: r.invitation_token || undefined,
    invitationSentAt: r.invitation_sent_at ? new Date(r.invitation_sent_at).toISOString() : undefined,
    invitationExpiresAt: r.invitation_expires_at ? new Date(r.invitation_expires_at).toISOString() : undefined,
    lastLoginAt: r.last_login_at ? new Date(r.last_login_at).toISOString() : undefined,
    createdAt: new Date(r.created_at).toISOString(),
    updatedAt: new Date(r.updated_at).toISOString(),
  };
}

export async function dbUpdateStaffUser(
  id: string,
  updates: Partial<StaffUser>
): Promise<StaffUser | null> {
  await initMySQLSchema();
  const existing = await dbFindStaffById(id);
  if (!existing) return null;

  const fields: string[] = [];
  const params: any[] = [];

  if (updates.fullName !== undefined) {
    fields.push("full_name = ?");
    params.push(updates.fullName);
  }
  if (updates.role !== undefined) {
    fields.push("role = ?");
    params.push(updates.role);
  }
  if (updates.phone !== undefined) {
    fields.push("phone = ?");
    params.push(updates.phone);
  }
  if (updates.passwordHash !== undefined) {
    fields.push("password_hash = ?");
    params.push(updates.passwordHash);
  }
  if (updates.salt !== undefined) {
    fields.push("salt = ?");
    params.push(updates.salt);
  }
  if (updates.isActive !== undefined) {
    fields.push("is_active = ?");
    params.push(updates.isActive ? 1 : 0);
  }
  if (updates.status !== undefined) {
    fields.push("status = ?");
    params.push(updates.status);
  }
  if (updates.therapistId !== undefined) {
    fields.push("therapist_id = ?");
    params.push(updates.therapistId || null);
  }
  if (updates.invitationToken !== undefined) {
    fields.push("invitation_token = ?");
    params.push(updates.invitationToken || null);
  }
  if (updates.invitationSentAt !== undefined) {
    fields.push("invitation_sent_at = ?");
    params.push(updates.invitationSentAt ? new Date(updates.invitationSentAt) : null);
  }
  if (updates.invitationExpiresAt !== undefined) {
    fields.push("invitation_expires_at = ?");
    params.push(updates.invitationExpiresAt ? new Date(updates.invitationExpiresAt) : null);
  }
  if (updates.lastLoginAt !== undefined) {
    fields.push("last_login_at = ?");
    params.push(updates.lastLoginAt ? new Date(updates.lastLoginAt) : null);
  }

  if (fields.length === 0) return existing;

  params.push(id);
  await execute(`UPDATE staff_profiles SET ${fields.join(", ")} WHERE id = ?`, params);
  return await dbFindStaffById(id);
}

export async function dbDeleteStaffUser(id: string): Promise<boolean> {
  await initMySQLSchema();
  const res = await execute("DELETE FROM staff_profiles WHERE id = ?", [id]);
  return res.affectedRows > 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. SITE CONTENT (CMS Homepage Hero, Carousel & Contact)
// ─────────────────────────────────────────────────────────────────────────────

export async function dbGetSiteContent(): Promise<SiteContent | null> {
  await initMySQLSchema();
  const rows = await query<any>(
    "SELECT content FROM site_content WHERE id = 'global_settings' LIMIT 1"
  );
  if (!rows || rows.length === 0) return null;
  return safeJsonParse<SiteContent>(rows[0].content, null as any);
}

export async function dbSaveSiteContent(content: SiteContent): Promise<SiteContent> {
  await initMySQLSchema();
  const payload = JSON.stringify(content);
  await execute(
    `INSERT INTO site_content (id, content, updated_at)
     VALUES ('global_settings', ?, NOW())
     ON DUPLICATE KEY UPDATE content = VALUES(content), updated_at = NOW()`,
    [payload]
  );
  return content;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. THERAPIST PROFILES
// ─────────────────────────────────────────────────────────────────────────────

export async function dbGetAllTherapists(includeUnpublished = true): Promise<Therapist[]> {
  await initMySQLSchema();
  let sql = "SELECT * FROM therapist_profiles";
  if (!includeUnpublished) {
    sql += " WHERE is_published = 1 AND is_archived = 0";
  }
  sql += " ORDER BY created_at ASC";

  const rows = await query<any>(sql);
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    displayName: r.display_name,
    roleTitle: r.role_title,
    bio: r.bio || "",
    specialties: safeJsonParse<string[]>(r.specialties, ["Eye Yoga"]),
    qualifications: r.qualifications || "",
    photoUrl: r.photo_url || "",
    assignedOfferingIds: safeJsonParse<string[]>(r.assigned_offering_ids, []),
    email: r.email || "",
    phone: r.phone || "",
    isPublished: Boolean(r.is_published),
    isArchived: Boolean(r.is_archived),
    status: r.status,
  }));
}

export async function dbGetTherapistById(id: string): Promise<Therapist | null> {
  await initMySQLSchema();
  const rows = await query<any>(
    "SELECT * FROM therapist_profiles WHERE id = ? LIMIT 1",
    [id]
  );
  if (!rows || rows.length === 0) return null;
  const r = rows[0];

  return {
    id: r.id,
    slug: r.slug,
    displayName: r.display_name,
    roleTitle: r.role_title,
    bio: r.bio || "",
    specialties: safeJsonParse<string[]>(r.specialties, ["Eye Yoga"]),
    qualifications: r.qualifications || "",
    photoUrl: r.photo_url || "",
    assignedOfferingIds: safeJsonParse<string[]>(r.assigned_offering_ids, []),
    email: r.email || "",
    phone: r.phone || "",
    isPublished: Boolean(r.is_published),
    isArchived: Boolean(r.is_archived),
    status: r.status,
  };
}

export async function dbSaveTherapist(t: Therapist): Promise<Therapist> {
  await initMySQLSchema();
  const sql = `
    INSERT INTO therapist_profiles (
      id, slug, display_name, role_title, bio, specialties, qualifications,
      photo_url, phone, email, assigned_offering_ids, is_published, is_archived, status,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    ON DUPLICATE KEY UPDATE
      slug = VALUES(slug),
      display_name = VALUES(display_name),
      role_title = VALUES(role_title),
      bio = VALUES(bio),
      specialties = VALUES(specialties),
      qualifications = VALUES(qualifications),
      photo_url = VALUES(photo_url),
      phone = VALUES(phone),
      email = VALUES(email),
      assigned_offering_ids = VALUES(assigned_offering_ids),
      is_published = VALUES(is_published),
      is_archived = VALUES(is_archived),
      status = VALUES(status),
      updated_at = NOW()
  `;

  await execute(sql, [
    t.id,
    t.slug,
    t.displayName,
    t.roleTitle || "Vision Wellness Guide",
    t.bio || "",
    JSON.stringify(t.specialties || []),
    t.qualifications || "",
    t.photoUrl || "",
    t.phone || "",
    t.email || "",
    JSON.stringify(t.assignedOfferingIds || []),
    t.isPublished ? 1 : 0,
    t.isArchived ? 1 : 0,
    t.status || "active",
  ]);

  return t;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. OFFERINGS
// ─────────────────────────────────────────────────────────────────────────────

export async function dbGetAllOfferings(includeDrafts = true): Promise<Offering[]> {
  await initMySQLSchema();
  let sql = "SELECT * FROM offerings";
  if (!includeDrafts) {
    sql += " WHERE is_published = 1";
  }
  sql += " ORDER BY created_at ASC";

  const rows = await query<any>(sql);
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    category: r.category,
    shortDescription: r.short_description,
    fullDescription: r.full_description,
    durationMinutes: r.duration_minutes,
    format: r.format,
    delivery: r.delivery,
    price: {
      inr: r.price_inr,
      usd: r.price_usd,
      taxInclusive: Boolean(r.tax_inclusive),
    },
    assignedTherapistIds: safeJsonParse<string[]>(r.assigned_therapist_ids, []),
    maxCapacity: r.max_capacity,
    isFlagshipProgramme: Boolean(r.is_flagship_programme),
    featured: Boolean(r.featured),
    suitableFor: safeJsonParse<string[]>(r.suitable_for, []),
    whatToExpect: safeJsonParse<string[]>(r.what_to_expect, []),
    programmeSyllabus: safeJsonParse<any[]>(r.programme_syllabus, []),
    imageUrl: r.image_url || "",
    isPublished: Boolean(r.is_published),
  }));
}

export async function dbGetOfferingBySlug(slug: string): Promise<Offering | null> {
  await initMySQLSchema();
  const rows = await query<any>("SELECT * FROM offerings WHERE slug = ? LIMIT 1", [slug]);
  if (!rows || rows.length === 0) return null;
  const r = rows[0];

  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    category: r.category,
    shortDescription: r.short_description,
    fullDescription: r.full_description,
    durationMinutes: r.duration_minutes,
    format: r.format,
    delivery: r.delivery,
    price: {
      inr: r.price_inr,
      usd: r.price_usd,
      taxInclusive: Boolean(r.tax_inclusive),
    },
    assignedTherapistIds: safeJsonParse<string[]>(r.assigned_therapist_ids, []),
    maxCapacity: r.max_capacity,
    isFlagshipProgramme: Boolean(r.is_flagship_programme),
    featured: Boolean(r.featured),
    suitableFor: safeJsonParse<string[]>(r.suitable_for, []),
    whatToExpect: safeJsonParse<string[]>(r.what_to_expect, []),
    programmeSyllabus: safeJsonParse<any[]>(r.programme_syllabus, []),
    imageUrl: r.image_url || "",
    isPublished: Boolean(r.is_published),
  };
}

export async function dbGetOfferingById(id: string): Promise<Offering | null> {
  await initMySQLSchema();
  const rows = await query<any>("SELECT * FROM offerings WHERE id = ? LIMIT 1", [id]);
  if (!rows || rows.length === 0) return null;
  const r = rows[0];

  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    category: r.category,
    shortDescription: r.short_description,
    fullDescription: r.full_description,
    durationMinutes: r.duration_minutes,
    format: r.format,
    delivery: r.delivery,
    price: {
      inr: r.price_inr,
      usd: r.price_usd,
      taxInclusive: Boolean(r.tax_inclusive),
    },
    assignedTherapistIds: safeJsonParse<string[]>(r.assigned_therapist_ids, []),
    maxCapacity: r.max_capacity,
    isFlagshipProgramme: Boolean(r.is_flagship_programme),
    featured: Boolean(r.featured),
    suitableFor: safeJsonParse<string[]>(r.suitable_for, []),
    whatToExpect: safeJsonParse<string[]>(r.what_to_expect, []),
    programmeSyllabus: safeJsonParse<any[]>(r.programme_syllabus, []),
    imageUrl: r.image_url || "",
    isPublished: Boolean(r.is_published),
  };
}

export async function dbSaveOffering(o: Offering): Promise<Offering> {
  await initMySQLSchema();
  const sql = `
    INSERT INTO offerings (
      id, slug, title, category, short_description, full_description,
      duration_minutes, format, delivery, price_inr, price_usd, tax_inclusive,
      assigned_therapist_ids, max_capacity, is_flagship_programme, featured,
      suitable_for, what_to_expect, programme_syllabus, image_url, is_published,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    ON DUPLICATE KEY UPDATE
      slug = VALUES(slug),
      title = VALUES(title),
      category = VALUES(category),
      short_description = VALUES(short_description),
      full_description = VALUES(full_description),
      duration_minutes = VALUES(duration_minutes),
      format = VALUES(format),
      delivery = VALUES(delivery),
      price_inr = VALUES(price_inr),
      price_usd = VALUES(price_usd),
      tax_inclusive = VALUES(tax_inclusive),
      assigned_therapist_ids = VALUES(assigned_therapist_ids),
      max_capacity = VALUES(max_capacity),
      is_flagship_programme = VALUES(is_flagship_programme),
      featured = VALUES(featured),
      suitable_for = VALUES(suitable_for),
      what_to_expect = VALUES(what_to_expect),
      programme_syllabus = VALUES(programme_syllabus),
      image_url = VALUES(image_url),
      is_published = VALUES(is_published),
      updated_at = NOW()
  `;

  await execute(sql, [
    o.id,
    o.slug,
    o.title,
    o.category,
    o.shortDescription,
    o.fullDescription,
    o.durationMinutes,
    o.format,
    o.delivery,
    o.price.inr,
    o.price.usd,
    o.price.taxInclusive ? 1 : 0,
    JSON.stringify(o.assignedTherapistIds || []),
    o.maxCapacity,
    o.isFlagshipProgramme ? 1 : 0,
    o.featured ? 1 : 0,
    JSON.stringify(o.suitableFor || []),
    JSON.stringify(o.whatToExpect || []),
    JSON.stringify(o.programmeSyllabus || []),
    o.imageUrl,
    o.isPublished ? 1 : 0,
  ]);

  return o;
}

export async function dbDeleteOffering(id: string): Promise<boolean> {
  await initMySQLSchema();
  const res = await execute("DELETE FROM offerings WHERE id = ?", [id]);
  return res.affectedRows > 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. BOOKINGS & CONCURRENCY HOLDS
// ─────────────────────────────────────────────────────────────────────────────

export async function dbGetAllBookings(): Promise<Booking[]> {
  await initMySQLSchema();
  const rows = await query<any>("SELECT * FROM bookings ORDER BY created_at DESC");
  return rows.map((r) => ({
    id: r.id,
    bookingReference: r.booking_reference,
    offeringId: r.offering_id,
    offeringTitle: r.offering_title,
    therapistId: r.therapist_id,
    therapistName: r.therapist_name,
    date: r.booking_date instanceof Date ? r.booking_date.toISOString().split("T")[0] : String(r.booking_date).split("T")[0],
    timeSlot: r.time_slot,
    clientTimezone: r.client_timezone || "Asia/Kolkata",
    clientName: r.client_name,
    clientEmail: r.client_email,
    clientPhone: r.client_phone,
    seatsBooked: r.seats_booked,
    currency: r.currency,
    totalAmount: parseFloat(r.total_amount),
    status: r.status,
    paymentMethod: r.payment_method,
    paymentStatus: r.payment_status,
    intakeAnswers: safeJsonParse<Record<string, any>>(r.intake_answers, {}),
    offlineConfirmedByStaff: r.offline_confirmed_by_staff,
    offlineConfirmedAt: r.offline_confirmed_at ? new Date(r.offline_confirmed_at).toISOString() : undefined,
    invoiceIssued: Boolean(r.invoice_issued),
    invoiceNumber: r.invoice_number,
    createdAt: new Date(r.created_at).toISOString(),
  }));
}

export async function dbGetBookingByRef(ref: string): Promise<Booking | null> {
  await initMySQLSchema();
  const rows = await query<any>(
    "SELECT * FROM bookings WHERE LOWER(booking_reference) = LOWER(?) LIMIT 1",
    [ref.trim()]
  );
  if (!rows || rows.length === 0) return null;
  const r = rows[0];

  return {
    id: r.id,
    bookingReference: r.booking_reference,
    offeringId: r.offering_id,
    offeringTitle: r.offering_title,
    therapistId: r.therapist_id,
    therapistName: r.therapist_name,
    date: r.booking_date instanceof Date ? r.booking_date.toISOString().split("T")[0] : String(r.booking_date).split("T")[0],
    timeSlot: r.time_slot,
    clientTimezone: r.client_timezone || "Asia/Kolkata",
    clientName: r.client_name,
    clientEmail: r.client_email,
    clientPhone: r.client_phone,
    seatsBooked: r.seats_booked,
    currency: r.currency,
    totalAmount: parseFloat(r.total_amount),
    status: r.status,
    paymentMethod: r.payment_method,
    paymentStatus: r.payment_status,
    intakeAnswers: safeJsonParse<Record<string, any>>(r.intake_answers, {}),
    offlineConfirmedByStaff: r.offline_confirmed_by_staff,
    offlineConfirmedAt: r.offline_confirmed_at ? new Date(r.offline_confirmed_at).toISOString() : undefined,
    invoiceIssued: Boolean(r.invoice_issued),
    invoiceNumber: r.invoice_number,
    createdAt: new Date(r.created_at).toISOString(),
  };
}

export const dbGetBookingByReference = dbGetBookingByRef;

/**
 * Atomic reservation with anti-double-booking protection.
 * Uses an InnoDB transaction to check active bookings and holds before inserting.
 */
export async function dbSaveBooking(b: Booking): Promise<Booking> {
  await initMySQLSchema();
  return await withTransaction(async (conn) => {
    // 1. Concurrency Check: ensure slot is not already reserved by a confirmed booking
    const [existing] = await conn.execute<any[]>(
      `SELECT id FROM bookings
       WHERE therapist_id = ? AND DATE(booking_date) = DATE(?) AND time_slot = ?
         AND status NOT IN ('cancelled', 'draft') AND id != ?
       FOR UPDATE`,
      [b.therapistId, b.date, b.timeSlot, b.id]
    );

    if (existing && (existing as any[]).length > 0) {
      throw new Error(`DOUBLE_BOOKING_PREVENTED: The time slot ${b.timeSlot} on ${b.date} has already been reserved.`);
    }

    const sql = `
      INSERT INTO bookings (
        id, booking_reference, offering_id, offering_title, therapist_id, therapist_name,
        booking_date, time_slot, client_timezone, client_name, client_email, client_phone,
        seats_booked, currency, total_amount, status, payment_method, payment_status,
        intake_answers, offline_confirmed_by_staff, offline_confirmed_at, invoice_issued,
        invoice_number, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      ON DUPLICATE KEY UPDATE
        offering_id = VALUES(offering_id),
        offering_title = VALUES(offering_title),
        therapist_id = VALUES(therapist_id),
        therapist_name = VALUES(therapist_name),
        booking_date = VALUES(booking_date),
        time_slot = VALUES(time_slot),
        client_name = VALUES(client_name),
        client_email = VALUES(client_email),
        client_phone = VALUES(client_phone),
        status = VALUES(status),
        payment_method = VALUES(payment_method),
        payment_status = VALUES(payment_status),
        intake_answers = VALUES(intake_answers),
        offline_confirmed_by_staff = VALUES(offline_confirmed_by_staff),
        offline_confirmed_at = VALUES(offline_confirmed_at),
        invoice_issued = VALUES(invoice_issued),
        invoice_number = VALUES(invoice_number),
        updated_at = NOW()
    `;

    await conn.execute(sql, [
      b.id,
      b.bookingReference,
      b.offeringId,
      b.offeringTitle,
      b.therapistId,
      b.therapistName,
      b.date,
      b.timeSlot,
      b.clientTimezone || "Asia/Kolkata",
      b.clientName,
      b.clientEmail,
      b.clientPhone,
      b.seatsBooked || 1,
      b.currency || "INR",
      b.totalAmount || 0,
      b.status,
      b.paymentMethod,
      b.paymentStatus,
      JSON.stringify(b.intakeAnswers || {}),
      b.offlineConfirmedByStaff || null,
      b.offlineConfirmedAt ? new Date(b.offlineConfirmedAt) : null,
      b.invoiceIssued ? 1 : 0,
      b.invoiceNumber || null,
    ]);

    // Release any temporary hold for this slot
    await conn.execute(
      "DELETE FROM booking_holds WHERE therapist_id = ? AND hold_date = ? AND time_slot = ?",
      [b.therapistId, b.date, b.timeSlot]
    );

    return b;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. BLOG POSTS
// ─────────────────────────────────────────────────────────────────────────────

export async function dbGetAllBlogPosts(includeDrafts = true): Promise<BlogPost[]> {
  await initMySQLSchema();
  let sql = "SELECT * FROM blog_posts";
  if (!includeDrafts) {
    sql += " WHERE is_published = 1";
  }
  sql += " ORDER BY created_at DESC";

  const rows = await query<any>(sql);
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt || "",
    content: r.content,
    category: r.category,
    readTime: r.read_time,
    publishedDate: r.published_date,
    authorName: r.author_name,
    coverImage: r.cover_image || "",
    isPublished: Boolean(r.is_published),
  }));
}

export async function dbGetBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  await initMySQLSchema();
  const rows = await query<any>("SELECT * FROM blog_posts WHERE slug = ? LIMIT 1", [slug]);
  if (!rows || rows.length === 0) return null;
  const r = rows[0];

  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt || "",
    content: r.content,
    category: r.category,
    readTime: r.read_time,
    publishedDate: r.published_date,
    authorName: r.author_name,
    coverImage: r.cover_image || "",
    isPublished: Boolean(r.is_published),
  };
}

export async function dbSaveBlogPost(b: BlogPost): Promise<BlogPost> {
  await initMySQLSchema();
  const sql = `
    INSERT INTO blog_posts (
      id, slug, title, excerpt, content, category, read_time,
      published_date, author_name, cover_image, is_published, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    ON DUPLICATE KEY UPDATE
      slug = VALUES(slug),
      title = VALUES(title),
      excerpt = VALUES(excerpt),
      content = VALUES(content),
      category = VALUES(category),
      read_time = VALUES(read_time),
      published_date = VALUES(published_date),
      author_name = VALUES(author_name),
      cover_image = VALUES(cover_image),
      is_published = VALUES(is_published),
      updated_at = NOW()
  `;

  await execute(sql, [
    b.id,
    b.slug,
    b.title,
    b.excerpt,
    b.content,
    b.category,
    b.readTime,
    b.publishedDate,
    b.authorName,
    b.coverImage,
    b.isPublished ? 1 : 0,
  ]);

  return b;
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. AUDIT LOGS
// ─────────────────────────────────────────────────────────────────────────────

export async function dbGetAuditLogs(limit = 100): Promise<AuditLogEntry[]> {
  await initMySQLSchema();
  const rows = await query<any>(
    "SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT ?",
    [limit]
  );
  return rows.map((r) => ({
    id: r.id,
    staffId: r.staff_id,
    staffEmail: r.staff_email,
    staffName: r.staff_name,
    action: r.action,
    entityType: r.entity_type,
    entityId: r.entity_id,
    details: safeJsonParse<any>(r.details, {}),
    timestamp: new Date(r.created_at).toISOString(),
  }));
}

export async function dbLogAuditEvent(entry: AuditLogEntry): Promise<void> {
  await initMySQLSchema();
  const sql = `
    INSERT INTO audit_logs (
      id, staff_id, staff_email, staff_name, action,
      entity_type, entity_id, details, ip_address, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `;

  await execute(sql, [
    entry.id,
    entry.staffId || null,
    entry.staffEmail || "",
    entry.staffName || "",
    entry.action,
    entry.entityType,
    entry.entityId,
    JSON.stringify(entry.details || {}),
    (entry as any).ipAddress || entry.details?.ipAddress || null,
  ]);
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. CRM: CLIENTS, INQUIRIES, TASKS, NOTES, ACTIVITIES
// ─────────────────────────────────────────────────────────────────────────────

export async function dbGetAllClients(): Promise<ClientContact[]> {
  await initMySQLSchema();
  const rows = await query<any>("SELECT * FROM client_contacts ORDER BY created_at DESC");
  return rows.map((r) => ({
    id: r.id,
    clientReference: r.client_reference,
    fullName: r.full_name,
    email: r.email,
    phone: r.phone || "",
    countryCode: r.country_code || "+91",
    locality: r.locality || "",
    preferredChannel: r.preferred_channel || "email",
    source: r.source || "website_booking",
    status: r.status || "active",
    tags: safeJsonParse<string[]>(r.tags, []),
    assignedStaffId: r.assigned_staff_id,
    assignedStaffName: r.assigned_staff_name || "",
    notesCount: r.notes_count || 0,
    totalBookings: r.total_bookings || 0,
    totalSpentINR: parseFloat(r.total_spent_inr || "0"),
    totalSpentUSD: parseFloat(r.total_spent_usd || "0"),
    firstBookingDate: r.first_booking_date,
    lastBookingDate: r.last_booking_date,
    consentGiven: Boolean(r.consent_given),
    consentDate: r.consent_date ? new Date(r.consent_date).toISOString() : undefined,
    createdAt: new Date(r.created_at).toISOString(),
    updatedAt: new Date(r.updated_at).toISOString(),
  }));
}

export async function dbGetClientById(id: string): Promise<ClientContact | null> {
  await initMySQLSchema();
  const rows = await query<any>("SELECT * FROM client_contacts WHERE id = ? LIMIT 1", [id]);
  if (!rows || rows.length === 0) return null;
  const r = rows[0];

  return {
    id: r.id,
    clientReference: r.client_reference,
    fullName: r.full_name,
    email: r.email,
    phone: r.phone || "",
    countryCode: r.country_code || "+91",
    locality: r.locality || "",
    preferredChannel: r.preferred_channel || "email",
    source: r.source || "website_booking",
    status: r.status || "active",
    tags: safeJsonParse<string[]>(r.tags, []),
    assignedStaffId: r.assigned_staff_id,
    assignedStaffName: r.assigned_staff_name || "",
    notesCount: r.notes_count || 0,
    totalBookings: r.total_bookings || 0,
    totalSpentINR: parseFloat(r.total_spent_inr || "0"),
    totalSpentUSD: parseFloat(r.total_spent_usd || "0"),
    firstBookingDate: r.first_booking_date,
    lastBookingDate: r.last_booking_date,
    consentGiven: Boolean(r.consent_given),
    consentDate: r.consent_date ? new Date(r.consent_date).toISOString() : undefined,
    createdAt: new Date(r.created_at).toISOString(),
    updatedAt: new Date(r.updated_at).toISOString(),
  };
}

export async function dbSaveClient(c: ClientContact): Promise<ClientContact> {
  await initMySQLSchema();
  const sql = `
    INSERT INTO client_contacts (
      id, client_reference, full_name, email, phone, country_code, locality,
      preferred_channel, source, status, tags, assigned_staff_id, assigned_staff_name,
      notes_count, total_bookings, total_spent_inr, total_spent_usd,
      first_booking_date, last_booking_date, consent_given, consent_date,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    ON DUPLICATE KEY UPDATE
      full_name = VALUES(full_name),
      email = VALUES(email),
      phone = VALUES(phone),
      locality = VALUES(locality),
      preferred_channel = VALUES(preferred_channel),
      source = VALUES(source),
      status = VALUES(status),
      tags = VALUES(tags),
      assigned_staff_id = VALUES(assigned_staff_id),
      assigned_staff_name = VALUES(assigned_staff_name),
      notes_count = VALUES(notes_count),
      total_bookings = VALUES(total_bookings),
      total_spent_inr = VALUES(total_spent_inr),
      total_spent_usd = VALUES(total_spent_usd),
      first_booking_date = VALUES(first_booking_date),
      last_booking_date = VALUES(last_booking_date),
      updated_at = NOW()
  `;

  await execute(sql, [
    c.id,
    c.clientReference,
    c.fullName,
    c.email.toLowerCase().trim(),
    c.phone || "",
    c.countryCode || "+91",
    c.locality || "",
    c.preferredChannel || "email",
    c.source || "website_booking",
    c.status || "active",
    JSON.stringify(c.tags || []),
    c.assignedStaffId || null,
    c.assignedStaffName || "",
    c.notesCount || 0,
    c.totalBookings || 0,
    c.totalSpentINR || 0,
    c.totalSpentUSD || 0,
    c.firstBookingDate || null,
    c.lastBookingDate || null,
    c.consentGiven ? 1 : 0,
    c.consentDate ? new Date(c.consentDate) : null,
  ]);

  return c;
}

export async function dbGetAllInquiries(): Promise<CrmInquiry[]> {
  await initMySQLSchema();
  const rows = await query<any>("SELECT * FROM crm_inquiries ORDER BY created_at DESC");
  return rows.map((r) => ({
    id: r.id,
    reference: r.reference,
    clientContactId: r.client_contact_id,
    name: r.name,
    email: r.email,
    phone: r.phone || "",
    subject: r.subject,
    category: r.category,
    message: r.message,
    source: r.source,
    stage: r.stage,
    priority: r.priority,
    assignedStaffId: r.assigned_staff_id,
    assignedStaffName: r.assigned_staff_name || "",
    linkedBookingId: r.linked_booking_id,
    internalNotes: r.internal_notes || "",
    createdAt: new Date(r.created_at).toISOString(),
    updatedAt: new Date(r.updated_at).toISOString(),
  }));
}



export async function dbSaveInquiry(inq: CrmInquiry): Promise<CrmInquiry> {
  await initMySQLSchema();
  const sql = `
    INSERT INTO crm_inquiries (
      id, reference, client_contact_id, name, email, phone, subject,
      category, message, source, stage, priority, assigned_staff_id,
      assigned_staff_name, linked_booking_id, internal_notes, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    ON DUPLICATE KEY UPDATE
      stage = VALUES(stage),
      priority = VALUES(priority),
      assigned_staff_id = VALUES(assigned_staff_id),
      assigned_staff_name = VALUES(assigned_staff_name),
      linked_booking_id = VALUES(linked_booking_id),
      internal_notes = VALUES(internal_notes),
      updated_at = NOW()
  `;

  await execute(sql, [
    inq.id,
    inq.reference || `INQ-${Date.now()}`,
    inq.clientContactId || null,
    inq.name,
    inq.email,
    inq.phone || "",
    inq.subject || "General Inquiry",
    inq.category || "General Inquiry",
    inq.message || "",
    inq.source || "contact_form",
    inq.stage || "new",
    inq.priority || "medium",
    inq.assignedStaffId || null,
    inq.assignedStaffName || "",
    inq.linkedBookingId || null,
    inq.internalNotes || "",
  ]);

  return inq;
}

export async function dbGetAllTasks(): Promise<CrmTask[]> {
  await initMySQLSchema();
  const rows = await query<any>("SELECT * FROM crm_tasks ORDER BY due_date ASC");
  return rows.map((r) => ({
    id: r.id,
    clientContactId: r.client_contact_id,
    clientName: r.client_name || "",
    inquiryId: r.inquiry_id,
    bookingId: r.booking_id,
    title: r.title,
    description: r.description || "",
    priority: r.priority,
    dueDate: r.due_date instanceof Date ? r.due_date.toISOString().split("T")[0] : String(r.due_date).split("T")[0],
    status: r.status,
    assignedStaffId: r.assigned_staff_id,
    assignedStaffName: r.assigned_staff_name || "",
    createdById: r.created_by_id,
    createdByName: r.created_by_name || "",
    createdAt: new Date(r.created_at).toISOString(),
    completedAt: r.completed_at ? new Date(r.completed_at).toISOString() : undefined,
  }));
}

export async function dbSaveTask(task: CrmTask): Promise<CrmTask> {
  await initMySQLSchema();
  const sql = `
    INSERT INTO crm_tasks (
      id, client_contact_id, client_name, inquiry_id, booking_id, title,
      description, priority, due_date, status, assigned_staff_id, assigned_staff_name,
      created_by_id, created_by_name, created_at, completed_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)
    ON DUPLICATE KEY UPDATE
      title = VALUES(title),
      description = VALUES(description),
      priority = VALUES(priority),
      due_date = VALUES(due_date),
      status = VALUES(status),
      assigned_staff_id = VALUES(assigned_staff_id),
      assigned_staff_name = VALUES(assigned_staff_name),
      completed_at = VALUES(completed_at)
  `;

  await execute(sql, [
    task.id,
    task.clientContactId || null,
    task.clientName || "",
    task.inquiryId || null,
    task.bookingId || null,
    task.title,
    task.description || "",
    task.priority || "medium",
    task.dueDate,
    task.status || "pending",
    task.assignedStaffId || null,
    task.assignedStaffName || "",
    task.createdById || null,
    task.createdByName || "",
    task.completedAt ? new Date(task.completedAt) : null,
  ]);

  return task;
}

export async function dbGetClientNotes(clientId: string): Promise<CrmNote[]> {
  await initMySQLSchema();
  const rows = await query<any>(
    "SELECT * FROM crm_notes WHERE client_contact_id = ? ORDER BY is_pinned DESC, created_at DESC",
    [clientId]
  );
  return rows.map((r) => ({
    id: r.id,
    clientContactId: r.client_contact_id,
    authorStaffId: r.author_staff_id,
    authorStaffName: r.author_staff_name,
    authorStaffRole: r.author_staff_role,
    content: r.content,
    category: r.category,
    isPinned: Boolean(r.is_pinned),
    createdAt: new Date(r.created_at).toISOString(),
    updatedAt: new Date(r.updated_at).toISOString(),
  }));
}



export async function dbAddClientNote(note: CrmNote): Promise<CrmNote> {
  await initMySQLSchema();
  const sql = `
    INSERT INTO crm_notes (
      id, client_contact_id, author_staff_id, author_staff_name, author_staff_role,
      content, category, is_pinned, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
  `;

  await execute(sql, [
    note.id,
    note.clientContactId,
    note.authorStaffId || null,
    note.authorStaffName,
    note.authorStaffRole,
    note.content,
    note.category || "general",
    note.isPinned ? 1 : 0,
  ]);

  // Increment notes_count on client
  await execute(
    "UPDATE client_contacts SET notes_count = notes_count + 1 WHERE id = ?",
    [note.clientContactId]
  );

  return note;
}

export async function dbGetClientActivities(clientId: string): Promise<CrmActivity[]> {
  await initMySQLSchema();
  const rows = await query<any>(
    "SELECT * FROM crm_activities WHERE client_contact_id = ? ORDER BY created_at DESC",
    [clientId]
  );
  return rows.map((r) => ({
    id: r.id,
    clientContactId: r.client_contact_id,
    eventType: r.event_type,
    title: r.title,
    description: r.description,
    staffId: r.staff_id,
    staffName: r.staff_name || "",
    metadata: safeJsonParse<any>(r.metadata, {}),
    createdAt: new Date(r.created_at).toISOString(),
  }));
}

export async function dbLogCrmActivity(act: CrmActivity): Promise<void> {
  await initMySQLSchema();
  const sql = `
    INSERT INTO crm_activities (
      id, client_contact_id, event_type, title, description,
      staff_id, staff_name, metadata, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `;

  await execute(sql, [
    act.id,
    act.clientContactId,
    act.eventType,
    act.title,
    act.description,
    act.staffId || null,
    act.staffName || "",
    JSON.stringify(act.metadata || {}),
  ]);
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. PROGRAMMES & RETREATS
// ─────────────────────────────────────────────────────────────────────────────

export async function dbGetAllProgrammes(includeDrafts = true): Promise<Programme[]> {
  await initMySQLSchema();
  let sql = "SELECT * FROM programmes";
  if (!includeDrafts) {
    sql += " WHERE is_published = 1";
  }
  sql += " ORDER BY created_at DESC";

  const rows = await query<any>(sql);
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    shortDescription: r.short_description,
    fullDescription: r.full_description,
    durationLabel: r.duration_label,
    durationDays: r.duration_days,
    dailySessionMinutes: r.daily_session_minutes,
    format: r.format,
    delivery: r.delivery,
    priceINR: parseFloat(r.price_inr),
    priceUSD: parseFloat(r.price_usd),
    leadFacilitatorIds: safeJsonParse<string[]>(r.lead_facilitator_ids, []),
    location: r.location,
    maxCapacity: r.max_capacity,
    imageUrl: r.image_url || "",
    itinerary: safeJsonParse<any[]>(r.itinerary, []),
    inclusions: safeJsonParse<string[]>(r.inclusions, []),
    preparationGuidelines: safeJsonParse<string[]>(r.preparation_guidelines, []),
    cohorts: safeJsonParse<any[]>(r.cohorts, []),
    isPublished: Boolean(r.is_published),
    createdAt: new Date(r.created_at).toISOString(),
    updatedAt: new Date(r.updated_at).toISOString(),
  }));
}



export async function dbSaveProgramme(p: Programme): Promise<Programme> {
  await initMySQLSchema();
  const sql = `
    INSERT INTO programmes (
      id, slug, title, short_description, full_description, duration_label,
      duration_days, daily_session_minutes, format, delivery, price_inr, price_usd,
      lead_facilitator_ids, location, max_capacity, image_url, itinerary, inclusions,
      preparation_guidelines, cohorts, is_published, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    ON DUPLICATE KEY UPDATE
      slug = VALUES(slug),
      title = VALUES(title),
      short_description = VALUES(short_description),
      full_description = VALUES(full_description),
      price_inr = VALUES(price_inr),
      price_usd = VALUES(price_usd),
      image_url = VALUES(image_url),
      itinerary = VALUES(itinerary),
      inclusions = VALUES(inclusions),
      preparation_guidelines = VALUES(preparation_guidelines),
      cohorts = VALUES(cohorts),
      is_published = VALUES(is_published),
      updated_at = NOW()
  `;

  await execute(sql, [
    p.id,
    p.slug,
    p.title,
    p.shortDescription,
    p.fullDescription,
    p.durationLabel || "7 Days / 6 Nights",
    p.durationDays || 7,
    p.dailySessionMinutes || 180,
    p.format || "group",
    p.delivery || "onsite",
    p.priceINR || 28000,
    p.priceUSD || 420,
    JSON.stringify(p.leadFacilitatorIds || []),
    p.location || "Auroville International Township, Tamil Nadu, India",
    p.maxCapacity || 12,
    p.imageUrl || "",
    JSON.stringify(p.itinerary || []),
    JSON.stringify(p.inclusions || []),
    JSON.stringify(p.preparationGuidelines || []),
    JSON.stringify(p.cohorts || []),
    p.isPublished ? 1 : 0,
  ]);

  return p;
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. MEDIA ASSETS
// ─────────────────────────────────────────────────────────────────────────────

export async function dbGetAllMediaAssets(): Promise<MediaAsset[]> {
  await initMySQLSchema();
  const rows = await query<any>("SELECT * FROM media_assets ORDER BY created_at DESC");
  return rows.map((r) => ({
    id: r.id,
    fileName: r.file_name,
    originalName: r.original_name,
    publicUrl: r.public_url,
    fileSizeBytes: r.file_size_bytes,
    mimeType: r.mime_type,
    dimensions: safeJsonParse<any>(r.dimensions, undefined),
    altText: r.alt_text || "",
    uploadedByStaffId: r.uploaded_by_staff_id,
    uploadedByStaffName: r.uploaded_by_staff_name || "",
    createdAt: new Date(r.created_at).toISOString(),
  }));
}

export async function dbSaveMediaAsset(asset: MediaAsset): Promise<MediaAsset> {
  await initMySQLSchema();
  const sql = `
    INSERT INTO media_assets (
      id, file_name, original_name, public_url, file_size_bytes,
      mime_type, dimensions, alt_text, uploaded_by_staff_id, uploaded_by_staff_name, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    ON DUPLICATE KEY UPDATE
      alt_text = VALUES(alt_text)
  `;

  await execute(sql, [
    asset.id,
    asset.fileName,
    asset.originalName,
    asset.publicUrl,
    asset.fileSizeBytes || 0,
    asset.mimeType || "image/webp",
    asset.dimensions ? JSON.stringify(asset.dimensions) : null,
    asset.altText || "",
    asset.uploadedByStaffId || null,
    asset.uploadedByStaffName || "",
  ]);

  return asset;
}

export async function dbDeleteMediaAsset(id: string): Promise<boolean> {
  await initMySQLSchema();
  const res = await execute("DELETE FROM media_assets WHERE id = ?", [id]);
  return res.affectedRows > 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. CMS REVISIONS
// ─────────────────────────────────────────────────────────────────────────────

export async function dbGetCmsRevisions(sectionKey?: string): Promise<CmsRevision[]> {
  await initMySQLSchema();
  let sql = "SELECT * FROM cms_revisions";
  const params: any[] = [];
  if (sectionKey) {
    sql += " WHERE section_key = ?";
    params.push(sectionKey);
  }
  sql += " ORDER BY created_at DESC LIMIT 50";

  const rows = await query<any>(sql, params);
  return rows.map((r) => ({
    id: r.id,
    sectionKey: r.section_key,
    title: r.title,
    snapshotJson: safeJsonParse<any>(r.snapshot_json, {}),
    authorStaffId: r.author_staff_id,
    authorStaffName: r.author_staff_name || "",
    createdAt: new Date(r.created_at).toISOString(),
  }));
}

export async function dbCreateCmsRevision(rev: CmsRevision): Promise<CmsRevision> {
  await initMySQLSchema();
  const sql = `
    INSERT INTO cms_revisions (
      id, section_key, title, snapshot_json, author_staff_id, author_staff_name, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, NOW())
  `;

  await execute(sql, [
    rev.id,
    rev.sectionKey,
    rev.title,
    JSON.stringify(rev.snapshotJson || {}),
    rev.authorStaffId || null,
    rev.authorStaffName || "",
  ]);

  return rev;
}

// ─────────────────────────────────────────────────────────────────────────────
// 12. EMR: PATIENT RECORDS & CLINICAL ENCOUNTERS
// ─────────────────────────────────────────────────────────────────────────────

export async function dbGetAllPatients(): Promise<PatientRecord[]> {
  await initMySQLSchema();
  const rows = await query<any>("SELECT * FROM patient_records ORDER BY created_at DESC");
  return rows.map((r) => ({
    id: r.id,
    mrn: r.mrn,
    crmContactId: r.crm_contact_id,
    fullName: r.full_name,
    dateOfBirth: r.date_of_birth instanceof Date ? r.date_of_birth.toISOString().split("T")[0] : String(r.date_of_birth || "").split("T")[0],
    age: r.age,
    gender: r.gender,
    phone: r.phone,
    email: r.email,
    address: r.address || "",
    occupation: r.occupation || "",
    emergencyContactName: r.emergency_contact_name || "",
    emergencyContactPhone: r.emergency_contact_phone || "",
    bloodGroup: r.blood_group || "",
    allergies: safeJsonParse<string[]>(r.allergies, []),
    clinicalAlerts: safeJsonParse<string[]>(r.clinical_alerts, []),
    primaryTherapistId: r.primary_therapist_id,
    primaryTherapistName: r.primary_therapist_name,
    status: r.status,
    createdAt: new Date(r.created_at).toISOString(),
    updatedAt: new Date(r.updated_at).toISOString(),
  }));
}



export async function dbGetPatientById(id: string): Promise<PatientRecord | null> {
  await initMySQLSchema();
  const rows = await query<any>("SELECT * FROM patient_records WHERE id = ? LIMIT 1", [id]);
  if (!rows || rows.length === 0) return null;
  const r = rows[0];

  return {
    id: r.id,
    mrn: r.mrn,
    crmContactId: r.crm_contact_id,
    fullName: r.full_name,
    dateOfBirth: r.date_of_birth instanceof Date ? r.date_of_birth.toISOString().split("T")[0] : String(r.date_of_birth || "").split("T")[0],
    age: r.age,
    gender: r.gender,
    phone: r.phone,
    email: r.email,
    address: r.address || "",
    occupation: r.occupation || "",
    emergencyContactName: r.emergency_contact_name || "",
    emergencyContactPhone: r.emergency_contact_phone || "",
    bloodGroup: r.blood_group || "",
    allergies: safeJsonParse<string[]>(r.allergies, []),
    clinicalAlerts: safeJsonParse<string[]>(r.clinical_alerts, []),
    primaryTherapistId: r.primary_therapist_id,
    primaryTherapistName: r.primary_therapist_name,
    status: r.status,
    createdAt: new Date(r.created_at).toISOString(),
    updatedAt: new Date(r.updated_at).toISOString(),
  };
}

export async function dbSavePatient(p: PatientRecord): Promise<PatientRecord> {
  await initMySQLSchema();
  const sql = `
    INSERT INTO patient_records (
      id, mrn, crm_contact_id, full_name, date_of_birth, age, gender,
      phone, email, address, occupation, emergency_contact_name, emergency_contact_phone,
      blood_group, allergies, clinical_alerts, primary_therapist_id, primary_therapist_name,
      status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    ON DUPLICATE KEY UPDATE
      full_name = VALUES(full_name),
      date_of_birth = VALUES(date_of_birth),
      age = VALUES(age),
      gender = VALUES(gender),
      phone = VALUES(phone),
      email = VALUES(email),
      address = VALUES(address),
      occupation = VALUES(occupation),
      emergency_contact_name = VALUES(emergency_contact_name),
      emergency_contact_phone = VALUES(emergency_contact_phone),
      blood_group = VALUES(blood_group),
      allergies = VALUES(allergies),
      clinical_alerts = VALUES(clinical_alerts),
      primary_therapist_id = VALUES(primary_therapist_id),
      primary_therapist_name = VALUES(primary_therapist_name),
      status = VALUES(status),
      updated_at = NOW()
  `;

  await execute(sql, [
    p.id,
    p.mrn,
    p.crmContactId || null,
    p.fullName,
    p.dateOfBirth || null,
    p.age || null,
    p.gender || null,
    p.phone,
    p.email,
    p.address || "",
    p.occupation || "",
    p.emergencyContactName || "",
    p.emergencyContactPhone || "",
    p.bloodGroup || "",
    JSON.stringify(p.allergies || []),
    JSON.stringify(p.clinicalAlerts || []),
    p.primaryTherapistId || null,
    p.primaryTherapistName || null,
    p.status || "active",
  ]);

  return p;
}

// ─────────────────────────────────────────────────────────────────────────────
// 13. SCHEDULED TASKS & CRON OPERATIONS
// ─────────────────────────────────────────────────────────────────────────────

export async function dbReleaseExpiredBookingHolds(): Promise<number> {
  if (!isMySQLConfigured()) return 0;
  await initMySQLSchema();
  const res = await execute("DELETE FROM booking_holds WHERE expires_at < NOW()");
  return res.affectedRows;
}

export async function dbProcessPendingNotificationJobs(): Promise<{
  processed: number;
  sent: number;
  failed: number;
}> {
  if (!isMySQLConfigured()) return { processed: 0, sent: 0, failed: 0 };
  await initMySQLSchema();
  const jobs = await query<any>(
    "SELECT * FROM notification_jobs WHERE status = 'queued' AND scheduled_at <= NOW() LIMIT 50"
  );

  let sent = 0;
  let failed = 0;

  for (const job of jobs) {
    try {
      // In production, integration with Resend / WhatsApp API occurs here
      await execute(
        "UPDATE notification_jobs SET status = 'sent', sent_at = NOW(), attempts = attempts + 1 WHERE id = ?",
        [job.id]
      );
      sent++;
    } catch (err: any) {
      await execute(
        "UPDATE notification_jobs SET status = 'failed', error_message = ?, attempts = attempts + 1 WHERE id = ?",
        [err.message, job.id]
      );
      failed++;
    }
  }

  return { processed: jobs.length, sent, failed };
}

// ─────────────────────────────────────────────────────────────────────────────
// 14. EMR EXTENSIONS: MEDICAL HISTORIES, ENCOUNTERS, ASSESSMENTS, NOTES, PLANS, AUDIT
// ─────────────────────────────────────────────────────────────────────────────

export async function dbGetMedicalHistory(patientId: string): Promise<PatientMedicalHistory | null> {
  await initMySQLSchema();
  const rows = await query<any>(
    "SELECT * FROM patient_medical_histories WHERE patient_id = ? LIMIT 1",
    [patientId]
  );
  if (!rows || rows.length === 0) return null;
  const r = rows[0];
  return {
    id: r.id,
    patientId: r.patient_id,
    ocularHistory: safeJsonParse<any>(r.ocular_history, {}),
    systemicHistory: safeJsonParse<any>(r.systemic_history, {}),
    familyOcularHistory: r.family_ocular_history || "",
    currentMedications: r.current_medications || "",
    visualEnvironment: safeJsonParse<any>(r.visual_environment, {}),
    visualAids: safeJsonParse<any>(r.visual_aids, {}),
    updatedAt: new Date(r.updated_at).toISOString(),
  };
}

export async function dbSaveMedicalHistory(h: PatientMedicalHistory): Promise<PatientMedicalHistory> {
  await initMySQLSchema();
  const sql = `
    INSERT INTO patient_medical_histories (
      id, patient_id, ocular_history, systemic_history, family_ocular_history,
      current_medications, visual_environment, visual_aids, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    ON DUPLICATE KEY UPDATE
      ocular_history = VALUES(ocular_history),
      systemic_history = VALUES(systemic_history),
      family_ocular_history = VALUES(family_ocular_history),
      current_medications = VALUES(current_medications),
      visual_environment = VALUES(visual_environment),
      visual_aids = VALUES(visual_aids),
      updated_at = NOW()
  `;

  await execute(sql, [
    h.id,
    h.patientId,
    JSON.stringify(h.ocularHistory || {}),
    JSON.stringify(h.systemicHistory || {}),
    h.familyOcularHistory || "",
    h.currentMedications || "",
    JSON.stringify(h.visualEnvironment || {}),
    JSON.stringify(h.visualAids || {}),
  ]);

  return h;
}

export async function dbGetEncountersByPatientId(patientId: string): Promise<ClinicalEncounter[]> {
  await initMySQLSchema();
  const rows = await query<any>(
    "SELECT * FROM clinical_encounters WHERE patient_id = ? ORDER BY encounter_date DESC",
    [patientId]
  );
  return rows.map((r) => ({
    id: r.id,
    patientId: r.patient_id,
    patientName: r.patient_name,
    encounterDate: r.encounter_date instanceof Date ? r.encounter_date.toISOString().split("T")[0] : String(r.encounter_date).split("T")[0],
    encounterType: r.encounter_type,
    therapistId: r.therapist_id,
    therapistName: r.therapist_name,
    chiefComplaint: r.chief_complaint,
    status: r.status,
    linkedBookingId: r.linked_booking_id,
    durationMinutes: r.duration_minutes,
    clinicalSummary: r.clinical_summary,
    createdAt: new Date(r.created_at).toISOString(),
    updatedAt: new Date(r.updated_at).toISOString(),
  }));
}

export async function dbSaveEncounter(e: ClinicalEncounter): Promise<ClinicalEncounter> {
  await initMySQLSchema();
  const sql = `
    INSERT INTO clinical_encounters (
      id, patient_id, patient_name, encounter_date, encounter_type, therapist_id,
      therapist_name, chief_complaint, status, linked_booking_id, duration_minutes,
      clinical_summary, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    ON DUPLICATE KEY UPDATE
      patient_name = VALUES(patient_name),
      encounter_date = VALUES(encounter_date),
      encounter_type = VALUES(encounter_type),
      therapist_id = VALUES(therapist_id),
      therapist_name = VALUES(therapist_name),
      chief_complaint = VALUES(chief_complaint),
      status = VALUES(status),
      linked_booking_id = VALUES(linked_booking_id),
      duration_minutes = VALUES(duration_minutes),
      clinical_summary = VALUES(clinical_summary),
      updated_at = NOW()
  `;

  await execute(sql, [
    e.id,
    e.patientId,
    e.patientName,
    e.encounterDate,
    e.encounterType,
    e.therapistId,
    e.therapistName,
    e.chiefComplaint,
    e.status,
    e.linkedBookingId || null,
    e.durationMinutes || 60,
    e.clinicalSummary || null,
  ]);

  return e;
}

export async function dbGetAssessmentsByPatientId(patientId: string): Promise<VisionAssessment[]> {
  await initMySQLSchema();
  const rows = await query<any>(
    "SELECT * FROM vision_assessments WHERE patient_id = ? ORDER BY assessment_date DESC",
    [patientId]
  );
  return rows.map((r) => ({
    id: r.id,
    patientId: r.patient_id,
    encounterId: r.encounter_id,
    assessmentDate: r.assessment_date instanceof Date ? r.assessment_date.toISOString().split("T")[0] : String(r.assessment_date).split("T")[0],
    therapistId: r.therapist_id,
    therapistName: r.therapist_name,
    visualAcuity: safeJsonParse<any>(r.visual_acuity, {}),
    refraction: safeJsonParse<any>(r.refraction, {}),
    binocularVision: safeJsonParse<any>(r.binocular_vision, {}),
    intraocularPressureIOP: safeJsonParse<any>(r.intraocular_pressure_iop, {}),
    clinicalImpression: r.clinical_impression,
    recommendations: r.recommendations,
    createdAt: new Date(r.created_at).toISOString(),
  }));
}

export async function dbSaveAssessment(a: VisionAssessment): Promise<VisionAssessment> {
  await initMySQLSchema();
  const sql = `
    INSERT INTO vision_assessments (
      id, patient_id, encounter_id, assessment_date, therapist_id, therapist_name,
      visual_acuity, refraction, binocular_vision, intraocular_pressure_iop,
      clinical_impression, recommendations, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    ON DUPLICATE KEY UPDATE
      encounter_id = VALUES(encounter_id),
      assessment_date = VALUES(assessment_date),
      therapist_id = VALUES(therapist_id),
      therapist_name = VALUES(therapist_name),
      visual_acuity = VALUES(visual_acuity),
      refraction = VALUES(refraction),
      binocular_vision = VALUES(binocular_vision),
      intraocular_pressure_iop = VALUES(intraocular_pressure_iop),
      clinical_impression = VALUES(clinical_impression),
      recommendations = VALUES(recommendations)
  `;

  await execute(sql, [
    a.id,
    a.patientId,
    a.encounterId || null,
    a.assessmentDate,
    a.therapistId,
    a.therapistName,
    JSON.stringify(a.visualAcuity || {}),
    JSON.stringify(a.refraction || {}),
    JSON.stringify(a.binocularVision || {}),
    JSON.stringify(a.intraocularPressureIOP || {}),
    a.clinicalImpression,
    a.recommendations,
  ]);

  return a;
}

export async function dbGetNotesByPatientId(patientId: string): Promise<ClinicalNote[]> {
  await initMySQLSchema();
  const rows = await query<any>(
    "SELECT * FROM clinical_notes WHERE patient_id = ? ORDER BY note_date DESC, created_at DESC",
    [patientId]
  );
  return rows.map((r) => ({
    id: r.id,
    patientId: r.patient_id,
    encounterId: r.encounter_id,
    therapistId: r.therapist_id,
    therapistName: r.therapist_name,
    noteDate: r.note_date instanceof Date ? r.note_date.toISOString().split("T")[0] : String(r.note_date).split("T")[0],
    subjective: r.subjective,
    objective: r.objective,
    assessment: r.assessment,
    plan: r.plan,
    status: r.status,
    isLocked: Boolean(r.is_locked),
    signedBy: r.signed_by,
    signedByName: r.signed_by_name,
    signedAt: r.signed_at ? new Date(r.signed_at).toISOString() : undefined,
    amendments: [],
    createdAt: new Date(r.created_at).toISOString(),
    updatedAt: new Date(r.updated_at).toISOString(),
  }));
}

export async function dbSaveNote(n: ClinicalNote): Promise<ClinicalNote> {
  await initMySQLSchema();

  // Immutability Protection: Verify existing record lock status
  const existingRows = await query<any>(
    "SELECT is_locked, subjective, objective, assessment, plan FROM clinical_notes WHERE id = ? LIMIT 1",
    [n.id]
  );

  if (existingRows && existingRows.length > 0) {
    const existing = existingRows[0];
    if (existing.is_locked) {
      const hasSoapModification =
        existing.subjective !== n.subjective ||
        existing.objective !== n.objective ||
        existing.assessment !== n.assessment ||
        existing.plan !== n.plan;

      if (hasSoapModification) {
        throw new Error(
          "IMMUTABLE_CLINICAL_RECORD: Locked and signed SOAP notes cannot be edited. Please append an amendment instead."
        );
      }
    }
  }

  const sql = `
    INSERT INTO clinical_notes (
      id, patient_id, encounter_id, therapist_id, therapist_name, note_date,
      subjective, objective, assessment, plan, status, is_locked, signed_by,
      signed_by_name, signed_at, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    ON DUPLICATE KEY UPDATE
      encounter_id = VALUES(encounter_id),
      therapist_id = VALUES(therapist_id),
      therapist_name = VALUES(therapist_name),
      note_date = VALUES(note_date),
      subjective = VALUES(subjective),
      objective = VALUES(objective),
      assessment = VALUES(assessment),
      plan = VALUES(plan),
      status = VALUES(status),
      is_locked = VALUES(is_locked),
      signed_by = VALUES(signed_by),
      signed_by_name = VALUES(signed_by_name),
      signed_at = VALUES(signed_at),
      updated_at = NOW()
  `;

  await execute(sql, [
    n.id,
    n.patientId,
    n.encounterId || null,
    n.therapistId,
    n.therapistName,
    n.noteDate,
    n.subjective,
    n.objective,
    n.assessment,
    n.plan,
    n.status,
    n.isLocked ? 1 : 0,
    n.signedBy || null,
    n.signedByName || null,
    n.signedAt ? new Date(n.signedAt) : null,
  ]);

  return n;
}

export async function dbGetTreatmentPlansByPatientId(patientId: string): Promise<TreatmentPlan[]> {
  await initMySQLSchema();
  const rows = await query<any>(
    "SELECT * FROM treatment_plans WHERE patient_id = ? ORDER BY created_at DESC",
    [patientId]
  );
  return rows.map((r) => ({
    id: r.id,
    patientId: r.patient_id,
    therapistId: r.therapist_id,
    therapistName: r.therapist_name,
    title: r.title,
    primaryDiagnosis: r.diagnosis_summary || "",
    goals: safeJsonParse<string[]>(r.primary_goals, []),
    prescribedTherapies: safeJsonParse<any[]>(r.prescribed_therapies, []),
    startDate: r.start_date instanceof Date ? r.start_date.toISOString().split("T")[0] : String(r.start_date).split("T")[0],
    targetEndDate: r.target_completion_date
      ? (r.target_completion_date instanceof Date ? r.target_completion_date.toISOString().split("T")[0] : String(r.target_completion_date).split("T")[0])
      : (r.start_date instanceof Date ? r.start_date.toISOString().split("T")[0] : String(r.start_date).split("T")[0]),
    status: (r.status as any) || "active",
    progressNotes: "",
    createdAt: new Date(r.created_at).toISOString(),
    updatedAt: new Date(r.updated_at).toISOString(),
  }));
}

export async function dbSaveTreatmentPlan(p: TreatmentPlan): Promise<TreatmentPlan> {
  await initMySQLSchema();
  const sql = `
    INSERT INTO treatment_plans (
      id, patient_id, patient_name, therapist_id, therapist_name, title,
      diagnosis_summary, primary_goals, prescribed_therapies, home_exercises,
      duration_weeks, sessions_per_week, status, start_date, target_completion_date,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    ON DUPLICATE KEY UPDATE
      therapist_id = VALUES(therapist_id),
      therapist_name = VALUES(therapist_name),
      title = VALUES(title),
      diagnosis_summary = VALUES(diagnosis_summary),
      primary_goals = VALUES(primary_goals),
      prescribed_therapies = VALUES(prescribed_therapies),
      status = VALUES(status),
      start_date = VALUES(start_date),
      target_completion_date = VALUES(target_completion_date),
      updated_at = NOW()
  `;

  await execute(sql, [
    p.id,
    p.patientId,
    "", // patient_name
    p.therapistId,
    p.therapistName,
    p.title,
    p.primaryDiagnosis || null,
    JSON.stringify(p.goals || []),
    JSON.stringify(p.prescribedTherapies || []),
    JSON.stringify([]), // home_exercises
    12, // duration_weeks
    2,  // sessions_per_week
    p.status,
    p.startDate,
    p.targetEndDate || null,
  ]);

  return p;
}

export async function dbLogClinicalAuditEvent(e: ClinicalAuditEvent): Promise<void> {
  await initMySQLSchema();
  const sql = `
    INSERT INTO clinical_audit_events (
      id, staff_id, staff_name, staff_role, action, patient_id,
      patient_name, entity_type, entity_id, reason, diff_json, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `;

  await execute(sql, [
    e.id,
    e.staffId,
    e.staffName,
    "therapist",
    e.action,
    e.patientId || null,
    null,
    "patient_record",
    e.patientId || e.id,
    null,
    JSON.stringify(e.details || {}),
  ]);
}

export async function dbGetClinicalAuditEvents(patientId?: string): Promise<ClinicalAuditEvent[]> {
  await initMySQLSchema();
  let sql = "SELECT * FROM clinical_audit_events";
  const params: any[] = [];
  if (patientId) {
    sql += " WHERE patient_id = ?";
    params.push(patientId);
  }
  sql += " ORDER BY created_at DESC LIMIT 100";

  const rows = await query<any>(sql, params);
  return rows.map((r) => ({
    id: r.id,
    patientId: r.patient_id,
    staffId: r.staff_id,
    staffName: r.staff_name,
    action: r.action,
    timestamp: new Date(r.created_at).toISOString(),
    details: safeJsonParse<any>(r.diff_json, {}),
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// 15. PAYMENTS & INVOICES
// ─────────────────────────────────────────────────────────────────────────────

export async function dbSavePayment(p: PaymentTransaction): Promise<PaymentTransaction> {
  await initMySQLSchema();
  const sql = `
    INSERT INTO payments (
      id, booking_id, gateway, gateway_payment_id, gateway_order_id,
      amount, currency, status, raw_response, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    ON DUPLICATE KEY UPDATE
      gateway = VALUES(gateway),
      gateway_payment_id = VALUES(gateway_payment_id),
      gateway_order_id = VALUES(gateway_order_id),
      amount = VALUES(amount),
      currency = VALUES(currency),
      status = VALUES(status),
      raw_response = VALUES(raw_response),
      updated_at = NOW()
  `;

  await execute(sql, [
    p.id,
    p.bookingId,
    p.gateway,
    p.gatewayPaymentId || null,
    p.gatewayOrderId || null,
    p.amount,
    p.currency,
    p.status,
    p.rawResponse ? JSON.stringify(p.rawResponse) : null,
  ]);

  return p;
}

export async function dbGetPaymentByGatewayOrderId(orderId: string): Promise<PaymentTransaction | null> {
  await initMySQLSchema();
  const rows = await query<any>(
    "SELECT * FROM payments WHERE gateway_order_id = ? LIMIT 1",
    [orderId]
  );
  if (!rows || rows.length === 0) return null;
  const r = rows[0];
  return {
    id: r.id,
    bookingId: r.booking_id,
    gateway: r.gateway,
    gatewayPaymentId: r.gateway_payment_id,
    gatewayOrderId: r.gateway_order_id,
    amount: parseFloat(r.amount),
    currency: r.currency,
    status: r.status,
    rawResponse: safeJsonParse<any>(r.raw_response, {}),
    createdAt: new Date(r.created_at).toISOString(),
    updatedAt: new Date(r.updated_at).toISOString(),
  };
}

export async function dbGetPaymentByBookingId(bookingId: string): Promise<PaymentTransaction | null> {
  await initMySQLSchema();
  const rows = await query<any>(
    "SELECT * FROM payments WHERE booking_id = ? ORDER BY created_at DESC LIMIT 1",
    [bookingId]
  );
  if (!rows || rows.length === 0) return null;
  const r = rows[0];
  return {
    id: r.id,
    bookingId: r.booking_id,
    gateway: r.gateway,
    gatewayPaymentId: r.gateway_payment_id,
    gatewayOrderId: r.gateway_order_id,
    amount: parseFloat(r.amount),
    currency: r.currency,
    status: r.status,
    rawResponse: safeJsonParse<any>(r.raw_response, {}),
    createdAt: new Date(r.created_at).toISOString(),
    updatedAt: new Date(r.updated_at).toISOString(),
  };
}

export async function dbUpdatePaymentStatus(
  id: string,
  status: 'pending' | 'captured' | 'failed' | 'refunded',
  gatewayPaymentId?: string,
  rawResponse?: any
): Promise<void> {
  await initMySQLSchema();
  const fields = ["status = ?", "updated_at = NOW()"];
  const params: any[] = [status];

  if (gatewayPaymentId) {
    fields.push("gateway_payment_id = ?");
    params.push(gatewayPaymentId);
  }
  if (rawResponse) {
    fields.push("raw_response = ?");
    params.push(JSON.stringify(rawResponse));
  }
  params.push(id);

  await execute(`UPDATE payments SET ${fields.join(", ")} WHERE id = ?`, params);
}

export async function dbSaveInvoice(inv: InvoiceRecord): Promise<InvoiceRecord> {
  await initMySQLSchema();
  const sql = `
    INSERT INTO invoices (
      id, booking_id, invoice_number, total_amount, currency,
      status, pdf_storage_path, issued_at, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    ON DUPLICATE KEY UPDATE
      total_amount = VALUES(total_amount),
      currency = VALUES(currency),
      status = VALUES(status),
      pdf_storage_path = VALUES(pdf_storage_path)
  `;

  await execute(sql, [
    inv.id,
    inv.bookingId,
    inv.invoiceNumber,
    inv.totalAmount,
    inv.currency,
    inv.status,
    inv.pdfStoragePath || null,
    inv.issuedAt ? new Date(inv.issuedAt) : new Date(),
  ]);

  return inv;
}

export async function dbGetInvoiceByNumber(invoiceNumber: string): Promise<InvoiceRecord | null> {
  await initMySQLSchema();
  const rows = await query<any>(
    "SELECT * FROM invoices WHERE LOWER(invoice_number) = LOWER(?) LIMIT 1",
    [invoiceNumber.trim()]
  );
  if (!rows || rows.length === 0) return null;
  const r = rows[0];
  return {
    id: r.id,
    bookingId: r.booking_id,
    invoiceNumber: r.invoice_number,
    totalAmount: parseFloat(r.total_amount),
    currency: r.currency,
    status: r.status,
    pdfStoragePath: r.pdf_storage_path,
    issuedAt: new Date(r.issued_at).toISOString(),
    createdAt: new Date(r.created_at).toISOString(),
  };
}

export async function dbGetInvoiceByBookingId(bookingId: string): Promise<InvoiceRecord | null> {
  await initMySQLSchema();
  const rows = await query<any>(
    "SELECT * FROM invoices WHERE booking_id = ? ORDER BY created_at DESC LIMIT 1",
    [bookingId]
  );
  if (!rows || rows.length === 0) return null;
  const r = rows[0];
  return {
    id: r.id,
    bookingId: r.booking_id,
    invoiceNumber: r.invoice_number,
    totalAmount: parseFloat(r.total_amount),
    currency: r.currency,
    status: r.status,
    pdfStoragePath: r.pdf_storage_path,
    issuedAt: new Date(r.issued_at).toISOString(),
    createdAt: new Date(r.created_at).toISOString(),
  };
}
