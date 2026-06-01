import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Eye, Download, X, PieChart, Activity } from 'lucide-react';
import { fallbackEmployeeDashboard } from '../../data/fallbackData';
import { useAsyncData } from '../../hooks/useAsyncData';
import { getEmployeeDashboard } from '../../lib/api';

export default function MyStats() {
  const [selectedTest, setSelectedTest] = useState<any>(null);
  const [timeRange, setTimeRange] = useState('6M');
  const { data: employeeDashboard, isLoading, error } = useAsyncData(getEmployeeDashboard, fallbackEmployeeDashboard, []);
  const personalTrendData = employeeDashboard.personalTrend;
  const pastTests = employeeDashboard.pastTests;
  const selectedTrend = personalTrendData[timeRange] ?? [];
  const latestTrend = selectedTrend.slice(-1)[0];
  const previousTrend = selectedTrend.slice(-2)[0] ?? latestTrend;
  const stressValue = Number(latestTrend?.stress ?? 0);
  const recoveryValue = Number(latestTrend?.recovery ?? 0);
  const stressDelta = stressValue - Number(previousTrend?.stress ?? stressValue);
  const recoveryDelta = recoveryValue - Number(previousTrend?.recovery ?? recoveryValue);
  const burnoutRisk = stressValue >= 3.5 && recoveryValue < 3 ? 'High' : stressValue >= 3 ? 'Moderate' : 'Low';
  const stressLabel = stressValue >= 3.6 ? 'High' : stressValue >= 2.7 ? 'Moderate' : 'Low';
  const recoveryLabel = recoveryValue >= 3.6 ? 'Good' : recoveryValue >= 3 ? 'Stable' : 'Needs Focus';
  const burnoutTone = burnoutRisk === 'High' ? 'text-rose-500' : burnoutRisk === 'Moderate' ? 'text-amber-500' : 'text-emerald-500';
  const stressTone = stressDelta > 0.1 ? 'text-amber-500' : 'text-emerald-500';
  const recoveryTone = recoveryDelta >= 0 ? 'text-emerald-500' : 'text-amber-500';

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">My Stats</h2>
        <p className="text-muted-foreground">
          {isLoading ? 'Loading personal metrics from backend...' : error ? error : 'Track your personal wellbeing metrics and historical data.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Burnout Risk</p>
            <h3 className="text-3xl font-bold mt-2">{burnoutRisk}</h3>
            <p className={`text-sm mt-2 font-medium ${burnoutTone}`}>Derived from latest stress and recovery scores</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Stress Load</p>
            <h3 className="text-3xl font-bold mt-2">{stressLabel}</h3>
            <p className={`text-sm mt-2 font-medium ${stressTone}`}>{stressValue.toFixed(1)}/5 latest score</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Recovery Readiness</p>
            <h3 className="text-3xl font-bold mt-2">{recoveryLabel}</h3>
            <p className={`text-sm mt-2 font-medium ${recoveryTone}`}>{recoveryValue.toFixed(1)}/5 latest score</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>Longitudinal Wellbeing Trend</CardTitle>
            <CardDescription>Your personal balance of stress, recovery, and engagement over different time ranges.</CardDescription>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-lg">
            {['3M', '6M', '1Y'].map(range => (
              <button 
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${timeRange === range ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {range}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={personalTrendData[timeRange]} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
                <defs>
                  <linearGradient id="colorRecovery" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorStress" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" vertical={false} />
                <XAxis dataKey="month" className="text-slate-500 text-xs" tickLine={false} axisLine={false} />
                <YAxis className="text-slate-500 text-xs" tickLine={false} axisLine={false} domain={[1, 5]} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: 'white', padding: '12px' }} 
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="recovery" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorRecovery)" name="Recovery" />
                <Area type="monotone" dataKey="engagement" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorEngagement)" name="Engagement" />
                <Area type="monotone" dataKey="stress" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorStress)" name="Stress Load" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historical Tests & Assessments</CardTitle>
          <CardDescription>Review your past psychometric assessments and access personal reports.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-slate-50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-medium">Assessment Name</th>
                  <th className="px-6 py-4 font-medium">Completion Date</th>
                  <th className="px-6 py-4 font-medium">Personal Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pastTests.map((t) => (
                  <tr key={t.id} className="border-b border-border hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">{t.name}</td>
                    <td className="px-6 py-4 text-slate-500">{t.date}</td>
                    <td className="px-6 py-4">
                      <Badge variant={t.score === 'Balanced' || t.score === 'Strong' ? 'success' : 'secondary'} className={t.score === 'Balanced' || t.score === 'Strong' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : ''}>
                        {t.score}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="ghost" size="icon" className="text-teal-600 hover:text-teal-700 hover:bg-teal-50" onClick={() => setSelectedTest(t)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-700">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* View Test Modal */}
      {selectedTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <Card className="w-full max-w-2xl shadow-2xl border-0 overflow-hidden flex flex-col max-h-[90vh]">
            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4 shrink-0">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-teal-100 text-teal-700 rounded-xl">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-slate-800">{selectedTest.name}</CardTitle>
                    <CardDescription>Completed on {selectedTest.date}</CardDescription>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedTest(null)} className="rounded-full text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Overall Result</h4>
                  <Badge variant={selectedTest.score === 'Balanced' || selectedTest.score === 'Strong' || selectedTest.score === 'Low Risk' ? 'success' : 'secondary'} className={`text-sm px-4 py-2 ${selectedTest.score === 'Balanced' || selectedTest.score === 'Strong' || selectedTest.score === 'Low Risk' ? 'bg-emerald-100 text-emerald-700' : ''}`}>
                    {selectedTest.score}
                  </Badge>
                  
                  <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mt-8 mb-3">Detailed Insights</h4>
                  <p className="text-slate-600 leading-relaxed">
                    {selectedTest.details}
                  </p>
                </div>
                
                {/* Dynamically matched chart data */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col items-center justify-center h-64">
                   <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={selectedTest.chartData}>
                        <PolarGrid stroke="#e2e8f0" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar
                          name="Me"
                          dataKey="A"
                          stroke="#0d9488"
                          fill="#14b8a6"
                          fillOpacity={0.4}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                </div>
              </div>
              
              <div className="pt-6 border-t border-slate-100 flex justify-end space-x-3 shrink-0">
                <Button variant="outline" onClick={() => { window.print(); setSelectedTest(null); }} className="text-slate-600 hover:bg-slate-50">
                  <Download className="w-4 h-4 mr-2" /> Download PDF
                </Button>
                <Button onClick={() => setSelectedTest(null)} className="bg-teal-600 hover:bg-teal-700 text-white">Close</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
