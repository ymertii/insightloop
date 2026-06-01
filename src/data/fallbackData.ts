import { departments, interventions, personas, reports } from './mockData';
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
  InventoryTemplate,
  Invoice,
  LibraryResource,
  Persona,
  PromptTemplate,
  Report,
  TrendPoint,
  RadarMetric,
  Intervention,
} from '../types/domain';

export const fallbackInterventions: Intervention[] = interventions;
export const fallbackDepartments: Department[] = departments as Department[];
export const fallbackPersonas: Persona[] = personas;
export const fallbackReports: Report[] = reports as Report[];

export const fallbackLibraryResources: LibraryResource[] = [
  {
    id: 'res-1',
    title: 'Understanding Workload vs. Control',
    category: 'Education',
    duration: '3 min read',
    iconName: 'BookOpen',
    type: 'article',
    content:
      "When workload is high but you have little control over how to manage it, the risk of burnout increases significantly. This interaction - high demands and low autonomy - is one of the most reliable predictors of emotional exhaustion according to psychometric models.\n\nIn this brief guide, we explore how to identify if you are in a high strain job setup, and actionable ways to request more autonomy from your team leader.",
  },
  {
    id: 'res-2',
    title: 'Boundary Setting Techniques',
    category: 'Practice',
    duration: '5 min video',
    iconName: 'PlayCircle',
    type: 'video',
    content:
      "Learning how to say no effectively without damaging professional relationships is a key skill for maintaining long-term wellbeing.\n\nWatch this 5-minute roleplay scenario demonstrating the Positive No technique: start with a yes to a core value, a clear no to the specific request, and a yes to an alternative solution.",
  },
  {
    id: 'res-3',
    title: 'Preparing for a Manager Conversation',
    category: 'Guide',
    duration: '10 min read',
    iconName: 'Users',
    type: 'article',
    content:
      'Having a conversation with your manager about feeling overwhelmed can be daunting. Preparation is key.\n\nStep 1: Document specific examples.\nStep 2: Propose solutions, not just problems.\nStep 3: Align your wellbeing with team goals.\n\nUse the worksheet to script your opening lines before your next one-on-one.',
  },
  {
    id: 'res-4',
    title: 'Post-Work Decompression Routine',
    category: 'Recovery',
    duration: '15 min audio',
    iconName: 'Clock',
    type: 'audio',
    content:
      "Transitioning from work mode to home mode is crucial, especially when working remotely. This audio guide walks you through a structured 15-minute decompression routine.\n\nIncludes guided breathing, cognitive closure techniques, and a physical transition to signal the end of the workday.",
  },
  {
    id: 'res-5',
    title: '5-Minute Desk Stretches',
    category: 'Exercise',
    duration: '5 min video',
    iconName: 'Activity',
    type: 'video',
    content:
      'Sitting for long periods can lead to physical and mental fatigue.\n\nFollow along with this quick 5-minute desk stretch routine to improve circulation, reduce muscle tension, and refresh your mind. No equipment needed.',
  },
  {
    id: 'res-6',
    title: 'Morning Deep Breathing',
    category: 'Meditation',
    duration: '10 min audio',
    iconName: 'Heart',
    type: 'audio',
    content:
      'Start your day with clarity and focus.\n\nThis 10-minute deep breathing meditation is designed to lower morning cortisol levels and help you set a positive, centered intention for your workday.',
  },
  {
    id: 'res-7',
    title: 'The Science of Rest',
    category: 'Blog',
    duration: '6 min read',
    iconName: 'FileText',
    type: 'article',
    content:
      'Why is rest so hard? And why do we often feel guilty for taking a break?\n\nThis blog post explains how the brain does useful recovery and problem-solving work when you step away from screens.',
  },
];

