import React from 'react';
import { Download, Printer, Share2 } from 'lucide-react';
import {
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { Department, Report, RiskLevel } from '../../types/domain';

interface InsightReportDocumentProps {
  departments: Department[];
  onPrint: () => void;
  report: Report;
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const riskBadgeClass: Record<RiskLevel, string> = {
  Critical: 'bg-red-100 text-red-700',
  High: 'bg-rose-100 text-rose-700',
  Moderate: 'bg-amber-100 text-amber-700',
  Low: 'bg-emerald-100 text-emerald-700',
  Unknown: 'bg-slate-100 text-slate-600',
};

const riskAccentClass: Record<RiskLevel, string> = {
  Critical: 'border-red-400 bg-red-50',
  High: 'border-rose-400 bg-rose-50',
  Moderate: 'border-amber-400 bg-amber-50',
  Low: 'border-emerald-400 bg-emerald-50',
  Unknown: 'border-slate-300 bg-slate-50',
};

const inferDepartment = (report: Report, departments: Department[]) => {
  const scopeName = report.scope.replace(/\s+Department$/i, '').trim();

  return (
    departments.find((department) => department.id === scopeName) ??
    departments.find((department) => department.name.toLowerCase() === scopeName.toLowerCase()) ??
    departments.find((department) => report.title.toLowerCase().includes(department.name.toLowerCase())) ??
    departments[0]
  );
};

const average = (values: number[]) => {
  const usableValues = values.filter((value) => Number.isFinite(value));
  if (!usableValues.length) return 0;
  return usableValues.reduce((sum, value) => sum + value, 0) / usableValues.length;
};

const parseReportContent = (content?: string): Record<string, any> => {
  if (!content) return {};

  try {
    const parsed = JSON.parse(content);
    return typeof parsed === 'object' && parsed !== null ? parsed : { summary: content };
  } catch {
    return { summary: content };
  }
};

const formatPeriod = (report: Report, content: Record<string, any>) => {
  if (report.periodLabel) return report.periodLabel;
  if (content.periodLabel) return content.periodLabel;
  if (report.periodStart && report.periodEnd) return `${report.periodStart} - ${report.periodEnd}`;
  return report.date;
};

const buildTrendData = (department: Department) => {
  const stressBase = department.stressScore || 3;
  const burnoutBase = department.burnoutScore || 3;
  const resourceBase = department.resourceIndex || 3;

  return ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5', 'Wk 6'].map((week, index) => {
    const modifier = (index - 2.5) * 0.13;
    const incidentLift = index === 3 ? 0.45 : index === 5 ? 0.28 : 0;

    return {
      burnout: Number(clamp(burnoutBase + modifier + incidentLift * 0.7, 1, 5).toFixed(1)),
      resources: Number(clamp(resourceBase - modifier * 0.8, 1, 5).toFixed(1)),
      stress: Number(clamp(stressBase + modifier + incidentLift, 1, 5).toFixed(1)),
      week,
    };
  });
};

const buildEmotionData = (department: Department) => {
  const negative = clamp(Math.round(18 + department.stressScore * 8 + department.burnoutScore * 5), 24, 62);
  const positive = clamp(Math.round(34 - department.stressScore * 3 + department.resourceIndex * 2), 12, 32);
  const neutral = Math.max(0, 100 - negative - positive);

  return [
    { color: '#ef4444', name: 'Negative', value: negative },
    { color: '#cbd5e1', name: 'Neutral', value: neutral },
    { color: '#22c55e', name: 'Positive', value: positive },
  ];
};

const getRiskRows = (department: Department, departments: Department[]) => {
  const sourceDepartments = departments.length > 1 ? departments : [department];

  return sourceDepartments
    .filter((item) => item.id !== department.id)
    .slice(0, 4)
    .map((item) => ({
      burnout: item.burnoutScore >= 3.4 ? 'High' : item.burnoutScore >= 2.9 ? 'Medium' : 'Low',
      stress: item.stressScore >= 3.5 ? 'High' : item.stressScore >= 2.9 ? 'Medium' : 'Low',
      team: item.name,
    }));
};

