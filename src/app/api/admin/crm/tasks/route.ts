import { NextResponse } from "next/server";
import { getCurrentStaffSession } from "@/lib/server/auth";
import { getAllTasks, saveTask, toggleTaskStatus } from "@/lib/server/crm";

export async function GET(request: Request) {
  const session = await getCurrentStaffSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get("clientId") || undefined;
  const status = searchParams.get("status") || undefined;
  const staffId = searchParams.get("staffId") || undefined;

  const tasks = getAllTasks({ clientId, status, staffId });
  return NextResponse.json({ tasks });
}

export async function POST(request: Request) {
  const session = await getCurrentStaffSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (!body.title || !body.dueDate) {
      return NextResponse.json({ error: "Task title and due date are required." }, { status: 400 });
    }

    const saved = saveTask(
      {
        ...body,
        assignedStaffId: body.assignedStaffId || session.userId,
        assignedStaffName: body.assignedStaffName || session.fullName,
      },
      { id: session.userId, fullName: session.fullName }
    );

    return NextResponse.json({ success: true, task: saved });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to save task" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await getCurrentStaffSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, action } = body;

    if (!id) {
      return NextResponse.json({ error: "Task ID required" }, { status: 400 });
    }

    if (action === "toggle") {
      const updated = toggleTaskStatus(id, { id: session.userId, fullName: session.fullName });
      if (!updated) return NextResponse.json({ error: "Task not found" }, { status: 404 });
      return NextResponse.json({ success: true, task: updated });
    }

    const saved = saveTask(body, { id: session.userId, fullName: session.fullName });
    return NextResponse.json({ success: true, task: saved });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update task" }, { status: 500 });
  }
}
