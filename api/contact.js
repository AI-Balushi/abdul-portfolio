// POST /api/contact: validates a contact-form message and saves it to storage.
import { randomUUID } from "node:crypto";
import { getStore } from "../lib/store.js";
import { sendJson, readJson, clientIp, sameOrigin, HttpError } from "../lib/http.js";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clean = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");

async function notify(rec) {
  // Optional: email yourself when a message arrives. Needs RESEND_API_KEY and CONTACT_TO_EMAIL.
  const key = process.env.RESEND_API_KEY, to = process.env.CONTACT_TO_EMAIL;
  if (!key || !to) return;
  try {
    await fetch(process.env.RESEND_API_URL || "https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM_EMAIL || "Portfolio <onboarding@resend.dev>",
        to: [to], reply_to: rec.email,
        subject: `New portfolio message from ${rec.name.replace(/[\r\n]+/g, " ")}`,
        text: `Name: ${rec.name}\nEmail: ${rec.email}\nService: ${rec.service || "Not specified"}\n\n${rec.details}`,
      }),
      signal: AbortSignal.timeout(5000),
    });
  } catch { /* the message is already saved, so a failed notification is not fatal */ }
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return sendJson(res, 405, { error: "method_not_allowed" }, { Allow: "POST" });
    if (!sameOrigin(req)) return sendJson(res, 403, { error: "forbidden" });
    const store = getStore();
    if (!store) return sendJson(res, 503, { error: "storage_not_configured" });

    const d = await readJson(req);
    if (clean(d.company, 200)) return sendJson(res, 200, { ok: true }); // honeypot: bots fill this hidden field

    const rec = {
      id: randomUUID(), createdAt: new Date().toISOString(),
      name: clean(d.name, 100).replace(/[\r\n]+/g, " "), email: clean(d.email, 200),
      service: clean(d.service, 100), details: clean(d.details, 4000),
    };
    const fields = {};
    if (!rec.name) fields.name = "Enter your full name.";
    if (!EMAIL.test(rec.email)) fields.email = "Enter a valid email address.";
    if (rec.details.length < 10) fields.details = "Add a little more detail (at least 10 characters).";
    if (Object.keys(fields).length) return sendJson(res, 422, { error: "invalid_fields", fields });

    const n = await store.incr("rl:contact:" + clientIp(req), 3600);
    if (n > 8) return sendJson(res, 429, { error: "rate_limited" }, { "Retry-After": "3600" });

    await store.push("messages", JSON.stringify(rec), 2000);
    await notify(rec);
    return sendJson(res, 200, { ok: true });
  } catch (e) {
    if (e instanceof HttpError) return sendJson(res, e.status, { error: e.code });
    console.error("contact error:", e);
    return sendJson(res, 500, { error: "server_error" });
  }
}