export const fallbackCompanies: Company[] = [
  {
    id: 'C1',
    tenantCode: 'TEN-8B9X1',
    name: 'HappiWork',
    sector: 'Technology',
    employees: 1250,
    activeEmployees: 450,
    status: 'Active',
    risk: 'High',
    contactName: 'Alice Smith',
    contactEmail: 'alice@happiwork.com',
    contactPhone: '+1 555 0101',
    paymentStatus: 'Paid',
    subscriptionPlan: 'Enterprise',
    nextBillingDate: '2026-10-15',
  },
  {
    id: 'C2',
    tenantCode: 'TEN-K9P0A',
    name: 'Global Retail',
    sector: 'FMCG',
    employees: 8400,
    activeEmployees: 8100,
    status: 'Active',
    risk: 'Moderate',
    contactName: 'Bob Johnson',
    contactEmail: 'bob@globalretail.com',
    contactPhone: '+1 555 0202',
    paymentStatus: 'Paid',
    subscriptionPlan: 'Enterprise',
    nextBillingDate: '2026-06-01',
  },
  {
    id: 'C3',
    tenantCode: 'TEN-2M4N7',
    name: 'FinServe',
    sector: 'Finance',
    employees: 3200,
    activeEmployees: 120,
    status: 'Onboarding',
    risk: 'Unknown',
    contactName: 'Carol White',
    contactEmail: 'carol@finserve.com',
    contactPhone: '+1 555 0303',
    paymentStatus: 'Trial',
    subscriptionPlan: 'Professional',
    nextBillingDate: '2026-06-15',
  },
  {
    id: 'C4',
    tenantCode: 'TEN-F7L1P',
    name: 'TechFlow Inc',
    sector: 'Technology',
    employees: 450,
    activeEmployees: 450,
    status: 'Active',
    risk: 'Critical',
    contactName: 'David Lee',
    contactEmail: 'david@techflow.io',
    contactPhone: '+1 555 0404',
    paymentStatus: 'Overdue',
    subscriptionPlan: 'Starter',
    nextBillingDate: '2026-05-01',
    website: 'https://techflow.io',
  },
];

export const fallbackCompanyRequests: CompanyRequest[] = [
  { id: 'REQ-01', companyName: 'Nexus Tech', contactName: 'Eleanor Shellstrop', email: 'el@nexus.tech', type: 'Demo Request', date: '2026-05-09', status: 'Pending', employeesSize: 200 },
  { id: 'REQ-02', companyName: 'Acme Corp', contactName: 'Wile E. Coyote', email: 'wile@acme.com', type: 'Plan Upgrade', date: '2026-05-10', status: 'Pending', employeesSize: 15 },
  { id: 'REQ-03', companyName: 'Globex', contactName: 'Hank Scorpio', email: 'hank@globex.com', type: 'Support', date: '2026-05-10', status: 'Resolved', employeesSize: 1500 },
];

export const fallbackInvoices: Invoice[] = [
  { id: 'INV-2026-001', date: '2026-05-01', amount: '$4,500', status: 'Paid' },
  { id: 'INV-2026-002', date: '2026-04-01', amount: '$4,500', status: 'Paid' },
  { id: 'INV-2026-003', date: '2026-03-01', amount: '$4,500', status: 'Paid' },
];

export const fallbackActionPlans: ActionPlan[] = [
  {
    id: 'plan-1',
    title: 'Managerial Coaching Rollout',
    department: 'Management',
    intervention: 'Leadership Development',
    owner: 'Sarah Jenkins',
    status: 'In Progress',
    dueDate: '2026-06-15',
    kpi: 'Manager Support Score +15%',
    lastUpdated: '2 days ago',
    details: 'Rolling out one-on-one coaching sessions for mid-level managers to improve supportive communication and feedback delivery.',
  },
  {
    id: 'plan-2',
    title: 'Flexible Work Policy Pilot',
    department: 'DevOps',
    intervention: 'Schedule Autonomy',
    owner: 'Tom Baker',
    status: 'Approved',
    dueDate: '2026-05-01',
    kpi: 'Burnout Score < 3.0',
    lastUpdated: '1 week ago',
    details: 'Piloting a four-day work week and asynchronous timezone hours to reduce always-on stress.',
  },
  {
    id: 'plan-3',
    title: 'Q1 Burnout Assessment',
    department: 'All Departments',
    intervention: 'Survey & Diagnostics',
    owner: 'HR Team',
    status: 'Completed',
    dueDate: '2026-03-31',
    kpi: '100% Participation',
    lastUpdated: '2 weeks ago',
    details: 'Completed baseline assessment across the entire organization.',
  },
];

