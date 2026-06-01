import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Edit, ExternalLink, X, Save, TrendingUp, Presentation } from 'lucide-react';
import { Progress } from '../../components/ui/Progress';
import { fallbackActionPlans } from '../../data/fallbackData';
import { useAsyncData } from '../../hooks/useAsyncData';
import { getActionPlans, updateActionPlan } from '../../lib/api';

export default function ActionPlans() {
  const { data: plans, setData: setPlans, isLoading, error } = useAsyncData(getActionPlans, fallbackActionPlans, []);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [viewingPlan, setViewingPlan] = useState<any>(null);

  const handleSaveEdit = async () => {
    if (editingPlan) {
      const savedPlan = await updateActionPlan(editingPlan.id, editingPlan);
      setPlans(plans.map(p => p.id === editingPlan.id ? savedPlan : p));
      setEditingPlan(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Action Plans Tracker</h2>
          <p className="text-muted-foreground">
            {isLoading ? 'Loading action plans from backend...' : error ? error : 'Track and manage approved departmental interventions.'}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active & Past Plans</CardTitle>
          <CardDescription>All tracked initiatives across the organization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
               <thead className="text-xs text-muted-foreground uppercase bg-secondary/50 border-b border-border">
                <tr>
                  <th className="px-4 py-3 font-medium">Plan Title</th>
                  <th className="px-4 py-3 font-medium">Department</th>
                  <th className="px-4 py-3 font-medium">Intervention</th>
                  <th className="px-4 py-3 font-medium">Owner</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Due Date</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((plan) => (
                  <tr key={plan.id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{plan.title}</td>
                    <td className="px-4 py-3 text-muted-foreground">{plan.department}</td>
                    <td className="px-4 py-3 text-muted-foreground">{plan.intervention}</td>
                    <td className="px-4 py-3">{plan.owner}</td>
                    <td className="px-4 py-3">
                      <Badge variant={
                        plan.status === 'Completed' ? 'secondary' :
                        plan.status === 'In Progress' ? 'success' : 'default'
                      } className={plan.status === 'Completed' ? 'opacity-70' : ''}>
                        {plan.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{plan.dueDate}</td>
                    <td className="px-4 py-3 text-right space-x-2">
                       <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingPlan({...plan})}>
                         <Edit className="h-4 w-4" />
                       </Button>
                       <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewingPlan(plan)}>
                         <ExternalLink className="h-4 w-4" />
                       </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-md mx-4 shadow-xl">
            <CardHeader className="flex flex-row justify-between items-start pb-4 border-b border-border">
              <div>
                <CardTitle>Edit Action Plan</CardTitle>
                <CardDescription>Update status and details</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setEditingPlan(null)}>
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Plan Title</label>
                <input 
                  type="text" 
                  value={editingPlan.title}
                  onChange={e => setEditingPlan({...editingPlan, title: e.target.value})}
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <select 
                  value={editingPlan.status}
                  onChange={e => setEditingPlan({...editingPlan, status: e.target.value})}
                  className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option>Approved</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                  <option>On Hold</option>
                </select>
              </div>
               <div className="space-y-2">
                <label className="text-sm font-medium">Due Date</label>
                <input 
                  type="date" 
                  value={editingPlan.dueDate}
                  onChange={e => setEditingPlan({...editingPlan, dueDate: e.target.value})}
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Details</label>
                <textarea 
                  value={editingPlan.details}
                  onChange={e => setEditingPlan({...editingPlan, details: e.target.value})}
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary h-20 resize-none"
                />
              </div>
               <div className="flex justify-end pt-4 mt-2 border-t border-border">
                  <Button onClick={handleSaveEdit}><Save className="w-4 h-4 mr-2" /> Save Changes</Button>
               </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* View Details Modal */}
      {viewingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-2xl mx-4 shadow-xl">
             <CardHeader className="flex flex-row justify-between items-start pb-4 border-b border-border shrink-0">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Badge variant="outline">{viewingPlan.department}</Badge>
                  <Badge variant={
                    viewingPlan.status === 'Completed' ? 'secondary' :
                    viewingPlan.status === 'In Progress' ? 'success' : 'default'
                  }>{viewingPlan.status}</Badge>
                </div>
                <CardTitle className="text-xl">{viewingPlan.title}</CardTitle>
                <CardDescription>Owner: {viewingPlan.owner} • Due: {viewingPlan.dueDate}</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setViewingPlan(null)}>
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
               <div>
                 <h4 className="font-semibold mb-2">Intervention Type</h4>
                 <div className="flex items-center">
                    <Presentation className="w-4 h-4 text-primary mr-2" />
                    <span>{viewingPlan.intervention}</span>
                 </div>
               </div>
               
               <div>
                  <h4 className="font-semibold mb-2">Details & Scope</h4>
                  <p className="text-sm text-foreground leading-relaxed">{viewingPlan.details}</p>
               </div>

               <div className="p-4 bg-secondary/30 rounded-lg border border-border">
                 <div className="flex justify-between items-end mb-2">
                   <div>
                      <h4 className="font-semibold flex items-center"><TrendingUp className="w-4 h-4 text-emerald-500 mr-2" /> Target KPI</h4>
                      <p className="text-sm text-muted-foreground">{viewingPlan.kpi}</p>
                   </div>
                   <span className="text-sm font-medium">Tracking</span>
                 </div>
                 {viewingPlan.status === 'In Progress' && <Progress value={45} className="h-2 mt-2" />}
                 {viewingPlan.status === 'Completed' && <Progress value={100} className="h-2 mt-2" />}
                 {viewingPlan.status === 'Approved' && <Progress value={0} className="h-2 mt-2" />}
               </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
