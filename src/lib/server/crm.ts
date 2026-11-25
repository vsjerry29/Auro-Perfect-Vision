import fs from "fs";
import path from "path";
import {
  ClientContact,
  CrmInquiry,
  CrmTask,
  CrmNote,
  CrmActivity,
  InquiryStage,
} from "@/lib/types/crm";
import { Booking } from "@/lib/types";
import { getAllBookings } from "./cms";

import { isMySQLConfigured } from "./mysql";
import { isTestMode } from "./storage-engine";
import * as db from "./mysql-db";

const globalForCrm = globalThis as unknown as {
  __apvCrmMemoryStore?: Map<string, any>;
};
const crmMemoryStore: Map<string, any> =
  globalForCrm.__apvCrmMemoryStore || (globalForCrm.__apvCrmMemoryStore = new Map());

async function syncCrmToMySQL(filename: string, data: any): Promise<void> {
  if (!isMySQLConfigured()) return;
  try {
    if ((filename === "crm_clients.json" || filename === "clients.json") && Array.isArray(data)) {
      for (const item of data) {
        await db.dbSaveClient(item);
      }
    } else if ((filename === "crm_inquiries.json" || filename === "inquiries.json") && Array.isArray(data)) {
      for (const item of data) {
        await db.dbSaveInquiry(item);
      }
    } else if ((filename === "crm_tasks.json" || filename === "tasks.json") && Array.isArray(data)) {
      for (const item of data) {
        await db.dbSaveTask(item);
      }
    } else if ((filename === "crm_notes.json" || filename === "notes.json") && Array.isArray(data)) {
      const latest = data[data.length - 1];
      if (latest) await db.dbAddClientNote(latest);
    } else if ((filename === "crm_activities.json" || filename === "activities.json") && Array.isArray(data)) {
      const latest = data[0] || data[data.length - 1];
      if (latest) await db.dbLogCrmActivity(latest);
    }
  } catch (err: any) {
    console.warn(`[MySQL CRM Sync Notice (${filename})]:`, err.message);
  }
}

function readJsonFile<T>(filename: string, defaultData: T): T {
  if (crmMemoryStore.has(filename)) {
    return crmMemoryStore.get(filename);
  }

  try {
    const filePath = path.join(process.cwd(), "data", "cms", filename);
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(raw);
      crmMemoryStore.set(filename, parsed);
      return parsed;
    }
  } catch (err) {
    // Non-fatal read error, fallback to defaultData
  }

  crmMemoryStore.set(filename, defaultData);
  return defaultData;
}

function writeJsonFile<T>(filename: string, data: T): void {
  crmMemoryStore.set(filename, data);

  if (isMySQLConfigured()) {
    syncCrmToMySQL(filename, data).catch(() => {});
    return;
  }

  if (isTestMode()) {
    return;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "DATABASE_NOT_CONFIGURED: Hostinger MySQL is not connected. " +
        "Please configure DB_HOST, DB_NAME, DB_USER, and DB_PASSWORD (or DATABASE_URL) to save changes."
    );
  }
}

// ==================== INITIAL SEED DATA ====================

const INITIAL_CLIENTS: ClientContact[] = [
  {
    id: "client-1",
    clientReference: "APV-CLI-1001",
    fullName: "Priya Sundaram",
    email: "priya.sundaram@example.com",
    phone: "+91 98401 23456",
    countryCode: "+91",
    locality: "Chennai / Auroville",
    preferredChannel: "whatsapp",
    source: "website_booking",
    status: "active",
    tags: ["Eye Yoga", "Digital Strain", "Auroville Resident"],
    assignedStaffId: "staff-therapist-1",
    assignedStaffName: "Dr. Ananya Sen",
    notesCount: 2,
    totalBookings: 2,
    totalSpentINR: 4500,
    totalSpentUSD: 60,
    firstBookingDate: "2026-11-01",
    lastBookingDate: "2026-11-18",
    consentGiven: true,
    consentDate: "2026-11-01T09:30:00Z",
    createdAt: "2026-11-01T09:30:00Z",
    updatedAt: "2026-11-17T12:00:00Z",
  },
  {
    id: "client-2",
    clientReference: "APV-CLI-1002",
    fullName: "Marcus Vance",
    email: "marcus.vance@example.co.uk",
    phone: "+44 7700 900123",
    countryCode: "+44",
    locality: "London / Global",
    preferredChannel: "email",
    source: "contact_form",
    status: "active",
    tags: ["Retreat Applicant", "International Guest"],
    assignedStaffId: "staff-admin-1",
    assignedStaffName: "Dr. Sivakumar",
    notesCount: 1,
    totalBookings: 1,
    totalSpentINR: 28000,
    totalSpentUSD: 420,
    firstBookingDate: "2026-11-10",
    lastBookingDate: "2026-11-10",
    consentGiven: true,
    consentDate: "2026-11-10T14:15:00Z",
    createdAt: "2026-11-10T14:15:00Z",
    updatedAt: "2026-11-17T14:00:00Z",
  },
];

