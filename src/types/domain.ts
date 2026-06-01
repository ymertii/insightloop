export type RiskLevel = 'Critical' | 'High' | 'Moderate' | 'Low' | 'Unknown';
export type TrendDirection = 'up' | 'down' | 'stable';

export interface Intervention {
  id: string;
  title: string;
  category: string;
  jdDimension: string;
  expectedImpact: number;
  estimatedCost: number;
  speed: number;
  readinessNeed: number;
  description: string;
  closenessCoefficient?: string;
}

export interface Department {
  id: string;
  dbId?: string;
  name: string;
  employeeCount: number;
  burnoutScore: number;
  stressScore: number;
  resourceIndex: number;
  fairness: number;
  riskLevel: RiskLevel;
  trend: TrendDirection;
  manager: string;
  actionStatus?: string;
}

export interface Employee {
  id: string;
  departmentId?: string;
  name: string;
  role: string;
  email: string;
  phone: string;
}

export interface Persona {
  id: string;
  name: string;
  description: string;
  dominantPattern: string;
  affectedDepartments: string[];
  recommendedBundle: string[];
}

export type ReportCategory = 'Organization' | 'Department' | 'Inventory';

export interface Report {
  id: string;
  title: string;
  type: string;
  scope: string;
  date: string;
  author: string;
  status: string;
  content?: string;
  category: ReportCategory;
}

export type ResourceCategory = 'Education' | 'Practice' | 'Guide' | 'Recovery' | 'Exercise' | 'Meditation' | 'Blog';
export type ResourceType = 'article' | 'video' | 'audio';

export interface LibraryResource {
  id: string;
  title: string;
  category: ResourceCategory;
  duration: string;
  iconName: string;
  type: ResourceType;
  content: string;
}

export interface Company {
  id: string;
  tenantCode: string;
  name: string;
  sector: string;
  employees: number;
  activeEmployees: number;
  status: string;
  risk: RiskLevel;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  paymentStatus: string;
  subscriptionPlan: string;
  nextBillingDate: string;
  website?: string;
}

export interface CompanyRequest {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  type: string;
  date: string;
  status: string;
  employeesSize: number;
}

export interface Invoice {
  id: string;
  date: string;
  amount: string;
  status: string;
}

export interface ActionPlan {
  id: string;
  title: string;
  department: string;
  intervention: string;
  owner: string;
  status: string;
  dueDate: string;
  kpi: string;
  lastUpdated: string;
  details: string;
}

export interface InventoryItem {
  id: string;
  type: 'scale' | 'multiple_choice' | 'text';
  question: string;
  options?: string[];
  scaleMin?: number;
  scaleMax?: number;
  scaleMinLabel?: string;
  scaleMaxLabel?: string;
}

export interface InventoryTemplate {
  id: string;
  title: string;
  version: string;
  description: string;
  purpose: string;
  measures: string;
  items: InventoryItem[];
}

export interface CompletedTest {
  id: string;
  name: string;
  date: string;
  rate?: number;
  responses?: number;
  finding?: string;
  metrics?: Record<string, { value: number; trend: string }>;
  insights?: string[];
  score?: string;
  status?: string;
  details?: string;
  chartData?: Array<Record<string, string | number>>;
}

export interface ActiveInventory {
  id: string;
  name: string;
  target: string;
  endsIn: string;
  responseRate: number;
  status: string;
}

export interface BenchmarkMetric {
  sector: string;
  burnout: number;
  stress: number;
  resources: number;
}

export interface TrendPoint {
  month?: string;
  name?: string;
  stress?: number;
  workload?: number;
  burnout?: number;
  fairness?: number;
  resources?: number;
  recovery?: number;
  engagement?: number;
  value?: number;
}

export interface RadarMetric {
  subject: string;
  A: number;
  fullMark?: number;
}

export interface EmployeeDashboardData {
  strengths: RadarMetric[];
  miniTrend: TrendPoint[];
  recentTests: Array<{ id: string; name: string; date: string }>;
  personalTrend: Record<string, TrendPoint[]>;
  pastTests: CompletedTest[];
}

export interface PromptTemplate {
  id: string;
  title: string;
  description: string;
  content: string;
  variables: string[];
}
