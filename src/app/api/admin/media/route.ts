import { NextResponse } from "next/server";
import { getCurrentStaffSession } from "@/lib/server/auth";
import { getAllMediaAssets, saveMediaAsset, deleteMediaAsset, logAuditEvent } from "@/lib/server/cms";

export async function GET() {
  const session = await getCurrentStaffSession();
  if (!session || (session.role !== "admin" && session.role !== "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const assets = getAllMediaAssets();
  return NextResponse.json({ assets });
}

export async function POST(request: Request) {
  const session = await getCurrentStaffSession();
  if (!session || (session.role !== "admin" && session.role !== "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { fileName, originalName, publicUrl, fileSizeBytes, mimeType, altText } = body;

    if (!publicUrl) {
      return NextResponse.json({ error: "Public URL is required" }, { status: 400 });
    }

    const saved = saveMediaAsset({
      fileName: fileName || "image.webp",
      originalName: originalName || "image.webp",
      publicUrl,
      fileSizeBytes: fileSizeBytes || 100000,
      mimeType: mimeType || "image/webp",
      altText: altText || "Auro Perfect Vision Media Asset",
      uploadedByStaffId: session.userId,
      uploadedByStaffName: session.fullName,
    });

    logAuditEvent({
      staffId: session.userId,
      staffEmail: session.email,
      staffName: session.fullName,
      action: "MEDIA_ASSET_RECORDED",
      entityType: "MediaAsset",
      entityId: saved.id,
      details: { url: saved.publicUrl },
    });

    return NextResponse.json({ success: true, asset: saved });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to record media asset" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getCurrentStaffSession();
  if (!session || (session.role !== "admin" && session.role !== "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Media ID required" }, { status: 400 });
  }

  deleteMediaAsset(id);
  logAuditEvent({
    staffId: session.userId,
    staffEmail: session.email,
    staffName: session.fullName,
    action: "MEDIA_ASSET_DELETED",
    entityType: "MediaAsset",
    entityId: id,
  });

  return NextResponse.json({ success: true });
}
