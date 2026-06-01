-- InsightLoop initial Supabase schema.
-- Multi-tenant data is owned by companies; platform-wide catalogs use null company_id.

create extension if not exists pgcrypto;
create extension if not exists citext;

do $$ begin
  create type public.app_role as enum ('company_admin', 'hr_manager', 'manager', 'employee');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.member_status as enum ('invited', 'active', 'inactive', 'offboarded');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.company_status as enum ('active', 'onboarding', 'suspended', 'archived');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.subscription_plan as enum ('starter', 'professional', 'enterprise');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.payment_status as enum ('paid', 'overdue', 'trial', 'cancelled');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.risk_level as enum ('unknown', 'low', 'moderate', 'high', 'critical');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.trend_direction as enum ('up', 'down', 'stable');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.report_category as enum ('organization', 'department', 'inventory');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.report_status as enum ('draft', 'published', 'archived');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.resource_category as enum ('education', 'practice', 'guide', 'recovery', 'exercise', 'meditation', 'blog');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.resource_type as enum ('article', 'video', 'audio');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.assessment_item_type as enum ('scale', 'multiple_choice', 'text');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.assessment_run_status as enum ('draft', 'scheduled', 'active', 'completed', 'cancelled');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.assessment_frequency as enum ('one_time', 'weekly', 'monthly', 'quarterly', 'bi_annual');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.assessment_target_type as enum ('company', 'department', 'segment');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.assessment_response_status as enum ('started', 'submitted', 'voided');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.action_plan_status as enum ('draft', 'approved', 'in_progress', 'completed', 'on_hold', 'cancelled');
exception when duplicate_object then null;
end $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email citext unique,
  full_name text,
  avatar_url text,
  is_platform_admin boolean not null default false,
  timezone text not null default 'UTC',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  tenant_code text not null unique,
  name text not null,
  sector text,
  website text,
  employee_count integer not null default 0 check (employee_count >= 0),
  active_employee_count integer not null default 0 check (active_employee_count >= 0),
  status public.company_status not null default 'onboarding',
  risk_level public.risk_level not null default 'unknown',
  contact_name text,
  contact_email citext,
  contact_phone text,
  payment_status public.payment_status not null default 'trial',
  subscription_plan public.subscription_plan not null default 'professional',
  next_billing_date date,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.company_requests (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  contact_name text,
  email citext not null,
  request_type text not null,
  requested_employee_count integer check (requested_employee_count is null or requested_employee_count >= 0),
  status text not null default 'pending',
  submitted_at timestamptz not null default now(),
  resolved_at timestamptz,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.company_invoices (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  invoice_number text not null,
  invoice_date date not null,
  amount numeric(12,2) not null check (amount >= 0),
  currency text not null default 'USD',
  status public.payment_status not null default 'trial',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, invoice_number)
);

create table public.departments (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  code text,
  name text not null,
  manager_member_id uuid,
  manager_name text,
  employee_count integer not null default 0 check (employee_count >= 0),
  burnout_score numeric(4,2) check (burnout_score is null or burnout_score between 0 and 5),
  stress_score numeric(4,2) check (stress_score is null or stress_score between 0 and 5),
  resource_index numeric(4,2) check (resource_index is null or resource_index between 0 and 5),
  fairness_score numeric(4,2) check (fairness_score is null or fairness_score between 0 and 5),
  risk_level public.risk_level not null default 'unknown',
  trend public.trend_direction not null default 'stable',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, id),
  unique (company_id, name)
);

create table public.company_members (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  department_id uuid references public.departments(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  full_name text not null,
  email citext not null,
  phone text,
  job_title text,
  role public.app_role not null default 'employee',
  status public.member_status not null default 'invited',
  invited_at timestamptz,
  joined_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, id),
  unique (company_id, email),
  unique (company_id, user_id)
);

alter table public.departments
  add constraint departments_manager_member_id_fkey
  foreign key (manager_member_id) references public.company_members(id) on delete set null;

