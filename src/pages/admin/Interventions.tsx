import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Database, Plus, X } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { fallbackInterventions } from '../../data/fallbackData';
import { createIntervention, getInterventions } from '../../lib/api';
import { useAsyncData } from '../../hooks/useAsyncData';

export default function Interventions() {
  const { data: interventionsList, setData: setInterventionsList, isLoading, error } = useAsyncData(
    getInterventions,
    fallbackInterventions,
    [],
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Organizational',
    jdDimension: 'Autonomy',
    estimatedCost: 0.5,
    expectedImpact: 0.8
  });

  const handleSave = async () => {
    const savedIntervention = await createIntervention({
        title: formData.title,
        description: 'New intervention',
        category: formData.category as any,
        jdDimension: formData.jdDimension,
        estimatedCost: formData.estimatedCost,
        expectedImpact: formData.expectedImpact,
        readinessNeed: 0.5,
        speed: 0.5
    });

    setInterventionsList([...interventionsList, savedIntervention]);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Intervention Library</h2>
          <p className="text-muted-foreground">Manage the global TOPSIS intervention alternatives.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}><Plus className="w-4 h-4 mr-2" /> Add Intervention</Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-primary" />
            <CardTitle>Global Alternatives ({interventionsList.length})</CardTitle>
          </div>
          <CardDescription>
            {isLoading ? 'Loading alternatives from backend...' : error ? error : 'These are used by the TOPSIS engine to rank recommendations.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-secondary/50 border-b border-border">
                <tr>
                  <th className="px-4 py-3 font-medium">ID</th>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">JD-R Target</th>
                  <th className="px-4 py-3 font-medium text-right">Cost (0-1)</th>
                  <th className="px-4 py-3 font-medium text-right">Impact (0-1)</th>
                </tr>
              </thead>
              <tbody>
                {interventionsList.map((inv) => (
                  <tr key={inv.id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{inv.id}</td>
                    <td className="px-4 py-3 font-medium">{inv.title}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-[10px] uppercase">{inv.category}</Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{inv.jdDimension}</td>
                    <td className="px-4 py-3 text-right font-mono">{inv.estimatedCost.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right font-mono text-emerald-500">{inv.expectedImpact.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-md mx-4 shadow-xl">
            <CardHeader className="flex flex-row justify-between items-center pb-2">
              <div>
                <CardTitle>Add Intervention</CardTitle>
                <CardDescription>Create a new global TOPSIS alternative.</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Intervention Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g. 4-Day Work Week"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Organizational">Organizational</option>
                  <option value="Individual">Individual</option>
                  <option value="Team / Relational">Team / Relational</option>
                  <option value="Leadership & Management">Leadership & Management</option>
                  <option value="Work Environment & Facilities">Work Environment & Facilities</option>
                  <option value="Policy & Process">Policy & Process</option>
                  <option value="Training & Development">Training & Development</option>
                  <option value="Health & Wellbeing Program">Health & Wellbeing Program</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">JD-R Target</label>
                <input
                  type="text"
                  value={formData.jdDimension}
                  onChange={(e) => setFormData({ ...formData, jdDimension: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g. Autonomy"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Cost (0-1)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={formData.estimatedCost}
                    onChange={(e) => setFormData({ ...formData, estimatedCost: parseFloat(e.target.value) || 0 })}
                    className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Impact (0-1)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={formData.expectedImpact}
                    onChange={(e) => setFormData({ ...formData, expectedImpact: parseFloat(e.target.value) || 0 })}
                    className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button onClick={handleSave}>Save Intervention</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
