-- Roadmap application initial schema

create type step_status as enum (
  'NOT_STARTED',
  'IN_PROGRESS',
  'PAUSED',
  'COMPLETED',
  'SKIPPED'
);

create table projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 120),
  position integer not null default 0 check (position >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table sections (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 120),
  position integer not null default 0 check (position >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table steps (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  section_id uuid references sections(id) on delete set null,
  title text not null check (char_length(trim(title)) between 1 and 200),
  status step_status not null default 'NOT_STARTED',
  weight integer not null default 1 check (weight between 1 and 5),
  position integer not null default 0 check (position >= 0),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table time_logs (
  id uuid primary key default gen_random_uuid(),
  step_id uuid not null references steps(id) on delete cascade,
  duration_minutes integer not null check (duration_minutes > 0 and duration_minutes <= 1440),
  logged_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index projects_user_id_idx on projects(user_id);
create index projects_position_idx on projects(position);
create index sections_project_id_idx on sections(project_id);
create index sections_position_idx on sections(project_id, position);
create index steps_project_id_idx on steps(project_id);
create index steps_section_id_idx on steps(section_id);
create index steps_position_idx on steps(project_id, section_id, position);
create index time_logs_step_id_idx on time_logs(step_id);
create index time_logs_logged_at_idx on time_logs(logged_at);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger projects_updated_at before update on projects
  for each row execute function set_updated_at();

create trigger sections_updated_at before update on sections
  for each row execute function set_updated_at();

create trigger steps_updated_at before update on steps
  for each row execute function set_updated_at();

create trigger time_logs_updated_at before update on time_logs
  for each row execute function set_updated_at();

alter table projects enable row level security;
alter table sections enable row level security;
alter table steps enable row level security;
alter table time_logs enable row level security;

create policy "projects_select_own" on projects for select
  using (user_id is null or auth.uid() = user_id);

create policy "projects_insert_own" on projects for insert
  with check (user_id is null or auth.uid() = user_id);

create policy "projects_update_own" on projects for update
  using (user_id is null or auth.uid() = user_id);

create policy "projects_delete_own" on projects for delete
  using (user_id is null or auth.uid() = user_id);

create policy "sections_select" on sections for select
  using (
    exists (
      select 1 from projects p
      where p.id = sections.project_id
      and (p.user_id is null or p.user_id = auth.uid())
    )
  );

create policy "sections_insert" on sections for insert
  with check (
    exists (
      select 1 from projects p
      where p.id = sections.project_id
      and (p.user_id is null or p.user_id = auth.uid())
    )
  );

create policy "sections_update" on sections for update
  using (
    exists (
      select 1 from projects p
      where p.id = sections.project_id
      and (p.user_id is null or p.user_id = auth.uid())
    )
  );

create policy "sections_delete" on sections for delete
  using (
    exists (
      select 1 from projects p
      where p.id = sections.project_id
      and (p.user_id is null or p.user_id = auth.uid())
    )
  );

create policy "steps_select" on steps for select
  using (
    exists (
      select 1 from projects p
      where p.id = steps.project_id
      and (p.user_id is null or p.user_id = auth.uid())
    )
  );

create policy "steps_insert" on steps for insert
  with check (
    exists (
      select 1 from projects p
      where p.id = steps.project_id
      and (p.user_id is null or p.user_id = auth.uid())
    )
  );

create policy "steps_update" on steps for update
  using (
    exists (
      select 1 from projects p
      where p.id = steps.project_id
      and (p.user_id is null or p.user_id = auth.uid())
    )
  );

create policy "steps_delete" on steps for delete
  using (
    exists (
      select 1 from projects p
      where p.id = steps.project_id
      and (p.user_id is null or p.user_id = auth.uid())
    )
  );

create policy "time_logs_select" on time_logs for select
  using (
    exists (
      select 1 from steps s
      join projects p on p.id = s.project_id
      where s.id = time_logs.step_id
      and (p.user_id is null or p.user_id = auth.uid())
    )
  );

create policy "time_logs_insert" on time_logs for insert
  with check (
    exists (
      select 1 from steps s
      join projects p on p.id = s.project_id
      where s.id = time_logs.step_id
      and (p.user_id is null or p.user_id = auth.uid())
    )
  );

create policy "time_logs_update" on time_logs for update
  using (
    exists (
      select 1 from steps s
      join projects p on p.id = s.project_id
      where s.id = time_logs.step_id
      and (p.user_id is null or p.user_id = auth.uid())
    )
  );

create policy "time_logs_delete" on time_logs for delete
  using (
    exists (
      select 1 from steps s
      join projects p on p.id = s.project_id
      where s.id = time_logs.step_id
      and (p.user_id is null or p.user_id = auth.uid())
    )
  );
