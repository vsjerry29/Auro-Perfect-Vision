import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getPersistentUploadDir } from "@/lib/server/storage-engine";

// MIME types lookup
const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: filePathSegments } = await params;
    if (!filePathSegments || filePathSegments.length === 0) {
      return new NextResponse("File not found", { status: 404 });
    }

    // Security: Block any traversal attempts or access to sensitive/clinical documents
    const hasSensitivePattern = filePathSegments.some(
      (seg) =>
        seg.startsWith(".") ||
        seg.toLowerCase().includes("private") ||
        seg.toLowerCase().includes("clinical") ||
        seg.toLowerCase().includes("emr") ||
        seg.toLowerCase().includes("intake")
    );

    if (hasSensitivePattern) {
      return new NextResponse("Access forbidden: Confidential record", { status: 403 });
    }

    const uploadDir = getPersistentUploadDir();

    // Prevent directory traversal attacks
    const requestedPath = path.join(uploadDir, ...filePathSegments);
    const resolvedPath = path.resolve(requestedPath);
    const resolvedUploadDir = path.resolve(uploadDir);

    if (!resolvedPath.startsWith(resolvedUploadDir)) {
      return new NextResponse("Access forbidden", { status: 403 });
    }

    if (!fs.existsSync(resolvedPath)) {
      return new NextResponse("File not found", { status: 404 });
    }

    const stat = await fs.promises.stat(resolvedPath);
    if (!stat.isFile()) {
      return new NextResponse("File not found", { status: 404 });
    }

    const ext = path.extname(resolvedPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    const fileBuffer = await fs.promises.readFile(resolvedPath);

    const headers: Record<string, string> = {
      "Content-Type": contentType,
      "Content-Length": stat.size.toString(),
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    };

    // Stored XSS defense for vector graphics
    if (ext === ".svg") {
      headers["Content-Security-Policy"] = "default-src 'none'; style-src 'unsafe-inline'";
    } else if (ext === ".pdf") {
      headers["Content-Disposition"] = "inline";
    }

    return new NextResponse(fileBuffer, {
      status: 200,
      headers,
    });
  } catch (err: any) {
    return new NextResponse("Error reading file", { status: 500 });
  }
}