export const fallbackInventoryTemplates: InventoryTemplate[] = [
  {
    id: 'inv1',
    title: 'Maslach Burnout Inventory (MBI)',
    version: 'Homers-v2',
    description: 'The leading measure of burnout, validated by more than 35 years of research.',
    purpose: 'To assess the risk of burnout among employees and teams.',
    measures: 'Emotional Exhaustion, Depersonalization, and Personal Accomplishment.',
    items: [
      { id: 'i1', type: 'scale', question: 'I feel emotionally drained from my work.', scaleMin: 1, scaleMax: 5, scaleMinLabel: 'Never', scaleMaxLabel: 'Every day' },
      { id: 'i2', type: 'scale', question: 'I feel used up at the end of the workday.', scaleMin: 1, scaleMax: 5, scaleMinLabel: 'Never', scaleMaxLabel: 'Every day' },
    ],
  },
  {
    id: 'inv2',
    title: 'Perceived Stress Scale (PSS)',
    version: 'PSS-10',
    description: 'A classic instrument for measuring the perception of stress.',
    purpose: 'Understand how unpredictable, uncontrollable, and overloaded employees find their lives.',
    measures: "The degree to which situations in one's life are appraised as stressful.",
    items: [
      { id: 'i1', type: 'scale', question: 'In the last month, how often have you been upset because of something that happened unexpectedly?', scaleMin: 0, scaleMax: 4, scaleMinLabel: 'Never', scaleMaxLabel: 'Very Often' },
      { id: 'i2', type: 'scale', question: 'In the last month, how often have you felt that you were unable to control the important things in your life?', scaleMin: 0, scaleMax: 4, scaleMinLabel: 'Never', scaleMaxLabel: 'Very Often' },
    ],
  },
];

export const fallbackActiveInventories: ActiveInventory[] = [
  {
    id: 'active-1',
    name: 'Q2 Comprehensive Wellbeing Assessment',
    target: 'All Departments (18.4k employees)',
    endsIn: 'Ends in 3 days',
    responseRate: 68,
    status: 'In Progress',
  },
];

export const fallbackCompletedTests: CompletedTest[] = [
  {
    id: 't1',
    name: 'Q1 Burnout Pulse',
    date: 'Jan 15, 2026',
    rate: 82,
    responses: 15420,
    finding: 'General stress levels have stabilized, but mid-level management shows a 12% increase in exhaustion indicators.',
    metrics: {
      exhaustion: { value: 74, trend: '+12%' },
      cynicism: { value: 45, trend: '-3%' },
      efficacy: { value: 82, trend: '+5%' },
    },
    insights: [
      'Mid-level managers working over 45 hours per week reported twice the exhaustion risk.',
      'Employees with flexible work arrangements showed 18% lower burnout risk.',
      'The strongest predictor of high efficacy was frequent recognition from direct supervisors.',
    ],
  },
  {
    id: 't2',
    name: 'Sales Dept Deep Dive',
    date: 'Nov 10, 2025',
    rate: 91,
    responses: 110,
    finding: 'High workload is the primary driver of burnout risk, coupled with lower perceived fairness in Q4 compensation structures.',
    metrics: {
      exhaustion: { value: 88, trend: '+25%' },
      cynicism: { value: 65, trend: '+15%' },
      efficacy: { value: 70, trend: '-10%' },
    },
    insights: [
      'Q4 quota increases correlated strongly with the spike in emotional exhaustion.',
      'Perceived lack of fairness in lead distribution is driving cynicism.',
      'High peer support is currently acting as the primary buffer against severe burnout.',
    ],
  },
];

export const fallbackBenchmarkData: BenchmarkMetric[] = [
  { sector: 'Technology', burnout: 3.4, stress: 3.6, resources: 2.8 },
  { sector: 'Banking', burnout: 3.1, stress: 3.8, resources: 3.2 },
  { sector: 'FMCG', burnout: 2.8, stress: 3.0, resources: 3.5 },
  { sector: 'Consulting', burnout: 3.5, stress: 3.9, resources: 2.9 },
];

export const fallbackOrgTrendData: TrendPoint[] = [
  { month: 'Jan', stress: 2.8, workload: 3.0, burnout: 2.2, fairness: 4.1, resources: 4.3 },
  { month: 'Feb', stress: 2.9, workload: 3.2, burnout: 2.4, fairness: 3.9, resources: 4.1 },
  { month: 'Mar', stress: 3.1, workload: 3.5, burnout: 2.6, fairness: 3.6, resources: 3.9 },
  { month: 'Apr', stress: 3.4, workload: 3.8, burnout: 2.9, fairness: 3.3, resources: 3.5 },
  { month: 'May', stress: 3.3, workload: 3.6, burnout: 3.0, fairness: 3.4, resources: 3.6 },
  { month: 'Jun', stress: 3.5, workload: 3.9, burnout: 3.2, fairness: 3.1, resources: 3.3 },
];

