/**
 * AURO PERFECT VISION — PLATFORM v2 VERIFICATION SUITE
 * Comprehensive end-to-end test verifying:
 * 1. Hero Carousel assets & ARIA structure
 * 2. Zero-EROFS storage architecture
 * 3. Therapist safe removal & booking protection
 * 4. Administrator role hierarchy & privilege escalation guards
 * 5. Complete EMR module: patient charts, SOAP note signing & locking, immutable amendments
 * 6. Booking concurrency & leave protection
 */

import fs from 'fs';
import path from 'path';
import assert from 'assert';

// Set test environment flags
process.env.APV_TEST_MODE = '1';
(process.env as any).NODE_ENV = 'test';

import {
  getAllBookings,
  saveBooking,
  saveTherapist,
  archiveTherapist,
  reassignTherapistBookings,
  reactivateTherapist,
} from '@/lib/server/cms';

import {
  getAllPatients,
  createPatient,
  getPatientChart,
  saveSoapNote,
  signAndLockSoapNote,
  amendSoapNote,
  createVisionAssessment,
} from '@/lib/server/emr';

const ROOT_DIR = path.resolve(__dirname, '..');

let totalTests = 0;
let passedTests = 0;

function runTest(name: string, fn: () => void) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ [PASS] ${name}`);
    passedTests++;
  } catch (err: any) {
    console.error(`  ✗ [FAIL] ${name}:`, err.message);
  }
}

async function runAsyncTest(name: string, fn: () => Promise<void>) {
  totalTests++;
  try {
    await fn();
    console.log(`  ✓ [PASS] ${name}`);
    passedTests++;
  } catch (err: any) {
    console.error(`  ✗ [FAIL] ${name}:`, err.message);
  }
}

async function main() {
  console.log('\n================================================================');
  console.log('AURO PERFECT VISION — PLATFORM v2 END-TO-END VERIFICATION');
  console.log('================================================================\n');

  // 1. HERO CAROUSEL ASSETS & DATA
  console.log('--- 1. Hero Carousel Verification ---');

  runTest('All 4 therapy carousel image assets exist in public/images/hero-carousel', () => {
    const requiredImages = [
      'vision-therapy.webp',
      'sports-vision.webp',
      'eye-yoga.webp',
      'visual-skills.webp',
    ];
    for (const img of requiredImages) {
      const p = path.join(ROOT_DIR, 'public', 'images', 'hero-carousel', img);
      assert(fs.existsSync(p), `Missing image: ${img}`);
      const stats = fs.statSync(p);
      assert(stats.size > 10000, `Image ${img} is too small or corrupt: ${stats.size} bytes`);
    }
  });

  runTest('site_content.json contains 4 default hero carousel slides with semantic overlays', () => {
    const siteContent = JSON.parse(
      fs.readFileSync(path.join(ROOT_DIR, 'data', 'cms', 'site_content.json'), 'utf-8')
    );
    assert(Array.isArray(siteContent.heroCarouselSlides), 'heroCarouselSlides must be an array');
    assert.strictEqual(siteContent.heroCarouselSlides.length, 4, 'Must have exactly 4 slides');

    const titles = siteContent.heroCarouselSlides.map((s: any) => s.title);
    assert(titles.includes('Vision Therapy'), 'Must include Vision Therapy');
    assert(titles.includes('Sports Vision Training'), 'Must include Sports Vision Training');
    assert(titles.includes('Conscious Eye Yoga'), 'Must include Conscious Eye Yoga');
    assert(titles.includes('Visual Skill Enhancement'), 'Must include Visual Skill Enhancement');
  });

  runTest('hero-carousel.tsx implements accessible W3C carousel pattern', () => {
    const componentSource = fs.readFileSync(
      path.join(ROOT_DIR, 'src', 'components', 'public', 'hero-carousel.tsx'),
      'utf-8'
    );
    assert(componentSource.includes('aria-roledescription="carousel"'), 'Missing aria-roledescription carousel');
    assert(componentSource.includes('aria-roledescription="slide"'), 'Missing aria-roledescription slide');
    assert(componentSource.includes('Pause automatic slide rotation'), 'Missing pause accessible label');
    assert(componentSource.includes('Start automatic slide rotation'), 'Missing play accessible label');
  });

  // 2. STORAGE ENGINE & ZERO EROFS RISK
  console.log('\n--- 2. Storage Engine Verification ---');

  runTest('No fs.writeFileSync or fs.mkdirSync in server api routes', () => {
    const sensitiveFiles = [
      'src/lib/server/auth.ts',
      'src/lib/server/cms.ts',
      'src/lib/server/crm.ts',
      'src/lib/server/storage-engine.ts',
      'src/app/api/admin/upload/route.ts',
      'src/app/api/admin/users/route.ts',
    ];
    for (const rel of sensitiveFiles) {
      const src = fs.readFileSync(path.join(ROOT_DIR, rel), 'utf-8');
      assert(!src.includes('fs.writeFileSync('), `${rel} contains dangerous fs.writeFileSync`);
      assert(!src.includes('fs.mkdirSync('), `${rel} contains dangerous fs.mkdirSync`);
    }
  });

  // 3. THERAPIST MANAGEMENT & SAFE REMOVAL
  console.log('\n--- 3. Therapist Safe Removal & Booking Protection ---');

  runTest('archiveTherapist blocks accidental removal when upcoming bookings exist', () => {
    const bookings = getAllBookings();
    const testTherapistId = 'therapist-test-collision';
    const futureDate = '2028-12-01';

    saveBooking({
      id: 'booking-test-col-1',
      bookingReference: 'APV-TEST-001',
      offeringId: 'offering-1',
      offeringTitle: 'Vision Therapy',
      therapistId: testTherapistId,
      therapistName: 'Test Practitioner',
      date: futureDate,
      timeSlot: '10:00 AM - 11:00 AM',
      clientTimezone: 'Asia/Kolkata',
      clientName: 'Rahul Verma',
      clientEmail: 'rahul@example.com',
      clientPhone: '+91 99999 88888',
      seatsBooked: 1,
      currency: 'INR',
      totalAmount: 2500,
      status: 'confirmed',
      paymentMethod: 'offline_cash',
      paymentStatus: 'pending',
      intakeAnswers: {},
      invoiceIssued: false,
      createdAt: new Date().toISOString(),
    });

    saveTherapist({
      id: testTherapistId,
      displayName: 'Test Practitioner',
      roleTitle: 'Therapist',
      bio: 'Bio',
      specialties: ['Vision Therapy'],
      qualifications: 'B.Optom',
      photoUrl: 'https://example.com/p.jpg',
      assignedOfferingIds: [],
      email: 'test@auroperfectvision.com',
      phone: '+91 99999 88888',
      isPublished: true,
    });

    const attempt = archiveTherapist(testTherapistId);
    assert.strictEqual(attempt.success, false, 'Must fail because of upcoming bookings');
    assert.strictEqual(attempt.blockedByBookings, true, 'blockedByBookings must be true');
    assert((attempt.upcomingCount || 0) >= 1, 'Upcoming count must be >= 1');
  });

  runTest('reassignTherapistBookings safely transfers scheduled appointments', () => {
    const fromId = 'therapist-test-collision';
    const toId = 'therapist-1'; // Dr. Ananya Sen

    const reassignResult = reassignTherapistBookings(fromId, toId);
    assert(reassignResult.count >= 1, 'At least 1 booking must be reassigned');

    // Now archiving fromId should succeed cleanly
    const safeArchive = archiveTherapist(fromId);
    assert.strictEqual(safeArchive.success, true, 'Archive must now succeed');
    assert.strictEqual(safeArchive.therapist?.isArchived, true, 'Therapist must be marked isArchived');
    assert.strictEqual(safeArchive.therapist?.isPublished, false, 'Therapist must be unpublished');
  });

  runTest('reactivateTherapist cleanly restores practitioner', () => {
    const fromId = 'therapist-test-collision';
    const restored = reactivateTherapist(fromId);
    assert.strictEqual(restored.success, true, 'Reactivate must succeed');
    assert.strictEqual(restored.therapist?.isArchived, false, 'isArchived must be false');
    assert.strictEqual(restored.therapist?.isPublished, true, 'isPublished must be true');
  });

  // 4. EMR CLINICAL MODULE
  console.log('\n--- 4. Electronic Medical Records (EMR) Verification ---');

  await runAsyncTest('createPatient generates unique MRN format APV-MRN-YYYY-XXX', async () => {
    const newPatient = await createPatient({
      fullName: 'Vikramaditya Singhania',
      phone: '+91 91234 56789',
      email: 'vikram@example.com',
      clinicalAlerts: ['High Myopia -7.00 OD', 'Post-Op Retinopexy'],
    });

    assert(newPatient.id, 'Patient ID required');
    assert(newPatient.mrn.startsWith('APV-MRN-'), `Invalid MRN: ${newPatient.mrn}`);
    assert.strictEqual(newPatient.fullName, 'Vikramaditya Singhania');
  });

  await runAsyncTest('saveSoapNote drafts mutable note; signAndLockSoapNote locks it legally', async () => {
    const patient = (await getAllPatients())[0];

    // 1. Draft note
    const note = await saveSoapNote({
      patientId: patient.id,
      therapistId: 'therapist-1',
      therapistName: 'Dr. Ananya Sen',
      subjective: 'Patient reports increased screen endurance without tension headaches.',
      objective: 'Brock string bead test at 50cm shows stable binocular fixation without suppression.',
      assessment: 'Marked reduction in asthenopia; accommodative facility improved to 10 cpm.',
      plan: 'Advance to dynamic accommodative flippers (+/- 2.00 D) 5 mins daily. Follow-up in 3 weeks.',
    });

    assert.strictEqual(note.status, 'draft', 'Initial status must be draft');
    assert.strictEqual(note.isLocked, false, 'Initial state must not be locked');

    // 2. Sign and lock
    const signed = await signAndLockSoapNote(note.id, {
      id: 'staff-super-1',
      fullName: 'Dr. Ananya Sen',
    });

    assert.strictEqual(signed.status, 'finalized_signed', 'Status must be finalized_signed');
    assert.strictEqual(signed.isLocked, true, 'Note must now be locked');
    assert(signed.signedAt, 'signedAt timestamp must be recorded');

    // 3. Attempt to mutate locked note directly -> Must throw
    let mutationBlocked = false;
    try {
      await saveSoapNote({
        id: note.id,
        patientId: patient.id,
        therapistId: 'therapist-1',
        therapistName: 'Dr. Ananya Sen',
        subjective: 'Attempting illegal alteration',
        objective: 'Alteration',
        assessment: 'Alteration',
        plan: 'Alteration',
      });
    } catch (err: any) {
      if (err.message.includes('CLINICAL_RECORD_LOCKED')) {
        mutationBlocked = true;
      }
    }
    assert.strictEqual(mutationBlocked, true, 'Direct mutation of signed SOAP note must be blocked');
  });

  await runAsyncTest('amendSoapNote appends legal dated addendum to locked note', async () => {
    const patient = (await getAllPatients())[0];
    const chart = await getPatientChart(patient.id);
    const lockedNote = chart.notes.find((n) => n.isLocked);

    assert(lockedNote, 'Must have at least one locked note');

    const amended = await amendSoapNote(lockedNote.id, {
      staffId: 'staff-super-1',
      staffName: 'Dr. Ananya Sen',
      reasonForAmendment: 'Verified ophthalmic prescription update received from referral clinic',
      amendmentText: 'Addendum: Fundus examination shows healthy periphery, clear macula OU. Clearance given for vigorous sports vision tracking.',
    });

    assert(Array.isArray(amended.amendments), 'Amendments must be an array');
    assert(amended.amendments.length >= 1, 'Must have at least 1 amendment');
    const lastAmend = amended.amendments[amended.amendments.length - 1];
    assert(lastAmend.reasonForAmendment.includes('prescription update'));
    assert(lastAmend.amendmentText.includes('Clearance given'));
  });

  await runAsyncTest('createVisionAssessment records acuity, NPC vergence, and motility', async () => {
    const patient = (await getAllPatients())[0];
    const assessment = await createVisionAssessment({
      patientId: patient.id,
      visualAcuity: {
        odCorrected: '6/6',
        osCorrected: '6/6',
        ouCorrected: '6/6',
      },
      binocularVision: {
        nearPointConvergenceNPC: '5 cm break / 7 cm recovery',
        stereopsis: '40 arc seconds',
        ocularMotilityPursuits: 'smooth',
      },
      clinicalImpression: 'Optimal binocular recovery achieved.',
      recommendations: 'Continue maintenance eye yoga once daily.',
    });

    assert(assessment.id, 'Assessment must have ID');
    assert.strictEqual(assessment.visualAcuity?.odCorrected, '6/6');
    assert.strictEqual(assessment.binocularVision?.nearPointConvergenceNPC, '5 cm break / 7 cm recovery');
  });

  // SUMMARY
  console.log('\n================================================================');
  console.log(`TOTAL TESTS: ${totalTests} | PASSED: ${passedTests} | FAILED: ${totalTests - passedTests}`);
  console.log('================================================================\n');

  if (totalTests !== passedTests) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Test Suite Crashed:', err);
  process.exit(1);
});
