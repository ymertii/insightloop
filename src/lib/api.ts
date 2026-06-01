import {
  fallbackActionPlans,
  fallbackActiveInventories,
  fallbackBenchmarkData,
  fallbackCompanies,
  fallbackCompanyRequests,
  fallbackCompletedTests,
  fallbackDepartmentEmployees,
  fallbackDepartments,
  fallbackEmployeeDashboard,
  fallbackInterventions,
  fallbackInventoryTemplates,
  fallbackInvoices,
  fallbackLibraryResources,
  fallbackOrgRadarData,
  fallbackOrgTrendData,
  fallbackPersonas,
  fallbackPromptTemplates,
  fallbackReports,
} from '../data/fallbackData';
import type {
  ActionPlan,
  ActiveInventory,
  BenchmarkMetric,
  Company,
  CompanyRequest,
  CompletedTest,
  Department,
  Employee,
  EmployeeDashboardData,
  Intervention,
  InventoryTemplate,
  Invoice,
  LibraryResource,
  Persona,
  PromptTemplate,
  RadarMetric,
  Report,
  TrendPoint,
} from '../types/domain';
import { supabase } from './supabase';

export const DEFAULT_COMPANY_ID = '10000000-0000-0000-0000-000000000001';

type UnknownRecord = Record<string, any>;

