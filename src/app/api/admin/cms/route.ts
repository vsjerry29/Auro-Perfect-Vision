import { NextResponse } from "next/server";
import { getCurrentStaffSession } from "@/lib/server/auth";
import {
  getSiteContent,
  saveSiteContent,
  getCmsRevisions,
  createCmsRevision,
  rollbackCmsRevision,
  logAuditEvent,
} from "@/lib/server/cms";

export async function GET(request: Request) {
  const session = await getCurrentStaffSession();
  if (!session || (session.role !== "admin" && session.role !== "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const includeRevisions = searchParams.get("revisions") === "true";

  const content = getSiteContent();
  const revisions = includeRevisions ? getCmsRevisions("global_settings") : [];

  return NextResponse.json({ content, revisions });
}

export async function PUT(request: Request) {
  const session = await getCurrentStaffSession();
  if (!session || (session.role !== "admin" && session.role !== "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    if (body.action === "rollback" && body.revisionId) {
      const rolledBack = rollbackCmsRevision(body.revisionId);
      if (!rolledBack) {
        return NextResponse.json({ error: "Revision not found" }, { status: 404 });
      }
      logAuditEvent({
        staffId: session.userId,
        staffEmail: session.email,
        staffName: session.fullName,
        action: "CMS_ROLLBACK",
        entityType: "SiteContent",
        entityId: body.revisionId,
      });
      return NextResponse.json({ success: true, content: getSiteContent() });
    }

    // Save current content as revision before updating
    const previous = getSiteContent();
    createCmsRevision(
      "global_settings",
      `Revision by ${session.fullName}`,
      previous,
      { id: session.userId, fullName: session.fullName }
    );

    const updated = saveSiteContent(body);

    logAuditEvent({
      staffId: session.userId,
      staffEmail: session.email,
      staffName: session.fullName,
      action: "CMS_UPDATED",
      entityType: "SiteContent",
      entityId: "global_settings",
    });

    return NextResponse.json({ success: true, content: updated });
  } catch (err: any) {
    return NextResponse.json({ error: "Server error saving site content" }, { status: 500 });
  }
}
