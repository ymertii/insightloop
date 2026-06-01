import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import { useStore } from '../../store/useStore';
import { ArrowUpRight, ArrowDownRight, AlertTriangle, BrainCircuit, Activity, FileText, Loader2 } from 'lucide-react';
import { calculateTopsis, getDepartments, getInterventions, getOrganizationRadar, getOrganizationTrends } from '../../lib/api';
import type { Department, Intervention, RadarMetric, TrendPoint } from '../../types/domain';

export default function Dashboard() {
  const navigate = useNavigate();
  const { ahpWeights, addReport } = useStore();
  const [departments, setDepartments] = React.useState<Department[]>([]);
  const [interventions, setInterventions] = React.useState<Intervention[]>([]);
  const [trendData, setTrendData] = React.useState<TrendPoint[]>([]);
  const [orgRadarData, setOrgRadarData] = React.useState<RadarMetric[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [isGeneratingOrgReport, setIsGeneratingOrgReport] = React.useState(false);
  
  const loadDashboardData = React.useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const [loadedDepartments, loadedInterventions, loadedTrends, loadedRadar] = await Promise.all([
        getDepartments(),
        getInterventions(),
        getOrganizationTrends(),
        getOrganizationRadar(),
      ]);
      setDepartments(loadedDepartments);
      setInterventions(loadedInterventions);
      setTrendData(loadedTrends);
      setOrgRadarData(loadedRadar);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Unable to load company dashboard data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadDashboardData();
  }, [loadDashboardData]);

  const topInterventions = React.useMemo(
    () => calculateTopsis(interventions, ahpWeights).slice(0, 3),
    [interventions, ahpWeights]
  );
  const criticalDepts = departments.filter(d => d.riskLevel === 'Critical').length;

  const handleGenerateOrgReport = async () => {
    setIsGeneratingOrgReport(true);

    try {
      await addReport({
        id: `ORG-${Date.now()}`,
        title: `Organization-Wide Health Summary`,
        type: 'Executive Summary',
        scope: `Company`,
        date: new Date().toISOString().split('T')[0],
        author: 'AI Narrative Engine',
        status: 'Published',
        category: 'Organization'
      });
      navigate('/company/reports');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Unable to generate organization report.');
    } finally {
      setIsGeneratingOrgReport(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Organization Overview</h2>
          <p className="text-muted-foreground">High-level view of company health metrics and predictive risks.</p>
        </div>
        <Button onClick={handleGenerateOrgReport} disabled={isGeneratingOrgReport || isLoading || !!loadError}>
           {isGeneratingOrgReport ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</> : <><FileText className="w-4 h-4 mr-2" /> Generate Org Report</>}
        </Button>
      </div>

      {isLoading && (
        <Card>
          <CardContent className="p-8 flex items-center justify-center text-muted-foreground">
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Loading company dashboard data...
          </CardContent>
        </Card>
      )}

      {!isLoading && loadError && (
        <Card className="border-destructive/30">
          <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground">Unable to load dashboard data</h3>
                <p className="text-sm text-muted-foreground mt-1">{loadError}</p>
              </div>
            </div>
            <Button variant="outline" onClick={loadDashboardData}>Retry</Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && !loadError && (
        <>
      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overall Wellbeing Score</p>
                <h3 className="text-3xl font-bold mt-2">68/100</h3>
              </div>
              <div className="p-2 bg-destructive/10 rounded-lg">
                <ArrowDownRight className="w-5 h-5 text-destructive" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">-4 pts from last quarter</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Burnout Score</p>
                <h3 className="text-3xl font-bold mt-2">3.2<span className="text-lg text-muted-foreground">/5</span></h3>
              </div>
              <div className="p-2 bg-destructive/10 rounded-lg">
                <ArrowUpRight className="w-5 h-5 text-destructive" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">High Risk Threshold: 3.0</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Fairness Index</p>
                <h3 className="text-3xl font-bold mt-2">2.8<span className="text-lg text-muted-foreground">/5</span></h3>
              </div>
              <div className="p-2 bg-destructive/10 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
            </div>
            <p className="text-sm text-destructive mt-4 font-medium">Weakest Resource Dimension</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Critical Departments</p>
                <h3 className="text-3xl font-bold mt-2">{criticalDepts}</h3>
              </div>
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <Activity className="w-5 h-5 text-amber-500" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">Out of {departments.length} total departments</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Metric Trends</CardTitle>
            <CardDescription>Organizational averages over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} domain={[2, 5]} />
                  <RechartsTooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }} />
                  <Legend />
                  <ReferenceLine y={3.0} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'High Risk', fill: '#ef4444', fontSize: 12 }} />
                  <Line type="monotone" dataKey="stress" stroke="#fbbf24" strokeWidth={2} dot={{ r: 4 }} name="Stress" />
                  <Line type="monotone" dataKey="workload" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} name="Workload" />
                  <Line type="monotone" dataKey="burnout" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} name="Burnout" />
                  <Line type="monotone" dataKey="fairness" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="Fairness" />
                  <Line type="monotone" dataKey="resources" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} name="Resources" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* AI Recommendations */}
        <Card className="border-primary/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <BrainCircuit className="w-5 h-5 text-primary" />
              <CardTitle>AI Recommended Actions</CardTitle>
            </div>
            <CardDescription>Based on TOPSIS ranking & current AHP weights</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {topInterventions.map((inv, idx) => (
              <div key={inv.id} className="p-3 rounded-lg bg-secondary/50 border border-border">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-sm font-semibold">#{idx + 1} {inv.title}</span>
                  <Badge variant="outline" className="text-xs bg-background">{inv.closenessCoefficient}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Addresses high workload demands. High impact outweighs cost under current criteria.
                </p>
              </div>
            ))}
            <Button className="w-full mt-2" variant="outline" onClick={() => navigate('/company/action-plans')}>
              Review Action Plans
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Org Strengths & Risks */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle>Organization Strengths & Risks</CardTitle>
            <CardDescription>Aggregated metrics across all departments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full text-foreground/80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="55%" data={orgRadarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'currentColor', fontSize: 11 }} />
                  <PolarRadiusAxis 
                    angle={30} 
                    domain={[0, 5]} 
                    tickCount={6}
                    tick={{ fill: 'currentColor', fontSize: 10 }} 
                  />
                  <Radar
                    name="Organization Average"
                    dataKey="A"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.3}
                  />
                  <RechartsTooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Heatmap Mini */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Organization Heatmap</CardTitle>
              <CardDescription>Departmental risk distribution</CardDescription>
            </div>
            <Button onClick={() => navigate('/company/departments')}>Review Critical Departments &rarr;</Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {departments.map(dept => (
                <div 
                  key={dept.id} 
                  onClick={() => navigate(`/company/departments/${dept.id}`)}
                  className={`p-3 rounded-lg border cursor-pointer transition-transform hover:scale-105 ${
                    dept.riskLevel === 'Critical' ? 'bg-destructive/20 border-destructive/50 text-destructive-foreground' :
                    dept.riskLevel === 'High' ? 'bg-amber-500/20 border-amber-500/50 text-amber-500' :
                    'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                  }`}
                >
                  <div className="text-xs font-semibold truncate mb-1">{dept.name}</div>
                  <div className="text-2xl font-bold">{dept.burnoutScore}</div>
                  <div className="text-[10px] uppercase tracking-wider opacity-80">{dept.riskLevel}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
        </>
      )}
    </div>
  );
}
