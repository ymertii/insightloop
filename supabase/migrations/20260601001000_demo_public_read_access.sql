-- Allow the unauthenticated demo app to read seeded demo data.
-- Writes remain protected by the existing authenticated policies, except
-- company request intake which already has a public insert policy.

grant usage on schema public to anon, authenticated;

grant select on
  public.companies,
  public.company_requests,
  public.company_invoices,
  public.departments,
  public.company_members,
  public.department_metric_snapshots,
  public.interventions,
  public.personas,
  public.persona_departments,
  public.persona_interventions,
  public.library_resources,
  public.assessment_templates,
  public.assessment_items,
  public.assessment_runs,
  public.assessment_metric_results,
  public.reports,
  public.intervention_rankings,
  public.action_plans,
  public.action_plan_updates,
  public.company_settings,
  public.ai_prompt_templates,
  public.sector_benchmarks,
  public.employee_dashboard_snapshots
to anon, authenticated;

grant insert on public.company_requests to anon, authenticated;

drop policy if exists demo_public_companies_select on public.companies;
create policy demo_public_companies_select on public.companies
  for select to anon, authenticated
  using (id = '10000000-0000-0000-0000-000000000001'::uuid);

drop policy if exists demo_public_company_requests_select on public.company_requests;
create policy demo_public_company_requests_select on public.company_requests
  for select to anon, authenticated
  using (true);

drop policy if exists demo_public_company_invoices_select on public.company_invoices;
create policy demo_public_company_invoices_select on public.company_invoices
  for select to anon, authenticated
  using (company_id = '10000000-0000-0000-0000-000000000001'::uuid);

drop policy if exists demo_public_departments_select on public.departments;
create policy demo_public_departments_select on public.departments
  for select to anon, authenticated
  using (company_id = '10000000-0000-0000-0000-000000000001'::uuid);

drop policy if exists demo_public_company_members_select on public.company_members;
create policy demo_public_company_members_select on public.company_members
  for select to anon, authenticated
  using (company_id = '10000000-0000-0000-0000-000000000001'::uuid);

drop policy if exists demo_public_department_metric_snapshots_select on public.department_metric_snapshots;
create policy demo_public_department_metric_snapshots_select on public.department_metric_snapshots
  for select to anon, authenticated
  using (company_id = '10000000-0000-0000-0000-000000000001'::uuid);

drop policy if exists demo_public_interventions_select on public.interventions;
create policy demo_public_interventions_select on public.interventions
  for select to anon, authenticated
  using (
    is_active
    and (
      company_id is null
      or company_id = '10000000-0000-0000-0000-000000000001'::uuid
    )
  );

drop policy if exists demo_public_personas_select on public.personas;
create policy demo_public_personas_select on public.personas
  for select to anon, authenticated
  using (company_id = '10000000-0000-0000-0000-000000000001'::uuid);

drop policy if exists demo_public_persona_departments_select on public.persona_departments;
create policy demo_public_persona_departments_select on public.persona_departments
  for select to anon, authenticated
  using (company_id = '10000000-0000-0000-0000-000000000001'::uuid);

drop policy if exists demo_public_persona_interventions_select on public.persona_interventions;
create policy demo_public_persona_interventions_select on public.persona_interventions
  for select to anon, authenticated
  using (company_id = '10000000-0000-0000-0000-000000000001'::uuid);

drop policy if exists demo_public_library_resources_select on public.library_resources;
create policy demo_public_library_resources_select on public.library_resources
  for select to anon, authenticated
  using (
    is_published
    and (
      company_id is null
      or company_id = '10000000-0000-0000-0000-000000000001'::uuid
    )
  );

drop policy if exists demo_public_assessment_templates_select on public.assessment_templates;
create policy demo_public_assessment_templates_select on public.assessment_templates
  for select to anon, authenticated
  using (
    is_active
    and (
      company_id is null
      or company_id = '10000000-0000-0000-0000-000000000001'::uuid
    )
  );

drop policy if exists demo_public_assessment_items_select on public.assessment_items;
create policy demo_public_assessment_items_select on public.assessment_items
  for select to anon, authenticated
  using (
    exists (
      select 1
      from public.assessment_templates at
      where at.id = assessment_items.template_id
        and at.is_active
        and (
          at.company_id is null
          or at.company_id = '10000000-0000-0000-0000-000000000001'::uuid
        )
    )
  );

drop policy if exists demo_public_assessment_runs_select on public.assessment_runs;
create policy demo_public_assessment_runs_select on public.assessment_runs
  for select to anon, authenticated
  using (company_id = '10000000-0000-0000-0000-000000000001'::uuid);

drop policy if exists demo_public_assessment_metric_results_select on public.assessment_metric_results;
create policy demo_public_assessment_metric_results_select on public.assessment_metric_results
  for select to anon, authenticated
  using (company_id = '10000000-0000-0000-0000-000000000001'::uuid);

drop policy if exists demo_public_reports_select on public.reports;
create policy demo_public_reports_select on public.reports
  for select to anon, authenticated
  using (company_id = '10000000-0000-0000-0000-000000000001'::uuid);

drop policy if exists demo_public_intervention_rankings_select on public.intervention_rankings;
create policy demo_public_intervention_rankings_select on public.intervention_rankings
  for select to anon, authenticated
  using (company_id = '10000000-0000-0000-0000-000000000001'::uuid);

drop policy if exists demo_public_action_plans_select on public.action_plans;
create policy demo_public_action_plans_select on public.action_plans
  for select to anon, authenticated
  using (company_id = '10000000-0000-0000-0000-000000000001'::uuid);

drop policy if exists demo_public_action_plan_updates_select on public.action_plan_updates;
create policy demo_public_action_plan_updates_select on public.action_plan_updates
  for select to anon, authenticated
  using (company_id = '10000000-0000-0000-0000-000000000001'::uuid);

drop policy if exists demo_public_company_settings_select on public.company_settings;
create policy demo_public_company_settings_select on public.company_settings
  for select to anon, authenticated
  using (company_id = '10000000-0000-0000-0000-000000000001'::uuid);

drop policy if exists demo_public_ai_prompt_templates_select on public.ai_prompt_templates;
create policy demo_public_ai_prompt_templates_select on public.ai_prompt_templates
  for select to anon, authenticated
  using (
    is_active
    and (
      company_id is null
      or company_id = '10000000-0000-0000-0000-000000000001'::uuid
    )
  );

drop policy if exists demo_public_sector_benchmarks_select on public.sector_benchmarks;
create policy demo_public_sector_benchmarks_select on public.sector_benchmarks
  for select to anon, authenticated
  using (true);

drop policy if exists demo_public_employee_dashboard_snapshots_select on public.employee_dashboard_snapshots;
create policy demo_public_employee_dashboard_snapshots_select on public.employee_dashboard_snapshots
  for select to anon, authenticated
  using (company_id = '10000000-0000-0000-0000-000000000001'::uuid);
