export interface EdgeSessionPayload {
  userId: string;
  email: string;
  fullName: string;
  role: "super_admin" | "admin" | "therapist";
  therapistId?: string;
  expiresAt: number;
}

function getSecretKey(): string {
  return process.env.SESSION_SECRET || "";
}

// Convert string to base64url
function base64urlEncode(str: string): string {
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return atob(base64);
}

export async function verifyEdgeToken(token: string): Promise<EdgeSessionPayload | null> {
  if (!token || !token.includes(".")) return null;
  const secret = getSecretKey();
  if (!secret) return null;
  const [data, signature] = token.split(".");

  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign", "verify"]
    );

    // Compute expected signature
    const signatureBuffer = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(data)
    );

    const bytes = new Uint8Array(signatureBuffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const expectedSig = base64urlEncode(binary);

    if (signature !== expectedSig) {
      return null;
    }

    const jsonStr = base64urlDecode(data);
    const payload: EdgeSessionPayload = JSON.parse(jsonStr);

    if (Date.now() > payload.expiresAt) {
      return null;
    }

    return payload;
  } catch (err) {
    return null;
  }
}
