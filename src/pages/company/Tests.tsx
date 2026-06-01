import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Progress } from '../../components/ui/Progress';
import { ClipboardList, Plus, PlayCircle, CheckCircle2, Bell, Eye, X, Check, BrainCircuit, Calendar as CalendarIcon, FileText, Download } from 'lucide-react';
import { fallbackActiveInventories, fallbackCompletedTests, fallbackDepartments } from '../../data/fallbackData';
import { useAsyncData } from '../../hooks/useAsyncData';
import { getActiveInventories, getCompletedTests, getDepartments } from '../../lib/api';

export default function Tests() {
  const { data: departments } = useAsyncData(getDepartments, fallbackDepartments, []);
  const { data: activeInventories, isLoading, error } = useAsyncData(getActiveInventories, fallbackActiveInventories, []);
  const { data: completedTests } = useAsyncData(getCompletedTests, fallbackCompletedTests, []);
  const [isNewInventoryModalOpen, setIsNewInventoryModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [selectedCompletedTest, setSelectedCompletedTest] = useState<any>(null);
  const [remindersSent, setRemindersSent] = useState(false);

  const handleSendReminders = () => {
    setRemindersSent(true);
    setTimeout(() => {
      setRemindersSent(false);
      setIsReminderModalOpen(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tests & Inventories</h2>
          <p className="text-muted-foreground">
            {isLoading ? 'Loading inventory campaigns from backend...' : error ? error : 'Manage psychometric assessments and data collection.'}
          </p>
        </div>
        <Button onClick={() => setIsNewInventoryModalOpen(true)}><Plus className="w-4 h-4 mr-2" /> New Inventory</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <PlayCircle className="w-5 h-5 text-primary" />
                <CardTitle>Active Inventories</CardTitle>
              </div>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">In Progress</Badge>
            </div>
            <CardDescription>Currently collecting responses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeInventories.map((inventory) => (
                <div key={inventory.id} className="p-4 rounded-lg bg-secondary/30 border border-border">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">{inventory.name}</h4>
                    <span className="text-sm text-muted-foreground">{inventory.endsIn}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">Target: {inventory.target}</p>
                  
                  <div className="space-y-1 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>Response Rate</span>
                      <span className="font-medium">{inventory.responseRate}%</span>
                    </div>
                    <Progress value={inventory.responseRate} className="h-2" />
                  </div>

                  <div className="flex space-x-3">
                    <Button variant="secondary" size="sm" onClick={() => setIsReminderModalOpen(true)}><Bell className="w-4 h-4 mr-2" /> Send Reminders</Button>
                    <Button variant="outline" size="sm" onClick={() => setIsPreviewModalOpen(true)}><Eye className="w-4 h-4 mr-2" /> Preview Data</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-muted-foreground" />
              <CardTitle>Completed Inventories</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {completedTests.map(test => (
                <div 
                  key={test.id} 
                  className="p-3 rounded-lg border border-border cursor-pointer hover:bg-secondary/50 transition-colors"
                  onClick={() => setSelectedCompletedTest(test)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-medium text-sm">{test.name}</h4>
                    <FileText className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">Completed {test.date}</p>
                  <Badge variant="secondary" className="text-[10px]">{test.rate}% Response Rate</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New Inventory Modal */}
      {isNewInventoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-2xl mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row justify-between items-start pb-4 border-b border-border">
              <div>
                <CardTitle>Start New Inventory</CardTitle>
                <CardDescription>Configure a new assessment for your organization.</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsNewInventoryModalOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">

              {/* AI Recommendation Box */}
              <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg flex gap-4">
                <BrainCircuit className="w-6 h-6 text-primary shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-primary mb-1">AI Recommended Inventory: Maslach Burnout Inventory (MBI)</h4>
                  <p className="text-sm text-foreground mb-2">
                    <strong>Why:</strong> Current data indicates an upward trend in emotional exhaustion within Engineering and Sales. The MBI is specifically designed to measure these targeted burnout dimensions, which are currently showing high risk.
                  </p>
                  <Button size="sm" variant="outline" className="text-xs bg-background/50">Apply AI Recommendation</Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Inventory Name</label>
                  <input
                    type="text"
                    className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                    placeholder="e.g., Q3 Wellness Pulse"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Inventory Template</label>
                  <select className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary">
                    <option>Maslach Burnout Inventory (MBI)</option>
                    <option>Perceived Stress Scale (PSS)</option>
                    <option>JD-R Core Assessment</option>
                    <option>Comprehensive Pulse (All Modules)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Target Audience</label>
                  <select className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary">
                    <option>All Employees</option>
                    {departments.map((d: any) => (
                      <option key={d.id} value={d.id}>{d.name} Department</option>
                    ))}
                    <option>Management Level Only</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Schedule Frequency</label>
                    <select className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary">
                      <option>One-time Assessment</option>
                      <option>Weekly Pulse</option>
                      <option>Monthly Check-in</option>
                      <option>Quarterly Deep Dive</option>
                      <option>Bi-Annual Comprehensive</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Start Date</label>
                    <input type="date" className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 mt-2 border-t border-border">
                <Button variant="outline" onClick={() => setIsNewInventoryModalOpen(false)}>Cancel</Button>
                <Button onClick={() => setIsNewInventoryModalOpen(false)}>Launch Inventory</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Completed Test Report Modal */}
      {selectedCompletedTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-2xl mx-4 shadow-xl">
            <CardHeader className="flex flex-row justify-between items-start pb-4 border-b border-border">
              <div>
                <CardTitle>{selectedCompletedTest.name} - Final Report</CardTitle>
                <CardDescription>Completed on {selectedCompletedTest.date}</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedCompletedTest(null)}>
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border border-border rounded-lg bg-secondary/20">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-1">Total Responses</h4>
                  <p className="text-3xl font-bold">{selectedCompletedTest.responses.toLocaleString()}</p>
                </div>
                <div className="p-4 border border-border rounded-lg bg-secondary/20">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-1">Response Rate</h4>
                  <p className="text-3xl font-bold">{selectedCompletedTest.rate}%</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 border border-border rounded-lg">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-1">Exhaustion</h4>
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-bold">{selectedCompletedTest.metrics?.exhaustion?.value}</span>
                    <span className={`text-xs font-medium mb-1 ${selectedCompletedTest.metrics?.exhaustion?.trend.startsWith('+') ? 'text-destructive' : 'text-emerald-500'}`}>{selectedCompletedTest.metrics?.exhaustion?.trend}</span>
                  </div>
                </div>
                <div className="p-3 border border-border rounded-lg">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-1">Cynicism</h4>
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-bold">{selectedCompletedTest.metrics?.cynicism?.value}</span>
                    <span className={`text-xs font-medium mb-1 ${selectedCompletedTest.metrics?.cynicism?.trend.startsWith('+') ? 'text-destructive' : 'text-emerald-500'}`}>{selectedCompletedTest.metrics?.cynicism?.trend}</span>
                  </div>
                </div>
                <div className="p-3 border border-border rounded-lg">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-1">Prof. Efficacy</h4>
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-bold">{selectedCompletedTest.metrics?.efficacy?.value}</span>
                    <span className={`text-xs font-medium mb-1 ${selectedCompletedTest.metrics?.efficacy?.trend.startsWith('+') ? 'text-emerald-500' : 'text-destructive'}`}>{selectedCompletedTest.metrics?.efficacy?.trend}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <BrainCircuit className="w-5 h-5 text-primary" />
                  <h4 className="font-semibold text-primary">AI Executive Summary</h4>
                </div>
                <p className="text-sm text-foreground leading-relaxed mb-4">
                  {selectedCompletedTest.finding}
                </p>
                <div className="space-y-2 mt-4 pt-4 border-t border-primary/10">
                  <h5 className="text-xs font-semibold uppercase text-primary/80">Key Insights</h5>
                  <ul className="list-disc pl-5 space-y-1">
                    {selectedCompletedTest.insights?.map((insight: string, i: number) => (
                      <li key={i} className="text-sm text-foreground/90">{insight}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-border">
                <Button variant="outline" onClick={() => alert('Downloading full PDF report...')}>
                  <Download className="w-4 h-4 mr-2" />
                  Download Full Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Send Reminders Modal */}
      {isReminderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-sm mx-4 shadow-xl">
            <CardHeader className="flex flex-row justify-between items-start pb-4 border-b border-border">
              <div>
                <CardTitle>Send Reminders</CardTitle>
                <CardDescription>Notify employees who haven't responded yet.</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsReminderModalOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="p-3 bg-secondary/50 rounded-lg text-sm mb-4">
                <span className="font-medium">5,888 employees</span> have not completed the assessment yet.
              </div>
              <div className="space-y-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" className="rounded" defaultChecked />
                  <span className="text-sm font-medium">Send Email Reminders</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" className="rounded" defaultChecked />
                  <span className="text-sm font-medium">Send Slack/Teams Notifications</span>
                </label>
              </div>
              <Button className="w-full mt-4" onClick={handleSendReminders} disabled={remindersSent}>
                {remindersSent ? <><Check className="w-4 h-4 mr-2" /> Reminders Sent</> : 'Send Now'}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Preview Data Modal */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-3xl mx-4 shadow-xl max-h-[80vh] flex flex-col">
            <CardHeader className="flex flex-row justify-between items-start pb-4 border-b border-border shrink-0">
              <div>
                <CardTitle>Inventory Data Preview</CardTitle>
                <CardDescription>Real-time, anonymized aggregation of responses so far.</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsPreviewModalOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="pt-6 overflow-y-auto space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 border border-border rounded-lg bg-secondary/20">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-1">Responses</h4>
                  <p className="text-2xl font-bold">12,512</p>
                </div>
                <div className="p-4 border border-border rounded-lg bg-secondary/20">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-1">Average Time</h4>
                  <p className="text-2xl font-bold">8m 42s</p>
                </div>
                <div className="p-4 border border-border rounded-lg bg-secondary/20">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-1">Abandonment</h4>
                  <p className="text-2xl font-bold text-amber-500">2.1%</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Live Department Response Rates</h4>
                <div className="space-y-3">
                  {[
                    { dept: 'DevOps', rate: 75 },
                    { dept: 'Sales', rate: 42 },
                    { dept: 'Engineering', rate: 88 },
                    { dept: 'Marketing', rate: 61 }
                  ].map(stat => (
                    <div key={stat.dept} className="flex items-center justify-between text-sm">
                      <span className="w-24 font-medium">{stat.dept}</span>
                      <Progress value={stat.rate} className="flex-1 mx-4 h-2" />
                      <span className="w-8 text-right text-muted-foreground">{stat.rate}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <h4 className="text-sm font-semibold text-primary mb-1">AI Early Insight</h4>
                <p className="text-sm text-foreground">Early data suggests a significant variance in workload perception between Engineering and Sales. Final insights will be generated upon completion.</p>
              </div>

            </CardContent>
          </Card>
        </div>
      )}

    </div>
  );
}
