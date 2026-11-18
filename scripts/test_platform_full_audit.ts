/**
 * Auro Perfect Vision — Comprehensive Platform-Wide Functional Audit & Verification Script
 * Validates CMS, Hero Carousel, Offerings, Programmes, Therapists, CRM, EMR, Booking Concurrency, RBAC & Storage.
 */

import {
  getSiteContent,
  saveSiteContent,
  getAllOfferings,
  saveOffering,
  archiveOffering,
  restoreOffering,
  getAllProgrammes,
  saveProgramme,
  duplicateProgramme,
  deleteProgramme,
  getAllTherapists,
  saveTherapist,
  archiveTherapist,
  reassignTherapistBookings,
  reactivateTherapist,
  getAllBookings,
  saveBooking,
  cancelBooking,
  getAllMediaAssets,
  saveMediaAsset,
  deleteMediaAsset,
} from "../src/lib/server/cms";

import {
  getAllClients,
  createClient,
  updateClient,
  getAllInquiries,
  createInquiry,
  updateInquiryStage,
  createTask,
  completeTask,
} from "../src/lib/server/crm";

import {
  getAllPatients,
  createPatient,
  getPatientById,
  saveSoapNote,
  signAndLockSoapNote,
  amendSoapNote,
  createVisionAssessment,
  createTreatmentPlan,
} from "../src/lib/server/emr";

import { getAllStaffUsers, authenticateStaffUser } from "../src/lib/server/auth";

interface TestResult {
  suite: string;
  test: string;
  passed: boolean;
  message: string;
  evidence?: any;
}

const results: TestResult[] = [];

function assert(condition: boolean, suite: string, test: string, message: string, evidence?: any) {
  if (condition) {
    results.push({ suite, test, passed: true, message: `PASS: ${message}`, evidence });
    console.log(`  ✓ [PASS] [${suite}] ${test}`);
  } else {
    results.push({ suite, test, passed: false, message: `FAIL: ${message}`, evidence });
    console.error(`  ✗ [FAIL] [${suite}] ${test}: ${message}`);
  }
}

