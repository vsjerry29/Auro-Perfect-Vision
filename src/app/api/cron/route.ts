import { NextRequest, NextResponse } from "next/server";
import {
  dbReleaseExpiredBookingHolds,
  dbProcessPendingNotificationJobs,
} from "@/lib/server/mysql-db";
import { isMySQLConfigured, query, execute } from "@/lib/server/mysql";
import { sendEmail, renderBookingReminderEmail } from "@/lib/server/email";
import { getAllBookings } from "@/lib/server/cms";

export const dynamic = "force-dynamic";

function isAuthorized(request: NextRequest): boolean {
  const configuredSecret = process.env.CRON_SECRET;
  if (!configuredSecret) {
    // In local development or if unset, permit invocation with warning
    return process.env.NODE_ENV !== "production";
  }

  // Check headers and query parameter
  const authHeader = request.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : null;
  const customHeader = request.headers.get("x-cron-secret");
  const queryKey = request.nextUrl.searchParams.get("key");

  return (
    bearerToken === configuredSecret ||
    customHeader === configuredSecret ||
    queryKey === configuredSecret
  );
}

async function handleCron(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: "Unauthorized: Invalid or missing CRON_SECRET." },
      { status: 401 }
    );
  }

  const startTime = Date.now();

  try {
    const expiredHoldsReleased = await dbReleaseExpiredBookingHolds();
    const notificationResults = await dbProcessPendingNotificationJobs();

    // 1. Dispatch 24-Hour Appointment Reminders
    let remindersDispatched = 0;
    if (isMySQLConfigured()) {
      try {
        const tomorrowBookings = await query<any>(
          `SELECT b.id, b.booking_reference, b.offering_title, b.therapist_name,
                  b.booking_date, b.time_slot, b.client_name, b.client_email
           FROM bookings b
           WHERE DATE(b.booking_date) = CURDATE() + INTERVAL 1 DAY
             AND b.status NOT IN ('cancelled', 'draft')
             AND NOT EXISTS (
               SELECT 1 FROM notification_jobs nj
               WHERE nj.booking_id = b.id AND nj.template_key = 'booking_reminder'
             )
           LIMIT 25`
        );

        for (const b of tomorrowBookings) {
          if (b.client_email) {
            const emailTpl = renderBookingReminderEmail({
              clientName: b.client_name,
              bookingReference: b.booking_reference,
              offeringTitle: b.offering_title,
              therapistName: b.therapist_name,
              bookingDate: b.booking_date instanceof Date ? b.booking_date.toISOString().split("T")[0] : String(b.booking_date).split("T")[0],
              timeSlot: b.time_slot,
            });

            await sendEmail({
              to: b.client_email,
              subject: `Reminder: Your Vision Session Tomorrow [${b.booking_reference}] — Auro Perfect Vision`,
              html: emailTpl.html,
              text: emailTpl.text,
              templateKey: "booking_reminder",
              bookingId: b.id,
            });
            remindersDispatched++;
          }
        }
      } catch (reminderErr: any) {
        console.warn("[Cron 24h Reminder Dispatch Notice]:", reminderErr.message);
      }
    }

    // 2. Invalidate Expired Staff Invitations
    let expiredInvitesInvalidated = 0;
    if (isMySQLConfigured()) {
      try {
        const res = await execute(
          `UPDATE staff_profiles
           SET invitation_token = NULL
           WHERE status = 'invited'
             AND invitation_expires_at IS NOT NULL
             AND invitation_expires_at < NOW()
             AND invitation_token IS NOT NULL`
        );
        expiredInvitesInvalidated = res.affectedRows;
      } catch (inviteErr: any) {
        console.warn("[Cron Invalidate Expired Invites Notice]:", inviteErr.message);
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      durationMs: Date.now() - startTime,
      database: isMySQLConfigured() ? "Hostinger MySQL (InnoDB)" : "In-Memory Fallback",
      tasks: {
        expiredHoldsReleased,
        notifications: notificationResults,
        remindersDispatched,
        expiredInvitesInvalidated,
      },
    });
  } catch (err: any) {
    console.error("[Hostinger Cron Job Error]:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to complete cron tasks.",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return handleCron(request);
}

export async function POST(request: NextRequest) {
  return handleCron(request);
}
