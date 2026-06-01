-- InsightLoop seed data based on the current React mock data.
-- Safe to run repeatedly in local Supabase; rows use deterministic UUIDs.

insert into public.companies (
  id, tenant_code, name, sector, website, employee_count, active_employee_count,
  status, risk_level, contact_name, contact_email, contact_phone,
  payment_status, subscription_plan, next_billing_date
) values
  ('10000000-0000-0000-0000-000000000001', 'TEN-8B9X1', 'HappiWork', 'Technology', null, 1250, 450, 'active', 'high', 'Alice Smith', 'alice@happiwork.com', '+1 555 0101', 'paid', 'enterprise', '2026-10-15'),
  ('10000000-0000-0000-0000-000000000002', 'TEN-K9P0A', 'Global Retail', 'FMCG', null, 8400, 8100, 'active', 'moderate', 'Bob Johnson', 'bob@globalretail.com', '+1 555 0202', 'paid', 'enterprise', '2026-06-01'),
  ('10000000-0000-0000-0000-000000000003', 'TEN-2M4N7', 'FinServe', 'Finance', null, 3200, 120, 'onboarding', 'unknown', 'Carol White', 'carol@finserve.com', '+1 555 0303', 'trial', 'professional', '2026-06-15'),
  ('10000000-0000-0000-0000-000000000004', 'TEN-F7L1P', 'TechFlow Inc', 'Technology', 'https://techflow.io', 450, 450, 'active', 'critical', 'David Lee', 'david@techflow.io', '+1 555 0404', 'overdue', 'starter', '2026-05-01')
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

insert into public.company_settings (company_id, ahp_weights)
values
  ('10000000-0000-0000-0000-000000000001', '{"cost":22,"speed":12,"impact":47,"readiness":19}'::jsonb)
on conflict (company_id) do update set
  ahp_weights = excluded.ahp_weights;

insert into public.ai_prompt_templates (
  id, company_id, title, description, content, variables
) values
  (
    'department-diagnostic',
    '10000000-0000-0000-0000-000000000001',
    'Department Diagnostic Prompt',
    'Used for department detail reports',
    'You are an expert organizational psychologist analyzing a department''s wellbeing data.
Do not use clinical or psychiatric labels. Focus on organizational and behavioral interpretation.

Analyze the following data for {{department_name}}:
Burnout Score: {{burnout_score}} (Threshold: 3.0)
Stress Score: {{stress_score}}
Weakest Resource Dimension: {{weakest_resource}}

The TOPSIS engine has recommended: {{top_intervention}}

Write a concise, 3-paragraph diagnostic narrative explaining the relationship between the weakest resource dimension and the current burnout score, and justify why the recommended intervention is appropriate based on JD-R theory.',
    array['department_name', 'burnout_score', 'stress_score', 'weakest_resource', 'top_intervention']
  ),
  (
    'company-summary',
    '10000000-0000-0000-0000-000000000001',
    'Company Executive Summary',
    'Used for high-level tenant reports',
    'Summarize organization-wide wellbeing trends for {{company_name}} during {{period}}. Highlight critical departments, systemic risk drivers, and recommended next actions.',
    array['company_name', 'period', 'critical_departments', 'top_risks']
  ),
  (
    'employee-insight',
    '10000000-0000-0000-0000-000000000001',
    'Employee Personal Insight',
    'Used for individual employee dashboards',
    'Write a supportive personal wellbeing insight for {{employee_name}} using strengths, friction points, and recommended resources. Avoid clinical diagnosis.',
    array['employee_name', 'strengths', 'friction_points', 'recommended_resources']
  )
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  content = excluded.content,
  variables = excluded.variables;

insert into public.sector_benchmarks (sector, burnout, stress, resources)
values
  ('Technology', 3.4, 3.6, 2.8),
  ('Banking', 3.1, 3.8, 3.2),
  ('FMCG', 2.8, 3.0, 3.5),
  ('Consulting', 3.5, 3.9, 2.9)
on conflict (sector) do update set
  burnout = excluded.burnout,
  stress = excluded.stress,
  resources = excluded.resources;

