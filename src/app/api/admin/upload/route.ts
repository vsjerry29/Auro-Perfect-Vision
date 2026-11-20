import { NextResponse } from "next/server";
import { getCurrentStaffSession } from "@/lib/server/auth";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { isMySQLConfigured } from "@/lib/server/mysql";
import * as db from "@/lib/server/mysql-db";
import { saveMediaAsset, logAuditEvent } from "@/lib/server/cms";
import { getPersistentUploadDir, isSafeSvg } from "@/lib/server/storage-engine";

// Strict allowed MIME types for holistic eye wellness platform
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
  "application/pdf",
];

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
        { error: "Invalid file type. Only JPG, PNG, WebP, SVG, and PDF are permitted." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum permitted file size is 10MB." },
        { status: 400 }
      );
    }

    // Determine durable persistent uploads directory (survives Git pulls / rebuilds on Hostinger)
    const uploadDir = getPersistentUploadDir();

    // Map extension strictly and safely
    let ext = ".jpg";
    if (file.type === "image/png") ext = ".png";
    else if (file.type === "image/webp") ext = ".webp";
    else if (file.type === "image/svg+xml") ext = ".svg";
    else if (file.type === "application/pdf") ext = ".pdf";

    const buffer = Buffer.from(await file.arrayBuffer());

    // Security restriction for SVG uploads: restricted to Super Administrators with strict sanitization
    if (file.type === "image/svg+xml") {
      if (session.role !== "super_admin") {
        return NextResponse.json(
          { error: "Security restriction: SVG vector uploads are restricted to Super Administrators." },
          { status: 403 }
        );
      }

      const svgText = buffer.toString("utf-8");
      const svgCheck = isSafeSvg(svgText);
      if (!svgCheck.isSafe) {
        return NextResponse.json(
          { error: `Security restriction: Untrusted SVG rejected. ${svgCheck.reason}` },
          { status: 400 }
        );
      }
    }

    const sanitizedBase = file.name
      ? path.basename(file.name).replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 30)
      : "asset";

    const filename = `media_${Date.now()}_${crypto.randomBytes(4).toString("hex")}_${sanitizedBase}${ext}`;
    const destinationPath = path.join(uploadDir, filename);

    await fs.promises.writeFile(destinationPath, buffer);

    const publicUrl = `/uploads/${filename}`;

    // Record metadata in CMS / MySQL
    try {
      const mediaRecord = {
        id: `media-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`,
        fileName: filename,
        originalName: file.name || filename,
        publicUrl,
        fileSizeBytes: file.size,
        mimeType: file.type,
        altText: file.name || "Auro Perfect Vision Media Asset",
        uploadedByStaffId: session.userId,
        uploadedByStaffName: session.fullName,
        createdAt: new Date().toISOString(),
      };

      saveMediaAsset(mediaRecord);

      if (isMySQLConfigured()) {
        await db.dbSaveMediaAsset(mediaRecord);
      }

      logAuditEvent({
        staffId: session.userId,
        staffEmail: session.email,
        staffName: session.fullName,
        action: "MEDIA_UPLOADED",
        entityType: "MediaAsset",
        entityId: mediaRecord.id,
        details: { url: publicUrl, filename, size: file.size, mimeType: file.type },
      });
    } catch (dbErr: any) {
      console.warn("[Media Metadata DB Warning]:", dbErr.message);
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
