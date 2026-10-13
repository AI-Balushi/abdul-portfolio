// Password hashing (scrypt) and signed session cookies (HMAC-SHA256). Built-in crypto only.
import crypto from "node:crypto";
import { promisify } from "node:util";
import { parseCookies, isHttps } from "./http.js";

const scrypt = promisify(crypto.scrypt);
export const COOKIE = "awb_session";
export const SESSION_DAYS = 7;
export const DEFAULT_USER = "admin";
export const DEFAULT_PASSWORD = "admin123";

export async function hashPassword(password, saltHex) {
  const salt = saltHex ? Buffer.from(saltHex, "hex") : crypto.randomBytes(16);
  const key = await scrypt(String(password), salt, 64);
  return { salt: salt.toString("hex"), hash: key.toString("hex") };
}
export async function verifyPassword(password, rec) {
  const { hash } = await hashPassword(password, rec.salt);
  const a = Buffer.from(hash, "hex"), b = Buffer.from(rec.hash, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
export function sameText(a, b) {
  const x = crypto.createHash("sha256").update(String(a)).digest(), y = crypto.createHash("sha256").update(String(b)).digest();
  return crypto.timingSafeEqual(x, y);
}
export async function makeCred(user, password, mustChange) {
  const { salt, hash } = await hashPassword(password);
  return { user: String(user).trim().toLowerCase(), salt, hash, mustChange: !!mustChange, v: Date.now() };
}

export async function getSecret(store) {
  let s = await store.get("secret");
  if (!s) { await store.set("secret", crypto.randomBytes(32).toString("hex")); s = await store.get("secret"); }
  return s;
}
function mac(body, secret) { return crypto.createHmac("sha256", secret).update(body).digest("base64url"); }
export function signSession(payload, secret) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return body + "." + mac(body, secret);
}
export function verifySession(token, secret) {
  if (!token || !token.includes(".")) return null;
  const [body, sig] = token.split(".");
  const a = Buffer.from(sig || ""), b = Buffer.from(mac(body, secret));
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try { const p = JSON.parse(Buffer.from(body, "base64url").toString("utf8")); return p.exp > Date.now() ? p : null; } catch { return null; }
}
export function sessionCookie(token, req) {
  return `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_DAYS * 86400}${isHttps(req) ? "; Secure" : ""}`;
}
export function clearCookie(req) {
  return `${COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${isHttps(req) ? "; Secure" : ""}`;
}

export async function loadCred(store) {
  const raw = await store.get("admin:cred");
  try { return raw ? JSON.parse(raw) : null; } catch { return null; }
}
// Returns {cred} for a valid session, otherwise null. A password change invalidates old sessions.
export async function currentSession(req, store) {
  const token = parseCookies(req)[COOKIE]; if (!token) return null;
  const secret = await getSecret(store);
  const p = verifySession(token, secret); if (!p) return null;
  const cred = await loadCred(store);
  if (!cred || cred.v !== p.v || cred.user !== p.u) return null;
  return { cred };
}
export async function issueSession(cred, store, req) {
  const secret = await getSecret(store);
  return sessionCookie(signSession({ u: cred.user, v: cred.v, exp: Date.now() + SESSION_DAYS * 86400000 }, secret), req);
}