const buildReportModel = (report: Report, departments: Department[]) => {
  const content = parseReportContent(report.content);
  const isDepartmentReport = report.category === 'Department' || report.type.toLowerCase().includes('department');
  const selectedDepartment = inferDepartment(report, departments);
  const safeDepartment: Department =
    selectedDepartment ?? {
      burnoutScore: average(departments.map((department) => department.burnoutScore)),
      employeeCount: departments.reduce((sum, department) => sum + department.employeeCount, 0),
      fairness: average(departments.map((department) => department.fairness)),
      id: 'organization',
      manager: 'HR Leadership',
      name: 'Organization',
      resourceIndex: average(departments.map((department) => department.resourceIndex)),
      riskLevel: 'High',
      stressScore: average(departments.map((department) => department.stressScore)),
      trend: 'stable',
    };

  const organizationDepartment: Department = isDepartmentReport
    ? safeDepartment
    : {
        ...safeDepartment,
        burnoutScore: average(departments.map((department) => department.burnoutScore)),
        employeeCount: departments.reduce((sum, department) => sum + department.employeeCount, 0),
        fairness: average(departments.map((department) => department.fairness)),
        manager: 'Executive People Team',
        name: 'HappiWork',
        resourceIndex: average(departments.map((department) => department.resourceIndex)),
        riskLevel: departments.some((department) => department.riskLevel === 'Critical') ? 'Critical' : 'High',
        stressScore: average(departments.map((department) => department.stressScore)),
      };

  const department = organizationDepartment;
  const stress10 = Number((department.stressScore * 2).toFixed(1));
  const morale10 = Number(((department.resourceIndex + department.fairness) * 1).toFixed(1));
  const burnoutRisk = clamp(Math.round((department.burnoutScore / 5) * 100), 0, 100);
  const workloadImbalance = clamp(Math.round(42 + department.stressScore * 9 - department.resourceIndex * 4), 24, 82);
  const managerImpact = clamp(Math.round((department.fairness + department.resourceIndex) * 12), 38, 92);
  const trend = buildTrendData(department);
  const emotionData = buildEmotionData(department);
  const negativeEmotion = emotionData.find((item) => item.name === 'Negative')?.value ?? 0;
  const riskRows = getRiskRows(department, departments);
  const topIntervention = content.recommendedActions?.[0] ?? 'targeted workload redesign';
  const warningRiskDepartment = departments.find((item) => item.riskLevel === 'Critical') ?? department;
  const defaultInterventionPlan = {
    shortTerm: [
      `Run focused 1:1 reviews for ${department.name}.`,
      `Reprioritize the highest-pressure workstream.`,
      'Protect deep-work blocks for recovery and delivery.',
    ],
    mediumTerm: [
      'Review workload ownership and role clarity.',
      'Add weekly team feedback and support check-ins.',
      `Track ${topIntervention} adoption with manager follow-up.`,
    ],
    longTerm: [
      'Review resource allocation against demand trends.',
      'Refresh planning cadence for the next operating cycle.',
      'Coach managers on prioritization and recovery norms.',
    ],
  };

  return {
    burnoutRisk,
    department,
    emotionData,
    emotionalThemes: content.emotionalThemes ?? ['Fatigue', 'Time pressure', 'Loss of control'],
    generalAssessment: content.generalAssessment ?? `${department.name} is in a ${department.riskLevel.toLowerCase()} risk state with stress at ${department.stressScore.toFixed(1)}/5 and resource health at ${department.resourceIndex.toFixed(1)}/5.`,
    interventionPlan: content.interventionPlan ?? defaultInterventionPlan,
    isDepartmentReport,
    kpiDeltas: content.kpiDeltas ?? {
      burnout: department.trend === 'up' ? '+12%' : department.trend === 'down' ? '-6%' : '0%',
      morale: department.trend === 'up' ? '-0.2' : '+0.1',
      participation: content.participationDelta ?? '+3%',
      stress: department.trend === 'up' ? '+0.8' : department.trend === 'down' ? '-0.4' : '+0.1',
      workload: department.trend === 'up' ? '+10' : '+2',
    },
    managerImpact,
    managerFeedback: content.managerFeedback ?? [
      'Planning clarity needs attention',
      `Manager impact score: ${managerImpact}/100`,
      'Feedback cadence should be strengthened',
    ],
    morale10,
    negativeEmotion,
    participationRate: content.participationRate ?? clamp(Math.round(72 + department.resourceIndex * 5), 60, 96),
    period: formatPeriod(report, content),
    riskRows,
    summary: content.summary ?? `AI analysis indicates that ${department.name} has a ${department.riskLevel.toLowerCase()} risk pattern connected to stress, workload, and resource availability.`,
    stress10,
    trendCaption: content.trendCaption ?? 'Peaks correlate with concentrated deadline periods and resource bottlenecks.',
    trend,
    warnings: content.warnings ?? [
      { body: `Stress score is ${department.stressScore.toFixed(1)}/5 in the latest snapshot.`, risk: department.riskLevel, title: 'Elevated stress pattern' },
      { body: `Resource index is ${department.resourceIndex.toFixed(1)}/5, indicating recovery buffer pressure.`, risk: department.resourceIndex < 2.8 ? 'High' : 'Moderate', title: 'Recovery buffer pressure' },
      { body: `${warningRiskDepartment.name} reports the highest workload-related exposure among peer teams.`, risk: 'Moderate', title: 'Workload imbalance' },
    ],
    workloadImbalance,
  };
};

