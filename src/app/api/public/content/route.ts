import { NextResponse } from "next/server";
import {
  getEffectiveOfferings,
  getEffectiveTherapists,
  getAllBlogPosts,
  getEffectiveSiteContent,
  getIntakeTemplates,
  getWeeklySchedule,
  getLeaveExceptions,
  getEffectiveBookings,
} from "@/lib/server/cms";

export const dynamic = "force-dynamic";

export async function GET() {
  const [offerings, therapists, siteContent, allBookings] = await Promise.all([
    getEffectiveOfferings(false), // strictly published only
    getEffectiveTherapists(false), // strictly published & active only
    getEffectiveSiteContent(),
    getEffectiveBookings(),
  ]);

  const blogs = getAllBlogPosts(false); // strictly published only
  const intakeTemplates = getIntakeTemplates();
  const weeklySchedule = getWeeklySchedule();
  const leaveExceptions = getLeaveExceptions();

  // Sanitized occupied slot pairs only (never expose client PII publicly)
  const bookedSlots = allBookings
    .filter((b) => b.status !== "cancelled" && (b.status as string) !== "draft")
    .map((b) => ({
      therapistId: b.therapistId,
      date: b.date,
      timeSlot: b.timeSlot,
    }));

  return NextResponse.json({
    offerings,
    therapists,
    blogs,
    siteContent,
    intakeTemplates,
    weeklySchedule,
    leaveExceptions,
    bookedSlots,
  });
}
