import { NextResponse } from "next/server";
import { checkDatabaseConnection, isMySQLConfigured } from "@/lib/server/mysql";

export const dynamic = "force-dynamic";

export async function GET() {
  const startedAt = Date.now();
  const mysqlConfigured = isMySQLConfigured();

  let dbStatus = {
    configured: mysqlConfigured,
    connected: false,
    latencyMs: 0,
    status: "idle",
  };

  let isHealthy = true;

  if (mysqlConfigured) {
    try {
      const check = await checkDatabaseConnection();
      dbStatus.connected = check.connected;
      dbStatus.latencyMs = check.latencyMs || 0;
      dbStatus.status = check.connected ? "connected" : "disconnected";

      if (!check.connected) {
        isHealthy = false;
      }
    } catch {
      dbStatus.connected = false;
      dbStatus.status = "error";
      isHealthy = false;
    }
  } else {
    // Development / fallback mode without explicit DB credentials
    dbStatus.status = "fallback_memory_dev";
    dbStatus.connected = true;
  }

  const payload = {
    status: isHealthy ? "healthy" : "unhealthy",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    service: "Auro Perfect Vision Platform",
    environment: process.env.NODE_ENV || "development",
    database: {
      engine: "MySQL (InnoDB)",
      status: dbStatus.status,
      connected: dbStatus.connected,
      latencyMs: dbStatus.latencyMs,
    },
    version: "2.1.0-hostinger",
  };

  return NextResponse.json(payload, {
    status: isHealthy ? 200 : 503,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
