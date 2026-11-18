import { NextResponse } from "next/server";
import { getCurrentStaffSession } from "@/lib/server/auth";
import crypto from "crypto";
import { isSupabaseConfigured, uploadMediaToSupabase } from "@/lib/server/supabase";
import { isTestMode } from "@/lib/server/storage-engine";

// Allowed MIME types
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(request: Request) {
  try {
    const session = await getCurrentStaffSession();
    if (!session || (session.role !== "admin" && session.role !== "super_admin")) {
      return NextResponse.json(
        { error: "Unauthorized: Admin session required for uploads." },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid image type. Only JPG, PNG, and WebP are permitted." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum permitted image size is 10MB." },
        { status: 400 }
      );
    }

    const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const filename = `media_${Date.now()}_${crypto.randomBytes(4).toString("hex")}.${extension}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    let publicUrl = "";

    if (isSupabaseConfigured()) {
      publicUrl = await uploadMediaToSupabase(buffer, filename, file.type);
    } else if (isTestMode()) {
      // Test environment simulation
      publicUrl = `https://mock-storage.auroperfectvision.com/media/${filename}`;
    } else {
      return NextResponse.json(
        {
          error:
            "STORAGE_NOT_CONFIGURED: Supabase Storage is required for media uploads in production. " +
            "Please configure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename,
      size: file.size,
      mimeType: file.type,
    });
  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: err.message || "Server error during media upload." },
      { status: 500 }
    );
  }
}
