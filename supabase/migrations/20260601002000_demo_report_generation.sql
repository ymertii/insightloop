-- Allow the unauthenticated demo app to persist generated report records
-- for the seeded HappiWork tenant. Report writes are limited to inserts.

grant insert on public.reports to anon, authenticated;

drop policy if exists demo_public_reports_insert on public.reports;
create policy demo_public_reports_insert on public.reports
  for insert to anon, authenticated
  with check (
    company_id = '10000000-0000-0000-0000-000000000001'::uuid
    and generated_by is null
  );
