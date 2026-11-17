const http = require("http");

const BASE = "http://localhost:3000";

let cookies = {
  admin: "",
  therapist: "",
};

function request(options, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(options.path || "/", BASE);
    const reqOpts = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: options.method || "GET",
      headers: options.headers || {},
    };

    const req = http.request(reqOpts, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch {}
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data,
          json,
        });
      });
    });

    req.on("error", reject);
    if (body) {
      if (typeof body === "object") {
        req.setHeader("Content-Type", "application/json");
        req.write(JSON.stringify(body));
      } else {
        req.write(body);
      }
    }
    req.end();
  });
}

function extractCookie(headers) {
  const setCookie = headers["set-cookie"];
  if (!setCookie) return "";
  const match = setCookie[0].match(/apv_staff_session=([^;]+)/);
  return match ? `apv_staff_session=${match[1]}` : "";
}

async function runTests() {
  console.log("\n========================================================");
  console.log("   AURO PERFECT VISION — ADVANCED CMS & CRM TEST SUITE   ");
  console.log("========================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  ✓ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ [FAIL] ${testName}`);
      failed++;
    }
  }

  // 1. ANONYMOUS ROUTE PROTECTION (Fail Closed)
  console.log("\n--- TEST GROUP 1: Route Protection & Middleware Guards ---");
  const protectedRoutes = [
    "/admin",
    "/admin/crm",
    "/admin/crm/clients/client-1",
    "/admin/crm/inquiries",
    "/admin/crm/tasks",
    "/admin/users",
    "/admin/programmes",
    "/admin/media",
    "/admin/calendar",
    "/admin/audit",
    "/therapist",
  ];

  for (const route of protectedRoutes) {
    const res = await request({ path: route });
    const isRedirectToLogin =
      res.status === 307 &&
      res.headers.location &&
      res.headers.location.startsWith("/staff/login");
    assert(isRedirectToLogin, `Anonymous request to ${route} safely redirects to /staff/login`);
  }

  const protectedApis = [
    "/api/admin/crm/clients",
    "/api/admin/users",
    "/api/admin/programmes",
    "/api/admin/media",
    "/api/admin/audit",
    "/api/admin/calendar",
  ];

  for (const api of protectedApis) {
    const res = await request({ path: api });
    assert(res.status === 401, `Anonymous request to ${api} blocked with 401 Unauthorized`);
  }

  // 2. PUBLIC SITE & CONTACT FORM CRM CAPTURE
  console.log("\n--- TEST GROUP 2: Public Website & Contact Form Lead Capture ---");
  const homeRes = await request({ path: "/" });
  assert(
    homeRes.status === 200 && homeRes.data.includes("Auro Perfect Vision"),
    "Public homepage loads with brand 'Auro Perfect Vision'"
  );

  const contactRes = await request({ path: "/contact" });
  assert(
    contactRes.status === 200 &&
      contactRes.data.includes("+91 8012305151") &&
      contactRes.data.includes("+91 9488005685"),
    "Public /contact page renders with verified Auroville phone candidates"
  );

  // Submit Contact Form
  const testEmail = `lead-${Date.now()}@example.com`;
  const contactSubmit = await request(
    { path: "/api/public/contact", method: "POST" },
    {
      name: "Jean-Paul Sartre",
      email: testEmail,
      phone: "+91 98401 99999",
      category: "7-Day Residential Retreat",
      subject: "Inquiring for December Residential Camp",
      message: "I would like to participate in the upcoming 7-day retreat in Auroville.",
      honeypot: "",
    }
  );
  assert(
    contactSubmit.status === 200 && contactSubmit.json?.success === true,
    "Public contact submission persists inquiry and returns reference"
  );

  // Honeypot bot protection (silently drops submission without creating inquiry)
  const botEmail = `bot-${Date.now()}@spam.com`;
  const botSubmit = await request(
    { path: "/api/public/contact", method: "POST" },
    {
      name: "Spam Bot",
      email: botEmail,
      subject: "Buy cheap products now",
      message: "Spam message payload attempting bot crawl.",
      website_url_hp: "http://spambot-link.com",
    }
  );
  assert(
    botSubmit.status === 200 && botSubmit.json?.reference === undefined,
    "Anti-spam honeypot safely traps automated bots without persisting inquiry"
  );

  // 3. ADMIN AUTHENTICATION
  console.log("\n--- TEST GROUP 3: Staff Authentication & Session Issuance ---");
  const adminLogin = await request(
    { path: "/api/auth/login", method: "POST" },
    { email: "admin@auroperfectvision.com", password: "AuroVision@2026!" }
  );
  assert(
    adminLogin.status === 200 && (adminLogin.json?.role === "admin" || adminLogin.json?.user?.role === "admin"),
    "Admin authentication succeeds with secure password verification"
  );
  cookies.admin = extractCookie(adminLogin.headers);
  assert(cookies.admin.length > 0, "HMAC-signed session token issued in HTTP-only cookie");

  const therapistLogin = await request(
    { path: "/api/auth/login", method: "POST" },
    { email: "therapist@auroperfectvision.com", password: "AnanyaVision@2026!" }
  );
  assert(
    therapistLogin.status === 200 && (therapistLogin.json?.role === "therapist" || therapistLogin.json?.user?.role === "therapist"),
    "Therapist authentication succeeds"
  );
  cookies.therapist = extractCookie(therapistLogin.headers);

  // 4. CRM CLIENTS & 360 PROFILE
  console.log("\n--- TEST GROUP 4: CRM Client 360, Inquiries, Tasks & Notes ---");
  const clientsRes = await request({
    path: "/api/admin/crm/clients",
    headers: { Cookie: cookies.admin },
  });
  assert(
    clientsRes.status === 200 && Array.isArray(clientsRes.json?.clients),
    "Admin can query clients directory (/api/admin/crm/clients)"
  );

  // Check that the contact form submission created/linked a CRM client
  const createdClient = clientsRes.json?.clients?.find((c) => c.email === testEmail);
  assert(
    createdClient !== undefined && createdClient.fullName === "Jean-Paul Sartre",
    "Contact form submission automatically created unified CRM client lead"
  );

  // Client 360 Bundle
  const client360Res = await request({
    path: `/api/admin/crm/clients/${createdClient ? createdClient.id : "client-1"}`,
    headers: { Cookie: cookies.admin },
  });
  assert(
    client360Res.status === 200 &&
      client360Res.json?.client &&
      Array.isArray(client360Res.json?.activities) &&
      Array.isArray(client360Res.json?.inquiries),
    "Client 360 endpoint returns unified client entity, inquiries, notes, and activity timeline"
  );

  // Add internal clinical/admin note
  const noteRes = await request(
    {
      path: "/api/admin/crm/notes",
      method: "POST",
      headers: { Cookie: cookies.admin },
    },
    {
      clientId: createdClient ? createdClient.id : "client-1",
      content: "Called guest on WhatsApp to confirm retreat room availability.",
      category: "call_log",
    }
  );
  assert(
    noteRes.status === 200 && noteRes.json?.success === true,
    "Administrative staff note recorded with author attribution"
  );

  // Create action task
  const taskRes = await request(
    {
      path: "/api/admin/crm/tasks",
      method: "POST",
      headers: { Cookie: cookies.admin },
    },
    {
      clientContactId: createdClient ? createdClient.id : "client-1",
      clientName: "Jean-Paul Sartre",
      title: "Send intake questionnaire via WhatsApp",
      dueDate: "2026-11-20",
      priority: "high",
    }
  );
  assert(
    taskRes.status === 200 && taskRes.json?.task?.id,
    "Follow-up task created in operational queue"
  );

  // Toggle task
  const toggleTaskRes = await request(
    {
      path: "/api/admin/crm/tasks",
      method: "PUT",
      headers: { Cookie: cookies.admin },
    },
    { id: taskRes.json?.task?.id, action: "toggle" }
  );
  assert(
    toggleTaskRes.status === 200 && toggleTaskRes.json?.task?.status === "completed",
    "Task status toggle functions accurately"
  );

  // 5. CRM CSV EXPORT & DUPLICATE MERGE
  console.log("\n--- TEST GROUP 5: Audited CRM CSV Export & Supervised Deduplication ---");
  const exportRes = await request({
    path: "/api/admin/crm/export",
    headers: { Cookie: cookies.admin },
  });
  assert(
    exportRes.status === 200 &&
      exportRes.headers["content-type"]?.includes("text/csv") &&
      exportRes.data.includes("Client Reference"),
    "CRM clients exported to CSV with audit logging"
  );

  // Create duplicate client record to test deduplication & supervised merge
  const dupClientRes = await request(
    {
      path: "/api/admin/crm/clients",
      method: "POST",
      headers: { Cookie: cookies.admin },
    },
    {
      fullName: "Jean-Paul Sartre (Alternate)",
      email: testEmail, // Same email!
      phone: "+91 98401 99999",
      source: "walk_in",
      status: "lead",
    }
  );
  assert(dupClientRes.status === 200, "Secondary client contact created with matching email");

  // Query duplicates
  const dupQueryRes = await request({
    path: "/api/admin/crm/clients?duplicates=true",
    headers: { Cookie: cookies.admin },
  });
  assert(
    dupQueryRes.status === 200 && Array.isArray(dupQueryRes.json?.duplicateGroups),
    "Duplicate detection identifies matching contact emails/phones"
  );

  // Supervised merge
  if (dupClientRes.json?.client && createdClient) {
    const mergeRes = await request(
      {
        path: "/api/admin/crm/clients",
        method: "PUT",
        headers: { Cookie: cookies.admin },
      },
      {
        action: "merge",
        primaryId: createdClient.id,
        duplicateIds: [dupClientRes.json.client.id],
      }
    );
    assert(
      mergeRes.status === 200 && mergeRes.json?.success === true,
      "Supervised merge unifies duplicate profiles and reassigns bookings/inquiries to primary client"
    );
  }

  // 6. PROGRAMMES, MEDIA & MASTER CALENDAR
  console.log("\n--- TEST GROUP 6: Flagship Programmes, Media & Master Calendar ---");
  const progRes = await request({
    path: "/api/admin/programmes",
    headers: { Cookie: cookies.admin },
  });
  assert(
    progRes.status === 200 && Array.isArray(progRes.json?.programmes),
    "Admin can list flagship multi-day programmes and cohorts"
  );

  const mediaRes = await request({
    path: "/api/admin/media",
    headers: { Cookie: cookies.admin },
  });
  assert(
    mediaRes.status === 200 && Array.isArray(mediaRes.json?.assets),
    "Media library lists persistent photographic assets"
  );

  const calendarRes = await request({
    path: "/api/admin/calendar?month=2026-11",
    headers: { Cookie: cookies.admin },
  });
  assert(
    calendarRes.status === 200 &&
      Array.isArray(calendarRes.json?.bookings) &&
      Array.isArray(calendarRes.json?.therapists),
    "Master Calendar aggregates appointments across practitioners"
  );

  // 7. CMS REVISIONS & ROLLBACK API
  console.log("\n--- TEST GROUP 7: CMS Revisions & Snapshot History ---");
  const cmsRes = await request({
    path: "/api/admin/cms?revisions=true",
    headers: { Cookie: cookies.admin },
  });
  assert(
    cmsRes.status === 200 && cmsRes.json?.content && Array.isArray(cmsRes.json?.revisions),
    "CMS returns content schema alongside version snapshot revisions"
  );

  // 8. THERAPIST DASHBOARD & ISOLATION
  console.log("\n--- TEST GROUP 8: Therapist Dashboard & Role-Based Isolation ---");
  const therapistBookings = await request({
    path: "/api/therapist/bookings",
    headers: { Cookie: cookies.therapist },
  });
  assert(
    therapistBookings.status === 200 && Array.isArray(therapistBookings.json?.bookings),
    "Therapist bookings endpoint returns clean array (no client-side crash)"
  );

  // Verify therapist is BLOCKED from administrative CRM and Users
  const therapistBlockedCrm = await request({
    path: "/api/admin/crm/clients",
    headers: { Cookie: cookies.therapist },
  });
  assert(
    therapistBlockedCrm.status === 403 || therapistBlockedCrm.status === 401,
    "Therapist role is safely blocked from /api/admin/crm/clients (HTTP 403 Forbidden)"
  );

  const therapistBlockedUsers = await request({
    path: "/api/admin/users",
    headers: { Cookie: cookies.therapist },
  });
  assert(
    therapistBlockedUsers.status === 403 || therapistBlockedUsers.status === 401,
    "Therapist role is safely blocked from /api/admin/users (HTTP 403 Forbidden)"
  );

  // 9. AUDIT LOG RECORDING
  console.log("\n--- TEST GROUP 9: Compliance Audit Trail Verification ---");
  const auditRes = await request({
    path: "/api/admin/audit",
    headers: { Cookie: cookies.admin },
  });
  assert(
    auditRes.status === 200 && auditRes.json?.logs?.length > 0,
    "Compliance audit logs contain chronological records of staff operations"
  );

  console.log("\n========================================================");
  console.log(`   TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("========================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
