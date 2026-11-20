/**
 * AURO PERFECT VISION — MYSQL DATA MIGRATION & SEED SCRIPT
 * Safely imports existing CMS, CRM, and Roster records from data/cms/*.json
 * into Hostinger MySQL tables with idempotency (ON DUPLICATE KEY UPDATE).
 */

import fs from "fs";
import path from "path";
import { isMySQLConfigured, execute, checkDatabaseConnection } from "../../src/lib/server/mysql";
import { initMySQLSchema } from "../../src/lib/server/mysql-schema";
import * as db from "../../src/lib/server/mysql-db";

const DATA_DIR = path.join(process.cwd(), "data", "cms");

function readJsonFile<T>(filename: string): T | null {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) return null;
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch (err: any) {
    console.warn(`Could not read ${filename}:`, err.message);
    return null;
  }
}

export async function runMySQLMigrationAndSeed(): Promise<{
  success: boolean;
  migrated: Record<string, number>;
  error?: string;
}> {
  console.log("==> Initializing MySQL Migration & Seed...");

  // 1. Check DB connectivity
  const connCheck = await checkDatabaseConnection();
  if (!connCheck.connected) {
    return {
      success: false,
      migrated: {},
      error: `Database unavailable: ${connCheck.error}`,
    };
  }

  // 2. Initialize Schema Tables
  const schemaResult = await initMySQLSchema();
  if (!schemaResult.success) {
    return {
      success: false,
      migrated: {},
      error: `Schema initialization failed: ${schemaResult.error}`,
    };
  }

  const counts: Record<string, number> = {};

  // 3. Migrate Staff Profiles
  const staff = readJsonFile<any[]>("staff_users.json");
  if (staff && Array.isArray(staff)) {
    let staffCount = 0;
    for (const u of staff) {
      await db.dbCreateStaffUser({
        id: u.id,
        email: u.email,
        fullName: u.fullName,
        role: u.role,
        phone: u.phone || "",
        passwordHash: u.passwordHash,
        salt: u.salt,
        isActive: Boolean(u.isActive),
        status: u.status || "active",
        therapistId: u.therapistId,
        createdAt: u.createdAt || new Date().toISOString(),
        updatedAt: u.updatedAt || new Date().toISOString(),
      });
      staffCount++;
    }
    counts["staff_profiles"] = staffCount;
  }

  // 4. Migrate Therapist Profiles
  const therapists = readJsonFile<any[]>("therapists.json");
  if (therapists && Array.isArray(therapists)) {
    let tCount = 0;
    for (const t of therapists) {
      await db.dbSaveTherapist(t);
      tCount++;
    }
    counts["therapist_profiles"] = tCount;
  }

  // 5. Migrate Offerings
  const offerings = readJsonFile<any[]>("offerings.json");
  if (offerings && Array.isArray(offerings)) {
    let oCount = 0;
    for (const o of offerings) {
      await db.dbSaveOffering(o);
      oCount++;
    }
    counts["offerings"] = oCount;
  }

  // 6. Migrate Weekly Schedule
  const schedule = readJsonFile<any[]>("weekly_schedule.json");
  if (schedule && Array.isArray(schedule)) {
    for (const s of schedule) {
      await execute(
        `INSERT INTO weekly_schedules (id, therapist_id, day_of_week, day_name, active, slots, slot_duration_minutes, buffer_minutes, updated_at)
         VALUES (?, 'global', ?, ?, ?, ?, ?, ?, NOW())
         ON DUPLICATE KEY UPDATE active = VALUES(active), slots = VALUES(slots), updated_at = NOW()`,
        [
          `sched-${s.dayOfWeek}`,
          s.dayOfWeek,
          s.dayName,
          s.active ? 1 : 0,
          JSON.stringify(s.slots || []),
          s.slotDurationMinutes || 60,
          s.bufferMinutes || 15,
        ]
      );
    }
    counts["weekly_schedules"] = schedule.length;
  }

  // 7. Migrate Leave Exceptions
  const leaves = readJsonFile<any[]>("leave_exceptions.json");
  if (leaves && Array.isArray(leaves)) {
    for (const l of leaves) {
      await execute(
        `INSERT INTO leave_exceptions (id, therapist_id, exception_date, reason, all_day, created_at)
         VALUES (?, ?, ?, ?, ?, NOW())
         ON DUPLICATE KEY UPDATE reason = VALUES(reason)`,
        [l.id, l.therapistId, l.date, l.reason, l.allDay ? 1 : 0]
      );
    }
    counts["leave_exceptions"] = leaves.length;
  }

  // 8. Migrate Intake Templates
  const templates = readJsonFile<any[]>("intake_templates.json");
  if (templates && Array.isArray(templates)) {
    for (const tpl of templates) {
      await execute(
        `INSERT INTO intake_templates (id, offering_id, version, fields, is_published, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, NOW(), NOW())
         ON DUPLICATE KEY UPDATE fields = VALUES(fields), updated_at = NOW()`,
        [tpl.id, tpl.offeringId, tpl.version || 1, JSON.stringify(tpl.fields || []), tpl.isPublished ? 1 : 0]
      );
    }
    counts["intake_templates"] = templates.length;
  }

  // 9. Migrate Bookings
  const bookings = readJsonFile<any[]>("bookings.json");
  if (bookings && Array.isArray(bookings)) {
    let bCount = 0;
    for (const b of bookings) {
      await db.dbSaveBooking(b);
      bCount++;
    }
    counts["bookings"] = bCount;
  }

  // 10. Migrate Blog Posts
  const blogs = readJsonFile<any[]>("blog_posts.json");
  if (blogs && Array.isArray(blogs)) {
    let blogCount = 0;
    for (const post of blogs) {
      await db.dbSaveBlogPost(post);
      blogCount++;
    }
    counts["blog_posts"] = blogCount;
  }

  // 11. Migrate Site Content
  const siteContent = readJsonFile<any>("site_content.json");
  if (siteContent) {
    await db.dbSaveSiteContent(siteContent);
    counts["site_content"] = 1;
  }

  // 12. Migrate CRM Clients
  const clients = readJsonFile<any[]>("crm_clients.json");
  if (clients && Array.isArray(clients)) {
    let clientCount = 0;
    for (const c of clients) {
      await db.dbSaveClient(c);
      clientCount++;
    }
    counts["client_contacts"] = clientCount;
  }

  // 13. Migrate CRM Inquiries
  const inquiries = readJsonFile<any[]>("crm_inquiries.json");
  if (inquiries && Array.isArray(inquiries)) {
    let inqCount = 0;
    for (const inq of inquiries) {
      await db.dbSaveInquiry(inq);
      inqCount++;
    }
    counts["crm_inquiries"] = inqCount;
  }

  // 14. Migrate CRM Tasks
  const tasks = readJsonFile<any[]>("crm_tasks.json");
  if (tasks && Array.isArray(tasks)) {
    let taskCount = 0;
    for (const t of tasks) {
      await db.dbSaveTask(t);
      taskCount++;
    }
    counts["crm_tasks"] = taskCount;
  }

  // 15. Migrate CRM Notes
  const notes = readJsonFile<any[]>("crm_notes.json");
  if (notes && Array.isArray(notes)) {
    for (const n of notes) {
      await db.dbAddClientNote(n);
    }
    counts["crm_notes"] = notes.length;
  }

  // 16. Migrate CRM Activities
  const activities = readJsonFile<any[]>("crm_activities.json");
  if (activities && Array.isArray(activities)) {
    for (const a of activities) {
      await db.dbLogCrmActivity(a);
    }
    counts["crm_activities"] = activities.length;
  }

  // 17. Migrate Programmes
  const programmes = readJsonFile<any[]>("programmes.json");
  if (programmes && Array.isArray(programmes)) {
    for (const p of programmes) {
      await db.dbSaveProgramme(p);
    }
    counts["programmes"] = programmes.length;
  }

  // 18. Migrate Media Assets
  const media = readJsonFile<any[]>("media_assets.json");
  if (media && Array.isArray(media)) {
    for (const m of media) {
      await db.dbSaveMediaAsset(m);
    }
    counts["media_assets"] = media.length;
  }

  // 19. Migrate Audit Logs
  const auditLogs = readJsonFile<any[]>("audit_logs.json");
  if (auditLogs && Array.isArray(auditLogs)) {
    for (const log of auditLogs) {
      await db.dbLogAuditEvent(log);
    }
    counts["audit_logs"] = auditLogs.length;
  }

  console.log("==> Migration & Seed Completed Successfully!", counts);
  return { success: true, migrated: counts };
}

// Allow direct CLI execution: node -r ts-node/register scripts/mysql/seed.ts
if (require.main === module) {
  runMySQLMigrationAndSeed()
    .then((res) => {
      console.log("Migration Result:", JSON.stringify(res, null, 2));
      process.exit(res.success ? 0 : 1);
    })
    .catch((err) => {
      console.error("Migration Fatal Error:", err);
      process.exit(1);
    });
}
