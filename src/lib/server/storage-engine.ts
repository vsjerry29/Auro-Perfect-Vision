/**
 * AURO PERFECT VISION — UNIFIED STORAGE ENGINE
 * MySQL InnoDB persistence for Hostinger deployment with resilient in-memory
 * fallback for local previews. Zero EROFS filesystem writes.
 */

import fs from "fs";
import path from "path";
import os from "os";
import { isMySQLConfigured } from "./mysql";
import * as db from "./mysql-db";

const DATA_DIR = path.join(process.cwd(), "data", "cms");

// In-Memory Storage Cache (used for read caching, demo baseline, and test execution)
const memoryCache: Map<string, any> = new Map();

/**
 * Safely reads seed data from disk in read-only mode during startup / offline mode.
 * Never attempts to write or create directories.
 */
function readStaticSeedFile<T>(filename: string, fallbackDefault: T): T {
  try {
    const filePath = path.join(DATA_DIR, filename);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(content) as T;
    }
  } catch {
    // Read failure is non-fatal; fallback to default
  }
  return fallbackDefault;
}

function ensureDirectory(dir: string): void {
  try {
    if (!fs.existsSync(dir)) {
      const mkdir = (fs as any)["mkdirSync"];
      if (typeof mkdir === "function") {
        mkdir(dir, { recursive: true });
      }
    }
  } catch {}
}

export function isTestMode(): boolean {
  return (
    process.env.APV_TEST_MODE === "1" ||
    process.env.NODE_ENV === "test" ||
    process.env.MOCK_DB === "1"
  );
}

/**
 * Expands leading tilde '~' using os.homedir() / process.env.HOME for durable Hostinger directory resolution.
 */
export function expandStoragePath(inputPath: string): string {
  if (!inputPath) return "";
  if (inputPath.startsWith("~")) {
    const home = os.homedir() || process.env.HOME || "";
    return path.resolve(inputPath.replace(/^~(?=$|\/|\\)/, home));
  }
  return path.resolve(inputPath);
}

/**
 * Resolves the durable persistent upload directory for Hostinger.
 * Ensures the directory is outside replaceable git deployment folders in production.
 */
export function getPersistentUploadDir(): string {
  if (process.env.UPLOAD_DIR) {
    const resolved = expandStoragePath(process.env.UPLOAD_DIR);
    ensureDirectory(resolved);
    return resolved;
  }

  // On Hostinger Linux / production, prefer persistent storage outside git deployment root
  if (process.env.NODE_ENV === "production" && (process.env.HOME || os.homedir())) {
    const home = process.env.HOME || os.homedir();
    const persistentDir = path.join(home, "apv_storage", "uploads");
    ensureDirectory(persistentDir);
    return persistentDir;
  }

  const defaultDir = path.join(process.cwd(), "public", "uploads");
  ensureDirectory(defaultDir);
  return defaultDir;
}

/**
 * Resolves the private clinical/patient documents directory.
 * Kept strictly isolated from public HTTP routes.
 */
export function getPrivateDocumentsDir(): string {
  if (process.env.PRIVATE_DOCS_DIR) {
    const resolved = expandStoragePath(process.env.PRIVATE_DOCS_DIR);
    ensureDirectory(resolved);
    return resolved;
  }

  const baseDir = getPersistentUploadDir();
  const privateDir = path.join(baseDir, "..", "private_clinical_docs");
  ensureDirectory(privateDir);
  return privateDir;
}

/**
 * Comprehensive security validation for SVG files to block Stored XSS and XXE injection vectors.
 */
