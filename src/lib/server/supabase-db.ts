/**
 * AURO PERFECT VISION — SUPABASE POSTGRESQL DATA ACCESS LAYER
 * Real-time, normalized relational persistence for all CMS, CRM, Staff, and Operational entities.
 */

import { getSupabaseAdminClient, isSupabaseConfigured } from "./supabase";
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
} from "@/lib/types";
import {
  ClientContact,
  CrmInquiry,
  CrmTask,
  CrmNote,
  CrmActivity,
} from "@/lib/types/crm";
import { SiteContent } from "./cms";

// ─── 1. STAFF USERS ──────────────────────────────────────────────────────────

export async function dbGetStaffUsers(): Promise<StaffUser[]> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("staff_profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`dbGetStaffUsers error: ${error.message}`);
  if (!data) return [];

  return data.map((row: any) => ({
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    role: row.role,
    phone: row.phone || "",
    passwordHash: row.password_hash || "",
    salt: row.salt || "",
    isActive: row.is_active ?? true,
    status: row.status || (row.is_active ? "active" : "suspended"),
    therapistId: row.therapist_id,
    lastLoginAt: row.last_login_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function dbFindStaffByEmail(email: string): Promise<StaffUser | null> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("staff_profiles")
    .select("*")
    .ilike("email", email.trim().toLowerCase())
    .maybeSingle();

  if (error) throw new Error(`dbFindStaffByEmail error: ${error.message}`);
  if (!data) return null;

  return {
    id: data.id,
    email: data.email,
    fullName: data.full_name,
    role: data.role,
    phone: data.phone || "",
    passwordHash: data.password_hash || "",
    salt: data.salt || "",
    isActive: data.is_active ?? true,
    status: data.status || (data.is_active ? "active" : "suspended"),
    therapistId: data.therapist_id,
    lastLoginAt: data.last_login_at,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function dbFindStaffById(id: string): Promise<StaffUser | null> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("staff_profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`dbFindStaffById error: ${error.message}`);
  if (!data) return null;

  return {
    id: data.id,
    email: data.email,
    fullName: data.full_name,
    role: data.role,
    phone: data.phone || "",
    passwordHash: data.password_hash || "",
    salt: data.salt || "",
    isActive: data.is_active ?? true,
    status: data.status || (data.is_active ? "active" : "suspended"),
    therapistId: data.therapist_id,
    lastLoginAt: data.last_login_at,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function dbCreateStaffUser(user: StaffUser): Promise<StaffUser> {
  const supabase = getSupabaseAdminClient();
  const row = {
    email: user.email.toLowerCase().trim(),
    full_name: user.fullName,
    role: user.role,
    phone: user.phone || "",
    password_hash: user.passwordHash,
    salt: user.salt,
    is_active: user.isActive,
    status: user.status || "active",
    therapist_id: user.therapistId || null,
    created_at: user.createdAt || new Date().toISOString(),
    updated_at: user.updatedAt || new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("staff_profiles")
    .insert([row])
    .select()
    .single();

  if (error) throw new Error(`dbCreateStaffUser error: ${error.message}`);

  return {
    id: data.id,
    email: data.email,
    fullName: data.full_name,
    role: data.role,
    phone: data.phone || "",
    passwordHash: data.password_hash || "",
    salt: data.salt || "",
    isActive: data.is_active,
    status: data.status,
    therapistId: data.therapist_id,
    lastLoginAt: data.last_login_at,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function dbUpdateStaffUser(
  id: string,
  updates: Partial<StaffUser>
): Promise<StaffUser | null> {
  const supabase = getSupabaseAdminClient();
  const updatePayload: any = {
    updated_at: new Date().toISOString(),
  };

  if (updates.fullName !== undefined) updatePayload.full_name = updates.fullName;
  if (updates.email !== undefined) updatePayload.email = updates.email.toLowerCase().trim();
  if (updates.role !== undefined) updatePayload.role = updates.role;
  if (updates.phone !== undefined) updatePayload.phone = updates.phone;
  if (updates.isActive !== undefined) updatePayload.is_active = updates.isActive;
  if (updates.status !== undefined) {
    updatePayload.status = updates.status;
    updatePayload.is_active = updates.status === "active";
  }
  if (updates.passwordHash !== undefined) updatePayload.password_hash = updates.passwordHash;
  if (updates.salt !== undefined) updatePayload.salt = updates.salt;
  if (updates.therapistId !== undefined) updatePayload.therapist_id = updates.therapistId;
  if (updates.lastLoginAt !== undefined) updatePayload.last_login_at = updates.lastLoginAt;

  const { data, error } = await supabase
    .from("staff_profiles")
    .update(updatePayload)
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) throw new Error(`dbUpdateStaffUser error: ${error.message}`);
  if (!data) return null;

  return {
    id: data.id,
    email: data.email,
    fullName: data.full_name,
    role: data.role,
    phone: data.phone || "",
    passwordHash: data.password_hash || "",
    salt: data.salt || "",
    isActive: data.is_active,
    status: data.status,
    therapistId: data.therapist_id,
    lastLoginAt: data.last_login_at,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function dbDeleteStaffUser(id: string): Promise<boolean> {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("staff_profiles").delete().eq("id", id);
  if (error) throw new Error(`dbDeleteStaffUser error: ${error.message}`);
  return true;
}

// ─── 2. SITE CONTENT ─────────────────────────────────────────────────────────

export async function dbGetSiteContent(): Promise<SiteContent | null> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("site_content")
    .select("*")
    .eq("id", "global_settings")
    .maybeSingle();

  if (error || !data) return null;

  return {
    heroHeadline: data.hero_headline,
    heroSubtitle: data.hero_subtitle,
    heroImageUrl: data.hero_image_url,
    primaryCtaText: data.primary_cta_text,
    primaryCtaLink: data.primary_cta_link,
    aboutHeading: data.about_heading,
    aboutSummary: data.about_summary,
    phone: data.phone,
    email: data.email,
    address: data.address,
    whatsappLink: data.whatsapp_link,
    openingHours: data.opening_hours,
    updatedAt: data.updated_at,
  };
}

export async function dbSaveSiteContent(content: SiteContent): Promise<SiteContent> {
  const supabase = getSupabaseAdminClient();
  const row = {
    id: "global_settings",
    hero_headline: content.heroHeadline,
    hero_subtitle: content.heroSubtitle,
    hero_image_url: content.heroImageUrl,
    primary_cta_text: content.primaryCtaText,
    primary_cta_link: content.primaryCtaLink,
    about_heading: content.aboutHeading,
    about_summary: content.aboutSummary,
    phone: content.phone,
    email: content.email,
    address: content.address,
    whatsapp_link: content.whatsappLink,
    opening_hours: content.openingHours,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("site_content")
    .upsert([row])
    .select()
    .single();

  if (error) throw new Error(`dbSaveSiteContent error: ${error.message}`);
  return content;
}

// ─── 3. THERAPISTS ───────────────────────────────────────────────────────────

export async function dbGetAllTherapists(): Promise<Therapist[]> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("therapist_profiles")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw new Error(`dbGetAllTherapists error: ${error.message}`);
  if (!data) return [];

  return data.map((t: any) => ({
    id: t.id,
    slug: t.slug,
    displayName: t.display_name,
    roleTitle: t.role_title,
    bio: t.bio,
    specialties: t.specialties || [],
    qualifications: t.qualifications || "",
    photoUrl: t.photo_url || "",
    email: t.email || "",
    phone: t.phone || "",
    assignedOfferingIds: t.assigned_offering_ids || [],
    isPublished: t.is_published ?? true,
  }));
}

export async function dbSaveTherapist(t: Therapist): Promise<Therapist> {
  const supabase = getSupabaseAdminClient();
  const row = {
    id: t.id,
    slug: t.slug,
    display_name: t.displayName,
    role_title: t.roleTitle,
    bio: t.bio,
    specialties: t.specialties || [],
    qualifications: t.qualifications,
    photo_url: t.photoUrl,
    email: t.email,
    phone: t.phone,
    is_published: t.isPublished,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("therapist_profiles").upsert([row]);
  if (error) throw new Error(`dbSaveTherapist error: ${error.message}`);
  return t;
}

// ─── 4. OFFERINGS ────────────────────────────────────────────────────────────

export async function dbGetAllOfferings(): Promise<Offering[]> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("offerings")
    .select("*, prices(*), offering_therapists(*)")
    .order("created_at", { ascending: true });

  if (error) throw new Error(`dbGetAllOfferings error: ${error.message}`);
  if (!data) return [];

  return data.map((o: any) => {
    const activePrice = o.prices?.find((p: any) => p.is_active) || o.prices?.[0] || {
      inr_amount: 2000,
      usd_amount: 40,
    };
    const therapistIds = o.offering_therapists?.map((ot: any) => ot.therapist_id) || [];

    return {
      id: o.id,
      slug: o.slug,
      title: o.title,
      shortDescription: o.short_description,
      fullDescription: o.full_description,
      category: o.category,
      format: o.format,
      delivery: o.delivery,
      durationMinutes: o.duration_minutes,
      maxCapacity: o.max_capacity,
      isFlagshipProgramme: o.is_flagship_programme,
      featured: o.featured ?? false,
      imageUrl: o.image_url,
      whatToExpect: o.what_to_expect || [],
      suitableFor: o.suitable_for || [],
      isPublished: o.is_published,
      price: {
        inr: activePrice.inr_amount,
        usd: activePrice.usd_amount,
        taxInclusive: true,
      },
      assignedTherapistIds: therapistIds,
    };
  });
}

export async function dbSaveOffering(o: Offering): Promise<Offering> {
  const supabase = getSupabaseAdminClient();
  const row = {
    id: o.id,
    slug: o.slug,
    title: o.title,
    short_description: o.shortDescription,
    full_description: o.fullDescription,
    category: o.category,
    format: o.format,
    delivery: o.delivery,
    duration_minutes: o.durationMinutes,
    max_capacity: o.maxCapacity,
    is_flagship_programme: o.isFlagshipProgramme,
    image_url: o.imageUrl,
    what_to_expect: o.whatToExpect,
    suitable_for: o.suitableFor,
    is_published: o.isPublished,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("offerings").upsert([row]);
  if (error) throw new Error(`dbSaveOffering error: ${error.message}`);

  // Upsert price
  if (o.price) {
    await supabase.from("prices").upsert([
      {
        offering_id: o.id,
        inr_amount: o.price.inr,
        usd_amount: o.price.usd,
        is_active: true,
      },
    ]);
  }

  // Update therapist links if provided
  if (o.assignedTherapistIds && o.assignedTherapistIds.length > 0) {
    await supabase.from("offering_therapists").delete().eq("offering_id", o.id);
    const links = o.assignedTherapistIds.map((tId) => ({
      offering_id: o.id,
      therapist_id: tId,
    }));
    await supabase.from("offering_therapists").insert(links);
  }

  return o;
}

// ─── 5. BLOG POSTS ───────────────────────────────────────────────────────────

export async function dbGetAllBlogPosts(): Promise<BlogPost[]> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`dbGetAllBlogPosts error: ${error.message}`);
  if (!data) return [];

  return data.map((b: any) => ({
    id: b.id,
    slug: b.slug,
    title: b.title,
    excerpt: b.excerpt,
    content: b.content,
    category: b.category,
    readTime: b.read_time,
    publishedDate: b.published_date,
    authorName: b.author_name,
    coverImage: b.cover_image,
    isPublished: b.is_published,
  }));
}

export async function dbSaveBlogPost(b: BlogPost): Promise<BlogPost> {
  const supabase = getSupabaseAdminClient();
  const row = {
    id: b.id,
    slug: b.slug,
    title: b.title,
    excerpt: b.excerpt,
    content: b.content,
    category: b.category,
    read_time: b.readTime,
    published_date: b.publishedDate,
    author_name: b.authorName,
    cover_image: b.coverImage,
    is_published: b.isPublished,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("blog_posts").upsert([row]);
  if (error) throw new Error(`dbSaveBlogPost error: ${error.message}`);
  return b;
}

// ─── 6. AUDIT LOGS ───────────────────────────────────────────────────────────

export async function dbGetAuditLogs(): Promise<AuditLogEntry[]> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) throw new Error(`dbGetAuditLogs error: ${error.message}`);
  if (!data) return [];

  return data.map((a: any) => ({
    id: a.id,
    staffId: a.staff_id || "system",
    staffEmail: a.diff_json?.staffEmail || "",
    staffName: a.diff_json?.staffName || "Staff User",
    action: a.action,
    entityType: a.entity_type,
    entityId: a.entity_id,
    details: a.diff_json?.details || {},
    timestamp: a.created_at,
  }));
}

export async function dbLogAuditEvent(entry: Omit<AuditLogEntry, "id" | "timestamp">): Promise<AuditLogEntry> {
  const supabase = getSupabaseAdminClient();
  const id = `audit-${Date.now()}`;
  const timestamp = new Date().toISOString();

  const row = {
    id,
    staff_id: entry.staffId && entry.staffId.startsWith("staff-") ? null : entry.staffId,
    action: entry.action,
    entity_type: entry.entityType,
    entity_id: entry.entityId,
    diff_json: {
      staffEmail: entry.staffEmail,
      staffName: entry.staffName,
      details: entry.details,
    },
    created_at: timestamp,
  };

  await supabase.from("audit_logs").insert([row]);
  return { id, timestamp, ...entry };
}