insert into public.employee_dashboard_snapshots (
  id, company_id, company_member_id, payload
) values (
  'e2000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  '30000000-0000-0000-0000-000000000105',
  '{
    "strengths":[
      {"subject":"Resilience","A":85,"fullMark":100},
      {"subject":"Peer Support","A":75,"fullMark":100},
      {"subject":"Autonomy","A":65,"fullMark":100},
      {"subject":"Emot. Control","A":80,"fullMark":100},
      {"subject":"Adaptability","A":88,"fullMark":100},
      {"subject":"Focus","A":90,"fullMark":100},
      {"subject":"Boundaries","A":60,"fullMark":100},
      {"subject":"Empathy","A":95,"fullMark":100},
      {"subject":"Creativity","A":78,"fullMark":100}
    ],
    "miniTrend":[
      {"month":"Jan","value":2.8},
      {"month":"Feb","value":3.1},
      {"month":"Mar","value":3.0},
      {"month":"Apr","value":2.9},
      {"month":"May","value":2.7}
    ],
    "recentTests":[
      {"id":"recent-1","name":"Q1 Wellbeing Pulse","date":"Mar 15"},
      {"id":"recent-2","name":"Annual Burnout Inventory","date":"Dec 05"}
    ],
    "personalTrend":{
      "3M":[
        {"month":"Feb","stress":3.1,"recovery":3.0,"engagement":3.5},
        {"month":"Mar","stress":3.0,"recovery":3.2,"engagement":3.7},
        {"month":"Apr","stress":2.9,"recovery":3.4,"engagement":3.9},
        {"month":"May","stress":2.7,"recovery":3.7,"engagement":4.0}
      ],
      "6M":[
        {"month":"Dec","stress":2.4,"recovery":3.8,"engagement":4.1},
        {"month":"Jan","stress":2.8,"recovery":3.5,"engagement":3.8},
        {"month":"Feb","stress":3.1,"recovery":3.0,"engagement":3.5},
        {"month":"Mar","stress":3.0,"recovery":3.2,"engagement":3.7},
        {"month":"Apr","stress":2.9,"recovery":3.4,"engagement":3.9},
        {"month":"May","stress":2.7,"recovery":3.7,"engagement":4.0}
      ],
      "1Y":[
        {"month":"Jun","stress":2.0,"recovery":4.5,"engagement":4.2},
        {"month":"Jul","stress":2.2,"recovery":4.2,"engagement":4.1},
        {"month":"Aug","stress":2.3,"recovery":4.1,"engagement":4.0},
        {"month":"Sep","stress":2.5,"recovery":4.0,"engagement":3.9},
        {"month":"Oct","stress":2.1,"recovery":4.2,"engagement":4.0},
        {"month":"Nov","stress":2.2,"recovery":4.1,"engagement":4.2},
        {"month":"Dec","stress":2.4,"recovery":3.8,"engagement":4.1},
        {"month":"Jan","stress":2.8,"recovery":3.5,"engagement":3.8},
        {"month":"Feb","stress":3.1,"recovery":3.0,"engagement":3.5},
        {"month":"Mar","stress":3.0,"recovery":3.2,"engagement":3.7},
        {"month":"Apr","stress":2.9,"recovery":3.4,"engagement":3.9},
        {"month":"May","stress":2.7,"recovery":3.7,"engagement":4.0}
      ]
    },
    "pastTests":[
      {"id":"pt-1","name":"Q1 Wellbeing Pulse","date":"2026-03-15","score":"Balanced","status":"Completed","details":"Your wellbeing index is strong. Burnout risk is low. You showed good emotional regulation and high peer support.","chartData":[{"subject":"Emotional","A":80},{"subject":"Peer Support","A":85},{"subject":"Workload","A":60},{"subject":"Autonomy","A":75},{"subject":"Fairness","A":82}]},
      {"id":"pt-2","name":"Annual Maslach Burnout Inventory","date":"2025-12-05","score":"Low Risk","status":"Completed","details":"Evaluated exhaustion, cynicism, and professional efficacy. Results indicate healthy engagement with work and minimal signs of exhaustion.","chartData":[{"subject":"Exhaustion","A":20},{"subject":"Cynicism","A":15},{"subject":"Efficacy","A":85},{"subject":"Engagement","A":90}]}
    ]
  }'::jsonb
)
on conflict (company_member_id) do update set
  payload = excluded.payload;

insert into public.company_requests (
  id, company_name, contact_name, email, request_type, submitted_at, status, requested_employee_count
) values
  ('c0000000-0000-0000-0000-000000000001', 'Nexus Tech', 'Eleanor Shellstrop', 'el@nexus.tech', 'Demo Request', '2026-05-09 09:00:00+00', 'pending', 200),
  ('c0000000-0000-0000-0000-000000000002', 'Acme Corp', 'Wile E. Coyote', 'wile@acme.com', 'Plan Upgrade', '2026-05-10 09:00:00+00', 'pending', 15),
  ('c0000000-0000-0000-0000-000000000003', 'Globex', 'Hank Scorpio', 'hank@globex.com', 'Support', '2026-05-10 11:00:00+00', 'resolved', 1500)
on conflict (id) do nothing;

