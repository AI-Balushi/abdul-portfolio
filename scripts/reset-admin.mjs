// Forgot your admin password on your own computer? Run:  npm run reset-admin
// It removes ONLY the saved login (your messages are kept). The next sign-in uses admin / admin123 again,
// and you will be asked to choose a new password.
import fs from "node:fs";
import path from "node:path";

const file = path.join(process.env.DATA_DIR || path.join(process.cwd(), "data"), "store.json");
if (!fs.existsSync(file)) { console.log("Nothing to reset: no local data file yet."); process.exit(0); }
const db = JSON.parse(fs.readFileSync(file, "utf8"));
const had = !!(db.kv && db.kv["admin:cred"]);
if (db.kv) delete db.kv["admin:cred"];
if (db.counters) for (const k of Object.keys(db.counters)) if (k.startsWith("rl:login:")) delete db.counters[k];
fs.writeFileSync(file, JSON.stringify(db), { mode: 0o600 });
console.log(had ? "Admin login reset. Sign in with admin / admin123 and choose a new password." : "There was no saved login to reset.");
console.log("(On Vercel: open your Upstash database > Data Browser and delete the key  admin:cred , then sign in with your ADMIN_USER / ADMIN_PASSWORD.)");
