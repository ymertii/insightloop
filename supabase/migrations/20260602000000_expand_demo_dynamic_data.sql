-- Expand demo data so previously static UI values can be served by Supabase.

alter table public.assessment_runs
  add column if not exists avg_completion_seconds integer,
  add column if not exists abandoned_count integer not null default 0,
  add column if not exists reminder_pending_count integer not null default 0;

alter table public.reports
  add column if not exists period_start date,
  add column if not exists period_end date,
  add column if not exists period_label text,
  add column if not exists sections jsonb not null default '[]'::jsonb;

create table if not exists public.assessment_assignments (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  assessment_run_id uuid not null references public.assessment_runs(id) on delete cascade,
  company_member_id uuid not null references public.company_members(id) on delete cascade,
  status text not null default 'assigned',
  due_at timestamptz,
  progress_percent integer not null default 0 check (progress_percent between 0 and 100),
  reminder_count integer not null default 0,
  last_reminded_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (assessment_run_id, company_member_id)
);

create table if not exists public.assessment_department_stats (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  assessment_run_id uuid not null references public.assessment_runs(id) on delete cascade,
  department_id uuid not null references public.departments(id) on delete cascade,
  invited_count integer not null default 0,
  response_count integer not null default 0,
  response_rate numeric(5,2),
  avg_completion_seconds integer,
  abandoned_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (assessment_run_id, department_id)
);

create table if not exists public.activity_events (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade,
  actor_name text,
  event_type text not null,
  title text not null,
  description text,
  severity text not null default 'info',
  occurred_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.company_risk_signals (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  signal_key text not null,
  title text not null,
  severity public.risk_level not null default 'unknown',
  score numeric(8,2),
  trend_label text,
  summary text,
  evidence jsonb not null default '{}'::jsonb,
  recommendations text[] not null default '{}'::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, signal_key)
);

create index if not exists assessment_assignments_member_idx
  on public.assessment_assignments (company_id, company_member_id, status, due_at);

create index if not exists assessment_department_stats_run_idx
  on public.assessment_department_stats (company_id, assessment_run_id, response_rate);

create index if not exists activity_events_occurred_idx
  on public.activity_events (occurred_at desc);

create index if not exists company_risk_signals_company_idx
  on public.company_risk_signals (company_id, severity, score);

drop trigger if exists set_assessment_assignments_updated_at on public.assessment_assignments;
create trigger set_assessment_assignments_updated_at
  before update on public.assessment_assignments
  for each row execute function public.set_updated_at();

drop trigger if exists set_assessment_department_stats_updated_at on public.assessment_department_stats;
create trigger set_assessment_department_stats_updated_at
  before update on public.assessment_department_stats
  for each row execute function public.set_updated_at();

drop trigger if exists set_activity_events_updated_at on public.activity_events;
create trigger set_activity_events_updated_at
  before update on public.activity_events
  for each row execute function public.set_updated_at();

drop trigger if exists set_company_risk_signals_updated_at on public.company_risk_signals;
create trigger set_company_risk_signals_updated_at
  before update on public.company_risk_signals
  for each row execute function public.set_updated_at();

alter table public.assessment_assignments enable row level security;
alter table public.assessment_department_stats enable row level security;
alter table public.activity_events enable row level security;
alter table public.company_risk_signals enable row level security;

grant select on
  public.assessment_assignments,
  public.assessment_department_stats,
  public.activity_events,
  public.company_risk_signals
to anon, authenticated;

drop policy if exists demo_public_companies_select on public.companies;
create policy demo_public_companies_select on public.companies
  for select to anon, authenticated
  using (true);

drop policy if exists demo_public_assessment_assignments_select on public.assessment_assignments;
create policy demo_public_assessment_assignments_select on public.assessment_assignments
  for select to anon, authenticated
  using (company_id = '10000000-0000-0000-0000-000000000001'::uuid);

drop policy if exists demo_public_assessment_department_stats_select on public.assessment_department_stats;
create policy demo_public_assessment_department_stats_select on public.assessment_department_stats
  for select to anon, authenticated
  using (company_id = '10000000-0000-0000-0000-000000000001'::uuid);

