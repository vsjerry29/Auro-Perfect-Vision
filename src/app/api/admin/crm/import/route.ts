import { NextResponse } from "next/server";
import { getCurrentStaffSession } from "@/lib/server/auth";
import { saveClient, getAllClients } from "@/lib/server/crm";
import { logAuditEvent } from "@/lib/server/cms";

export async function POST(request: Request) {
  const session = await getCurrentStaffSession();
  if (!session || (session.role !== "admin" && session.role !== "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { clients: rawClients, dryRun = false } = body;

    if (!Array.isArray(rawClients) || rawClients.length === 0) {
      return NextResponse.json({ error: "No client records provided for import" }, { status: 400 });
    }

    const existingClients = getAllClients();
    const existingEmails = new Set(existingClients.map((c) => c.email.toLowerCase().trim()));

    const imported: any[] = [];
    const skipped: any[] = [];
    const errors: any[] = [];

    rawClients.forEach((raw, idx) => {
      const name = raw.fullName || raw.name;
      const email = raw.email ? raw.email.toLowerCase().trim() : "";
      const phone = raw.phone || "";

      if (!name || !email) {
        errors.push({ row: idx + 1, error: "Missing Name or Email", data: raw });
        return;
      }

      if (existingEmails.has(email)) {
        skipped.push({ row: idx + 1, reason: "Duplicate Email Already Exists", email, name });
        return;
      }

      if (!dryRun) {
        const saved = saveClient(
          {
            fullName: name,
            email,
            phone,
            locality: raw.locality || "",
            status: "active",
            source: "referral",
            tags: Array.isArray(raw.tags) ? raw.tags : ["Imported Client"],
          },
          { id: session.userId, fullName: session.fullName }
        );
        imported.push(saved);
        existingEmails.add(email);
      } else {
        imported.push({ fullName: name, email, phone });
      }
    });

    if (!dryRun && imported.length > 0) {
      logAuditEvent({
        staffId: session.userId,
        staffEmail: session.email,
        staffName: session.fullName,
        action: "CRM_CLIENTS_IMPORTED",
        entityType: "CRM",
        entityId: "batch_import",
        details: { importedCount: imported.length, skippedCount: skipped.length },
      });
    }

    return NextResponse.json({
      success: true,
      dryRun,
      importedCount: imported.length,
      skippedCount: skipped.length,
      errorsCount: errors.length,
      skipped,
      errors,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to process import" }, { status: 500 });
  }
}