const INITIAL_INQUIRIES: CrmInquiry[] = [
  {
    id: "inq-1",
    reference: "INQ-2026-0041",
    clientContactId: "client-2",
    name: "Marcus Vance",
    email: "marcus.vance@example.co.uk",
    phone: "+44 7700 900123",
    subject: "Inquiry regarding 7-Day Residential Retreat Dates",
    category: "7-Day Residential Retreat",
    message: "Hello team, I am planning to visit Auroville in late November. Are there still spots open for the 7-day retreat? Do you provide guest house assistance?",
    source: "contact_form",
    stage: "booked",
    priority: "high",
    assignedStaffId: "staff-admin-1",
    assignedStaffName: "Dr. Sivakumar",
    createdAt: "2026-11-09T11:20:00Z",
    updatedAt: "2026-11-10T14:15:00Z",
  },
  {
    id: "inq-2",
    reference: "INQ-2026-0042",
    name: "Elena Rostova",
    email: "elena.rostova@example.com",
    phone: "+49 151 2345678",
    subject: "Online Eye Yoga Consultations across timezones",
    category: "Natural Vision Therapy",
    message: "Does Auro Perfect Vision offer remote consultations for computer vision syndrome in European evening hours?",
    source: "contact_form",
    stage: "new",
    priority: "medium",
    assignedStaffId: "staff-therapist-1",
    assignedStaffName: "Dr. Ananya Sen",
    createdAt: "2026-11-17T08:30:00Z",
    updatedAt: "2026-11-17T08:30:00Z",
  },
];

const INITIAL_TASKS: CrmTask[] = [
  {
    id: "task-1",
    clientContactId: "client-2",
    clientName: "Marcus Vance",
    inquiryId: "inq-1",
    title: "Confirm Auroville guest house booking for Marcus Vance",
    description: "Check availability at Arka / Centre Guest House for Nov 24-30 retreat cohort.",
    priority: "high",
    dueDate: "2026-11-19",
    status: "pending",
    assignedStaffId: "staff-admin-1",
    assignedStaffName: "Dr. Sivakumar",
    createdById: "staff-admin-1",
    createdByName: "Dr. Sivakumar",
    createdAt: "2026-11-16T10:00:00Z",
  },
  {
    id: "task-2",
    inquiryId: "inq-2",
    title: "Reply to Elena Rostova regarding CET evening slots",
    description: "Explain hybrid session timings and send online consultation booking link.",
    priority: "medium",
    dueDate: "2026-11-18",
    status: "pending",
    assignedStaffId: "staff-therapist-1",
    assignedStaffName: "Dr. Ananya Sen",
    createdById: "staff-admin-1",
    createdByName: "Dr. Sivakumar",
    createdAt: "2026-11-17T09:00:00Z",
  },
];

const INITIAL_NOTES: CrmNote[] = [
  {
    id: "note-1",
    clientContactId: "client-1",
    authorStaffId: "staff-therapist-1",
    authorStaffName: "Dr. Ananya Sen",
    authorStaffRole: "therapist",
    content: "Client responded very well to 10-minute Bates palming and sunning. Noticed reduced tension in ciliary muscles. Recommended daily practice morning and evening.",
    category: "general",
    isPinned: true,
    createdAt: "2026-11-01T11:00:00Z",
    updatedAt: "2026-11-01T11:00:00Z",
  },
];

