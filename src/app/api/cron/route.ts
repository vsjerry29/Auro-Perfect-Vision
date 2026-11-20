import { NextRequest, NextResponse } from "next/server";
import {
  dbReleaseExpiredBookingHolds,
  dbProcessPendingNotificationJobs,
} from "@/lib/server/mysql-db";
import { isMySQLConfigured } from "@/lib/server/mysql";

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

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      durationMs: Date.now() - startTime,
      database: isMySQLConfigured() ? "Hostinger MySQL (InnoDB)" : "In-Memory Fallback",
      tasks: {
        expiredHoldsReleased,
        notifications: notificationResults,
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
