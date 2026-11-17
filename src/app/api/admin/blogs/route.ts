import { NextResponse } from "next/server";
import { getCurrentStaffSession } from "@/lib/server/auth";
import { getAllBlogPosts, saveBlogPost } from "@/lib/server/cms";

export async function GET() {
  const session = await getCurrentStaffSession();
  if (!session || (session.role !== "admin" && session.role !== "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const blogs = getAllBlogPosts(true);
  return NextResponse.json({ blogs });
}

export async function POST(request: Request) {
  const session = await getCurrentStaffSession();
  if (!session || (session.role !== "admin" && session.role !== "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (!body.title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const saved = saveBlogPost(body);
    return NextResponse.json({ success: true, post: saved });
  } catch (err: any) {
    return NextResponse.json({ error: "Server error saving article" }, { status: 500 });
  }
}
