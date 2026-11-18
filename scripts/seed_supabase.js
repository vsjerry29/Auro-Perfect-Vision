/**
 * AURO PERFECT VISION — SUPABASE INITIAL SEED SCRIPT
 * Reads normalized data from data/cms/*.json and seeds Supabase PostgreSQL.
 *
 * Usage:
 *   node scripts/seed_supabase.js
 */

const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const DATA_DIR = path.join(__dirname, "..", "data", "cms");

// Load .env or .env.local if present
const envFiles = [".env.local", ".env"];
for (const envFile of envFiles) {
  const envPath = path.join(__dirname, "..", envFile);
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let val = match[2] || "";
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        if (!process.env[key]) process.env[key] = val;
      }
    }
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || SUPABASE_URL.includes("your-project-ref")) {
  console.log("====================================================================");
  console.log("Supabase credentials not configured in environment.");
  console.log("To seed a live Supabase instance, set:");
  console.log("  NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co");
  console.log("  SUPABASE_SERVICE_ROLE_KEY=<service-role-key>");
  console.log("====================================================================");
  process.exit(0);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function loadJson(filename, defVal = []) {
  try {
    const p = path.join(DATA_DIR, filename);
    if (fs.existsSync(p)) {
      return JSON.parse(fs.readFileSync(p, "utf-8"));
    }
  } catch {}
  return defVal;
}

async function seed() {
  console.log(`Connecting to Supabase at: ${SUPABASE_URL}`);

  // 1. Staff Profiles
  const staff = loadJson("staff_users.json");
  console.log(`Seeding ${staff.length} staff profiles...`);
  for (const s of staff) {
    await supabase.from("staff_profiles").upsert([
      {
        id: s.id.startsWith("staff-") ? undefined : s.id,
        email: s.email,
        full_name: s.fullName,
        role: s.role,
        phone: s.phone || "",
        password_hash: s.passwordHash,
        salt: s.salt,
        is_active: s.isActive ?? true,
        status: s.status || "active",
        therapist_id: s.therapistId || null,
        created_at: s.createdAt || new Date().toISOString(),
        updated_at: s.updatedAt || new Date().toISOString(),
      },
    ]);
  }

  // 2. Site Content
  const siteContent = loadJson("site_content.json", {});
  if (siteContent.heroHeadline) {
    console.log("Seeding site content...");
    await supabase.from("site_content").upsert([
      {
        id: "global_settings",
        hero_headline: siteContent.heroHeadline,
        hero_subtitle: siteContent.heroSubtitle,
        hero_image_url: siteContent.heroImageUrl,
        primary_cta_text: siteContent.primaryCtaText || "Explore Therapies & Book",
        primary_cta_link: siteContent.primaryCtaLink || "/therapies",
        about_heading: siteContent.aboutHeading || "",
        about_summary: siteContent.aboutSummary || "",
        phone: siteContent.phone || "+91 8012305151",
        email: siteContent.email || "connect@auroperfectvision.com",
        address: siteContent.address || "Auroville, Tamil Nadu 605101, India",
        whatsapp_link: siteContent.whatsappLink || "https://wa.me/918012305151",
        opening_hours: siteContent.openingHours || "Monday - Saturday: 9:00 AM - 5:30 PM IST",
        updated_at: new Date().toISOString(),
      },
    ]);
  }

  // 3. Therapists
  const therapists = loadJson("therapists.json");
  console.log(`Seeding ${therapists.length} therapists...`);
  for (const t of therapists) {
    await supabase.from("therapist_profiles").upsert([
      {
        id: t.id.startsWith("therapist-") ? undefined : t.id,
        slug: t.slug,
        display_name: t.displayName,
        role_title: t.roleTitle,
        bio: t.bio,
        specialties: t.specialties || [],
        qualifications: t.qualifications || "",
        photo_url: t.photoUrl || "",
        phone: t.phone || "",
        email: t.email || "",
        is_published: t.isPublished ?? true,
      },
    ]);
  }

  // 4. Offerings & Prices
  const offerings = loadJson("offerings.json");
  console.log(`Seeding ${offerings.length} offerings...`);
  for (const o of offerings) {
    const { data: insertedOffering } = await supabase
      .from("offerings")
      .upsert([
        {
          id: o.id.startsWith("off-") ? undefined : o.id,
          slug: o.slug,
          title: o.title,
          short_description: o.shortDescription,
          full_description: o.fullDescription,
          category: o.category || "natural_vision_improvement",
          format: o.format || "individual",
          delivery: o.delivery || "onsite",
          duration_minutes: o.durationMinutes || 60,
          max_capacity: o.maxCapacity || 1,
          is_flagship_programme: o.isFlagshipProgramme || false,
          image_url: o.imageUrl || "",
          what_to_expect: o.whatToExpect || [],
          suitable_for: o.suitableFor || [],
          is_published: o.isPublished ?? true,
        },
      ])
      .select()
      .single();

    if (insertedOffering && o.price) {
      await supabase.from("prices").upsert([
        {
          offering_id: insertedOffering.id,
          inr_amount: o.price.inr || 2000,
          usd_amount: o.price.usd || 40,
          is_active: true,
        },
      ]);
    }
  }

  // 5. Blog Posts
  const blogs = loadJson("blog_posts.json");
  console.log(`Seeding ${blogs.length} blog posts...`);
  for (const b of blogs) {
    await supabase.from("blog_posts").upsert([
      {
        id: b.id.startsWith("post-") ? undefined : b.id,
        slug: b.slug,
        title: b.title,
        excerpt: b.excerpt,
        content: b.content,
        category: b.category || "Ocular Wellness",
        read_time: b.readTime || "5 min read",
        published_date: b.publishedDate || "2026-11-01",
        author_name: b.authorName || "Auro Perfect Vision Team",
        cover_image: b.coverImage || "",
        is_published: b.isPublished ?? true,
      },
    ]);
  }

  // 6. Programmes
  const programmes = loadJson("programmes.json");
  console.log(`Seeding ${programmes.length} programmes...`);
  for (const p of programmes) {
    await supabase.from("programmes").upsert([
      {
        id: p.id.startsWith("prog-") ? undefined : p.id,
        slug: p.slug,
        title: p.title,
        short_description: p.shortDescription,
        full_description: p.fullDescription,
        duration_label: p.durationLabel || "7 Days / 6 Nights",
        duration_days: p.durationDays || 7,
        daily_session_minutes: p.dailySessionMinutes || 180,
        format: p.format || "group",
        delivery: p.delivery || "onsite",
        price_inr: p.priceInr || 28000,
        price_usd: p.priceUsd || 420,
        location: p.location || "Auroville, Tamil Nadu, India",
        max_capacity: p.maxCapacity || 12,
        image_url: p.imageUrl || "",
        itinerary: p.itinerary || [],
        inclusions: p.inclusions || [],
        preparation_guidelines: p.preparationGuidelines || [],
        cohorts: p.cohorts || [],
        is_published: p.isPublished ?? true,
      },
    ]);
  }

  console.log("Supabase database seeding completed successfully.");
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
