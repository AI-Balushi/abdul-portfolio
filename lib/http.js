// Small helpers shared by the API functions. Only Node.js built-ins are used.
export class HttpError extends Error {
  constructor(status, code, message) { super(message || code); this.status = status; this.code = code; }
}

export function sendJson(res, status, body, headers = {}) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  for (const [k, v] of Object.entries(headers)) res.setHeader(k, v);
  res.end(JSON.stringify(body));
}

// Works both locally (raw stream) and on Vercel (body already parsed).
export async function readJson(req, limit = 16384) {
  if (req.body !== undefined) {
    let b = req.body;
    if (Buffer.isBuffer(b)) b = b.toString("utf8");
    if (typeof b === "string") {
      if (b.length > limit) throw new HttpError(413, "too_large");
      try { return b ? JSON.parse(b) : {}; } catch { throw new HttpError(400, "invalid_json"); }
    }
    if (b && typeof b === "object") {
      if (JSON.stringify(b).length > limit) throw new HttpError(413, "too_large");
      return b;
    }
    return {};
  }
  let size = 0; const chunks = [];
  for await (const c of req) {
    size += c.length;
    if (size > limit) throw new HttpError(413, "too_large");
    chunks.push(c);
  }
  const txt = Buffer.concat(chunks).toString("utf8");
  try { return txt ? JSON.parse(txt) : {}; } catch { throw new HttpError(400, "invalid_json"); }
}

export function clientIp(req) {
  const xf = req.headers["x-forwarded-for"];
  if (xf) return String(xf).split(",")[0].trim();
  return (req.socket && req.socket.remoteAddress) || "unknown";
}

export function parseCookies(req) {
  const out = {};
  String(req.headers.cookie || "").split(";").forEach((p) => {
    const i = p.indexOf("="); if (i < 0) return;
    out[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim());
  });
  return out;
}

// Reject requests that come from another website.
export function sameOrigin(req) {
  const o = req.headers.origin;
  if (!o) return true;
  try { return new URL(o).host === req.headers.host; } catch { return false; }
}

export function isHttps(req) {
  return req.headers["x-forwarded-proto"] === "https" || !!(req.socket && req.socket.encrypted) || !!process.env.VERCEL;
}
