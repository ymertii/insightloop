import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Download, Filter, AlertCircle, X, Save, Plus, Users, Loader2 } from 'lucide-react';
import { createDepartment, createEmployee, getActionPlans, getDepartments } from '../../lib/api';
import type { ActionPlan, Department } from '../../types/domain';

export default function Departments() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [actionPlans, setActionPlans] = useState<ActionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filter, setFilter] = useState('All');
  const loadRequestId = React.useRef(0);
  
  const [isAddDeptModalOpen, setIsAddDeptModalOpen] = useState(false);
  const [newDeptForm, setNewDeptForm] = useState({ name: '', manager: '' });
  const [isSavingDepartment, setIsSavingDepartment] = useState(false);

  const [isAddEmpModalOpen, setIsAddEmpModalOpen] = useState(false);
  const [newEmpForm, setNewEmpForm] = useState({ name: '', email: '', role: '', phone: '', department: '' });
  const [isSavingEmployee, setIsSavingEmployee] = useState(false);

  const loadDepartments = React.useCallback(async () => {
    const requestId = loadRequestId.current + 1;
    loadRequestId.current = requestId;
    setIsLoading(true);
    setLoadError(null);

    try {
      const [loadedDepartments, loadedActionPlans] = await Promise.all([
        getDepartments(),
        getActionPlans(),
      ]);
      if (loadRequestId.current !== requestId) {
        return;
      }
      setDepartments(loadedDepartments);
      setActionPlans(loadedActionPlans);
    } catch (error) {
      if (loadRequestId.current !== requestId) {
        return;
      }
      setLoadError(error instanceof Error ? error.message : 'Unable to load department data.');
    } finally {
      if (loadRequestId.current === requestId) {
        setIsLoading(false);
      }
    }
  }, []);

  React.useEffect(() => {
    void loadDepartments();
  }, [loadDepartments]);

  const filteredDepts = filter === 'All' 
    ? departments 
    : departments.filter(d => d.riskLevel === filter);
  const fairnessDeficitDept = [...departments].sort((a, b) => a.fairness - b.fairness)[0];
  const strongestBufferDept = [...departments]
    .filter((department) => department.riskLevel !== 'Critical')
    .sort((a, b) => (b.resourceIndex + b.fairness) - (a.resourceIndex + a.fairness))[0];

  const getDepartmentActionStatus = (dept: Department): { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' } => {
    const relatedPlan = actionPlans.find((plan) => (
      plan.departmentId === dept.dbId || plan.department === dept.name
    ));

    if (relatedPlan) {
      if (relatedPlan.status === 'Completed') return { label: 'Completed', variant: 'success' };
      if (relatedPlan.status === 'In Progress') return { label: 'In Progress', variant: 'success' };
      if (relatedPlan.status === 'Approved') return { label: 'Approved Plan', variant: 'default' };
      if (relatedPlan.status === 'On Hold') return { label: 'On Hold', variant: 'secondary' };
      return { label: relatedPlan.status, variant: 'outline' };
    }

    if (dept.riskLevel === 'Critical') return { label: 'Recommendation Required', variant: 'destructive' };
    if (dept.riskLevel === 'High') return { label: 'Recommendation Ready', variant: 'warning' };
    return { label: 'Monitoring', variant: 'secondary' };
  };

  const handleExport = () => {
    const rows = [
      ['Department', 'Manager', 'Headcount', 'Burnout Score', 'Stress Score', 'Resource Index', 'Fairness', 'Risk Level', 'Action Status'],
      ...filteredDepts.map((dept) => {
        const actionStatus = getDepartmentActionStatus(dept);
        return [
          dept.name,
          dept.manager,
          String(dept.employeeCount),
          String(dept.burnoutScore),
          String(dept.stressScore),
          String(dept.resourceIndex),
          String(dept.fairness),
          dept.riskLevel,
          actionStatus.label,
        ];
      }),
    ];
    const csv = rows
      .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `insightloop-departments-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveDepartment = async () => {
    if (!newDeptForm.name.trim() || !newDeptForm.manager.trim()) {
      alert('Please enter a department name and manager.');
      return;
    }

    setIsSavingDepartment(true);

    try {
      const savedDepartment = await createDepartment({
        name: newDeptForm.name.trim(),
        manager: newDeptForm.manager.trim(),
      });

      loadRequestId.current += 1;
      setDepartments((currentDepartments) => (
        currentDepartments.some((department) => department.id === savedDepartment.id)
          ? currentDepartments.map((department) => department.id === savedDepartment.id ? savedDepartment : department)
          : [...currentDepartments, savedDepartment]
      ));
      setIsAddDeptModalOpen(false);
      setNewDeptForm({ name: '', manager: '' });
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Unable to save department.');
    } finally {
      setIsSavingDepartment(false);
    }
  };

  const handleSaveEmployee = async () => {
    const selectedDepartment = departments.find((department) => (
      department.id === newEmpForm.department || department.name === newEmpForm.department
    ));

    if (!newEmpForm.name.trim() || !newEmpForm.email.trim() || !newEmpForm.role.trim() || !selectedDepartment) {
      alert('Please enter employee details and select a department.');
      return;
    }

    setIsSavingEmployee(true);

    try {
      await createEmployee({
        name: newEmpForm.name.trim(),
        email: newEmpForm.email.trim(),
        role: newEmpForm.role.trim(),
        phone: newEmpForm.phone.trim(),
        departmentId: selectedDepartment.id,
      });

      loadRequestId.current += 1;
      setDepartments((currentDepartments) => currentDepartments.map((department) => (
        department.id === selectedDepartment.id
          ? { ...department, employeeCount: department.employeeCount + 1 }
          : department
      )));
      setIsAddEmpModalOpen(false);
      setNewEmpForm({ name: '', email: '', role: '', phone: '', department: '' });
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Unable to save employee.');
    } finally {
      setIsSavingEmployee(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Departmental Heatmap</h2>
          <p className="text-muted-foreground">Compare risk levels, stressors, and resources across the organization.</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setIsAddEmpModalOpen(true)}><Users className="w-4 h-4 mr-2" /> Add Employee</Button>
          <Button onClick={() => setIsAddDeptModalOpen(true)}><Plus className="w-4 h-4 mr-2" /> Add Department</Button>
          <Button variant="outline"><Filter className="w-4 h-4 mr-2" /> Filter</Button>
          <Button variant="outline" onClick={handleExport}><Download className="w-4 h-4 mr-2" /> Export</Button>
        </div>
      </div>

      <div className="flex space-x-2 mb-4">
        {['All', 'Critical', 'High', 'Moderate', 'Low'].map(level => (
          <Badge 
            key={level}
            variant={filter === level ? 'default' : 'outline'}
            className="cursor-pointer px-3 py-1 text-sm"
            onClick={() => setFilter(level)}
          >
            {level}
          </Badge>
         ))}
      </div>

      {isLoading && (
        <Card>
          <CardContent className="p-8 flex items-center justify-center text-muted-foreground">
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Loading departments...
          </CardContent>
        </Card>
      )}

      {!isLoading && loadError && (
        <Card className="border-destructive/30">
          <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground">Unable to load departments</h3>
                <p className="text-sm text-muted-foreground mt-1">{loadError}</p>
              </div>
            </div>
            <Button variant="outline" onClick={loadDepartments}>Retry</Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && !loadError && (
        <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-secondary/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Department</th>
                <th className="px-6 py-4 font-medium">Manager</th>
                <th className="px-6 py-4 font-medium">Headcount</th>
                <th className="px-6 py-4 font-medium">Burnout Score</th>
                <th className="px-6 py-4 font-medium">Stress Score</th>
                <th className="px-6 py-4 font-medium">Resource Index</th>
                <th className="px-6 py-4 font-medium">Fairness</th>
                <th className="px-6 py-4 font-medium">Risk Level</th>
                <th className="px-6 py-4 font-medium">Action Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredDepts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-muted-foreground">
                    No departments match the selected filter.
                  </td>
                </tr>
              ) : filteredDepts.map((dept) => {
                const actionStatus = getDepartmentActionStatus(dept);

                return (
                  <tr 
                    key={dept.id} 
                    onClick={() => navigate(`/company/departments/${dept.id}`)}
                    className="border-b border-border hover:bg-secondary/30 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-foreground">{dept.name}</td>
                    <td className="px-6 py-4 text-muted-foreground">{dept.manager}</td>
                    <td className="px-6 py-4">{dept.employeeCount}</td>
                    <td className="px-6 py-4">
                      <span className={`font-semibold ${dept.burnoutScore >= 3.5 ? 'text-destructive' : dept.burnoutScore >= 3.0 ? 'text-amber-500' : 'text-emerald-500'}`}>
                        {dept.burnoutScore}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-semibold ${dept.stressScore >= 3.5 ? 'text-destructive' : dept.stressScore >= 3.0 ? 'text-amber-500' : 'text-emerald-500'}`}>
                        {dept.stressScore}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-semibold ${dept.resourceIndex <= 2.5 ? 'text-destructive' : dept.resourceIndex <= 3.0 ? 'text-amber-500' : 'text-emerald-500'}`}>
                        {dept.resourceIndex}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-semibold ${dept.fairness <= 2.5 ? 'text-destructive' : dept.fairness <= 3.0 ? 'text-amber-500' : 'text-emerald-500'}`}>
                        {dept.fairness}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={
                        dept.riskLevel === 'Critical' ? 'destructive' : 
                        dept.riskLevel === 'High' ? 'warning' : 'success'
                      }>
                        {dept.riskLevel}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={actionStatus.variant} className="whitespace-nowrap">
                        {actionStatus.label}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <Card className="bg-destructive/5 border-destructive/20">
          <CardContent className="p-4 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm text-destructive">High Stress Pattern Detected</h4>
              <p className="text-xs text-muted-foreground mt-1">
                {departments
                  .filter((department) => department.riskLevel === 'Critical')
                  .slice(0, 2)
                  .map((department) => department.name)
                  .join(' and ') || 'Critical departments'} show correlated spikes in stress and workload demands.
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/5 border-amber-500/20">
          <CardContent className="p-4 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm text-amber-500">Fairness Deficit</h4>
              <p className="text-xs text-muted-foreground mt-1">
                {fairnessDeficitDept?.name ?? 'The lowest-scoring department'} reports the lowest fairness score at {fairnessDeficitDept?.fairness ?? 0}/5.
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-emerald-500/5 border-emerald-500/20">
          <CardContent className="p-4 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-emerald-500 mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm text-emerald-500">Positive Manager Impact</h4>
              <p className="text-xs text-muted-foreground mt-1">
                {strongestBufferDept?.name ?? 'The strongest buffered department'} has the strongest combined resource and fairness buffer.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Department Modal */}
      {isAddDeptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md mx-4 bg-card rounded-xl shadow-xl overflow-hidden border border-border">
            <div className="flex justify-between items-center p-4 border-b border-border">
              <h3 className="font-semibold text-lg">Add New Department</h3>
              <Button variant="ghost" size="icon" onClick={() => setIsAddDeptModalOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Department Name</label>
                <input 
                  type="text" 
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={newDeptForm.name}
                  onChange={(e) => setNewDeptForm({...newDeptForm, name: e.target.value})}
                  placeholder="e.g. Engineering"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Department Manager</label>
                <input 
                  type="text" 
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={newDeptForm.manager}
                  onChange={(e) => setNewDeptForm({...newDeptForm, manager: e.target.value})}
                  placeholder="e.g. Arnor Hughes"
                />
              </div>
            </div>
            <div className="flex justify-end p-4 border-t border-border bg-secondary/10 space-x-2">
              <Button variant="outline" onClick={() => setIsAddDeptModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveDepartment} disabled={isSavingDepartment}>
                {isSavingDepartment ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : <><Save className="w-4 h-4 mr-2" /> Save</>}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {isAddEmpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md mx-4 bg-card rounded-xl shadow-xl overflow-hidden border border-border">
            <div className="flex justify-between items-center p-4 border-b border-border">
              <h3 className="font-semibold text-lg">Add New Employee</h3>
              <Button variant="ghost" size="icon" onClick={() => setIsAddEmpModalOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-4 space-y-4">
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
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                  <label className="text-sm font-medium">Phone</label>
                  <input 
                    type="text" 
                    className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    value={newEmpForm.phone}
                    onChange={(e) => setNewEmpForm({...newEmpForm, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Department</label>
                  <select 
                    className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                    value={newEmpForm.department}
                    onChange={(e) => setNewEmpForm({...newEmpForm, department: e.target.value})}
                  >
                    <option value="">Select...</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end p-4 border-t border-border bg-secondary/10 space-x-2">
              <Button variant="outline" onClick={() => setIsAddEmpModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveEmployee} disabled={isSavingEmployee}>
                {isSavingEmployee ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : <><Save className="w-4 h-4 mr-2" /> Save</>}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
