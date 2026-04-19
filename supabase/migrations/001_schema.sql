-- ============================================================
-- Golden Frame Productions — Supabase Schema
-- Run this in: Supabase Dashboard > SQL Editor > New Query
-- ============================================================

-- 1. ROLES TABLE
-- Admins/founders can create custom roles here
create table public.roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  color text default '#C9A84C',
  is_system boolean default false,  -- system roles (founder, admin) can't be deleted
  created_at timestamptz default now(),
  created_by uuid references auth.users(id)
);

-- 2. PERMISSIONS TABLE
-- Each permission is a discrete action in the app
create table public.permissions (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,          -- e.g. 'projects.create'
  label text not null,               -- e.g. 'Create Projects'
  category text not null,            -- e.g. 'Projects', 'Members', 'Admin'
  description text
);

-- 3. ROLE_PERMISSIONS — many-to-many
create table public.role_permissions (
  role_id uuid references public.roles(id) on delete cascade,
  permission_id uuid references public.permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);

-- 4. PROFILES — extends auth.users
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  bio text,
  avatar_url text,
  role_id uuid references public.roles(id),
  status text default 'pending' check (status in ('pending','active','suspended')),
  joined_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 5. PROJECTS
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  genre text,
  format text,
  logline text,
  status text default 'idea' check (status in ('idea','development','pre_production','production','post_production','complete')),
  owner_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 6. PROJECT_COLLABORATORS
create table public.project_collaborators (
  project_id uuid references public.projects(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete cascade,
  role_in_project text,
  primary key (project_id, profile_id)
);

-- 7. SCRIPTS
create table public.scripts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  title text not null,
  content text default '',
  version integer default 1,
  created_by uuid references public.profiles(id),
  updated_at timestamptz default now()
);

-- 8. SHOT_LIST
create table public.shots (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  scene_number text,
  shot_id text,
  description text,
  shot_type text,
  lens text,
  movement text,
  estimated_time text,
  order_index integer default 0,
  created_at timestamptz default now()
);

-- 9. CALL_SHEETS
create table public.call_sheets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  shoot_date date,
  general_call time,
  location text,
  notes text,
  crew jsonb default '[]',
  schedule jsonb default '[]',
  equipment jsonb default '[]',
  created_at timestamptz default now()
);

-- 10. EVENTS
create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  event_date timestamptz,
  location text,
  event_type text default 'public' check (event_type in ('public','members','active_members')),
  created_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

