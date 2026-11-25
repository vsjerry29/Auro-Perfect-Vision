import { NextResponse } from "next/server";
import {
  getEffectiveOfferings,
  getAllTherapists,
  getAllBlogPosts,
  getEffectiveSiteContent,
} from "@/lib/server/cms";

export async function GET() {
  const offerings = await getEffectiveOfferings(false); // strictly published only
  const therapists = getAllTherapists(false); // strictly published only
  const blogs = getAllBlogPosts(false); // strictly published only
  const siteContent = await getEffectiveSiteContent();

  return NextResponse.json({
    offerings,
    therapists,
    blogs,
    siteContent,
  });
}
