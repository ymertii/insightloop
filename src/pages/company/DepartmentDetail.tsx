import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Progress } from '../../components/ui/Progress';
import { ArrowLeft, Download, Share2, BrainCircuit, Activity, ChevronDown, ChevronUp, CheckCircle2, Users, Search, Edit2, Trash2, FileText, Loader2, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import { useStore } from '../../store/useStore';
import { createEmployee, deleteEmployee, getDepartmentEmployees, getDepartmentMetricTimeseries, getDepartmentRadar, getDepartments, updateEmployee } from '../../lib/api';
import type { Department, Employee, RadarMetric, TrendPoint } from '../../types/domain';

export default function DepartmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showMethodology, setShowMethodology] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'insights' | 'employees'>('insights');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [fullTimeSeriesData, setFullTimeSeriesData] = useState<TrendPoint[]>([]);
  const [radarData, setRadarData] = useState<RadarMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [timeRange, setTimeRange] = useState('6M');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isSavingEmployee, setIsSavingEmployee] = useState(false);
  
  const [isAddEmpModalOpen, setIsAddEmpModalOpen] = useState(false);
  const [newEmpForm, setNewEmpForm] = useState({ name: '', email: '', role: '', phone: '' });

  const loadDepartmentData = React.useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const loadedDepartments = await getDepartments();
      const selectedDepartment = loadedDepartments.find(d => d.id === id) || loadedDepartments.find(d => d.name === 'DevOps');
      const [loadedEmployees, loadedTimeSeries, loadedRadar] = selectedDepartment
        ? await Promise.all([
            getDepartmentEmployees(selectedDepartment.id),
            getDepartmentMetricTimeseries(selectedDepartment),
            getDepartmentRadar(selectedDepartment),
          ])
        : [[], [], []];

      setDepartments(loadedDepartments);
      setEmployees(loadedEmployees);
      setFullTimeSeriesData(loadedTimeSeries);
      setRadarData(loadedRadar);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Unable to load department details.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    void loadDepartmentData();
  }, [loadDepartmentData]);

  const dept = departments.find(d => d.id === id) || departments.find(d => d.name === 'DevOps');
  const addReport = useStore((state) => state.addReport);

  const handleGenerateReport = async () => {
    if (!dept) {
      return;
    }

    setIsGeneratingReport(true);

    try {
      await addReport({
        id: `DEPT-${Date.now()}`,
        title: `${dept.name} Diagnostic`,
        type: 'Department Diagnostic',
        scope: `${dept.name} Department`,
        date: new Date().toISOString().split('T')[0],
        author: 'AI Narrative Engine',
        status: 'Published',
        category: 'Department'
      });
      navigate('/company/reports');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Unable to generate department report.');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleDeleteEmployee = async (employee: Employee) => {
    if (!window.confirm('Are you sure you want to remove this employee?')) return;

    await deleteEmployee(employee.id);
    setEmployees((currentEmployees) => currentEmployees.filter((item) => item.id !== employee.id));
  };

  const handleUpdateEmployee = async () => {
    if (!editingEmployee) return;

    setIsSavingEmployee(true);
    try {
      const savedEmployee = await updateEmployee(editingEmployee.id, editingEmployee);
      setEmployees((currentEmployees) => currentEmployees.map((employee) => (
        employee.id === savedEmployee.id ? savedEmployee : employee
      )));
      setEditingEmployee(null);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Unable to update employee.');
    } finally {
      setIsSavingEmployee(false);
    }
  };

  const handleCreateEmployee = async () => {
    if (!dept) return;
    if (!newEmpForm.name.trim() || !newEmpForm.email.trim() || !newEmpForm.role.trim()) {
      alert('Please enter employee name, email, and role.');
      return;
    }

    setIsSavingEmployee(true);
    try {
      const savedEmployee = await createEmployee({
        name: newEmpForm.name.trim(),
        email: newEmpForm.email.trim(),
        role: newEmpForm.role.trim(),
        phone: newEmpForm.phone.trim(),
        departmentId: dept.id,
      });
      setEmployees((currentEmployees) => [...currentEmployees, savedEmployee]);
      setIsAddEmpModalOpen(false);
      setNewEmpForm({ name: '', email: '', role: '', phone: '' });
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Unable to save employee.');
    } finally {
      setIsSavingEmployee(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/company/departments')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Department Details</h2>
            <p className="text-muted-foreground text-sm mt-1">Loading department data...</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-8 flex items-center justify-center text-muted-foreground">
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Loading department details...
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/company/departments')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Department Details</h2>
            <p className="text-muted-foreground text-sm mt-1">The department data could not be loaded.</p>
          </div>
        </div>
        <Card className="border-destructive/30">
          <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground">Unable to load department details</h3>
                <p className="text-sm text-muted-foreground mt-1">{loadError}</p>
              </div>
            </div>
            <Button variant="outline" onClick={loadDepartmentData}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!dept) return <div>Department not found</div>;

  // Mock department-specific recommendations based on the prompt's logic
  const getRecommendations = (deptName: string) => {
    let baseRecs = [];
    if (deptName === 'DevOps') {
      baseRecs = [
        {
          id: '1',
          title: 'Workload Redesign and Redistribution',
          rationale: 'Recommended because this department shows high emotional exhaustion, strong workload pressure, and weak recovery capacity.',
          impact: 'High',
          effort: 'Medium',
          cost: '$$$',
          owner: 'Department Manager + HRBP',
          timeline: '4–6 weeks',
          reviewDate: '30 days after launch'
        },
        {
          id: '2',
          title: 'Recovery Boundary Policies',
          rationale: 'Addresses the inability to disconnect after hours, which is driving the high stress score.',
          impact: 'Medium',
          effort: 'Low',
          cost: '$',
          owner: 'Department Manager',
          timeline: '2 weeks',
          reviewDate: '14 days after launch'
        },
        {
          id: '3',
          title: 'Process Redesign (CI/CD Pipeline)',
          rationale: 'Reduces manual toil and cognitive load, directly targeting the root cause of workload strain.',
          impact: 'High',
          effort: 'High',
          cost: '$$$$',
          owner: 'VP of Engineering',
          timeline: '3 months',
          reviewDate: '60 days after launch'
        }
      ];
    } else if (deptName === 'Business Development') {
      baseRecs = [
        {
          id: '1',
          title: 'Recognition Program Redesign',
          rationale: 'Directly addresses the critically low fairness perception and reward deficit in this department.',
          impact: 'High',
          effort: 'Medium',
          cost: '$$',
          owner: 'HRBP + Sales Leadership',
          timeline: '4 weeks',
          reviewDate: '30 days after launch'
        },
        {
          id: '2',
          title: 'Transparent Commission Communication',
          rationale: 'Improves role clarity and fairness perception regarding compensation structures.',
          impact: 'Medium',
          effort: 'Low',
          cost: '$',
          owner: 'Sales Ops',
          timeline: '2 weeks',
          reviewDate: '14 days after launch'
        }
      ];
    }

    const defaultRecs = [
      {
        id: 'default-1',
        title: 'Managerial Coaching and Leadership Training',
        rationale: 'Equipping leaders with skills to support team wellbeing and recognize burnout.',
        impact: 'High',
        effort: 'Medium',
        cost: '$$',
        owner: 'HR L&D',
        timeline: '6 weeks',
        reviewDate: '30 days after launch'
      },
      {
        id: 'default-2',
        title: 'Flexible Work Policies',
        rationale: 'Allowing employees autonomy over when and where they work reduces stress.',
        impact: 'High',
        effort: 'Low',
        cost: '$',
        owner: 'HR + Exec Team',
        timeline: '3 weeks',
        reviewDate: '30 days after launch'
      },
      {
        id: 'default-3',
        title: 'Peer Support Networks',
        rationale: 'Creating formal and informal networks for peer-to-peer support.',
        impact: 'Medium',
        effort: 'Low',
        cost: '$',
        owner: 'Department Heads',
        timeline: '4 weeks',
        reviewDate: '60 days after launch'
      },
      {
        id: 'default-4',
        title: 'Workload Restructuring',
        rationale: 'Changing team compositions and clarifying role boundaries.',
        impact: 'High',
        effort: 'High',
        cost: '$$$',
        owner: 'Operations',
        timeline: '2 months',
        reviewDate: '90 days after launch'
      },
      {
        id: 'default-5',
        title: 'Role Clarity Initiative',
        rationale: 'Updating and clarifying expectations for all roles to reduce confusion and anxiety.',
        impact: 'Medium',
        effort: 'Medium',
        cost: '$$',
        owner: 'HR + Managers',
        timeline: '6 weeks',
        reviewDate: '30 days after launch'
      }
    ];

    // Combine base with defaults to ensure we always have 5
    const combined = [...baseRecs];
    let i = 0;
    while (combined.length < 5 && i < defaultRecs.length) {
      if (!combined.some(r => r.title === defaultRecs[i].title)) {
        combined.push({ ...defaultRecs[i], id: (combined.length + 1).toString() });
      }
      i++;
    }
    return combined;
  };

  const recommendations = getRecommendations(dept.name);

  const timeSeriesData = timeRange === '3M' ? fullTimeSeriesData.slice(-3) : timeRange === '6M' ? fullTimeSeriesData.slice(-6) : fullTimeSeriesData;

  const handleApproveClick = (action: any) => {
    setSelectedAction(action);
    setShowApproveModal(true);
  };

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/company/departments')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-2xl font-bold tracking-tight">{dept.name}</h2>
              <Badge variant={dept.riskLevel === 'Critical' ? 'destructive' : dept.riskLevel === 'High' ? 'warning' : 'success'} className="text-xs">
                {dept.riskLevel} Risk
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm mt-1">
              Last Survey: Q1 2026 • {dept.employeeCount} Employees
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => alert('Sharing options opened.')}><Share2 className="w-4 h-4 mr-2" /> Share</Button>
          <Button variant="outline" size="sm" onClick={() => alert(`Exporting ${dept.name} data...`)}><Download className="w-4 h-4 mr-2" /> Export Data</Button>
          <Button variant="outline" size="sm" onClick={handleGenerateReport} disabled={isGeneratingReport}>
            {isGeneratingReport ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</> : <><FileText className="w-4 h-4 mr-2" /> Generate Report</>}
          </Button>
          {activeTab === 'insights' && <Button onClick={() => handleApproveClick(recommendations[0])}>Approve Recommended Plan</Button>}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border space-x-6">
        <button 
          className={`py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'insights' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          onClick={() => setActiveTab('insights')}
        >
          Diagnostics & Actions
        </button>
        <button 
          className={`py-2 text-sm font-medium border-b-2 transition-colors flex items-center ${activeTab === 'employees' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          onClick={() => setActiveTab('employees')}
        >
          <Users className="w-4 h-4 mr-2" /> Employee Directory
        </button>
      </div>

      {activeTab === 'insights' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Summary & Drivers */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Department Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <p className="text-sm text-muted-foreground">
                This department is currently operating at a critical risk level, primarily driven by sustained workload pressure and insufficient recovery time, leading to elevated emotional exhaustion.
              </p>
              
              <div className="space-y-4 pt-2">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Burnout Score</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold">{dept.burnoutScore}/5.0</span>
                      <span className="text-xs text-destructive">(+0.4 vs last cycle)</span>
                    </div>
                  </div>
                  <Progress value={(dept.burnoutScore / 5) * 100} indicatorColor={dept.burnoutScore > 3.5 ? 'bg-destructive' : 'bg-amber-500'} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Stress Score</span>
                    <span className="font-bold">{dept.stressScore}/5.0</span>
                  </div>
                  <Progress value={(dept.stressScore / 5) * 100} indicatorColor={dept.stressScore > 3.5 ? 'bg-destructive' : 'bg-amber-500'} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Resource Index</span>
                    <span className="font-bold">{dept.resourceIndex}/5.0</span>
                  </div>
                  <Progress value={(dept.resourceIndex / 5) * 100} indicatorColor={dept.resourceIndex < 2.5 ? 'bg-destructive' : 'bg-emerald-500'} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Fairness Score</span>
                    <span className="font-bold">{dept.fairness}/5.0</span>
                  </div>
                  <Progress value={(dept.fairness / 5) * 100} indicatorColor={dept.fairness < 2.5 ? 'bg-destructive' : 'bg-emerald-500'} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Department Strengths & Risks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full text-foreground/80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="55%" data={radarData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'currentColor', fontSize: 11 }} />
                    <PolarRadiusAxis 
                      angle={30} 
                      domain={[0, 5]} 
                      tickCount={6}
                      tick={{ fill: 'currentColor', fontSize: 10 }} 
                    />
                    <Radar
                      name={dept.name}
                      dataKey="A"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.3}
                    />
                    <RechartsTooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Key Risk Drivers</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                <li className="flex items-start space-x-3">
                  <Activity className="w-5 h-5 text-destructive mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">High Workload Pressure</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Sustained demand exceeding capacity for 3+ months.</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <Activity className="w-5 h-5 text-destructive mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">Low Recovery Capacity</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Inability to disconnect after hours or take meaningful PTO.</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <Activity className="w-5 h-5 text-amber-500 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">Role Ambiguity</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Unclear prioritization leading to conflicting tasks.</p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Center/Right Column: AI Narrative & Actions */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-3">
                <BrainCircuit className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">AI Diagnostic Narrative</h3>
              </div>
              <p className="text-sm text-foreground leading-relaxed">
                Critical workload-related strain detected. The strongest burnout signal in this department is elevated emotional exhaustion combined with low recovery capacity. While community values remain relatively stable, the high workload demand is not matched by sufficient control over schedules or processes. This resource deficit is driving the critical risk classification. Interventions must focus on structural workload reduction rather than individual resilience training.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 border-b border-border flex flex-row justify-between items-center space-y-0">
              <CardTitle>Metric Trends</CardTitle>
              <select 
                value={timeRange} 
                onChange={e => setTimeRange(e.target.value)}
                className="border border-border rounded-md px-2 py-1 text-sm bg-background"
              >
                <option value="3M">Last 3 Months</option>
                <option value="6M">Last 6 Months</option>
                <option value="1Y">Last Year</option>
              </select>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis domain={[0, 5]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <RechartsTooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }} />
                    <Legend />
                    <Line type="monotone" dataKey="stress" name="Stress" stroke="#fbbf24" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="burnout" name="Burnout" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="fairness" name="Fairness" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="resources" name="Resources" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div>
            <h3 className="text-lg font-bold tracking-tight mb-4">Recommended Actions for this Department</h3>
            <div className="space-y-4">
              {recommendations.length > 0 && (
                <>
                  <h4 className="text-sm font-semibold text-primary uppercase tracking-wider">Top Priority</h4>
                  <Card className="border-border hover:border-primary/50 transition-colors overflow-hidden ring-1 ring-primary/20">
                    <div className="flex flex-col md:flex-row">
                      <div className="bg-secondary/50 p-4 flex flex-col justify-center items-center border-b md:border-b-0 md:border-r border-border min-w-[100px]">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Rank</span>
                        <span className="text-3xl font-bold text-primary">#1</span>
                      </div>
                      <div className="p-5 flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-lg font-semibold text-foreground">{recommendations[0].title}</h4>
                          <Button size="sm" onClick={() => handleApproveClick(recommendations[0])}>Approve Plan</Button>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          <span className="font-medium text-foreground">Reason:</span> "{recommendations[0].rationale}"
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                          <div>
                            <span className="block text-xs text-muted-foreground mb-1">Expected Impact</span>
                            <Badge variant={recommendations[0].impact === 'High' ? 'success' : 'secondary'} className="font-normal">{recommendations[0].impact}</Badge>
                          </div>
                          <div>
                            <span className="block text-xs text-muted-foreground mb-1">Effort</span>
                            <span className="font-medium">{recommendations[0].effort}</span>
                          </div>
                          <div>
                            <span className="block text-xs text-muted-foreground mb-1">Estimated Cost</span>
                            <span className="font-medium">{recommendations[0].cost}</span>
                          </div>
                          <div>
                            <span className="block text-xs text-muted-foreground mb-1">Suggested Owner</span>
                            <span className="font-medium">{recommendations[0].owner}</span>
                          </div>
                          <div>
                            <span className="block text-xs text-muted-foreground mb-1">Timeline</span>
                            <span className="font-medium">{recommendations[0].timeline}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </>
              )}

              {recommendations.length > 1 && (
                <>
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mt-6 mb-2">Alternative Actions</h4>
                  {recommendations.slice(1).map((rec, idx) => (
                    <Card key={rec.id} className="border-border hover:border-primary/50 transition-colors overflow-hidden">
                      <div className="flex flex-col md:flex-row">
                        <div className="bg-secondary/20 p-4 flex flex-col justify-center items-center border-b md:border-b-0 md:border-r border-border min-w-[100px]">
                          <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Rank</span>
                          <span className="text-xl font-bold text-muted-foreground">#{idx + 2}</span>
                        </div>
                        <div className="p-4 flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-base font-semibold text-foreground">{rec.title}</h4>
                            <Button size="sm" variant="outline" onClick={() => handleApproveClick(rec)}>Review Plan</Button>
                          </div>
                          <p className="text-sm text-muted-foreground mb-4">
                            <span className="font-medium text-foreground">Reason:</span> "{rec.rationale}"
                          </p>
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                            <div>
                              <span className="block text-muted-foreground mb-1">Expected Impact</span>
                              <Badge variant={rec.impact === 'High' ? 'success' : 'secondary'} className="font-normal text-[10px]">{rec.impact}</Badge>
                            </div>
                            <div>
                              <span className="block text-muted-foreground mb-1">Effort</span>
                              <span className="font-medium">{rec.effort}</span>
                            </div>
                            <div>
                              <span className="block text-muted-foreground mb-1">Estimated Cost</span>
                              <span className="font-medium">{rec.cost}</span>
                            </div>
                            <div>
                              <span className="block text-muted-foreground mb-1">Suggested Owner</span>
                              <span className="font-medium">{rec.owner}</span>
                            </div>
                            <div>
                              <span className="block text-muted-foreground mb-1">Timeline</span>
                              <span className="font-medium">{rec.timeline}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Methodology Accordion */}
          <div className="border border-border rounded-lg bg-card overflow-hidden">
            <button 
              className="w-full flex items-center justify-between p-4 text-sm font-medium text-foreground hover:bg-secondary/30 transition-colors"
              onClick={() => setShowMethodology(!showMethodology)}
            >
              <span>Why these recommendations?</span>
              {showMethodology ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {showMethodology && (
              <div className="p-4 pt-0 text-sm text-muted-foreground border-t border-border bg-secondary/10">
                These recommendations are generated specifically for this department based on its unique patterns of burnout, stress, resource imbalance, and fairness deficits. The system evaluates feasible interventions and prioritizes them based on expected impact and organizational readiness.
              </div>
            )}
          </div>
        </div>
      </div>
      ) : (
        <Card>
          <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
            <div>
              <CardTitle>Employees in {dept.name}</CardTitle>
              <CardDescription>View and manage contact and role information. Individual psychometric data is restricted.</CardDescription>
            </div>
            <div className="flex space-x-2">
               <div className="relative">
                 <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                 <input type="text" placeholder="Search..." className="pl-9 pr-4 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary w-48 lg:w-64 bg-background" />
               </div>
               <Button onClick={() => setIsAddEmpModalOpen(true)}><Users className="w-4 h-4 mr-2" /> Add Employee</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-secondary/50 border-b border-border">
                  <tr>
                    <th className="px-6 py-4 font-medium">Name</th>
                    <th className="px-6 py-4 font-medium">Role</th>
                    <th className="px-6 py-4 font-medium">Email</th>
                    <th className="px-6 py-4 font-medium">Phone</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr key={emp.id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">{emp.name}</td>
                      <td className="px-6 py-4 text-muted-foreground">{emp.role}</td>
                      <td className="px-6 py-4 text-muted-foreground">{emp.email}</td>
                      <td className="px-6 py-4 text-muted-foreground">{emp.phone}</td>
                      <td className="px-6 py-4 text-right">
                         <Button variant="ghost" size="icon" onClick={() => setEditingEmployee({...emp})}>
                           <Edit2 className="w-4 h-4 text-muted-foreground text-center" />
                         </Button>
                         <Button variant="ghost" size="icon" onClick={() => handleDeleteEmployee(emp)}>
                           <Trash2 className="w-4 h-4 text-destructive text-center" />
                         </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Approve Plan Modal */}
      {showApproveModal && selectedAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-lg shadow-2xl border-border">
            <CardHeader className="border-b border-border pb-4">
              <div className="flex justify-between items-center">
                <CardTitle>Approve Action Plan</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setShowApproveModal(false)}>✕</Button>
              </div>
              <CardDescription>Review and assign this intervention for {dept.name}.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Plan Title</label>
                <input type="text" defaultValue={selectedAction.title} className="w-full p-2 rounded-md border border-border bg-background text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Department</label>
                  <input type="text" disabled value={dept.name} className="w-full p-2 rounded-md border border-border bg-secondary/50 text-sm text-muted-foreground" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Owner</label>
                  <input type="text" defaultValue={selectedAction.owner} className="w-full p-2 rounded-md border border-border bg-background text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Due Date</label>
                  <input type="date" className="w-full p-2 rounded-md border border-border bg-background text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">KPI Target</label>
                  <input type="text" placeholder="e.g. Reduce stress by 10%" className="w-full p-2 rounded-md border border-border bg-background text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Notes</label>
                <textarea rows={3} className="w-full p-2 rounded-md border border-border bg-background text-sm resize-none" placeholder="Add implementation notes..."></textarea>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t border-border mt-6">
                <Button variant="outline" onClick={() => setShowApproveModal(false)}>Save Draft</Button>
                <Button onClick={() => {
                  setShowApproveModal(false);
                  navigate('/company/action-plans');
                }}>
                  <CheckCircle2 className="w-4 h-4 mr-2" /> Approve and Track
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Employee Modal */}
      {editingEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-md mx-4 shadow-xl border-border">
            <CardHeader className="border-b border-border pb-4">
              <div className="flex justify-between items-center">
                <CardTitle>Edit Employee Profile</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setEditingEmployee(null)}>✕</Button>
              </div>
              <CardDescription>Update contact and role details.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <input 
                  type="text" 
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={editingEmployee.name}
                  onChange={(e) => setEditingEmployee({...editingEmployee, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <input 
                  type="email" 
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={editingEmployee.email}
                  onChange={(e) => setEditingEmployee({...editingEmployee, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Role / Title</label>
                <input 
                  type="text" 
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={editingEmployee.role}
                  onChange={(e) => setEditingEmployee({...editingEmployee, role: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone</label>
                <input 
                  type="text" 
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={editingEmployee.phone}
                  onChange={(e) => setEditingEmployee({...editingEmployee, phone: e.target.value})}
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t border-border mt-6">
                <Button variant="outline" onClick={() => setEditingEmployee(null)}>Cancel</Button>
                <Button onClick={handleUpdateEmployee} disabled={isSavingEmployee}>
                  {isSavingEmployee ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Employee Modal */}
      {isAddEmpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-md mx-4 shadow-xl border-border">
             <CardHeader className="border-b border-border pb-4">
              <div className="flex justify-between items-center">
                <CardTitle>Add New Employee</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setIsAddEmpModalOpen(false)}>✕</Button>
              </div>
              <CardDescription>Add a new employee to {dept?.name}</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <input 
                  type="text" 
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={newEmpForm.name}
                  onChange={(e) => setNewEmpForm({...newEmpForm, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <input 
                  type="email" 
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={newEmpForm.email}
                  onChange={(e) => setNewEmpForm({...newEmpForm, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Role / Title</label>
                <input 
                  type="text" 
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={newEmpForm.role}
                  onChange={(e) => setNewEmpForm({...newEmpForm, role: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone</label>
                <input 
                  type="text" 
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={newEmpForm.phone}
                  onChange={(e) => setNewEmpForm({...newEmpForm, phone: e.target.value})}
                />
              </div>
              <div className="flex justify-end p-4 border-t border-border mt-4 space-x-2">
                <Button variant="outline" onClick={() => setIsAddEmpModalOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateEmployee} disabled={isSavingEmployee}>
                  {isSavingEmployee ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                  Save
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
