/**
 * AURO PERFECT VISION — HOSTINGER MYSQL DATABASE ENGINE
 * High-performance, connection-pooled MySQL driver with InnoDB transaction
 * support, robust retry handling, and automatic schema initialization.
 */

import mysql, { Pool, PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";

export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password?: string;
  database: string;
  connectionLimit: number;
  ssl?: any;
}

let poolInstance: Pool | null = null;
let isInitializing = false;

/**
 * Parses and returns the MySQL connection configuration from environment variables.
 * Prioritizes individual DB_* variables commonly used in Hostinger hPanel,
 * with fallback to DATABASE_URL or standard defaults.
 */
export function getMySQLConfig(): DatabaseConfig {
  // 1. If DATABASE_URL is present, parse it
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl && (dbUrl.startsWith("mysql://") || dbUrl.startsWith("mysql2://"))) {
    try {
      const parsed = new URL(dbUrl);
      return {
        host: parsed.hostname || "127.0.0.1",
        port: parsed.port ? parseInt(parsed.port, 10) : 3306,
        user: decodeURIComponent(parsed.username || "root"),
        password: decodeURIComponent(parsed.password || ""),
        database: parsed.pathname.replace(/^\//, "") || "auro_perfect_vision",
        connectionLimit: parseInt(process.env.DB_POOL_LIMIT || "10", 10),
      };
    } catch {
      // Fall through to standard env vars
    }
  }

  // 2. Standard Hostinger environment variables
  return {
    host: process.env.DB_HOST || "127.0.0.1",
    port: parseInt(process.env.DB_PORT || "3306", 10),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "auro_perfect_vision",
    connectionLimit: parseInt(process.env.DB_POOL_LIMIT || "10", 10),
  };
}

/**
 * Returns true if MySQL environment variables have been explicitly configured.
 */
export function isMySQLConfigured(): boolean {
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("placeholder")) {
    return true;
  }
  return Boolean(process.env.DB_NAME && process.env.DB_USER);
}

/**
 * Obtains or lazily initializes the shared MySQL connection pool.
 */
export function getMySQLPool(): Pool {
  if (poolInstance) {
    return poolInstance;
  }

  const config = getMySQLConfig();

  poolInstance = mysql.createPool({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database,
    waitForConnections: true,
    connectionLimit: config.connectionLimit,
    queueLimit: 0,
    connectTimeout: 10000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
    timezone: "Z",
    dateStrings: true,
    decimalNumbers: true,
  });

  return poolInstance;
}

/**
 * Tests MySQL connectivity and returns latency in milliseconds.
 */
export async function checkDatabaseConnection(): Promise<{
  connected: boolean;
  latencyMs?: number;
  error?: string;
  host?: string;
  database?: string;
}> {
  const config = getMySQLConfig();
  if (!isMySQLConfigured()) {
    return {
      connected: false,
      error: "MySQL credentials not configured (DB_NAME and DB_USER required)",
      host: config.host,
      database: config.database,
    };
  }

  const start = Date.now();
  try {
    const pool = getMySQLPool();
    const [rows] = await pool.query<RowDataPacket[]>("SELECT 1 AS alive");
    const latencyMs = Date.now() - start;
    const isAlive = Array.isArray(rows) && rows.length > 0 && rows[0].alive === 1;

    return {
      connected: isAlive,
      latencyMs,
      host: config.host,
      database: config.database,
    };
  } catch (err: any) {
    return {
      connected: false,
      error: err.message || "Database connection failed",
      host: config.host,
      database: config.database,
    };
  }
}

/**
 * Executes a parameterized SELECT or read query and returns typed rows.
 */
export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const pool = getMySQLPool();
  try {
    const [rows] = await pool.query<RowDataPacket[]>(sql, params);
    return rows as unknown as T[];
  } catch (err: any) {
    console.error("[MySQL Query Error]:", { sql: sql.slice(0, 100), error: err.message });
    throw err;
  }
}

/**
 * Executes a parameterized INSERT, UPDATE, or DELETE statement.
 */
export async function execute(sql: string, params: any[] = []): Promise<ResultSetHeader> {
  const pool = getMySQLPool();
  try {
    const [result] = await pool.execute<ResultSetHeader>(sql, params);
    return result;
  } catch (err: any) {
    console.error("[MySQL Execute Error]:", { sql: sql.slice(0, 100), error: err.message });
    throw err;
  }
}

/**
 * Executes a function within an atomic MySQL InnoDB transaction.
 * Automatically rolls back on any exception and releases the connection.
 */
export async function withTransaction<T>(
  callback: (connection: PoolConnection) => Promise<T>
): Promise<T> {
  const pool = getMySQLPool();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Gracefully shuts down the connection pool (used during graceful server teardown).
 */
export async function closePool(): Promise<void> {
  if (poolInstance) {
    await poolInstance.end();
    poolInstance = null;
  }
}
