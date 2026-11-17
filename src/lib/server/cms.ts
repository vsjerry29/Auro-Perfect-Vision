import fs from "fs";
import path from "path";
import {
  Offering,
  Therapist,
  BlogPost,
  RecurringScheduleDay,
  LeaveException,
  IntakeTemplate,
  Booking,
  Programme,
  MediaAsset,
  CmsRevision,
  AuditLogEntry,
} from "@/lib/types";
import {
  INITIAL_OFFERINGS,
  INITIAL_THERAPISTS,
  DEFAULT_WEEKLY_SCHEDULE,
  INITIAL_LEAVE_EXCEPTIONS,
  INITIAL_INTAKE_TEMPLATES,
  INITIAL_BOOKINGS,
  INITIAL_BLOGS,
} from "@/lib/demo-data";

const DATA_DIR = path.join(process.cwd(), "data", "cms");

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function getFilePath(filename: string): string {
  ensureDir();
  return path.join(DATA_DIR, filename);
}

function readJsonFile<T>(filename: string, defaultData: T): T {
  const file = getFilePath(filename);
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify(defaultData, null, 2), "utf-8");
    return defaultData;
  }
  try {
    const raw = fs.readFileSync(file, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading ${filename}:`, err);
    return defaultData;
  }
}

function writeJsonFile<T>(filename: string, data: T): void {
  const file = getFilePath(filename);
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf-8");
}

export interface SiteContent {
  heroHeadline: string;
  heroSubtitle: string;
  heroImageUrl: string;
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
  updatedAt: string;
}

const DEFAULT_SITE_CONTENT: SiteContent = {
  heroHeadline: "A more mindful approach to natural vision.",
  heroSubtitle:
    "Experience holistic ocular restoration amidst the serene forests of Auroville. Combining classical Eye Yoga, conscious relaxation, photobiomodulation, and digital screen recovery for children and adults worldwide.",
  heroImageUrl:
    "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1200&q=80",
  primaryCtaText: "Explore Therapies & Book",
  primaryCtaLink: "/therapies",
  aboutHeading: "Nurturing sight as a conscious, living sense.",
  aboutSummary:
    "Auro Perfect Vision was established in Auroville with a simple yet profound conviction: the eyes are dynamic organs capable of relaxation, flexibility, and sustained comfort when given mindful care.",
  phone: "+91 98765 43210",
  email: "connect@auroperfectvision.com",
  address: "Auroville, Tamil Nadu 605101, India",
  whatsappLink: "https://wa.me/919876543210",
  openingHours: "Monday - Saturday: 9:00 AM - 5:30 PM IST (Closed Sundays)",
  updatedAt: new Date().toISOString(),
};

// ==================== OFFERINGS ====================

export function getAllOfferings(includeDrafts = true): Offering[] {
  const offerings = readJsonFile<Offering[]>("offerings.json", INITIAL_OFFERINGS);
  if (includeDrafts) return offerings;
  return offerings.filter((o) => o.isPublished);
}

export function getOfferingBySlug(slug: string): Offering | undefined {
  const offerings = getAllOfferings(true);
  const found = offerings.find((o) => o.slug === slug);
  if (found) return found;

  // Resilient slug aliases for legacy/descriptive links
  const slugAliases: Record<string, string> = {
    "eye-yoga-children-adults": "eye-yoga",
    "vision-stress-relief-therapy": "vision-stress-relief",
    "dry-eye-photobiomodulation": "dry-eye-red-light-therapy",
    "residential-retreat": "retreat-holistic-vision-awakening",
  };

  const targetSlug = slugAliases[slug];
  if (targetSlug) {
    return offerings.find((o) => o.slug === targetSlug);
  }
  return undefined;
}

export function saveOffering(offeringData: Partial<Offering> & { title: string }): Offering {
  const offerings = getAllOfferings(true);
  const now = new Date().toISOString();

  if (offeringData.id) {
    // Update existing
    const idx = offerings.findIndex((o) => o.id === offeringData.id);
    if (idx >= 0) {
      const existing = offerings[idx];
      const updated: Offering = {
        ...existing,
        ...offeringData,
      };
      offerings[idx] = updated;
      writeJsonFile("offerings.json", offerings);
      return updated;
    }
  }

  // Create new
  const id = `off-${Date.now()}`;
  const baseSlug = offeringData.slug || offeringData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  let slug = baseSlug;
  let counter = 1;
  while (offerings.some((o) => o.slug === slug)) {
    slug = `${baseSlug}-${counter++}`;
  }

  const newOffering: Offering = {
    id,
    slug,
    title: offeringData.title,
    category: offeringData.category || "eye-yoga",
    shortDescription: offeringData.shortDescription || "",
    fullDescription: offeringData.fullDescription || offeringData.shortDescription || "",
    durationMinutes: offeringData.durationMinutes || 60,
    format: offeringData.format || "individual",
    delivery: offeringData.delivery || "onsite",
    price: offeringData.price || { inr: 2000, usd: 40, taxInclusive: true },
    assignedTherapistIds: offeringData.assignedTherapistIds || ["therapist-1"],
    maxCapacity: offeringData.maxCapacity || 1,
    isFlagshipProgramme: Boolean(offeringData.isFlagshipProgramme),
    featured: Boolean(offeringData.featured),
    suitableFor: offeringData.suitableFor || ["General eye strain relief"],
    whatToExpect: offeringData.whatToExpect || ["Guided ocular relaxation"],
    programmeSyllabus: offeringData.programmeSyllabus || [],
    imageUrl:
      offeringData.imageUrl ||
      "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1200&q=80",
    isPublished: offeringData.isPublished !== undefined ? offeringData.isPublished : false,
  };

  offerings.push(newOffering);
  writeJsonFile("offerings.json", offerings);
  return newOffering;
}

export function duplicateOffering(id: string): Offering | null {
  const offerings = getAllOfferings(true);
  const target = offerings.find((o) => o.id === id);
  if (!target) return null;

  const duplicated = {
    ...target,
    id: `off-${Date.now()}`,
    title: `${target.title} (Draft Copy)`,
    slug: `${target.slug}-copy-${Date.now().toString().slice(-4)}`,
    isPublished: false, // duplicates start as draft
    featured: false,
  };

  offerings.push(duplicated);
  writeJsonFile("offerings.json", offerings);
  return duplicated;
}

export function deleteOffering(id: string): boolean {
  const offerings = getAllOfferings(true);
  const filtered = offerings.filter((o) => o.id !== id);
  if (filtered.length !== offerings.length) {
    writeJsonFile("offerings.json", filtered);
    return true;
  }
  return false;
}

// ==================== THERAPISTS ====================

export function getAllTherapists(includeUnpublished = true): Therapist[] {
  const therapists = readJsonFile<Therapist[]>("therapists.json", INITIAL_THERAPISTS);
  if (includeUnpublished) return therapists;
  return therapists.filter((t) => t.isPublished);
}

export function getTherapistById(id: string): Therapist | undefined {
  const therapists = getAllTherapists(true);
  return therapists.find((t) => t.id === id);
}

export function saveTherapist(therapistData: Partial<Therapist> & { displayName: string }): Therapist {
  const therapists = getAllTherapists(true);

  if (therapistData.id) {
    const idx = therapists.findIndex((t) => t.id === therapistData.id);
    if (idx >= 0) {
      const updated: Therapist = {
        ...therapists[idx],
        ...therapistData,
      };
      therapists[idx] = updated;
      writeJsonFile("therapists.json", therapists);
      return updated;
    }
  }

  const id = `therapist-${Date.now()}`;
  const slug = therapistData.slug || therapistData.displayName.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  const newTherapist: Therapist = {
    id,
    slug,
    displayName: therapistData.displayName,
    roleTitle: therapistData.roleTitle || "Vision Wellness Guide",
    bio: therapistData.bio || "",
    specialties: therapistData.specialties || ["Eye Yoga"],
    qualifications: therapistData.qualifications || "Holistic Vision Specialist",
    photoUrl:
      therapistData.photoUrl ||
      "https://images.unsplash.com/photo-1594824813583-8a07f7b243b6?auto=format&fit=crop&w=800&q=80",
    assignedOfferingIds: therapistData.assignedOfferingIds || [],
    email: therapistData.email || "practitioner@auroperfectvision.com",
    phone: therapistData.phone || "+91 98765 43210",
    isPublished: therapistData.isPublished !== undefined ? therapistData.isPublished : true,
  };

  therapists.push(newTherapist);
  writeJsonFile("therapists.json", therapists);
  return newTherapist;
}

// ==================== BLOGS ====================

export function getAllBlogPosts(includeDrafts = true): BlogPost[] {
  const blogs = readJsonFile<BlogPost[]>("blog_posts.json", INITIAL_BLOGS);
  if (includeDrafts) return blogs;
  return blogs.filter((b) => b.isPublished);
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  const blogs = getAllBlogPosts(true);
  return blogs.find((b) => b.slug === slug);
}

export function saveBlogPost(postData: Partial<BlogPost> & { title: string }): BlogPost {
  const blogs = getAllBlogPosts(true);

  if (postData.id) {
    const idx = blogs.findIndex((b) => b.id === postData.id);
    if (idx >= 0) {
      const updated: BlogPost = {
        ...blogs[idx],
        ...postData,
      };
      blogs[idx] = updated;
      writeJsonFile("blog_posts.json", blogs);
      return updated;
    }
  }

  const id = `blog-${Date.now()}`;
  const baseSlug = postData.slug || postData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  let slug = baseSlug;
  let counter = 1;
  while (blogs.some((b) => b.slug === slug)) {
    slug = `${baseSlug}-${counter++}`;
  }

  const newPost: BlogPost = {
    id,
    slug,
    title: postData.title,
    excerpt: postData.excerpt || "",
    content: postData.content || "",
    category: postData.category || "Ocular Wellness",
    readTime: postData.readTime || "5 min read",
    publishedDate: postData.publishedDate || "November 2026",
    authorName: postData.authorName || "Auro Perfect Vision Team",
    coverImage:
      postData.coverImage ||
      "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80",
    isPublished: postData.isPublished !== undefined ? postData.isPublished : false,
  };

  blogs.push(newPost);
  writeJsonFile("blog_posts.json", blogs);
  return newPost;
}

// ==================== SITE CONTENT ====================

export function getSiteContent(): SiteContent {
  return readJsonFile<SiteContent>("site_content.json", DEFAULT_SITE_CONTENT);
}

export function saveSiteContent(data: Partial<SiteContent>): SiteContent {
  const current = getSiteContent();
  const updated: SiteContent = {
    ...current,
    ...data,
    updatedAt: new Date().toISOString(),
  };
  writeJsonFile("site_content.json", updated);
  return updated;
}

// ==================== INTAKE TEMPLATES ====================

export function getIntakeTemplates(): IntakeTemplate[] {
  return readJsonFile<IntakeTemplate[]>("intake_templates.json", INITIAL_INTAKE_TEMPLATES);
}

export function getIntakeTemplateForOffering(offeringId: string): IntakeTemplate {
  const templates = getIntakeTemplates();
  const found = templates.find((t) => t.offeringId === offeringId);
  if (found) return found;

  return {
    id: `tpl-${offeringId}`,
    offeringId,
    version: 1,
    isPublished: true,
    fields: [
      {
        id: "f-std-1",
        fieldKey: "client_age",
        label: "Age of Participant",
        fieldType: "number",
        placeholder: "e.g. 28",
        isRequired: true,
        displayOrder: 1,
      },
      {
        id: "f-std-2",
        fieldKey: "primary_eye_concern",
        label: "Primary Vision Concern or Eye Condition",
        fieldType: "select",
        options: [
          "Screen Strain & Digital Fatigue",
          "Dry, Gritty or Burning Eyes",
          "General Vision Wellness & Relaxation",
          "Other",
        ],
        isRequired: true,
        displayOrder: 2,
      },
      {
        id: "f-std-3",
        fieldKey: "medical_history_notes",
        label: "Any eye surgery, trauma, or specific practitioner notes?",
        fieldType: "textarea",
        placeholder: "e.g. Contact lens user, no prior surgeries",
        isRequired: false,
        displayOrder: 3,
      },
    ],
  };
}

export function saveIntakeTemplate(offeringId: string, fields: any[]): IntakeTemplate {
  const templates = getIntakeTemplates();
  const idx = templates.findIndex((t) => t.offeringId === offeringId);
  if (idx >= 0) {
    const updated: IntakeTemplate = {
      ...templates[idx],
      version: templates[idx].version + 1,
      fields,
    };
    templates[idx] = updated;
    writeJsonFile("intake_templates.json", templates);
    return updated;
  }

  const newTemplate: IntakeTemplate = {
    id: `tpl-${Date.now()}`,
    offeringId,
    version: 1,
    isPublished: true,
    fields,
  };
  templates.push(newTemplate);
  writeJsonFile("intake_templates.json", templates);
  return newTemplate;
}

// ==================== BOOKINGS ====================

export function getAllBookings(): Booking[] {
  return readJsonFile<Booking[]>("bookings.json", INITIAL_BOOKINGS);
}

export function getBookingByRef(ref: string): Booking | undefined {
  const bookings = getAllBookings();
  return bookings.find((b) => b.bookingReference.toLowerCase() === ref.toLowerCase());
}

export function saveBooking(booking: Booking): Booking {
  const bookings = getAllBookings();
  const idx = bookings.findIndex((b) => b.id === booking.id);
  if (idx >= 0) {
    bookings[idx] = booking;
  } else {
    bookings.unshift(booking);
  }
  writeJsonFile("bookings.json", bookings);
  return booking;
}

export function markBookingPaid(bookingId: string, confirmedByStaffName: string): Booking | null {
  const bookings = getAllBookings();
  const idx = bookings.findIndex((b) => b.id === bookingId);
  if (idx < 0) return null;

  const target = bookings[idx];
  const seqNumber = (bookings.length + 1).toString().padStart(4, "0");
  const invoiceNumber = target.invoiceNumber || `APV-2026-${seqNumber}`;

  const updated: Booking = {
    ...target,
    status: "confirmed",
    paymentStatus: "offline_confirmed",
    offlineConfirmedByStaff: confirmedByStaffName,
    offlineConfirmedAt: new Date().toISOString(),
    invoiceIssued: true,
    invoiceNumber,
  };

  bookings[idx] = updated;
  writeJsonFile("bookings.json", bookings);
  return updated;
}

// ==================== THERAPIST SCHEDULE & LEAVE ====================

export function getWeeklySchedule(): RecurringScheduleDay[] {
  return readJsonFile<RecurringScheduleDay[]>("weekly_schedule.json", DEFAULT_WEEKLY_SCHEDULE);
}

export function saveWeeklySchedule(schedule: RecurringScheduleDay[]): void {
  writeJsonFile("weekly_schedule.json", schedule);
}

export function getLeaveExceptions(): LeaveException[] {
  return readJsonFile<LeaveException[]>("leave_exceptions.json", INITIAL_LEAVE_EXCEPTIONS);
}

export function addLeaveException(date: string, reason: string, therapistId = "therapist-1"): LeaveException {
  const leaves = getLeaveExceptions();
  const newLeave: LeaveException = {
    id: `leave-${Date.now()}`,
    therapistId,
    date,
    reason: reason || "Scheduled Leave",
    allDay: true,
  };
  leaves.push(newLeave);
  writeJsonFile("leave_exceptions.json", leaves);
  return newLeave;
}

export function removeLeaveException(id: string): void {
  const leaves = getLeaveExceptions();
  const filtered = leaves.filter((l) => l.id !== id);
  writeJsonFile("leave_exceptions.json", filtered);
}

// ==================== PROGRAMMES (Flagship Multi-Day Retreats) ====================

const INITIAL_PROGRAMMES: Programme[] = [
  {
    id: "prog-1",
    slug: "auroville-7-day-mindful-vision-immersion",
    title: "Auroville 7-Day Mindful Vision Immersion Retreat",
    shortDescription:
      "A transformative residential retreat in Auroville. Daily Bates method sessions, ocular photobiomodulation, conscious breathing, and digital detox.",
    fullDescription:
      "Immerse yourself in seven days of focused ocular restoration amidst the serene forests of Auroville. This comprehensive programme is designed for individuals seeking to cultivate sustainable vision habits, dissolve chronic screen fatigue, and establish lifelong natural eye care practices under dedicated educator guidance.",
    durationLabel: "7 Days / 6 Nights",
    durationDays: 7,
    dailySessionMinutes: 180,
    format: "group",
    delivery: "onsite",
    priceINR: 28000,
    priceUSD: 420,
    leadFacilitatorIds: ["therapist-1", "therapist-2"],
    location: "Auro Perfect Vision Centre & Forest Pavilion, Auroville",
    maxCapacity: 12,
    imageUrl:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80",
    itinerary: [
      { day: 1, title: "Arrival & Individual Ocular Assessment", description: "Orientation, baseline eye ease evaluation, and evening conscious relaxation circle." },
      { day: 2, title: "Foundations of Palming & Shifting", description: "Deep dive into Bates palming techniques, saccadic movement, and natural blinking rhythm." },
      { day: 3, title: "Photobiomodulation & Sunning Rituals", description: "Controlled solar exposure, full-spectrum daylight therapy, and contrast baths." },
      { day: 4, title: "Peripheral Vision in Nature", description: "Forest walking meditation expanding visual fields and reducing central retinal fixation strain." },
      { day: 5, title: "Digital Fatigue Reversal & Breathwork", description: "Pranayama for ocular microcirculation, screen ergonomics, and blue light recovery." },
      { day: 6, title: "Movement, Accommodation & Near-Far Shifting", description: "Dynamic eye yoga drills, fusion charts, and relaxed accommodation games." },
      { day: 7, title: "Home Practice Blueprint & Closing Circle", description: "Personalized home routine design, follow-up schedule, and certificate of completion." },
    ],
    inclusions: [
      "7 Days / 6 Nights peaceful Auroville guest house accommodation",
      "All daily organic, eye-nourishing vegetarian meals and herbal infusions",
      "Daily 3-hour guided clinical eye yoga & therapy workshops",
      "Full photobiomodulation sessions and sunning practice",
      "Personalized Home Vision Practice Kit & manual",
      "1-on-1 progress reviews with Dr. Ananya Sen and educators",
    ],
    preparationGuidelines: [
      "Bring current glasses and recent prescription records",
      "Comfortable loose clothing suitable for gentle floor yoga",
      "Hat and water bottle for morning forest walking sessions",
      "Commitment to digital device reduction during retreat hours",
    ],
    cohorts: [
      {
        id: "cohort-nov-2026",
        title: "Late Autumn Cohort (Nov 2026)",
        startDate: "2026-11-24",
        endDate: "2026-11-30",
        maxCapacity: 12,
        enrolledCount: 8,
        status: "upcoming",
      },
      {
        id: "cohort-dec-2026",
        title: "Solstice Immersive Cohort (Dec 2026)",
        startDate: "2026-12-15",
        endDate: "2026-12-21",
        maxCapacity: 12,
        enrolledCount: 4,
        status: "upcoming",
      },
    ],
    isPublished: true,
    createdAt: "2026-11-01T10:00:00Z",
    updatedAt: "2026-11-17T12:00:00Z",
  },
];

export function getAllProgrammes(includeDrafts = true): Programme[] {
  const programmes = readJsonFile<Programme[]>("programmes.json", INITIAL_PROGRAMMES);
  if (includeDrafts) return programmes;
  return programmes.filter((p) => p.isPublished);
}

export function getProgrammeBySlug(slug: string): Programme | undefined {
  const programmes = getAllProgrammes(true);
  return programmes.find((p) => p.slug === slug);
}

export function saveProgramme(data: Partial<Programme> & { title: string }): Programme {
  const programmes = getAllProgrammes(true);

  if (data.id) {
    const idx = programmes.findIndex((p) => p.id === data.id);
    if (idx >= 0) {
      const updated: Programme = {
        ...programmes[idx],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      programmes[idx] = updated;
      writeJsonFile("programmes.json", programmes);
      return updated;
    }
  }

  const id = `prog-${Date.now()}`;
  const baseSlug = data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  let slug = baseSlug;
  let counter = 1;
  while (programmes.some((p) => p.slug === slug)) {
    slug = `${baseSlug}-${counter++}`;
  }

  const newProgramme: Programme = {
    id,
    slug,
    title: data.title,
    shortDescription: data.shortDescription || "",
    fullDescription: data.fullDescription || "",
    durationLabel: data.durationLabel || "7 Days / 6 Nights",
    durationDays: data.durationDays || 7,
    dailySessionMinutes: data.dailySessionMinutes || 180,
    format: data.format || "group",
    delivery: data.delivery || "onsite",
    priceINR: data.priceINR || 28000,
    priceUSD: data.priceUSD || 420,
    leadFacilitatorIds: data.leadFacilitatorIds || ["therapist-1"],
    location: data.location || "Auro Perfect Vision Centre, Auroville",
    maxCapacity: data.maxCapacity || 12,
    imageUrl:
      data.imageUrl ||
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80",
    itinerary: data.itinerary || [],
    inclusions: data.inclusions || [],
    preparationGuidelines: data.preparationGuidelines || [],
    cohorts: data.cohorts || [],
    isPublished: data.isPublished !== undefined ? data.isPublished : false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  programmes.push(newProgramme);
  writeJsonFile("programmes.json", programmes);
  return newProgramme;
}

export function duplicateProgramme(id: string): Programme | null {
  const programmes = getAllProgrammes(true);
  const target = programmes.find((p) => p.id === id);
  if (!target) return null;

  const duplicated = saveProgramme({
    ...target,
    id: undefined,
    slug: `${target.slug}-copy`,
    title: `${target.title} (Cohort Copy)`,
    isPublished: false,
  });
  return duplicated;
}

export function deleteProgramme(id: string): boolean {
  const programmes = getAllProgrammes(true);
  const filtered = programmes.filter((p) => p.id !== id);
  writeJsonFile("programmes.json", filtered);
  return true;
}

// ==================== MEDIA LIBRARY ====================

export function getAllMediaAssets(): MediaAsset[] {
  return readJsonFile<MediaAsset[]>("media_assets.json", [
    {
      id: "media-1",
      fileName: "palming-practice.webp",
      originalName: "natural_palming_auroville.webp",
      publicUrl: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1200&q=80",
      fileSizeBytes: 245000,
      mimeType: "image/webp",
      altText: "Participant practicing yogic palming in natural light",
      uploadedByStaffId: "staff-admin-1",
      uploadedByStaffName: "Dr. Sivakumar",
      createdAt: "2026-11-01T10:00:00Z",
    },
    {
      id: "media-2",
      fileName: "forest-retreat.webp",
      originalName: "auroville_forest_sanctuary.webp",
      publicUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1000&q=80",
      fileSizeBytes: 310000,
      mimeType: "image/webp",
      altText: "Auroville tranquil forest sanctuary surroundings",
      uploadedByStaffId: "staff-admin-1",
      uploadedByStaffName: "Dr. Sivakumar",
      createdAt: "2026-11-05T12:00:00Z",
    },
  ]);
}

export function saveMediaAsset(asset: Omit<MediaAsset, "id" | "createdAt">): MediaAsset {
  const assets = getAllMediaAssets();
  const newAsset: MediaAsset = {
    ...asset,
    id: `media-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  assets.unshift(newAsset);
  writeJsonFile("media_assets.json", assets);
  return newAsset;
}

export function deleteMediaAsset(id: string): boolean {
  const assets = getAllMediaAssets();
  const filtered = assets.filter((a) => a.id !== id);
  writeJsonFile("media_assets.json", filtered);
  return true;
}

// ==================== CMS REVISIONS & ROLLBACK ====================

export function getCmsRevisions(sectionKey = "global_settings"): CmsRevision[] {
  const revisions = readJsonFile<CmsRevision[]>("cms_revisions.json", []);
  return revisions.filter((r) => r.sectionKey === sectionKey);
}

export function createCmsRevision(
  sectionKey: string,
  title: string,
  snapshot: Record<string, any>,
  staffUser: { id: string; fullName: string }
): CmsRevision {
  const revisions = readJsonFile<CmsRevision[]>("cms_revisions.json", []);
  const newRevision: CmsRevision = {
    id: `rev-${Date.now()}`,
    sectionKey,
    title,
    snapshotJson: snapshot,
    authorStaffId: staffUser.id,
    authorStaffName: staffUser.fullName,
    createdAt: new Date().toISOString(),
  };
  revisions.unshift(newRevision);
  writeJsonFile("cms_revisions.json", revisions.slice(0, 50)); // retain last 50 revisions
  return newRevision;
}

export function rollbackCmsRevision(revisionId: string): boolean {
  const revisions = readJsonFile<CmsRevision[]>("cms_revisions.json", []);
  const target = revisions.find((r) => r.id === revisionId);
  if (!target) return false;

  if (target.sectionKey === "global_settings") {
    saveSiteContent(target.snapshotJson as Partial<SiteContent>);
    return true;
  }
  return false;
}

// ==================== AUDIT LOGS ====================

export function getAuditLogs(): AuditLogEntry[] {
  return readJsonFile<AuditLogEntry[]>("audit_logs.json", [
    {
      id: "audit-init",
      staffId: "staff-admin-1",
      staffEmail: "admin@auroperfectvision.com",
      staffName: "Dr. Sivakumar (Admin)",
      action: "SYSTEM_INITIALIZED",
      entityType: "System",
      entityId: "system-init",
      details: { note: "Auro Perfect Vision Secure CMS Initialized" },
      timestamp: new Date().toISOString(),
    },
  ]);
}

export function logAuditEvent(entry: Omit<AuditLogEntry, "id" | "timestamp">): AuditLogEntry {
  const logs = getAuditLogs();
  const newEntry: AuditLogEntry = {
    ...entry,
    id: `audit-${Date.now()}`,
    timestamp: new Date().toISOString(),
  };
  logs.unshift(newEntry);
  writeJsonFile("audit_logs.json", logs.slice(0, 200)); // retain last 200 log entries
  return newEntry;
}