create table public.department_metric_snapshots (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  department_id uuid references public.departments(id) on delete cascade,
  metric_date date not null,
  period_label text,
  stress_score numeric(4,2) check (stress_score is null or stress_score between 0 and 5),
  workload_score numeric(4,2) check (workload_score is null or workload_score between 0 and 5),
  burnout_score numeric(4,2) check (burnout_score is null or burnout_score between 0 and 5),
  resource_index numeric(4,2) check (resource_index is null or resource_index between 0 and 5),
  fairness_score numeric(4,2) check (fairness_score is null or fairness_score between 0 and 5),
  support_score numeric(4,2) check (support_score is null or support_score between 0 and 5),
  autonomy_score numeric(4,2) check (autonomy_score is null or autonomy_score between 0 and 5),
  community_score numeric(4,2) check (community_score is null or community_score between 0 and 5),
  wellbeing_score numeric(5,2) check (wellbeing_score is null or wellbeing_score between 0 and 100),
  response_count integer not null default 0 check (response_count >= 0),
  risk_level public.risk_level not null default 'unknown',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.interventions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade,
  code text not null,
  title text not null,
  description text,
  category text not null,
  jd_dimension text,
  expected_impact numeric(5,4) not null default 0 check (expected_impact between 0 and 1),
  estimated_cost numeric(5,4) not null default 0 check (estimated_cost between 0 and 1),
  speed numeric(5,4) not null default 0 check (speed between 0 and 1),
  readiness_need numeric(5,4) not null default 0 check (readiness_need between 0 and 1),
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index interventions_owner_code_idx
  on public.interventions (coalesce(company_id, '00000000-0000-0000-0000-000000000000'::uuid), lower(code));

create table public.personas (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  code text not null,
  name text not null,
  description text,
  dominant_pattern text,
  risk_level public.risk_level not null default 'unknown',
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, id),
  unique (company_id, code)
);

create table public.persona_departments (
  company_id uuid not null references public.companies(id) on delete cascade,
  persona_id uuid not null,
  department_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (persona_id, department_id),
  foreign key (company_id, persona_id) references public.personas(company_id, id) on delete cascade,
  foreign key (company_id, department_id) references public.departments(company_id, id) on delete cascade
);

create table public.persona_interventions (
  company_id uuid not null references public.companies(id) on delete cascade,
  persona_id uuid not null,
  intervention_id uuid not null references public.interventions(id) on delete cascade,
  rank integer not null default 1 check (rank > 0),
  rationale text,
  created_at timestamptz not null default now(),
  primary key (persona_id, intervention_id),
  foreign key (company_id, persona_id) references public.personas(company_id, id) on delete cascade
);

create table public.library_resources (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade,
  title text not null,
  category public.resource_category not null,
  duration_label text,
  icon_name text,
  resource_type public.resource_type not null,
  content text,
  url text,
  is_published boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.assessment_templates (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade,
  code text not null,
  title text not null,
  version text not null,
  description text,
  purpose text,
  measures text,
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index assessment_templates_owner_code_version_idx
  on public.assessment_templates (coalesce(company_id, '00000000-0000-0000-0000-000000000000'::uuid), lower(code), lower(version));

create table public.assessment_items (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.assessment_templates(id) on delete cascade,
  item_code text not null,
  item_type public.assessment_item_type not null,
  question text not null,
  dimension text,
  options jsonb not null default '[]'::jsonb,
  scale_min integer,
  scale_max integer,
  scale_min_label text,
  scale_max_label text,
  reverse_scored boolean not null default false,
  display_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (template_id, item_code),
  check (
    (item_type = 'scale' and scale_min is not null and scale_max is not null and scale_min < scale_max)
    or item_type <> 'scale'
  )
);

create table public.assessment_runs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  template_id uuid references public.assessment_templates(id) on delete set null,
  name text not null,
  status public.assessment_run_status not null default 'draft',
  target_type public.assessment_target_type not null default 'company',
  target_department_id uuid references public.departments(id) on delete set null,
  frequency public.assessment_frequency not null default 'one_time',
  starts_at timestamptz,
  ends_at timestamptz,
  completion_goal numeric(5,2) check (completion_goal is null or completion_goal between 0 and 100),
  invited_count integer not null default 0 check (invited_count >= 0),
  response_count integer not null default 0 check (response_count >= 0),
  response_rate numeric(5,2) check (response_rate is null or response_rate between 0 and 100),
  finding text,
  metrics jsonb not null default '{}'::jsonb,
  insights text[] not null default '{}'::text[],
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, id)
);

