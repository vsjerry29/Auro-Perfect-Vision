import { NextResponse } from "next/server";
import { getCurrentStaffSession } from "@/lib/server/auth";
import { addClientNote } from "@/lib/server/crm";

export async function POST(request: Request) {
  const session = await getCurrentStaffSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { clientId, content, category } = body;

    if (!clientId || !content || !content.trim()) {
      return NextResponse.json({ error: "Client ID and note content required" }, { status: 400 });
    }

    const note = addClientNote(
      clientId,
      content.trim(),
      category || "general",
      {
        id: session.userId,
        fullName: session.fullName,
        role: session.role,
      }
    );

    return NextResponse.json({ success: true, note });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to add note" }, { status: 500 });
  }
}
