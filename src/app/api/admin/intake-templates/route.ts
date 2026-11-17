import { NextResponse } from "next/server";
import { getCurrentStaffSession } from "@/lib/server/auth";
import { getIntakeTemplateForOffering, saveIntakeTemplate } from "@/lib/server/cms";

export async function GET(request: Request) {
  const session = await getCurrentStaffSession();
  if (!session || (session.role !== "admin" && session.role !== "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const offeringId = searchParams.get("offeringId") || "off-1";
  const template = getIntakeTemplateForOffering(offeringId);
  return NextResponse.json({ template });
}

export async function PUT(request: Request) {
  const session = await getCurrentStaffSession();
  if (!session || (session.role !== "admin" && session.role !== "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { offeringId, fields } = body;
    if (!offeringId || !Array.isArray(fields)) {
      return NextResponse.json({ error: "Offering ID and fields array required" }, { status: 400 });
    }

    const updated = saveIntakeTemplate(offeringId, fields);
    return NextResponse.json({ success: true, template: updated });
  } catch (err: any) {
    return NextResponse.json({ error: "Server error saving intake template" }, { status: 500 });
  }
}