-- 11. EVENT_RSVPS
create table public.event_rsvps (
  event_id uuid references public.events(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete cascade,
  status text default 'going' check (status in ('going','maybe','not_going')),
  primary key (event_id, profile_id)
);

-- ============================================================
-- SEED: System Roles
-- ============================================================
insert into public.roles (name, description, color, is_system) values
  ('Founder',         'Full access to everything. Cannot be modified.',     '#C9A84C', true),
  ('Admin',           'Manage members, roles, events. Cannot delete org.',  '#185FA5', true),
  ('Active Member',   'Full production tool access and voting rights.',      '#3B6D11', false),
  ('Community Member','Access to public events and basic resources.',         '#5F5E5A', false);

-- ============================================================
-- SEED: Permissions
-- ============================================================
insert into public.permissions (key, label, category, description) values
  -- Projects
  ('projects.view',            'View Projects',              'Projects', 'Can view own and shared projects'),
  ('projects.create',          'Create Projects',            'Projects', 'Can create new film projects'),
  ('projects.edit_own',        'Edit Own Projects',          'Projects', 'Can edit projects they own'),
  ('projects.edit_any',        'Edit Any Project',           'Projects', 'Can edit any member''s project'),
  ('projects.delete_own',      'Delete Own Projects',        'Projects', 'Can delete their own projects'),
  ('projects.delete_any',      'Delete Any Project',         'Projects', 'Can delete any project'),
  -- Scripts
  ('scripts.view',             'View Scripts',               'Scripts',  'Can view scripts in their projects'),
  ('scripts.create',           'Create Scripts',             'Scripts',  'Can create new scripts'),
  ('scripts.edit',             'Edit Scripts',               'Scripts',  'Can edit scripts'),
  -- Production Tools
  ('tools.call_sheet',         'Use Call Sheets',            'Tools',    'Can create and edit call sheets'),
  ('tools.shot_list',          'Use Shot Lists',             'Tools',    'Can create and edit shot lists'),
  -- Events
  ('events.view',              'View Events',                'Events',   'Can view all events'),
  ('events.rsvp',              'RSVP to Events',             'Events',   'Can RSVP to events'),
  ('events.create',            'Create Events',              'Events',   'Can create and manage events'),
  -- Members
  ('members.view_directory',   'View Member Directory',      'Members',  'Can see the member list'),
  ('members.invite',           'Invite Members',             'Members',  'Can send membership invitations'),
  ('members.approve',          'Approve Applications',       'Members',  'Can approve or reject applications'),
  ('members.suspend',          'Suspend Members',            'Members',  'Can suspend member accounts'),
  -- Roles & Admin
  ('roles.view',               'View Roles',                 'Admin',    'Can view role definitions'),
  ('roles.create',             'Create Roles',               'Admin',    'Can create new custom roles'),
  ('roles.edit',               'Edit Roles',                 'Admin',    'Can edit roles and permissions'),
  ('roles.delete',             'Delete Roles',               'Admin',    'Can delete non-system roles'),
  ('roles.assign',             'Assign Roles',               'Admin',    'Can assign roles to members'),
  -- Resources
  ('resources.view',           'View Resources',             'Resources','Can access the resource library'),
  ('resources.upload',         'Upload Resources',           'Resources','Can add resources to the library');

-- ============================================================
-- SEED: Assign permissions to system roles
-- ============================================================

-- Founder gets everything
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.roles r, public.permissions p
where r.name = 'Founder';

-- Admin gets everything except delete_any project (editorial choice)
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.roles r, public.permissions p
where r.name = 'Admin'
  and p.key not in ('projects.delete_any');

-- Active Member
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.roles r, public.permissions p
where r.name = 'Active Member'
  and p.key in (
    'projects.view','projects.create','projects.edit_own','projects.delete_own',
    'scripts.view','scripts.create','scripts.edit',
    'tools.call_sheet','tools.shot_list',
    'events.view','events.rsvp',
    'members.view_directory',
    'roles.view',
    'resources.view'
  );

-- Community Member
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.roles r, public.permissions p
where r.name = 'Community Member'
  and p.key in (
    'events.view','events.rsvp',
    'resources.view'
  );

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.scripts enable row level security;
alter table public.shots enable row level security;
alter table public.call_sheets enable row level security;
alter table public.events enable row level security;
alter table public.event_rsvps enable row level security;
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;

-- Helper: check if current user has a permission
create or replace function public.has_permission(perm_key text)
returns boolean language sql security definer stable as $$
  select exists (
    select 1
    from public.profiles pr
    join public.role_permissions rp on rp.role_id = pr.role_id
    join public.permissions p on p.id = rp.permission_id
    where pr.id = auth.uid()
      and p.key = perm_key
  );
$$;

-- Helper: is user a founder or admin
create or replace function public.is_admin()
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.profiles pr
    join public.roles r on r.id = pr.role_id
    where pr.id = auth.uid()
      and r.name in ('Founder', 'Admin')
  );
$$;

-- PROFILES policies
create policy "Users can view own profile" on public.profiles for select using (id = auth.uid());
create policy "Members can view directory" on public.profiles for select using (has_permission('members.view_directory'));
create policy "Users can update own profile" on public.profiles for update using (id = auth.uid());
create policy "Admins can update any profile" on public.profiles for update using (is_admin());

-- PROJECTS policies
create policy "View own or collaborated projects" on public.projects for select
  using (owner_id = auth.uid() or has_permission('projects.edit_any'));
create policy "Create projects" on public.projects for insert
  with check (has_permission('projects.create'));
create policy "Edit own projects" on public.projects for update
  using (owner_id = auth.uid() and has_permission('projects.edit_own'));
create policy "Admin edit any project" on public.projects for update
  using (has_permission('projects.edit_any'));
create policy "Delete own projects" on public.projects for delete
  using (owner_id = auth.uid() and has_permission('projects.delete_own'));

-- EVENTS policies
create policy "View events" on public.events for select using (has_permission('events.view'));
create policy "Create events" on public.events for insert with check (has_permission('events.create'));
create policy "Edit events" on public.events for update using (has_permission('events.create'));

-- RSVP policies
create policy "View own rsvps" on public.event_rsvps for select using (profile_id = auth.uid());
create policy "Manage own rsvp" on public.event_rsvps for all using (profile_id = auth.uid());

-- ROLES policies (read by anyone logged in, write by admins)
create policy "View roles" on public.roles for select using (auth.uid() is not null);
create policy "Manage roles" on public.roles for all using (is_admin());

-- PERMISSIONS policies (read-only for all logged-in)
create policy "View permissions" on public.permissions for select using (auth.uid() is not null);
create policy "View role_permissions" on public.role_permissions for select using (auth.uid() is not null);
create policy "Manage role_permissions" on public.role_permissions for all using (is_admin());

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
declare
  community_role_id uuid;
begin
  select id into community_role_id from public.roles where name = 'Community Member' limit 1;
  insert into public.profiles (id, full_name, role_id, status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    community_role_id,
    'pending'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
