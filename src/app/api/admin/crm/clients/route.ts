import { NextResponse } from "next/server";
import { getCurrentStaffSession } from "@/lib/server/auth";
import {
  getAllClients,
  saveClient,
  archiveClient,
  mergeClients,
  detectPotentialDuplicates,
} from "@/lib/server/crm";

export async function GET(request: Request) {
  const session = await getCurrentStaffSession();
  if (!session || (session.role !== "admin" && session.role !== "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || undefined;
  const tag = searchParams.get("tag") || undefined;
  const status = searchParams.get("status") || undefined;
  const duplicatesOnly = searchParams.get("duplicates") === "true";

  if (duplicatesOnly) {
    const duplicateGroups = detectPotentialDuplicates();
    return NextResponse.json({ duplicateGroups });
  }

  const clients = getAllClients({ search, tag, status });
  return NextResponse.json({ clients });
}

export async function POST(request: Request) {
  const session = await getCurrentStaffSession();
  if (!session || (session.role !== "admin" && session.role !== "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (!body.fullName || !body.email) {
      return NextResponse.json({ error: "Full Name and Email are required." }, { status: 400 });
    }

    const saved = saveClient(body, { id: session.userId, fullName: session.fullName });
    return NextResponse.json({ success: true, client: saved });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to save client" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await getCurrentStaffSession();
  if (!session || (session.role !== "admin" && session.role !== "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, primaryId, duplicateIds } = body;

    if (action === "merge" && primaryId && Array.isArray(duplicateIds)) {
      const merged = mergeClients(primaryId, duplicateIds, {
        id: session.userId,
        fullName: session.fullName,
      });
      if (!merged) {
        return NextResponse.json({ error: "Primary client not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, client: merged });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to merge clients" }, { status: 500 });
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
    return NextResponse.json({ error: "Client ID required" }, { status: 400 });
  }

  const archived = archiveClient(id, { id: session.userId, fullName: session.fullName });
  return NextResponse.json({ success: archived });
}
