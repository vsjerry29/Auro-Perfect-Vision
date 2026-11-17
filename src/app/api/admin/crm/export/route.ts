import { NextResponse } from "next/server";
import { getCurrentStaffSession } from "@/lib/server/auth";
import { getAllClients } from "@/lib/server/crm";
import { logAuditEvent } from "@/lib/server/cms";

export async function GET() {
  const session = await getCurrentStaffSession();
  if (!session || (session.role !== "admin" && session.role !== "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Audit log the export
  logAuditEvent({
    staffId: session.userId,
    staffEmail: session.email,
    staffName: session.fullName,
    action: "CRM_CLIENTS_EXPORTED",
    entityType: "CRM",
    entityId: "all_clients",
    details: { format: "CSV" },
  });

  const clients = getAllClients();

  const headers = [
    "Client Reference",
    "Full Name",
    "Email",
    "Phone",
    "Locality",
    "Preferred Channel",
    "Status",
    "Source",
    "Tags",
    "Total Bookings",
    "Total Spent INR",
    "Total Spent USD",
    "First Booking Date",
    "Last Booking Date",
    "Created Date",
  ];

  const rows = clients.map((c) => [
    `"${c.clientReference}"`,
    `"${c.fullName.replace(/"/g, '""')}"`,
    `"${c.email}"`,
    `"${c.phone}"`,
    `"${(c.locality || "").replace(/"/g, '""')}"`,
    `"${c.preferredChannel}"`,
    `"${c.status}"`,
    `"${c.source}"`,
    `"${(c.tags || []).join("; ")}"`,
    c.totalBookings,
    c.totalSpentINR,
    c.totalSpentUSD,
    `"${c.firstBookingDate || ""}"`,
    `"${c.lastBookingDate || ""}"`,
    `"${c.createdAt}"`,
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="auro_perfect_vision_clients_${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