drop policy if exists demo_public_activity_events_select on public.activity_events;
create policy demo_public_activity_events_select on public.activity_events
  for select to anon, authenticated
  using (company_id is null or company_id in (select id from public.companies));

drop policy if exists demo_public_company_risk_signals_select on public.company_risk_signals;
create policy demo_public_company_risk_signals_select on public.company_risk_signals
  for select to anon, authenticated
  using (company_id in (select id from public.companies));

insert into public.companies (
  id, tenant_code, name, sector, website, employee_count, active_employee_count,
  status, risk_level, contact_name, contact_email, contact_phone,
  payment_status, subscription_plan, next_billing_date
) values
  ('10000000-0000-0000-0000-000000000005', 'TEN-MED42', 'MediCore Health', 'Healthcare', 'https://medicore.example', 2100, 1760, 'active', 'moderate', 'Nora Patel', 'nora@medicore.example', '+1 555 0505', 'paid', 'enterprise', '2026-07-01'),
  ('10000000-0000-0000-0000-000000000006', 'TEN-EDU18', 'EduNova Labs', 'Education', 'https://edunova.example', 690, 640, 'active', 'low', 'Owen Wright', 'owen@edunova.example', '+1 555 0606', 'paid', 'professional', '2026-07-15'),
  ('10000000-0000-0000-0000-000000000007', 'TEN-LOG77', 'LogiChain Global', 'Logistics', 'https://logichain.example', 5300, 4975, 'active', 'high', 'Priya Shah', 'priya@logichain.example', '+1 555 0707', 'overdue', 'enterprise', '2026-06-20'),
  ('10000000-0000-0000-0000-000000000008', 'TEN-GRN55', 'GreenWorks Manufacturing', 'Manufacturing', 'https://greenworks.example', 1450, 980, 'onboarding', 'unknown', 'Mateo Ruiz', 'mateo@greenworks.example', '+1 555 0808', 'trial', 'professional', '2026-07-30')
on conflict (id) do update set
  tenant_code = excluded.tenant_code,
  name = excluded.name,
  sector = excluded.sector,
  website = excluded.website,
  employee_count = excluded.employee_count,
  active_employee_count = excluded.active_employee_count,
  status = excluded.status,
  risk_level = excluded.risk_level,
  contact_name = excluded.contact_name,
  contact_email = excluded.contact_email,
  contact_phone = excluded.contact_phone,
  payment_status = excluded.payment_status,
  subscription_plan = excluded.subscription_plan,
  next_billing_date = excluded.next_billing_date;

insert into public.company_requests (
  id, company_name, contact_name, email, request_type, submitted_at, status, requested_employee_count
) values
  ('c0000000-0000-0000-0000-000000000004', 'BrightBank', 'Leah Kim', 'leah@brightbank.example', 'Demo Request', '2026-05-20 10:30:00+00', 'pending', 2400),
  ('c0000000-0000-0000-0000-000000000005', 'Northstar Foods', 'Ethan Brooks', 'ethan@northstar.example', 'Implementation Question', '2026-05-22 13:00:00+00', 'pending', 900),
  ('c0000000-0000-0000-0000-000000000006', 'CloudPeak', 'Mina Hart', 'mina@cloudpeak.example', 'Plan Upgrade', '2026-05-25 16:45:00+00', 'resolved', 320)
on conflict (id) do nothing;

insert into public.company_invoices (
  id, company_id, invoice_number, invoice_date, amount, currency, status
) values
  ('c1000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000005', 'INV-2026-004', '2026-05-01', 7200, 'USD', 'paid'),
  ('c1000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000007', 'INV-2026-005', '2026-05-01', 9100, 'USD', 'overdue'),
  ('c1000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000008', 'INV-2026-006', '2026-05-15', 1800, 'USD', 'trial')
on conflict (id) do nothing;

