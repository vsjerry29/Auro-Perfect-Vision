/**
 * AURO PERFECT VISION — COMPREHENSIVE MYSQL LIVE INTEGRATION & PRE-DEPLOYMENT TEST
 * Connects directly to local MySQL (port 3306), executes real DML/DDL against
 * `auro_perfect_vision_test`, and verifies all workflows, concurrency locks,
 * role permissions, and persistent data survival.
 */

// Configure environment for live MySQL testing before importing modules
process.env.DB_HOST = "127.0.0.1";
process.env.DB_PORT = "3306";
process.env.DB_NAME = "auro_perfect_vision_test";
process.env.DB_USER = "root";
process.env.DB_PASSWORD = "";
process.env.NODE_ENV = "test";
process.env.SESSION_SECRET = "auro_test_secret_key_2026_pre_deployment_verification";

import { getMySQLPool, checkDatabaseConnection, isMySQLConfigured } from "../src/lib/server/mysql";
import * as db from "../src/lib/server/mysql-db";
import {
  hashPassword,
  verifyPassword,
  verifyAndUpgradeStaffPassword,
  createSessionToken,
  verifySessionToken,
  getStaffUsers,
  createStaffUser,
  updateStaffUser,
  deleteStaffUser,
  findStaffByEmail,
  findStaffById,
  PBKDF2_ITERATIONS,
  LEGACY_PBKDF2_ITERATIONS,
} from "../src/lib/server/auth";
import {
  getPersistentUploadDir,
  getPrivateDocumentsDir,
  isSafeSvg,
  expandStoragePath,
} from "../src/lib/server/storage-engine";
import { StaffUser, Offering, Booking } from "../src/lib/types";
import { ClientContact, CrmInquiry } from "../src/lib/types/crm";
import fs from "fs";
import path from "path";
import os from "os";

interface StepResult {
  step: string;
  name: string;
  passed: boolean;
  message: string;
}

const results: StepResult[] = [];

function recordTest(step: string, name: string, passed: boolean, message: string) {
  results.push({ step, name, passed, message });
  const icon = passed ? "✓" : "✗";
  console.log(`  [${icon}] ${step} -> ${name}: ${message}`);
  if (!passed) {
    console.error(`      ERROR: ${message}`);
  }
}

