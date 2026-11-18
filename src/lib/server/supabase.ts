import { createClient, SupabaseClient } from "@supabase/supabase-js";

let adminClientInstance: SupabaseClient | null = null;
let publicClientInstance: SupabaseClient | null = null;

const PLACEHOLDER_URL = "https://your-project-ref.supabase.co";
const PLACEHOLDER_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return false;
  if (url === PLACEHOLDER_URL || url.includes("your-project-ref")) return false;
  if (key === PLACEHOLDER_KEY || key.startsWith("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")) return false;

  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function getSupabaseAdminClient(): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "DATABASE_NOT_CONFIGURED: Supabase production database is not configured. " +
        "Please configure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment."
    );
  }

  if (adminClientInstance) {
    return adminClientInstance;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!;

  adminClientInstance = createClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return adminClientInstance;
}

export function getSupabaseClient(): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "DATABASE_NOT_CONFIGURED: Supabase production database is not configured. " +
        "Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment."
    );
  }

  if (publicClientInstance) {
    return publicClientInstance;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)!;

  publicClientInstance = createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return publicClientInstance;
}

/**
 * Uploads a file directly to Supabase Storage (bucket: 'media')
 * Ensures bucket exists and returns the permanent public CDN URL.
 */
export async function uploadMediaToSupabase(
  buffer: Buffer,
  filename: string,
  contentType: string
): Promise<string> {
  const supabase = getSupabaseAdminClient();

  const bucketName = "media";

  // Check or create bucket if needed
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some((b) => b.name === bucketName);
    if (!bucketExists) {
      await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 10 * 1024 * 1024, // 10MB
        allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
      });
    }
  } catch (err) {
    // Continue even if listBuckets fails due to policy; upload might still succeed
  }

  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(filename, buffer, {
      contentType,
      upsert: true,
    });

  if (error) {
    throw new Error(`Supabase Storage upload failed: ${error.message}`);
  }

  const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(filename);
  return urlData.publicUrl;
}
