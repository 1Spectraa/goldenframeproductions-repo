-- ============================================================
-- Golden Frame Productions — RLS Fix Patch
-- Run this in Supabase Dashboard > SQL Editor > New Query
-- ============================================================

-- Drop all existing policies that may be blocking queries
drop policy if exists "View own or collaborated projects" on public.projects;
drop policy if exists "Create projects" on public.projects;
drop policy if exists "Edit own projects" on public.projects;
drop policy if exists "Admin edit any project" on public.projects;
drop policy if exists "Delete own projects" on public.projects;

drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Members can view directory" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Admins can update any profile" on public.profiles;

drop policy if exists "View events" on public.events;
drop policy if exists "Create events" on public.events;
drop policy if exists "Edit events" on public.events;

drop policy if exists "View own rsvps" on public.event_rsvps;
drop policy if exists "Manage own rsvp" on public.event_rsvps;

drop policy if exists "View roles" on public.roles;
drop policy if exists "Manage roles" on public.roles;
drop policy if exists "View permissions" on public.permissions;
drop policy if exists "View role_permissions" on public.role_permissions;
drop policy if exists "Manage role_permissions" on public.role_permissions;

-- Drop and recreate scripts/shots/callsheets policies if they exist
drop policy if exists "View scripts" on public.scripts;
drop policy if exists "Create scripts" on public.scripts;
drop policy if exists "Edit scripts" on public.scripts;
drop policy if exists "Delete scripts" on public.scripts;

drop policy if exists "View shots" on public.shots;
drop policy if exists "Create shots" on public.shots;
drop policy if exists "Edit shots" on public.shots;
drop policy if exists "Delete shots" on public.shots;

drop policy if exists "View call sheets" on public.call_sheets;
drop policy if exists "Create call sheets" on public.call_sheets;
drop policy if exists "Edit call sheets" on public.call_sheets;
drop policy if exists "Delete call sheets" on public.call_sheets;

-- ============================================================
-- PROFILES
-- ============================================================
create policy "profiles_select" on public.profiles
  for select using (auth.uid() is not null);

create policy "profiles_insert" on public.profiles
  for insert with check (id = auth.uid());

create policy "profiles_update" on public.profiles
  for update using (id = auth.uid() or is_admin());

-- ============================================================
-- PROJECTS — open to all logged-in users who own them
-- ============================================================
create policy "projects_select" on public.projects
  for select using (auth.uid() is not null);

create policy "projects_insert" on public.projects
  for insert with check (auth.uid() is not null and owner_id = auth.uid());

create policy "projects_update" on public.projects
  for update using (owner_id = auth.uid() or is_admin());

create policy "projects_delete" on public.projects
  for delete using (owner_id = auth.uid() or is_admin());

-- ============================================================
-- SCRIPTS
-- ============================================================
alter table public.scripts enable row level security;

create policy "scripts_select" on public.scripts
  for select using (auth.uid() is not null);

create policy "scripts_insert" on public.scripts
  for insert with check (auth.uid() is not null);

create policy "scripts_update" on public.scripts
  for update using (auth.uid() is not null);

create policy "scripts_delete" on public.scripts
  for delete using (
    created_by = auth.uid() or is_admin()
  );

-- ============================================================
-- SHOTS
-- ============================================================
alter table public.shots enable row level security;

create policy "shots_select" on public.shots
  for select using (auth.uid() is not null);

create policy "shots_insert" on public.shots
  for insert with check (auth.uid() is not null);

create policy "shots_update" on public.shots
  for update using (auth.uid() is not null);

create policy "shots_delete" on public.shots
  for delete using (auth.uid() is not null);

-- ============================================================
-- CALL SHEETS
-- ============================================================
alter table public.call_sheets enable row level security;

create policy "callsheets_select" on public.call_sheets
  for select using (auth.uid() is not null);

create policy "callsheets_insert" on public.call_sheets
  for insert with check (auth.uid() is not null);

create policy "callsheets_update" on public.call_sheets
  for update using (auth.uid() is not null);

create policy "callsheets_delete" on public.call_sheets
  for delete using (auth.uid() is not null);

-- ============================================================
-- EVENTS
-- ============================================================
create policy "events_select" on public.events
  for select using (auth.uid() is not null);

create policy "events_insert" on public.events
  for insert with check (auth.uid() is not null);

create policy "events_update" on public.events
  for update using (created_by = auth.uid() or is_admin());

create policy "events_delete" on public.events
  for delete using (created_by = auth.uid() or is_admin());

-- ============================================================
-- EVENT RSVPS
-- ============================================================
create policy "rsvps_select" on public.event_rsvps
  for select using (auth.uid() is not null);

create policy "rsvps_insert" on public.event_rsvps
  for insert with check (profile_id = auth.uid());

create policy "rsvps_update" on public.event_rsvps
  for update using (profile_id = auth.uid());

create policy "rsvps_delete" on public.event_rsvps
  for delete using (profile_id = auth.uid());

-- ============================================================
-- ROLES & PERMISSIONS (read-only for members, write for admins)
-- ============================================================
create policy "roles_select" on public.roles
  for select using (auth.uid() is not null);

create policy "roles_write" on public.roles
  for all using (is_admin());

create policy "permissions_select" on public.permissions
  for select using (auth.uid() is not null);

create policy "role_permissions_select" on public.role_permissions
  for select using (auth.uid() is not null);

create policy "role_permissions_write" on public.role_permissions
  for all using (is_admin());