insert into public.assessment_templates (
  id, company_id, code, title, version, description, purpose, measures
) values
  ('70000000-0000-0000-0000-000000000004', null, 'RECOVERY', 'Recovery & Sleep Check-in', 'v1.1', 'Short pulse for sleep quality, recovery capacity, and after-hours load.', 'Capture recovery constraints that explain stress and burnout fluctuations.', 'Sleep quality, recovery time, after-hours activity, and cognitive load.')
on conflict (id) do update set
  title = excluded.title,
  version = excluded.version,
  description = excluded.description,
  purpose = excluded.purpose,
  measures = excluded.measures;

insert into public.assessment_items (
  id, template_id, item_code, item_type, question, dimension, options, scale_min,
  scale_max, scale_min_label, scale_max_label, display_order
) values
  ('71000000-0000-0000-0000-000000000021', '70000000-0000-0000-0000-000000000004', 'REC-01', 'scale', 'I was able to mentally disconnect after work yesterday.', 'Recovery', '[]'::jsonb, 1, 5, 'Not at all', 'Completely', 1),
  ('71000000-0000-0000-0000-000000000022', '70000000-0000-0000-0000-000000000004', 'REC-02', 'scale', 'My sleep helped me feel ready for today.', 'Sleep Quality', '[]'::jsonb, 1, 5, 'Strongly disagree', 'Strongly agree', 2),
  ('71000000-0000-0000-0000-000000000023', '70000000-0000-0000-0000-000000000004', 'REC-03', 'scale', 'After-hours messages interrupted my recovery time.', 'After-hours Load', '[]'::jsonb, 1, 5, 'Never', 'Very often', 3)
on conflict (id) do update set
  question = excluded.question,
  dimension = excluded.dimension,
  scale_min = excluded.scale_min,
  scale_max = excluded.scale_max,
  scale_min_label = excluded.scale_min_label,
  scale_max_label = excluded.scale_max_label,
  display_order = excluded.display_order;

update public.employee_dashboard_snapshots
set payload = payload || '{
  "dailySnapshot":{"mood":"Positive","stress":"Moderate","energy":"Restored","sleepHours":7.2}
}'::jsonb
where company_member_id = '30000000-0000-0000-0000-000000000105';

insert into public.assessment_runs (
  id, company_id, template_id, name, status, target_type, target_department_id,
  frequency, starts_at, ends_at, completion_goal, invited_count, response_count,
  response_rate, finding, metrics, insights, avg_completion_seconds, abandoned_count, reminder_pending_count
) values
  ('80000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000004', 'Weekly Recovery & Sleep Check-in', 'active', 'department', '20000000-0000-0000-0000-000000000008', 'weekly', '2026-05-29 09:00:00+00', '2026-06-05 17:00:00+00', 85, 28, 19, 67.86, 'Recovery data shows after-hours interruptions are concentrated in DevOps.', '{"sleep_quality":{"value":62,"trend":"-8%"},"recovery":{"value":58,"trend":"-11%"}}'::jsonb, array['After-hours notifications are the most visible recovery blocker.', 'Employees with protected focus windows report higher next-day readiness.'], 405, 2, 9),
  ('80000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000003', 'Operations JD-R Review', 'completed', 'department', '20000000-0000-0000-0000-000000000005', 'one_time', '2026-02-01 09:00:00+00', '2026-02-14 17:00:00+00', 80, 250, 206, 82.40, 'Operations shows depleted resources and fairness pressure across shift handovers.', '{"workload":{"value":79,"trend":"+9%"},"resources":{"value":54,"trend":"-7%"},"fairness":{"value":51,"trend":"-12%"}}'::jsonb, array['Shift handover ambiguity is strongly tied to fairness concerns.', 'Resource gaps are most visible in weekend coverage.'], 575, 7, 44),
  ('80000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000002', 'Customer Services Stress Pulse', 'completed', 'department', '20000000-0000-0000-0000-000000000011', 'one_time', '2026-03-01 09:00:00+00', '2026-03-12 17:00:00+00', 80, 180, 151, 83.89, 'Customer Services stress remains elevated around escalation queues.', '{"stress":{"value":76,"trend":"+11%"},"support":{"value":61,"trend":"-4%"}}'::jsonb, array['Escalation queues predict stress spikes better than ticket volume alone.', 'Peer support is a partial buffer but not enough to offset demand.'], 498, 5, 29)
