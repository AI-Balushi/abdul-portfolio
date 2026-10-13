// Local development server. No dependencies, only Node.js built-ins.
//   npm run dev       -> serves public/ plus the API (login, saved messages)
//   npm run preview   -> serves the production build in dist/ plus the API
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const dirFlag = args.indexOf("--dir");
const PRODUCTION_LIKE = dirFlag !== -1;
const SITE_DIR = path.join(ROOT, PRODUCTION_LIKE ? args[dirFlag + 1] : "public");
const START_PORT = Number(process.env.PORT) || 3000;

const TYPES = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8", ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8", ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg", ".svg": "image/svg+xml", ".ico": "image/x-icon", ".woff2": "font/woff2",
};

function send(res, status, body, type = "text/plain; charset=utf-8") {
  res.writeHead(status, { "Content-Type": type, "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" });
  res.end(body);
}

function serveFile(res, file, origin) {
  fs.readFile(file, (err, buf) => {
    if (err) return send(res, 404, "Not found");
    const type = TYPES[path.extname(file).toLowerCase()] || "application/octet-stream";
    // In development, resolve the share-link placeholder to this server's address.
    if (path.extname(file) === ".html") return send(res, 200, buf.toString("utf8").replaceAll("__SITE_URL__", origin), type);
    send(res, 200, buf, type);
  });
}

const server = http.createServer((req, res) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, "http://x").pathname); } catch { return send(res, 400, "Bad request"); }
  if (pathname.includes("\0")) return send(res, 400, "Bad request");
  const origin = `http://${req.headers.host || "localhost:" + START_PORT}`;

  if (pathname === "/api/contact" || pathname === "/api/admin") {
    // Same handler files that Vercel runs as serverless functions.
    return import("./api/" + pathname.slice(5) + ".js").then((m) => m.default(req, res)).catch((e) => { console.error(e); send(res, 500, "Server error"); });
  }
  if (pathname.endsWith("/")) pathname += "index.html";
  const file = path.normalize(path.join(SITE_DIR, pathname));
  if (file !== SITE_DIR && !file.startsWith(SITE_DIR + path.sep)) return send(res, 403, "Forbidden");

  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) {
      const alt = file + ".html";           // allow /page as well as /page.html, like Vercel cleanUrls
      return fs.stat(alt, (e2, s2) => (!e2 && s2.isFile() ? serveFile(res, alt, origin) : send(res, 404, "404 Not found")));
    }
    serveFile(res, file, origin);
  });
});

function lanAddresses() {
  return Object.values(os.networkInterfaces()).flat().filter((i) => i && i.family === "IPv4" && !i.internal).map((i) => i.address);
}

function listen(port, attempts = 10) {
  server.once("error", (e) => {
    if (e.code === "EADDRINUSE" && attempts > 0) return listen(port + 1, attempts - 1);
    console.error("Could not start the server:", e.message); process.exit(1);
  });
  server.listen(port, "0.0.0.0", () => {
    console.log(`\n  Portfolio ${PRODUCTION_LIKE ? "(production build preview)" : "(development)"} is running\n`);
    console.log(`  Website:  http://localhost:${port}`);
    console.log(`  Admin:    http://localhost:${port}/admin`);
    lanAddresses().forEach((ip) => console.log(`  On your phone (same Wi-Fi): http://${ip}:${port}`));
    console.log("\n  Press Ctrl+C to stop.\n");
  });
}
listen(START_PORT);
