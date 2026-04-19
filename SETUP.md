# Golden Frame Productions — Setup Guide

## What You're Building

A full-stack web app with:
- **Public website** — marketing, events, join form
- **Member portal** — production tools, projects, call sheets, shot lists
- **Admin panel** — member management, role creation, permission control
- **Supabase backend** — auth, database, row-level security
- **RBAC** — every page and action is gated by real permissions

---

## Step 1: Create Your Supabase Project

1. Go to **https://supabase.com** and sign up (free)
2. Click **"New Project"**
3. Fill in:
   - **Name:** `golden-frame-productions`
   - **Database Password:** Save this somewhere safe
   - **Region:** Choose closest to St. Kitts (US East or Europe)
4. Wait ~2 minutes for it to spin up

---

## Step 2: Run the Database Schema

1. In your Supabase dashboard, click **"SQL Editor"** in the left sidebar
2. Click **"New Query"**
3. Open the file `supabase/migrations/001_schema.sql` from this project
4. Paste the entire contents into the SQL editor
5. Click **"Run"** (green button)

This will create:
- All tables (roles, permissions, profiles, projects, events, etc.)
- 4 default roles: Founder, Admin, Active Member, Community Member
- 25 permissions across 7 categories
- Row Level Security policies
- Auto-profile creation on signup

---

## Step 3: Get Your API Keys

1. In Supabase dashboard, click **"Project Settings"** (gear icon)
2. Click **"API"**
3. Copy:
   - **Project URL** (looks like `https://abcdefgh.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)

---

## Step 4: Configure the App

1. In the project folder, copy `.env.example` to `.env.local`:
   ```
   cp .env.example .env.local
   ```

2. Open `.env.local` and paste your values:
   ```
   REACT_APP_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5...
   ```

---

## Step 5: Make Yourself the Founder

After running the schema and signing up for an account:

1. In Supabase, go to **SQL Editor** and run:
   ```sql
   -- Replace 'your@email.com' with your actual email
   update public.profiles
   set 
     role_id = (select id from public.roles where name = 'Founder'),
     status = 'active'
   where id = (
     select id from auth.users where email = 'your@email.com'
   );
   ```

This gives you full admin access including the Role Manager.

---

## Step 6: Run Locally

```bash
# Install dependencies
npm install

# Start the dev server
npm start
```

Open **http://localhost:3000** — you should see the login page.

---

## Step 7: Deploy to the Web (Free Hosting)

### Option A: Netlify (Recommended — easiest)

1. Go to **https://netlify.com** and sign up
2. Click **"Add new site" > "Deploy manually"**
3. Run `npm run build` in the project folder
4. Drag the `build/` folder into Netlify's deploy zone
5. In Netlify: **Site settings > Environment variables**, add:
   - `REACT_APP_SUPABASE_URL` = your URL
   - `REACT_APP_SUPABASE_ANON_KEY` = your key
6. Redeploy — your site is live at a `*.netlify.app` URL

### Option B: Vercel

1. Push the project to a GitHub repo
2. Go to **https://vercel.com**, connect your GitHub
3. Import the repo, add environment variables
4. Deploy — live at `*.vercel.app`

### Custom Domain (Optional)

Once live on Netlify or Vercel, you can add a custom domain like `goldenframeproductions.com` through their domain settings (~$12/year via Namecheap or Google Domains).

---

## How RBAC Works

### Roles
- **Founder** — All permissions, cannot be restricted
- **Admin** — Manage members, events, roles (assigned by Founder)
- **Active Member** — Production tools, projects, scripts, workshops
- **Community Member** — Events and resources only (default for new signups)

### Permissions
Each permission is a string like `projects.create` or `roles.assign`. They're checked:
- In the **React frontend** via `can('permission.key')` — hides UI elements
- In **Supabase** via Row Level Security — blocks actual data access even if someone bypasses the UI

### Creating Custom Roles (Founders & Admins)

1. Log in and go to **Role Manager** in the sidebar
2. Click **"+ New Role"**
3. Give it a name (e.g. "Workshop Leader"), color, and description
4. Toggle individual permissions on/off in the permission matrix
5. Click **"Save Permissions"**
6. Go to **Members**, find the person, and assign them the new role from the dropdown

---

## File Structure

```
golden-frame/
├── public/
│   └── index.html
├── src/
│   ├── context/
│   │   └── AuthContext.js     ← Session, profile, permissions
│   ├── components/
│   │   └── ProtectedRoute.js  ← RBAC route guard
│   ├── pages/
│   │   ├── Login.js           ← Auth page
│   │   ├── RoleManager.js     ← Create/edit roles & permissions
│   │   └── Members.js         ← Member list, role assignment, approvals
│   ├── lib/
│   │   └── supabase.js        ← Supabase client
│   └── App.js                 ← Router, shell, nav
├── supabase/
│   └── migrations/
│       └── 001_schema.sql     ← Full database schema
├── .env.example               ← Environment variable template
└── package.json
```

---

## Next Steps (After Setup)

- [ ] Build out the Projects page with real Supabase queries
- [ ] Connect the Script Editor to save/load from the `scripts` table
- [ ] Build the Events page with real RSVP functionality
- [ ] Add email invitations for new members
- [ ] Connect the public marketing website to the same Supabase instance

---

## Support

If you get stuck on any step, bring the error message back and we'll fix it together.
