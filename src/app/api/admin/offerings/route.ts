import { NextResponse } from "next/server";
import { getCurrentStaffSession } from "@/lib/server/auth";
import {
  getAllOfferings,
  saveOffering,
  duplicateOffering,
  deleteOffering,
} from "@/lib/server/cms";

export async function GET() {
  const session = await getCurrentStaffSession();
  if (!session || (session.role !== "admin" && session.role !== "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const offerings = getAllOfferings(true);
  return NextResponse.json({ offerings });
}

export async function POST(request: Request) {
  const session = await getCurrentStaffSession();
  if (!session || (session.role !== "admin" && session.role !== "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, id, ...offeringData } = body;

    if (action === "duplicate" && id) {
      const duplicated = duplicateOffering(id);
      if (!duplicated) {
        return NextResponse.json({ error: "Offering not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, offering: duplicated });
    }

    if (!offeringData.title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const saved = saveOffering(offeringData);
    return NextResponse.json({ success: true, offering: saved });
  } catch (err: any) {
    console.error("Save offering error:", err);
    return NextResponse.json({ error: "Server error saving offering" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await getCurrentStaffSession();
  if (!session || (session.role !== "admin" && session.role !== "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (!body.id || !body.title) {
      return NextResponse.json({ error: "ID and Title are required" }, { status: 400 });
    }

    const updated = saveOffering(body);
    return NextResponse.json({ success: true, offering: updated });
  } catch (err: any) {
    return NextResponse.json({ error: "Server error updating offering" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getCurrentStaffSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const success = deleteOffering(id);
    return NextResponse.json({ success });
  } catch (err: any) {
    return NextResponse.json({ error: "Server error deleting offering" }, { status: 500 });
  }
}
