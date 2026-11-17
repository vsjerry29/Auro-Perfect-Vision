import { NextResponse } from "next/server";
import {
  getAllOfferings,
  getAllTherapists,
  getAllBlogPosts,
  getSiteContent,
} from "@/lib/server/cms";

export async function GET() {
  const offerings = getAllOfferings(false); // strictly published only
  const therapists = getAllTherapists(false); // strictly published only
  const blogs = getAllBlogPosts(false); // strictly published only
  const siteContent = getSiteContent();

  return NextResponse.json({
    offerings,
    therapists,
    blogs,
    siteContent,
  });
}
