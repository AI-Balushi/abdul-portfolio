// /api/admin?action=...  Login, inbox and account management for the admin page.
import { getStore } from "../lib/store.js";
import { sendJson, readJson, clientIp, sameOrigin, HttpError } from "../lib/http.js";
import {
  DEFAULT_USER, DEFAULT_PASSWORD, makeCred, verifyPassword, sameText,
  loadCred, currentSession, issueSession, clearCookie,
} from "../lib/auth.js";

const MAX_LOGIN_ATTEMPTS = 10;        // per IP, per 15 minutes
const USER_RX = /^[a-z0-9._-]{3,32}$/;

function defaultsAllowed() {
  // The well-known default login only works on your own computer, never on a deployed server,
  // unless you explicitly opt in with ALLOW_DEFAULT_LOGIN=true.
  return process.env.ALLOW_DEFAULT_LOGIN === "true" || (!process.env.VERCEL && process.env.NODE_ENV !== "production");
}

async function loadOrSeed(store) {
  let cred = await loadCred(store);
  if (cred) return cred;
  const u = process.env.ADMIN_USER, p = process.env.ADMIN_PASSWORD;
  if (u && p) cred = await makeCred(u, p, false);
  else if (defaultsAllowed()) cred = await makeCred(DEFAULT_USER, DEFAULT_PASSWORD, true);
  else return null;
  await store.set("admin:cred", JSON.stringify(cred));
  return cred;
}

const parse = (s) => { try { return JSON.parse(s); } catch { return null; } };
async function readMessages(store) {
  const raws = await store.range("messages");
  const meta = parse(await store.get("msgmeta")) || {};
  const items = raws.map((r) => ({ raw: r, m: parse(r) })).filter((x) => x.m && x.m.id);
  return { items, meta };
}

export default async function handler(req, res) {
  try {
    const url = new URL(req.url, "http://x");
    const action = url.searchParams.get("action") || "status";
    const store = getStore();

    if (action === "status" && req.method === "GET") {
      if (!store) return sendJson(res, 200, { configured: false });
      const s = await currentSession(req, store);
      return sendJson(res, 200, { configured: true, storage: store.kind, authenticated: !!s, user: s ? s.cred.user : undefined, mustChange: s ? !!s.cred.mustChange : undefined });
    }
    if (!store) return sendJson(res, 503, { error: "storage_not_configured" });

    // Everything below can change data: require same origin, a JSON body for POST, and the custom header.
    if (!sameOrigin(req)) return sendJson(res, 403, { error: "forbidden" });
    if (req.headers["x-requested-with"] !== "admin") return sendJson(res, 403, { error: "forbidden" });

    if (action === "login" && req.method === "POST") {
      const ip = clientIp(req);
      if ((await store.incr("rl:login:" + ip, 900)) > MAX_LOGIN_ATTEMPTS) return sendJson(res, 429, { error: "rate_limited" }, { "Retry-After": "900" });
      const { user, password } = await readJson(req);
      const cred = await loadOrSeed(store);
      if (!cred) return sendJson(res, 403, {
        error: "default_blocked",
        message: "For security, the default login only works on your own computer. In Vercel go to Settings > Environment Variables, add ADMIN_USER and ADMIN_PASSWORD, then redeploy.",
      });
      const userOk = sameText(String(user || "").trim().toLowerCase(), cred.user);
      const passOk = await verifyPassword(String(password || ""), cred); // always run, so timing does not reveal the username
      if (!(userOk && passOk)) return sendJson(res, 401, { error: "invalid_credentials" });
      await store.del("rl:login:" + ip);
      return sendJson(res, 200, { ok: true, user: cred.user, mustChange: !!cred.mustChange }, { "Set-Cookie": await issueSession(cred, store, req) });
    }

    if (action === "logout" && req.method === "POST") return sendJson(res, 200, { ok: true }, { "Set-Cookie": clearCookie(req) });

    const session = await currentSession(req, store);
    if (!session) return sendJson(res, 401, { error: "unauthorized" });
    const cred = session.cred;

    if (action === "change" && req.method === "POST") {
      const ip = clientIp(req);
      if ((await store.incr("rl:login:" + ip, 900)) > MAX_LOGIN_ATTEMPTS) return sendJson(res, 429, { error: "rate_limited" });
      const { current, newUser, newPassword } = await readJson(req);
      if (!(await verifyPassword(String(current || ""), cred))) return sendJson(res, 401, { error: "wrong_current_password" });
      const u = String(newUser || "").trim().toLowerCase(), p = String(newPassword || "");
      if (!USER_RX.test(u)) return sendJson(res, 422, { error: "invalid_username", message: "Username must be 3 to 32 characters: letters, numbers, dot, dash or underscore." });
      if (p.length < 8) return sendJson(res, 422, { error: "weak_password", message: "Password must be at least 8 characters." });
      if (p === DEFAULT_PASSWORD || p.toLowerCase() === u) return sendJson(res, 422, { error: "weak_password", message: "Choose a password that is not the default or your username." });
      const next = await makeCred(u, p, false);
      await store.set("admin:cred", JSON.stringify(next));
      await store.del("rl:login:" + ip);
      return sendJson(res, 200, { ok: true, user: next.user }, { "Set-Cookie": await issueSession(next, store, req) });
    }

    if (cred.mustChange) return sendJson(res, 403, { error: "must_change" });

    if (action === "messages" && req.method === "GET") {
      const { items, meta } = await readMessages(store);
      const out = items.map(({ m }) => ({ ...m, read: !!(meta[m.id] && meta[m.id].read) }));
      return sendJson(res, 200, { items: out, unread: out.filter((x) => !x.read).length });
    }
    if (action === "unread" && req.method === "GET") {
      const { items, meta } = await readMessages(store);
      return sendJson(res, 200, { unread: items.filter(({ m }) => !(meta[m.id] && meta[m.id].read)).length });
    }
    if (action === "mark" && req.method === "POST") {
      const { id, read } = await readJson(req);
      if (typeof id !== "string") return sendJson(res, 422, { error: "invalid" });
      const meta = parse(await store.get("msgmeta")) || {};
      meta[id] = { read: read !== false };
      await store.set("msgmeta", JSON.stringify(meta));
      return sendJson(res, 200, { ok: true });
    }
    if (action === "delete" && req.method === "POST") {
      const { id } = await readJson(req);
      const { items, meta } = await readMessages(store);
      const hit = items.find(({ m }) => m.id === id);
      if (!hit) return sendJson(res, 404, { error: "not_found" });
      await store.remove("messages", hit.raw);
      delete meta[id]; await store.set("msgmeta", JSON.stringify(meta));
      return sendJson(res, 200, { ok: true });
    }
    return sendJson(res, 404, { error: "unknown_action" });
  } catch (e) {
    if (e instanceof HttpError) return sendJson(res, e.status, { error: e.code });
    console.error("admin error:", e);
    return sendJson(res, 500, { error: "server_error" });
  }
}