insert into public.company_invoices (
  id, company_id, invoice_number, invoice_date, amount, currency, status
) values
  ('c1000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'INV-2026-001', '2026-05-01', 4500, 'USD', 'paid'),
  ('c1000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'INV-2026-002', '2026-04-01', 4500, 'USD', 'paid'),
  ('c1000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'INV-2026-003', '2026-03-01', 4500, 'USD', 'paid')
on conflict (id) do nothing;

insert into public.departments (
  id, company_id, code, name, manager_name, employee_count, burnout_score,
  stress_score, resource_index, fairness_score, risk_level, trend
) values
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'D1', 'Management', 'Sarah Jenkins', 12, 2.8, 3.1, 3.5, 3.8, 'high', 'up'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'D2', 'Finance', 'David Chen', 45, 2.9, 2.8, 3.2, 3.5, 'high', 'stable'),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'D3', 'Marketing', 'Elena Rodriguez', 38, 3.1, 3.2, 2.9, 3.1, 'high', 'up'),
  ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', 'D4', 'Sales', 'Marcus Johnson', 120, 3.4, 3.8, 2.7, 2.8, 'critical', 'up'),
  ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', 'D5', 'Operations', 'Lisa Wong', 250, 3.2, 3.5, 2.6, 2.5, 'critical', 'stable'),
  ('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000001', 'D6', 'IT', 'James Wilson', 65, 3.0, 3.1, 3.0, 3.2, 'high', 'down'),
  ('20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000001', 'D7', 'Product', 'Anna Kowalski', 42, 3.1, 3.3, 3.1, 3.4, 'high', 'stable'),
  ('20000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000001', 'D8', 'DevOps', 'Tom Baker', 28, 3.8, 4.1, 2.2, 2.9, 'critical', 'up'),
  ('20000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000001', 'D9', 'HR', 'Rachel Green', 18, 2.9, 3.0, 3.4, 3.6, 'high', 'stable'),
  ('20000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000001', 'D10', 'Legal', 'Robert Taylor', 15, 2.7, 2.9, 3.6, 3.9, 'moderate', 'down'),
  ('20000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000001', 'D11', 'Customer Services', 'Michelle Davis', 180, 3.5, 3.7, 2.4, 2.6, 'critical', 'up'),
  ('20000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000001', 'D12', 'Business Development', 'Chris Evans', 35, 3.3, 3.6, 2.8, 2.2, 'critical', 'stable')
on conflict (id) do update set
  manager_name = excluded.manager_name,
  employee_count = excluded.employee_count,
  burnout_score = excluded.burnout_score,
  stress_score = excluded.stress_score,
  resource_index = excluded.resource_index,
  fairness_score = excluded.fairness_score,
  risk_level = excluded.risk_level,
  trend = excluded.trend;

insert into public.company_members (
  id, company_id, department_id, full_name, email, phone, job_title, role, status, joined_at
) values
  ('30000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000001', null, 'Alice Smith', 'alice@happiwork.com', '+1 555 0101', 'People Analytics Lead', 'company_admin', 'active', '2025-01-15 09:00:00+00'),
  ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Sarah Jenkins', 'sarah.jenkins@happiwork.com', null, 'Management Lead', 'manager', 'active', '2025-02-01 09:00:00+00'),
  ('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 'David Chen', 'david.chen@happiwork.com', null, 'Finance Manager', 'manager', 'active', '2025-02-01 09:00:00+00'),
  ('30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003', 'Elena Rodriguez', 'elena.rodriguez@happiwork.com', null, 'Marketing Manager', 'manager', 'active', '2025-02-01 09:00:00+00'),
  ('30000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000004', 'Marcus Johnson', 'marcus.johnson@happiwork.com', null, 'Sales Manager', 'manager', 'active', '2025-02-01 09:00:00+00'),
  ('30000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000005', 'Lisa Wong', 'lisa.wong@happiwork.com', null, 'Operations Manager', 'manager', 'active', '2025-02-01 09:00:00+00'),
  ('30000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000006', 'James Wilson', 'james.wilson@happiwork.com', null, 'IT Manager', 'manager', 'active', '2025-02-01 09:00:00+00'),
  ('30000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000007', 'Anna Kowalski', 'anna.kowalski@happiwork.com', null, 'Product Manager', 'manager', 'active', '2025-02-01 09:00:00+00'),
  ('30000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000008', 'Tom Baker', 'tom.baker@happiwork.com', null, 'DevOps Manager', 'manager', 'active', '2025-02-01 09:00:00+00'),
  ('30000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000009', 'Rachel Green', 'rachel.green@happiwork.com', null, 'HR Manager', 'hr_manager', 'active', '2025-02-01 09:00:00+00'),
  ('30000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000010', 'Robert Taylor', 'robert.taylor@happiwork.com', null, 'Legal Manager', 'manager', 'active', '2025-02-01 09:00:00+00'),
  ('30000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000011', 'Michelle Davis', 'michelle.davis@happiwork.com', null, 'Customer Services Manager', 'manager', 'active', '2025-02-01 09:00:00+00'),
  ('30000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000012', 'Chris Evans', 'chris.evans@happiwork.com', null, 'Business Development Manager', 'manager', 'active', '2025-02-01 09:00:00+00'),
  ('30000000-0000-0000-0000-000000000101', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000008', 'Alice Smith', 'alice@example.com', '+1 555-0100', 'DevOps Engineer', 'employee', 'active', '2025-04-01 09:00:00+00'),
  ('30000000-0000-0000-0000-000000000102', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000008', 'Bob Jones', 'bob@example.com', '+1 555-0101', 'Security Analyst', 'employee', 'active', '2025-04-01 09:00:00+00'),
  ('30000000-0000-0000-0000-000000000103', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000008', 'Charlie Davis', 'charlie@example.com', '+1 555-0102', 'SRE', 'employee', 'active', '2025-04-01 09:00:00+00'),
  ('30000000-0000-0000-0000-000000000104', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000008', 'Dana Lee', 'dana@example.com', '+1 555-0103', 'Backend Developer', 'employee', 'active', '2025-04-01 09:00:00+00'),
  ('30000000-0000-0000-0000-000000000105', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000006', 'Jane Miller', 'jane@example.com', null, 'IT Analyst', 'employee', 'active', '2025-04-01 09:00:00+00')
on conflict (id) do update set
  department_id = excluded.department_id,
  full_name = excluded.full_name,
  email = excluded.email,
  phone = excluded.phone,
  job_title = excluded.job_title,
  role = excluded.role,
  status = excluded.status;

update public.departments set manager_member_id = '30000000-0000-0000-0000-000000000001' where id = '20000000-0000-0000-0000-000000000001';
update public.departments set manager_member_id = '30000000-0000-0000-0000-000000000002' where id = '20000000-0000-0000-0000-000000000002';
update public.departments set manager_member_id = '30000000-0000-0000-0000-000000000003' where id = '20000000-0000-0000-0000-000000000003';
update public.departments set manager_member_id = '30000000-0000-0000-0000-000000000004' where id = '20000000-0000-0000-0000-000000000004';
update public.departments set manager_member_id = '30000000-0000-0000-0000-000000000005' where id = '20000000-0000-0000-0000-000000000005';
update public.departments set manager_member_id = '30000000-0000-0000-0000-000000000006' where id = '20000000-0000-0000-0000-000000000006';
update public.departments set manager_member_id = '30000000-0000-0000-0000-000000000007' where id = '20000000-0000-0000-0000-000000000007';
update public.departments set manager_member_id = '30000000-0000-0000-0000-000000000008' where id = '20000000-0000-0000-0000-000000000008';
update public.departments set manager_member_id = '30000000-0000-0000-0000-000000000009' where id = '20000000-0000-0000-0000-000000000009';
update public.departments set manager_member_id = '30000000-0000-0000-0000-000000000010' where id = '20000000-0000-0000-0000-000000000010';
update public.departments set manager_member_id = '30000000-0000-0000-0000-000000000011' where id = '20000000-0000-0000-0000-000000000011';
update public.departments set manager_member_id = '30000000-0000-0000-0000-000000000012' where id = '20000000-0000-0000-0000-000000000012';

insert into public.interventions (
  id, company_id, code, title, category, jd_dimension, expected_impact, estimated_cost, speed, readiness_need, description
) values
  ('40000000-0000-0000-0000-000000000001', null, 'A1', 'Workload Redesign and Redistribution', 'Structural', 'Workload', 0.90, 0.60, 0.30, 0.80, 'Systematic review and reallocation of tasks to balance demands.'),
  ('40000000-0000-0000-0000-000000000002', null, 'A2', 'Participatory Intervention Process', 'Process', 'Control', 0.80, 0.40, 0.40, 0.70, 'Involving employees in identifying stressors and designing solutions.'),
  ('40000000-0000-0000-0000-000000000003', null, 'A3', 'Managerial Coaching and Leadership Training', 'Training', 'Support', 0.85, 0.70, 0.50, 0.60, 'Equipping leaders with skills to support team wellbeing and recognize burnout.'),
  ('40000000-0000-0000-0000-000000000004', null, 'A4', 'Flexible Work Policies and Schedule Control', 'Policy', 'Control', 0.75, 0.20, 0.80, 0.50, 'Allowing employees autonomy over when and where they work.'),
  ('40000000-0000-0000-0000-000000000005', null, 'A5', 'Team Restructuring and Role Redesign', 'Structural', 'Workload', 0.80, 0.50, 0.30, 0.80, 'Changing team compositions and clarifying role boundaries.'),
  ('40000000-0000-0000-0000-000000000006', null, 'A6', 'Conflict Resolution and Mediation Programs', 'Process', 'Support', 0.60, 0.40, 0.60, 0.60, 'Structured programs to address interpersonal friction.'),
  ('40000000-0000-0000-0000-000000000007', null, 'A7', 'Peer Support Networks and Mentoring', 'Support', 'Support', 0.70, 0.20, 0.70, 0.40, 'Creating formal and informal networks for peer support.'),
  ('40000000-0000-0000-0000-000000000008', null, 'A8', 'Recognition and Reward System Redesign', 'Policy', 'Fairness', 0.75, 0.60, 0.50, 0.50, 'Aligning rewards with effort and ensuring equitable distribution.'),
  ('40000000-0000-0000-0000-000000000009', null, 'A9', 'Autonomy and Control Enhancement', 'Process', 'Control', 0.80, 0.10, 0.60, 0.70, 'Delegating decision-making authority to lower levels.'),
  ('40000000-0000-0000-0000-000000000010', null, 'A10', 'Internal Communication Improvement', 'Process', 'Fairness', 0.65, 0.20, 0.70, 0.40, 'Enhancing transparency and frequency of organizational updates.'),
  ('40000000-0000-0000-0000-000000000011', null, 'A11', 'Career Development Pathways', 'Policy', 'Support', 0.70, 0.50, 0.40, 0.60, 'Creating clear progression routes and skill development opportunities.'),
  ('40000000-0000-0000-0000-000000000012', null, 'A12', 'Role Clarity and Job Description Initiative', 'Structural', 'Workload', 0.75, 0.20, 0.60, 0.50, 'Updating and clarifying expectations for all roles.'),
  ('40000000-0000-0000-0000-000000000013', null, 'A13', 'Mindfulness and Stress Reduction Workshops', 'Individual', 'Support', 0.40, 0.30, 0.90, 0.20, 'Providing tools for individual stress management.'),
  ('40000000-0000-0000-0000-000000000014', null, 'A14', 'Digital Wellness Platforms', 'Individual', 'Support', 0.50, 0.40, 0.90, 0.20, 'App-based resources for mental health and wellbeing.'),
  ('40000000-0000-0000-0000-000000000015', null, 'A15', 'Job Crafting Intervention Training', 'Training', 'Control', 0.65, 0.40, 0.60, 0.50, 'Teaching employees to proactively shape their roles.'),
  ('40000000-0000-0000-0000-000000000016', null, 'A16', 'Process Redesign for High-Demand Roles', 'Structural', 'Workload', 0.85, 0.70, 0.20, 0.80, 'Lean or agile redesign of specific high-stress workflows.'),
  ('40000000-0000-0000-0000-000000000017', null, 'A17', 'Organizational Mental Health Support Programs', 'Support', 'Support', 0.70, 0.80, 0.50, 0.40, 'EAP, counseling, and clinical support access.'),
  ('40000000-0000-0000-0000-000000000018', null, 'A18', 'Recovery Time and Work-Life Boundary Policies', 'Policy', 'Workload', 0.80, 0.10, 0.80, 0.60, 'Enforcing right-to-disconnect and mandatory recovery periods.')
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  jd_dimension = excluded.jd_dimension,
  expected_impact = excluded.expected_impact,
  estimated_cost = excluded.estimated_cost,
  speed = excluded.speed,
  readiness_need = excluded.readiness_need,
  description = excluded.description;

insert into public.personas (
  id, company_id, code, name, description, dominant_pattern, risk_level
) values
  ('50000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'P1', 'Overloaded Builders', 'High workload, low control. Often found in technical and product roles.', 'Exhaustion + Low Autonomy', 'high'),
  ('50000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'P2', 'Pressure Sellers', 'High stress, high reward dependency. Driven by quotas.', 'High Stress + Variable Fairness', 'high'),
  ('50000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'P3', 'Service Strain Cluster', 'Emotional labor heavy, low autonomy.', 'Cynicism + Low Support', 'critical'),
  ('50000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', 'P4', 'Justice Deficit Group', 'Feel efforts are not recognized or rewarded fairly.', 'Low Fairness + Cynicism', 'critical'),
  ('50000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', 'P5', 'High-Stress Leaders', 'High control but overwhelming demands and isolation.', 'High Efficacy + High Exhaustion', 'high'),
  ('50000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000001', 'P6', 'Stable but Fragile Contributors', 'Currently okay, but trending towards burnout due to systemic issues.', 'Moderate Stress + Declining Resources', 'moderate')
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  dominant_pattern = excluded.dominant_pattern,
  risk_level = excluded.risk_level;

insert into public.persona_departments (company_id, persona_id, department_id) values
  ('10000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000008'),
  ('10000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000006'),
  ('10000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000007'),
  ('10000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000004'),
  ('10000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000012'),
  ('10000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000011'),
  ('10000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000005'),
  ('10000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000012'),
  ('10000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000005'),
  ('10000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000009'),
  ('10000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000002'),
  ('10000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000010'),
  ('10000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000003')
on conflict do nothing;

insert into public.persona_interventions (company_id, persona_id, intervention_id, rank) values
  ('10000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 1),
  ('10000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000005', 2),
  ('10000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000009', 3),
  ('10000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000008', 1),
  ('10000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000012', 2),
  ('10000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000018', 3),
  ('10000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000004', 1),
  ('10000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000007', 2),
  ('10000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000013', 3),
  ('10000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000008', 1),
  ('10000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000010', 2),
  ('10000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000002', 3),
  ('10000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000005', '40000000-0000-0000-0000-000000000003', 1),
  ('10000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000005', '40000000-0000-0000-0000-000000000007', 2),
  ('10000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000005', '40000000-0000-0000-0000-000000000018', 3),
  ('10000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000006', '40000000-0000-0000-0000-000000000011', 1),
  ('10000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000006', '40000000-0000-0000-0000-000000000014', 2),
  ('10000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000006', '40000000-0000-0000-0000-000000000015', 3)
on conflict do nothing;

insert into public.library_resources (
  id, company_id, title, category, duration_label, icon_name, resource_type, content
) values
  ('60000000-0000-0000-0000-000000000001', null, 'Understanding Workload vs. Control', 'education', '3 min read', 'BookOpen', 'article', 'A short guide to spotting high strain work patterns and asking for practical autonomy.'),
  ('60000000-0000-0000-0000-000000000002', null, 'Boundary Setting Techniques', 'practice', '5 min video', 'PlayCircle', 'video', 'A roleplay-based practice for saying no while preserving working relationships.'),
  ('60000000-0000-0000-0000-000000000003', null, 'Preparing for a Manager Conversation', 'guide', '10 min read', 'Users', 'article', 'A worksheet-style guide for documenting examples, proposing solutions, and opening a manager conversation.'),
  ('60000000-0000-0000-0000-000000000004', null, 'Post-Work Decompression Routine', 'recovery', '15 min audio', 'Clock', 'audio', 'A guided decompression routine with breathing, closure, and transition cues.'),
  ('60000000-0000-0000-0000-000000000005', null, '5-Minute Desk Stretches', 'exercise', '5 min video', 'Activity', 'video', 'A brief desk stretch routine to reduce tension and reset attention.'),
  ('60000000-0000-0000-0000-000000000006', null, 'Morning Deep Breathing', 'meditation', '10 min audio', 'Heart', 'audio', 'A morning breathing session for focus and steadiness.'),
  ('60000000-0000-0000-0000-000000000007', null, 'The Science of Rest', 'blog', '6 min read', 'FileText', 'article', 'A blog post on rest, recovery, and why stepping away improves cognitive performance.')
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  duration_label = excluded.duration_label,
  icon_name = excluded.icon_name,
  resource_type = excluded.resource_type,
  content = excluded.content;

insert into public.assessment_templates (
  id, company_id, code, title, version, description, purpose, measures
) values
  ('70000000-0000-0000-0000-000000000001', null, 'MBI', 'Maslach Burnout Inventory (MBI)', 'Homers-v2', 'The leading measure of burnout, validated by more than 35 years of research.', 'To assess the risk of burnout among employees and teams.', 'Emotional Exhaustion, Depersonalization, and Personal Accomplishment.'),
  ('70000000-0000-0000-0000-000000000002', null, 'PSS', 'Perceived Stress Scale (PSS)', 'PSS-10', 'A classic instrument for measuring the perception of stress.', 'Understand how unpredictable, uncontrollable, and overloaded employees find their lives.', 'The degree to which situations in life are appraised as stressful.'),
  ('70000000-0000-0000-0000-000000000003', null, 'JDR', 'JD-R Core Assessment', 'v1.0', 'A compact inventory for job demands, resources, and recovery capacity.', 'Measure workload, control, support, fairness, and recovery signals.', 'Workload, Control, Support, Fairness, Recovery.')
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
  ('71000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000001', 'MBI-EE-01', 'scale', 'I feel emotionally drained from my work.', 'Emotional Exhaustion', '[]'::jsonb, 1, 5, 'Never', 'Every day', 1),
  ('71000000-0000-0000-0000-000000000002', '70000000-0000-0000-0000-000000000001', 'MBI-EE-02', 'scale', 'I feel used up at the end of the workday.', 'Emotional Exhaustion', '[]'::jsonb, 1, 5, 'Never', 'Every day', 2),
  ('71000000-0000-0000-0000-000000000003', '70000000-0000-0000-0000-000000000001', 'MBI-WL-01', 'scale', 'I feel I am working too hard on my job.', 'Workload', '[]'::jsonb, 1, 5, 'Never', 'Every day', 3),
  ('71000000-0000-0000-0000-000000000004', '70000000-0000-0000-0000-000000000001', 'MBI-EM-01', 'scale', 'I can easily understand how my colleagues feel about things.', 'Empathy', '[]'::jsonb, 1, 5, 'Never', 'Every day', 4),
  ('71000000-0000-0000-0000-000000000011', '70000000-0000-0000-0000-000000000002', 'PSS-01', 'scale', 'In the last month, how often have you been upset because of something that happened unexpectedly?', 'Perceived Stress', '[]'::jsonb, 0, 4, 'Never', 'Very Often', 1),
  ('71000000-0000-0000-0000-000000000012', '70000000-0000-0000-0000-000000000002', 'PSS-02', 'scale', 'In the last month, how often have you felt unable to control important things in your life?', 'Perceived Stress', '[]'::jsonb, 0, 4, 'Never', 'Very Often', 2)
on conflict (id) do update set
  question = excluded.question,
  dimension = excluded.dimension,
  scale_min = excluded.scale_min,
  scale_max = excluded.scale_max,
  scale_min_label = excluded.scale_min_label,
  scale_max_label = excluded.scale_max_label,
  display_order = excluded.display_order;

insert into public.assessment_runs (
  id, company_id, template_id, name, status, target_type, target_department_id,
  frequency, starts_at, ends_at, completion_goal, invited_count, response_count,
  response_rate, finding, metrics, insights
) values
  ('80000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000001', 'Q2 Comprehensive Wellbeing Assessment', 'active', 'company', null, 'one_time', '2026-05-15 09:00:00+00', '2026-06-04 17:00:00+00', 80, 18400, 12512, 68, 'Currently collecting responses across all departments.', '{}'::jsonb, '{}'::text[]),
  ('80000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000001', 'Q1 Burnout Pulse', 'completed', 'company', null, 'one_time', '2026-01-01 09:00:00+00', '2026-01-15 17:00:00+00', 80, 18800, 15420, 82, 'General stress levels have stabilized, but mid-level management shows a 12 percent increase in exhaustion indicators.', '{"exhaustion":{"value":74,"trend":"+12%"},"cynicism":{"value":45,"trend":"-3%"},"efficacy":{"value":82,"trend":"+5%"}}'::jsonb, array['Mid-level managers working more than 45 hours per week reported 2x higher exhaustion risks.', 'Employees with flexible work arrangements showed 18 percent lower burnout risk.', 'The strongest predictor of high efficacy was frequent recognition from direct supervisors.']),
  ('80000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000001', 'Sales Dept Deep Dive', 'completed', 'department', '20000000-0000-0000-0000-000000000004', 'one_time', '2025-11-01 09:00:00+00', '2025-11-10 17:00:00+00', 80, 120, 110, 91, 'High workload is the primary driver of burnout risk, coupled with lower perceived fairness in Q4 compensation structures.', '{"exhaustion":{"value":88,"trend":"+25%"},"cynicism":{"value":65,"trend":"+15%"},"efficacy":{"value":70,"trend":"-10%"}}'::jsonb, array['Q4 quota increases correlated strongly with the spike in emotional exhaustion.', 'Perceived lack of fairness in lead distribution is driving cynicism.', 'High peer support is currently acting as the primary buffer against severe burnout.'])
on conflict (id) do update set
  status = excluded.status,
  response_count = excluded.response_count,
  response_rate = excluded.response_rate,
  finding = excluded.finding,
  metrics = excluded.metrics,
  insights = excluded.insights;

insert into public.assessment_metric_results (
  id, company_id, assessment_run_id, department_id, scope_type, metric_name,
  metric_value, trend_label, sample_size
) values
  ('81000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '80000000-0000-0000-0000-000000000002', null, 'company', 'exhaustion', 74, '+12%', 15420),
  ('81000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', '80000000-0000-0000-0000-000000000002', null, 'company', 'cynicism', 45, '-3%', 15420),
  ('81000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', '80000000-0000-0000-0000-000000000002', null, 'company', 'efficacy', 82, '+5%', 15420),
  ('81000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', '80000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000004', 'department', 'exhaustion', 88, '+25%', 110),
  ('81000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', '80000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000004', 'department', 'cynicism', 65, '+15%', 110),
  ('81000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000001', '80000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000004', 'department', 'efficacy', 70, '-10%', 110)
on conflict (id) do nothing;

insert into public.assessment_responses (
  id, company_id, assessment_run_id, company_member_id, status, submitted_at,
  score_label, details, metrics, is_anonymized
) values
  ('e0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '80000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000105', 'submitted', '2026-03-15 12:00:00+00', 'Balanced', 'Your wellbeing index is strong. Burnout risk is low. You showed good emotional regulation and high peer support.', '{"emotional":80,"peer_support":85,"workload":60,"autonomy":75,"fairness":82}'::jsonb, false),
  ('e0000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', '80000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000105', 'started', null, null, null, '{}'::jsonb, false)
on conflict (id) do update set
  status = excluded.status,
  submitted_at = excluded.submitted_at,
  score_label = excluded.score_label,
  details = excluded.details,
  metrics = excluded.metrics,
  is_anonymized = excluded.is_anonymized;

insert into public.assessment_answers (
  id, company_id, assessment_response_id, assessment_item_id, numeric_value, display_order
) values
  ('e1000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000002', '71000000-0000-0000-0000-000000000001', 3, 1),
  ('e1000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000002', '71000000-0000-0000-0000-000000000003', 4, 2),
  ('e1000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000002', '71000000-0000-0000-0000-000000000004', 5, 3)
on conflict (id) do update set
  numeric_value = excluded.numeric_value,
  display_order = excluded.display_order;

insert into public.department_metric_snapshots (
  id, company_id, department_id, metric_date, period_label, stress_score,
  workload_score, burnout_score, resource_index, fairness_score, wellbeing_score,
  response_count, risk_level
) values
  ('b0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', null, '2026-01-31', 'Jan', 2.8, 3.0, 2.2, 4.3, 4.1, 72, 11000, 'moderate'),
  ('b0000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', null, '2026-02-28', 'Feb', 2.9, 3.2, 2.4, 4.1, 3.9, 71, 11350, 'moderate'),
  ('b0000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', null, '2026-03-31', 'Mar', 3.1, 3.5, 2.6, 3.9, 3.6, 70, 12100, 'high'),
  ('b0000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', null, '2026-04-30', 'Apr', 3.4, 3.8, 2.9, 3.5, 3.3, 69, 12600, 'high'),
  ('b0000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', null, '2026-05-31', 'May', 3.3, 3.6, 3.0, 3.6, 3.4, 68, 12800, 'high'),
  ('b0000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000001', null, '2026-06-01', 'Jun', 3.5, 3.9, 3.2, 3.3, 3.1, 68, 12512, 'high'),
  ('b1000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000008', '2026-05-31', 'May', 4.1, 4.2, 3.8, 2.2, 2.9, 55, 24, 'critical'),
  ('b1000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000012', '2026-05-31', 'May', 3.6, 3.7, 3.3, 2.8, 2.2, 58, 30, 'critical')
on conflict (id) do update set
  stress_score = excluded.stress_score,
  workload_score = excluded.workload_score,
  burnout_score = excluded.burnout_score,
  resource_index = excluded.resource_index,
  fairness_score = excluded.fairness_score,
  wellbeing_score = excluded.wellbeing_score,
  response_count = excluded.response_count,
  risk_level = excluded.risk_level;

insert into public.reports (
  id, company_id, department_id, assessment_run_id, title, report_type, scope_label,
  category, report_date, author_name, status, content
) values
  ('90000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', null, null, 'Q3 Organizational Health Executive Summary', 'Executive Summary', 'Company', 'organization', '2026-04-01', 'AI Narrative Engine', 'published', 'Executive summary of organizational wellbeing, stress, and resource signals.'),
  ('90000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000008', null, 'DevOps Burnout Diagnostic', 'Department Diagnostic', 'Department', 'department', '2026-04-05', 'AI Narrative Engine', 'published', 'Department diagnostic narrative focused on DevOps workload pressure and recovery capacity.'),
  ('90000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000004', null, 'Sales Fairness & Reward Analysis', 'Deep Dive', 'Department', 'department', '2026-04-08', 'HR Analytics', 'draft', 'Deep dive into Sales fairness, reward clarity, and cynicism signals.'),
  ('90000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', null, null, 'Intervention Ranking: Workload vs Control', 'Intervention Recommendation', 'Company', 'organization', '2026-04-10', 'AI Narrative Engine', 'published', 'TOPSIS comparison of workload and control interventions under current AHP weights.'),
  ('90000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', null, '80000000-0000-0000-0000-000000000002', 'Q1 Burnout Pulse', 'Inventory Report', 'Company', 'inventory', '2026-01-15', 'System', 'published', 'Final report for Q1 Burnout Pulse.'),
  ('90000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000004', '80000000-0000-0000-0000-000000000003', 'Sales Dept Deep Dive', 'Inventory Report', 'Sales Department', 'inventory', '2025-11-10', 'System', 'published', 'Final report for Sales department deep dive.')
on conflict (id) do update set
  title = excluded.title,
  report_type = excluded.report_type,
  scope_label = excluded.scope_label,
  category = excluded.category,
  report_date = excluded.report_date,
  author_name = excluded.author_name,
  status = excluded.status,
  content = excluded.content;

insert into public.intervention_rankings (
  id, company_id, department_id, assessment_run_id, persona_id, intervention_id,
  rank, closeness_coefficient, weights, rationale
) values
  ('d0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000008', '80000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 1, 0.782, '{"cost":22,"speed":12,"impact":47,"readiness":19}'::jsonb, 'Recommended because DevOps shows high exhaustion, workload pressure, and weak recovery capacity.'),
  ('d0000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000008', '80000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000018', 2, 0.741, '{"cost":22,"speed":12,"impact":47,"readiness":19}'::jsonb, 'Addresses inability to disconnect after hours.'),
  ('d0000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000008', '80000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000016', 3, 0.708, '{"cost":22,"speed":12,"impact":47,"readiness":19}'::jsonb, 'Targets manual toil and cognitive load in high-demand roles.')
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
  ('a0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000003', 'Managerial Coaching Rollout', '30000000-0000-0000-0000-000000000001', 'Sarah Jenkins', 'in_progress', '2026-06-15', 'Manager Support Score +15%', 'Rolling out a series of 1-on-1 coaching sessions for all mid-level managers to improve supportive communication and feedback delivery.', 'High', 'Medium', '$$', '6 weeks', '2026-07-15', 45, '2026-05-30 09:00:00+00'),
  ('a0000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000008', '40000000-0000-0000-0000-000000000004', 'Flexible Work Policy Pilot', '30000000-0000-0000-0000-000000000008', 'Tom Baker', 'approved', '2026-05-01', 'Burnout Score < 3.0', 'Piloting a 4-day work week and asynchronous timezone hours to reduce always-on stress.', 'High', 'Low', '$', '3 weeks', '2026-05-15', 0, '2026-05-25 09:00:00+00'),
  ('a0000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', null, null, 'Q1 Burnout Assessment', '30000000-0000-0000-0000-000000000009', 'HR Team', 'completed', '2026-03-31', '100% Participation', 'Completed baseline assessment across the entire organization.', 'Medium', 'Medium', '$', 'One quarter', '2026-04-30', 100, '2026-05-18 09:00:00+00')
on conflict (id) do update set
  status = excluded.status,
  due_date = excluded.due_date,
  kpi = excluded.kpi,
  details = excluded.details,
  progress_percent = excluded.progress_percent,
  last_updated_at = excluded.last_updated_at;