const MetricTile = ({ label, tone, value }: { label: string; tone?: string; value: string }) => (
  <div className="rounded-md bg-slate-50 p-4">
    <p className="text-[11px] font-medium text-slate-500">{label}</p>
    <p className={`mt-2 text-2xl font-bold ${tone ?? 'text-slate-900'}`}>{value}</p>
  </div>
);

const Section = ({ children, title }: React.PropsWithChildren<{ title: string }>) => (
  <section className="rounded-lg border border-slate-200 bg-white">
    <div className="border-b border-slate-200 px-5 py-4">
      <h3 className="text-base font-black uppercase tracking-tight text-slate-900">{title}</h3>
    </div>
    <div className="p-5">{children}</div>
  </section>
);

export function InsightReportDocument({ departments, onPrint, report }: InsightReportDocumentProps) {
  const model = React.useMemo(() => buildReportModel(report, departments), [departments, report]);
  const { department } = model;

  return (
    <article className="print-report-root mx-auto max-w-[1160px] bg-[#f4f6f9] p-4 text-slate-900 sm:p-6">
      <div className="print-hidden mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-slate-500">
          <button className="rounded-md p-2 hover:bg-white" aria-label="Share report">
            <Share2 className="h-4 w-4" />
          </button>
          <button className="rounded-md p-2 hover:bg-white" aria-label="Download report PDF" onClick={onPrint}>
            <Download className="h-4 w-4" />
          </button>
          <button className="rounded-md p-2 hover:bg-white" aria-label="Print report" onClick={onPrint}>
            <Printer className="h-4 w-4" />
          </button>
        </div>
      </div>

      <header className="mb-5">
        <h1 className="text-3xl font-black tracking-tight text-slate-950">
          {model.isDepartmentReport ? 'Department Status Report' : 'Organization Status Report'}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          A comprehensive overview of {department.name} wellbeing, workload, and organizational health signals.
        </p>
      </header>

      <section className="mb-5 rounded-lg border border-slate-200 bg-white">
        <div className="grid grid-cols-1 divide-y divide-slate-200 md:grid-cols-3 md:divide-x md:divide-y-0">
          <div className="p-4">
            <p className="text-[11px] font-semibold text-slate-500">Department</p>
            <p className="mt-2 text-sm font-bold text-slate-900">{department.name}</p>
          </div>
          <div className="p-4">
            <p className="text-[11px] font-semibold text-slate-500">Period</p>
            <p className="mt-2 text-sm font-bold text-slate-900">{model.period}</p>
          </div>
          <div className="p-4">
            <p className="text-[11px] font-semibold text-slate-500">Number of Employees</p>
            <p className="mt-2 text-sm font-bold text-slate-900">{department.employeeCount}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 divide-y divide-slate-200 border-t border-slate-200 md:grid-cols-2 md:divide-x md:divide-y-0">
          <div className="p-4">
            <p className="text-[11px] font-semibold text-slate-500">Department Manager</p>
            <p className="mt-2 text-sm font-bold text-slate-900">{department.manager}</p>
          </div>
          <div className="p-4">
            <p className="text-[11px] font-semibold text-slate-500">Report Prepared by</p>
            <p className="mt-2 text-sm font-bold text-slate-900">{report.author}</p>
          </div>
        </div>
      </section>

      <div className="report-body-grid grid grid-cols-1 gap-5 lg:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          <Section title="General Situation Summary">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              <MetricTile label="Avg. Stress Score" tone="text-red-500" value={`${model.stress10}/10`} />
              <MetricTile label="Burnout Risk" tone="text-red-500" value={`${department.riskLevel}`} />
              <MetricTile label="Workload Imbalance" tone="text-amber-500" value={`${model.workloadImbalance}%`} />
              <MetricTile label="Emotional Volatility" tone="text-amber-500" value={model.negativeEmotion > 44 ? 'High' : 'Moderate'} />
              <MetricTile label="Working Hours" tone="text-red-500" value={`+${Math.round(model.stress10 + 6)}%`} />
              <MetricTile label="Morale Score" tone="text-emerald-500" value={`${model.morale10}/10`} />
            </div>
            <div className="mt-4 border-l-4 border-red-400 bg-red-50 px-4 py-3 text-xs leading-relaxed text-slate-700">
              {model.summary}
            </div>
          </Section>

          <Section title="Key Performance Indicators">
            <div className="overflow-hidden rounded-md border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[10px] uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Indicator</th>
                    <th className="px-4 py-3">Value</th>
                    <th className="px-4 py-3">Change vs. last month</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="px-4 py-3 font-semibold text-slate-700">Average Stress Score</td>
                    <td className="px-4 py-3 font-bold text-red-500">{model.stress10} / 10</td>
                    <td className="px-4 py-3 font-semibold text-red-500">{model.kpiDeltas.stress}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-semibold text-slate-700">Burnout Risk</td>
                    <td className="px-4 py-3 font-bold text-red-500">{model.burnoutRisk}% ({department.riskLevel})</td>
                    <td className="px-4 py-3 font-semibold text-red-500">{model.kpiDeltas.burnout}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-semibold text-slate-700">Workload Index</td>
                    <td className="px-4 py-3 font-bold text-amber-500">{Math.round(model.workloadImbalance * 2.1)}</td>
                    <td className="px-4 py-3 font-semibold text-amber-500">{model.kpiDeltas.workload}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-semibold text-slate-700">Morale Score</td>
                    <td className="px-4 py-3 font-bold text-emerald-500">{model.morale10} / 10</td>
                    <td className="px-4 py-3 text-slate-500">{model.kpiDeltas.morale}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-semibold text-slate-700">Daily Mood Check-in Participation</td>
                    <td className="px-4 py-3 font-bold text-slate-900">{model.participationRate}%</td>
                    <td className="px-4 py-3 font-semibold text-emerald-500">{model.kpiDeltas.participation}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="AI Trend Analysis">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-[1.2fr_0.8fr]">
              <div>
                <h4 className="mb-3 text-sm font-bold text-slate-800">Stress Trend Analysis (Last 6 Weeks)</h4>
                <div className="h-[220px] min-h-[220px]">
                  <ResponsiveContainer height={220} width="100%">
                    <LineChart data={model.trend} margin={{ bottom: 8, left: 0, right: 14, top: 14 }}>
                      <XAxis axisLine={false} dataKey="week" fontSize={10} tickLine={false} />
                      <YAxis axisLine={false} domain={[1, 5]} fontSize={10} tickLine={false} width={24} />
                      <RechartsTooltip />
                      <Line dataKey="stress" dot={{ r: 3 }} name="Stress" stroke="#f87171" strokeWidth={2} type="monotone" />
                      <Line dataKey="burnout" dot={{ r: 3 }} name="Burnout" stroke="#fb7185" strokeWidth={2} type="monotone" />
                      <Line dataKey="resources" dot={{ r: 3 }} name="Resources" stroke="#22c55e" strokeWidth={2} type="monotone" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">
                  {model.trendCaption}
                </p>
              </div>
              <div>
                <h4 className="mb-3 text-sm font-bold text-slate-800">Emotion Analysis (AI Tracking)</h4>
                <div className="h-[190px] min-h-[190px]">
                  <ResponsiveContainer height={190} width="100%">
                    <PieChart>
                      <Pie
                        cx="50%"
                        cy="50%"
                        data={model.emotionData}
                        dataKey="value"
                        innerRadius={48}
                        outerRadius={70}
                        paddingAngle={2}
                      >
                        {model.emotionData.map((entry) => (
                          <Cell fill={entry.color} key={entry.name} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                  {model.emotionData.map((entry) => (
                    <div key={entry.name}>
                      <span className="mx-auto mb-1 block h-2 w-2 rounded-full" style={{ background: entry.color }} />
                      <p className="font-semibold text-slate-600">{entry.name}</p>
                      <p className="font-black text-slate-900">{entry.value}%</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-center text-xs">
                  <p className="font-semibold text-slate-600">Main Emotional Themes:</p>
                  <p className="mt-2 font-black text-red-500">{model.emotionalThemes.join(' - ')}</p>
                </div>
              </div>
            </div>
          </Section>

          <Section title="HappiWork - Recommended Intervention Plan">
            <div className="intervention-plan-grid grid grid-cols-1 gap-5 text-sm md:grid-cols-3">
              <div>
                <h4 className="font-black text-blue-700">Short-Term (0-2 weeks)</h4>
                <ul className="mt-3 list-disc space-y-2 pl-4 text-xs leading-relaxed text-slate-600">
                  {model.interventionPlan.shortTerm.map((item: string) => <li key={item}>{item}</li>)}
                </ul>
              </div>
              <div>
                <h4 className="font-black text-blue-700">Medium-Term (2-8 weeks)</h4>
                <ul className="mt-3 list-disc space-y-2 pl-4 text-xs leading-relaxed text-slate-600">
                  {model.interventionPlan.mediumTerm.map((item: string) => <li key={item}>{item}</li>)}
                </ul>
              </div>
              <div>
                <h4 className="font-black text-blue-700">Long-Term Strategic</h4>
                <ul className="mt-3 list-disc space-y-2 pl-4 text-xs leading-relaxed text-slate-600">
                  {model.interventionPlan.longTerm.map((item: string) => <li key={item}>{item}</li>)}
                </ul>
              </div>
            </div>
          </Section>
        </div>

        <aside className="space-y-5">
          <Section title="Critical Early Warning Signals">
            <div className="space-y-3">
              {model.warnings.map(({ title, body, risk }: { title: string; body: string; risk: RiskLevel }) => (
                <div className={`rounded-md border-l-4 p-3 ${riskAccentClass[risk as RiskLevel]}`} key={title}>
                  <div className="flex gap-3">
                    <span className={`mt-1 h-3 w-3 shrink-0 rounded-full ${risk === 'Critical' ? 'bg-red-500' : risk === 'High' ? 'bg-orange-400' : 'bg-amber-400'}`} />
                    <div>
                      <p className="text-xs font-black text-slate-900">{title}</p>
                      <p className="mt-1 text-[11px] leading-relaxed text-slate-600">{body}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Risk Map (Interdepartmental Sub-Teams)">
            <div className="overflow-hidden rounded-md border border-slate-200">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-slate-50 uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Sub-Team</th>
                    <th className="px-3 py-2">Stress</th>
                    <th className="px-3 py-2">Burnout</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {model.riskRows.map((row) => (
                    <tr key={row.team}>
                      <td className="px-3 py-3 font-semibold text-slate-700">{row.team}</td>
                      <td className="px-3 py-3">
                        <span className={`rounded px-2 py-1 font-bold ${row.stress === 'High' ? 'bg-red-100 text-red-600' : row.stress === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {row.stress}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`rounded px-2 py-1 font-bold ${row.burnout === 'High' ? 'bg-red-100 text-red-600' : row.burnout === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {row.burnout}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="Manager Impact Analysis">
            <p className="text-[11px] font-semibold text-slate-500">Manager Impact Score</p>
            <p className="mt-2 text-4xl font-black text-amber-500">{model.managerImpact}<span className="text-base text-slate-400">/100</span></p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-amber-400" style={{ width: `${model.managerImpact}%` }} />
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              {model.managerFeedback[0]}
            </p>
            <div className="mt-5 rounded-md bg-slate-50 p-4 text-center">
              <p className="text-xs font-black text-slate-700">Anonymous Manager Feedback</p>
              <p className="mt-4 text-lg font-black text-red-500">{model.managerFeedback[1]}</p>
              <p className="mt-2 text-sm font-bold text-slate-800">{model.managerFeedback[2]}</p>
              <p className="mt-2 text-xs font-semibold text-slate-500">{model.managerFeedback[3] ?? model.summary}</p>
            </div>
          </Section>

          <div className="rounded-lg border-l-4 border-blue-700 bg-blue-50 p-5">
            <h3 className="text-sm font-black uppercase text-blue-700">General Assessment</h3>
            <p className="mt-3 text-xs leading-relaxed text-slate-700">
              {model.generalAssessment}
            </p>
          </div>
        </aside>
      </div>
    </article>
  );
}