const INITIAL_ACTIVITIES: CrmActivity[] = [
  {
    id: "act-1",
    clientContactId: "client-1",
    eventType: "client_created",
    title: "Client Profile Created",
    description: "Profile created from initial booking APV-2026-X8Y2K.",
    createdAt: "2026-11-01T09:30:00Z",
  },
  {
    id: "act-2",
    clientContactId: "client-2",
    eventType: "inquiry_received",
    title: "Contact Inquiry Received",
    description: "Submitted 7-day retreat inquiry from contact form.",
    createdAt: "2026-11-09T11:20:00Z",
  },
];

// ==================== CLIENT CONTACTS ====================

export function getAllClients(options?: {
  search?: string;
  tag?: string;
  status?: string;
  staffId?: string;
}): ClientContact[] {
  let clients = readJsonFile<ClientContact[]>("crm_clients.json", INITIAL_CLIENTS);

  if (options?.status && options.status !== "all") {
    clients = clients.filter((c) => c.status === options.status);
  }

  if (options?.tag && options.tag !== "all") {
    clients = clients.filter((c) => c.tags.includes(options.tag!));
  }

  if (options?.staffId) {
    clients = clients.filter((c) => c.assignedStaffId === options.staffId);
  }

  if (options?.search) {
    const q = options.search.toLowerCase().trim();
    clients = clients.filter(
      (c) =>
        c.fullName.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.clientReference.toLowerCase().includes(q)
    );
  }

  return clients;
}

export function getClientById(id: string): ClientContact | undefined {
  const clients = readJsonFile<ClientContact[]>("crm_clients.json", INITIAL_CLIENTS);
  return clients.find((c) => c.id === id || c.clientReference === id);
}

