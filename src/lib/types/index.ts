export type OfferingFormat = 'individual' | 'group';
export type OfferingDelivery = 'online' | 'onsite' | 'hybrid';
export type OfferingCategory = 'eye-yoga' | 'stress-relief' | 'specialized-therapy' | 'vision-skills' | 'programmes';

export interface PriceConfig {
  inr: number;
  usd: number;
  taxInclusive: boolean;
}

export interface Offering {
  id: string;
  slug: string;
  title: string;
  category: OfferingCategory;
  shortDescription: string;
  fullDescription: string;
  durationMinutes: number;
  format: OfferingFormat;
  delivery: OfferingDelivery;
  price: PriceConfig;
  assignedTherapistIds: string[];
  maxCapacity: number;
  isFlagshipProgramme: boolean;
  featured: boolean;
  suitableFor: string[];
  whatToExpect: string[];
  programmeSyllabus?: {
    stepNumber: number;
    title: string;
    description: string;
  }[];
  imageUrl: string;
  isPublished: boolean;
}

export interface Therapist {
  id: string;
  slug: string;
  displayName: string;
  roleTitle: string;
  bio: string;
  specialties: string[];
  qualifications: string;
  photoUrl: string;
  assignedOfferingIds: string[];
  email: string;
  phone: string;
  isPublished: boolean;
  isArchived?: boolean;
  status?: 'active' | 'archived';
}

export interface RecurringScheduleDay {
  dayOfWeek: number; // 0=Sun, 1=Mon, ..., 6=Sat
  dayName: string;
  active: boolean;
  slots: {
    startTime: string; // e.g. "09:00"
    endTime: string;   // e.g. "13:00"
  }[];
  slotDurationMinutes: number;
  bufferMinutes: number;
}

export interface LeaveException {
  id: string;
  therapistId: string;
  date: string; // YYYY-MM-DD
  reason: string;
  allDay: boolean;
}

export type IntakeFieldType = 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'number' | 'phone' | 'email';

export interface IntakeField {
  id: string;
  fieldKey: string;
  label: string;
  fieldType: IntakeFieldType;
  placeholder?: string;
  helpText?: string;
  options?: string[]; // for select/radio/checkbox
  isRequired: boolean;
  displayOrder: number;
  onlyVisibleToTherapist?: boolean;
}

export interface IntakeTemplate {
  id: string;
  offeringId: string;
  version: number;
  fields: IntakeField[];
  isPublished: boolean;
}

export type BookingStatus =
  | 'draft'
  | 'awaiting_online_payment'
  | 'pending_approval'
  | 'pending_offline_confirmation'
  | 'confirmed'
  | 'cancelled'
  | 'completed'
  | 'needs_review';

export type PaymentMethod =
  | 'online_razorpay'
  | 'online_paypal'
  | 'offline_cash'
  | 'offline_bank_transfer';

export type PaymentStatus =
  | 'not_started'
  | 'pending'
  | 'paid'
  | 'captured'
  | 'failed'
  | 'refunded'
  | 'offline_confirmed';

export interface Booking {
  id: string;
  bookingReference: string; // e.g. "APV-2026-X8Y2K"
  offeringId: string;
  offeringTitle: string;
  therapistId: string;
  therapistName: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // "10:00 AM - 11:00 AM"
  clientTimezone: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  seatsBooked: number;
  currency: 'INR' | 'USD';
  totalAmount: number;
  status: BookingStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  intakeAnswers: Record<string, any>;
  offlineConfirmedByStaff?: string;
  offlineConfirmedAt?: string;
  invoiceIssued: boolean;
  invoiceNumber?: string;
  createdAt: string;
}

export interface PaymentTransaction {
  id: string;
  bookingId: string;
  gateway: 'razorpay' | 'paypal' | 'offline';
  gatewayPaymentId?: string;
  gatewayOrderId?: string;
  amount: number;
  currency: 'INR' | 'USD';
  status: 'pending' | 'captured' | 'failed' | 'refunded';
  rawResponse?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceRecord {
  id: string;
  bookingId: string;
  invoiceNumber: string;
  totalAmount: number;
  currency: 'INR' | 'USD';
  status: 'paid' | 'pending' | 'cancelled';
  pdfStoragePath?: string;
  issuedAt: string;
  createdAt: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  readTime: string;
  publishedDate: string;
  authorName: string;
  coverImage: string;
  isPublished: boolean;
}

export type StaffRole = 'super_admin' | 'admin' | 'therapist';

export interface StaffUser {
  id: string;
  email: string;
  fullName: string;
  role: "super_admin" | "admin" | "therapist";
  therapistId?: string;
  phone?: string;
  passwordHash: string;
  salt: string;
  isActive: boolean;
  status?: "active" | "invited" | "suspended";
  invitationToken?: string;
  invitationSentAt?: string;
  invitationExpiresAt?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HeroCarouselSlide {
  id: string;
  title: string;
  badge: string;
  subtitle: string;
  imageUrl: string;
  linkUrl: string;
  linkText: string;
  order: number;
  active: boolean;
}

export interface SiteContent {
  heroHeadline: string;
  heroSubtitle: string;
  heroImageUrl: string;
  heroCarouselSlides?: HeroCarouselSlide[];
  primaryCtaText: string;
  primaryCtaLink: string;
  aboutHeading: string;
  aboutSummary: string;
  phone: string;
  contactPhone?: string;
  contactPhoneSecondary?: string;
  contactWhatsApp?: string;
  email: string;
  contactEmail?: string;
  address: string;
  physicalAddress?: string;
  whatsappLink: string;
  openingHours: string;
  heroCtaLabel?: string;
  heroSecondaryCtaLabel?: string;
  secondaryCtaLink?: string;
  updatedAt: string;
}

export * from './crm';
export * from './emr';
