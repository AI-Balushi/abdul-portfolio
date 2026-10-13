// Storage adapter. One interface, two backends:
//   - Redis over HTTPS (Upstash, used on Vercel when its env variables exist)
//   - A JSON file in ./data (used on your own computer)
// Every value is a string. Lists are newest-first.
import fs from "node:fs/promises";
import path from "node:path";

function redisStore(url, token) {
  async function cmd(...args) {
    const r = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(args),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || j.error) throw new Error(j.error || `Redis error ${r.status}`);
    return j.result;
  }
  return {
    kind: "redis",
    get: (k) => cmd("GET", k),
    set: (k, v) => cmd("SET", k, v),
    del: (k) => cmd("DEL", k),
    async incr(k, ttl) { const n = await cmd("INCR", k); if (n === 1) await cmd("EXPIRE", k, ttl); return n; },
    async push(list, v, max = 2000) { await cmd("LPUSH", list, v); await cmd("LTRIM", list, 0, max - 1); },
    range: async (list) => (await cmd("LRANGE", list, 0, -1)) || [],
    async remove(list, v) { return (await cmd("LREM", list, 1, v)) > 0; },
  };
}

function fileStore(dir) {
  const file = path.join(dir, "store.json");
  let queue = Promise.resolve();
  const load = async () => { try { return JSON.parse(await fs.readFile(file, "utf8")); } catch { return { kv: {}, lists: {}, counters: {} }; } };
  const save = async (db) => {
    await fs.mkdir(dir, { recursive: true });
    const tmp = file + ".tmp";
    await fs.writeFile(tmp, JSON.stringify(db), { mode: 0o600 });
    await fs.rename(tmp, file);
  };
  const write = (fn) => { const run = queue.then(async () => { const db = await load(); const out = await fn(db); await save(db); return out; }); queue = run.catch(() => {}); return run; };
  const read = (fn) => { const run = queue.then(async () => fn(await load())); queue = run.catch(() => {}); return run; };
  return {
    kind: "file",
    get: (k) => read((db) => (k in db.kv ? db.kv[k] : null)),
    set: (k, v) => write((db) => { db.kv[k] = v; }),
    del: (k) => write((db) => { delete db.kv[k]; }),
    incr: (k, ttl) => write((db) => {
      const now = Date.now(); const c = db.counters[k];
      if (!c || c.exp < now) db.counters[k] = { n: 1, exp: now + ttl * 1000 }; else c.n += 1;
      return db.counters[k].n;
    }),
    push: (list, v, max = 2000) => write((db) => { (db.lists[list] ||= []).unshift(v); db.lists[list].length = Math.min(db.lists[list].length, max); }),
    range: (list) => read((db) => db.lists[list] || []),
    remove: (list, v) => write((db) => { const a = db.lists[list] || []; const i = a.indexOf(v); if (i < 0) return false; a.splice(i, 1); return true; }),
  };
}

let cached;
export function getStore() {
  if (cached !== undefined) return cached;
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (url && token) cached = redisStore(url, token);
  else if (!process.env.VERCEL) cached = fileStore(process.env.DATA_DIR || path.join(process.cwd(), "data"));
  else cached = null; // on Vercel a local file would not persist, so we refuse instead of losing data
  return cached;
}