export function saveClient(
  data: Partial<ClientContact> & { fullName: string; email: string },
  staffUser?: { id: string; fullName: string }
): ClientContact {
  const clients = readJsonFile<ClientContact[]>("crm_clients.json", INITIAL_CLIENTS);

  if (data.id) {
    const idx = clients.findIndex((c) => c.id === data.id);
    if (idx >= 0) {
      const updated: ClientContact = {
        ...clients[idx],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      clients[idx] = updated;
      writeJsonFile("crm_clients.json", clients);

      if (staffUser) {
        logCrmActivity(
          updated.id,
          "contact_updated",
          "Contact Profile Updated",
          `Updated by ${staffUser.fullName}`,
          staffUser
        );
      }
      return updated;
    }
  }

  const id = `client-${Date.now()}`;
  const refNum = (clients.length + 1001).toString();
  const clientReference = data.clientReference || `APV-CLI-${refNum}`;

  const newClient: ClientContact = {
    id,
    clientReference,
    fullName: data.fullName,
    email: data.email.toLowerCase().trim(),
    phone: data.phone || "",
    countryCode: data.countryCode || "+91",
    locality: data.locality || "",
    preferredChannel: data.preferredChannel || "whatsapp",
    source: data.source || "phone",
    status: data.status || "active",
    tags: data.tags || ["New Client"],
    assignedStaffId: data.assignedStaffId,
    assignedStaffName: data.assignedStaffName,
    notesCount: 0,
    totalBookings: data.totalBookings || 0,
    totalSpentINR: data.totalSpentINR || 0,
    totalSpentUSD: data.totalSpentUSD || 0,
    firstBookingDate: data.firstBookingDate,
    lastBookingDate: data.lastBookingDate,
    consentGiven: data.consentGiven !== undefined ? data.consentGiven : true,
    consentDate: data.consentDate || new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  clients.unshift(newClient);
  writeJsonFile("crm_clients.json", clients);

  if (staffUser) {
    logCrmActivity(
      newClient.id,
      "client_created",
      "Client Contact Created",
      `Manually created by ${staffUser.fullName}`,
      staffUser
    );
  }

  return newClient;
}

export function archiveClient(id: string, staffUser?: { id: string; fullName: string }): boolean {
  const clients = readJsonFile<ClientContact[]>("crm_clients.json", INITIAL_CLIENTS);
  const idx = clients.findIndex((c) => c.id === id);
  if (idx < 0) return false;

  clients[idx].status = "archived";
  clients[idx].updatedAt = new Date().toISOString();
  writeJsonFile("crm_clients.json", clients);

  if (staffUser) {
    logCrmActivity(
      id,
      "contact_updated",
      "Client Archived",
      `Archived by ${staffUser.fullName}`,
      staffUser
    );
  }
  return true;
}

// Automatically links or creates a client when a booking occurs
export function findOrCreateClientFromBooking(booking: Booking): ClientContact {
  const clients = readJsonFile<ClientContact[]>("crm_clients.json", INITIAL_CLIENTS);
  const emailNorm = booking.clientEmail.toLowerCase().trim();
  const phoneNorm = booking.clientPhone.replace(/[^0-9]/g, "");

  const existing = clients.find(
    (c) =>
      c.email.toLowerCase().trim() === emailNorm ||
      (phoneNorm && c.phone.replace(/[^0-9]/g, "") === phoneNorm)
  );

  if (existing) {
    existing.totalBookings += 1;
    if (booking.currency === "INR") {
      existing.totalSpentINR += booking.totalAmount;
    } else {
      existing.totalSpentUSD += booking.totalAmount;
    }
    existing.lastBookingDate = booking.date;
    existing.updatedAt = new Date().toISOString();
    writeJsonFile("crm_clients.json", clients);

    logCrmActivity(
      existing.id,
      "booking_created",
      "New Appointment Booked",
      `Session: ${booking.offeringTitle} on ${booking.date} (${booking.timeSlot}). Ref: ${booking.bookingReference}`
    );
    return existing;
  }

  return saveClient({
    fullName: booking.clientName,
    email: booking.clientEmail,
    phone: booking.clientPhone,
    source: "website_booking",
    status: "active",
    tags: ["Guest Booking", booking.offeringTitle],
    totalBookings: 1,
    totalSpentINR: booking.currency === "INR" ? booking.totalAmount : 0,
    totalSpentUSD: booking.currency === "USD" ? booking.totalAmount : 0,
    firstBookingDate: booking.date,
    lastBookingDate: booking.date,
  });
}

// Automatically creates or links a client when a contact inquiry arrives
export function findOrCreateClientFromInquiry(inquiry: CrmInquiry): ClientContact {
  const clients = readJsonFile<ClientContact[]>("crm_clients.json", INITIAL_CLIENTS);
  const emailNorm = inquiry.email.toLowerCase().trim();

  const existing = clients.find((c) => c.email.toLowerCase().trim() === emailNorm);
  if (existing) {
    logCrmActivity(
      existing.id,
      "inquiry_received",
      "New Contact Inquiry Received",
      `Subject: ${inquiry.subject} (Ref: ${inquiry.reference})`
    );
    return existing;
  }

  return saveClient({
    fullName: inquiry.name,
    email: inquiry.email,
    phone: inquiry.phone || "",
    source: "contact_form",
    status: "lead",
    tags: ["Inquiry Lead", inquiry.category],
  });
}

// Detect duplicate candidate profiles
export function detectPotentialDuplicates(): {
  primary: ClientContact;
  duplicates: ClientContact[];
  matchReason: string;
}[] {
  const clients = getAllClients();
  const results: { primary: ClientContact; duplicates: ClientContact[]; matchReason: string }[] = [];
  const processed = new Set<string>();

  for (let i = 0; i < clients.length; i++) {
    const c1 = clients[i];
    if (processed.has(c1.id)) continue;

    const duplicates: ClientContact[] = [];
    let matchReason = "";

    for (let j = i + 1; j < clients.length; j++) {
      const c2 = clients[j];
      if (processed.has(c2.id)) continue;

      const emailMatch =
        c1.email && c2.email && c1.email.toLowerCase().trim() === c2.email.toLowerCase().trim();
      const phone1 = c1.phone.replace(/[^0-9]/g, "");
      const phone2 = c2.phone.replace(/[^0-9]/g, "");
      const phoneMatch = phone1 && phone2 && phone1.length >= 7 && phone1 === phone2;

      if (emailMatch || phoneMatch) {
        duplicates.push(c2);
        processed.add(c2.id);
        matchReason = emailMatch ? "Exact Email Match" : "Exact Phone Match";
      }
    }

    if (duplicates.length > 0) {
      processed.add(c1.id);
      results.push({ primary: c1, duplicates, matchReason });
    }
  }

  return results;
}

// Supervised merge of duplicate profiles
export function mergeClients(
  primaryId: string,
  duplicateIds: string[],
  staffUser: { id: string; fullName: string }
): ClientContact | null {
  const clients = getAllClients();
  const primaryIdx = clients.findIndex((c) => c.id === primaryId);
  if (primaryIdx < 0) return null;

  const primary = clients[primaryIdx];
  const duplicateSet = new Set(duplicateIds);

  let mergedBookings = primary.totalBookings;
  let mergedSpentINR = primary.totalSpentINR;
  let mergedSpentUSD = primary.totalSpentUSD;
  const mergedTags = new Set(primary.tags);

  const mergedNames: string[] = [];

  for (const dup of clients) {
    if (duplicateSet.has(dup.id)) {
      mergedBookings += dup.totalBookings;
      mergedSpentINR += dup.totalSpentINR;
      mergedSpentUSD += dup.totalSpentUSD;
      dup.tags.forEach((t) => mergedTags.add(t));
      mergedNames.push(`${dup.fullName} (${dup.clientReference})`);
    }
  }

  primary.totalBookings = mergedBookings;
  primary.totalSpentINR = mergedSpentINR;
  primary.totalSpentUSD = mergedSpentUSD;
  primary.tags = Array.from(mergedTags);
  primary.updatedAt = new Date().toISOString();

  // Remove the duplicate records
  const remaining = clients.filter((c) => !duplicateSet.has(c.id));
  writeJsonFile("crm_clients.json", remaining);

  logCrmActivity(
    primary.id,
    "clients_merged",
    "Duplicate Profiles Merged",
    `Merged with ${mergedNames.join(", ")} by ${staffUser.fullName}`,
    staffUser
  );

  return primary;
}

// ==================== INQUIRIES & LEADS ====================

export function getAllInquiries(options?: { stage?: string; search?: string }): CrmInquiry[] {
  let inquiries = readJsonFile<CrmInquiry[]>("crm_inquiries.json", INITIAL_INQUIRIES);

  if (options?.stage && options.stage !== "all") {
    inquiries = inquiries.filter((i) => i.stage === options.stage);
  }

  if (options?.search) {
    const q = options.search.toLowerCase().trim();
    inquiries = inquiries.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.email.toLowerCase().includes(q) ||
        i.subject.toLowerCase().includes(q) ||
        i.reference.toLowerCase().includes(q)
    );
  }

  return inquiries;
}

export function saveInquiry(
  data: Partial<CrmInquiry> & { name: string; email: string; subject: string; message: string },
  staffUser?: { id: string; fullName: string }
): CrmInquiry {
  const inquiries = readJsonFile<CrmInquiry[]>("crm_inquiries.json", INITIAL_INQUIRIES);

  if (data.id) {
    const idx = inquiries.findIndex((i) => i.id === data.id);
    if (idx >= 0) {
      const updated: CrmInquiry = {
        ...inquiries[idx],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      inquiries[idx] = updated;
      writeJsonFile("crm_inquiries.json", inquiries);
      return updated;
    }
  }

  const id = `inq-${Date.now()}`;
  const seq = (inquiries.length + 1).toString().padStart(4, "0");
  const reference = `INQ-2026-${seq}`;

  const newInquiry: CrmInquiry = {
    id,
    reference,
    clientContactId: data.clientContactId,
    name: data.name,
    email: data.email.toLowerCase().trim(),
    phone: data.phone || "",
    subject: data.subject,
    category: data.category || "General Inquiry",
    message: data.message,
    source: data.source || "contact_form",
    stage: data.stage || "new",
    priority: data.priority || "medium",
    assignedStaffId: data.assignedStaffId,
    assignedStaffName: data.assignedStaffName,
    linkedBookingId: data.linkedBookingId,
    internalNotes: data.internalNotes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  inquiries.unshift(newInquiry);
  writeJsonFile("crm_inquiries.json", inquiries);

  // Link or create client
  const client = findOrCreateClientFromInquiry(newInquiry);
  newInquiry.clientContactId = client.id;
  writeJsonFile("crm_inquiries.json", inquiries);

  return newInquiry;
}

export function updateInquiryStage(
  id: string,
  stage: InquiryStage,
  staffUser: { id: string; fullName: string }
): CrmInquiry | null {
  const inquiries = readJsonFile<CrmInquiry[]>("crm_inquiries.json", INITIAL_INQUIRIES);
  const idx = inquiries.findIndex((i) => i.id === id);
  if (idx < 0) return null;

  inquiries[idx].stage = stage;
  inquiries[idx].updatedAt = new Date().toISOString();
  writeJsonFile("crm_inquiries.json", inquiries);

  if (inquiries[idx].clientContactId) {
    logCrmActivity(
      inquiries[idx].clientContactId!,
      "inquiry_stage_changed",
      `Inquiry Stage: ${stage.toUpperCase()}`,
      `Updated by ${staffUser.fullName}`,
      staffUser
    );
  }

  return inquiries[idx];
}

// ==================== CRM TASKS ====================

export function getAllTasks(options?: {
  clientId?: string;
  staffId?: string;
  status?: string;
}): CrmTask[] {
  let tasks = readJsonFile<CrmTask[]>("crm_tasks.json", INITIAL_TASKS);

  if (options?.clientId) {
    tasks = tasks.filter((t) => t.clientContactId === options.clientId);
  }

  if (options?.staffId) {
    tasks = tasks.filter((t) => t.assignedStaffId === options.staffId);
  }

  if (options?.status && options.status !== "all") {
    tasks = tasks.filter((t) => t.status === options.status);
  }

  return tasks;
}

export function saveTask(
  data: Partial<CrmTask> & { title: string; dueDate: string; assignedStaffId: string },
  staffUser: { id: string; fullName: string }
): CrmTask {
  const tasks = readJsonFile<CrmTask[]>("crm_tasks.json", INITIAL_TASKS);

  if (data.id) {
    const idx = tasks.findIndex((t) => t.id === data.id);
    if (idx >= 0) {
      const updated: CrmTask = {
        ...tasks[idx],
        ...data,
      };
      tasks[idx] = updated;
      writeJsonFile("crm_tasks.json", tasks);
      return updated;
    }
  }

  const id = `task-${Date.now()}`;
  const newTask: CrmTask = {
    id,
    clientContactId: data.clientContactId,
    clientName: data.clientName,
    inquiryId: data.inquiryId,
    bookingId: data.bookingId,
    title: data.title,
    description: data.description || "",
    priority: data.priority || "medium",
    dueDate: data.dueDate,
    status: data.status || "pending",
    assignedStaffId: data.assignedStaffId,
    assignedStaffName: data.assignedStaffName || staffUser.fullName,
    createdById: staffUser.id,
    createdByName: staffUser.fullName,
    createdAt: new Date().toISOString(),
  };

  tasks.unshift(newTask);
  writeJsonFile("crm_tasks.json", tasks);

  if (newTask.clientContactId) {
    logCrmActivity(
      newTask.clientContactId,
      "task_created",
      "Follow-up Task Scheduled",
      `${newTask.title} (Due: ${newTask.dueDate})`,
      staffUser
    );
  }

  return newTask;
}

export function toggleTaskStatus(id: string, staffUser: { id: string; fullName: string }): CrmTask | null {
  const tasks = readJsonFile<CrmTask[]>("crm_tasks.json", INITIAL_TASKS);
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx < 0) return null;

  const target = tasks[idx];
  const isDone = target.status === "completed";
  target.status = isDone ? "pending" : "completed";
  target.completedAt = isDone ? undefined : new Date().toISOString();

  writeJsonFile("crm_tasks.json", tasks);

  if (target.clientContactId) {
    logCrmActivity(
      target.clientContactId,
      "task_completed",
      isDone ? "Task Reopened" : "Task Completed",
      `${target.title} by ${staffUser.fullName}`,
      staffUser
    );
  }

  return target;
}

// ==================== INTERNAL ADMINISTRATIVE NOTES ====================

export function getNotesForClient(clientId: string): CrmNote[] {
  const notes = readJsonFile<CrmNote[]>("crm_notes.json", INITIAL_NOTES);
  return notes.filter((n) => n.clientContactId === clientId);
}

export function addClientNote(
  clientId: string,
  content: string,
  category: "general" | "call_log" | "preference" | "scheduling",
  staffUser: { id: string; fullName: string; role: string }
): CrmNote {
  const notes = readJsonFile<CrmNote[]>("crm_notes.json", INITIAL_NOTES);
  const newNote: CrmNote = {
    id: `note-${Date.now()}`,
    clientContactId: clientId,
    authorStaffId: staffUser.id,
    authorStaffName: staffUser.fullName,
    authorStaffRole: staffUser.role,
    content,
    category,
    isPinned: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  notes.unshift(newNote);
  writeJsonFile("crm_notes.json", notes);

  // Increment note count on client
  const clients = readJsonFile<ClientContact[]>("crm_clients.json", INITIAL_CLIENTS);
  const cIdx = clients.findIndex((c) => c.id === clientId);
  if (cIdx >= 0) {
    clients[cIdx].notesCount = (clients[cIdx].notesCount || 0) + 1;
    clients[cIdx].updatedAt = new Date().toISOString();
    writeJsonFile("crm_clients.json", clients);
  }

  logCrmActivity(
    clientId,
    "note_added",
    `Internal Note Added (${category})`,
    content.slice(0, 100) + (content.length > 100 ? "..." : ""),
    staffUser
  );

  return newNote;
}

// ==================== ACTIVITY TIMELINE ====================

export function getActivitiesForClient(clientId: string): CrmActivity[] {
  const activities = readJsonFile<CrmActivity[]>("crm_activities.json", INITIAL_ACTIVITIES);
  return activities.filter((a) => a.clientContactId === clientId);
}

export function logCrmActivity(
  clientId: string,
  eventType: any,
  title: string,
  description: string,
  staffUser?: { id: string; fullName: string },
  metadata?: Record<string, any>
): CrmActivity {
  const activities = readJsonFile<CrmActivity[]>("crm_activities.json", INITIAL_ACTIVITIES);
  const newActivity: CrmActivity = {
    id: `act-${Date.now()}`,
    clientContactId: clientId,
    eventType,
    title,
    description,
    staffId: staffUser?.id,
    staffName: staffUser?.fullName,
    metadata,
    createdAt: new Date().toISOString(),
  };

  activities.unshift(newActivity);
  writeJsonFile("crm_activities.json", activities.slice(0, 500));
  return newActivity;
}

// ==================== CLIENT 360 COMPREHENSIVE BUNDLE ====================

export function getClient360(clientId: string) {
  const client = getClientById(clientId);
  if (!client) return null;

  const allBookings = getAllBookings();
  const bookings = allBookings.filter(
    (b) =>
      b.clientEmail.toLowerCase().trim() === client.email.toLowerCase().trim() ||
      (client.phone && b.clientPhone.replace(/[^0-9]/g, "") === client.phone.replace(/[^0-9]/g, ""))
  );

  const inquiries = getAllInquiries().filter(
    (i) => i.clientContactId === client.id || i.email.toLowerCase().trim() === client.email.toLowerCase().trim()
  );

  const tasks = getAllTasks({ clientId: client.id });
  const notes = getNotesForClient(client.id);
  const activities = getActivitiesForClient(client.id);

  return {
    client,
    bookings,
    inquiries,
    tasks,
    notes,
    activities,
  };
}