export const fallbackOrgRadarData: RadarMetric[] = [
  { subject: 'Workload Health', A: 2.8, fullMark: 5 },
  { subject: 'Fairness', A: 2.8, fullMark: 5 },
  { subject: 'Resources', A: 3.1, fullMark: 5 },
  { subject: 'Support', A: 3.9, fullMark: 5 },
  { subject: 'Autonomy', A: 3.4, fullMark: 5 },
  { subject: 'Community', A: 4.0, fullMark: 5 },
];

export const fallbackDepartmentEmployees: Record<string, Employee[]> = {
  D8: [
    { id: 'emp-1', departmentId: 'D8', name: 'Alice Smith', role: 'DevOps Engineer', email: 'alice@example.com', phone: '+1 555-0100' },
    { id: 'emp-2', departmentId: 'D8', name: 'Bob Jones', role: 'Security Analyst', email: 'bob@example.com', phone: '+1 555-0101' },
    { id: 'emp-3', departmentId: 'D8', name: 'Charlie Davis', role: 'SRE', email: 'charlie@example.com', phone: '+1 555-0102' },
    { id: 'emp-4', departmentId: 'D8', name: 'Dana Lee', role: 'Backend Dev', email: 'dana@example.com', phone: '+1 555-0103' },
  ],
};

export const fallbackEmployeeDashboard: EmployeeDashboardData = {
  strengths: [
    { subject: 'Resilience', A: 85, fullMark: 100 },
    { subject: 'Peer Support', A: 75, fullMark: 100 },
    { subject: 'Autonomy', A: 65, fullMark: 100 },
    { subject: 'Emot. Control', A: 80, fullMark: 100 },
    { subject: 'Adaptability', A: 88, fullMark: 100 },
    { subject: 'Focus', A: 90, fullMark: 100 },
    { subject: 'Boundaries', A: 60, fullMark: 100 },
    { subject: 'Empathy', A: 95, fullMark: 100 },
    { subject: 'Creativity', A: 78, fullMark: 100 },
  ],
  miniTrend: [
    { month: 'Jan', value: 2.8 },
    { month: 'Feb', value: 3.1 },
    { month: 'Mar', value: 3.0 },
    { month: 'Apr', value: 2.9 },
    { month: 'May', value: 2.7 },
  ],
  recentTests: [
    { id: 'recent-1', name: 'Q1 Wellbeing Pulse', date: 'Mar 15' },
    { id: 'recent-2', name: 'Annual Burnout Inventory', date: 'Dec 05' },
  ],
  personalTrend: {
    '3M': [
      { month: 'Feb', stress: 3.1, recovery: 3.0, engagement: 3.5 },
      { month: 'Mar', stress: 3.0, recovery: 3.2, engagement: 3.7 },
      { month: 'Apr', stress: 2.9, recovery: 3.4, engagement: 3.9 },
      { month: 'May', stress: 2.7, recovery: 3.7, engagement: 4.0 },
    ],
    '6M': [
      { month: 'Dec', stress: 2.4, recovery: 3.8, engagement: 4.1 },
      { month: 'Jan', stress: 2.8, recovery: 3.5, engagement: 3.8 },
      { month: 'Feb', stress: 3.1, recovery: 3.0, engagement: 3.5 },
      { month: 'Mar', stress: 3.0, recovery: 3.2, engagement: 3.7 },
      { month: 'Apr', stress: 2.9, recovery: 3.4, engagement: 3.9 },
      { month: 'May', stress: 2.7, recovery: 3.7, engagement: 4.0 },
    ],
    '1Y': [
      { month: 'Jun', stress: 2.0, recovery: 4.5, engagement: 4.2 },
      { month: 'Jul', stress: 2.2, recovery: 4.2, engagement: 4.1 },
      { month: 'Aug', stress: 2.3, recovery: 4.1, engagement: 4.0 },
      { month: 'Sep', stress: 2.5, recovery: 4.0, engagement: 3.9 },
      { month: 'Oct', stress: 2.1, recovery: 4.2, engagement: 4.0 },
      { month: 'Nov', stress: 2.2, recovery: 4.1, engagement: 4.2 },
      { month: 'Dec', stress: 2.4, recovery: 3.8, engagement: 4.1 },
      { month: 'Jan', stress: 2.8, recovery: 3.5, engagement: 3.8 },
      { month: 'Feb', stress: 3.1, recovery: 3.0, engagement: 3.5 },
      { month: 'Mar', stress: 3.0, recovery: 3.2, engagement: 3.7 },
      { month: 'Apr', stress: 2.9, recovery: 3.4, engagement: 3.9 },
      { month: 'May', stress: 2.7, recovery: 3.7, engagement: 4.0 },
    ],
  },
  pastTests: [
    { id: 'pt-1', name: 'Q1 Wellbeing Pulse', date: '2026-03-15', score: 'Balanced', status: 'Completed', details: 'Your wellbeing index is strong. Burnout risk is low. You showed good emotional regulation and high peer support.', chartData: [{ subject: 'Emotional', A: 80 }, { subject: 'Peer Support', A: 85 }, { subject: 'Workload', A: 60 }, { subject: 'Autonomy', A: 75 }, { subject: 'Fairness', A: 82 }] },
    { id: 'pt-2', name: 'Annual Maslach Burnout Inventory', date: '2025-12-05', score: 'Low Risk', status: 'Completed', details: 'Evaluated exhaustion, cynicism, and professional efficacy. Results indicate healthy engagement with work and minimal signs of exhaustion.', chartData: [{ subject: 'Exhaustion', A: 20 }, { subject: 'Cynicism', A: 15 }, { subject: 'Efficacy', A: 85 }, { subject: 'Engagement', A: 90 }] },
    { id: 'pt-3', name: 'Workplace Fairness Index', date: '2025-09-20', score: 'Strong', status: 'Completed', details: 'You perceive your work environment as highly fair. Reward structures and workload distribution metrics are within the optimal range.', chartData: [{ subject: 'Rewards', A: 80 }, { subject: 'Workload', A: 75 }, { subject: 'Respect', A: 90 }, { subject: 'Justice', A: 85 }] },
    { id: 'pt-4', name: 'Manager Collaboration Survey', date: '2025-06-10', score: 'Moderate', status: 'Completed', details: 'Collaboration metrics show some friction in communication channels. Suggested action: Implement weekly one-on-ones.', chartData: [{ subject: 'Communication', A: 50 }, { subject: 'Support', A: 60 }, { subject: 'Feedback', A: 55 }, { subject: 'Clarity', A: 45 }] },
  ],
};

