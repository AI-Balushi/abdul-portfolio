// Production build: validates the content, copies public/ to dist/, and fills in the site address.
//   node scripts/build.mjs          -> build into dist/
//   node scripts/build.mjs --check  -> only validate the content
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC = path.join(ROOT, "public");
const DIST = path.join(ROOT, "dist");
const checkOnly = process.argv.includes("--check");
const problems = [];
const warnings = [];

// 1) load and validate site-data.js
let data = {};
try {
  const sandbox = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(PUBLIC, "site-data.js"), "utf8"), sandbox, { timeout: 2000 });
  data = sandbox.window.SITE_DATA;
  if (!data || typeof data !== "object") throw new Error("window.SITE_DATA is missing");
} catch (e) {
  problems.push("public/site-data.js could not be read: " + e.message);
}
for (const key of ["profile", "hero", "about", "services", "projects", "skills", "contact", "theme"]) {
  if (data && data[key] == null) problems.push(`site-data.js is missing "${key}"`);
}
const photo = data?.profile?.photo || "";
if (photo && !photo.startsWith("data:") && !fs.existsSync(path.join(PUBLIC, photo))) problems.push(`Profile photo not found: public/${photo}`);
const c = data?.contact || {};
if (!c.email) warnings.push("No email set (contact.email). The form falls back to WhatsApp.");
if (!c.whatsapp) warnings.push("No WhatsApp number set.");
if (!c.linkedin) warnings.push("No LinkedIn URL set.");
(data?.projects || []).forEach((p) => {
  for (const f of ["liveUrl", "repoUrl"]) if (p[f] && !/^https?:\/\//i.test(p[f])) warnings.push(`Project "${p.title}": ${f} should start with https://`);
});

if (problems.length) { console.error("\nBuild stopped:\n" + problems.map((p) => "  - " + p).join("\n") + "\n"); process.exit(1); }
warnings.forEach((w) => console.warn("  note: " + w));
if (checkOnly) { console.log("\nContent check passed.\n"); process.exit(0); }

// 2) work out the public address (for share previews and the sitemap)
let host = process.env.SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL || "";
if (host && !/^https?:\/\//i.test(host)) host = "https://" + host;
host = host.replace(/\/+$/, "");
if (!host) { host = "http://localhost:3000"; console.warn("  note: no SITE_URL set, share links will point to localhost. On Vercel this is filled in automatically."); }

// 3) copy and fill in
fs.rmSync(DIST, { recursive: true, force: true });
fs.cpSync(PUBLIC, DIST, { recursive: true });
for (const f of ["index.html"]) {
  const file = path.join(DIST, f);
  fs.writeFileSync(file, fs.readFileSync(file, "utf8").replaceAll("__SITE_URL__", host));
}
fs.writeFileSync(path.join(DIST, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${host}/</loc><lastmod>${new Date().toISOString().slice(0, 10)}</lastmod><priority>1.0</priority></url>\n</urlset>\n`);
fs.writeFileSync(path.join(DIST, "robots.txt"), `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n\nSitemap: ${host}/sitemap.xml\n`);

// 4) final safety check
const leftover = fs.readFileSync(path.join(DIST, "index.html"), "utf8").includes("__SITE_URL__");
if (leftover) { console.error("Build failed: placeholder left in index.html"); process.exit(1); }
console.log(`\nBuild complete -> dist/   (site address: ${host})\n`);
