import { BookingStatus, PaymentMethod, PaymentStatus } from "./index";

export type ClientStatus = "lead" | "active" | "vip" | "archived";

export interface ClientContact {
  id: string;
  clientReference: string; // e.g. "APV-CLI-1001"
  fullName: string;
  email: string;
  phone: string;
  countryCode: string; // e.g. "+91"
  locality?: string; // City / Country
  preferredChannel: "email" | "whatsapp" | "phone";
  source: "website_booking" | "contact_form" | "phone" | "walk_in" | "referral";
  status: ClientStatus;
  tags: string[];
  assignedStaffId?: string;
  assignedStaffName?: string;
  notesCount: number;
  totalBookings: number;
  totalSpentINR: number;
  totalSpentUSD: number;
  firstBookingDate?: string;
  lastBookingDate?: string;
  consentGiven: boolean;
  consentDate?: string;
  createdAt: string;
  updatedAt: string;
}

export type InquiryStage =
  | "new"
  | "contacted"
  | "follow_up"
  | "booked"
  | "closed_not_interested";

export type InquiryCategory =
  | "General Inquiry"
  | "Natural Vision Therapy"
  | "Digital Eye Strain"
  | "7-Day Residential Retreat"
  | "Booking Assistance"
  | "Other";

export interface CrmInquiry {
  id: string;
  reference: string; // e.g. "INQ-2026-0042"
  clientContactId?: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  category: InquiryCategory;
  message: string;
  source: "contact_form" | "phone" | "walk_in" | "referral";
  stage: InquiryStage;
  priority: "low" | "medium" | "high" | "urgent";
  assignedStaffId?: string;
  assignedStaffName?: string;
  linkedBookingId?: string;
  internalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TaskStatus = "pending" | "completed" | "cancelled";

export interface CrmTask {
  id: string;
  clientContactId?: string;
  clientName?: string;
  inquiryId?: string;
  bookingId?: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  dueDate: string; // YYYY-MM-DD
  status: TaskStatus;
  assignedStaffId: string;
  assignedStaffName: string;
  createdById: string;
  createdByName: string;
  createdAt: string;
  completedAt?: string;
}

export type NoteCategory = "general" | "call_log" | "preference" | "scheduling";

export interface CrmNote {
  id: string;
  clientContactId: string;
  authorStaffId: string;
  authorStaffName: string;
  authorStaffRole: string;
  content: string;
  category: NoteCategory;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ActivityEventType =
  | "client_created"
  | "inquiry_received"
  | "inquiry_stage_changed"
  | "booking_created"
  | "booking_confirmed"
  | "booking_cancelled"
  | "payment_recorded"
  | "note_added"
  | "task_created"
  | "task_completed"
  | "contact_updated"
  | "clients_merged";

export interface CrmActivity {
  id: string;
  clientContactId: string;
  eventType: ActivityEventType;
  title: string;
  description: string;
  staffId?: string;
  staffName?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface ProgrammeCohort {
  id: string;
  title: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  maxCapacity: number;
  enrolledCount: number;
  status: "upcoming" | "in_progress" | "completed" | "cancelled";
}

export interface Programme {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  durationLabel: string; // e.g. "7 Days / 6 Nights"
  durationDays: number;
  dailySessionMinutes: number; // e.g. 180
  format: "group" | "individual";
  delivery: "onsite" | "online" | "hybrid";
  priceINR: number;
  priceUSD: number;
  leadFacilitatorIds: string[];
  location: string;
  maxCapacity: number;
  imageUrl: string;
  itinerary: {
    day: number;
    title: string;
    description: string;
  }[];
  inclusions: string[];
  preparationGuidelines: string[];
  cohorts: ProgrammeCohort[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MediaAsset {
  id: string;
  fileName: string;
  originalName: string;
  publicUrl: string;
  fileSizeBytes: number;
  mimeType: string;
  dimensions?: {
    width: number;
    height: number;
  };
  altText: string;
  uploadedByStaffId: string;
  uploadedByStaffName: string;
  createdAt: string;
}

export interface CmsRevision {
  id: string;
  sectionKey: string;
  title: string;
  snapshotJson: Record<string, any>;
  authorStaffId: string;
  authorStaffName: string;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  staffId: string;
  staffEmail: string;
  staffName: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: Record<string, any>;
  timestamp: string;
}
