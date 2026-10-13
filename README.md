# Abdul Waheed Baloch: Portfolio

An animated portfolio with a **password-protected admin page** and a **contact form that saves every
message**. It has no npm dependencies. You only need Node.js 18 or newer (https://nodejs.org).

```
public/            the website + admin page (what Vercel serves)
  index.html       the website
  admin.html       the admin page (served at /admin, protected by login)
  site-data.js     ALL your content, links and colours
  profile.webp, og-image.png
api/               serverless functions (run on Vercel, and by the local server)
  contact.js       saves contact-form messages
  admin.js         login, inbox, change password
lib/               storage, passwords and sessions
server.mjs         local development server
scripts/           build, content check, reset-admin
vercel.json        Vercel settings
```

## 1. Run it on your computer

```bash
npm install
npm run dev
```

- Website: http://localhost:3000
- Admin: http://localhost:3000/admin
- It also prints an address for your phone on the same Wi-Fi.

Messages and your login are stored in a local folder called `data/` (private, never uploaded to GitHub).

## 2. Admin login

**First sign in (on your computer only):**

| Username | Password |
| --- | --- |
| `admin` | `admin123` |

The first time, the admin page makes you **choose your own username and password** before anything else
(at least 8 characters, and not the default). You can change them again any time under
**Account and security**. Changing your password signs out every other device.

Forgot it locally? Run `npm run reset-admin`. It resets only the login (messages are kept), so
`admin` / `admin123` works once more and you pick a new password.

### What the admin page does
- **Messages:** every contact-form message, newest first. Opening one marks it read. Reply by email,
  mark unread, delete, filter unread, or export everything to CSV.
- **Content editing:** profile, hero text, services, projects, skills, experience, contact links,
  colours and photo. Edits show instantly on your own browser as a draft. To publish them for
  everyone: **Publish and backup > Download site-data.js**, replace `public/site-data.js`, then push to GitHub.
- **Account and security:** change your username and password.

## 3. Put it online with Vercel

### Step 1: push the project to GitHub
```bash
git init
git add .
git commit -m "Portfolio"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -u origin main
```

### Step 2: import it on Vercel
Vercel > **Add New > Project** > import your repository > **Deploy**. Nothing else to change.

### Step 3: set your admin login (required, do this before you first sign in)
For safety, the well-known `admin` / `admin123` login is **blocked on a deployed server**.
In Vercel open **Settings > Environment Variables** and add:

| Name | Value |
| --- | --- |
| `ADMIN_USER` | the username you want |
| `ADMIN_PASSWORD` | a strong password (this is used only the first time) |

### Step 4: connect a database (so messages and your login can be saved)
Vercel's servers cannot keep files, so messages go into a small free Redis database.

**Easiest:** Vercel project > **Storage** > **Create Database** > choose **Upstash (Redis)** > connect
it to your project. Vercel adds the connection variables for you (`KV_REST_API_URL` and `KV_REST_API_TOKEN`).
Menu names can change slightly over time.

**Or manually:** create a free database at https://upstash.com, copy its **REST URL** and **REST Token**,
and add them in Vercel as `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.

### Step 5: redeploy
Vercel > **Deployments** > the latest one > **Redeploy**. Then open `https://your-site.vercel.app/admin`
and sign in with your `ADMIN_USER` / `ADMIN_PASSWORD`. After you change your password in the admin page,
the saved password is used and the environment variable is ignored.

Until the database is connected, the website still works: the contact form falls back to opening the
visitor's email app (or WhatsApp), and the admin page tells you storage is not connected.

### Optional: get an email for every new message
Add `RESEND_API_KEY` (free at https://resend.com) and `CONTACT_TO_EMAIL` in Vercel. Messages are saved
either way; this just also emails you. Optional `CONTACT_FROM_EMAIL` must be a sender verified in Resend.

### Optional: your own domain
Vercel > **Settings > Domains**. Then add `SITE_URL` = `https://your-domain.com` so share previews and the
sitemap use it, and redeploy.

## Security notes
- Passwords are stored only as salted scrypt hashes, never as text.
- Sessions use signed, HttpOnly, SameSite=Strict cookies (Secure on HTTPS). Changing the password signs out old sessions.
- Login is limited to 10 attempts per 15 minutes per address. The contact form is limited to 8 messages per hour per address and has a hidden spam trap.
- Admin actions reject requests from other websites.
- The admin page is not indexed by search engines, but anyone can see the login screen. That is normal for a login page.
- Use a strong, unique password. Do not commit the `data/` folder or put secrets in `site-data.js`.
- Messages contain visitors' personal details, so keep your login private and delete messages you no longer need.

## Useful commands
```bash
npm run dev           # run locally
npm run check         # validate your content
npm run preview       # build and serve the production files locally
npm run reset-admin   # forgot your local admin password
```

## Honest content rules built in
- Projects are labelled Concept. Live Demo stays disabled until you add a real link.
- Employer, dates, achievements and certifications stay hidden until you fill them in.
