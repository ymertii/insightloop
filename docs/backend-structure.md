# InsightLoop Backend Structure

## Runtime

- Frontend data access lives in `src/lib/api.ts`.
- Supabase browser client lives in `src/lib/supabase.ts`.
- If `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are missing, the app uses `src/data/fallbackData.ts` so local development still works.
- Supabase migration and seed files live in `supabase/migrations/20260601000000_initial_insightloop_schema.sql` and `supabase/seed.sql`.
- Vercel SPA routing is configured in `vercel.json`.

## Dynamic Data Map

| UI area | Backend tables |
| --- | --- |
| Admin tenants, requests, billing | `companies`, `company_requests`, `company_invoices` |
| Admin overview | `companies`, `departments`, `assessment_runs` |
| Admin benchmarks | `sector_benchmarks` |
| Admin inventory templates | `assessment_templates`, `assessment_items` |
| Admin employee library | `library_resources` |
| Admin interventions | `interventions` |
| Admin prompt center | `ai_prompt_templates` |
| Company dashboard | `departments`, `interventions`, `department_metric_snapshots`, `reports` |
| Company departments and employees | `departments`, `company_members` |
| Company department detail | `departments`, `company_members`, `department_metric_snapshots`, `intervention_rankings`, `reports` |
| Company personas | `personas`, `persona_departments`, `persona_interventions`, `interventions` |
| Company tests | `assessment_runs`, `assessment_metric_results`, `departments` |
| Company reports | `reports`, `assessment_runs`, `departments` |
| Company action plans | `action_plans`, `action_plan_updates` |
| Employee home and stats | `employee_dashboard_snapshots`, `assessment_responses` |
| Employee library | `library_resources` |

## Supabase Setup Next

1. Create a Supabase project.
2. Run the migration SQL in `supabase/migrations/20260601000000_initial_insightloop_schema.sql`.
3. Run `supabase/seed.sql`.
4. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to `.env.local` and Vercel environment variables.
5. Re-run `npm run build`, then deploy to Vercel.