on conflict (id) do update set
  status = excluded.status,
  response_count = excluded.response_count,
  response_rate = excluded.response_rate,
  finding = excluded.finding,
  metrics = excluded.metrics,
  insights = excluded.insights,
  avg_completion_seconds = excluded.avg_completion_seconds,
  abandoned_count = excluded.abandoned_count,
  reminder_pending_count = excluded.reminder_pending_count;

update public.assessment_runs
set avg_completion_seconds = 522,
    abandoned_count = 263,
    reminder_pending_count = greatest(invited_count - response_count, 0),
    finding = 'Early data suggests a significant variance in workload perception between DevOps, Sales, and Operations. Final insights will be generated upon completion.'
where id = '80000000-0000-0000-0000-000000000001';

insert into public.assessment_assignments (
  id, company_id, assessment_run_id, company_member_id, status, due_at,
  progress_percent, reminder_count, last_reminded_at, metadata
) values
  ('f0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '80000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000105', 'in_progress', '2026-06-04 17:00:00+00', 45, 1, '2026-06-01 09:00:00+00', '{"currentQuestion":3,"estimatedMinutes":6}'::jsonb),
  ('f0000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', '80000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000101', 'assigned', '2026-06-05 17:00:00+00', 0, 0, null, '{"estimatedMinutes":3}'::jsonb)
on conflict (assessment_run_id, company_member_id) do update set
  status = excluded.status,
  due_at = excluded.due_at,
  progress_percent = excluded.progress_percent,
  reminder_count = excluded.reminder_count,
  last_reminded_at = excluded.last_reminded_at,
  metadata = excluded.metadata;

insert into public.assessment_department_stats (
  id, company_id, assessment_run_id, department_id, invited_count, response_count,
  response_rate, avg_completion_seconds, abandoned_count
) values
  ('f1000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '80000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000008', 28, 24, 85.71, 610, 1),
  ('f1000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', '80000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000004', 120, 91, 75.83, 505, 8),
  ('f1000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', '80000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000005', 250, 171, 68.40, 544, 16),
  ('f1000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', '80000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000011', 180, 126, 70.00, 530, 11),
  ('f1000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', '80000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000012', 35, 30, 85.71, 552, 2),
  ('f1000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000001', '80000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003', 38, 31, 81.58, 490, 1)
on conflict (assessment_run_id, department_id) do update set
  invited_count = excluded.invited_count,
  response_count = excluded.response_count,
  response_rate = excluded.response_rate,
  avg_completion_seconds = excluded.avg_completion_seconds,
  abandoned_count = excluded.abandoned_count;

insert into public.activity_events (
  id, company_id, actor_name, event_type, title, description, severity, occurred_at, metadata
) values
  ('f2000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'AI Narrative Engine', 'report_generated', 'DevOps Diagnostic generated', 'Department PDF report was generated and published.', 'info', '2026-06-01 18:20:00+00', '{"reportId":"90000000-0000-0000-0000-000000000002"}'::jsonb),
  ('f2000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Alice Smith', 'inventory_launched', 'Q2 Wellbeing Assessment launched', '18,400 employees invited.', 'info', '2026-05-15 09:00:00+00', '{}'::jsonb),
  ('f2000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000007', 'Priya Shah', 'billing_alert', 'Invoice overdue for LogiChain Global', 'Enterprise invoice moved to overdue status.', 'warning', '2026-05-31 12:10:00+00', '{}'::jsonb),
  ('f2000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000005', 'Nora Patel', 'tenant_onboarded', 'MediCore Health completed onboarding', 'Healthcare tenant activated executive dashboards.', 'success', '2026-05-28 14:25:00+00', '{}'::jsonb),
  ('f2000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', 'Tom Baker', 'action_plan_updated', 'DevOps flexible work pilot approved', 'Manager accepted the recommended intervention plan.', 'info', '2026-05-25 09:00:00+00', '{}'::jsonb),
  ('f2000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000008', 'Mateo Ruiz', 'company_request', 'GreenWorks trial workspace created', 'Manufacturing pilot tenant entered onboarding.', 'info', '2026-05-24 11:45:00+00', '{}'::jsonb)
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  severity = excluded.severity,
  occurred_at = excluded.occurred_at,
  metadata = excluded.metadata;

insert into public.company_risk_signals (
  id, company_id, signal_key, title, severity, score, trend_label,
  summary, evidence, recommendations
) values
  ('f3000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'burnout-elevated', 'Burnout Risk (MBI)', 'critical', 3.42, '+18%', 'Critical departments show sustained burnout pressure across DevOps, Sales, and Operations.', '{"departments":["DevOps","Sales","Operations"]}'::jsonb, array['Prioritize workload redesign', 'Run manager calibration sessions']),
  ('f3000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'pss-moderate', 'Perceived Stress (PSS)', 'high', 3.18, '+7%', 'Perceived stress is above internal target and close to the technology benchmark.', '{"benchmark":3.6,"current":3.18}'::jsonb, array['Increase recovery windows', 'Monitor weekly stress trend']),
  ('f3000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'resources-stable', 'Engagement/Resources (JD-R)', 'moderate', 3.04, '-2%', 'Resource availability is stable but not strong enough to offset demand in critical teams.', '{"resourceIndex":3.04}'::jsonb, array['Shift resources toward critical departments']),
  ('f3000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000005', 'clinical-burnout', 'Care Team Burnout', 'moderate', 2.91, '+4%', 'Care teams show moderate load but high peer support.', '{"sector":"Healthcare"}'::jsonb, array['Protect post-shift recovery time']),
  ('f3000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000007', 'logistics-demand', 'Route Planning Demand', 'high', 3.61, '+13%', 'Logistics planning teams show elevated demand and low schedule control.', '{"sector":"Logistics"}'::jsonb, array['Review route planning staffing', 'Add dispatcher recovery buffers']),
  ('f3000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000006', 'faculty-support', 'Faculty Support Strength', 'low', 1.82, '-5%', 'EduNova has low burnout risk and strong support indicators.', '{"sector":"Education"}'::jsonb, array['Maintain monthly pulse cadence'])
on conflict (company_id, signal_key) do update set
  title = excluded.title,
  severity = excluded.severity,
  score = excluded.score,
  trend_label = excluded.trend_label,
  summary = excluded.summary,
  evidence = excluded.evidence,
  recommendations = excluded.recommendations;

insert into public.intervention_rankings (
  id, company_id, department_id, assessment_run_id, persona_id, intervention_id,
  rank, closeness_coefficient, weights, rationale
) values
  ('d0000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000004', '80000000-0000-0000-0000-000000000001', null, '40000000-0000-0000-0000-000000000008', 1, 0.776, '{"cost":22,"speed":12,"impact":47,"readiness":19}'::jsonb, 'Sales shows quota pressure and fairness concerns, making prioritization and reward clarity the highest-impact intervention.'),
  ('d0000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000005', '80000000-0000-0000-0000-000000000005', null, '40000000-0000-0000-0000-000000000010', 1, 0.762, '{"cost":22,"speed":12,"impact":47,"readiness":19}'::jsonb, 'Operations needs resource balancing and handover clarity to reduce fairness strain.'),
  ('d0000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000011', '80000000-0000-0000-0000-000000000006', null, '40000000-0000-0000-0000-000000000014', 1, 0.731, '{"cost":22,"speed":12,"impact":47,"readiness":19}'::jsonb, 'Customer Services needs escalation queue redesign to lower stress while protecting service quality.')
on conflict (id) do update set
  rank = excluded.rank,
  closeness_coefficient = excluded.closeness_coefficient,
  weights = excluded.weights,
  rationale = excluded.rationale;

insert into public.action_plans (
  id, company_id, department_id, intervention_id, title, owner_member_id, owner_name,
  status, due_date, kpi, details, impact_label, effort_label, cost_label,
  timeline_label, review_date, progress_percent, last_updated_at
) values
  ('a0000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004', null, null, 'TechFlow Recovery Sprint', null, 'David Lee', 'in_progress', '2026-06-20', 'Recovery score +12%', 'Two-week recovery sprint to reduce after-hours load in a critical tenant.', 'High', 'Medium', '$$', '2 weeks', '2026-07-05', 38, '2026-06-01 08:00:00+00'),
  ('a0000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000008', 'Sales Quota Fairness Review', '30000000-0000-0000-0000-000000000004', 'Marcus Johnson', 'approved', '2026-06-18', 'Fairness Score +0.4', 'Review territory allocation, quota clarity, and lead distribution fairness.', 'High', 'Medium', '$$', '4 weeks', '2026-07-18', 0, '2026-05-31 10:00:00+00'),
  ('a0000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000011', '40000000-0000-0000-0000-000000000014', 'Escalation Queue Redesign', '30000000-0000-0000-0000-000000000011', 'Michelle Davis', 'in_progress', '2026-06-28', 'Stress Score -0.3', 'Redesign customer escalation routing and add protected post-escalation decompression windows.', 'High', 'High', '$$', '5 weeks', '2026-07-28', 22, '2026-06-01 11:00:00+00')
on conflict (id) do update set
  status = excluded.status,
  due_date = excluded.due_date,
  kpi = excluded.kpi,
  details = excluded.details,
  progress_percent = excluded.progress_percent,
  last_updated_at = excluded.last_updated_at;

update public.reports
set period_start = '2026-05-01',
    period_end = '2026-05-31',
    period_label = 'May 2026',
    sections = '[{"key":"summary","title":"General Situation Summary","order":1},{"key":"kpis","title":"Key Performance Indicators","order":2},{"key":"alerts","title":"Critical Early Warning Signals","order":3},{"key":"trend","title":"AI Trend Analysis","order":4},{"key":"intervention_plan","title":"Recommended Intervention Plan","order":5}]'::jsonb,
    content = '{
      "summary":"AI analysis indicates a recurring pattern of high tempo combined with limited recovery time, increasing long-term burnout risk in DevOps.",
      "participationRate":92,
      "participationDelta":"+5%",
      "kpiDeltas":{"stress":"+1.2","burnout":"+22%","workload":"+18","morale":"-0.1","participation":"+5%"},
      "trendCaption":"Peaks on May 18 and May 24 correlate with production deadlines and campaign launches.",
      "emotionalThemes":["Fatigue","Time pressure","Loss of control"],
      "warnings":[
        {"title":"High stress for 3 consecutive weeks","body":"Four employees show sustained high-stress levels, a key predictor of imminent burnout.","risk":"Critical"},
        {"title":"Sleep disturbance pattern","body":"Late-night activity increased and negative morning sentiment rose during the last pulse.","risk":"High"},
        {"title":"Workload imbalance","body":"DevOps reports higher workload than peer teams with lower recovery buffers.","risk":"Moderate"}
      ],
      "interventionPlan":{
        "shortTerm":["Manager 1:1s with high-risk individuals.","Immediate project reprioritization meeting.","Mandatory no-meeting block for deep work."],
        "mediumTerm":["Team workshop on workload management.","Review and clarify roles and responsibilities.","Implement weekly feedback check-ins."],
        "longTerm":["Review campaign and process planning.","Resource allocation review for Q1 2026.","Leadership coaching for the manager."]
      },
      "managerFeedback":["Deficiencies noted in feedback frequency, planning clarity, and role prioritization.","Lack of planning","Cannot keep up","Communication breakdown"],
      "generalAssessment":"The department is currently in a high-risk state driven by excessive workload and planning deficiencies. The proposed intervention plan is expected to reduce overall burnout risk by 30-40% within 8 weeks if implemented effectively."
    }'::jsonb::text
where id = '90000000-0000-0000-0000-000000000002';