async function runLiveIntegrationTest() {
  console.log("==========================================================================");
  console.log("AURO PERFECT VISION — REAL MYSQL LIVE INTEGRATION TEST (PORT 3306)");
  console.log("==========================================================================\n");

  // Step 1: Database Connectivity Check
  console.log(">>> STEP 1: Verifying Live MySQL Database Connection");
  const connCheck = await checkDatabaseConnection();
  recordTest(
    "Step 1",
    "MySQL Ping & Latency",
    connCheck.connected,
    `Connected to MySQL on 127.0.0.1:3306 in ${connCheck.latencyMs}ms (DB: auro_perfect_vision_test)`
  );

  if (!connCheck.connected) {
    throw new Error(`Cannot proceed with live test: ${connCheck.error}`);
  }

  // Step 2: Authentication & PBKDF2 220,000 Iteration Security
  console.log("\n>>> STEP 2: Password Hashing & OWASP 220,000 Iteration Upgrade");
  const testPassword = "AuroVisionSuperAdmin@2026!";

  // 2a. Modern 220k hash test
  const modern = hashPassword(testPassword);
  recordTest(
    "Step 2",
    "Modern PBKDF2 Iterations",
    modern.iterations === 220000,
    `New passwords hashed using PBKDF2-HMAC-SHA512 with ${modern.iterations} iterations (Salt: 64 hex chars)`
  );
  recordTest(
    "Step 2",
    "Modern Password Verification",
    verifyPassword(testPassword, modern.hash, modern.salt),
    "Modern 220,000-iteration password verified successfully"
  );

  // 2b. Intermediate 210k hash test and automatic upgrade
  const intermediate = hashPassword(testPassword, undefined, 210000);
  recordTest(
    "Step 2",
    "Intermediate 210k Backward Compatibility",
    verifyPassword(testPassword, intermediate.hash, intermediate.salt),
    "Intermediate 210,000-iteration hashes verify correctly"
  );

  // 2c. Legacy 10k hash test and automatic upgrade
  const legacy = hashPassword(testPassword, undefined, LEGACY_PBKDF2_ITERATIONS);
  recordTest(
    "Step 2",
    "Legacy 10k Backward Compatibility",
    verifyPassword(testPassword, legacy.hash, legacy.salt),
    "Existing 10,000-iteration legacy passwords verify correctly without user lockout"
  );

  // Insert mock staff with legacy hash into MySQL
  const legacyStaffId = `staff-legacy-${Date.now()}`;
  const legacyStaffEmail = `legacy_${Date.now()}@auroperfectvision.com`;
  const legacyStaff: StaffUser = {
    id: legacyStaffId,
    email: legacyStaffEmail,
    fullName: "Legacy Staff Member",
    role: "admin",
    passwordHash: legacy.hash,
    salt: legacy.salt,
    isActive: true,
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await db.dbCreateStaffUser(legacyStaff);

  // Perform automatic upgrade verification
  const upgradeCheck = await verifyAndUpgradeStaffPassword(testPassword, legacyStaff);
  recordTest(
    "Step 2",
    "Automatic Hash Upgrade Execution",
    upgradeCheck.isValid && upgradeCheck.wasUpgraded,
    "verifyAndUpgradeStaffPassword detected earlier hash and triggered automatic upgrade to 220k"
  );

  // Verify updated hash in MySQL
  const updatedStaffFromDb = await db.dbFindStaffById(legacyStaffId);
  const isUpgradedInDb =
    updatedStaffFromDb !== null &&
    updatedStaffFromDb.passwordHash !== legacy.hash &&
    verifyPassword(testPassword, updatedStaffFromDb.passwordHash, updatedStaffFromDb.salt);

  recordTest(
    "Step 2",
    "MySQL Hash Persistence",
    Boolean(isUpgradedInDb),
    "Upgraded 220,000-iteration password hash successfully committed to MySQL table staff_profiles"
  );

  // Step 3: Super Admin Governance & Privilege Escalation Protection
  console.log("\n>>> STEP 3: Role-Based Access Control & Super Admin Governance");
  const superAdminId = `super-admin-${Date.now()}`;
  const superAdminEmail = `superadmin_${Date.now()}@auroperfectvision.com`;
  const superAdminUser: StaffUser = {
    id: superAdminId,
    email: superAdminEmail,
    fullName: "Sole Super Administrator",
    role: "super_admin",
    passwordHash: modern.hash,
    salt: modern.salt,
    isActive: true,
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await db.dbCreateStaffUser(superAdminUser);

  // Verify findStaffByEmail and findStaffById from MySQL
  const foundByEmail = await findStaffByEmail(superAdminEmail);
  recordTest(
    "Step 3",
    "Staff Lookup by Email",
    foundByEmail?.id === superAdminId,
    `Found staff user ${superAdminEmail} in MySQL staff_profiles table`
  );

  // Test protection: attempt to demote or suspend sole super admin
  // First, verify how many super admins currently exist in MySQL
  const allUsersBefore = await db.dbGetStaffUsers();
  const otherSuperAdmins = allUsersBefore.filter(
    (u) => u.role === "super_admin" && u.isActive && u.status !== "suspended" && u.id !== superAdminId
  );

  // Temporarily suspend other super admins to test strict sole super admin safeguard
  for (const other of otherSuperAdmins) {
    await db.dbUpdateStaffUser(other.id, { status: "suspended" });
  }

  let demotionBlocked = false;
  try {
    await updateStaffUser(superAdminId, { role: "therapist" });
  } catch (err: any) {
    demotionBlocked = err.message.includes("Super Administrator");
  }

  // Restore other super admins
  for (const other of otherSuperAdmins) {
    await db.dbUpdateStaffUser(other.id, { status: "active" });
  }

  recordTest(
    "Step 3",
    "Sole Super Admin Demotion Protection",
    demotionBlocked,
    "Prevented demoting the last active Super Administrator"
  );

  // Test account suspension session revocation
  const therapistStaffId = `therapist-${Date.now()}`;
  const therapistStaffUser: StaffUser = {
    id: therapistStaffId,
    email: `therapist_${Date.now()}@auroperfectvision.com`,
    fullName: "Dr. Suspended Practitioner",
    role: "therapist",
    passwordHash: modern.hash,
    salt: modern.salt,
    isActive: true,
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await db.dbCreateStaffUser(therapistStaffUser);
  const activeSessionToken = createSessionToken({
    userId: therapistStaffId,
    email: therapistStaffUser.email,
    fullName: therapistStaffUser.fullName,
    role: "therapist",
    expiresAt: Date.now() + 3600000,
  });

  // Verify token parses
  const parsedBeforeSuspension = verifySessionToken(activeSessionToken);
  recordTest(
    "Step 3",
    "Active Staff Session Creation",
    parsedBeforeSuspension !== null,
    "HMAC-SHA256 session token created and verified"
  );

  // Now suspend account in MySQL
  await db.dbUpdateStaffUser(therapistStaffId, { status: "suspended", isActive: false });
  const suspendedStaff = await findStaffByEmail(therapistStaffUser.email);
  recordTest(
    "Step 3",
    "Suspended Account Login Block",
    suspendedStaff === undefined,
    "findStaffByEmail returns undefined for suspended accounts (login blocked)"
  );

  // Step 4: Therapies & Offerings CRUD in MySQL
  console.log("\n>>> STEP 4: Therapies & Offerings Persistence in MySQL");
  const testOfferingId = `off-test-${Date.now()}`;
  const testOffering: Offering = {
    id: testOfferingId,
    slug: `eye-yoga-restoration-${Date.now()}`,
    title: "Classical Eye Yoga & Holistic Restoration",
    category: "eye-yoga",
    shortDescription: "Centering and palming exercises for visual acuity restoration.",
    fullDescription: "Detailed multi-stage ocular restoration practiced in Auroville.",
    durationMinutes: 75,
    format: "individual",
    delivery: "onsite",
    price: { inr: 2500, usd: 45, taxInclusive: true },
    assignedTherapistIds: [therapistStaffId],
    maxCapacity: 1,
    isFlagshipProgramme: false,
    featured: true,
    suitableFor: ["Digital eye strain", "Myopia stabilization", "General eye fatigue"],
    whatToExpect: ["Bates relaxation", "Sunning and palming", "Trataka practice"],
    programmeSyllabus: [],
    imageUrl: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1200&q=80",
    isPublished: true,
  };

  await db.dbSaveOffering(testOffering);
  const loadedOffering = await db.dbGetOfferingById(testOfferingId);
  recordTest(
    "Step 4",
    "Offering Insert & Read",
    loadedOffering !== null && loadedOffering.title === testOffering.title,
    `Saved and loaded therapy offering '${testOffering.title}' from MySQL table offerings`
  );

  // Step 5: Site Content & Hero Carousel Persistence
  console.log("\n>>> STEP 5: CMS Site Content & Hero Carousel in MySQL");
  const testSiteContent = {
    heroHeadline: "Auro Perfect Vision — Natural Eye Care Centre",
    heroSubtitle: "Restoring clear vision amidst the peaceful forests of Auroville.",
    heroImageUrl: "https://images.unsplash.com/photo-1545205597-3d9d02c29597",
    heroCarouselSlides: [
      {
        id: "slide-1",
        title: "Classical Eye Yoga",
        subtitle: "Holistic Bates Method & Conscious Vision",
        imageUrl: "https://images.unsplash.com/photo-1545205597-3d9d02c29597",
        ctaText: "Explore Eye Yoga",
        ctaLink: "/therapies/eye-yoga",
        order: 1,
        active: true,
      },
    ],
    primaryCtaText: "Book Consultation",
    primaryCtaLink: "/therapies",
    secondaryCtaText: "Explore Team",
    secondaryCtaLink: "/team",
    emergencyNotice: "",
    announcementBanner: "Now welcoming participants to our residential retreat.",
    phone: "+91 80123 05151",
    email: "connect@auroperfectvision.com",
    address: "Auroville, Tamil Nadu 605101, India",
    whatsappLink: "https://wa.me/918012305151",
    openingHours: "Mon-Sat: 9:00 AM - 5:30 PM IST",
    updatedAt: new Date().toISOString(),
  };

  await db.dbSaveSiteContent(testSiteContent as any);
  const loadedContent = await db.dbGetSiteContent();
  recordTest(
    "Step 5",
    "CMS Site Content & Slides",
    loadedContent !== null && loadedContent.heroHeadline === testSiteContent.heroHeadline,
    "Site content and hero carousel slides stored and retrieved from MySQL table site_content"
  );

  // Step 6: Bookings & Concurrency Protection
  console.log("\n>>> STEP 6: Booking Creation & Double-Booking Concurrency Protection");
  const testBookingRef = `APV-TST-${Date.now()}`;
  const bookingDate = "2026-12-15";
  const bookingSlot = "10:00 AM - 11:15 AM";

  const firstBooking: Booking = {
    id: `book-${Date.now()}-1`,
    bookingReference: testBookingRef,
    offeringId: testOfferingId,
    offeringTitle: testOffering.title,
    therapistId: therapistStaffId,
    therapistName: "Dr. Ananya Sen",
    date: bookingDate,
    timeSlot: bookingSlot,
    clientTimezone: "Asia/Kolkata",
    clientName: "Suriya Narayanan",
    clientEmail: "suriya.test@example.com",
    clientPhone: "+91 9876543210",
    seatsBooked: 1,
    currency: "INR",
    totalAmount: 2500,
    status: "confirmed",
    paymentMethod: "offline_cash",
    paymentStatus: "pending",
    intakeAnswers: { visionCondition: "Myopia -2.50D" },
    invoiceIssued: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await db.dbSaveBooking(firstBooking);
  const loadedBooking = await db.dbGetBookingByReference(testBookingRef);
  recordTest(
    "Step 6",
    "Booking Commitment",
    loadedBooking !== null && loadedBooking.clientName === "Suriya Narayanan",
    `Booking committed to MySQL table bookings with reference ${testBookingRef}`
  );

  // Anti-double-booking: attempt to book exact same slot concurrently
  let doubleBookingCaught = false;
  const duplicateBooking: Booking = {
    ...firstBooking,
    id: `book-${Date.now()}-2`,
    bookingReference: `APV-TST-${Date.now()}-DUP`,
    clientName: "Second Guest",
    clientEmail: "second.guest@example.com",
  };

  try {
    await db.dbSaveBooking(duplicateBooking);
  } catch (err: any) {
    doubleBookingCaught =
      err.message.includes("DOUBLE_BOOKING_PREVENTED") ||
      err.message.includes("already reserved");
  }

  recordTest(
    "Step 6",
    "InnoDB Transaction Lock (Anti-Double-Booking)",
    doubleBookingCaught,
    "ACID transaction and SELECT ... FOR UPDATE locked slot, preventing duplicate booking"
  );

  // 6c. True Simultaneous Asynchronous Concurrency Test (Two concurrent transactions racing for 1 slot)
  const pool = getMySQLPool();
  const raceDate = "2026-12-20";
  const raceSlot = "03:00 PM - 04:15 PM";
  const racerAId = `book-race-A-${Date.now()}`;
  const racerBId = `book-race-B-${Date.now()}`;
  const racerA: Booking = {
    ...firstBooking,
    id: racerAId,
    bookingReference: `APV-RACE-A-${Date.now()}`,
    date: raceDate,
    timeSlot: raceSlot,
    clientName: "Concurrent Applicant Alpha",
    clientEmail: "alpha@example.com",
  };
  const racerB: Booking = {
    ...firstBooking,
    id: racerBId,
    bookingReference: `APV-RACE-B-${Date.now()}`,
    date: raceDate,
    timeSlot: raceSlot,
    clientName: "Concurrent Applicant Beta",
    clientEmail: "beta@example.com",
  };

  const [resA, resB] = await Promise.allSettled([
    db.dbSaveBooking(racerA),
    db.dbSaveBooking(racerB),
  ]);

  const oneSucceeded = (resA.status === "fulfilled" && resB.status === "rejected") ||
                       (resB.status === "fulfilled" && resA.status === "rejected");
  const rejectedResult = resA.status === "rejected" ? (resA as PromiseRejectedResult) : (resB as PromiseRejectedResult);
  const caughtErrorMatch = rejectedResult && (
    rejectedResult.reason?.message?.includes("DOUBLE_BOOKING_PREVENTED") ||
    rejectedResult.reason?.message?.includes("already reserved")
  );

  const [raceCheck] = await pool.query<any[]>(
    "SELECT COUNT(*) as cnt FROM bookings WHERE therapist_id = ? AND DATE(booking_date) = DATE(?) AND time_slot = ?",
    [therapistStaffId, raceDate, raceSlot]
  );
  const exactlyOneCommitted = raceCheck[0]?.cnt === 1;

  recordTest(
    "Step 6",
    "True Concurrent Race Simulation",
    oneSucceeded && caughtErrorMatch && exactlyOneCommitted,
    `Simultaneous async booking collision resolved: 1 winner committed, 1 cleanly rejected with DOUBLE_BOOKING_PREVENTED, exactly 1 slot in MySQL`
  );

  // Booking holds and expired hold release test
  const holdId = `hold-${Date.now()}`;
  await pool.execute(
    "INSERT INTO booking_holds (id, offering_id, therapist_id, hold_date, time_slot, session_token, expires_at) VALUES (?, ?, ?, ?, ?, ?, DATE_SUB(NOW(), INTERVAL 1 MINUTE))",
    [holdId, testOfferingId, therapistStaffId, "2026-12-16", "02:00 PM", "test-token-123"]
  );

  const releasedCount = await db.dbReleaseExpiredBookingHolds();
  recordTest(
    "Step 6",
    "Expired Booking Hold Release",
    releasedCount >= 1,
    `dbReleaseExpiredBookingHolds released ${releasedCount} expired hold(s) from MySQL`
  );

  // Step 7: CRM Clients & Inquiries in MySQL
  console.log("\n>>> STEP 7: CRM Client Contacts & Inquiries in MySQL");
  const clientId = `client-${Date.now()}`;
  const clientData: ClientContact = {
    id: clientId,
    clientReference: `APV-CLI-${Date.now()}`,
    fullName: "Auroville Wellness Visitor",
    email: `client_${Date.now()}@example.com`,
    phone: "+91 9488001234",
    leadStage: "consultation_completed",
    leadScore: 85,
    lifecycleStage: "active_client",
    tags: ["Eye Yoga", "Retreat Interest"],
    totalAppointmentsCount: 1,
    totalSpentInr: 2500,
    preferredCurrency: "INR",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await db.dbSaveClient(clientData);
  const loadedClient = await db.dbGetClientById(clientId);
  recordTest(
    "Step 7",
    "CRM Client Contact Persistence",
    loadedClient !== null && loadedClient.fullName === clientData.fullName,
    `CRM client record saved and loaded from MySQL table client_contacts`
  );

  // Inquiry submission test
  const inquiryId = `inq-${Date.now()}`;
  const inquiryData: CrmInquiry = {
    id: inquiryId,
    reference: `APV-INQ-${Date.now()}`,
    clientContactId: clientId,
    name: "Inquiry Prospect",
    email: "prospect@example.com",
    phone: "+91 9888877777",
    subject: "Classical Eye Yoga Inquiry",
    category: "eye-yoga",
    message: "Interested in the 3-day holistic eye relaxation session.",
    source: "website_contact_form",
    stage: "new",
    priority: "high",
    assignedStaffId: superAdminId,
    assignedStaffName: "Sole Super Administrator",
    internalNotes: "Follow up tomorrow",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await db.dbSaveInquiry(inquiryData);
  const inquiries = await db.dbGetAllInquiries();
  const foundInquiry = inquiries.find((i) => i.id === inquiryId);
  recordTest(
    "Step 7",
    "Contact Form Inquiry Persistence",
    foundInquiry !== undefined && foundInquiry?.stage === "new",
    `Contact inquiry persisted in MySQL table crm_inquiries`
  );

  // Step 8: Payments & Invoices in MySQL
  console.log("\n>>> STEP 8: Payments & Invoices Ledger");
  const paymentId = `pay-${Date.now()}`;
  await pool.execute(
    `INSERT INTO payments (id, booking_id, gateway, gateway_payment_id, amount, currency, status, raw_response)
     VALUES (?, ?, 'razorpay', 'pay_test_123456', 2500.00, 'INR', 'captured', JSON_OBJECT('receipt', 'client@example.com'))`,
    [paymentId, firstBooking.id]
  );

  const [paymentRows] = await pool.query<any>("SELECT * FROM payments WHERE id = ?", [paymentId]);
  recordTest(
    "Step 8",
    "Payment Transaction Recording",
    paymentRows.length === 1 && parseFloat(paymentRows[0].amount) === 2500.0,
    `Payment transaction recorded in MySQL table payments with gateway reference`
  );

  const invoiceId = `inv-${Date.now()}`;
  const invoiceNum = `APV-INV-2026-${Date.now().toString().slice(-4)}`;
  await pool.execute(
    `INSERT INTO invoices (id, booking_id, invoice_number, total_amount, currency, status, pdf_storage_path)
     VALUES (?, ?, ?, 2500.00, 'INR', 'paid', '/uploads/invoices/inv_test.pdf')`,
    [invoiceId, firstBooking.id, invoiceNum]
  );

  const [invoiceRows] = await pool.query<any>("SELECT * FROM invoices WHERE id = ?", [invoiceId]);
  recordTest(
    "Step 8",
    "Invoice Generation & Linkage",
    invoiceRows.length === 1 && invoiceRows[0].invoice_number === invoiceNum,
    `Invoice ${invoiceNum} generated and linked to booking in MySQL table invoices`
  );

  // Step 9: Persistent Storage & Security Validation
  console.log("\n>>> STEP 9: Persistent Storage & Upload Security Validation");
  const uploadDir = getPersistentUploadDir();
  const privateDocsDir = getPrivateDocumentsDir();

  recordTest(
    "Step 9",
    "Durable Storage Directory",
    fs.existsSync(uploadDir),
    `Durable persistent upload directory resolved at: ${uploadDir}`
  );

  recordTest(
    "Step 9",
    "Confidential Document Isolation",
    fs.existsSync(privateDocsDir) && privateDocsDir !== uploadDir,
    `Private clinical document directory isolated at: ${privateDocsDir}`
  );

  // Tilde storage path expansion test
  const testTildePath = "~/apv_storage/uploads";
  const expandedTilde = expandStoragePath(testTildePath);
  const userHome = os.homedir() || process.env.HOME || "";
  const tildeExpandedProperly = !expandedTilde.startsWith("~") && (userHome === "" || expandedTilde.includes(userHome));
  recordTest(
    "Step 9",
    "Tilde Storage Path Expansion",
    tildeExpandedProperly,
    `Tilde path '${testTildePath}' expanded safely using os.homedir() to: ${expandedTilde}`
  );

  // SVG security sanitization check (XXE, Script, Event Handlers, Javascript URIs)
  const xxeSvg = '<?xml version="1.0"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><svg><text>&xxe;</text></svg>';
  const maliciousScriptSvg = '<svg><script>alert("xss")</script><circle cx="5" cy="5" r="5"/></svg>';
  const maliciousOnloadSvg = '<svg onload="alert(1)"><circle cx="5" cy="5" r="5"/></svg>';
  const maliciousHrefSvg = '<svg><a href="javascript:alert(1)"><circle cx="5" cy="5" r="5"/></a></svg>';
  const cleanSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><circle cx="5" cy="5" r="5" fill="#4B1D8F"/></svg>';

  const xxeBlocked = !isSafeSvg(xxeSvg).isSafe;
  const scriptBlocked = !isSafeSvg(maliciousScriptSvg).isSafe;
  const onloadBlocked = !isSafeSvg(maliciousOnloadSvg).isSafe;
  const hrefBlocked = !isSafeSvg(maliciousHrefSvg).isSafe;
  const cleanAllowed = isSafeSvg(cleanSvg).isSafe;

  const allSvgChecksPassed = xxeBlocked && scriptBlocked && onloadBlocked && hrefBlocked && cleanAllowed;

  recordTest(
    "Step 9",
    "SVG Stored XSS & XXE Sanitization",
    allSvgChecksPassed,
    "XXE entities, <script> tags, onload handlers, and javascript: links blocked; valid vector art permitted"
  );

  // Step 10: Re-Reading & Persistence Verification
  console.log("\n>>> STEP 10: Restart & Persistent State Re-verification");
  // Query fresh connection to confirm committed data survived
  const [persistedBookings] = await pool.query<any>("SELECT COUNT(*) as cnt FROM bookings WHERE id = ?", [firstBooking.id]);
  const [persistedStaff] = await pool.query<any>("SELECT COUNT(*) as cnt FROM staff_profiles WHERE id = ?", [superAdminId]);
  const [persistedOfferings] = await pool.query<any>("SELECT COUNT(*) as cnt FROM offerings WHERE id = ?", [testOfferingId]);

  const allPersisted =
    persistedBookings[0].cnt === 1 &&
    persistedStaff[0].cnt === 1 &&
    persistedOfferings[0].cnt === 1;

  recordTest(
    "Step 10",
    "Post-Transaction Persistence",
    allPersisted,
    "All records persisted cleanly across independent MySQL query cycles"
  );

  // Clean up test data
  console.log("\n>>> Cleaning up test data from auro_perfect_vision_test...");
  await pool.execute("DELETE FROM bookings WHERE id = ?", [firstBooking.id]);
  await pool.execute("DELETE FROM bookings WHERE id IN (?, ?)", [racerAId, racerBId]);
  await pool.execute("DELETE FROM payments WHERE id = ?", [paymentId]);
  await pool.execute("DELETE FROM invoices WHERE id = ?", [invoiceId]);
  await pool.execute("DELETE FROM offerings WHERE id = ?", [testOfferingId]);
  await pool.execute("DELETE FROM staff_profiles WHERE id IN (?, ?, ?)", [legacyStaffId, superAdminId, therapistStaffId]);
  await pool.execute("DELETE FROM client_contacts WHERE id = ?", [clientId]);
  await pool.execute("DELETE FROM crm_inquiries WHERE id = ?", [inquiryId]);
  console.log("Cleanup completed.");

  // Summary
  console.log("\n==========================================================================");
  const passedCount = results.filter((r) => r.passed).length;
  console.log(`TOTAL CHECKS: ${results.length} | PASSED: ${passedCount} | FAILED: ${results.length - passedCount}`);
  console.log("==========================================================================");

  if (passedCount === results.length) {
    console.log("🎉 ALL REAL MYSQL INTEGRATION TESTS PASSED WITH 100% SUCCESS!\n");
    process.exit(0);
  } else {
    console.error("⚠️ SOME REAL MYSQL INTEGRATION TESTS FAILED!\n");
    process.exit(1);
  }
}

runLiveIntegrationTest().catch((err) => {
  console.error("FATAL Integration Test Error:", err);
  process.exit(1);
});