create table public.assessment_responses (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  assessment_run_id uuid not null,
  company_member_id uuid references public.company_members(id) on delete set null,
  respondent_user_id uuid references auth.users(id) on delete set null,
  status public.assessment_response_status not null default 'started',
  submitted_at timestamptz,
  score_label text,
  details text,
  metrics jsonb not null default '{}'::jsonb,
  is_anonymized boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (company_id, assessment_run_id) references public.assessment_runs(company_id, id) on delete cascade
);

create unique index assessment_responses_one_member_per_run_idx
  on public.assessment_responses (assessment_run_id, company_member_id)
  where company_member_id is not null;

create table public.assessment_answers (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  assessment_response_id uuid not null references public.assessment_responses(id) on delete cascade,
  assessment_item_id uuid references public.assessment_items(id) on delete set null,
  numeric_value numeric(8,2),
  text_value text,
  option_value text,
  option_values jsonb not null default '[]'::jsonb,
  display_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.assessment_metric_results (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  assessment_run_id uuid references public.assessment_runs(id) on delete cascade,
  department_id uuid references public.departments(id) on delete cascade,
  persona_id uuid references public.personas(id) on delete set null,
  scope_type text not null,
  metric_name text not null,
  metric_value numeric(8,2) not null,
  trend_label text,
  sample_size integer not null default 0 check (sample_size >= 0),
  computed_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  department_id uuid references public.departments(id) on delete set null,
  assessment_run_id uuid references public.assessment_runs(id) on delete set null,
  title text not null,
  report_type text not null,
  scope_label text not null,
  category public.report_category not null,
  status public.report_status not null default 'draft',
  author_name text,
  content text,
  generated_by uuid references auth.users(id) on delete set null,
  report_date date not null default current_date,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.intervention_rankings (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  department_id uuid references public.departments(id) on delete cascade,
  assessment_run_id uuid references public.assessment_runs(id) on delete set null,
  persona_id uuid references public.personas(id) on delete set null,
  intervention_id uuid not null references public.interventions(id) on delete cascade,
  rank integer not null check (rank > 0),
  closeness_coefficient numeric(8,4) check (closeness_coefficient is null or closeness_coefficient between 0 and 1),
  weights jsonb not null default '{}'::jsonb,
  rationale text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.action_plans (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  department_id uuid references public.departments(id) on delete set null,
  intervention_id uuid references public.interventions(id) on delete set null,
  persona_id uuid references public.personas(id) on delete set null,
  title text not null,
  owner_member_id uuid references public.company_members(id) on delete set null,
  owner_name text,
  status public.action_plan_status not null default 'draft',
  start_date date,
  due_date date,
  completed_at timestamptz,
  kpi text,
  details text,
  rationale text,
  impact_label text,
  effort_label text,
  cost_label text,
  timeline_label text,
  review_date date,
  progress_percent integer not null default 0 check (progress_percent between 0 and 100),
  last_updated_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  approved_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.action_plan_updates (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  action_plan_id uuid not null references public.action_plans(id) on delete cascade,
  author_member_id uuid references public.company_members(id) on delete set null,
  status public.action_plan_status,
  note text,
  created_at timestamptz not null default now()
);

create table public.company_settings (
  company_id uuid primary key references public.companies(id) on delete cascade,
  ahp_weights jsonb not null default '{"cost":22,"speed":12,"impact":47,"readiness":19}'::jsonb,
  report_preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ai_prompt_templates (
  id text primary key,
  company_id uuid references public.companies(id) on delete cascade,
  title text not null,
  description text,
  content text not null,
  variables text[] not null default '{}'::text[],
  is_active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.sector_benchmarks (
  id uuid primary key default gen_random_uuid(),
  sector text not null unique,
  burnout numeric(4,2) check (burnout is null or burnout between 0 and 5),
  stress numeric(4,2) check (stress is null or stress between 0 and 5),
  resources numeric(4,2) check (resources is null or resources between 0 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.employee_dashboard_snapshots (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  company_member_id uuid references public.company_members(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_member_id)
);

create index company_members_company_role_idx on public.company_members (company_id, role, status);
create index company_members_user_idx on public.company_members (user_id) where user_id is not null;
create index departments_company_risk_idx on public.departments (company_id, risk_level);
create index department_metric_snapshots_company_date_idx on public.department_metric_snapshots (company_id, metric_date desc);
create index interventions_company_active_idx on public.interventions (company_id, is_active);
create index personas_company_idx on public.personas (company_id, is_active);
create index library_resources_company_category_idx on public.library_resources (company_id, category, is_published);
create index assessment_runs_company_status_idx on public.assessment_runs (company_id, status);
create index assessment_responses_run_idx on public.assessment_responses (assessment_run_id, status);
create index assessment_metric_results_company_scope_idx on public.assessment_metric_results (company_id, scope_type, metric_name);
create index reports_company_category_date_idx on public.reports (company_id, category, report_date desc);
create index action_plans_company_status_idx on public.action_plans (company_id, status, due_date);
create index intervention_rankings_company_dept_idx on public.intervention_rankings (company_id, department_id, rank);
create index ai_prompt_templates_company_active_idx on public.ai_prompt_templates (company_id, is_active);
create index employee_dashboard_snapshots_company_idx on public.employee_dashboard_snapshots (company_id, company_member_id);

create trigger set_profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger set_companies_updated_at before update on public.companies for each row execute function public.set_updated_at();
create trigger set_company_requests_updated_at before update on public.company_requests for each row execute function public.set_updated_at();
create trigger set_company_invoices_updated_at before update on public.company_invoices for each row execute function public.set_updated_at();
create trigger set_departments_updated_at before update on public.departments for each row execute function public.set_updated_at();
create trigger set_company_members_updated_at before update on public.company_members for each row execute function public.set_updated_at();
create trigger set_department_metric_snapshots_updated_at before update on public.department_metric_snapshots for each row execute function public.set_updated_at();
create trigger set_interventions_updated_at before update on public.interventions for each row execute function public.set_updated_at();
create trigger set_personas_updated_at before update on public.personas for each row execute function public.set_updated_at();
create trigger set_library_resources_updated_at before update on public.library_resources for each row execute function public.set_updated_at();
create trigger set_assessment_templates_updated_at before update on public.assessment_templates for each row execute function public.set_updated_at();
create trigger set_assessment_items_updated_at before update on public.assessment_items for each row execute function public.set_updated_at();
create trigger set_assessment_runs_updated_at before update on public.assessment_runs for each row execute function public.set_updated_at();
create trigger set_assessment_responses_updated_at before update on public.assessment_responses for each row execute function public.set_updated_at();
create trigger set_assessment_answers_updated_at before update on public.assessment_answers for each row execute function public.set_updated_at();
create trigger set_assessment_metric_results_updated_at before update on public.assessment_metric_results for each row execute function public.set_updated_at();
create trigger set_reports_updated_at before update on public.reports for each row execute function public.set_updated_at();
create trigger set_intervention_rankings_updated_at before update on public.intervention_rankings for each row execute function public.set_updated_at();
create trigger set_action_plans_updated_at before update on public.action_plans for each row execute function public.set_updated_at();
create trigger set_company_settings_updated_at before update on public.company_settings for each row execute function public.set_updated_at();
create trigger set_ai_prompt_templates_updated_at before update on public.ai_prompt_templates for each row execute function public.set_updated_at();
create trigger set_sector_benchmarks_updated_at before update on public.sector_benchmarks for each row execute function public.set_updated_at();
create trigger set_employee_dashboard_snapshots_updated_at before update on public.employee_dashboard_snapshots for each row execute function public.set_updated_at();

create or replace function public.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((
    select p.is_platform_admin
    from public.profiles p
    where p.id = auth.uid()
  ), false);
$$;

create or replace function public.is_company_member(target_company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.company_members cm
    where cm.company_id = target_company_id
      and cm.user_id = auth.uid()
      and cm.status = 'active'
  );
$$;

create or replace function public.has_company_role(target_company_id uuid, allowed_roles public.app_role[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.company_members cm
    where cm.company_id = target_company_id
      and cm.user_id = auth.uid()
      and cm.status = 'active'
      and cm.role = any(allowed_roles)
  );
$$;

create or replace function public.can_manage_company(target_company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_platform_admin()
    or public.has_company_role(
      target_company_id,
      array['company_admin'::public.app_role, 'hr_manager'::public.app_role]
    );
$$;

create or replace function public.can_view_company_insights(target_company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_platform_admin()
    or public.has_company_role(
      target_company_id,
      array['company_admin'::public.app_role, 'hr_manager'::public.app_role, 'manager'::public.app_role]
    );
$$;

create or replace function public.can_read_assessment_template(target_template_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.assessment_templates t
    where t.id = target_template_id
      and (
        public.is_platform_admin()
        or t.company_id is null
        or public.is_company_member(t.company_id)
      )
  );
$$;

create or replace function public.can_manage_assessment_template(target_template_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.assessment_templates t
    where t.id = target_template_id
      and (
        (t.company_id is null and public.is_platform_admin())
        or (t.company_id is not null and public.can_manage_company(t.company_id))
      )
  );
$$;

create or replace function public.can_read_assessment_response(target_response_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.assessment_responses ar
    left join public.company_members cm on cm.id = ar.company_member_id
    where ar.id = target_response_id
      and (
        public.is_platform_admin()
        or ar.respondent_user_id = auth.uid()
        or cm.user_id = auth.uid()
        or (public.can_manage_company(ar.company_id) and ar.is_anonymized)
      )
  );
$$;

create or replace function public.can_write_assessment_response(target_response_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.assessment_responses ar
    left join public.company_members cm on cm.id = ar.company_member_id
    where ar.id = target_response_id
      and (
        public.is_platform_admin()
        or ar.respondent_user_id = auth.uid()
        or cm.user_id = auth.uid()
        or public.can_manage_company(ar.company_id)
      )
  );
$$;

alter table public.profiles enable row level security;
alter table public.companies enable row level security;
alter table public.company_requests enable row level security;
alter table public.company_invoices enable row level security;
alter table public.departments enable row level security;
alter table public.company_members enable row level security;
alter table public.department_metric_snapshots enable row level security;
alter table public.interventions enable row level security;
alter table public.personas enable row level security;
alter table public.persona_departments enable row level security;
alter table public.persona_interventions enable row level security;
alter table public.library_resources enable row level security;
alter table public.assessment_templates enable row level security;
alter table public.assessment_items enable row level security;
alter table public.assessment_runs enable row level security;
alter table public.assessment_responses enable row level security;
alter table public.assessment_answers enable row level security;
alter table public.assessment_metric_results enable row level security;
alter table public.reports enable row level security;
alter table public.intervention_rankings enable row level security;
alter table public.action_plans enable row level security;
alter table public.action_plan_updates enable row level security;
alter table public.company_settings enable row level security;
alter table public.ai_prompt_templates enable row level security;
alter table public.sector_benchmarks enable row level security;
alter table public.employee_dashboard_snapshots enable row level security;

create policy profiles_select_self_or_platform on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_platform_admin());

create policy profiles_insert_self on public.profiles
  for insert to authenticated
  with check (id = auth.uid() and is_platform_admin = false);

create policy profiles_update_self on public.profiles
  for update to authenticated
  using (id = auth.uid() or public.is_platform_admin())
  with check (public.is_platform_admin() or (id = auth.uid() and is_platform_admin = false));

create policy companies_select_members on public.companies
  for select to authenticated
  using (public.is_platform_admin() or public.is_company_member(id));

create policy companies_insert_platform on public.companies
  for insert to authenticated
  with check (public.is_platform_admin());

create policy companies_update_platform on public.companies
  for update to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create policy companies_delete_platform on public.companies
  for delete to authenticated
  using (public.is_platform_admin());

create policy company_requests_insert_public on public.company_requests
  for insert to anon, authenticated
  with check (true);

create policy company_requests_platform_manage on public.company_requests
  for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create policy company_invoices_select_company_or_platform on public.company_invoices
  for select to authenticated
  using (public.is_platform_admin() or public.can_manage_company(company_id));

create policy company_invoices_platform_manage on public.company_invoices
  for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create policy departments_select_insights_roles on public.departments
  for select to authenticated
  using (public.can_view_company_insights(company_id));

create policy departments_manage_company_admins on public.departments
  for all to authenticated
  using (public.can_manage_company(company_id))
  with check (public.can_manage_company(company_id));

create policy company_members_select_directory_or_self on public.company_members
  for select to authenticated
  using (
    public.can_view_company_insights(company_id)
    or user_id = auth.uid()
  );

create policy company_members_manage_company_admins on public.company_members
  for all to authenticated
  using (public.can_manage_company(company_id))
  with check (public.can_manage_company(company_id));

create policy department_metric_snapshots_select_insights_roles on public.department_metric_snapshots
  for select to authenticated
  using (public.can_view_company_insights(company_id));

create policy department_metric_snapshots_manage_company_admins on public.department_metric_snapshots
  for all to authenticated
  using (public.can_manage_company(company_id))
  with check (public.can_manage_company(company_id));

create policy interventions_select_catalog on public.interventions
  for select to authenticated
  using (
    public.is_platform_admin()
    or (company_id is null and is_active)
    or (company_id is not null and public.can_view_company_insights(company_id))
  );

create policy interventions_manage_owner on public.interventions
  for all to authenticated
  using (
    (company_id is null and public.is_platform_admin())
    or (company_id is not null and public.can_manage_company(company_id))
  )
  with check (
    (company_id is null and public.is_platform_admin())
    or (company_id is not null and public.can_manage_company(company_id))
  );

create policy personas_select_insights_roles on public.personas
  for select to authenticated
  using (public.can_view_company_insights(company_id));

create policy personas_manage_company_admins on public.personas
  for all to authenticated
  using (public.can_manage_company(company_id))
  with check (public.can_manage_company(company_id));

create policy persona_departments_select_insights_roles on public.persona_departments
  for select to authenticated
  using (public.can_view_company_insights(company_id));

create policy persona_departments_manage_company_admins on public.persona_departments
  for all to authenticated
  using (public.can_manage_company(company_id))
  with check (public.can_manage_company(company_id));

create policy persona_interventions_select_insights_roles on public.persona_interventions
  for select to authenticated
  using (public.can_view_company_insights(company_id));

create policy persona_interventions_manage_company_admins on public.persona_interventions
  for all to authenticated
  using (public.can_manage_company(company_id))
  with check (public.can_manage_company(company_id));

create policy library_resources_select_published on public.library_resources
  for select to authenticated
  using (
    public.is_platform_admin()
    or (company_id is null and is_published)
    or (company_id is not null and is_published and public.is_company_member(company_id))
    or (company_id is not null and public.can_manage_company(company_id))
  );

create policy library_resources_manage_owner on public.library_resources
  for all to authenticated
  using (
    (company_id is null and public.is_platform_admin())
    or (company_id is not null and public.can_manage_company(company_id))
  )
  with check (
    (company_id is null and public.is_platform_admin())
    or (company_id is not null and public.can_manage_company(company_id))
  );

create policy assessment_templates_select_available on public.assessment_templates
  for select to authenticated
  using (
    public.is_platform_admin()
    or (company_id is null and is_active)
    or (company_id is not null and is_active and public.is_company_member(company_id))
    or (company_id is not null and public.can_manage_company(company_id))
  );

create policy assessment_templates_manage_owner on public.assessment_templates
  for all to authenticated
  using (
    (company_id is null and public.is_platform_admin())
    or (company_id is not null and public.can_manage_company(company_id))
  )
  with check (
    (company_id is null and public.is_platform_admin())
    or (company_id is not null and public.can_manage_company(company_id))
  );

create policy assessment_items_select_available on public.assessment_items
  for select to authenticated
  using (public.can_read_assessment_template(template_id));

create policy assessment_items_manage_template_owner on public.assessment_items
  for all to authenticated
  using (public.can_manage_assessment_template(template_id))
  with check (public.can_manage_assessment_template(template_id));

create policy assessment_runs_select_company_members on public.assessment_runs
  for select to authenticated
  using (public.is_company_member(company_id) or public.is_platform_admin());

create policy assessment_runs_manage_company_admins on public.assessment_runs
  for all to authenticated
  using (public.can_manage_company(company_id))
  with check (public.can_manage_company(company_id));

create policy assessment_responses_select_allowed on public.assessment_responses
  for select to authenticated
  using (public.can_read_assessment_response(id));

create policy assessment_responses_insert_own_or_admin on public.assessment_responses
  for insert to authenticated
  with check (
    public.is_platform_admin()
    or public.can_manage_company(company_id)
    or (
      public.is_company_member(company_id)
      and (
        respondent_user_id = auth.uid()
        or exists (
          select 1
          from public.company_members cm
          where cm.id = company_member_id
            and cm.user_id = auth.uid()
        )
      )
    )
  );

create policy assessment_responses_update_own_or_admin on public.assessment_responses
  for update to authenticated
  using (public.can_write_assessment_response(id))
  with check (public.can_write_assessment_response(id));

create policy assessment_responses_delete_admin on public.assessment_responses
  for delete to authenticated
  using (public.is_platform_admin() or public.can_manage_company(company_id));

create policy assessment_answers_select_allowed on public.assessment_answers
  for select to authenticated
  using (public.can_read_assessment_response(assessment_response_id));

create policy assessment_answers_insert_response_owner on public.assessment_answers
  for insert to authenticated
  with check (
    public.can_write_assessment_response(assessment_response_id)
    and exists (
      select 1
      from public.assessment_responses ar
      where ar.id = assessment_response_id
        and ar.company_id = company_id
    )
  );

create policy assessment_answers_update_response_owner on public.assessment_answers
  for update to authenticated
  using (public.can_write_assessment_response(assessment_response_id))
  with check (public.can_write_assessment_response(assessment_response_id));

create policy assessment_answers_delete_response_owner on public.assessment_answers
  for delete to authenticated
  using (public.can_write_assessment_response(assessment_response_id));

create policy assessment_metric_results_select_insights_roles on public.assessment_metric_results
  for select to authenticated
  using (public.can_view_company_insights(company_id));

create policy assessment_metric_results_manage_company_admins on public.assessment_metric_results
  for all to authenticated
  using (public.can_manage_company(company_id))
  with check (public.can_manage_company(company_id));

create policy reports_select_insights_roles on public.reports
  for select to authenticated
  using (public.can_view_company_insights(company_id));

create policy reports_manage_company_admins on public.reports
  for all to authenticated
  using (public.can_manage_company(company_id))
  with check (public.can_manage_company(company_id));

create policy intervention_rankings_select_insights_roles on public.intervention_rankings
  for select to authenticated
  using (public.can_view_company_insights(company_id));

create policy intervention_rankings_manage_company_admins on public.intervention_rankings
  for all to authenticated
  using (public.can_manage_company(company_id))
  with check (public.can_manage_company(company_id));

create policy action_plans_select_insights_roles on public.action_plans
  for select to authenticated
  using (public.can_view_company_insights(company_id));

create policy action_plans_manage_company_admins on public.action_plans
  for all to authenticated
  using (public.can_manage_company(company_id))
  with check (public.can_manage_company(company_id));

create policy action_plan_updates_select_insights_roles on public.action_plan_updates
  for select to authenticated
  using (public.can_view_company_insights(company_id));

create policy action_plan_updates_manage_company_admins on public.action_plan_updates
  for all to authenticated
  using (public.can_manage_company(company_id))
  with check (public.can_manage_company(company_id));

create policy company_settings_select_members on public.company_settings
  for select to authenticated
  using (public.is_platform_admin() or public.is_company_member(company_id));

create policy company_settings_manage_company_admins on public.company_settings
  for all to authenticated
  using (public.can_manage_company(company_id))
  with check (public.can_manage_company(company_id));

create policy ai_prompt_templates_select_available on public.ai_prompt_templates
  for select to authenticated
  using (
    is_active
    and (
      company_id is null
      or public.is_platform_admin()
      or public.is_company_member(company_id)
    )
  );

create policy ai_prompt_templates_manage_company_admins on public.ai_prompt_templates
  for all to authenticated
  using (
    public.is_platform_admin()
    or (company_id is not null and public.can_manage_company(company_id))
  )
  with check (
    public.is_platform_admin()
    or (company_id is not null and public.can_manage_company(company_id))
  );

create policy sector_benchmarks_select_authenticated on public.sector_benchmarks
  for select to authenticated
  using (true);

create policy sector_benchmarks_manage_platform on public.sector_benchmarks
  for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create policy employee_dashboard_snapshots_select_owner_or_insights_roles on public.employee_dashboard_snapshots
  for select to authenticated
  using (
    public.can_view_company_insights(company_id)
    or exists (
      select 1
      from public.company_members cm
      where cm.id = employee_dashboard_snapshots.company_member_id
        and cm.user_id = auth.uid()
    )
  );

create policy employee_dashboard_snapshots_manage_company_admins on public.employee_dashboard_snapshots
  for all to authenticated
  using (public.can_manage_company(company_id))
  with check (public.can_manage_company(company_id));