const generateId = (prefix: string) => `${prefix}-${Date.now()}`;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const toTitleCase = (value?: string | null) =>
  (value ?? '')
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1).toLowerCase()}`)
    .join(' ');

const toEnumValue = (value?: string | null) => (value ?? '').trim().toLowerCase().replace(/\s+/g, '_');

const categoryToEnum = (value?: string | null) => toEnumValue(value);

function warnFallback(table: string, error: unknown) {
  console.warn(`[backend] Falling back to seed data for ${table}.`, error);
}

async function selectRows<T>(
  table: string,
  fallback: T[],
  mapRow: (row: UnknownRecord) => T = (row) => row as T,
): Promise<T[]> {
  if (!supabase) return fallback;

  const { data, error } = await supabase.from(table).select('*');

  if (error || !data) {
    warnFallback(table, error);
    return fallback;
  }

  return data.map(mapRow);
}

async function selectPayload<T>(table: string, fallback: T, column = 'payload'): Promise<T> {
  if (!supabase) return fallback;

  const { data, error } = await supabase.from(table).select(column).limit(1).maybeSingle();

  if (error || !data?.[column]) {
    warnFallback(table, error);
    return fallback;
  }

  return data[column] as T;
}

async function insertRow<T>(
  table: string,
  row: UnknownRecord,
  fallback: T,
  mapRow: (row: UnknownRecord) => T = (row) => row as T,
): Promise<T> {
  if (!supabase) return fallback;

  const { data, error } = await supabase.from(table).insert(row).select('*').single();

  if (error || !data) {
    warnFallback(table, error);
    return fallback;
  }

  return mapRow(data);
}

async function updateRow<T>(
  table: string,
  id: string,
  row: UnknownRecord,
  fallback: T,
  mapRow: (row: UnknownRecord) => T = (record) => record as T,
): Promise<T> {
  if (!supabase) return fallback;

  const { data, error } = await supabase.from(table).update(row).eq('id', id).select('*').single();

  if (error || !data) {
    warnFallback(table, error);
    return fallback;
  }

  return mapRow(data);
}

async function deleteRow(table: string, id: string): Promise<void> {
  if (!supabase) return;

  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) warnFallback(table, error);
}

const asDepartment = (row: UnknownRecord): Department => ({
  id: String(row.code ?? row.id),
  dbId: String(row.id),
  name: row.name,
  employeeCount: row.employee_count ?? row.employeeCount ?? 0,
  burnoutScore: Number(row.burnout_score ?? row.burnoutScore ?? 0),
  stressScore: Number(row.stress_score ?? row.stressScore ?? 0),
  resourceIndex: Number(row.resource_index ?? row.resourceIndex ?? 0),
  fairness: Number(row.fairness_score ?? row.fairness ?? 0),
  riskLevel: toTitleCase(row.risk_level ?? row.riskLevel ?? 'unknown') as Department['riskLevel'],
  trend: row.trend ?? 'stable',
  manager: row.manager_name ?? row.manager ?? '',
  actionStatus: row.action_status ?? row.actionStatus,
});

const departmentToRow = (department: Partial<Department>) => ({
  name: department.name,
  employee_count: department.employeeCount,
  burnout_score: department.burnoutScore,
  stress_score: department.stressScore,
  resource_index: department.resourceIndex,
  fairness_score: department.fairness,
  risk_level: toEnumValue(department.riskLevel),
  trend: department.trend,
  manager_name: department.manager,
  company_id: DEFAULT_COMPANY_ID,
});

const asIntervention = (row: UnknownRecord): Intervention => ({
  id: String(row.code ?? row.id),
  title: row.title,
  category: row.category,
  jdDimension: row.jd_dimension ?? row.jdDimension ?? '',
  expectedImpact: Number(row.expected_impact ?? row.expectedImpact ?? 0),
  estimatedCost: Number(row.estimated_cost ?? row.estimatedCost ?? 0),
  speed: Number(row.speed ?? 0),
  readinessNeed: Number(row.readiness_need ?? row.readinessNeed ?? 0),
  description: row.description ?? '',
});

async function resolveDepartmentDbId(departmentId: string) {
  if (!supabase || uuidPattern.test(departmentId)) return departmentId;

  const { data, error } = await supabase
    .from('departments')
    .select('id')
    .eq('code', departmentId)
    .eq('company_id', DEFAULT_COMPANY_ID)
    .maybeSingle();

  if (error || !data?.id) {
    warnFallback('departments', error);
    return departmentId;
  }

  return String(data.id);
}

const interventionToRow = (intervention: Partial<Intervention>) => ({
  code: intervention.id,
  title: intervention.title,
  category: intervention.category,
  jd_dimension: intervention.jdDimension,
  expected_impact: intervention.expectedImpact,
  estimated_cost: intervention.estimatedCost,
  speed: intervention.speed,
  readiness_need: intervention.readinessNeed,
  description: intervention.description,
});

const asPersona = (row: UnknownRecord): Persona => ({
  id: String(row.code ?? row.id),
  name: row.name,
  description: row.description ?? '',
  dominantPattern: row.dominant_pattern ?? row.dominantPattern ?? '',
  affectedDepartments: row.affected_departments ?? row.affectedDepartments ?? [],
  recommendedBundle: row.recommended_bundle ?? row.recommendedBundle ?? [],
});

const asReport = (row: UnknownRecord): Report => ({
  id: String(row.id),
  title: row.title,
  type: row.report_type ?? row.type,
  scope: row.scope_label ?? row.scope,
  date: row.report_date ?? row.date,
  author: row.author_name ?? row.author,
  status: toTitleCase(row.status),
  content: row.content,
  category: toTitleCase(row.category) as Report['category'],
});

const reportToRow = (report: Partial<Report>) => ({
  title: report.title,
  report_type: report.type,
  scope_label: report.scope,
  report_date: report.date,
  author_name: report.author,
  status: toEnumValue(report.status),
  content: report.content,
  category: toEnumValue(report.category),
  company_id: DEFAULT_COMPANY_ID,
});

const asLibraryResource = (row: UnknownRecord): LibraryResource => ({
  id: String(row.id),
  title: row.title,
  category: toTitleCase(row.category) as LibraryResource['category'],
  duration: row.duration_label ?? row.duration,
  iconName: row.icon_name ?? row.iconName ?? 'FileText',
  type: row.resource_type ?? row.type,
  content: row.content ?? '',
});

const resourceToRow = (resource: Partial<LibraryResource>) => ({
  title: resource.title,
  category: categoryToEnum(resource.category),
  duration_label: resource.duration,
  icon_name: resource.iconName,
  resource_type: resource.type,
  content: resource.content,
});

const asCompany = (row: UnknownRecord): Company => ({
  id: String(row.id),
  tenantCode: row.tenant_code ?? row.tenantCode ?? '',
  name: row.name,
  sector: row.sector,
  employees: row.employee_count ?? row.employees ?? 0,
  activeEmployees: row.active_employee_count ?? row.activeEmployees ?? 0,
  status: toTitleCase(row.status),
  risk: toTitleCase(row.risk_level ?? row.risk ?? 'unknown') as Company['risk'],
  contactName: row.contact_name ?? row.contactName ?? '',
  contactEmail: row.contact_email ?? row.contactEmail ?? '',
  contactPhone: row.contact_phone ?? row.contactPhone ?? '',
  paymentStatus: row.payment_status ?? row.paymentStatus ?? '',
  subscriptionPlan: row.subscription_plan ?? row.subscriptionPlan ?? '',
  nextBillingDate: row.next_billing_date ?? row.nextBillingDate ?? '',
  website: row.website,
});

const companyToRow = (company: Partial<Company>) => ({
  tenant_code: company.tenantCode,
  name: company.name,
  sector: company.sector,
  employee_count: company.employees,
  active_employee_count: company.activeEmployees,
  status: toEnumValue(company.status),
  risk_level: toEnumValue(company.risk),
  contact_name: company.contactName,
  contact_email: company.contactEmail,
  contact_phone: company.contactPhone,
  payment_status: company.paymentStatus,
  subscription_plan: company.subscriptionPlan,
  next_billing_date: company.nextBillingDate,
  website: company.website,
});

const asCompanyRequest = (row: UnknownRecord): CompanyRequest => ({
  id: String(row.id),
  companyName: row.company_name ?? row.companyName ?? '',
  contactName: row.contact_name ?? row.contactName ?? '',
  email: row.email,
  type: row.request_type ?? row.type,
  date: row.submitted_at ? String(row.submitted_at).slice(0, 10) : row.date,
  status: toTitleCase(row.status),
  employeesSize: row.requested_employee_count ?? row.employees_size ?? row.employeesSize ?? 0,
});

const asInvoice = (row: UnknownRecord): Invoice => ({
  id: row.invoice_number ?? String(row.id),
  date: row.invoice_date ?? row.date,
  amount: typeof row.amount === 'number' ? `$${row.amount.toLocaleString()}` : row.amount,
  status: toTitleCase(row.status),
});

const asActionPlan = (row: UnknownRecord): ActionPlan => ({
  id: String(row.id),
  title: row.title,
  department: row.department ?? row.departments?.name ?? 'All Departments',
  intervention: row.intervention ?? row.interventions?.title ?? 'Intervention',
  owner: row.owner_name ?? row.owner,
  status: toTitleCase(row.status),
  dueDate: row.due_date ?? row.dueDate ?? '',
  kpi: row.kpi,
  lastUpdated: row.last_updated_at ?? row.last_updated ?? row.lastUpdated ?? '',
  details: row.details,
});

const actionPlanToRow = (plan: Partial<ActionPlan>) => ({
  title: plan.title,
  owner_name: plan.owner,
  status: toEnumValue(plan.status),
  due_date: plan.dueDate,
  kpi: plan.kpi,
  last_updated_at: new Date().toISOString(),
  details: plan.details,
  company_id: DEFAULT_COMPANY_ID,
});

const asEmployee = (row: UnknownRecord): Employee => ({
  id: String(row.id),
  departmentId: row.department_id ?? row.departmentId,
  name: row.full_name ?? row.name,
  role: row.job_title ?? row.role,
  email: row.email,
  phone: row.phone,
});

const employeeToRow = (employee: Partial<Employee>) => ({
  department_id: employee.departmentId,
  full_name: employee.name,
  job_title: employee.role,
  email: employee.email,
  phone: employee.phone,
  company_id: DEFAULT_COMPANY_ID,
  role: 'employee',
  status: 'active',
});

const asBenchmark = (row: UnknownRecord): BenchmarkMetric => ({
  sector: row.sector,
  burnout: Number(row.burnout),
  stress: Number(row.stress),
  resources: Number(row.resources),
});

const asCompletedTest = (row: UnknownRecord): CompletedTest => ({
  id: String(row.id),
  name: row.name,
  date: row.ends_at ? String(row.ends_at).slice(0, 12) : row.date,
  rate: row.response_rate ?? row.rate,
  responses: row.response_count ?? row.responses,
  finding: row.finding,
  metrics: row.metrics,
  insights: row.insights,
  score: row.score,
  status: row.status,
  details: row.details,
  chartData: row.chart_data ?? row.chartData,
});

const asInventoryTemplate = (row: UnknownRecord): InventoryTemplate => ({
  id: String(row.id),
  title: row.title,
  version: row.version,
  description: row.description,
  purpose: row.purpose,
  measures: row.measures,
  items: row.items ?? [],
});

const asPromptTemplate = (row: UnknownRecord): PromptTemplate => ({
  id: String(row.id),
  title: row.title,
  description: row.description ?? '',
  content: row.content,
  variables: row.variables ?? [],
});

export function calculateTopsis(
  items: Intervention[],
  weights: { cost: number; speed: number; impact: number; readiness: number },
) {
  return [...items]
    .map((intervention) => {
      const costScore = (1 - intervention.estimatedCost) * (weights.cost / 100);
      const speedScore = intervention.speed * (weights.speed / 100);
      const impactScore = intervention.expectedImpact * (weights.impact / 100);
      const readinessScore = intervention.readinessNeed * (weights.readiness / 100);

      return {
        ...intervention,
        closenessCoefficient: (costScore + speedScore + impactScore + readinessScore).toFixed(3),
      };
    })
    .sort((a, b) => Number(b.closenessCoefficient) - Number(a.closenessCoefficient));
}

export async function getInterventions() {
  return selectRows('interventions', fallbackInterventions, asIntervention);
}

export async function createIntervention(intervention: Omit<Intervention, 'id'> & { id?: string }) {
  const fallback: Intervention = { ...intervention, id: intervention.id ?? generateId('INT') };
  return insertRow('interventions', interventionToRow(fallback), fallback, asIntervention);
}

export async function getDepartments() {
  return selectRows('departments', fallbackDepartments, asDepartment);
}

export async function createDepartment(department: Partial<Department> & Pick<Department, 'name' | 'manager'>) {
  const fallback: Department = {
    id: generateId('D'),
    employeeCount: 0,
    burnoutScore: 0,
    stressScore: 0,
    resourceIndex: 0,
    fairness: 0,
    riskLevel: 'Unknown',
    trend: 'stable',
    ...department,
  };

  return insertRow('departments', departmentToRow(fallback), fallback, asDepartment);
}

export async function getDepartmentEmployees(departmentId: string) {
  const fallback = fallbackDepartmentEmployees[departmentId] ?? [];
  if (!supabase) return fallback;
  const resolvedDepartmentId = await resolveDepartmentDbId(departmentId);

  const { data, error } = await supabase.from('company_members').select('*').eq('department_id', resolvedDepartmentId);

  if (error || !data) {
    warnFallback('company_members', error);
    return fallback;
  }

  return data.map(asEmployee);
}

export async function createEmployee(employee: Omit<Employee, 'id'>) {
  const fallback: Employee = { ...employee, id: generateId('EMP') };
  const departmentId = employee.departmentId ? await resolveDepartmentDbId(employee.departmentId) : undefined;
  return insertRow('company_members', employeeToRow({ ...employee, departmentId }), fallback, asEmployee);
}

export async function updateEmployee(id: string, employee: Partial<Employee>) {
  const fallback: Employee = { id, name: '', role: '', email: '', phone: '', ...employee };
  return updateRow('company_members', id, employeeToRow(employee), fallback, asEmployee);
}

export async function deleteEmployee(id: string) {
  await deleteRow('company_members', id);
}

export async function getPersonas() {
  if (!supabase) return fallbackPersonas;

  const { data, error } = await supabase
    .from('personas')
    .select('*, persona_departments(departments(name)), persona_interventions(rank, interventions(code, title))')
    .eq('company_id', DEFAULT_COMPANY_ID);

  if (error || !data) {
    warnFallback('personas', error);
    return fallbackPersonas;
  }

  return data.map((row) => {
    const fallback = fallbackPersonas.find((persona) => persona.id === row.code);
    const affectedDepartments = row.persona_departments
      ?.map((item: UnknownRecord) => item.departments?.name)
      .filter(Boolean) ?? fallback?.affectedDepartments ?? [];
    const recommendedBundle = row.persona_interventions
      ?.sort((a: UnknownRecord, b: UnknownRecord) => (a.rank ?? 0) - (b.rank ?? 0))
      .map((item: UnknownRecord) => item.interventions?.code)
      .filter(Boolean) ?? fallback?.recommendedBundle ?? [];

    return {
      ...asPersona(row),
      affectedDepartments,
      recommendedBundle,
    };
  });
}

export async function getReports() {
  return selectRows('reports', fallbackReports, asReport);
}

export async function createReport(report: Omit<Report, 'id'> & { id?: string }) {
  const fallback: Report = { ...report, id: report.id ?? generateId('REP') };
  return insertRow('reports', reportToRow(fallback), fallback, asReport);
}

export async function getLibraryResources() {
  return selectRows('library_resources', fallbackLibraryResources, asLibraryResource);
}

export async function createLibraryResource(resource: Omit<LibraryResource, 'id'>) {
  const fallback: LibraryResource = { ...resource, id: generateId('RES') };
  return insertRow('library_resources', resourceToRow(resource), fallback, asLibraryResource);
}

export async function updateLibraryResource(id: string, resource: Partial<LibraryResource>) {
  const fallback: LibraryResource = {
    id,
    title: '',
    category: 'Blog',
    duration: '',
    iconName: 'FileText',
    type: 'article',
    content: '',
    ...resource,
  };

  return updateRow('library_resources', id, resourceToRow(resource), fallback, asLibraryResource);
}

export async function deleteLibraryResource(id: string) {
  await deleteRow('library_resources', id);
}

export async function getCompanies() {
  return selectRows('companies', fallbackCompanies, asCompany);
}

export async function createCompany(company: Omit<Company, 'id'>) {
  const fallback: Company = { ...company, id: generateId('C') };
  return insertRow('companies', companyToRow(company), fallback, asCompany);
}

export async function updateCompany(id: string, company: Partial<Company>) {
  const fallback: Company = { id, ...fallbackCompanies[0], ...company };
  return updateRow('companies', id, companyToRow(company), fallback, asCompany);
}

export async function getCompanyRequests() {
  return selectRows('company_requests', fallbackCompanyRequests, asCompanyRequest);
}

export async function getInvoices() {
  return selectRows('company_invoices', fallbackInvoices, asInvoice);
}

export async function getActionPlans() {
  if (!supabase) return fallbackActionPlans;

  const { data, error } = await supabase
    .from('action_plans')
    .select('*, departments(name), interventions(title)')
    .eq('company_id', DEFAULT_COMPANY_ID);

  if (error || !data) {
    warnFallback('action_plans', error);
    return fallbackActionPlans;
  }

  return data.map(asActionPlan);
}

export async function updateActionPlan(id: string, plan: Partial<ActionPlan>) {
  const fallback: ActionPlan = { id, ...fallbackActionPlans[0], ...plan };
  return updateRow('action_plans', id, actionPlanToRow(plan), fallback, asActionPlan);
}

export async function getInventoryTemplates() {
  if (!supabase) return fallbackInventoryTemplates;

  const { data, error } = await supabase
    .from('assessment_templates')
    .select('*, assessment_items(*)')
    .order('title', { ascending: true });

  if (error || !data) {
    warnFallback('assessment_templates', error);
    return fallbackInventoryTemplates;
  }

  return data.map((row) => ({
    ...asInventoryTemplate(row),
    items: (row.assessment_items ?? [])
      .sort((a: UnknownRecord, b: UnknownRecord) => (a.display_order ?? 0) - (b.display_order ?? 0))
      .map((item: UnknownRecord) => ({
        id: String(item.id),
        type: item.item_type,
        question: item.question,
        options: item.options,
        scaleMin: item.scale_min,
        scaleMax: item.scale_max,
        scaleMinLabel: item.scale_min_label,
        scaleMaxLabel: item.scale_max_label,
      })),
  }));
}

export async function saveInventoryTemplate(template: InventoryTemplate) {
  if (!supabase) return template;

  const { data, error } = await supabase
    .from('assessment_templates')
    .upsert({
      ...(uuidPattern.test(template.id) ? { id: template.id } : {}),
      company_id: DEFAULT_COMPANY_ID,
      code: template.id,
      title: template.title,
      version: template.version,
      description: template.description,
      purpose: template.purpose,
      measures: template.measures,
    })
    .select('*')
    .single();

  if (error || !data) {
    warnFallback('assessment_templates', error);
    return template;
  }

  return asInventoryTemplate(data);
}

export async function getActiveInventories(): Promise<ActiveInventory[]> {
  if (!supabase) return fallbackActiveInventories;

  const { data, error } = await supabase.from('assessment_runs').select('*').eq('status', 'active');

  if (error || !data) {
    warnFallback('assessment_runs', error);
    return fallbackActiveInventories;
  }

  return data.map((row) => ({
    id: String(row.id),
    name: row.name,
    target: row.target ?? (row.target_type === 'company' ? 'All Departments' : 'Selected group'),
    endsIn: row.ends_at ? `Ends ${String(row.ends_at).slice(0, 10)}` : row.ends_in ?? row.endsIn,
    responseRate: row.response_rate ?? row.responseRate ?? 0,
    status: toTitleCase(row.status),
  }));
}

export async function getCompletedTests() {
  if (!supabase) return fallbackCompletedTests;

  const { data, error } = await supabase.from('assessment_runs').select('*').eq('status', 'completed');

  if (error || !data) {
    warnFallback('assessment_runs', error);
    return fallbackCompletedTests;
  }

  return data.map(asCompletedTest);
}

export async function getBenchmarks() {
  return selectRows('sector_benchmarks', fallbackBenchmarkData, asBenchmark);
}

export async function getOrganizationTrends() {
  if (!supabase) return fallbackOrgTrendData;

  const { data, error } = await supabase
    .from('department_metric_snapshots')
    .select('*')
    .is('department_id', null)
    .order('metric_date', { ascending: true });

  if (error || !data?.length) {
    warnFallback('department_metric_snapshots', error);
    return fallbackOrgTrendData;
  }

  return data.map((row) => ({
    month: row.period_label,
    stress: row.stress_score,
    workload: row.workload_score,
    burnout: row.burnout_score,
    fairness: row.fairness_score,
    resources: row.resource_index,
  }));
}

export async function getOrganizationRadar() {
  if (!supabase) return fallbackOrgRadarData;

  const { data, error } = await supabase
    .from('department_metric_snapshots')
    .select('*')
    .is('department_id', null)
    .order('metric_date', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    warnFallback('department_metric_snapshots', error);
    return fallbackOrgRadarData;
  }

  return [
    { subject: 'Workload Health', A: Math.max(0, 5 - Number(data.workload_score ?? 0) + 1), fullMark: 5 },
    { subject: 'Fairness', A: Number(data.fairness_score ?? 0), fullMark: 5 },
    { subject: 'Resources', A: Number(data.resource_index ?? 0), fullMark: 5 },
    { subject: 'Support', A: Number(data.support_score ?? 3.9), fullMark: 5 },
    { subject: 'Autonomy', A: Number(data.autonomy_score ?? 3.4), fullMark: 5 },
    { subject: 'Community', A: Number(data.community_score ?? 4), fullMark: 5 },
  ];
}

export async function getDepartmentMetricTimeseries(department: Department): Promise<TrendPoint[]> {
  const fallback: TrendPoint[] = [
    { name: 'Jul', stress: 2.5, burnout: 2.1, fairness: 4.5, resources: 4.8 },
    { name: 'Aug', stress: 2.6, burnout: 2.2, fairness: 4.4, resources: 4.6 },
    { name: 'Sep', stress: 2.8, burnout: 2.5, fairness: 4.2, resources: 4.3 },
    { name: 'Oct', stress: 2.9, burnout: 2.6, fairness: 4.0, resources: 4.1 },
    { name: 'Nov', stress: 3.1, burnout: 2.7, fairness: 3.9, resources: 3.8 },
    { name: 'Dec', stress: 3.0, burnout: 2.6, fairness: 3.8, resources: 3.9 },
    { name: 'Jan', stress: 3.2, burnout: 2.8, fairness: 3.5, resources: 3.2 },
    { name: 'Feb', stress: 3.5, burnout: 3.1, fairness: 3.3, resources: 2.8 },
    { name: 'Mar', stress: 3.8, burnout: 3.6, fairness: 3.0, resources: 2.5 },
    { name: 'Apr', stress: 4.1, burnout: 3.9, fairness: 2.8, resources: 2.2 },
    { name: 'May', stress: department.stressScore, burnout: department.burnoutScore, fairness: department.fairness, resources: department.resourceIndex },
  ];

  if (!supabase) return fallback;
  const departmentDbId = department.dbId ?? await resolveDepartmentDbId(department.id);

  const { data, error } = await supabase
    .from('department_metric_snapshots')
    .select('*')
    .eq('department_id', departmentDbId)
    .order('metric_date', { ascending: true });

  if (error || !data?.length) {
    warnFallback('department_metric_snapshots', error);
    return fallback;
  }

  return data.map((row) => ({
    name: row.period_label ?? row.name,
    stress: row.stress_score,
    burnout: row.burnout_score,
    fairness: row.fairness_score,
    resources: row.resource_index,
  }));
}

export async function getDepartmentRadar(department: Department): Promise<RadarMetric[]> {
  const fallback: RadarMetric[] = [
    { subject: 'Workload Health', A: Math.max(0, 5 - department.stressScore + 1), fullMark: 5 },
    { subject: 'Fairness', A: department.fairness, fullMark: 5 },
    { subject: 'Resources', A: department.resourceIndex, fullMark: 5 },
    { subject: 'Support', A: 4.2, fullMark: 5 },
    { subject: 'Autonomy', A: 3.5, fullMark: 5 },
    { subject: 'Community', A: 3.8, fullMark: 5 },
  ];

  if (!supabase) return fallback;
  const departmentDbId = department.dbId ?? await resolveDepartmentDbId(department.id);

  const { data, error } = await supabase
    .from('department_metric_snapshots')
    .select('*')
    .eq('department_id', departmentDbId)
    .order('metric_date', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    warnFallback('department_metric_snapshots', error);
    return fallback;
  }

  return [
    { subject: 'Workload Health', A: Math.max(0, 5 - Number(data.workload_score ?? data.stress_score ?? 0) + 1), fullMark: 5 },
    { subject: 'Fairness', A: Number(data.fairness_score ?? department.fairness), fullMark: 5 },
    { subject: 'Resources', A: Number(data.resource_index ?? department.resourceIndex), fullMark: 5 },
    { subject: 'Support', A: Number(data.support_score ?? 4.2), fullMark: 5 },
    { subject: 'Autonomy', A: Number(data.autonomy_score ?? 3.5), fullMark: 5 },
    { subject: 'Community', A: Number(data.community_score ?? 3.8), fullMark: 5 },
  ];
}

export async function getEmployeeDashboard() {
  return selectPayload<EmployeeDashboardData>('employee_dashboard_snapshots', fallbackEmployeeDashboard);
}

export async function getPromptTemplates() {
  return selectRows('ai_prompt_templates', fallbackPromptTemplates, asPromptTemplate);
}

export async function savePromptTemplate(template: PromptTemplate) {
  if (!supabase) return template;

  const { data, error } = await supabase
    .from('ai_prompt_templates')
    .upsert({
      id: template.id,
      company_id: DEFAULT_COMPANY_ID,
      title: template.title,
      description: template.description,
      content: template.content,
      variables: template.variables,
    })
    .select('*')
    .single();

  if (error || !data) {
    warnFallback('ai_prompt_templates', error);
    return template;
  }

  return asPromptTemplate(data);
}