export const fallbackPromptTemplates: PromptTemplate[] = [
  {
    id: 'department-diagnostic',
    title: 'Department Diagnostic Prompt',
    description: 'Used for department detail reports',
    variables: ['department_name', 'burnout_score', 'stress_score', 'weakest_resource', 'top_intervention'],
    content: `You are an expert organizational psychologist analyzing a department's wellbeing data.
Do not use clinical or psychiatric labels. Focus on organizational and behavioral interpretation.

Analyze the following data for {{department_name}}:
Burnout Score: {{burnout_score}} (Threshold: 3.0)
Stress Score: {{stress_score}}
Weakest Resource Dimension: {{weakest_resource}}

The TOPSIS engine has recommended: {{top_intervention}}

Write a concise, 3-paragraph diagnostic narrative explaining the relationship between the weakest resource dimension and the current burnout score, and justify why the recommended intervention is appropriate based on JD-R theory.`,
  },
  {
    id: 'company-summary',
    title: 'Company Executive Summary',
    description: 'Used for high-level tenant reports',
    variables: ['company_name', 'period', 'critical_departments', 'top_risks'],
    content: 'Summarize organization-wide wellbeing trends for {{company_name}} during {{period}}. Highlight critical departments, systemic risk drivers, and recommended next actions.',
  },
  {
    id: 'employee-insight',
    title: 'Employee Personal Insight',
    description: 'Used for individual employee dashboards',
    variables: ['employee_name', 'strengths', 'friction_points', 'recommended_resources'],
    content: 'Write a supportive personal wellbeing insight for {{employee_name}} using strengths, friction points, and recommended resources. Avoid clinical diagnosis.',
  },
];