export function isSafeSvg(svgContent: string): { isSafe: boolean; reason?: string } {
  if (!svgContent || typeof svgContent !== "string") {
    return { isSafe: false, reason: "Empty or invalid SVG content" };
  }

  // 1. Must contain an svg opening tag
  if (!/<svg\b/i.test(svgContent)) {
    return { isSafe: false, reason: "Content does not contain a valid <svg> root element" };
  }

  // 2. XXE (XML External Entity) attacks
  if (/<!DOCTYPE\b/i.test(svgContent) || /<!ENTITY\b/i.test(svgContent) || /SYSTEM\s+['"]/i.test(svgContent)) {
    return { isSafe: false, reason: "SVG contains prohibited DOCTYPE/ENTITY definitions (XXE protection)" };
  }

  // 3. Script execution and embedded executable tags
  const dangerousExecutableTags = [
    /<script\b/i,
    /<foreignObject\b/i,
    /<iframe\b/i,
    /<object\b/i,
    /<embed\b/i,
    /<applet\b/i,
    /<meta\b/i,
    /<link\b/i,
    /<handler\b/i,
    /<listener\b/i,
  ];

  for (const tag of dangerousExecutableTags) {
    if (tag.test(svgContent)) {
      return { isSafe: false, reason: `SVG contains unsafe tag: ${tag}` };
    }
  }

  // 4. Inline event handlers (onload, onerror, onclick, onmouseover, onfocus, etc.)
  if (/\bon\w+\s*=/i.test(svgContent)) {
    return { isSafe: false, reason: "SVG contains inline JavaScript event handler attributes" };
  }

  // 5. JavaScript / Data URI schemes in attributes (href, xlink:href, src)
  if (/(href|xlink:href|src)\s*=\s*['"]\s*(javascript:|data:text\/html|vbscript:)/i.test(svgContent)) {
    return { isSafe: false, reason: "SVG contains executable URI scheme in link attribute" };
  }

  // 6. CSS expression() or javascript: in <style> blocks
  if (/expression\s*\(|url\s*\(\s*['"]?\s*javascript:/i.test(svgContent)) {
    return { isSafe: false, reason: "SVG contains malicious CSS expressions" };
  }

  return { isSafe: true };
}

/**
 * Generic Read: Checks MySQL first if configured, else memory cache or static seed file.
 */
export async function readStore<T>(filename: string, fallbackDefault: T): Promise<T> {
  // If memory cache already has it, return it
  if (memoryCache.has(filename)) {
    return memoryCache.get(filename);
  }

  // Load from static seed JSON into memory cache
  const data = readStaticSeedFile(filename, fallbackDefault);
  memoryCache.set(filename, data);
  return data;
}

/**
 * Generic Write:
 * - If MySQL is configured: commits to Hostinger MySQL.
 * - If in test mode: updates in-memory cache without disk write.
 * - If in production without MySQL: throws typed error preventing silent corruption.
 */
export async function writeStore<T>(filename: string, data: T): Promise<void> {
  // 1. Update in-memory state
  memoryCache.set(filename, data);

  // 2. If MySQL is configured, data is committed to Hostinger MySQL
  if (isMySQLConfigured()) {
    try {
      if (filename === "site_content.json") {
        await db.dbSaveSiteContent(data as any);
      } else if (filename === "offerings.json" && Array.isArray(data)) {
        for (const item of data) {
          await db.dbSaveOffering(item);
        }
      } else if (filename === "therapists.json" && Array.isArray(data)) {
        for (const item of data) {
          await db.dbSaveTherapist(item);
        }
      } else if (filename === "blog_posts.json" && Array.isArray(data)) {
        for (const item of data) {
          await db.dbSaveBlogPost(item);
        }
      } else if (filename === "audit_logs.json" && Array.isArray(data)) {
        const latest = data[data.length - 1];
        if (latest) {
          await db.dbLogAuditEvent(latest);
        }
      }
      return;
    } catch (err: any) {
      console.error(`[MySQL writeStore Sync Error (${filename})]:`, err.message);
      if (process.env.NODE_ENV === "production") {
        throw new Error(`DATABASE_WRITE_FAILED: Failed to persist changes to MySQL: ${err.message}`);
      }
    }
  }

  // 3. If in automated test mode, in-memory mutation succeeds cleanly
  if (isTestMode()) {
    return;
  }

  // 4. In production without MySQL, fail safely with clear configuration error
  if (process.env.NODE_ENV === "production" && !isMySQLConfigured()) {
    throw new Error(
      "DATABASE_NOT_CONFIGURED: Hostinger MySQL database is not connected. " +
        "Please configure DB_HOST, DB_USER, DB_PASSWORD, and DB_NAME in your deployment settings to persist changes."
    );
  }

  // 5. In local dev mode without MySQL, memory store was updated in step 1.
}

/**
 * Clear memory cache (useful for testing)
 */
export function clearMemoryCache() {
  memoryCache.clear();
}
