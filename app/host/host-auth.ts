export const HOST_SESSION_COOKIE = "founder_frenzy_host";
export const HOST_SESSION_TTL_SECONDS = 12 * 60 * 60;

const TOKEN_VERSION = "v1";

export function getHostPassword(): string | null {
  const password = process.env.HOST_PASSWORD?.trim();
  return password || null;
}

export async function createHostSessionToken(password: string): Promise<string> {
  const expiresAt = Math.floor(Date.now() / 1000) + HOST_SESSION_TTL_SECONDS;
  const payload = `${TOKEN_VERSION}.${expiresAt}`;
  const signature = await sign(payload, password);
  return `${payload}.${signature}`;
}

export async function isValidHostSession(token: string | undefined, password: string): Promise<boolean> {
  if (!token) return false;
  const [version, expiresAtRaw, suppliedSignature, ...extra] = token.split(".");
  if (extra.length || version !== TOKEN_VERSION || !expiresAtRaw || !suppliedSignature) return false;

  const expiresAt = Number(expiresAtRaw);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= Math.floor(Date.now() / 1000)) return false;

  const expectedSignature = await sign(`${version}.${expiresAtRaw}`, password);
  return constantTimeEqual(suppliedSignature, expectedSignature);
}

async function sign(payload: string, password: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return toBase64Url(new Uint8Array(signature));
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function constantTimeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}