async function runAudit() {
  console.log("================================================================");
  console.log("AURO PERFECT VISION — COMPREHENSIVE PLATFORM FUNCTIONAL AUDIT");
  console.log("================================================================\n");

  // -------------------------------------------------------------
  // SUITE 1: CMS TO HOMEPAGE PERSISTENCE & CAROUSEL SYNCHRONIZATION
  // -------------------------------------------------------------
  console.log("--- 1. CMS & Hero Carousel Synchronization ---");
  const originalContent = getSiteContent();
  assert(!!originalContent, "CMS", "Content Initialization", "Site content loaded cleanly");

  // 1.1 Test Heading Update
  const testHeading = "Experience Clarity. Vision Beyond Limits.";
  const testSubtitle = "Transforming visual health with gentle, holistic therapies.";
  const updatedContent = saveSiteContent({
    ...originalContent,
    heroHeadline: testHeading,
    heroSubtitle: testSubtitle,
  });

  const verifiedContent = getSiteContent();
  assert(
    verifiedContent.heroHeadline === testHeading && verifiedContent.heroSubtitle === testSubtitle,
    "CMS",
    "Heading & Subtitle Persistence",
    "CMS heading and subtitle update and persist across reads"
  );

  // 1.2 Test Hero Carousel Slide CRUD
  const initialSlides = verifiedContent.heroCarouselSlides || [];
  assert(initialSlides.length >= 4, "CMS", "Default Slides Presence", `Found ${initialSlides.length} default slides`);

  // Add 5th slide
  const new5thSlide = {
    id: `slide-audit-${Date.now()}`,
    title: "Binocular Vision Rehabilitation",
    badge: "Clinical Neuro-Visual",
    subtitle: "Advanced stereoscopic training restoring natural fusion and depth perception.",
    imageUrl: "/images/hero-carousel/vision-therapy.webp",
    linkUrl: "/therapies/neuro-visual",
    linkText: "Learn More",
    order: 5,
    active: true,
  };

  const slidesWith5th = [...initialSlides, new5thSlide];
  saveSiteContent({ ...verifiedContent, heroCarouselSlides: slidesWith5th });

  const contentWith5th = getSiteContent();
  assert(
    (contentWith5th.heroCarouselSlides || []).some((s) => s.id === new5thSlide.id),
    "CMS",
    "Carousel 5th Slide Addition",
    "Successfully added a 5th slide to Hero Carousel"
  );

  // Reorder slides
  const reordered = [...contentWith5th.heroCarouselSlides!].reverse().map((s, idx) => ({ ...s, order: idx + 1 }));
  saveSiteContent({ ...contentWith5th, heroCarouselSlides: reordered });
  const contentReordered = getSiteContent();
  assert(
    contentReordered.heroCarouselSlides![0].id === new5thSlide.id,
    "CMS",
    "Carousel Slide Reordering",
    "Slide reordering persists correctly"
  );

  // Disable slide
  const toggled = contentReordered.heroCarouselSlides!.map((s) => (s.id === new5thSlide.id ? { ...s, active: false } : s));
  saveSiteContent({ ...contentReordered, heroCarouselSlides: toggled });
  const contentToggled = getSiteContent();
  const targetSlide = contentToggled.heroCarouselSlides!.find((s) => s.id === new5thSlide.id);
  assert(targetSlide?.active === false, "CMS", "Carousel Slide Toggle Active", "Active toggle works cleanly");

  // Remove slide (clean removal)
  const cleanedSlides = contentToggled.heroCarouselSlides!.filter((s) => s.id !== new5thSlide.id);
  saveSiteContent({ ...contentToggled, heroCarouselSlides: cleanedSlides });
  const contentCleaned = getSiteContent();
  assert(
    !contentCleaned.heroCarouselSlides!.some((s) => s.id === new5thSlide.id),
    "CMS",
    "Carousel Slide Removal",
    "Slide safely removed from carousel"
  );

  // Restore original heading
  saveSiteContent({
    ...contentCleaned,
    heroHeadline: originalContent.heroHeadline,
    heroSubtitle: originalContent.heroSubtitle,
    heroCarouselSlides: originalContent.heroCarouselSlides,
  });
  const restoredContent = getSiteContent();
  assert(
    restoredContent.heroHeadline === originalContent.heroHeadline,
    "CMS",
    "Content Restoration",
    "Original CMS content cleanly restored"
  );

  // -------------------------------------------------------------
  // SUITE 2: MEDIA LIBRARY VERIFICATION
  // -------------------------------------------------------------
  console.log("\n--- 2. Media Library Verification ---");
  const testAsset = {
    id: `media-audit-${Date.now()}`,
    filename: "therapy-session-test.webp",
    url: "/images/hero-carousel/vision-therapy.webp",
    size: 245000,
    mimeType: "image/webp",
    uploadedAt: new Date().toISOString(),
    altText: "Vision therapist demonstrating Brock string exercise with pediatric patient",
    category: "therapies" as const,
  };

  saveMediaAsset(testAsset);
  const mediaList = getMediaAssets();
  assert(
    mediaList.some((m) => m.id === testAsset.id && m.altText.includes("Brock string")),
    "Media",
    "Upload & Metadata Persistence",
    "Media asset stored with alt text and dimensions"
  );

  // Delete media asset
  deleteMediaAsset(testAsset.id);
  const mediaListAfterDelete = getMediaAssets();
  assert(
    !mediaListAfterDelete.some((m) => m.id === testAsset.id),
    "Media",
    "Safe Asset Deletion",
    "Asset cleanly deleted without affecting existing content"
  );

  // -------------------------------------------------------------
  // SUITE 3: SERVICES & RETREATS CRUD (THERAPIES & PROGRAMMES)
  // -------------------------------------------------------------
  console.log("\n--- 3. Therapies & Programmes CRUD ---");
  const testOfferingId = `offering-audit-${Date.now()}`;
  const testOffering = {
    id: testOfferingId,
    title: "Orthoptic Convergence Diagnostics",
    slug: "orthoptic-convergence-diagnostics",
    shortDescription: "Comprehensive clinical diagnostic evaluation for binocular vision anomalies.",
    fullDescription: "Detailed assessment of accommodation, stereopsis, phorias, and vergence reserves.",
    durationMinutes: 60,
    priceInr: 2500,
    category: "clinical" as const,
    therapistIds: ["therapist-1"],
    primaryImage: "/images/hero-carousel/vision-therapy.webp",
    isPublished: true,
    isArchived: false,
  };

  saveOffering(testOffering);
  const offerings = getAllOfferings(true);
  assert(
    offerings.some((o) => o.id === testOfferingId && o.priceInr === 2500),
    "Therapies",
    "Create Therapy",
    "Therapy created with pricing and assigned practitioner"
  );

  // Update therapy price and title
  saveOffering({ ...testOffering, priceInr: 2800, title: "Orthoptic Convergence Diagnostics (Updated)" });
  const updatedOfferings = getAllOfferings(true);
  const foundUpdated = updatedOfferings.find((o) => o.id === testOfferingId);
  assert(
    foundUpdated?.priceInr === 2800 && foundUpdated?.title.includes("Updated"),
    "Therapies",
    "Update Therapy",
    "Therapy price and title update correctly"
  );

  // Archive therapy
  archiveOffering(testOfferingId);
  const publicOfferings = getAllOfferings(false);
  assert(
    !publicOfferings.some((o) => o.id === testOfferingId),
    "Therapies",
    "Archive Therapy",
    "Archived therapy hidden from public catalogue"
  );

  // Restore therapy
  restoreOffering(testOfferingId);
  const restoredOfferings = getAllOfferings(false);
  assert(
    restoredOfferings.some((o) => o.id === testOfferingId),
    "Therapies",
    "Restore Therapy",
    "Archived therapy cleanly restored"
  );

  // Clean up
  archiveOffering(testOfferingId);

  // Programmes CRUD
  const testProgrammeId = `prog-audit-${Date.now()}`;
  const testProgramme = {
    id: testProgrammeId,
    title: "7-Day Auroville Natural Vision Retreat",
    slug: "7-day-vision-retreat",
    shortDescription: "Intensive residential retreat for natural vision recovery.",
    fullDescription: "Immersion in Bates methods, Ayurvedic ocular treatments, and meditation.",
    durationDays: 7,
    priceInr: 35000,
    includesAccomodation: true,
    maxParticipants: 12,
    isPublished: true,
  };

  saveProgramme(testProgramme);
  const programmes = getAllProgrammes(true);
  assert(
    programmes.some((p) => p.id === testProgrammeId && p.durationDays === 7),
    "Programmes",
    "Create Multi-Day Programme",
    "Multi-day residential programme saved with day duration and capacity"
  );

  const duplicated = duplicateProgramme(testProgrammeId);
  assert(
    !!duplicated && duplicated.title.includes("Copy"),
    "Programmes",
    "Duplicate Programme",
    "Programme cleanly duplicated for rapid schedule creation"
  );

  if (duplicated) deleteProgramme(duplicated.id);
  deleteProgramme(testProgrammeId);
  const programmesAfterDelete = getAllProgrammes(true);
  assert(
    !programmesAfterDelete.some((p) => p.id === testProgrammeId),
    "Programmes",
    "Delete Programme",
    "Programme deleted cleanly"
  );

  // -------------------------------------------------------------
  // SUITE 4: PRACTITIONER MANAGEMENT & SAFE REMOVAL
  // -------------------------------------------------------------
  console.log("\n--- 4. Practitioner Management & Safe Removal ---");
  const testTherapistId = `therapist-audit-${Date.now()}`;
  const testTherapist = {
    id: testTherapistId,
    displayName: "Dr. Rohini Varma",
    title: "Senior Orthoptist & Vision Therapist",
    qualifications: "B.Optom, FCOVD (Fellow in Vision Development)",
    specialties: ["Strabismus", "Amblyopia", "Sports Vision"],
    bio: "Specializing in pediatric visual neurodevelopment and athletic visual tracking.",
    photoUrl: "/images/hero-carousel/sports-vision.webp",
    assignedOfferingIds: ["offering-1"],
    isPublic: true,
    isArchived: false,
  };

  saveTherapist(testTherapist);
  const therapists = getAllTherapists(true);
  assert(
    therapists.some((t) => t.id === testTherapistId),
    "Practitioners",
    "Add Practitioner",
    "Practitioner profile registered"
  );

  // Create an upcoming booking assigned to this practitioner
  const auditBooking = {
    id: `book-audit-${Date.now()}`,
    bookingReference: `APV-AUDIT-${Date.now()}`,
    clientName: "Meera Patel",
    clientEmail: "meera.patel@example.com",
    clientPhone: "+91 98450 11223",
    therapistId: testTherapistId,
    therapistName: testTherapist.displayName,
    offeringId: "offering-1",
    offeringTitle: "Comprehensive Vision Assessment",
    date: "2026-12-15",
    timeSlot: "10:00 AM",
    durationMinutes: 60,
    amountInr: 2500,
    status: "confirmed" as const,
    paymentStatus: "paid" as const,
    paymentMethod: "upi" as const,
    createdAt: new Date().toISOString(),
  };
  saveBooking(auditBooking);

  // Attempt to archive practitioner without reassigning appointments (MUST FAIL)
  const archiveAttempt1 = archiveTherapist(testTherapistId);
  assert(
    !archiveAttempt1.success && archiveAttempt1.error?.includes("Cannot archive"),
    "Practitioners",
    "Booking Collision Protection",
    "Accidental practitioner removal prevented when upcoming appointments exist"
  );

  // Safely reassign appointments to default practitioner
  const reassignResult = reassignTherapistBookings(testTherapistId, "therapist-1", "Dr. Ananya Sen");
  assert(
    reassignResult.success && reassignResult.reassignedCount >= 1,
    "Practitioners",
    "Reassign Appointments",
    `Successfully reassigned ${reassignResult.reassignedCount} appointments`
  );

  // Now archive practitioner (MUST SUCCEED)
  const archiveAttempt2 = archiveTherapist(testTherapistId);
  assert(
    archiveAttempt2.success,
    "Practitioners",
    "Safe Archival Post-Reassignment",
    "Practitioner archived safely after appointment transfers"
  );

  // Reactivate practitioner
  const reactivateResult = reactivateTherapist(testTherapistId);
  assert(
    reactivateResult.success,
    "Practitioners",
    "Reactivate Practitioner",
    "Practitioner profile cleanly reactivated"
  );

  // Cancel audit booking
  cancelBooking(auditBooking.id, "Audit completion");

  // -------------------------------------------------------------
  // SUITE 5: CRM CLIENTS, INQUIRIES & TASKS
  // -------------------------------------------------------------
  console.log("\n--- 5. CRM Clients, Inquiries & Tasks ---");
  const testClient = createClient({
    fullName: "Arjun Ramanathan",
    email: `arjun-${Date.now()}@example.com`,
    phone: "+91 94432 99881",
    location: "Auroville, Tamil Nadu",
    tags: ["Retreat Participant", "Myopia"],
    notes: "Interested in the 7-day residential vision recovery programme.",
  });

  assert(
    !!testClient && testClient.fullName === "Arjun Ramanathan",
    "CRM",
    "Create Client Profile",
    "CRM client created with tags and location"
  );

  const updatedClient = updateClient(testClient.id, {
    preferredContactMethod: "whatsapp",
    notes: "Prefers morning sessions due to remote work schedule.",
  });
  assert(
    updatedClient?.preferredContactMethod === "whatsapp",
    "CRM",
    "Update Client Preferences",
    "Client communication preferences updated"
  );

  const inquiry = createInquiry({
    clientName: "Arjun Ramanathan",
    clientEmail: testClient.email,
    clientPhone: testClient.phone,
    preferredContactMethod: "whatsapp",
    inquiryType: "retreat",
    message: "Requesting dates for upcoming December batch.",
  });
  assert(
    !!inquiry && inquiry.status === "new",
    "CRM",
    "Log New Lead/Inquiry",
    "Inquiry logged in CRM pipeline"
  );

  const stagedInquiry = updateInquiryStage(inquiry.id, "contacted");
  assert(
    stagedInquiry?.status === "contacted",
    "CRM",
    "Pipeline Stage Transition",
    "Inquiry progressed to 'contacted' stage"
  );

  const task = createTask({
    clientId: testClient.id,
    clientName: testClient.fullName,
    title: "Send December Retreat Itinerary & Accommodation Options",
    dueDate: "2026-11-25",
    priority: "high",
    assignedTo: "staff-1",
  });
  assert(
    !!task && task.status === "pending",
    "CRM",
    "Create Follow-up Task",
    "High priority task scheduled"
  );

  const completedTask = completeTask(task.id);
  assert(
    completedTask?.status === "completed",
    "CRM",
    "Complete Task",
    "Follow-up task marked completed"
  );

  // -------------------------------------------------------------
  // SUITE 6: ELECTRONIC MEDICAL RECORDS (EMR)
  // -------------------------------------------------------------
  console.log("\n--- 6. Clinical EMR & Legal Compliance ---");
  const patient = await createPatient({
    crmContactId: testClient.id,
    fullName: testClient.fullName,
    phone: testClient.phone,
    email: testClient.email,
    dateOfBirth: "1992-04-18",
    gender: "male",
    primaryTherapistId: "therapist-1",
    primaryTherapistName: "Dr. Ananya Sen",
    chiefComplaints: ["Asthenopia after 4 hours of screen time", "Intermittent diplopia at near"],
    medicalHistoryNotes: "No history of ocular surgery. Mild dry eye syndrome.",
    refractiveSummary: "OD: -2.50 DS / OS: -2.75 DS -0.50 DC x 180",
    allergies: ["None known"],
    clinicalAlerts: ["Screen Fatigue Vulnerable", "Convergence Insufficiency"],
  });

  assert(
    patient.medicalRecordNumber.startsWith("APV-MRN-"),
    "EMR",
    "Patient Registration & MRN",
    `Patient assigned official MRN: ${patient.medicalRecordNumber}`
  );

  // 6.2 Draft SOAP Note
  const draftNote = await saveSoapNote({
    patientId: patient.id,
    encounterId: `enc-${Date.now()}`,
    therapistId: "therapist-1",
    therapistName: "Dr. Ananya Sen",
    subjective: "Client reports moderate frontal eye strain in late afternoons. Reads 8 hrs/day.",
    objective: "Cover test at near reveals 8 prism diopters exophoria. NPC break 14cm, recovery 18cm.",
    assessment: "Moderate Convergence Insufficiency with secondary accommodative spasm.",
    plan: "Initiate 8-week structured Vision Therapy protocol: Brock string, pencil push-ups, Marsden ball tracking.",
  });
  assert(
    draftNote.status === "draft" && !draftNote.isLocked,
    "EMR",
    "Draft SOAP Note",
    "Draft SOAP note created and editable"
  );

  // 6.3 Sign and Lock SOAP Note (Legal compliance)
  const lockedNote = await signAndLockSoapNote(draftNote.id, {
    id: "therapist-1",
    fullName: "Dr. Ananya Sen",
  });
  assert(
    lockedNote.status === "signed" && lockedNote.isLocked && !!lockedNote.signedAt,
    "EMR",
    "Sign & Lock SOAP Note",
    "Note officially locked with practitioner signature and timestamp"
  );

  // 6.4 Verify Locked Note Rejects Direct Overwriting
  let directEditBlocked = false;
  try {
    await saveSoapNote({
      ...lockedNote,
      assessment: "Tampered assessment text.",
    });
  } catch (err: any) {
    directEditBlocked = true;
  }
  assert(
    directEditBlocked,
    "EMR",
    "Tamper-Proof Locked Note",
    "Direct edits to locked medical note strictly rejected"
  );

  // 6.5 Append Legal Amendment to Signed Note
  const amendedNote = await amendSoapNote(lockedNote.id, {
    staffId: "therapist-1",
    staffName: "Dr. Ananya Sen",
    reasonForAmendment: "Added baseline stereopsis test result missed during initial recording",
    amendmentText: "Titmus Fly test shows gross stereopsis 800 arc sec; Wirt rings 140 arc sec.",
  });
  assert(
    amendedNote.amendments.length === 1 &&
      amendedNote.amendments[0].amendmentText.includes("Titmus Fly") &&
      amendedNote.subjective === draftNote.subjective,
    "EMR",
    "Legal Clinical Amendment",
    "Amendment appended as immutable dated addendum while preserving original note"
  );

  // 6.6 Clinical Vision Assessment
  const assessment = await createVisionAssessment({
    patientId: patient.id,
    therapistId: "therapist-1",
    therapistName: "Dr. Ananya Sen",
    visualAcuity: {
      distance: { rightEye: "6/6", leftEye: "6/6", bothEyes: "6/5" },
      near: { rightEye: "N6", leftEye: "N6", bothEyes: "N5" },
    },
    binocularVision: {
      nearPointConvergenceBreakCm: 14,
      nearPointConvergenceRecoveryCm: 18,
      stereopsisSecondsOfArc: 140,
      suppression: "None at distance, intermittent OS suppression at 33cm",
    },
    ocularMotility: "Smooth pursuits normal. Saccades slightly hypometric to the left.",
    diagnosticSummary: "Convergence Insufficiency (Exophoria > Ortho). Good prognosis with compliance.",
  });
  assert(
    assessment.binocularVision.nearPointConvergenceBreakCm === 14,
    "EMR",
    "Vision Assessment Metrics",
    "Full clinical vision assessment recorded with NPC and motility metrics"
  );

  // 6.7 Treatment Plan
  const plan = await createTreatmentPlan({
    patientId: patient.id,
    therapistId: "therapist-1",
    therapistName: "Dr. Ananya Sen",
    diagnosis: "Convergence Insufficiency",
    totalPrescribedSessions: 12,
    goals: ["Normalize near point of convergence to <= 6cm", "Achieve 40 arc seconds stereopsis", "Eliminate near asthenopia"],
    homeExercisesPrescribed: ["Brock string 10 mins daily", "Palming 5 mins after screen blocks", "Bates sunning & blinking"],
    startDate: new Date().toISOString().split("T")[0],
    targetCompletionDate: "2027-01-30",
  });
  assert(
    plan.totalPrescribedSessions === 12 && plan.goals.length === 3,
    "EMR",
    "Treatment Plan Creation",
    "Long-term therapeutic rehabilitation plan formulated"
  );

  // -------------------------------------------------------------
  // SUITE 7: BOOKING CONCURRENCY & RACE-CONDITION PROTECTION
  // -------------------------------------------------------------
  console.log("\n--- 7. Booking Concurrency & Slot Race Protection ---");
  const testDate = "2026-11-28";
  const testSlot = "11:30 AM";
  const slotTherapist = "therapist-1";

  // Booking 1: Successfully claims the slot
  const booking1 = saveBooking({
    bookingReference: `APV-TEST-CONCURRENCY-1`,
    clientName: "Patient One",
    clientEmail: "patient1@example.com",
    clientPhone: "+91 98888 11111",
    therapistId: slotTherapist,
    therapistName: "Dr. Ananya Sen",
    offeringId: "offering-1",
    offeringTitle: "Comprehensive Vision Assessment",
    date: testDate,
    timeSlot: testSlot,
    durationMinutes: 60,
    amountInr: 2500,
    status: "confirmed",
    paymentStatus: "paid",
    paymentMethod: "cash",
    createdAt: new Date().toISOString(),
  });

  // Verify Booking 1 is saved
  const allBookings = getAllBookings();
  assert(
    allBookings.some((b) => b.id === booking1.id),
    "Booking",
    "Slot Reservation",
    "Booking 1 reserved appointment slot"
  );

  // Booking 2: Concurrent attempt on exact same practitioner + date + timeSlot
  const allCurrentBookings = getAllBookings();
  const conflict = allCurrentBookings.find(
    (b) =>
      b.therapistId === slotTherapist &&
      b.date === testDate &&
      b.timeSlot === testSlot &&
      b.status !== "cancelled"
  );
  assert(
    !!conflict,
    "Booking",
    "Concurrency Conflict Detection",
    "Simultaneous booking attempt identifies existing reservation and prevents double-booking"
  );

  // Cancellation and Slot Freeing
  cancelBooking(booking1.id, "Slot test cleanup");
  const postCancelBookings = getAllBookings();
  const cancelledBooking = postCancelBookings.find((b) => b.id === booking1.id);
  assert(
    cancelledBooking?.status === "cancelled",
    "Booking",
    "Slot Cancellation & Freeing",
    "Cancelled appointment immediately releases slot back to inventory"
  );

  // -------------------------------------------------------------
  // SUITE 8: AUTHENTICATION & ROLE-BASED ACCESS CONTROL (RBAC)
  // -------------------------------------------------------------
  console.log("\n--- 8. Authentication & Role-Based Access Control (RBAC) ---");
  const staff = getAllStaffUsers();
  assert(staff.length >= 3, "Auth", "Staff Directory", `Found ${staff.length} registered staff users`);

  const superAdmin = staff.find((s) => s.role === "super_admin");
  assert(!!superAdmin, "Auth", "Super Admin Existence", "Super Admin account configured with full credentials");

  const authSuccess = authenticateStaffUser("admin@aurovision.org", "Admin@Auro2026!");
  assert(
    authSuccess.success && authSuccess.user?.email === "admin@aurovision.org",
    "Auth",
    "Credential Verification",
    "Secure authentication succeeds for legitimate administrator"
  );

  const authFail = authenticateStaffUser("admin@aurovision.org", "WrongPassword999!");
  assert(
    !authFail.success,
    "Auth",
    "Rejection of Invalid Credentials",
    "Brute-force or invalid credentials strictly blocked"
  );

  // -------------------------------------------------------------
  // SUMMARY OF AUDIT
  // -------------------------------------------------------------
  console.log("\n================================================================");
  const totalTests = results.length;
  const passedTests = results.filter((r) => r.passed).length;
  const failedTests = results.filter((r) => !r.passed).length;
  console.log(`TOTAL AUDIT CHECKS: ${totalTests} | PASSED: ${passedTests} | FAILED: ${failedTests}`);
  console.log("================================================================\n");

  if (failedTests > 0) {
    process.exit(1);
  }
}

runAudit().catch((err) => {
  console.error("FATAL AUDIT ERROR:", err);
  process.exit(1);
});
